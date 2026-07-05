const httpStatus = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { successResponse } = require('../utils/responseHandler');
const { paginate, buildPaginatedResponse } = require('../utils/pagination');
const db = require('../models');

/**
 * @controller transactionController
 * @description Transaction management controller
 * @kriteria KRITERIA 3 - REST API Endpoints
 * @kriteria KRITERIA 5 - Payment Gateway Integration
 */

/**
 * @route POST /api/transactions
 * @description Create payment for shipment
 */
const createPayment = catchAsync(async (req, res) => {
  const { shipmentId, paymentMethod } = req.body;

  // Verify shipment exists
  const shipment = await db.Shipment.findByPk(shipmentId);
  if (!shipment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipment not found');
  }

  // Authorization check
  if (shipment.senderId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to create payment for this shipment');
  }

  // Check if transaction already exists
  const existingTransaction = await db.Transaction.findOne({
    where: { shipmentId, status: ['pending', 'processing'] },
  });

  if (existingTransaction) {
    throw new ApiError(httpStatus.CONFLICT, 'Payment already pending for this shipment');
  }

  // Create transaction
  const transaction = await db.Transaction.create({
    shipmentId,
    userId: req.user.id,
    amount: shipment.totalCost,
    paymentMethod,
    status: 'pending',
  });

  // TODO: Integrate with payment gateway (Midtrans)
  // const midtransPayment = await midtransService.createPayment(transaction);
  // transaction.transactionId = midtransPayment.transactionId;
  // await transaction.save();

  successResponse(res, httpStatus.CREATED, 'Payment created successfully', {
    transaction,
    // paymentLink: midtransPayment.paymentLink
  });
});

/**
 * @route GET /api/transactions
 * @description Get all transactions
 */
const getAllTransactions = catchAsync(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { status, userId } = req.query;

  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const { count, rows } = await db.Transaction.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: db.Shipment,
        as: 'shipment',
        attributes: ['id', 'trackingNumber', 'status'],
      },
      {
        model: db.User,
        as: 'user',
        attributes: { exclude: ['password'] },
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  successResponse(res, httpStatus.OK, 'Transactions retrieved successfully',
    buildPaginatedResponse(rows, count, page, limit));
});

/**
 * @route GET /api/transactions/:id
 * @description Get transaction by ID
 */
const getTransactionById = catchAsync(async (req, res) => {
  const transaction = await db.Transaction.findByPk(req.params.id, {
    include: [
      { model: db.Shipment, as: 'shipment' },
      { model: db.User, as: 'user', attributes: { exclude: ['password'] } },
    ],
  });

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }

  successResponse(res, httpStatus.OK, 'Transaction retrieved successfully', { transaction });
});

/**
 * @route PUT /api/transactions/:id/confirm
 * @description Confirm payment
 */
const confirmPayment = catchAsync(async (req, res) => {
  const transaction = await db.Transaction.findByPk(req.params.id);

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }

  if (transaction.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment already processed');
  }

  // Update transaction status
  await transaction.update({
    status: 'success',
    paidAt: new Date(),
  });

  // Update shipment status
  const shipment = await db.Shipment.findByPk(transaction.shipmentId);
  await shipment.update({ status: 'confirmed' });

  // Add tracking history
  await db.TrackingHistory.create({
    shipmentId: shipment.id,
    status: 'confirmed',
    description: 'Payment confirmed, shipment ready for pickup',
  });

  successResponse(res, httpStatus.OK, 'Payment confirmed successfully', { transaction });
});

/**
 * @route PUT /api/transactions/:id/refund
 * @description Refund payment
 */
const refundPayment = catchAsync(async (req, res) => {
  const transaction = await db.Transaction.findByPk(req.params.id);

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }

  if (transaction.status !== 'success') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only successful payments can be refunded');
  }

  // TODO: Call payment gateway refund API
  // await midtransService.refundPayment(transaction.transactionId);

  await transaction.update({ status: 'refunded' });

  successResponse(res, httpStatus.OK, 'Payment refunded successfully', { transaction });
});

module.exports = {
  createPayment,
  getAllTransactions,
  getTransactionById,
  confirmPayment,
  refundPayment,
};
