# docs/seo.md — the SEO/GEO operating manual

This is the reference `scripts/audit-seo.ts` implements. Every rule is either
**checkable** (the audit tests it; the check number is given) or marked
**guidance** (a judgement the script cannot make). A new rule needs a new check
or a guidance label. Reviewed against the code: 28 September 2026.

---

## 1. The IA split

| Owns | Answers |
|---|---|
| **Apex** — this repo | Anything needing **more than one island**, or no island: how the network works, methodology, provenance, legal, sponsorship |
| **Subdomain** — the apps | Anything only true about **one island**: that island's planner, its lines, stops, journeys |

Publishing the same island detail on both hosts splits one strong site into
three weak ones. `/islands/` on the apex is therefore a **directory**: outbound
links, one line each, no per-island facts beyond operator name and dataset dates.
The only legitimate apex page about a specific island is a **comparison**.

### The apex URL map, as built

```
/                                noindex, meta-refresh to /en/
/en/                             home
/en/islands/                     directory: five planners, seven planned
/en/network/                     how island buses work
/en/about/                       who, what this is not, the placeholder Person node
/en/sponsors/                    what sponsorship buys, and the six things it cannot
/en/report/                      report a wrong time or a timetable source
/en/data/                        index  ·  /methodology  ·  /quality  ·  /changelog  ·  /open-data
/en/legal/                       imprint  ·  /privacy  ·  /terms  ·  /cookies  ·  /accessibility
/en/{el,de,fr,it}/…              served, noindex, not-translated banner
/404                             noindex, empty hreflang cluster
/robots.txt  /llms.txt  /sitemap-index.xml  /sitemap-0.xml  /.well-known/security.txt
/favicon.svg  /og.png  /assets/logo-512.png  /icons/icon-{192,512}.png
```

82 HTML files in `dist/`: 16 routes × 5 locales, plus `/` and `/404`. Sixteen are
indexable, all English, by design (§3).

### What this repo asserts about a subdomain

Two things, both visible in the code: the CTA target
`` `${island.currentUrl}/en/plan` ``, and the graph nodes in
`src/lib/jsonld.ts` describing `<island>.cycladesgo.com/data/`,
`/gtfs/<id>go-gtfs.zip` and `/data/routes.json`. Everything else about a
subdomain's internals belongs to the engine repo and is not verifiable from here.
While the domain is unpurchased, `subdomain` is aspirational: the code links to
`currentUrl`, so a dead subdomain cannot ship by accident.

## 2. Canonical

Self-referencing, in every locale, always; built from the page's own `pathname`
against `SITE.url`. **Check 2** fails on a missing canonical, one that escapes the
site origin, or one carrying no locale segment. The "canonical trick", pointing
every locale at English, is explicitly wrong: it overrides the hreflang cluster
the same component just built.

## 3. hreflang

Enforced by **check 3** (reciprocity), **check 4** (`x-default`) and **check 5**
(no annotation for an unbuilt locale).

1. A cluster is one page's translations, **on one host**. No code path here can
   emit a cross-host annotation: `localeUrl` and `switchLocalePath` only take
   paths on this origin. 2. Lowercase codes. 3. Absolute URLs. 4. Reciprocal, or
   the target's `x-default` is the source. 5. `hreflangLocales` is a **required
   prop** on `Seo`, never an assumption of "all locales". 6. A locale with no
   reviewed translation is `noindex`, carries no hreflang, and shows a visible
   banner in the reader's language.

The contract lives in one place. `Seo.astro` derives the cluster and the
indexability from `hreflangLocales`, which comes from `publishedLocalesFor(path)`
in `src/lib/page.ts`, which reads `REVIEWED`. **To translate a page, add its path
to `REVIEWED[locale]`.** Nothing else changes.

### Common mistakes

| Mistake | Consequence | Caught by |
|---|---|---|
| Casing (`"DE"`, `"en-GB"`) | Code ignored, cluster inconsistent | Check 3 |
| Relative href | Annotation dropped | Check 3 |
| Another host or subdomain | Whole cluster invalidated | Check 3 |
| A member never built | Whole cluster invalidated | Check 5 |
| Points at a `noindex` page | Whole cluster invalidated | Check 3 |
| Non-reciprocal (A→B, B not→A) | Whole cluster invalidated | Check 3 |
| `x-default` to a redirect or a noindex page | Annotation dropped | Check 4 |
| Two `x-default` entries | Annotation dropped | Check 4 |
| Machine translation under an hreflang tag | Visibility loss, and a promise we cannot keep | `REVIEWED` |
| All five locales "because the page exists" | Half the cluster is untranslated | Check 5 + `Seo.astro` |

**Guidance:** a cluster should contain only languages you would want a clicker
in. Five locales where four are unindexed is worse than one.

