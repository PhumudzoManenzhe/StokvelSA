// @ts-nocheck
const analyticsService = require('../services/analyticsService');
const exportService = require('../services/exportService');
const prisma = require('../config/database');

const getDashboard = async (req, res, next) => {
  try {
    const report = await analyticsService.getDashboardReport(
      req.params.groupId
    );
    res.json({ success: true, data: { report } });
  } catch (err) {
    next(err);
  }
};

const getComplianceReport = async (req, res, next) => {
  try {
    const { startPeriod, endPeriod } = req.query;
    const report = await analyticsService.getContributionComplianceReport(
      req.params.groupId,
      { startPeriod, endPeriod }
    );
    res.json({ success: true, data: { report } });
  } catch (err) {
    next(err);
  }
};

const getPayoutReport = async (req, res, next) => {
  try {
    const report = await analyticsService.getPayoutHistoryReport(
      req.params.groupId
    );
    res.json({ success: true, data: { report } });
  } catch (err) {
    next(err);
  }
};

// ── Export endpoints ─────────────────────────────────────

const exportComplianceCSV = async (req, res, next) => {
  try {
    const { startPeriod, endPeriod } = req.query;
    const report = await analyticsService.getContributionComplianceReport(
      req.params.groupId,
      { startPeriod, endPeriod }
    );

    const csv = exportService.buildComplianceCSV(report);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="compliance-${req.params.groupId}-${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

const exportPayoutCSV = async (req, res, next) => {
  try {
    const report = await analyticsService.getPayoutHistoryReport(
      req.params.groupId
    );
    const csv = exportService.buildPayoutCSV(report);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="payouts-${req.params.groupId}-${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

const exportCompliancePDF = async (req, res, next) => {
  try {
    const { startPeriod, endPeriod } = req.query;

    const [report, group] = await Promise.all([
      analyticsService.getContributionComplianceReport(req.params.groupId, {
        startPeriod,
        endPeriod,
      }),
      prisma.group.findUnique({
        where: { id: req.params.groupId },
        select: { name: true },
      }),
    ]);

    const pdf = await exportService.buildCompliancePDF(report, group.name);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="compliance-${req.params.groupId}-${Date.now()}.pdf"`
    );
    res.send(pdf);
  } catch (err) {
    next(err);
  }
};

const exportPayoutPDF = async (req, res, next) => {
  try {
    const [report, group] = await Promise.all([
      analyticsService.getPayoutHistoryReport(req.params.groupId),
      prisma.group.findUnique({
        where: { id: req.params.groupId },
        select: { name: true },
      }),
    ]);

    const pdf = await exportService.buildPayoutPDF(report, group.name);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="payouts-${req.params.groupId}-${Date.now()}.pdf"`
    );
    res.send(pdf);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getComplianceReport,
  getPayoutReport,
  exportComplianceCSV,
  exportPayoutCSV,
  exportCompliancePDF,
  exportPayoutPDF,
};
