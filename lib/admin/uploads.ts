import { del, put } from "@vercel/blob";
import sharp from "sharp";

/**
 * Admin image uploads: validated, optimised, then stored on the project's Vercel Blob
 * store (BLOB_READ_WRITE_TOKEN).
 *
 *  - Type is read from the file's contents, not its name or the browser's claim: JPEG,
 *    PNG or WebP only.
 *  - Size: 4 MB at most (Vercel accepts request bodies up to 4.5 MB; the client's source
 *    renders are all under 2 MB). At least 200 px on each side.
 *  - Optimised: turned upright from camera orientation data, scaled down to fit the given
 *    edge (1600 px for product renders, matching public/products), re-encoded as WebP
 *    (transparency kept), metadata removed.
 *  - Information sheets (the client's write-up graphics) are dense with small print: they
 *    keep up to 2000 px and are encoded at quality 90 with sharper colour sampling, which
 *    keeps coloured table text crisp (checked against two of the client's 1536 x 1024
 *    sheets: 299 KB and 330 KB, against 235 KB and 265 KB at the render settings).
 */

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4 MB";
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";
const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp"]);
const MIN_EDGE = 200;
/** Refuses images over 50 megapixels before decoding them. */
const PIXEL_LIMIT = 50_000_000;

/** Encoding for information sheets (product renders use storeImage's defaults). */
export const SHEET_IMAGE_ENCODING = { maxEdge: 2000, quality: 90, smartSubsample: true };

export type UploadResult =
  | { ok: true; url: string; width: number; height: number; bytes: number }
  | { ok: false; error: string };

/** A chosen file from a form, or null when the file input was left empty. */
export function chosenFile(form: FormData, name: string): File | null {
  const value = form.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

/** Checks everything that can be checked before uploading. Null when the file is usable. */
export async function imageFileError(file: File): Promise<string | null> {
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_UPLOAD_LABEL}.`;
  }
  try {
    const meta = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: PIXEL_LIMIT,
    }).metadata();
    if (!meta.format || !ACCEPTED_FORMATS.has(meta.format)) {
      return "That file is not a JPEG, PNG or WebP image. Export it in one of those formats and try again.";
    }
    if ((meta.width ?? 0) < MIN_EDGE || (meta.height ?? 0) < MIN_EDGE) {
      return `That image is ${meta.width} × ${meta.height} pixels. Use one at least ${MIN_EDGE} pixels on each side.`;
    }
  } catch {
    return "That file could not be read as an image. Upload a JPEG, PNG or WebP.";
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return "Image storage is not configured on this server (BLOB_READ_WRITE_TOKEN is missing).";
  }
  return null;
}

/**
 * Optimises and stores an image already checked with imageFileError. The stored name is
 * "<folder>/<baseName>-<random>.webp", so replacing an image never overwrites another.
 */
export async function storeImage(
  file: File,
  options: {
    folder: string;
    baseName: string;
    maxEdge: number;
    /** WebP quality, 85 unless given. */
    quality?: number;
    /** Sharper colour sampling for small coloured text; off unless given. */
    smartSubsample?: boolean;
  },
): Promise<UploadResult> {
  try {
    const { data, info } = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: PIXEL_LIMIT,
    })
      .rotate()
      .resize({
        width: options.maxEdge,
        height: options.maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: options.quality ?? 85,
        alphaQuality: 90,
        effort: 5,
        smartSubsample: options.smartSubsample ?? false,
      })
      .toBuffer({ resolveWithObject: true });

    const blob = await put(`${options.folder}/${options.baseName}.webp`, data, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: true,
    });
    return { ok: true, url: blob.url, width: info.width, height: info.height, bytes: info.size };
  } catch (error) {
    console.error("[admin] Image upload failed:", error);
    // A private Blob store refuses public uploads, and its files cannot be shown on the site.
    if (error instanceof Error && /private access|private store/i.test(error.message)) {
      return {
        ok: false,
        error:
          "Image storage is set up as private, so uploaded images could not be shown on the site. Nothing was uploaded. Ask whoever manages the site to connect a public Vercel Blob store.",
      };
    }
    return { ok: false, error: "The image could not be stored. Try again in a moment." };
  }
}

/** True for files on Vercel Blob, as opposed to images shipped in public/. */
export function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/**
 * Deletes uploaded files that are no longer referenced. Images shipped in public/ are
 * part of the site's code and are never touched. Failures are logged, not thrown: the
 * database change has already been made.
 */
export async function deleteStoredImages(urls: Array<string | null | undefined>): Promise<void> {
  const owned = urls.filter((url): url is string => typeof url === "string" && isBlobUrl(url));
  if (owned.length === 0) {
    return;
  }
  try {
    await del(owned);
  } catch (error) {
    console.error("[admin] Could not delete stored images:", owned, error);
  }
}
