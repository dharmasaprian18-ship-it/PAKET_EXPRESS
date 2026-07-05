/**
 * @class CatchAsync
 * @description Wrapper for async route handlers to catch errors
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    next(err);
  });
};

module.exports = catchAsync;
