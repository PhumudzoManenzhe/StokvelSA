// @ts-nocheck
const express = require('express');
const { body } = require('express-validator');
const router = express.Router({ mergeParams: true });
const {
  schedulePayout,
  getGroupPayouts,
  completePayout,
  failPayout,
  getPayoutSchedule,
  getPayoutSummary,
} = require('../controllers/payoutController');
const {
  requireAuth,
  requireGroupRole,
  requireGroupMember,
} = require('../middleware/auth');
const validate = require('../middleware/validate');

const scheduleRules = [
  body('recipientId').notEmpty().withMessage('Recipient ID is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least R1'),
  body('scheduledDate')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Must be a valid date'),
];

router.use(requireAuth);

// Schedule a payout (ADMIN only)
router.post(
  '/',
  requireGroupRole('ADMIN'),
  scheduleRules,
  validate,
  schedulePayout
);

// Get all payouts
router.get('/', requireGroupMember, getGroupPayouts);

// Payout rotation schedule
router.get('/schedule', requireGroupMember, getPayoutSchedule);

// Payout summary stats
router.get(
  '/summary',
  requireGroupRole('ADMIN', 'TREASURER'),
  getPayoutSummary
);

// Mark completed (TREASURER/ADMIN)
router.patch(
  '/:payoutId/complete',
  requireGroupRole('ADMIN', 'TREASURER'),
  completePayout
);

// Mark failed (TREASURER/ADMIN)
router.patch(
  '/:payoutId/failed',
  requireGroupRole('ADMIN', 'TREASURER'),
  failPayout
);

module.exports = router;
