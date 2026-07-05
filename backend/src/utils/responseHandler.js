/**
 * @function successResponse
 * @description Helper to build success API response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {any} data - Response data
 */
const successResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * @function errorResponse
 * @description Helper to build error API response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {array} errors - Additional error details
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
