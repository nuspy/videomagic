# Testing Guide

This project uses:
- API: Vitest + Supertest + Testcontainers (MariaDB)
- Web: Vitest + React Testing Library
- E2E: Playwright

## Commands

- Web unit/UI tests:
  - `npm test` (all root-level Vitest tests)
  - Watch: `npm run test:watch`
- API unit/integration tests:
  - `npm run test:api`
  - Spins up a throwaway MariaDB container via Testcontainers, runs Prisma migrations, then executes tests.
- E2E smoke tests:
  - `npm run test:e2e`
  - Starts the dev server (`npm run dev`) and runs Playwright tests against `http://localhost:5173`.
  - UI mode: `npm run test:e2e:ui`

First time Playwright run may require installing browsers:
- `npx playwright install`

## Included Test Samples

API:
- Auth callback (Google) mocked: verifies user creation and JWT cookies set.
- Upload validation: rejects executable-like payloads (415) and accepts images (creates Media, returns presigned URLs).
- Stripe webhook: simulates `payment_intent.succeeded`, updates Payment to SUCCEEDED and Order to PAID.

Web:
- Language switcher: changes locale and persists to localStorage.
- Protected route: redirects to Home when unauthenticated, shows Dashboard when authenticated.

E2E:
- Smoke: loads app, fakes login via localStorage, navigates to Dashboard, switches language.

## Reports and Pass/Fail

- Vitest:
  - Default list reporter prints passed/failed tests.
  - Exit code 0 on success; non-zero on failure.
- Playwright:
  - Reporters: list (stdout) + HTML (saved to `playwright-report/`).
  - Exit code 0 on success; non-zero on failure.

## Environment Notes

- API tests launch MariaDB in Docker (requires Docker available locally).
- No global rate limiting is enforced; security headers and targeted CORS are configured at the API.
- For E2E, the app runs in dev mode; API-dependent flows are not exercised in the smoke test (mock/fake login approach).
