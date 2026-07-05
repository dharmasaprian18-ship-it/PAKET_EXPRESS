const express = require('express');
const Joi = require('joi');
const { authenticate, authorize, validate } = require('../middleware');
const shipmentController = require('./shipmentController');

const router = express.Router();

/**
 * @route POST /api/shipments
 * @description Create new shipment
 */
router.post(
  '/',
  authenticate,
  authorize('customer'),
  validate({
    body: Joi.object().keys({
      pickupAddressId: Joi.string().uuid().required(),
      deliveryAddressId: Joi.string().uuid().required(),
      totalWeight: Joi.number().positive().required(),
      shippingCost: Joi.number().positive().required(),
      insuranceCost: Joi.number().optional(),
      notes: Joi.string().optional(),
      estimatedDelivery: Joi.date().optional(),
      items: Joi.array().items(
        Joi.object().keys({
          itemName: Joi.string().required(),
          itemType: Joi.string().required(),
          quantity: Joi.number().positive().required(),
          weight: Joi.number().positive().required(),
          length: Joi.number().optional(),
          width: Joi.number().optional(),
          height: Joi.number().optional(),
          value: Joi.number().optional(),
          description: Joi.string().optional(),
        })
      ),
    }),
  }),
  shipmentController.createShipment
);

/**
 * @route GET /api/shipments
 * @description Get all shipments
 */
router.get(
  '/',
  authenticate,
  shipmentController.getAllShipments
);

/**
 * @route GET /api/shipments/:id
 * @description Get shipment by ID
 */
router.get(
  '/:id',
  authenticate,
  validate({
    params: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
  }),
  shipmentController.getShipmentById
);

/**
 * @route PUT /api/shipments/:id
 * @description Update shipment status
 */
router.put(
  '/:id',
  authenticate,
  validate({
    params: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object().keys({
      status: Joi.string().valid('pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'returned').required(),
    }),
  }),
  shipmentController.updateShipmentStatus
);

/**
 * @route DELETE /api/shipments/:id
 * @description Cancel shipment
 */
router.delete(
  '/:id',
  authenticate,
  validate({
    params: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
  }),
  shipmentController.cancelShipment
);

module.exports = router;
