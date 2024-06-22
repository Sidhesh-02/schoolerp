/*
  Warnings:

  - Added the required column `subjectName` to the `Marks` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `examinationType` on the `Marks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Marks" ADD COLUMN     "subjectName" TEXT NOT NULL,
DROP COLUMN "examinationType",
ADD COLUMN     "examinationType" TEXT NOT NULL,
ALTER COLUMN "percentage" DROP DEFAULT;
