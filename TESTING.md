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
- E2E tests:
  - `npm run test:e2e`
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
- Autosave (unit): draftStorage save/load/TTL/clear/size; DraftContext debounced save and derived scenesCount/maxImages.
- Autosave (E2E): Resume modal on reload, Discard clears storage, language change does not translate data.

E2E:

- Smoke: loads app, fakes login via localStorage, navigates to Dashboard, switches language.
- Autosave: see e2e/autosave.spec.ts.

## Acceptance Updates

Macro-prompt 4 (Frontend Landing + Chat wizard):

- Autosave integrated with debounce and TTL; restore after refresh; expiry after 30 days; clear draft available; graceful no-storage banner.
- Privacy disclaimer shown at first step; links to Privacy and Terms.

Macro-prompt 5 (Upload):

- When opening Upload overlay, if draft.status is "submitted" and lead exists, keep draft until uploads complete, then propose "Clear draft".
- Show used/max images count (max = scenesCount × 2) synced with draft; changing duration (pre-submit) updates scenesCount and image limit next time Upload opens.

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
- For E2E, the app runs in dev mode; API-dependent flows are not exercised in the smoke test.
