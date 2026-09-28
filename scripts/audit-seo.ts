/**
 * Build-output SEO/GEO audit.
 *
 * This is the mechanical version of docs/seo.md's definition-of-done lists. The
 * guardrails have to be enforceable or they will be aspirational: Google's
 * scaled-content-abuse policy and the August 2026 spam update both target
 * programmatic volume with no verifiable provenance, which is precisely what a
 * checkable build gate is for.
 *
 * Run after `astro build`. Exits non-zero on a failure.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE_URL = (process.env.SITE_URL ?? 'https://cycladesgo.com').replace(/\/$/, '');
const LOCALES = ['en', 'el', 'de', 'fr', 'it'];

const failures: string[] = [];
const notes: string[] = [];

if (!existsSync(DIST)) {
  console.error('audit-seo: dist/ not found — run `npm run build` first.');
  process.exit(1);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

const pages = walk(DIST);
notes.push(`${pages.length} HTML pages found`);

interface PageFacts {
  file: string;
  route: string;
  canonical: string | null;
  hreflangs: Array<{ lang: string; href: string }>;
  xDefault: string | null;
  noindex: boolean;
  title: string | null;
  description: string | null;
  h1Count: number;
  jsonLd: boolean;
  text: string;
}

function readPage(file: string): PageFacts {
  const html = readFileSync(file, 'utf8');
  const route =
    '/' + path.relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\\/g, '/');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null;
  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
    (m) => ({ lang: m[1], href: m[2] }),
  );
  const xDefault = hreflangs.find((h) => h.lang === 'x-default')?.href ?? null;
  return {
    file,
    route,
    canonical,
    hreflangs: hreflangs.filter((h) => h.lang !== 'x-default'),
    xDefault,
    noindex: /<meta name="robots" content="noindex/.test(html),
    title: html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null,
    description: html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? null,
    h1Count: (html.match(/<h1[\s>]/g) ?? []).length,
    jsonLd: html.includes('application/ld+json'),
    text: html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '),
  };
}

const facts = pages.map(readPage);

/** Normalises `/en`, `/en/`, `/en` -> `/en/`. Comparison keys need one shape. */
const norm = (route: string) => (route.endsWith('/') ? route : `${route}/`);
/** Strips the locale prefix: `/de/network/` -> `/network/`. */
const stripLocale = (route: string) => norm(route).replace(/^\/(en|el|de|fr|it)(?=\/)/, '') || '/';
/** Adds it back. */
const withLocale = (locale: string, route: string) => norm(`/${locale}${stripLocale(route)}`);
/** The locale a page is in, or null for a locale-less page. */
const pageLocale = (route: string): string | null => norm(route).match(/^\/(en|el|de|fr|it)(?=\/)/)?.[1] ?? null;

/** Pages a visitor can actually land on: not the redirect stub, not the 404. */
const indexable = facts.filter(
  (p) => !p.noindex && p.route !== '/404' && !p.route.endsWith('/404'),
);

// 1. H1 exactly once on every page.
for (const p of indexable) {
  if (p.h1Count !== 1) {
    failures.push(`${p.route}: expected exactly one <h1>, found ${p.h1Count}`);
  }
}

// 2. Self-referencing canonical, and it must carry a locale.
for (const p of indexable) {
  if (!p.canonical) {
    failures.push(`${p.route}: no canonical`);
    continue;
  }
  if (!p.canonical.startsWith(`${SITE_URL}/`)) {
    failures.push(`${p.route}: canonical escapes the site origin (${p.canonical})`);
  }
  if (!LOCALES.some((l) => p.canonical!.includes(`/${l}/`) || p.canonical!.endsWith(`/${l}`))) {
    failures.push(`${p.route}: canonical carries no locale segment (${p.canonical})`);
  }
}

// 3. hreflang: reciprocal, self-referencing, absolute, lowercase, on the same host.
const byRoute = new Map<string, PageFacts>();
for (const p of indexable) byRoute.set(stripLocale(p.route), p);

