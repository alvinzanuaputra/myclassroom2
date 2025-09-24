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
    "weekNumber" INTEGER NOT NULL DEFAULT 1,
    "meeting1_kehadiran" INTEGER NOT NULL DEFAULT 1,
    "meeting1_membaca" INTEGER NOT NULL DEFAULT 1,
    "meeting1_kosakata" INTEGER NOT NULL DEFAULT 1,
    "meeting1_pengucapan" INTEGER NOT NULL DEFAULT 1,
    "meeting1_speaking" INTEGER NOT NULL DEFAULT 1,
    "meeting1_total" INTEGER NOT NULL,
    "meeting2_kehadiran" INTEGER NOT NULL DEFAULT 1,
    "meeting2_membaca" INTEGER NOT NULL DEFAULT 1,
    "meeting2_kosakata" INTEGER NOT NULL DEFAULT 1,
    "meeting2_pengucapan" INTEGER NOT NULL DEFAULT 1,
    "meeting2_speaking" INTEGER NOT NULL DEFAULT 1,
    "meeting2_total" INTEGER NOT NULL,
    "meeting3_kehadiran" INTEGER NOT NULL DEFAULT 1,
    "meeting3_membaca" INTEGER NOT NULL DEFAULT 1,
    "meeting3_kosakata" INTEGER NOT NULL DEFAULT 1,
    "meeting3_pengucapan" INTEGER NOT NULL DEFAULT 1,
    "meeting3_speaking" INTEGER NOT NULL DEFAULT 1,
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

-- CreateIndex
CREATE UNIQUE INDEX "StudentAssessment_studentName_className_teacherId_weekNumbe_key" ON "StudentAssessment"("studentName", "className", "teacherId", "weekNumber");

-- AddForeignKey
ALTER TABLE "StudentAssessment" ADD CONSTRAINT "StudentAssessment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
