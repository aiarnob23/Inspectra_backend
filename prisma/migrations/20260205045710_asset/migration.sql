/*
  Warnings:

  - Added the required column `location` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL;
