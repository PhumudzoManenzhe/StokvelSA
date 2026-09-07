// @ts-nocheck
const cron = require('node-cron');
const prisma = require('../config/database');
const notificationService = require('../services/notificationService');

/**
 * Sends meeting reminders 24 hours before each meeting
 * Runs every hour to catch meetings in the next window
 */
const startMeetingReminderJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      // Find meetings happening in exactly ~24 hours
      const upcomingMeetings = await prisma.meeting.findMany({
        where: {
          status: 'SCHEDULED',
          date: {
            gte: in24Hours,
            lte: in25Hours,
          },
        },
        include: {
          group: { select: { name: true } },
        },
      });

      for (const meeting of upcomingMeetings) {
        await notificationService.notifyGroupMembers({
          groupId: meeting.groupId,
          type: 'MEETING_REMINDER',
          message: `Reminder: "${meeting.title}" is tomorrow at ${new Date(meeting.date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`,
          data: {
            meetingId: meeting.id,
            date: meeting.date,
            location: meeting.location,
          },
        });
      }

      if (upcomingMeetings.length > 0) {
        console.log(
          `Sent reminders for ${upcomingMeetings.length} upcoming meeting(s)`
        );
      }
    } catch (err) {
      console.error('Meeting reminder job failed:', err.message);
    }
  });

  console.log('Meeting reminder job scheduled (hourly)');
};

module.exports = { startMeetingReminderJob };
