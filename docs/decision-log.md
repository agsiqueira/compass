# Decision Log

## 2026-08-30 — Foundation
- Repository remains public; prohibit patient data, secrets, credentials, and restricted clinical content.
- Official name: COMPASS — Clinical Oncology Monitoring and Patient Adaptive Support System.
- Use one combined web platform with role-separated patient, nurse, and administration interfaces.
- Adopt a rapid agile, development-and-prototyping-focused process.
- Use one branch and pull request per meaningful milestone, not per minor feature.
- Preserve stable behavior; prefer small, additive changes and honest test reporting.
- Approved stack: Next.js, TypeScript, PostgreSQL, Prisma, Clerk for staff, Render, and provider-independent AI with Navigator initially.
- Use synthetic data until institutional and HIPAA-appropriate deployment approval.
- Smartwatches, native apps, EHR integration, caregiver accounts, and live calls are future capabilities.
- Detailed approved V1 behavior is canonical in product-specification.md.
