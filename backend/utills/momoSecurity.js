const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * MoMo Security utilities for secure payment processing
 */
class MomoSecurity {
  
  /**
   * Encrypt sensitive data using AES-256-GCM
   * @param {string} text - Text to encrypt
   * @param {string} key - Encryption key
   * @returns {Object} - Encrypted data with IV and auth tag
   */
  static encrypt(text, key = process.env.MOMO_ENCRYPTION_KEY) {
    if (!key) {
      throw new Error('Encryption key not provided');
    }

    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   * @param {Object} encryptedData - Encrypted data object
   * @param {string} key - Decryption key
   * @returns {string} - Decrypted text
   */
  static decrypt(encryptedData, key = process.env.MOMO_ENCRYPTION_KEY) {
    if (!key) {
      throw new Error('Decryption key not provided');
    }

    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipher(algorithm, key);
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate secure random request ID
   * @param {string} prefix - Prefix for request ID
   * @returns {string} - Secure request ID
   */
  static generateSecureRequestId(prefix = 'REQ') {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const hash = crypto.createHash('sha256')
      .update(`${prefix}_${timestamp}_${random}`)
      .digest('hex')
      .substring(0, 8);
    
    return `${prefix}_${timestamp}_${hash}`;
  }

  /**
   * Validate IP address against whitelist
   * @param {string} ip - IP address to validate
   * @param {Array} whitelist - Array of allowed IP addresses/ranges
   * @returns {boolean} - Whether IP is allowed
   */
  static validateIPAddress(ip, whitelist = []) {
    if (!whitelist.length) return true; // No restrictions if whitelist is empty
    
    // Remove IPv6 prefix if present
    const cleanIP = ip.replace(/^::ffff:/, '');
    
    return whitelist.some(allowedIP => {
      if (allowedIP.includes('/')) {
        // CIDR notation
        return this.isIPInCIDR(cleanIP, allowedIP);
      } else {
        // Exact match
        return cleanIP === allowedIP;
      }
    });
  }

  /**
   * Check if IP is in CIDR range
   * @param {string} ip - IP address
   * @param {string} cidr - CIDR notation
   * @returns {boolean} - Whether IP is in range
   */
  static isIPInCIDR(ip, cidr) {
    const [range, bits = 32] = cidr.split('/');
    const mask = ~(2 ** (32 - bits) - 1);
    
    const ipInt = this.ipToInt(ip);
    const rangeInt = this.ipToInt(range);
    
    return (ipInt & mask) === (rangeInt & mask);
  }

  /**
   * Convert IP address to integer
   * @param {string} ip - IP address
   * @returns {number} - IP as integer
   */
  static ipToInt(ip) {
    return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
  }

  /**
   * Rate limiting with sliding window
   * @param {string} key - Rate limit key (e.g., IP address)
   * @param {number} limit - Request limit
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Object} - Rate limit status
   */
  static async checkRateLimit(key, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    try {
      // Clean old entries
      await prisma.rateLimitLog.deleteMany({
        where: {
          key: key,
          timestamp: {
            lt: new Date(windowStart)
          }
        }
      });

      // Count current requests
      const requestCount = await prisma.rateLimitLog.count({
        where: {
          key: key,
          timestamp: {
            gte: new Date(windowStart)
          }
        }
      });

      if (requestCount >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: windowStart + windowMs,
          retryAfter: Math.ceil((windowStart + windowMs - now) / 1000)
        };
      }

      // Log this request
      await prisma.rateLimitLog.create({
        data: {
          key: key,
          timestamp: new Date(now)
        }
      });

      return {
        allowed: true,
        remaining: limit - requestCount - 1,
        resetTime: windowStart + windowMs,
        retryAfter: 0
      };

    } catch (error) {
      console.error('Rate limit check error:', error);
      // Allow request if rate limiting fails
      return {
        allowed: true,
        remaining: limit,
        resetTime: now + windowMs,
        retryAfter: 0
      };
    }
  }

  /**
   * Sanitize and validate webhook data
   * @param {Object} data - Webhook data
   * @returns {Object} - Sanitized data
   */
  static sanitizeWebhookData(data) {
    const allowedFields = [
      'partnerCode', 'orderId', 'requestId', 'amount', 'orderInfo',
      'orderType', 'transId', 'resultCode', 'message', 'payType',
      'responseTime', 'extraData', 'signature', 'partnerUserId'
    ];

    const sanitized = {};
    
    for (const field of allowedFields) {
      if (data.hasOwnProperty(field)) {
        let value = data[field];
        
        // Type validation and sanitization
        if (typeof value === 'string') {
          // Remove potentially dangerous characters
          value = value.replace(/[<>'"&]/g, '');
          // Limit string length
          value = value.substring(0, 1000);
        } else if (typeof value === 'number') {
          // Ensure number is within safe range
          value = Math.max(-Number.MAX_SAFE_INTEGER, Math.min(Number.MAX_SAFE_INTEGER, value));
        }
        
        sanitized[field] = value;
      }
    }

    return sanitized;
  }

  /**
   * Log security events
   * @param {string} event - Event type
   * @param {Object} details - Event details
   * @param {string} severity - Event severity (low, medium, high, critical)
   */
  static async logSecurityEvent(event, details, severity = 'medium') {
    try {
      await prisma.securityLog.create({
        data: {
          event: event,
          details: JSON.stringify(details),
          severity: severity,
          timestamp: new Date(),
          ip: details.ip || 'unknown',
          userAgent: details.userAgent || 'unknown'
        }
      });

      // Alert on critical events
      if (severity === 'critical') {
        console.error('CRITICAL SECURITY EVENT:', {
          event,
          details,
          timestamp: new Date().toISOString()
        });
        
        // Here you could integrate with alerting systems
        // await this.sendSecurityAlert(event, details);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Validate MoMo configuration
   * @returns {Object} - Validation result
   */
  static validateConfiguration() {
    const requiredEnvVars = [
      'MOMO_PARTNER_CODE',
      'MOMO_ACCESS_KEY',
      'MOMO_SECRET_KEY',
      'MOMO_ENDPOINT'
    ];

    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      return {
        valid: false,
        errors: [`Missing required environment variables: ${missing.join(', ')}`]
      };
    }

    // Validate configuration values
    const errors = [];
    
    if (process.env.MOMO_PARTNER_CODE.length < 10) {
      errors.push('MOMO_PARTNER_CODE appears to be invalid');
    }
    
    if (process.env.MOMO_ACCESS_KEY.length < 16) {
      errors.push('MOMO_ACCESS_KEY appears to be invalid');
    }
    
    if (process.env.MOMO_SECRET_KEY.length < 32) {
      errors.push('MOMO_SECRET_KEY appears to be invalid');
    }
    
    if (!process.env.MOMO_ENDPOINT.startsWith('https://')) {
      errors.push('MOMO_ENDPOINT must use HTTPS');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Generate secure hash for data integrity
   * @param {Object} data - Data to hash
   * @returns {string} - SHA-256 hash
   */
  static generateDataHash(data) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Verify data integrity using hash
   * @param {Object} data - Data to verify
   * @param {string} expectedHash - Expected hash
   * @returns {boolean} - Whether data is intact
   */
  static verifyDataIntegrity(data, expectedHash) {
    const actualHash = this.generateDataHash(data);
    return actualHash === expectedHash;
  }

  /**
   * Create secure session token for payment tracking
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (optional)
   * @returns {string} - Secure session token
   */
  static createPaymentSession(orderId, userId = null) {
    const sessionData = {
      orderId,
      userId,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    };

    const token = crypto.createHash('sha256')
      .update(JSON.stringify(sessionData) + process.env.MOMO_SECRET_KEY)
      .digest('hex');

    return `${Buffer.from(JSON.stringify(sessionData)).toString('base64')}.${token}`;
  }

  /**
   * Verify payment session token
   * @param {string} sessionToken - Session token to verify
   * @returns {Object} - Verification result
   */
  static verifyPaymentSession(sessionToken) {
    try {
      const [dataB64, token] = sessionToken.split('.');
      const sessionData = JSON.parse(Buffer.from(dataB64, 'base64').toString());
      
      const expectedToken = crypto.createHash('sha256')
        .update(JSON.stringify(sessionData) + process.env.MOMO_SECRET_KEY)
        .digest('hex');

      if (token !== expectedToken) {
        return { valid: false, error: 'Invalid token signature' };
      }

      // Check if session is expired (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - sessionData.timestamp > maxAge) {
        return { valid: false, error: 'Session expired' };
      }

      return { valid: true, data: sessionData };
    } catch (error) {
      return { valid: false, error: 'Invalid session token format' };
    }
  }
}

module.exports = MomoSecurity;
