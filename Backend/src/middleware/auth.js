// @ts-nocheck
const { supabaseAdmin } = require('../config/supabase');
const prisma = require('../config/database');
const { UnauthorizedError, ForbiddenError } = require('../errors/AppError');

/**
 * Verifies Supabase JWT and attaches user to req.user
 */
const requireAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Get user profile from our DB
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || dbUser.deletedAt) {
      throw new UnauthorizedError('Account not found');
    }

    req.user = {
      userId: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.fullName,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Checks user's role within a specific group
 * Must be used AFTER requireAuth
 * groupId must be in req.params or req.body
 */
const requireGroupRole =
  (...roles) =>
  async (req, _res, next) => {
    try {
      const groupId = req.params.groupId || req.body.groupId;

      if (!groupId) {
        throw new ForbiddenError('Group ID required');
      }

      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: req.user.userId,
          },
        },
      });

      if (!member || !member.isActive) {
        throw new ForbiddenError('Not a member of this group');
      }

      if (!roles.includes(member.role)) {
        throw new ForbiddenError('Insufficient permissions in this group');
      }

      req.member = member;
      next();
    } catch (err) {
      next(err);
    }
  };

/**
 * Checks if user is a member of the group (any role)
 */
const requireGroupMember = async (req, _res, next) => {
  try {
    const groupId = req.params.groupId || req.body.groupId;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: req.user.userId,
        },
      },
    });

    if (!member || !member.isActive) {
      throw new ForbiddenError('Not a member of this group');
    }

    req.member = member;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAuth, requireGroupRole, requireGroupMember };
