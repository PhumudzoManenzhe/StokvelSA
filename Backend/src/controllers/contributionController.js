// @ts-nocheck
const contributionService = require('../services/contributionService');

const generateContributions = async (req, res, next) => {
  try {
    const { period, dueDate } = req.body;
    const contributions = await contributionService.generateContributions(
      req.params.groupId,
      period,
      dueDate,
      req.user.userId
    );
    res.status(201).json({
      success: true,
      data: { contributions, count: contributions.length },
    });
  } catch (err) {
    next(err);
  }
};

const getGroupContributions = async (req, res, next) => {
  try {
    const result = await contributionService.getGroupContributions(
      req.params.groupId,
      req.user.userId,
      req.member.role,
      req.query
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const confirmContribution = async (req, res, next) => {
  try {
    const contribution = await contributionService.confirmContribution(
      req.params.contributionId,
      req.user.userId,
      req.body.paymentRef
    );
    res.json({ success: true, data: { contribution } });
  } catch (err) {
    next(err);
  }
};

const flagMissed = async (req, res, next) => {
  try {
    const contribution = await contributionService.flagMissedContribution(
      req.params.contributionId,
      req.body.notes
    );
    res.json({ success: true, data: { contribution } });
  } catch (err) {
    next(err);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const summary = await contributionService.getContributionSummary(
      req.params.groupId,
      req.query.period
    );
    res.json({ success: true, data: { summary } });
  } catch (err) {
    next(err);
  }
};

const getMemberHistory = async (req, res, next) => {
  try {
    const result = await contributionService.getMemberHistory(
      req.params.groupId,
      req.params.memberId,
      req.query
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateContributions,
  getGroupContributions,
  confirmContribution,
  flagMissed,
  getSummary,
  getMemberHistory,
};
