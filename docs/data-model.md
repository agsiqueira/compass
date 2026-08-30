# Preliminary Data Model

This is a domain model, not a final Prisma schema.

## Identity and study
- StaffUser
- StaffRole
- PatientIdentity
- StudyParticipant
- Enrollment
- ConsentConfirmation
- PatientDevice
- ActivationCode
- PatientSession
- Withdrawal

## Clinical context
- TreatmentCycle
- TreatmentDate
- EcogAssessment
- EcogSuggestion
- PersonalBaseline

## EMA
- EmaDefinition
- EmaQuestion
- EmaSchedule
- EmaOccurrence
- EmaResponse
- PatientClarification
- SymptomObservation
- FunctionalObservation
- MissedCheckIn

## Conversation and knowledge
- Conversation
- Message
- VoiceTranscription
- CommunicationModeDecision
- KnowledgeDocument
- KnowledgeDocumentVersion
- RetrievedPassage
- AnswerTrace
- UnansweredQuestion

## Alert workflow
- Alert
- AlertEvidence
- AlertClaim
- AlertClosure
- NotificationAttempt
- EscalationAttempt

## Governance and research
- AuditEvent
- StaffNote
- ResearchExport
- DeidentificationRun

## Integrity rules
- Operational identifiers and study identifiers are separated.
- Original patient responses are immutable.
- Corrections and interpretations are appended and attributed.
- Formal ECOG requires clinician confirmation.
- One active alert per patient aggregates evidence.
- Audio is ephemeral; retained data begins with the transcript.
- De-identified exports exclude direct identifiers by default.
