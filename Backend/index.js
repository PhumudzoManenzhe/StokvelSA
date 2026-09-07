// @ts-nocheck
const app = require('./src/app');
const { startRateRefreshJob } = require('./src/jobs/rateRefreshJob');
const { startMeetingReminderJob } = require('./src/jobs/meetingReminderJob');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Stokvel Platform API`);
  console.log(`Port:        ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health:      http://localhost:${PORT}/health`);

  // Only start jobs in production or if explicitly enabled
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.ENABLE_JOBS === 'true'
  ) {
    startRateRefreshJob();
    startMeetingReminderJob();
    console.log('Background jobs started');
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = server;
