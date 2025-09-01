# API (Express + Google OAuth + JWT cookies)

Features:
- Security headers via Helmet (strict in prod; relaxed CSP/COEP only in dev)
- CORS restricted to `ALLOWED_ORIGINS` CSV with credentials enabled for httpOnly cookies
- Auth, uploads, payments, emails (see other sections)

## CORS and Security Headers

Allowed origins:
- Dev: typically `http://localhost:5173` (Vite) — set `ALLOWED_ORIGINS=http://localhost:5173`
- Prod: set to your public web origins, e.g. `ALLOWED_ORIGINS=https://example.com,https://www.example.com`

Behavior:
- Requests with Origin header matching one of `ALLOWED_ORIGINS` receive:
  - `Access-Control-Allow-Origin: <origin>`
  - `Access-Control-Allow-Credentials: true`
  - Preflight (OPTIONS) is handled and returns 204 with the same headers.
- Requests with an Origin not in the list are rejected by CORS middleware (500 via global handler in dev; do not leak details in prod).
- Requests without an Origin header (e.g., curl, server-to-server) are allowed.

Helmet:
- In development, `contentSecurityPolicy` and `crossOriginEmbedderPolicy` are disabled to avoid blocking local tooling/HMR.
- In production, default Helmet protections are applied.

## Testing CORS

A Vitest + Supertest suite is provided:
- File: `apps/api/tests/cors.test.js`
- Run: `npm run test:api`
- It verifies:
  - Allowed origin gets ACAO and credentials headers.
  - Disallowed origin is rejected and no ACAO header is returned.
  - Preflight requests are answered correctly.
