-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ActivationStatus" AS ENUM ('UNUSED', 'USED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AlertPriority" AS ENUM ('ATTENTION_NEEDED', 'URGENT');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('STAFF', 'PATIENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "StaffUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "StaffUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientIdentity" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyParticipant" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "enrolledById" TEXT NOT NULL,
    "consentConfirmed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivationCode" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "status" "ActivationStatus" NOT NULL DEFAULT 'UNUSED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDevice" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientSession" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmaResponse" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "occurrenceKey" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmaResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientClarification" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "emaResponseId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientClarification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "priority" "AlertPriority" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'NEW',
    "summary" TEXT NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "claimedById" TEXT,
    "claimedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "closureOutcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertEvidence" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "emaResponseId" TEXT NOT NULL,
    "signal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "participantId" TEXT,
    "staffUserId" TEXT,
    "actorType" "ActorType" NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffUser_email_key" ON "StaffUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudyParticipant_studyId_key" ON "StudyParticipant"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyParticipant_identityId_key" ON "StudyParticipant"("identityId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_participantId_key" ON "Enrollment"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivationCode_codeHash_key" ON "ActivationCode"("codeHash");

-- CreateIndex
CREATE UNIQUE INDEX "PatientSession_tokenHash_key" ON "PatientSession"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "EmaResponse_participantId_occurrenceKey_key" ON "EmaResponse"("participantId", "occurrenceKey");

-- CreateIndex
CREATE INDEX "Alert_participantId_status_idx" ON "Alert"("participantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AlertEvidence_alertId_emaResponseId_signal_key" ON "AlertEvidence"("alertId", "emaResponseId", "signal");

-- AddForeignKey
ALTER TABLE "StudyParticipant" ADD CONSTRAINT "StudyParticipant_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "PatientIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudyParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_enrolledById_fkey" FOREIGN KEY ("enrolledById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivationCode" ADD CONSTRAINT "ActivationCode_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDevice" ADD CONSTRAINT "PatientDevice_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudyParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSession" ADD CONSTRAINT "PatientSession_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudyParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientSession" ADD CONSTRAINT "PatientSession_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "PatientDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmaResponse" ADD CONSTRAINT "EmaResponse_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudyParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientClarification" ADD CONSTRAINT "PatientClarification_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudyParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientClarification" ADD CONSTRAINT "PatientClarification_emaResponseId_fkey" FOREIGN KEY ("emaResponseId") REFERENCES "EmaResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudyParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvidence" ADD CONSTRAINT "AlertEvidence_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvidence" ADD CONSTRAINT "AlertEvidence_emaResponseId_fkey" FOREIGN KEY ("emaResponseId") REFERENCES "EmaResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudyParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
