# Brand Pack (Minimal, Cohesive)

This project includes a minimal brand system with palette, typography, and logo/icon assets.

## Palette

- Primary: Indigo
  - `--color-primary`: #6366f1
  - `--color-primary-strong`: #4f46e5
- Secondary: Emerald
  - `--color-secondary`: #22c55e
  - `--color-secondary-strong`: #16a34a
- Neutrals (dark-first then light-mode override):
  - Background: `--color-bg`
  - Surface: `--color-surface`
  - Text Primary: `--color-fg`
  - Text Secondary: `--color-muted`
  - Border: `--color-border`

Usage guidelines:
- Primary for interactive elements and highlights (links, active nav, primary buttons).
- Secondary sparingly as accent (status badges, small highlights).
- Neutrals for backgrounds, surfaces, and text to maintain contrast (use `--color-fg` on dark surfaces; `--color-muted` for secondary text).

## Typography

- Web-safe stack: `--font-sans` = system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial.
- Optional external brand font: `--font-brand` (defaults to `--font-sans`).
  - Fallback: If the external font fails to load, headings and brand elements use `--font-sans` automatically (no FOIT).
- Weights:
  - `--font-weight-regular`: 400
  - `--font-weight-medium`: 500
  - `--font-weight-bold`: 700

How to use an external font:
- Load your font (e.g., via CSS @import or <link>) and then override:
  ```
  :root { --font-brand: "YourFontName", var(--font-sans); }
  ```

## Logos and Icons

Provided assets (public/brand):
- Text logos (ideas): `logo-text-idea1.svg`, `logo-text-idea2.svg`, `logo-text-idea3.svg`
- Abstract icons (ideas): `icon-abstract-1.svg`, `icon-abstract-2.svg`, `icon-abstract-3.svg`
- Chosen defaults:
  - `logo.svg` (from idea 2 "NovaFlow")
  - `icon.svg` (from abstract 2)
  - `favicon.svg` (simplified icon)
  - `social-preview.svg` (1200x630 placeholder)

Placement:
- Navbar: left-aligned brand mark is inserted and linked to home.
- Footer: smaller brand mark on the left, with copyright and legal links.

Sizes:
- Navbar logo: class `brand-logo` (28px high)
- Footer logo: class `brand-logo brand-logo--footer` (22px high)

## Favicon and Social Preview

- Favicon: `public/brand/favicon.svg` (already referenced in index.html)
- Social Preview (Open Graph): `public/brand/social-preview.svg` (referenced via `<meta property="og:image" ...>`)

Export guidance:
- If you update the logo, generate:
  - Favicon: 32×32 and 180×180 PNGs optionally, plus SVG.
  - Social Preview: 1200×630 PNG recommended in production. The provided SVG is a placeholder for development.

## Color Contrast

- Ensure text on `--color-surface` uses `--color-fg` for AA contrast.
- Avoid large surfaces in pure primary; instead, use primary for accents and keep surfaces neutral.

## Notes

- The system is light/dark aware via media query overrides in tokens.css.
- To theme components, use the CSS variables from `src/styles/tokens.css`.
