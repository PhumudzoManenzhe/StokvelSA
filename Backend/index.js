// @ts-nocheck
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Stokvel Platform API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = server;
