/**
 * Portal UI dictionary.
 *
 * Scope discipline: this file holds *chrome* — navigation, labels, buttons,
 * section headings, legal block titles. Long-form editorial content is not
 * translated here; it lives in content collections and ships in English only
 * until a human has reviewed it (see `docs/seo.md` §hreflang).
 *
 * Machine-translated text is never shipped. A locale that has no reviewed
 * translation renders the `notTranslated` state and is excluded from the
 * hreflang cluster, rather than being published under a `hreflang` tag we
 * cannot stand behind.
 */

import type { Locale } from './utils';

const en: Record<string, string> = {
  'nav.home': 'Home',
  'nav.islands': 'Islands',
  'nav.network': 'How it works',
  'nav.data': 'Our data',
  'nav.about': 'About',
  'nav.sponsors': 'Sponsors',
  'nav.legal': 'Legal',
  'nav.skip': 'Skip to content',
  'nav.menu': 'Menu',
  'nav.theme': 'Toggle dark mode',
  'nav.lang': 'Language',

  'brand.tagline': 'Free, offline bus planning for the Cyclades — island by island.',
  'brand.subtagline': 'Scheduled times, not live tracking. Unofficial.',

  'hero.title': 'Bus times for the Cyclades that work when your phone does not.',
  'hero.lede':
    'CycladesGo is a family of free, offline-capable journey planners — one for each island. Open a line, get the times, the stops and the fare. No account, no tracking, no data roaming.',
  'hero.ctaPrimary': 'Pick your island',
  'hero.ctaSecondary': 'How we get our data',
  'hero.stat1': 'islands live',
  'hero.stat2': 'lines mapped',
  'hero.stat3': 'stops mapped',
  'hero.stat4': 'published journeys',
  'hero.trustLine': 'Independent. Not affiliated with, endorsed by or operated by any KTEL or bus operator.',

  'islands.title': 'Pick your island',
  'islands.lede': 'Each island has its own planner. Choose where you are going.',
  'islands.openApp': 'Open the planner',
  'islands.lines': 'lines',
  'islands.stops': 'stops',
  'islands.journeys': 'journeys',
  'islands.dataAsOf': 'Data as of',
  'islands.validTo': 'Verified until',
  'islands.operator': 'Operator',
  'islands.plannedTitle': 'Not covered yet',
  'islands.plannedLede':
    'We are working through the Cyclades in waves. These islands have no planner yet — if you have a usable timetable source, we would like it.',
  'islands.reportSource': 'Report a timetable source',

  'trust.unofficial': 'Unofficial',
  'trust.scheduled': 'Scheduled, never live',
  'trust.openData': 'Open data',
  'trust.offline': 'Works offline',
  'trust.noTracking': 'No tracking',

  'network.title': 'How Cyclades island buses actually work',
  'network.lede':
    'The single biggest source of stress for visitors is not the absence of buses — it is not knowing when the last one leaves. This page is the honest, cross-island explanation.',

  'data.title': 'Where our data comes from',
  'data.lede': 'Every figure we publish is traceable to a named source and a date.',
  'data.methodology': 'Methodology',
  'data.quality': 'Known limits',
  'data.changelog': 'Changelog',
  'data.licence': 'Data licence',

  'about.title': 'About CycladesGo',
  'about.lede': 'Who builds this, and what this is not.',

  'sponsors.title': 'Sponsors',
  'sponsors.lede': 'What sponsorship buys, what it never buys, and who pays for what.',

  'footer.imprint': 'Imprint & identification',
  'footer.legal': 'Legal',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms of use',
  'footer.cookies': 'Cookies',
  'footer.accessibility': 'Accessibility',
  'footer.methodology': 'How we get our data',
  'footer.report': 'Report a problem',
  'footer.attribution': 'Map data © OpenStreetMap contributors (ODbL 1.0).',
  'footer.rights': 'Free forever. No accounts, no advertising trackers, no data resale.',
  'footer.donations': 'Support the project',

  'legal.title': 'Legal & identification',
  'legal.updated': 'Last updated',
  'legal.imprintTitle': 'Imprint',
  'legal.disclaimerTitle': 'Unofficial — no affiliation',
  'legal.privacyTitle': 'Privacy',
  'legal.termsTitle': 'Terms of use',
  'legal.accessTitle': 'Accessibility',
  'legal.attributionTitle': 'Data sources & attribution',
  'legal.cookiesTitle': 'Cookies',

  'common.opensInNewTab': 'opens in a new tab',
  'common.readMore': 'Read more',
  'common.backHome': 'Back to the homepage',
  'common.notTranslated': 'This page has not been translated yet. The reviewed English version is the authoritative one.',
  'common.notIndexed': 'This page is not published in this language yet, so it is excluded from the language cluster and from the sitemap.',
  'common.draft': 'Design prototype',
};

