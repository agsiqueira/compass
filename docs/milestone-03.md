# Milestone 03 — Clerk Staff Authentication and Authorization

Status: approved for implementation

## Goal
Replace the prototype staff role switch with Clerk-authenticated, COMPASS-authorized staff access while preserving the patient study-code/PIN/device-session system.

## Approved staff roles
### Nurse
- View all enrolled patients
- Review patient timelines and alerts
- Claim and close alerts
- Add approved follow-up information

### Administrator
- All Nurse permissions
- Enroll patients
- Manage staff access and roles
- Configure study settings when those tools are implemented
- Manage clinician-approved knowledge content when that capability is implemented

## Identity and authorization model
- Clerk verifies identity.
- COMPASS database allowlisting grants access and role.
- A valid Clerk account alone never grants COMPASS staff access.
- Allowlisted work emails may belong to multiple institutions; do not hard-code a UF domain.
- Every protected request rechecks active COMPASS authorization.
- Deactivation blocks access immediately even if a Clerk session remains active.

## Sign-in
- Passwordless one-time verification code sent to the approved work email.
- Do not implement patient authentication with Clerk.
- Preserve patient PIN/device sessions unchanged.
- Staff sessions time out after 30 minutes of inactivity with an advance warning.

## First administrator
Use a private environment value such as `COMPASS_BOOTSTRAP_ADMIN_EMAIL`.
- On the first successful Clerk sign-in whose verified email matches, create/activate the initial Administrator.
- Record an audit event.
- Never commit the bootstrap email.
- The variable may be removed after bootstrap.
- Bootstrap must not silently create additional administrators after one exists.

## Staff administration
Provide a minimal Administrator-only interface to:
- Add/allowlist a work email
- Assign Nurse or Administrator
- View active/inactive status
- Deactivate/reactivate access
- Change role
- View relevant access history

Prevent deactivation or demotion of the last active Administrator. An Administrator may deactivate/demote themselves only when another active Administrator remains.

## Development access
The current synthetic staff bypass may remain only when:
- `NODE_ENV` is not production, and
- `COMPASS_ENABLE_DEV_ACCESS="true"`

Production must reject the bypass even if the variable is mistakenly enabled.

## Required audit events
- Successful staff sign-in
- Session timeout/sign-out when observable by the application
- Staff allowlist addition
- Role change
- Deactivation/reactivation
- Access denied because identity is not allowlisted
- Bootstrap administrator creation

Do not audit verification codes, session tokens, secrets, or unnecessary personal details.

## Security contracts
- Resolve the authoritative verified Clerk email server-side.
- Do not trust client-provided email, Clerk ID, role, or authorization claims.
- Bind the COMPASS staff record to the Clerk user ID only after verified-email matching.
- Handle changed Clerk emails safely; do not transfer authorization silently to a new email.
- Protect staff pages, API routes, and server actions at the server boundary.
- Nurse and Administrator permissions must be explicitly tested.
- Administrator-only operations must return a denial even if invoked directly.
- Avoid staff-account enumeration in public error messages.
- Use generic access-denied messaging for unauthorised users.
- Never place Clerk secret keys or bootstrap email in tracked files or logs.
- Preserve existing deterministic patient/EMA/alert integrity contracts.

## Implementation scope
- Current compatible Clerk Next.js package
- Clerk provider and passwordless staff sign-in/up experience configured for email verification codes
- Server-side staff identity/allowlist resolver
- Role-based authorization helpers
- Protected staff routes and staff APIs
- Minimal Administrator staff-access page
- Bootstrap Administrator flow
- 30-minute inactivity timeout and warning
- Immediate deactivation enforcement
- Access-management and authentication audit events
- Updated environment template with placeholders only
- Updated README/setup instructions
- Automated tests and manual two-account acceptance path

## Explicit exclusions
- Institutional SSO/SAML
- Organization/department hierarchy
- Patient Clerk accounts
- Detailed clinical enrollment fields
- ECOG workflow
- Scheduled EMA/reminders
- Notifications
- AI/RAG, voice, or avatar development
- Production deployment

## Required tests
At minimum:
- Unauthenticated staff request denied
- Authenticated but non-allowlisted request denied
- Allowlisted Nurse can access nurse workflows
- Nurse cannot enroll patients or manage staff
- Administrator can enroll and manage staff
- Deactivation blocks the next protected request
- Role change takes effect on the next request
- Last Administrator cannot be demoted/deactivated
- Bootstrap creates exactly one matching Administrator
- Bootstrap mismatch is denied
- Bootstrap cannot create additional administrators after initialization
- Client-forged email/role/Clerk ID is ignored
- Production cannot enable the development bypass
- Patient authentication remains unaffected
- Audit records created without sensitive token/code data
- Timeout warning and sign-out behavior

## Manual acceptance
Use synthetic accounts only:
1. Bootstrap the first Administrator using a private work-email setting.
2. Sign in by emailed one-time code.
3. Add a second synthetic/controlled staff email as Nurse.
4. Verify Nurse dashboard access.
5. Verify Nurse cannot access staff management or patient enrollment.
6. Promote the Nurse to Administrator and verify new access.
7. Attempt to remove the last Administrator and verify rejection.
8. Deactivate the second account and verify immediate denial.
9. Verify patient activation/check-in still works without Clerk.
10. Verify inactivity warning/timeout using a temporarily shortened local test setting if needed, without weakening the 30-minute default.

## Verification
Run and report exact results for lint, typecheck, tests, Prisma validation/generation, additive migration, idempotent seed, production build, health endpoint, and manual acceptance.

Do not commit secrets. Do not merge automatically.
