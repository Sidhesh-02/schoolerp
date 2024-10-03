/*
  Warnings:

  - A unique constraint covering the columns `[standard,rollNo,session]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Student_standard_rollNo_key";

-- CreateIndex
CREATE UNIQUE INDEX "Student_standard_rollNo_session_key" ON "Student"("standard", "rollNo", "session");
