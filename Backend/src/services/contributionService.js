// @ts-nocheck
const prisma = require('../config/database');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} = require('../errors/AppError');

// ─────────────────────────────────────────
// GET CURRENT PERIOD
// Returns current month as "YYYY-MM"
// ─────────────────────────────────────────
const getCurrentPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// ─────────────────────────────────────────
// GENERATE CONTRIBUTIONS FOR A PERIOD
// Called by Treasurer/Admin to create
// contribution records for all members
// ─────────────────────────────────────────
const generateContributions = async (
  groupId,
  period,
  dueDate,
  requestingUserId
) => {
  // Get all active members
  const members = await prisma.groupMember.findMany({
    where: { groupId, isActive: true },
    include: { group: true },
  });

  if (members.length === 0) {
    throw new BadRequestError('No active members in this group');
  }

  const group = members[0].group;

  // Check contributions don't already exist for this period
  const existing = await prisma.contribution.findFirst({
    where: { groupId, period },
  });

  if (existing) {
    throw new ConflictError(`Contributions already generated for ${period}`);
  }

  // Create a contribution record for every member
  const contributions = await prisma.$transaction(
    members.map((member) =>
      prisma.contribution.create({
        data: {
          groupId,
          memberId: member.userId,
          amount: group.contributionAmount,
          period,
          status: 'PENDING',
          dueDate: new Date(dueDate),
        },
      })
    )
  );

  return contributions;
};

// ─────────────────────────────────────────
// GET GROUP CONTRIBUTIONS
// Treasurer/Admin sees all contributions
// Member sees only their own
// ─────────────────────────────────────────
const getGroupContributions = async (groupId, userId, memberRole, query) => {
  const { page, limit, skip } = getPagination(query);
  const { period, status, memberId } = query;

  const isPrivileged = ['ADMIN', 'TREASURER'].includes(memberRole);

  const where = {
    groupId,
    ...(period && { period }),
    ...(status && { status }),
    // Members can only see their own contributions
    ...(!isPrivileged && { memberId: userId }),
    // Privileged users can filter by specific member
    ...(isPrivileged && memberId && { memberId }),
  };

  const [contributions, total] = await Promise.all([
    prisma.contribution.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ period: 'desc' }, { member: { fullName: 'asc' } }],
      skip,
      take: limit,
    }),
    prisma.contribution.count({ where }),
  ]);

  return {
    contributions,
    meta: getPaginationMeta(total, page, limit),
  };
};

// ─────────────────────────────────────────
// CONFIRM CONTRIBUTION
// Treasurer marks a contribution as paid
// ─────────────────────────────────────────
const confirmContribution = async (
  contributionId,
  confirmedById,
  paymentRef
) => {
  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
  });

  if (!contribution) throw new NotFoundError('Contribution not found');

  if (contribution.status === 'CONFIRMED') {
    throw new ConflictError('Contribution already confirmed');
  }

  const updated = await prisma.contribution.update({
    where: { id: contributionId },
    data: {
      status: 'CONFIRMED',
      paidAt: new Date(),
      confirmedById,
      paymentRef: paymentRef || null,
    },
    include: {
      member: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return updated;
};

// ─────────────────────────────────────────
// FLAG MISSED CONTRIBUTION
// Treasurer marks a contribution as missed
// ─────────────────────────────────────────
const flagMissedContribution = async (contributionId, notes) => {
  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
  });

  if (!contribution) throw new NotFoundError('Contribution not found');

  if (contribution.status === 'CONFIRMED') {
    throw new BadRequestError('Cannot flag a confirmed contribution as missed');
  }

  return prisma.contribution.update({
    where: { id: contributionId },
    data: {
      status: 'MISSED',
      notes: notes || null,
    },
  });
};

// ─────────────────────────────────────────
// GET CONTRIBUTION SUMMARY
// Dashboard stats for a group
// ─────────────────────────────────────────
const getContributionSummary = async (groupId, period) => {
  const targetPeriod = period || getCurrentPeriod();

  const [total, confirmed, missed, pending] = await Promise.all([
    prisma.contribution.count({ where: { groupId, period: targetPeriod } }),
    prisma.contribution.count({
      where: { groupId, period: targetPeriod, status: 'CONFIRMED' },
    }),
    prisma.contribution.count({
      where: { groupId, period: targetPeriod, status: 'MISSED' },
    }),
    prisma.contribution.count({
      where: { groupId, period: targetPeriod, status: 'PENDING' },
    }),
  ]);

  const totalAmount = await prisma.contribution.aggregate({
    where: { groupId, period: targetPeriod, status: 'CONFIRMED' },
    _sum: { amount: true },
  });

  return {
    period: targetPeriod,
    total,
    confirmed,
    missed,
    pending,
    totalCollected: totalAmount._sum.amount || 0,
    complianceRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
  };
};

// ─────────────────────────────────────────
// GET MEMBER CONTRIBUTION HISTORY
// Shows all contributions for one member
// ─────────────────────────────────────────
const getMemberHistory = async (groupId, memberId, query) => {
  const { page, limit, skip } = getPagination(query);

  const [contributions, total] = await Promise.all([
    prisma.contribution.findMany({
      where: { groupId, memberId },
      orderBy: { period: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contribution.count({ where: { groupId, memberId } }),
  ]);

  const stats = await prisma.contribution.groupBy({
    by: ['status'],
    where: { groupId, memberId },
    _count: { status: true },
  });

  return {
    contributions,
    stats,
    meta: getPaginationMeta(total, page, limit),
  };
};

module.exports = {
  generateContributions,
  getGroupContributions,
  confirmContribution,
  flagMissedContribution,
  getContributionSummary,
  getMemberHistory,
  getCurrentPeriod,
};
