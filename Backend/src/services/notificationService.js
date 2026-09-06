// @ts-nocheck
const prisma = require('../config/database');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

// ─────────────────────────────────────────
// CREATE NOTIFICATION
// Internal helper — called by other services
// ─────────────────────────────────────────
const createNotification = async ({ userId, groupId, type, message, data }) => {
  return prisma.notification.create({
    data: {
      userId,
      groupId: groupId || null,
      type,
      message,
      data: data || null,
    },
  });
};

// ─────────────────────────────────────────
// NOTIFY GROUP MEMBERS
// Send same notification to multiple members
// ─────────────────────────────────────────
const notifyGroupMembers = async ({
  groupId,
  type,
  message,
  data,
  excludeUserId,
}) => {
  const members = await prisma.groupMember.findMany({
    where: {
      groupId,
      isActive: true,
      ...(excludeUserId && { userId: { not: excludeUserId } }),
    },
    select: { userId: true },
  });

  if (members.length === 0) return;

  await prisma.notification.createMany({
    data: members.map((m) => ({
      userId: m.userId,
      groupId,
      type,
      message,
      data: data || null,
    })),
  });
};

// ─────────────────────────────────────────
// GET USER NOTIFICATIONS
// ─────────────────────────────────────────
const getUserNotifications = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const { read, groupId } = query;

  const where = {
    userId,
    ...(read !== undefined && { read: read === 'true' }),
    ...(groupId && { groupId }),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    meta: getPaginationMeta(total, page, limit),
  };
};

// ─────────────────────────────────────────
// MARK AS READ
// ─────────────────────────────────────────
const markAsRead = async (notificationId, userId) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
};

// ─────────────────────────────────────────
// MARK ALL AS READ
// ─────────────────────────────────────────
const markAllAsRead = async (userId, groupId) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
      ...(groupId && { groupId }),
    },
    data: { read: true },
  });
};

// ─────────────────────────────────────────
// DELETE NOTIFICATION
// ─────────────────────────────────────────
const deleteNotification = async (notificationId, userId) => {
  return prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
};

module.exports = {
  createNotification,
  notifyGroupMembers,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
