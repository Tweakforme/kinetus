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

// Recursive: the client's photography lives in public/products/<product-slug>/.
async function collect(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await collect(full)));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      found.push(path.relative(sourceDir, full).split(path.sep).join("/"));
    }
  }
  return found;
}

const files = await collect(sourceDir);

/*
 * Images with an alpha channel are skipped. A blur placeholder is painted as an opaque
 * `background-size: cover` rectangle, so a keyed render (transparent background) shows a
 * hard-edged grey box over the navy hero and inside the card media until the real image
 * arrives. Those images render with placeholder="empty" instead.
 */
const entries = [];
let skipped = 0;

for (const name of files.sort()) {
  const image = sharp(path.join(sourceDir, name));
  const { hasAlpha } = await image.metadata();
  if (hasAlpha) {
    skipped += 1;
    continue;
  }
  const buffer = await image
    .resize(12, 12, { fit: "inside" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  entries.push([`/products/${name}`, `data:image/png;base64,${buffer.toString("base64")}`]);
}

await writeFile(outFile, `${JSON.stringify(Object.fromEntries(entries), null, 2)}\n`);
console.log(
  `blur placeholders: ${entries.length} image(s), ${skipped} transparent skipped → ${path.relative(root, outFile)}`,
);
