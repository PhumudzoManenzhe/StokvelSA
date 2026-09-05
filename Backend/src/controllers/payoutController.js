// @ts-nocheck
const payoutService = require('../services/payoutService');

const schedulePayout = async (req, res, next) => {
  try {
    const payout = await payoutService.schedulePayout(
      req.params.groupId,
      req.body
    );
    res.status(201).json({ success: true, data: { payout } });
  } catch (err) {
    next(err);
  }
};

const getGroupPayouts = async (req, res, next) => {
  try {
    const result = await payoutService.getGroupPayouts(
      req.params.groupId,
      req.query
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const completePayout = async (req, res, next) => {
  try {
    const payout = await payoutService.completePayout(
      req.params.payoutId,
      req.body.paymentRef
    );
    res.json({ success: true, data: { payout } });
  } catch (err) {
    next(err);
  }
};

const failPayout = async (req, res, next) => {
  try {
    const payout = await payoutService.failPayout(
      req.params.payoutId,
      req.body.notes
    );
    res.json({ success: true, data: { payout } });
  } catch (err) {
    next(err);
  }
};

const getPayoutSchedule = async (req, res, next) => {
  try {
    const schedule = await payoutService.getPayoutSchedule(req.params.groupId);
    res.json({ success: true, data: { schedule } });
  } catch (err) {
    next(err);
  }
};

const getPayoutSummary = async (req, res, next) => {
  try {
    const summary = await payoutService.getPayoutSummary(req.params.groupId);
    res.json({ success: true, data: { summary } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  schedulePayout,
  getGroupPayouts,
  completePayout,
  failPayout,
  getPayoutSchedule,
  getPayoutSummary,
};
