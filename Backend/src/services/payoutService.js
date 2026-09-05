// @ts-nocheck
const prisma = require('../config/database');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
} = require('../errors/AppError');

// ─────────────────────────────────────────
// SCHEDULE PAYOUT
// Admin creates a payout record
// ─────────────────────────────────────────
const schedulePayout = async (
  groupId,
  { recipientId, amount, scheduledDate, notes }
) => {
  // Verify recipient is an active member
  const member = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: recipientId },
    },
  });

  if (!member || !member.isActive) {
    throw new BadRequestError(
      'Recipient is not an active member of this group'
    );
  }

  // Check no pending payout exists for this member in same period
  const month = new Date(scheduledDate).toISOString().slice(0, 7);
  const existing = await prisma.payout.findFirst({
    where: {
      groupId,
      recipientId,
      status: { in: ['SCHEDULED', 'PROCESSING'] },
      scheduledDate: {
        gte: new Date(`${month}-01`),
        lte: new Date(`${month}-31`),
      },
    },
  });

  if (existing) {
    throw new ConflictError(
      'A payout is already scheduled for this member this month'
    );
  }

  const payout = await prisma.payout.create({
    data: {
      groupId,
      recipientId,
      amount,
      scheduledDate: new Date(scheduledDate),
      notes: notes || null,
      status: 'SCHEDULED',
    },
    include: {
      recipient: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return payout;
};

// ─────────────────────────────────────────
// GET GROUP PAYOUTS
// ─────────────────────────────────────────
const getGroupPayouts = async (groupId, query) => {
  const { page, limit, skip } = getPagination(query);
  const { status, recipientId } = query;

  const where = {
    groupId,
    ...(status && { status }),
    ...(recipientId && { recipientId }),
  };

  const [payouts, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      include: {
        recipient: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { scheduledDate: 'asc' },
      skip,
      take: limit,
    }),
    prisma.payout.count({ where }),
  ]);

  return {
    payouts,
    meta: getPaginationMeta(total, page, limit),
  };
};

// ─────────────────────────────────────────
// MARK PAYOUT COMPLETED
// Treasurer confirms payout was made
// ─────────────────────────────────────────
const completePayout = async (payoutId, paymentRef) => {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
  });

  if (!payout) throw new NotFoundError('Payout not found');

  if (payout.status === 'COMPLETED') {
    throw new ConflictError('Payout already completed');
  }

  if (payout.status === 'FAILED') {
    throw new BadRequestError('Cannot complete a failed payout');
  }

  return prisma.payout.update({
    where: { id: payoutId },
    data: {
      status: 'COMPLETED',
      processedAt: new Date(),
      paymentRef: paymentRef || null,
    },
    include: {
      recipient: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });
};

// ─────────────────────────────────────────
// MARK PAYOUT FAILED
// ─────────────────────────────────────────
const failPayout = async (payoutId, notes) => {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
  });

  if (!payout) throw new NotFoundError('Payout not found');

  if (['COMPLETED', 'FAILED'].includes(payout.status)) {
    throw new BadRequestError(
      `Payout is already ${payout.status.toLowerCase()}`
    );
  }

  return prisma.payout.update({
    where: { id: payoutId },
    data: {
      status: 'FAILED',
      notes: notes || null,
    },
  });
};

// ─────────────────────────────────────────
// GET PAYOUT SCHEDULE
// Shows upcoming payout rotation
// ─────────────────────────────────────────
const getPayoutSchedule = async (groupId) => {
  const members = await prisma.groupMember.findMany({
    where: { groupId, isActive: true },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { payoutPosition: 'asc' },
  });

  const completedPayouts = await prisma.payout.findMany({
    where: { groupId, status: 'COMPLETED' },
    select: { recipientId: true, scheduledDate: true, amount: true },
    orderBy: { scheduledDate: 'desc' },
  });

  const upcomingPayouts = await prisma.payout.findMany({
    where: { groupId, status: { in: ['SCHEDULED', 'PROCESSING'] } },
    include: {
      recipient: {
        select: { id: true, fullName: true },
      },
    },
    orderBy: { scheduledDate: 'asc' },
  });

  return {
    members: members.map((m) => ({
      ...m.user,
      payoutPosition: m.payoutPosition,
      role: m.role,
    })),
    completedPayouts,
    upcomingPayouts,
  };
};

// ─────────────────────────────────────────
// GET PAYOUT SUMMARY
// Dashboard stats
// ─────────────────────────────────────────
const getPayoutSummary = async (groupId) => {
  const [scheduled, completed, failed, totalPaidOut] = await Promise.all([
    prisma.payout.count({ where: { groupId, status: 'SCHEDULED' } }),
    prisma.payout.count({ where: { groupId, status: 'COMPLETED' } }),
    prisma.payout.count({ where: { groupId, status: 'FAILED' } }),
    prisma.payout.aggregate({
      where: { groupId, status: 'COMPLETED' },
      _sum: { amount: true },
    }),
  ]);

  return {
    scheduled,
    completed,
    failed,
    totalPaidOut: totalPaidOut._sum.amount || 0,
  };
};

module.exports = {
  schedulePayout,
  getGroupPayouts,
  completePayout,
  failPayout,
  getPayoutSchedule,
  getPayoutSummary,
};
