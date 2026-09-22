-- CreateEnum
CREATE TYPE "CollectionKind" AS ENUM ('RANGE', 'CATEGORY');

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "iconUrl" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "kind" "CollectionKind" NOT NULL DEFAULT 'RANGE',
ADD COLUMN     "subtitle" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "informationSheetUrl" TEXT;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "testReportUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "testReportUrl" TEXT;

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLoginAttempt" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "percentOff" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "maxRedemptions" INTEGER,
    "timesRedeemed" INTEGER NOT NULL DEFAULT 0,
    "stacksWithVolume" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolumeDiscountTier" (
    "id" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "percentOff" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolumeDiscountTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rateBps" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSetting" (
    "id" TEXT NOT NULL DEFAULT 'store',
    "taxEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gstNumber" TEXT,
    "shippingFlatCents" INTEGER NOT NULL DEFAULT 2000,
    "freeShippingThresholdCents" INTEGER NOT NULL DEFAULT 19900,
    "localFreeCity" TEXT DEFAULT 'Calgary',
    "shipsInternationally" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminSession_adminUserId_idx" ON "AdminSession"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AdminLoginAttempt_ip_createdAt_idx" ON "AdminLoginAttempt"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLoginAttempt_email_createdAt_idx" ON "AdminLoginAttempt"("email", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRate_province_key" ON "TaxRate"("province");

-- CreateIndex
CREATE INDEX "ProductImage_variantId_idx" ON "ProductImage"("variantId");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