const el: Record<string, string> = {
  'nav.home': 'Αρχική',
  'nav.islands': 'Νησιά',
  'nav.network': 'Πώς λειτουργεί',
  'nav.data': 'Τα δεδομένα μας',
  'nav.about': 'Σχετικά',
  'nav.sponsors': 'Χορηγοί',
  'nav.legal': 'Νομικά',
  'nav.skip': 'Μετάβαση στο περιεχόμενο',
  'nav.menu': 'Μενού',
  'nav.theme': 'Εναλλαγή σκούρου τύπου',
  'nav.lang': 'Γλώσσα',

  'brand.tagline': 'Δωρεάν, offline σχεδιασμό δρομολογίων για τις Κυκλάδες — νησί προς νησί.',
  'brand.subtagline': 'Προγραμματισμένοι χρόνοι, όχι live παρακολούθηση. Μη επίσημο.',

  'hero.title': 'Δρομολόγια λεωφορείων στις Κυκλάδες που δουλεύουν και όταν δεν δουλεύει το τηλέφωνό σας.',
  'hero.lede':
    'Το CycladesGo είναι μια οικογένεια δωρεάν, offline εφαρμογών σχεδιασμού ταξιδιού — μία για κάθε νησί. Ανοίξτε μια γραμμή, δείτε τους χρόνους, τις στάσεις και την τιμή. Χωρίς λογαριασμό, χωρίς tracking, χωρίς roaming.',
  'hero.ctaPrimary': 'Διάλεξε το νησί σου',
  'hero.ctaSecondary': 'Πώς παίρνουμε τα δεδομένα',
  'hero.stat1': 'νησιά ενεργά',
  'hero.stat2': 'γραμμές χαρτογραφημένες',
  'hero.stat3': 'στάσεις χαρτογραφημένες',
  'hero.stat4': 'δημοσιευμένα ταξίδια',
  'hero.trustLine':
    'Ανεξάρτητο. Δεν συνδέεται, δεν εγκρίνεται και δεν λειτουργεί από οποιονδήποτε ΚΤΕΛ ή φορέα συγκοινωνίας.',

  'islands.title': 'Διάλεξε το νησί σου',
  'islands.lede': 'Κάθε νησί έχει τον δικό του σχεδιαστή. Διάλεξε πού πηγαίνεις.',
  'islands.openApp': 'Άνοιξε τον σχεδιαστή',
  'islands.lines': 'γραμμές',
  'islands.stops': 'στάσεις',
  'islands.journeys': 'ταξίδια',
  'islands.dataAsOf': 'Δεδομένα από',
  'islands.validTo': 'Επαληθευμένα έως',
  'islands.operator': 'Φορέας',
  'islands.plannedTitle': 'Δεν καλύπτεται ακόμη',
  'islands.plannedLede':
    'Δουλεύουμε τις Κυκλάδες σε γύρους. Αυτά τα νησιά δεν έχουν ακόμη σχεδιαστή — αν έχετε μια χρήσιμη πηγή προγράμματος, θα το δούμε.',
  'islands.reportSource': 'Ανέφερε μια πηγή προγράμματος',

  'trust.unofficial': 'Μη επίσημο',
  'trust.scheduled': 'Προγραμματισμένα, όχι live',
  'trust.openData': 'Ανοιχτά δεδομένα',
  'trust.offline': 'Δουλεύει offline',
  'trust.noTracking': 'Χωρίς tracking',

  'network.title': 'Πώς λειτουργούν στην πραγματικότητα τα λεωφορεία στις Κυκλάδες',
  'network.lede':
    'Η μεγαλύτερη αβεβαιότητα για τον επισκέπτη δεν είναι ότι δεν υπάρχουν λεωφορεία — είναι ότι δεν ξέρει πότε φεύγει το τελευταίο. Αυτή η σελίδα είναι η ειλικρινής, διανησιωτική εξήγηση.',

  'data.title': 'Από πού προέρχονται τα δεδομένα μας',
  'data.lede': 'Κάθε αριθμός που δημοσιεύουμε αντιστοιχεί σε μια ονοματισμένη πηγή και μια ημερομηνία.',
  'data.methodology': 'Μεθοδολογία',
  'data.quality': 'Γνωστοί περιορισμοί',
  'data.changelog': 'Αρχείο αλλαγών',
  'data.licence': 'Άδεια δεδομένων',

  'about.title': 'Σχετικά με το CycladesGo',
  'about.lede': 'Ποιος το φτιάχνει, και τι δεν είναι.',

  'sponsors.title': 'Χορηγοί',
  'sponsors.lede': 'Τι αγοράζει η χορηγία, τι δεν αγοράζει ποτέ, και ποιος πληρώνει τι.',

  'footer.imprint': 'Ταυτότητα & νομικά',
  'footer.legal': 'Νομικά',
  'footer.privacy': 'Απόρρητο',
  'footer.terms': 'Όροι χρήσης',
  'footer.cookies': 'Cookies',
  'footer.accessibility': 'Προσβασιμότητα',
  'footer.methodology': 'Πώς παίρνουμε τα δεδομένα',
  'footer.report': 'Αναφέρε πρόβλημα',
  'footer.attribution': 'Δεδομένα χάρτη © συντελεστές του OpenStreetMap (ODbL 1.0).',
  'footer.rights': 'Δωρεάν για πάντα. Χωρίς λογαριασμούς, χωρίς διαφημαστικά trackers, χωρίς πώληση δεδομένων.',
  'footer.donations': 'Υποστήριξε το έργο',

  'legal.title': 'Νομικά & ταυτότητα',
  'legal.updated': 'Τελευταία ενημέρωση',
  'legal.imprintTitle': 'Ταυτότητα',
  'legal.disclaimerTitle': 'Μη επίσημο — καμία σχέση',
  'legal.privacyTitle': 'Απόρρητο',
  'legal.termsTitle': 'Όροι χρήσης',
  'legal.accessTitle': 'Προσβασιμότητα',
  'legal.attributionTitle': 'Πηγές δεδομένων & αναφορά',
  'legal.cookiesTitle': 'Cookies',

  'common.opensInNewTab': 'ανοίγει σε νέα καρτέλα',
  'common.readMore': 'Διάβασε περισσότερα',
  'common.backHome': 'Πίσω στην αρχική',
  'common.notTranslated':
    'Αυτή η σελίδα δεν έχει μεταφραστεί ακόμη. Η ελεγμένη αγγλική έκδοση είναι η επίσημη.',
  'common.notIndexed':
    'Αυτή η σελίδα δεν έχει δημοσιευτεί σε αυτή τη γλώσσα, οπότε εξαιρείται από τη γλωσσική ομάδα και από τον χάρτη ιστότοπου.',
  'common.draft': 'Ontwerpprototype',
};

