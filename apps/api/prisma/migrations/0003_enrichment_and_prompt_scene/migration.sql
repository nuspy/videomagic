-- User enrichment
ALTER TABLE `User`
  ADD COLUMN `pictureUrl` VARCHAR(191) NULL,
  ADD COLUMN `locale` VARCHAR(8) NULL,
  ADD COLUMN `lastLoginAt` DATETIME(3) NULL,
  ADD COLUMN `company` VARCHAR(191) NULL,
  ADD COLUMN `phone` VARCHAR(64) NULL,
  ADD COLUMN `marketingConsent` BOOLEAN NOT NULL DEFAULT 0,
  ADD COLUMN `privacyConsentAt` DATETIME(3) NULL;

-- Lead linkage to User
ALTER TABLE `Lead`
  ADD COLUMN `userId` VARCHAR(191) NULL;

CREATE INDEX `Lead_userId_idx` ON `Lead`(`userId`);
ALTER TABLE `Lead`
  ADD CONSTRAINT `Lead_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Media enrichments
ALTER TABLE `Media`
  ADD COLUMN `sceneIndex` INT NULL,
  ADD COLUMN `durationSec` INT NULL,
  ADD COLUMN `posterUrl` VARCHAR(512) NULL,
  ADD COLUMN `sourceUrl` VARCHAR(1024) NULL,
  ADD COLUMN `checksum` VARCHAR(128) NULL,
  ADD COLUMN `provider` VARCHAR(32) NULL;

-- PromptRole enum via Prisma enum handled in schema (no SQL for MySQL/MariaDB enum unless needed)

-- PromptVersion
CREATE TABLE `PromptVersion` (
  `id` VARCHAR(191) NOT NULL,
  `leadId` VARCHAR(191) NOT NULL,
  `scriptId` VARCHAR(191) NULL,
  `provider` ENUM('OPENAI','GEMINI') NOT NULL,
  `model` VARCHAR(64) NOT NULL,
  `temperature` DOUBLE NOT NULL,
  `negativePrompt` TEXT NULL,
  `locale` VARCHAR(8) NOT NULL,
  `role` ENUM('AI_SUGGESTED','USER_EDITED') NOT NULL,
  `promptPayloadJson` JSON NOT NULL,
  `contentText` LONGTEXT NOT NULL,
  `sceneCount` INT NOT NULL,
  `durationSec` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `PromptVersion_leadId_idx`(`leadId`),
  INDEX `PromptVersion_scriptId_idx`(`scriptId`),
  CONSTRAINT `PromptVersion_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `PromptVersion_scriptId_fkey` FOREIGN KEY (`scriptId`) REFERENCES `Script`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ScenePreview
CREATE TABLE `ScenePreview` (
  `id` VARCHAR(191) NOT NULL,
  `leadId` VARCHAR(191) NOT NULL,
  `sceneIndex` INT NOT NULL,
  `mediaId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ScenePreview_lead_scene_idx`(`leadId`, `sceneIndex`),
  CONSTRAINT `ScenePreview_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ScenePreview_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
