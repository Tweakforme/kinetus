/**
 * Phase 3 seed — MOCK catalogue data only.
 *
 * Every product and collection name is prefixed "MOCK — " so it is unmistakable in the
 * UI. Specification values are placeholders. Descriptions cover material identity, form
 * and laboratory handling only — no therapeutic, dosing, testing or certification claims.
 *
 * Idempotent: every row has a fixed id and is upserted, so running the seed repeatedly
 * yields the same rows (rows removed from this file are NOT deleted from the database).
 *
 * Run with: npx prisma db seed
 * (package.json → "prisma.seed" → node --experimental-strip-types prisma/seed.ts)
 */

import {
  CollectionStatus,
  PrismaClient,
  ProductStatus,
  RedirectEntityType,
  VariantStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const MOCK_PREFIX = "MOCK — ";
const MOCK_DOCUMENT_URL = "/documents/mock-document.pdf";

// Client-supplied product renders copied into public/products/ (Phase 3).
const RENDER_VIAL = "/products/kinetus-vial-10mg.jpg";
const RENDER_VIAL_BOX = "/products/kinetus-vial-and-blank-box.png";
const RENDER_VIAL_BOX_3ML = "/products/kinetus-vial-and-box-3ml.jpg";

type VariantSeed = {
  id: string;
  label: string;
  price: number;
  salePrice?: number;
  saleStartsAt?: Date;
  saleEndsAt?: Date;
  stock?: number;
  trackInventory?: boolean;
  displayOrder: number;
};

type ImageSeed = {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
};

type DocumentSeed = {
  id: string;
  title: string;
  fileUrl: string;
  batchLot?: string;
  /** When set, the document attaches to this variant instead of the product. */
  variantId?: string;
};

type ProductSeed = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  form?: string;
  appearance?: string;
  storageConditions?: string;
  casNumber?: string;
  molecularFormula?: string;
  molecularWeight?: string;
  purityMethod?: string;
  featured: boolean;
  displayOrder: number;
  variants: VariantSeed[];
  images: ImageSeed[];
  documentation: DocumentSeed[];
  collectionIds: string[];
};

type CollectionSeed = {
  id: string;
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
};

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

// Collections are named by material or form only.
const collections: CollectionSeed[] = [
  {
    id: "mock_coll_lyophilised_powders",
    slug: "mock-lyophilised-powders",
    name: `${MOCK_PREFIX}Lyophilised powders`,
    description: "Placeholder collection grouped by material form (mock).",
    displayOrder: 1,
  },
  {
    id: "mock_coll_peptide_materials",
    slug: "mock-peptide-materials",
    name: `${MOCK_PREFIX}Peptide materials`,
    description: "Placeholder collection grouped by material type (mock).",
    displayOrder: 2,
  },
  {
    id: "mock_coll_refrigerated_materials",
    slug: "mock-refrigerated-materials",
    name: `${MOCK_PREFIX}Refrigerated materials`,
    description: "Placeholder collection grouped by storage handling (mock).",
    displayOrder: 3,
  },
];

