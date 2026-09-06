// @ts-nocheck
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
require('./config/env');
require('dotenv').config();

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Performance
app.use(compression());

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Stokvel Platform API 🏦' });
});

// ── Routes ───────────────────────────────────────────────
app.use('/auth', require('./routes/auth'));
app.use('/groups', require('./routes/groups'));
app.use('/groups/:groupId/contributions', require('./routes/contributions'));
app.use('/groups/:groupId/payouts', require('./routes/payouts'));
app.use('/groups/:groupId/meetings', require('./routes/meetings'));
app.use('/notifications', require('./routes/notifications'));
app.use('/rates', require('./routes/rates'));

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
