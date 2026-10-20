# Full website validation

Branch: `local/full`. Coming-soon reference preserved: `fc90ef957cb3882d814a439bf21466bb4489f885`.

## Automated checks

- Final Astro/TypeScript check: 35 files, zero errors, warnings, or hints.
- Final production build: 16 HTML pages. Published Journal RSS is emitted only with `SITE_URL`.
- Six integration tests passed against the final build: public routes/draft exclusion, semantic headings and metadata, image dimensions/alt text, local links and anchors, demo catalog safeguards, mobile hero budget, and conditional canonical/sitemap/RSS output.
- Domain-enabled SEO checks passed in ignored `tmp/seo-build` using reserved test origin `https://wana.test`. This is not a production domain and is not configured in the project.
- Responsive mobile hero WebP variants are approximately 15, 28, and 52 KB, below the 200 KB target.
- Final `npm.cmd audit --json` returned zero known vulnerabilities on 19 October 2026. Rerun it for current registry advisories.

## Browser QA required before visual sign-off

Browser Use returned `Local browser use is disabled in Work settings` during this implementation, including after the user said they would enable it. No browser screenshots or Lighthouse results have been recorded. Do not interpret the checks above as visual or interaction verification.

Once Browser Use is available, verify:

- 320, 375, 390, 768, and 1440 CSS px; mobile landscape and 200% zoom. Check no horizontal overflow, face/hand crops, hero readability, spacing, contrast, and touch targets.
- Mobile navigation open/close, focus trap/restoration, Escape, active routes, and keyboard focus throughout.
- Catalog All/Massage/Body/Face filters and all six detail routes.
- Gallery open/close, previous/next, Arrow keys, Escape, swipe, focus restoration, and a short landscape viewport.
- Flower horizontal drag while vertical gestures still scroll; left/right/reset buttons; Arrow Left/Right/Home; full object framing; idle/offscreen/hidden-tab pause; WebGL unavailable/context loss fallback.
- Reduced motion and disabled JavaScript: content stays usable and no desktop pin is active under reduced motion.
- Page navigation, all Journal links, draft exclusion, and coming-soon business status.
- Lighthouse mobile performance target 90 or better, CLS at most 0.1. The lazy Three.js bundle is approximately 130 KB gzip and must be assessed in the actual browser. No score is claimed yet.

Save mobile and desktop screenshots before declaring the design finished. Keep browser evidence under ignored `qa/` and record actual outcomes here.
