// @ts-nocheck
require('dotenv').config();

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach((key) => console.error(`   - ${key}`));
  process.exit(1);
}

module.exports = {
  app: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    isProd: process.env.NODE_ENV === 'production',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: process.env.JWT_EXPIRY || '15m',
    refreshSecret: process.env.REFRESH_SECRET,
    refreshExpiry: process.env.REFRESH_EXPIRY || '30d',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  email: {
    apiKey: process.env.RESEND_API_KEY,
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
