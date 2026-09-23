/**
 * Catalogue seed — the client's real price list ("Kinetus Price List 090126.pdf",
 * extracted 2026-09-03): 34 products, 48 variants, 4 collections.
 *
 *  - Prices are integer cents (CAD). "$40.00" → 4000.
 *  - The same name at different strengths is ONE product with several variants.
 *  - No descriptions are written: description / shortDescription stay null until the
 *    client supplies copy. `form` is "Lyophilized powder" for every vial product;
 *    the other specification fields stay null.
 *  - Imagery: the client's own renders (PRODUCT_IMAGES). Every render has a strength
 *    printed on it and belongs to that variant. A variant with no render of its own falls
 *    back to the product-level unlabelled "Kinetus Vial and Blank box" render, which is
 *    also the only image for Bacteriostatic Water.
 *  - Name normalisation from the price list: "5-amino - 1MQ" → "5-Amino-1MQ",
 *    "AHK-cu" → "AHK-Cu", "kisspeptin" → "Kisspeptin", "PNC 27" → "PNC-27",
 *    "SNAP 8" → "SNAP-8", "Thymosin Alpha 1" → "Thymosin Alpha-1",
 *    "Retatrutide (GLP3/Reta)" → "Retatrutide", "Bac Water" → "Bacteriostatic Water".
 *  - Commerce configuration (Phase 7A): the client's six discount codes (all inactive),
 *    two volume tiers, the 13 provincial tax rates and the single store settings row.
 *    These rows are only ever created, never overwritten, so a re-run cannot switch a
 *    code on or off or change a setting the client has made.
 *
 * Idempotent: every catalogue row has a fixed id and is upserted; variants and images of
 * a seeded product that are no longer listed here are removed; the Phase 3 mock rows (ids
 * prefixed "mock_") are deleted.
 *
 * Once an admin account exists the admin owns the catalogue, and a re-run would discard
 * the client's edits (prices, copy, uploaded images). The catalogue and the client-managed
 * commerce rows (discount codes, volume tiers) are therefore skipped when an AdminUser row
 * exists, unless SEED_CATALOGUE=overwrite is set. Tax rates and the settings row are still
 * created if missing.
 *
 * Run with: npx prisma db seed
 */

import {
  CollectionKind,
  CollectionStatus,
  PrismaClient,
  ProductStatus,
  RedirectEntityType,
  VariantStatus,
} from "@prisma/client";
import { seedCategories } from "./categories.ts";

const prisma = new PrismaClient();

/**
 * The unlabelled "Kinetus Vial and Blank box" render (genuine client artwork, no strength
 * and no product name printed), with its studio background removed so it composites on
 * the navy hero as well as on the light catalogue pages. It is the product-level fallback
 * shown for any variant that has no render of its own.
 */
const RENDER_BLANK_BOX_VIAL = "/products/kinetus-vial-and-blank-box-cut.png";

/** `variant` is the strength printed on the render, or null for an unlabelled render. */
type ImageSeed = { url: string; alt: string; variant: string | null };

/**
 * The client's own product photography (asset pack "Peptide Tab", "Blends Tab" and
 * "Shop by Category/Peptide Vials (Colored)", optimised into public/products/<slug>/).
 * The vial-and-box render leads, then the individual vials in ascending strength.
 *
 * `variant` is the strength printed on the render, read off the artwork itself (the pack's
 * file names omit it for AOD-9604, CJC-1295, DSIP, Kisspeptin and SNAP-8; those renders all
 * read "10 MG"). The seed attaches each render to that variant, so the product page never
 * shows one strength's render while another strength is selected.
 */
