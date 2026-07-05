/**
 * @constants
 * @description Application constants
 */

const SHIPMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  E_WALLET: 'e_wallet',
  CASH: 'cash',
};

const USER_ROLES = {
  CUSTOMER: 'customer',
  COURIER: 'courier',
  ADMIN: 'admin',
};

const ADDRESS_LABELS = {
  HOME: 'Home',
  OFFICE: 'Office',
  OTHER: 'Other',
};

const API_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  BAD_REQUEST: 'Invalid request',
  CONFLICT: 'Resource conflict',
  INTERNAL_ERROR: 'Internal server error',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

const JWT = {
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
};

module.exports = {
  SHIPMENT_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  USER_ROLES,
  ADDRESS_LABELS,
  API_MESSAGES,
  PAGINATION,
  JWT,
};
