import type { Metadata } from "next";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { bpsToInput, centsToInput } from "@/lib/admin/forms";
import { prisma } from "@/lib/db";
import { StoreSettingsForm, TaxRatesForm } from "./SettingsForms";

export const metadata: Metadata = { title: "Settings" };

/** Province order for the rates list: alphabetical by code, as seeded. */
const PROVINCE_ORDER = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
];

/** /admin/settings: the single store settings row and the provincial tax rates. */
export default async function SettingsPage() {
  await requireAdmin();
  const [settings, rates] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: "store" } }),
    prisma.taxRate.findMany(),
  ]);
  rates.sort(
    (a, b) =>
      PROVINCE_ORDER.indexOf(a.province) - PROVINCE_ORDER.indexOf(b.province) ||
      a.province.localeCompare(b.province),
  );

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageIntro}>Sales tax and shipping.</p>
        </div>
      </div>

      <div className={`${styles.notice} ${styles.noticeInfo}`}>
        <p>
          These are configuration only: nothing on the site reads them yet. The shipping line at the
          top of every page and the Shipping Policy are fixed text and do not change when these
          values do.
        </p>
      </div>

      <StoreSettingsForm
        settings={{
          taxEnabled: settings?.taxEnabled ?? false,
          gstNumber: settings?.gstNumber ?? "",
          shippingFlat: centsToInput(settings?.shippingFlatCents ?? 2000),
          freeShippingThreshold: centsToInput(settings?.freeShippingThresholdCents ?? 19900),
          localFreeCity: settings?.localFreeCity ?? "",
          shipsInternationally: settings?.shipsInternationally ?? false,
        }}
      />
      <TaxRatesForm
        rates={rates.map((rate) => ({
          id: rate.id,
          province: rate.province,
          label: rate.label,
          rate: bpsToInput(rate.rateBps),
          isActive: rate.isActive,
        }))}
      />
    </>
  );
}
