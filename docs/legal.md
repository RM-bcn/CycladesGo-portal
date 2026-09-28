# docs/legal.md — the compliance record

**This is not legal advice.** It is the reasoning behind what the code does, kept
so a future maintainer can check the reasoning and change the code deliberately.
Nothing here has been reviewed by a lawyer. Anything marked **[unverified]** is
our reading of a source we have not obtained and paid for; treat it as a prompt
for counsel, not a conclusion. Scope: the apex portal. The island apps live in
the engine repo (`RM-bcn/Naxos-bus-pwa`) and have their own legal pages.

---

## 1. The commercial decision, and everything it switches on

Sponsorship and donations were chosen over a non-commercial stance. That single
choice is load-bearing: most of this document exists because of it.

| Triggered | Consequence | Where it lands |
|---|---|---|
| We are a "trader" | Law 2251/1994, the Greek e-commerce Code of Conduct, withdrawal rights, contractual price-display rules | `/legal/terms`, `/legal` |
| We are a commercial service | **European Accessibility Act** (Directive 2019/882): WCAG 2.2 AA becomes a duty | `/legal/accessibility`, `global.css` |
| We show fares | UCPD (Directive 2005/29/EC) Art. 6(1)(a): a wrong fare becomes a misleading-practice exposure | The editorial firewall on `/sponsors` is now legally disclosive |
| We market into France | Toubon Law Art. 2 applies to commercial material; sponsor-facing material must be in French | Not done, P2 |
| We accept e-mail addresses | Double opt-in, consent record, unsubscribe in every message, sender identity | `/report` (form off), `/legal/privacy` |
| We run analytics | German and Austrian visitors need consent for client-side JS analytics. Server-side only, or a real banner | Nothing wired; `/legal/cookies` promises it |

`SITE.commercial` in `src/data/site.ts` records the decision in one place. It is
documentation, not a switch: nothing branches on it. The design consequence is
that `/sponsors`, `/legal/*` and the disclosure components are first-class pages,
not footer filler.

## 2. The imprint

**PD 131/2003 Art. 4(1)** (Greek law on e-commerce) requires the service
provider to make name, address, place of establishment and contact details
available **easily, directly and continuously**, and for traders additionally VAT
and company-register numbers **[unverified — check against the current Greek
text]**. "Easily, directly and continuously" is why the imprint block is in the
footer of **every** page and not only on `/legal`, and why the five identity
fields come from `src/data/site.ts` rather than being typed into a legal page.

All five fields are deliberately `pending` and render as visibly pending, because
a privacy notice naming a controller nobody can identify is worse than one
admitting the field is unfilled. `scripts/check-publishable.mjs` fails the build
when `CYCLADESGO_LEGAL_NAME`, `CYCLADESGO_ADDRESS`, `CYCLADESGO_EMAIL` or
`CYCLADESGO_VAT` is empty. `CYCLADESGO_GEMI` is not gated; that is a known gap.

`ALLOW_UNRESOLVED_IMPRINT=1` downgrades those four failures to warnings, for
design previews only. It is never inferred from the environment, and a build made
with it set must never be promoted to a public URL.

## 3. Non-affiliation

The statement in `SiteFooter`, on `/legal` and on `/about`: CycladesGo is an
independent commercial project, not affiliated with, endorsed by, authorised by
or operated by any operator, and not a ticket sales office; operator names appear
solely to identify who runs each service; we publish schedules, not live
departures.

