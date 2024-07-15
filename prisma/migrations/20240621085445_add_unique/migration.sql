/*
  Warnings:

  - A unique constraint covering the columns `[nfcSerialNumber]` on the table `voter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[NIK]` on the table `voter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `voter_nfcSerialNumber_key` ON `voter`(`nfcSerialNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `voter_NIK_key` ON `voter`(`NIK`);
