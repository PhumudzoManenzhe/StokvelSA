// @ts-nocheck
const express = require('express');
const router = express.Router();
const {
  getRates,
  getSavingsProjection,
} = require('../controllers/rateController');
const { requireAuth } = require('../middleware/auth');

// Public — rates displayed on landing page too
router.get('/', getRates);

// Protected — projection uses user's contribution amount
router.get('/projection', requireAuth, getSavingsProjection);

module.exports = router;
