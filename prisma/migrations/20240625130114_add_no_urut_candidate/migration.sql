/*
  Warnings:

  - Added the required column `noUrut` to the `candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `candidate` ADD COLUMN `noUrut` INTEGER NOT NULL;
