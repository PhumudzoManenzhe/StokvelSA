import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma loads this file for every command, including `generate`, which runs from
// the install hook and never opens a connection. Resolving the variable strictly
// would make a plain `npm install` fail on a fresh clone that has no .env yet, so
// an unreachable placeholder stands in. Nothing connects to it; the API refuses
// to boot without a real DATABASE_URL, which is where that error belongs.
const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://placeholder:placeholder@localhost:5432/placeholder';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
