/*
  Warnings:

  - You are about to drop the `Hosteldata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `miscellaneous` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Hosteldata";

-- DropTable
DROP TABLE "miscellaneous";

-- CreateTable
CREATE TABLE "Hostel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rollNo" INTEGER NOT NULL,
    "standard" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "bed_number" INTEGER NOT NULL,

    CONSTRAINT "Hostel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Control" (
    "id" SERIAL NOT NULL,
    "number_of_hostel_bed" INTEGER NOT NULL,
    "Installment_one" INTEGER NOT NULL,
    "Installment_two" INTEGER NOT NULL,
    "Installment_three" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Hostel_id_key" ON "Hostel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Hostel_bed_number_key" ON "Hostel"("bed_number");

-- CreateIndex
CREATE UNIQUE INDEX "Hostel_rollNo_standard_key" ON "Hostel"("rollNo", "standard");

-- CreateIndex
CREATE UNIQUE INDEX "Control_id_key" ON "Control"("id");