const PRODUCT_IMAGES: Record<string, ImageSeed[]> = {
  "5-amino-1mq": [
    {
      url: "/products/5-amino-1mq/5-amino-1mq-50mg-vial-and-box.webp",
      alt: "5-Amino-1MQ 50 mg vial and box",
      variant: "50 mg",
    },
    {
      url: "/products/5-amino-1mq/5-amino-1mq-50mg-vial.webp",
      alt: "5-Amino-1MQ 50 mg vial",
      variant: "50 mg",
    },
  ],
  "ahk-cu": [
    {
      url: "/products/ahk-cu/ahk-cu-50mg-vial-and-box.webp",
      alt: "AHK-Cu 50 mg vial and box",
      variant: "50 mg",
    },
    { url: "/products/ahk-cu/ahk-cu-50mg-vial.webp", alt: "AHK-Cu 50 mg vial", variant: "50 mg" },
    {
      url: "/products/ahk-cu/ahk-cu-100mg-vial.webp",
      alt: "AHK-Cu 100 mg vial",
      variant: "100 mg",
    },
  ],
  "aod-9604": [
    {
      url: "/products/aod-9604/aod-9604-vial-and-box.webp",
      alt: "AOD-9604 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/aod-9604/aod-9604-10mg-vial.webp",
      alt: "AOD-9604 10 mg vial",
      variant: "10 mg",
    },
  ],
  "bpc-157": [
    {
      url: "/products/bpc-157/bpc-157-10mg-vial-and-box.webp",
      alt: "BPC-157 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/bpc-157/bpc-157-10mg-vial.webp",
      alt: "BPC-157 10 mg vial",
      variant: "10 mg",
    },
  ],
  cerebrolysin: [
    {
      url: "/products/cerebrolysin/cerebrolysin-60mg-vial-and-box.webp",
      alt: "Cerebrolysin 60 mg vial and box",
      variant: "60 mg",
    },
    {
      url: "/products/cerebrolysin/cerebrolysin-60mg-vial.webp",
      alt: "Cerebrolysin 60 mg vial",
      variant: "60 mg",
    },
  ],
  "cjc-1295-no-dac-ipamorelin": [
    {
      url: "/products/cjc-1295-no-dac-ipamorelin/cjc-1295-no-dac-ipamorelin-vial-and-box.webp",
      alt: "CJC-1295 (No DAC) / Ipamorelin 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/cjc-1295-no-dac-ipamorelin/cjc-1295-no-dac-ipamorelin-10mg-vial.webp",
      alt: "CJC-1295 (No DAC) / Ipamorelin 10 mg vial",
      variant: "10 mg",
    },
  ],
  dsip: [
    {
      url: "/products/dsip/dsip-vial-and-box.webp",
      alt: "DSIP 10 mg vial and box",
      variant: "10 mg",
    },
    { url: "/products/dsip/dsip-vial.webp", alt: "DSIP 10 mg vial", variant: "10 mg" },
  ],
  epitalon: [
    {
      url: "/products/epitalon/epitalon-50mg-vial-and-box.webp",
      alt: "Epitalon 50 mg vial and box",
      variant: "50 mg",
    },
    {
      url: "/products/epitalon/epitalon-50mg-vial.webp",
      alt: "Epitalon 50 mg vial",
      variant: "50 mg",
    },
  ],
  "ghk-cu": [
    {
      url: "/products/ghk-cu/ghk-cu-50mg-vial-and-box.webp",
      alt: "GHK-Cu 50 mg vial and box",
      variant: "50 mg",
    },
    { url: "/products/ghk-cu/ghk-cu-50mg-vial.webp", alt: "GHK-Cu 50 mg vial", variant: "50 mg" },
    {
      url: "/products/ghk-cu/ghk-cu-100mg-vial.webp",
      alt: "GHK-Cu 100 mg vial",
      variant: "100 mg",
    },
  ],
  ipamorelin: [
    {
      url: "/products/ipamorelin/ipamorelin-10mg-vial-and-box.webp",
      alt: "Ipamorelin 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/ipamorelin/ipamorelin-10mg-vial.webp",
      alt: "Ipamorelin 10 mg vial",
      variant: "10 mg",
    },
  ],
  kisspeptin: [
    {
      url: "/products/kisspeptin/kisspeptin-vial-and-box.webp",
      alt: "Kisspeptin 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/kisspeptin/kisspeptin-vial.webp",
      alt: "Kisspeptin 10 mg vial",
      variant: "10 mg",
    },
  ],
  klow: [
    {
      url: "/products/klow/klow-80mg-vial-and-box.webp",
      alt: "KLOW 80 mg vial and box",
      variant: "80 mg",
    },
    { url: "/products/klow/klow-80mg-vial.webp", alt: "KLOW 80 mg vial", variant: "80 mg" },
  ],
  kpv: [
    {
      url: "/products/kpv/kpv-10mg-vial-and-box.webp",
      alt: "KPV 10 mg vial and box",
      variant: "10 mg",
    },
    { url: "/products/kpv/kpv-10mg-vial.webp", alt: "KPV 10 mg vial", variant: "10 mg" },
  ],
  "l-glutathione": [
    {
      url: "/products/l-glutathione/l-glutathione-1500mg-vial-and-box.webp",
      alt: "L-Glutathione 1500 mg vial and box",
      variant: "1500 mg",
    },
    {
      url: "/products/l-glutathione/l-glutathione-1500mg-vial.webp",
      alt: "L-Glutathione 1500 mg vial",
      variant: "1500 mg",
    },
  ],
  "mots-c": [
    {
      url: "/products/mots-c/mots-c-40mg-vial-and-box.webp",
      alt: "MOTS-C 40 mg vial and box",
      variant: "40 mg",
    },
    { url: "/products/mots-c/mots-c-20mg-vial.webp", alt: "MOTS-C 20 mg vial", variant: "20 mg" },
    { url: "/products/mots-c/mots-c-30mg-vial.webp", alt: "MOTS-C 30 mg vial", variant: "30 mg" },
    { url: "/products/mots-c/mots-c-40mg-vial.webp", alt: "MOTS-C 40 mg vial", variant: "40 mg" },
  ],
  "nad-plus": [
    {
      url: "/products/nad-plus/nad-plus-500mg-vial-and-box.webp",
      alt: "NAD+ 500 mg vial and box",
      variant: "500 mg",
    },
    {
      url: "/products/nad-plus/nad-plus-500mg-vial.webp",
      alt: "NAD+ 500 mg vial",
      variant: "500 mg",
    },
    {
      url: "/products/nad-plus/nad-plus-1000mg-vial.webp",
      alt: "NAD+ 1000 mg vial",
      variant: "1000 mg",
    },
  ],
  "neuro-focus": [
    {
      url: "/products/neuro-focus/neuro-focus-20mg-vial-and-box.webp",
      alt: "Neuro Focus (Semax + Selank) 20 mg vial and box",
      variant: "20 mg",
    },
    {
      url: "/products/neuro-focus/neuro-focus-20mg-vial.webp",
      alt: "Neuro Focus (Semax + Selank) 20 mg vial",
      variant: "20 mg",
    },
  ],
  pinealon: [
    {
      url: "/products/pinealon/pinealon-10mg-vial-and-box.webp",
      alt: "Pinealon 10 mg vial and box",
      variant: "10 mg",
    },
  ],
  "pnc-27": [
    {
      url: "/products/pnc-27/pnc-27-10mg-vial-and-box.webp",
      alt: "PNC-27 10 mg vial and box",
      variant: "10 mg",
    },
    { url: "/products/pnc-27/pnc-27-10mg-vial.webp", alt: "PNC-27 10 mg vial", variant: "10 mg" },
  ],
  retatrutide: [
    {
      url: "/products/retatrutide/retatrutide-10mg-vial-and-box.webp",
      alt: "Retatrutide 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/retatrutide/retatrutide-10mg-vial.webp",
      alt: "Retatrutide 10 mg vial",
      variant: "10 mg",
    },
  ],
  selank: [
    {
      url: "/products/selank/selank-10mg-vial-and-box.webp",
      alt: "Selank 10 mg vial and box",
      variant: "10 mg",
    },
    { url: "/products/selank/selank-10mg-vial.webp", alt: "Selank 10 mg vial", variant: "10 mg" },
  ],
  semaglutide: [
    {
      url: "/products/semaglutide/semaglutide-10mg-vial-and-box.webp",
      alt: "Semaglutide 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/semaglutide/semaglutide-10mg-vial.webp",
      alt: "Semaglutide 10 mg vial",
      variant: "10 mg",
    },
  ],
  semax: [
    {
      url: "/products/semax/semax-10mg-vial-and-box.webp",
      alt: "Semax 10 mg vial and box",
      variant: "10 mg",
    },
    { url: "/products/semax/semax-10mg-vial.webp", alt: "Semax 10 mg vial", variant: "10 mg" },
  ],
  sermorelin: [
    {
      url: "/products/sermorelin/sermorelin-10mg-vial-and-box.webp",
      alt: "Sermorelin 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/sermorelin/sermorelin-10mg-vial.webp",
      alt: "Sermorelin 10 mg vial",
      variant: "10 mg",
    },
  ],
  "snap-8": [
    {
      url: "/products/snap-8/snap-8-vial-and-box.webp",
      alt: "SNAP-8 10 mg vial and box",
      variant: "10 mg",
    },
    { url: "/products/snap-8/snap-8-vial.webp", alt: "SNAP-8 10 mg vial", variant: "10 mg" },
  ],
  "ss-31": [
    {
      url: "/products/ss-31/ss-31-50mg-vial-and-box.webp",
      alt: "SS-31 50 mg vial and box",
      variant: "50 mg",
    },
    { url: "/products/ss-31/ss-31-50mg-vial.webp", alt: "SS-31 50 mg vial", variant: "50 mg" },
  ],
  "tb-500": [
    {
      url: "/products/tb-500/tb-500-10mg-vial-and-box.webp",
      alt: "TB-500 10 mg vial and box",
      variant: "10 mg",
    },
    { url: "/products/tb-500/tb-500-10mg-vial.webp", alt: "TB-500 10 mg vial", variant: "10 mg" },
  ],
  tesamorelin: [
    {
      url: "/products/tesamorelin/tesamorelin-10mg-vial-and-box.webp",
      alt: "Tesamorelin 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/tesamorelin/tesamorelin-10mg-vial.webp",
      alt: "Tesamorelin 10 mg vial",
      variant: "10 mg",
    },
  ],
  thymalin: [
    {
      url: "/products/thymalin/thymalin-10mg-vial-and-box.webp",
      alt: "Thymalin 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/thymalin/thymalin-10mg-vial.webp",
      alt: "Thymalin 10 mg vial",
      variant: "10 mg",
    },
  ],
  "thymosin-alpha-1": [
    {
      url: "/products/thymosin-alpha-1/thymosin-alpha-1-10mg-vial-and-box.webp",
      alt: "Thymosin Alpha-1 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/thymosin-alpha-1/thymosin-alpha-1-10mg-vial.webp",
      alt: "Thymosin Alpha-1 10 mg vial",
      variant: "10 mg",
    },
  ],
  tirzepatide: [
    {
      url: "/products/tirzepatide/tirzepatide-10mg-vial-and-box.webp",
      alt: "Tirzepatide 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/tirzepatide/tirzepatide-10mg-vial.webp",
      alt: "Tirzepatide 10 mg vial",
      variant: "10 mg",
    },
  ],
  vip: [
    {
      url: "/products/vip/vip-10mg-vial-and-box.webp",
      alt: "VIP 10 mg vial and box",
      variant: "10 mg",
    },
    { url: "/products/vip/vip-10mg-vial.webp", alt: "VIP 10 mg vial", variant: "10 mg" },
  ],
  "wolverine-blend": [
    {
      url: "/products/wolverine-blend/wolverine-blend-10mg-vial-and-box.webp",
      alt: "Wolverine Blend 10 mg vial and box",
      variant: "10 mg",
    },
    {
      url: "/products/wolverine-blend/wolverine-blend-10mg-vial.webp",
      alt: "Wolverine Blend 10 mg vial",
      variant: "10 mg",
    },
  ],
};

