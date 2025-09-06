-- CreateTable
CREATE TABLE "Teacher" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAssessment" (
    "id" SERIAL NOT NULL,
    "studentName" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "meeting1_total" INTEGER NOT NULL,
    "meeting2_total" INTEGER NOT NULL,
    "meeting3_total" INTEGER NOT NULL,
    "total_weekly" INTEGER NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "progress_notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_name_key" ON "Teacher"("name");

-- AddForeignKey
ALTER TABLE "StudentAssessment" ADD CONSTRAINT "StudentAssessment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
