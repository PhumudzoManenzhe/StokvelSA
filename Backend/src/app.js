// @ts-nocheck
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const prisma = require('./config/database');
require('./config/env');
require('dotenv').config();

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:3000',
      ].filter(Boolean);

      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
app.get('/health', async (_req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'unknown',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch {
    health.database = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
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
app.use('/groups/:groupId/analytics', require('./routes/analytics'));

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
