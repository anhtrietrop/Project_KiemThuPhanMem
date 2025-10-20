const crypto = require('crypto');

/**
 * MoMo Result Codes and their meanings
 */
const MOMO_RESULT_CODES = {
  0: 'Success',
  9000: 'Transaction confirmed',
  8000: 'Transaction pending',
  7000: 'Transaction declined',
  6000: 'Transaction not found',
  5000: 'Invalid signature',
  4000: 'Invalid amount',
  3000: 'Invalid partner information',
  2000: 'Invalid request format',
  1000: 'System error',
  10: 'Invalid partner code',
  11: 'Invalid access key',
  12: 'Invalid request id',
  13: 'Invalid amount format',
  14: 'Invalid order info',
  15: 'Invalid extra data',
  16: 'Invalid IPN URL',
  17: 'Invalid redirect URL',
  18: 'Invalid request type',
  20: 'Bad request',
  21: 'Order not found',
  22: 'Order already confirmed',
  23: 'Order expired',
  24: 'Order cancelled',
  25: 'Insufficient balance',
  26: 'Account locked',
  27: 'Transaction limit exceeded',
  28: 'Daily limit exceeded',
  29: 'Monthly limit exceeded',
  30: 'Account not verified',
  40: 'Invalid merchant',
  41: 'Merchant not active',
  42: 'Merchant suspended',
  43: 'Service not available',
  44: 'Maintenance mode',
  99: 'Unknown error'
};

/**
 * Get human-readable message for MoMo result code
 * @param {number} resultCode - MoMo result code
 * @returns {string} - Human-readable message
 */
function getMomoResultMessage(resultCode) {
  return MOMO_RESULT_CODES[resultCode] || `Unknown error code: ${resultCode}`;
}

/**
 * Validate MoMo payment request data
 * @param {Object} paymentData - Payment request data
 * @returns {Object} - Validation result
 */
