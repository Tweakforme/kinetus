-- Phase 8: cart and checkout. Additive only, plus one guarded data correction at the end.

-- AlterTable
ALTER TABLE "OrderRequest" ADD COLUMN     "ageConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "carrier" TEXT,
ADD COLUMN     "codeDiscountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discountCodeUsed" TEXT,
ADD COLUMN     "notificationError" TEXT,
ADD COLUMN     "notificationSentAt" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "shippingCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subtotalCents" INTEGER NOT NULL,
ADD COLUMN     "taxCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxLabel" TEXT,
ADD COLUMN     "taxRateBps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCents" INTEGER NOT NULL,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "volumeDiscountCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderRequestItem" ADD COLUMN     "lineTotalCents" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StoreSetting" ADD COLUMN     "etransferEmail" TEXT,
ADD COLUMN     "etransferInstructions" TEXT,
ADD COLUMN     "orderNotifyEmail" TEXT;

-- CreateTable
CREATE TABLE "OrderSequence" (
    "year" INTEGER NOT NULL,
    "last" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrderSequence_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "CheckoutAttempt" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckoutAttempt_ip_createdAt_idx" ON "CheckoutAttempt"("ip", "createdAt");


-- Nova Scotia HST fell from 15% to 14% on 2025-04-01. Only corrects the seeded value;
-- a rate someone has already edited in the admin is left alone.
UPDATE "TaxRate" SET "rateBps" = 1400, "updatedAt" = CURRENT_TIMESTAMP WHERE "province" = 'NS' AND "rateBps" = 1500;