const de: Record<string, string> = {
  'nav.home': 'Start',
  'nav.islands': 'Inseln',
  'nav.network': 'So funktioniert es',
  'nav.data': 'Unsere Daten',
  'nav.about': 'Über uns',
  'nav.sponsors': 'Sponsoren',
  'nav.legal': 'Rechtliches',
  'nav.skip': 'Zum Inhalt springen',
  'nav.menu': 'Menü',
  'nav.theme': 'Dunkelmodus umschalten',
  'nav.lang': 'Sprache',

  'brand.tagline': 'Kostenlose Offline-Busplanung für die Kykladen — Insel für Insel.',
  'brand.subtagline': 'Geplante Zeiten, keine Live-Anzeige. Inoffiziell.',

  'hero.title': 'Buszeiten für die Kykladen, die auch funktionieren, wenn dein Handy es nicht tut.',
  'hero.lede':
    'CycladesGo ist eine Familie kostenloser, offlinefähiger Reiseplaner — einen pro Insel. Linie öffnen, Zeiten, Haltestellen und Fahrpreis stehen da. Kein Konto, kein Tracking, kein Roaming.',
  'hero.ctaPrimary': 'Insel auswählen',
  'hero.ctaSecondary': 'Woher unsere Daten kommen',
  'hero.stat1': 'Inseln live',
  'hero.stat2': 'Linien erfasst',
  'hero.stat3': 'Haltestellen erfasst',
  'hero.stat4': 'veröffentlichte Fahrten',
  'hero.trustLine':
    'Unabhängig. Keine Verbindung zu, keine Billigung durch und kein Betrieb durch KTEL oder einen Busunternehmer.',

  'islands.title': 'Wähle deine Insel',
  'islands.lede': 'Jede Insel hat ihren eigenen Planer. Wähle dein Reiseziel.',
  'islands.openApp': 'Planer öffnen',
  'islands.lines': 'Linien',
  'islands.stops': 'Haltestellen',
  'islands.journeys': 'Fahrten',
  'islands.dataAsOf': 'Daten vom',
  'islands.validTo': 'Geprüft bis',
  'islands.operator': 'Betreiber',
  'islands.plannedTitle': 'Noch nicht abgedeckt',
  'islands.plannedLede':
    'Wir arbeiten die Kykladen in Wellen ab. Für diese Inseln gibt es noch keinen Planer — wenn du eine nutzbare Fahrplanquelle hast, melde dich.',
  'islands.reportSource': 'Fahrplanquelle melden',

  'trust.unofficial': 'Inoffiziell',
  'trust.scheduled': 'Geplant, nie live',
  'trust.openData': 'Offene Daten',
  'trust.offline': 'Funktioniert offline',
  'trust.noTracking': 'Kein Tracking',

  'network.title': 'Wie Buslinien auf den Kykladen wirklich funktionieren',
  'network.lede':
    'Das größte Problem für Besucher ist nicht, dass es keine Busse gibt — sondern nicht zu wissen, wann der letzte fährt. Diese Seite erklärt es ehrlich und inselübergreifend.',

  'data.title': 'Woher unsere Daten kommen',
  'data.lede': 'Jede Zahl, die wir veröffentlichen, lässt sich auf eine benannte Quelle und ein Datum zurückführen.',
  'data.methodology': 'Methodik',
  'data.quality': 'Bekannte Grenzen',
  'data.changelog': 'Änderungsprotokoll',
  'data.licence': 'Datenlizenz',

  'about.title': 'Über CycladesGo',
  'about.lede': 'Wer das baut — und was das nicht ist.',

  'sponsors.title': 'Sponsoren',
  'sponsors.lede': 'Was ein Sponsoring kauft, was es niemals kauft, und wer was bezahlt.',

  'footer.imprint': 'Impressum & Identifikation',
  'footer.legal': 'Rechtliches',
  'footer.privacy': 'Datenschutz',
  'footer.terms': 'Nutzungsbedingungen',
  'footer.cookies': 'Cookies',
  'footer.accessibility': 'Barrierefreiheit',
  'footer.methodology': 'Woher unsere Daten kommen',
  'footer.report': 'Problem melden',
  'footer.attribution': 'Kartendaten © OpenStreetMap-Mitwirkende (ODbL 1.0).',
  'footer.rights': 'Für immer kostenlos. Keine Konten, keine Werbe-Tracker, kein Datenverkauf.',
  'footer.donations': 'Projekt unterstützen',

  'legal.title': 'Rechtliches & Identifikation',
  'legal.updated': 'Zuletzt aktualisiert',
  'legal.imprintTitle': 'Impressum',
  'legal.disclaimerTitle': 'Inoffiziell — keine Verbindung',
  'legal.privacyTitle': 'Datenschutz',
  'legal.termsTitle': 'Nutzungsbedingungen',
  'legal.accessTitle': 'Barrierefreiheit',
  'legal.attributionTitle': 'Datenquellen & Nachweis',
  'legal.cookiesTitle': 'Cookies',

  'common.opensInNewTab': 'öffnet in neuem Tab',
  'common.readMore': 'Weiterlesen',
  'common.backHome': 'Zurück zur Startseite',
  'common.notTranslated':
    'Diese Seite ist noch nicht übersetzt. Die geprüfte englische Fassung ist die maßgebliche.',
  'common.notIndexed':
    'Diese Seite ist in dieser Sprache noch nicht veröffentlicht, daher ist sie aus dem Sprachverbund und aus der Sitemap ausgenommen.',
  'common.draft': 'Designprototyp',
};

