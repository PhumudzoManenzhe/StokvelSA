// @ts-nocheck
const cron = require('node-cron');
const prisma = require('../config/database');
const runMissedContributions = async () => {
  const due = await prisma.contribution.findMany({ where: { status: 'PENDING', dueDate: { lt: new Date() } }, include: { group: { select: { name: true } } } });
  for (const contribution of due) {
    await prisma.$transaction([
      prisma.contribution.update({ where: { id: contribution.id }, data: { status: 'MISSED' } }),
      prisma.notification.create({ data: { userId: contribution.memberId, groupId: contribution.groupId, type: 'CONTRIBUTION_MISSED', message: `Your contribution for ${contribution.period} in ${contribution.group.name} has been marked as missed`, data: { contributionId: contribution.id, period: contribution.period } } }),
    ]);
  }
  console.log(`Contributions marked missed: ${due.length}`);
};
const startMissedContributionJob = () => { cron.schedule('0 0 * * *', () => runMissedContributions().catch((err) => console.error('Missed contribution job failed:', err.message)), { timezone: 'Africa/Johannesburg' }); console.log('Missed contribution job scheduled (daily midnight)'); };
module.exports = { startMissedContributionJob, runMissedContributions };
