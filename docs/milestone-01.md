# Milestone 01 — Foundation and Vertical Prototype

## Goal
Create a locally runnable foundation and the first clickable synthetic workflow:
1. Staff enrolls a fictional patient.
2. Patient activates with a study code and six-digit PIN.
3. Patient completes one guided EMA check-in.
4. A deterministic placeholder rule creates one alert.
5. Nurse sees, claims, and closes the alert.

## Scope
- Project scaffold and development database setup
- Synthetic seed data
- Role-separated prototype routes
- Minimal enrollment/activation
- One structured EMA
- One deterministic placeholder alert
- Minimal audit records
- Clear nonclinical placeholder labels

## Exclusions
No real clinical content/data, production deployment, complete questionnaire set, voice, RAG, Navigator integration, push/email delivery, native apps, wearables, EHR, or production security certification.

## Acceptance criteria
- A new developer can start the app from documented commands.
- The complete synthetic vertical flow works without an AI provider.
- Patient and staff routes enforce their intended access boundary.
- Original EMA data cannot be overwritten.
- Placeholder urgent guidance is visibly nonclinical.
- Relevant automated tests are run and their exact results reported.
- README documents setup, limitations, and next milestone.
