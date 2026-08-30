# COMPASS — Milestone 02

COMPASS is a synthetic, explicitly nonclinical prototype for database-backed enrollment, patient activation, EMA submission, deterministic alerting, and nurse review. Milestone 02 stores shared state in Neon/PostgreSQL instead of browser storage.

## Private environment setup

Use Node.js 24+ and npm. Copy `.env.example` to the ignored `.env` file and privately provide:

- `DATABASE_URL`: pooled Neon application connection
- `DIRECT_URL`: unpooled Neon migration connection
- `COMPASS_ENABLE_DEV_ACCESS=true`: explicitly enables the local synthetic role entry

Keep actual values only in `.env`. Never place credentials in chat, source files, screenshots, logs, Git, or reports. Clerk placeholders remain reserved for Milestone 03.

## Install and database setup

```text
npm install
npm run prisma:generate
npm run prisma:validate
npx prisma migrate deploy
npm run db:seed
```

Migrations are additive and must not reset, truncate, or recreate the shared Neon development database. The seed idempotently creates only the fictional development nurse account.

## Run the prototype

```text
npm run dev
```

Open `http://localhost:3000` and begin with **Staff enrollment**. Enrollment, activation, patient sessions, EMA occurrences/responses, alerts, and audit events are persisted in Neon and are visible after refresh and across browser contexts.

The patient session is an opaque token stored in an HTTP-only, SameSite-protected cookie. Activation codes and session tokens are stored only as hashes; six-digit PINs use password hashing. The nurse dashboard includes every active synthetic participant and orders urgent, attention-needed, then stable patients.

Development-only dashboard actions can create another synthetic EMA occurrence or issue another synthetic device code for acceptance testing. All staff, patient, and development prototype routes return 404 outside development or when `COMPASS_ENABLE_DEV_ACCESS` is not exactly `true`. Clerk staff authentication is deferred to Milestone 03.

## Verification

```text
npm run lint
npm run typecheck
npm test
npm run prisma:validate
npm run prisma:generate
npm run db:seed
npm run build
```

`GET /api/health` checks both the application and database connection, returning a degraded 503 response when PostgreSQL is unavailable.

## Synthetic-data and safety limitations

- Use fictional patients only. No real patient, credential, or restricted clinical information belongs in this repository or development database.
- EMA questions, alert rules, evidence descriptions, and outcomes are nonclinical placeholders requiring clinical approval.
- COMPASS is not an emergency service and is not continuously monitored.
- Original EMA submissions cannot be overwritten; corrections remain append-only.
- No AI provider participates in storage, alert generation, or state transitions.
- Clerk, formal ECOG workflows, treatment cycles, notifications, approved clinical content, production deployment, voice, and RAG are excluded from this milestone.

## Dependency advisory

Prisma 7.10.0 currently brings in `deepmerge-ts@7.1.5` through `@prisma/config`. This documented prototype dependency risk is intentionally preserved. Do not run `npm audit fix --force` or adopt an unapproved Prisma major/prerelease solely to remove it; reassess when a compatible stable Prisma update is available and verify the full suite before upgrading.
