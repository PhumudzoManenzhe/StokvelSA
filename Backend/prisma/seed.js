// @ts-nocheck
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.meetingAttendee.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.interestRate.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  // NOTE: passwords are managed by Supabase Auth
  // These are just profile records in our DB
  const alice = await prisma.user.create({
    data: {
      id: 'test-user-alice-001',
      email: 'alice@stokvel.com',
      fullName: 'Alice Dlamini',
      phone: '+27821234567',
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: 'test-user-bob-002',
      email: 'bob@stokvel.com',
      fullName: 'Bob Nkosi',
      phone: '+27831234567',
    },
  });

  const carol = await prisma.user.create({
    data: {
      id: 'test-user-carol-003',
      email: 'carol@stokvel.com',
      fullName: 'Carol Mokoena',
      phone: '+27841234567',
    },
  });

  console.log('Users created');

  // Create a stokvel group
  const group = await prisma.group.create({
    data: {
      name: 'Motho ke Motho Stokvel',
      description: 'Monthly savings group for community members',
      contributionAmount: 500.0,
      contributionFrequency: 'MONTHLY',
      payoutOrder: 'FIXED',
      maxMembers: 10,
      createdById: alice.id,
    },
  });

  console.log('Group created');

  // Add members to group
  await prisma.groupMember.createMany({
    data: [
      {
        groupId: group.id,
        userId: alice.id,
        role: 'ADMIN',
        payoutPosition: 1,
      },
      {
        groupId: group.id,
        userId: bob.id,
        role: 'TREASURER',
        payoutPosition: 2,
      },
      {
        groupId: group.id,
        userId: carol.id,
        role: 'MEMBER',
        payoutPosition: 3,
      },
    ],
  });

  console.log('Members added');

  // Create some contributions
  const currentPeriod = '2026-08';

  await prisma.contribution.createMany({
    data: [
      {
        groupId: group.id,
        memberId: alice.id,
        amount: 500.0,
        period: currentPeriod,
        status: 'CONFIRMED',
        dueDate: new Date('2026-08-01'),
        paidAt: new Date('2026-08-01'),
      },
      {
        groupId: group.id,
        memberId: bob.id,
        amount: 500.0,
        period: currentPeriod,
        status: 'CONFIRMED',
        dueDate: new Date('2026-08-01'),
        paidAt: new Date('2026-08-03'),
      },
      {
        groupId: group.id,
        memberId: carol.id,
        amount: 500.0,
        period: currentPeriod,
        status: 'PENDING',
        dueDate: new Date('2026-08-01'),
      },
    ],
  });

  console.log('Contributions created');

  // Create a payout
  await prisma.payout.create({
    data: {
      groupId: group.id,
      recipientId: alice.id,
      amount: 1500.0,
      scheduledDate: new Date('2026-08-31'),
      status: 'SCHEDULED',
    },
  });

  console.log('Payout created');

  // Create a meeting
  const meeting = await prisma.meeting.create({
    data: {
      groupId: group.id,
      title: 'August Monthly Meeting',
      date: new Date('2026-08-25T18:00:00'),
      location: '123 Main Street, Soweto',
      agenda: 'Review contributions, discuss payout schedule',
      status: 'SCHEDULED',
      createdById: alice.id,
    },
  });

  // Add attendees
  await prisma.meetingAttendee.createMany({
    data: [
      { meetingId: meeting.id, memberId: alice.id, status: 'CONFIRMED' },
      { meetingId: meeting.id, memberId: bob.id, status: 'INVITED' },
      { meetingId: meeting.id, memberId: carol.id, status: 'INVITED' },
    ],
  });

  console.log('Meeting created');

  // Seed interest rates
  await prisma.interestRate.create({
    data: {
      primeRate: 11.75,
      repoRate: 8.25,
    },
  });

  console.log('Interest rates seeded');

  console.log('\n Seed complete!');
  console.log('\n Test accounts:');
  console.log('   alice@stokvel.com (Admin)');
  console.log('   bob@stokvel.com   (Treasurer)');
  console.log('   carol@stokvel.com (Member)');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
