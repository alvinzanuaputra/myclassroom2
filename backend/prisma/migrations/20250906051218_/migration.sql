/*
  Warnings:

  - A unique constraint covering the columns `[studentName,className,teacherId,weekNumber]` on the table `StudentAssessment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "StudentAssessment" ADD COLUMN     "weekNumber" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "StudentAssessment_studentName_className_teacherId_weekNumbe_key" ON "StudentAssessment"("studentName", "className", "teacherId", "weekNumber");
