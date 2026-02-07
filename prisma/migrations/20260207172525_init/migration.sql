/*
  Warnings:

  - Added the required column `status` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('pending', 'processing', 'failed', 'success');

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "status" "ReminderStatus" NOT NULL;
