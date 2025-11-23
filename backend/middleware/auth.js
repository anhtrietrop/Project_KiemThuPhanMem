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

module.exports = { authenticate };
