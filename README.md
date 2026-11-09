# meshbay-sample-monorepo

pnpm workspace sample (stack E) for the Meshbay vs Railway side-by-side test: a Next.js frontend, an Express API and a
shared package, all deployed from one repo.

```
meshbay-sample-monorepo
├── apps/api        Express 5 + pg, Postgres, listens on PORT (default 8080)
├── apps/web        Next.js 15, reads API_URL at runtime, listens on PORT (default 3000)
└── packages/shared shared contract constants + item helpers used by both apps
```

## Environment

| Variable | Used by | Required | Default | Description |
|---|---|---|---|---|
| `DATABASE_URL` | `apps/api` | yes | none | Postgres connection string, e.g. `postgres://user:password@host:5432/app` |
| `API_URL` | `apps/web` | no | `http://localhost:8080` | Base URL of the Express API, read on the server at runtime |
| `PORT` | both | no | `8080` / `3000` | HTTP port of each app |

When both apps run in one service, `apps/web` gets the platform `PORT` and reaches the API at `http://localhost:8080`,
so `API_URL=http://localhost:8080` is the value to set.

## Run locally

```sh
pnpm install
DATABASE_URL=postgres://postgres:postgres@localhost:5432/app API_URL=http://localhost:8080 pnpm dev
```

That starts both apps in parallel. Production:

```sh
pnpm build
DATABASE_URL=postgres://postgres:postgres@localhost:5432/app PORT=3000 pnpm start
```

`pnpm build` builds `apps/web` (the API is plain ESM JavaScript and needs no build step). `pnpm check` runs
`node --check` on the API and `tsc --noEmit` on the web app.

## Endpoints

Served by `apps/api`:

| Method | Path | Description |
|---|---|---|
| GET | `/health` | `200 {"status":"ok","version":"v1"}` |
| GET | `/api/items` | JSON array of items |
| POST | `/api/items` | Body `{"name":"..."}` → `201` with the created item |

The `items` table is created on start when it is missing. CORS is open for every origin.

The web app lists the items on the server (`GET {API_URL}/api/items`) and its form posts to `/api/items` on the web
app, which proxies to the API, so `API_URL` never reaches the browser. The contract constants (`/health`,
`/api/items`, `v1`, name validation) live in `packages/shared` and are imported by both apps.
