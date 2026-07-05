const express = require('express');
const Joi = require('joi');
const { authenticate, authorize, validate } = require('../middleware');
const transactionController = require('./transactionController');

const router = express.Router();

/**
 * @route POST /api/transactions
 * @description Create payment for shipment
 */
router.post(
  '/',
  authenticate,
  validate({
    body: Joi.object().keys({
      shipmentId: Joi.string().uuid().required(),
      paymentMethod: Joi.string().valid('bank_transfer', 'credit_card', 'e_wallet', 'cash').required(),
    }),
  }),
  transactionController.createPayment
);

/**
 * @route GET /api/transactions
 * @description Get all transactions
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  transactionController.getAllTransactions
);

/**
 * @route GET /api/transactions/:id
 * @description Get transaction by ID
 */
router.get(
  '/:id',
  authenticate,
  validate({
    params: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
  }),
  transactionController.getTransactionById
);

/**
 * @route PUT /api/transactions/:id/confirm
 * @description Confirm payment
 */
router.put(
  '/:id/confirm',
  authenticate,
  validate({
    params: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
  }),
  transactionController.confirmPayment
);

/**
 * @route PUT /api/transactions/:id/refund
 * @description Refund payment
 */
router.put(
  '/:id/refund',
  authenticate,
  authorize('admin'),
  validate({
    params: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
  }),
  transactionController.refundPayment
);

module.exports = router;
