-- CreateEnum
CREATE TYPE "ExaminationType" AS ENUM ('UnitTest', 'MidTerm', 'Final');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('Passed', 'Failed', 'None');

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rollNo" INTEGER NOT NULL,
    "standard" TEXT NOT NULL,
    "adhaarCardNo" BIGINT NOT NULL,
    "scholarshipApplied" BOOLEAN NOT NULL,
    "remark" TEXT,
    "address" TEXT NOT NULL,
    "photoUrl" TEXT,
    "session" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parent" (
    "id" SERIAL NOT NULL,
    "fatherName" TEXT NOT NULL,
    "fatherOccupation" TEXT NOT NULL,
    "motherName" TEXT NOT NULL,
    "motherOccupation" TEXT NOT NULL,
    "fatherContact" BIGINT NOT NULL,
    "motherContact" BIGINT NOT NULL,
    "address" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fee" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admissionDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" INTEGER NOT NULL,
    "session" TEXT NOT NULL,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "studentName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL,
    "rollNo" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "subjectId" INTEGER,
    "standard" TEXT NOT NULL,
    "subjectName" TEXT,
    "session" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "stdId" TEXT NOT NULL,
    "session" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marks" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "subjectName" TEXT NOT NULL,
    "examinationType" TEXT NOT NULL,
    "obtainedMarks" DOUBLE PRECISION NOT NULL,
    "totalMarks" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "session" TEXT NOT NULL,

    CONSTRAINT "Marks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hostel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rollNo" INTEGER NOT NULL,
    "standard" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "bed_number" INTEGER NOT NULL,
    "session" TEXT NOT NULL,

    CONSTRAINT "Hostel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Standards" (
    "id" SERIAL NOT NULL,
    "std" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Control" (
    "id" SERIAL NOT NULL,
    "number_of_hostel_bed" INTEGER NOT NULL,
    "Installment_one" INTEGER NOT NULL,
    "Installment_two" INTEGER NOT NULL,
    "Installment_three" INTEGER NOT NULL,
    "session" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "status" "StudentStatus" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_adhaarCardNo_key" ON "Student"("adhaarCardNo");

-- CreateIndex
CREATE UNIQUE INDEX "Student_standard_rollNo_session_key" ON "Student"("standard", "rollNo", "session");

-- CreateIndex
CREATE UNIQUE INDEX "Hostel_id_key" ON "Hostel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Hostel_bed_number_key" ON "Hostel"("bed_number");

-- CreateIndex
CREATE UNIQUE INDEX "Hostel_rollNo_standard_key" ON "Hostel"("rollNo", "standard");

-- CreateIndex
CREATE UNIQUE INDEX "Standards_id_key" ON "Standards"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Standards_std_key" ON "Standards"("std");

-- CreateIndex
CREATE UNIQUE INDEX "Control_id_key" ON "Control"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Status_id_key" ON "Status"("id");

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_stdId_fkey" FOREIGN KEY ("stdId") REFERENCES "Standards"("std") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marks" ADD CONSTRAINT "Marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marks" ADD CONSTRAINT "Marks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
