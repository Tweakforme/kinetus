"use client";

import Image from "next/image";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/admin/Badges";
import { CheckboxField, SelectField, TextArea, TextField } from "@/components/admin/Fields";
import { FormNotice, SaveBar, SubmitButton } from "@/components/admin/FormNotice";
import styles from "@/components/admin/admin.module.css";
import type { CollectionFormData } from "@/lib/admin/catalogue";
import { fieldId, IDLE_STATE, slugify, type FormState } from "@/lib/admin/forms";
import { deleteCollection, saveCollection } from "./actions";

type CollectionFormProps = {
  collection: CollectionFormData;
  acceptTypes: string;
  maxUploadBytes: number;
  maxUploadLabel: string;
};

const KIND_OPTIONS = [
  {
    value: "RANGE",
    label: "Range: one of the menu tabs (Peptides, Blends, Lab Supplies, Research)",
  },
  { value: "CATEGORY", label: "Category: a Shop by Category grouping" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft: not on the site" },
  { value: "PUBLISHED", label: "Published: on the site" },
];

export function CollectionForm({
  collection,
  acceptTypes,
  maxUploadBytes,
  maxUploadLabel,
}: CollectionFormProps) {
  const [state, formAction] = useActionState(saveCollection, IDLE_STATE);
  const [fileErrors, setFileErrors] = useState<Record<string, string> | null>(null);
  const isNew = collection.id === null;

  // An oversized file is refused here, before sending: the server refuses request bodies
  // over its limit without a readable message.
  function checkFiles(event: FormEvent<HTMLFormElement>) {
    const found: Record<string, string> = {};
    for (const [name, label] of [
      ["imageFile", "Image"],
      ["iconFile", "Icon"],
    ]) {
      const input = event.currentTarget.elements.namedItem(name);
      const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
      if (file && file.size > maxUploadBytes) {
        found[name] =
          `${label}: that file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${maxUploadLabel}.`;
      }
    }
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      setFileErrors(found);
    } else {
      setFileErrors(null);
    }
  }

  const shown: FormState = fileErrors
    ? { status: "error", message: "Nothing was saved.", errors: fileErrors }
    : state;

  return (
    <form action={formAction} onSubmit={checkFiles} noValidate>
      <FormNotice state={shown} />
      <CollectionFields
        key={state.savedAt ?? "initial"}
        collection={collection}
        echoed={state.status === "error" ? state.values : undefined}
        errors={{ ...(state.errors ?? {}), ...(fileErrors ?? {}) }}
        isNew={isNew}
        acceptTypes={acceptTypes}
        maxUploadLabel={maxUploadLabel}
      />
      <SaveBar
        state={shown}
        label={isNew ? "Create collection" : "Save changes"}
        idleText="Saves the details, artwork and product list above."
      />
    </form>
  );
}

type FieldsProps = {
  collection: CollectionFormData;
  echoed: Record<string, string> | undefined;
  errors: Record<string, string>;
  isNew: boolean;
  acceptTypes: string;
  maxUploadLabel: string;
};