function validatePaymentRequest(paymentData) {
  const errors = [];
  const {
    orderId,
    amount,
    orderInfo,
    extraData,
    items,
    userInfo,
    deliveryInfo
  } = paymentData;

  // Validate required fields
  if (!orderId || typeof orderId !== 'string') {
    errors.push('orderId is required and must be a string');
  }

  if (!amount || (typeof amount !== 'number' && typeof amount !== 'string')) {
    errors.push('amount is required and must be a number or string');
  } else {
    // Convert to number if string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Validate amount range (allow small amounts for testing)
    if (numAmount <= 0) {
      errors.push('amount must be greater than 0');
    }
    if (numAmount > 50000000) {
      errors.push('amount must not exceed 50,000,000');
    }
  }

  if (!orderInfo || typeof orderInfo !== 'string') {
    errors.push('orderInfo is required and must be a string');
  } else if (orderInfo.length > 255) {
    errors.push('orderInfo must not exceed 255 characters');
  }

  // Validate optional fields
  if (extraData && typeof extraData !== 'object') {
    errors.push('extraData must be an object if provided');
  }

  // Validate items array
  if (items && Array.isArray(items)) {
    if (items.length > 50) {
      errors.push('items array must not exceed 50 products');
    }

    items.forEach((item, index) => {
      const itemErrors = validatePaymentItem(item, index);
      errors.push(...itemErrors);
    });
  }

  // Validate userInfo
  if (userInfo && typeof userInfo === 'object') {
    const userInfoErrors = validateUserInfo(userInfo);
    errors.push(...userInfoErrors);
  }

  // Validate deliveryInfo
  if (deliveryInfo && typeof deliveryInfo === 'object') {
    const deliveryInfoErrors = validateDeliveryInfo(deliveryInfo);
    errors.push(...deliveryInfoErrors);
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate payment item
 * @param {Object} item - Payment item
 * @param {number} index - Item index
 * @returns {Array} - Validation errors
 */
function validatePaymentItem(item, index) {
  const errors = [];
  const prefix = `items[${index}]`;

  if (!item.id || typeof item.id !== 'string') {
    errors.push(`${prefix}.id is required and must be a string`);
  }

  if (!item.name || typeof item.name !== 'string') {
    errors.push(`${prefix}.name is required and must be a string`);
  }

  if (item.price && (typeof item.price !== 'number' || item.price < 0)) {
    errors.push(`${prefix}.price must be a positive number`);
  }

  if (item.quantity && (typeof item.quantity !== 'number' || item.quantity < 1)) {
    errors.push(`${prefix}.quantity must be a positive integer`);
  }

  if (item.totalPrice && (typeof item.totalPrice !== 'number' || item.totalPrice < 0)) {
    errors.push(`${prefix}.totalPrice must be a positive number`);
  }

  // Validate price calculation if both price and quantity are provided
  if (item.price && item.quantity && item.totalPrice) {
    const expectedTotal = item.price * item.quantity;
    if (Math.abs(item.totalPrice - expectedTotal) > 0.01) {
      errors.push(`${prefix}.totalPrice should equal price * quantity`);
    }
  }

  return errors;
}

/**
 * Validate user info
 * @param {Object} userInfo - User information
 * @returns {Array} - Validation errors
 */
function validateUserInfo(userInfo) {
  const errors = [];

  if (userInfo.phoneNumber && !/^[0-9+\-\s()]{10,15}$/.test(userInfo.phoneNumber)) {
    errors.push('userInfo.phoneNumber must be a valid phone number');
  }

  if (userInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
    errors.push('userInfo.email must be a valid email address');
  }

  return errors;
}

/**
 * Validate delivery info
 * @param {Object} deliveryInfo - Delivery information
 * @returns {Array} - Validation errors
 */
function validateDeliveryInfo(deliveryInfo) {
  const errors = [];

  if (deliveryInfo.deliveryFee && (typeof deliveryInfo.deliveryFee !== 'string' && typeof deliveryInfo.deliveryFee !== 'number')) {
    errors.push('deliveryInfo.deliveryFee must be a string or number');
  }

  if (deliveryInfo.quantity && (typeof deliveryInfo.quantity !== 'string' && typeof deliveryInfo.quantity !== 'number')) {
    errors.push('deliveryInfo.quantity must be a string or number');
  }

  return errors;
}

/**
 * Validate MoMo signature
 * @param {Object} data - Data to validate
 * @param {string} signature - Signature to validate
 * @param {string} secretKey - Secret key for validation
 * @param {string} type - Type of signature (request/response/callback)
 * @returns {boolean} - Whether signature is valid
 */
function validateSignature(data, signature, secretKey, type = 'request') {
  try {
    let rawSignature = '';

    switch (type) {
      case 'request':
        rawSignature = `accessKey=${data.accessKey}&amount=${data.amount}&extraData=${data.extraData}&ipnUrl=${data.ipnUrl}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&partnerCode=${data.partnerCode}&redirectUrl=${data.redirectUrl}&requestId=${data.requestId}&requestType=${data.requestType}`;
        break;

      case 'response':
        rawSignature = `accessKey=${data.accessKey}&amount=${data.amount}&orderId=${data.orderId}&partnerCode=${data.partnerCode}&payUrl=${data.payUrl || ''}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}`;
        break;

      case 'callback':
        rawSignature = `accessKey=${data.accessKey}&amount=${data.amount}&extraData=${data.extraData}&message=${data.message}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId}`;
        break;

      default:
        throw new Error(`Unknown signature type: ${type}`);
    }

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

/**
 * Sanitize payment data for logging
 * @param {Object} data - Payment data
 * @returns {Object} - Sanitized data
 */
function sanitizePaymentData(data) {
  const sanitized = { ...data };

  // Remove sensitive information
  delete sanitized.signature;
  delete sanitized.accessKey;
  delete sanitized.secretKey;

  // Mask partial information
  if (sanitized.partnerCode) {
    sanitized.partnerCode = sanitized.partnerCode.substring(0, 4) + '***';
  }

  return sanitized;
}

/**
 * Check if payment amount matches order total
 * @param {number} paymentAmount - Payment amount
 * @param {number} orderTotal - Order total
 * @param {number} tolerance - Tolerance for amount difference
 * @returns {boolean} - Whether amounts match
 */
function validatePaymentAmount(paymentAmount, orderTotal, tolerance = 0) {
  return Math.abs(paymentAmount - orderTotal) <= tolerance;
}

/**
 * Validate order status for payment
 * @param {string} orderStatus - Current order status
 * @returns {boolean} - Whether order can be paid
 */
function canProcessPayment(orderStatus) {
  const allowedStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING'];
  return allowedStatuses.includes(orderStatus);
}

/**
 * Generate secure request ID
 * @param {string} orderId - Order ID
 * @returns {string} - Generated request ID
 */
function generateRequestId(orderId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${orderId}_${timestamp}_${random}`;
}

module.exports = {
  MOMO_RESULT_CODES,
  getMomoResultMessage,
  validatePaymentRequest,
  validatePaymentItem,
  validateUserInfo,
  validateDeliveryInfo,
  validateSignature,
  sanitizePaymentData,
  validatePaymentAmount,
  canProcessPayment,
  generateRequestId
};