for (const p of indexable) {
  for (const alt of p.hreflangs) {
    if (alt.lang !== alt.lang.toLowerCase()) {
      failures.push(`${p.route}: hreflang code "${alt.lang}" is not lowercase`);
    }
    if (!alt.href.startsWith('http')) {
      failures.push(`${p.route}: hreflang href is not absolute (${alt.href})`);
      continue;
    }
    const altUrl = new URL(alt.href);
    if (altUrl.origin !== new URL(SITE_URL).origin) {
      failures.push(
        `${p.route}: hreflang points at another host (${alt.href}). Cross-subdomain hreflang invalidates the cluster.`,
      );
      continue;
    }
    // Reciprocity: the target must exist and point back.
    const targetPath = norm(altUrl.pathname);
    const target = facts.find((q) => norm(new URL(q.canonical ?? 'http://x/').pathname) === targetPath);
    if (!target) {
      failures.push(`${p.route}: hreflang ${alt.lang} -> ${targetPath} which was not built`);
      continue;
    }
    if (target.noindex) {
      failures.push(`${p.route}: hreflang ${alt.lang} -> a noindex page`);
      continue;
    }
    const back = target.hreflangs.some((h) => h.href === p.canonical);
    const backX = target.xDefault === p.canonical;
    if (!back && !backX) {
      failures.push(`${p.route}: hreflang not reciprocal — ${targetPath} does not point back`);
    }
  }
}

// 4. x-default: at most one, must be a real built page, never a redirect stub.
for (const p of indexable) {
  if (!p.xDefault) continue;
  const xPath = norm(new URL(p.xDefault).pathname);
  const target = facts.find((q) => norm(new URL(q.canonical ?? 'http://x/').pathname) === xPath);
  if (!target) {
    failures.push(`${p.route}: x-default -> ${xPath} which was not built`);
  } else if (target.noindex) {
    failures.push(`${p.route}: x-default points at a noindex page`);
  }
  const count = p.hreflangs.filter((h) => h.lang === 'x-default').length;
  if (count > 1) failures.push(`${p.route}: more than one x-default`);
}

// 5. A page must never emit hreflang for a locale that has no page.
for (const p of indexable) {
  const base = stripLocale(p.route);
  const declared = p.hreflangs.map((h) => h.lang);
  const exists = LOCALES.filter((l) => facts.some((q) => norm(q.route) === withLocale(l, base)));
  for (const lang of declared) {
    if (!exists.includes(lang as (typeof LOCALES)[number])) {
      failures.push(`${p.route}: advertises hreflang="${lang}" but no ${lang} page was built`);
    }
  }
}

// 6. Titles and descriptions present and within sane bounds.
for (const p of indexable) {
  if (!p.title) failures.push(`${p.route}: no <title>`);
  else if (p.title.length > 65) notes.push(`${p.route}: title ${p.title.length} chars (>65 may truncate)`);
  if (!p.description) failures.push(`${p.route}: no meta description`);
  else if (p.description.length > 175)
    notes.push(`${p.route}: description ${p.description.length} chars (>175 may truncate)`);
}

// 7. Distinct-text ratio between pages of the same template. Below 55% Google
//    reads the set as near-duplicate, which is the scaled-content-abuse failure
//    mode this whole site has to avoid.
// Translations of one page are not duplicates of each other, so a template
// bucket is keyed by locale + path shape. Comparing across locales would flag
// every translated page as a near-duplicate, which is the opposite of the
// signal this gate exists to catch.
const byTemplate = new Map<string, PageFacts[]>();
for (const p of indexable) {
  const template = `${pageLocale(p.route) ?? '-'}${stripLocale(p.route).replace(/[^/]+$/, '') || '/'}`;
  byTemplate.set(template, [...(byTemplate.get(template) ?? []), p]);
}
for (const [template, group] of byTemplate) {
  if (group.length < 2) continue;
  const tokenSets = group.map((p) => new Set(p.text.toLowerCase().split(/\s+/).filter(Boolean)));
  let worst = 1;
  let worstPair = ['', ''];
  for (let i = 0; i < group.length; i += 1) {
    for (let j = i + 1; j < group.length; j += 1) {
      const a = tokenSets[i];
      const b = tokenSets[j];
      let shared = 0;
      for (const token of a) if (b.has(token)) shared += 1;
      const ratio = 1 - shared / Math.max(a.size, b.size, 1);
      if (ratio < worst) {
        worst = ratio;
        worstPair = [group[i].route, group[j].route];
      }
    }
  }
  if (worst < 0.55) {
    failures.push(
      `${template}: distinct-text ratio ${(worst * 100).toFixed(1)}% between ${worstPair[0]} and ${worstPair[1]} (<55%)`,
    );
  }
}