**The test it must satisfy.** Under Art. 14(1)(c) of Directive 2000/31/EC, a
third party may use another's sign where the use "is in the course of comparing
the product or service with that provided by the holder of the right".
*Gillette v Makita* (C-228/98) reduced that to four factors **[unverified — the
application here is ours, not the Court's]**:

| Factor | Our position |
|---|---|
| Does the use identify the origin of the product or service? | No. Every page states we are unofficial, and the header and footer say so |
| Is the sign used to distinguish our own products? | No. Operators have no page, no product and no presence in our navigation |
| Are the products identical or commercially similar? | No. We sell nothing; they operate buses |
| How is it marketed? | Nominative reference in a factual table, the operator's own site linked, inside a disclosure stating the non-affiliation |

### Words we never use

| Word | Why not |
|---|---|
| "official" | Nothing about us is official. Where the code says "official timetable" it means the *operator's* published timetable, and the surrounding sentence says who published it. See the flagged copy in `AGENTS.md` §10 |
| "live" | We have no real-time feed. Departure times are schedules |
| "real-time" | Same: no vehicle position data to be real-time about |
| "partner", "in partnership with", "cooperates with" | Only a factual relationship supports those words, and we have none |
| "book", "book now", "reserve" | We are not a ticket sales office |

## 4. Operator names as text, never logos

Every operator name appears as plain text. No operator logo appears anywhere.

A nominative-use defence for a **name** is far easier to run than for a **logo**:
logos carry distinctiveness, and the argument that the use is "necessary to
indicate the intended purpose" is much harder to make about a graphic mark than
about the name of the company that runs the bus. It costs us nothing to stay on
the right side of that line. This is also why `Logo.astro` says so in its own
header comment. If a sponsor asks for an operator logo placement, the answer is
no.

## 5. Database rights

**Directive 96/9/EC** (the Database Directive). **Art. 7(1)** protects the maker
against extraction or re-utilisation of the whole or a substantial part of the
contents where obtaining, verifying or presenting them required an investment of
labour, time or money which the maker can recover. **Art. 7(5)** extends that to
repeated systematic extraction of insubstantial parts which, taken together,
amount to a substantial part.

The two-limb test comes from *British Horseracing Board v William Hill*
(C-44/01) **[unverified]**: on limb one, investment; on limb two, the resulting
database must be a separate intellectual creation going beyond the underlying
data. The later cases matter here **[unverified]**:

| Case | Point taken |
|---|---|
| *British Horseracing Board* (C-44/01) | Established the two-limb test |
| *CV-Online Latvia v Ergo* (C-13/10, Protopsaltis) | Applied it to data extracted from a website; limb two can be satisfied |
| *Innoweb v Wal-Mart* (C-562/10) | Applied it to metadata extracted from a website; the investment was found |
| *Ryanair v PR Aviation* (C-22/11) | Departed from *CV-Online*: limb two did not apply to facts and data taken from a website |

*Ryanair* matters most for a website-sourced dataset, and it cuts in our favour on
limb two: a database that is a selection, arrangement and verification of
published facts is unlikely to be a separate intellectual creation. Limb one is
the real exposure, and it cuts both ways. It is what would let an operator
enforce against us, and it is also why the operators' own datasets are protected.

### The concrete rule

**We publish facts in our own presentation, and we never reproduce an operator's
expression.**

| Facts. Publish these. | Expression. Never. |
|---|---|
| Departure and arrival times | A grid laid out like the operator's grid |
| Stop names and coordinates | Timetable artwork, PDF styling, column rules |
| Route and line numbers | Route-map graphics, line-diagram styling |
| Fares | The operator's fare-table design |

The presentation is our own: our tokens, our card layout, our typography, our own
table rules in `.doc`. If a page ever looks like it was printed by the operator,
that is a bug. This is the most important design rule in the project and the one
most likely to be broken by a well-meaning redesign.

## 6. Scraping: fail closed

**Highest-severity item in the whole brief, and it is not in this repo.** Greek
Criminal Code Law 2121/1993 Art. 66A, as amended by Law 3049/2002, addresses
unauthorised access to information systems; the limb added in 2002 covers
circumventing an effective technological protection measure and carries a minimum
of one year's imprisonment **[unverified — severity and current wording must be
confirmed by Greek counsel]**.

The rule we have adopted, which must be written into the **engine repo's**
`AGENTS.md` and its CI:

> If a source returns 401, 403 or 429, serves a CAPTCHA or a login challenge, or
> disallows our user agent in its `robots.txt`, the ingestion pipeline **fails
> closed**: it writes nothing, logs the refusal with the URL and the reason, and
> raises. It never retries around the block, never rotates a user agent, never
> falls back to a proxy, and never proceeds with partial data from a blocked
> source.

"Fail closed" means the island does not publish, which is exactly the outcome that
hurt us before: an island left on an expired timetable because a pipeline stall
was treated as a warning. A refusal is a stop, and the operator relationship is
the route around it, not the bypass. Open question 4 exists because nobody has
yet read the terms and `robots.txt` of every operator we ingest.

## 7. GDPR

### Purposes and lawful bases, as shipped on `/legal/privacy`

| Purpose | Basis | Data | Not done |
|---|---|---|---|
| Aggregate page measurement | Art. 6(1)(f) legitimate interests | Server request logs: IP, user agent, URL, timestamp, shortened or anonymised at the edge | No cross-page tracking, no advertising identifiers, no profiles, no sharing with ad networks |
| Answering a report or e-mail | Art. 6(1)(b), steps prior to a contract | The address you used, the message, attachments | Not used for marketing, not added to a list, not shared beyond the operator we must check with |
| Running and keeping the site available | Art. 6(1)(f) | The same logs, plus build and host error output | No cookies, no storage beyond your own theme preference, no fingerprinting |

