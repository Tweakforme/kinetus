# Kinetus BioLabs — website

Next.js (App Router) · TypeScript · PostgreSQL (Prisma) · Vercel.

**Status: Phase 2 scaffold.** Deployable, empty shell — header (with mobile navigation),
research-use band, footer, design tokens, database schema and SEO infrastructure.
No product/content pages, admin UI or order-request flow yet (Phases 3–8).

## Scripts

| Command                  | What it does                                       |
| ------------------------ | -------------------------------------------------- |
| `npm run dev`            | Local dev server on http://localhost:3000          |
| `npm run build`          | Production build                                   |
| `npm run lint`           | ESLint (Next core-web-vitals + TypeScript)         |
| `npm run typecheck`      | `tsc --noEmit`                                     |
| `npm run format`         | Prettier (write); `npm run format:check` to verify |
| `npx prisma validate`    | Validate `prisma/schema.prisma`                    |
| `npx prisma migrate dev` | Create/apply migrations (requires `DATABASE_URL`)  |

`prisma generate` runs automatically after `npm install` (postinstall).

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — PostgreSQL connection string (Prisma).
- `NEXT_PUBLIC_SITE_URL` — public origin, no trailing slash (canonical URLs, sitemap, robots, JSON-LD).

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
