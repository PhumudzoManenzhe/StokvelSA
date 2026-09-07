// @ts-nocheck
const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getDashboard,
  getComplianceReport,
  getPayoutReport,
  exportComplianceCSV,
  exportPayoutCSV,
  exportCompliancePDF,
  exportPayoutPDF,
} = require('../controllers/analyticsController');
const {
  requireAuth,
  requireGroupRole,
  requireGroupMember,
} = require('../middleware/auth');

router.use(requireAuth);

// Dashboard — all members can see
router.get('/dashboard', requireGroupMember, getDashboard);

// Reports — admin/treasurer only
router.get(
  '/compliance',
  requireGroupRole('ADMIN', 'TREASURER'),
  getComplianceReport
);

router.get('/payouts', requireGroupRole('ADMIN', 'TREASURER'), getPayoutReport);

// CSV exports
router.get(
  '/compliance/export/csv',
  requireGroupRole('ADMIN', 'TREASURER'),
  exportComplianceCSV
);

router.get(
  '/payouts/export/csv',
  requireGroupRole('ADMIN', 'TREASURER'),
  exportPayoutCSV
);

// PDF exports
router.get(
  '/compliance/export/pdf',
  requireGroupRole('ADMIN', 'TREASURER'),
  exportCompliancePDF
);

router.get(
  '/payouts/export/pdf',
  requireGroupRole('ADMIN', 'TREASURER'),
  exportPayoutPDF
);

module.exports = router;
