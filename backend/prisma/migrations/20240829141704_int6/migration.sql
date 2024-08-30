/*
  Warnings:

  - Added the required column `stdId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "stdId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Standards" (
    "id" SERIAL NOT NULL,
    "std" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "miscellaneous" (
    "id" SERIAL NOT NULL,
    "number_of_hostel_bed" INTEGER NOT NULL,
    "Installment_one" INTEGER NOT NULL,
    "Installment_two" INTEGER NOT NULL,
    "Installment_three" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Standards_id_key" ON "Standards"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Standards_std_key" ON "Standards"("std");

-- CreateIndex
CREATE UNIQUE INDEX "miscellaneous_id_key" ON "miscellaneous"("id");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_stdId_fkey" FOREIGN KEY ("stdId") REFERENCES "Standards"("std") ON DELETE RESTRICT ON UPDATE CASCADE;
