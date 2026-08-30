# COMPASS Preliminary Product Specification

Status: approved preliminary scope for rapid prototyping  
Product: **COMPASS — Clinical Oncology Monitoring and Patient Adaptive Support System**

## Product purpose
COMPASS is a preliminary research platform intended to:
1. Give oncology patients clinician-approved answers to common questions.
2. Collect timely, repeated patient reports so later clinical conversations do not depend on memory.
3. identify concerning conditions and actively alert nurses.
4. Reduce nursing workload through prioritization, concise summaries, and low-friction alert handling.

COMPASS does not replace the clinical team, emergency services, or clinical judgment.

## Product surfaces
V1 is one web platform with role-separated interfaces and a shared backend:
- Mobile-first patient PWA
- Desktop-oriented nurse dashboard
- Minimal study-administration tools

Future versions may add native mobile apps, smartwatch/HealthKit/Health Connect data, EHR integration, caregiver accounts, live in-app audio/video calls, predictive models, expanded languages, and richer virtual humans.

## Patient access
- Staff enroll the patient after confirming completion of the approved consent process.
- COMPASS generates a single-use, expiring study access code.
- The patient uses the code to create a six-digit PIN.
- Five failed PIN attempts cause a 15-minute lockout.
- Patients normally activate once and remain signed in.
- Up to two devices are allowed; staff may revoke devices or issue recovery codes.
- No separate caregiver account exists in V1.

## Scheduled EMA contacts
Default schedule:
- Morning: 8:00 AM
- Afternoon: 1:00 PM
- Evening: 7:00 PM

Each unanswered check-in receives one reminder one hour later. A patient may use “Remind me in 15 minutes” once. The check-in remains available until the next scheduled check-in; it is then recorded as missed. Three consecutive missed check-ins create a nurse alert.

A routine check-in should take no more than two minutes. The virtual human asks one question at a time and uses structured scales/buttons, with optional text or voice notes.

### Shared safety core
All check-ins include a short clinician-approved safety core and 0–10 measures for pain, nausea, fatigue, and distress, with plain-language anchors and an “I’m not sure” option.

### Time-specific emphasis
- Morning: overnight sleep, current symptoms, eating/drinking ability, and functioning.
- Afternoon: intake and symptom changes since morning, fatigue, and functioning.
- Evening: daily intake, symptom progression, functioning, and overnight concerns.

Eating, hydration, sleep, and activity are evaluated relative to the individual patient’s onboarding baseline. Follow-up questions appear only when needed.

## EMA and ECOG
EMA is the three-times-daily repeated collection method. ECOG is a formal clinician-confirmed performance-status measure.

- A nurse or clinician enters baseline ECOG during enrollment.
- COMPASS provides a structured ECOG assessment assistant and suggests a candidate level.
- The nurse/clinician must confirm or change the score.
- COMPASS prompts for reassessment every two weeks and when EMA data indicates meaningful functional decline.
- COMPASS never silently changes formal ECOG from patient responses.
- Every suggestion and confirmed score is timestamped and attributed.

Staff also record chemotherapy treatment dates and cycle numbers so trends can be viewed in treatment context.

## Virtual human and conversation
- One simple, friendly animated human character in V1, following proven Clinicals/OdontIQ patterns where practical.
- Text and voice input.
- Responses displayed as text and spoken aloud.
- Mute, replay, pause, speed control, captions, and screen-reader compatibility.
- Adaptive Mode is default; patients can select Quick Guidance or Supportive Conversation.
- Mode is visible and changeable; adaptive decisions are logged.
- Voice audio is discarded after transcription; transcripts and necessary metadata are retained.
- Patients can review their own history, but not internal notes or alert logic.

## Curated answers
Navigator is the initial AI provider behind a provider-independent interface.
- Answers use only clinician-approved COMPASS material.
- Unsupported or uncertain questions are acknowledged and redirected.
- Patients can open a simple “Where this answer comes from” section.
- Authorized staff can inspect the complete retrieval and answer trace.
- Administrators can upload PDF, DOCX, and plain-text knowledge documents; activate/deactivate versions; and review history.
- AI outages must not stop check-ins, deterministic rules, storage, or alerts.

## Patient record integrity
Submitted reports cannot be overwritten. Patients may append corrections or clarifications. Nurses may add attributed notes or corrections but cannot alter the original patient report.

## Nurse dashboard
The dashboard prioritizes:
1. Urgent
2. Attention needed
3. Stable

Each row shows a concise “what changed” summary. Default summaries cover activity since last review, with 24-hour, 7-day, and complete-history views. Summaries link to underlying evidence.

All authorized nurses can see all enrolled patients. Viewing is logged automatically.

## Alerts
Only two priorities:
- Attention needed
- Urgent

Multiple signals for one patient are combined into one active alert whose evidence and priority update over time. The low-friction lifecycle is:
- New
- In progress
- Closed

Nurses claim an alert to place it in progress. Closing uses a quick outcome; notes are optional except for exceptional outcomes such as “No action needed.”

Urgent reports immediately show approved patient instructions while creating a parallel nurse alert. Unclaimed urgent alerts repeat after a configurable interval (30 minutes only as a synthetic-testing placeholder) and later escalate to a configured backup nurse/coordinator.

Nurse alerts appear in the dashboard and trigger email without sensitive details.

## Emergency access
The app always states that it is not continuously monitored and exposes “Get help now” from every patient screen:
- Call emergency services
- Call oncology team
- View after-hours instructions

Content and numbers are administrator-configurable and require clinical approval.

## Notifications
Patients receive PWA push notifications, see pending check-ins in-app, and may use email as an early-testing fallback.

## Accessibility and resilience
- English only in V1, with translation-ready text architecture.
- Large readable text, strong contrast, simple navigation, captions, and screen-reader support.
- Internet required, but an unfinished check-in survives a brief connection interruption.
- One standard character; no customization in V1.

## Research and lifecycle
- Store operational identity/contact fields separately from study IDs.
- Standard CSV exports use study IDs and exclude identifiers, authentication data, and security logs.
- Conversation transcripts require a separate explicitly authorized de-identification export.
- Normal actions archive/deactivate/withdraw rather than permanently delete.
- Withdrawal immediately stops access and notifications while retaining records according to the approved protocol.
- Development and testing use synthetic data until institutional approval and HIPAA-appropriate hosting are confirmed.
