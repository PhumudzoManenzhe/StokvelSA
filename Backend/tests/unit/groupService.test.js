// @ts-nocheck
// The caller's role in a group is what the client uses to decide which actions
// to show, so the contract is worth pinning down.
jest.mock('../../src/config/database', () => ({
  group: { findUnique: jest.fn() },
}));

jest.mock('../../src/config/env', () => ({
  frontend: { url: 'http://localhost:5173' },
  email: {},
}));

jest.mock('../../src/config/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

// Reading a group never sends mail. Stubbing the provider keeps this a unit test
// of the service rather than a test of an outbound HTTP call.
jest.mock('../../src/services/emailService', () => ({
  sendGroupInvitation: jest.fn(),
}));

const prisma = require('../../src/config/database');
const { getGroup } = require('../../src/services/groupService');

const group = {
  id: 'group-1',
  name: 'Motho ke Motho Stokvel',
  isActive: true,
  members: [
    { role: 'ADMIN', user: { id: 'user-alice' } },
    { role: 'TREASURER', user: { id: 'user-bob' } },
    { role: 'MEMBER', user: { id: 'user-carol' } },
  ],
};

describe('getGroup', () => {
  beforeEach(() => {
    prisma.group.findUnique.mockReset();
  });

  it('reports the role of the member asking for the group', async () => {
    prisma.group.findUnique.mockResolvedValue(group);

    await expect(getGroup('group-1', 'user-bob')).resolves.toMatchObject({
      myRole: 'TREASURER',
    });
  });

  it('reports an administrator as an administrator', async () => {
    prisma.group.findUnique.mockResolvedValue(group);

    await expect(getGroup('group-1', 'user-alice')).resolves.toMatchObject({
      myRole: 'ADMIN',
    });
  });

  it('reports no role when the user is not a member', async () => {
    prisma.group.findUnique.mockResolvedValue(group);

    await expect(getGroup('group-1', 'user-outsider')).resolves.toMatchObject({
      myRole: null,
    });
  });

  it('still returns the members and counts the client renders', async () => {
    prisma.group.findUnique.mockResolvedValue({
      ...group,
      _count: { contributions: 3, payouts: 1, meetings: 2 },
    });

    const result = await getGroup('group-1', 'user-carol');

    expect(result.members).toHaveLength(3);
    expect(result._count).toEqual({ contributions: 3, payouts: 1, meetings: 2 });
    expect(result.name).toBe('Motho ke Motho Stokvel');
  });

  it('rejects a group that does not exist', async () => {
    prisma.group.findUnique.mockResolvedValue(null);

    await expect(getGroup('missing', 'user-alice')).rejects.toThrow(
      'Group not found',
    );
  });

  it('rejects a group that has been deactivated', async () => {
    prisma.group.findUnique.mockResolvedValue({ ...group, isActive: false });

    await expect(getGroup('group-1', 'user-alice')).rejects.toThrow(
      'Group not found',
    );
  });
});
