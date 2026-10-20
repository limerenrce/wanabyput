# WANA Spa

Local, public-facing concept for WANA, a spa coming soon near Crystal Bay, Nusa Penida. This full website lives on `local/full`; `local/coming-soon` remains a separate pre-launch experience. Nothing has been published.

## Run locally

Use Node 22.22 or newer. In PowerShell, use `npm.cmd` if execution policy blocks the npm shim.

```powershell
npm.cmd install
npm.cmd run dev -- --background
npm.cmd run astro -- dev status
npm.cmd run astro -- dev logs
npm.cmd run astro -- dev stop
```

The background command reports the preview URL. To validate a production build:

```powershell
npm.cmd run check
npm.cmd run build
npm.cmd test
npm.cmd audit
```

## Public content

The site includes Home, Our story, Treatments and six treatment details, The space, Journal and three articles, Find us, and a custom 404 page. All public copy is English. There is no booking, payment, admin, authentication, or new backend.

- `src/content/treatments/*.md`: illustrative catalog entries. Keep `isDemo: true`, the preview notices, and noindex until real services are approved. Categories are Massage, Body, and Face. No prices, durations, or medical claims are supplied.
- `src/content/blog/*.md`: original journal entries. Set `draft: true` to exclude an entry from routes, listings, sitemap, and RSS. Published dates are editorial dates, not business-opening dates.
- `src/content.config.ts`: content schemas. `src/lib/photos.ts`: photo captions, alt text, and focal points.

## Domain and indexing

No production domain has been verified. With `SITE_URL` unset, builds have no canonical URLs, sitemap, or RSS and use `noindex, follow`. Once the owner verifies an HTTPS production origin, set `SITE_URL` in the build environment. The build then emits canonical/social URLs, sitemap, and Journal RSS. Drafts remain excluded; demo treatment routes remain noindex and outside the sitemap. This setting does not publish the site.

## Visual assets and interaction

Twelve photographs were generated through the built-in ImageGen tool and are fictional concept imagery, not photographs of actual WANA facilities, staff, or guests. The original PNGs and complete prompts are saved in `src/assets/photos/`, with provenance in `people-prompts.json` and `ambience-prompts.json`. Astro emits responsive WebP derivatives. The mobile hero uses a portrait edit of the landscape scene rather than a destructive crop.

The frangipani is procedural Three.js geometry with an SVG poster, deferred loading, horizontal drag, rotate/reset buttons, and Arrow Left/Right/Home keyboard controls when a flower button is focused. Vertical touch movement remains available for scrolling. Rendering caps at 30 fps and DPR 1.5, pauses offscreen/when hidden, and stops at rest. WebGL failure preserves the poster. Reduced motion removes the intro/reveals, desktop pin, and flower interpolation.

The catalog filters already-rendered HTML. The gallery progressively enhances image links with a Base UI dialog, keyboard navigation, and horizontal swipe. Static content and navigation remain available without animation or JavaScript.

## UI foundation and licensing

Astro, TypeScript, Tailwind CSS, React islands, Base UI with the shadcn Sera preset, GSAP, and Three.js. Noto Sans is the body font; Playfair Display is the heading font. The shadcn stylesheet is vendored in `src/styles/vendor/` with its license; the shadcn CLI is deliberately not installed. Selected shared theme/dependency fixes were carried over without merging coming-soon page deletions.

See `docs/validation.md` for completed checks and the remaining browser QA gate. Passing builds and HTML tests do not establish a Lighthouse score or visual approval.
