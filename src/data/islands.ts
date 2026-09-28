/**
 * Island registry for the portal.
 *
 * This MIRRORS `src/islands/index.ts` in the engine repo (`RM-bcn/Naxos-bus-pwa`).
 * The portal never imports the engine — it is a separate deployable — so the
 * registry is a hand-maintained copy of the engine's.
 *
 * KNOWN GAP: there is no sync. `scripts/sync-islands.ts` does not exist, so the
 * counts and dates below are transcribed by hand from the engine's packs and
 * will go stale. `scripts/check-publishable.mjs` parses this file with a regex
 * and fails the build if it cannot find the islands, which catches a broken
 * registry but not a stale one. See PLAN.md §8.
 *
 * The editorial copy (blurb, known limits) belongs here and nowhere else. The
 * numeric fields belong to the engine's dataset: if a fact about an island can
 * be read there, read it there rather than keeping a second copy of it here.
 */

export type IslandStatus = 'live' | 'planned';

export interface IslandEntry {
  id: string;
  name: string;
  nameEl: string;
  brand: string;
  /** Subdomain on the apex, once the domain exists. */
  subdomain: string;
  /** Current live host. Stands in for the subdomain until the domain is live. */
  currentUrl: string;
  status: IslandStatus;
  /** Operator name in full, plus the Greek where it exists. */
  operator: { name: string; nameEl?: string; site: string; phone?: string };
  /** Editorial positioning line, used on the island card and hub page. */
  blurb: { en: string; el?: string };
  /** Counted from the engine dataset, not typed by hand. `null` = not synced. */
  counts: { stops: number; lines: number; journeys: number } | null;
  /**
   * The pack's `theme.accent`, copied from the engine's island config. It is the
   * colour that island's own PWA uses, so the portal and the app agree.
   */
  accent: string;
  /** `YYYY-MM-DD` from the engine dataset's `meta.generatedAt`. */
  dataGeneratedAt: string | null;
  dataValidTo: string | null;
  /** Human-readable notes rendered in the "known limits" table. */
  knownLimits: string[];
}

