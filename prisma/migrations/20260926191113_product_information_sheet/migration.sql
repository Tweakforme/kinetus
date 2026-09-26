-- Revision round 1: the product information sheet. Additive only: one nullable column for
-- the sheet image's alt text. The sheet URL column (informationSheetUrl) already exists
-- from Phase 7A and is reused. Existing products start with no sheet.

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "informationSheetAlt" TEXT;
