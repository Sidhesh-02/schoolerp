/*
  Warnings:

  - A unique constraint covering the columns `[installments]` on the table `Installments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Installments_installments_key" ON "Installments"("installments");
