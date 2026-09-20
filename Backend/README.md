# StokvelSA API

StokvelSA is a Node.js API for managing South African rotating savings groups. It models the practical work of a stokvel: member governance, recurring contributions, payout rotations, meetings, notifications, and payment reconciliation.

## Highlights

- Role-based group governance for **Administrators**, **Treasurers**, and **Members**.
- Contribution ledger with pending, confirmed, and missed states.
- Payout scheduling, attendance, meeting records, analytics exports, and scheduled reminders.
- Supabase JWT authentication with PostgreSQL persistence through Prisma.
- PayFast payment initiation and signed Instant Transaction Notification (ITN) handling.

## Architecture

The API follows a layered Express architecture:

`routes → controllers → services → Prisma/PostgreSQL`

Routes validate request data and apply authentication/role middleware. Controllers translate service outcomes to consistent HTTP responses. Services contain business rules, keeping database access and financial workflows separate from HTTP concerns.

### Governance and financial separation

`GroupMember` stores a role per group rather than a global role. Administrators own group rules—membership, configuration, and payout scheduling—while Treasurers operate the contribution ledger and complete payouts. Members access their own financial history and update attendance. This makes authorization explicit and auditable at the database boundary.

## Payment security

PayFast checkout URLs contain contribution amount and group/member/period metadata. The request is protected with PayFast's MD5 signature handshake. On the webhook endpoint, StokvelSA recomputes and timing-safely compares the signature before confirming a contribution or creating a notification. The contribution’s unique `(groupId, memberId, period)` constraint makes webhook retries idempotent.

> The project is configured for the **PayFast Sandbox** environment for demonstration purposes. Do not use real payment credentials in this repository.

## Tech stack and rationale

- **Node.js + Express** — lightweight, asynchronous API platform with a mature middleware ecosystem.
- **Prisma + PostgreSQL (Neon-compatible)** — relational integrity for financial records while remaining serverless-friendly.
- **Supabase Auth** — delegated identity and JWT verification rather than handling password hashes directly.
- **PayFast** — a recognisable South African payment workflow, implemented in sandbox mode.
- **node-cron, EmailJS, PDFKit, Winston** — scheduled jobs, email, exports, and structured logging.

## Getting started

```bash
cd Backend
copy .env.example .env
npm install
npm run dev
```

Populate `.env` with your own development values. Never commit it. Start with `PAYFAST_SANDBOX=true`.

Useful commands:

```bash
npm test
npm run lint
npm run db:migrate
```

## Quality signals

The repository includes focused tests for PayFast URL signing, signature tamper detection, and webhook confirmation behavior. ESLint and Prettier provide an enforceable baseline for a consistent codebase; Winston emits structured JSON logs suitable for local debugging or a hosted log collector.
