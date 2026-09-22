"use client";

import Image from "next/image";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { CheckboxField, SelectField, TextField } from "@/components/admin/Fields";
import { FormNotice, SaveBar } from "@/components/admin/FormNotice";
import styles from "@/components/admin/admin.module.css";
import type { ImageFormData } from "@/lib/admin/catalogue";
import { fieldId, IDLE_STATE } from "@/lib/admin/forms";
import { saveProductImages } from "./actions";

export type SizeOption = { id: string; label: string; archived: boolean };

type ImagesFormProps = {
  productId: string;
  images: ImageFormData[];
  sizes: SizeOption[];
  acceptTypes: string;
  maxUploadBytes: number;
  maxUploadLabel: string;
};

const PRODUCT_LEVEL = "All sizes without their own image";

/**
 * Product images: alt text (required), which size each image belongs to, order, the
 * primary image, deletion, and one new upload per save.
 */
export function ImagesForm({
  productId,
  images,
  sizes,
  acceptTypes,
  maxUploadBytes,
  maxUploadLabel,
}: ImagesFormProps) {
  const [state, formAction] = useActionState(saveProductImages, IDLE_STATE);
  const [localErrors, setLocalErrors] = useState<Record<string, string> | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const altInput = useRef<HTMLInputElement | null>(null);

  // Checked before anything is sent, so the chosen file is kept and an oversized file never
  // reaches the server (which refuses request bodies over its limit). The server repeats
  // both checks for browsers without JavaScript.
  function checkNewImage(event: FormEvent<HTMLFormElement>) {
    const file = fileInput.current?.files?.[0];
    const alt = altInput.current?.value.trim() ?? "";
    const found: Record<string, string> = {};
    if (file && file.size > maxUploadBytes) {
      found.newImage = `New image: that file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${maxUploadLabel}.`;
    }
    if (file && alt === "") {
      found["newImage.alt"] =
        "New image: describe it. Alt text is required before an image can be uploaded.";
    }
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      setLocalErrors(found);
      (found.newImage ? fileInput : altInput).current?.focus();
    } else {
      setLocalErrors(null);
    }
  }

  const echoed = state.status === "error" ? state.values : undefined;
  const errors: Record<string, string | undefined> = {
    ...(state.errors ?? {}),
    ...(localErrors ?? {}),
  };
  const sizeOptions = [
    { value: "", label: PRODUCT_LEVEL },
    ...sizes.map((size) => ({
      value: size.id,
      label: size.archived ? `${size.label} (archived size)` : size.label,
    })),
  ];
  const sizeLabel = (id: string) => sizes.find((size) => size.id === id)?.label ?? PRODUCT_LEVEL;
  const noticeState = localErrors
    ? { status: "error" as const, message: "The new image was not uploaded.", errors: localErrors }
    : state;

  return (
    <form action={formAction} onSubmit={checkNewImage} noValidate>
      <section className={styles.panel} aria-labelledby="images-heading">
        <h2 id="images-heading" className={styles.panelTitle}>
          Images
        </h2>
        <p className={styles.panelIntro}>
          A render printed with a strength belongs to that size: the product page shows it only when
          that size is selected. A size with no image of its own shows the images set to “
          {PRODUCT_LEVEL}”. The primary image comes first, then lower order numbers.
        </p>
        <FormNotice state={noticeState} />

        <SizeCoverage images={images} sizes={sizes} />

        {images.length === 0 ? (
          <p className={styles.hint}>No images yet. Upload the first one below.</p>
        ) : (
          <ul className={styles.cards} key={state.savedAt ?? "initial"}>
            {images.map((image, index) => {
              const field = (name: string) => `images.${image.id}.${name}`;
              const value = (name: string, saved: string) => echoed?.[field(name)] ?? saved;
              const primaryId = echoed
                ? echoed.primaryImageId
                : images.find((item) => item.isPrimary)?.id;
              return (
                <li key={image.id} className={`${styles.card} ${styles.imageCard}`}>
                  <div className={styles.imagePreview}>
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="220px"
                      className={styles.imagePreviewImage}
                    />
                  </div>
                  <div>
                    <div className={styles.cardHead}>
                      <p className={styles.checkTitle} style={{ margin: 0 }}>
                        Image {index + 1}:{" "}
                        {image.variantId ? sizeLabel(image.variantId) : PRODUCT_LEVEL}
                      </p>
                    </div>
                    <div className={`${styles.grid} ${styles.grid2}`}>
                      <TextField
                        className={styles.spanAll}
                        label="Alt text"
                        name={field("alt")}
                        required
                        defaultValue={value("alt", image.altText)}
                        error={errors[field("alt")]}
                        maxLength={250}
                        hint="What the image shows, for people who cannot see it. For example: BPC-157 10 mg vial and box."
                      />
                      <SelectField
                        label="Shown for"
                        name={field("variantId")}
                        options={sizeOptions}
                        defaultValue={value("variantId", image.variantId)}
                        error={errors[field("variantId")]}
                      />
                      <TextField
                        label="Order"
                        name={field("order")}
                        inputMode="numeric"
                        mono
                        defaultValue={value("order", image.displayOrder)}
                        error={errors[field("order")]}
                      />
                      <label className={styles.check} htmlFor={fieldId(`primary-${image.id}`)}>
                        <input
                          id={fieldId(`primary-${image.id}`)}
                          type="radio"
                          name="primaryImageId"
                          value={image.id}
                          defaultChecked={primaryId === image.id}
                          className={styles.checkInput}
                        />
                        <span className={styles.checkText}>
                          <span className={styles.checkTitle}>Primary image</span>
                          <span className={styles.hint}>Shown first for its size.</span>
                        </span>
                      </label>
                      <CheckboxField
                        label="Delete this image"
                        name={field("delete")}
                        defaultChecked={echoed ? echoed[field("delete")] === "on" : false}
                        hint="Removed when you save images."
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <fieldset className={`${styles.card} ${styles.cardMuted}`} style={{ marginTop: 20 }}>
          <legend className={styles.cardLegend}>Add an image</legend>
          <div className={`${styles.grid} ${styles.grid2}`}>
            <div className={`${styles.field} ${styles.spanAll}`}>
              <label htmlFor={fieldId("newImage")} className={styles.label}>
                Image file
              </label>
              <input
                ref={fileInput}
                id={fieldId("newImage")}
                name="newImage"
                type="file"
                accept={acceptTypes}
                className={errors.newImage ? `${styles.input} ${styles.invalid}` : styles.input}
                aria-invalid={errors.newImage ? true : undefined}
                aria-describedby={`${fieldId("newImage")}-hint${errors.newImage ? ` ${fieldId("newImage")}-error` : ""}`}
              />
              {errors.newImage && (
                <p id={`${fieldId("newImage")}-error`} className={styles.error}>
                  {errors.newImage}
                </p>
              )}
              <p id={`${fieldId("newImage")}-hint`} className={styles.hint}>
                JPEG, PNG or WebP, up to {maxUploadLabel}. It is resized to 1600 pixels at most and
                converted to WebP when uploaded.
              </p>
            </div>
            <TextField
              className={styles.spanAll}
              label="Alt text"
              name="newImage.alt"
              required
              defaultValue={echoed?.["newImage.alt"] ?? ""}
              error={errors["newImage.alt"]}
              maxLength={250}
              inputRef={(element) => {
                altInput.current = element;
              }}
              hint="Required: the image is not uploaded without it."
            />
            <SelectField
              label="Shown for"
              name="newImage.variantId"
              options={sizeOptions}
              defaultValue={echoed?.["newImage.variantId"] ?? ""}
              error={errors["newImage.variantId"]}
              hint="Choose the size printed on the render. Choose the first option only for an image with no strength on it."
            />
            <TextField
              label="Order"
              name="newImage.order"
              inputMode="numeric"
              mono
              defaultValue={echoed?.["newImage.order"] ?? String(images.length + 1)}
              error={errors["newImage.order"]}
            />
            <CheckboxField
              className={styles.spanAll}
              label="Make it the primary image"
              name="newImage.primary"
              defaultChecked={echoed ? echoed["newImage.primary"] === "on" : false}
            />
          </div>
        </fieldset>
      </section>
      <input type="hidden" name="productId" value={productId} />
      <SaveBar
        state={noticeState}
        label="Save images"
        idleText="Saves the image changes above and uploads the new image, if one is chosen."
      />
    </form>
  );
}

/** Which images each size will show, so a size with nothing to show is obvious. */
function SizeCoverage({ images, sizes }: { images: ImageFormData[]; sizes: SizeOption[] }) {
  const productLevel = images.filter((image) => image.variantId === "").length;
  const active = sizes.filter((size) => !size.archived);
  if (active.length === 0) {
    return null;
  }
  return (
    <ul className={styles.sizeSummary} aria-label="What each size shows">
      {active.map((size) => {
        const own = images.filter((image) => image.variantId === size.id).length;
        let text: string;
        let warn = false;
        if (own > 0) {
          text = `${own} image${own === 1 ? "" : "s"} of its own`;
        } else if (productLevel > 0) {
          text = `no image of its own; shows the ${productLevel === 1 ? "image" : `${productLevel} images`} for all sizes`;
        } else {
          text = "no image to show: upload one or add an image for all sizes";
          warn = true;
        }
        return (
          <li key={size.id} className={warn ? styles.sizeSummaryWarn : undefined}>
            <strong>{size.label}:</strong> {text}
          </li>
        );
      })}
    </ul>
  );
}
