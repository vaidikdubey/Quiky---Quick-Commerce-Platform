/*
  Warnings:

  - You are about to drop the column `currentLatitue` on the `RiderProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RiderProfile" DROP COLUMN "currentLatitue",
ADD COLUMN     "currentLatitude" DOUBLE PRECISION;
