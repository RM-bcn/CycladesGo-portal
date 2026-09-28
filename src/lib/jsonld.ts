/**
 * JSON-LD graph builders.
 *
 * Two rules from docs/seo.md govern everything here:
 *
 * 1. `potentialAction` / `SearchAction` is deliberately absent. The sitelinks
 *    search box was removed as a rich result in November 2024; the `WebSite`
 *    node without it still supports the site-names feature.
 * 2. Every fact in a graph must also appear verbatim in the visible HTML. JSON-LD
 *    is a mirror for a crawler's entity graph and a hedge for third-party
 *    consumers — never the only place a fact lives. Answer engines tokenise the
 *    script block as page text rather than parsing it, and controlled studies
 *    found JSON-LD alone has no measurable effect on AI citations.
 */

import { ISLANDS, type IslandEntry } from '../data/islands';
import { SITE } from '../data/site';

const abs = (path: string) => new URL(path, `${SITE.url}/`).href;

export const ORGANIZATION_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;
export const ISLAND_LIST_ID = `${SITE.url}/#island-list`;

/**
 * The maintainer's node id. Defined here, not on the about page, so an `Article`
 * on any other page can reference it by import instead of re-deriving a string
 * and getting it subtly wrong. `/about` must keep publishing this exact id.
 */
export const MAINTAINER_ID = `${SITE.url}/about/#maintainer`;

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    logo: {
      '@type': 'ImageObject',
      url: abs('/assets/logo-512.png'),
      width: 512,
      height: 512,
    },
    description:
      'Independent family of free, offline-capable bus journey planners for the Greek Cyclades, plus a travel-planning app on this site.',
    email: SITE.email,
    // The whole subdomain estate, so crawlers can stitch the brand together.
    sameAs: [SITE.repo, ...ISLANDS.map((i) => `${SITE.url}/${i.subdomain}/`)],
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE.url}/`,
    name: SITE.name,
    inLanguage: ['en', 'el', 'de', 'fr', 'it'],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function islandListNode() {
  return {
    '@type': 'ItemList',
    '@id': ISLAND_LIST_ID,
    name: 'CycladesGo island planners',
    numberOfItems: ISLANDS.length,
    itemListElement: ISLANDS.map((island, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: island.brand,
      url: `${SITE.url}/${island.subdomain}/`,
    })),
  };
}

export function breadcrumbNode(trail: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

/** Mirrors the visible island card, so no fact lives only in the graph. */
export function webApplicationNode(island: IslandEntry) {
  return {
    '@type': 'WebApplication',
    '@id': `${SITE.url}/${island.subdomain}/#app`,
    name: island.brand,
    alternateName: `${island.name}Go`,
    url: `${SITE.url}/${island.subdomain}/`,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Any (web, installable PWA)',
    browserRequirements: 'Requires JavaScript. Works offline after the first visit.',
    inLanguage: ['en', 'el', 'de', 'fr', 'it'],
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    featureList: [
      `Offline timetable for every published ${island.operator.name} line`,
      'Door-to-door journey planner with transfers and walking legs',
      'Fare calculator per leg',
      'No account, no tracking, no data roaming',
    ],
    publisher: { '@id': ORGANIZATION_ID },
    about: { '@id': `${SITE.url}/${island.subdomain}/#island` },
  };
}

export function placeNode(island: IslandEntry) {
  return {
    '@type': 'Place',
    '@id': `${SITE.url}/${island.subdomain}/#island`,
    name: island.name,
    alternateName: [island.nameEl],
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: 'Cyclades',
      containedInPlace: {
        '@type': 'Country',
        name: 'Greece',
        alternateName: ['GR', 'Ελλάδα'],
      },
    },
  };
}

/**
 * Open-data surface. Only `Dataset` consumers care, but it is the semantically
 * correct type and it is how a third party cites us as the source.
 */
export function datasetNode(island: IslandEntry) {
  return {
    '@type': 'Dataset',
    '@id': `${SITE.url}/${island.subdomain}/data/#dataset`,
    name: `${island.brand} ${island.name} bus network dataset`,
    description: `Stops, lines, scheduled departures and fares for ${island.operator.name}, Greece. Times are scheduled, not live. Intermediate stop times are interpolated.`,
    url: `${SITE.url}/${island.subdomain}/data/`,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: { '@id': ORGANIZATION_ID },
    isAccessibleForFree: true,
    keywords: [island.id, island.operator.name, 'bus', 'timetable', 'gtfs', 'greece', 'cyclades'],
    temporalCoverage: island.dataValidTo
      ? `${island.dataGeneratedAt ?? ''}/${island.dataValidTo}`
      : undefined,
    dateModified: island.dataGeneratedAt ?? undefined,
    isBasedOn: island.operator.site,
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/zip',
        contentUrl: `${SITE.url}/${island.subdomain}/gtfs/${island.id}go-gtfs.zip`,
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${SITE.url}/${island.subdomain}/data/routes.json`,
      },
    ],
  };
}
