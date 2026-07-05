const jwt = require('jsonwebtoken');
const httpStatus = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const db = require('../models');
const catchAsync = require('../utils/catchAsync');

/**
 * @middleware authenticate
 * @description JWT authentication middleware untuk verify token
 * @kriteria KRITERIA 2 - Middleware Implementation
 * @kriteria KRITERIA 4 - Authentication & Authorization
 */
const authenticate = catchAsync(async (req, res, next) => {
  let token;

  // Get token dari Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Please provide a valid token for authentication'
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user dari database
    const user = await db.User.findByPk(decoded.id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (!user.isActive) {
      throw new ApiError(httpStatus.FORBIDDEN, 'User account is inactive');
    }

    // Attach user ke request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }
});

module.exports = authenticate;
