-- Add new fields to User
ALTER TABLE `User`
  ADD COLUMN `previewQuotaUsed` INT NOT NULL DEFAULT 0,
  ADD COLUMN `previewQuotaResetAt` DATETIME(3) NULL,
  ADD COLUMN `googleId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `User_googleId_key` ON `User`(`googleId`);

-- Create Lead
CREATE TABLE `Lead` (
  `id` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `language` VARCHAR(8) NOT NULL,
  `contactEmail` VARCHAR(191) NOT NULL,
  `answers0` JSON NULL,
  `answers1` JSON NULL,
  `answers2` JSON NULL,
  `answers3` JSON NULL,
  `answers4` JSON NULL,
  `answers5` JSON NULL,
  `answers6` JSON NULL,
  `answers7` JSON NULL,
  `answers8` JSON NULL,
  `answers9` JSON NULL,
  `form` JSON NULL,
  `totalDurationSec` INT NOT NULL,
  `scenesCount` INT NOT NULL,
  `aiProvider` VARCHAR(32) NOT NULL,
  `aiModel` VARCHAR(64) NOT NULL,
  `temperature` DOUBLE NOT NULL DEFAULT 0.7,
  `negativePrompt` TEXT NULL,
  `status` ENUM('DRAFT','SUBMITTED','SCRIPT_READY','ACCEPTED') NOT NULL DEFAULT 'DRAFT',
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Alter Media to add required fields (keep legacy columns)
ALTER TABLE `Media`
  ADD COLUMN `leadId` VARCHAR(191) NOT NULL,
  ADD COLUMN `type` ENUM('IMAGE','VIDEO') NOT NULL,
  ADD COLUMN `filename` VARCHAR(191) NOT NULL,
  ADD COLUMN `sizeBytes` INT NOT NULL,
  ADD COLUMN `storageKey` VARCHAR(191) NOT NULL,
  ADD COLUMN `publicUrl` VARCHAR(512) NOT NULL,
  ADD COLUMN `thumb360Url` VARCHAR(512) NULL,
  ADD COLUMN `uploaderSessionId` VARCHAR(191) NULL;

CREATE INDEX `Media_leadId_idx` ON `Media`(`leadId`);
CREATE INDEX `Media_storageKey_idx` ON `Media`(`storageKey`);

ALTER TABLE `Media`
  ADD CONSTRAINT `Media_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Script
CREATE TABLE `Script` (
  `id` VARCHAR(191) NOT NULL,
  `leadId` VARCHAR(191) NOT NULL,
  `provider` ENUM('OPENAI','GEMINI') NOT NULL,
  `model` VARCHAR(64) NOT NULL,
  `language` VARCHAR(8) NOT NULL,
  `rawPrompt` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `editableJson` JSON NOT NULL,
  `status` ENUM('GENERATED','EDITED','ACCEPTED') NOT NULL DEFAULT 'GENERATED',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Script_leadId_idx`(`leadId`),
  CONSTRAINT `Script_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Alter Order to new business fields
ALTER TABLE `Order`
  ADD COLUMN `leadId` VARCHAR(191) NULL,
  ADD COLUMN `pricingJson` JSON NOT NULL,
  ADD COLUMN `status` ENUM('DRAFT','PAYING','PAID','FAILED') NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN `provider` ENUM('STRIPE','PAYPAL') NULL,
  DROP COLUMN `total`,
  DROP COLUMN `taxAmount`;
-- Ensure currency length stays 3
ALTER TABLE `Order` MODIFY `currency` VARCHAR(3) NOT NULL;

CREATE INDEX `Order_leadId_idx` ON `Order`(`leadId`);
ALTER TABLE `Order`
  ADD CONSTRAINT `Order_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter Payment payload field name
ALTER TABLE `Payment`
  CHANGE COLUMN `rawPayload` `payloadJson` JSON NOT NULL;

-- Replace AuditLog shape (keep data by renaming columns if existed)
DROP INDEX IF EXISTS `AuditLog_userId_at_idx` ON `AuditLog`;
ALTER TABLE `AuditLog`
  CHANGE COLUMN `userId` `who` VARCHAR(191) NULL,
  CHANGE COLUMN `action` `what` VARCHAR(191) NOT NULL,
  CHANGE COLUMN `details` `metaJson` JSON NULL,
  CHANGE COLUMN `at` `when` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

CREATE INDEX `AuditLog_who_when_idx` ON `AuditLog`(`who`, `when`);