// 8. No empty or placeholder data tables.
for (const p of indexable) {
  if (/<table[\s\S]*?<\/table>/.test(p.text) === false) continue;
  if (/pending — set CYCLADESGO/.test(p.text)) {
    notes.push(`${p.route}: contains an intentionally-visible pending marker`);
  }
}

// 9. Machine-readable surfaces.
if (!existsSync(path.join(DIST, 'robots.txt'))) failures.push('dist/robots.txt missing');
if (!existsSync(path.join(DIST, 'llms.txt'))) failures.push('dist/llms.txt missing');
else {
  const llms = readFileSync(path.join(DIST, 'llms.txt'), 'utf8');
  if (llms.length > 10_000) failures.push(`llms.txt is ${llms.length} bytes (>10000)`);
  if (!/scheduled/i.test(llms)) failures.push('llms.txt does not state the scheduled-not-live stance');
}

// 10. Every indexable page carries JSON-LD.
for (const p of indexable) {
  if (!p.jsonLd) failures.push(`${p.route}: no JSON-LD`);
}

// 11. No raw hex in markup outside the token palette. A hex in an .astro file
//     is a divergence from the design system, and the design system is the
//     brand. The allowlist is read from the palette itself rather than
//     hardcoded, so adding a token cannot make the gate lie.
{
  const siteSrc = readFileSync(path.join(ROOT, 'src/data/site.ts'), 'utf8');
  const cssSrc = readFileSync(path.join(ROOT, 'src/styles/global.css'), 'utf8');
  const allowed = new Set(
    [...siteSrc.matchAll(/(?<![&/\w])#[0-9a-fA-F]{6}\b/g), ...cssSrc.matchAll(/(?<![&/\w])#[0-9a-fA-F]{6}\b/g)].map((m) =>
      m[0].toLowerCase(),
    ),
  );
  // The stylesheet and the palette declaration are the definition, not usage.
  const skip = new Set([path.join(ROOT, 'src/styles/global.css'), path.join(ROOT, 'src/data/site.ts')]);
  let scanned = 0;
  const scan = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        scan(full);
        continue;
      }
      if (!/\.astro$/.test(entry) || skip.has(full)) continue;
      scanned += 1;
      const src = readFileSync(full, 'utf8').toLowerCase();
      // Six hex digits, and not preceded by `&` (an HTML numeric character
      // reference such as `&#123;`) or by a URL character (a fragment such as
      // `/issues#1234`). Both look like a hex literal to a naive regex.
      for (const hex of new Set(src.match(/(?<![&/\w])#[0-9a-f]{6}\b/g) ?? [])) {
        if (!allowed.has(hex)) {
          failures.push(
            `${path.relative(ROOT, full)}: hex ${hex} is not a design token — use a --color-* custom property`,
          );
        }
      }
    }
  };
  scan(path.join(ROOT, 'src'));
  notes.push(`palette gate: ${scanned} .astro files, ${allowed.size} allowed token values`);
}

// --- report ---------------------------------------------------------------
for (const n of notes) console.log(`  · ${n}`);
if (failures.length) {
  console.error(`\naudit-seo: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`\naudit-seo: ok — ${indexable.length} indexable pages, ${notes.length} notes`);
