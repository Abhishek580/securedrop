/*
  Warnings:

  - You are about to drop the column `fileId` on the `ShareLink` table. All the data in the column will be lost.
  - Added the required column `bundleId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `File` table without a default value. This is not possible if the table is not empty.
  - Made the column `mimeType` on table `File` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `File` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `bundleId` to the `ShareLink` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PENDING', 'UPLOADING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_fileId_fkey";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "bundleId" TEXT NOT NULL,
ADD COLUMN     "status" "FileStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "mimeType" SET NOT NULL,
ALTER COLUMN "size" SET NOT NULL,
ALTER COLUMN "storageKey" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ShareLink" DROP COLUMN "fileId",
ADD COLUMN     "bundleId" TEXT NOT NULL,
ALTER COLUMN "expiresAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShareLink_bundleId_idx" ON "ShareLink"("bundleId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
