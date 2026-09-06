// @ts-nocheck
const meetingService = require('../services/meetingService');

const createMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.createMeeting(
      req.params.groupId,
      req.user.userId,
      req.body
    );
    res.status(201).json({ success: true, data: { meeting } });
  } catch (err) {
    next(err);
  }
};

const getGroupMeetings = async (req, res, next) => {
  try {
    const result = await meetingService.getGroupMeetings(
      req.params.groupId,
      req.query
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.getMeeting(
      req.params.meetingId,
      req.params.groupId
    );
    res.json({ success: true, data: { meeting } });
  } catch (err) {
    next(err);
  }
};

const updateMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.updateMeeting(
      req.params.meetingId,
      req.params.groupId,
      req.body
    );
    res.json({ success: true, data: { meeting } });
  } catch (err) {
    next(err);
  }
};

const cancelMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.cancelMeeting(
      req.params.meetingId,
      req.params.groupId
    );
    res.json({ success: true, data: { meeting } });
  } catch (err) {
    next(err);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const attendee = await meetingService.updateAttendance(
      req.params.meetingId,
      req.user.userId,
      req.body.status
    );
    res.json({ success: true, data: { attendee } });
  } catch (err) {
    next(err);
  }
};

const recordMinutes = async (req, res, next) => {
  try {
    const meeting = await meetingService.recordMinutes(
      req.params.meetingId,
      req.params.groupId,
      req.body.minutes
    );
    res.json({ success: true, data: { meeting } });
  } catch (err) {
    next(err);
  }
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
