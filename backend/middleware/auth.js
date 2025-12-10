const jwt = require('jsonwebtoken');
const { AppError } = require('../utills/errorHandler');

/**
 * Authentication middleware - verifies JWT token
 * Sets request.user with decoded token data
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AppError('No token provided', 401);
    }

    // Check Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError('Invalid token format', 401);
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user info on request object
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

/**
 * Flexible authentication middleware
 * Accepts userId from:
 * 1. X-User-Id header
 * 2. userId in request body
 * 3. JWT token (Bearer)
 * Used for review endpoints where frontend uses NextAuth session
 */
const authenticateFlexible = (req, res, next) => {
  try {
    // Try X-User-Id header first
    const userIdHeader = req.headers['x-user-id'];
    if (userIdHeader) {
      req.user = { id: userIdHeader };
      return next();
    }

    // Try userId in body
    if (req.body && req.body.userId) {
      req.user = { id: req.body.userId };
      return next();
    }

    // Fall back to JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    }

    throw new AppError('Authentication required', 401);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

module.exports = { authenticate, authenticateFlexible };
