# COMPASS — Milestone 01

Clickable synthetic, nonclinical vertical prototype for enrollment, activation, one EMA check-in, deterministic alerting, and nurse claim/close handling.

## Local prototype

1. Run `npm install` (Node.js 24+).
2. Copy `.env.example` to `.env.local`; keep `COMPASS_ENABLE_DEV_ACCESS=true`.
3. Run `npm run dev`, open `http://localhost:3000`, and start with **Staff enrollment**.

The clickable milestone uses browser-local synthetic state so review does not require a database. Choose pain `10` and hydration `none` to exercise the deliberately nonclinical urgent test rule. Clear site storage to restart.

## Neon / Prisma

Privately place the pooled Neon URL in `DATABASE_URL` and the unpooled URL in `DIRECT_URL` inside ignored `.env.local`. Never paste credentials into chat, Git, logs, or source files. Then run `npm run prisma:generate`, `npm run db:migrate`, and `npm run db:seed`.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run prisma:validate`. `GET /api/health` returns service status.

Staff and patient prototype routes require both development mode and `COMPASS_ENABLE_DEV_ACCESS=true`. Production returns 404 until Clerk authorization is integrated.

## Safety and limitations

All names and content are fictional placeholders. This is not a medical device, emergency service, approved questionnaire, or clinical guidance. The prototype is not continuously monitored. The alert rule is a software test combination, not a medical threshold. No ECOG inference, AI provider, notifications, production auth, or real patient data is included. Submitted answers are locked; corrections belong in appended clarification records.
