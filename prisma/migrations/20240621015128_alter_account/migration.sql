/*
  Warnings:

  - Added the required column `pkey` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `account` ADD COLUMN `pkey` VARCHAR(300) NOT NULL;
