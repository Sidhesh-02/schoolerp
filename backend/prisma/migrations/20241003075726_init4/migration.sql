/*
  Warnings:

  - Added the required column `session` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session` to the `Control` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session` to the `Hostel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session` to the `Marks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "session" TEXT DEFAULT '2024-2025' NOT NULL;

-- AlterTable
ALTER TABLE "Control" ADD COLUMN     "session" TEXT DEFAULT '2024-2025' NOT NULL;

-- AlterTable
ALTER TABLE "Fee" ADD COLUMN     "session" TEXT DEFAULT '2024-2025' NOT NULL;

-- AlterTable
ALTER TABLE "Hostel" ADD COLUMN     "session" TEXT DEFAULT '2024-2025' NOT NULL;

-- AlterTable
ALTER TABLE "Marks" ADD COLUMN     "session" TEXT DEFAULT '2024-2025' NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "session" TEXT DEFAULT '2024-2025' NOT NULL;
