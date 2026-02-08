/*
  Warnings:

  - Added the required column `scheduledAt` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Reminder_isSent_idx";

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Reminder_isSent_status_idx" ON "Reminder"("isSent", "status");