const FORM_LYOPHILIZED = "Lyophilized powder";

type CollectionKey = "peptides" | "blends" | "labSupplies" | "research";

type ProductSeed = {
  slug: string;
  name: string;
  collection: CollectionKey;
  /** [label, price in cents] in display order. */
  variants: [string, number][];
  form?: string | null;
  featured?: boolean;
};

const COLLECTIONS: Record<
  CollectionKey,
  {
    id: string;
    slug: string;
    name: string;
    description: string;
    displayOrder: number;
    /** Research is unpublished: the /research page replaces it in the navigation. */
    status?: CollectionStatus;
  }
> = {
  peptides: {
    id: "coll_peptides",
    slug: "peptides",
    name: "Peptides",
    description: "Browse our full selection of research-grade peptide materials.",
    displayOrder: 1,
  },
  blends: {
    id: "coll_blends",
    slug: "blends",
    name: "Blends",
    description: "Combination peptide materials supplied in a single vial.",
    displayOrder: 2,
  },
  labSupplies: {
    id: "coll_lab_supplies",
    slug: "lab-supplies",
    name: "Lab Supplies",
    description: "Research accessories and laboratory materials.",
    displayOrder: 3,
  },
  research: {
    id: "coll_research",
    slug: "research",
    name: "Research",
    description: "Documentation, batch references and research-use resources.",
    displayOrder: 4,
    status: CollectionStatus.DRAFT,
  },
};

