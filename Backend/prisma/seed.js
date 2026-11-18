// @ts-nocheck
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Every request is authenticated by verifying a Supabase access token and then
// looking the profile up by the token's subject. A profile therefore only works
// if its id is the Supabase user id, which is why the demo people have to exist
// in Supabase Auth and not merely in this database.
const DEMO_PASSWORD = process.env.SEED_PASSWORD || 'Stokvel2026!';

const supabaseReady = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
);

// Creates the auth identity if it is missing, and reuses it if a previous run
// already made one, so seeding twice does not leave orphaned profiles behind.
const ensureAuthUser = async (supabaseAdmin, { email, fullName }) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (!error) return data.user;

  const message = (error.message || '').toLowerCase();
  if (message.includes('already')) {
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    const match = (existing?.users || []).find(
      (user) => (user.email || '').toLowerCase() === email.toLowerCase()
    );

    if (match) return match;
  }

  throw error;
};

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
  // Passwords are managed by Supabase Auth; these rows are the profiles that the
  // API attaches to the verified token.
  let supabaseAdmin = null;
  if (supabaseReady) {
    ({ supabaseAdmin } = require('../src/config/supabase'));
  } else {
    console.warn(
      '\n  SUPABASE_URL and SUPABASE_SERVICE_KEY are not set, so no auth identities\n' +
        '  can be created. The demo profiles below will exist in the database only\n' +
        '  and will NOT be able to sign in. Set both and re-run to fix that.\n'
    );
  }

  const demoPeople = [
    {
      key: 'alice',
      placeholderId: 'test-user-alice-001',
      email: 'alice@stokvel.com',
      fullName: 'Alice Dlamini',
      phone: '+27821234567',
    },
    {
      key: 'bob',
      placeholderId: 'test-user-bob-002',
      email: 'bob@stokvel.com',
      fullName: 'Bob Nkosi',
      phone: '+27831234567',
    },
    {
      key: 'carol',
      placeholderId: 'test-user-carol-003',
      email: 'carol@stokvel.com',
      fullName: 'Carol Mokoena',
      phone: '+27841234567',
    },
  ];

  const people = {};

  for (const person of demoPeople) {
    const authUser = supabaseAdmin
      ? await ensureAuthUser(supabaseAdmin, person)
      : null;

    people[person.key] = await prisma.user.create({
      data: {
        id: authUser ? authUser.id : person.placeholderId,
        email: person.email,
        fullName: person.fullName,
        phone: person.phone,
      },
    });
  }

  const { alice, bob, carol } = people;

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

  console.log('\nSeed complete!');

  if (supabaseReady) {
    console.log(`\nDemo accounts, all with the password: ${DEMO_PASSWORD}`);
    console.log('   alice@stokvel.com  (Admin)');
    console.log('   bob@stokvel.com    (Treasurer)');
    console.log('   carol@stokvel.com  (Member)');
    console.log('\nSet SEED_PASSWORD before re-running to choose a different one.');
  } else {
    console.log('\nThe demo profiles have no auth identities, so nobody can sign in');
    console.log('yet. Set SUPABASE_URL and SUPABASE_SERVICE_KEY and run this again.');
  }
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
