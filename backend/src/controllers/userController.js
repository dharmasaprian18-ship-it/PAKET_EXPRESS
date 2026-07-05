const httpStatus = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { successResponse } = require('../utils/responseHandler');
const { paginate, buildPaginatedResponse } = require('../utils/pagination');
const db = require('../models');

/**
 * @controller userController
 * @description User management controller
 * @kriteria KRITERIA 3 - REST API Endpoints
 */

/**
 * @route GET /api/users
 * @description Get all users (admin only)
 */
const getAllUsers = catchAsync(async (req, res) => {
  const { limit, offset, page } = paginate(req);

  const { count, rows } = await db.User.findAndCountAll({
    limit,
    offset,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });

  successResponse(res, httpStatus.OK, 'Users retrieved successfully', 
    buildPaginatedResponse(rows, count, page, limit));
});

/**
 * @route GET /api/users/:id
 * @description Get user by ID
 */
const getUserById = catchAsync(async (req, res) => {
  const user = await db.User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    include: [
      { model: db.Address, as: 'addresses' },
      { model: db.Transaction, as: 'transactions' },
    ],
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  successResponse(res, httpStatus.OK, 'User retrieved successfully', { user });
});

/**
 * @route PUT /api/users/:id
 * @description Update user
 */
const updateUser = catchAsync(async (req, res) => {
  const user = await db.User.findByPk(req.params.id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check authorization
  if (req.user.id !== user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this user');
  }

  const { fullName, phoneNumber, profilePicture } = req.body;

  await user.update({
    fullName: fullName || user.fullName,
    phoneNumber: phoneNumber || user.phoneNumber,
    profilePicture: profilePicture || user.profilePicture,
  });

  successResponse(res, httpStatus.OK, 'User updated successfully', { user: user.toJSON() });
});

/**
 * @route DELETE /api/users/:id
 * @description Delete user (admin only)
 */
const deleteUser = catchAsync(async (req, res) => {
  const user = await db.User.findByPk(req.params.id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  await user.destroy();

  successResponse(res, httpStatus.OK, 'User deleted successfully');
});

/**
 * @route PUT /api/users/:id/deactivate
 * @description Deactivate user account
 */
const deactivateUser = catchAsync(async (req, res) => {
  const user = await db.User.findByPk(req.params.id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check authorization
  if (req.user.id !== user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to deactivate this user');
  }

  await user.update({ isActive: false });

  successResponse(res, httpStatus.OK, 'User deactivated successfully');
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deactivateUser,
};
