// @ts-nocheck
const rateLimit = require('express-rate-limit');

const skip = () => process.env.NODE_ENV === 'test';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip,
  message: { success: false, error: 'Too many requests' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip,
  message: { success: false, error: 'Too many auth attempts' },
});

module.exports = { generalLimiter, authLimiter };
