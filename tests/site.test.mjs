import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.env.WANA_TEST_BUILD_DIR || 'dist');
function walk(directory) { return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]); }
const htmlFiles = walk(root).filter(file => file.endsWith('.html'));
const pages = new Map(htmlFiles.map(file => [path.relative(root, file).replaceAll('\\', '/'), fs.readFileSync(file, 'utf8')]));
const publishedPosts = ['the-art-of-doing-less', 'your-comfort-comes-first', 'making-room-for-a-spa-moment'];
const treatments = ['balinese-massage', 'deep-tissue-massage', 'foot-ritual', 'body-polish', 'facial-ritual', 'couples-ritual'];

function attributes(html, name) { return [...html.matchAll(new RegExp(`\\b${name}="([^"]*)"`, 'g'))].map(match => match[1].replaceAll('&amp;', '&')); }
function resolveLocal(url, page) {
  const source = '/' + page.replace(/index\.html$/, '');
  const parsed = new URL(url, 'https://local.test' + source);
  if (parsed.origin !== 'https://local.test') return null;
  const pathname = decodeURIComponent(parsed.pathname);
  const relative = pathname.endsWith('/') ? pathname + 'index.html' : pathname;
  return { file: path.join(root, relative), hash: parsed.hash };
}

test('the public build contains the full site and excludes draft and starter routes', () => {
  const expected = ['index.html','about/index.html','gallery/index.html','blog/index.html','visit/index.html','treatments/index.html','404.html',...treatments.map(slug => `treatments/${slug}/index.html`),...publishedPosts.map(slug => `blog/${slug}/index.html`)];
  assert.deepEqual([...pages.keys()].sort(), expected.sort());
  for (const html of pages.values()) assert.doesNotMatch(html, /Hello, Astronaut|Astro Blog|blog-placeholder|markdown-style-guide|behind-the-next-chapter/);
});

test('every document has one primary heading, unique metadata, language and accessible images', () => {
  const titles = new Set(), descriptions = new Set();
  for (const [file, html] of pages) {
    assert.match(html, /<html[^>]*lang="en"/, file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: one h1`);
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    assert.ok(title && description, `${file}: metadata`);
    assert.ok(!titles.has(title), `${file}: unique title`); titles.add(title);
    // 404 may share the fallback description; all real pages must be unique.
    if (file !== '404.html') { assert.ok(!descriptions.has(description), `${file}: unique description`); descriptions.add(description); }
    assert.match(html, /href="#main-content"/, `${file}: skip link`);
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      assert.doesNotThrow(() => JSON.parse(match[1]), `${file}: valid structured data`);
    }
    for (const image of html.match(/<img\b[^>]*>/g) || []) {
      assert.match(image, /\balt="[^"]*"/, `${file}: image alt`);
      assert.match(image, /\bwidth="\d+"/, `${file}: reserved image width`);
      assert.match(image, /\bheight="\d+"/, `${file}: reserved image height`);
    }
  }
});

test('internal navigation, images, scripts, and anchor targets resolve', () => {
  for (const [file, html] of pages) {
    for (const url of [...attributes(html, 'href'), ...attributes(html, 'src')]) {
      if (/^(data:|mailto:|tel:|javascript:)/.test(url)) continue;
      const target = resolveLocal(url, file);
      if (!target) continue;
      assert.ok(fs.existsSync(target.file), `${file}: broken ${url}`);
      if (target.hash && target.file.endsWith('.html')) {
        const targetHtml = fs.readFileSync(target.file, 'utf8');
        assert.ok(targetHtml.includes(`id="${target.hash.slice(1)}"`), `${file}: missing ${url}`);
      }
    }
  }
});

test('dummy treatments cannot masquerade as bookable or priced services', () => {
  for (const file of ['treatments/index.html', ...treatments.map(slug => `treatments/${slug}/index.html`)]) {
    const html = pages.get(file);
    assert.match(html, /[Pp]review/);
    assert.match(html, /name="robots" content="noindex, follow"/);
    assert.doesNotMatch(html, /"@type":"(?:Product|Service|Offer|AggregateRating|Review)"/);
    assert.doesNotMatch(html, /\b(?:IDR|Rp\.?|USD)\s*\d|Book now|Reserve now|checkout/i);
  }
});

test('mobile hero variants have a reserved layout and remain under 200 KB', () => {
  const html = pages.get('index.html');
  const picture = html.match(/<picture class="hero-picture">([\s\S]*?)<\/picture>/)?.[1];
  assert.ok(picture);
  const source = picture.match(/<source\b[^>]*>/)?.[0];
  assert.ok(source?.includes('(max-width: 899px)'));
  const variants = attributes(source, 'srcset')[0].split(',').map(entry => entry.trim().split(/\s+/)[0]);
  for (const variant of variants) { const resolved = resolveLocal(variant, 'index.html'); assert.ok(resolved); assert.ok(fs.statSync(resolved.file).size <= 200 * 1024, `${variant}: hero exceeds budget`); }
});

test('canonical, sitemap and RSS are conditional and exclude drafts and demo treatments', () => {
  const sitemap = path.join(root, 'sitemap-index.xml');
  const feed = path.join(root, 'rss.xml');
  const hasOrigin = fs.existsSync(sitemap);
  for (const html of pages.values()) {
    assert.doesNotMatch(html, /https:\/\/example\.com/);
    if (!hasOrigin) { assert.doesNotMatch(html, /rel="canonical"/); assert.match(html, /name="robots" content="noindex, follow"/); }
  }
  if (!hasOrigin) { assert.ok(!fs.existsSync(feed)); return; }
  assert.ok(fs.existsSync(feed));
  const rss = fs.readFileSync(feed, 'utf8');
  for (const slug of publishedPosts) assert.ok(rss.includes(slug));
  assert.ok(!rss.includes('behind-the-next-chapter'));
  const sitemapContent = walk(root).filter(file => /sitemap.*\.xml$/.test(file)).map(file => fs.readFileSync(file,'utf8')).join('');
  assert.ok(!sitemapContent.includes('/treatments/'));
  assert.ok(!sitemapContent.includes('behind-the-next-chapter'));
  for (const slug of publishedPosts) assert.ok(sitemapContent.includes(slug));
});
