// @ts-nocheck
const { AppError } = require('../errors/AppError');

const errorHandler = (err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'A record with that value already exists',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found',
    });
  }

  if (err.code === 'P1001' || err.code === 'P1002') {
    return res.status(503).json({
      success: false,
      error: 'Database unavailable. Please try again shortly.',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired' });
  }

  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message,
  });
};

module.exports = errorHandler;
