// @ts-nocheck
const { ValidationError } = require('../errors/AppError');

const sanitizeText = (value, maxLength, field = 'Text') => {
  if (typeof value !== 'string') return value;
  const cleaned = value.replace(/<[^>]*>/g, '').trim();
  if (cleaned.length > maxLength) {
    throw new ValidationError(`${field} must be ${maxLength} characters or fewer`);
  }
  return cleaned;
};

module.exports = { sanitizeText };
