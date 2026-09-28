/**
 * One-off: attaches the client's product information sheets (the write-up graphic in each
 * folder of _client-assets/Peptide Tab/) to their products.
 *
 *   node --env-file-if-exists=.env --experimental-strip-types scripts/load-information-sheets.ts
 *     Dry run, the default: prints how every folder matched. Writes nothing.
 *
 *   node --env-file-if-exists=.env --experimental-strip-types scripts/load-information-sheets.ts --upload
 *     Uploads each matched sheet to Vercel Blob and sets that product's
 *     informationSheetUrl and informationSheetAlt. No other field is written and no
 *     product is created. It stops at the first failed upload and prints the error.
 *     Add --only <slug> to load a single product (used to check the first conversion).
 *
 * Matching never guesses:
 *  - Write-up: the one PNG in the folder whose name contains "write up" (any case, space
 *    or hyphen). A folder with none, or with several, is reported and skipped, unless it
 *    is one of the checked exceptions in WRITE_UP_EXCEPTIONS.
 *  - Product: the folder name, or the write-up's name without "write up", equals the
 *    product's name or slug once both are lower-cased and reduced to letters and digits.
 *    Exactly one product must match; otherwise the folder is reported and skipped.
 *  - A product that already has a sheet (for example one the client uploaded in the admin)
 *    keeps it.
 *
 * Uploads go through the admin's own checks and sheet encoding (lib/admin/uploads.ts:
 * WebP, up to 2000 px, quality 90) into the same Blob folder an admin upload uses. Alt
 * text is "<product name> product information sheet".
 *
 * The storefront keeps catalogue reads cached until an admin save or a new deployment, so
 * the sheets show on the live site after the next deployment.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { imageFileError, SHEET_IMAGE_ENCODING, storeImage } from "../lib/admin/uploads.ts";

const SOURCE = path.join(process.cwd(), "_client-assets", "Peptide Tab");
const WRITE_UP = /write[\s-]*up/i;
const UPLOAD = process.argv.includes("--upload");
const ONLY = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;

/**
 * Folders whose write-up is not named "write up", each checked by eye and approved.
 * DSIP: the pack's names are swapped. "DSIP inner page.png" is the write-up (the DSIP
 * information sheet), while "DSIP page.png" is the product-page mockup that other folders
 * call "inner page".
 */
const WRITE_UP_EXCEPTIONS: Record<string, string> = {
  DSIP: "DSIP inner page.png",
};

type ProductRow = { id: string; slug: string; name: string; informationSheetUrl: string | null };

type FolderMatch = {
  folder: string;
  files: string[];
  writeUp: string | null;
  size: string | null;
  product: ProductRow | null;
  matchedBy: string[];
  status: "ready" | "has a sheet" | "no product" | "no write-up by name" | "ambiguous";
};