### Retention

| Item | Period | Why |
|---|---|---|
| Raw server request logs | 30 days | Enough to investigate an outage or an abuse report, and no longer |
| Anonymised aggregate traffic reports | 13 months | Enough to see a seasonal pattern, with no individual request left in the data |
| Support and report e-mail | 24 months | Long enough to trace a reported error back to the dataset version it affected, which is what a correction needs |

**The Vercel transfer is open.** Vercel is established in the United States and
its infrastructure is there, so request data crosses the EEA.
`/legal/privacy` says so and then says, in as many words, that the transfer
mechanism is **not yet confirmed** and is therefore not stated. Our present
understanding is the EU-US Data Privacy Framework for certified recipients, with
standard contractual clauses for anything outside it and a transfer impact
assessment on file. That paragraph gets rewritten with the mechanism, the recipient
and the assessment date once open question 1 is answered: writing a safeguard we
have not verified into a privacy notice would be worse than admitting the gap.

**Analytics consent in Germany and Austria is a live constraint, not a
hypothetical one.** No analytics are wired and `/legal/cookies` sets no cookies,
so there is no banner and no problem today. The moment a client-side JavaScript
analytics SDK is added, German and Austrian visitors are why a consent banner is
needed, and a banner that ships without a matching cookies page is a defect. The
cheaper path, and the one the product position points at, is a server-side sink
with no client identifier.

**No DPO, but a named contact.** We do not appoint a DPO: our assessment is that a
site of this volume, with no profiles, no special-category data and no
large-scale processing, falls outside Art. 37 **[unverified]**. That assessment
depends on staying small, so it is re-checked if revenue or traffic grows
materially. A DPO is a separate question from a **privacy contact**, which is not
optional: Art. 13 requires the controller's identity and contact details. Today
that is `CYCLADESGO_EMAIL`, which is pending. The imprint contact and the privacy
contact should be the same named human, not a role alias.

## 8. Accessibility

**Why the EAA applies.** The European Accessibility Act (Directive 2019/882)
covers e-commerce services. A purely non-commercial publication would not be, on
the reasoning that excludes many blogs from scope. **CycladesGo is commercial: it
takes sponsorship and donations.** So the EAA applies and WCAG 2.2 AA is a duty
rather than a courtesy **[unverified — confirm the characterisation and the Greek
transposition]**.

**Microenterprise exemption.** Directive 2019/882 exempts microenterprises
providing services. A microenterprise is fewer than ten staff and an annual
turnover or balance-sheet total of at most EUR 2 million. Most likely still true
here **[unverified — it is a factual claim about us, and we must not let it
lapse]**. Re-check on any of: turnover reaching EUR 2 million in a financial year,
a ninth or tenth employee, or a decision to sell anything. Three different
triggers, and the exemption falls away if any one is met.

**Known limitations are published, not hidden.** `/legal/accessibility` states
what is shipped (skip link, visible focus via `:focus-visible` and never removed,
`lang` per locale, one `h1` per page with no skipped levels, `scope` on every
`th`, `aria-hidden` on decorative icons, `prefers-reduced-motion` honoured, a
contrast-checked palette) and what is not: the apps' map has only a partial text
equivalent, and **no external audit has been carried out**. Stating that is the
correct move; claiming conformance we have not tested is the failure.

## 9. Liability for wrong travel information

The realistic claim is not defamation or contract. It is: you told me the bus
leaves at 17:40, I missed it, I lost a day. Four disclaimers do real work, and
each works because it is proximate to the claim it qualifies:

| Disclaimer | What it establishes |
|---|---|
| **Provenance and date on the same screen** | Reasonable care. The reader can see where the number came from, when it was checked, and check it themselves |
| **Explicit non-real-time** | Scope. The limitation is stated before the number is relied on, not in the footer afterwards |
| **Explicit scope limitation** | What the data does not cover: interpolated intermediate stops, unmapped destinations, seasonal changes |
| **A route to the operator** | Duty and means of mitigation. The operator's number is on the page, so the reader has somewhere to go |

The disclaimer that does not work is "we are not responsible for anything". It is
a negation, it is not proximate, it does not say what to do, and under Greek law a
general exclusion cannot defeat liability for intentional misrepresentation in any
case **[unverified]**. It also reads as a business refusing to answer for its own
product. `OperatorAttribution` renders all four together, which is why it takes a
required `retrieved` date.

## 10. Domain and marks

