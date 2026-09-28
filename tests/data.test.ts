import { describe, expect, it } from 'vitest';
import { ISLANDS, LIVE_ISLANDS, PLANNED, getIsland, totalJourneyCount } from '../src/data/islands';
import { SITE } from '../src/data/site';
import {
  ORGANIZATION_ID,
  datasetNode,
  islandListNode,
  organizationNode,
  webApplicationNode,
} from '../src/lib/jsonld';

/**
 * `scripts/check-publishable.mjs` and `scripts/generate-seo.ts` parse
 * `src/data/islands.ts` with regular expressions that depend on the *order* of
 * `id:`, `brand:`, `operator.name`, `operator.site`, `counts.stops`, `counts.lines`
 * and `dataValidTo:`. Reordering those keys silently stops both scripts from
 * finding the islands, so the shape is asserted here.
 */
describe('island registry', () => {
  it('gives every island the fields both regex parsers depend on', () => {
    for (const island of ISLANDS) {
      expect(island.id).toMatch(/^[a-z]+$/);
      expect(island.brand).toBeTruthy();
      expect(island.operator.name).toBeTruthy();
      expect(island.operator.site).toMatch(/^https:\/\//);
      expect(island.counts).not.toBeNull();
      expect(island.dataValidTo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(island.dataGeneratedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('never lets the validity date precede the build date', () => {
    for (const island of ISLANDS) {
      expect(island.dataValidTo! >= island.dataGeneratedAt!).toBe(true);
    }
  });

  it('keeps ids unique, because they become subdomain hostnames', () => {
    const ids = ISLANDS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    const subs = ISLANDS.map((i) => i.subdomain);
    expect(new Set(subs).size).toBe(subs.length);
  });

  it('does not claim an island is both live and planned', () => {
    const plannedIds = PLANNED.map((p) => p.id);
    for (const island of LIVE_ISLANDS) {
      expect(plannedIds).not.toContain(island.id);
    }
  });

  it('returns undefined rather than throwing on an unknown island', () => {
    expect(getIsland('naxos')?.brand).toBe('NaxosGo');
    expect(getIsland('atlantis')).toBeUndefined();
  });

  it('sums journey counts from the same source as the cards', () => {
    expect(totalJourneyCount()).toBe(ISLANDS.reduce((s, i) => s + (i.counts?.journeys ?? 0), 0));
  });
});

describe('json-ld graph', () => {
  it('points sameAs at the subdomain estate, which is how crawlers stitch the brand', () => {
    const node = organizationNode();
    const sameAs = node.sameAs as string[];
    for (const island of ISLANDS) {
      expect(sameAs).toContain(`${SITE.url}/${island.subdomain}/`);
    }
  });

  it('prices the app at zero rather than inventing a rating', () => {
    // The Software App rich result needs aggregateRating or review, which we do
    // not have and will not fabricate. The node is for machine comprehension.
    const node = webApplicationNode(ISLANDS[0]);
    expect(node.offers.price).toBe('0');
    expect(node).not.toHaveProperty('aggregateRating');
  });

  it('never marks the data as real-time in the Dataset node', () => {
    const node = datasetNode(ISLANDS[0]);
    expect(node.description).toMatch(/not live/i);
    expect(node).not.toHaveProperty('potentialAction');
  });

  it('lists exactly the live islands', () => {
    const node = islandListNode();
    expect(node.numberOfItems).toBe(ISLANDS.length);
    expect(node.itemListElement).toHaveLength(ISLANDS.length);
  });

  it('gives the organisation a stable id other pages can reference', () => {
    expect(ORGANIZATION_ID).toBe(`${SITE.url}/#organization`);
  });
});
