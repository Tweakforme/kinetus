"use client";

import { useActionState } from "react";
import { CheckboxField, TextField } from "@/components/admin/Fields";
import { FormNotice, SaveBar } from "@/components/admin/FormNotice";
import styles from "@/components/admin/admin.module.css";
import { IDLE_STATE } from "@/lib/admin/forms";
import { saveStoreSettings, saveTaxRates } from "./actions";

export type SettingsData = {
  taxEnabled: boolean;
  gstNumber: string;
  shippingFlat: string;
  freeShippingThreshold: string;
  localFreeCity: string;
  shipsInternationally: boolean;
};

export type TaxRateRow = {
  id: string;
  province: string;
  label: string;
  rate: string;
  isActive: boolean;
};

export function StoreSettingsForm({ settings }: { settings: SettingsData }) {
  const [state, formAction] = useActionState(saveStoreSettings, IDLE_STATE);
  const echoed = state.status === "error" ? state.values : undefined;
  const value = (name: keyof SettingsData, saved: string) => echoed?.[name] ?? saved;
  const checked = (name: keyof SettingsData, saved: boolean) =>
    echoed ? echoed[name] === "on" : saved;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} noValidate>
      <section className={styles.panel} aria-labelledby="store-heading">
        <h2 id="store-heading" className={styles.panelTitle}>
          Tax and shipping
        </h2>
        <FormNotice state={state} />
        <div key={state.savedAt ?? "initial"}>
          <h3 className={styles.subTitle}>Sales tax</h3>
          <div className={`${styles.notice} ${styles.noticeInfo}`}>
            <p>
              Sales tax in Canada is charged based on the customer&apos;s province, and this should
              stay switched off until the business confirms it is registered to collect GST/HST.
            </p>
          </div>
          <div className={`${styles.grid} ${styles.grid2}`}>
            <CheckboxField
              label="Charge sales tax"
              name="taxEnabled"
              defaultChecked={checked("taxEnabled", settings.taxEnabled)}
              error={errors.taxEnabled}
              hint="Leave this off until the accountant confirms the GST/HST registration."
            />
            <TextField
              label="GST/HST registration number"
              name="gstNumber"
              mono
              defaultValue={value("gstNumber", settings.gstNumber)}
              error={errors.gstNumber}
              hint="For example 123456789RT0001. Required before tax can be switched on."
            />
          </div>

          <h3 className={styles.subTitle}>Shipping</h3>
          <div className={`${styles.grid} ${styles.grid2}`}>
            <TextField
              label="Flat shipping charge"
              name="shippingFlat"
              prefix="$"
              inputMode="decimal"
              mono
              defaultValue={value("shippingFlat", settings.shippingFlat)}
              error={errors.shippingFlat}
            />
            <TextField
              label="Free shipping on orders over"
              name="freeShippingThreshold"
              prefix="$"
              inputMode="decimal"
              mono
              defaultValue={value("freeShippingThreshold", settings.freeShippingThreshold)}
              error={errors.freeShippingThreshold}
              hint="Canada only."
            />
            <TextField
              label="City with free local shipping"
              name="localFreeCity"
              defaultValue={value("localFreeCity", settings.localFreeCity)}
              error={errors.localFreeCity}
            />
            <CheckboxField
              label="Ship outside Canada"
              name="shipsInternationally"
              defaultChecked={checked("shipsInternationally", settings.shipsInternationally)}
              hint="Off: orders ship within Canada only."
            />
          </div>
        </div>
      </section>
      <SaveBar state={state} label="Save settings" idleText="Saves tax and shipping settings." />
    </form>
  );
}

export function TaxRatesForm({ rates }: { rates: TaxRateRow[] }) {
  const [state, formAction] = useActionState(saveTaxRates, IDLE_STATE);
  const echoed = state.status === "error" ? state.values : undefined;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} noValidate>
      <section className={styles.panel} aria-labelledby="rates-heading">
        <h2 id="rates-heading" className={styles.panelTitle}>
          Tax rates by province
        </h2>
        <p className={styles.panelIntro}>
          The combined rate charged for each province or territory, used only when sales tax is
          switched on above. Rates are held to two decimal places, so Quebec&apos;s 14.975% (GST 5%
          plus QST 9.975%) is 14.97%. Confirm every rate with the accountant before switching tax
          on.
        </p>
        <FormNotice state={state} />
        <ul className={styles.cards} key={state.savedAt ?? "initial"}>
          {rates.map((rate) => {
            const name = (field: string) => `rates.${rate.id}.${field}`;
            return (
              <li key={rate.id}>
                <fieldset className={styles.card}>
                  <legend className={styles.cardLegend}>
                    <span className={styles.mono}>{rate.province}</span>
                  </legend>
                  <div className={`${styles.grid} ${styles.grid3}`}>
                    <TextField
                      label="Label"
                      name={name("label")}
                      required
                      defaultValue={echoed?.[name("label")] ?? rate.label}
                      error={errors[name("label")]}
                    />
                    <TextField
                      label="Rate (percent)"
                      name={name("rate")}
                      required
                      inputMode="decimal"
                      mono
                      defaultValue={echoed?.[name("rate")] ?? rate.rate}
                      error={errors[name("rate")]}
                      hint="For example 13.00."
                    />
                    <CheckboxField
                      label="In use"
                      name={name("isActive")}
                      defaultChecked={echoed ? echoed[name("isActive")] === "on" : rate.isActive}
                    />
                  </div>
                </fieldset>
              </li>
            );
          })}
        </ul>
      </section>
      <SaveBar state={state} label="Save tax rates" idleText="Saves every rate above." />
    </form>
  );
}
