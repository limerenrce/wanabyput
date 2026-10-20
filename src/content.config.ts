import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const photo = z.enum(['hero-landscape', 'hero-portrait', 'welcome', 'shoulder', 'foot', 'couple', 'facial', 'body', 'treatment-room', 'corridor', 'reception', 'details']);
const treatments = defineCollection({
  loader: glob({ base: './src/content/treatments', pattern: '*.md' }),
  schema: z.object({ title: z.string(), category: z.enum(['Massage', 'Body', 'Face']), summary: z.string(), cover: photo, order: z.number(), isDemo: z.literal(true), draft: z.boolean().default(false), detail: z.string() }),
});
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '*.md' }),
  schema: z.object({ title: z.string(), description: z.string(), pubDate: z.coerce.date(), category: z.string(), cover: photo, readingTime: z.string(), draft: z.boolean().default(false) }),
});
export const collections = { treatments, blog };
