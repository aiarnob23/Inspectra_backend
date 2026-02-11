-- CreateEnum
CREATE TYPE "clientStatus" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "status" "clientStatus" NOT NULL DEFAULT 'active';
