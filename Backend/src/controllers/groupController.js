// @ts-nocheck
const groupService = require('../services/groupService');

const createGroup = async (req, res, next) => {
  try {
    const group = await groupService.createGroup({
      ...req.body,
      userId: req.user.userId,
    });
    res.status(201).json({ success: true, data: { group } });
  } catch (err) {
    next(err);
  }
};

const getUserGroups = async (req, res, next) => {
  try {
    const result = await groupService.getUserGroups(req.user.userId, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getGroup = async (req, res, next) => {
  try {
    const group = await groupService.getGroup(
      req.params.groupId,
      req.user.userId
    );
    res.json({ success: true, data: { group } });
  } catch (err) {
    next(err);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const group = await groupService.updateGroup(req.params.groupId, req.body);
    res.json({ success: true, data: { group } });
  } catch (err) {
    next(err);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const result = await groupService.inviteMember({
      groupId: req.params.groupId,
      email: req.body.email,
      role: req.body.role,
      invitedById: req.user.userId,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const acceptInvitation = async (req, res, next) => {
  try {
    const result = await groupService.acceptInvitation(
      req.params.code,
      req.user.userId
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    await groupService.removeMember(
      req.params.groupId,
      req.params.memberId,
      req.user.userId
    );
    res.json({ success: true, data: { message: 'Member removed' } });
  } catch (err) {
    next(err);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const member = await groupService.updateMemberRole(
      req.params.groupId,
      req.params.memberId,
      req.body.role
    );
    res.json({ success: true, data: { member } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroup,
  updateGroup,
  inviteMember,
  acceptInvitation,
  removeMember,
  updateMemberRole,
};