/** Wave 1 — live at the time of writing. */
export const ISLANDS: IslandEntry[] = [
  {
    id: 'naxos',
    name: 'Naxos',
    nameEl: 'Νάξος',
    brand: 'NaxosGo',
    subdomain: 'naxos',
    currentUrl: 'https://naxos-bus-routeplanner.vercel.app',
    status: 'live',
    operator: {
      name: 'KTEL Naxos',
      nameEl: 'ΚΤΕΛ Νάξου',
      site: 'https://naxosbuses.com',
      phone: '+30 22850 22291',
    },
    blurb: {
      en: 'The biggest network in the Cyclades: five lines out of Naxos Town, from Apollon to the mountain villages of Apeiranthos.',
    },
    accent: '#1268B3',
    counts: { stops: 55, lines: 5, journeys: 112 },
    dataGeneratedAt: '2026-09-26',
    dataValidTo: '2026-10-03',
    knownLimits: ['Intermediate stop times are interpolated from official travel times.'],
  },
  {
    id: 'paros',
    name: 'Paros',
    nameEl: 'Πάρος',
    brand: 'ParosGo',
    subdomain: 'paros',
    currentUrl: 'https://paros-bus-routeplanner.vercel.app',
    status: 'live',
    operator: {
      name: 'KTEL Paros',
      nameEl: 'ΚΤΕΛ Πάρου',
      site: 'https://ktelparou.gr',
    },
    blurb: {
      en: 'Fourteen local lines around Naoussa, Alyko and Antiparos, plus the trunk routes to Parikia and the two ports.',
    },
    accent: '#0F6E8C',
    counts: { stops: 25, lines: 14, journeys: 84 },
    dataGeneratedAt: '2026-09-26',
    dataValidTo: '2026-10-03',
    knownLimits: ['Mid-route and segment services are folded into their parent line.'],
  },
  {
    id: 'santorini',
    name: 'Santorini',
    nameEl: 'Σαντορίνη',
    brand: 'SantoriniGo',
    subdomain: 'santorini',
    currentUrl: 'https://santorini-bus-routeplanner.vercel.app',
    status: 'live',
    operator: {
      name: 'KTEL Santorini',
      nameEl: 'ΚΤΕΛ Θήρας',
      site: 'https://ktel-santorini.gr',
    },
    blurb: {
      en: 'The island with the most ferry passengers in the Aegean. Ten lines linking Fira, Kamari, Perissa and the Athinios ferry terminal.',
    },
    accent: '#C2542B',
    counts: { stops: 20, lines: 10, journeys: 62 },
    dataGeneratedAt: '2026-09-26',
    dataValidTo: '2026-10-03',
    knownLimits: [
      'Fira is a walking-only centre; there is no bus through the caldera rim.',
    ],
  },
  {
    id: 'milos',
    name: 'Milos',
    nameEl: 'Μήλος',
    brand: 'MilosGo',
    subdomain: 'milos',
    currentUrl: 'https://milos-bus-routeplanner.vercel.app',
    status: 'live',
    operator: {
      name: 'Milos Buses',
      site: 'https://milosbuses.com',
    },
    blurb: {
      en: 'A private operator rather than a KTEL cooperative, running Adamas, Plaka, Pollonia, Provatas and the airport.',
    },
    accent: '#2E7D6B',
    counts: { stops: 19, lines: 7, journeys: 52 },
    dataGeneratedAt: '2026-09-26',
    dataValidTo: '2026-10-03',
    knownLimits: [
      'The operator publishes a printable timetable, not a machine-readable one; times are transcribed and verified by hand.',
    ],
  },
  {
    id: 'ios',
    name: 'Ios',
    nameEl: 'Ίος',
    brand: 'IosGo',
    subdomain: 'ios',
    currentUrl: 'https://ios-bus-routeplanner.vercel.app',
    status: 'live',
    operator: {
      name: 'Ios Local Buses (KTEL Ios)',
      nameEl: 'Δημοτικές Γραμμές Ίου',
      site: 'https://ktel-ios.gr',
    },
    blurb: {
      en: 'A small, honest dataset: the Port–Chora–Mylopotas line, which is genuinely all Ios has.',
    },
    accent: '#1E5AA8',
    counts: { stops: 3, lines: 1, journeys: 6 },
    dataGeneratedAt: '2026-09-26',
    dataValidTo: '2026-10-03',
    knownLimits: [
      'Three stops and one line. Journey and line detail pages are suppressed for Ios because the data does not support them.',
    ],
  },
];

/**
 * Wave 2+. Listed so the network page is honest about the roadmap without
 * generating pages for islands we have no data for. These get no subdomain, no
 * hub page and no hreflang — only a "not covered yet" entry that invites a
 * correction or a volunteer.
 */
export const PLANNED: Array<Pick<IslandEntry, 'id' | 'name' | 'nameEl'>> = [
  { id: 'amorgos', name: 'Amorgos', nameEl: 'Αμοργός' },
  { id: 'syros', name: 'Syros', nameEl: 'Σύρος' },
  { id: 'andros', name: 'Andros', nameEl: 'Άνδρος' },
  { id: 'tinos', name: 'Tinos', nameEl: 'Τήνος' },
  { id: 'mykonos', name: 'Mykonos', nameEl: 'Μύκονος' },
  { id: 'kythnos', name: 'Kythnos', nameEl: 'Κύθνος' },
  { id: 'serifos', name: 'Serifos', nameEl: 'Σέριφος' },
];

export const LIVE_ISLANDS = ISLANDS.filter((i) => i.status === 'live');

export function getIsland(id: string): IslandEntry | undefined {
  return ISLANDS.find((i) => i.id === id);
}

export function totalJourneyCount(): number {
  return ISLANDS.reduce((sum, i) => sum + (i.counts?.journeys ?? 0), 0);
}
