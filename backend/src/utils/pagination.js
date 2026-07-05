/**
 * @function paginate
 * @description Helper function for pagination
 * @param {object} req - Express request object
 * @returns {object} Pagination data (limit, offset, page)
 */
const paginate = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
  const offset = (page - 1) * limit;

  return { limit, offset, page };
};

/**
 * @function buildPaginatedResponse
 * @description Helper to build paginated API response
 * @param {array} data - Data array
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Paginated response
 */
const buildPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  paginate,
  buildPaginatedResponse,
};
