import type { Metadata } from "next";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { toStoreDateTimeInput } from "@/lib/admin/forms";
import { prisma } from "@/lib/db";
import { DiscountCodesForm, VolumeTiersForm } from "./DiscountForms";

export const metadata: Metadata = { title: "Discounts" };

/** /admin/discounts: the client's codes and the volume tiers, which the cart and checkout apply. */
export default async function DiscountsPage() {
  await requireAdmin();
  const [codes, tiers] = await Promise.all([
    prisma.discountCode.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.volumeDiscountTier.findMany({ orderBy: { minQuantity: "asc" } }),
  ]);

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>Discounts</h1>
          <p className={styles.pageIntro}>Discount codes and the volume discount.</p>
        </div>
      </div>

      <div className={`${styles.notice} ${styles.noticeInfo}`}>
        <p>
          <strong>
            A discount code and the volume discount never combine: a valid code replaces the
            volume discount, and removing the code brings it back.
          </strong>
        </p>
        <p>The cart and checkout apply these to every order.</p>
      </div>

      <DiscountCodesForm
        codes={codes.map((code) => ({
          id: code.id,
          code: code.code,
          percentOff: String(code.percentOff),
          isActive: code.isActive,
          startsAt: toStoreDateTimeInput(code.startsAt),
          endsAt: toStoreDateTimeInput(code.endsAt),
          maxRedemptions: code.maxRedemptions === null ? "" : String(code.maxRedemptions),
          timesRedeemed: code.timesRedeemed,
          note: code.note ?? "",
        }))}
      />
      <VolumeTiersForm
        tiers={tiers.map((tier) => ({
          id: tier.id,
          minQuantity: String(tier.minQuantity),
          percentOff: String(tier.percentOff),
          isActive: tier.isActive,
        }))}
      />
    </>
  );
}
