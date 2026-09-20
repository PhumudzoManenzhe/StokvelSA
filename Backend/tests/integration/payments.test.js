// @ts-nocheck
const crypto = require('crypto');

jest.mock('../../src/config/database', () => ({ contribution: { findUnique: jest.fn(), update: jest.fn() }, notification: { create: jest.fn() }, $transaction: jest.fn() }));
jest.mock('../../src/config/env', () => ({ payfast: { passphrase: 'test-passphrase' } }));
jest.mock('../../src/config/logger', () => ({ error: jest.fn() }));

const prisma = require('../../src/config/database');
const { generatePaymentUrl, verifyPayfastSignature } = require('../../src/services/payfastService');
const { notify } = require('../../src/controllers/paymentController');

const sign = (payload, passphrase) => crypto.createHash('md5').update(Object.keys(payload).filter((key) => key !== 'signature').sort().map((key) => `${key}=${encodeURIComponent(String(payload[key])).replace(/%20/g, '+')}`).concat(`passphrase=${passphrase}`).join('&')).digest('hex');

describe('PayFast payment integrity', () => {
  it('generates a sandbox URL with amount, metadata, and MD5 signature', () => {
    process.env.PAYFAST_SANDBOX = 'true';
    const url = generatePaymentUrl({ merchantId: '10000100', merchantKey: 'abc', passphrase: 'secret', amount: 250, itemName: 'Savings contribution', returnUrl: 'https://app.test/return', cancelUrl: 'https://app.test/cancel', notifyUrl: 'https://api.test/notify', customStr1: 'group-1', customStr2: 'member-1', customStr3: '2026-09' });
    expect(url).toContain('https://sandbox.payfast.co.za/eng/process?');
    expect(url).toContain('amount=250.00');
    expect(url).toContain('custom_str1=group-1');
    expect(new URL(url).searchParams.get('signature')).toMatch(/^[a-f0-9]{32}$/);
  });

  it('accepts an untampered ITN signature and rejects a modified payload', () => {
    const payload = { payment_status: 'COMPLETE', custom_str1: 'group-1', custom_str2: 'member-1', custom_str3: '2026-09', pf_payment_id: '123' };
    payload.signature = sign(payload, 'test-passphrase');
    expect(verifyPayfastSignature(payload, 'test-passphrase')).toBe(true);
    expect(verifyPayfastSignature({ ...payload, payment_status: 'FAILED' }, 'test-passphrase')).toBe(false);
  });

  it('confirms a valid COMPLETE ITN exactly once and acknowledges PayFast', async () => {
    const payload = { payment_status: 'COMPLETE', custom_str1: 'group-1', custom_str2: 'member-1', custom_str3: '2026-09', pf_payment_id: '123' };
    payload.signature = sign(payload, 'test-passphrase');
    prisma.contribution.findUnique.mockResolvedValue({ id: 'contribution-1', group: { name: 'Sunday Savers' }, status: 'PENDING' });
    prisma.contribution.update.mockReturnValue({ action: 'update' });
    prisma.notification.create.mockReturnValue({ action: 'notification' });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await notify({ body: payload }, res);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { received: true } });
  });
});
