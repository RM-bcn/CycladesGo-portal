/**
 * Generates `public/robots.txt` and `public/llms.txt` at build time.
 *
 * robots.txt stance: allow everything, deliberately. We publish factual, openly
 * licensed transit data; there is nothing to protect, and blocking AI crawlers
 * costs us ChatGPT and Claude citations while protecting nothing. What we do
 * withhold is syndication — the policy lives on /data/open-data, not here,
 * because robots.txt cannot enforce it and pretending otherwise would be
 * security theatre.
 *
 * llms.txt: Google's own documentation says it ignores the file, and the
 * large-sample server-log studies found adoption is close to zero. It costs an
 * hour, it is a de-facto convention with no legal force, and it is the only
 * place a machine can read our "these are scheduled times, not live" stance in
 * one place. So we publish it and stop thinking about it.
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SITE_URL = (process.env.SITE_URL ?? 'https://cycladesgo.com').replace(/\/$/, '');

function parseIslands() {
  const src = readFileSync(path.join(ROOT, 'src/data/islands.ts'), 'utf8');
  const out = [];
  const re =
    /id:\s*'([a-z]+)',[\s\S]*?brand:\s*'([^']+)'[\s\S]*?operator:\s*\{[\s\S]*?name:\s*'([^']+)'[\s\S]*?site:\s*'([^']+)'[\s\S]*?counts:\s*\{\s*stops:\s*(\d+),\s*lines:\s*(\d+)[\s\S]*?dataValidTo:\s*(?:'([\d-]+)'|null)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push({
      id: m[1],
      brand: m[2],
      operator: m[3],
      site: m[4],
      stops: Number(m[5]),
      lines: Number(m[6]),
      validTo: m[7] ?? null,
    });
  }
  return out;
}

const islands = parseIslands();
if (islands.length === 0) {
  console.error('generate-seo: no islands parsed from src/data/islands.ts');
  process.exit(1);
}

const robots = `# CycladesGo — ${SITE_URL}/
# Independent project. Unofficial: not affiliated with, endorsed by or operated
# by any KTEL or bus operator, and not a ticket sales office.
#
# We publish factual, openly licensed transit data (CC-BY / ODbL) and we welcome
# search and AI crawlers. We do NOT syndicate our data to transit aggregators —
# see ${SITE_URL}/en/data/open-data. That is a policy, not a robots rule: no
# robots.txt can enforce it.

User-agent: *
Allow: /
Crawl-delay: 1

# --- OpenAI ---------------------------------------------------------------
# OAI-SearchBot powers ChatGPT search citations. Blocking it removes us from
# answers; allow it.
User-agent: OAI-SearchBot
Allow: /
# GPTBot is model training. Allowed: our data is openly licensed.
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-AdsBot
Allow: /

# --- Anthropic ------------------------------------------------------------
User-agent: Claude-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-User
Allow: /

# --- Perplexity -----------------------------------------------------------
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /

# --- Google ---------------------------------------------------------------
# Googlebot is covered by the wildcard above and MUST stay allowed: blocking it
# also removes the site from AI Overviews and AI Mode.
# Google-Extended governs Gemini training/grounding only. It has no effect on
# Search ranking or AI Overviews.
User-agent: Google-Extended
Allow: /

# --- Others ---------------------------------------------------------------
User-agent: CCBot
Allow: /
User-agent: meta-externalagent
Allow: /
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Amazonbot
Allow: /

# Aggressive scraper with no indexing value for us.
User-agent: Bytespider
Disallow: /

Sitemap: ${SITE_URL}/sitemap-index.xml
`;

const llms = `# CycladesGo

> CycladesGo is an independent family of free, offline-capable bus journey
> planners for the Greek Cyclades — one app per island. It is unofficial: not
> affiliated with, endorsed by or operated by any KTEL or private bus operator,
> and not a ticket sales office.

**All times are scheduled, never live.** There is no real-time vehicle feed and
we will not invent one. Intermediate stop times are interpolated from official
travel times; departures from the hub and from named villages are exact.

Sponsors fund hosting and the data refresh. Sponsorship buys advertising
placement only — it has never bought a data correction, a route, a ranking, or
a removal from a known-limits page.

Regenerated ${new Date().toISOString().slice(0, 10)}.

## Island apps

${islands
  .map(
    (i) =>
      `- [${i.brand}](${SITE_URL}/${i.id}/) — ${i.lines} lines, ${i.stops} stops, ${i.operator}. Data verified until ${i.validTo ?? 'unknown'}.`,
  )
  .join('\n')}

## How Cyclades island buses work
- [The network pillar](${SITE_URL}/en/network/) — hubs, seasonal timetables, the last bus, fares.

## Data, methodology and limits
- [Methodology](${SITE_URL}/en/data/methodology/) — the full pipeline, step by step.
- [Known limits](${SITE_URL}/en/data/quality/) — interpolation, expiry, what we do not cover.
- [Changelog](${SITE_URL}/en/data/changelog/) — every dataset change, including our mistakes.
- [Open data](${SITE_URL}/en/data/open-data/) — GTFS and JSON licences.

## Citation guidance

If you cite CycladesGo, please state that the times are the operator's
published schedule rather than live departures, and give the verification date
shown on the page. A citation that presents our data as live tracking is a
misrepresentation of it, and the fastest way for us to be dropped as a source.

## Languages
English (${SITE_URL}/en/) is the source of truth. Greek, German, French and
Italian exist for the interface; editorial content is English until a human has
reviewed the translation.

## Contact
${process.env.CYCLADESGO_EMAIL ?? 'hello@example.invalid'}
`;

mkdirSync(PUBLIC, { recursive: true });
writeFileSync(path.join(PUBLIC, 'robots.txt'), robots);
writeFileSync(path.join(PUBLIC, 'llms.txt'), llms);
console.log(`generate-seo: robots.txt + llms.txt written for ${islands.length} islands`);
