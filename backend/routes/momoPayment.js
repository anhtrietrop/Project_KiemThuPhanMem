const express = require('express');
const router = express.Router();
const {
  createPaymentRequest,
  handlePaymentCallback,
  queryPaymentStatus,
  refundPayment
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

      // Check if order exists
      const order = await prisma.customer_orders.findUnique({
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
      const existingPayment = await prisma.momoPayment.findFirst({
        where: {
          orderId: orderId,
          status: { in: ['PENDING', 'SUCCESS'] }
        }
      });

      if (existingPayment) {
        return res.status(409).json({
          success: false,
          message: 'Payment already exists for this order',
          requestId: req.reqId
        });
      }

      // Create payment request
      const paymentResult = await createPaymentRequest({
        orderId,
        amount,
        orderInfo,
        extraData,
        items,
        userInfo,
        deliveryInfo
      });

      res.status(200).json({
        success: paymentResult.success,
        data: paymentResult.data,
        requestId: req.reqId
      });

    } catch (error) {
      MomoErrorHandler.handleMomoError(error, req, res, () => {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
          requestId: req.reqId
        });
      });
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
      // If MoMo query fails, return local status
      res.status(200).json({
        success: true,
        data: {
          orderId: orderId,
          status: localPayment.status,
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

    // Check if payment exists and is successful
    const payment = await prisma.momoPayment.findFirst({
      where: {
        orderId: orderId,
        status: 'SUCCESS'
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

module.exports = router;
