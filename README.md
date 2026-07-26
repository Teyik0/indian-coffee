# 🍛 Indian Coffee

<div align="center">

![Indian Coffee Logo](https://img.shields.io/badge/Indian-Coffee-orange?style=for-the-badge&logo=restaurant)

**🌟 Découvrez l'authentique cuisine indienne à Savigny-le-Temple 🌟**
**🌟 Discover the authentic indian food at Savigny-le-Temple 🌟**

[![Website](https://img.shields.io/badge/Website-indiancoffee.fr-gold?style=flat-square&logo=web)](https://indiancoffee.fr/)
[![Location](https://img.shields.io/badge/📍-Savigny--le--Temple-red?style=flat-square)](https://maps.google.com/maps?q=8%20impasse%20de%20l'or%C3%A9e%20du%20bois%20Savigny%20Le%20Temple)
[![Phone](https://img.shields.io/badge/📞-01%2060%2063%2054%2097-green?style=flat-square)](tel:+33160635497)

</div>

---

## Stack

- Bun 1.4, Furin, and Elysia;
- React 19.2, Tailwind CSS 4, and shadcn `base-nova` on Base UI;
- Formisch and Valibot for forms and validation;
- Drizzle and Neon for persistence;
- Better Auth for administration authentication;
- UploadThing and `Bun.Image` for media processing;
- Resend and a transactional outbox for reservations;
- Biome and React Doctor for code quality.

## Development

```bash
bun install
bun run link:furin
cp .env.example .env
bun run db:migrate
bun run db:migrate:furin
bun run seed
bun run dev
```

The public website is available at `http://localhost:3000`, and the administration application is available at `http://localhost:3000/admin`.

`bun run link:furin` registers `../furin/packages/core`, links it with `bun link --no-save`, and shares Indian Coffee's React, Elysia, and evlog peers with the linked package. The link is intentionally local and is not persisted in `package.json` or `bun.lock`.

## Application structure

The public and administration page trees are intentionally isolated:

```text
src/
  pages/                 # Public Furin application
  admin/                 # Administration Furin application
  api/modules/           # Domain modules and Elysia API routes
  components/public/     # Public-only compositions
  components/admin/      # Administration-only compositions
  components/ui/         # Shared shadcn Base UI primitives
  db/                    # Drizzle schemas and migrations
```

Public routes include `/`, `/menu`, `/gallery`, `/contact`, and `/privacy`. Administration routes include `/admin`, `/admin/menu`, `/admin/gallery`, `/admin/content`, `/admin/hours`, `/admin/reservations`, and `/admin/users`.

## Database

```bash
bun run db:migrate
bun run db:migrate:furin
bun run seed:dry
bun run seed

BOOTSTRAP_ADMIN_EMAIL=admin@example.com \
BOOTSTRAP_ADMIN_PASSWORD='a-password-with-12-characters' \
BOOTSTRAP_ADMIN_NAME='Indian Coffee' \
bun run bootstrap:admin
```

`DATABASE_URL` is mandatory in every environment, including development and tests. The server validates the connection, the migrated schema, and the required seeded content before listening; public content never falls back to in-memory data.

Deployments must run Drizzle migrations first, then `bun run db:migrate:furin`, and only then start the server. The Furin migration owns its internal `furin_sync` schema, is idempotent, and is never run automatically by the application.

The seed preserves all 215 historical menu entries and 40 existing images in PostgreSQL. It is safe to rerun: categories are updated by slug, and their contents are recreated in a transaction.

## Quality and delivery

```bash
bun run check
bun run typecheck
bun test
bun run doctor
bun run build
bun run smoke
```

The `furin build --target bun --compile embed` command validates the configured environment while producing a standalone Bun binary with separate `client/` and `client-admin/` bundles. The smoke test runs against the configured database and verifies public rendering, the administration login, unauthenticated redirects, the public not-found boundary, English route paths, and bundle isolation.

Public pages use tagged ISR with a five-minute TTL. Administration pages remain uncached SSR, and replayable mutations use Furin's durable PostgreSQL sync runtime.

CI and clean deployments are temporarily suspended while Indian Coffee targets the unreleased local Furin source. Once that version is published, replace `@teyik0/furin@0.2.0-alpha.5`, remove its patch, regenerate `bun.lock`, and reactivate deployment through [Dockerfile.vercel](./Dockerfile.vercel) or [vercel.json](./vercel.json).
