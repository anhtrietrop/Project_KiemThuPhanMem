const { getMomoResultMessage, sanitizePaymentData } = require('../utills/momoValidation');

/**
 * MoMo-specific error handler middleware
 */
class MomoErrorHandler {
  /**
   * Handle MoMo API errors
   * @param {Error} error - Error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static handleMomoError(error, req, res, next) {
    console.error('MoMo Error:', {
      message: error.message,
      stack: error.stack,
      requestId: req.reqId,
      url: req.url,
      method: req.method,
      body: sanitizePaymentData(req.body || {}),
      timestamp: new Date().toISOString()
    });

    // Handle specific MoMo error types
    if (error.name === 'MomoSignatureError') {
      return res.status(400).json({
        success: false,
        error: 'SIGNATURE_INVALID',
        message: 'Invalid payment signature',
        requestId: req.reqId
      });
    }

    if (error.name === 'MomoValidationError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details || [],
        requestId: req.reqId
      });
    }

    if (error.name === 'MomoNetworkError') {
      return res.status(503).json({
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Payment service temporarily unavailable',
        requestId: req.reqId
      });
    }

    if (error.name === 'MomoTimeoutError') {
      return res.status(504).json({
        success: false,
        error: 'TIMEOUT_ERROR',
        message: 'Payment request timed out',
        requestId: req.reqId
      });
    }

    // Handle axios errors (network issues)
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        error: 'SERVICE_UNAVAILABLE',
        message: 'Payment service is currently unavailable',
        requestId: req.reqId
      });
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'REQUEST_TIMEOUT',
        message: 'Payment request timed out',
        requestId: req.reqId
      });
    }

    // Handle MoMo API response errors
    if (error.response && error.response.data) {
      const momoError = error.response.data;
      const resultCode = momoError.resultCode || 99;
      
      return res.status(400).json({
        success: false,
        error: 'MOMO_API_ERROR',
        message: getMomoResultMessage(resultCode),
        resultCode: resultCode,
        momoMessage: momoError.message,
        requestId: req.reqId
      });
    }

    // Generic error handling
    next(error);
  }

  /**
   * Validate MoMo webhook signature
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static validateWebhookSignature(req, res, next) {
    try {
      const { validateSignature } = require('../utills/momoValidation');
      const signature = req.body.signature;
      const secretKey = process.env.MOMO_SECRET_KEY;

      if (!signature) {
        const error = new Error('Missing signature in webhook');
        error.name = 'MomoSignatureError';
        throw error;
      }

      const isValid = validateSignature(req.body, signature, secretKey, 'callback');
      
      if (!isValid) {
        const error = new Error('Invalid webhook signature');
        error.name = 'MomoSignatureError';
        throw error;
      }

      next();
    } catch (error) {
      MomoErrorHandler.handleMomoError(error, req, res, next);
    }
  }

  /**
   * Rate limiting for MoMo endpoints
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static rateLimitHandler(req, res, next) {
    // Custom rate limit exceeded handler for MoMo endpoints
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many payment requests. Please try again later.',
      retryAfter: req.rateLimit?.resetTime || 60,
      requestId: req.reqId
    });
  }

  /**
   * Validate payment request data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static validatePaymentRequest(req, res, next) {
    try {
      const { validatePaymentRequest } = require('../utills/momoValidation');
      const validation = validatePaymentRequest(req.body);

      if (!validation.isValid) {
        const error = new Error('Payment validation failed');
        error.name = 'MomoValidationError';
        error.details = validation.errors;
        throw error;
      }

      next();
    } catch (error) {
      MomoErrorHandler.handleMomoError(error, req, res, next);
    }
  }

  /**
   * Log payment attempts for monitoring
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static logPaymentAttempt(req, res, next) {
    const startTime = Date.now();
    
    // Log request
    console.log('MoMo Payment Request:', {
      method: req.method,
      url: req.url,
      orderId: req.body?.orderId,
      amount: req.body?.amount,
      requestId: req.reqId,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      
      console.log('MoMo Payment Response:', {
        statusCode: res.statusCode,
        success: data.success,
        orderId: data.data?.orderId || req.body?.orderId,
        resultCode: data.data?.resultCode,
        duration: `${duration}ms`,
        requestId: req.reqId,
        timestamp: new Date().toISOString()
      });

      return originalJson.call(this, data);
    };

    next();
  }

  /**
   * Handle database errors in payment operations
   * @param {Error} error - Database error
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static handleDatabaseError(error, req, res, next) {
    if (error.code === 'P2002') { // Prisma unique constraint violation
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_PAYMENT',
        message: 'Payment request already exists for this order',
        requestId: req.reqId
      });
    }

    if (error.code === 'P2025') { // Prisma record not found
      return res.status(404).json({
        success: false,
        error: 'RECORD_NOT_FOUND',
        message: 'Payment record not found',
        requestId: req.reqId
      });
    }

    if (error.code === 'P2003') { // Prisma foreign key constraint violation
      return res.status(400).json({
        success: false,
        error: 'INVALID_REFERENCE',
        message: 'Invalid order reference',
        requestId: req.reqId
      });
    }

    // Generic database error
    console.error('Database Error in MoMo Payment:', {
      error: error.message,
      code: error.code,
      requestId: req.reqId,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Payment processing failed due to database error',
      requestId: req.reqId
    });
  }

  /**
   * Security middleware to prevent common attacks
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static securityMiddleware(req, res, next) {
    // Check for suspicious patterns in payment data
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];

    const checkData = JSON.stringify(req.body);
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(checkData)) {
        console.warn('Suspicious payment request detected:', {
          pattern: pattern.toString(),
          requestId: req.reqId,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });

        return res.status(400).json({
          success: false,
          error: 'SECURITY_VIOLATION',
          message: 'Invalid payment data detected',
          requestId: req.reqId
        });
      }
    }

    // Check request size
    const maxSize = 1024 * 1024; // 1MB
    if (req.get('content-length') > maxSize) {
      return res.status(413).json({
        success: false,
        error: 'PAYLOAD_TOO_LARGE',
        message: 'Payment request too large',
        requestId: req.reqId
      });
    }

    next();
  }
}

module.exports = MomoErrorHandler;
