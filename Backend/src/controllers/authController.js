// @ts-nocheck
const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;
    const { user } = await authService.register({
      fullName,
      email,
      password,
      phone,
    });
    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.userId);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const user = await authService.updateProfile(req.user.userId, {
      fullName,
      phone,
    });
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await authService.deleteAccount(req.user.userId);
    res.json({
      success: true,
      data: { message: 'Account deleted successfully' },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, getProfile, updateProfile, deleteAccount };