const fr: Record<string, string> = {
  'nav.home': 'Accueil',
  'nav.islands': 'Îles',
  'nav.network': 'Comment ça marche',
  'nav.data': 'Nos données',
  'nav.about': 'À propos',
  'nav.sponsors': 'Parrains',
  'nav.legal': 'Mentions légales',
  'nav.skip': 'Aller au contenu',
  'nav.menu': 'Menu',
  'nav.theme': 'Basculer le mode sombre',
  'nav.lang': 'Langue',

  'brand.tagline': 'Calcul d’itinéraires bus gratuit et hors ligne dans les Cyclades — île par île.',
  'brand.subtagline': 'Horaires planifiés, pas de suivi en direct. Non officiel.',

  'hero.title': 'Les horaires de bus des Cyclades qui fonctionnent même quand votre téléphone ne fonctionne pas.',
  'hero.lede':
    'CycladesGo est une famille de calculateurs d’itinéraire gratuits et utilisables hors ligne — un par île. Ouvrez une ligne, obtenez les horaires, les arrêts et le tarif. Sans compte, sans tracking, sans data roaming.',
  'hero.ctaPrimary': 'Choisissez votre île',
  'hero.ctaSecondary': 'D’où viennent nos données',
  'hero.stat1': 'îles en ligne',
  'hero.stat2': 'lignes cartographiées',
  'hero.stat3': 'arrêts cartographiés',
  'hero.stat4': 'trajets publiés',
  'hero.trustLine':
    'Indépendant. Sans lien avec, sans approbation de et sans exploitation par aucun KTEL ou transporteur.',

  'islands.title': 'Choisissez votre île',
  'islands.lede': 'Chaque île a son propre planificateur. Choisissez votre destination.',
  'islands.openApp': 'Ouvrir le planificateur',
  'islands.lines': 'lignes',
  'islands.stops': 'arrêts',
  'islands.journeys': 'trajets',
  'islands.dataAsOf': 'Données au',
  'islands.validTo': 'Vérifié jusqu’au',
  'islands.operator': 'Exploitant',
  'islands.plannedTitle': 'Pas encore couvert',
  'islands.plannedLede':
    'Nous avançons sur les Cyclades par vagues. Ces îles n’ont pas encore de planificateur — si vous avez une source d’horaires exploitable, dites-le-nous.',
  'islands.reportSource': 'Signaler une source d’horaires',

  'trust.unofficial': 'Non officiel',
  'trust.scheduled': 'Planifié, jamais en direct',
  'trust.openData': 'Données ouvertes',
  'trust.offline': 'Fonctionne hors ligne',
  'trust.noTracking': 'Sans tracking',

  'network.title': 'Comment fonctionnent vraiment les bus dans les Cyclades',
  'network.lede':
    'La plus grande source de stress n’est pas l’absence de bus : c’est de ne pas savoir quand part le dernier. Cette page l’explique honnêtement, à l’échelle des îles.',

  'data.title': 'D’où viennent nos données',
  'data.lede': 'Chaque chiffre que nous publions renvoie à une source nommée et à une date.',
  'data.methodology': 'Méthodologie',
  'data.quality': 'Limites connues',
  'data.changelog': 'Journal des modifications',
  'data.licence': 'Licence des données',

  'about.title': 'À propos de CycladesGo',
  'about.lede': 'Qui construit ceci — et ce que ce n’est pas.',

  'sponsors.title': 'Parrains',
  'sponsors.lede': 'Ce qu’un parrainage achète, ce qu’il n’achète jamais, et qui paie quoi.',

  'footer.imprint': 'Mentions légales & identification',
  'footer.legal': 'Mentions légales',
  'footer.privacy': 'Confidentialité',
  'footer.terms': 'Conditions d’utilisation',
  'footer.cookies': 'Cookies',
  'footer.accessibility': 'Accessibilité',
  'footer.methodology': 'D’où viennent nos données',
  'footer.report': 'Signaler un problème',
  'footer.attribution': 'Données cartographiques © contributeurs OpenStreetMap (ODbL 1.0).',
  'footer.rights': 'Gratuit pour toujours. Sans comptes, sans traceurs publicitaires, sans revente de données.',
  'footer.donations': 'Soutenir le projet',

  'legal.title': 'Mentions légales & identification',
  'legal.updated': 'Dernière mise à jour',
  'legal.imprintTitle': 'Mentions légales',
  'legal.disclaimerTitle': 'Non officiel — aucun lien',
  'legal.privacyTitle': 'Confidentialité',
  'legal.termsTitle': 'Conditions d’utilisation',
  'legal.accessTitle': 'Accessibilité',
  'legal.attributionTitle': 'Sources de données & attribution',
  'legal.cookiesTitle': 'Cookies',

  'common.opensInNewTab': 'ouvre un nouvel onglet',
  'common.readMore': 'Lire la suite',
  'common.backHome': 'Retour à l’accueil',
  'common.notTranslated':
    'Cette page n’est pas encore traduite. La version anglaise relue fait foi.',
  'common.notIndexed':
    'Cette page n’est pas encore publiée dans cette langue ; elle est donc exclue du groupe de langues et du plan du site.',
  'common.draft': 'Prototype de design',
};

