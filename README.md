# Indian Coffee

Public website and administration application for the Indian Coffee restaurant. The project uses two independent Furin applications mounted on a single Elysia server.

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
cp .env.example .env
bun run db:migrate
bun run seed
bun run dev
```

The public website is available at `http://localhost:3000`, and the administration application is available at `http://localhost:3000/admin`.

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
bun run seed:dry
bun run seed

BOOTSTRAP_ADMIN_EMAIL=admin@example.com \
BOOTSTRAP_ADMIN_PASSWORD='a-password-with-12-characters' \
BOOTSTRAP_ADMIN_NAME='Indian Coffee' \
bun run bootstrap:admin
```

`DATABASE_URL` is mandatory in every environment, including development and tests. The server validates the connection, the migrated schema, and the required seeded content before listening; public content never falls back to in-memory data.

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

Deployment can use [Dockerfile.vercel](./Dockerfile.vercel) or the [vercel.json](./vercel.json) configuration.
