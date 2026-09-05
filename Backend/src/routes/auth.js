// @ts-nocheck
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  register,
  getProfile,
  updateProfile,
  deleteAccount,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

const registerRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password min 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password needs an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password needs a number'),
  body('phone')
    .optional()
    .matches(/^\+27[0-9]{9}$/)
    .withMessage('Phone must be in format +27XXXXXXXXX'),
];

const updateRules = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name 2-100 characters'),
  body('phone')
    .optional()
    .matches(/^\+27[0-9]{9}$/)
    .withMessage('Phone must be in format +27XXXXXXXXX'),
];

// Public routes
router.post('/register', authLimiter, registerRules, validate, register);

// Protected routes
router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, updateRules, validate, updateProfile);
router.delete('/account', requireAuth, deleteAccount);

module.exports = router;
