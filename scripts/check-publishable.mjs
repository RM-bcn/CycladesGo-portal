/**
 * Publish gate. Runs before `astro build`.
 *
 * The rule this enforces comes from the engine repo and is the strongest trust
 * mechanism the project has: a dataset past its validity window must stop the
 * site from building rather than let a stale timetable reach a traveller. On
 * the portal that extends to the *referenced* islands — if NaxosGo's data has
 * expired, this site must not advertise NaxosGo.
 *
 * Set `SITE_URL` to the real apex in production. A build that is not production
 * and still claims the apex is a configuration error, not a preview.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const TODAY = new Date().toISOString().slice(0, 10);

function readIslands() {
  const file = path.join(ROOT, 'src/data/islands.ts');
  const src = readFileSync(file, 'utf8');
  const entries = [];
  const blockRe =
    /id:\s*'([a-z]+)'[\s\S]*?subdomain:\s*'([a-z]+)'[\s\S]*?dataValidTo:\s*(?:'([\d-]+)'|null)/g;
  let match;
  while ((match = blockRe.exec(src)) !== null) {
    entries.push({ id: match[1], subdomain: match[2], validTo: match[3] ?? null });
  }
  return entries;
}

const problems = [];
const warnings = [];

// Design previews have no legal identity yet, so they need a way through. The
// override is explicit, loud and never inferred from the environment: the only
// thing that skips a P0 legal requirement is a human typing its name.
const IS_DESIGN_PREVIEW = process.env.ALLOW_UNRESOLVED_IMPRINT === '1';
if (IS_DESIGN_PREVIEW) {
  warnings.push(
    'ALLOW_UNRESOLVED_IMPRINT=1 — imprint is NOT verified. This build must never be promoted to a public URL.',
  );
}

// 1. Identity fields. An unfilled imprint is a launch blocker, not a warning,
//    because PD 131/2003 Art. 4(1) requires name, address and contact to be
//    continuously accessible.
for (const key of ['CYCLADESGO_LEGAL_NAME', 'CYCLADESGO_ADDRESS', 'CYCLADESGO_EMAIL', 'CYCLADESGO_VAT']) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    const message = `Imprint field ${key} is empty. PD 131/2003 Art. 4(1) requires it.`;
    if (IS_DESIGN_PREVIEW) warnings.push(message);
    else problems.push(message);
  }
}

// 2. Data validity per island.
const islands = readIslands();
if (islands.length === 0) {
  problems.push('No islands parsed from src/data/islands.ts — the sync is broken.');
}
for (const island of islands) {
  if (!island.validTo) {
    problems.push(`${island.id}: no dataValidTo. Every island card promises a verification date.`);
  } else if (island.validTo < TODAY) {
    problems.push(
      `${island.id}: dataset expired on ${island.validTo} (today ${TODAY}). Refusing to advertise an island whose data is stale.`,
    );
  } else {
    warnings.push(`${island.id}: data valid until ${island.validTo}`);
  }
}

// 3. Domain reality check.
const siteUrl = process.env.SITE_URL ?? 'https://cycladesgo.com';
if (!existsSync(path.join(ROOT, 'src/pages/index.astro'))) {
  problems.push('src/pages/index.astro missing — the / redirect target would 404.');
}
if (siteUrl.includes('example.invalid') || siteUrl.includes('localhost')) {
  warnings.push(`SITE_URL is a placeholder (${siteUrl}). Canonicals will point at it.`);
}

if (warnings.length) {
  console.warn('publish-gate: warnings');
  for (const w of warnings) console.warn(`  · ${w}`);
}

if (problems.length) {
  console.error('publish-gate: REFUSING TO BUILD');
  for (const p of problems) console.error(`  · ${p}`);
  process.exit(1);
}

console.log(`publish-gate: ok (${islands.length} islands checked against ${TODAY})`);
