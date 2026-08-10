# AISeekhegaIndia Backend

Fastify + TypeScript API with Google OAuth (Authorization Code + PKCE), JWT session cookie (`asid`), and Neon Postgres via Prisma.

## Run locally

1. Copy `.env.example` → `.env` (or keep your existing Google keys and add the new vars).
2. Create a Neon project (dev branch). Put the **pooled** URL in `DATABASE_URL` and the **direct** URL in `DIRECT_URL` (`?sslmode=require`).
3. Install and migrate:

```bash
npm install
npx prisma migrate dev --name init_user
npm run dev
```

- Health: `GET http://localhost:4000/health`
- Meta: `GET http://localhost:4000/api/v1/meta` (`features.auth: true`)
- Sign-in: navigate to `http://localhost:4000/api/v1/auth/google`
- Me: `GET /api/v1/auth/me` with `credentials: 'include'`
- Logout: `POST /api/v1/auth/logout` with credentials

## Auth contract (front)

- Sign-in button: full navigation to `{API_URL}/api/v1/auth/google` (not `fetch`).
- After redirect to `{FRONTEND_URL}/auth/callback`, call `GET /api/v1/auth/me` with credentials.
- Front env: `NEXT_PUBLIC_API_URL=http://localhost:4000` (or `NEXT_PUBLIC_API_BASE_URL`).

## Google Cloud Console (human)

- OAuth client type: Web application
- Authorized JS origins: `http://localhost:3000`, `https://aiseekhegaindia.com`
- Redirect URIs:
  - `http://localhost:4000/api/v1/auth/google/callback`
  - `https://api.aiseekhegaindia.com/api/v1/auth/google/callback` (prod)
- Scopes used in code: `openid`, `email`, `profile`
- Do **not** enable Cloud SQL — database is Neon

## Neon

- Local: Neon **development** branch URLs in `.env`
- Prod: Neon **production** branch URLs in Secret Manager
- Runtime uses pooled `DATABASE_URL`; migrations use `DIRECT_URL` only
- Never commit Neon URLs

## Cloud Run (Phase 6 ops)

Region: `asia-south1`. Image: multi-stage `Dockerfile` (`node:20-alpine`).

Suggested flow:

1. Enable Cloud Run, Artifact Registry, Secret Manager APIs
2. Store secrets: `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `DATABASE_URL`, `DIRECT_URL` (migrate job only)
3. Set plain env: `NODE_ENV=production`, `GOOGLE_CLIENT_ID`, `GOOGLE_REDIRECT_URI` (must be `{API}/api/v1/auth/google/callback`), `FRONTEND_URL`, `CORS_ORIGIN` (optional; defaults to `FRONTEND_URL`), `PORT=8080`
4. Runtime also accepts missing `DIRECT_URL` (falls back to `DATABASE_URL`). Still set `DIRECT_URL` for migrate jobs.
5. Run `npx prisma migrate deploy` as a CI step / Cloud Run Job **before** traffic (not on container boot)
6. Map `api.aiseekhegaindia.com` when ready; update OAuth redirect URI

Runtime SA needs Secret Manager accessor only — **no** Cloud SQL Client role.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | `tsx watch` local server |
| `npm run build` | `tsc` → `dist/` |
| `npm start` | run compiled server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run prisma:generate` | generate client |
| `npm run prisma:migrate` | `prisma migrate dev` |

Secondary product decisions: `DEFERRED.md`. Full architecture: `AUTH_IMPLEMENTATION_PLAN.html`.