/** Letters and digits only, lower case: "CJC-1295 (No DAC) / Ipamorelin" -> "cjc1295nodacipamorelin". */
function key(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function matchFolder(folder: string, products: ProductRow[]): Promise<FolderMatch> {
  const files = readdirSync(path.join(SOURCE, folder))
    .filter((file) => /\.png$/i.test(file))
    .sort();
  const writeUps = files.filter((file) => WRITE_UP.test(file));
  const exception = WRITE_UP_EXCEPTIONS[folder];
  const writeUp =
    exception && files.includes(exception) ? exception : writeUps.length === 1 ? writeUps[0] : null;

  const candidates = [{ from: "folder", key: key(folder) }];
  if (writeUp) {
    candidates.push({
      from: "file",
      key: key(writeUp.replace(/\.png$/i, "").replace(WRITE_UP, "")),
    });
  }

  const hits = new Map<string, { product: ProductRow; via: string[] }>();
  for (const product of products) {
    for (const candidate of candidates) {
      for (const [field, value] of [
        ["name", product.name],
        ["slug", product.slug],
      ] as const) {
        if (candidate.key !== "" && candidate.key === key(value)) {
          const hit = hits.get(product.id) ?? { product, via: [] };
          hit.via.push(`${candidate.from} = ${field}`);
          hits.set(product.id, hit);
        }
      }
    }
  }

  const size = writeUp
    ? await sharp(path.join(SOURCE, folder, writeUp))
        .metadata()
        .then((meta) => `${meta.width}x${meta.height}`)
    : null;
  const [only] = [...hits.values()];
  const product = hits.size === 1 ? only.product : null;
  let status: FolderMatch["status"];
  if (hits.size > 1) {
    status = "ambiguous";
  } else if (!product) {
    status = "no product";
  } else if (!writeUp) {
    status = "no write-up by name";
  } else if (product.informationSheetUrl) {
    status = "has a sheet";
  } else {
    status = "ready";
  }
  const matchedBy = hits.size === 1 ? only.via : [...hits.values()].map((hit) => hit.product.slug);
  if (exception && writeUp === exception) {
    matchedBy.push("write-up by approved exception");
  }
  return { folder, files, writeUp, size, product, matchedBy, status };
}

const prisma = new PrismaClient();
try {
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, informationSheetUrl: true },
    orderBy: { name: "asc" },
  });
  const folders = readdirSync(SOURCE, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

  const matches: FolderMatch[] = [];
  for (const folder of folders) {
    matches.push(await matchFolder(folder, products));
  }

  console.log(
    `Folders in Peptide Tab: ${folders.length}. Products in the database: ${products.length}.`,
  );
  console.log("");
  for (const [index, match] of matches.entries()) {
    console.log(
      [
        String(index + 1).padStart(2, " "),
        match.folder,
        match.writeUp ?? `(files: ${match.files.join(" | ")})`,
        match.size ?? "",
        match.product ? `${match.product.name} [${match.product.slug}]` : "",
        match.matchedBy.join(", "),
        match.status,
      ].join(" | "),
    );
  }

  const matchedProducts = new Set(matches.flatMap((m) => (m.product ? [m.product.id] : [])));
  const withoutFolder = products.filter((product) => !matchedProducts.has(product.id));
  const count = (status: FolderMatch["status"]) =>
    matches.filter((m) => m.status === status).length;
  console.log("");
  console.log(`Ready to upload: ${count("ready")}`);
  console.log(`Product already has a sheet (kept): ${count("has a sheet")}`);
  console.log(`Product matched but no file named "write up": ${count("no write-up by name")}`);
  console.log(`Folder with no product: ${count("no product")}`);
  console.log(`Ambiguous: ${count("ambiguous")}`);
  console.log(
    `Products with no folder: ${withoutFolder.length}${withoutFolder.length ? ` (${withoutFolder.map((p) => p.name).join(", ")})` : ""}`,
  );

  if (!UPLOAD) {
    console.log("");
    console.log("Dry run: nothing was uploaded or written. Add --upload to load the ready rows.");
  } else {
    const toLoad = matches.filter(
      (m) => m.status === "ready" && (ONLY === null || m.product?.slug === ONLY),
    );
    if (ONLY !== null && toLoad.length === 0) {
      console.error(`--only ${ONLY}: no ready row for that slug.`);
      process.exitCode = 1;
    }
    for (const match of toLoad) {
      const product = match.product as ProductRow;
      const writeUp = match.writeUp as string;
      const file = new File([readFileSync(path.join(SOURCE, match.folder, writeUp))], writeUp, {
        type: "image/png",
      });
      const problem = await imageFileError(file);
      if (problem) {
        console.error(`STOPPED at ${product.name}: ${problem}`);
        process.exitCode = 1;
        break;
      }
      const stored = await storeImage(file, {
        folder: `information-sheets/${product.slug}`,
        baseName: `${product.slug}-information-sheet`,
        ...SHEET_IMAGE_ENCODING,
      });
      if (!stored.ok) {
        console.error(`STOPPED at ${product.name}: ${stored.error}`);
        process.exitCode = 1;
        break;
      }
      await prisma.product.update({
        where: { id: product.id },
        data: {
          informationSheetUrl: stored.url,
          informationSheetAlt: `${product.name} product information sheet`,
        },
      });
      console.log(`Loaded ${product.name}: ${stored.url} (${Math.round(stored.bytes / 1024)} KB)`);
    }
  }
} finally {
  await prisma.$disconnect();
}
