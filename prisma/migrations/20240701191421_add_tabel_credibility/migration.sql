-- CreateTable
CREATE TABLE `Credibility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `positive` VARCHAR(191) NOT NULL,
    `negative` VARCHAR(191) NOT NULL,
    `date_from` DATETIME(3) NOT NULL,
    `date_to` DATETIME(3) NOT NULL,
    `candidateId` INTEGER NOT NULL,

    UNIQUE INDEX `Credibility_candidateId_key`(`candidateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Credibility` ADD CONSTRAINT `Credibility_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