## 4. `x-default`, and why `/` is a stub

`x-default` points at `/en/…`: a real 200 page with a self-canonical. `/` is a
**noindex redirect stub** (`noindex, follow`, canonical to `/en/`,
`meta http-equiv="refresh"`) for two reasons: a cluster must never annotate a
redirect, and the alternative, a separate locale-less page, puts the same content
at two indexable URLs. **Check 4** fails on an `x-default` that is not a built
page, points at a noindex page, or appears twice. **Guidance:** when several entry
points are genuinely equivalent, `x-default` should go to a selector. Not yet.

## 5. Structured data: emitted versus eligible

| Type | Where | Google rich result, 2026 |
|---|---|---|
| `Organization` | every page, `sameAs` across the subdomain estate | Eligible: site name, entity stitching |
| `WebSite` | home | Site name only. **No `SearchAction`** |
| `ItemList` | home | Not a rich result |
| `BreadcrumbList` | all but home | Eligible |
| `TechArticle` | `/data/methodology` | Eligible as `Article` |
| `Dataset` | `/data`, `/data/open-data` | Not a Google rich result; the type dataset consumers want |
| `Person` | `/about` | Not a rich result; knowledge panel and E-E-A-T signal |
| `Place`, `WebApplication` | builders exist, not mounted on the apex | `Place` alone is not eligible; `WebApplication` is not in Google's gallery |

**Deliberately absent.** `potentialAction` / `SearchAction`: the sitelinks search
box was removed as a rich result in November 2024, and the `WebSite` node without
it still supports site names. `FAQPage` as a rich-result play: those results ended
on 7 May 2026; the markup stays valid for other engines but is never presented as
a rich-result strategy. Markdown alternates: no AI crawler consumes them and
advertising one is a promise the page cannot keep; the apps keep their `.md`
endpoints, the portal does not advertise them. `TouristTrip` / `Trip`: real types,
not in Google's gallery, emitted by the apps for machine comprehension, not
ranking. **Check 10:** every indexable page carries a JSON-LD block.

### JSON-LD is a mirror, never the only place a fact lives

Every fact in a graph also appears verbatim in the visible HTML. Answer engines
tokenise the script block as page text rather than parsing it, and controlled
studies found JSON-LD alone has no measurable effect on AI citations. **Guidance:**
if you cannot point at the sentence in the page that says the same thing, the
graph node is wrong.

## 6. robots.txt and the AI-crawler stance

Generated by `npm run generate:seo`. **Check 9** fails if `dist/robots.txt` or
`dist/llms.txt` is missing. **Allow everything, deliberately, and say why in the
comment.** We publish factual, openly licensed transit data under CC-BY and
ODbL; there is nothing to protect, and blocking AI crawlers costs citations while
protecting nothing. Explicitly allowed: `OAI-SearchBot`, `GPTBot`,
`ChatGPT-User`, `OAI-AdsBot`, `Claude-SearchBot`, `ClaudeBot`, `Claude-User`,
`PerplexityBot`, `Perplexity-User`, `CCBot`, `meta-externalagent`, `Applebot`,
`Applebot-Extended`, `Amazonbot`, `Google-Extended`. `Googlebot` stays allowed via
the wildcard and that is load-bearing: blocking it also removes the site from AI
Overviews and AI Mode. `Google-Extended` governs only Gemini training and
grounding, with no effect on ranking or AI Overviews, so allowing it costs
nothing. The single disallow is `Bytespider`, an aggressive scraper with no
indexing value for us. `Crawl-delay: 1` is a statement of intent.

**The syndication policy is not in robots.txt.** No robots.txt can enforce it, and
pretending otherwise is security theatre. It lives in prose on `/data/open-data`
and in the engine repo's `AGENTS.md`. **Check 8** notes any page still carrying a
visibly-pending imprint marker, so an unfilled field shows up in audit output
rather than only on the page.

## 7. llms.txt

Generated into `public/llms.txt`. **Check 9** fails if it is missing, exceeds
10,000 bytes, or does not contain the word "scheduled". **Adoption, honestly:**
Google's own documentation says it ignores the file, and large-sample server-log
studies put adoption close to zero. It is a de-facto convention with no legal
force and no evidence of reach. We publish it for one reason: it is the only
place a machine can read "these are scheduled times, not live" plus the citation
request, in one file. It is not a growth strategy. The request is explicit: **if
you cite us, say the times are the operator's published schedule and give the
verification date shown on the page.** A citation presenting our data as live
tracking is a misrepresentation of it and the fastest way to be dropped.

## 8. Programmatic versus hand-written

At twelve islands the estate is roughly 5,400 indexable URLs, about 4,570 of them
the apps' own line, stop and journey pages. A manageable crawl budget. A sudden
five-fold jump is what scaled-content abuse looks like from outside, and the
August 2026 spam update targeted exactly that.

