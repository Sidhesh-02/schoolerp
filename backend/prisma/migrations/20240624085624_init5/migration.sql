/*
  Warnings:

  - You are about to drop the column `studentId` on the `Fee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Fee" DROP CONSTRAINT "Fee_studentId_fkey";

-- AlterTable
ALTER TABLE "Fee" DROP COLUMN "studentId";

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_id_fkey" FOREIGN KEY ("id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
