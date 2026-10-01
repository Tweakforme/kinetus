-- Mike's change list (092926): the order confirmation page's Payment Instructions come
-- from StoreSetting. Four nullable text columns, empty until the client supplies them, and
-- the e-Transfer email defaults to info@kinetusbiolabs.ca: the column default for new
-- rows, and a one-off fill of the existing settings row while it is still empty. Both are
-- editable (and clearable) in Admin > Settings.

-- AlterTable
ALTER TABLE "StoreSetting" ALTER COLUMN "etransferEmail" SET DEFAULT 'info@kinetusbiolabs.ca',
ADD COLUMN     "holdPeriodText" TEXT,
ADD COLUMN     "payeeName" TEXT,
ADD COLUMN     "securityAnswer" TEXT,
ADD COLUMN     "securityQuestion" TEXT;

-- Existing settings row: the default e-Transfer email while none is set.
UPDATE "StoreSetting" SET "etransferEmail" = 'info@kinetusbiolabs.ca' WHERE "etransferEmail" IS NULL;
