// @ts-nocheck
const prisma = require('../config/database');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const {
  NotFoundError,
  BadRequestError,
  ConflictError,
} = require('../errors/AppError');

// ─────────────────────────────────────────
// CREATE MEETING
// ─────────────────────────────────────────
const createMeeting = async (
  groupId,
  createdById,
  { title, date, location, agenda }
) => {
  // Verify the date is in the future
  if (new Date(date) < new Date()) {
    throw new BadRequestError('Meeting date must be in the future');
  }

  const meeting = await prisma.meeting.create({
    data: {
      groupId,
      createdById,
      title,
      date: new Date(date),
      location: location || null,
      agenda: agenda || null,
      status: 'SCHEDULED',
    },
    include: {
      createdBy: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  // Invite all active group members automatically
  const members = await prisma.groupMember.findMany({
    where: { groupId, isActive: true },
  });

  if (members.length > 0) {
    await prisma.meetingAttendee.createMany({
      data: members.map((m) => ({
        meetingId: meeting.id,
        memberId: m.userId,
        status: 'INVITED',
      })),
      skipDuplicates: true,
    });
  }

  return meeting;
};

// ─────────────────────────────────────────
// GET GROUP MEETINGS
// ─────────────────────────────────────────
const getGroupMeetings = async (groupId, query) => {
  const { page, limit, skip } = getPagination(query);
  const { status, upcoming } = query;

  const where = {
    groupId,
    ...(status && { status }),
    // Show only upcoming meetings if requested
    ...(upcoming === 'true' && {
      date: { gte: new Date() },
      status: 'SCHEDULED',
    }),
  };

  const [meetings, total] = await Promise.all([
    prisma.meeting.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        attendees: {
          include: {
            member: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { attendees: true },
        },
      },
      orderBy: { date: 'asc' },
      skip,
      take: limit,
    }),
    prisma.meeting.count({ where }),
  ]);

  return {
    meetings,
    meta: getPaginationMeta(total, page, limit),
  };
};

// ─────────────────────────────────────────
// GET SINGLE MEETING
// ─────────────────────────────────────────
const getMeeting = async (meetingId, groupId) => {
  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, groupId },
    include: {
      createdBy: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
      attendees: {
        include: {
          member: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!meeting) throw new NotFoundError('Meeting not found');
  return meeting;
};

// ─────────────────────────────────────────
// UPDATE MEETING
// ─────────────────────────────────────────
const updateMeeting = async (meetingId, groupId, data) => {
  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, groupId },
  });

  if (!meeting) throw new NotFoundError('Meeting not found');

  if (meeting.status === 'CANCELLED') {
    throw new BadRequestError('Cannot update a cancelled meeting');
  }

  return prisma.meeting.update({
    where: { id: meetingId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.location && { location: data.location }),
      ...(data.agenda && { agenda: data.agenda }),
      ...(data.minutes && { minutes: data.minutes }),
      ...(data.status && { status: data.status }),
    },
  });
};

// ─────────────────────────────────────────
// CANCEL MEETING
// ─────────────────────────────────────────
const cancelMeeting = async (meetingId, groupId) => {
  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, groupId },
  });

  if (!meeting) throw new NotFoundError('Meeting not found');
  if (meeting.status === 'CANCELLED') {
    throw new ConflictError('Meeting already cancelled');
  }

  return prisma.meeting.update({
    where: { id: meetingId },
    data: { status: 'CANCELLED' },
  });
};

// ─────────────────────────────────────────
// UPDATE ATTENDANCE
// Member confirms or declines attendance
// ─────────────────────────────────────────
const updateAttendance = async (meetingId, memberId, status) => {
  const attendee = await prisma.meetingAttendee.findUnique({
    where: {
      meetingId_memberId: { meetingId, memberId },
    },
  });

  if (!attendee) throw new NotFoundError('You are not invited to this meeting');

  return prisma.meetingAttendee.update({
    where: {
      meetingId_memberId: { meetingId, memberId },
    },
    data: { status },
  });
};

// ─────────────────────────────────────────
// RECORD MINUTES
// After meeting — Treasurer/Admin records
// ─────────────────────────────────────────
const recordMinutes = async (meetingId, groupId, minutes) => {
  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, groupId },
  });

  if (!meeting) throw new NotFoundError('Meeting not found');

  return prisma.meeting.update({
    where: { id: meetingId },
    data: {
      minutes,
      status: 'COMPLETED',
    },
  });
};

module.exports = {
  createMeeting,
  getGroupMeetings,
  getMeeting,
  updateMeeting,
  cancelMeeting,
  updateAttendance,
  recordMinutes,
};
