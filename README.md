# Kinetus BioLabs — website

Next.js (App Router) · TypeScript · PostgreSQL (Prisma) · Vercel.

**Status: build complete (Phase 9).** Public catalogue and content pages, cart and
checkout (orders are placed without payment; the client arranges Interac e-Transfer), and
the admin at `/admin`: orders, contact messages, catalogue, collections, discounts and store
settings.

## Scripts

| Command                     | What it does                                                |
| --------------------------- | ----------------------------------------------------------- |
| `npm run dev`               | Local dev server on http://localhost:3000                   |
| `npm run build`             | Production build                                            |
| `npm run lint`              | ESLint (Next core-web-vitals + TypeScript)                  |
| `npm run typecheck`         | `tsc --noEmit`                                              |
| `npm run format`            | Prettier (write); `npm run format:check` to verify          |
| `npm run admin:create`      | Create or replace the admin account (see below)             |
| `npx prisma validate`       | Validate `prisma/schema.prisma`                             |
| `npx prisma migrate deploy` | Apply migrations (requires `DATABASE_URL` and `DIRECT_URL`) |
| `npx prisma db seed`        | Seed the catalogue and configuration (see "Seed" below)     |

`prisma generate` runs automatically after `npm install` (postinstall).

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`, `DIRECT_URL`: pooled and direct PostgreSQL connection strings (Prisma).
- `NEXT_PUBLIC_SITE_URL`: public origin, no trailing slash (canonical URLs, sitemap, robots, JSON-LD).
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob store for admin image uploads. The store must be
  **public**: product images are shown on the public site.
- `ADMIN_SESSION_SECRET`: 32+ random characters that sign admin session cookies. Set a
  different value in each environment (local, Vercel).

## Admin

- `/admin/login` is the only admin page open without a session. `proxy.ts` sends every
  other `/admin` request to it unless the session cookie's signature and expiry check out;
  every admin page and server action then checks the session row in the database
  (`lib/admin/auth.ts`), so logging out or resetting the password takes effect at once.
- One admin account. Create it:

  ```bash
  npm run admin:create -- --email you@example.com --password "a long passphrase"
  ```

  If an admin account already exists (this email or another), the script stops; add
  `--replace` to give that account the new email and password, which signs out every
  session. Passwords need 12 characters or more. `ADMIN_EMAIL` and `ADMIN_PASSWORD` work in
  place of the flags. In PowerShell, quote the double dash (`npm run admin:create '--' ...`):
  unquoted, PowerShell drops it and npm keeps the flags for itself.

- Sign-in is rate limited: 5 failures per address or 10 per email in 15 minutes.
- Catalogue pages are static and have no timer. Admin saves expire the cache tags in
  `lib/cache.ts` (`revalidateTag(tag, { expire: 0 })`), so the next visit renders fresh
  data. A scheduled sale start or end regenerates the pages that show that price. A
  change made outside the admin (the seed, a SQL edit) appears after the next deploy or
  the next admin save.

## Seed

`npx prisma db seed` loads the price list catalogue, the per-strength render mapping and
the commerce configuration. Once an admin account exists the client owns the catalogue, so
the seed leaves products, collections, codes and tiers alone unless
`SEED_CATALOGUE=overwrite` is set (which discards admin edits). Tax rates and the settings
row are only ever created when missing.

## Design tokens

`app/tokens.css` is generated from the approved Figma file (`5b152nyjmEbijXyURBA5H0`,
variable collection "Kinetus"). Update values in Figma and re-pull; do not hand-edit hex
codes or spacing in components. Inter is loaded with `next/font` and exposed as
`--font-inter`, consumed by `--kinetus-font-family`. Typography classes (`.type-h1`,
`.type-body-s`, `.type-label`, …) in `app/globals.css` map 1:1 to the Figma text styles.

## Layout conventions

- Container: 1240px max content width, 80px desktop / 20px mobile side margins
  (`components/layout/Container.tsx`).
- Breakpoint: `768px` (mobile-first; the approved frames are 390 and 1440 wide).
- Prices are stored as integer minor units (cents).
- `Product` is the only routable catalogue entity (`/products/[slug]`, `/collections/[slug]`);
  variants are UI state, never routes.

## Client reference materials

Client-supplied documents and imagery live in the project root and are git-ignored
(`/*.docx`, `/*.pptx`, `/*.pdf`, root-level images). The approved logo is copied to
`public/kinetus-logo.png`.
