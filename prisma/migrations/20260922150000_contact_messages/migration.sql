-- Phase 7B: contact form submissions. Additive, plus one guarded data change at the end.

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "sendError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMessage_ip_createdAt_idx" ON "ContactMessage"("ip", "createdAt");


-- The Research range has no products and is replaced in the navigation by the /research
-- page. Unpublish it once, only while it is still the seeded, empty, published range; a
-- collection the client has since filled or edited is left alone.
UPDATE "Collection"
SET "status" = 'DRAFT', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'research'
  AND "kind" = 'RANGE'
  AND "status" = 'PUBLISHED'
  AND NOT EXISTS (SELECT 1 FROM "ProductCollection" pc WHERE pc."collectionId" = "Collection"."id");
