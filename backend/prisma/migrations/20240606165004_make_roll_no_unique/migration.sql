/*
  Warnings:

  - A unique constraint covering the columns `[rollNo]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_rollNo_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNo_key" ON "Student"("rollNo");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_rollNo_fkey" FOREIGN KEY ("rollNo") REFERENCES "Student"("rollNo") ON DELETE RESTRICT ON UPDATE CASCADE;
