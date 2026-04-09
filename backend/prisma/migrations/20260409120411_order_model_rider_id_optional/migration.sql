-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_riderId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "riderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "RiderProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
