// @ts-nocheck
const app = require('./src/app');
const { startRateRefreshJob } = require('./src/jobs/rateRefreshJob');
const { startMeetingReminderJob } = require('./src/jobs/meetingReminderJob');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Stokvel Platform API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start background jobs
  startRateRefreshJob();
  startMeetingReminderJob();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = server;
