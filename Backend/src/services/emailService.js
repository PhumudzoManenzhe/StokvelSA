// @ts-nocheck
const emailjs = require('@emailjs/nodejs');
const config = require('../config/env');
const logger = require('../config/logger');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]));

const layout = (title, content) => `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#f6f7fb;font-family:Arial,sans-serif;color:#1f2937}.card{max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden}.brand{background:#4F46E5;color:#fff;padding:24px;font-size:24px;font-weight:bold}.body{padding:28px;line-height:1.6}.code{display:inline-block;background:#eef2ff;color:#312e81;font-size:22px;font-weight:bold;letter-spacing:2px;padding:12px 18px;border-radius:8px}.button{display:inline-block;background:#4F46E5;color:#fff!important;text-decoration:none;padding:12px 18px;border-radius:7px}.footer{padding:20px 28px;background:#f9fafb;color:#6b7280;font-size:12px}</style></head><body><div class="card"><div class="brand">StokvelSA</div><div class="body"><h2>${escapeHtml(title)}</h2>${content}</div><div class="footer">© StokvelSA<br>You are receiving this email because of activity on your StokvelSA account. Contact support to manage email preferences.</div></div></body></html>`;

const send = async ({ to, subject, html }) => {
  if (!config.email.apiKey || !config.email.serviceId || !config.email.templateId) {
    logger.warn('Email not sent: EmailJS configuration is incomplete');
    return { skipped: true };
  }
  return emailjs.send(config.email.serviceId, config.email.templateId, {
    to_email: to, from_email: config.email.from, subject, html_content: html,
  }, { publicKey: config.email.apiKey });
};

const sendGroupInvitation = ({ to, groupName, inviterName, code, expiresAt }) => send({ to, subject: `You've been invited to join ${groupName} on StokvelSA`, html: layout('You are invited', `<p>${escapeHtml(inviterName)} invited you to join <strong>${escapeHtml(groupName)}</strong>.</p><p>Your invitation code:</p><p class="code">${escapeHtml(code)}</p><p><a class="button" href="${config.frontend.url}/join?code=${encodeURIComponent(code)}">Join your stokvel</a></p><p>This invitation expires ${escapeHtml(new Date(expiresAt).toLocaleString('en-ZA'))}.</p>`) });
const sendContributionReminder = ({ to, memberName, groupName, amount, dueDate }) => send({ to, subject: `Reminder: Your contribution to ${groupName} is due`, html: layout('Contribution reminder', `<p>Hello ${escapeHtml(memberName)},</p><p>Your contribution of <strong>R${escapeHtml(amount)}</strong> to <strong>${escapeHtml(groupName)}</strong> is due on ${escapeHtml(new Date(dueDate).toLocaleDateString('en-ZA'))}.</p>`) });
const sendPayoutNotification = ({ to, memberName, groupName, amount, date }) => send({ to, subject: `Great news! Your payout from ${groupName} is scheduled`, html: layout('Your payout is scheduled', `<p>Hello ${escapeHtml(memberName)},</p><p>Your payout of <strong>R${escapeHtml(amount)}</strong> from <strong>${escapeHtml(groupName)}</strong> is scheduled for ${escapeHtml(new Date(date).toLocaleDateString('en-ZA'))}.</p>`) });
const sendMeetingReminder = ({ to, memberName, groupName, meetingTitle, date, location }) => send({ to, subject: `Reminder: ${meetingTitle} is tomorrow`, html: layout('Meeting reminder', `<p>Hello ${escapeHtml(memberName)},</p><p><strong>${escapeHtml(groupName)}</strong>: ${escapeHtml(meetingTitle)} is on ${escapeHtml(new Date(date).toLocaleString('en-ZA'))}${location ? ` at ${escapeHtml(location)}` : ''}.</p>`) });
const sendWelcomeEmail = ({ to, memberName }) => send({ to, subject: 'Welcome to StokvelSA', html: layout('Welcome to StokvelSA', `<p>Hello ${escapeHtml(memberName)},</p><p>Welcome! You can now manage contributions, payouts, and meetings with your stokvel.</p>`) });

module.exports = { sendGroupInvitation, sendContributionReminder, sendPayoutNotification, sendMeetingReminder, sendWelcomeEmail };
