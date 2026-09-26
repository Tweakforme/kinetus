import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/Badges";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getCollectionOptions,
  getProductForEdit,
  toImageFormData,
  toProductFormData,
} from "@/lib/admin/catalogue";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/admin/uploads";
import { ImagesForm } from "../ImagesForm";
import { InformationSheetForm } from "../InformationSheetForm";
import { ProductForm } from "../ProductForm";

export async function generateMetadata({
  params,
}: PageProps<"/admin/products/[id]">): Promise<Metadata> {
  const product = await getProductForEdit((await params).id);
  return { title: product ? `Edit ${product.name}` : "Product not found" };
}

/**
 * /admin/products/[id]: the product form, then its images and information sheet. Straight
 * after Create product (?created=1) the order is reversed: the confirmation, then the
 * image and sheet uploads, then the details, so photos can be added without scrolling
 * past the form that was just saved.
 */
export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [product, collections] = await Promise.all([getProductForEdit(id), getCollectionOptions()]);
  if (!product) {
    notFound();
  }

  const created = query.created === "1";
  const uploadLimits = {
    acceptTypes: ACCEPTED_IMAGE_TYPES,
    maxUploadBytes: MAX_UPLOAD_BYTES,
    maxUploadLabel: MAX_UPLOAD_LABEL,
  };
  const productForm = (
    <ProductForm product={toProductFormData(product)} collections={collections} />
  );
  const uploadForms = (
    <>
      <ImagesForm
        productId={product.id}
        images={toImageFormData(product)}
        sizes={product.variants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          archived: variant.status === "ARCHIVED",
        }))}
        {...uploadLimits}
      />
      <InformationSheetForm
        productId={product.id}
        productName={product.name}
        sheet={
          product.informationSheetUrl
            ? { url: product.informationSheetUrl, alt: product.informationSheetAlt ?? "" }
            : null
        }
        {...uploadLimits}
      />
    </>
  );

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <Link href="/admin/products" className={styles.backLink}>
            Back to products
          </Link>
          <h1 className={styles.pageTitle}>{product.name}</h1>
          <p className={styles.pageIntro}>
            <StatusBadge status={product.status} />{" "}
            <span className={styles.mono}>/products/{product.slug}</span>
          </p>
        </div>
        {product.status === "PUBLISHED" && (
          <div className={styles.headerActions}>
            <a
              href={`/products/${product.slug}`}
              className={`${styles.button} ${styles.secondary}`}
              target="_blank"
              rel="noopener"
            >
              View on site<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </div>
        )}
      </div>

      {created ? (
        <>
          <div role="status" className={`${styles.notice} ${styles.noticeSuccess}`}>
            <p className={styles.noticeTitle}>
              Product created and saved as {product.status === "PUBLISHED" ? "Published" : "Draft"}.
            </p>
            <p>
              Add its images now: choose a file, describe it and click Save images, once per image.
              The information sheet follows, and the details you entered are further down. Set
              Status to Published when it is ready.
            </p>
          </div>
          {uploadForms}
          {productForm}
        </>
      ) : (
        <>
          {productForm}
          {uploadForms}
        </>
      )}
    </>
  );
}
