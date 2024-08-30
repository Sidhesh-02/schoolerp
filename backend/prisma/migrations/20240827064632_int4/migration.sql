/*
  Warnings:

  - You are about to drop the column `pendingAmount` on the `Fee` table. All the data in the column will be lost.
  - Added the required column `remark` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fee" DROP COLUMN "pendingAmount";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "remark" TEXT NOT NULL;
