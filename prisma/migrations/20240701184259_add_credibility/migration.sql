/*
  Warnings:

  - A unique constraint covering the columns `[noUrut]` on the table `candidate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pinCode]` on the table `pin` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `candidate` ADD COLUMN `credibility` VARCHAR(100) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `candidate_noUrut_key` ON `candidate`(`noUrut`);

-- CreateIndex
CREATE UNIQUE INDEX `pin_pinCode_key` ON `pin`(`pinCode`);
