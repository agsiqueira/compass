# Milestone 02 — Database Persistence and Durable Patient Sessions

Status: approved for implementation

## Goal
Replace browser-local prototype state with transactional Neon/PostgreSQL persistence so enrollment, activation, EMA submissions, alerts, audit history, and patient visibility are shared across browsers and devices.

## Product decisions
- Keep the explicitly gated development role switch for this milestone.
- Defer Clerk staff authentication to Milestone 03.
- Show all enrolled patients in the nurse dashboard: urgent, attention needed, then stable.
- Patient activation creates a secure, revocable device session.
- A device session remains valid through the 12-week enrollment unless logout, revocation, or withdrawal occurs.
- Enforce the existing maximum of two active devices per patient.
- Preserve the minimal synthetic enrollment form; defer detailed ECOG, treatment-cycle, contact, and wellness-baseline fields.
- Continue using synthetic, nonclinical data and rules only.

## Required persisted workflows
1. Staff enrolls a fictional participant.
2. The server creates a hashed, single-use, expiring activation code.
3. The patient activates and creates a hashed six-digit PIN.
4. The server creates an opaque patient-device session in a secure HTTP-only cookie.
5. The patient completes one EMA occurrence.
6. The immutable EMA and responses are stored transactionally.
7. The deterministic placeholder evaluator creates or updates one active alert.
8. Every nurse sees the same patient and alert state.
9. A nurse claims and closes the alert through valid transitions.
10. Append-only audit events persist and remain attributable.

## Security and integrity contracts
- Never store activation codes, PINs, or session tokens in plaintext.
- Store hashes using purpose-appropriate algorithms and compare safely.
- Session cookies must be HTTP-only, SameSite-protected, and Secure outside local development.
- Enforce enrollment/session expiration and withdrawal/revocation.
- Enforce the two-device maximum transactionally.
- Activation codes are single-use and expire.
- Original EMA data cannot be updated or deleted through normal application services.
- Corrections remain append-only.
- Alert creation/update and its evidence/audit events are atomic.
- Validate authorization in server/service code, not only in the UI.
- Do not expose Prisma/database access directly to client components.
- Do not log secrets, raw PINs, activation codes, or session tokens.
- AI remains outside every safety-critical path.

## Implementation scope
- Server-side Prisma client lifecycle suitable for Next.js development/production
- Repository/service boundary for database operations
- Server actions or route handlers with Zod validation
- Database-backed enrollment and activation
- Patient session issuance, validation, revocation, and expiry
- Two-device enforcement
- Database-backed EMA submission
- Transactional deterministic alert aggregation
- Database-backed nurse list/detail, claim, close, and audit history
- Stable-patient visibility
- Synthetic seed/reset guidance appropriate for development
- Loading, empty, conflict, expired-code, used-code, device-limit, and database-error states
- Updated setup documentation

## Explicit exclusions
- Clerk
- Real clinical content or data
- Formal ECOG workflow
- Treatment-cycle UI
- Three-times-daily scheduling and reminders
- Push/email notifications
- AI, Navigator, RAG, voice, or animated virtual human work
- Caregiver accounts, native apps, wearables, EHR, or live calls
- Production/pilot deployment

## Required tests
At minimum:
- Enrollment and hashed activation creation
- Expired and reused activation rejection
- PIN hashing and validation
- Patient session issuance and expiry
- Session revocation and withdrawal rejection
- Two-device maximum under concurrent attempts
- Cross-browser/shared database visibility
- Immutable EMA submission and duplicate occurrence rejection
- Transactional alert creation/update without duplicate active alerts
- Valid and invalid claim/close transitions
- Stable-patient nurse listing and priority order
- Staff/patient authorization boundaries
- Database failure does not falsely report successful submission

## Manual acceptance path
Use two browser contexts:
1. Enroll and activate a synthetic patient in one context.
2. Confirm the patient is visible to the nurse in another context.
3. Submit a non-alert EMA and confirm stable status.
4. Create a second eligible EMA/test occurrence that triggers the synthetic urgent rule.
5. Confirm the nurse sees the alert without copying browser storage.
6. Claim and close it.
7. Refresh both contexts and confirm persistence.
8. Reuse the activation code and verify rejection.
9. Attempt a third device and verify the configured limit.

## Verification
Run and report exact results for:
- lint
- typecheck
- unit/integration tests
- Prisma validation and generation
- migration against Neon development
- seed
- production build
- manual two-context acceptance path

Do not commit secrets. Do not merge automatically.
