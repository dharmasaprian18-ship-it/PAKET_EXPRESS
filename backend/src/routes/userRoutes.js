const express = require('express');
const Joi = require('joi');
const { authenticate, authorize, validate } = require('../middleware');
const userController = require('./userController');

const router = express.Router();

/**
 * @route GET /api/users
 * @description Get all users (admin only)
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  userController.getAllUsers
);

/**
 * @route GET /api/users/:id
 * @description Get user by ID
 */
router.get(
  '/:id',
  authenticate,
  userController.getUserById
);

/**
 * @route PUT /api/users/:id
 * @description Update user
 */
router.put(
  '/:id',
  authenticate,
  validate({
    params: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object().keys({
      fullName: Joi.string().optional().trim(),
      phoneNumber: Joi.string().optional(),
      profilePicture: Joi.string().optional(),
    }),
  }),
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @description Delete user (admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({
    params: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
  }),
  userController.deleteUser
);

/**
 * @route PUT /api/users/:id/deactivate
 * @description Deactivate user account
 */
router.put(
  '/:id/deactivate',
  authenticate,
  validate({
    params: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
  }),
  userController.deactivateUser
);

module.exports = router;
