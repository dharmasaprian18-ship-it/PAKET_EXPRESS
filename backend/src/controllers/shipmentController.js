const httpStatus = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { successResponse } = require('../utils/responseHandler');
const { paginate, buildPaginatedResponse } = require('../utils/pagination');
const db = require('../models');

/**
 * @controller shipmentController
 * @description Shipment management controller
 * @kriteria KRITERIA 3 - REST API Endpoints
 */

/**
 * @route POST /api/shipments
 * @description Create new shipment
 */
const createShipment = catchAsync(async (req, res) => {
  const {
    pickupAddressId,
    deliveryAddressId,
    totalWeight,
    shippingCost,
    insuranceCost,
    notes,
    items,
    estimatedDelivery,
  } = req.body;

  // Verify addresses exist
  const pickupAddress = await db.Address.findByPk(pickupAddressId);
  const deliveryAddress = await db.Address.findByPk(deliveryAddressId);

  if (!pickupAddress || !deliveryAddress) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }

  // Create shipment
  const trackingNumber = `PKG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const totalCost = (parseFloat(shippingCost) || 0) + (parseFloat(insuranceCost) || 0);

  const shipment = await db.Shipment.create({
    trackingNumber,
    senderId: req.user.id,
    pickupAddressId,
    deliveryAddressId,
    totalWeight,
    shippingCost,
    insuranceCost: insuranceCost || 0,
    totalCost,
    notes,
    estimatedDelivery,
    status: 'pending',
  });

  // Create shipment items
  if (items && Array.isArray(items)) {
    await Promise.all(
      items.map((item) => db.ShipmentItem.create({
        ...item,
        shipmentId: shipment.id,
      }))
    );
  }

  // Add initial tracking history
  await db.TrackingHistory.create({
    shipmentId: shipment.id,
    status: 'pending',
    description: 'Shipment created and waiting for pickup',
  });

  const fullShipment = await db.Shipment.findByPk(shipment.id, {
    include: [
      { model: db.ShipmentItem, as: 'items' },
      { model: db.TrackingHistory, as: 'trackingHistory' },
      { model: db.User, as: 'sender', attributes: { exclude: ['password'] } },
    ],
  });

  successResponse(res, httpStatus.CREATED, 'Shipment created successfully', {
    shipment: fullShipment,
  });
});

/**
 * @route GET /api/shipments
 * @description Get all shipments
 */
const getAllShipments = catchAsync(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { status, senderId } = req.query;

  const where = {};
  if (status) where.status = status;
  if (senderId) where.senderId = senderId;

  const { count, rows } = await db.Shipment.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: db.User, as: 'sender', attributes: { exclude: ['password'] } },
      { model: db.User, as: 'courier', attributes: { exclude: ['password'] } },
      { model: db.ShipmentItem, as: 'items' },
    ],
    order: [['createdAt', 'DESC']],
  });

  successResponse(res, httpStatus.OK, 'Shipments retrieved successfully',
    buildPaginatedResponse(rows, count, page, limit));
});

/**
 * @route GET /api/shipments/:id
 * @description Get shipment by ID
 */
const getShipmentById = catchAsync(async (req, res) => {
  const shipment = await db.Shipment.findByPk(req.params.id, {
    include: [
      { model: db.User, as: 'sender', attributes: { exclude: ['password'] } },
      { model: db.User, as: 'courier', attributes: { exclude: ['password'] } },
      { model: db.Address, as: 'pickupAddress' },
      { model: db.Address, as: 'deliveryAddress' },
      { model: db.ShipmentItem, as: 'items' },
      { model: db.TrackingHistory, as: 'trackingHistory' },
      { model: db.Transaction, as: 'transaction' },
    ],
  });

  if (!shipment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipment not found');
  }

  successResponse(res, httpStatus.OK, 'Shipment retrieved successfully', { shipment });
});

/**
 * @route PUT /api/shipments/:id
 * @description Update shipment status
 */
const updateShipmentStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const shipment = await db.Shipment.findByPk(req.params.id);

  if (!shipment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipment not found');
  }

  // Authorization check
  if (req.user.role === 'customer' && shipment.senderId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this shipment');
  }

  if (req.user.role === 'courier' && shipment.courierId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this shipment');
  }

  await shipment.update({ status });

  // Add tracking history
  await db.TrackingHistory.create({
    shipmentId: shipment.id,
    status,
    description: `Shipment status updated to ${status}`,
  });

  const updatedShipment = await db.Shipment.findByPk(shipment.id, {
    include: [
      { model: db.ShipmentItem, as: 'items' },
      { model: db.TrackingHistory, as: 'trackingHistory' },
    ],
  });

  successResponse(res, httpStatus.OK, 'Shipment updated successfully', {
    shipment: updatedShipment,
  });
});

/**
 * @route DELETE /api/shipments/:id
 * @description Cancel/delete shipment
 */
const cancelShipment = catchAsync(async (req, res) => {
  const shipment = await db.Shipment.findByPk(req.params.id);

  if (!shipment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipment not found');
  }

  // Check if shipment can be cancelled
  if (['delivered', 'cancelled'].includes(shipment.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Cannot cancel shipment with status: ${shipment.status}`);
  }

  await shipment.update({ status: 'cancelled' });

  await db.TrackingHistory.create({
    shipmentId: shipment.id,
    status: 'cancelled',
    description: 'Shipment cancelled by user',
  });

  successResponse(res, httpStatus.OK, 'Shipment cancelled successfully');
});

module.exports = {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipmentStatus,
  cancelShipment,
};
