# WANA project rules

## Product and current scope

- WANA is a spa near Crystal Bay, Nusa Penida. The spa is currently coming soon.
- The full product roadmap includes online booking, an admin dashboard, and an SEO blog.
- Current implementation priorities are the SEO blog, treatment/service catalog, and an admin dashboard for blog CRUD (create, read, update, delete).
- Online booking belongs to a later phase. Do not expose working booking/payment flows or claim that the spa is open until explicitly requested.
- Do not invent treatment prices, opening dates, business hours, reviews, or other business facts.

## Git workflow (mandatory)

- Check the active branch and working-tree status before editing any files.
- Never develop, edit, or commit directly on `main`. Never reset, rebase, or force-push `main`.
- `main` is the release/push branch and receives changes only by merging reviewed development branches. Do not merge into or push `main` unless the user explicitly requests that release action.
- `local/coming-soon` is the local development branch for the pre-launch version; this is the current default working branch.
- `local/full` is the local development branch for the complete website and future booking features.
- Keep these development branches local unless the user requests pushing them. Do not mix unfinished full-version features into the coming-soon release.
- If the checkout is on `main`, switch to the appropriate development branch before editing. Preserve all existing uncommitted user changes; never discard or overwrite them to switch branches.
- Before switching between development branches, inspect uncommitted changes and keep their ownership clear. A branch alone does not isolate uncommitted files.
- Shared fixes and these rules must be carried to the other development branch deliberately when committing/merging; do not assume uncommitted files exist in both branch histories.

## Frontend and design system

- Use Astro, TypeScript, Tailwind CSS, shadcn/ui, and GSAP.
- Use shadcn/ui with Base UI primitives (`@base-ui/react`) and the Sera style (`base-sera` in `components.json`). Do not substitute Radix or another preset without the user's request.
- Reuse the existing theme tokens, component conventions, and path alias `@/*`. Add components as needed instead of installing the entire library.
- Use React islands for interactive shadcn components with an appropriate Astro `client:*` directive. Keep static content rendered as HTML for SEO and performance.
- Keep global styling in Tailwind layers so legacy element styles do not override component utilities. Use Noto Sans for body UI and Playfair Display for headings through the existing theme tokens.
- Run GSAP only in the browser, scope animations to their components, clean up on unmount/navigation, and respect `prefers-reduced-motion`. Content must remain usable without animations.

## Mobile first (mandatory)

- Design and implement the smallest viewport first. Use unprefixed Tailwind utilities for mobile and `sm:`, `md:`, and larger breakpoints as progressive enhancements.
- Check layouts at 320px, 375px, 390px, and 768px, plus a desktop width. Prevent accidental horizontal scrolling.
- Prioritize readable text, usable forms, clear navigation, and touch targets of at least 44 by 44 CSS pixels. Use responsive admin tables/cards on small screens.
- Support keyboard navigation, visible focus, accessible labels, sufficient contrast, and reduced motion.
- Optimize images, reserve image dimensions, and minimize client JavaScript. Avoid heavy animation that delays content or harms mobile performance.

## SEO blog, catalog, and admin

- Keep public blog and catalog content crawlable, with semantic HTML, meaningful headings, stable slugs, unique titles/descriptions, canonical URLs, social metadata, and appropriate structured data based on verified facts.
- Maintain sitemap/RSS where relevant. Use the verified production domain before release; never ship `example.com` canonical URLs.
- Separate drafts from published articles. Drafts and admin pages must not appear in public listings, sitemap, or RSS.
- Admin CRUD must use real authentication/authorization, server-side validation, and persistent storage. A hidden route or `noindex` is not access control.
- Never expose secrets in client code. Choose the backend/storage approach with the user before implementing infrastructure that has not been agreed on.

## Validation

- Run `npm run build` after code/configuration changes. On Windows, use `npm.cmd` if PowerShell blocks the `npm.ps1` shim.
- Validate interactive components in the browser and check mobile layouts when changing UI. Distinguish dependency/build checks from browser interaction checks in reports.
- Preserve existing user changes and report any remaining limitations clearly.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
