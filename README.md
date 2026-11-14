# StokvelSA

**A digital platform for managing South African stokvels and community savings groups.**

StokvelSA brings group administration and savings activity into one place. Members can keep track of contributions, payout schedules, meetings and group notifications, while administrators and treasurers manage the day-to-day running of a stokvel.

> This repository contains a React frontend and a Node.js/Express API. It is a software project and demonstration; payment processing is configured for the PayFast Sandbox and should not be used to collect real funds.

## What it does

- **Manage stokvel groups** — create groups, configure contribution amounts and frequencies, set payout order, and invite members.
- **Support group roles** — assign an Administrator, Treasurer or Member role within each group.
- **Track contributions** — record contribution periods and statuses, including pending, confirmed, late and missed contributions.
- **Coordinate payouts** — maintain payout schedules, recipients and processing statuses.
- **Organise meetings** — schedule group meetings, record meeting details and manage attendance.
- **Keep members informed** — provide notifications for contribution, payout and meeting activity, with scheduled reminder jobs.
- **View group analytics** — review group activity and export reports.
- **Use South African context** — retrieve and cache local interest-rate information for savings-related features.
- **Support online payment workflows** — initiate PayFast Sandbox payments and process payment notifications (ITNs).

## Application preview

Screenshots and a public demo link can be added here once a shareable deployment and representative demo account are available.

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| Client state and data | Zustand, TanStack Query, Axios |
| Charts and UI | Recharts, Lucide React, React Hot Toast |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL, Prisma ORM |
| Authentication | Supabase Auth |
| Payments | PayFast Sandbox |
| Background jobs | node-cron |
| Reporting and exports | PDFKit, ExcelJS, csv-writer |
| Email and logging | EmailJS, Resend, Winston |
| Testing and code quality | Jest, Supertest, ESLint, Prettier |

## Architecture

StokvelSA is organised as a frontend application communicating with a REST API:

```text
StokvelSA/
├── Frontend/
│   ├── src/
│   │   ├── components/     # Shared layout and UI components
│   │   ├── lib/            # API client and Supabase client
│   │   ├── pages/          # Landing, auth, groups, contributions, etc.
│   │   └── stores/         # Client-side authentication state
│   └── package.json
│
└── Backend/
    ├── src/
    │   ├── config/         # Database, environment and service setup
    │   ├── controllers/    # HTTP request handlers
    │   ├── middleware/     # Authentication, validation and error handling
    │   ├── routes/         # REST API route definitions
    │   ├── services/       # Application and business logic
    │   ├── jobs/           # Scheduled reminders and rate refresh
    │   └── utils/          # Shared utilities
    ├── prisma/
    │   └── schema.prisma   # Relational data model
    └── package.json
```

The backend follows a layered structure:

```text
HTTP request
    ↓
Route + middleware
    ↓
Controller
    ↓
Service (business rules)
    ↓
Prisma ORM
    ↓
PostgreSQL
```

The database models users, groups, group memberships, contributions, payouts, meetings, attendance, invitations, notifications and cached interest rates. A member's role is stored on their membership in a particular group, allowing the same person to have different responsibilities in different stokvels.

## Getting started

### Prerequisites

- Node.js (use a current LTS release)
- npm
- A PostgreSQL database
- A Supabase project for authentication
- PayFast Sandbox credentials if you want to test the payment flow

### 1. Clone the repository

```bash
git clone https://github.com/PhumudzoManenzhe/StokvelSA.git
cd StokvelSA
```

### 2. Configure and start the backend

```bash
cd Backend
npm install
```

Create your local environment file from the example:

**macOS / Linux**
```bash
cp .env.example .env
```

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

Set the values in `Backend/.env` for your environment. At minimum, configure:

- `DATABASE_URL` and `DIRECT_URL` for PostgreSQL.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` for Supabase authentication.
- The application secrets and email settings required by the features you intend to test.
- PayFast Sandbox credentials, keeping `PAYFAST_SANDBOX=true` while developing.

Generate the Prisma client and apply the database migrations:

```bash
npx prisma generate
npm run db:migrate
```

Start the API in development mode:

```bash
npm run dev
```

The API runs on `http://localhost:3000` by default. Its health endpoint is `http://localhost:3000/health`.

### 3. Configure and start the frontend

Open a second terminal:

```bash
cd Frontend
npm install
```

Create `Frontend/.env` using `Frontend/.env.example` as a guide and set:

- `VITE_API_URL` — the backend API base URL (for local development, use `http://localhost:3000`).
- `VITE_SUPABASE_URL` — your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` — your Supabase public/anon key.

Start the Vite development server:

```bash
npm run dev
```

Vite prints the local frontend URL in the terminal (normally `http://localhost:5173`).

## Useful commands

Run commands from the relevant directory.

**Backend** (`cd Backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API |
| `npm test` | Run the Jest test suite |
| `npm run lint` | Lint backend source files |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio |

**Frontend** (`cd Frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Security notes

- Do not commit `.env` files, database URLs, Supabase service-role keys, JWT secrets or payment credentials.
- Use the Supabase public/anon key in the browser; keep service-role and other privileged secrets on the server.
- Keep PayFast in Sandbox mode while developing and testing.
- Configure the backend's `FRONTEND_URL` to the actual frontend origin before deployment.
- Review authentication, authorization, database access policies and payment-webhook configuration before any production use.

## Deployment

The repository includes a Render service configuration at `Backend/render.yaml` for the API. The frontend is a separate Vite application and needs its own static-site hosting configuration.

Before deploying, configure all required environment variables in the hosting providers, set the correct frontend origin in `FRONTEND_URL`, set `VITE_API_URL` to the deployed API URL, and verify the `/health` endpoint. Do not assume a deployment is live until it has been deployed and tested.

## Project structure

- `Frontend/` — React web application.
- `Backend/` — Express REST API and background jobs.
- `Backend/prisma/` — Prisma schema, migrations and seed utilities.
- `Backend/tests/` — backend automated tests.

## Author

**Phumudzo Manenzhe**

- GitHub: [@PhumudzoManenzhe](https://github.com/PhumudzoManenzhe)

---

*StokvelSA — saving together, growing together.*
