// @ts-nocheck
const cron = require('node-cron');
const prisma = require('../config/database');
const { sendContributionReminder } = require('../services/emailService');

const runContributionReminders = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const deadline = new Date(); deadline.setDate(deadline.getDate() + 3);
  const contributions = await prisma.contribution.findMany({ where: { status: 'PENDING', dueDate: { lte: deadline } }, include: { member: { select: { email: true, fullName: true } }, group: { select: { name: true } } } });
  let sent = 0;
  for (const contribution of contributions) {
    const marker = `[reminder:${today}]`;
    if (contribution.notes?.includes(marker)) continue;
    try {
      await sendContributionReminder({ to: contribution.member.email, memberName: contribution.member.fullName, groupName: contribution.group.name, amount: contribution.amount, dueDate: contribution.dueDate });
      await prisma.contribution.update({ where: { id: contribution.id }, data: { notes: `${contribution.notes || ''}${contribution.notes ? ' ' : ''}${marker}` } });
      sent += 1;
    } catch (err) { console.error('Contribution reminder failed:', err.message); }
  }
  console.log(`Contribution reminders sent: ${sent}`);
};
const startContributionReminderJob = () => { cron.schedule('0 9 * * *', () => runContributionReminders().catch((err) => console.error('Contribution reminder job failed:', err.message)), { timezone: 'Africa/Johannesburg' }); console.log('Contribution reminder job scheduled (daily 09:00)'); };
module.exports = { startContributionReminderJob, runContributionReminders };
