// @ts-nocheck
const express = require('express');
const { body } = require('express-validator');
const router = express.Router({ mergeParams: true });
const {
  generateContributions,
  getGroupContributions,
  confirmContribution,
  flagMissed,
  getSummary,
  getMemberHistory,
} = require('../controllers/contributionController');
const {
  requireAuth,
  requireGroupRole,
  requireGroupMember,
} = require('../middleware/auth');
const validate = require('../middleware/validate');

const generateRules = [
  body('period')
    .notEmpty()
    .withMessage('Period is required')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Period must be in format YYYY-MM'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
];

// All routes require auth + group membership
router.use(requireAuth);

// Generate contributions for a period (ADMIN/TREASURER only)
router.post(
  '/generate',
  requireGroupRole('ADMIN', 'TREASURER'),
  generateRules,
  validate,
  generateContributions
);

// Get all contributions (filtered by role)
router.get('/', requireGroupMember, getGroupContributions);

// Summary stats
router.get('/summary', requireGroupRole('ADMIN', 'TREASURER'), getSummary);

// Member history
router.get(
  '/members/:memberId',
  requireGroupRole('ADMIN', 'TREASURER'),
  getMemberHistory
);

// Confirm a contribution (TREASURER/ADMIN)
router.patch(
  '/:contributionId/confirm',
  requireGroupRole('ADMIN', 'TREASURER'),
  confirmContribution
);

// Flag as missed (TREASURER/ADMIN)
router.patch(
  '/:contributionId/missed',
  requireGroupRole('ADMIN', 'TREASURER'),
  flagMissed
);

module.exports = router;