const it: Record<string, string> = {
  'nav.home': 'Home',
  'nav.islands': 'Isole',
  'nav.network': 'Come funziona',
  'nav.data': 'I nostri dati',
  'nav.about': 'Chi siamo',
  'nav.sponsors': 'Sponsor',
  'nav.legal': 'Note legali',
  'nav.skip': 'Vai al contenuto',
  'nav.menu': 'Menu',
  'nav.theme': 'Attiva/disattiva modalità scura',
  'nav.lang': 'Lingua',

  'brand.tagline': 'Pianificazione bus gratuita e offline per le Cicladi — isola per isola.',
  'brand.subtagline': 'Orari programmati, non in tempo reale. Non ufficiale.',

  'hero.title': 'Gli orari dei bus nelle Cicladi che funzionano anche quando il telefono no.',
  'hero.lede':
    'CycladesGo è una famiglia di pianificatori di viaggio gratuiti e utilizzabili offline — uno per isola. Apri una linea, ottieni orari, fermate e tariffa. Nessun account, nessun tracking, nessun roaming.',
  'hero.ctaPrimary': 'Scegli la tua isola',
  'hero.ctaSecondary': 'Da dove arrivano i nostri dati',
  'hero.stat1': 'isole attive',
  'hero.stat2': 'linee mappate',
  'hero.stat3': 'fermate mappate',
  'hero.stat4': 'tragitti pubblicati',
  'hero.trustLine':
    'Indipendente. Non affiliato, non approvato e non gestito da alcun KTEL o operatore di trasporto.',

  'islands.title': 'Scegli la tua isola',
  'islands.lede': 'Ogni isola ha il suo pianificatore. Scegli dove stai andando.',
  'islands.openApp': 'Apri il pianificatore',
  'islands.lines': 'linee',
  'islands.stops': 'fermate',
  'islands.journeys': 'tragitti',
  'islands.dataAsOf': 'Dati al',
  'islands.validTo': 'Verificato fino al',
  'islands.operator': 'Operatore',
  'islands.plannedTitle': 'Non ancora coperto',
  'islands.plannedLede':
    'Lavoriamo alle Cicladi per ondate. Queste isole non hanno ancora un pianificatore — se hai una fonte di orari utilizzabile, fcelo sapere.',
  'islands.reportSource': 'Segnala una fonte di orari',

  'trust.unofficial': 'Non ufficiale',
  'trust.scheduled': 'Programmato, mai in tempo reale',
  'trust.openData': 'Dati aperti',
  'trust.offline': 'Funziona offline',
  'trust.noTracking': 'Senza tracking',

  'network.title': 'Come funzionano davvero gli autobus nelle Cicladi',
  'network.lede':
    'La preoccupazione più grande non è che i bus non ci siano: è non sapere quando parte l’ultimo. Questa pagina lo spiega onestamente, per tutte le isole.',

  'data.title': 'Da dove vengono i nostri dati',
  'data.lede': 'Ogni numero che pubblichiamo rimanda a una fonte nota e a una data.',
  'data.methodology': 'Metodologia',
  'data.quality': 'Limiti noti',
  'data.changelog': 'Registro modifiche',
  'data.licence': 'Licenza dei dati',

  'about.title': 'Informazioni su CycladesGo',
  'about.lede': 'Chi lo costruisce — e che cosa non è.',

  'sponsors.title': 'Sponsor',
  'sponsors.lede': 'Che cosa compra una sponsorizzazione, che cosa non compra mai, e chi paga che cosa.',

  'footer.imprint': 'Note legali e identificazione',
  'footer.legal': 'Note legali',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Condizioni d’uso',
  'footer.cookies': 'Cookie',
  'footer.accessibility': 'Accessibilità',
  'footer.methodology': 'Da dove vengono i nostri dati',
  'footer.report': 'Segnala un problema',
  'footer.attribution': 'Dati cartografici © collaboratori di OpenStreetMap (ODbL 1.0).',
  'footer.rights': 'Gratis per sempre. Nessun account, nessun tracker pubblicitario, nessuna rivendita di dati.',
  'footer.donations': 'Sostieni il progetto',

  'legal.title': 'Note legali e identificazione',
  'legal.updated': 'Ultimo aggiornamento',
  'legal.imprintTitle': 'Note legali',
  'legal.disclaimerTitle': 'Non ufficiale — nessun legame',
  'legal.privacyTitle': 'Privacy',
  'legal.termsTitle': 'Condizioni d’uso',
  'legal.accessTitle': 'Accessibilità',
  'legal.attributionTitle': 'Fonti dei dati e attribuzione',
  'legal.cookiesTitle': 'Cookie',

  'common.opensInNewTab': 'si apre in una nuova scheda',
  'common.readMore': 'Continua a leggere',
  'common.backHome': 'Torna alla home',
  'common.notTranslated':
    'Questa pagina non è ancora stata tradotta. La versione inglese revisionata fa fede.',
  'common.notIndexed':
    'Questa pagina non è ancora pubblicata in questa lingua, quindi è esclusa dal gruppo linguistico e dalla sitemap.',
  'common.draft': 'Prototipo di design',
};

export const UI: Record<Locale, Record<string, string>> = { en, el, de, fr, it };

export function useTranslations(locale: Locale) {
  return function t(key: string): string {
    return UI[locale][key] ?? UI.en[key] ?? key;
  };
}