/** Price-list order. */
const PRODUCTS: ProductSeed[] = [
  {
    slug: "5-amino-1mq",
    name: "5-Amino-1MQ",
    collection: "peptides",
    variants: [
      ["10 mg", 4000],
      ["50 mg", 8000],
    ],
  },
  {
    slug: "ahk-cu",
    name: "AHK-Cu",
    collection: "peptides",
    variants: [
      ["50 mg", 3000],
      ["100 mg", 5000],
    ],
  },
  { slug: "aod-9604", name: "AOD-9604", collection: "peptides", variants: [["10 mg", 9000]] },
  {
    slug: "bpc-157",
    name: "BPC-157",
    collection: "peptides",
    variants: [["10 mg", 5500]],
    featured: true,
  },
  {
    slug: "cerebrolysin",
    name: "Cerebrolysin",
    collection: "peptides",
    variants: [["60 mg", 2500]],
  },
  {
    slug: "cjc-1295-no-dac-ipamorelin",
    name: "CJC-1295 (No DAC) / Ipamorelin",
    collection: "blends",
    variants: [
      ["10 mg", 7500],
      ["20 mg", 11200],
    ],
  },
  { slug: "dsip", name: "DSIP", collection: "peptides", variants: [["10 mg", 4500]] },
  {
    slug: "epitalon",
    name: "Epitalon",
    collection: "peptides",
    variants: [
      ["10 mg", 3500],
      ["50 mg", 8500],
    ],
  },
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    collection: "peptides",
    variants: [
      ["50 mg", 3500],
      ["100 mg", 5500],
    ],
    featured: true,
  },
  { slug: "ipamorelin", name: "Ipamorelin", collection: "peptides", variants: [["10 mg", 6000]] },
  { slug: "kisspeptin", name: "Kisspeptin", collection: "peptides", variants: [["10 mg", 3500]] },
  { slug: "klow", name: "KLOW", collection: "blends", variants: [["80 mg", 9500]] },
  { slug: "kpv", name: "KPV", collection: "peptides", variants: [["10 mg", 4000]] },
  {
    slug: "l-glutathione",
    name: "L-Glutathione",
    collection: "peptides",
    variants: [["1500 mg", 5500]],
  },
  {
    slug: "mots-c",
    name: "MOTS-C",
    collection: "peptides",
    variants: [
      ["10 mg", 3500],
      ["20 mg", 6500],
      ["30 mg", 9500],
      ["40 mg", 11000],
    ],
    featured: true,
  },
  {
    slug: "nad-plus",
    name: "NAD+",
    collection: "peptides",
    variants: [
      ["500 mg", 4000],
      ["1000 mg", 7500],
    ],
    featured: true,
  },
  {
    slug: "neuro-focus",
    name: "Neuro Focus (Semax + Selank)",
    collection: "blends",
    variants: [["20 mg", 8000]],
  },
  { slug: "pinealon", name: "Pinealon", collection: "peptides", variants: [["10 mg", 4500]] },
  { slug: "pnc-27", name: "PNC-27", collection: "peptides", variants: [["10 mg", 9000]] },
  {
    slug: "retatrutide",
    name: "Retatrutide",
    collection: "peptides",
    variants: [
      ["10 mg", 8000],
      ["20 mg", 14000],
      ["30 mg", 16000],
    ],
    featured: true,
  },
  {
    slug: "semaglutide",
    name: "Semaglutide",
    collection: "peptides",
    variants: [["10 mg", 6500]],
    featured: true,
  },
  { slug: "selank", name: "Selank", collection: "peptides", variants: [["10 mg", 5000]] },
  { slug: "semax", name: "Semax", collection: "peptides", variants: [["10 mg", 5000]] },
  { slug: "sermorelin", name: "Sermorelin", collection: "peptides", variants: [["10 mg", 8500]] },
  { slug: "snap-8", name: "SNAP-8", collection: "peptides", variants: [["10 mg", 4000]] },
  {
    slug: "ss-31",
    name: "SS-31",
    collection: "peptides",
    variants: [
      ["25 mg", 9500],
      ["50 mg", 14000],
    ],
  },
  {
    slug: "tb-500",
    name: "TB-500",
    collection: "peptides",
    variants: [["10 mg", 6500]],
    featured: true,
  },
  { slug: "tesamorelin", name: "Tesamorelin", collection: "peptides", variants: [["10 mg", 8500]] },
  { slug: "thymalin", name: "Thymalin", collection: "peptides", variants: [["10 mg", 4500]] },
  {
    slug: "thymosin-alpha-1",
    name: "Thymosin Alpha-1",
    collection: "peptides",
    variants: [["10 mg", 7000]],
  },
  {
    slug: "tirzepatide",
    name: "Tirzepatide",
    collection: "peptides",
    variants: [
      ["10 mg", 8000],
      ["20 mg", 11500],
    ],
    featured: true,
  },
  {
    slug: "wolverine-blend",
    name: "Wolverine Blend",
    collection: "blends",
    variants: [
      ["10 mg", 6500],
      ["20 mg", 8500],
    ],
  },
  { slug: "vip", name: "VIP", collection: "peptides", variants: [["10 mg", 6500]] },
  {
    slug: "bacteriostatic-water",
    name: "Bacteriostatic Water",
    collection: "labSupplies",
    variants: [["30 ml", 3000]],
    form: null,
  },
];

