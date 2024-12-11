/*
  Warnings:

  - Added the required column `Institution_name` to the `Control` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Control" ADD COLUMN     "Institution_name" TEXT NOT NULL;
