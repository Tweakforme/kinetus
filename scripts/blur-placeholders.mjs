/**
 * Generates lib/blur-placeholders.json: a tiny base64 preview for every image in
 * public/products, keyed by its public URL. Runs on `prebuild` so the map is always
 * current at build time. Uses `sharp`, which ships with Next.js for image optimisation.
 */

import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "public", "products");
const outFile = path.join(root, "lib", "blur-placeholders.json");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const files = (await readdir(sourceDir)).filter((name) =>
  IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()),
);

const entries = await Promise.all(
  files.sort().map(async (name) => {
    const buffer = await sharp(path.join(sourceDir, name))
      .resize(12, 12, { fit: "inside" })
      .png({ compressionLevel: 9 })
      .toBuffer();
    return [`/products/${name}`, `data:image/png;base64,${buffer.toString("base64")}`];
  }),
);

await writeFile(outFile, `${JSON.stringify(Object.fromEntries(entries), null, 2)}\n`);
console.log(`blur placeholders: ${entries.length} image(s) → ${path.relative(root, outFile)}`);