**`.gr` domains.** Under the `.gr` registry rules (EETT Decision 1110/29.04.2024,
Art. 5(4)) a `.gr` domain may be assigned to any natural or legal person, Greek or
foreign **[unverified — check against the current EETT regulation]**. There is
therefore no Greek-presence requirement for `cycladesgo.gr`, which is worth buying
defensively. `cyclades.gr` is a different proposition: a second-level `.gr` whose
variable field is a listed geographical term is refused unless the registrant is
the relevant local government body **[unverified]**. Do not spend time on it.

**The trademark concern.** No EUTM clearance has been carried out for
"CycladesGo". "Cyclades" is heavily used in Greek transport and **Cyclades Fast
Ferries** is active; `Travel Cyclades`, `Cyclades Guide` and `Greek Island Buses`
sit in the same space, and there is a naming precedent in the other direction with
`[Island]Go` (`KosGo`) **[unverified — none of these has been searched]**. The
intended classes are 9, 39 (**information and planning only, not transport
services**), 42, 35 and 41. Class 39 is where the risk is, and the distinguishing
claim is that we provide information and planning, not transport. This is open
question 2 and the most expensive item in §12.

## 11. Compliance checklist

### P0 — before a public URL

- [ ] `cycladesgo.com` bought, apex vs `www` decided, the other 301ed
- [ ] Imprint filled (name, address, e-mail, VAT, GEMI) and `check-publishable`
      green **without** `ALLOW_UNRESOLVED_IMPRINT`
- [ ] `CYCLADESGO_GEMI` added to the publish gate
- [ ] A named human maintainer on `/about` and in the `Person` graph node
- [ ] Non-affiliation wording reviewed by a human, per §3
- [ ] Fail-closed scraping rule merged into the **engine** repo's `AGENTS.md` and CI
- [ ] Open question 1 answered; the `/legal/privacy` transfer paragraph written
- [ ] Analytics decision taken and, if client-side, banner and cookies page shipped together
- [ ] Operator terms and `robots.txt` read for every island we ingest (question 4)
- [ ] EUTM clearance filed, or consciously deferred with a date

### P1 — first 90 days

- [ ] `OperatorAttribution`, `SourceSnapshotBanner` and `InstallCTA` mounted on
      every page that needs them, replacing the inline prose
- [ ] A maintenance log of published failures, each with a date and a fix, or the
      changelog page is decoration
- [ ] Operator relationship operationalised: source URLs, rate limits, a named
      contact, a correction channel
- [ ] External accessibility audit scoped and booked
- [ ] Cookie and consent wording reviewed against whatever analytics actually ship
- [ ] A dated re-check scheduled for the microenterprise exemption

### P2 — months 4 to 12

- [ ] German localisation of the apex, human-reviewed
- [ ] Sponsorship material in French if we market into France (Toubon)
- [ ] Greek legal-entity route decided (`org.gr` or a Greek non-profit), which
      would change the trader analysis, the EAA scope and the donation tax treatment
- [ ] Tax opinion on sponsorship and donation receipts
- [ ] Opinion on Law 5005/2022 (Greek electronic-press register) if the guide
      clusters grow
- [ ] Annual review of this document against the shipped pages

## 12. Open questions

From `PLAN.md` §6. These need a human, not an agent.

| # | Question | Why it matters | Owner | Cost |
|---|---|---|---|---|
| 1 | Is Vercel DPF-certified, and is there a genuine EU-only option? | Determines the transfer mechanism named in `/legal/privacy` | Maintainer, one e-mail to Vercel | One day |
| 2 | EUTM clearance for "CycladesGo", classes 9, 39 (information/planning only), 42, 35, 41 | "Cyclades" is heavily used in Greek transport and Cyclades Fast Ferries is active | Maintainer, via an EUIPO attorney | EUR 500–1,500 |
| 3 | Opinion on Law 5005/2022 (Greek electronic-press register) | A multilingual guide cluster could plausibly be characterised as an "electronic press" outlet | Greek counsel | 30–60 min |
| 4 | Fetch and read the ToS and `robots.txt` of every operator before the next island | Decides, per island, whether we keep ingesting at all | Maintainer | Half a day |
| 5 | Greek tax position on sponsorship and donation receipts | Needs a tax opinion, not research | Greek accountant | Varies |
| 6 | Formalise as `org.gr` or a Greek non-profit? | Would change the trader analysis, the EAA scope and the donation tax treatment | Maintainer | Later |

Items 1, 2 and 4 are on the critical path to a public URL. Items 3, 5 and 6 can
follow, provided the decision to launch is taken with them open and recorded.
