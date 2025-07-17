/*
  Warnings:

  - You are about to drop the column `hourlyRate` on the `Teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "hourlyRate",
ADD COLUMN     "education" TEXT,
ADD COLUMN     "qualification" TEXT;
