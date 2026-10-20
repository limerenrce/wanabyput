// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const origin = process.env.SITE_URL;
/** @type {import('astro').AstroIntegration} */
const journalFeed = {
  name: 'wana-journal-feed',
  hooks: { 'astro:config:setup': ({ injectRoute }) => injectRoute({ pattern: '/rss.xml', entrypoint: './src/lib/rss-endpoint.ts', prerender: true }) },
};
if (origin) {
  const url = new URL(origin);
  if (url.protocol !== 'https:' || url.hostname === 'example.com' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('SITE_URL must be the verified HTTPS production origin.');
  }
}
export default defineConfig({
  site: origin || undefined,
  trailingSlash: 'always',
  integrations: [mdx(), react(), ...(origin ? [
    sitemap({ filter: page => !page.includes('/treatments/') && !page.includes('/404/') }),
    journalFeed,
  ] : [])],
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});
