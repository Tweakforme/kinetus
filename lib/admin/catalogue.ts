import {
  CollectionKind,
  type CollectionStatus,
  type ProductStatus,
  type VariantStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { centsToInput, formatStoreDateTime, toStoreDateTimeInput } from "./forms";

/**
 * Admin reads and the plain shapes the admin forms work with. Everything here is read per
 * request (the admin is never cached) and converted to form-ready strings on the server.
 */

export type CollectionOption = {
  id: string;
  name: string;
  slug: string;
  kind: CollectionKind;
  status: CollectionStatus;
};

export type VariantFormData = {
  /** The variant id, or "new-N" for a row not yet saved. */
  key: string;
  label: string;
  sku: string;
  price: string;
  salePrice: string;
  saleStartsAt: string;
  saleEndsAt: string;
  stock: string;
  trackInventory: boolean;
  status: VariantStatus;
  displayOrder: string;
  testReportUrl: string;
  /** "21 Sep 2026, 10:14 p.m." when a test report link was last changed. */
  testReportChanged: string | null;
};

export type ProductFormData = {
  id: string | null;
  name: string;
  slug: string;
  status: ProductStatus;
  shortDescription: string;
  description: string;
  /** Plain text under the product page's two document buttons; empty hides it. */
  productInfoText: string;
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  displayOrder: string;
  materialForm: string;
  appearance: string;
  storageConditions: string;
  casNumber: string;
  molecularFormula: string;
  molecularWeight: string;
  purityMethod: string;
  rangeId: string;
  categoryIds: string[];
  variants: VariantFormData[];
};

export type ImageFormData = {
  id: string;
  url: string;
  altText: string;
  variantId: string;
  displayOrder: string;
  isPrimary: boolean;
};

export async function getCollectionOptions(): Promise<CollectionOption[]> {
  return prisma.collection.findMany({
    select: { id: true, name: true, slug: true, kind: true, status: true },
    orderBy: [{ kind: "asc" }, { displayOrder: "asc" }, { name: "asc" }],
  });
}

export const EMPTY_PRODUCT: ProductFormData = {
  id: null,
  name: "",
  slug: "",
  status: "DRAFT",
  shortDescription: "",
  description: "",
  productInfoText: "",
  metaTitle: "",
  metaDescription: "",
  featured: false,
  displayOrder: "0",
  materialForm: "",
  appearance: "",
  storageConditions: "",
  casNumber: "",
  molecularFormula: "",
  molecularWeight: "",
  purityMethod: "",
  rangeId: "",
  categoryIds: [],
  variants: [],
};

/** The product with everything its edit page shows, or null. */
export async function getProductForEdit(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] },
      images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }, { createdAt: "asc" }] },
      collections: { select: { collectionId: true, collection: { select: { kind: true } } } },
    },
  });
}

type ProductForEdit = NonNullable<Awaited<ReturnType<typeof getProductForEdit>>>;

