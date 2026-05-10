/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `Bundle` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `File` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BundleStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'DELETED');

-- CreateEnum
CREATE TYPE "StorageMode" AS ENUM ('OFF', 'WARN_ONLY', 'ENFORCED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FileStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "FileStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "Bundle" DROP COLUMN "isDeleted",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "status" "BundleStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "File" DROP COLUMN "isDeleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "StorageUsage" (
    "id" TEXT NOT NULL,
    "totalUsedBytes" BIGINT NOT NULL DEFAULT 0,
    "limitBytes" BIGINT,
    "warningThresholdBytes" BIGINT,
    "mode" "StorageMode" NOT NULL DEFAULT 'OFF',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bundle_status_idx" ON "Bundle"("status");

-- CreateIndex
CREATE INDEX "Bundle_expiresAt_idx" ON "Bundle"("expiresAt");

-- CreateIndex
CREATE INDEX "File_status_idx" ON "File"("status");

-- CreateIndex
CREATE INDEX "File_expiresAt_idx" ON "File"("expiresAt");
