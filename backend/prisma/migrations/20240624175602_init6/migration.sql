/*
  Warnings:

  - Added the required column `studentId` to the `Fee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Fee" DROP CONSTRAINT "Fee_id_fkey";

-- AlterTable
ALTER TABLE "Fee" ADD COLUMN     "studentId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Hosteldata" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rollNo" INTEGER NOT NULL,
    "standard" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "room_number" INTEGER NOT NULL,
    "bed_number" INTEGER NOT NULL,

    CONSTRAINT "Hosteldata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hosteldata_id_key" ON "Hosteldata"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Hosteldata_bed_number_key" ON "Hosteldata"("bed_number");

-- CreateIndex
CREATE UNIQUE INDEX "Hosteldata_rollNo_standard_key" ON "Hosteldata"("rollNo", "standard");

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
