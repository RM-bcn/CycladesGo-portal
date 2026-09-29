# Content: how CycladesGo grows

The portal earns traffic in one way only: someone searches a question a bus
timetable does not answer, we answer it properly, and they install a planner.
Everything below serves that.

This document is the playbook. The rules in §4 are enforced by
`scripts/check-guides.mjs`, so a guide that breaks one does not ship.

---

## 1. The decision that matters most: where a piece of content lives

This is not a style preference. It decides whether the page can rank at all.

| Content | Where it must live | Why |
|---|---|---|
| "Bus from Naxos Port to Apollon" | `naxos.cycladesgo.com` | one island, one journey |
| "Which line goes to Agios Georgios beach" | `naxos.cycladesgo.com` | one island, one beach |
| "If I miss the last bus on Naxos" | `naxos.cycladesgo.com` | one island |
| "Ferry to bus across the Cyclades" | `cycladesgo.com` (apex) | more than one island |
| "Naxos vs Paros buses" | `cycladesgo.com` (apex) | inherently comparative |
| "How island buses work at all" | `cycladesgo.com` (apex) | no island in particular |

**The apex cannot rank for a single island's journey, and should not try.** A
page on the apex about one island competes with that island's own subdomain, and
Google treats a starkly-different section of a site as a standalone site. You
would end up with three half-sites per island instead of one strong one.

The awkward consequence: **most of the traffic-winning content has to be written
in the engine repo, not here.** This repo can hold the network-level layer, the
comparison layer, and the trust layer that everything else is cited against. The
per-island guide clusters are a separate job in `RM-bcn/Naxos-bus-pwa`, and they
are the bigger half of the work.

---

## 2. Clusters, in the order they are worth doing

Ranked by intent, not by how easy they are to write.

**1. Ferry → bus.** The highest-intent, lowest-competition cluster in the whole
space. It multiplies by ports × arrival conditions × islands, and almost nobody
publishes it. Two built: `guides/ferry-to-bus-connections.md` and the per-island
pages that follow.

**2. The last bus.** "What time is the last bus from X" and "what do I do if I
miss it". Nobody else writes it. It is also the single most useful thing a
visitor can know, which is why it converts.

**3. Which line goes to this beach/village.** Guardrailed hard — see §4. Only
top destinations, only with an OSM-sourced stop, only stating the last return.

**4. Comparison.** Which island has the best bus network, Naxos vs Paros, which
is best without a car. Citable, links naturally to the directory, converts
poorly but feeds the other clusters.

**5. Season and disruption.** Timetable changes for the year, what runs in
October, what happens when a line is cancelled. Evergreen, freshness-signal,
almost uncontested.

**6. The trust layer.** Methodology, known limits, changelog, the two
postmortems. Almost nobody searches for these and they get quoted constantly,
because they are the pages an answer engine reaches for when it wants to check
whether a claim is safe to make. Already built.

---

## 3. The format that gets cited

Answer engines do not read for pleasure. They extract blocks they can attribute
to one source, with one date. So every guide is written to be extractable:

- **The answer first.** The direct answer in the first hundred words, in one
  self-contained sentence, before any context.
- **Dated and sourced.** `verified` is in the frontmatter, rendered in the
  byline, and travels in the RSS. A block with one date and one source is
  quotable; a block without is a rumour.
- **A table with units in the headers.** Comparison data in a table is
  extracted far more reliably than the same data in prose.
- **Self-limiting.** Say what you do not know. "There is no connection to rely
  on" is more useful to a reader *and* more citable than a hedge, because a
  model can attribute a confident, bounded claim.
- **Q&A blocks, in the visible prose.** `check-guides.mjs` fails a guide whose
  `faq` entries are not answered in the body. FAQPage markup the reader cannot
  see is a misrepresentation, and it is also the format that gets lifted.

The one thing to never do is write about a competitor's weakness to win a click.
Every guide is about the answer; the operator's number is always on the page,
and we are always the convenience layer, not the replacement.

---

## 4. The rules, and what enforces them

| Rule | Enforced by |
|---|---|
| Island-scoped guides need a title modifier (`with luggage`, `after the last ferry`, `cheapest way`, …) from a **closed** 13-item list | `check-guides.mjs` |
| `updated` cannot precede `published` | `check-guides.mjs` |
| `verified` cannot be older than 120 days | `check-guides.mjs` |
| Every source has a label, a URL and a retrieval date | Zod + `check-guides.mjs` |
| The CTA names an island that exists in the registry | `check-guides.mjs` |
| At least 300 words of body, measured on the prose | `check-guides.mjs` |
| Every `faq` entry is answered in the visible text | `check-guides.mjs` |
| Description 120–160 characters | Zod |
| No unreviewed translation under an `hreflang` tag | `Seo.astro` |
| Distinct text ≥55% from sibling pages | `audit-seo` |
| Exactly one `<h1>`, breadcrumb, `Article` graph with a named author | `audit-seo` |

