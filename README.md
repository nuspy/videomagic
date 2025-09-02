# Monorepo (apps/web, apps/api)

Single repository with:

- apps/web: Vite + React (i18next it/en/ua)
- apps/api: Express (Prisma on MariaDB), uploads to S3-compatible storage
- Integrations: Google OAuth, Stripe (Stripe Tax), PayPal, Wavespeed (Media Upload + WAN 2.2 I2V/T2V)
- Security: CORS, Helmet
- Infra: Docker Compose (dev/prod)

This step sets up npm workspaces, lint/format, Husky pre-commit, and environment placeholders. You can add application code later.

## Workspaces

- Root uses npm workspaces with `apps/*`.
- Each app has its own scripts; root scripts orchestrate both.

## Scripts

At repository root:

- Dev: `npm run dev` (runs web and api), or individually `npm run dev:web`, `npm run dev:api`
- Build: `npm run build` (both), or `npm run build:web`, `npm run build:api`
- Test: `npm test` (runs workspace test scripts), or `npm run test:web`, `npm run test:api`
- Lint: `npm run lint`
- Format: `npm run format` (write), `npm run format:check` (check)
- Prepare Husky: `npm run prepare`

## Lint/Format

- ESLint (flat config) at root, Prettier configured via `.prettierrc.json`
- Pre-commit hook: Husky + lint-staged (formats and lints staged files)

## Environment Variables (placeholders)

Copy `.env.example` to `.env` and fill values per environment. No secrets should be committed.

- App:
  - NODE_ENV, PORT, APP_BASE_URL, API_BASE_URL, ALLOWED_ORIGINS, DEFAULT_LOCALE, SUPPORTED_LOCALES, PAYMENTS_DEFAULT_CURRENCY, COOKIE_SAMESITE, COOKIE_NAME_ACCESS, COOKIE_NAME_REFRESH
- Auth / JWT:
  - JWT_SECRET, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES
- Database (Prisma/MariaDB):
  - DATABASE_URL
- Google OAuth:
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_REDIRECT_URI
- SMTP:
  - SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
- S3/MinIO:
  - S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET, S3_BUCKET_UPLOADS, S3_FORCE_PATH_STYLE, S3_SIGNED_URL_EXPIRES, MAX_UPLOAD_BYTES
- Stripe (incl. Stripe Tax):
  - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_TAX_ENABLED, VAT_FALLBACK_RATE
- PayPal:
  - PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID, PAYPAL_ENV, PAYPAL_MODE
- AI (OpenAI/Gemini):
  - OPENAI_API_KEY, GEMINI_API_KEY, GOOGLE_GENAI_API_KEY, AI_PROVIDER_DEFAULT, AI_MODEL_DEFAULT, AI_TEMPERATURE_DEFAULT, AI_NEGATIVE_PROMPT_DEFAULT
- Wavespeed:
  - WAVESPEED_API_KEY, WAVESPEED_API_BASE

## Macro-prompts (next steps)

1. FE scaffold: routing, i18n dynamic, locale switcher, design tokens, minimal pages, SEO, tests
2. API auth: Google OAuth (OIDC), JWT httpOnly session + refresh, roles user|admin
3. DB schema: users, media/upload, orders/payments, audit; migrations + seed
4. Media uploads: S3/MinIO, thumb 640px, metadata, presigned endpoints
5. Payments: Stripe (PaymentIntents + Stripe Tax), PayPal; webhooks; order/payment state
6. Emails: SMTP via nodemailer, template-based; admin test endpoint
7. Security & CORS: Helmet config, allowed origins, tests
8. Docker Compose: dev/prod with web (Nginx), api, db (MariaDB), minio, mailpit (dev)

## Getting Started

- Install: `npm install`
- Initialize Husky: `npm run prepare`
- Validate tooling: `npm run lint` and `npm run format:check`
