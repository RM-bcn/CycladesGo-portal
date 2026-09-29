/**
 * Editorial gate for guides.
 *
 * The rules in `docs/content.md` are only worth having if a guide that breaks one
 * cannot ship. Zod covers field shape; this covers everything cross-field and
 * everything Zod cannot see: the rendered word count, the title modifier, the
 * freshness window, whether the CTA names an island we actually have, and
 * whether the FAQ answers appear in the prose.
 *
 * Runs before `astro build`, alongside the other gates.
 */

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'src/content/guides');
const MIN_WORDS = 300;
const FRESHNESS_DAYS = 120;

const MODIFIERS = [
  'with luggage',
  'with a suitcase',
  'with a baby',
  'with a stroller',
  'with a scooter',
  'after the last ferry',
  'after the last boat',
  'cheapest way',
  'early morning',
  'late evening',
  'on foot',
  'in high season',
  'in low season',
];

const problems = [];
const notes = [];

/** Minimal frontmatter reader. A YAML dependency for five fields is not worth it. */
function readFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, body: raw };
  const body = raw.slice(match[0].length);
  const data = {};
  // Top-level `key: value`, plus one level of nesting under `cta:` and `sources:`.
  let section = null;
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const top = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (top) {
      const [, key, value] = top;
      if (value === '') {
        section = key;
        data[key] = [];
      } else {
        section = null;
        data[key] = parseScalar(value);
      }
      continue;
    }
    const item = line.match(/^\s*-\s+([A-Za-z_]+):\s*(.*)$/);
    if (item && section) {
      data[section].push({ [item[1]]: parseScalar(item[2]) });
      continue;
    }
    const cont = line.match(/^\s+([A-Za-z_]+):\s*(.*)$/);
    if (cont && Array.isArray(data[section]) && data[section].length) {
      data[section][data[section].length - 1][cont[1]] = parseScalar(cont[2]);
    }
  }
  return { data, body };
}

function parseScalar(value) {
  const v = value.trim().replace(/^["']|["']$/g, '');
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return v;
}

let files = [];
try {
  files = readdirSync(DIR).filter((f) => /\.(md|mdx)$/.test(f));
} catch {
  console.error('check-guides: src/content/guides/ does not exist');
  process.exit(1);
}

const islandIds = new Set(
  [...readFileSync(path.join(ROOT, 'src/data/islands.ts'), 'utf8')
    .matchAll(/^\s{4}id:\s*'([a-z]+)',/gm)].map((m) => m[1]),
);

const today = Date.now();

for (const file of files) {
  const raw = readFileSync(path.join(DIR, file), 'utf8');
  const { data, body } = readFrontmatter(raw);
  const at = (msg) => problems.push(`${file}: ${msg}`);

  // 1. Island-scoped guides need a modifier, or they fight the app's journey
  //    pages for the same query.
  if (data.scope === 'island') {
    const title = String(data.title ?? '').toLowerCase();
    if (!MODIFIERS.some((m) => title.includes(m))) {
      at(
        `an island-scoped guide must contain a title modifier (one of: ${MODIFIERS.join(', ')}). ` +
          'Without one it competes with the app\'s own journey page for the same query.',
      );
    }
    if (!data.island) at('an island-scoped guide must name its island.');
  }

  // 2. `updated` must not precede `published`.
  if (data.updated && data.published && data.updated < data.published) {
    at(`\`updated\` (${data.updated}) is before \`published\` (${data.published}).`);
  }

  // 3. The data must have been checked recently enough to publish.
  if (data.verified) {
    const ageDays = Math.round((today - Date.parse(data.verified)) / 86_400_000);
    if (ageDays > FRESHNESS_DAYS) {
      at(
        `the data was verified ${ageDays} days ago (${data.verified}), over the ${FRESHNESS_DAYS}-day limit. ` +
          'Re-check the operator schedule, or mark the guide draft until you have.',
      );
    } else if (ageDays > FRESHNESS_DAYS - 30) {
      notes.push(`${file}: data verification is ${ageDays} days old and due for a re-check.`);
    }
  }

  // 4. The CTA has to point somewhere that exists.
  const ctaIsland = data.cta && typeof data.cta === 'object' ? data.cta.island : undefined;
  if (ctaIsland && !islandIds.has(ctaIsland)) {
    at(`the CTA names island "${ctaIsland}", which is not in the registry.`);
  }

  // 5. Sources must have a retrieval date, and it cannot be in the future.
  const sources = Array.isArray(data.sources) ? data.sources : [];
  if (sources.length === 0) at('no sources. Every guide must say where its facts came from.');
  for (const source of sources) {
    if (!source.retrieved) at(`source "${source.label ?? source.url}" has no retrieval date.`);
    else if (Date.parse(source.retrieved) > today + 86_400_000) {
      at(`source "${source.label}" has a retrieval date in the future.`);
    }
  }

  // 6. Enough prose to be worth reading, measured on the body only.
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter((w) => /[a-zA-Z0-9]/.test(w)).length;
  if (data.draft !== true && words < MIN_WORDS) {
    at(`the body is ${words} words, under the ${MIN_WORDS}-word minimum.`);
  }
  notes.push(`${file}: ${words} words, ${sources.length} source${sources.length === 1 ? '' : 's'}.`);

  // 7. A guide that publishes a FAQ must also answer those questions in prose.
  //    FAQPage markup that is not in the visible text is a misrepresentation.
  const faq = Array.isArray(data.faq) ? data.faq : [];
  if (faq.length) {
    for (const item of faq) {
      const stem = String(item.q ?? '')
        .replace(/[?¿¡]/g, '')
        .toLowerCase()
        .split(/\s+/)
        .slice(0, 5)
        .join(' ');
      if (stem && !body.toLowerCase().includes(stem)) {
        at(
          `a FAQ entry is not answered in the prose: "${item.q}". FAQPage markup the reader ` +
            'cannot see is a misrepresentation, so the two must agree.',
        );
      }
    }
  }
}

for (const n of notes) console.log(`  · ${n}`);

if (problems.length) {
  console.error(`\ncheck-guides: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(`\ncheck-guides: ok — ${files.length} guide(s) against ${MODIFIERS.length} modifiers`);
