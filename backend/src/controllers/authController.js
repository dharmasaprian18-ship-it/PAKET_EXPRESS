const jwt = require('jsonwebtoken');
const httpStatus = require('http-status-codes');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const db = require('../models');

/**
 * @controller authController
 * @description Authentication controller untuk register, login, logout
 * @kriteria KRITERIA 3 - REST API Endpoints
 * @kriteria KRITERIA 4 - Authentication & Authorization
 */

/**
 * @route POST /api/auth/register
 * @description Register user baru
 */
const register = catchAsync(async (req, res) => {
  const { fullName, email, password, phoneNumber, role } = req.body;

  // Check if user already exists
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, 'Email already registered');
  }

  // Create new user
  const user = await db.User.create({
    fullName,
    email,
    password,
    phoneNumber,
    role: role || 'customer',
  });

  // Generate tokens
  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });

  successResponse(res, httpStatus.CREATED, 'User registered successfully', {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  });
});

/**
 * @route POST /api/auth/login
 * @description Login user dengan email dan password
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is inactive');
  }

  // Update last login
  await user.update({ lastLogin: new Date() });

  // Generate tokens
  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });

  successResponse(res, httpStatus.OK, 'Login successful', {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  });
});

/**
 * @route POST /api/auth/refresh
 * @description Refresh access token menggunakan refresh token
 */
const refreshAccessToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token is required');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await db.User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    successResponse(res, httpStatus.OK, 'Token refreshed successfully', {
      accessToken,
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }
});

/**
 * @route POST /api/auth/logout
 * @description Logout user (client-side token removal)
 */
const logout = catchAsync(async (req, res) => {
  successResponse(res, httpStatus.OK, 'Logout successful');
});

/**
 * @route GET /api/auth/me
 * @description Get current user profile
 */
const getCurrentUser = catchAsync(async (req, res) => {
  const user = await db.User.findByPk(req.user.id);

  successResponse(res, httpStatus.OK, 'Profile retrieved successfully', {
    user: user.toJSON(),
  });
});

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
};