export function toProductFormData(product: ProductForEdit): ProductFormData {
  const range = product.collections.find((link) => link.collection.kind === CollectionKind.RANGE);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    status: product.status,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    productInfoText: product.productInfoText ?? "",
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    featured: product.featured,
    displayOrder: String(product.displayOrder),
    materialForm: product.form ?? "",
    appearance: product.appearance ?? "",
    storageConditions: product.storageConditions ?? "",
    casNumber: product.casNumber ?? "",
    molecularFormula: product.molecularFormula ?? "",
    molecularWeight: product.molecularWeight ?? "",
    purityMethod: product.purityMethod ?? "",
    rangeId: range?.collectionId ?? "",
    categoryIds: product.collections
      .filter((link) => link.collection.kind === CollectionKind.CATEGORY)
      .map((link) => link.collectionId),
    variants: product.variants.map((variant) => ({
      key: variant.id,
      label: variant.label,
      sku: variant.sku ?? "",
      price: centsToInput(variant.price),
      salePrice: centsToInput(variant.salePrice),
      saleStartsAt: toStoreDateTimeInput(variant.saleStartsAt),
      saleEndsAt: toStoreDateTimeInput(variant.saleEndsAt),
      stock: variant.stock === null ? "" : String(variant.stock),
      trackInventory: variant.trackInventory,
      status: variant.status,
      displayOrder: String(variant.displayOrder),
      testReportUrl: variant.testReportUrl ?? "",
      testReportChanged: variant.testReportUpdatedAt
        ? formatStoreDateTime(variant.testReportUpdatedAt)
        : null,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/*  Collections                                                               */
/* -------------------------------------------------------------------------- */

export type CollectionMember = {
  productId: string;
  name: string;
  status: ProductStatus;
  order: string;
  /** For a range: another range the product is also in (saving moves it here). */
  otherRange: string | null;
};

export type CollectionCandidate = {
  productId: string;
  name: string;
  status: ProductStatus;
  /** The product's current range, if any. */
  range: string | null;
};

export type CollectionFormData = {
  id: string | null;
  name: string;
  slug: string;
  kind: CollectionKind;
  status: CollectionStatus;
  subtitle: string;
  description: string;
  displayOrder: string;
  metaTitle: string;
  metaDescription: string;
  imageUrl: string;
  iconUrl: string;
  members: CollectionMember[];
  candidates: CollectionCandidate[];
};

/** Every product with its current range, for the "Add products" list. */
async function productsWithRange() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      collections: {
        where: { collection: { kind: CollectionKind.RANGE } },
        select: { collectionId: true, collection: { select: { name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
  return products;
}

export async function getCollectionForm(id: string | null): Promise<CollectionFormData | null> {
  const [collection, products] = await Promise.all([
    id
      ? prisma.collection.findUnique({
          where: { id },
          include: {
            products: {
              orderBy: { displayOrder: "asc" },
              select: { productId: true, displayOrder: true },
            },
          },
        })
      : Promise.resolve(null),
    productsWithRange(),
  ]);
  if (id && !collection) {
    return null;
  }
  const memberOrder = new Map(
    (collection?.products ?? []).map((link) => [link.productId, link.displayOrder]),
  );
  const members: CollectionMember[] = [];
  const candidates: CollectionCandidate[] = [];
  for (const product of products) {
    const otherRanges = product.collections.filter((link) => link.collectionId !== id);
    if (memberOrder.has(product.id)) {
      members.push({
        productId: product.id,
        name: product.name,
        status: product.status,
        order: String(memberOrder.get(product.id)),
        otherRange:
          collection?.kind === CollectionKind.RANGE
            ? (otherRanges[0]?.collection.name ?? null)
            : null,
      });
    } else {
      candidates.push({
        productId: product.id,
        name: product.name,
        status: product.status,
        range: product.collections[0]?.collection.name ?? null,
      });
    }
  }
  members.sort((a, b) => Number(a.order) - Number(b.order) || a.name.localeCompare(b.name));

  return {
    id: collection?.id ?? null,
    name: collection?.name ?? "",
    slug: collection?.slug ?? "",
    kind: collection?.kind ?? CollectionKind.CATEGORY,
    status: collection?.status ?? "DRAFT",
    subtitle: collection?.subtitle ?? "",
    description: collection?.description ?? "",
    displayOrder: String(collection?.displayOrder ?? 0),
    metaTitle: collection?.metaTitle ?? "",
    metaDescription: collection?.metaDescription ?? "",
    imageUrl: collection?.imageUrl ?? "",
    iconUrl: collection?.iconUrl ?? "",
    members,
    candidates,
  };
}

export function toImageFormData(product: ProductForEdit): ImageFormData[] {
  return product.images.map((image) => ({
    id: image.id,
    url: image.url,
    altText: image.altText,
    variantId: image.variantId ?? "",
    displayOrder: String(image.displayOrder),
    isPrimary: image.isPrimary,
  }));
}
