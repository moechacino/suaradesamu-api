/*
  Warnings:

  - Added the required column `visi` to the `candidate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `education` DROP FOREIGN KEY `education_candidateId_fkey`;

-- DropForeignKey
ALTER TABLE `organizationexperience` DROP FOREIGN KEY `organizationExperience_candidateId_fkey`;

-- DropForeignKey
ALTER TABLE `workexperience` DROP FOREIGN KEY `workExperience_candidateId_fkey`;

-- DropForeignKey
ALTER TABLE `workplan` DROP FOREIGN KEY `workPlan_candidateId_fkey`;

-- AlterTable
ALTER TABLE `candidate` ADD COLUMN `visi` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `misi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `misi` TEXT NOT NULL,
    `candidateId` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `misi` ADD CONSTRAINT `misi_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workPlan` ADD CONSTRAINT `workPlan_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `education` ADD CONSTRAINT `education_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workExperience` ADD CONSTRAINT `workExperience_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organizationExperience` ADD CONSTRAINT `organizationExperience_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
