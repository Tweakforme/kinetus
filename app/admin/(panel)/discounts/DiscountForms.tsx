"use client";

import { useActionState } from "react";
import { OnOffBadge } from "@/components/admin/Badges";
import { CheckboxField, TextField } from "@/components/admin/Fields";
import { FormNotice, SaveBar } from "@/components/admin/FormNotice";
import styles from "@/components/admin/admin.module.css";
import { IDLE_STATE, STORE_TIME_ZONE_LABEL } from "@/lib/admin/forms";
import { saveDiscountCodes, saveVolumeTiers } from "./actions";

export type CodeRow = {
  id: string;
  code: string;
  percentOff: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  maxRedemptions: string;
  timesRedeemed: number;
  stacksWithVolume: boolean;
  note: string;
};

export type TierRow = { id: string; minQuantity: string; percentOff: string; isActive: boolean };

const BLANK_CODE: CodeRow = {
  id: "new",
  code: "",
  percentOff: "",
  isActive: false,
  startsAt: "",
  endsAt: "",
  maxRedemptions: "",
  timesRedeemed: 0,
  stacksWithVolume: false,
  note: "",
};

export function DiscountCodesForm({ codes }: { codes: CodeRow[] }) {
  const [state, formAction] = useActionState(saveDiscountCodes, IDLE_STATE);
  const echoed = state.status === "error" ? state.values : undefined;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} noValidate>
      <section className={styles.panel} aria-labelledby="codes-heading">
        <h2 id="codes-heading" className={styles.panelTitle}>
          Discount codes
        </h2>
        <p className={styles.panelIntro}>
          Codes are stored exactly as written and match without regard to capital letters at
          checkout. A code does nothing until it is switched on.
        </p>
        <FormNotice state={state} />
        <ul className={styles.cards} key={state.savedAt ?? "initial"}>
          {[...codes, BLANK_CODE].map((row) => {
            const isNew = row.id === "new";
            const name = (field: string) => `codes.${row.id}.${field}`;
            const value = (field: string, saved: string) => echoed?.[name(field)] ?? saved;
            const checked = (field: string, saved: boolean) =>
              echoed ? echoed[name(field)] === "on" : saved;
            return (
              <li key={row.id}>
                <fieldset className={isNew ? `${styles.card} ${styles.cardMuted}` : styles.card}>
                  <legend className={styles.cardLegend}>
                    {isNew ? (
                      "Add a code"
                    ) : (
                      <>
                        <span className={styles.mono}>{row.code}</span>
                        <OnOffBadge on={row.isActive} onLabel="Switched on" offLabel="Off" />
                      </>
                    )}
                  </legend>
                  <div className={`${styles.grid} ${styles.grid4}`}>
                    <TextField
                      label="Code"
                      name={name("code")}
                      required={!isNew}
                      mono
                      defaultValue={value("code", row.code)}
                      error={errors[name("code")]}
                      maxLength={40}
                    />
                    <TextField
                      label="Percent off"
                      name={name("percentOff")}
                      required={!isNew}
                      inputMode="numeric"
                      mono
                      defaultValue={value("percentOff", row.percentOff)}
                      error={errors[name("percentOff")]}
                      hint="Whole number, 1 to 100."
                    />
                    <TextField
                      label="Starts"
                      name={name("startsAt")}
                      type="datetime-local"
                      defaultValue={value("startsAt", row.startsAt)}
                      error={errors[name("startsAt")]}
                      hint={`${STORE_TIME_ZONE_LABEL}. Blank: from when it is switched on.`}
                    />
                    <TextField
                      label="Ends"
                      name={name("endsAt")}
                      type="datetime-local"
                      defaultValue={value("endsAt", row.endsAt)}
                      error={errors[name("endsAt")]}
                      hint={`${STORE_TIME_ZONE_LABEL}. Blank: no end.`}
                    />
                    <TextField
                      label="Maximum uses"
                      name={name("maxRedemptions")}
                      inputMode="numeric"
                      mono
                      defaultValue={value("maxRedemptions", row.maxRedemptions)}
                      error={errors[name("maxRedemptions")]}
                      hint={
                        isNew
                          ? "Blank: no limit."
                          : `Blank: no limit. Used ${row.timesRedeemed} times so far.`
                      }
                    />
                    <CheckboxField
                      label="Switched on"
                      name={name("isActive")}
                      defaultChecked={checked("isActive", row.isActive)}
                      hint="The code can be used (within its dates)."
                    />
                    <CheckboxField
                      className={styles.span2}
                      label="Combines with the volume discount"
                      name={name("stacksWithVolume")}
                      defaultChecked={checked("stacksWithVolume", row.stacksWithVolume)}
                      hint="Off (the default): the customer receives whichever of the two discounts is larger."
                    />
                    <TextField
                      className={styles.spanAll}
                      label="Note"
                      name={name("note")}
                      defaultValue={value("note", row.note)}
                      error={errors[name("note")]}
                      maxLength={500}
                      hint="For your own reference; customers never see it."
                    />
                    {!isNew && (
                      <CheckboxField
                        className={styles.spanAll}
                        label="Delete this code"
                        name={name("delete")}
                        defaultChecked={checked("delete", false)}
                        hint="Removed when you save."
                      />
                    )}
                  </div>
                </fieldset>
              </li>
            );
          })}
        </ul>
      </section>
      <SaveBar state={state} label="Save codes" idleText="Saves every code above." />
    </form>
  );
}

