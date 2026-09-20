// @ts-nocheck
const express = require('express');
const { body } = require('express-validator');
const { initiate, notify, paymentReturn } = require('../controllers/paymentController');
const { requireAuth, requireGroupMember } = require('../middleware/auth');
const validate = require('../middleware/validate');
const router = express.Router();
router.post('/initiate', requireAuth, body('groupId').notEmpty(), body('period').matches(/^\d{4}-\d{2}$/), validate, requireGroupMember, initiate);
router.post('/notify', express.urlencoded({ extended: false }), notify);
router.get('/return', paymentReturn);
module.exports = router;
