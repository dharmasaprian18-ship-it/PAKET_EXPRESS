const errorHandler = require('./errorHandler');
const authenticate = require('./authenticate');
const authorize = require('./authorize');
const validate = require('./validation');
const corsMiddleware = require('./corsMiddleware');
const { globalLimiter, authLimiter, apiLimiter } = require('./rateLimiter');

module.exports = {
  errorHandler,
  authenticate,
  authorize,
  validate,
  corsMiddleware,
  globalLimiter,
  authLimiter,
  apiLimiter,
};
