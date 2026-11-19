// @ts-nocheck
//
// Additive demo data for screenshots and demos.
//
// Unlike prisma/seed.js, this script never deletes a row it did not create: it
// skips any email that already exists, and when it finds the demo group it
// rebuilds only that group's own activity (contributions, payouts, meetings,
// notifications). That makes it safe to run against a database which already
// holds real accounts — which is exactly why the original seed is not used for
// this: it begins with deleteMany() across users and groups.
//
// Safe to run repeatedly. Each demo person needs a Supabase Auth identity, not
// just a profile row, because the API authenticates a token and then looks the
// profile up by the token's subject.
//
//   npm run db:seed:demo

require('dotenv').config();
const prisma = require('../src/config/database');

const DEMO_PASSWORD = process.env.SEED_PASSWORD || 'Stokvel2026!';
const GROUP_NAME = 'Motho ke Motho Stokvel';
const PERIODS = ['2026-08', '2026-09', '2026-10', '2026-11'];

const supabaseReady = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
);

// Creates the auth identity if it is missing and reuses the existing one
// otherwise, so repeated runs do not leave orphaned identities behind.
const ensureAuthUser = async (supabaseAdmin, { email, fullName }) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (!error) return data.user;

  if ((error.message || '').toLowerCase().includes('already')) {
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

const DEMO_PEOPLE = [
  {
    email: 'alice@stokvel.com',
    fullName: 'Alice Dlamini',
    phone: '+27 82 123 4567',
    role: 'ADMIN',
    payoutPosition: 1,
  },
  {
    email: 'bob@stokvel.com',
    fullName: 'Bob Nkosi',
    phone: '+27 83 123 4567',
    role: 'TREASURER',
    payoutPosition: 2,
  },
  {
    email: 'carol@stokvel.com',
    fullName: 'Carol Mokoena',
    phone: '+27 84 123 4567',
    role: 'MEMBER',
    payoutPosition: 3,
  },
  {
    email: 'thabo@stokvel.com',
    fullName: 'Thabo Mahlangu',
    phone: '+27 71 234 5678',
    role: 'MEMBER',
    payoutPosition: 4,
  },
  {
    email: 'nomsa@stokvel.com',
    fullName: 'Nomsa Dube',
    phone: '+27 72 345 6789',
    role: 'MEMBER',
    payoutPosition: 5,
  },
  {
    email: 'sipho@stokvel.com',
    fullName: 'Sipho Radebe',
    phone: '+27 73 456 7890',
    role: 'MEMBER',
    payoutPosition: 6,
  },
];

// Who paid, in which period, and how late. A stokvel where every row says
// CONFIRMED teaches a reader nothing, so the history carries one late payment
// and one miss.
const CONTRIBUTION_STATE = {
  '2026-08': { confirm: 'all' },
  '2026-09': { confirm: 'all-except', late: 'thabo@stokvel.com' },
  '2026-10': { confirm: 'all-except', missed: 'nomsa@stokvel.com' },
  '2026-11': { confirm: ['alice@stokvel.com', 'carol@stokvel.com'] },
};

const day = (period, date) => new Date(`${period}-${date}T09:00:00+02:00`);

async function main() {
  console.log(
    'Adding demo data (nothing outside the demo group is touched)...\n'
  );

  if (!supabaseReady) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set, otherwise the demo\n' +
        '  profiles have no identities and nobody can sign in to them.'
    );
  }

  const { supabaseAdmin } = require('../src/config/supabase');

  const people = {};
  for (const person of DEMO_PEOPLE) {
    const existing = await prisma.user.findUnique({
      where: { email: person.email },
    });

    if (existing) {
      people[person.email] = existing;
      console.log(`  kept existing profile  ${person.email}`);
      continue;
    }

    const authUser = await ensureAuthUser(supabaseAdmin, person);
    people[person.email] = await prisma.user.create({
      data: {
        id: authUser.id,
        email: person.email,
        fullName: person.fullName,
        phone: person.phone,
      },
    });
    console.log(`  created profile + auth  ${person.email}`);
  }

  const alice = people['alice@stokvel.com'];

  // Reuse the group if a previous run made it, so the ids stay stable and the
  // old activity can simply be rebuilt underneath.
  let group = await prisma.group.findFirst({ where: { name: GROUP_NAME } });

  if (group) {
    await prisma.notification.deleteMany({ where: { groupId: group.id } });
    await prisma.payout.deleteMany({ where: { groupId: group.id } });
    await prisma.contribution.deleteMany({ where: { groupId: group.id } });
    await prisma.meeting.deleteMany({ where: { groupId: group.id } });
    await prisma.invitation.deleteMany({ where: { groupId: group.id } });
    console.log(`\n  rebuilt activity for  ${GROUP_NAME}`);
  } else {
    group = await prisma.group.create({
      data: {
        name: GROUP_NAME,
        description:
          'Monthly savings group for neighbours in Diepkloof. Everyone contributes on the first of the month; one member takes the pot each month in the agreed order.',
        contributionAmount: 500,
        contributionFrequency: 'MONTHLY',
        payoutOrder: 'FIXED',
        maxMembers: 10,
        createdById: alice.id,
      },
    });
    console.log(`\n  created group          ${GROUP_NAME}`);
  }

  for (const person of DEMO_PEOPLE) {
    await prisma.groupMember.upsert({
      where: {
        groupId_userId: { groupId: group.id, userId: people[person.email].id },
      },
      update: { role: person.role, payoutPosition: person.payoutPosition },
      create: {
        groupId: group.id,
        userId: people[person.email].id,
        role: person.role,
        payoutPosition: person.payoutPosition,
        joinedAt: new Date('2026-05-04T09:00:00+02:00'),
      },
    });
  }
  console.log(`  memberships            ${DEMO_PEOPLE.length}`);

  let contributions = 0;
  for (const period of PERIODS) {
    const state = CONTRIBUTION_STATE[period];

    for (const person of DEMO_PEOPLE) {
      const isLate = state.late === person.email;
      const isMissed = state.missed === person.email;
      const isConfirmed =
        state.confirm === 'all' ||
        (Array.isArray(state.confirm) &&
          state.confirm.includes(person.email)) ||
        (state.confirm === 'all-except' && !isLate && !isMissed);

      const status = isMissed
        ? 'MISSED'
        : isLate
          ? 'LATE'
          : isConfirmed
            ? 'CONFIRMED'
            : 'PENDING';

      await prisma.contribution.create({
        data: {
          groupId: group.id,
          memberId: people[person.email].id,
          amount: 500,
          period,
          status,
          dueDate: day(period, '01'),
          paidAt:
            status === 'CONFIRMED'
              ? day(period, period === '2026-08' ? '01' : '02')
              : status === 'LATE'
                ? day(period, '11')
                : null,
          paymentRef:
            status === 'PENDING'
              ? null
              : `PAY-${period}-${person.payoutPosition}`,
          confirmedById: status === 'CONFIRMED' ? alice.id : null,
        },
      });
      contributions += 1;
    }
  }
  console.log(`  contributions          ${contributions}`);

  await prisma.payout.createMany({
    data: [
      {
        groupId: group.id,
        recipientId: people['alice@stokvel.com'].id,
        amount: 3000,
        scheduledDate: new Date('2026-10-03T10:00:00+02:00'),
        processedAt: new Date('2026-10-03T10:14:00+02:00'),
        status: 'COMPLETED',
        paymentRef: 'PO-2026-10-ALICE',
        notes: 'October pot, paid out in full.',
      },
      {
        groupId: group.id,
        recipientId: people['bob@stokvel.com'].id,
        amount: 3000,
        scheduledDate: new Date('2026-11-28T10:00:00+02:00'),
        status: 'SCHEDULED',
      },
    ],
  });
  console.log('  payouts                2');

  const octoberMeeting = await prisma.meeting.create({
    data: {
      groupId: group.id,
      title: 'October monthly meeting',
      date: new Date('2026-10-25T18:00:00+02:00'),
      location: 'Community hall, Diepkloof',
      agenda:
        'Confirm October contributions, hand the pot to Alice, review the payout order for the remaining months.',
      minutes:
        'Five of six members present. October pot confirmed at R3 000 and paid to Alice. Sipho raised the question of raising the contribution to R600 once the group reaches eight members; carried over to November.',
      status: 'COMPLETED',
      createdById: people['bob@stokvel.com'].id,
    },
  });

  const novemberMeeting = await prisma.meeting.create({
    data: {
      groupId: group.id,
      title: 'November monthly meeting',
      date: new Date('2026-11-29T18:00:00+02:00'),
      location: 'Community hall, Diepkloof',
      agenda:
        'Revisit the R600 contribution proposal, confirm November contributions, agree the December payout date.',
      status: 'SCHEDULED',
      createdById: people['bob@stokvel.com'].id,
    },
  });

  await prisma.meetingAttendee.createMany({
    data: [
      {
        meetingId: octoberMeeting.id,
        memberId: people['alice@stokvel.com'].id,
        status: 'ATTENDED',
      },
      {
        meetingId: octoberMeeting.id,
        memberId: people['bob@stokvel.com'].id,
        status: 'ATTENDED',
      },
      {
        meetingId: octoberMeeting.id,
        memberId: people['carol@stokvel.com'].id,
        status: 'ATTENDED',
      },
      {
        meetingId: octoberMeeting.id,
        memberId: people['thabo@stokvel.com'].id,
        status: 'ATTENDED',
      },
      {
        meetingId: octoberMeeting.id,
        memberId: people['nomsa@stokvel.com'].id,
        status: 'ATTENDED',
      },
      {
        meetingId: octoberMeeting.id,
        memberId: people['sipho@stokvel.com'].id,
        status: 'ABSENT',
      },
      {
        meetingId: novemberMeeting.id,
        memberId: people['alice@stokvel.com'].id,
        status: 'CONFIRMED',
      },
      {
        meetingId: novemberMeeting.id,
        memberId: people['bob@stokvel.com'].id,
        status: 'CONFIRMED',
      },
      {
        meetingId: novemberMeeting.id,
        memberId: people['carol@stokvel.com'].id,
        status: 'INVITED',
      },
      {
        meetingId: novemberMeeting.id,
        memberId: people['thabo@stokvel.com'].id,
        status: 'INVITED',
      },
      {
        meetingId: novemberMeeting.id,
        memberId: people['nomsa@stokvel.com'].id,
        status: 'INVITED',
      },
      {
        meetingId: novemberMeeting.id,
        memberId: people['sipho@stokvel.com'].id,
        status: 'INVITED',
      },
    ],
  });
  console.log('  meetings               2, with attendance');

  await prisma.notification.createMany({
    data: [
      {
        userId: alice.id,
        groupId: group.id,
        type: 'CONTRIBUTION_CONFIRMED',
        message:
          'Your R500 contribution for November was confirmed by the treasurer.',
        read: false,
        data: { period: '2026-11', amount: 500 },
        createdAt: new Date('2026-11-03T08:12:00+02:00'),
      },
      {
        userId: alice.id,
        groupId: group.id,
        type: 'PAYOUT_SCHEDULED',
        message:
          'A payout of R3 000 is scheduled for Bob Nkosi on 28 November.',
        read: false,
        data: { amount: 3000, recipient: 'Bob Nkosi' },
        createdAt: new Date('2026-11-02T19:40:00+02:00'),
      },
      {
        userId: alice.id,
        groupId: group.id,
        type: 'MEETING_REMINDER',
        message:
          'November monthly meeting on 29 November at 18:00, Community hall.',
        read: false,
        data: { meeting: 'November monthly meeting' },
        createdAt: new Date('2026-11-15T07:00:00+02:00'),
      },
      {
        userId: alice.id,
        groupId: group.id,
        type: 'CONTRIBUTION_MISSED',
        message: 'Nomsa Dube has not paid her October contribution.',
        read: true,
        data: { period: '2026-10', member: 'Nomsa Dube' },
        createdAt: new Date('2026-10-09T09:00:00+02:00'),
      },
      {
        userId: alice.id,
        groupId: group.id,
        type: 'MEMBER_JOINED',
        message:
          'Sipho Radebe accepted your invitation and joined the stokvel.',
        read: true,
        data: { member: 'Sipho Radebe' },
        createdAt: new Date('2026-05-06T16:22:00+02:00'),
      },
    ],
  });

  await prisma.invitation.create({
    data: {
      groupId: group.id,
      email: 'thandi@example.com',
      role: 'MEMBER',
      code: 'STOKVEL-DEMO-INVITE',
      status: 'PENDING',
      expiresAt: new Date('2026-12-31T23:59:59+02:00'),
      invitedById: alice.id,
    },
  });
  console.log('  notifications          5, plus 1 pending invitation');

  if ((await prisma.interestRate.count()) === 0) {
    await prisma.interestRate.create({
      data: { primeRate: 10.25, repoRate: 6.75 },
    });
    console.log('  interest rates         cached');
  }

  console.log(
    '\nDemo data ready. Every account signs in with SEED_PASSWORD:\n'
  );
  for (const person of DEMO_PEOPLE) {
    console.log(`   ${person.email.padEnd(22)} ${person.role}`);
  }
  console.log(
    '\nThe group belongs to alice@stokvel.com, who is the administrator,'
  );
  console.log('so sign in with her to see the admin and treasurer actions.\n');
}

main()
  .catch((error) => {
    console.error('Demo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
