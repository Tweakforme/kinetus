-- Phase 9: admin orders. Additive only: the flag that keeps stock moves idempotent.
-- Existing orders start at false, so nothing is restored for an order whose stock was
-- never deducted.

-- AlterTable
ALTER TABLE "OrderRequest" ADD COLUMN     "stockAdjusted" BOOLEAN NOT NULL DEFAULT false;
