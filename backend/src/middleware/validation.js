const Joi = require('joi');
const httpStatus = require('http-status-codes');
const ApiError = require('../utils/ApiError');

/**
 * @middleware validate
 * @description Request validation middleware menggunakan Joi
 * @kriteria KRITERIA 2 - Middleware Implementation
 * @param {object} schema - Joi validation schema
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = Joi.object().keys({
    body: schema.body,
    params: schema.params,
    query: schema.query,
  });

  const object = { body: req.body, params: req.params, query: req.query };
  const { value, error } = validSchema.validate(object, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorByKey = {};
    error.details.forEach((detail) => {
      const key = detail.path.join('.');
      errorByKey[key] = detail.message;
    });

    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Validation error',
      false
    );
  }

  Object.assign(req, value);
  next();
};

module.exports = validate;
