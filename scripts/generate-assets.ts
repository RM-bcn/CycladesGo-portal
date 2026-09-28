/**
 * Generates the brand raster assets from one SVG source of truth.
 *
 * The favicon, the 512px logo that schema.org `logo` points at, and the OG
 * image must never drift apart, so they are all rendered from the same geometry
 * rather than hand-drawn three times. Run via `npm run assets`.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SITE_URL = (process.env.SITE_URL ?? 'https://cycladesgo.com').replace(/\/$/, '');

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="512" height="512">
  <rect width="32" height="32" rx="8" fill="#1268B3"/>
  <path d="M5 20.5C5 13.6 10.1 8 16.4 8c4.6 0 8.5 3 10.1 7.2" stroke="#FAF7F2" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <circle cx="10.4" cy="21.4" r="2.6" fill="#FAF7F2"/>
  <circle cx="20.8" cy="21.4" r="2.6" fill="#FAF7F2"/>
  <path d="M5 25.6h22" stroke="#FAF7F2" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

async function main() {
  const sharp = (await import('sharp')).default;

  mkdirSync(path.join(PUBLIC, 'assets'), { recursive: true });
  mkdirSync(path.join(PUBLIC, 'icons'), { recursive: true });

  writeFileSync(path.join(PUBLIC, 'favicon.svg'), MARK);
  await sharp(Buffer.from(MARK)).resize(512, 512).png().toFile(path.join(PUBLIC, 'assets/logo-512.png'));
  await sharp(Buffer.from(MARK)).resize(192, 192).png().toFile(path.join(PUBLIC, 'icons/icon-192.png'));
  await sharp(Buffer.from(MARK)).resize(512, 512).png().toFile(path.join(PUBLIC, 'icons/icon-512.png'));

  // OG image: the mark plus the wordmark, in Cycladic Sun colours.
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FAF7F2"/>
      <stop offset="1" stop-color="#EEF2F6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1010" cy="150" r="190" fill="#FBF3E2"/>
  <circle cx="150" cy="540" r="150" fill="#E8F1F9"/>
  <g transform="translate(88 196) scale(4.4)">
    <rect width="32" height="32" rx="8" fill="#1268B3"/>
    <path d="M5 20.5C5 13.6 10.1 8 16.4 8c4.6 0 8.5 3 10.1 7.2" stroke="#FAF7F2" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <circle cx="10.4" cy="21.4" r="2.6" fill="#FAF7F2"/>
    <circle cx="20.8" cy="21.4" r="2.6" fill="#FAF7F2"/>
    <path d="M5 25.6h22" stroke="#FAF7F2" stroke-width="2.4" stroke-linecap="round"/>
  </g>
  <text x="88" y="470" font-family="Helvetica, Arial, sans-serif" font-size="88" font-weight="700" fill="#0D2B4A" letter-spacing="-3">CycladesGo</text>
  <text x="88" y="536" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#46617D">Free, offline bus planning for the Cyclades</text>
  <text x="88" y="580" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#55697D">Scheduled times, not live tracking. Unofficial.</text>
</svg>`;

  await sharp(Buffer.from(og)).png().toFile(path.join(PUBLIC, 'og.png'));

  // security.txt — a small credibility signal for a project asking users to
  // rely on its numbers, and required once we run a bug bounty.
  mkdirSync(path.join(PUBLIC, '.well-known'), { recursive: true });
  const contact = process.env.CYCLADESGO_SECURITY_EMAIL ?? process.env.CYCLADESGO_EMAIL ?? 'hello@example.invalid';
  writeFileSync(
    path.join(PUBLIC, '.well-known', 'security.txt'),
    `Contact: mailto:${contact}\nExpires: ${new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10)}\nPreferred-Languages: en, el, de\nCanonical: ${SITE_URL}/.well-known/security.txt\nPolicy: ${SITE_URL}/en/legal/terms\n`,
  );


  console.log('generate-assets: favicon, logo-512, icons, og.png, security.txt written');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

