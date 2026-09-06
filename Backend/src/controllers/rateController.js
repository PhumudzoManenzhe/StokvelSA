// @ts-nocheck
const rateService = require('../services/rateService');

const getRates = async (req, res, next) => {
  try {
    const rates = await rateService.getCurrentRates();
    res.json({ success: true, data: { rates } });
  } catch (err) {
    next(err);
  }
};

const getSavingsProjection = async (req, res, next) => {
  try {
    const { monthlyContribution, months = 12 } = req.query;

    if (!monthlyContribution || isNaN(monthlyContribution)) {
      return res.status(400).json({
        success: false,
        error: 'monthlyContribution is required and must be a number',
      });
    }

    const projection = await rateService.calculateSavingsProjection(
      parseFloat(monthlyContribution),
      parseInt(months)
    );

    res.json({ success: true, data: { projection } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRates, getSavingsProjection };
