-- CreateEnum
CREATE TYPE "ReminderMethod" AS ENUM ('email', 'sms', 'both');

-- AlterTable
ALTER TABLE "Inspection" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inspectionId" UUID NOT NULL,
    "method" "ReminderMethod" NOT NULL,
    "additionalNotes" TEXT,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "failedAt" TIMESTAMP(3),
    "failReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder_isSent_idx" ON "Reminder"("isSent");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
