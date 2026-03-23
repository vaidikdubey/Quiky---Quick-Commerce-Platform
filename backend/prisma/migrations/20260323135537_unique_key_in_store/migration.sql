/*
  Warnings:

  - A unique constraint covering the columns `[managerId,name,address,pincode]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Store_managerId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Store_managerId_name_address_pincode_key" ON "Store"("managerId", "name", "address", "pincode");
