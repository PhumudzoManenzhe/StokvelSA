// @ts-nocheck
const prisma = require('../config/database');
const config = require('../config/env');
const { generatePaymentUrl, verifyPayfastSignature } = require('../services/payfastService');
const { BadRequestError } = require('../errors/AppError');
const logger = require('../config/logger');

const initiate = async (req, res, next) => {
  try {
    const { groupId, period } = req.body;
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group || !group.isActive) throw new BadRequestError('Group is not available');
    const dueDate = new Date(`${period}-28T23:59:59.999Z`);
    const contribution = await prisma.contribution.upsert({
      where: { groupId_memberId_period: { groupId, memberId: req.user.userId, period } },
      update: {},
      create: { groupId, memberId: req.user.userId, period, amount: group.contributionAmount, dueDate },
    });
    if (contribution.status === 'CONFIRMED') throw new BadRequestError('This contribution has already been paid');
    const paymentUrl = generatePaymentUrl({ merchantId: config.payfast.merchantId, merchantKey: config.payfast.merchantKey, passphrase: config.payfast.passphrase, amount: contribution.amount, itemName: `${group.name} contribution (${period})`, returnUrl: `${config.frontend.url}/payments/return`, cancelUrl: `${config.frontend.url}/payments/cancel`, notifyUrl: `${req.protocol}://${req.get('host')}/payments/notify`, customStr1: groupId, customStr2: req.user.userId, customStr3: period });
    res.json({ success: true, data: { paymentUrl } });
  } catch (err) { next(err); }
};

const notify = async (req, res) => {
  try {
    if (!verifyPayfastSignature(req.body, config.payfast.passphrase)) return res.status(200).json({ success: false, error: 'Invalid signature' });
    if (req.body.payment_status === 'COMPLETE') {
      const groupId = req.body.custom_str1 || req.body.customStr1;
      const memberId = req.body.custom_str2 || req.body.customStr2;
      const period = req.body.custom_str3 || req.body.customStr3;
      const contribution = await prisma.contribution.findUnique({ where: { groupId_memberId_period: { groupId, memberId, period } }, include: { group: { select: { name: true } } } });
      if (contribution && contribution.status !== 'CONFIRMED') {
        await prisma.$transaction([
          prisma.contribution.update({ where: { id: contribution.id }, data: { status: 'CONFIRMED', paidAt: new Date(), paymentRef: String(req.body.pf_payment_id || '') } }),
          prisma.notification.create({ data: { userId: memberId, groupId, type: 'CONTRIBUTION_CONFIRMED', message: `Your contribution for ${period} in ${contribution.group.name} has been confirmed`, data: { contributionId: contribution.id, paymentRef: req.body.pf_payment_id } } }),
        ]);
      }
    }
  } catch (err) { logger.error('PayFast ITN processing failed', { error: err.message }); }
  return res.status(200).json({ success: true, data: { received: true } });
};
const paymentReturn = (_req, res) => res.status(200).json({ success: true, data: { message: 'Payment return received' } });
module.exports = { initiate, notify, paymentReturn };