The modifier rule is the important one and the least intuitive. A guide titled
"Naxos Port to Apollon" competes with the app's own journey page for exactly the
same query; two pages answering one question splits the signal and satisfies
neither. The modifier is what makes it a *different* question — "…with luggage",
"…after the last ferry" — and therefore a page that can exist alongside the
lookup page rather than instead of it.

### The beach-page guardrail

"Which bus goes to <beach>" is the most templated thing anyone would write here,
so it gets the hardest floor. Publish one only if all four hold:

1. The beach is served by a stop with a **named, OSM-sourced** coordinate. No
   invented coordinates — that is the Paros incident.
2. The page states the **last outbound and last return departure** in visible
   text, because that is the decision the reader is actually making.
3. Walking time from the stop to the beach, computed from the coordinates.
4. It is one of the island's top 8–12 destinations and a human has read it.

If any fails, do not publish it. Fold the beach into its own page instead.

---

## 5. Language order

English is the source of truth. The order after it is by inbound volume, not by
ease:

1. **English** — the source. All clusters.
2. **Greek** — cheap, high trust, and the operator relationship depends on it. Do
   it early, not as an afterthought.
3. **German** — the largest inbound market for the Cyclades and the one real
   commercial differentiator against anglophone competition. Compounds:
   `Fähre`, `Umsteigen`, `Fahrplan`, `Haltestelle`, `Überfahrt`.
4. **French** — strong second market.
5. **Italian** — smaller; stage it last.

Never ship a machine translation under an `hreflang` tag. A locale with no
human review is served, `noindex`ed, carries no hreflang, and says so in the
reader's own language. That is the current state of all four non-English
locales, and it is the correct one.

Do not translate a page you have not updated in twelve months. A stale
translation is worse than an absent one, because it looks authoritative.

---

## 6. Cadence and how we know it works

**Cadence.** Two network-level guides a month, indefinitely, and the per-island
clusters as they are written. Consistency beats volume: the 55% distinct-text
gate means a thin guide is worse than none, and a series of near-duplicates is
the exact pattern the August 2026 spam update targeted.

**What we measure** (`docs/seo.md` §9 has the full set):

- *Guide → app click-through.* The only number that matters. 8–15% on ferry
  guides is a good result.
- *Assisted install rate.* Sessions that read a guide and then triggered the
  deep link. Track from day one.
- *Indexed coverage.* Below 90% per host is a technical problem, not a content
  one.
- *Citation panel.* Forty to sixty fixed prompts across EN/DE/FR/EL, run monthly
  **by hand** in the real ChatGPT, Claude, Perplex and Gemini UIs. Two numbers:
  the share of prompts where we are cited, and the share where a citation wrongly
  calls our data live. The second should be zero; if it is not, that is a P1
  incident, not a content task.

Do not buy an "AI visibility" tool and make its score a KPI. Google's own
position is that no third party can see their internal ranking or AI systems.

**Distribution, in order of cost:**

1. RSS, per locale. Free, no account, no consent banner. Already built.
2. The guide clusters linking each other and into the directory. Free, and the
   highest-value on the page.
3. The apps linking back to the apex methodology page, so authority accumulates on
   one page rather than twelve near-duplicates.
4. Operator relationships. A KTEL that knows we exist and can check our work is
   worth more than any amount of link building, and it de-risks the
   database-rights exposure at the same time.
5. Social, last, and only for a cluster that already works. It amplifies
   something that earns traffic on its own; it does not create it.

---

## 7. What not to do

- **Do not mass-generate guides.** A page whose only content is a stop list and a
  fare is exactly what scaled-content-abuse enforcement targets, and it costs
  authority site-wide, not just on that page.
- **Do not write about operators' shortcomings to win clicks.** We are the
  convenience layer. The operator's phone number is on every data page and the
  wording says so.
- **Do not chase live departures.** We have no feed and will not scrape one. See
  `docs/legal.md` §6 — the scraping rule is the highest-severity item in that
  document and it belongs in the engine repo's CI.
- **Do not publish a guide with a thin dataset behind it.** Ios has three stops
  and one line, and that is honest; inventing a network around it is not.
- **Do not run a newsletter until the imprint and the processor's data flow are
  settled.** A mailing list turns a website into a commercial processing
  relationship, and it is the fastest way to break the "no tracking" promise that
  is the entire product.
