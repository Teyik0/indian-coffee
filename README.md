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

- Bun 1.4, `@teyik0/furin@0.3.0-alpha.1`, Elysia, and Effect 4 beta.102 (installed as `effect4`);
- React 19.2, Tailwind CSS 4, and shadcn `base-nova` on Base UI;
- Valibot and Formisch for React forms; Effect Schema v4 and Standard Schema for Elysia validation;
- Drizzle and Neon for persistence;
- Better Auth for administration authentication;
- UploadThing and `Bun.Image` for media processing;
- Resend and a transactional outbox for reservations;
- Biome and React Doctor for code quality.

## Development

```bash
bun install
cp .env.example .env
bun run db:migrate
bun run db:migrate:furin
bun run seed
bun run dev
```

The public website is available at `http://localhost:3000`, and the administration application is available at `http://localhost:3000/admin`.

Furin is installed from the npm registry and pinned exactly. Upgrading it requires the complete typecheck, test, Doctor, build, and smoke-test validation.

## Application structure

The public and administration page trees are intentionally isolated:

```text
src/
  pages/                 # Public Furin application
  admin/                 # Administration Furin application
  api/modules/           # Domain modules and Elysia API routes
  api/effect/            # Services, Layers, errors, schemas and ManagedRuntime
  components/public/     # Public-only compositions
  components/admin/      # Administration-only compositions
  components/ui/         # Shared shadcn Base UI primitives
  db/                    # Drizzle schemas and migrations
```

Public routes include `/`, `/menu`, `/menu/:slug`, `/gallery`, `/contact`, `/legal`, and `/privacy`, plus `/sitemap.xml` and `/robots.txt`. Administration routes include `/admin`, `/admin/menu`, `/admin/menu/:id`, `/admin/gallery`, `/admin/content`, `/admin/hours`, `/admin/reservations`, `/admin/reservations/:id`, `/admin/users`, and `/admin/forbidden`.

Two back-office roles share one permission matrix, defined in [src/api/lib/permissions.ts](./src/api/lib/permissions.ts) and enforced both by the Elysia macros and by the page guards. `admin` has every permission; `editor` — the dining-room role — manages the menu, gallery, content, hours, and reservations, but never accounts. Any other role, including the `customer` role a social sign-in creates, lands on `/admin/forbidden` rather than a bare 403.

Opening hours are the single source of truth for the public "open now" badge, the `Restaurant` structured data, and reservation validation: [src/api/modules/content/opening-hours.service.ts](./src/api/modules/content/opening-hours.service.ts) resolves the weekly grid against exceptional closures, and the reservation service derives its bookable slots from it. Editing the hours in the back office therefore changes which reservations are accepted.

### Effect conventions

The application follows the rule **“Effect inside, Promise at framework boundaries”**. Domain and infrastructure dependencies are exposed as `Context.Service` values, assembled by Layers in `src/api/effect/layers.ts`, and executed by one `ManagedRuntime`. Elysia handlers, Furin loaders, React callbacks, Drizzle transaction callbacks, and vendor SDKs are the deliberate Promise boundaries.

Expected failures use `Data.TaggedError` for Effect integration and Valibot for runtime validation. `DomainError` remains public and preserves the existing HTTP codes and payloads; persistence, authentication, storage, email, and image failures remain internal and are masked as `500 INTERNAL_ERROR`. Effect Schema remains the internal source of truth for API models, with `Schema.toStandardSchemaV1` as the Elysia adapter.

Tests use `bun:test` with replaceable Layers. Time, crypto, storage, and other dependencies should be replaced through their services instead of global mocks.

> Effect 4 is currently a beta and may introduce breaking changes; Effect 3 remains the production recommendation. The application beta is pinned exactly through the `effect4` npm alias because UploadThing still requires Effect 3 under the canonical `effect` package name. This keeps both dependency trees isolated without patches. Upgrading either version requires the complete typecheck, test, Doctor, and build validation.

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

The seed preserves all 215 historical menu entries and 40 existing images in PostgreSQL. It is safe to rerun: categories are updated by slug, their contents are recreated in a transaction, and the seven-day opening grid is filled in without overwriting hours already adjusted in the back office.

Migration `0001` normalises the legacy opening hours. Earlier rows only existed for days 1, 5 and 7, with the covered range encoded in the label (« Lundi — Jeudi »); the migration carries the last defined day forward so that the seven days are all present, then clears those labels, which now denote a service (« Midi », « Soir ») rather than a range of days. Without that step Tuesday, Wednesday, Thursday and Saturday would silently read as closed and reservations on those days would be refused.

## Quality and delivery

```bash
bun run check
bun run typecheck
bun test
bun run doctor
bun run build
bun run smoke
```

The `furin build --target bun --compile embed` command validates the configured environment while producing a standalone Bun binary with separate `client/` and `client-admin/` bundles. The smoke test runs against the configured database and verifies public rendering, the administration login, unauthenticated redirects, the public not-found boundary, English route paths, bundle isolation, the legal pages, the sitemap and robots files, the `Restaurant` structured data, the absence of any administration link on public pages, and that `/api/auth/*` reaches Better Auth rather than the page catch-all.

Public pages use tagged ISR with a five-minute TTL. Administration pages remain uncached SSR, and replayable mutations use Furin's durable PostgreSQL sync runtime.

Clean installs and deployments use the published Furin package; no adjacent Furin checkout or local Bun link is required.
