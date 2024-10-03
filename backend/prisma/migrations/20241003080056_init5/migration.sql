-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "session" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Control" ALTER COLUMN "session" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Fee" ALTER COLUMN "session" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Hostel" ALTER COLUMN "session" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Marks" ALTER COLUMN "session" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "session" DROP DEFAULT;
