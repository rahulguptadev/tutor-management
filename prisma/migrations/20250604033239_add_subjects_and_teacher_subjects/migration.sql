/*
  Warnings:

  - You are about to drop the column `subject` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `subjects` on the `Teacher` table. All the data in the column will be lost.
  - Added the required column `subjectId` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'SUBJECT_CREATED';
ALTER TYPE "ActivityType" ADD VALUE 'SUBJECT_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'SUBJECT_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'TEACHER_SUBJECT_ADDED';
ALTER TYPE "ActivityType" ADD VALUE 'TEACHER_SUBJECT_REMOVED';

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSubject" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSubject_teacherId_subjectId_key" ON "TeacherSubject"("teacherId", "subjectId");

-- Migrate existing subjects
INSERT INTO "Subject" ("id", "name", "createdAt", "updatedAt")
SELECT DISTINCT 
  'sub_' || gen_random_uuid(),
  subject,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Class"
WHERE subject IS NOT NULL;

-- Migrate teacher subjects
INSERT INTO "TeacherSubject" ("id", "teacherId", "subjectId", "createdAt", "updatedAt")
SELECT DISTINCT
  'ts_' || gen_random_uuid(),
  t.id as teacherId,
  s.id as subjectId,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Teacher" t
CROSS JOIN LATERAL unnest(t.subjects) as subject_name
JOIN "Subject" s ON s.name = subject_name;

-- Add subjectId to Class table
ALTER TABLE "Class" ADD COLUMN "subjectId" TEXT;

-- Update Class table with subject IDs
UPDATE "Class" c
SET "subjectId" = s.id
FROM "Subject" s
WHERE c.subject = s.name;

-- Make subjectId required
ALTER TABLE "Class" ALTER COLUMN "subjectId" SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old columns
ALTER TABLE "Class" DROP COLUMN "subject";
ALTER TABLE "Teacher" DROP COLUMN "subjects";