export function VolumeTiersForm({ tiers }: { tiers: TierRow[] }) {
  const [state, formAction] = useActionState(saveVolumeTiers, IDLE_STATE);
  const echoed = state.status === "error" ? state.values : undefined;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} noValidate>
      <section className={styles.panel} aria-labelledby="tiers-heading">
        <h2 id="tiers-heading" className={styles.panelTitle}>
          Volume discount
        </h2>
        <p className={styles.panelIntro}>
          A percentage off when the customer buys at least a given number of units.
        </p>
        <FormNotice state={state} />
        <ul className={styles.cards} key={state.savedAt ?? "initial"}>
          {[...tiers, { id: "new", minQuantity: "", percentOff: "", isActive: true }].map((row) => {
            const isNew = row.id === "new";
            const name = (field: string) => `tiers.${row.id}.${field}`;
            const value = (field: string, saved: string) => echoed?.[name(field)] ?? saved;
            return (
              <li key={row.id}>
                <fieldset className={isNew ? `${styles.card} ${styles.cardMuted}` : styles.card}>
                  <legend className={styles.cardLegend}>
                    {isNew ? "Add a tier" : `From ${row.minQuantity} units`}
                  </legend>
                  <div className={`${styles.grid} ${styles.grid4}`}>
                    <TextField
                      label="Minimum quantity"
                      name={name("minQuantity")}
                      required={!isNew}
                      inputMode="numeric"
                      mono
                      defaultValue={value("minQuantity", row.minQuantity)}
                      error={errors[name("minQuantity")]}
                      hint="Units in the order, 2 or more."
                    />
                    <TextField
                      label="Percent off"
                      name={name("percentOff")}
                      required={!isNew}
                      inputMode="numeric"
                      mono
                      defaultValue={value("percentOff", row.percentOff)}
                      error={errors[name("percentOff")]}
                      hint="Whole number, 1 to 100."
                    />
                    <CheckboxField
                      label="Switched on"
                      name={name("isActive")}
                      defaultChecked={echoed ? echoed[name("isActive")] === "on" : row.isActive}
                    />
                    {!isNew && (
                      <CheckboxField
                        label="Delete this tier"
                        name={name("delete")}
                        defaultChecked={echoed ? echoed[name("delete")] === "on" : false}
                      />
                    )}
                  </div>
                </fieldset>
              </li>
            );
          })}
        </ul>
      </section>
      <SaveBar state={state} label="Save volume discount" idleText="Saves every tier above." />
    </form>
  );
}