**Check 7, the 55% distinct-text gate.** For every pair of pages sharing a
template *within one locale*, the audit computes a distinct-token ratio and fails
below 55%. Templates are keyed by locale plus path shape, so `/en/data/quality/`
and `/de/data/quality/` are never compared: comparing translations would flag
every translated page as a near-duplicate, the opposite of the signal the gate
exists to catch. Buckets of one page are skipped. **Guidance:** the gate catches
laziness, not thinness; a page can be 90% distinct and worthless. It is a floor,
not a quality bar.

**The guide modifier rule.** When guides arrive, a guide's `h1` **must** contain a
modifier from a closed list: `with luggage`, `after the last ferry`, `cheapest
way`, `early morning`, `in <month>`, `on foot`. If you cannot add one, you are
writing a journey page, and the app already owns it. **Guidance, enforced at
review, not by the script.**

## 9. Cannibalisation

One line: **the apex owns the network, each app owns its island.** A
network-level answer belongs on the apex only if it compares islands; otherwise it
belongs on that island's app. No island hub page on the apex: `/islands/` links
out. Comparison pages are the one apex page allowed to be about specific islands,
because a comparison is inherently multi-island. Never give a registry entry a
body that restates the app's line or stop detail.

## 10. Measurement

Nothing is wired. This is the plan, constrained by `/legal/cookies` promising no
cookies.

| Event | Fires when | Must never carry |
|---|---|---|
| `island_picker_select` | A visitor picks an island | Which route they were planning |
| `app_deeplink_click` | A CTA to an app is followed | Journey parameters, origin or destination |
| `install_cta_click` | An install prompt is followed | Whether it was installed |
| `correction_submitted` | A report is submitted | The reported journey, its date or its stops |

Only `app_deeplink_click` exists today, as a `data-track` attribute. Nothing reads
it. Adding a reader means a server-side sink; a client-side SDK would break the
cookies page and, for German and Austrian visitors, need consent.

| Tier | Measure | Target |
|---|---|---|
| 1 | English pages actually indexed, per host | 16 of 16 |
| 2 | Non-brand impressions on `/network/` and `/data/quality/` | Growing month on month |
| 3 | Outbound clicks to the apps from `/islands/` | The only conversion that matters on the apex |
| 4 | Cited in AI answers, and whether the citation calls the data live | Zero wrong; anything else is a P1 incident |

**The privacy-preserving install proxy.** We cannot observe an install, so we must
not pretend to. The proxy is outbound clicks plus any aggregate counter the apps
publish. The click-to-install conversion rate is **unknown and is reported as
unknown**: it is not estimateable from the portal, and a plausible-sounding number
there would be the first lie on the site.

**The AI citation panel.** Forty to sixty fixed prompts across EN/DE/FR/EL,
monthly, by hand in the real assistant UIs. Two numbers: the share of prompts
where we are cited, and the share where a citation wrongly calls our data live.

## 11. Definition of done, per page template

- **Home (`/en/`)** — one `<h1>`, no skipped levels *(check 1)*; self-canonical
  with a locale segment *(check 2)*; `Organization` + `WebSite` + `ItemList`, no
  `SearchAction`; `description` present, at or under 175 characters *(check 6)*;
  every island count read from `src/data/islands.ts`, never typed; `TrustBanner`
  present; "not a live departure board" wording present and unsoftened.
- **Directory (`/en/islands/`)** — one outbound link per planner, `rel="noopener"`,
  targeting `currentUrl`; one line per island, no per-island facts beyond operator
  name and dataset dates; known limits shown per island, not behind a link;
  `BreadcrumbList` matching the visible breadcrumb; `TrustBanner` present.
- **Long-form editorial (`/en/network/`, `/en/data/*`)** — `dateModified` set as an
  ISO date and rendered visibly; 68-character measure on prose
  (`.prose-measure`); any claim about the data carrying its provenance and its
  date on the same screen; distinct-text ratio at or above 55% against siblings
  *(check 7)*; facts present in both the JSON-LD and the visible HTML.
- **Legal (`/en/legal/*`)** — uses `LegalLayout` with `path` and `dateModified`;
  registered in both `legalLinks` (SiteFooter) and `sections` (LegalLayout);
  imprint block present with no invented value, pending rendering as pending
  *(check 8 notes)*; `BreadcrumbList` three levels deep.
- **Any new page** — `path` constant declared and passed to
  `publishedLocalesFor`; added to `REVIEWED` per locale when translated; linked
  from at least one existing page via `localeUrl`; a `description` that is not a
  variation of the title; no hex colour *(check 11)*; one `<h1>`, `scope` on every
  `<th>`, `aria-hidden` on decorative SVG.
