// @ts-nocheck
const prisma = require('../config/database');
const {
  generateInvitationCode,
  getInvitationExpiry,
} = require('../utils/invitations');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} = require('../errors/AppError');

// ─────────────────────────────────────────
// CREATE GROUP
// ─────────────────────────────────────────
const createGroup = async ({
  name,
  description,
  contributionAmount,
  contributionFrequency,
  payoutOrder,
  maxMembers,
  userId,
}) => {
  // Create group and add creator as ADMIN in one transaction
  const result = await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name,
        description,
        contributionAmount,
        contributionFrequency: contributionFrequency || 'MONTHLY',
        payoutOrder: payoutOrder || 'FIXED',
        maxMembers: maxMembers || 20,
        createdById: userId,
      },
    });

    // Creator automatically becomes ADMIN
    await tx.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'ADMIN',
        payoutPosition: 1,
      },
    });

    return group;
  });

  return result;
};

// ─────────────────────────────────────────
// GET USER'S GROUPS
// ─────────────────────────────────────────
const getUserGroups = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);

  const where = {
    members: {
      some: {
        userId,
        isActive: true,
      },
    },
    isActive: true,
  };

  const [groups, total] = await Promise.all([
    prisma.group.findMany({
      where,
      include: {
        _count: {
          select: {
            members: true,
            contributions: true,
          },
        },
        members: {
          where: { userId, isActive: true },
          select: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.group.count({ where }),
  ]);

  // Flatten member role into group object
  const formatted = groups.map((g) => ({
    ...g,
    myRole: g.members[0]?.role || null,
    members: undefined,
  }));

  return {
    groups: formatted,
    meta: getPaginationMeta(total, page, limit),
  };
};

// ─────────────────────────────────────────
// GET SINGLE GROUP
// ─────────────────────────────────────────
const getGroup = async (groupId, userId) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      createdBy: {
        select: { id: true, fullName: true, email: true },
      },
      members: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              phone: true,
            },
          },
        },
        orderBy: { payoutPosition: 'asc' },
      },
      _count: {
        select: {
          contributions: true,
          payouts: true,
          meetings: true,
        },
      },
    },
  });

  if (!group || !group.isActive) {
    throw new NotFoundError('Group not found');
  }

  return group;
};

// ─────────────────────────────────────────
// UPDATE GROUP
// Only ADMIN can update
// ─────────────────────────────────────────
const updateGroup = async (groupId, data) => {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw new NotFoundError('Group not found');

  const updated = await prisma.group.update({
    where: { id: groupId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.contributionAmount && {
        contributionAmount: data.contributionAmount,
      }),
      ...(data.contributionFrequency && {
        contributionFrequency: data.contributionFrequency,
      }),
      ...(data.payoutOrder && { payoutOrder: data.payoutOrder }),
      ...(data.maxMembers && { maxMembers: data.maxMembers }),
    },
  });

  return updated;
};

// ─────────────────────────────────────────
// INVITE MEMBER
// Generate invitation code and send email
// ─────────────────────────────────────────
const inviteMember = async ({ groupId, email, role, invitedById }) => {
  // Check group exists and has space
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { _count: { select: { members: { where: { isActive: true } } } } },
  });

  if (!group) throw new NotFoundError('Group not found');

  const memberCount = group._count.members;
  if (memberCount >= group.maxMembers) {
    throw new BadRequestError('Group is full');
  }

  // Check if already a member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: existingUser.id },
      },
    });
    if (existingMember?.isActive) {
      throw new ConflictError('User is already a member of this group');
    }
  }

  // Check for pending invitation
  const pendingInvite = await prisma.invitation.findFirst({
    where: { groupId, email, status: 'PENDING' },
  });
  if (pendingInvite) {
    throw new ConflictError('Invitation already sent to this email');
  }

  // Generate invitation
  const code = generateInvitationCode();

  const invitation = await prisma.invitation.create({
    data: {
      groupId,
      email,
      role: role || 'MEMBER',
      code,
      invitedById,
      expiresAt: getInvitationExpiry(7),
    },
  });

  // TODO: send invitation email
  // await emailService.sendGroupInvitation({ email, group, code })

  return { invitation, code };
};

// ─────────────────────────────────────────
// ACCEPT INVITATION
// ─────────────────────────────────────────
const acceptInvitation = async (code, userId) => {
  const invitation = await prisma.invitation.findUnique({
    where: { code },
    include: { group: true },
  });

  if (!invitation) throw new NotFoundError('Invalid invitation code');
  if (invitation.status !== 'PENDING')
    throw new BadRequestError('Invitation already used or expired');
  if (invitation.expiresAt < new Date())
    throw new BadRequestError('Invitation has expired');

  // Get user's email to verify invitation
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (invitation.email !== user.email) {
    throw new ForbiddenError(
      'This invitation was sent to a different email address'
    );
  }

  // Check group still has space
  const memberCount = await prisma.groupMember.count({
    where: { groupId: invitation.groupId, isActive: true },
  });

  if (memberCount >= invitation.group.maxMembers) {
    throw new BadRequestError('Group is now full');
  }

  // Add member and mark invitation used in transaction
  await prisma.$transaction(async (tx) => {
    // Get next payout position
    const lastMember = await tx.groupMember.findFirst({
      where: { groupId: invitation.groupId },
      orderBy: { payoutPosition: 'desc' },
    });

    await tx.groupMember.create({
      data: {
        groupId: invitation.groupId,
        userId,
        role: invitation.role,
        payoutPosition: (lastMember?.payoutPosition || 0) + 1,
      },
    });

    await tx.invitation.update({
      where: { code },
      data: { status: 'ACCEPTED', usedById: userId },
    });
  });

  return { group: invitation.group };
};

// ─────────────────────────────────────────
// REMOVE MEMBER
// Admin only
// ─────────────────────────────────────────
const removeMember = async (groupId, memberId, requestingUserId) => {
  // Can't remove yourself if you're the only admin
  if (memberId === requestingUserId) {
    const adminCount = await prisma.groupMember.count({
      where: { groupId, role: 'ADMIN', isActive: true },
    });
    if (adminCount <= 1) {
      throw new BadRequestError(
        'Cannot leave — you are the only admin. Transfer admin role first.'
      );
    }
  }

  await prisma.groupMember.update({
    where: {
      groupId_userId: { groupId, userId: memberId },
    },
    data: {
      isActive: false,
      leftAt: new Date(),
    },
  });
};

// ─────────────────────────────────────────
// UPDATE MEMBER ROLE
// Admin only
// ─────────────────────────────────────────
const updateMemberRole = async (groupId, memberId, newRole) => {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: memberId } },
  });

  if (!member || !member.isActive) {
    throw new NotFoundError('Member not found in this group');
  }

  return prisma.groupMember.update({
    where: { groupId_userId: { groupId, userId: memberId } },
    data: { role: newRole },
  });
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
