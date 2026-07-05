const rateLimit = require('express-rate-limit');
const httpStatus = require('http-status-codes');

/**
 * @middleware globalLimiter
 * @description Rate limiter untuk semua endpoint
 * @kriteria KRITERIA 2 - Middleware Implementation
 */
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @middleware authLimiter
 * @description Rate limiter khusus untuk auth endpoints (login, register)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

/**
 * @middleware apiLimiter
 * @description Rate limiter untuk API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many API requests, please try again later.',
});

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
};
