const crypto = require('crypto');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// MoMo Configuration
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMOT5BZ20231213_TEST',
  accessKey: process.env.MOMO_ACCESS_KEY || 'klm05TvNBzhg7h7j',
  secretKey: process.env.MOMO_SECRET_KEY || 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn',
  redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment/result',
  ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:3002/api/payments/momo/callback'
};

/**
 * Generate HMAC SHA256 signature for MoMo API
 * @param {string} rawSignature - Raw signature string
 * @param {string} secretKey - Secret key for signing
 * @returns {string} - Generated signature
 */
function generateSignature(rawSignature, secretKey) {
  return crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
}

/**
 * Create MoMo payment request
 * @param {Object} paymentData - Payment information
 * @returns {Object} - MoMo payment response
 */
async function createPaymentRequest(paymentData) {
  try {
    const {
      orderId,
      amount,
      orderInfo,
      extraData = '',
      items = [],
      userInfo = {},
      deliveryInfo = {}
    } = paymentData;

    // Generate unique request ID
    const requestId = `${orderId}_${Date.now()}`;
    
    // Prepare request data
    const requestData = {
      partnerCode: MOMO_CONFIG.partnerCode,
      requestType: 'captureWallet',
      ipnUrl: MOMO_CONFIG.ipnUrl,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      orderId: orderId,
      amount: amount.toString(),
      orderInfo: orderInfo,
      requestId: requestId,
      extraData: extraData ? Buffer.from(JSON.stringify(extraData)).toString('base64') : '',
      lang: 'vi'
    };

    // Add optional fields if provided
    if (items && items.length > 0) {
      requestData.items = items;
    }
    if (Object.keys(userInfo).length > 0) {
      requestData.userInfo = userInfo;
    }
    if (Object.keys(deliveryInfo).length > 0) {
      requestData.deliveryInfo = deliveryInfo;
    }

    // Generate signature
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${requestData.amount}&extraData=${requestData.extraData}&ipnUrl=${requestData.ipnUrl}&orderId=${requestData.orderId}&orderInfo=${requestData.orderInfo}&partnerCode=${requestData.partnerCode}&redirectUrl=${requestData.redirectUrl}&requestId=${requestData.requestId}&requestType=${requestData.requestType}`;
    
    requestData.signature = generateSignature(rawSignature, MOMO_CONFIG.secretKey);

    // Store payment request in database
    await prisma.momoPayment.create({
      data: {
        orderId: requestData.orderId,
        requestId: requestData.requestId,
        amount: parseInt(amount),
        orderInfo: requestData.orderInfo,
        extraData: requestData.extraData,
        status: 'PENDING',
        createdAt: new Date()
      }
    });

    // Make request to MoMo API
    const response = await axios.post(
      `${MOMO_CONFIG.endpoint}/v2/gateway/api/create`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    // Verify response signature
    const responseSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${response.data.amount}&orderId=${response.data.orderId}&partnerCode=${response.data.partnerCode}&payUrl=${response.data.payUrl || ''}&requestId=${response.data.requestId}&responseTime=${response.data.responseTime}&resultCode=${response.data.resultCode}`;
    
    const expectedSignature = generateSignature(responseSignature, MOMO_CONFIG.secretKey);
    
    if (response.data.signature !== expectedSignature) {
      throw new Error('Invalid response signature from MoMo');
    }

    // Update payment record with response
    await prisma.momoPayment.update({
      where: { requestId: requestData.requestId },
      data: {
        payUrl: response.data.payUrl,
        deeplink: response.data.deeplink,
        qrCodeUrl: response.data.qrCodeUrl,
        resultCode: response.data.resultCode,
        message: response.data.message,
        responseTime: new Date(response.data.responseTime)
      }
    });

    return {
      success: response.data.resultCode === 0,
      data: response.data,
      requestId: requestData.requestId
    };

  } catch (error) {
    console.error('MoMo payment request error:', error);
    
    // Log error to database if possible
    try {
      await prisma.momoPayment.update({
        where: { requestId: paymentData.requestId || `${paymentData.orderId}_${Date.now()}` },
        data: {
          status: 'ERROR',
          message: error.message,
          updatedAt: new Date()
        }
      });
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
    }

    throw error;
  }
}

/**
 * Handle MoMo payment callback (IPN)
 * @param {Object} callbackData - Callback data from MoMo
 * @returns {Object} - Processing result
 */
async function handlePaymentCallback(callbackData) {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = callbackData;

    // Verify signature
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = generateSignature(rawSignature, MOMO_CONFIG.secretKey);
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid callback signature');
    }

    // Update payment status in database
    const payment = await prisma.momoPayment.update({
      where: { requestId: requestId },
      data: {
        transId: transId.toString(),
        resultCode: resultCode,
        message: message,
        payType: payType,
        status: resultCode === 0 ? 'SUCCESS' : 'FAILED',
        responseTime: new Date(responseTime),
        updatedAt: new Date()
      }
    });

    // If payment successful, update order status
    if (resultCode === 0) {
      await prisma.customer_orders.update({
        where: { id: parseInt(orderId) },
        data: {
          payment_status: 'PAID',
          payment_method: 'MOMO',
          payment_transaction_id: transId.toString(),
          updated_at: new Date()
        }
      });
    }

    return {
      success: true,
      resultCode: resultCode,
      message: message,
      orderId: orderId,
      transId: transId
    };

  } catch (error) {
    console.error('MoMo callback processing error:', error);
    throw error;
  }
}

/**
 * Query payment status from MoMo
 * @param {string} orderId - Order ID to query
 * @returns {Object} - Payment status
 */
async function queryPaymentStatus(orderId) {
  try {
    const requestId = `${orderId}_query_${Date.now()}`;
    
    const requestData = {
      partnerCode: MOMO_CONFIG.partnerCode,
      requestId: requestId,
      orderId: orderId,
      lang: 'vi'
    };

    // Generate signature for query
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&orderId=${orderId}&partnerCode=${MOMO_CONFIG.partnerCode}&requestId=${requestId}`;
    requestData.signature = generateSignature(rawSignature, MOMO_CONFIG.secretKey);

    const response = await axios.post(
      `${MOMO_CONFIG.endpoint}/v2/gateway/api/query`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data;

  } catch (error) {
    console.error('MoMo query payment status error:', error);
    throw error;
  }
}

/**
 * Refund MoMo payment
 * @param {Object} refundData - Refund information
 * @returns {Object} - Refund result
 */
async function refundPayment(refundData) {
  try {
    const { orderId, amount, description } = refundData;
    const requestId = `${orderId}_refund_${Date.now()}`;
    
    const requestData = {
      partnerCode: MOMO_CONFIG.partnerCode,
      requestId: requestId,
      orderId: orderId,
      amount: amount.toString(),
      description: description || 'Refund request',
      lang: 'vi'
    };

    // Generate signature for refund
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&description=${requestData.description}&orderId=${orderId}&partnerCode=${MOMO_CONFIG.partnerCode}&requestId=${requestId}`;
    requestData.signature = generateSignature(rawSignature, MOMO_CONFIG.secretKey);

    const response = await axios.post(
      `${MOMO_CONFIG.endpoint}/v2/gateway/api/refund`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data;

  } catch (error) {
    console.error('MoMo refund error:', error);
    throw error;
  }
}

module.exports = {
  createPaymentRequest,
  handlePaymentCallback,
  queryPaymentStatus,
  refundPayment,
  generateSignature
};
