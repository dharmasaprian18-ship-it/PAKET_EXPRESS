const httpStatus = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { successResponse } = require('../utils/responseHandler');
const db = require('../models');

/**
 * @controller trackingController
 * @description Real-time tracking controller
 * @kriteria KRITERIA 3 - REST API Endpoints
 * @kriteria KRITERIA 6 - Real-Time Communication (Socket.io)
 */

/**
 * @route GET /api/tracking/:trackingNumber
 * @description Get tracking info by tracking number
 */
const getTrackingByNumber = catchAsync(async (req, res) => {
  const { trackingNumber } = req.params;

  const shipment = await db.Shipment.findOne({
    where: { trackingNumber },
    include: [
      { model: db.TrackingHistory, as: 'trackingHistory', order: [['timestamp', 'DESC']] },
      { model: db.User, as: 'sender', attributes: { exclude: ['password'] } },
      { model: db.User, as: 'courier', attributes: { exclude: ['password'] } },
      { model: db.Address, as: 'pickupAddress' },
      { model: db.Address, as: 'deliveryAddress' },
    ],
  });

  if (!shipment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipment not found');
  }

  successResponse(res, httpStatus.OK, 'Tracking info retrieved successfully', { shipment });
});

/**
 * @route GET /api/tracking/shipment/:shipmentId
 * @description Get tracking history for a shipment
 */
const getTrackingHistory = catchAsync(async (req, res) => {
  const { shipmentId } = req.params;

  const shipment = await db.Shipment.findByPk(shipmentId);
  if (!shipment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipment not found');
  }

  const trackingHistory = await db.TrackingHistory.findAll({
    where: { shipmentId },
    order: [['timestamp', 'ASC']],
  });

  successResponse(res, httpStatus.OK, 'Tracking history retrieved successfully', {
    shipmentId,
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    history: trackingHistory,
  });
});

/**
 * @route POST /api/tracking/:shipmentId/update
 * @description Update tracking location (courier only)
 */
const updateTrackingLocation = catchAsync(async (req, res) => {
  const { shipmentId } = req.params;
  const { latitude, longitude, location, status, description } = req.body;

  const shipment = await db.Shipment.findByPk(shipmentId);
  if (!shipment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipment not found');
  }

  // Authorization check - only courier assigned to this shipment
  if (shipment.courierId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update tracking for this shipment');
  }

  // Create tracking history entry
  const tracking = await db.TrackingHistory.create({
    shipmentId,
    latitude,
    longitude,
    location,
    status: status || shipment.status,
    description: description || `Location updated`,
    timestamp: new Date(),
  });

  // Update shipment status if provided
  if (status) {
    await shipment.update({ status });
  }

  successResponse(res, httpStatus.CREATED, 'Tracking location updated successfully', {
    tracking,
  });
});

/**
 * @route GET /api/tracking/stats
 * @description Get tracking statistics
 */
const getTrackingStats = catchAsync(async (req, res) => {
  const stats = await db.Shipment.findAll({
    attributes: [
      ['status', 'status'],
      [db.sequelize.fn('COUNT', db.sequelize.col('*')), 'count'],
    ],
    group: ['status'],
    raw: true,
  });

  successResponse(res, httpStatus.OK, 'Tracking statistics retrieved successfully', {
    stats: Object.fromEntries(stats.map(s => [s.status, s.count])),
  });
});

module.exports = {
  getTrackingByNumber,
  getTrackingHistory,
  updateTrackingLocation,
  getTrackingStats,
};
