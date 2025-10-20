const express = require('express');
const router = express.Router();
const {
  createPaymentRequest,
  handlePaymentCallback,
  queryPaymentStatus,
  refundPayment,
  testCallback
} = require('../controllers/momoPayment');
const { PrismaClient } = require('@prisma/client');
const MomoErrorHandler = require('../middleware/momoErrorHandler');

const prisma = new PrismaClient();

// Apply middleware to all routes
router.use(MomoErrorHandler.securityMiddleware);
router.use(MomoErrorHandler.logPaymentAttempt);

/**
 * Create MoMo payment request
 * POST /api/payments/momo/create
 */
router.post('/create',
  MomoErrorHandler.validatePaymentRequest,
  async (req, res) => {
    try {
      const {
        orderId,
        amount,
        orderInfo,
        extraData,
        items,
        userInfo,
        deliveryInfo
      } = req.body;

      // Validate required fields
      if (!orderId || !amount || !orderInfo) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: orderId, amount, orderInfo',
          requestId: req.reqId
        });
      }

      // Validate amount
      if (amount < 1000 || amount > 50000000) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be between 1,000 and 50,000,000 VND',
          requestId: req.reqId
        });
      }

      // Check if order exists (Prisma model is Customer_order)
      const order = await prisma.customer_order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
          requestId: req.reqId
        });
      }

      // Check if payment already exists for this order
      // resultCode: -1 = not processed, 0 = success, 1000/7000/7002/9000 = pending
      const existingPayment = await prisma.momoPayment.findFirst({
        where: {
          orderId: orderId,
          OR: [
            { resultCode: { in: [-1, 0, 1000, 7000, 7002, 9000] } },
            { resultCode: null }
          ]
        }
      });

      if (existingPayment) {
        // If we already have a usable payment session, return it to the client
        if (existingPayment.payUrl || existingPayment.deeplink || existingPayment.qrCodeUrl) {
          return res.status(200).json({
            success: true,
            data: {
              orderId,
              payUrl: existingPayment.payUrl || null,
              deeplink: existingPayment.deeplink || null,
              qrCodeUrl: existingPayment.qrCodeUrl || null,
              resultCode: existingPayment.resultCode ?? 0,
              message: existingPayment.message || 'Reused existing MoMo payment session'
            },
            requestId: req.reqId
          });
        }

        // If it's a stale pending/failed record without URLs, allow creating a new session
        await prisma.momoPayment.update({
          where: { id: existingPayment.id },
          data: {
            status: 'FAILED',
            message: 'Stale payment replaced by a new request',
            updatedAt: new Date()
          }
        });
      }

      // Create payment request - controller will handle response
      return await createPaymentRequest(req, res);

    } catch (error) {
      // Only send error response if controller hasn't already sent one
      if (!res.headersSent) {
        MomoErrorHandler.handleMomoError(error, req, res, () => {
          res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            requestId: req.reqId
          });
        });
      }
    }
  });

/**
 * Handle MoMo payment callback (IPN)
 * POST /api/payments/momo/callback
 */
router.post('/callback',
  MomoErrorHandler.validateWebhookSignature,
  async (req, res) => {
    try {
      console.log('MoMo callback received:', req.body);

      const callbackResult = await handlePaymentCallback(req.body);

      // Always return success to MoMo to acknowledge receipt
      res.status(200).json({
        partnerCode: req.body.partnerCode,
        requestId: req.body.requestId,
        orderId: req.body.orderId,
        resultCode: 0,
        message: 'success',
        responseTime: Date.now()
      });

      // Log the callback result
      console.log('Callback processed:', callbackResult);

    } catch (error) {
      console.error('Callback processing error:', error);

      // Still return success to MoMo to avoid retries
      res.status(200).json({
        partnerCode: req.body.partnerCode || '',
        requestId: req.body.requestId || '',
        orderId: req.body.orderId || '',
        resultCode: 0,
        message: 'success',
        responseTime: Date.now()
      });
    }
  });

/**
 * Query payment status
 * GET /api/payments/momo/status/:orderId
 */
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // First check local database
    const localPayment = await prisma.momoPayment.findFirst({
      where: { orderId: orderId },
      orderBy: { createdAt: 'desc' }
    });

    if (!localPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
        requestId: req.reqId
      });
    }

    // Query MoMo for latest status
    try {
      const momoStatus = await queryPaymentStatus(orderId);

      // Update local record if status changed
      if (momoStatus.resultCode !== localPayment.resultCode) {
        await prisma.momoPayment.update({
          where: { id: localPayment.id },
          data: {
            resultCode: momoStatus.resultCode,
            message: momoStatus.message,
            status: momoStatus.resultCode === 0 ? 'SUCCESS' : 'FAILED',
            updatedAt: new Date()
          }
        });
      }

      res.status(200).json({
        success: true,
        data: {
          orderId: orderId,
          status: momoStatus.resultCode === 0 ? 'SUCCESS' : 'FAILED',
          resultCode: momoStatus.resultCode,
          message: momoStatus.message,
          amount: localPayment.amount,
          transId: localPayment.transId
        },
        requestId: req.reqId
      });

    } catch (queryError) {
      // If MoMo query fails, return local status (derived from resultCode)
      const getStatusFromCode = (code) => {
        if (code === 0) return 'SUCCESS';
        if ([1000, 7000, 7002, 9000].includes(code)) return 'PENDING';
        if (code === -1 || code === null) return 'PENDING';
        return 'FAILED';
      };

      res.status(200).json({
        success: true,
        data: {
          orderId: orderId,
          status: getStatusFromCode(localPayment.resultCode),
          resultCode: localPayment.resultCode,
          message: localPayment.message,
          amount: localPayment.amount,
          transId: localPayment.transId
        },
        requestId: req.reqId
      });
    }

  } catch (error) {
    console.error('Query payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      requestId: req.reqId
    });
  }
});

/**
 * Refund payment
 * POST /api/payments/momo/refund
 */
router.post('/refund', async (req, res) => {
  try {
    const { orderId, amount, description } = req.body;

    // Validate required fields
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, amount',
        requestId: req.reqId
      });
    }

    // Check if payment exists and is successful (resultCode = 0)
    const payment = await prisma.momoPayment.findFirst({
      where: {
        orderId: orderId,
        resultCode: 0
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Successful payment not found for this order',
        requestId: req.reqId
      });
    }

    // Check refund amount
    if (amount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed original payment amount',
        requestId: req.reqId
      });
    }

    // Process refund
    const refundResult = await refundPayment({
      orderId,
      amount,
      description
    });

    res.status(200).json({
      success: refundResult.resultCode === 0,
      data: refundResult,
      requestId: req.reqId
    });

  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      requestId: req.reqId
    });
  }
});

/**
 * Get payment history for an order
 * GET /api/payments/momo/history/:orderId
 */
router.get('/history/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await prisma.momoPayment.findMany({
      where: { orderId: orderId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: payments,
      requestId: req.reqId
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      requestId: req.reqId
    });
  }
});

/**
 * Test callback (for development only)
 * POST /api/payments/momo/test-callback
 */
router.post('/test-callback', async (req, res) => {
  return await testCallback(req, res);
});

module.exports = router;
