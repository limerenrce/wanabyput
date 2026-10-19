# WANA — coming soon

This checkout is the mobile-first pre-launch website for WANA Spa near Crystal Bay,
Nusa Penida. The public build contains one route, `/`.

## Branches

- `local/coming-soon`: this one-screen pre-launch experience.
- `local/full`: retains the blog, about page, content collections, RSS, and full-site templates.
- `main`: release branch; merge/push only when explicitly requested.

The full branch was verified at `7f5dc9a35d320dd953485e1036b4392dddd7194c`
before removing those files from this checkout. Do not merge this branch's page
removals into `local/full`. Shared dependency-security changes must be carried
across deliberately.

## Development

```sh
npm install
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
npm run build
npm run preview
npm audit
```

On Windows, use `npm.cmd` when PowerShell blocks `npm.ps1`.
Set `SITE_URL` to the verified production origin to emit canonical/social URLs.
No placeholder production domain is configured.

## Artwork and motion

`src/assets/wana-water-study.png` is conceptual artwork generated with the built-in
ImageGen tool, not a photograph of WANA's premises. Its full generation prompt is
stored beside it in `wana-water-study.prompt.txt`.

The whole object is contained in a square stage at every viewport. A small WebGL
shader refracts only its water area; mouse movement, touch, and keyboard activation
create damped ripples. The image and text remain visible without JavaScript or
WebGL. Motion respects reduced-motion preferences, pauses in hidden tabs, and has
an accessible pause button. Rendering is capped at 30 fps and 900 by 900 pixels;
GPU resources and listeners are released when the component disconnects.

## shadcn dependency security

The project uses local shadcn components, Base UI (`@base-ui/react`), and the
`base-sera` preset in `components.json`. The `shadcn` CLI is not installed as a
project dependency: its dependency chain includes `braces@3.0.3`, which has no
patched release for [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

The stylesheet from `shadcn@4.22.0` is preserved in
`src/styles/vendor/shadcn-tailwind.css`, with its MIT license alongside it.
Existing components and styling work without the CLI. Before using the CLI to
generate components, check that its dependency chain has been patched; do not
accept the audit suggestion to downgrade to `shadcn@1.0.0`.
