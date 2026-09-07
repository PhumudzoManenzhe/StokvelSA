// @ts-nocheck
const prisma = require('../config/database');

// ─────────────────────────────────────────
// CONTRIBUTION COMPLIANCE REPORT
// Shows each member's payment history
// over a date range
// ─────────────────────────────────────────
const getContributionComplianceReport = async (
  groupId,
  { startPeriod, endPeriod }
) => {
  // Get all active members
  const members = await prisma.groupMember.findMany({
    where: { groupId, isActive: true },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { payoutPosition: 'asc' },
  });

  // Get all contributions in the date range
  const contributions = await prisma.contribution.findMany({
    where: {
      groupId,
      ...(startPeriod &&
        endPeriod && {
          period: { gte: startPeriod, lte: endPeriod },
        }),
    },
    orderBy: { period: 'asc' },
  });

  // Get unique periods
  const periods = [...new Set(contributions.map((c) => c.period))].sort();

  // Build compliance matrix
  const memberCompliance = members.map((member) => {
    const memberContributions = contributions.filter(
      (c) => c.memberId === member.userId
    );

    const confirmed = memberContributions.filter(
      (c) => c.status === 'CONFIRMED'
    ).length;
    const missed = memberContributions.filter(
      (c) => c.status === 'MISSED'
    ).length;
    const pending = memberContributions.filter(
      (c) => c.status === 'PENDING'
    ).length;
    const total = memberContributions.length;

    const totalPaid = memberContributions
      .filter((c) => c.status === 'CONFIRMED')
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    return {
      member: {
        id: member.userId,
        fullName: member.user.fullName,
        email: member.user.email,
        role: member.role,
      },
      stats: {
        confirmed,
        missed,
        pending,
        total,
        totalPaid,
        complianceRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
      },
      // Period-by-period breakdown
      breakdown: periods.map((period) => {
        const contribution = memberContributions.find(
          (c) => c.period === period
        );
        return {
          period,
          status: contribution?.status || 'NOT_GENERATED',
          amount: contribution?.amount || 0,
          paidAt: contribution?.paidAt || null,
        };
      }),
    };
  });

  // Group-level summary
  const totalContributions = contributions.length;
  const totalConfirmed = contributions.filter(
    (c) => c.status === 'CONFIRMED'
  ).length;
  const totalCollected = contributions
    .filter((c) => c.status === 'CONFIRMED')
    .reduce((sum, c) => sum + parseFloat(c.amount), 0);

  return {
    groupId,
    periods,
    memberCompliance,
    summary: {
      totalMembers: members.length,
      periods: periods.length,
      totalCollected,
      overallCompliance:
        totalContributions > 0
          ? Math.round((totalConfirmed / totalContributions) * 100)
          : 0,
    },
  };
};

// ─────────────────────────────────────────
// PAYOUT HISTORY REPORT
// Shows completed payouts + upcoming
// ─────────────────────────────────────────
const getPayoutHistoryReport = async (groupId) => {
  const [completed, upcoming, failed] = await Promise.all([
    prisma.payout.findMany({
      where: { groupId, status: 'COMPLETED' },
      include: {
        recipient: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { processedAt: 'desc' },
    }),
    prisma.payout.findMany({
      where: { groupId, status: { in: ['SCHEDULED', 'PROCESSING'] } },
      include: {
        recipient: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    }),
    prisma.payout.findMany({
      where: { groupId, status: 'FAILED' },
      include: {
        recipient: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    }),
  ]);

  const totalPaidOut = completed.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0
  );

  const totalScheduled = upcoming.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0
  );

  return {
    completed,
    upcoming,
    failed,
    summary: {
      totalCompleted: completed.length,
      totalUpcoming: upcoming.length,
      totalFailed: failed.length,
      totalPaidOut,
      totalScheduled,
    },
  };
};

// ─────────────────────────────────────────
// CUSTOM DASHBOARD REPORT
// Overall group health snapshot
// ─────────────────────────────────────────
const getDashboardReport = async (groupId) => {
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [
    group,
    memberCount,
    currentContributions,
    totalCollectedAll,
    totalPayoutsAll,
    upcomingMeetings,
    unreadNotifications,
    recentContributions,
  ] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: {
        name: true,
        contributionAmount: true,
        contributionFrequency: true,
        createdAt: true,
      },
    }),
    prisma.groupMember.count({ where: { groupId, isActive: true } }),
    prisma.contribution.groupBy({
      by: ['status'],
      where: { groupId, period: currentPeriod },
      _count: { status: true },
      _sum: { amount: true },
    }),
    prisma.contribution.aggregate({
      where: { groupId, status: 'CONFIRMED' },
      _sum: { amount: true },
    }),
    prisma.payout.aggregate({
      where: { groupId, status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.meeting.count({
      where: {
        groupId,
        status: 'SCHEDULED',
        date: { gte: now },
      },
    }),
    prisma.notification.count({
      where: { groupId, read: false },
    }),
    prisma.contribution.findMany({
      where: { groupId },
      include: {
        member: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // Process current period contributions
  const currentStats = {
    confirmed: 0,
    missed: 0,
    pending: 0,
    collected: 0,
  };

  currentContributions.forEach((stat) => {
    if (stat.status === 'CONFIRMED') {
      currentStats.confirmed = stat._count.status;
      currentStats.collected = parseFloat(stat._sum.amount || 0);
    }
    if (stat.status === 'MISSED') currentStats.missed = stat._count.status;
    if (stat.status === 'PENDING') currentStats.pending = stat._count.status;
  });

  return {
    group,
    currentPeriod,
    memberCount,
    currentPeriodStats: currentStats,
    allTime: {
      totalCollected: parseFloat(totalCollectedAll._sum.amount || 0),
      totalPaidOut: parseFloat(totalPayoutsAll._sum.amount || 0),
    },
    upcomingMeetings,
    unreadNotifications,
    recentActivity: recentContributions,
  };
};

module.exports = {
  getContributionComplianceReport,
  getPayoutHistoryReport,
  getDashboardReport,
};
