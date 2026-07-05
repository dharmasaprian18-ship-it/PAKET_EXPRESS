const httpStatus = require('http-status-codes');
const ApiError = require('../utils/ApiError');

/**
 * @middleware authorize
 * @description Role-based authorization middleware
 * @kriteria KRITERIA 2 - Middleware Implementation
 * @kriteria KRITERIA 4 - Authentication & Authorization
 * @param {...string} roles - List of allowed roles
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Authentication required'
    );
  }

  if (!roles.includes(req.user.role)) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Access denied. Required role(s): ${roles.join(', ')}`
    );
  }

  next();
};

module.exports = authorize;
