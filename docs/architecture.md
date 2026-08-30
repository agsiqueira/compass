# Preliminary Architecture

## Approved stack
- Next.js and TypeScript
- PostgreSQL
- Prisma
- Clerk for nurse/administrator work-email authentication
- Custom patient activation, device session, and PIN flow
- Render deployment
- Navigator through a provider-independent AI adapter

V1 uses one codebase and shared backend with strict role boundaries.

## Logical modules
1. Patient PWA
2. Nurse dashboard
3. Study administration
4. Enrollment and patient-device authentication
5. EMA schedule and questionnaire engine
6. Deterministic condition/alert engine
7. ECOG assessment assistant
8. Conversation orchestration
9. Curated knowledge ingestion and retrieval
10. Provider-independent AI adapter
11. Notification service
12. Audit and research export service

## Critical separation
The deterministic path stores structured EMA responses, evaluates approved safety rules, creates alerts, and displays configured urgent instructions. It must remain operational during AI-provider failure.

The AI path handles clinician-grounded conversational answers and summaries. Outputs retain source and prompt/model/version traceability and must never overwrite source data.

## Environments
Use separate development and pilot environments with independent databases and credentials. Keep one codebase and automated setup to preserve development speed. Production/pilot use with real data requires institutional approval and a HIPAA-appropriate hosting arrangement.

## Extensibility
The observation model should later accept normalized wearable observations without changing the existing EMA model. Native iOS/Android, Apple HealthKit, Android Health Connect, EHR integration, live calls, and caregiver access are explicitly deferred.
