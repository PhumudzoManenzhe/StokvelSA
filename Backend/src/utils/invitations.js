// @ts-nocheck
const crypto = require('crypto');

const generateInvitationCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

const getInvitationExpiry = (days = 7) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};

module.exports = { generateInvitationCode, getInvitationExpiry };
