-- Cleanup: the contact messages screen. Additive only: one nullable column, set when the
-- client marks a message handled. Existing messages start unhandled.

-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "handledAt" TIMESTAMP(3);
