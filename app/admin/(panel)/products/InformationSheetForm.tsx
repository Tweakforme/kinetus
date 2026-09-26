"use client";

import Image from "next/image";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { CheckboxField, TextField } from "@/components/admin/Fields";
import { FormNotice, SaveBar } from "@/components/admin/FormNotice";
import styles from "@/components/admin/admin.module.css";
import { fieldId, IDLE_STATE } from "@/lib/admin/forms";
import { saveInformationSheet } from "./actions";

type InformationSheetFormProps = {
  productId: string;
  productName: string;
  /** The stored sheet, or null when none has been uploaded. */
  sheet: { url: string; alt: string } | null;
  acceptTypes: string;
  maxUploadBytes: number;
  maxUploadLabel: string;
};

/**
 * The product information sheet: the image the product page's Product Information button
 * opens. Upload one (alt text required), replace it, change its alt text or remove it.
 * Without a sheet the product page shows no Product Information button.
 */
export function InformationSheetForm({
  productId,
  productName,
  sheet,
  acceptTypes,
  maxUploadBytes,
  maxUploadLabel,
}: InformationSheetFormProps) {
  const [state, formAction] = useActionState(saveInformationSheet, IDLE_STATE);
  const [localErrors, setLocalErrors] = useState<Record<string, string> | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const altInput = useRef<HTMLInputElement | null>(null);

  // Checked before anything is sent, so the chosen file is kept and an oversized file never
  // reaches the server. The server repeats both checks for browsers without JavaScript.
  function checkSheet(event: FormEvent<HTMLFormElement>) {
    const file = fileInput.current?.files?.[0];
    const alt = altInput.current?.value.trim() ?? "";
    const removing = event.currentTarget.querySelector<HTMLInputElement>(
      "input[name='sheet.remove']",
    )?.checked;
    const found: Record<string, string> = {};
    if (file && file.size > maxUploadBytes) {
      found["sheet.file"] =
        `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${maxUploadLabel}.`;
    }
    if ((file || (sheet && !removing)) && alt === "") {
      found["sheet.alt"] =
        "Describe the sheet. Alt text is required, for example: BPC-157 product information sheet.";
    }
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      setLocalErrors(found);
      (found["sheet.file"] ? fileInput : altInput).current?.focus();
    } else {
      setLocalErrors(null);
    }
  }

  const echoed = state.status === "error" ? state.values : undefined;
  const errors: Record<string, string | undefined> = {
    ...(state.errors ?? {}),
    ...(localErrors ?? {}),
  };
  const noticeState = localErrors
    ? { status: "error" as const, message: "Nothing was saved.", errors: localErrors }
    : state;
  const fileId = fieldId("sheet.file");

  return (
    <form action={formAction} onSubmit={checkSheet} noValidate>
      <section className={styles.panel} aria-labelledby="sheet-heading">
        <h2 id="sheet-heading" className={styles.panelTitle}>
          Product information sheet
        </h2>
        <p className={styles.panelIntro}>
          The image the Product Information button opens on the product page, shown full screen with
          zoom. Without a sheet the button is not shown. It is published exactly as uploaded.
        </p>
        <FormNotice state={noticeState} />

        {/* Keyed on the last save, so the fields reload what was stored. */}
        <div key={state.savedAt ?? "initial"} className={`${styles.card} ${styles.sheetCard}`}>
          {sheet ? (
            <div className={`${styles.imagePreview} ${styles.sheetPreview}`}>
              <Image
                src={sheet.url}
                alt=""
                fill
                sizes="320px"
                unoptimized
                className={styles.imagePreviewImage}
              />
            </div>
          ) : (
            <p className={styles.sheetEmpty}>No sheet yet.</p>
          )}
          <div className={`${styles.grid} ${styles.grid2}`}>
            <div className={`${styles.field} ${styles.spanAll}`}>
              <label htmlFor={fileId} className={styles.label}>
                {sheet ? "Replace with a new file" : "Sheet image"}
              </label>
              <input
                ref={fileInput}
                id={fileId}
                name="sheet.file"
                type="file"
                accept={acceptTypes}
                className={
                  errors["sheet.file"] ? `${styles.input} ${styles.invalid}` : styles.input
                }
                aria-invalid={errors["sheet.file"] ? true : undefined}
                aria-describedby={`${fileId}-hint${errors["sheet.file"] ? ` ${fileId}-error` : ""}`}
              />
              {errors["sheet.file"] && (
                <p id={`${fileId}-error`} className={styles.error}>
                  {errors["sheet.file"]}
                </p>
              )}
              <p id={`${fileId}-hint`} className={styles.hint}>
                JPEG, PNG or WebP, up to {maxUploadLabel}. It is kept at up to 2000 pixels, so small
                print stays readable when zoomed, and converted to WebP when uploaded.
              </p>
            </div>
            <TextField
              className={styles.spanAll}
              label="Alt text"
              name="sheet.alt"
              required
              defaultValue={echoed?.["sheet.alt"] ?? sheet?.alt ?? ""}
              error={errors["sheet.alt"]}
              maxLength={250}
              inputRef={(element) => {
                altInput.current = element;
              }}
              hint={`Required. A plain description, for example: ${productName} product information sheet.`}
            />
            {sheet && (
              <CheckboxField
                className={styles.spanAll}
                label="Remove the sheet"
                name="sheet.remove"
                defaultChecked={echoed ? echoed["sheet.remove"] === "on" : false}
                error={errors["sheet.remove"]}
                hint="Takes the Product Information button off the product page when you save."
              />
            )}
          </div>
        </div>
      </section>
      <input type="hidden" name="productId" value={productId} />
      <SaveBar
        state={noticeState}
        label="Save information sheet"
        idleText={
          sheet
            ? "Saves the alt text, a replacement file or the removal."
            : "Uploads the sheet. The Product Information button then appears on the product page."
        }
      />
    </form>
  );
}
