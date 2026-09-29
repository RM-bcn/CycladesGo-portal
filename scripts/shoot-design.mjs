/**
 * Renders docs/design/ from the built site.
 *
 * One process: it serves `dist/`, drives Chromium through the page list, writes
 * a light and a dark screenshot of each, and exits. Kept as a script rather
 * than a shell pipeline so the server and the browser share a lifetime and a
 * stray background process cannot be left holding a port.
 *
 * Usage: node scripts/shoot-design.mjs [--full]
 */

import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'docs/design');
const FULL = process.argv.includes('--full');
const PORT = 4411;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = path.join(DIST, url);
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
  } catch {
    file = path.join(DIST, url.replace(/\/$/, ''), 'index.html');
  }
  try {
    const buf = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404, { 'content-type': 'text/html' });
    res.end('<h1>404</h1>');
  }
});

const PAGES = [
  { slug: '01-home', url: '/en/', name: 'Homepage' },
  { slug: '02-islands', url: '/en/islands/', name: 'Island directory' },
  { slug: '03-island-naxos', url: '/en/islands/', name: 'Island card detail (Naxos)' },
  { slug: '04-network', url: '/en/network/', name: 'How island buses work' },
  { slug: '05-methodology', url: '/en/data/methodology/', name: 'Methodology' },
  { slug: '06-quality', url: '/en/data/quality/', name: 'Known limits' },
  { slug: '07-changelog', url: '/en/data/changelog/', name: 'Changelog' },
  { slug: '08-about', url: '/en/about/', name: 'About' },
  { slug: '09-sponsors', url: '/en/sponsors/', name: 'Sponsorship policy' },
  { slug: '10-report', url: '/en/report/', name: 'Report a problem' },
  { slug: '11-legal', url: '/en/legal/', name: 'Imprint' },
  { slug: '12-privacy', url: '/en/legal/privacy/', name: 'Privacy' },
  { slug: '13-accessibility', url: '/en/legal/accessibility/', name: 'Accessibility' },
  { slug: '14-untranslated-de', url: '/de/network/', name: 'Untranslated locale state' },
  { slug: '15-404', url: '/404.html', name: '404 wrong stop' },
  { slug: '16-500', url: '/500.html', name: '500 data failure' },
];

await mkdir(OUT, { recursive: true });
await new Promise((resolve) => server.listen(PORT, resolve));
console.log(`static server on :${PORT} serving ${DIST}`);

const { chromium } = await import(
  path.join('/root/projects/Naxos-bus-pwa', 'node_modules/playwright/index.mjs')
);

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
});

const written = [];

for (const scheme of ['light', 'dark']) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
    colorScheme: scheme,
    reducedMotion: 'reduce',
  });
  for (const page of PAGES) {
    const tab = await context.newPage();
    await tab.addInitScript((mode) => {
      try {
        localStorage.setItem('cg-theme', mode);
      } catch {}
    }, scheme);
    const response = await tab.goto(`http://localhost:${PORT}${page.url}`, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });
    if (!response || response.status() !== 200) {
      console.warn(`  ! ${page.url} -> ${response?.status()}`);
      await tab.close();
      continue;
    }
    await tab.waitForTimeout(220);
    const file = path.join(OUT, `${page.slug}--${scheme}.png`);
    await tab.screenshot({ path: file, fullPage: FULL });
    written.push(path.relative(ROOT, file));
    await tab.close();
  }
  await context.close();
}

// One mobile frame, to show the responsive header and card stacking.
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
  reducedMotion: 'reduce',
  isMobile: true,
  hasTouch: true,
});
for (const page of [PAGES[0], PAGES[1], PAGES[5]]) {
  const tab = await mobile.newPage();
  await tab.goto(`http://localhost:${PORT}${page.url}`, { waitUntil: 'networkidle' });
  await tab.waitForTimeout(200);
  const file = path.join(OUT, `${page.slug}--mobile.png`);
  await tab.screenshot({ path: file });
  written.push(path.relative(ROOT, file));
  await tab.close();
}
await mobile.close();

await browser.close();
server.close();

console.log(`\n${written.length} screenshots written to docs/design/`);
for (const w of written) console.log(`  ${w}`);
process.exit(0);
