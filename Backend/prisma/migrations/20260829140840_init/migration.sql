-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('ADMIN', 'TREASURER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ContributionFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "PayoutOrder" AS ENUM ('FIXED', 'ROTATING', 'RANDOM');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'MISSED', 'LATE');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('SCHEDULED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendeeStatus" AS ENUM ('INVITED', 'CONFIRMED', 'ATTENDED', 'ABSENT');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CONTRIBUTION_DUE', 'CONTRIBUTION_CONFIRMED', 'CONTRIBUTION_MISSED', 'PAYOUT_SCHEDULED', 'PAYOUT_COMPLETED', 'MEETING_SCHEDULED', 'MEETING_REMINDER', 'MEMBER_JOINED', 'MEMBER_LEFT', 'GENERAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contributionAmount" DECIMAL(10,2) NOT NULL,
    "contributionFrequency" "ContributionFrequency" NOT NULL DEFAULT 'MONTHLY',
    "payoutOrder" "PayoutOrder" NOT NULL DEFAULT 'FIXED',
    "maxMembers" INTEGER NOT NULL DEFAULT 20,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "payoutPosition" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GroupRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "period" TEXT NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentRef" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "confirmedById" TEXT,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'SCHEDULED',
    "paymentRef" TEXT,
    "processedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "agenda" TEXT,
    "minutes" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_attendees" (
    "id" TEXT NOT NULL,
    "status" "AttendeeStatus" NOT NULL DEFAULT 'INVITED',
    "meetingId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "meeting_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "groupId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "GroupRole" NOT NULL DEFAULT 'MEMBER',
    "code" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "usedById" TEXT,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_rates" (
    "id" TEXT NOT NULL,
    "primeRate" DECIMAL(5,2) NOT NULL,
    "repoRate" DECIMAL(5,2) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "groups_createdById_idx" ON "groups"("createdById");

-- CreateIndex
CREATE INDEX "group_members_groupId_idx" ON "group_members"("groupId");

-- CreateIndex
CREATE INDEX "group_members_userId_idx" ON "group_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_groupId_userId_key" ON "group_members"("groupId", "userId");

-- CreateIndex
CREATE INDEX "contributions_groupId_idx" ON "contributions"("groupId");

-- CreateIndex
CREATE INDEX "contributions_memberId_idx" ON "contributions"("memberId");

-- CreateIndex
CREATE INDEX "contributions_status_idx" ON "contributions"("status");

-- CreateIndex
CREATE INDEX "contributions_dueDate_idx" ON "contributions"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "contributions_groupId_memberId_period_key" ON "contributions"("groupId", "memberId", "period");

-- CreateIndex
CREATE INDEX "payouts_groupId_idx" ON "payouts"("groupId");

-- CreateIndex
CREATE INDEX "payouts_recipientId_idx" ON "payouts"("recipientId");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "payouts_scheduledDate_idx" ON "payouts"("scheduledDate");

-- CreateIndex
CREATE INDEX "meetings_groupId_idx" ON "meetings"("groupId");

-- CreateIndex
CREATE INDEX "meetings_date_idx" ON "meetings"("date");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendees_meetingId_memberId_key" ON "meeting_attendees"("meetingId", "memberId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_code_key" ON "invitations"("code");

-- CreateIndex
CREATE INDEX "invitations_groupId_idx" ON "invitations"("groupId");

-- CreateIndex
CREATE INDEX "invitations_code_idx" ON "invitations"("code");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