function CollectionFields({
  collection,
  echoed,
  errors,
  isNew,
  acceptTypes,
  maxUploadLabel,
}: FieldsProps) {
  const value = (name: string, saved: string) => echoed?.[name] ?? saved;
  const slugInput = useRef<HTMLInputElement | null>(null);
  const slugEdited = useRef(!isNew || Boolean(echoed?.slug));
  const added = echoed ? (echoed.addProductIds ?? "").split("\n").filter(Boolean) : [];

  return (
    <>
      <input type="hidden" name="collectionId" value={collection.id ?? ""} />

      <section className={styles.panel} aria-labelledby="collection-details-heading">
        <h2 id="collection-details-heading" className={styles.panelTitle}>
          Details
        </h2>
        <p className={styles.panelIntro}>
          The collection&apos;s name, its address, and whether it is on the site.
        </p>
        <div className={`${styles.grid} ${styles.grid2}`}>
          <TextField
            label="Name"
            name="name"
            required
            defaultValue={value("name", collection.name)}
            error={errors.name}
            maxLength={80}
            onValueInput={(name) => {
              if (!slugEdited.current && slugInput.current) {
                slugInput.current.value = slugify(name);
              }
            }}
          />
          <TextField
            label="Slug (web address)"
            name="slug"
            required
            mono
            prefix="/collections/"
            defaultValue={value("slug", collection.slug)}
            error={errors.slug}
            maxLength={80}
            inputRef={(element) => {
              slugInput.current = element;
            }}
            onValueInput={() => {
              slugEdited.current = true;
            }}
            hint={
              isNew
                ? "Filled in from the name. Lowercase letters, numbers and hyphens."
                : "Changing it changes the page's address. The old address keeps working: it redirects to the new one."
            }
          />
          <SelectField
            className={styles.spanAll}
            label="Kind"
            name="kind"
            options={KIND_OPTIONS}
            defaultValue={value("kind", collection.kind)}
            error={errors.kind}
            hint="A product belongs to one range and to any number of categories."
          />
          <SelectField
            label="Status"
            name="status"
            options={STATUS_OPTIONS}
            defaultValue={value("status", collection.status)}
            error={errors.status}
          />
          <TextField
            label="Order"
            name="displayOrder"
            inputMode="numeric"
            mono
            defaultValue={value("displayOrder", collection.displayOrder)}
            error={errors.displayOrder}
            hint="Lower numbers come first."
          />
          <TextField
            className={styles.spanAll}
            label="Subtitle"
            name="subtitle"
            defaultValue={value("subtitle", collection.subtitle)}
            error={errors.subtitle}
            maxLength={200}
            hint="A short line under the name, where the design uses one."
          />
          <TextArea
            className={styles.spanAll}
            label="Description"
            name="description"
            short
            defaultValue={value("description", collection.description)}
            error={errors.description}
            hint="Describes what the collection contains. Never what the materials do."
          />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="collection-art-heading">
        <h2 id="collection-art-heading" className={styles.panelTitle}>
          Image and icon
        </h2>
        <p className={styles.panelIntro}>
          Optional artwork for this collection. JPEG, PNG or WebP up to {maxUploadLabel}; images are
          resized to 1600 pixels and icons to 512 pixels, then converted to WebP. The site does not
          display collection artwork yet.
        </p>
        <div className={`${styles.grid} ${styles.grid2}`}>
          <ArtworkField
            label="Image"
            fileName="imageFile"
            removeName="removeImage"
            currentUrl={collection.imageUrl}
            acceptTypes={acceptTypes}
            error={errors.imageFile}
            removeChecked={echoed ? echoed.removeImage === "on" : false}
          />
          <ArtworkField
            label="Icon"
            fileName="iconFile"
            removeName="removeIcon"
            currentUrl={collection.iconUrl}
            acceptTypes={acceptTypes}
            error={errors.iconFile}
            removeChecked={echoed ? echoed.removeIcon === "on" : false}
          />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="collection-seo-heading">
        <h2 id="collection-seo-heading" className={styles.panelTitle}>
          Search engine listing
        </h2>
        <p className={styles.panelIntro}>
          Optional. How the page appears in Google and when shared. Left empty, the name and
          description are used.
        </p>
        <div className={styles.grid}>
          <TextField
            label="Search title"
            name="metaTitle"
            defaultValue={value("metaTitle", collection.metaTitle)}
            error={errors.metaTitle}
            guide={{ max: 40 }}
            hint="The site adds “ | Kinetus BioLabs” after it; aim for 40 characters or fewer."
          />
          <TextArea
            label="Search description"
            name="metaDescription"
            short
            defaultValue={value("metaDescription", collection.metaDescription)}
            error={errors.metaDescription}
            guide={{ max: 160 }}
            hint="Aim for 120 to 160 characters."
          />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="collection-products-heading">
        <h2 id="collection-products-heading" className={styles.panelTitle}>
          Products
        </h2>
        <p className={styles.panelIntro}>
          Products appear on the collection page in order, lowest number first.
        </p>
        {collection.members.length === 0 ? (
          <p className={styles.hint}>No products in this collection yet.</p>
        ) : (
          <ul className={styles.cards}>
            {collection.members.map((member) => {
              const orderName = `members.${member.productId}.order`;
              const removeName = `members.${member.productId}.remove`;
              return (
                <li key={member.productId} className={styles.card}>
                  <div className={styles.cardHead}>
                    <span className={styles.checkTitle}>{member.name}</span>
                    <StatusBadge status={member.status} />
                  </div>
                  <div className={`${styles.grid} ${styles.grid2}`}>
                    <TextField
                      label="Order"
                      name={orderName}
                      inputMode="numeric"
                      mono
                      defaultValue={echoed?.[orderName] ?? member.order}
                      error={errors[orderName]}
                    />
                    <CheckboxField
                      label="Remove from this collection"
                      name={removeName}
                      defaultChecked={echoed ? echoed[removeName] === "on" : false}
                      hint={
                        member.otherRange
                          ? `Also in ${member.otherRange}; saving moves it here.`
                          : undefined
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <fieldset className={styles.field} style={{ marginTop: 20 }}>
          <legend className={styles.label}>Add products</legend>
          <p className={styles.hint}>
            For a range, adding a product moves it out of the range it is in now.
          </p>
          {collection.candidates.length === 0 ? (
            <p className={styles.hint}>Every product is already in this collection.</p>
          ) : (
            <ul className={styles.checkList}>
              {collection.candidates.map((candidate) => (
                <li key={candidate.productId}>
                  <CheckboxField
                    label={candidate.name}
                    name="addProductIds"
                    value={candidate.productId}
                    defaultChecked={added.includes(candidate.productId)}
                    hint={[
                      candidate.status !== "PUBLISHED" ? candidate.status.toLowerCase() : null,
                      candidate.range ? `in ${candidate.range}` : "no range",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                </li>
              ))}
            </ul>
          )}
          {errors.addProductIds && <p className={styles.error}>{errors.addProductIds}</p>}
        </fieldset>
      </section>
    </>
  );
}

function ArtworkField({
  label,
  fileName,
  removeName,
  currentUrl,
  acceptTypes,
  error,
  removeChecked,
}: {
  label: string;
  fileName: string;
  removeName: string;
  currentUrl: string;
  acceptTypes: string;
  error?: string;
  removeChecked: boolean;
}) {
  const id = fieldId(fileName);
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {currentUrl ? (
        <div className={styles.imagePreview} style={{ maxWidth: 160 }}>
          <Image src={currentUrl} alt="" fill sizes="160px" className={styles.imagePreviewImage} />
        </div>
      ) : (
        <p className={styles.hint}>None yet.</p>
      )}
      <input
        id={id}
        name={fileName}
        type="file"
        accept={acceptTypes}
        className={error ? `${styles.input} ${styles.invalid}` : styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
      {currentUrl && (
        <CheckboxField
          label={`Remove the current ${label.toLowerCase()}`}
          name={removeName}
          defaultChecked={removeChecked}
        />
      )}
    </div>
  );
}

/** Separate form: deleting cannot be undone, so it needs its own confirmation. */
export function DeleteCollectionForm({
  collectionId,
  name,
  linkedFromMenu,
}: {
  collectionId: string;
  name: string;
  linkedFromMenu: boolean;
}) {
  const [state, formAction] = useActionState(deleteCollection, IDLE_STATE);
  return (
    <form action={formAction} noValidate>
      <section className={`${styles.panel} ${styles.dangerZone}`} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className={styles.panelTitle}>
          Delete this collection
        </h2>
        <FormNotice state={state} />
        <p className={styles.panelIntro}>
          Deleting removes the collection and its page. The products stay in the catalogue. This
          cannot be undone. To take it off the site but keep it, set its status to Draft instead.
          {linkedFromMenu &&
            " The site's menu links to this range by its address, so deleting it leaves that menu link pointing at a missing page."}
        </p>
        <input type="hidden" name="collectionId" value={collectionId} />
        <CheckboxField
          label={`Yes, delete ${name}`}
          name="confirmDelete"
          error={state.errors?.confirmDelete}
        />
        <SubmitButton variant="danger" pendingLabel="Deleting…">
          Delete collection
        </SubmitButton>
      </section>
    </form>
  );
}
