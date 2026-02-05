/*
  Warnings:

  - Added the required column `billingInterval` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('monthly', 'yearly', 'lifetime');

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "billingInterval" "BillingInterval" NOT NULL,
ADD COLUMN     "duration" INTEGER;
