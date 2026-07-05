const cors = require('cors');

/**
 * @middleware corsMiddleware
 * @description CORS configuration untuk frontend
 * @kriteria KRITERIA 2 - Middleware Implementation
 */
const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});

module.exports = corsMiddleware;