const products: ProductSeed[] = [
  {
    id: "mock_prod_alpha",
    slug: "mock-peptide-alpha",
    name: `${MOCK_PREFIX}Peptide Alpha`,
    shortDescription:
      "Placeholder catalogue entry (mock). Described as a lyophilised powder supplied in a sealed glass vial with a batch reference, for laboratory handling.",
    description: `${MOCK_PREFIX}Peptide Alpha is a placeholder entry used to exercise the product template. It is described as a lyophilised powder sealed in a glass vial with a coated stopper and crimp, and each vial carries a batch reference (mock).\n\n${LOREM}\n\nSupplied for laboratory research applications. Keep sealed until use and follow the storage conditions listed above (mock handling note).`,
    metaTitle: `${MOCK_PREFIX}Peptide Alpha (mock meta title)`,
    metaDescription: "Mock meta description for the placeholder product Peptide Alpha.",
    form: "Lyophilised powder (mock)",
    appearance: "White to off-white solid (mock)",
    storageConditions: "Refrigerate at 2–8 °C, protect from light (mock)",
    casNumber: "0000-00-0 (mock)",
    molecularFormula: "MOCK-FORMULA-A",
    molecularWeight: "0000.0 g/mol (mock)",
    purityMethod: "MOCK — method not specified",
    featured: true,
    displayOrder: 1,
    variants: [
      { id: "mock_var_alpha_5mg", label: "5 MG", price: 18900, displayOrder: 1 },
      {
        id: "mock_var_alpha_10mg",
        label: "10 MG",
        price: 38900,
        salePrice: 34900,
        saleStartsAt: new Date("2026-01-01T00:00:00Z"),
        saleEndsAt: new Date("2027-12-31T23:59:59Z"),
        stock: 12,
        trackInventory: true,
        displayOrder: 2,
      },
      {
        id: "mock_var_alpha_20mg",
        label: "20 MG",
        price: 64900,
        stock: 0,
        trackInventory: true,
        displayOrder: 3,
      },
    ],
    images: [
      {
        id: "mock_img_alpha_1",
        url: RENDER_VIAL,
        altText: `${MOCK_PREFIX}Peptide Alpha vial (client product render)`,
        isPrimary: true,
        displayOrder: 1,
      },
      {
        id: "mock_img_alpha_2",
        url: RENDER_VIAL_BOX,
        altText: `${MOCK_PREFIX}Peptide Alpha vial with blank box (client product render)`,
        isPrimary: false,
        displayOrder: 2,
      },
      {
        id: "mock_img_alpha_3",
        url: RENDER_VIAL_BOX_3ML,
        altText: `${MOCK_PREFIX}Peptide Alpha 3 ml vial with box (client product render)`,
        isPrimary: false,
        displayOrder: 3,
      },
    ],
    documentation: [
      {
        id: "mock_doc_alpha_product",
        title: "Certificate of analysis (mock)",
        fileUrl: MOCK_DOCUMENT_URL,
        batchLot: "MOCK-LOT-0001",
      },
      {
        id: "mock_doc_alpha_10mg",
        title: "Certificate of analysis, 10 mg (mock)",
        fileUrl: MOCK_DOCUMENT_URL,
        batchLot: "MOCK-LOT-0002",
        variantId: "mock_var_alpha_10mg",
      },
    ],
    collectionIds: [
      "mock_coll_lyophilised_powders",
      "mock_coll_peptide_materials",
      "mock_coll_refrigerated_materials",
    ],
  },
  {
    id: "mock_prod_beta",
    slug: "mock-peptide-beta",
    name: `${MOCK_PREFIX}Peptide Beta`,
    shortDescription:
      "Placeholder catalogue entry (mock). Lyophilised powder in a sealed glass vial, supplied with a batch reference.",
    description: `${MOCK_PREFIX}Peptide Beta is a placeholder entry. It is described as a lyophilised powder in a sealed glass vial and is listed here in two presentations to exercise the variant selector (mock).\n\n${LOREM}`,
    form: "Lyophilised powder (mock)",
    appearance: "Off-white solid (mock)",
    storageConditions: "Refrigerate at 2–8 °C (mock)",
    casNumber: "0000-00-1 (mock)",
    molecularFormula: "MOCK-FORMULA-B",
    molecularWeight: "0000.0 g/mol (mock)",
    purityMethod: "MOCK — method not specified",
    featured: false,
    displayOrder: 2,
    variants: [
      { id: "mock_var_beta_5mg", label: "5 MG", price: 15900, displayOrder: 1 },
      { id: "mock_var_beta_10mg", label: "10 MG", price: 29900, displayOrder: 2 },
    ],
    images: [
      {
        id: "mock_img_beta_1",
        url: RENDER_VIAL_BOX,
        altText: `${MOCK_PREFIX}Peptide Beta vial with blank box (client product render)`,
        isPrimary: true,
        displayOrder: 1,
      },
      {
        id: "mock_img_beta_2",
        url: RENDER_VIAL_BOX_3ML,
        altText: `${MOCK_PREFIX}Peptide Beta 3 ml vial with box (client product render)`,
        isPrimary: false,
        displayOrder: 2,
      },
    ],
    documentation: [
      {
        id: "mock_doc_beta_product",
        title: "Product data sheet (mock)",
        fileUrl: MOCK_DOCUMENT_URL,
      },
    ],
    collectionIds: ["mock_coll_lyophilised_powders", "mock_coll_peptide_materials"],
  },
  {
    id: "mock_prod_gamma",
    slug: "mock-peptide-gamma",
    name: `${MOCK_PREFIX}Peptide Gamma`,
    shortDescription:
      "Placeholder catalogue entry (mock) with a single presentation and no documentation, to check the template degrades cleanly.",
    description: `${MOCK_PREFIX}Peptide Gamma is a placeholder entry with one presentation. Several specification fields are intentionally left empty so the specification table only renders populated rows (mock).\n\n${LOREM}`,
    form: "Lyophilised powder (mock)",
    appearance: "White solid (mock)",
    storageConditions: "Refrigerate at 2–8 °C (mock)",
    featured: true,
    displayOrder: 3,
    variants: [{ id: "mock_var_gamma_2mg", label: "2 MG", price: 9900, displayOrder: 1 }],
    images: [
      {
        id: "mock_img_gamma_1",
        url: RENDER_VIAL_BOX_3ML,
        altText: `${MOCK_PREFIX}Peptide Gamma 3 ml vial with box (client product render)`,
        isPrimary: true,
        displayOrder: 1,
      },
      {
        id: "mock_img_gamma_2",
        url: RENDER_VIAL,
        altText: `${MOCK_PREFIX}Peptide Gamma vial (client product render)`,
        isPrimary: false,
        displayOrder: 2,
      },
    ],
    documentation: [],
    collectionIds: ["mock_coll_peptide_materials", "mock_coll_refrigerated_materials"],
  },
  {
    id: "mock_prod_delta",
    slug: "mock-peptide-delta",
    name: `${MOCK_PREFIX}Peptide Delta`,
    shortDescription:
      "Placeholder catalogue entry (mock) whose only presentation is tracked and currently out of stock.",
    description: `${MOCK_PREFIX}Peptide Delta is a placeholder entry used to check the out-of-stock state and a product with no documentation (mock).\n\n${LOREM}`,
    form: "Lyophilised powder (mock)",
    appearance: "White to off-white solid (mock)",
    casNumber: "0000-00-3 (mock)",
    molecularFormula: "MOCK-FORMULA-D",
    molecularWeight: "0000.0 g/mol (mock)",
    featured: false,
    displayOrder: 4,
    variants: [
      {
        id: "mock_var_delta_10mg",
        label: "10 MG",
        price: 21900,
        stock: 0,
        trackInventory: true,
        displayOrder: 1,
      },
    ],
    images: [
      {
        id: "mock_img_delta_1",
        url: RENDER_VIAL,
        altText: `${MOCK_PREFIX}Peptide Delta vial (client product render)`,
        isPrimary: true,
        displayOrder: 1,
      },
      {
        id: "mock_img_delta_2",
        url: RENDER_VIAL_BOX,
        altText: `${MOCK_PREFIX}Peptide Delta vial with blank box (client product render)`,
        isPrimary: false,
        displayOrder: 2,
      },
    ],
    documentation: [],
    collectionIds: ["mock_coll_lyophilised_powders"],
  },
];

