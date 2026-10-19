// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Pre-launch branch: only the coming-soon route is built.
// Set SITE_URL to the verified production origin before release.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  integrations: [react()],
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
