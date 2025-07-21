/*
  Warnings:

  - You are about to drop the `_StudentEnrolledSubjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_StudentEnrolledSubjects" DROP CONSTRAINT "_StudentEnrolledSubjects_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentEnrolledSubjects" DROP CONSTRAINT "_StudentEnrolledSubjects_B_fkey";

-- DropTable
DROP TABLE "_StudentEnrolledSubjects";

-- CreateTable
CREATE TABLE "StudentEnrolledSubject" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StudentEnrolledSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrolledSubject_studentId_subjectId_key" ON "StudentEnrolledSubject"("studentId", "subjectId");

-- AddForeignKey
ALTER TABLE "StudentEnrolledSubject" ADD CONSTRAINT "StudentEnrolledSubject_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrolledSubject" ADD CONSTRAINT "StudentEnrolledSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