function variantId(productSlug: string, label: string): string {
  return `var_${productSlug}_${label.replace(/\s+/g, "").toLowerCase()}`;
}

type ImageRow = {
  id: string;
  url: string;
  altText: string;
  variantId: string | null;
  isPrimary: boolean;
  displayOrder: number;
};

/**
 * The product's image rows. Each render attaches to the variant whose strength is printed
 * on it (a label the product does not list is a data error and stops the seed). When any
 * variant is left without a render of its own and the product has no unlabelled render,
 * the product-level blank render is added so that variant falls back to it instead of
 * borrowing another strength's render.
 */
function imagesFor(product: ProductSeed): ImageRow[] {
  const own = PRODUCT_IMAGES[product.slug] ?? [];
  const labels = new Set(product.variants.map(([label]) => label));

  const rows: ImageRow[] = own.map((image, index) => {
    if (image.variant !== null && !labels.has(image.variant)) {
      throw new Error(
        `${product.slug}: render ${image.url} is labelled "${image.variant}", which is not a listed variant.`,
      );
    }
    return {
      id: `img_${product.slug}_${index + 1}`,
      url: image.url,
      altText: image.alt,
      variantId: image.variant === null ? null : variantId(product.slug, image.variant),
      isPrimary: index === 0,
      displayOrder: index + 1,
    };
  });

  const covered = new Set(own.map((image) => image.variant));
  const hasProductLevel = covered.has(null);
  const uncovered = product.variants.some(([label]) => !covered.has(label));
  if (uncovered && !hasProductLevel) {
    rows.push({
      id: own.length === 0 ? `img_${product.slug}_1` : `img_${product.slug}_blank`,
      url: RENDER_BLANK_BOX_VIAL,
      altText: `${product.name}: Kinetus BioLabs vial and box (representative packaging render, unlabelled)`,
      variantId: null,
      isPrimary: own.length === 0,
      displayOrder: own.length + 1,
    });
  }
  return rows;
}

