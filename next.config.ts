import type { NextConfig } from "next";

/**
 * Admin uploads live on this project's Vercel Blob store. The store id is part of the
 * read-write token ("vercel_blob_rw_<storeId>_<secret>"), and public blobs are served from
 * https://<storeid>.public.blob.vercel-storage.com, so next/image is allowed to optimise
 * images from this one store only.
 */
function blobStoreHostname(): string | null {
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3];
  return storeId ? `${storeId.toLowerCase()}.public.blob.vercel-storage.com` : null;
}

const blobHost = blobStoreHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: blobHost ? [{ protocol: "https", hostname: blobHost, pathname: "/**" }] : [],
  },
  experimental: {
    serverActions: {
      // Admin image uploads are capped at 4 MB per file (lib/admin/uploads.ts); this
      // leaves room for multipart overhead while staying under Vercel's 4.5 MB request
      // body limit for functions.
      bodySizeLimit: "4.4mb",
    },
  },
};

export default nextConfig;
