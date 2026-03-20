-- AlterTable
ALTER TABLE "User" ADD COLUMN     "OTPExpiry" TIMESTAMP(3),
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false;