async function seedCollections() {
  for (const c of Object.values(COLLECTIONS)) {
    const data = {
      slug: c.slug,
      name: c.name,
      description: c.description,
      status: c.status ?? CollectionStatus.PUBLISHED,
      displayOrder: c.displayOrder,
      kind: CollectionKind.RANGE,
    };
    await prisma.collection.upsert({
      where: { id: c.id },
      update: data,
      create: { id: c.id, ...data },
    });
  }
}

async function seedProducts() {
  for (const [index, p] of PRODUCTS.entries()) {
    const productId = `prod_${p.slug}`;
    const form = p.form === undefined ? FORM_LYOPHILIZED : p.form;
    const data = {
      slug: p.slug,
      name: p.name,
      shortDescription: null,
      description: null,
      status: ProductStatus.PUBLISHED,
      metaTitle: null,
      metaDescription: null,
      form,
      appearance: null,
      storageConditions: null,
      casNumber: null,
      molecularFormula: null,
      molecularWeight: null,
      purityMethod: null,
      featured: p.featured ?? false,
      displayOrder: index + 1,
    };
    await prisma.product.upsert({
      where: { id: productId },
      update: data,
      create: { id: productId, ...data },
    });

    const variantIds: string[] = [];
    for (const [order, [label, price]] of p.variants.entries()) {
      const id = variantId(p.slug, label);
      variantIds.push(id);
      const variantData = {
        productId,
        label,
        sku: null,
        price,
        salePrice: null,
        saleStartsAt: null,
        saleEndsAt: null,
        stock: null,
        trackInventory: false,
        status: VariantStatus.ACTIVE,
        displayOrder: order + 1,
      };
      await prisma.productVariant.upsert({
        where: { id },
        update: variantData,
        create: { id, ...variantData },
      });
    }
    await prisma.productVariant.deleteMany({ where: { productId, id: { notIn: variantIds } } });

    const images = imagesFor(p);
    for (const img of images) {
      const imageData = {
        productId,
        url: img.url,
        altText: img.altText,
        variantId: img.variantId,
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder,
      };
      await prisma.productImage.upsert({
        where: { id: img.id },
        update: imageData,
        create: { id: img.id, ...imageData },
      });
    }
    await prisma.productImage.deleteMany({
      where: { productId, id: { notIn: images.map((img) => img.id) } },
    });

    // The seed manages range membership only: category links are the client's.
    const collectionId = COLLECTIONS[p.collection].id;
    await prisma.productCollection.upsert({
      where: { productId_collectionId: { productId, collectionId } },
      update: { displayOrder: index + 1 },
      create: { productId, collectionId, displayOrder: index + 1 },
    });
    await prisma.productCollection.deleteMany({
      where: {
        productId,
        collectionId: { not: collectionId },
        collection: { kind: CollectionKind.RANGE },
      },
    });
  }
}

