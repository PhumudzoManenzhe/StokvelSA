// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

// Service client — full access (backend only, never expose)
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceKey
);

// Anon client — limited access (for verifying user tokens)
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

module.exports = { supabase, supabaseAdmin };
