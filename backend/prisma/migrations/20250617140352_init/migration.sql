-- CreateTable
CREATE TABLE `evaluations` (
    `id` VARCHAR(191) NOT NULL,
    `taskName` VARCHAR(191) NOT NULL,
    `submissionType` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `score` INTEGER NOT NULL,
    `feedback` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
