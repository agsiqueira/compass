-- Additive Milestone 02 lifecycle and EMA persistence changes.
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'WITHDRAWN');

ALTER TABLE "Enrollment"
  ADD COLUMN "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '84 days'),
  ADD COLUMN "withdrawnAt" TIMESTAMP(3);

CREATE TABLE "EmaOccurrence" (
  "id" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "occurrenceKey" TEXT NOT NULL,
  "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closesAt" TIMESTAMP(3) NOT NULL,
  "submittedAt" TIMESTAMP(3),
  "devSynthetic" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmaOccurrence_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EmaResponse" ADD COLUMN "occurrenceId" TEXT;

CREATE TABLE "EmaObservation" (
  "id" TEXT NOT NULL,
  "emaResponseId" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "numericValue" INTEGER,
  "textValue" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmaObservation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmaOccurrence_participantId_occurrenceKey_key" ON "EmaOccurrence"("participantId", "occurrenceKey");
CREATE INDEX "EmaOccurrence_participantId_submittedAt_closesAt_idx" ON "EmaOccurrence"("participantId", "submittedAt", "closesAt");
CREATE UNIQUE INDEX "EmaResponse_occurrenceId_key" ON "EmaResponse"("occurrenceId");
CREATE UNIQUE INDEX "EmaObservation_emaResponseId_metric_key" ON "EmaObservation"("emaResponseId", "metric");
CREATE UNIQUE INDEX "Alert_one_active_per_patient_key" ON "Alert"("participantId") WHERE "status" <> 'CLOSED';

ALTER TABLE "EmaOccurrence" ADD CONSTRAINT "EmaOccurrence_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudyParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmaResponse" ADD CONSTRAINT "EmaResponse_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "EmaOccurrence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmaObservation" ADD CONSTRAINT "EmaObservation_emaResponseId_fkey" FOREIGN KEY ("emaResponseId") REFERENCES "EmaResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
