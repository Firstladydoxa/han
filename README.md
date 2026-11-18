# HAN frontend

The translator-facing web app for **HAN**, TNI's AI-assisted translation assistant. *AI translates. Humans understand. TNI decides.*
Next.js (App Router) + TypeScript + Tailwind CSS. It talks only to same-origin `/v1/*`, which a server-side proxy route forwards to the
HAN API ([hanapi](https://github.com/Firstladydoxa/hanapi)); the browser never holds provider credentials and never sees engine details.

## Features
- **HAN Chat**, **Quick translate** and a CAT-style **Translation Workspace** (side-by-side segments, versions, QA, Translation Memory and terminology panels)
- Human-only approval with confirmation; every edit is a new version; AI suggestion, translator-edited and approved text are visually distinct
- Language readiness tiers shown per pair; admin (users, projects, terminology, readiness), operations (technical admins) and audit pages
- Role-aware navigation is convenience only: the backend enforces every permission

## Run
```sh
cp .env.example .env.local        # HAN_BACKEND_URL (default http://127.0.0.1:8000)
npm ci
npm run dev                       # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run build` / `npm start` | production bundle / server |
| `npm run lint`, `npx tsc --noEmit` | lint, strict typecheck |
| `npm test` | Vitest (API client CSRF/401, engine-leak guard, version labels, approval controls, export) |

## Structure
`app/` routes (`(app)/` is the signed-in area; `v1/[...path]/route.ts` is the backend proxy) · `components/` UI · `lib/api.ts` typed API client
mirroring the backend contract · `lib/labels.ts` status/tier/version labels · `tests/`.

## Configuration and deployment
- `HAN_BACKEND_URL` is read **at request time** by the proxy route (not baked into the build), so one build works in any environment.
- Security headers and a same-origin CSP are set in `next.config.mjs` (inline scripts are allowed because Next.js needs them without a nonce setup).
- `Dockerfile` builds a standalone, non-root image. On the cPanel server, `.htaccess` reverse-proxies the subdomain to `next start` on
  `127.0.0.1:3030` (cPanel's PHP-handler block is preserved, `/.well-known/` stays local for AutoSSL). The full stack, accounts, backups and
  limits are described in the hanapi README ("Production pilot on this server").
