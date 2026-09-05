// @ts-nocheck
const prisma = require('../config/database');
const { supabaseAdmin } = require('../config/supabase');
const {
  generateInvitationCode,
  getInvitationExpiry,
} = require('../utils/invitations');
const {
  ConflictError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ServiceUnavailableError,
} = require('../errors/AppError');

// ─────────────────────────────────────────
// REGISTER
// Creates Supabase auth user + DB profile
// ─────────────────────────────────────────
const register = async ({ fullName, email, password, phone }) => {
  // Check if profile already exists in our DB
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('Email already registered');

  // Create Supabase auth user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto confirm for now
    user_metadata: { full_name: fullName },
  });

  if (error) {
    const message = error.message || 'Could not create auth user';

    if (message.toLowerCase().includes('already registered')) {
      throw new ConflictError('Email already registered');
    }

    if (error.status >= 500) {
      throw new ServiceUnavailableError(
        `Supabase Auth failed while creating the user: ${message}`
      );
    }

    throw new BadRequestError(message);
  }

  // Create profile in our DB using Supabase user ID
  let user;
  try {
    user = await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        fullName,
        phone: phone || null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id).catch((deleteErr) => {
      console.error('Failed to roll back Supabase auth user:', deleteErr.message);
    });

    throw err;
  }

  return { user };
};

// ─────────────────────────────────────────
// GET PROFILE
// Returns user profile with group summary
// ─────────────────────────────────────────
const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
      groupMembers: {
        where: { isActive: true },
        select: {
          role: true,
          group: {
            select: {
              id: true,
              name: true,
              contributionAmount: true,
              contributionFrequency: true,
            },
          },
        },
      },
    },
  });

  if (!user) throw new NotFoundError('User not found');
  return user;
};

// ─────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────
const updateProfile = async (userId, { fullName, phone }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName && { fullName }),
      ...(phone && { phone }),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      updatedAt: true,
    },
  });

  return user;
};

// ─────────────────────────────────────────
// DELETE ACCOUNT
// Soft delete in our DB + disable in Supabase
// ─────────────────────────────────────────
const deleteAccount = async (userId) => {
  // Disable in Supabase Auth
  await supabaseAdmin.auth.admin.deleteUser(userId);

  // Soft delete in our DB
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
};

module.exports = {
  register,
  getProfile,
  updateProfile,
  deleteAccount,
};
