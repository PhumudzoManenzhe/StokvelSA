// @ts-nocheck
const cron = require('node-cron');
const rateService = require('../services/rateService');

/**
 * Refreshes SA interest rates daily at 6am
 * SARB updates rates monthly but we check daily
 * to catch any changes immediately
 */
const startRateRefreshJob = () => {
  // Run every day at 06:00 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('🔄 Refreshing SA interest rates from SARB...');
    try {
      const rates = await rateService.getCurrentRates();
      console.log(
        `✅ Rates updated — Prime: ${rates.primeRate}% Repo: ${rates.repoRate}%`
      );
    } catch (err) {
      console.error('❌ Rate refresh failed:', err.message);
    }
  });

  console.log('⏰ Rate refresh job scheduled (daily at 06:00)');
};

module.exports = { startRateRefreshJob };
