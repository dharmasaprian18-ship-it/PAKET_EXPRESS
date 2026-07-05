const httpStatus = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const { errorResponse } = require('../utils/responseHandler');

/**
 * @middleware errorHandler
 * @description Global error handling middleware untuk semua error
 * @kriteria KRITERIA 2 - Middleware Implementation
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    error = new ApiError(httpStatus.BAD_REQUEST, 'Validation error', false);
    error.errors = messages;
  }

  // Handle Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => `${e.path} already exists`);
    error = new ApiError(httpStatus.CONFLICT, 'Conflict error', false);
    error.errors = messages;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(httpStatus.UNAUTHORIZED, 'Token expired');
  }

  // Default error handling
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal server error';
    error = new ApiError(statusCode, message, false);
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    errors: error.errors || null,
  });
};

module.exports = errorHandler;
