-- CreateTable
CREATE TABLE IF NOT EXISTS `DemoServerState` (
    `serverId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Running',
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`serverId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `HiddenDomain` (
    `domainId` VARCHAR(191) NOT NULL,
    `hiddenBy` VARCHAR(191) NULL,
    `hiddenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`domainId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
