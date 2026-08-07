-- CreateTable
CREATE TABLE IF NOT EXISTS `imported_orders` (
    `id` VARCHAR(191) NOT NULL,
    `order_date` DATETIME(3) NOT NULL,
    `order_name` VARCHAR(191) NOT NULL,
    `delivery_charges` DECIMAL(12, 2) NOT NULL,
    `order_total` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `imported_orders_order_date_idx`(`order_date`),
    INDEX `imported_orders_order_name_idx`(`order_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `imported_order_items` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `line_index` INTEGER NOT NULL,
    `item_name` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,

    INDEX `imported_order_items_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `imported_order_items`
  ADD CONSTRAINT `imported_order_items_order_id_fkey`
  FOREIGN KEY (`order_id`) REFERENCES `imported_orders`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
