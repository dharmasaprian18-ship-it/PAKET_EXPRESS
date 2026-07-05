const express = require('express');
const Joi = require('joi');
const { authenticate, validate, authLimiter } = require('../middleware');
const authController = require('./authController');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register user baru
 */
router.post(
  '/register',
  authLimiter,
  validate({
    body: Joi.object().keys({
      fullName: Joi.string().required().trim(),
      email: Joi.string().email().required().lowercase(),
      password: Joi.string().min(6).required(),
      phoneNumber: Joi.string().optional(),
      role: Joi.string().valid('customer', 'courier').optional(),
    }),
  }),
  authController.register
);

/**
 * @route POST /api/auth/login
 * @description Login user
 */
router.post(
  '/login',
  authLimiter,
  validate({
    body: Joi.object().keys({
      email: Joi.string().email().required().lowercase(),
      password: Joi.string().required(),
    }),
  }),
  authController.login
);

/**
 * @route POST /api/auth/refresh
 * @description Refresh access token
 */
router.post(
  '/refresh',
  validate({
    body: Joi.object().keys({
      refreshToken: Joi.string().required(),
    }),
  }),
  authController.refreshAccessToken
);

/**
 * @route POST /api/auth/logout
 * @description Logout user
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route GET /api/auth/me
 * @description Get current user profile
 */
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
