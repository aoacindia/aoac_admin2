-- CreateTable
CREATE TABLE IF NOT EXISTS `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderBy` VARCHAR(191) NOT NULL,
    `customerId` INTEGER NULL,
    `orderDate` DATETIME(3) NOT NULL,
    `deliveryCharges` DECIMAL(12, 2) NOT NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Order_orderDate_idx`(`orderDate`),
    INDEX `Order_customerId_idx`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `EmailAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `emailAddress` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `isSuspended` BOOLEAN NOT NULL DEFAULT false,
    `storageUsed` VARCHAR(191) NOT NULL DEFAULT '1 MB',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmailAccount_emailAddress_key`(`emailAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `EmailForward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fromAccountId` INTEGER NOT NULL,
    `toAccountId` INTEGER NULL,
    `toAddress` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmailForward_fromAccountId_idx`(`fromAccountId`),
    INDEX `EmailForward_toAccountId_idx`(`toAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ensure LoginState exists (may already exist from earlier migration)
CREATE TABLE IF NOT EXISTS `LoginState` (
    `email` VARCHAR(191) NOT NULL,
    `attemptCount` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Foreign Keys (ignore errors if already present when re-run manually)
ALTER TABLE `Order`
  ADD CONSTRAINT `Order_customerId_fkey`
  FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_orderId_fkey`
  FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `EmailForward`
  ADD CONSTRAINT `EmailForward_fromAccountId_fkey`
  FOREIGN KEY (`fromAccountId`) REFERENCES `EmailAccount`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `EmailForward`
  ADD CONSTRAINT `EmailForward_toAccountId_fkey`
  FOREIGN KEY (`toAccountId`) REFERENCES `EmailAccount`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
