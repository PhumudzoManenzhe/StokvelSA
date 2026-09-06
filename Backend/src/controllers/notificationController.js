// @ts-nocheck
const notificationService = require('../services/notificationService');

const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getUserNotifications(
      req.user.userId,
      req.query
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(
      req.params.notificationId,
      req.user.userId
    );
    res.json({ success: true, data: { message: 'Marked as read' } });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.userId, req.query.groupId);
    res.json({
      success: true,
      data: { message: 'All notifications marked as read' },
    });
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(
      req.params.notificationId,
      req.user.userId
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