/* -------------------------------------------------------------------------- */
/*  Commerce configuration (Phase 7A): configuration only, nothing consumes it */
/* -------------------------------------------------------------------------- */

/**
 * The client's own codes, exactly as he wrote them. All start inactive so nothing is live
 * until he switches a code on. None combines with the volume discount: the approved rule
 * is that the customer receives whichever of the two is larger.
 */
const DISCOUNT_CODES: { code: string; percentOff: number }[] = [
  { code: "Kinetus-10", percentOff: 10 },
  { code: "Kin-15", percentOff: 15 },
  { code: "Mikeb-10", percentOff: 10 },
  { code: "Fam-25", percentOff: 25 },
  { code: "Family-50%", percentOff: 50 },
  { code: "Special-50", percentOff: 50 },
];

/** From two of the client's inner-page mockups. */
const VOLUME_TIERS: { minQuantity: number; percentOff: number }[] = [
  { minQuantity: 2, percentOff: 5 },
  { minQuantity: 3, percentOff: 10 },
];

/**
 * Combined sales tax per province and territory, in basis points. Quebec is GST 5% plus
 * QST 9.975% (14.975%), held as 1497 because the column is whole basis points.
 */
const TAX_RATES: { province: string; label: string; rateBps: number }[] = [
  { province: "AB", label: "Alberta (GST)", rateBps: 500 },
  { province: "BC", label: "British Columbia (GST + PST)", rateBps: 1200 },
  { province: "MB", label: "Manitoba (GST + RST)", rateBps: 1200 },
  { province: "NB", label: "New Brunswick (HST)", rateBps: 1500 },
  { province: "NL", label: "Newfoundland and Labrador (HST)", rateBps: 1500 },
  { province: "NS", label: "Nova Scotia (HST)", rateBps: 1400 },
  { province: "NT", label: "Northwest Territories (GST)", rateBps: 500 },
  { province: "NU", label: "Nunavut (GST)", rateBps: 500 },
  { province: "ON", label: "Ontario (HST)", rateBps: 1300 },
  { province: "PE", label: "Prince Edward Island (HST)", rateBps: 1500 },
  { province: "QC", label: "Quebec (GST + QST)", rateBps: 1497 },
  { province: "SK", label: "Saskatchewan (GST + PST)", rateBps: 1100 },
  { province: "YT", label: "Yukon (GST)", rateBps: 500 },
];

/** Codes and volume tiers belong to the client once the admin is in use. */
async function seedClientManagedConfig() {
  let codes = 0;
  for (const { code, percentOff } of DISCOUNT_CODES) {
    const existing = await prisma.discountCode.findUnique({ where: { code } });
    if (!existing) {
      await prisma.discountCode.create({
        data: { code, percentOff, isActive: false, stacksWithVolume: false },
      });
      codes += 1;
    }
  }

  let tiers = 0;
  if ((await prisma.volumeDiscountTier.count()) === 0) {
    const created = await prisma.volumeDiscountTier.createMany({
      data: VOLUME_TIERS.map((tier) => ({ ...tier, isActive: true })),
    });
    tiers = created.count;
  }
  return { codes, tiers };
}

