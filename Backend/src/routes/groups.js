// @ts-nocheck
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createGroup,
  getUserGroups,
  getGroup,
  updateGroup,
  inviteMember,
  acceptInvitation,
  removeMember,
  updateMemberRole,
} = require('../controllers/groupController');
const {
  requireAuth,
  requireGroupRole,
  requireGroupMember,
} = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createGroupRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ max: 100 })
    .withMessage('Name max 100 characters'),
  body('contributionAmount')
    .isFloat({ min: 1 })
    .withMessage('Contribution amount must be at least R1'),
  body('contributionFrequency')
    .optional()
    .isIn(['WEEKLY', 'MONTHLY', 'QUARTERLY'])
    .withMessage('Invalid frequency'),
  body('payoutOrder')
    .optional()
    .isIn(['FIXED', 'ROTATING', 'RANDOM'])
    .withMessage('Invalid payout order'),
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Max members must be between 2 and 100'),
];

const inviteRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['TREASURER', 'MEMBER'])
    .withMessage('Role must be TREASURER or MEMBER'),
];

const roleRules = [
  body('role')
    .isIn(['ADMIN', 'TREASURER', 'MEMBER'])
    .withMessage('Invalid role'),
];

// ── Routes ──────────────────────────────────────────────

// User's groups
router.get('/', requireAuth, getUserGroups);
router.post('/', requireAuth, createGroupRules, validate, createGroup);

// Single group
router.get('/:groupId', requireAuth, requireGroupMember, getGroup);

router.patch(
  '/:groupId',
  requireAuth,
  requireGroupRole('ADMIN'),
  createGroupRules,
  validate,
  updateGroup
);

// Members
router.post(
  '/:groupId/invite',
  requireAuth,
  requireGroupRole('ADMIN', 'TREASURER'),
  inviteRules,
  validate,
  inviteMember
);

router.post('/invitations/:code/accept', requireAuth, acceptInvitation);

router.delete(
  '/:groupId/members/:memberId',
  requireAuth,
  requireGroupRole('ADMIN'),
  removeMember
);

router.patch(
  '/:groupId/members/:memberId/role',
  requireAuth,
  requireGroupRole('ADMIN'),
  roleRules,
  validate,
  updateMemberRole
);

module.exports = router;