// Exercises SlugRedirect handling on /products/[slug].
const redirects = [
  {
    id: "mock_redirect_alpha",
    fromSlug: "mock-peptide-alpha-old",
    toSlug: "mock-peptide-alpha",
    entityType: RedirectEntityType.PRODUCT,
  },
];

async function seedCollections() {
  for (const c of collections) {
    const data = {
      slug: c.slug,
      name: c.name,
      description: c.description,
      status: CollectionStatus.PUBLISHED,
      displayOrder: c.displayOrder,
    };
    await prisma.collection.upsert({
      where: { id: c.id },
      update: data,
      create: { id: c.id, ...data },
    });
  }
}

async function seedProducts() {
  for (const p of products) {
    const data = {
      slug: p.slug,
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      status: ProductStatus.PUBLISHED,
      metaTitle: p.metaTitle ?? null,
      metaDescription: p.metaDescription ?? null,
      form: p.form ?? null,
      appearance: p.appearance ?? null,
      storageConditions: p.storageConditions ?? null,
      casNumber: p.casNumber ?? null,
      molecularFormula: p.molecularFormula ?? null,
      molecularWeight: p.molecularWeight ?? null,
      purityMethod: p.purityMethod ?? null,
      featured: p.featured,
      displayOrder: p.displayOrder,
    };
    await prisma.product.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });

    for (const v of p.variants) {
      const variantData = {
        productId: p.id,
        label: v.label,
        sku: null,
        price: v.price,
        salePrice: v.salePrice ?? null,
        saleStartsAt: v.saleStartsAt ?? null,
        saleEndsAt: v.saleEndsAt ?? null,
        stock: v.stock ?? null,
        trackInventory: v.trackInventory ?? false,
        status: VariantStatus.ACTIVE,
        displayOrder: v.displayOrder,
      };
      await prisma.productVariant.upsert({
        where: { id: v.id },
        update: variantData,
        create: { id: v.id, ...variantData },
      });
    }

    for (const img of p.images) {
      const imageData = {
        productId: p.id,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder,
      };
      await prisma.productImage.upsert({
        where: { id: img.id },
        update: imageData,
        create: { id: img.id, ...imageData },
      });
    }

    for (const doc of p.documentation) {
      // Exactly one owner: a variant-level document has productId null.
      const docData = {
        productId: doc.variantId ? null : p.id,
        variantId: doc.variantId ?? null,
        title: doc.title,
        fileUrl: doc.fileUrl,
        batchLot: doc.batchLot ?? null,
      };
      await prisma.documentation.upsert({
        where: { id: doc.id },
        update: docData,
        create: { id: doc.id, ...docData },
      });
    }

    for (const [index, collectionId] of p.collectionIds.entries()) {
      await prisma.productCollection.upsert({
        where: { productId_collectionId: { productId: p.id, collectionId } },
        update: { displayOrder: index + 1 },
        create: { productId: p.id, collectionId, displayOrder: index + 1 },
      });
    }
  }
}

async function seedRedirects() {
  for (const r of redirects) {
    const data = { fromSlug: r.fromSlug, toSlug: r.toSlug, entityType: r.entityType };
    await prisma.slugRedirect.upsert({
      where: { id: r.id },
      update: data,
      create: { id: r.id, ...data },
    });
  }
}

async function main() {
  await seedCollections();
  await seedProducts();
  await seedRedirects();

  const [
    productCount,
    variantCount,
    imageCount,
    docCount,
    collectionCount,
    linkCount,
    redirectCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.productImage.count(),
    prisma.documentation.count(),
    prisma.collection.count(),
    prisma.productCollection.count(),
    prisma.slugRedirect.count(),
  ]);

  console.log(
    `Seed complete — products: ${productCount}, variants: ${variantCount}, images: ${imageCount}, documentation: ${docCount}, collections: ${collectionCount}, product-collection links: ${linkCount}, redirects: ${redirectCount}`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
