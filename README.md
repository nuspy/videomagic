# Web App Scaffold (Vite + React)

Features:
- Routing: Home (/), Pricing (/pricing), Dashboard (/dashboard, protected), NotFound (*).
- i18n: i18next + react-i18next + language detector with dynamic locales from config.
- Language switcher: persistent override (localStorage), auto-detect browser language.
- UI: basic responsive layout, Navbar, Footer, and design tokens (colors, spacing, radius).
- SEO: per-page title/description, basic Open Graph meta, favicon placeholder.
- Tests: Vitest + React Testing Library for language switcher and routing.

## Generated Files

- src/i18n.js
- src/config/locales.js
- src/styles/tokens.css
- src/components/LanguageSwitcher.jsx
- src/components/Navbar.jsx
- src/components/Footer.jsx
- src/components/Seo.jsx
- src/components/ProtectedRoute.jsx
- src/layouts/RootLayout.jsx
- src/pages/Home.jsx
- src/pages/Pricing.jsx
- src/pages/Dashboard.jsx
- src/pages/NotFound.jsx
- src/locales/en/common.json
- src/locales/it/common.json
- src/locales/ua/common.json
- src/tests/setup.js
- src/components/__tests__/LanguageSwitcher.test.jsx
- src/routes/__tests__/routing.test.jsx
- Updated: package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx, src/index.css

## Getting Started

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Test: `npm test` (watch: `npm run test:watch`)

## i18n: Adding a New Language

1. Edit `src/config/locales.js`:
   - Add the language code to `SUPPORTED_LOCALES` (e.g., `['en', 'it', 'ua', 'fr']`).
   - Optionally add a friendly label in `LOCALE_LABELS` (e.g., `fr: 'Français'`).
2. Create translation file: `src/locales/<lang>/common.json` with the same keys as other languages.
3. Restart dev server if needed. The language will appear in the language switcher automatically.

The detector supports `?lng=<code>` query param and persists choice in `localStorage` under `i18nextLng`. Fallback language is `DEFAULT_LOCALE` from the config.

## i18n: Adding New JSON Keys

1. Add the key to all `src/locales/{lang}/common.json` files under the appropriate section.
2. Use the key in components/pages with `useTranslation()`:
   ```js
   const { t } = useTranslation()
   t('section.key')
   ```

## Routing

- Routes are defined in `src/App.jsx`.
- The Dashboard route is protected by `src/components/ProtectedRoute.jsx`, which currently checks `localStorage.getItem('authed') === 'true'`. Integrate your auth and update this logic accordingly.

## SEO

- Use the `<Seo />` component in each page to set `title` and `description`. OG title/description are updated automatically.
- Base head tags and favicon placeholder are in `index.html`.

## Tests

- Language Switcher: `src/components/__tests__/LanguageSwitcher.test.jsx`
- Routing: `src/routes/__tests__/routing.test.jsx`
- Test setup: `src/tests/setup.js`

Run tests with `npm test`.

## Design Tokens

- Tokens are defined in `src/styles/tokens.css` and consumed by `src/index.css`.
- Customize colors, spacing, and radii centrally.