/**
 * Structural rows the admin relies on: one row per province and the single settings row.
 * Created when missing, never updated. `taxEnabled` is left at its default (false): the
 * business is not confirmed as registered to collect GST/HST.
 */
async function seedStructuralConfig() {
  let taxRates = 0;
  for (const rate of TAX_RATES) {
    const existing = await prisma.taxRate.findUnique({ where: { province: rate.province } });
    if (!existing) {
      await prisma.taxRate.create({ data: { ...rate, isActive: true } });
      taxRates += 1;
    }
  }

  let settings = 0;
  if (!(await prisma.storeSetting.findUnique({ where: { id: "store" } }))) {
    await prisma.storeSetting.create({ data: { id: "store" } });
    settings = 1;
  }
  return { taxRates, settings };
}

/** Removes the Phase 3 placeholder catalogue (every id was prefixed "mock_"). */
async function removeMockRows() {
  const products = await prisma.product.deleteMany({ where: { id: { startsWith: "mock_" } } });
  const collections = await prisma.collection.deleteMany({
    where: { id: { startsWith: "mock_" } },
  });
  const redirects = await prisma.slugRedirect.deleteMany({
    where: { id: { startsWith: "mock_" } },
  });
  const orphanDocs = await prisma.documentation.deleteMany({
    where: { id: { startsWith: "mock_" } },
  });
  return {
    products: products.count,
    collections: collections.count,
    redirects: redirects.count,
    documents: orphanDocs.count,
  };
}

async function main() {
  const adminAccounts = await prisma.adminUser.count();
  const overwrite = process.env.SEED_CATALOGUE === "overwrite";

  if (adminAccounts > 0 && !overwrite) {
    console.log(
      "An admin account exists, so the client manages the catalogue, discount codes and " +
        "volume tiers in the admin. Those rows were left untouched. Set " +
        "SEED_CATALOGUE=overwrite to re-apply the price list (this discards admin edits).",
    );
  } else {
    const removed = await removeMockRows();
    await seedCollections();
    await seedProducts();
    const config = await seedClientManagedConfig();
    // Once an admin exists the client owns the categories; `npm run seed:categories` is the
    // one-time additive run for an existing database.
    const categories = await seedCategories(prisma);
    console.log(
      `Shop by Category: ${categories.collectionsCreated} collections created, ` +
        `${categories.linksCreated} product links added.` +
        (categories.missingProducts.length > 0
          ? ` Not in the catalogue: ${categories.missingProducts.join(", ")}.`
          : ""),
    );
    console.log(
      `Catalogue seeded. Removed mock rows: ${JSON.stringify(removed)}. Created ` +
        `${config.codes} discount codes and ${config.tiers} volume tiers.`,
    );
  }
  const structural = await seedStructuralConfig();
  console.log(
    `Created ${structural.taxRates} tax rates and ${structural.settings} settings row (existing rows are never changed).`,
  );

  const [
    productCount,
    variantCount,
    imageCount,
    variantImageCount,
    collectionCount,
    linkCount,
    docCount,
    codeCount,
    activeCodeCount,
    tierCount,
    taxCount,
    settingsCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.productImage.count(),
    prisma.productImage.count({ where: { variantId: { not: null } } }),
    prisma.collection.count(),
    prisma.productCollection.count(),
    prisma.documentation.count(),
    prisma.discountCode.count(),
    prisma.discountCode.count({ where: { isActive: true } }),
    prisma.volumeDiscountTier.count(),
    prisma.taxRate.count(),
    prisma.storeSetting.count(),
  ]);

  const byCollection = await prisma.collection.findMany({
    select: { name: true, _count: { select: { products: true } } },
    orderBy: { displayOrder: "asc" },
  });

  console.log(
    `Counts. Products: ${productCount}, variants: ${variantCount}, images: ${imageCount} ` +
      `(${variantImageCount} variant-level, ${imageCount - variantImageCount} product-level), ` +
      `documentation: ${docCount}, collections: ${collectionCount}, links: ${linkCount}. ` +
      byCollection.map((c) => `${c.name}: ${c._count.products}`).join(", ") +
      `. Discount codes: ${codeCount} (${activeCodeCount} active), volume tiers: ${tierCount}, ` +
      `tax rates: ${taxCount}, settings rows: ${settingsCount}.`,
  );
  // Redirect enum is imported so the seed keeps compiling against the schema.
  void RedirectEntityType;
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
