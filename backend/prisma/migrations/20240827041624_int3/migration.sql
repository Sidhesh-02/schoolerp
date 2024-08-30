/*
  Warnings:

  - A unique constraint covering the columns `[standard,rollNo]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Student_standard_rollNo_key" ON "Student"("standard", "rollNo");
