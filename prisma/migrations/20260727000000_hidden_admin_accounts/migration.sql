-- CreateTable
CREATE TABLE IF NOT EXISTS `HiddenAdminAccount` (
    `email` VARCHAR(191) NOT NULL,
    `hiddenBy` VARCHAR(191) NULL,
    `hiddenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
