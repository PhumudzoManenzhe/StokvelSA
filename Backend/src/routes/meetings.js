// @ts-nocheck
const express = require('express');
const { body } = require('express-validator');
const router = express.Router({ mergeParams: true });
const {
  createMeeting,
  getGroupMeetings,
  getMeeting,
  updateMeeting,
  cancelMeeting,
  updateAttendance,
  recordMinutes,
} = require('../controllers/meetingController');
const {
  requireAuth,
  requireGroupRole,
  requireGroupMember,
} = require('../middleware/auth');
const validate = require('../middleware/validate');

const createRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Meeting title is required')
    .isLength({ max: 200 })
    .withMessage('Title max 200 characters'),
  body('date')
    .notEmpty()
    .withMessage('Meeting date is required')
    .isISO8601()
    .withMessage('Must be a valid date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Location max 300 characters'),
];

const attendanceRules = [
  body('status')
    .isIn(['CONFIRMED', 'ABSENT'])
    .withMessage('Status must be CONFIRMED or ABSENT'),
];

router.use(requireAuth);

// Get all meetings
router.get('/', requireGroupMember, getGroupMeetings);

// Create meeting (ADMIN/TREASURER)
router.post(
  '/',
  requireGroupRole('ADMIN', 'TREASURER'),
  createRules,
  validate,
  createMeeting
);

// Single meeting
router.get('/:meetingId', requireGroupMember, getMeeting);

// Update meeting (ADMIN/TREASURER)
router.patch(
  '/:meetingId',
  requireGroupRole('ADMIN', 'TREASURER'),
  updateMeeting
);

// Cancel meeting (ADMIN only)
router.delete('/:meetingId', requireGroupRole('ADMIN'), cancelMeeting);

// Update own attendance
router.patch(
  '/:meetingId/attendance',
  requireGroupMember,
  attendanceRules,
  validate,
  updateAttendance
);

// Record minutes (ADMIN/TREASURER)
router.patch(
  '/:meetingId/minutes',
  requireGroupRole('ADMIN', 'TREASURER'),
  body('minutes').notEmpty().withMessage('Minutes content is required'),
  validate,
  recordMinutes
);

module.exports = router;
