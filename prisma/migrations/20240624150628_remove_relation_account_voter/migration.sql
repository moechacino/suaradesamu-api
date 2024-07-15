/*
  Warnings:

  - You are about to drop the column `pkey` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `voterId` on the `account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `account` DROP FOREIGN KEY `account_voterId_fkey`;

-- AlterTable
ALTER TABLE `account` DROP COLUMN `pkey`,
    DROP COLUMN `voterId`;
