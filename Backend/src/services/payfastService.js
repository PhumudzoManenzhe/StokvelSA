// @ts-nocheck
const crypto = require('crypto');

const encode = (value) => encodeURIComponent(String(value).trim()).replace(/%20/g, '+');
const signatureFor = (payload, passphrase) => {
  const values = Object.keys(payload).filter((key) => payload[key] !== undefined && payload[key] !== null && payload[key] !== '' && key !== 'signature').sort().map((key) => `${key}=${encode(payload[key])}`);
  if (passphrase) values.push(`passphrase=${encode(passphrase)}`);
  return crypto.createHash('md5').update(values.join('&')).digest('hex');
};
const generatePaymentUrl = ({ merchantId, merchantKey, passphrase, amount, itemName, returnUrl, cancelUrl, notifyUrl, customStr1, customStr2, customStr3 }) => {
  const payload = { merchant_id: merchantId, merchant_key: merchantKey, return_url: returnUrl, cancel_url: cancelUrl, notify_url: notifyUrl, amount: Number(amount).toFixed(2), item_name: itemName, custom_str1: customStr1, custom_str2: customStr2, custom_str3: customStr3 };
  payload.signature = signatureFor(payload, passphrase);
  const endpoint = process.env.PAYFAST_SANDBOX === 'true' ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
  return `${endpoint}?${Object.keys(payload).map((key) => `${key}=${encode(payload[key])}`).join('&')}`;
};
const verifyPayfastSignature = (payload, passphrase) => {
  if (!payload?.signature) return false;
  const received = Buffer.from(payload.signature);
  const expected = Buffer.from(signatureFor(payload, passphrase));
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
};
module.exports = { generatePaymentUrl, verifyPayfastSignature };
