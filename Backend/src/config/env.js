// @ts-nocheck
require('dotenv').config();
const logger = require('./logger');

// Supabase is the only identity provider: access tokens are verified against it
// and passwords are changed through it, so both Supabase keys are required. No
// JWT is signed or verified locally, which is why JWT_SECRET and REFRESH_SECRET
// are no longer checked here.
const required = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  logger.error('Missing required environment variables', { missing });
  process.exit(1);
}

module.exports = {
  app: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    isProd: process.env.NODE_ENV === 'production',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  email: {
    apiKey: process.env.EmailJs_API_KEY,
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    from: process.env.EMAIL_FROM || 'noreply@stokvelplatform.co.za',
  },
  payfast: {
    merchantId: process.env.PAYFAST_MERCHANT_ID,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY,
    passphrase: process.env.PAYFAST_PASSPHRASE,
    sandbox: process.env.PAYFAST_SANDBOX === 'true',
  },
  sarb: {
    apiUrl: process.env.SARB_API_URL,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};
