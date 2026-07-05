const express = require('express');
const Joi = require('joi');
const { authenticate, authorize, validate } = require('../middleware');
const trackingController = require('./trackingController');

const router = express.Router();

/**
 * @route GET /api/tracking/:trackingNumber
 * @description Get tracking info by tracking number
 */
router.get(
  '/:trackingNumber',
  validate({
    params: Joi.object().keys({
      trackingNumber: Joi.string().required(),
    }),
  }),
  trackingController.getTrackingByNumber
);

/**
 * @route GET /api/tracking/shipment/:shipmentId
 * @description Get tracking history for a shipment
 */
router.get(
  '/shipment/:shipmentId',
  authenticate,
  validate({
    params: Joi.object().keys({
      shipmentId: Joi.string().uuid().required(),
    }),
  }),
  trackingController.getTrackingHistory
);

/**
 * @route POST /api/tracking/:shipmentId/update
 * @description Update tracking location
 */
router.post(
  '/:shipmentId/update',
  authenticate,
  authorize('courier'),
  validate({
    params: Joi.object().keys({
      shipmentId: Joi.string().uuid().required(),
    }),
    body: Joi.object().keys({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      location: Joi.string().required(),
      status: Joi.string().optional(),
      description: Joi.string().optional(),
    }),
  }),
  trackingController.updateTrackingLocation
);

/**
 * @route GET /api/tracking/stats
 * @description Get tracking statistics
 */
router.get(
  '/stats/all',
  authenticate,
  authorize('admin'),
  trackingController.getTrackingStats
);

module.exports = router;
