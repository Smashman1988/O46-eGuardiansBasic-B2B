# Outlet46 – eGuardiansBasic B2B

Technische Baseline **1.0.7**, lokal vorbereitet am **2026-11-03** auf **develop**.
Die aktuelle Live-Abnahme in Test-Pluginset 426 ist unten dokumentiert. Dies ist noch kein freigegebener Shop-Stand.

Dieses Repository enthält die eigenen Inhalte und Funktionen des B2B-Shops.
Der technische Plugin-Name und PHP-/Twig-Namespace lauten `GuardiansBasicB2B`;
der Marketplace-Name ist in Deutsch und Englisch `eGuardiansBasic B2B`.
Das getrennte B2C-Plugin heißt weiterhin `GuardiansBasic`. Das GitHub-Repository
bleibt [O46-eGuardiansBasic-B2B](https://github.com/Smashman1988/O46-eGuardiansBasic-B2B).
B2C wurde nur als technische Referenz gelesen; keine B2C-Dateien wurden übernommen.

## Phase 2 – Globale Performance und Codevereinfachung (2026-11-13)

Basis **`ac1138befbbf67b76163888795f3660f64377428`**, Branch `develop`, weiterhin Version **1.0.7**. Diese Änderungen sind ausschließlich lokal; die native Abnahme des Ausgangsstands gilt nicht für Phase 2. **Native Nachher-Abnahme in Pluginset 426: `NOT_TESTED`.** [HTML-Prüfbericht mit vollständigem Inventar, Priorisierung, Vorher-/Nachher-Vergleichen und Grenzen](.cache/phase2-ac1138b-20261113/Phase2-Pruefbericht.html).

- **PHP und PDP-Aufbereitung:** Alle 13 eigenen PHP-Dateien erneut geprüft. Ein Index in der vorhandenen Twig-Extension ersetzt 25 vollständige Property-Filter: bei 500 Properties 12.500 → 500 ID-Zugriffe, erste Treffer und Ausgabe bleiben erhalten. Mehrbild-PDPs sortieren dieselbe Bildliste einmal statt zweimal. Sieben Matrixspalten benötigen 14 statt 28 Übersetzungsaufrufe, bei unveränderter Ausgabe und Escaping. Eine explizite Tabelle ersetzt 17 wiederholte Provider-Registrierungsblöcke; Konfigurationsschlüssel, Reihenfolge, Priorität und Rückgabewerte bleiben gleich. Der Provider schrumpft von 316 auf 145 Zeilen. Keine zusätzlichen API-Aufrufe oder neue Cache-Schicht; kein behaupteter SQL-/TTFB-Gewinn.
- **Gemeinsame Produktkarten:** `CategoryListItem` ist der gemeinsame Renderer; `CategoryListItem2` übergibt nur den bestehenden Eager-Modus. Whitespace wird bereits in der Vorlage vermieden; zwei dekorative Trennelemente werden durch Regeln am vorhandenen Größenbereich ersetzt, unsichtbare Bewertungen ohne Layoutwirkung entfallen. Die lokale 60-Karten-Fixture spart in jeder der fünf Sprachen **65.770 unkomprimierte HTML-Byte und 150 Elemente**; DE 212.719 → 146.949 Byte und 2.071 → 1.921 Elemente. Das ist kein gemessener Netzwerktransfer und kein Vergleich mit der früheren nativen 280-KB-Stichprobe. Alle 60 Artikel, LiveShopping-Slots 1–6, Attributbatches und Kartenfunktionen bleiben erhalten.
- **JavaScript und Build:** Die Suche hat eine gemeinsame Quelle; globale Such-Listener werden pro Dokument einmal registriert. Das generische Listing-Item-Modul ist aus dem Core entfernt und aus einer Quelle in die bestehenden Main-/Kategorie-/Vue-Einstiege eingebaut. Dafür entsteht keine zusätzliche Request-Datei; die eigene PDP-Implementierung und der Cachevorteil des gemeinsamen Core bleiben erhalten. Der vollständige Build nutzt konservative Terser-Kompression ohne Unsafe-Optionen oder Property-Mangling. Core- und Seitenassets haben die Kennung `core2`.
- **Lokale JS-Messung:** Die ausgewählten Core-/Item-/Zoom-Dateien einer kalten PDP sinken von **267.641 auf 255.919 Body-Byte (−11.722)** bei weiterhin drei Requests. Ihre gzip-Summe von 85.194 → 82.650 Byte ist nur eine Schätzung. Der kontrollierte lokale, unkomprimierte HTTP-Lauf Home → Kategorie → PDP misst für die betrachteten eigenen JS-Bundles **329.190 → 319.521 Transfer-Byte (−9.669)** bei weiterhin fünf übertragenen Requests. Die fünf folgenden Navigationsschritte übertragen auf beiden Ständen jeweils null Byte/null Requests. Einzelne Entrydateien werden größer; nicht jede Navigation spart Transfer. Die CPU-Einzelläufe sind gemischt und belegen keinen allgemeinen Laufzeitgewinn. Native Nachher-Werte bleiben `NOT_TESTED`.
- **CSS:** Die gemeinsame Kartenregel ergänzt **146 Byte** im aktiven Haupt-CSS und wird in drei Critical-CSS-Zweigen konsistent erzeugt. Das ist eine kleine CSS-Zunahme zugunsten der HTML-/DOM-Reduktion. Kein neuer pauschaler Preload und kein belegter nativer LCP-/CLS-Gewinn.
- **Bewusst verworfen:** Der Header bleibt beim bisherigen Basket-Getter einschließlich PDP-Snapshot. Ein reiner Mengen-Getter hätte zwar dieselbe Badge-Ausgabe, überspringt aber IO-Aufbereitung, die requestinterne Netto-Preise verändern kann; drei gezielte IO-Proben belegen das Risiko für spätere Verbraucher. Auch die Entfernung von Checkout-CSS wurde verworfen: zwölf Vergleiche hatten gleiche Endgeometrie, aber abweichendes frühes Layout. Ein früherer Lazy-Observer-Start nach dem HTML-Parsing wurde ebenfalls verworfen: Ein langsames zusätzliches Bild verzögerte im Kontrollfall `window.load` und die daran gebundene Bedieninitialisierung von rund 123 auf 1.458 ms bei 1.400 ms Bildverzögerung. Der bisherige Start bleibt erhalten; ein nativer LCP-Gewinn ist nicht belegt. Keine Änderungen an Preis-, Steuer-, Versand-, Bestell- oder Zahlungslogik.

**Gezielte Prüfungen:** PHP-Syntax 13/13; Provider 58 Konfigurations-/Eventvergleiche; jeweils unter Twig 2 und 3: 173 Templates, 585 SEO-Verträge, 360 Kartenkontrakte sowie 50 PDP-/Quickview-, 50 Header-, 60 Property- und 20 Matrix-Bytevergleiche PASS. Weitere Matrix-, Such-, Facetten-, Sprach-, Galerie-, CSS- und Buildprüfungen sind im Bericht einzeln ausgewiesen. Das ist keine Behauptung einer vollständig ausgeführten Gesamtsuite. Lokale Fixtures belegen weder Kundenklassen-Akzeptanz noch einen allgemeinen PHP-/LCP-/TTFB-/INP-Gewinn.

**Grenzen:** Native Phase-2-Abnahme, angemeldete Kundenklassen und echte Zahlungen `NOT_TESTED`. Kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge. Plenty-Inhalte, Konfiguration, Core, Zahlungsplugins und B2C unverändert; keine Versionsanhebung.

## Systematische PHP-/Twig-/JavaScript-Optimierung (2026-11-13)

Basis **`96e50ee14e500710586ded1c83ed4dc54faef570`**, sauberer Arbeitsbaum auf `develop`. Die Änderungen sind ausschließlich lokal. [Vollständiger HTML-Prüfbericht mit Inventar, Messwerten, Screenshots, Testabbrüchen und offenen Grenzen](.cache/systematic-optimization-96e50ee-20261113/Pruefbericht.html). **Native Nachher-Abnahme in Pluginset 426 erst nach Benutzerbereitstellung; keine Produktionsfreigabe.**

- **Gemeinsamer JavaScript-Core:** Zwölf bestehende Module liegen einmal in `core.js`; die vier Seiteneinstiege behalten ihre Aufrufreihenfolge und eigenen Unterschiede. Matrix-, Preis-, Bestands- und Basketlogik wurden gegen den ursprünglichen AST geprüft. Popper/Bootstrap bleiben für eigene Dropdowns/Modale erforderlich und werden im vorhandenen Ceres-/Vue-Zweig weiterhin übersprungen. jQuery und Lozad bleiben wegen tatsächlicher Verbraucher erhalten. Die betrachteten JS-Quellen schrumpfen von 1.389.950 auf 500.633 Byte; der Vorrat an zugehörigen Min-Assets von 1.036.837 auf 342.629 Byte. Das ist keine Einsparung pro Einzelaufruf.
- **MagicZoom nach Bedarf:** Auf PDPs folgt das unveränderte Vendor-Asset dem Seitencode, damit `mzOptions` vorbereitet ist. Bereits vorhandene Galerien in gespeicherten Inhaltsseiten werden ebenfalls erkannt. Auf anderen Seiten wird es bei Quickview parallel zum vorhandenen HTML-Request geladen, mit gemeinsamem Promise, internem Vendor-Ready-Signal, Fehler-/Timeoutbereinigung und Wiederholbarkeit. Ein Fehler führt zur normalen Produktseite. Alte Quickview-Antworten überschreiben keine neuere Auswahl; `quickViewItem` wird ohne doppeltes Fragezeichen gesetzt. Core-Initialisierungen laufen einmal je Dokument.
- **Transfer und Dateianzahl:** Der lokale unkomprimierte HTTP-Vergleich misst Desktop/Mobile, kalten und warmen Cache getrennt. Startseite −87.278, Kategorie −87.030 und Vue-Seite −86.757 JS-Body-Byte, jeweils ein zusätzlicher Theme-Request. Direkte kalte PDP **+11.679 Body-Byte und zwei zusätzliche Requests**; dafür kein Gewinn behauptet. Navigation Startseite → Kategorie → PDP: gemessener JS-Transfer inklusive lokaler Header 875.600 → 417.023 Byte. Wiederholung derselben Seite: beide Stände 0 JS-Netztransfer. Ceres-/Zahlungs-SDKs sind nicht Bestandteil dieser Zahlen. Kein nativer LCP-/INP-/TTFB- oder Rankinggewinn behauptet.
- **Critical CSS:** Ausschließlich redundante frühere Deklarationen entfernt, deren identische spätere Regel bereits gewinnt. HTML −5.403 Byte PDP, −1.069 Kategorie, −7.404 allgemein. Alle ergänzenden Matrix-/Footer-/Builder-/Logo-/Layoutblöcke, Fonts und externen CSS-Dateien erhalten. 23 vollständige lokale Stil-/Geometrievergleiche und vier Screenshotpaare identisch.
- **Navigation:** Ein gemeinsamer Renderer mit fünf getrennten Sprachdaten behält die öffentlichen Makros, alle URLs, Reihenfolgen, Währungsparameter sowie 142 DE-/141 übrige Links. HTML je Sprache −21.611 bis −27.945 Byte. Elementanzahl bleibt gleich; DE-Navigationsknoten einschließlich Whitespace-Textknoten 1.430 → 692. Zehn Desktop-/Mobile-Vergleichspaare PASS. Lokaler warmer Twig-Render ca. 0,15–0,19 ms langsamer; kein PHP-Zeitgewinn.
- **PHP und Quickview:** PDP/Header teilen den bereits vorbereiteten Basket-Snapshot (2 → 1 Getter); Quickview spart 32 hier nicht benötigte Übersetzungen. Route-Provider einmal statt zweimal registriert, zehn Routendeklarationen erhalten. Controller nutzt die vorhandene Request-Abstraktion und Integerprüfung; ungültige IDs/Pagination werden vor Repository-/Twig-Aufrufen kontrolliert abgewiesen. Bewertungen maximal 100 je Seite, Seite maximal 10.000, fehlend 20/1. IT-/ES-Autocomplete weist ungültige Parametertypen mit HTTP 400 ab. Footer-Links bleiben dynamisch: IO cached sie bereits. Getter mit Warenkorbseiteneffekten und extern sichtbare volle PDP-Variablen bleiben erhalten.

**Reproduzierbarer JS-Build:** `npm ci --ignore-scripts`, `npm run build:js`, danach `npm run check:js`. Gepinnte Versionen stehen in `package-lock.json`; sämtliche acht produktiven `.min.js` entstehen vollständig aus versionierten Quellen. `core.min.js` kombiniert `core.js` und `zoom-loader.js`; jQuery ist eine unveränderte Kopie der versionierten Vendor-Distribution, MagicZoom behält seinen gepackten Payload. Kein Property-Mangling oder aggressives Komprimieren der Legacy-Bundles. Die bisherigen Such-/Sprach-/Lazy-/Shopmodus-Buildbefehle delegieren an den vollständigen Build; der Matrix-Builder verwendet ihn für JavaScript. `node scripts/optimize-critical-css.cjs` prüft die CSS-Deduplizierung ohne Schreibzugriff; `--write` ist eine bewusste lokale Änderung.

**Prüfungen:** 13/13 PHP-Dateien; Twig 2/3 jeweils 173/173 Templates und 585 SEO-/Assetverträge; reproduzierbare acht Min-Assets; 96 bytegleiche PDP/Header-Render; 104 Controllerfälle; bestehende Such-/Filter-/Sprach-/Quickview-/Lazy-Tests; Matrix 70 Funktionen/440 Layouts; zwölf vollständige Browser-Assetfälle mit echter MagicZoom-Bibliothek sowie neun Loader-Lifecyclefälle PASS. Sechs LiveShopping-Produkte und 60 Kategorieartikel sind unter beiden Twig-Versionen geprüft. Einzelne anfängliche Sandbox-, Testfixture-, Runtime- und Timeoutabbrüche sind im Bericht ausgewiesen; keine Behauptung einer vollständig ausgeführten Gesamtsuite.

**Offen:** Native Pluginset-426-Integration, angemeldete Kunden/Kundenklassen und echte Checkout-Zahlungen `NOT_TESTED`. Der HTML-Request der bisherigen API hat weiterhin keinen eigenen Timeout. Kein Commit, Push, Merge, Deployment, Plugin-Sync, Cache-Purge oder Eingriff in PlentyONE-/ShopBuilder-Konfiguration. Mindestbestellwert 199 € netto und externe Zahlungsplugins unverändert.

## Globale Performance und eigene PHP-/Twig-Pfade (2026-11-13)

Ausgangsstand `13af2e8a77642ef3e7d32b7b64ecb569e4ddbbf5`, ausschließlich lokal auf `develop`. [Vollständiger HTML-Prüfbericht mit priorisierten Befunden, Dateiinventar, Traces und Messgrenzen](.cache/global-performance-13af2e8-20261113/Pruefbericht.html). **Keine Produktionsfreigabe: native Nachher-Abnahme nach einer späteren Bereitstellung in Pluginset 426 erforderlich.**

- **Systematische Prüfung:** Alle 13 eigenen PHP-Dateien aktuell geprüft; 172 Twig-Dateien samt Provider-, Partial-, Include- und ShopBuilder-Ketten erfasst. Der vorige Audit wurde bei identischen Datei-Hashes wiederverwendet. Unklare dynamische oder externe Verbraucher sind kein Löschbeweis. Keine zusätzliche Suche, kein neuer Service oder Cache; die 60 Startseitenartikel und bestehende Batchversorgung bleiben erhalten.
- **Quickview:** Zwei unbenutzte Aufbereitungen (`getItemCrossSellingList`, `getAttributeNameMap`) entfallen ausschließlich bei nichtleerem `quickViewItem`, entsprechend der bestehenden PageDesign-Semantik. Die volle PDP behält beide Werte für mögliche externe Include-Kontexte. Variantenmap, Basket, Wishlist, Preise und Reihenfolge bleiben unverändert. 36 echte Twig-2/3-Rendervergleiche bytegleich, 120 Vorbereitungskontrakte und vier Trackingfälle PASS. Zwei IO-Getter weniger je Quickview-Render; native PHP-Laufzeit, SQL-Anzahl und TTFB-Einsparung nicht gemessen.
- **Globale Suche:** Eingabeversion und aktueller Suchwert verhindern, dass verspätete Antworten neuere Vorschläge überschreiben oder nach dem Löschen wieder erscheinen. Kurze Eingaben entfernen Ergebniszeile und Ladezustand vollständig. Bestehende 400-ms-Debounce, Routen, IT-/ES-Fallback und Requestanzahl bleiben erhalten. ALT 16 reproduzierte Fehler; NEU 40 Reihenfolgefälle und 80 bestehende Suchfälle PASS. Nur der vorhandene Handler wird in vier Quellen/aktiven Min-Dateien ersetzt (`build-search-assets.cjs`, Cachekennung `search4`); je Bundle +91 unkomprimierte Byte, keine zusätzliche Ressource.
- **Frühe Spaltengeometrie:** 140 Byte Critical CSS übernehmen die vorhandene 50/50-Geometrie für explizit so konfigurierte ShopBuilder-Zweispaltenbereiche ab 768 px. Nativ auf Login belegter Wechsel von 100 % auf 50 %; im isolierten Original-HTML-Replay kein zugehöriger Spaltensprung mehr. Bei 1920 px beobachtete Shift-Summe 0,365245 → 0,002146, kein nativer Gesamt-CLS-Vergleich. Acht Breiten PASS, fertiges Layout und abweichende Spaltenkonfigurationen unverändert.
- **Gemeinsamer Footer:** Stabile Platzhalter-Anordnung und echte Seitenverhältnisse für fünf Presselogos reduzieren den großen Umbruch beim Bildladen. Hauptquelle, aktive Min-Datei und Critical-Regeln konsistent; Cachekennung `footer1`. Kontrollierter 390-px-Vergleich: Footer-Höhenänderung −490,5 → +22 px; acht gepaarte Layoutprüfungen über fünf Sprachen PASS. Fertige Geometrie, Texte, Links, Bilder und Requests unverändert. Restbewegungen von 0–33 px sind dokumentiert, kein Null-CLS-Versprechen. Aktive CSS-Datei +284 Byte; keine Transferersparnis behauptet.
- **Mess- und Prioritätsgrenzen:** 40 native Ausgangsläufe über zehn Seitentypen, kalt/warm getrennt, notwendiger Consent, repräsentative Kombinationen aller fünf Sprachen und acht Breiten. Zwei Wiederholungen pro Zelle, Median/Spanne und tatsächliche LCP-Elemente im Bericht. Kein Vergleich mit unkontrolliert anderem Consent-/Live-Kontext; kein belegter nativer LCP-/INP-/TTFB-Gewinn dieser lokalen Änderungen. Große Backend-/SDK-/Reviews-Kosten bleiben offen. Bekannte IO-Pagination, kleine Bild-/Fontshifts und künstliche MagicZoom-Randfälle wurden nicht erneut ausgiebig untersucht. Der Facettencontroller bleibt wegen möglicher eingebetteter Filterlisten erhalten.

Gezielte PHP-/JS-/Twig-2/3-/CSS-, Build- und Integrationsprüfungen samt technischen Testabbrüchen stehen im Bericht; keine Aussage über eine vollständig ausgeführte Gesamtsuite. B2C, Variantenmatrix, Preise, Bestände, Steuern und Bestelllogik unverändert. Kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge.

## Startseite: Ursachenanalyse und lokale Optimierung (2026-11-13)

Ausgangsstand `25d2ca883d552e442f6e29e93a4586faca300929`, Branch `develop`. Der [HTML-Prüfbericht](.cache/homepage-performance-25d2ca8-20261113/Pruefbericht.html) enthält 60 native Ausgangsmessungen, 36 isolierte Komponentenvergleiche, Netzwerk-/Widgettraces, lokale Regressionen und Screenshots. **Keine native Nachher-Freigabe: Theme und externe Inhaltsvorlagen sind nur lokal vorbereitet.**

- **Hauptbefund:** Die native TTFB liegt über alle 60 Messungen im Median bei 5.263 ms. Sie ist keine PHP-Renderzeit; die Anteile von LiveShopping, Kategorie-/Attributsuche und übriger Plattform sind ohne Backend-Telemetrie nicht belegt. Fünf Sprachen, Gast/EUR/Lieferland 1, 390/1440 px, je drei kalte/warme Wiederholungen; exakte Einzelzellen und Messgrenzen im Bericht. iframe-Transfers sind in der Haupt-CDP-Baseline unvollständig, deshalb keine erfundene Gesamttransferzahl.
- **LiveShopping:** Die neue `LiveShoppingGrid.twig` sammelt die autorisierten Slots 1–6 und verwendet das bestehende `CategoryGridOnly`. Sechs LiveShopping-Datenabrufe bleiben erhalten; sechs Attribut-Einzelaufrufe werden durch einen vorhandenen Batch mit denselben sechs Suchfabriken ersetzt. Übersetzungen 42 → 7, Währungs-Getter 6 → 1; die Währungsaufbereitung war bereits im IO-MemoryCache zwischengespeichert. Keine neue API, Preis-/Bestandslogik oder zweite Kartenimplementierung. Das erste tatsächlich ausgegebene Produktbild erhält gezielt frühe Priorität; andere Produktbilder und Logos bleiben lazy. Andere Kartenaufrufe behalten ihre bisherige Ausgabe.
- **60 Kategorieartikel:** `getItemsFromCatSimple(60, 60, [8855])` bedeutet Kategorie 60, Seitengröße 60, Facette 8855. Die bestehende Implementierung verwendet bereits eine Listensuche und drei Attributbatches für 60 unterschiedliche IDs. Keine PHP-Änderung. Im vorhandenen Grid wird der Herstellerpfad einmal vorbereitet; zwei unbenutzte Karten-Makroimports entfallen. Kategorieausgabe und Suchoptionen sind lokal bytegleich. Lokale warme Renderfixtures sparen etwa 0,12/0,15 ms Median unter Twig 2/3; daraus folgt keine native Backend-Einsparung.
- **Bewertungen:** Bestätigter Inhaltsort ist Kategorie 5153, Beschreibung 2, Deutsch, über `CategoryDescription2` mit `lang: "de"`. Der native Stand liefert eine andere öffentliche Widgetkennung als der Nutzer-Code; beide Belege bleiben getrennt. Das aktuelle Widget verursacht 75 Requests, rund 213 kB komprimierte Response-Bodies und nachgewiesene Layoutverschiebungen beim iframe-Höhenaufbau. Die [lokale Ersatzvorlage](.cache/homepage-performance-25d2ca8-20261113/reviews/widget-user-candidate.html) behält die Nutzerkennung und ergänzt ausschließlich `defer`: 20 lokale Fälle und zehn vollständige Text-/Höhenvergleiche PASS. Die 75 Requests und der Reviews-CLS bleiben; kein späteres Verstecken sichtbarer Bewertungen und keine Manipulation des Anbieter-Scripts.
- **Bilddiagnose:** Das erste LiveShopping-Bild war in 57/60 nativen Läufen LCP, mobil 30/30. In sechs kontrollierten Vergleichen mit gleicher eingefrorener Hauptantwort blieb es das LCP-Element: Median 390 px 840 → 200 ms, 1440 px 1.068 → 212 ms. Diese Messung ohne native Backend-Latenz belegt keine entsprechende Live-Einsparung. Keine zusätzlichen JS-/CSS-Dateien, unveränderte aktive Min-Assets und Cachekennungen.

**Inhaltsübergabe:** Nach einer späteren Benutzerbereitstellung die bisherigen sechs ShopBuilder-Codewidgets samt schmalen Spalten durch **ein vollbreites** Codewidget ersetzen:

```twig
{% include "GuardiansBasicB2B::Category.Item.Partials.LiveShoppingGrid" %}
```

Den Kategorieaufruf darunter unverändert lassen. Die Reviews-Ersatzvorlage gehört in Kategorie 5153/Beschreibung 2/de; der vorhandene Startseiten-Include bleibt gleich. Diese Plenty-Inhalte wurden nicht geändert. Exakte PHP-/JS-/Twig-2/3-, Build-, Bild-/Grid-/Quickview-Prüfungen und technische Testabbrüche stehen im Bericht. Reale Mobilgeräte, Kundenkonto, Bestellung und native Nachher-Abnahme sind offen. Hohe TTFB und Widget-CLS sind nicht als behoben freigegeben.

Nur lokal; kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge. Keine Versionsanhebung. B2C, Variantenmatrix, Preise, Bestände und Bestelllogik unverändert.

## Lokale Desktop-Warenkorbkorrektur und MagicZoom-Diagnose (2026-11-13)

Ausgangsstand `964b6f5ec2caf86b837ac21a7e9be47df1394393` auf `develop`. Der [lokale Prüfbericht](.cache/theme-magiczoom-cls-964b6f5-20261113/Pruefbericht.html) trennt native Ausgangsbelege, kontrollierte ALT-/NEU-Replays, technische Abbrüche und offene Nachher-Abnahmen.

- **Einziger Produktfix:** Im allgemeinen Critical-CSS-Zweig von `resources/views/PageDesign/Partials/Head.twig` fehlte die Desktop-Regel für `.col-lg-7`. Ergänzt sind genau 75 Byte ab `min-width:992px`, entsprechend dem vorhandenen Hauptstylesheet. Damit ist die bestehende Spaltenbreite von 58,333333 % bereits vor dessen Laden definiert. Keine neue Layoutvorgabe, keine zusätzliche Ressource; JS-/CSS-Quelldateien und aktive Min-Dateien bleiben unverändert.
- **MagicZoom bleibt unverändert:** Eine native Touch-Eingabe erreicht den Schließen-Button während der Öffnungsanimation, obwohl dessen Vorfahr noch `opacity:0` hat. Der vorhandene Vendor-Guard `!ready || !expanded` verwirft diesen frühen Schließversuch. Der betreffende Vendor-Block ist zwischen `1647723` und `964b6f5` identisch; das ersetzt keinen nativen ALT-Vergleich. Keine Änderung an Vendor, Galerie, Quickview oder Variantenmatrix und keine Behauptung einer abgeschlossenen Schließ-Stressabnahme.
- **Bewusst offen:** Der mobile Ceres-Lader verursacht weiterhin den nachgewiesenen 120-Pixel-Höhenwechsel. Ohne nachgewiesen sichere, inhaltsabhängige Stabilisierung gibt es weder feste Mindesthöhe noch Eingriff in den fremden Ladeablauf. Die bestehende Critical-CSS-Lücke für `.col-md-6` im Tabletbereich 768–991 px bleibt ebenfalls unverändert.
- **Prüfgrenze:** Lokale Geometrie-Replays und Syntax-/Build-Prüfungen belegen keine Verbesserung des gesamten nativen CLS, LCP oder JavaScript-Aufwands. Tests auf einem realen Mobilgerät, ein nativer historischer ALT-Vergleich und die native Nachher-Abnahme nach einer späteren Benutzerbereitstellung in Pluginset 426 bleiben offen. Einzelne Prüfstände und genaue Ergebnisse stehen im Bericht; keine Gesamtfreigabe.

Keine Versionsanhebung. Nur lokal; kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge. B2C, Preise, Bestände, Bestelllogik, Variantenmatrix und externe Zahlungs-SDKs unverändert.

## Vertiefte Kategorie-Diagnose und sichere lokale Korrekturen (2026-11-13)

Basis `1647723c59ca3943d740b5d555d27faa44d2792f`, ausschließlich `develop`. [HTML-Prüfbericht mit zehn Arbeitspaketen, Rohdaten, Screenshots und Grenzen](.cache/category-rootcause-1647723-20261113/Pruefbericht.html). **Keine Produktionsfreigabe. Neue Änderungen sind nur lokal geprüft; native Nachher-Abnahme nach Bereitstellung in 426 offen.**

- **Kategoriefehler weiter offen:** 33 kontrollierte Seitenpaare, davon elf mit Überschneidung im ursprünglichen HTML und 17 in IO-JSON. Artikel `2348443`, Variante `1443259`, wechselt bei gleichem Preis über die Seitengrenze. Die Überschneidung liegt vor Twig/JavaScript vor; keine künstliche Deduplizierung oder Umsortierung. Die exakte serverseitige Tie-Breaker-/Cache-Ursache bleibt unbestätigt.
- **Zählkontexte getrennt:** Aktueller Datenstand DE: Facettenantwort 803, Kategorieanzeige 800. Die Liste berücksichtigt einen voreingestellten Maximalpreis, den der Facettenrequest nicht mitführt. Zusätzlich weichen Plattform-Gesamtzähler von vollständig aufgezählten Dokumenten ab (803/800 bzw. 800/798). Konkreter gespeicherter Preisgrenzwert und interne Zählerimplementierung sind nicht bestätigt. Keine Änderung an Preis-, Filter- oder Ergebnislogik.
- **CSS:** Ungültige Quellsyntax und sieben browserseitig ignorierte Deklarationen entfernt; bisher wirksame CSSOM unverändert. Aktives Checkout-CSS −219 unkomprimierte Byte, Haupt-Min-CSS unverändert. 20 Layout-/Pixelvergleiche in fünf Sprachen und vier Breiten identisch. Checkout-Kennung `…-css1`; keine pauschale Legacy-Neuminifizierung.
- **Shop-Auswahldialog:** Tab verbrauchte bisher den einmaligen Keydown-Handler, sodass anschließendes Escape nicht mehr schloss. Alle Schließwege geben jetzt Handler und Öffnungstimer frei; fehlendes Modal wird abgefangen. Bestehende Zwei-Sekunden-Verzögerung, Cookie und Ziele erhalten. 280 lokale Browserfälle PASS, darunter 800 Wiederholungszyklen; Ausgangsstand 80 PASS/200 FAIL. Vier bestehende Min-Bundles jeweils +153 Byte, Kennung `…-mode1`, keine zusätzlichen Requests. Nur der Dialogbereich wird gebaut.
- **Footer und Builder:** Ein unbenutzter Währungs-Getter entfällt; je 15 echte Twig-2-/Twig-3-Renderfälle bytegleich. Kein belegter Datenbankrequest weniger. Der Facetten-Builder ersetzt nur seinen markierten CSS-Block und erhält nachfolgende Regeln; zuvor konnte ein vorangegangener Matrix-Build zu deren Abschneiden führen. Sechs isolierte Build-Prüfungen PASS; Matrix-Quellen und produktive Matrix-Assets unverändert.
- **Weitere Befunde:** Native Coverage und dynamische Zustände, Contentseiten, Galerie-Clipping und wiederholte CLS-Messungen dokumentiert. Das nachladende externe Bewertungswidget verschiebt die Startseitenliste; CSS-Aufteilung, 404-/Warenkorb-CLS, authentifizierter Checkout und externe Zahlungs-SDKs bleiben gesonderte offene Punkte. Kein pauschaler LCP-/CLS-/INP-Gewinn behauptet.

PHP-/JS-/Twig-/CSS-, Asset- und Funktionsprüfungen einschließlich einzelner technischer Abbrüche sind im Bericht ausgewiesen. Frühere Audit-Einträge darunter beschreiben den jeweiligen historischen Stand. Kein Commit, Push, Merge, Deployment, Sync oder Cache-Purge; B2C, Variantenmatrix, Bestände, Preise, Steuern und Bestelllogik unverändert.

## Vollständiger Theme-Audit und lokale Korrekturen (2026-11-13)

Basis `5f83c153f9bf4ce6e1077be7ccfecedce3f50f9c`, Branch `develop`; die vorherigen lokalen Änderungen bleiben erhalten. [Vollständiger HTML-Bericht mit Dateiinventar, Messreihen und Einschränkungen](.cache/theme-performance-final-20261113/Pruefbericht.html). **Lokal geprüft, native Nachher-Abnahme in Pluginset 426 erforderlich; keine Produktionsfreigabe.**

- **Inventar/Nutzung:** 13 eigene PHP-Dateien, 171 Twig-Templates, 12 JS- und sieben CSS-Dateien untersucht. Statische Referenzen, dynamische Sprach-Includes, konfigurierte Overrides und Container getrennt erfasst. Nicht nachgewiesen aktive Templates wie `Topseller`, `Neuheiten`, `Abverkauf`, `Homepage` und das alte `ItemListView` bleiben unverändert; daraus keine Laufzeitersparnis abgeleitet.
- **PHP/Twig:** Ein unbenutzter zweiter Config-Lesevorgang samt `explode` im Provider entfällt; 24 Bootstrap-Konfigurationen liefern mit expliziten Plattformdoubles identisches Verhalten. PageDesign gibt den überschriebenen ersten `loginSuccess`-Eintrag nicht mehr aus; der zuvor wirksame Text bleibt in fünf Sprachen gleich. Ein Übersetzungsaufruf je Vollseitenrender weniger, keine belegte Datenbankabfrage.
- **Aktive Empfehlungen:** `SingleItem` übergibt den vorhandenen Karten-Batch an maximal vier tatsächlich angezeigte Empfehlungen. Bei vier verschiedenen Artikeln: vier `getResult`-Aufrufe → ein `getResults`-Aufruf mit weiterhin vier Suchfabriken. Artikelabfrage und Matrixversorgung unverändert; 50 Empfehlungskombinationen und 36 bestehende Listenfälle je Twig-Version mit identischer Kartenausgabe.
- **Lazy Loading:** Die vorhandene Event-Komponente löst den vorherigen Lozad-Observer vor dem erneuten Erfassen aktueller Bilder. InfiniteScroll erzeugt einen Observer je Nachladegruppe statt je Lazy-Element und startet nur mit Folgelink. Platzhalter, Bildladen und Klickhandler erhalten. 16 ALT-/NEU-Modulprüfungen mit echten Browser-Observern; nach 20 Kategorie-Append-/Bind-Zyklen 261 → ein Observer mit überwachten Elementen. Keine Aussage über eingesparte Heap-Bytes oder INP.
- **Assets/Regression:** `scripts/build-lazy-assets.cjs` aktualisiert nur betroffene eigene JS-Bereiche; wiederholter Build bytegleich. Vier aktive Bundles mit `-lazy1`, Kategorie weiterhin zusätzlich `-history1`. Min-Dateien wachsen um 310 Byte (Kategorie) bzw. 207 Byte (je übriges Bundle); gleiche Assetzahl. 34 bestehende Prüfgruppen nach dokumentierter Anpassung der isolierten Quickview-Fixture bestanden, einschließlich 544 Facetten-, 101 Routing-, 197 Sprachmenü- und 30 History-/BFcache-Fällen. PHP-/JS-Syntax und Twig 2/3 im Bericht einzeln belegt.
- **Messgrenzen:** 76 unveränderte native Gastaufrufe in fünf Sprachen und acht Breiten; zehn geprüfte native Theme-Assets entsprechen dem Git-HEAD. Der vorherige lokale History-Fix ist noch nicht enthalten. PHP-Deploymentstand nicht bestätigt. ALT-/NEU-Replays verwenden dieselben aufgezeichneten Antworten; keine native Nachher-Abnahme. Kein allgemeiner LCP-/TTFB-/CPU-Gewinn behauptet; native S3-Assets ohne Content-Encoding.
- **Bewusst erhalten:** Erste zwei eager Listenkarten, Galerie/MagicZoom, Critical CSS, Fonts, kompakte Facetten und Fremdcontainer. Alte CSS-Quellen enthalten Parserfehler (`main.css`: falsch platziertes `!important`; `checkout.css`: `//`-Kommentare), aktive Min-Dateien sind parsebar. Keine pauschale CSS-Neuerzeugung oder behauptete vollständige Legacy-Source-/Min-Gleichheit. Globale Zahlungs-SDKs bleiben eine externe Einschränkung. Kundenpreise, echter Checkout und Bestellung: `NOT_TESTED`.

Keine Preis-/Bestands-/Bestelländerung. Kein Commit, Push, Merge, Deployment, Plugin-Sync, Cache-Purge oder Konfigurationseingriff. B2C unverändert.

## Shopweiter Performance-Audit und lokale History-Korrektur (2026-11-12)

Basis `5f83c153f9bf4ce6e1077be7ccfecedce3f50f9c`, zu Beginn sauberer Stand auf `develop`. Der [ausführliche Prüfbericht](.cache/shop-performance-5f83-20261112/Pruefbericht.html) enthält die native Zahlungs-SDK-Messreihe, PageDesign-/LCP-/CLS-Analyse, Bildvergleich, PHP-/CSS-/Font-Inventur, datierte öffentliche Lighthouse-Referenzen, Screenshots, Einzeltests und Einschränkungen. **Zahlungs-SDK-Begrenzung weiterhin FAIL; keine Gesamtfreigabe.**

- **Lokal korrigiert:** Das gebündelte InfiniteScroll-History-Modul verwendet `pagehide` statt `unload` und bewahrt bei `event.persisted` seinen Zustand. Normales Verlassen behält Scrollnormalisierung und Bereinigung. Quelle und aktives Kategorie-Min-Bundle konsistent; nur dessen Cachekennung erhält `-history1`. Das Min-Bundle wächst um 31 Byte, keine Request-Einsparung. 60 lokale ALT-/NEU-Browserfälle in fünf Sprachen bestehen; BFcache-Rückkehr im isolierten Modulfixture ALT 0/30, NEU 30/30. Die Rückkehrzeiten belegen keinen Geschwindigkeitsgewinn; native Ganzshop-Nachprüfung steht aus.
- **PayPal-Ursprung:** PayPal Checkout 6.8.0 erzeugt auf normalen Seiten weiterhin die globale SDK-/Google-/Apple-Initialisierung. Der Feedback-Filter in `get_additional_scripts()` erreicht diese Ausgabe nicht vollständig; sie erscheint auch auf Nicht-Vue-Seiten. Ceres unterscheidet identifizierbare externe Containerbeiträge von internen fertigen HTML-Strings. Ein selektiver unterstützter Zugriff auf diesen PayPal-Provider ist noch nicht nachgewiesen. Keine Fremdskripte manipuliert, kein gemeinsamer Container abgeschaltet und keine Plugin-Konfiguration geändert. [Supporttext lokal vorbereitet, nicht versendet](.cache/shop-performance-5f83-20261112/Supportticket-PayPal.txt).
- **Seitenkontext:** Warenkorb Kategorie 5482 und Kasse 5484 durch Benutzerscreenshots bestätigt; IO-Zuordnungen lesend geprüft. Die vorhandene direkte Amazon-Pay-Einbindung ist bereits auf 5484 begrenzt. `/checkout/` ist hier eine Einstiegsseite, kein Nachweis eines getesteten Zahlungs-Checkouts. `/kasse/` leitet den leeren Gast zur Startseite um. Reale Zahlungsbuttons, Kundenkonto, weitere Länder/Währungen und Apple-Pay-Geräte bleiben offen.
- **Messungen:** 28 neue native Browseraufrufe, 65 zusätzliche Sprach-/Seiten-Quelltextprüfungen; sieben PayPal/Google/Apple-JS-Ressourcen auf normalen Seiten. Keine JS-Ausnahme im aktuellen Messfenster; Google-Pay-Konfigurations-POSTs bleiben offen, auch in einer separaten 45-Sekunden-Probe. HTTP 429/CORS damit weder reproduziert noch behoben. Die vorherigen 60 nativen Messungen desselben HEAD bleiben Ausgangswerte. Keine native Nachher- oder PHP-/Serverlast-Einsparung behauptet.
- **PageDesign/Bilder:** Bericht trennt `defer` von echtem Nachladen, regulär blockierendes Kontakt-CSS, Vue-/jQuery-Reihenfolge, das globale `window.load`-Gate vor `lozad`, Critical CSS, globale Plugin-Container und feste Kategorie-Sonderfälle. 64 kontrollierte Bild-/Viewportfälle; die Ein-Bild-eager-Alternative brachte keine geringere Requestzahl und teilweise schlechteren LCP, daher verworfen. Keine Bild-/CSS-/Facetten-/Matrix-Umstellung.
- **Regressionen:** 33 ausgeführte bestehende Prüfgruppen nach gezielten Wiederholungen PASS; u.a. 544 Facetten-, 101 Routing-, 197 Sprachmenü-, 1.332 Kontakt-Assertions und 45 Overlap-Fälle. Twig 2/3, PHP-/JS-Syntax und genaue Ergebnisse im Bericht. Veraltete Cache-Erwartungen in SEO-/Kontaktfixtures aktualisiert; anfängliche Testabbrüche separat dokumentiert. Lokale Prüfungen ersetzen keine native Nachher-Abnahme.

Keine Preis-/Rundungs-/Bestands-/Warenkorbtransaktions-/Bestelländerung. B2C unverändert. Kein Commit, Push, Merge, Deployment, Plugin-Sync, Cache-Purge oder Server-/CDN-Eingriff.

## Gemeinsamer Sprachwechsel ohne zusätzlichen PDP-Controller (2026-11-12)

Der Performance-Nachtrag ersetzt die zunächst lokal vorbereitete PDP-Einbindung von `facets.min.js`. **Nur lokal auf `develop`, keine native Nachher-Abnahme und keine Freigabe von Pluginset 426.** [Aktueller Prüfbericht mit ALT-/NEU-Messungen, Varianten-/Sprachmatrix und Grenzen](.cache/language-hreflang-20261112/Pruefbericht.html).

- **Eine gemeinsame Grundlage:** Kategorie, Suche und Produktdetailseite verwenden im bestehenden Modalablauf die bereits im Head ausgegebenen IO-/`hreflang`-URLs. Der konfigurierte ShopBuilder-Sprachdialog bleibt erhalten. Sein eigener REST-Aufruf hat nur Kategorie-/Widgetkontext, keinen aktuellen Artikel-/Filterkontext; deshalb werden seine vorhandenen Links nach dem Laden anhand des Seiten-Heads ergänzt. Keine neue Route, keine zweite Modalkomponente und kein zusätzliches Sprach-JS-Asset.
- **SEO-Sonderfälle:** Bei abweichendem redaktionellem Canonical steht die bereits im Head berechnete echte IO-Bedienroute als Attribut am Alternate-Link. Bei erzwungenem Canonical bleiben SEO-Alternates wie bisher unterdrückt; nur in diesem Zweig liefert der Head inerte Navigationsmetadaten. Canonical-/Robots-Regeln bleiben erhalten. Fehlende Ziele werden gesperrt, statt auf eine Sprachstartseite zu führen.
- **Filterzustand:** Der Facettencontroller bleibt ausschließlich auf Kategorie-/Suchkontexten eingebunden und liefert dem Modal den aktuellen Filterzustand, einschließlich noch nicht angewendeter Änderungen. Seine doppelte Sprachrouten-JSON-Ausgabe und sein eigener Sprach-Observer entfallen. Entfernen/Reset verwenden weiterhin die korrigierte IO-Basisroute. Suchbegriff, Facetten, Preisgrenzen, Sortierung, Seitengröße sowie sinnvoller Seitenkontext bleiben erhalten; eine geänderte Filterauswahl setzt die Seite zurück.
- **Artikel/Varianten:** Das Modal verwendet die Serverroute des Artikels. Eine bewusst gewählte Matrix-Vorschau, die bestehende Variantenauswahl oder eine direkte Varianten-URL kann die von IO registrierte `itemId_variationId`-Route nutzen. IDs werden gegen die vorhandene Variantenliste des Hauptartikels geprüft; Quickview-Daten werden ignoriert. Präfix/Domain kommen aus dem tatsächlichen IO-Ziel. Bloße Mengenbearbeitung in der Bestellmatrix gilt nicht als Wechsel zu einem anderen Einzelartikel. Es werden weder Mengen gespeichert noch Preise/Bestelllogik verändert.
- **Parameter:** Auf PDPs werden nur explizite, syntaktisch gültige `currency`/`Currency` und `ShipToCountry` weitergereicht; IO behält seine fachliche Validierung. Keine pauschale Übernahme von `Lang`, `variationId`, `quickViewItem`, Suche/Facetten, Trackingparametern oder Fragmenten. Varianten werden im unterstützten Pfad transportiert, nicht über einen unbelegten Queryparameter.
- **Assets:** Die vier ohnehin geladenen Seitenbundles enthalten denselben erweiterten Modalablauf; außerhalb der beiden Modalbereiche bleiben die aktiven Bundles bytegleich zum lokalen Ausgangsstand. JS-Kennungen `…-matrix3-language1` und `facets3`. Auf PDPs kein Facettenasset und kein zusätzliches Routen-JSON, auch wenn ein Kategorieobjekt vorhanden ist. Der Facettencontroller schrumpft von 9.200 auf 7.518 Byte; jedes aktive Seitenbundle wächst um 2.479 Byte. Damit PDP: ein JS-Asset und netto 6.721 unkomprimierte JS-Byte weniger; Kategorie/Suche: gleiche Assetzahl, netto 797 unkomprimierte JS-Byte mehr. Komprimierte Übertragung und Zeitmessungen getrennt im Bericht; kein pauschaler LCP-/CPU-Gewinn.
- **Prüfungen/Grenzen:** 544 Facetten-, 101 Routing- und 197 Artikel-/Varianten-/Modalfälle bestanden, darunter je 60 normale, nach Vorschau gewechselte und direkt adressierte Varianten-Sprachwechsel; fünf Sprachen, drei gespeicherte echte Artikelroutensätze und explizite lokale Variantenfixtures. Weitere Such-, SEO-, Quickview-, Matrix-, Galerie-, Bewertungs- und Layoutregressionen sind im Bericht einzeln ausgewiesen. 40 lokale PDP-Messungen zeigen kalt 2.402 Byte weniger übertragene Brotli-JS-Nutzlast; keinen belastbaren allgemeinen LCP-/CPU-Gewinn. Lokale HTTP-200-Antworten und Replay-Messungen ersetzen weder Plenty-Routing/ShopBooster noch echte Mobilgeräte/Kundenklassen. Native Prüfung des neuen Stands in 426 erforderlich. Kein Commit/Push/Merge/Deployment/Plugin-Sync/Cache-Purge; B2C unverändert.

## Vorherige lokale Sprach-URL-Korrektur vor dem Performance-Nachtrag (2026-11-12)

Historischer Zwischenstand: Die nachfolgend beschriebene zusätzliche PDP-Controller-/JSON-Einbindung und die pauschale PDP-Parameterübernahme wurden durch den gemeinsamen Head-/Modalansatz oben ersetzt. Die ursprüngliche Entfernen-/Reset-Korrektur bleibt erhalten.

Basis `fc5a52ae4557d5bb319fccb6e0586d753b577985`, Branch `develop`. Die native Abnahme dieses Ausgangsstands in Pluginset 426 war **FAIL**: Entfernen/Reset verlor in EN/FR/IT/ES das Sprachpräfix (Kategorie: 404; Suche: DE). **Die folgende Korrektur ist nur lokal geprüft, noch nicht bereitgestellt oder nativ abgenommen.** Der [aktuelle Prüfbericht](.cache/facet-route-fix-20261112/Pruefbericht.html) enthält Ursachenbelege, ALT-/NEU-URLs für alle fünf Sprachen, Einzelresultate, Screenshots, Testabbrüche und offene Risiken. Der [native Ausgangsbericht](.cache/native-facets-fc5a52a-20261112/Pruefbericht.html) bleibt unverändert.

- **Filter-Links:** Das gemeinsame `FacetFilter2.twig` verwendete `request.getRequestUri()` als Basispfad. Die gespeicherten nativen Links belegen dort das fehlende Sprachpräfix. Jetzt liefert der vorhandene IO-Service `getCanonicalURL(null, true)` die aktuelle Sprachroute; `true` verhindert, dass ein redaktioneller SEO-Canonical zum Bedienziel wird. Die vorhandene `queryString`-Verarbeitung bleibt unverändert: Suchbegriff und übrige Parameter bleiben erhalten, entfernt werden die gewählten Filter und die bisherige Seitennummer. Keine manuelle Präfixverkettung, kein Eingriff in Canonical-/Robots-Ausgabe.
- **Artikel-Sprachwechsel:** Der bestehende Sprachhandler setzte bisher eine Facettenwurzel voraus. `PageDesign.twig` übergibt nun auf Produktdetailseiten die Artikel-/Variantenrouten aus IO `getLanguageURLs()` als sicher kodiertes JSON. Derselbe Controller korrigiert damit den vorhandenen Sprachdialog auch ohne Facetten. Aktueller Artikel, URL-Parameter (einschließlich mehrfacher Schlüssel) und Fragment bleiben erhalten; explizite Zielrouten-Parameter haben Vorrang. Fehlende Zielrouten sind gesperrt und erklärt. Matrix-Eingaben werden beim Öffnen des Dialogs nicht verändert; eine Seitennavigation persistiert keine unbestellten Mengen.
- **Gezielte Nachweise:** Je **100/100** URL-Fälle unter Twig 2/3; vorher **20 PASS / 80 FAIL** mit realistischer Request-URI. Lokal über HTTP **162/162** Browserfälle: 100 Filterkombinationen (fünf Sprachen × Kategorie/Suche × zehn Aktionen, jeweils direkte URL, Reload und Zurück/Vorwärts), 60 Artikel-Sprachwechsel auf drei gespeicherten Artikelrouten und zwei Schutz-/Wiederholungstests. Zusätzlich **534/534** bestehende Facetten-Browserfälle, je **133/133** Facetten- und **585/585** SEO-/Layoutfälle unter Twig 2/3. Keine JavaScript-Ausnahmen in den abgeschlossenen Facettenläufen. Die früheren Testdoubles wurden berichtigt: sprachbereinigte Request-URI und HTTP 404 für unbekannte Routen statt stiller DE-Zuordnung.
- **Kompaktheit und Assets:** Weiterhin **69** initiale Facettenelemente bei gleicher Referenzfixture, keine zusätzlichen Gruppenrequests und wiederverwendete DOM-Elemente nach 100 Öffnungszyklen. Facetten-Datenmodell, CSS und die vier Hauptbundles bleiben unverändert. `facets.js` und `facets.min.js` sind konsistent; JS-Kennung **`facets2`**, CSS-Kennung weiterhin `…-perf1-facets1`. Der Controller wächst von **8.810 auf 9.200 Byte** unkomprimiert und wird nun zusätzlich auf PDPs mit `defer` eingebunden. `defer` ist keine verzögerte Netzwerk-/Idle-Ladung. Kein neuer Performancegewinn behauptet.
- **Freigabegrenze:** Lokale HTTP-200-Antworten, Trefferlisten und Sprachkontexte stammen aus ausdrücklich benannten Routing-/Katalogfixtures. Sie beweisen weder Plenty-Produktivrouting noch aktuelle Artikeldaten/Übersetzungen. Vor Freigabe in 426 alle Sprach-/Filteraktionen und Artikelwechsel, native 200-Status, SEO, reales Modal, History, Mobilgeräte und Auswirkungen des zusätzlichen PDP-Assets prüfen. Angemeldeter Kundenkontext bleibt gemäß Auftrag offen. Keine Änderung an Preis-/Rundungs-/Bestelllogik, Variantenmatrix oder B2C. Kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge.

## Vorherige Facettenimplementierung vor der nativen Nachprüfung (2026-11-12)

Historischer Implementierungsstand auf Basis `543ee87`, später als `fc5a52a` nativ geprüft. Die folgenden Messungen und lokalen Tests gehören zu diesem Stand; der dabei nativ entdeckte Sprachpräfixfehler und seine lokale Korrektur sind oben beschrieben. Vollständiger [damaliger Prüfbericht mit Messwerten, Screenshots, Dateiliste und Grenzen](.cache/facet-implementation-20261112/Pruefbericht.html).

- **SEO:** `priceMin` und `priceMax` erzwingen wie die bisherigen Filterparameter NOINDEX; bestehende NOFOLLOW-/Zusatzregeln, Canonical und Pagination bleiben erhalten.
- **Null Treffer:** Aktive IDs kommen aus URL und vorhandenen Konfigurationsfiltern, unabhängig von Ergebnis-Buckets. Entfernen-/Reset-Links sind bereits serverseitig vorhanden und verwenden die tatsächliche Seitenroute. Fehlende Namen erscheinen neutral als übersetzter Hinweis mit ID; weder erfundene Namen noch eine zusätzliche Suche. Vorgegebene ShopBuilder-Filter bleiben Suchvorgaben; Reset entfernt die URL-Filter.
- **Sprachwechsel:** Der vorhandene Sprachdialog verwendet die von IO gelieferten echten Zielrouten. Facetten-IDs, Preisgrenzen, Suchbegriff, Sortierung sowie ausdrücklich übergebene Währungs-/Länderkontexte bleiben erhalten. Fehlende Zielrouten werden gesperrt und erklärt. IT-/ES-Suchfallback unverändert.
- **Ausgabe:** Ein gemeinsames Twig-Partial verwendet kompakte Tupel aus dem vorhandenen IO-Ergebnis. Der gemeinsame, auf Facetten begrenzte Controller baut Wertelisten beim ersten Öffnen auf, erhält die Elemente beim Wiederöffnen und aktualisiert die vorhandenen Daten nach Filteränderungen. Keine Gruppenanfrage; weiterhin dieselbe `/rest/io/facet/`-API. Preis-Eingabe allein startet keine Suche. Ein neues initiales, cachefähiges JS-Asset ist erforderlich; die vier vorhandenen JS-Bundles bleiben bytegleich.
- **Nachweis „Alle Artikel“:** Facetten-HTML **459.255 → 16.717 Byte**, initiales Facetten-DOM **3.059 → 69**, Quelldokument-DOM **4.629 → 1.634**. JSON **9.753 Byte**, neuer Controller **8.810 Byte**. Lokale tatsächlich übertragene Brotli-Nutzlast inklusive CSS/Controller **75.903 → 74.298 Byte**; bei kleineren Listen dagegen **+1.707 bis +2.916 Byte** im kalten Vergleich. Kein pauschaler Transfer-, TTFB- oder Interaktionsgewinn behauptet. Vollständige Methodenabgrenzung im Bericht.
- **Prüfungen:** 534 lokale Browserfälle ohne FAIL/JavaScript-Ausnahme, einschließlich 100 unterschiedlicher Kombinationen, 100 Öffnungszyklen und je 50 Sprach-, Nulltreffer- und Preisfällen. Fünf Sprachen, acht Breiten von 320 bis 1920 px. Je 133 Facettenfälle und 560 SEO-Fälle unter Twig 2/3; 171 Twig-Dateien parsebar. Bestehende Suche/Matrix-Regressionsprüfungen und 120 ALT-/NEU-Messläufe dokumentiert. Ein absichtlich provozierter HTTP 503 prüft die Fehleranzeige.
- **Build:** `node scripts/build-facet-assets.cjs`; neue JS-Kennung `facets1`, CSS-Kennung `nl3-matrix4-logo1-gallery3-perf1-facets1`. Bestehende Min-/Critical-Regeln außerhalb des Facettenzusatzes unverändert. Externe Twig-/PHP-/Chrome-Testumgebung wie im Prüfbericht angegeben, keine neuen Laufzeitpakete.

**Grenzen:** Die Browsermatrix verwendet explizite IO-Fixtures und einen lokalen HTTP-Server. Native PHP-Kompilierung/ShopBooster, reale Kunden-/Preisklassen, externe Suchindizes, echte Geräte und Checkout müssen nach deiner Bereitstellung geprüft werden. Keine Änderung an Matrix, Preis-/Rundungs-/Bestelllogik, Galerie/MagicZoom, Quickview-Versorgung oder B2C. Kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge. Folgende Abschnitte dokumentieren historische Stände.

## Technischer Theme-Audit und kleine PHP-Bereinigung (2026-11-12)

**Referenz:** `develop`, HEAD `8e59531cf6abbac36ad657b40bb2ec439dc13e06`. Nach erneuter Bereitstellung durch den Betreiber sind in Pluginset **426** die aktuellen Asset-Hashes, Kontakt-JS `contact3` und der frühe MagicZoom-Block nachgewiesen. Der native Kollisionsschutz funktioniert bei 1024/1440/1920 px; die MagicZoom-Figur besitzt die erwartete frühe Geometrie. Dies bestätigt die beobachteten Frontendmerkmale, nicht den vollständigen serverseitigen PHP-Commit.

**Inventar und native Referenz:** 2.638 versionierte Dateien einschließlich 13 PHP-Dateien, 171 Twig-Dateien, zwölf Template-/ResultFields-JSON-Dateien, zehn JS-, sieben CSS- und 15 Sprachdateien. **156 gültige native Navigationen** decken zehn Seitentypen bei 375/390/768/1024/1440/1920 px mit kaltem und warmem Browsercache ab. Hauptkombinationen wurden dreimal gemessen; vollständige Median-/Min-/Max-Werte, DOM-/Transfergrößen, sichtbare REST-Requests, LCP-/Shift-Quellen und Bilddaten stehen im [Prüfbericht](.cache/theme-audit-20261112/Pruefbericht.html). Die Vorschau verwendet private/no-store; ihre TTFB ist kein Beweis einer langsamen gecachten Produktion.

**Zwei lokale Änderungen:** `getItemsFromCatSimple` liest keine unbenutzte Kategorie mehr; Suchoptionen, Preisfilter und Kartenrendering bleiben erhalten. `dynamicGetFeedbacks` löst das Feedback-Repository nach dem tatsächlichen Abruf nicht erneut ungenutzt auf. Ergebnis: ein Kategorie-Getter samt Serviceauflösung weniger pro einfacher Liste sowie eine DI-Auflösung weniger pro Bewertungsnachladen. IO verwendet bereits einen MemoryCache; keine pauschale DB-, TTFB- oder LCP-Ersparnis behauptet. Alle 2.585 Ressourcendateien einschließlich Variantenmatrix, Twig, JS, CSS, Sprachdateien und aktiver Min-Dateien bleiben per SHA-256 unverändert.

**Gegenprüfung:** Statische Datenflussanalyse einschließlich IO-5.0.86-Getter, echte PHP-/Twig-Ausführung mit expliziten Servicefixtures sowie unabhängige vorhandene Karten-/SEO-/Twig-/Browserregressionen. Der neue Test `tests/theme_cleanup.php` prüft unter Twig 2.16.1 und 3.30.0 jeweils **140 Ausgabevergleiche / 686 Assertions**, ergänzt um sechs Fehlerweitergabefälle. Fünf Sprachen, vier Artikelzahlen, Preis-/Filterkombinationen und Kundenpreisfixtures sind enthalten. Kundenfixtures ersetzen keine echte B2B-Anmeldung. Einzelne Testumfänge, Zwischenabbrüche, Syntaxprüfungen und Logs stehen im Bericht; keine pauschale Aussage über eine unbekannte Gesamtsuite.

**Öffentliche Referenz:** Google PageSpeed liefert Mobile/Desktop jeweils **HTTP 429**. Ohne Preview-Token wurden deshalb 24 lokale Lighthouse-Läufe für zwölf öffentliche B2B-URLs durchgeführt: **22 bewertbare Ergebnisse**, zwei erwartete Dokumentabbrüche auf der echten HTTP-404-Seite. Keine abrufbaren CrUX-/INP-Felddaten. Produktion 427 und Preview 426 bleiben getrennte Referenzen, kein Code-Vorher-/Nachher-Vergleich.

**Erhaltene Befunde:** Hoher kalter CLS der 404-Seite, Startseiten-/Warenkorbprobleme, möglicher übergroßer Facettenpayload, doppelte Providerregistrierung mit ungeklärter Framework-Deduplizierung sowie nicht vollständig parsebare historische CSS-Quellen. Dynamische Helper, Assets und CSS-Zustände werden ohne Nutzungsnachweis nicht gelöscht. Keine pauschale Änderung der ersten zwei früh geladenen Produktbilder. Größere Eingriffe sind mit Nutzen, Risiko und erforderlichen Tests priorisiert.

**Abnahmegrenzen:** Die beiden neuen PHP-Änderungen sind ausschließlich lokal und noch nicht nativ nachher geprüft. Authentifizierte Kundenklassen, Länder-/Steuerkontexte, echte Warenkorb-/Checkout-Transaktionen und physische Geräte bleiben offen. Kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge; B2C unverändert. Der ausführliche Bericht und alle Rohdaten liegen im ignorierten lokalen Auditverzeichnis. Die folgenden Abschnitte bleiben historische Nachweise ihrer jeweiligen Stände.

## Nachtrag: Kontaktwidget, MagicZoom und direkte Matrixdaten (2026-11-12)

Ausgangsstand dieses Nachtrags: `develop`, `9b6f2336fbb385230235d0e653e1a2ae3ee2c0ce`. Änderungen ausschließlich lokal; keine neue native Abnahme dieser Änderungen und keine Bereitstellung. Der ausführliche [Prüfbericht](.cache/live-fixes-20261112/Pruefbericht.html) enthält Einzelwerte, Datenflüsse, Testprotokolle und offene Nachweise.

- **Kontaktwidget:** Die vorhandene geometrische Kollisionsprüfung galt nur unter 992 px. Sie berücksichtigt jetzt auch Tablet und Desktop. Der geschlossene Auslöser verschwindet nur bei Überschneidung mit Matrix/Warenkorbbereich; ein offenes Panel bleibt geöffnet. Bestehende Observer werden weiterverwendet, kein zusätzlicher Scrollhandler. Nur die aktive JS-Kennung steigt von `contact2` auf `contact3`; Widget-CSS bleibt unverändert.
- **MagicZoom:** Vor dem asynchronen Hauptstylesheet konnten die eingefügten Figuren noch Browserabstände und Blocklayout besitzen. Der bestehende Build übernimmt 503 Bytes der bereits vorhandenen Figuren-/Linsen-Geometrie in den bestehenden PDP-Critical-Block, begrenzt auf `#ItemImgZoom`. Die Vendor-CSS bleibt die einzige Regelquelle; keine zusätzliche vollständige CSS-Datei und keine feste Galeriehöhe. Min-CSS und vier Min-JS-Bundles bleiben bytegleich.
- **Unbenutzte Datenabfragen:** `SingleItem.twig` berechnete `variationList` und `basePriceList`, ohne die Ergebnisse zu verwenden. Beide Aufrufe entfallen auf PDP und Quickview. Twig 2/3 vergleichen je 60 Fälle mit dem Ausgangsstand: gleiche verbleibende Daten und Service-Reihenfolge, zwei Aufrufe weniger. Die IO-Referenz implementiert dafür jeweils eine DataLayer-Suche. Native Serverlast/TTFB-Einsparung muss nach einer separat veranlassten Testbereitstellung gemessen werden.
- **Direkte Matrixversorgung untersucht:** Die tatsächlich erreichbare `VariationList`-API liefert mit `SingleItem`-ResultFields EAN, Bestand und kontextabhängige Preise; die normalen List-Felder enthalten EAN/Bestand nicht. 32 native Gast-Szenarien mit je drei Wiederholungen decken fünf Sprachen, Einzelvariante, Größen, Farben, PDP und Quickview ab; zusätzliche 60 reale Varianten aus mehreren Artikeln wurden in allen fünf Sprachen verglichen. Führende EAN-Nullen bleiben erhalten. Vollständige Antworten sind wesentlich größer als der bestehende kompakte Batch. Die APIs `ItemColumnBuilder`, `ItemService::getVariations()` und Presets wurden ausdrücklich geprüft; ähnliche Preis-/Bestandsfelder werden nicht gleichgesetzt.
- **Entscheidung zur Matrix:** Die Sonderabfrage bleibt erhalten. Ein direkter serverseitiger Ersatz ist aussichtsreich, aber nicht vollständig nachgewiesen: Kundenklasse/Login, die direkte Twig-Ausführung im eingesetzten Core und abweichende Sichtbarkeitsfilter sind offen. Die lokal vorhandenen IO-/Ceres-Quellen sind 5.0.86; die genaue installierte Core-/Pluginversion ist öffentlich nicht sicher nachgewiesen. Kein globaler Preis-Cache und keine Änderung an Verkaufspreisen, Rundungen, Steuern, Bestand oder Bestelllogik.
- **Regressionen und Grenzen:** Erneut 100 Quickview-Zyklen und 200 schnelle Farbwechsel mit echter gespeicherter MagicZoom-Bibliothek, zusätzlich 60-Zeilen-Matrixfixtures, fünf Sprachen, PDP/Quickview und responsive Layouts. Lokale Wiedergabe, Servicefixtures und native GET-Vergleiche sind im Bericht getrennt. Kein einzelner Artikel mit mindestens 50 Varianten in der begrenzten Live-Stichprobe; kein angemeldeter Testkunde verfügbar. Vorhandenes Preview-Listenerwachstum und intermittierende PayPal-/Google-Pay-Fehler bleiben externe Befunde; keine Zahlungsplugins geändert.

Die frühere native Performance-Abnahme bleibt ein Nachweis des Ausgangsstands. Sie ist kein nativer Nachher-Nachweis dieses lokalen Nachtrags. Vor einer Produktionsfreigabe sind diese Änderungen separat in 426 nativ abzunehmen.

## Performance und CLS – lokal vorbereitet (2026-11-12)

**Ausgangsstand:** `develop`, HEAD `731e00a6c98380e86f50fa7c5beb42d3fbda95ea`. **LIVE_BASELINE:** 558 native Navigationen über 85 verschiedene URLs in Pluginset 426; jeder Lauf prüft Preview-Stage, Set-ID und eigene Asset-Hashes. Startseite, Kategorien inklusive Seite 2, ShopBuilder/getItemsFromCat, Marken A–Z/Markenkategorie, Suche einschließlich Filter/Sortierung/Leerzustand, drei PDP-Typen, Contentseiten, 404 sowie anonymer leerer Warenkorb/Checkout sind enthalten. Alle fünf Sprachen; Hauptbreiten 375/390/768/1440 px, PDP zusätzlich 320/430/1024/1920 px. Drei Wiederholungen je Messkombination; kalter/warmer Browsercache und neue Sitzung getrennt. Quickview wird ergänzend nativ und lokal geprüft.

**FIXED_LOCALLY – nachgewiesene Ursachen:**

- Zusatz Sternebewertung: Die starre 105-px-Fläche ließ den fünften Stern auch auf Desktop umbrechen. Beide Sternebenen teilen sich nun eine intrinsisch breite Rasterzelle; alle fünf Sterne bleiben in einer Zeile, der übersetzte Link darf bei Platzmangel umbrechen. Teilbewertungen behalten eine korrekt auf die Sterne bezogene Füllung. Kein geändertes Twig-Markup oder JavaScript für diesen Zusatz.
- Die Abschlussprüfung erkannte vorhandene Überläufe durch das 1000×600-Unternehmensvideo und den Warenkorbbutton (volle Breite plus konfigurierte Seitenabstände). Gezielt proportionale Video-Begrenzung und automatische Buttonbreite; Inhalte, Abstände, Linkziele und Bestelllogik bleiben erhalten.
- Das frühe CSS ließ Footer-Spalten auf kurzen Desktopseiten in falsche Zeilen umbrechen. Der spätere Wechsel verschob die vierte Spalte horizontal um 1080 px. Der vorhandene Build übernimmt die bestehenden Footer-, benötigten Raster- und responsiven Anzeige-Regeln jetzt frühzeitig; asynchrones Haupt-CSS bleibt erhalten.
- Der leere Matrixkörper reservierte nur eine 47-px-Zeile. Beim Referenzartikel verdrängte die Initialisierung mit neun Varianten den Fußbereich um 376 px. Die vorhandene Attribut-Map liefert jetzt die Zeilenanzahl für eine Reservierung ausschließlich im vollen Tabellenlayout. Befüllte Zeilen behalten natürliche Höhen; kein zusätzlicher Serviceaufruf.
- Noch ungeladene MagicZoom-Miniaturen kollabierten auf 2 px breite Inline-Blöcke. Bestehende Rahmenbreite und Scrollleisten-Geometrie stehen nun schon vor der Initialisierung stabil bereit. Hauptbild, mobile Großansicht und Bildwechsel bleiben erhalten.
- Bekannte Unternehmensbilder erhalten ihre tatsächlichen Seitenverhältnisse, die fünf verwendeten Zahlungslogos ihren vorhandenen 120×50-Rahmen. Die vorhandenen Rasterregeln werden zusätzlich ausschließlich für diesen bekannten Zahlungsblock früh bereitgestellt. Benachbarte Produktlisten bleiben unverändert. Keine Änderung gespeicherter ShopBuilder-Inhalte, keine größeren Originalbilder, keine neue Bibliothek.

**Vergleich ausschließlich lokal:** 68 Szenarien, je drei Läufe pro Version mit denselben gespeicherten nativen Antworten und identischem kontrollierten Antworttransport. Externe Payment-/Analytics-/Video-Aufrufe und die Preview-Leiste sind in beiden Vergleichsversionen ausgespart. Desktop-CLS-Mediane: Referenz-PDP **0,0563 → 0,0023**, leere Suche **0,5597 → 0,0085**, 404 **0,7836 → 0,7836**, Zahlung/Versand **0,5844 → 0,0235**. Dies sind keine nativen Nachher-Werte. Preview-TTFB/Ladezeiten werden wegen private/no-store ausdrücklich nicht als Produktionsmangel bewertet; öffentlicher serverseitiger Cache und Browsercache sind getrennt. Eine native LCP-/Serverbeschleunigung ist nicht nachgewiesen; kleine lokale LCP-Differenzen werden als Streuung behandelt. Vollständige Median-/Min-/Max-Werte, mobile Vergleiche, API-Zählungen, Screenshots und Traces stehen im Bericht.

**Google PageSpeed Insights – B2B-Shop:** Öffentliche Produktionsreferenz separat, ohne Preview-Token oder gespeicherte Shop-Sitzungen. Produktion liefert Assets aus 427 unter `guardiansbasic`; Preview 426 unter `guardiansbasicb2b` entspricht dem Entwicklungs-HEAD. Vier geprüfte CSS-/Seiten-JS-Dateien unterscheiden sich. PageSpeed-API und Weboberfläche liefern HTTP 429; daher keine abrufbaren CrUX-/INP-Werte und keine Aussage zu URL- oder Origin-Felddaten. Ergänzend 22 lokale Lighthouse-12.8.2-Laborläufe für elf öffentliche URLs, Mobile/Desktop und repräsentativ alle fünf Sprachen. Produktions- und Preview-Werte sind kein Code-Vorher-/Nachher-Nachweis.

**Critical CSS im Head:** Die vorhandenen alternativen frühen CSS-Blöcke bleiben erhalten. Die neuen Geometrieregeln werden aus der bestehenden CSS-Regelbasis generiert; Rasterregeln behalten dabei die Reihenfolge der aktiven Min-CSS. Die Regeln bleiben bewusst auch in der vollständigen Datei erhalten. Ihr zusätzlicher Gzip-Anteil im gespeicherten HTML beträgt geschätzt 1.6–1.7 KB; dies ist keine native Nachher-Transfermessung. Eine pauschale Verlagerung aller Styles in den Head oder Entfernung bestehender Critical-Regeln wurde wegen des größeren Regressionsrisikos nicht vorgenommen. Größenprüfung und Abwägung stehen im Bericht.

**Dateien/Assets:** `SingleItem.twig`, `main.css`, aktive `main-211025.min.css`, `Head.twig` und der bestehende `build-matrix-assets.cjs`; ergänzte Matrix-/SEO-Tests und neue `tests/performance_layout.cjs` / `tests/pdp_ratings.cjs`. Beide Changelogs aktualisiert. CSS-Kennung **`nl3-matrix4-logo1-gallery3-perf1`**; JS-Kennung unverändert **`gallery2-matrix3`**. Alle zehn produktiven JS-Dateien einschließlich vier Min-Bundles bleiben bytegleich. Preisrundungen, Bestelllogik und Attribut-Batching bleiben unverändert. Wiederholungsbuild byteidentisch.

**Prüfungen:** Sternebewertung 300 Fälle (fünf Sprachen, zehn Breiten, PDP/Quickview, 0/74/100 Prozent Füllung) plus Critical-CSS; vorhandene Überläufe zwölf Breiten-/CSS-Fälle mit fünf übersetzten Checkoutlabels. Matrix 70 Funktionsfälle, 440 Layouts, 80 Container-/Zoomfälle und 220 Sticky-Szenarien; Twig 2.16.1/3.30.0 je 171 Syntax- und 38 Funktionsfälle, SEO je 548, Karten je 36, Matrixrender je 20. Suche: 746 PHP-Assertions / 35 Sprach-Suchkombinationen. Die tatsächlich ausgeführten übrigen Browser-/Stress-/Widget-/Galerieprüfungen, PHP-Lint, JS-Syntax und `git diff --check` sind mit Ergebnis und Umfang im Bericht einzeln aufgeführt. Keine pauschale Aussage über eine unbekannte Gesamtsuite. Frühere Diagnose-/Toolabbrüche und korrigierte Zwischenstände bleiben dokumentiert.

**ACCEPTED_LIMITATION / NOT_TESTED:** Die externe Review-Injektion auf der Startseite, Preview-bedingte Serverwartezeiten, bestehende Payment-Fehler und Preview-Effekte bleiben sichtbar. Frühere Replay-Werte mit falscher CSS-Reihenfolge bzw. unzureichend eingegrenzter Widget-Geometrie wurden verworfen und wiederholt. Die 404-Seite behält ihren großen CLS durch das später formatierte Filter-/Produktraster; der leere Warenkorb wurde je Breite/Version neunmal geprüft. Auch neun A/A-Kontrollpaare mit identischem Ausgangscode zeigen stark wechselnde CLS-Werte durch asynchrone Listen-/Summeninitialisierung. Die finale A/B-Serie wechselt deshalb die Versionsreihenfolge; ein kausaler Warenkorb-CLS-Effekt ist daraus weiterhin nicht sicher ableitbar. Native Warenkorb-Abnahme bleibt offen. Die lokale Antwortwiedergabe ist keine native Abnahme; physische Mobilgeräte, angemeldete Kundenklassen und echte Bestellungen sind nicht geprüft. Länder-/Steuerpreise werden nicht gleichgesetzt. Nach eigener Bereitstellung des Betreibers müssen die geänderte CSS-Kennung, der neue Matrix-Zeilenwert und die Bedienregressionen ohne lokale Antwortersetzung in 426 bestätigt werden.

[Ausführlicher Prüfbericht mit Seitentypen, Google-/Lighthouse-Abschnitt und priorisierten Maßnahmen](.cache/pdp-performance-20261111/Pruefbericht.html) · [Messwerte und vollständige Vergleiche](.cache/pdp-performance-20261111/Messwerte-Zusammenfassung.json). **Alles lokal auf develop; keine Produktionsfreigabe und kein Deployment, Sync, Commit, Push, Merge oder Cache-Purge.** Die folgenden Abschnitte bleiben historische Nachweise ihrer jeweiligen Stände.

## EAN-Kopierfunktion entfernt – lokal vorbereitet (2026-11-11)

**Live-Ausgangsstand bestätigt:** `develop` **718ad95d6686d38612f3cd1a525a94678274a230**. Die native PDP-Antwort meldet `X-Plenty-Shop-Stage: preview`, die Vorschauleiste Pluginset **426**. Alle fünf dort geladenen B2B-CSS-/JS-Assets stimmen per SHA-256 mit diesem Commit überein; live sind noch neun Kopierbuttons und eine Statusausgabe vorhanden. Die vorherigen Widget-/Galerie-/Tracking-Korrekturen sind damit im bestätigten Ausgangsstand enthalten. Die folgende EAN-Entfernung bleibt ausschließlich lokal und ist noch nicht nativ abgenommen.

**Entfernt:** EAN-Button einschließlich SVG, `copyMatrixEan`, Clipboard-/Fallback-Aufrufe, EAN-Klickzweig, Button-Zustandsaktualisierung, die drei Kopier-/Feedback-Texte je Sprache in den vier bestehenden JS-Bundles, kopierspezifisches CSS und die versteckte Live-Statusausgabe in `SingleItem.twig`. Gemeinsame Klickbehandlung für Variantenbilder, `.eg-label-short`, allgemeine Screenreader-/Fokusregeln und andere Verbraucher bleiben erhalten. Die EAN-Aufbereitung selbst ist unverändert; `[data-eg-ean]` behält `user-select: text` und `-webkit-user-select: text`. Kein Ersatzbutton, keine Restlücke, kein zusätzliches Event oder API.

**Dateien:** `resources/js/{cat,item,main,vue}.js` und deren aktive `*-020726.min.js`, `resources/css/main.css` / `main-211025.min.css`, `resources/views/Item/SingleItem.twig`, `resources/views/PageDesign/PageDesign.twig`, `resources/views/PageDesign/Partials/Head.twig`. In `tests/variant_matrix.cjs` sind die positiven Kopierbutton-/Clipboard-Fallback-Tests samt Mock entfernt; die gemeinsame Suite prüft stattdessen unveränderte EAN-Werte, Markierbarkeit und Abwesenheit der entfernten Oberfläche. `tests/contact_widget.php` und `tests/seo_pagination.php` erwarten die neuen exakten Asset-Kennungen. Keine Sprachdatei musste geändert werden: Die entfernten Texte lagen ausschließlich in den JS-I18N-Objekten.

**Assets:** JS-Kennung **`gallery2-matrix3`**, CSS-Kennung **`nl3-matrix4-logo1-gallery3`**. Aktive Min-Dateien und kritisches Matrix-CSS sind durch den bestehenden Build synchronisiert; Wiederholung byteidentisch. Außerhalb des Matrixmoduls bleiben alle acht JS-Assets bytegleich. Je Quellmodul sind **81 bestehende Funktionen bytegleich**; geändert wurden nur `createRow` und `initMatrix`, entfernt wurde `copyMatrixEan`. Min-CSS außerhalb der Matrixregion sowie Widget- und Header-Dateien bleiben bytegleich. Such-, Bestell-, Preis-, Bestands-, Newsletter- und MagicZoom-Logik nicht verändert.

**PASS – lokal:** 100 Nachher-PDP-/Quickview-Layouts in DE/EN/FR/IT/ES bei **320/360/375/390/430/480/768/1024/1440/1920 px**, zusätzlich 20 Vorher-Fälle. Bei 180 direkt verglichenen Variantenzeilen bleiben Höhe, Breite und Mengeneingabegröße gleich; die sieben Desktop-Spalten bleiben erhalten. 20 echte Browser-Doppelklick-/Strg+C-Prüfungen bestätigen manuelles Kopieren. Vier weitere PDP-/Quickview-Fälle mit gezielt ersetzten EAN-Testdaten prüfen führende Nullen, lange EAN und fehlende EAN; Werte werden variantengenau verglichen. Keine Kopierbuttons oder Statusreste.

**PASS – vollständig ausgeführte gezielte Regressionen:** 100 vollständige Quickview-/Großansicht-Zyklen und 200 schnelle Desktop-Farbwechsel mit der tatsächlich eingebundenen MagicZoomPlus-Bibliothek; 20 weitere native Bibliotheks-Wischfälle in fünf Sprachen; 28 Rotationsfälle; 112 isolierte Bildformatfälle. Matrixsuite: **70 Funktionen / 440 Layouts / 80 Container-, Zoom- und Schriftgrößenfälle / 220 Sticky-Fälle**. Quickview **160**, Suche **80 Browserfälle** und **746 PHP-Assertions / 35 Sprach-Suchkombinationen**, SEO **548 je Twig-Version** plus **107 Metadatenfälle einschließlich 11 Browserfällen**, Karten **36 je Twig-Version**, Theme-Boot **10 Assertions**. Zusätzlich **35 Widget-Überdeckungsfälle**, Kontakt **55 Szenarien / 1332 Assertions**, Newsletter **30** und Header **125** Prüfungen. Infinite Scroll mit anschließender Quickview besteht im kontrollierten lokalen Antworttransport (24 → 25 Karten). Mengen, Varianten-/Gesamtsummen und einmalige Warenkorbaktionen werden über lokale Service-Fixtures geprüft; keine echte Bestellung.

**Syntax:** Twig 2.16.1 und 3.30.0 jeweils **171/171 Syntax und 38/38 Funktionsfälle**, PHP-Lint **21 Dateien**, JS-Syntax **10 Produktdateien** und geänderter Matrixtest, `git diff --check` fehlerfrei. Der erste Matrix-Renderlauf ohne mbstring wurde mit korrekt geladenem Runtime-Modul wiederholt. Weitere anfängliche Tool-/Fixture-Abbrüche, ihre Ursachen und Wiederholungen sind im Bericht aufgeführt. Keine vollständige Gesamtsuite behauptet.

**ACCEPTED LIMITATION:** Die PlentyONE-Vorschauleiste registriert weiterhin pro Quickview einen zusätzlichen `DOMContentLoaded`-Handler; nach 100 Zyklen 101 Registrierungen, eine initiale Ausführung. Eigene Artikel-Tracking-Registrierungen in Quickview bleiben 0, vollständige PDPs führen das Ereignis einmal aus; MagicZoom-/Document-Handler bleiben stabil. **NOT_TESTED:** native Nachher-Abnahme der EAN-Entfernung, physische Mobilgeräte/Touch-Textauswahl, echter Browser-UI-Zoom sowie angemeldete Kundenpreise und native Bestelltransaktionen. Zoom wurde mit CSS-/Viewport-Simulation geprüft. Unterschiedliche sprach-/landabhängige Preise werden nicht gleichgesetzt.

[Prüfbericht A–I mit Status, Messdaten, vollständiger Dateiliste und Vorher-/Nachher-Screenshots](.cache/ean-removal-20261111/Pruefbericht.html). **Bereit für die vom Betreiber veranlasste Testbereitstellung in 426; keine Produktionsfreigabe des neuen Codes.** Keine zusätzlichen Serviceabfragen oder neue JS-Ausnahmen in den finalen Testläufen. Nur B2B; alles lokal auf `develop`, HEAD unverändert. Kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge. Die folgenden Abschnitte bleiben historische Nachweise ihres jeweiligen damaligen Stands.

## Letzte Freigabekorrekturen – ausschließlich lokal (2026-11-11)

Ausgangsstand ist `develop` **ea8415b**, `gallery2-matrix2`. Dessen abgeschlossene [native Abnahme in Pluginset 426](.cache/live-gallery2-20261111/Live-Pruefbericht.html) bleibt der Live-Nachweis. Die folgenden Korrekturen sind **nicht bereitgestellt**; die darunterstehenden älteren Abschnitte beschreiben ihren jeweiligen damaligen Stand.

- **Kontaktwidget:** Der feste Auslöser lag tatsächlich über Mengeneingaben; ein Tipp öffnete das Kontaktfenster statt das Eingabefeld zu fokussieren. Unter 992 px beobachtet das bestehende Widget mit `IntersectionObserver` seine tatsächliche Schaltflächenfläche einschließlich übersetzter Beschriftung. Bei Überschneidung mit einer Variantenmatrix einschließlich Fußbereich oder einem Warenkorbartikel wird nur das geschlossene Widget unsichtbar und nicht anklickbar. Außerhalb erscheint es wieder; ein offenes Fenster bleibt offen. Dynamische Quickviews und deren Scroll-Clipping werden berücksichtigt. Ein einmaliger Resize-Handler sowie Resize-/MutationObserver halten die Geometrie aktuell; kein neuer Scrollhandler, Polling oder Serviceaufruf. Ohne die benötigten Observer bleibt das bisherige Verhalten erhalten.
- **70-px-Sprung:** Im gestapelten PDP-Layout bestimmte die lange Miniaturleiste mit sieben Bildern die Zeilenhöhe (520 px). Nach Auswahl einer Variante mit zwei Bildern war sie nur noch 230 px hoch; nun bestimmte das bestehende 450-px-Hauptbild die Höhe. Die Differenz verschob die Matrix um 70 px. Im Bereich 768–1199,98 px wird die vorhandene scrollbare Miniaturleiste innerhalb ihrer Spalte positioniert und auf die vom Hauptbild bestimmte Höhe begrenzt. Keine neue feste Höhe, Bildformatänderung oder Scrollkorrektur. Gemessen bei 844 × 430 px: **−70 px vorher, 0 px nachher**. Unter 768 px und das Desktop-Layout ab 1200 px bleiben unverändert.
- **Artikel-Tracking:** Das AJAX-Fragment registrierte nach dem längst abgeschlossenen Seitenladen erneut einen `window.load`-Handler. Er blieb nach dem Schließen bestehen, wurde aber nicht ausgeführt. Das vorhandene `itemid`-Tracking wird jetzt nur auf vollständigen PDPs ausgegeben und einmal ausgeführt (`once`, bei bereits geladenem Dokument unmittelbar). Der bestehende, missverständlich benannte Twig-Schalter `isQuickView` ist dort **true**, im AJAX-Fragment **false**. Bei 20 Quickviews: eigene Tracking-Registrierungen **20 → 0**, Ausführungen **0 → 0**; drei vollständige PDP-Navigationen vorher/nachher jeweils genau eine Ausführung. Keine Entfernung eines zuvor ausgeführten Quickview-Trackingereignisses.

**Externe Grenze:** Die PlentyONE-Vorschauleiste registriert weiterhin pro AJAX-Quickview einen zusätzlichen `DOMContentLoaded`-Handler. Nach 100 Zyklen sind 101 Vorschau-Registrierungen, aber nur die eine initiale Ausführung nachgewiesen. Dieses Wachstum bleibt nach dem Schließen bestehen und wird nicht im fremden Code verändert. MagicZoom-/übrige untersuchte Handler bleiben stabil; die 19 Document-Listener wachsen nicht. Analytics-/Payment-Dienste sind im lokalen Replay ausgespart, deshalb keine Aussage zur vollständigen externen Trackingkette.

**Dateien und Assets:** `resources/js/contact-widget.js`, `resources/css/contact-widget.css`, `resources/css/main.css`, `resources/css/main-211025.min.css`, `resources/views/Item/SingleItem.twig`, `resources/views/PageDesign/PageDesign.twig` und `resources/views/PageDesign/Partials/Head.twig`. Der bestehende Asset-Build synchronisiert Min-/Critical-CSS. CSS-Kennung `nl3-matrix3-logo1-gallery3`, direkt ausgelieferte Widget-Dateien `contact2`; alle acht Galerie-/Matrix-JS-Quellen und Min-Dateien bleiben bytegleich und behalten `gallery2-matrix2`. Neue gezielte Tests: `tests/contact_widget_overlap.cjs`, `tests/gallery_layout.cjs`, `tests/item_tracking.php` und `tests/item_tracking.cjs`; `tests/seo_pagination.php` prüft die neue exakte CSS-Kennung bei unveränderter Ladebedingung.

**Lokale Ergebnisse:** 100 vollständige Quickview-/Großansicht-Zyklen und 200 schnelle Desktop-Farbwechsel mit der tatsächlichen MagicZoomPlus-Bibliothek, ohne zusätzliche Bild-/Variantendienste, JPG-Navigation oder ungefangene JS-Ausnahmen. Dazu 28 PDP-/Quickview-Breiten-/Rotationsfälle, 112 Bildformat-/Miniaturanzahlfälle, 35 Widget-Fälle in fünf Sprachen und 30 Newsletter-/WhatsApp-Sprach-/Breitenfälle. Der identische Touchpunkt fokussiert nach der Korrektur das Mengenfeld. Infinite Scroll lädt lokal eine neue Karte (24 → 25), deren Quickview die zugehörige Großansicht öffnet. Serviceantworten und die zweite Ergebnisseite werden dabei kontrolliert aus gespeicherten Antworten bereitgestellt.

Bestehende Regressionen: Matrix **70 Funktionen / 440 Layouts / 80 Zusatzfälle / 220 Sticky-Fälle**, Quickview **160**, Suche **80 Browserfälle** und **746 PHP-Assertions / 35 Sprach-Suchkombinationen**, Galerie **400 Desktop-/1600 mobile Wechsel** mit Vendor-Testdouble, Kontakt **55 Szenarien / 1332 Assertions**, SEO **548 je Twig-Version** und **107 Metadatenfälle einschließlich 11 Browserfällen**, Karten **36 je Twig-Version**, Theme-Boot **10 Assertions**. Twig 2.16.1 und 3.30.0: jeweils **171/171 Syntax und 38/38 Funktionsfälle**. PHP-Lint: **21 Dateien**, JS-Syntax: **10 Produktdateien**; gezielte neue Testskripte ebenfalls geprüft. Bestehende Twig-/PHP-Deprecations sind im Bericht ausgewiesen. Keine vollständige Gesamtsuite behauptet.

[Prüfbericht mit Vorher-/Nachher-Screenshots, Messwerten, Listener-Kategorien, Testmatrix und Einschränkungen](.cache/release-fixes-20261111/Pruefbericht.html). **Bewertung:** lokal geprüfter Kandidat für eine erneute native Abnahme; keine vorbehaltlose Produktionsfreigabe. Nach einer separat veranlassten Bereitstellung müssen die drei Korrekturen in 426 ohne lokale Antwort-/Asset-Ersetzung, auf realen iOS-/Android-Geräten und in angemeldeten Kunden-/Warenkorbkontexten bestätigt werden. Keine Änderung an Preis-, Bestands-, Bestell- oder Suchlogik; keine zusätzlichen API-Abfragen. Nur B2B, alles lokal auf `develop`; kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge.

## Native Abnahme von 245e2a8 und mobiler Matrix-Bild-Tap (2026-11-11)

**Bereits bereitgestellter Stand:** Preview-Header und Pluginset **426** sind bei allen 20 protokollierten Navigationen der Hauptreihe bestätigt. Die 75 aufgezeichneten CSS-/JS-Antworten stimmen per SHA-256 mit `245e2a81d82725c614505fbbb2c027fc9a0946e9` überein. CSS wird mit `nl3-matrix3-logo1`, JavaScript mit `gallery1-matrix2` ausgeliefert. 130 native Prüfschritte bestehen: fünf Sprachen, PDP/Quickview, 320/360/375/390/430/768/1440 px, EAN-Zuordnung und mobile Kopie, Mengen/Summen, sichtbare Beschriftungen, Variantentrennung, Auswahlfläche/Seitenbalken, Logo oben/gescrollt sowie Newsletter-Texte, Ziele, Schließen und Cookie-Persistenz. Zusätzlich bestehen 30 Sticky-Eintritts-/Mitte-/Endprüfungen, fünf tatsächliche WhatsApp-Linköffnungen ohne Opener/Referrer und zwei kontrolliert verzögerte native Logo-Downloads ohne Größenänderung. Kein Kanalbeitritt und keine native Warenkorbtransaktion.

**Neue Änderung ausschließlich lokal:** Der bisherige Matrix-Klick aktualisiert nur die Galerie; er ruft keine Großansicht auf. In der Quickview fehlt zudem der erwartete Anker `ItemImgZoom2`, da das bestehende Twig die PDP-Galerie dort auslässt. Im mobilen Layout **unter 992 px mit Touch-/Coarse-Pointer** öffnet jetzt ein einzelner Tipp auf Matrixbild oder Lupe die vorhandene MagicZoomPlus-Großansicht. **Desktop bleibt beim Bildwechsel links, ohne automatische Großansicht.** Die aktive Variantenzeile und sämtliche Mengen bleiben beim mobilen Bild-Tap unverändert.

Die vier bestehenden Matrixmodule nutzen weiterhin dieselben Bilder aus dem bereits geladenen Varianten-Batch, einschließlich der zugehörigen weiteren Galeriebilder. Kein zusätzlicher Bild-/Artikelservice. Die Quickview erhält erst beim ersten mobilen Bild-Tap einen einzigen visuell ausgeblendeten Quellanker für dieselbe native Bibliothek; kein zusätzliches sichtbares Galerielayout. Dessen Instanz wird beim Schließen/Entfernen beendet. Zwei einmalige Vendor-Callbacks werden nicht pro Quickview neu registriert; der vorhandene Matrix-Klickhandler bleibt der einzige Touch-/Click-Auslöser.

**Versionsbedingte Race-Ursache:** MagicZoomPlus 5.3.5 meldet bei `lazyZoom:true` zunächst nur das kleine Bild als bereit. Ein sofortiges `expand()` nach `start()` öffnet deshalb noch nichts. Für den ausdrücklich angeforderten Bilddialog lädt die Instanz das ausgewählte große Bild vor der Bereitschaftsmeldung; danach folgt `MagicZoom.expand(node)`. Wiederholtes Stoppen während des asynchronen Aufbaus verursachte im ersten lokalen Entwurf eine Vendor-DOM-Ausnahme. Weitere Tipps werden deshalb bis zur Bereitschaft zusammengefasst; nur die zuletzt angeforderte Galerie wird aufgebaut und geöffnet. Keine künstlichen Bildlink-Klicks und keine Navigation zu JPG-Dateien. Optionen für normale Desktop-Wechsel bleiben erhalten. [Offizielle API-Dokumentation](https://www.magictoolbox.com/magiczoomplus/integration/).

**Lokale Ergebnisse:** Mit der tatsächlichen eingebundenen MagicZoomPlus-Bibliothek bestehen 200 schnelle Desktop-Bildwechsel und 100 vollständige mobile Quickview-/Bilddialog-Zyklen, ohne JPG-Navigation, doppelte Dialoge, zusätzliche Variantenabfragen oder JS-Ausnahmen. Die zwei Vendor-Callbacks werden genau einmal registriert. 30 Sprach-/Ansicht-/Breitenfälle prüfen 375 px Hochformat, 844 × 430 px Querformat und unveränderten Desktop bei 1440 px. Dazu je zwei Scrollgesten- und schnelle Acht-Tipp-Fälle mit verzögerten Bildantworten; zehn native Bibliotheks-Wischtests wechseln korrekt zum zweiten Bild. Im Querformat passt die Browser-Scrollverankerung den numerischen Scrollwert beim Wechsel eines anders proportionierten PDP-Hauptbilds an; die sichtbare Matrixzeile bleibt exakt an derselben Bildschirmposition. Keine künstliche Scrollkorrektur.

Die bestehende Matrixsuite besteht mit 70 Funktionsfällen, 440 Layoutfällen, 80 Zusatzfällen und 220 Sticky-Szenarien. Die Galerie-Regression umfasst 400 Desktop- und 1600 mobile schnelle Wechsel einschließlich veralteter Antworten, fehlender Bilder und Abbau der Instanz. Such-, Quickview-, SEO-/Nachlade-, Twig-, Kontakt-/Newsletter- und Syntaxprüfungen bestehen im im Bericht ausgewiesenen Umfang; Warenkorb und Serviceantworten werden lokal simuliert. Die Quickview öffnet auch von einer neu eingefügten Artikelkarte. Keine vollständige Gesamtsuite oder native Freigabe des neuen Codes behauptet.

Aktive JS-Min-Dateien sind synchronisiert; neue lokale JS-Kennung **`gallery2-matrix2`**. CSS, Twig-Galeriemarkup, PHP-Services, Such-, Preis-, Bestands- und Bestelllogik bleiben gegenüber `245e2a8` unverändert. [Getrennter Prüfbericht: native Abnahme, lokale Änderung, Testergebnisse und verbleibende Grenzen](.cache/magiczoom-mobile-20261111/Pruefbericht.html). Die mobile Erweiterung ist noch nicht nativ bereitgestellt; reale Mobilbrowser und angemeldete Kunden-/Warenkorbkontexte sind nach eigener Test-Bereitstellung abzunehmen. Kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge; ausschließlich B2B.

## Variantentrennung, Header-Logo und Newsletter-Auswahl (2026-11-11)

Ausgangsstand: `develop` **207a96b**, Matrix `matrix2` in Test-Pluginset 426. Die native Vorher-Aufnahme bestätigt Preview 426 und 22 zum Ausgangsstand hashgleiche B2B-CSS-/JS-Antworten. Die folgenden Änderungen bleiben lokal.

- **Mobile Variantengruppen:** Unter der gesamten Variante einschließlich EAN/Summe liegt eine stärkere Linie in `#969696`. Die vorhandene 1-px-Unterkante plus 1-px-Innenlinie ergeben 2 px ohne zusätzliche Höhe. Sie liegt auf `.eg-row` und deckt auch die seitlichen Innenabstände ab. Dezente interne Trennung, hellgrüne aktive Zeile und grüner Seitenbalken bleiben erhalten. Keine Auswahlsymbole; Desktop und schmale Karten behalten ihre Struktur.
- **Logo:** Die unveränderte PNG-Datei hat **1114 × 226 px**. Zuvor trafen 327 px Breite mit `max-width: 100%` auf feste Höhen in Haupt- und kritischem CSS. Bei 320/375 px war das Logo rund **28,5/15,2 % zu schmal**. Die neue CSS-Regel nutzt den verfügbaren Spaltenplatz und begrenzt die Breite anhand der bisherigen Höhenobergrenzen und des Originalverhältnisses. `height: auto`, explizites `aspect-ratio` und `object-fit: contain` erhalten die vollständige Grafik samt Unterzeile. HTML-Bildabmessungen und dieselben Regeln im kritischen CSS reservieren die Größe vor dem Bilddownload. Header-Aufteilung, Navigation und Scrolllogik bleiben erhalten.
- **Bestehendes Newsletter-Popup:** Vorgegebene Titel, Beschreibung und beide Schaltflächen in DE/EN/FR/IT/ES. Grüner E-Mail-Hauptbutton und WhatsApp-Button mit grüner Kontur stehen bei verfügbarem Platz nebeneinander, sonst untereinander. Breiten bleiben 360 px auf Desktop bzw. maximal 306 px mobil; Touch-Flächen mindestens 44 px. Der Kanal öffnet nur nach Klick mit `target="_blank"` und `rel="noopener noreferrer"`. Keine neue Einblendelogik, Anmeldung, automatische Weiterleitung oder Tracking-Abhängigkeit.

Newsletter-Ziele unverändert: DE `/content/newsletter/`, EN `/en/content/newsletter/`, FR `/fr/content/Bulletin/`, IT `/it/content/newsletter/`, ES `/es/content/newsletter/`. WhatsApp: `https://whatsapp.com/channel/0029VbDashBBPzjbqTzmQb3m`. Scroll-Auslöser bei 2000 px, Consent-Prüfungen, das ausschließlich beim Schließen gesetzte Sieben-Tage-Cookie und die Seitenausschlüsse bleiben unverändert.

**Technik:** `main.css` und aktive Min-Datei, `Header.twig`, `Head.twig`, `NewsletterPopup.twig`, fünf Sprachdateien und gezielte Tests geändert. Der bestehende `scripts/build-matrix-assets.cjs` synchronisiert Matrix-, Logo- und Newsletter-CSS sowie kritische Matrix-/Logo-Regeln. Übrige Min-CSS-Bytes, alle acht JS-Quellen/Min-Dateien, zentrales Seitenrouting und Logo-Datei bleiben bytegleich. CSS-Kennung **`nl3-matrix3-logo1`**; JS-Kennungen bleiben unverändert. Keine zusätzlichen API-Abfragen oder Änderungen an Preis-, Bestands- und Bestelllogik.

**Lokale Prüfungen:** 70 Matrix-Funktionsfälle, 440 Layoutfälle, 80 Container-/Zoom-/Schriftgrößenfälle und 220 Sticky-Szenarien. Vollständige PDP/Quickview in fünf Sprachen bei 320/360/375/390/414/430/480/768/1024/1440/1920 px: 110 Fälle, 990 Zeilen mit unveränderter Höhe, Breite und EAN-Zuordnung. Header vor/nach Scrollen an denselben Breiten; zusätzlich Zoom-Simulationen bei 80/125/150/200 % durch CSS-Viewport/DPR und schmalere Logo-Container. Newsletter: 30 Sprach-/Breitenfälle, je fünf lokale Klickprüfungen beider Ziele, Schließen/Cookie/Consent, keine Duplikate oder Überläufe und kein Layoutversatz beim Einblenden. Warenkorb und Zielseiten werden lokal simuliert.

**Finale Layoutstabilität:** 19 verzögerte Logo-Downloads ohne Größen- oder Header-Sprung. Lokaler CLS-Median aus jeweils fünf Läufen: 390 px **0,1107 → 0,1107**, 1440 px **0,0705 → 0,0715** bei überlappenden Messbereichen. Die verbleibenden Verschiebungen entstehen beim bestehenden Galerie-/Variantenaufbau; die finale Attribution zeigt keinen Logo-Versatz. Preview-Overlay, Payment und Analytics sind beidseitig nur für diesen kontrollierten Vergleich ausgespart. Keine native CLS-Freigabe.

[Prüfbericht mit Dateiliste, Screenshots, exakten Regressionsergebnissen, CLS und Abnahmegrenzen](.cache/matrix-logo-20261111/Pruefbericht.html). Ein erster Logo-Entwurf mit rein automatischer Größe erzeugte beim Bilddownload einen Layoutversatz; die proportionale Größenreserve behebt dessen Ursache. Native Nachher-Abnahme erst nach eigener Bereitstellung durch den Shopbetreiber; reale Mobilbrowser, native Browser-Zoom-Bedienung und angemeldete Kunden-/Warenkorbkontexte bleiben offen. Kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge; ausschließlich B2B. Folgende Abschnitte bleiben historische Nachweise.

## Variantenmatrix-Nachtrag – lokal auf develop (2026-11-11)

Ausgangsstand ist die bereits in **Test-Pluginset 426** bereitgestellte responsive Matrix (`d56b02a`, Asset-Kennung `matrix1`). Für den Referenzartikel **2350256** wurden Preview-Stage und Pluginset im Browser bestätigt; die 22 geladenen B2B-CSS-/JS-Antworten entsprechen dem Ausgangsstand. Der öffentliche Link ohne Preview lieferte dagegen Pluginset 427 und wurde nicht als 426-Abnahme gewertet.

- **Abgrenzungen:** Einheitliches `#b8b8b8` für Außen-, Zeilen-, Zell- und EAN-/Summenzeilengrenzen. Linien bleiben 1 px; Zebra-Streifen und Zeilenhöhen bleiben erhalten.
- **Spaltennamen:** Die bisher pauschale Kurzform in kompakten Tabellen entfällt. Ein gemeinsamer ResizeObserver misst die vollständigen Übersetzungen gegen die verfügbare Zellbreite, auch bei einer schmaleren Quickview im breiten Fenster. Nur zu breite Volltexte wechseln zur vorhandenen Kurzform; der vollständige Text steht zusätzlich im `title`. Entfernte Tabellen werden vom Observer abgemeldet. Bei 375 px stehen auf PDP und Quickview wieder **Größe, Farbe, Bestand, Einzelpreis, Menge**.
- **Sticky-Grenze:** `.eg-size-matrix-table` umfasst ausschließlich Tabellenkopf und Variantenkörper. Der vorhandene CSS-Sticky-Kopf endet damit vor `.eg-size-matrix-footer`; keine Scrollhandler. Im lokalen vollständigen PDP-Vergleich sinkt die Überdeckung des Fußbereichs von **19 auf 0 px**.
- **Aktive Variante:** Ausschließlich der vorhandene schmale grüne Seitenbalken plus **`#e6f1d9`** als Zeilenhintergrund. Kein Häkchen, kein neues Auswahlsymbol, keine zusätzliche Höhe. Die bestehende Auswahl- und Fokuslogik bleibt erhalten.

Produktänderungen: `resources/views/Item/SingleItem.twig`, `resources/css/main.css` samt aktiver Min-Datei, die Matrixblöcke in `resources/js/{cat,item,main,vue}.js` samt vier aktiven Min-Dateien sowie `Head.twig`/`PageDesign.twig` mit kritischem CSS und Cache-Zusatz **`matrix2`**. Die 77 bestehenden benannten Matrixfunktionen je Quelle sind bis auf den Aufruf der neuen Beschriftungsinitialisierung unverändert; Geschäfts-, Preis-, Bestands-, EAN-, Galerie- und Bestelllogik bleiben erhalten. CSS-/JS-Inhalte außerhalb des Matrixblocks sind bytegleich zum Ausgangsstand. **Keine zusätzlichen API-Abfragen.** Die bestehenden Tests `variant_matrix.php`, `variant_matrix.cjs` und `seo_pagination.php` wurden gezielt erweitert bzw. auf die neue Cache-Kennung angepasst.

**Prüfung:** 70 Funktionsfälle, 360 Layoutfälle, 50 Container-/Zoom-/Schriftgrößenfälle und 180 Sticky-Szenarien; fünf Sprachen, PDP/Quickview, 320/360/375/390/430/480/768/1024/1440 px, mit/ohne Farbe sowie eine bis 24 Varianten. In 90 vollständigen lokalen Seitenfällen keine horizontalen Überläufe oder JS-Ausnahmen; alle **810 verglichenen Zeilenhöhen unverändert**. EAN-Kopieren einschließlich verweigertem Clipboard-Zugriff, konkrete Warenkorb-IDs/Mengen, Summen und genau eine aktive Zeile sind lokal geprüft. Der Warenkorb wird simuliert. Die neun Varianten der nativen Referenz-Quickview reichen bei 900 px Höhe nicht bis zum Sticky-Endfall; dieser wird in den gezielten lokalen Tests mit weiterem Inhalt geprüft.

**Abschließender lokaler CLS-Vergleich (je fünf Läufe):** 390 px **0,1107 → 0,1107**, 1440 px **0,0704 → 0,0709** bei überlappenden Messbereichen. Das Preview-Overlay wurde in beiden Ständen vor dem Zeichnen nur für diese Messung ausgeblendet: Die vorherige Rohmessung und die Attribution belegen dessen eigenen Sprung. Bestehende Ladeverschiebungen durch Galerie und Variantenaufbau bleiben enthalten. Keine native CLS-Freigabe; Rohwerte und Grenzen stehen im Prüfbericht. Der abschließende Vergrößerungstest bestätigte außerdem die korrigierte Messung in einheitlichen CSS-Koordinaten.

**Kontaktwidget – Konflikt nativ bestätigt, noch nicht geändert:** Bei 375 × 900 px liegt die dritte Mengeneingabe teilweise hinter dem geschlossenen Kontaktwidget. Ein Klick auf die Eingabemitte öffnet das Kontaktfenster statt das Feld zu fokussieren. Vorschlag für eine separate kleine Korrektur: Den geschlossenen schwebenden Auslöser per einem IntersectionObserver nur während einer Kollision mit dem Variantenkörper im unteren Viewportbereich ausblenden und danach wiederherstellen. Geöffnetes Panel und Tastaturfokus müssen erhalten bleiben; der vorhandene `/kontakt/`-Link bleibt erreichbar. Kein globaler Scrollhandler und keine Widget-Neugestaltung.

[Kurzer Prüfbericht mit Vorher-/Nachher-Bildern, vollständigen Testzahlen, CLS-Einordnung und offenen Abnahmepunkten](.cache/matrix-followup-20261111/Pruefbericht.html). Nachher-Ergebnisse stammen aus lokalen Fixtures und aus aufgezeichneten vollständigen Seiten mit lokalen Assets, **nicht aus einer nativen Bereitstellung**. Der Seiten-Replay verwendet vor/nach dieselben aufgezeichneten Variantenpreise; er ist keine Prüfung länderspezifischer Steuersätze oder angemeldeter Kundenpreise. Native Abnahme auf 426 einschließlich realer Mobilbrowser und Warenkorb bleibt offen. Kein Commit, Push, Merge, Sync, Deployment oder Cache-Purge; B2C und Shopkonfiguration unverändert. Die folgenden Abschnitte dokumentieren frühere Arbeitsschritte.

## Responsive Variantenmatrix – lokal auf develop (2026-11-11)

Die gemeinsame Matrix in `Item/SingleItem.twig` erhält auf Produktdetailseite und Quickview eine Darstellung nach **verfügbarer Containerbreite**. Zuvor blendete CSS auf schmalen Viewports EAN und Variantensumme aus; feste Mengenspalten, große Abstände und die alte Modalhöhe verschärften den Platzmangel.

- **Breite Container:** vollständige Tabelle mit Größe/Farbe, Bestand, Einzelpreis, EAN, Summe und Menge. **Bis 35,99 rem:** kompakte Hauptzeile mit einer flachen EAN-/Summenzeile. **Bis 20,49 rem:** kompakte Variantenkarten. Bei der vorhandenen 15-px-Grundschrift liegen die Grenzen bei etwa 540 und 307 px. Größe/Farbe erscheinen weiterhin nur, wenn der Artikel diese Attribute besitzt.
- **Mitscrollende Spaltenüberschrift:** bleibt auf der PDP unter dem Shopkopf und in der Quickview unter dem Modal-Kopf sichtbar. Ein gemeinsamer ResizeObserver berücksichtigt die tatsächliche Shopkopfhöhe. Schmale Karten beschriften Bestand, Preis und Menge direkt.
- **EAN:** weiterhin aus demselben `/rest/io/variations/batch`-Ergebnis nach Varianten-ID; Text einschließlich führender Nullen, ohne neue Abfrage. Mobil sichtbar und kopierbar, bei fehlendem Wert `–` ohne aktiven Kopierknopf. Bei verweigertem Clipboard-Zugriff bleibt die EAN markierbar; es wird kein falscher Kopiererfolg gemeldet.
- **Quickview:** kleinere seitliche Abstände, maximal 760 px, an die verfügbare Höhe begrenzt, eigener vertikaler Inhalts-Scrollbereich und erreichbarer Schließen-Button. Summen und Warenkorb-Button bleiben im normalen Inhaltsfluss. Keine globalen Overflow-Korrekturen.
- **Bestelllogik:** Mengen-/Bestandsbegrenzung, Summen, Batch-Service, Warenkorb-Batch und Galerie-/MagicZoom-Funktionen sind gegenüber HEAD unverändert. Ein Satz Eingaben und Summen pro Variante, keine zweite Matrix und keine zusätzlichen Serviceaufrufe. Unterschiedliche Länder-/Steuerpreise werden unverändert übernommen.
- **Erster Seitenaufbau:** Weil das Haupt-CSS asynchron lädt, erzeugt der gezielte Asset-Builder die Matrixregeln zusätzlich im vorhandenen kritischen CSS-Pfad der PDP. Dieselbe CSS-Quelle verhindert einen kurzzeitig unformatierten Tabellenkopf. Bis zum vorhandenen JS-Zeilenaufbau reserviert der leere Matrixkörper 47 px; gefüllte Matrizen behalten ihre gemessenen Zeilenhöhen. Die erste lokale CLS-Messung hatte diese beiden Darstellungsverschiebungen offengelegt und wurde nach der Korrektur wiederholt.

Betroffen sind das gemeinsame Twig, `main.css`/`main-211025.min.css`, der bestehende Matrixblock in `cat/item/main/vue.js` samt vier Min-Bundles, fünf Sprachdateien, das kritische Matrix-CSS in `Head.twig` und die Cache-Kennungen in `Head.twig`/`PageDesign.twig` (`matrix1`). `scripts/build-matrix-assets.cjs` erneuert nur den Matrixblock und dessen kritische PDP-Regeln; die übrigen Bundle-Bestandteile bleiben bytegleich. Der Build ist wiederholbar ohne weitere Änderungen. Vorhandene SEO-Cache-Erwartungen wurden auf die neue Kennung angepasst. Der Builder nutzt Acorn, Terser und PostCSS; ein abweichender vorhandener PostCSS-Modulpfad lässt sich über `O46_POSTCSS_MODULE` angeben.

**Lokale Tests:** 70 Funktionsfälle, 360 Layoutfälle und 50 Container-/Zoom-/Schriftgrößenfälle bestanden. Abgedeckt: DE/EN/FR/IT/ES, PDP/Quickview, neun Breiten von 320 bis 1440 px, eine Variante, Größen, Farben, 24 Varianten, fehlende/lange EAN mit führenden Nullen, Nullbestand und lange Titel. Der Warenkorb wird dabei ausdrücklich lokal simuliert; geprüft werden die konkreten Varianten-IDs und Mengen im vorhandenen Batch. Twig 2/3 rendern jeweils 20 Matrixfälle. Zusätzlich bestehen die bestehenden Twig-, SEO-, Such-, Quickview-, Galerie-, Bootstrap- und Syntaxprüfungen im dokumentierten Umfang.

Die vollständigen Seiten werden mit aufgezeichnetem Shop-HTML, identischen Antwortdaten und den lokalen Assets geprüft. Das ist **keine native Nachher-Abnahme**. Die native Vorher-Messung bestätigt Preview 426 und den Stand `2bbd2ec`; lokale Performancevergleiche sind getrennt ausgewiesen. [Prüfbericht mit exakten Ergebnissen, Messwerten, Screenshots und offenen Abnahmepunkten](.cache/matrix-responsive-20261111/Pruefbericht.html).

**Abschließender lokaler CLS-Vergleich (je fünf Läufe):** mobil 390 px **0,1107 → 0,0828**, Desktop 1440 px **0,1509 → 0,1176**. LCP/FCP lagen lokal bei 72 → 80 ms bzw. 68 → 72 ms; lokale TTFB bei rund 5 → 8 bzw. 5 → 7 ms. Das sind Replay-Werte, keine Server-/Produktionsmessungen. Die drei nativen Vorher-Läufe ergaben CLS-Mediane 0,0000 mobil und 0,5773 Desktop; der verbleibende native PDP-CLS ist damit weiterhin separat abzunehmen. Ein Varianten-Batch je Seitenlauf, keine JS-Ausnahmen im lokalen Performance-Lauf. Anfängliche Fixture-Zeitüberschreitungen und ein abgebrochener Replay-Vorlauf sind im Bericht mit den erfolgreichen Wiederholungen dokumentiert.

**Layout bereit für eine separate Test-Bereitstellung in 426; die vollständige Zoom-Abnahme bleibt offen.** Der echte MagicZoom auf der PDP besteht in zehn Sprach-/Breitenfällen. Die fünf aufgezeichneten nativen Quickview-Antworten enthalten jedoch schon im Ausgangsstand keinen `ItemImgZoom2`-Anker; auch das unveränderte Galerie-Markup in `SingleItem.twig` wird nur für die volle PDP ausgegeben. Deshalb ist Quickview-Zoom ein belegter Bestandsbefund, kein bestandener Test. Eine neue Quickview-Galerie oder ein neuer Zoom-Einstieg wurde im Rahmen der responsiven Layoutkorrektur nicht ergänzt. Nach Test-Bereitstellung sind außerdem echte Auslieferung/Cache-Kennungen, native CLS-Werte, angemeldete Kundenpreise und Warenkorb-Aktion sowie Safari/iOS zu prüfen. Keine Produktionsfreigabe, Bereitstellung, Plugin-Sync, Cache-Purge, Commit, Push oder Merge; B2C, Shopkonfiguration und Artikel-/Preisdaten unverändert. Die folgende native Abnahme betrifft ausschließlich den vorherigen Stand.

## Native Live-Abnahme von 2bbd2ec (Pluginset 426, 2026-11-11)

**TEILWEISE BESTANDEN; keine uneingeschränkte gemeinsame Produktionsfreigabe.** Stage `preview`, ausgewähltes Set 426, B2B-Templates und geladene JS-Hashes gegen develop bestätigt. Ausschließlich echte Shopantworten, keine lokalen Bundle-/Response-Ersetzungen. Der während der Abnahme abgelaufene Link wurde nach kontrolliertem Stopp durch den vom Nutzer gelieferten neuen Link ersetzt.

- **Vorschaubilder:** Der flächendeckende `nopic.png`-Fehler ist live behoben: 60/60 Sprach-/Breiten-/Begriffskombinationen, 570 geladene echte Vorschauplätze, maximal 300 px, keine Bild-404. Für die ursprünglichen vier Begriffe jetzt 244/244 echte IT-/ES-Bilder. 120 PDP-Vergleiche (60 verschiedene Artikel je Sprache) zeigen aber zwei inhaltliche Befunde: **2351261 rosa/lila statt grau**, **2329934 veraltete Farb-Collage**. Beide Bildwerte existierten bereits in der früheren EN-IO-Antwort; kein nachgewiesener neuer Rendererfehler.
- **Suche:** 80/80 Bedienprüfungen in DE/EN/FR/IT/ES, 12/12 zusätzliche IT-/ES-Filterprüfungen. EN/IT/ES liefern im vollständigen Abschlussvergleich dieselben 297 `shoes`-Artikel über je 13 Seiten. Lokale Links, numerische Labels und führende Nullen erhalten. Unterschiedliche Länder-/Steuerpreise sind laut Nutzer beabsichtigt; API und Variantenzeilen stimmen überein. Die erste Suchkarte nach Länder-/Sprachwechsel zeigt teilweise noch den vorherigen Preis, nach erneutem Aufruf den passenden lokalen Wert.
- **Galerie/Quickview:** 10/10 native Galerie-Szenarien mit insgesamt 1.000 schnellen Farbwechseln, Zoom und Historie ohne JPG-Navigation; zusätzlich 3/3 mobile Swipe-Prüfungen. 200 Quickview-Öffnungen und 500 Farbwechsel bestanden, keine mehrfachen globalen Dropdown-Handler. Galerie technisch im geprüften Umfang freigabefähig; physische Mobilgeräte nicht getestet.
- **Restgrenzen:** 21 temporäre `Failed to fetch`-Exceptions bei begleitenden PayPal/CORS-Meldungen; gezielte Wiederholung ohne Exception. SEO: 20/20 Strukturprüfungen, Description auf sechs NOINDEX-Suchseiten fehlend. Angemeldeter B2B-Kunde, absichtlich bildloser Artikel, exakter PHP-Buildhash und interne Servicezahlen **NOT_TESTED**. Eine HTTP-Autocomplete-Anfrage je Eingabe; keine gemessene Leistungsverbesserung behauptet.

Bildzuordnung vor uneingeschränkter Freigabe korrigieren und erneut abnehmen. [Ausführlicher Live-Bericht mit Rohantworten, URLs, Screenshots und Messwerten](.cache/live-acceptance-2bbd2ec/Abnahme.html). Nur README und lokale Nachweise geändert; keine erneute lokale Gesamtsuite, kein Shopcode-/Changelog-Eingriff, Commit, Push, Merge, Deployment, Plugin-Sync, Konfigurationswechsel oder Cache-Purge. B2C unverändert. Ältere Abschnitte darunter dokumentieren die damaligen Zwischenstände.

## Vorschaubilder im IT/ES-Autocomplete (lokale Vorbereitung vor 2bbd2ec, 2026-11-11)

**FIXED_LOCALLY; native Abnahme ausstehend.** Die aktuelle Preview 426 liefert die JS-Bundles von `83d84e4` aus. IT/ES finden nun Produkte und Textvorschläge, aber alle 244 geprüften Produktvorschläge enthalten bereits in der API-Antwort die konfigurierte `nopic.png`-Datei. Sie lädt mit HTTP 200. Derselbe Artikel in derselben Sprache erhält über den IO-Endpunkt dagegen seine echte `/preview/`-URL. DOM und Netzwerk bestätigen: Der Renderer verliert keine Bild-URL.

`EnglishTextSearch::getAutocomplete()` baute bisher das normale `SearchItems`-Preset einschließlich Bildmutatoren/Defaultbild auf und ersetzte erst anschließend dessen ResultFields durch die knappe Autocomplete-Feldliste. Das entspricht nicht dem funktionierenden IO-Autocomplete-Vertrag. Jetzt wird `autocomplete=true` **vor** der Factory-Erstellung gesetzt; das native Preset wählt seine passenden Felder und Bildverarbeitung selbst. Die bereits vorhandene `withDefaultImage()`-Erweiterung bleibt für tatsächlich bildlose Produkte aktiv. Keine Änderung der gemeinsamen Feldvorlagen, des IO-Formatters, der Vorschaugröße `urlPreview` oder der Kategorie-/Produktdetailbilder; keine zusätzlichen Such- oder Bildabfragen. DE/EN/FR, EN-Textindex für IT/ES, Textvorschläge und lokalisierte Links behalten ihre bisherigen Wege.

- **Live-Baseline:** 40 Kombinationen aus DE/EN/FR/IT/ES, 1440/390 px und `nike`, `adidas`, `shoes`, `9885396`; 530 Produktvorschläge. IT/ES: 244 Platzhalter; DE/EN/FR: 286 echte Vorschauen. Keine Bild-404, fehlgeschlagenen Requests oder unbehandelten JS-Ausnahmen in den erfassten Suchläufen. Zusätzlich acht API-Antworten zum Vergleich derselben zwei Artikel in IT/ES über beide Endpunkte.
- **Lokale Regression:** 746 PHP-Prüfungen mit echtem IO-Formatter/Bildfilter, 10 Bootstrap-Prüfungen und 80 Suchhandler-Szenarien bestanden. Der neue Modus-Vertrag schlägt mit dem alten Code fehl. Bildtests prüfen Variantenpriorität, Positionssortierung, Item-Fallback, vorhandenen nativen Platzhalter, Produktzuordnung und `urlPreview` statt Originalbild. 23 Syntaxprüfungen bestanden (14 PHP, 9 JS).
- **Renderer-Gegenprobe:** 40/40 Szenarien mit 530/530 geladenen, korrekt zugeordneten Vorschaubildern. IT/ES-Bildwerte wurden ausschließlich im Browser aus aufgezeichneten EN-IO-Antworten anhand der Artikel-ID eingesetzt; Namen, Links und Texte bleiben aus der jeweiligen Sprache. Dies belegt die vorhandene Darstellung, **nicht** die native Wirkung des lokalen PHP-Fixes. Die ausführliche Diagnose, JSON-Antworten und Vorher-/Nachher-Screenshots stehen im [Prüfbericht](.cache/autocomplete-images-20261111/Pruefbericht.html).

Nach einer separat veranlassten Bereitstellung den PHP-Pfad ohne Browserersetzung in 426 wiederholen; außerdem den angemeldeten Kundenkontext und einen tatsächlich bildlosen Artikel prüfen. Die geschlossene native Suchfactory wurde lokal nicht ausgeführt; ihr interner Mutatorzustand ist nicht direkt instrumentiert. Der frühere Browser-Testabbruch durch die neu hinzugefügte, noch nicht eingerichtete Bild-Fixture wurde korrigiert und erfolgreich wiederholt. Keine vollständige Gesamtsuite behauptet. Frontend-JS, Min-Bundles und Cache-Kennungen bleiben unverändert, da die Produktkorrektur ausschließlich PHP betrifft. Kein Commit, Push, Merge, Deployment, Plugin-Sync, Konfigurationswechsel oder Cache-Purge; B2C unverändert.

## Lokale Reparatur von Vorschlägen und Farbwechsel (develop, 2026-11-11)

**Lokal vorbereitet; keine Produktionsfreigabe und keine Live-Abnahme des neuen PHP-Pfads.** Mit dem neuen Preview-Link wurden Stage `preview`, Pluginset 426 und die unveränderten Min-Bundles von `c23543f` verifiziert. Beide Ausgangsfehler sind erneut reproduziert. Der bestehende Audit unten bleibt als Baseline erhalten.

- **IT/ES-Vorschläge:** Theme und IO registrierten denselben GET-Pfad. Die live aufgerufene IO-URL lieferte für fünf der sechs passenden Prüfbegriffe leere Arrays, während der vorhandene Adapter lokal EN-Filter und EN-Vervollständigung verwendet. Die Theme-Resource erhält jetzt den eindeutigen Pfad `/rest/guardiansbasicb2b/item/search/autocomplete/`; ausschließlich IT/ES wählen ihn im vorhandenen Handler. DE/EN/FR bleiben auf IO. Die tatsächlich gewinnende native Controllerbindung des alten Pfads ist ohne PlentyONE-Servertrace weiterhin nicht bewiesen. Kein PHP-Suchmodell, Formatter, Kundenkontext oder Service-Binding geändert.
- **Tastaturauswahl:** In IT/ES öffnet Enter auf einem ausgewählten Produkt dessen vorhandenen lokalisierten Link. Der lokalisierte Produktname wird nicht erneut im englischen Textindex gesucht. Eine neue Eingabe setzt die alte Auswahl zurück. Normales Enter, Suchbutton und Textvorschläge behalten das konfigurierte Formularziel.
- **Galerie:** Der 40-ms-Klick auf ein zuvor erzeugtes Thumbnail löste nach schnellen Wechseln eine echte JPG-Dokumentnavigation aus. Die alte Prüfung verglich zudem das bereits auf das neue Bild gesetzte `href` mit demselben Wert und führte dadurch unnötige Neustarts aus. Die betroffene MagicZoom-Instanz wird nun vor dem DOM-Austausch gestoppt und danach unmittelbar mit den aktuellen Bildern gestartet. Keine synthetischen Linkklicks, verzögerten Neustarts oder globalen Refresh-Timer; entfernte Matrizen und überholte Antworten ändern keine Galerie mehr. Normale Bildlinks bleiben erhalten.
- **CLS:** Nur Diagnose am unveränderten Preview-Stand: 200 Messungen für fünf Seitentypen, Desktop/Mobil und frischen Cache/Reload; 20/20 Chrome-Traces bestätigen die erfassten CLS-Werte. Desktop-Median Marken-A–Z **0,0189 frisch / 0,0017 warm**, Produktdetail **0,2211 frisch / 0 warm**. Beteiligt sind Preview-Overlay, noch nicht reservierte Bildgeometrie und dynamischer Tabellenaufbau zusammen mit nachgeladenem CSS. Acht getrennte Erstbesuchsproben mit Cookie-/B2B-Dialog bestätigen den Produktdetail-Befund. CSS-Ladereihenfolge und bisherige kritische Layoutregeln bleiben unverändert. Details und begrenzte Folgevorschläge stehen im [Prüfbericht](.cache/fixes-20261111/Pruefbericht.html).

Die lokale Suchprüfung besteht in **80/80** Kombinationen aus vier Quellen/vier Min-Dateien, fünf Sprachen und zwei Breiten; PHP-/IO-Verträge **638 Prüfungen**, Bootstrap **10 Prüfungen**. Galerie mit lokal ersetztem Artikel-Bundle und echten Preview-Daten: **20/20 Szenarien, insgesamt 1.000 schnelle Wechsel**, mit unveränderten Preis-/Bestands-/Größendaten; abschließende Zoom-Kontrollen einschließlich Schließen und Browserhistorie **10/10 PASS**. Zusätzlich **400 lokale Wechsel** einschließlich verspäteter Antworten und entfernter Matrizen. Quickview mit lokalem Kategorie-Bundle: **200 Öffnungen** sowie **500 schnelle Farbwechsel in 10/10 Szenarien**, je ein globaler Dropdown-Handler, Größenwahl, Nachladen und Browserhistorie bestanden. Die ausgelieferte Quickview enthält nur die Variantentabelle, keine Galerie; eine nicht vorhandene Quickview-Zoomfunktion wird nicht als bestanden gezählt.

Twig 2.16.1 und 3.30.0: je **548/548 SEO-Fälle**, **171/171 Templates**, **38/38 Vergleichsfälle**, **60/60 Layoutfälle** und **36/36 Attribut-Rendervergleiche**. Kategorie-Min-Bundle: **107 JavaScript-Fälle und 11 Chrome-Fälle**. PHP-Lint/JS-Syntax: **21/21 Dateien**. Alle vier Min-Dateien reproduzierbar aus den geänderten Funktionsbereichen erzeugt; Bytes außerhalb dieser Bereiche erhalten. Vorhandene Twig-/PHP-Deprecations und korrigierte Teststeuerungsabbrüche sind im Prüfbericht eingeordnet. Keine Behauptung einer vollständig ausgeführten Gesamtsuite.

Geändert: Route, `initLiveSearch` und Galerie-/Variantenfunktionen in `cat/item/main/vue.js`, die vier `-020726.min.js`, Cache-Kennungen in `PageDesign.twig`, gezielte Regressionen sowie README/Changelogs. Reproduzierbarer begrenzter Bundle-Bau: `.cache/fixes-20261111/build.cjs`; der historische vollständige JS-Build ist weiterhin nicht rekonstruierbar.

**Offene native Abnahme:** Nach einer separat veranlassten Bereitstellung in 426 den neuen GET-Pfad mit allen sieben Begriffen in IT/ES prüfen, EN-Treffer gegen lokalisierte Links/Kundenkontexte vergleichen und die Galerie ohne Browserersetzung wiederholen. Angemeldete Kundenpreise, echte Warenkorbtransaktionen und Produktions-Performance sind nicht abgenommen. Kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge; B2C unverändert.

## Live-Abnahme nach Bootstrap-Hotfix (develop c23543f, 2026-11-10)

**Produktionsbereit: NEIN.** Reine Live-Abnahme des bereitgestellten Test-Pluginsets 426 mit Preview-Nachweis und Hashvergleich der geladenen B2B-CSS-/JS-Dateien gegen `develop`. Der Bootstrap-Hotfix wirkt; B2B-Templates werden wieder ausgeliefert. Kein Shop-HTTP-500 in den geprüften Antworten.

- **Navigation/SEO:** 651 Headerziele in fünf Sprachen auch im Browser geprüft; 2.709 zusätzliche Sortier-, Filter-, Seiten- und Produktantworten mit HTTP 200. 117 gezielte Fälle bestätigen Server-/DOM-Metadaten einschließlich Marken-Parameterseiten und Listenenden. Leere Basiskategorien bleiben indexierbar.
- **Normale IT/ES-Suche funktioniert:** Trefferlisten und Facetten verwenden den EN-Index; Enter, Lupe, Filter, Seitennavigation und lokalisierte Produktlinks bestanden. **Livesuche FAIL:** Für `adidas`, `nike`, `shoes`, `9885396` und `0002` bleibt die Vorschlags-API leer. Die doppelte IO-/Theme-Route ist verdächtig, ohne native Routenauflösung aber nicht als interne Ursache bewiesen. Pfeilauswahl eines lokalisierten Produktnamens aus der ID-Suche führt außerdem zu einer erfolglosen Textsuche im EN-Index.
- **Quickview/Karten:** 200 Öffnungen; bei 1/5/10/20 Öffnungen jeweils ein globaler Handler und eine Ausführung pro Außenklick. 80 Größen-Kartenvergleiche und 30 Vergleiche ohne Größen stimmen mit der nativen Attribut-API überein. Interne Serviceanzahlen und Batching-Beschleunigung bleiben **NOT_TESTED**.
- **Weiterer Variantenfehler:** Zwei direkt aufeinanderfolgende Farbwechsel können zur JPG-Datei navigieren. Nachgewiesener Auslöser ist der synthetische Galerie-Klick in `resources/js/item.js:3817`. Einzelklicks und die gezielten Wiederholungen mit 100/500 ms zusätzlichem Abstand bestanden. Der betreffende Code ist gegenüber dem Stand vor den letzten drei Änderungen unverändert.

- **Layout/Restbefunde:** 340 Messungen mit aktivem CSS und ohne defekte sichtbare Bilder. Marken-Desktop frisch: CLS-Median 0,0164. Produktdetails frisch: Desktop-Median 0,2203 einschließlich Preview-Overlay; kein isolierter Produktionswert. Filmstreifen zeigen noch Übergänge beim Erstzeichnen. Zeitweise `Failed to fetch`-Exceptions blieben in der gezielten Gegenprobe ohne Reproduktion; kein pauschales JavaScript-Fehlerfrei-PASS. Italienische Weiß-/Schwarz-Bezeichnungen sind bereits in der nativen Attribut-API vertauscht, nicht erst durch das Batching.

Die vollständige CLS-Messreihe, Screenshots, konkrete Korrekturvorschläge, bestehende Preis-/Metadatenbefunde und offene Abnahmepunkte stehen im [Live-Bericht](.cache/acceptance-c23543f/Abnahme.html); [alle Kategorien](.cache/acceptance-c23543f/URL-Matrix.html) sind einzeln dokumentiert. Langsame Preview-Antworten ohne ShopBooster-Beschleunigung sind laut Nutzerrückmeldung kein Produktions-Performancefehler. Produktions-Ladezeiten, explizite Robots-Sperren und angemeldete Kundenkontexte sind nicht abgenommen. Ältere Abschnitte darunter bleiben historische Nachweise.

Nur Dokumentation geändert. Kein Commit, Push, Deployment, Plugin-Sync oder Cache-Purge; Shopcode und B2C unverändert. Startseiten, Warenkorb und Checkout bleiben außerhalb der Abnahme.

## Markenlayout, Kartenattribute und Suchsprache (develop, 2026-11-10)

Die Desktop-Markenübersicht reserviert vor dem ersten Zeichnen die endgültigen Spaltenbreiten, Kachelhöhen und den Platz für das Alphabet. Auf Kategorien, Such- und Produktseiten sowie Content mit paginierter Hauptliste kennt der Browser auch die endgültige Desktop-Höhe des Headerlogos. Die erste Reihe von bis zu vier Markenlogos verwendet direkte Bildquellen. Das Hauptstylesheet behält seinen bisherigen Ladeweg. Bei Änderungen an den Logo- oder Rastermaßen in `main.css` sind die entsprechenden kritischen Desktopregeln in `Head.twig` mitzuprüfen.

Kategorie, Suche und die beiden eingebetteten Artikellisten holen die vorhandenen `VariationAttributeMap`-Ergebnisse mit `ItemSearchService::getResults` in Gruppen von bis zu 24 eindeutigen Artikel-IDs. Die 24 begrenzt ausschließlich die Zahl gleichzeitig abgefragter Attributmaps. Die Seitengröße stammt weiterhin aus dem bestehenden Listenaufruf. Die Zuordnung gilt für genau eine gerenderte Liste. Bei 12, 24 und 48 unterschiedlichen Karten ergeben sich 1, 1 und 2 Attribut-Serviceaufrufe. Einzelne Karteneinbindungen außerhalb dieser Listen behalten ihren Einzelabruf. Für einen lokalen Vergleich auf Twig 2 oder 3 dient `php tests/card_attributes.php <Twig-Autoloader> <Berichtsdatei.json>`.

In Test-Pluginset 426 sind IO und plentyShop LTS jeweils in Version 5.0.86 bereitgestellt. Am 10.11.2026 lieferten Ergebnisliste und Facetten für `adidas` in EN jeweils 31 Treffer, in IT und ES jeweils 0. Über die interne ID `2351296` war derselbe Artikel in allen fünf Sprachen unter seiner lokalen URL und mit dem jeweiligen Preis erreichbar.

### Englischer Textindex für IT und ES (lokal auf develop)

Nur die Shopsprachen `it` und `es` wählen über `IO.ctx.search` den B2B-Suchkontext. Das Theme erzeugt für Artikel die native Factory `SearchItems` mit leerer Textabfrage, für Facetten die native Factory `Facets` ohne Textabfrage. Vor der gemeinsamen Ausführung setzt der Dienst `EnglishTextSearch` an beiden `hasSearchString($query, 'en', $operator)`. Die Webshop-Presets bestimmen weiterhin Mandant, Sichtbarkeit, Kundenpreise, Ausgabesprache, Ergebnisfelder und Gruppierung. Gewählte Facetten und Preisgrenzen gelten für beide Ergebnisse. Die Facettenroute verwendet denselben Dienst. Infinite Scroll lädt dieselbe sprachlokale Suchseite mit der nächsten Seitennummer.

Die vorhandene GET-Route `io/item/search/autocomplete` wird im B2B-Routenprovider mit `SearchAutocompleteResource@index` registriert. Die Resource delegiert DE, EN und FR an die originale IO-Resource. Für IT und ES löst sie den erweiterten Vorschlagsdienst über `pluginApp` auf. Produkte erhalten den englischen Textfilter. Eine separate Factory aggregiert englische Textvervollständigungen mit `withSuggestions($query, 'en')` über das für den Besucher sichtbare Sortiment. Beide laufen gemeinsam in einem `getResults`-Aufruf. So kann ein Präfix auch ohne direkte Produkttreffer Vorschläge liefern. IO formatiert weiterhin lokalisierte Labels, Produkt- und Kategorie-URLs. Ein abweichender nativer Rechtschreibvorschlag kann wie bei Ceres nach null Treffern eine korrigierte Suche auslösen. Die Korrektursuche verwendet wieder den englischen Textfilter. Plenty veröffentlicht für die Erzeugung des Rechtschreibvorschlags selbst keinen Sprachparameter.

Am 10.11.2026 nach Bereitstellung von `720b725` meldete `BootPlugins` für Pluginset 426 `class IO\Services\ItemSearchAutocompleteService not found`. Die globale `Application::bind`-Anweisung im Theme-Provider löste den Plugin-Klassennamen im nativen Container auf und brach die Registrierung vor den Theme-Overrides ab. Der Server lieferte dadurch das Ceres-Layout und dessen Assets. Die Theme-CSS-Datei war per CDN mit HTTP 200 verfügbar und bytegleich zu develop. Lokal ersetzt die GET-Resource diese Bindung. `php tests/theme_bootstrap.php` prüft den Start ohne nativ verfügbare Plugin-Serviceklasse und die Registrierung von Head, Header, Seitenlayout sowie API-Routen. `tests/search_index.php` prüft den neuen Vorschlags-Einstieg mit dem echten IO-Formatter. Die native Pluginset-Abnahme des reparierten Bootpfads steht aus. [Regressionsnachweis und erneute Testbereitstellung](.cache/layout-regression/Pruefbericht.md)

Der Hook `Ceres.Search.Query` reicht in 5.0.86 für diesen Shop nicht aus. Bei externen Dokumenten setzt Ceres die Facettenliste leer. Bei externen Variations-IDs benötigt Ceres zusätzlich eine `VariationList`-Abfrage. [Ceres 5.0.86](https://github.com/plentymarkets/plugin-ceres/blob/ad08dd0f7b3a3cc6af3b4fc03f491287df47213b/src/Contexts/ItemListContext.php#L99) · [PlentyONE-Webshop-Schnittstelle](https://developers.plentymarkets.com/en-gb/interface/stable7/Webshop.html)

Der lokale Integrationstest läuft mit `php tests/search_index.php <Ceres-5.0.86-Verzeichnis> <IO-5.0.86-Verzeichnis> [Browser-Fixture.json]`. Er verwendet die echten IO-Aufrufer und den Vorschlagsformatter mit aufzeichnenden nativen Factory-Doubles. Die optionale Datei kann über `O46_SEARCH_CAPTURE` an `tests/search_interactions.cjs` übergeben werden. Für die Abnahme in 426 nach Betreiber-Bereitstellung zuerst `9885396` gegen die sprachlokale ID-Suche `2351296` vergleichen, dann Marken, Preisgrenzen, zwei kombinierte Filter, Seite 2, Sortierung und Vorschläge einschließlich `0002` mit anonymem und angemeldetem B2B-Kunden prüfen. Ein aktives `-search2`-Bundle identifiziert nur den unveränderten Frontendstand. Der native PHP-Build und das Laufzeitverhalten des neuen Adapters stehen zur Abnahme aus.

Die beiden lokalen Korrekturen benötigen nach Bereitstellung eine Gegenprüfung in Pluginset 426. Dort stehen insbesondere das vom Shop gelieferte HTML, die Laufzeit der Attributabfragen und der native Pluginbuild aus. [Prüfbericht mit Messreihen](.cache/points567/Pruefbericht.md)

## Suchvorschläge und numerische Suchfilter (develop, 2026-11-10)

**FIXED_LOCALLY.** Nach einer Pfeilauswahl setzte der Enter-Handler die Adresse auf `/search/?query=…`. Jetzt sendet der Browser das Formular des aktiven Suchfelds ab, wie beim Suchbutton. Textvorschläge verwenden dieselbe Formularaktion; Produktlinks kommen weiterhin aus der Suchantwort. Auch das zweite Suchfeld im 404-Template verwendet die vorhandene PlentyONE-Route `urls.search`.

Bei der Facettierung wandelte jQuery `data-eg-searchstring="2351296"` in eine Zahl um. Die Facettenantwort war gültig, aber `.trim()` brach vor dem Setzen der Zieladresse ab. Das Kategorie-Bundle liest das HTML-Attribut jetzt als Text. Führende Nullen bleiben erhalten; fehlt das Attribut, wird ein leerer Text verwendet. Ohne Zieladresse nach einem fehlgeschlagenen Request bleibt der Button gesperrt. Suchindex, Facettenabfrage, Produktzählung und SEO-Regeln wurden nicht geändert.

- **Browser:** `node tests/search_interactions.cjs` prüft die Suchhandler aller vier JS-Quellen und aller vier aktiven Min-Dateien in DE/EN/FR/IT/ES bei 1440 und 390 px. Der vollständige Such- und Facettenablauf läuft mit dem minifizierten Kategorie-Bundle, einschließlich Maus, Touch, Historie, zwei Suchformularen, leeren Antworten und Filter-Reset. Benötigt Acorn, Playwright und Chromium; dieselben Browser-Umgebungsvariablen wie beim Quickview-Test. Optional: `O46_SEARCH_CAPTURE` für aufgezeichnete Trefferzahlen und ein Ausgabepfad als erstes Argument.
- **Nachweise:** [Suchtests](.cache/search-fix/browser.json), [Browserläufe mit vollständigem Bundle und aufgezeichneten Shopseiten](.cache/search-fix/replay-results.json), [unveränderte Such- und API-Antworten aus 426](.cache/search-fix/live-baseline.json). Der gefilterte Artikel `2351296` war in allen fünf Sprachen sowohl in der Facettenantwort als auch auf der Zielseite genau einmal vorhanden. Im lokalen Browservergleich wurden außerdem Sortierung, Kategorie-Seite 2 mit Canonical/Titel, Infinite Scroll, Quickview und Produktdetail geprüft.
- **Live-Abnahme von `-search1`:** Pluginset 426 lieferte die korrigierten Such- und Filterwege in allen fünf Sprachen aus. Bei `9885396` brach der Vorschlagsrenderer in DE/EN/FR dennoch ab. Die API lieferte das erste Textlabel als JSON-Zahl, auf der der Renderer `.match()` und anschließend `.replace()` aufrief. [Prüfbericht](.cache/abnahme-search1/Pruefbericht.md)
- **Lokale Korrektur für `-search2`:** Der Renderer liest Produkt- und Textlabels vor der Formatierung als Text. Ein als String geliefertes `009885396` behält seine Nullen. Leere und fehlende Labels belegen keinen Vorschlagsplatz. Der erste wörtliche Treffer wird unabhängig von der Großschreibung hervorgehoben. API-Text wird über DOM-Textknoten und Attribute ausgegeben. Die Browserregression in `tests/search_interactions.cjs` prüft diese Fälle an Quellen und Min-Dateien.
- [Lokaler Vorher-nachher-Vergleich mit 426-Daten](.cache/search-label2/bundle-case.json): Das vollständige Kategorie-Bundle stellte für `9885396` in DE/EN/FR auf Desktop und Mobil jeweils fünf Textvorschläge und einen Produktlink dar. Zuvor brach der Renderer in allen sechs Fällen vor der ersten Zeile ab. Die aufgezeichneten IT-/ES-Antworten enthielten keine Vorschläge. [Filter, Sortierung, Seite 2, Infinite Scroll und Quickview](.cache/search-label2/replay-results.json) bestanden auch mit den aktualisierten Bundles.
- **Live-Abnahme von `-search2` ausstehend:** Nach Bereitstellung in 426 den Cache-Schlüssel und die geladenen Bundles prüfen. `9885396` muss in DE/EN/FR den Artikel und die ersten fünf Textvorschläge einschließlich des numerischen Labels anzeigen. In allen fünf Sprachen Pfeilauswahl, Maus/Touch und den Filter für `2351296` erneut testen. Die lokale Mobilprüfung verwendet Chrome-Touch-Emulation. Für IT/ES gilt die bekannte Suchindex-Einschränkung.

## Quickview und Marken A–Z: lokaler Fix auf develop (2026-11-10)

**FIXED_LOCALLY** für diese beiden Befunde. In Pluginset 426 wurde der bisherige Stand gelesen; die folgenden Browserprüfungen des Fixes ersetzen das Kategorie-JavaScript nur für den jeweiligen lokalen Browser. Es gab kein Deployment. Die übrigen Befunde der nachstehenden Theme-Abnahme sind unverändert.

- **Quickview:** `bindEvents` bindet die Bedienelemente neu, wenn Quickview den Modalinhalt ersetzt. Dabei wurde zuvor pro Aufruf ein weiterer anonymer `mouseup`-Handler an `document` gehängt. Nach fünf Öffnungen im unveränderten 426 liefen sechs identische Handler für einen Außenklick. Die Registrierung steht jetzt einmal neben dem delegierten Quickview-Öffner; andere Listener werden nicht entfernt. In den vier aktiven Min-Dateien ist nur dieser bereits vorhandene Aufruf verschoben. Die Twig-Einbindung hängt `-qv1` an die bisherigen Cache-Schlüssel an. Kein Speicherleck nachgewiesen.
- **Marken A–Z:** Die Artikelkategorie rendert für das Verzeichnis `CategoryItemBrands.twig`: übersetzte Unterkategorien, alphabetisch gruppiert, ohne Artikelgitter und ohne eigenen Pager. Bisher meldete der übergeordnete Seitentyp trotzdem die Seitenzahl der Artikelkategorie. Dieselbe Entscheidung, die das Verzeichnis im Body auswählt, schaltet nun vor dem Head die native Kategorie-Paginierung für diesen Renderdurchlauf ab. Artikelabfragen, ShopBuilder-Listen, Zählung und explizite Robots-Vorgaben bleiben unverändert.

| Sprache | Tatsächlicher Markenpfad aus hreflang | Unterschiedliche Markenlinks pro Abruf |
|---|---|---:|
| DE | `/marken-online-outlet/` | 303 |
| EN | `/en/branded-online-outlet/` | 303 |
| FR | `/fr/marques/` | 186 |
| IT | `/it/marca/` | 186 |
| ES | `/es/marcas/` | 186 |

Im bisherigen 426-Stand lieferten Basis, `page=1/2/99/abc/0` pro Sprache HTTP 200 und dieselben Markenlinks. **FAIL (vor Fix):** Alle zehn Abrufe von Seite 2/99 waren indexierbar und hatten einen eigenen Canonical und einen Seitenzusatz. **PASS (lokales Server-HTML):** Basis und Seite 1 behalten Robots; Folge- und ungültige Seiten erhalten mindestens `NOINDEX`. Canonical, Titel und Beschreibung entsprechen der Basis. 180 Markenfälle je Twig-Version prüfen den tatsächlichen Verzeichnis- und Head-Render, einschließlich vier Robots-Konfigurationen, leerem Wert und Array-Parameter.

**Regressionsbelege:**

- [30/30 lokale Wiederholungen mit den echten 426-Metadaten](.cache/qv-brands/brand-replay.json): Die gerenderten Titel und Beschreibungen waren für alle sechs URLs je Sprache identisch zur jeweiligen Basis. Die [unveränderten HTTP-Antworten](.cache/qv-brands/brands-426.json) sind getrennt protokolliert.
- Twig 2.16.1 und 3.30.0: jeweils 548 SEO-Fälle, davon 190 im Vergleich mit der Referenz; 171/171 Templates syntaktisch geprüft, 38/38 Twig-Vergleichsfälle, 60/60 Widget-Layoutfälle. Widget im Browser: 55 Szenarien, 1.332 Assertions. SEO-JavaScript: Quelle und aktive Min-Datei jeweils 118 Fälle plus 22 Chrome-Fälle.
- `node tests/quickview_dropdown.cjs`: je 20 Öffnungen mit allen vier Quellen und vier aktiven Min-Dateien, einschließlich nicht betroffener Dokument-Handler, Innen-/Außenklick und Facetten. Für die Chrome-Tests gelten dieselben optionalen Umgebungsvariablen wie bei `tests/seo_metadata.cjs`: `O46_PLAYWRIGHT_MODULE` und `O46_BROWSER_EXECUTABLE`.
- Vorschau-HTML und echte Produktdaten mit lokalem Kategorie-Bundle: DE/EN/FR/IT/ES, je 1440 und 390 px. Nach 1, 5, 10 und 20 Quickviews jeweils genau eine Registrierung und eine Ausführung pro Außenklick. Geprüft wurden derselbe und verschiedene Artikel, zwei Größen/Varianten, Schließen, Dropdowns, Filterwechsel, Nachladen (24 → 48 Artikel) und Sortierung einschließlich Zurück/Vorwärts. In sechs ersten Durchläufen lief der Sortierklick nach der Filternavigation in einen Timeout. Nach Warten auf die tatsächliche Eventbindung bestanden alle sechs kompletten Wiederholungen. [Quickview-Messungen](.cache/qv-brands/quickview-results.json), [Sortierung und Historie](.cache/qv-brands/sorting.json). Auf [5/5 Produktdetailseiten](.cache/qv-brands/details.json) bestand zusätzlich die Variantenauswahl mit dem lokalen Artikel-Bundle.
- Unveränderte Vorschau 426: [26/26 frische Vergleichsabrufe](.cache/qv-brands/reg-426.json), darunter Herren, Damen, Alle Artikel, Alles unter X Euro, eine reguläre Kategorie und Produktdetailseiten in fünf Sprachen. Herren 56 hatte 13 Artikel und eigenen Canonical; Herren 57 war leer. Damen 53 hatte 22 Artikel; 54 und 55 waren diesmal leer. Gefüllte Folgeseiten behielten `INDEX,FOLLOW`, leere Folgeseiten `NOINDEX,FOLLOW` und den Basis-Canonical.

**NOT_TESTED:** PlentyONE-Build und unveränderte HTTP-/Browser-Auslieferung der beiden Korrekturen. Nach Bereitstellung in 426: neue Sitzung öffnen, Cache-Schlüssel und Inhalt des geladenen Min-Bundles ohne Browserersetzung prüfen, Quickviews wiederholen und die sechs Marken-URLs je Sprache im rohen Server-HTML kalt/warm vergleichen. Ohne reale Kategorie mit expliziter Robots-Sperre ist deren Live-Abnahme offen; die lokale Prüfung ersetzt sie nicht.

## Fünfsprachige Theme-Abnahme in Pluginset 426 (2026-11-10)

**Produktionsbereit: NEIN.** Die erweiterte Prüfung des gesamten Themes offenbart Fehler außerhalb der zuvor geprüften SEO-Randseiten:

- Der deutsche Menülink „Alles unter 25 Euro!“ liefert HTTP 404. Die fremdsprachigen Menüs enthalten diesen Eintrag nicht.
- Die verlinkten Warenkörbe EN, FR, IT und ES liefern HTTP 200, aber im Server-HTML weder die Warenkorbliste noch das Summen-Widget. Nach dem erfolgreichen Hinzufügen eines Testartikels blieb die Liste dort auch im Browser aus. Der deutsche Warenkorb bestand Hinzufügen, Erhöhen von 1 auf 2 mit anschließendem Neuladen und Entfernen. Keine Bestellung ausgelöst.
- Die englische Startseite zeigt Ceres-Demoinhalte. In FR, IT und ES bleibt der Hauptbereich der Startseite leer; Header und Footer allein bilden keine vollständige Startseite. Die Markensuche nach „adidas“ und „nike“ liefert in IT und ES keine Treffer, in DE, EN und FR hingegen Treffer.
- Marken A–Z zeigt pro Sprache auf der Basis-URL, Seite 2 und Seite 99 dieselbe Liste von Markenlinks. Die Parameterseiten liefern einen eigenen Canonical und sind indexierbar, obwohl kein paginiertes Produktgitter vorhanden ist.

Die Navigation wurde pro Sprach-Header ermittelt: DE 131 unterschiedliche URLs, EN/FR/IT/ES jeweils 130. Die Transaktions- und SEO-Befunde stammen aus der ausdrücklich verifizierten Vorschau. Die lokalen Ergebnisdateien enthalten [Bericht](.cache/theme426/Abnahme.html), [URL-Matrix](.cache/theme426/URL-Matrix.html) und [Menüinventar](.cache/theme426/Header.html). Das bereitgestellte Kategorie-Bundle war identisch mit dem lokalen `cat-020726.min.js` mit Kennung `-nl1-seo2`. Nur Abnahmedokumentation, keine Änderung am Shop.

Der [technische Bericht](.cache/theme426/technik/Technikbericht.html) enthält 180 wiederholte Browsermessungen in fünf Sprachen und priorisiert die einzelnen Befunde. Alle acht beobachteten Theme-JS-/CSS-Dateien, einschließlich des Warenkorbbundles, stimmen byteweise mit dem lokalen Stand überein. Beim Öffnen der Quickview registriert das ausgelieferte Kategorie-Bundle jedes Mal denselben globalen Dropdown-Handler erneut. Das ist reproduziert; ein dauerhaftes Speicherleck ist nicht nachgewiesen.

Die eigenen SEO-Metadaten der Listenenden blieben beim Bestandswechsel korrekt. Beispiel Herren: Seite 56 war zuerst leer und `NOINDEX,FOLLOW`; in zwei späteren frischen Sitzungen enthielt sie bei 1.314 gemeldeten Treffern jeweils einen Artikel, `INDEX,FOLLOW`, ihren eigenen Canonical und „Seite 56“. Damen 53 lieferte bei 1.266 gemeldeten Treffern 23 statt rechnerisch 18 Artikel. Diese Differenzen sind innerhalb derselben Serverantwort belegt. Ohne Suchtrace ist ihre interne Ursache weiterhin offen.

## Früherer Gegencheck der SEO-Randseiten in Pluginset 426 (2026-11-10)

**PASS für den damaligen Prüfumfang** (SEO-Randseiten und ausgewählte Funktionen). Für die Gesamtfreigabe gilt die fünfsprachige Theme-Abnahme oben. PlentyONE zeigte für Pluginset 426 „Erfolgreich bereitgestellt“, das aktive Theme `eGuardiansBasic B2B`, Branch `refs/heads/develop` und Version 1.0.7. Das in Content- und Kategorieseiten eingebundene `cat-020726.min.js` hatte die Kennung `95dd009be2a11c7bbaf2bf5d2d08ae5f7e69226e-nl1-seo2`. Alle 266.977 Bytes entsprachen der Datei auf `develop` bei `ac79e60` (SHA-256 `f915663f5a777b14f441867a970440f62ebccdcf9ea236189614e13ddde44aae`). Der Backend-Dialog zeigte keinen Git-Commit-Hash an. Die serverseitigen Änderungen waren am korrigierten Listenende und an der wirksamen Sortierauswahl nachweisbar.

| Direktaufruf | Artikel beim ersten / wiederholten / frischen Abruf | Robots | Canonical und Seitenzusatz im Server-HTML |
| --- | ---: | --- | --- |
| Herren 55 | 24 / 24 / 24 | INDEX,FOLLOW | `/herren/?page=55`, „Seite 55“, mit sichtbarem Weiter-Link zu 56 |
| Herren 56 | 3 / 1 / 1 | INDEX,FOLLOW | `/herren/?page=56`, „Seite 56“ |
| Herren 57 | 0 / 0 / 0 | NOINDEX,FOLLOW | `/herren/`, ohne Seitenzusatz |
| Damen 53 | 23 / 23 / 23 | INDEX,FOLLOW | `/damen/?page=53`, „Seite 53“ |
| Damen 54 | 0 / 0 / 0 | NOINDEX,FOLLOW | `/damen/`, ohne Seitenzusatz |
| Damen 55 | 0 / 0 / 0 | NOINDEX,FOLLOW | `/damen/`, ohne Seitenzusatz |

- **PASS, Server-HTML.** 49 bestätigte Preview-Antworten (48 HTTP 200, eine erwartete HTTP 404), 584/584 Prüfungen. Der alte Vorschau-Link lieferte für zwei Einstiegsversuche eine als `production` markierte Antwort. Beide wurden verworfen. Für die HTTP-Matrix wurde im Backend die B2B-Vorschau von 426 neu geöffnet und jede Antwort anhand von Stage und ausgewähltem Pluginset geprüft. Die Matrix enthält reguläre Jeans/Hosen, alle vier Content-Listen, Newsletter ohne Liste, leere Damendüfte sowie echte Filter- und Sortiersperren. Damendüfte blieb auf Basis-URL und bei `page=1` indexierbar. Gültige Seiten 2 und ungültige Seiten 999 erhielten die erwarteten Canonicals und Robots-Vorgaben. Titel und Beschreibung der Damen-Seite 2 stimmten in DE/EN/FR/IT/ES im HTML und nach JavaScript.
- **PASS, Shopfunktionen.** Der sichtbare Link 55 → 56 öffnete Herren 56 mit eigenem Canonical. Infinite Scroll 55 → 56 lud 24 + 3 unterschiedliche Herren-Artikel, bei Damen 52 → 53 waren es 24 + 23 unterschiedliche Artikel. URL, Titel und Beschreibung wechselten auf die erreichte Seite. „Neuheiten“, „Niedrigster Preis“ und „Höchster Preis“ entsprachen der aktiven Sortierung auf Damen-Seite 1 und 2 und blieben bei Zurück/Vorwärts erhalten. Beide Preisrichtungen wurden an den 24 angezeigten Preisen je Seite geprüft. Bei zeitgleichen Preiswerten können sich die Artikel zwischen Abrufen ändern. Die blaue Farbfacette ergab mobil bei 390 × 844 Pixeln 93 Treffer mit eigenen und vorgegebenen Facetten. Die Quickview zeigte Größen, Bestand und Preise bei Stückzahl 0 und ließ sich schließen. Zwei temporäre Zeitüberschreitungen bei der Browsersteuerung wurden durch Ablesen des tatsächlich geladenen Zielzustands aufgeklärt.
- **PASS, Regressionen.** Das aus 426 heruntergeladene Bundle bestand 118/118 Metadatenfälle und 22/22 Chrome-Fälle. Die ergänzenden lokalen PHP-Regressionen bestanden unter Twig 2.16.1 und 3.30.0 mit jeweils 368/368 Fällen und 190/190 Vergleichen, einschließlich expliziter Robots-Vorgaben und der einmaligen Abfrage pro Listenaufruf.
- **Cache und Laufzeit.** Die sechs Randseiten wurden erst aufsteigend, danach in umgekehrter Reihenfolge und schließlich mit einer neuen Sitzung abgerufen. Robots, Canonical, Titel, Beschreibung und Weiter-Links blieben stabil. Die HTTP-Zeit im Median lag bei 1,18 / 1,16 / 1,17 s. Für 30 mit der vorherigen Messung vergleichbare URLs lagen die Mediane bei 1,34 s zuvor und 1,30 s jetzt. Die 48 HTTP-200-Antworten meldeten `Miss from cloudfront` und `no-store, private`. Der interne ShopBooster-Zustand (kalt/warm) und Backend-Abfragezahlen sind ohne Server-Trace **NOT_TESTED**.
- **Verbleibende Einschränkungen.** Beim reinen Scrollen bleibt der DOM-Canonical auf der Einstiegsseite der zusammengefügten Liste (Herren 55 bzw. Damen 52). Der direkte Aufruf der Folge-URL und die Navigation per Seitenlink liefern den eigenen Canonical. Für diese Freigabe wird dieses Verhalten als begrenzte Client-Abweichung gewertet. Die bekannte Ausverkauft-Metadatenübernahme bei echtem HTTP 404 ist **ACCEPTED LIMITATION**. Dass ein zusätzlicher Weiter-Link bei zwischenzeitlich geändertem Bestand auf eine leere Seite führen kann, bleibt ebenfalls akzeptiert. Die interne Ursache der schwankenden Trefferzahl ist offen. Eine ausdrücklich auf `NOINDEX`/`NOFOLLOW` konfigurierte Kategorie war live **NOT_TESTED**.

Nur der Abnahmebericht wurde im Repository aktualisiert. Der Gegencheck hat keine Bereitstellung, Synchronisierung oder Cache-Invalidierung ausgelöst.

## Frühere SEO-Abnahme vor Bereitstellung des Randseiten-Fixes (2026-11-10)

**Freigabe für Produktion: FAIL.** Die bereitgestellte Preview schließt eine mit Artikeln gefüllte Herren-Seite von der Indexierung aus. Die lokale Korrektur auf `develop` ist für einen erneuten Test in 426 vorbereitet. Referenz vor der Korrektur ist `72a0eed`. In der Preview wurden Stage `preview`, Pluginset `426`, Asset-Kennung `dc92fec7feea1e22ec018794e81b13525eb561bc` und das Kategorie-Bundle mit `-nl1-seo1` überprüft.

### A. Nachgewiesenes Verhalten

- **PASS** für die funktionierenden Fälle der HTTP-Matrix. 95 HTML-Antworten, davon 93 mit HTTP 200 und zwei erwartete HTTP 404. Keine HTTP 500 oder PHP-Fehlermarker. 982 von 995 Einzelprüfungen bestanden. Die 13 Abweichungen betreffen die Navigation auf Herren-Seite 55 sowie die Metadaten von Seite 56 in zwei Sitzungen.
- Alle vier Content-Listen wurden auf Basis-URL, Seite 1, 2, gemeldeter letzter Seite, den zwei Folgeseiten, 999, 0, −1, `abc` und leerem `page` geprüft. Die Werte in der Tabelle stammen jeweils aus der ersten Messserie und können sich mit dem Sortiment ändern.

| Content-Liste | Gemeldete Treffer / Seitengröße | Letzte gemeldete Seite | Artikel dort, rechnerisch / ausgegeben | Tatsächlich ausgegeben auf der Folgeseite |
| --- | ---: | ---: | ---: | ---: |
| Alle Artikel | 2.357 / 12 | 197 | 5 / 7 | 0 |
| Herren | 1.315 / 24 | 55 | 19 / 24 | **3** |
| Damen | 1.263 / 24 | 53 | 15 / 20 | 0 |
| Alles unter X Euro | 2.334 / 12 | 195 | 6 / 9 | 0 |

- Ein zusätzlicher ID-Vergleich mit zehn HTTP-200-Abrufen bestätigte das Listenende. Herren-Seiten 53/54/55/56 lieferten 24/24/24/2 Artikel, insgesamt 74 unterschiedliche IDs. Damen-Seiten 51/52/53/54 lieferten 24/24/20/0 Artikel, insgesamt 68 unterschiedliche IDs. In beiden Fenstern gab es weder innerhalb einer Seite noch zwischen den Seiten Wiederholungen.
- Die gerenderten Filterkontexte verweisen auf Quellkategorie 60. Herren verwendet Facette 727, Damen 726. Eine zusätzliche Herren-Facette ergab 426 Treffer und der explizite Damen-Preisbereich 0–5 ergab 901. Der hinterlegte Standardpreisbereich der Preis-Landingpage ist im HTML nicht ablesbar. Titel, Beschreibung und Canonical verwenden die jeweilige Content-Seite.
- **PASS** für Jeans/Hosen (132 Treffer, 12 Artikel auf Seite 6, Seite 7 leer), Herrenuhren (12 Treffer, Seite 2 leer) und Damendüfte (0 Treffer). Damendüfte behält auf Basis-URL und `page=1` sein `INDEX,FOLLOW`; `page=2`, `999` und `abc` ergeben `NOINDEX,FOLLOW` mit Basis-Canonical. Der Newsletter ohne Liste bekommt auf künstlichen Folgeseiten keine Seitennummer. Die geprüfte Artikeldetailseite lieferte HTTP 200 und ihren eigenen Canonical.
- **PASS** für DE/EN/FR/IT/ES auf gültiger Damen- und Jeans-Seite 2 im Server-HTML. Auf Damen-Seite 2 blieben Titel und Beschreibung auch im Browser korrekt. Desktop-Seitenwechsel sowie Zurück/Vorwärts stellten URL und Artikelliste wieder her. Infinite Scroll lud 144 unterschiedliche Artikel bis Seite 6 mit passendem Titel und passender Beschreibung. Im mobilen Browser (390 × 844) funktionierten Farbfacette, Ergebnisübernahme und das Öffnen und Schließen der Quickview mit Varianten. Auf der letzten Seite meldete die Scroll-Bibliothek erwartungsgemäß den fehlenden Weiter-Link und deaktivierte das Nachladen.

### B. Reproduzierte Fehler im Test-Pluginset

- **FAIL** auf `/herren/?page=56`. Die Suche lieferte die Artikel-IDs `212272`, `212255` und `206824`. In einer neuen Sitzung blieben bei 1.314 gemeldeten Treffern zwei dieser Artikel. Beide Antworten lieferten `NOINDEX,FOLLOW`, Basis-Canonical, ungeblätterte Sprachlinks und keinen Seitenzusatz. Seite 55 bot keinen Weiter-Link an, Seite 57 und 999 waren leer. Die Theme-Ursache ist belegt: Bisher entschied allein die aus `itemList.total` berechnete Grenze über die Gültigkeit.
- **FAIL** für die Anzeige der gewählten Sortierung. „Niedrigster Preis“ änderte URL und Artikelreihenfolge korrekt, die Auswahlliste zeigte wieder „Neuheiten“. Das Theme übergab der Ansicht einen festen Sortierschlüssel.

### C. Lokale Korrekturen und Regressionen

- `getItemsFromCat()` verwendet die Dokumente derselben bereits ausgeführten Suchabfrage. Eine belegte angeforderte Seite erhält ihren eigenen Canonical und ihre Sprachzusätze. Eine nachweislich leere Folgeseite bleibt gesperrt, auch bei zu hoher gemeldeter Gesamtzahl. Eine volle Seite, die der Trefferzahl bereits widerspricht, bietet einen weiteren Navigationslink an. Das Ziel entscheidet beim Aufruf anhand seiner eigenen Artikel. Gesamtzahl, Suchoptionen und Facetten werden wie bisher aus der Liste übernommen. Die Sortierauswahl zeigt den validierten Sortierschlüssel.
- Das Kategorie-JavaScript erkennt zusätzlich eine Seite jenseits der anfänglichen Grenze, wenn Infinite Scroll auf derselben URL-/Filtervariante Artikel angehängt und die zugehörige Serverantwort genau diese Seite bestätigt hat. Twig bindet die neu erzeugte `cat-020726.min.js` mit `-nl1-seo2` ein. Der Bundle-Inhalt außerhalb der Metadatenfunktion blieb bytegleich.
- SHA-256 des aus 426 abgerufenen Bundles: `87a2445a2516f2bb6f2b1de6a22e7bba5e13b5973bc6d6ca394e80c0d01fe019`. Lokal zum Gegencheck: `f915663f5a777b14f441867a970440f62ebccdcf9ea236189614e13ddde44aae`.

| Lokale Prüfung | Ergebnis |
| --- | --- |
| SEO/PHP mit Twig 2.16.1 und 3.30.0 | **PASS**, je 368/368, darunter 31 Fälle für leere Kategorien. Je 190/190 Vergleiche mit bisherigem Verhalten. 26 bzw. 2 Deprecation-Hinweise |
| Twig-Syntax, Template-Regressionen und Kontakt-/Newsletter-Layouts | **PASS**, je Engine 171/171, 38/38 und 60/60. 24 bzw. 2 Twig-Deprecation-Hinweise |
| JavaScript-Quelle und neu erzeugtes Bundle | **PASS**, jeweils 118/118. Zusätzlich 22/22 lokale Chrome-Fälle am Bundle |
| Browser-Regression des Widgets | **PASS**, 55/55 mit 1.332 Assertions |
| PHP-Lint, JavaScript-Syntax und reproduzierbare Minifizierung | **PASS**, 12 PHP-Dateien, 3 JS-Dateien und bytegleicher erneuter Bundle-Bau |
| Tatsächlich ausgeliefertes Bundle aus 426 | Bisherige Tests **PASS**, 111/111 plus 22/22 Chrome. In der erweiterten Testsuite **117/118**: Die belegte nachgeladene Randseite erhält beim alten Bundle keinen Seitenzusatz |

Geänderte Dateien auf `develop`:

- Suchergebnis und SEO-Entscheidung in `src/Extensions/Base_Extension.php` und `src/Helper/SeoPage.php`.
- Browser-Metadaten und Asset-Einbindung in `resources/js/cat.js`, `resources/js/cat-020726.min.js` und `resources/views/PageDesign/PageDesign.twig`.
- Regressionen in `tests/seo_pagination.php`, `tests/seo_metadata.cjs` und `tests/contact_widget.php`.
- Dokumentation in `README.md`, `meta/documents/changelog_de.md` und `meta/documents/changelog_en.md`.

### D–G. Grenzen, akzeptierte Einschränkungen, Risiko und Freigabe

- **NOT_TESTED** im laufenden PlentyONE-System: interne Ursache der abweichenden Trefferzahl, Anzahl der Backend-Anfragen per Server-Trace, konkrete ShopBooster-Hits mit kaltem/warmem Cache und ausdrücklich restriktiv konfigurierte Kategorie. Die lokalen Regressionen prüfen ein ShopBuilder-Rendering, eine Artikelsuche je Funktionsaufruf sowie den Vorrang von `NOINDEX`, `NOFOLLOW` und `forceNoIndex`.
- Auf sechs wiederholten Seiten stimmten Metadaten, Paginierungszustand und Facetten überein. Fünf zeigten dieselben Artikel-IDs, bei Herren änderte sich auch die Trefferzahl. Für 67 identische URLs lag der Median der HTTP-Laufzeiten bei 1,74 s gegenüber 1,89 s im vorigen Preview-Test. Über die aktuelle Matrix lagen das 95. Perzentil bei 2,77 s und das Maximum bei 6,59 s. Es gab in diesen Messungen keinen Hinweis auf eine erhebliche Verlangsamung. Die Header belegen keinen internen ShopBooster-Treffer.
- **ACCEPTED LIMITATION** für beide echten HTTP-404-Antworten mit Ausverkauft-Metadaten. Ebenfalls akzeptiert ist ein einzelner zusätzlicher Navigationslink am widersprüchlichen Listenende, dessen Ziel leer sein kann. Die Ursache der Abweichung im Suchbackend bleibt offen.
- **FAIL** für die Produktivfreigabe des aktuell getesteten Stands. **NOT_TESTED** sind PlentyONE-Validierung, Build und Preview-Verhalten der neuen lokalen Korrektur. Vor einer Freigabe in 426 die dann tatsächlich gefüllte und die erste leere Randseite, Navigation/Scroll, Sortieranzeige und das neue Bundle gemeinsam gegenprüfen. Es erfolgte kein Commit, Push, Merge, Sync, Deployment, Cache-Eingriff oder Versionssprung.

## SEO-Korrektur Phase 1 – lokale Vorbereitung (2026-11-09)

**Lokal geprüft; Live-Teilprüfung im Test-Pluginset erfolgt, vollständige Freigabe offen.** Arbeitsstand auf
`develop`, Ausgangscommit `15d06d2d336717c500e680c5e850c4e3f1b90b09`.
Im ursprünglichen Phase-1-/PHP-Buildfix keine Versions-, Konfigurations-, Asset-,
Tracking- oder B2C-Änderung. Die später ausdrücklich beauftragte lokale
JavaScript-Korrektur steht unten separat. Kein eigener Commit, Push, Merge, Tag,
Release, Deploy, Pluginset-Sync oder Cache-Invalidieren.

Die Ursache lag in drei getrennten Stellen: `PageMetadata.twig` ersetzte bestehende
Robots-Vorgaben auf Folgeseiten pauschal durch `INDEX,FOLLOW`; `Head.twig` übernahm
`page` ohne belegte Artikelliste und setzte fehlendes `pageMax` auf 1;
`getItemsFromCat()` berechnete Seitendaten aus Rohwerten statt aus den validierten
Suchoptionen. Die Content-Liste wurde zudem erst nach dem Head abgefragt.

### Test-Pluginset: Live-Teilprüfung (2026-11-09)

Der Nutzer hat den Stand anschließend bereitgestellt und den Preview-Link
übergeben. Geprüft wurde **Pluginset 426**, sichtbar als
**„Outlet46de - B2B - v13.2- 120min“**, mit Ressourcen unter `guardiansbasicb2b`
und BuildHash `77714dd7359997fffcf0666df167f9254f4a8ea3`.
Lokaler Referenzstand: `e8a0f20` (`seo v2`); der Server-Commit und die
PlentyONE-Buildlogs wurden nicht unabhängig eingesehen.

**Ergebnis: PARTIAL – keine vollständige SEO-Abnahme.**
111 protokollierte lesende HTTP-Prüffälle: **108 × HTTP 200**, **3 × echte HTTP 404**,
keine Transportfehler und keine PHP-Fehlermarker in den Antworten.
Alle 111 Antworten enthielten `x-plenty-shop-stage: preview`, genau ein Robots-Tag
und genau einen nicht leeren Canonical. Kein Canonical enthielt den Preview-Token.
Ergänzend wurden Seiten im Browser vor/nach JavaScript geprüft.

Nach der Nutzerrückmeldung zum nicht verfügbaren expliziten Robots-Testfall wurden
43 fehlende Live-Fälle ergänzt. Alle 111 Antworten haben genau die fünf erwarteten
Hreflang-Sprachen DE/EN/FR/IT/ES und keine Preview-Parameter in den Sprachlinks.
Die Auswertung umfasst **336 Einzelprüfungen: 326 PASS, 10 FAIL**. Die zehn
fehlgeschlagenen Prüfungen erfassen die unten erläuterten vier Befundgruppen,
teilweise über Wiederholungen bzw. mehrere Seiten. Sie werden ausdrücklich nicht
durch sichere Fallbacks oder spätere erfolgreiche Wiederholungen grün gewertet.
Die Gesamtmatrix bleibt `PARTIAL`/`NOT_GRANTED`.

| Fall | Bestätigtes Verhalten |
| --- | --- |
| `/herren/`, `/damen/`, Seite 1/2/999 | Basis-Canonical auf Seite 1; `?page=2` auf gültiger Seite 2; Seite 999 `NOINDEX,FOLLOW` mit Basis-Canonical und ohne Artikel |
| Damen `page=0`, `-1`, `abc`, leer | HTTP 200 mit `NOINDEX,FOLLOW`, Basis-Canonical und sicherer erster Artikelseite |
| Reguläre Kategorie `/herren-bekleidung/jeans-hosen/` | 139 Treffer, 6 Seiten; Seite 2 korrekt, Seite 6 mit 19 Artikeln, Seite 7/999 leer und `NOINDEX`; `page=abc` sicher behandelt |
| Einseitige Kategorie `/accessoires-guenstig/herrenuhren/` | 14 Artikel; Seite 2/999 leer, `NOINDEX`, Basis-Canonical |
| Content ohne Liste `/content/newsletter/` | Normale Seite und `page=1` funktionieren; `page=2/999` ohne künstlichen Seiten-Canonical, `NOINDEX` |
| Damen mit zusätzlicher Facette 3118 (OneSize) | Gesamtzahl sinkt von 1.271 auf 507; vorgegebene Quellfacette 726 und Request-Facette 3118 sind beide ausgewählt; gültige Seite 2 behält `?page=2`, Robots bleibt wegen Filter `NOINDEX` |
| Bekannte leere Liste über Preisbereich | 0 Treffer/0 Artikel, `NOINDEX`, Basis-Canonical auf Seite 1 und 2 |
| Parameterregeln | `notsorting=x` bleibt `INDEX,FOLLOW`; echte Sortierung, Suche, Currency und Quickview erhalten `NOINDEX` |
| Produkt 2351365 | Produktseite funktioniert; künstliches `page=2` erhält Basis-Canonical und `NOINDEX` |
| Wiederholte Varianten | Damen ohne `page` und mit `page=1` haben dieselben Artikel-IDs; Wiederholungen nach Filter-/Sprachaufrufen reproduzieren Damen Seite 1 und Herren Seite 2 |
| DE/EN/FR/IT/ES | Sprachbezogene Metadaten und Listen vorhanden; Seite 2 in gestarteter Preview-Sitzung korrekt. Abweichende Erstabrufe siehe unten |

Zusätzlich abgeschlossen:

- Startseite mit `page=1/2/999`: Basis-Canonical, keine künstlichen Titelzusätze;
  Folgeseiten `NOINDEX`. Im Browser nach vollständigem Laden bestätigt.
- Herren und reguläre Artikelkategorie zusätzlich mit `page=1/0/-1/abc/leer`:
  gültige erste Seite bzw. `NOINDEX`-Fallback, kein PHP-Fehler.
- Reguläre Kategorie mit `items=12&page=2`: zwölf Artikel und zwölf Seiten bei
  139 Treffern. `items=0/abc` fallen auf 24 Artikel und sechs Seiten zurück.
  Die eingebettete Damen-Liste behält dagegen bei `items=12&page=2` ihre im
  ShopBuilder-Aufruf gesetzten 24 Artikel; der Request überschreibt diesen Wert nicht.
- Gefilterte Damen-Liste: Seite 22 liefert die letzten drei von 507 Treffern;
  Seite 23 ist leer. Beide bleiben wegen `facets` `NOINDEX`; nur die belegte
  Seite 22 erhält einen Seiten-Canonical.
- Bekannte leere reguläre Kategorie über Preisfilter: Seite 1/2 mit 0 Treffern,
  0 Artikeln, `NOINDEX` und Basis-Canonical. Kein Fehler bei der Seitenberechnung.
- Newsletter zusätzlich mit `page=0/-1/abc/leer`; EN/FR/IT/ES jeweils normale URL
  und `page=999`: Content bleibt erhalten, kein erfundener Seiten-Canonical.
  Newsletter `page=999` bleibt auch nach JavaScript ohne Titel-/Beschreibungszusatz.
- Produkt zusätzlich mit `page=1/999`: Basis-Canonical, künstliche Folgeseite
  `NOINDEX`; Titel und Beschreibung bleiben auch nach JavaScript korrekt.
- Leere `sorting`-/`query`-/`facets`-Werte und kleingeschriebenes `quickviewitem`
  lösen die bestehende harte Sperre aus. `sorting=x&currency=USD` als **Wert eines
  anderen Parameters** sowie `utm_source=sorting=x` lösen keine Teilstring-Sperre aus.
- Reguläre Kategorie `page=999` im Browser nach vollständigem Laden: Robots und
  Canonical korrekt, der unten beschriebene JavaScript-Titel-/Beschreibungseffekt
  tritt auch dort auf. Der bekannte Befund ist damit zusätzlich bestätigt.

**Offene Befunde:**

1. **Die gemeldete Gesamtzahl begründet noch keine zuverlässige letzte Seite.**
   Damen meldet durchgehend 1.271 Treffer und verlinkt maximal Seite 53 bei 24
   Artikeln pro Seite. Seite 53 enthält noch 24 Artikel; **Seite 54 liefert fünf
   weitere Artikel**, bekommt aber `NOINDEX` und den Basis-Canonical. Dies wurde
   mehrfach über HTTP und im Browser bestätigt; Seite 55 ist leer. Betroffene
   Artikel-IDs: `212496`, `212494`, `212492`, `212470`, `211575`.
   Die lokale Berechnung folgt dem erhaltenen `itemList.total`; die Abweichung
   liegt zwischen gemeldeter Gesamtzahl und tatsächlich paginiertem Ergebnis.
   Ob Aggregations-/Gruppierungssemantik, Zählgenauigkeit oder ein anderer
   Laufzeiteffekt die Ursache ist, ist **nicht nachgewiesen**. Die native
   `CategoryItems`-Implementierung ist im öffentlichen Plugin-Interface nur als
   abstrakte Schnittstelle verfügbar. Kleinster nächster Schritt: die **bestehende
   einzelne gefilterte Abfrage** mit ihren effektiven Optionen, Total und Dokumenten
   serverseitig profilieren und die Total-Semantik klären, bevor die Seitengrenze
   als verbindlich für SEO freigegeben wird.
2. **Vorhandenes Kategorie-JavaScript überschreibt korrigierte Metadaten.**
   Das Server-HTML von Damen Seite 999/54 hat keinen unberechtigten Seitenzusatz.
   Nach JavaScript stehen Titel und Beschreibung wieder auf „Seite 999“/„Seite 54“.
   Die Ursache ist in `resources/js/cat.js:1960` ff. sichtbar: `updateMeta()` liest
   `page` direkt aus der URL und berücksichtigt keine bestätigte Seitengrenze.
   Robots und Canonical bleiben dabei korrekt unverändert. JavaScript-Bundles
   waren aus Phase 1 ausdrücklich ausgenommen und wurden in diesem Live-Prüflauf
   nicht geändert. Der später vom Nutzer beauftragte lokale Fix steht unten.
3. **Der reale konfigurierte 404-Metadatenpfad unterscheidet sich vom lokalen
   `tpl.page-not-found`-Fixture.** Eine nicht existierende URL liefert korrekt
   HTTP 404, rendert aber die Ausverkauft-Kategorie samt Artikelliste und
   `INDEX,FOLLOW`. Mit `page=2` erscheint zusätzlich ein Ausverkauft-Seiten-Canonical.
   Der HTTP-Fehlerstatus funktioniert; die erwartete restriktive Robots-Behandlung
   dieses Kategorien-404-Pfads ist noch offen. Dafür ist der tatsächliche
   IO-/Kategorie-Renderkontext beim 404-Rerender zu prüfen. Ein weiterer 404-Aufruf
   mit `page=999` erhielt zwar `NOINDEX`, aber durch die Listengrenze; dies ersetzt
   nicht die fehlende statusabhängige Sperre auf der normalen bzw. zweiten 404-Seite.
   Kategorie-Einstellungen werden dafür nicht eigenständig geändert.
4. **Drei fremdsprachige Erstabrufe wichen ab.** EN/IT/ES Seite 2 lieferten zunächst
   trotz 24 Artikeln `NOINDEX` mit Basis-Canonical. Je drei weitere Aufrufe nach
   Preview-Einstieg sowie mit frischer Sitzung lieferten die erwarteten
   `INDEX,FOLLOW`-/`?page=2`-Werte; EN wurde zusätzlich im Browser bestätigt.
   Die erste Abweichung ist dokumentiert, aber ihre Ursache noch ungeklärt.
   Ein Fragmentcache-/Initialisierungseffekt ist eine Hypothese, kein Befund.

**NOT_TESTED (Live):** Erhalt einer ausdrücklich konfigurierten `NOINDEX`- bzw.
`NOINDEX,NOFOLLOW`-Kategorie auf Seite 2. Der Nutzer kennt aktuell keine solche
B2B-Kategorie. Es wird keine Kategorie und keine SEO-Einstellung für diesen Test
angelegt oder verändert. Dieser Live-Fall wird ausdrücklich **nicht als bestanden**
gewertet. Die vorhandenen lokalen Regressionen sichern weiterhin, dass Pagination
eine explizite `NOINDEX`- oder `NOFOLLOW`-Vorgabe niemals aufhebt.

Nach dieser Nutzervorgabe erneut ausgeführt: `tests/seo_pagination.php` unter
Twig **2.16.1** und **3.30.0**, jeweils **250/250 PASS**, inklusive jeweils
**24 Robots-bezogener Fälle** und **190/190 identischer Vorher-Ergebnisse**.
Die Robots-Fälle enthalten explizites `NOINDEX`, `NOFOLLOW`, Kombinationen,
`forceNoIndex` und Block-/Kategorie-Prioritäten auf gültiger Seite 2.
Dies bleibt ein **lokaler Nachweis**, kein Ersatz für den als `NOT_TESTED`
gekennzeichneten Kategorie-Live-Test. PHP-/Twig-Deprecations sind separat erfasst.

| Nicht über den vorhandenen Preview-Link ausführbarer Nachweis | Status / Grund |
| --- | --- |
| Konfigurierte restriktive Robots-Kategorie | **NOT_TESTED**, ausdrückliche Nutzerentscheidung mangels bekannter Kategorie; keine SEO-Konfiguration verändern |
| Exakte serverseitige `getResults()`-Anzahl und vollständiger Kontextzustand vor/nach ShopBuilder | **NOT_TESTED live**; benötigt Serverprofil/Instrumentation. Lokale gezählte Regressionen und Kontextvergleiche bestehen |
| Vollständiges reales Listen-HTML vor/nach Deployment | **NOT_TESTED live**; kein identischer, hashgebundener Vorher-Snapshot verfügbar. Lokaler Vergleich gegen die tatsächliche vorherige PHP-Methode besteht |
| Echte Produktions-Cache-Lebenszyklen | **NOT_TESTED**; Vorschau sendet `no-store, private`; keine Cache-Invalidierung oder -Konfigurationsänderung auslösen |
| Explizite/erzwungene Canonicals, unbekannte/mehrdeutige Listen | **Lokal bestanden, live NOT_TESTED**, soweit kein vorhandener passender Testfall bekannt ist. Keine Kategorien/ShopBuilder-Inhalte dafür verändern. Unterschiedliche effektive ShopBuilder-Seitengrößen sind inzwischen mit 12 und 24 live geprüft, siehe Ergänzung unten |

Damit sind die über die vorhandenen Seiten zugänglichen SEO-Fälle geprüft und
die nicht ausführbaren Nachweise ausdrücklich getrennt dokumentiert. Die Abnahme
ist wegen der Befunde nicht bestanden. Login, Warenkorb, Preise und Checkout sind
darüber hinaus eigenständige Shop-Abnahmen und werden durch diese SEO-Prüfung
nicht als bestanden ausgegeben.

**Weiter offen:** tatsächliche Anzahl der
`getResults()`-Aufrufe im Serverprofil, Vergleich gegen vollständiges vorheriges
Plenty-Listen-HTML sowie Login/Warenkorb/Preis-/Checkout-Abnahme. Die Preview-Antworten
verlangen `must-revalidate, no-store, private`; Wiederholungen in dieser Vorschau
belegen daher keine Produktionsabnahme kalter/warmer ShopBooster-Caches.

Rohantworten und tokenbereinigte Messwerte liegen ausschließlich ignoriert unter
`.cache/seo-preview-20261109/`: `core-results.json` (24), `extra-results.json` (32),
`session-results.json` (8), `fresh-results.json` (4), `completion-results.json` (43),
`summary.json`, `acceptance-matrix.json`, `browser-observations.json`,
`browser-completion.json` sowie `local-seo2.json`/`local-seo3.json`.
Raw-HTML kann Preview-Parameter enthalten und bleibt
außerhalb versionierter Dokumentation. Der initiale Browseraufruf meldete einen
Navigations-Timeout; zwei Dialog-Locatorversuche scheiterten an inzwischen nicht
vorhandenen Zielen. Die geladene Vorschau wurde danach geprüft. Der erste
sandboxierte HTTP-Anlauf scheiterte an DNS; der freigegebene lesende Abruf gelang.
Diese Werkzeuganläufe werden nicht als bestandene Prüffälle gezählt.

**Änderungen dieses Prüflaufs:** nur diese README und ignorierte lokale Prüfartefakte.
Keine Änderung am Produktivcode, an Shop-Konfigurationen, JavaScript, Caches oder B2C;
kein eigener Deploy, Sync, Commit oder Push. Der Nutzer hat das Test-Pluginset
bereitgestellt. Die Abnahme bleibt wegen der genannten Befunde offen.

### Ergänzung: vier Content-Artikellisten (2026-11-09)

Zusätzlich zur obigen 111-Fälle-Matrix wurden `/alle-artikel/`, `/herren/`,
`/alles-unter-x-euro/` und `/damen/` gemeinsam geprüft. **42 weitere HTTP-Prüffälle,
42 × HTTP 200**, keine Transport-/PHP-Fehlermarker, jeweils Preview-Pluginset 426
und genau ein nicht leeres Robots-/Canonical-/Titel-/Beschreibungsfeld.
Die separate Auswertung umfasst **247 Einzelprüfungen: 244 PASS, 3 FAIL**.
Die drei FAILs betreffen die Gesamtzahl-/Randseitenkonsistenz bei Herren und Damen;
sie werden unten konkret genannt. Die acht ergänzenden Browserfälle und deren
JavaScript-Befunde werden separat bewertet und sind nicht in diesen 247 enthalten.
Das Gesamtergebnis bleibt **PARTIAL**, keine SEO-Freigabe.

Der Nutzer bestätigt die fachliche Auswahl: Herren ist eine Facettenauswahl auf
**Marken, Kategorie 60**, Alle Artikel verwendet diese Kategorie ohne zusätzlichen
fachlichen Filter, Alles unter X Euro verwendet Preisfilter. Im gespeicherten
HTML ist bei allen vier Listen Kategorie 60 als Filterkontext sichtbar. Die
effektiven Listen unterscheiden sich wie folgt; dies sind **Messwerte dieses
Prüflaufs, keine URL-/Kategoriezuordnungen im Produktivcode**:

| Content-Seite | Auswahl auf Kategorie 60 | Gemeldete Treffer | Effektive Artikel/Seite | Gemeldete letzte Seite | Randseite / erste leere Seite |
| --- | --- | ---: | ---: | ---: | --- |
| `/alle-artikel/` | keine ausgewählte Facette | 2.387 | **12** | 199 | Seite 199: 11 Artikel; Seite 200 leer |
| `/herren/` | Facette **727** | 1.336 | **24** | 56 | Seite 56: **24 statt rechnerisch 16** Artikel; Seite 57 leer |
| `/alles-unter-x-euro/` | Preisfilter; keine ausgewählte Facette | 2.366 | **12** | 198 | Seite 198: 2 Artikel; Seite 199 leer |
| `/damen/` | Facette **726** | 1.271 | **24** | 53 | Seite 53: **24 statt rechnerisch 23**; Seite **54 noch 5 Artikel**, Seite 55 leer |

Für jede Seite wurden normale URL, `page=1`, Seite 2, gemeldete letzte Seite,
die beiden Folgeseiten und Seite 999 untersucht. Seite 1 ohne Seitenzusatz mit
Basis-Canonical; gültige Seite 2 und gemeldete letzte Seite mit eigenem
Seiten-Canonical und `INDEX,FOLLOW`. Seiten oberhalb der gemeldeten Grenze
erhalten serverseitig `NOINDEX,FOLLOW`, Basis-Canonical und keinen Seitenzusatz.
Bei Damen ist diese Grenze nachweislich zu niedrig: die nicht leere Seite 54
wird weiterhin ausgeschlossen. Bei Herren stimmt die empirisch untersuchte
Grenze 56/57, aber Total und Restmenge sind inkonsistent. Eine korrigierte
Gesamtzahl lässt sich daraus ohne vollständigen Abfrage-/Gruppierungsnachweis
nicht ableiten. Die oben geforderte serverseitige Profilierung bleibt erforderlich;
keine zusätzliche Artikel- oder Zählabfrage als Umgehung einbauen.

**Abfragepfad und Parameter:** Im lokalen Code erzeugt ausschließlich
`getItemsFromCat()` das hier beobachtete `CategoryItemContent` mit paginierter
Liste. Es verwendet `CategoryItems::getSearchFactory()` und
`Facets::getSearchFactory()` mit denselben validierten Optionen und genau einen
`ItemSearchService::getResults()`-Aufruf; Total und Seitengröße dieses Ergebnisses
werden in den aktiven `SeoPage`-Render übernommen. `getItemsFromCatSimple()`
rendert nur `CategoryGridOnly` und registriert keine paginierte Hauptliste.
Der Herren-Aufruf `getItemsFromCat(60, 24, [727])` wurde vom Nutzer ausdrücklich
bestätigt und passt zu den Live-Messwerten. Die vollständigen gespeicherten
ShopBuilder-Ausdrücke der anderen Seiten und die numerischen Standardpreisgrenzen
stehen weder im Checkout noch im öffentlichen HTML. Ihre literalen Argumente sind
deshalb **nicht unabhängig verifiziert**; sie werden nicht aus URL-Namen erraten.
Auch die tatsächliche Live-Aufrufzahl erfordert weiterhin Serverprofilierung.

**Filter und Trennung der Seiten:**

- Nach umgekehrter Aufrufreihenfolge und einer normalen Newsletter-Content-Seite
  reproduzieren alle vier Listen exakt ihre Artikel-IDs/Reihenfolge, Trefferzahl,
  Facetten, Titel, Beschreibung, Robots und Canonical auf Basis-URL und Seite 2.
- Gleicher Request-Preisbereich `priceMin=0&priceMax=5` auf Alle Artikel und Alles
  unter X Euro liefert jeweils 1.551 Treffer, zwölf Artikel pro Seite, 130 Seiten
  und dieselben Artikel-IDs. Beide behalten ihre **eigenen** Metadaten und Basis-URLs.
  Diese Request-Preisgrenzen überschreiben gemäß bestehendem Resolver die
  Funktions-Standardwerte; sie belegen nicht deren unbekannte numerische Grenzen.
- Herren mit zusätzlicher Facette 3118 behält **727 und 3118**; Total sinkt auf
  432 bei 24 Artikeln pro Seite und 18 Seiten. Robots bleibt wegen `facets`
  `NOINDEX,FOLLOW`, die Metadaten bleiben die der Herren-Content-Seite.
- Nach diesen Filtern liefert Alle Artikel wieder 2.387 Treffer ohne ausgewählte
  Facette und exakt seine ursprüngliche erste Liste. Auf **Seite 199** unterscheiden
  sich die beiden 12er-Listen korrekt: Alle Artikel hat elf Artikel und einen
  Seiten-Canonical mit `INDEX,FOLLOW`; Alles unter X Euro ist leer, `NOINDEX` und
  besitzt den Basis-Canonical. Die SEO-Grenzen werden nicht zwischen ihnen geteilt.
- `/content/newsletter/?page=2` und nach den Filtern `?page=999` liefern weiterhin
  normalen Content ohne Artikelliste, Total oder Pagination, mit eigenen Metadaten,
  Basis-Canonical und `NOINDEX,FOLLOW`. Keine künstliche Hauptliste entsteht.

**Browser:** Acht Navigationen nach vollständigem Laden ohne Navigations-Timeout:
alle vier Seiten mit Seite 2, zusätzlich Alle Artikel/Preisfilter/Herren mit 999
und Damen mit 54. Auf Seite 2 passen die vier Listen und ihre eigenen Metadaten.
Der bekannte `cat.js`-Befund tritt auf **allen vier** ungültigen Varianten auf:
Titel und Beschreibung erhalten wieder den unerlaubten Seitenzusatz, obwohl das
Server-HTML ihn weglässt. Robots und Canonical bleiben wie serverseitig ausgegeben.
Zusätzlich beobachtet: gültige deutsche Seiten verwenden im Server-HTML den
Zusatz **„Page N“**, nach JavaScript **„Seite N“**. `PageMetadata.twig` leitet die
Sprache aus `locale` ab und hat den Fallback `Page`; `cat.js` verwendet dagegen
die HTML-Sprache. Der tatsächliche serverseitige `locale`-Wert ist nicht sichtbar;
eine vollständige Prüfung der Seitensuffix-Lokalisierung bleibt damit offen.
Diese Beobachtungen sind keine bestandene Titel-/Beschreibungsabnahme.

**Cache und verbleibende Grenzen:** Alle 42 Antworten melden Preview und
`must-revalidate, no-store, private` sowie `Miss from cloudfront`. Die wiederholten
Varianten zeigen keinen beobachteten Datentransfer zwischen diesen vier Seiten,
beweisen aber keinen kalten/warmen Produktions-ShopBooster-Lebenszyklus
(**NOT_TESTED**). Keine Cache- oder ShopBuilder-Konfiguration wurde verändert.
Der Live-Test einer ausdrücklich restriktiven Robots-Kategorie bleibt gemäß
Nutzervorgabe **NOT_TESTED**. Die vorhandenen lokalen 250/250-Regressionen je
Twig-Version einschließlich der 24 Robots-Fälle gelten unverändert; Produktivcode
und Tests wurden in dieser Ergänzung nicht geändert und nicht erneut ausgeführt.
Ein lokaler PlentyONE-Validator/Build wurde weiterhin **nicht ausgeführt**.

Zusätzliche ignorierte Artefakte: `content-pages-initial-results.json` (8),
`content-pages-bounds-results.json` (20), `content-pages-repeat-results.json` (9),
`content-pages-query-results.json` (5), `content-pages-review.json`,
`content-browser-observations.json` sowie die verwendeten Prüfskripte und Rohantworten
unter `.cache/seo-preview-20261109/`. Die vier Preview-Einstiege sind separat
gespeichert und werden nicht als zusätzliche Prüffälle gezählt. Ein lokaler
Ausgabeversuch scheiterte an der Windows-Zeichencodierung; mit UTF-8 gelang die
Auswertung. Dies war kein fehlgeschlagener Shop-Aufruf. `git diff --check` bestanden.
**Geänderte versionierte Datei: nur README.md**, lokal auf `develop`, unstaged.
Kein eigener Commit, Push, Merge, Versionsschritt, Deploy oder Sync; B2C unverändert.

### Folgeauftrag: Randseitenanalyse und lokaler JavaScript-Fix (2026-11-09)

Der Nutzer hat anschließend die Untersuchung von Herren/Damen sowie die Korrektur
des vorhandenen Metadaten-JavaScripts beauftragt. **Der JavaScript-Fix ist lokal
getestet, nicht bereitgestellt. Die genaue Ursache der Artikelzählabweichung ist
weiterhin nicht vollständig nachgewiesen.** Es wurde keine Artikelzählung oder
serverseitige SEO-Paginierungsentscheidung geändert; sämtliche PHP-Dateien unter
`src/` sind gegenüber `HEAD` unverändert. Die folgenden Live-Beobachtungen stammen
weiter aus dem bereits vorhandenen Test-Pluginset, nicht aus dem lokalen JS-Fix.

**Erneute Abfrage-/ID-Prüfung:** 36 protokollierte HTML-GETs, **36 × HTTP 200**,
keine Transportfehler/PHP-Fehlermarker, alle mit Preview-Pluginset 426. Drei Serien:
gemeinsame Preview-Sitzung, **neue CookieJar/HTTP-Sitzung für jeden einzelnen GET**,
und Wiederholung in umgekehrter Seitenreihenfolge. Pro Serie wurden aktuelle
Basis-URL und Herren 54–58 beziehungsweise Damen 51–55 abgerufen. Die zwei
zusätzlichen Preview-Einstiege wurden separat gespeichert und nicht mitgezählt.

| Vergleichsfenster | Artikel je Seite | Verschiedene Artikel-IDs | Wiederholungen innerhalb / zwischen Seiten | Ergebnis aller drei Serien |
| --- | --- | ---: | --- | --- |
| Herren 54 / 55 / 56 | 24 / 24 / 24 | **72 von 72** | **0 / 0** | IDs, Reihenfolge und Total 1.336 identisch; 57/58 leer |
| Damen 51 / 52 / 53, gemeldete letzte drei | 24 / 24 / 24 | **72 von 72** | **0 / 0** | IDs, Reihenfolge und Total 1.271 identisch |
| Damen 52 / 53 / 54, letzte drei nicht leere | 24 / 24 / 5 | **53 von 53** | **0 / 0** | IDs, Reihenfolge und Total 1.271 identisch; 55 leer |

Verglichen wurden die tatsächlichen `data-eg-item`-Werte pro Artikelkarte; im
Template stammen diese aus `item.data.variation.itemId`, also **Artikel-IDs**.
Die paarweisen Schnittmengen der genannten Seiten sind jeweils leer. Die fünf
Damen-IDs auf Seite 54 bleiben `212496`, `212494`, `212492`, `212470`, `211575`.
Es wurden nur die genannten Randseiten auf Dubletten geprüft. Daraus folgt weder
ein vollständiger Dublettenausschluss über alle früheren Seiten noch eine
belegte korrigierte Gesamtzahl von 1.344 oder 1.277.

**Tatsächlicher vorhandener Abfragepfad:** `getItemsFromCat()` bildet die
Quellfacetten und Request-Facetten, löst Preise auf und validiert die Optionen
über Ceres `SearchOptions`. Dieselben Optionen gehen an `CategoryItems` und
`Facets`; ein `ItemSearchService::getResults()` liefert `itemList.total` und
`itemList.documents`. Total wird unverändert als `itemCountTotal` verwendet,
die Dokumente werden einmal durch die Artikelschleife gerendert. Die bestehende
Berechnung `ceil(total / effectiveSize)` und der SEO-Helper sind unverändert.
Herren: Kategorie 60, Quellfacette 727, 24 Artikel; Damen: sichtbarer Filterkontext
60/726, effektiv ebenfalls 24 Artikel. Der vollständige gespeicherte Damen-Aufruf
und die serverseitig aufgelösten Suchoptionen sind weiterhin nicht als Trace verfügbar.

Als unabhängige Diagnose wurden zusätzlich **zwei bestehende lesende
`/rest/io/facet/`-Aufrufe** mit Kategorie 60, Facette 727 beziehungsweise 726 und
Preisbereich 0/0 ausgeführt. Die lokal registrierte Resource verwendet denselben
`CategoryItems`-Suchtyp, setzt aber **Seite 1 und Größe 50**; sie ist deshalb kein
identischer Mitschnitt der 24er-ShopBuilder-Abfrage. Beide HTTP-200-JSON-Antworten
enthalten bereits ohne Twig-/JavaScript-Ausgabe **Total 1.336 beziehungsweise
1.271**, jeweils 50 Dokumente und keine `inactiveVariationIds`. Das belegt, dass
diese Total-Werte nicht erst vom Metadaten-JavaScript erzeugt werden. Der
Preview-Einstieg erfolgte vorher in derselben Sitzung; die JSON-Antwort selbst
enthält keinen unabhängig prüfbaren Pluginset-/Stage-Marker.

**Nachgewiesen und noch offen:** Die Abweichung ist reproduzierbar und lässt sich
in diesen Randfenstern nicht mit wiederholten Artikelkarten erklären. Sie tritt
auch bei neuen Client-Sitzungen auf; unterschiedliche Seitenreihenfolge ändert
sie nicht. Ein einmaliger alter Browserzustand ist dafür keine ausreichende
Erklärung. **Ob Total/Grouping unterschiedliche Einheiten verwenden, eine
Aggregation ungenau zählt, frühere Seiten Überschneidungen haben oder ein interner
Cache beteiligt ist, bleibt offen.** Keine dieser Möglichkeiten wird als
nachgewiesene Backend-Ursache ausgegeben. Die
[offizielle Suchschnittstelle](https://developers.plentymarkets.com/en-gb/interface/stable7/Webshop.html)
dokumentiert Optionen und Gruppierung; der eingesehene
[ItemSearchService-Stub](https://raw.githubusercontent.com/plentymarkets/plugin-interface/master/Modules/Webshop/ItemSearch/Services/ItemSearchService.php)
enthält nur abstrakte Methoden, keine ausführbare Total-/Cache-Implementierung.
Mehrere weitere öffentliche Source-Abrufe scheiterten am Web-Werkzeug mit
`Cache miss`; daraus wurde keine Implementierung abgeleitet.

**Cache-Grenze:** Alle 36 HTML-Antworten verlangen `must-revalidate, no-store,
private` und melden `Miss from cloudfront`; die beiden REST-Antworten ebenso.
Es wurden keine Cache-Header zum Umgehen der Caches gesetzt, keine Zufallsparameter
angehängt, keine Konfiguration geändert und kein Cache invalidiert. **Frische
Client-Abfragen sind nachgewiesen; frische native Suchausführung und kalter/warmer
ShopBooster-/Suchcache sind ohne Servertrace nicht nachgewiesen (`NOT_TESTED`).**

Kleinster sinnvoller nächster Schritt ist ein lesender Trace der **ohnehin
vorhandenen einzelnen ShopBuilder-Suche** im PlentyONE-System. Er muss effektive
Kategorie/Facetten/Preise, Seite/Größe, vollständige Sortierung, Gruppierung,
Total-Aggregation sowie `total`, Dokumentanzahl und Artikel-/Varianten-IDs vor Twig
zeigen. Dazu vorhandenen Cache-Schlüssel, Hit/Miss und Herkunft der Antwort prüfen.
Es ist keine zweite Such-/Zählabfrage im Seitenaufruf erforderlich. **Korrektur
erst danach:** Falls Total eine Schätzung oder eine andere Gruppeneinheit ist,
innerhalb der bestehenden Suche eine nachweislich exakte, gleich gefilterte
Gruppenzahl verwenden; bei nachgewiesen falschem Cache-Schlüssel dessen bestehende
Bildung korrigieren. Keine pauschalen Aufschläge, keine aus URL-Namen abgeleiteten
Sonderfälle und keine zusätzliche Zähl-Engine. Aktuell wurde davon nichts umgesetzt.

**JavaScript-Root-Cause und Umsetzung:** `cat.js` verwendete `parseInt(page)` ohne
Bestätigung der Liste/Seitengrenze und entfernte zusätzlich beliebigen Text nach
einem Gedankenstrich. Der vorhandene `SeoPage.pagination`-Zustand wird nun in
`PageMetadata.twig` einmal als `o46-pagination`-Metadatum ausgegeben. Dies exportiert
nur das bestehende Ergebnis und ändert keine serverseitige SEO-Entscheidung oder
Abfragezahl. `cat.js` nutzt diesen Zustand für strikt positive, sicher darstellbare
Seitennummern und dieselbe bekannte Grenze. Ungültige/mehrdeutige/leere/unbelegte
Listen erhalten keine neuen Titel-/Beschreibungszusätze. Ohne lesbaren Zustand
bleiben die Server-Metadaten erhalten. Gültige Nummerierung und Sprachlabels bleiben
bei Direktaufruf, `pushState`, `replaceState`, `popstate` und Infinite Scroll erhalten.
Ein anderer Pfad oder andere Filter erhalten nicht die Grenzen der alten Liste.
Nur bekannte abschließende Seitensuffixe werden entfernt; redaktionelle
Gedankenstriche bleiben erhalten. Fehlende Beschreibungen werden nicht erfunden.
Robots und Canonical werden vom JavaScript nicht verändert. Damen 54 bleibt wegen
der unveränderten serverseitigen Grenze weiterhin ausgeschlossen; der JS-Fix löst
ausdrücklich nicht die Zähl-/Grenzenabweichung.

**Erneut ausgeführte Regressionen nach der Korrektur:**

| Prüfung | Exaktes Ergebnis |
| --- | --- |
| SEO/PHP-Kompatibilität, Twig 2.16.1 / 3.30.0 | jeweils **261/261 PASS**, 0 Fehler; 11 neue Fälle zum exportierten Zustand und unveränderter Abfragezahl |
| Vergleich mit vorherigen 250 Ergebnissen | jeweils **250/250 identisch**; historische 190er-Vorherprüfung zusätzlich **190/190 PASS** |
| Vollständiges Twig-Inventar / bestehende Regressionen | jeweils **171/171 Syntax PASS**, **38/38 PASS** samt historischem Vergleich |
| Kontakt-/Newsletter-Layouts | jeweils **60/60 PASS**, fünf Sprachen |
| Neues Metadaten-JavaScript mit DOM-/History-Fixtures und echten PHP-Ergebnissen beider Twig-Versionen | **111/111 PASS** |
| Dasselbe JavaScript mit den 22 PHP-Fixtures in lokalem Chrome, inkl. History-Wechseln | **22/22 PASS**, 0 Seitenfehler; alle HTTP-Anfragen lokal erfüllt/abgebrochen |
| Bestehender Kontakt-Widget-Browserlauf | **55/55 Szenarien**, **1.332 Assertions**, 0 Seitenfehler, 0 externe Requests |
| PHP-Lint, alle Dateien in `src/` und `tests/` | **12/12 PASS** |
| Node-Syntax: `cat.js`, neuer Metadaten-Test und bestehender Widget-Test; `git diff --check` | **PASS** |
| PlentyONE-Validator/Build, Deployment und Live-Abnahme des lokalen JS-Fixes | **NOT_RUN** |

Die erstmalige Erweiterung verwendete versehentlich den Fixture-Modus `simple`
(Hauptliste plus Widget) statt `simple-only`: 260 PASS/1 FAIL. Nach Korrektur des
Testinputs bestehen alle 261 Fälle. Zwei zusätzliche `--compare`-Anläufe mit einer
250er-Referenz wurden vom unveränderten Testtreiber korrekt abgelehnt, weil diese
Option ausdrücklich eine 190er-Vorherreferenz verlangt; der zusätzliche
250er-Vergleich erfolgte separat und vollständig. Der erste Chrome-Fixture-Lauf
hatte 18 PASS/4 FAIL wegen fehlender UTF-8-Angabe im lokalen Test-HTML; die korrigierte
Fixture verwendet wie der Shop UTF-8 und besteht 22/22. Produktionsvalidierungen
wurden dafür nicht gelockert. Keine Test-/Browser-Timeouts oder abgebrochenen Suiten
in diesem Folgeauftrag. PHP-/Twig-Deprecations sind separat in den JSON-Berichten
erfasst und werden nicht als PlentyONE-Freigabe gewertet.

Reproduktion mit vorhandenen lokalen Runtimes: bestehende PHP-Befehle unten
verwenden, mit Ausgaben unter `.cache/seo-preview-20261109/js-fix-*`. Für den
zusätzlichen Node-/Chrome-Test:

```powershell
$env:O46_PLAYWRIGHT_MODULE = 'C:\Users\mschw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
$env:O46_BROWSER_EXECUTABLE = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node tests/seo_metadata.cjs .cache/seo-preview-20261109/js-fix-metadata.json .cache/seo-preview-20261109/js-fix-seo2.json .cache/seo-preview-20261109/js-fix-seo3.json --browser
```

Die lokale Ermittlung ist unter `.cache/seo-preview-20261109/` abgelegt:
`tail-shared-results.json`, `tail-fresh-results.json`, `tail-repeat-results.json`
(je 12), `tail-review.json` mit vollständigen IDs/Schnittmengen,
`query-probe-summary.json` und rohe JSON-/HTML-Antworten. Testberichte:
`js-fix-seo2/3.json`, `js-fix-250-comparison.json`, `js-fix-twig2/3.json`,
`js-fix-contact2/3/`, `js-fix-metadata.json`, `js-fix-widget-browser.json` und
`js-fix-php-lint.json`. Rohantworten/Preview-Token bleiben ignoriert.

**Geänderte Dateien dieses Folgeauftrags:** `resources/js/cat.js`,
`resources/views/PageDesign/Partials/PageMetadata.twig`, `tests/seo_pagination.php`,
neu `tests/seo_metadata.cjs`, diese README und beide vorhandenen Changelogs.
Alles lokal, uncommittet und unstaged auf `develop`. Kein Commit, Push, Merge,
Versionsschritt, Deploy, Sync, Cache-Invalidieren oder B2C-Eingriff. Der explizite
restriktive Kategorie-Live-Test bleibt gemäß Nutzervorgabe **NOT_TESTED**.

### Auslieferungsprüfung des JavaScript-Fixes (2026-11-09)

Ausgang dieses Folgeauftrags: sauberer `develop` bei `bd4c6ac` (`seo v2 fix1`).
**Root Cause:** Der vorherige lokale Fix betraf `resources/js/cat.js`, die
Seiten binden jedoch die separate **`resources/js/cat-020726.min.js`** ein.
Diese enthielt weiterhin die ungeprüfte Seitennummerierung. Der vorherige
quellbasierte JavaScript-Test prüfte die tatsächlich eingebundene Datei nicht.

Die aktuelle Preview wurde erneut lesend geprüft: **sechs Seiten, sechs HTTP 200**.
`/alle-artikel/`, `/herren/`, `/damen/`, `/alles-unter-x-euro/` und die reguläre
Kategorie `/herren-bekleidung/jeans-hosen/` laden jeweils genau einmal die
Kategorie-Min-Datei mit `defer`; `/content/newsletter/` lädt weiterhin `main`.
Die Einbindung erfolgt in `PageDesign.twig` nach den bestehenden
`mainjs`-/`vuejs`-/`nojs`-/Template-Prioritäten. Content-Seiten werden daher nicht
pauschal einer bestimmten JS-Datei zugeordnet. Weder `cat.js` noch die ignorierten
Artefakte unter `build/js/` sind dort eingebunden.

Die referenzierte S3-Datei des Test-Pluginsets 426 wurde separat gelesen:
**HTTP 200, 265.584 Bytes**, SHA-256
`10fe2a8a4286199004a147333a3f6c15da93678402dc3fd28f7b732473fa04a5`.
Sie ist exakt gleich der lokalen bisherigen Min-Datei und enthält noch keinen
`o46-pagination`-Zugriff. Auch die sechs Live-HTML-Antworten enthalten dieses
Zustands-Metadatum noch nicht. Der beobachtete Preview-BuildHash ist weiterhin
`77714dd7359997fffcf0666df167f9254f4a8ea3`; dies ist **keine Live-Abnahme des lokalen
Fixes**. Die Asset-Antwort setzt `Cache-Control: max-age=604800` (sieben Tage).

**Minifizierung:** Im aktuellen versionierten Checkout existieren weder
`package.json`/Lockdatei noch JS-Buildskript oder dokumentierte historische
Minifizierer-Optionen. Vorhandene ältere `.cache/`-/`build/`-Artefakte gehören zu
einem nicht aktiven Common-Migrationsversuch und werden nicht als Buildprozess
verwendet. Ein solcher vorhandener Projekt-Build konnte deshalb **nicht**
ausgeführt werden. Es wurde die bereits installierte **Terser-Version 5.44.0**
verwendet, ohne Paketinstallation oder neue Build-Infrastruktur.

Um andere JS-Funktionen sicher zu erhalten, wurde ausschließlich der korrigierte
Metadaten-IIFE aus der Quelle mit Acorn eindeutig ermittelt, mit
`compress:false`, `mangle:true`, `format:{comments:false}` minifiziert und anstelle
des alten IIFE eingesetzt. Kein manuelles Nachbauen der Logik in der Min-Datei.
Der Bytevergleich bestätigt: **Präfix und Suffix außerhalb dieses Funktionsblocks
sind vollständig unverändert**. Zweimalige Minifizierung und erneute Erzeugung
gegen die Ausgangsdatei ergeben identische Bytes. Die lokale Min-Datei hat nun
**266.619 Bytes**, SHA-256
`87a2445a2516f2bb6f2b1de6a22e7bba5e13b5973bc6d6ca394e80c0d01fe019`.
Dies ist eine begrenzte Aktualisierung des bestehenden Artefakts, keine behauptete
vollständige Rekonstruktion des unbekannten historischen Bundle-Builds.

**Cache-Versionierung:** Nur die vorhandene Kategorie-Einbindung wurde auf
`cat-020726.min.js?v={{ buildHash }}-nl1-seo1` gesetzt. Der BuildHash und bisherige
`nl1`-Zusatz bleiben erhalten; `seo1` ergibt beim späteren Bereitstellen eine neue
Browser-Cache-URL. Keine Versionsänderung in `plugin.json`, keine Änderung der
anderen Bundle-URLs und keine Cache-Invalidierung. Source-Fix, vorhandener
`o46-pagination`-Export und aktualisiertes Artefakt müssen gemeinsam im späteren
Pluginstand enthalten sein; hier wurde nichts bereitgestellt.

`tests/seo_metadata.cjs` unterstützt nun `--asset=<Datei>`, parst die gesamte
angegebene Datei und führt den daraus ermittelten Metadatenblock aus. Die Tests
prüfen somit ausdrücklich den Inhalt der eingebundenen Min-Datei. Der lokale
Chrome-Lauf verwendet diesen Block mit den tatsächlich gerenderten PHP-Zuständen
beider Twig-Versionen; die übrige Ceres-/Shop-Laufzeit wird damit nicht als
vollständig abgenommen ausgegeben.

| Prüfung nach Aktualisierung | Ergebnis |
| --- | --- |
| Korrigierte Min-Datei, DOM-/History-Fälle | **111/111 PASS** |
| Korrigierte Min-Datei, lokale Chrome-/PHP-Fixtures | **22/22 PASS**, 0 Seitenfehler |
| Lesbare Quelle, gleiche Metadatenfälle | **111/111 PASS** |
| Heruntergeladene alte Live-Datei, erwarteter Negativtest | **18 PASS / 93 FAIL**, Exit 1; erkennt die fehlende Korrektur |
| SEO inkl. drei neuer Twig-Einbindungs-/Cachefälle, Twig 2.16.1 und 3.30.0 | jeweils **264/264 PASS**; historische **190/190 PASS**, alle vorherigen **261/261 identisch** |
| Gesamtes Twig-Inventar / bestehende Regressionen | jeweils **171/171 Syntax PASS**, **38/38 PASS** samt historischem Vergleich |
| Kontakt-/Newsletter-Layouts mit exakten Bundle-Cache-Schlüsseln | jeweils **60/60 PASS**, fünf Sprachen |
| Bestehender Kontakt-Widget-Browserlauf mit neu erzeugten Layout-Fixtures | **55/55 Szenarien**, **1.332 Assertions**, 0 Seitenfehler, 0 externe Requests |
| PHP-Lint / Node-Syntax der Min-Datei und des Metadaten-Tests / Diff-Check | **12/12 PASS** / **PASS** / **PASS** |
| Prüfung im neu bereitgestellten PlentyONE-Pluginset | **NOT_RUN**, kein Deployment beauftragt |

Die Layouttests stoppten zunächst unter beiden Twig-Versionen mit
`Wrong newsletter bundle count: category.item`, weil ihr exakter Matcher noch
`-nl1` für alle Bundles erwartete. Die Erwartung wurde auf **genau** `-nl1-seo1`
für `cat` und unverändert `-nl1` für die übrigen Bundles aktualisiert; Anzahl,
Bundle-Auswahl und Cache-Version werden weiterhin strikt geprüft. Der erste
Asset-Leseversuch stoppte an der erlaubten Shop-Domain, da die Datei tatsächlich
vom S3-Pfad eingebunden wird. Anschließend wurde genau dieser beobachtete statische
Pfad zugelassen und geladen; keine Shop-Abfragen mussten wiederholt werden.
Kein Test-/Browser-Timeout in diesem Auslieferungscheck.

Reproduktion des Tests gegen die tatsächlich einzubindende Datei mit den bereits
oben genannten lokalen Runtimes und Chrome-Umgebungsvariablen:

```powershell
node tests/seo_metadata.cjs .cache/seo-preview-20261109/min-asset-metadata.json .cache/seo-preview-20261109/min-asset-seo2.json .cache/seo-preview-20261109/min-asset-seo3.json --browser --asset=resources/js/cat-020726.min.js
```

Lokale Prüf-/Generierungsartefakte bleiben ignoriert unter
`.cache/seo-preview-20261109/`: `cat_asset.cjs` (mit `--write` erzeugen, ohne Flag
gegen Ausgangscommit prüfen), `cat-asset-build.json`, `asset-delivery-live.json`,
`asset-live-cat-0.js`, `live-old-asset-negative.json` und die `min-asset-*`-Berichte.
**Geänderte versionierte Dateien:** Kategorie-Min-Datei, `PageDesign.twig`,
`tests/seo_metadata.cjs`, `tests/seo_pagination.php`, `tests/contact_widget.php`,
diese README und beide vorhandenen Changelogs. `cat.js`, andere JS-Bundles,
PHP-Produktivcode und serverseitige SEO-Paginierung bleiben unverändert.
Alles lokal, uncommittet und unstaged auf `develop`; kein eigener Commit, Push,
Merge, Versionsschritt, Deployment, Sync, Cache-Invalidieren oder B2C-Eingriff.

### Nach Nutzer-Bereitstellung: Live-Gegenprüfung (2026-11-09)

**Auslieferung und JavaScript-Fix im Test-Pluginset 426 bestätigt.**
Verbindlicher Prüfkontext für diesen B2B-SEO-Auftrag: Auf Nutzermeldungen wie
„deployed“ oder „live“ folgt der Gegencheck ausschließlich im **Test-Pluginset 426
über den bereitgestellten Preview-Link**, bis der Nutzer ausdrücklich einen
anderen Prüfstand beauftragt. Alle folgenden Abnahmeergebnisse beziehen sich darauf.
Lokaler Referenzstand ist jetzt `2022285` (`seo v2 fix2`); ein Server-Commit oder
PlentyONE-Buildlog wurde nicht unabhängig eingesehen. Es wurde nur gelesen.

Sechs erneut geladene Preview-Seiten liefern HTTP 200 und jeweils genau ein
`o46-pagination`-Metadatum. Die vier Content-Listen und die reguläre Kategorie
laden `cat-020726.min.js?v=69094367d1d589a37705b9029c7e517c8d2c59c7-nl1-seo1`
mit `defer`. Newsletter bleibt bei `main-020726.min.js` ohne Kategorie-Cachezusatz.
Die tatsächlich referenzierte S3-Datei wurde erneut geladen: **HTTP 200,
266.619 Bytes, SHA-256
`87a2445a2516f2bb6f2b1de6a22e7bba5e13b5973bc6d6ca394e80c0d01fe019`**,
also exakt gleich dem lokal geprüften Fix. Das Asset meldet weiterhin sieben
Tage Cache-Laufzeit; die neue URL ist nun tatsächlich eingebunden.

Nach vollständigem Laden wurden **18 Browserfälle** im vorhandenen Preview
beobachtet. **18/18 Metadatenfälle entsprechen der bestehenden serverseitigen
Entscheidung**; dies bewertet den JS-Fix, nicht die Richtigkeit der Artikelzählung:

| Browserfälle | Beobachtetes Ergebnis nach JavaScript |
| --- | --- |
| Alle vier Content-Listen auf Seite 2 und ihrer aktuell gemeldeten letzten Seite | Eigene Titel/Beschreibungen mit korrektem deutschen Seitenzusatz, `INDEX,FOLLOW`, eigener Seiten-Canonical |
| Alle vier Content-Listen mit `page=999` | Kein Titel-/Beschreibungszusatz, `NOINDEX,FOLLOW`, jeweiliger Basis-Canonical |
| Damen Seite 54 | Kein falscher Seitenzusatz mehr; weiterhin fünf Artikel trotz serverseitiger Grenze 53, `NOINDEX` und Basis-Canonical: bekannter Zähl-/Grenzenbefund bleibt offen |
| Reguläre Kategorie Seite 2 / 999 | Gültiger Zusatz auf Seite 2; kein Zusatz auf 999; Robots/Canonical entsprechen dem Serverzustand |
| Newsletter ohne Artikelliste mit `page=999` | Eigene Metadaten ohne Seitenzusatz, `hasList:false`, kein erfundener Seiten-Canonical |
| Herren `page=abc`, Damen `page=0` | Sichere erste Liste ohne Seitenzusatz, `NOINDEX,FOLLOW`, Basis-Canonical |

Aktuell beobachtete gemeldete Grenzen: Alle Artikel 199, Herren 56, Damen 53,
Preisfilter 197. Die Daten wurden aus den aktuellen Antworten gelesen; alte
Preisfilter-Grenzen wurden nicht fest vorausgesetzt. Die Trefferbestände haben sich
gegenüber dem früheren Prüflauf verändert. Keine Zählursache wird daraus abgeleitet.
Zusätzlich besteht die **frisch heruntergeladene ausgelieferte Datei** die
vorhandenen **111/111 Metadatenregressionen und 22/22 lokalen Chrome-Fälle** mit
den PHP-Fixtures beider Twig-Versionen. Keine Browser-/Test-Timeouts in diesem Lauf.

Ein irrtümlich zusätzlich ausgeführter öffentlicher Lesecheck lag außerhalb des
gewünschten Prüfkontexts. Er zählt nicht zur Abnahme und begründet keinen offenen
Arbeitsauftrag. Es wurde dabei keine Pluginset-Zuordnung oder Veröffentlichung
verändert. Der Nutzer hat den ausschließlichen Test-Pluginset-Kontext klargestellt.

Die gesamte SEO-Abnahme bleibt wegen der Zähl-/Grenzenbefunde offen. Kalte/warme
interne ShopBooster-/Suchcaches sowie die explizit restriktive Robots-Kategorie
bleiben wie bisher **NOT_TESTED**. Die JavaScript-Gegenprüfung ersetzt diese
weiteren Nachweise im Test-Pluginset nicht.

Belege ignoriert unter `.cache/seo-preview-20261109/`:
`deployed-asset-delivery.json`, `deployed-cat.js`,
`deployed-browser-observations.json` (kompakte manuelle Übertragung der CUA-Ausgaben),
`deployed-metadata-regression.json` samt Rohantworten. Die generischen `asset-*`-Dateien
enthalten nach dem erneuten Prüflauf den neuen Preview-Stand; der alte Stand ist
oben anhand seines damals gemessenen Hashes dokumentiert.
**Änderungen dieses Gegenchecks:** nur README und ignorierte Prüfartefakte.
Kein Produktivcode geändert, kein eigener Commit, Push, Deploy, Sync,
Cache-Invalidieren oder B2C-Eingriff.

### Vollständiger Test-Pluginset-Gegencheck und leere Kategorien (2026-11-09)

**Ergebnis: keine vollständige SEO-Freigabe.** Ausschließlich Preview-Pluginset
**426** über den vorhandenen Nutzerlink geprüft. Alle bisherigen SEO-Prüfbereiche
wurden erneut durchlaufen; bekannte Fehler und nicht ausführbare Nachweise wurden
nicht als bestanden gewertet. Während dieses Laufs hat der Nutzer die Regel für
ungefilterte leere Artikelkategorien ausdrücklich ergänzt; die dafür unten
beschriebene kleine PHP-Korrektur ist **nur lokal** vorhanden.

**Umfang der erneuten Live-Prüfung:** 182 HTML-Prüffälle, **179 × HTTP 200** und
**3 × echte HTTP 404**, ohne Transportfehler oder PHP-Fehlermarker. Sechs zusätzliche
Preview-Einstiege sind als Einrichtung getrennt erfasst. Ein weiterer GET prüfte
die tatsächlich ausgelieferte Kategorie-Min-Datei. Die Offline-Auswertung der
HTML-Antworten umfasst **1.874 Einzelprüfungen: 1.863 PASS, 11 FAIL**. Die elf FAILs
betreffen die unten aufgeführten Zähl-/Randseiten-, 404- und leeren-Erstseiten-Fälle.
39 Antworten haben zusätzlich einen Hinweis zur serverseitigen Suffixsprache;
zwei Suchantworten enthalten keine Description. Das sind getrennte Beobachtungen.

Im Browser wurden nach vollständigem Laden **44 Varianten** geprüft:
**41/44 Fälle** erfüllten den strengen Metadaten-Inventurcheck vollständig;
**302/308 Einzelprüfungen** bestanden. Die drei abweichenden Fälle sind die echte
404-Seite, deren Seite 2 und die NOINDEX-Suche ohne Description-Tag. Bei der Suche
sind Robots, Basis-Canonical und das Ausbleiben eines Seitenzusatzes korrekt;
die fehlende Description ist bestehendes Verhalten dieses nicht indexierbaren
Templates und wird als Vollständigkeitshinweis erfasst. Die Rohzählung bleibt
41/44 und wird nicht nachträglich grün umgeschrieben.

**Bestätigte Änderungen und Regressionen:**

- Die vier Content-Listen verwenden weiterhin ihre eigenen Metadaten, Facetten
  und Grenzen bei effektiv zwölf beziehungsweise 24 Artikeln pro Seite. Basis-URL,
  Seite 1/2, aktuelle letzte Seite, Folgeseiten, 999 sowie ungültige Eingaben wurden
  erneut geprüft. Titel-/Beschreibungszusätze auf normalen ungültigen Listenseiten
  bleiben auch nach JavaScript aus; gültige Nummerierungen bleiben erhalten.
- Kategorie-Min-Datei mit `-nl1-seo1` wird tatsächlich eingebunden. Ihr SHA-256 bleibt
  `87a2445a2516f2bb6f2b1de6a22e7bba5e13b5973bc6d6ca394e80c0d01fe019`,
  exakt gleich dem geprüften lokalen Artefakt. Die frisch heruntergeladene Datei
  besteht erneut die vollständige Metadatenregression.
- Reguläre Kategorie, einseitige Kategorie, leere Preisfilter-Ergebnisse, reguläre
  Seitengröße 12 und sichere Fallbacks bei `items=0/abc` funktionieren. Ein
  `items=12`-Request überschreibt weiterhin nicht die 24er-ShopBuilder-Vorgabe.
- Damen mit Facette 3118 behält Quellfacette 726 und liefert 507 Treffer, 22 Seiten,
  drei Artikel auf Seite 22 und keine auf 23. Herren behält 727 zusammen mit 3118
  bei 432 Treffern. Gefilterte Seiten bleiben `NOINDEX`; belegte Folgeseiten
  verwenden den eigenen Seiten-Canonical.
- Gleicher Preisrequest auf Alle Artikel und Alles unter X Euro liefert dieselben
  1.546 Treffer und dieselben IDs bei zwölf Artikeln pro Seite. Metadaten und
  Canonicals bleiben jeweils die der aufgerufenen Content-Seite. Die acht
  Basis-/Seite-2-Wiederholungen nach umgekehrter Aufrufreihenfolge reproduzieren
  IDs, Filter und Metadaten exakt; nach Filtern erhält Alle Artikel seine eigene
  ursprüngliche Liste zurück.
- DE/EN/FR/IT/ES, auch die früher auffälligen Erst-/Frischabrufe, liefern jetzt
  konsistente Robots und Canonicals auf Seite 2. Nach JavaScript stimmen die
  Sprachzusätze. Die frühere Erstabrufabweichung wurde in diesem Lauf nicht
  reproduziert; ihre historische Ursache gilt damit nicht als geklärt.
- Startseite, normale Content-Seiten ohne Liste, Produktseite, Suche, Quickview,
  echte Query-Schlüssel, leere Schlüssel und irreführende Parameterwerte wurden
  erneut geprüft. Keine erfundenen Seiten-Canonicals auf Seiten ohne Hauptliste.
  Alle 182 Antworten haben die fünf erwarteten Hreflang-Sprachen und keinen
  Preview-Token im Canonical oder in Sprachlinks. JSON-LD ist in den vorhandenen
  Blöcken syntaktisch parsebar; dies ist keine vollständige Rich-Result-Abnahme.

**Offen: Zähl-/Randseitenkonsistenz.** Die folgenden Werte stammen jeweils aus
derselben Randseitenantwort; keine alten Totals wurden mit neueren Dokumenten
verrechnet. Der Bestand veränderte sich während des gesamten Prüffensters, daher
weichen einige Browserwerte aus früheren Abrufen von dieser späteren Tabelle ab.

| Liste | Total der Randseitenantwort | Größe | Gemeldete letzte Seite | Rechnerische Restmenge | Ausgegebene Artikel dort | Folgeseite |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Alle Artikel | 2.380 | 12 | 199 | 4 | **6** | 200 leer |
| Herren | 1.332 | 24 | 56 | 12 | **20** | 57 leer |
| Alles unter X Euro | 2.358 | 12 | 197 | 6 | **9** | 198 leer |
| Damen | 1.271 | 24 | 53 | 23 | **24** | **54 noch fünf Artikel**, 55 leer |

Damit ist die arithmetische Inkonsistenz im aktuellen Lauf auch bei den beiden
12er-Listen sichtbar. Dort und bei Herren stimmte die untersuchte Grenze zwischen
nicht leer und leer trotzdem; bei Damen ist die Grenze konkret zu niedrig. Frische
HTTP-Sitzungen reproduzieren die Herren-Seiten 54/55/56 mit 24/24/20 Artikeln und
**68 verschiedenen IDs**, die Damen-Seiten 52/53/54 mit 24/24/5 und **53 verschiedenen
IDs**. Keine Wiederholung innerhalb oder zwischen diesen jeweils drei Seiten.
Das ist kein vollständiger Dublettenausschluss über alle früheren Seiten und
beweist keine korrigierte Gesamtzahl. Die native Total-/Grouping-/Cache-Ursache
erfordert weiterhin den oben beschriebenen Trace der vorhandenen einzelnen Suche.
Artikelzählung, Abfrageoptionen und SEO-Seitengrenzen wurden nicht geändert.

**Offen: realer 404-Metadatenpfad.** HTTP 404 wird korrekt gesetzt. Die normale
404-Antwort enthält aber weiterhin `INDEX,FOLLOW` und Ausverkauft-Metadaten;
`?page=2` erhält zusätzlich Ausverkauft-Seiten-Canonical und Seitenzusatz. Das ist
eine Inkonsistenz der Robots-/Canonical-/Titelentscheidung zum Fehlerstatus und
kein fehlender HTTP-404-Status. `?page=999` wird nur aufgrund der Listengrenze
restriktiv. Der lokale `tpl.page-not-found`-Test deckt den abweichenden realen
Kategorie-Rerender nicht vollständig ab. Keine Kategorienkonfiguration verändert.

**Weiterer Befund: serverseitige Lokalisierung.** Vor JavaScript erscheint auf
gültigen deutschen, italienischen und spanischen Folgeseiten weiterhin „Page N“.
Nach JavaScript stehen korrekt „Seite“, „Pagina“ beziehungsweise „Página“ dort.
`PageMetadata.twig` verwendet `locale`, während die ausgegebene `og:locale` leer
bleibt; das spricht für den Fallback `Page` an dieser Renderstelle. Der vorhandene
Sprachwert aus der Lokalisierung sollte für einen gezielten Folgefix wiederverwendet
werden. Es wurde hier keine zusätzliche Sprach-/Templateänderung vorgenommen.

**Neue Nutzervorgabe: leere Artikelkategorien dürfen auf Seite 1 indexierbar
bleiben.** Der ausdrücklich ohne `#` genannte Fall
`/accessoires-guenstig/damenduefte/` wurde im Preview mit Basis-URL und
`page=1/2/999` gelesen: vier HTTP 200, null Artikel, bekannte Grenze 0. Basis und
Seite 1 geben aktuell noch `NOINDEX,FOLLOW` aus; das verletzt die neue Vorgabe.
Seite 2/999 bleiben zu Recht gesperrt, alle vier Canonicals zeigen auf die Basis.

Root Cause ist die bisher pauschale `empty`-Sperre in `SeoPage::getPagination()`.
Lokal wurde ausschließlich für reguläre Artikelkategorien (`tpl.category.item`)
die erste Seite ohne Preisfilter davon ausgenommen. Basis-URL und `page=1` folgen
dadurch wieder den vorhandenen Robots-Vorgaben. Explizites `NOINDEX`, `NOFOLLOW`
und `forceNoIndex` bleiben im bestehenden Merge erhalten; Filter-/Suchschlüssel,
leere Preisfilter-Ergebnisse, fehlerhafte Seiteneingaben und Folgeseiten bleiben
gesperrt. Die bisherige Behandlung leerer eingebetteter Content-Listen bleibt
unverändert. `empty:true`, `pageMax:0` und `valid:false` bleiben erhalten: keine
erfundene zweite Seite, kein neuer Seiten-Canonical, keine zusätzliche Abfrage.
Keine URL- oder Kategorie-ID-Zuordnung ergänzt. **Dieser neue PHP-Fix ist noch
nicht im Test-Pluginset bereitgestellt und wurde nicht als live bestanden gewertet.**

Die ursprüngliche Gesamtsuite wurde zunächst mit 264/264 SEO-Fällen je Twig-Version
erneut bestanden. Nach der neuen Nutzervorgabe wurde ein bisheriger Erwartungswert
für leere Kategorie-Seite 1 gezielt angepasst und um 31 Schutzfälle erweitert.
Keine Validierung wurde ersatzlos entfernt; der historische Vergleich prüft
weiterhin seine gespeicherten Rückgabewerte und behauptet keine unveränderte
Robots-Ausgabe für die jetzt ausdrücklich geänderte leere Erstseite.

| Aktueller lokaler Stand nach dem leere-Kategorie-Fix | Ergebnis |
| --- | --- |
| SEO einschließlich PHP-Kompatibilitätsprüfung, Twig 2.16.1 / 3.30.0 | jeweils **295/295 PASS**, historische Referenzprüfung **190/190 PASS** |
| Gesamtes Twig-Inventar / bestehende Regressionen | jeweils **171/171 Syntax PASS**, **38/38 PASS** samt historischem Vergleich |
| Kontakt-/Newsletter-Layouts | jeweils **60/60 PASS** |
| Ausgelieferte Min-Datei mit aktuellen PHP-Fixtures | **111/111 Metadatenfälle**, **22/22 lokale Chrome-Fälle**, 0 Seitenfehler |
| Bestehender Widget-Browserlauf nach erneut erzeugten Fixtures | **55/55 Szenarien**, **1.332 Assertions**, 0 Seitenfehler, 0 externe Requests |
| PHP-Lint / Node-Syntax / Diff-Check | **12/12 PASS** / **PASS** / **PASS** |
| Echter PlentyONE-Validator/Build und Deployment des neuen PHP-Fixes | **NOT_RUN** |

Keine Test-/Browser-Timeouts oder Transportabbrüche in diesem Gesamtlauf. Eine
erste Offline-Erwartung nahm fälschlich pauschales Homepage-NOINDEX an; der Abgleich
mit `Homepage.twig` bestätigte die bestehende konfigurationsabhängige Regel. Nur
die Audit-Erwartung wurde berichtigt, keine Shop-Einstellung. Suchseiten ohne
Description bleiben in der strengen Browser-Inventur sichtbar und werden wegen
ihres korrekten NOINDEX separat als Nebenbefund bewertet.

**NOT_TESTED bleibt:** explizite restriktive Robots-Kategorie live (Nutzer kennt
keine; keine Einstellung ändern), echte interne kalte/warme ShopBooster-/Suchcaches,
exakte Live-Abfragezahl und vollständige Vorher-/Nachher-Kontextobjekte, vollständiger
hashgebundener Vorher-HTML-Abgleich sowie konfigurierte/erzwungene Canonicals und
mehrdeutige/unbekannte Listen ohne bestehenden Live-Testfall. Die entsprechenden
lokalen Regressionen sind kein Ersatz für diese Laufzeitnachweise.

Alle Belege ignoriert unter `.cache/seo-preview-20261109/full-recheck/`:
`results.json`, `review.json`, `browser-review.json` (manuell aus den CUA-Ausgaben
übertragene kompakte Browserergebnisse), `asset.json`, `delivered-cat.js`,
`asset-metadata.json`, `local-*` und `empty-fix-*` sowie `empty-category/results.json`.
Die Rohantworten bleiben tokenhaltig und unversioniert. **Geänderte Dateien:**
`src/Helper/SeoPage.php`, `tests/seo_pagination.php`, diese README und beide
vorhandenen Changelogs. Alle Assets, Artikelabfragen, Zählung und B2C unverändert.
Alles lokal, uncommittet und unstaged auf `develop`; kein eigener Commit, Push,
Merge, Versionsschritt, Deploy, Sync oder Cache-Invalidieren.

### Sprachzusätze im Server-HTML und 404-Kategorie in Pluginset 426 (2026-11-09)

24 lesende Preview-Abrufe einschließlich Sitzungsaufbau ergaben 21 Antworten mit
HTTP 200 und drei mit HTTP 404. Bei jeder Antwort wurden Preview-Header und
Pluginset 426 geprüft. Der eingebundene Kategorie-Build trug weiterhin den Hash
`69094367d1d589a37705b9029c7e517c8d2c59c7`.

| Serverwert auf Seite 2 | DE | EN | FR | IT | ES |
| --- | --- | --- | --- | --- | --- |
| `html[lang]` und `app-data-custom.language` | de | en | fr | it | es |
| Aus `locale` ausgegebenes `og:locale` | leer | leer | leer | leer | leer |
| Titel und Description im bereitgestellten Stand | Page 2 | Page 2 | Page 2 | Page 2 | Page 2 |
| Titel und Description nach lokalem Twig-Render | Seite 2 | Page 2 | Page 2 | Pagina 2 | Página 2 |

Die ersten drei Zeilen wurden sowohl an der Damen-Content-Liste als auch an der
nativen Kategorie Jeans/Hosen in allen fünf Sprachen gemessen. Die Seitennavigation
derselben Antworten enthielt bereits übersetzte Linktitel. Aus einem leeren HTML-Attribut
lässt sich der PHP-Zustand von `locale` (fehlend, null oder leerer String) nicht unterscheiden.
Das bisherige Partial benutzte diesen optionalen Wert als einzige Sprachquelle und
erkannte nur Unterstriche als Trenner. Der lokale Fix liest die aktuelle Sprache aus
`services.localizationRepository.getLanguage()`, derselben Quelle wie das Layout.
Bei leerer Shop-Sprache greift weiterhin `locale`. Großschreibung, Leerraum und
Regionscodes mit Bindestrich oder Unterstrich werden normalisiert. Unbekannte
Sprachen behalten das bisherige Wort `Page`. Die Ausgabe nutzt die bestehende
Paginierungsentscheidung und die vorhandenen redaktionellen Texte.

**404-Befund.** Der fehlende Pfad `/codex-seo-test-nichtvorhanden/` und der
Direktaufruf `/ausverkauft/` wurden jeweils ohne Parameter, mit `page=2` und mit
`page=999` verglichen. Alle drei Paare hatten denselben Titel, dieselbe Description,
Robots, Canonical, Hreflangs und Paginierungsdaten. Beide Aufrufe renderten die
Content-Kategorie Ausverkauft. Nur der fehlende Pfad lieferte HTTP 404. Auf Seite 2
standen in beiden Antworten `INDEX,FOLLOW` und der Canonical `/ausverkauft/?page=2`.
Die Sperre bei 999 folgte der Listengrenze.

In der lokal einsehbaren IO-Referenz 5.0.80 prüft `CheckNotFound::after()` den
Status der konkreten Response. Bei zugeordneter Fehlerkategorie ruft es
`CategoryController::showCategoryById()` auf und übernimmt deren HTML in die
404-Antwort. Der Controller rendert das normale `tpl.category.<type>`. Damit
bezieht `PageMetadata.twig` die Robots aus den Kategoriedetails, und `Head.twig`
bezieht den Canonical der aktuellen Kategorie aus `UrlService`. Das erklärt auch,
warum ein Test mit `tpl.page-not-found` allein diesen Pfad verfehlt. Der ausgerollte
IO-Quellstand und die interne Renderreihenfolge wurden in 426 nicht instrumentiert.

**Vorschlag für die 404-Korrektur.** Den bereits festgestellten HTTP 404 vor dem
Rendern der Ersatzkategorie als serverseitiges Flag an genau diesen Renderkontext
weiterreichen. Zuerst in der eingesetzten IO-Version prüfen, ob der bestehende
Template-Hook auf dieselbe Response zugreifen kann. Ein Flag im Aufrufparameter
von `showCategoryById()` allein genügt in IO 5.0.80 nicht, da der allgemeine
Kategoriepfad eigene Template-Daten zusammenstellt. Im markierten Render soll der
Head `NOINDEX` mit bestehenden strengeren Direktiven zusammenführen, den
Kategorie-Canonical und die zugehörigen Sprach-/Paginierungslinks auslassen und
für Server und Kategorie-JS keinen Seitenzusatz freigeben. Die Artikelliste kann
unverändert im Body erscheinen. Der Kontrollfall für die Abnahme ist der direkte
HTTP-200-Aufruf von Ausverkauft auf denselben Seiten, auch bei wechselnder Reihenfolge.
Die Umsetzung dieses Vorschlags bleibt offen.

**Leere Artikelkategorie.** Damendüfte hatte beim erneuten Preview-Abruf auf der
Basis-URL sowie mit `page=1/2/999/abc` null Artikel, Seitengrenze 0 und denselben
Basis-Canonical. Alle fünf Antworten lieferten noch `NOINDEX,FOLLOW`. Basis und
Seite 1 verfehlen damit die gewünschte Vorgabe im bereitgestellten Stand. Lokal
bestehen alle 31 gezielten Schutzfälle. Die gerenderten Erstseiten und ungültigen
Varianten werden auch auf unveränderten Titel, Description und fehlende Seitenlinks geprüft.

**Lokale Regression.** Twig 2.16.1 und 3.30.0 bestanden jeweils 342/342 SEO-Fälle,
darunter 40 neue Server-HTML-Fälle und sieben Sprachquellen-/Formatfälle. Der
historische Vergleich ergab jeweils 190/190. Twig-Syntax 171/171, bestehende
Regressionen 38/38 und Kontakt-/Newsletter-Layouts 60/60 je Version. Der bereits
aus 426 gesicherte, lokal bytegleiche JS-Build bestand 111/111 Metadatenfälle und
22/22 Chrome-Fälle. Der Widget-Browserlauf bestand 55/55 Szenarien mit 1.332
Assertions, null Seitenfehlern und null externen Requests. PHP-Lint 12/12,
Node-Syntax und Diff-Prüfung bestanden. Die neuen Sprachtests machten den Fehler
vor dem Twig-Fix auf beiden Listenarten reproduzierbar. Der erste Netzwerkversuch
in der Sandbox scheiterte an DNS, der anschließende Preview-Lauf war vollständig.
Belege liegen lokal unter `.cache/seo-preview-20261109/locale-404/`.

PlentyONE-Validator und Build für die lokalen Änderungen sind `NOT_RUN`.
Die Live-Abnahme beider lokalen Korrekturen steht nach einer Bereitstellung aus.
Eine explizit auf NOINDEX/NOFOLLOW konfigurierte Kategorie bleibt live `NOT_TESTED`.

### PlentyONE-Buildkorrektur (2026-11-09)

Ausgangsstand dieses Folgefixes: `c5387abef15f25e03e1ad183751f2b1407713cf3`
(`SEO Test 1`), sauberer Branch `develop`. Der Nutzer meldete einen abgebrochenen
produktiven PlentyONE-Build mit vier PHP-Validierungsfehlern. Die vorherigen
Standard-PHP-/Twig-Tests deckten diese Pluginrestriktionen nicht ab.
**Während dieses lokalen Fixlaufs wurde kein PlentyONE-Validator/Build ausgeführt.**
Die anschließende Nutzer-Bereitstellung und Live-Teilprüfung sind oben separat dokumentiert.

| Gemeldete Stelle im Ausgangsstand | Konkrete Korrektur |
| --- | --- |
| `Base_Extension.php:314`, `new SeoPage(...)` | `pluginApp(SeoPage::class, [...])` mit expliziten benannten Konstruktorparametern für Query, Template und Seitendaten |
| `SeoPage.php:39`, `is_finite()` | Positiver Wertebereich unterhalb von `PHP_INT_MAX`, danach Ganzzahligkeitsprüfung mit erlaubtem `floor()` |
| `SeoPage.php:106`, `$parse($blockRobots)` | Direkter Aufruf der privaten Methode `parseRobotsDirectives()` |
| `SeoPage.php:107`, `$parse($categoryRobots)` | Derselbe benannte Methodenaufruf; keine dynamischen Funktionsaufrufe mehr |

Der Konstruktor bleibt erhalten; die Factory bekommt sämtliche Daten dieses
Renders. Für `SeoPage` existiert keine Singleton-/Shared-Bindung im Theme und es
wird keine ergänzt. Es wird weiterhin kein `CategoryContext` mit einer Quellkategorie
initialisiert. Die vorhandene Capture-Referenz wird unverändert in `finally`
zurückgesetzt; HTML-Wiederverwendung und genau eine Artikelabfrage bleiben gleich.

Die Bereichsprüfung verwirft `NaN`, positive/negative Unendlichkeit, negative
Zahlen, Bruchwerte und Werte außerhalb des Integerbereichs. Bekannte 0, bekannte 1
und unbekannte Grenzen bleiben verschieden. Die bisherige strikte Prüfung von
Seitennummern und Seitengrößen mit `preg_match()` und `filter_var()` bleibt erhalten.
Ein ungültiger effektiver Wert bricht weiterhin **vor** `getResults()` ab;
die Division bleibt geschützt. Zusätzlich wird auch die bereits eingeführte
`UnexpectedValueException` über `pluginApp()` erzeugt. Typ und Fehlermeldung
bleiben gleich; damit enthält dieser Produktionscode auch hier kein `new` mehr.
Dies ist eine vorsorgliche Ergänzung des Audits, kein fünfter vom Server gemeldeter Fehler.

**Zusätzlicher PHP-Audit:** Der komplette neue Helper und die SEO-Methoden
`createSeoPage()`, `prepareSeoContent()` und `getItemsFromCat()` wurden geprüft.
Alle 23 dort verwendeten nativen Funktionen und `UnexpectedValueException` sind in
der offiziellen Liste [Allowed PHP functionality](https://developers.plentymarkets.com/en-gb/interface/stable7/NativePHPFunctionsAndClasses.html)
aufgeführt. Die Factory-Signatur ist im offiziellen
[plugin-interface-Funktionsstub](https://github.com/plentymarkets/plugin-interface/blob/3893fe678aca9b5820aeefde5849b96a9e0d33f9/functions_stub.php)
dokumentiert; benannte Factory-Parameter zeigt das offizielle
[Katalog-Beispiel](https://developers.plentymarkets.com/en-gb/developers/main/export-plugins/basic-usage.html).
`throw pluginApp(...)` wird auch im bestehenden
[IO OrderItemBuilder](https://github.com/plentymarkets/plugin-io/blob/9b7c6212bccae75a4644da723dfa7e2af176f044/src/Builder/Order/OrderItemBuilder.php)
verwendet. Stand der Quellenprüfung: 2026-11-09.

Ein gezielter tokenbasierter Source-Check in `tests/seo_pagination.php` prüft diese
vier Codebereiche gegen das Funktionsinventar und sperrt dort direkte
Instanziierung, `clone`, dynamische Funktionsaufrufe sowie Include-/Eval-Konstrukte.
Der Negativtest erkennt im echten Ausgangscode die vier gemeldeten Problemstellen
und den zusätzlichen direkten Exception-Konstruktor. Dies ist ein begrenzter
Regressionscheck, **keine Nachbildung oder Ausführung des PlentyONE-Validators**.
Nicht betroffener Legacy-Code wird damit nicht als neuer Buildfehler bewertet.
Es wurden keine weiteren nicht belegten nativen Aufrufe in den SEO-Ergänzungen gefunden.

| Nach dem Fix ausgeführte Prüfung | Ergebnis |
| --- | --- |
| SEO-/Kompatibilitätsregressionen mit Twig 2.16.1 und 3.30.0, PHP 8.4.23 | jeweils **250/250 PASS**, 0 Fehler |
| Vergleich mit unmittelbar vor dem Fix erfassten Ergebnissen | jeweils **190/190 identisch** |
| Twig-Syntax, gesamtes Inventar | jeweils **171/171 PASS** |
| Bestehende Twig-Regressionen samt historischem Baseline-Vergleich | jeweils **38/38 PASS** |
| Bestehende Kontakt-/Newsletter-Layoutfälle | jeweils **60/60 PASS**, DE/EN/FR/IT/ES |
| Bestehender Kontakt-Widget-Browsertest mit installiertem Chrome | **55/55 Szenarien**, **1.332 Assertions**, 0 JS-Fehler, 0 externe Requests |
| `php -l`, alle PHP-Dateien unter `src/` und `tests/` | **12/12 PASS** |
| `git diff --check` | **PASS** |
| Echter PlentyONE-Validator, Plugin-Build und Laufzeit | **NOT_RUN nach dem Fix** |

Die 60 zusätzlichen Fälle enthalten Zahlen-Sonderwerte, Überläufe, ungültige
effektive Seitengrößen/-nummern, unveränderten Exception-Typ/-Text, Abbruch vor
einer Abfrage, getrennte Factory-Objekte, die Source-Prüfung und den Vorhervergleich.
Die bisherigen Fälle sichern weiterhin Kategorie-Kontext, Robots, Canonicals,
gefilterte Gesamtzahlen, individuelle ShopBuilder-Argumente und HTML-/Abfrageparität.
Factory- und Shop-Dienste bleiben lokale Fixtures; die tatsächliche
Container-/Build-Ausführung in PlentyONE ist damit nicht nachgewiesen.
Bekannte PHP-8.4-/Twig-Deprecations sind separat in den Reports erfasst.
Bei diesen Testläufen gab es keine Test- oder Timeout-Abbrüche.

Ein separat ausführbarer PlentyONE-PHP-Validator steht für diesen lokalen Testlauf
nicht zur Verfügung. Das installierte PlentyDevTool wurde nicht gestartet; ein
Pluginset-Build, Sync oder Deployment wurde nicht ausgelöst. Vor einer Freigabe
muss der Nutzer die serverseitige Validierung und die unten beschriebene
B2B-Test-Pluginset-Abnahme wiederholen. Der gemeldete fehlgeschlagene Build wird
durch lokale Syntax-/Funktionsprüfungen nicht nachträglich als bestanden gewertet.

Berichte: `.cache/seo-buildfix-before{2,3}.json`,
`.cache/seo-buildfix-after{2,3}.json`, `.cache/seo-buildfix-regression{2,3}.json`,
`.cache/seo-buildfix-contact{2,3}/render-report.json` und
`.cache/seo-buildfix-contact-browser.json`. Den Ergebnisvergleich mit erhaltenen
Vorher-Reports beispielsweise so wiederholen:

```powershell
$seoPhp = '.cache/php-runtime/php-8.4.23/php.exe'
foreach ($seoEngine in 2, 3) {
    & $seoPhp -d extension_dir=.cache/php-runtime/php-8.4.23/ext -d extension=mbstring tests/seo_pagination.php ".cache/contact-widget/autoload$seoEngine.php" ".cache/seo-buildfix-after$seoEngine.json" "--compare=.cache/seo-buildfix-before$seoEngine.json"
}
```

Ohne optionales `--compare` laufen 249 Fälle; der 250. Fall ist der Vergleich mit
den 190 Ergebnissen des Vorher-Reports. Der Vergleich setzt diese unveränderten
lokalen Reports voraus und erstellt sie nicht aus bereits korrigiertem Code neu.

**Dateien dieses Buildfixes:** `src/Extensions/Base_Extension.php`,
`src/Helper/SeoPage.php`, `tests/seo_pagination.php`, `README.md`,
`meta/documents/changelog_de.md`, `meta/documents/changelog_en.md`.
Keine Twig-/Asset-/Konfigurationsänderung; Produktversion weiterhin 1.0.7.
Alles lokal, uncommittet und unstaged auf `develop`; kein Commit/Push/Merge,
kein Deployment/Sync, keine Cache-Aktion und keine B2C-Änderung durch diesen Fix.

### Renderreihenfolge und Kategorie-Kontext

`PageDesign.twig` erzeugt ein neues `SeoPage`-Objekt für **diesen Seitenrender**.
Nach der vorhandenen Widget-/Komponentenregistrierung, aber vor dem HTML-Head,
ruft der neue Block `PrepareSeoContent` ausschließlich im Content-Template
`prepareSeoContent()` auf. Der kleine Adapter `PreparedShopBuilder.twig` verwendet
die vorhandene Funktion `shop_builder_category_template()` genau einmal. Ihr HTML
wird unverändert im Objekt gehalten und im bisherigen `PageBody` ausgegeben;
`script2`-Ersetzung, Kategorie-Beschreibungen und HTML-Struktur bleiben am alten Ort.
Header, Footer und der übrige `PageBody` werden nicht vorgezogen.

Während dieses einen Renderaufrufs meldet `getItemsFromCat()` die ohnehin
ermittelten Werte `currentPage`, `pageMax` und `itemCountTotal` an das Objekt.
`itemList.total` stammt weiterhin aus **derselben gefilterten Abfrage** wie die
Artikel. Pro Liste bleibt es bei einem `getResults()`-Aufruf mit den vorhandenen
Artikel-/Facetten-Factories, ohne zusätzliche Zählabfrage. Die zeitweise aktive
Referenz auf das Objekt ist eine Instanzvariable der bestehenden Twig-Extension,
wird in `finally` zurückgesetzt und speichert weder HTML noch Seitendaten global,
statisch oder persistent. Ein zweiter Vorbereitungsaufruf verwendet das HTML erneut.

Die Parameter stehen weiterhin individuell **im echten PlentyONE-ShopBuilder**,
beispielsweise für `/herren/`:

```twig
{{ getItemsFromCat(60, 24, [727]) | raw }}
```

Das Theme enthält keine Zuordnung von Content-URLs zu Artikelkategorien, keine
Analyse von Funktionsquelltext und keine feste Seitengröße 24. Erfasst werden
ausschließlich die beim tatsächlichen Funktionsaufruf validierten Werte und
das Resultat seiner eigenen, durch die vorgegebenen Facetten gefilterten Abfrage.
Ohne diesen Aufruf entstehen keine entsprechenden Paginierungsdaten, auch wenn
die normale Content-Seite einen ShopBuilder oder ausschließlich einfache Widgets hat.

Die nicht benötigte Initialisierung des gemeinsamen `CategoryContext` mit der
Artikel-Quellkategorie entfällt. Die Quellkategorie bleibt ausschließlich in den
Parametern des Listen-Templates; die aufgerufene Content-Kategorie bleibt für
Robots, Titel, Beschreibung, Canonical, Sprachlinks und Navigation maßgeblich.
**Einzige notwendige Änderung an `getItemsFromCatSimple()`:** Auch dort entfällt
diese Kontextinitialisierung, weil einfache Widgets im vorgezogenen ShopBuilder
vorkommen können. Deren Abfrage, Filter, Seitenauswahl und HTML bleiben gleich.

Andere konfigurierte Seitenlayouts ohne den neuen Vorbereitungsblock verlieren
keine Inhalte: `CategoryContent.twig` rendert den ShopBuilder dann einmal am
bisherigen Ort. Ohne frühe Listendaten bleibt die SEO-Behandlung vorsichtig.
Für die vollständige Abnahme deshalb die bestehenden Overrides `page_design`,
`head`, `category_content` und für reguläre Kategorien `category_item` prüfen.
Keine Konfigurationswerte wurden automatisch gesetzt; `all` ist keine Voraussetzung.

### Robots, Seitengrenzen und Canonicals

- `SeoPage.php` bündelt nur die gemeinsame SEO-Auswertung. Fehlendes `page` wird
  als Seite 1 behandelt. Leere, negative, nullwertige, nicht ganzzahlige oder
  nichtnumerische Eingaben sowie Array-/Überlaufwerte bleiben als ungültige
  Rohparameter erkennbar. Eingebettete Listen verwenden eine sichere Seite 1 und
  anschließend die effektiven Werte aus `SearchOptions::validateItemListOptions()`.
- Listendarstellung und SEO rechnen mit derselben effektiven Seitengröße.
  Ungültige Größen verwenden den vorhandenen Ceres-Default. Liefert auch der
  Validator keine positive ganzzahlige Größe, wird vor der Abfrage ein klarer
  Fehler ausgelöst; keine Division durch null und kein erfundener Ersatzwert.
- Eine bekannte Maximalzahl 1, ein bekanntes leeres Ergebnis 0 und eine unbekannte
  Maximalzahl `null` bleiben verschieden. Reguläre Kategorien verwenden ihre
  vorhandenen Ceres-Seitendaten. Genau ein `getItemsFromCat()`-Ergebnis im
  Content-ShopBuilder gilt als eindeutig zuordenbare paginierte Hauptliste.
  Bei mehreren solchen Listen wird keine willkürlich ausgewählt; reine einfache
  Widgets zählen nicht als paginierte Hauptliste.
- Pro Metadatenpfad entsteht ein endgültiges Robots-Tag. Blockvorgaben,
  Kategorie-Vorgaben, `forceNoIndex`, `NONE`, `ALL` und bestehendes `NOFOLLOW`
  werden berücksichtigt. Pagination und Parameterregeln können nur einschränken.
  Das separate Startseiten-Tag verwendet dieselbe Auswertung, damit ein
  erzwungenes `NOINDEX` dort ebenfalls kein konfiguriertes `NOFOLLOW` verliert.
- Harte Parameter werden anhand tatsächlicher Query-Schlüssel erkannt:
  `query`, `currency`, `quickViewItem`, `facets`, `sorting`, einschließlich
  vorhandener Groß-/Kleinschreibungsvarianten und leerer Werte. `notsorting`,
  Tracking-Schlüssel und Text wie `sorting=x` in einem anderen Parameterwert
  lösen diese Sperre nicht aus. Der zuvor ungenutzte Soft-Parameter-Pool entfällt.
- Bestätigt gültige Listenseiten ab Seite 2 erhalten `?page=N` im Canonical
  und in passenden Sprachlinks. Seite 1 behält die Basis-URL. Ungültige,
  leere, mehrdeutige oder nicht belegbare Folgeseiten erhalten `NOINDEX`
  unter Erhalt strengerer Direktiven und einen Basis-Canonical. Das gilt auch
  für Content ohne Liste und Produktseiten mit künstlichem `page`-Parameter;
  eine unbekannte Grenze wird dabei nicht als bestätigte Überschreitung behandelt.
  Titel-/Beschreibungszusätze und Head-`prev`/`next` setzen belegte gültige Seiten voraus.
- `getCanonicalURL()`, dessen `ignoreCanonical`-Argument sowie
  `getLanguageURLs()` bleiben die URL-Quelle. Explizite `canonicalLink`-Werte
  und `forcedCanonicalUrl` werden einschließlich ihrer Querys respektiert;
  fehlende URLs erzeugen kein leeres Canonical-Tag. Das vorhandene
  `getCanonicalQueryString()` wurde geprüft: Es liefert grundsätzlich alle
  bereinigten Request-Parameter, also auch unerwünschte Filter-/Sortierparameter.
  Deshalb wird es hier nicht pauschal an die URL angehängt. Die bestehende
  Beschränkung auf den belegten `page`-Parameter bleibt erhalten.
- Der lokale Renderlauf deckte außerdem ungeschützte Aufrufe nicht definierter
  Metadatenblöcke auf: `url` wird nun vor Zugriff geprüft, der ungenutzte
  `type`-Aufruf entfällt. Die bestehenden Titel-/Beschreibungsblöcke bleiben erhalten.

**HTTP-Status:** Phase 1 verändert den Response-Status nicht. IOs
`CheckNotFound::after()` ersetzt bei Status 404 gegebenenfalls den Inhalt durch
einen weiteren Kategorien-/404-Render. Die benötigten Content-Seitendaten entstehen
hier erst beim Twig-Render. Ein später Statuswechsel könnte somit zusätzliches
Rendering samt Abfragen und fremden Widgets auslösen. Ohne Änderung der
Controller-/Middleware-Grenze und echte Laufzeitabnahme wäre dies riskant.
Die beauftragte sichere Alternative ist `NOINDEX` plus Basis-Canonical; eine
ungültige Folgeseite kann weiterhin HTTP 200 liefern. Es wurde keine künstliche
404-Seite, kein globales 404-Flag und kein zweiter Controller-Durchlauf ergänzt.

Geprüfte Primärquellen: Ceres
[CategoryContext](https://github.com/plentymarkets/plugin-ceres/blob/stable/src/Contexts/CategoryContext.php)
(`1bb8dd3ea3c2e91c669aacacaeef795791530ae5`),
[SearchOptions](https://github.com/plentymarkets/plugin-ceres/blob/stable/src/Helper/SearchOptions.php)
(`e79651afd303b3ed8291a13b7fcd0c43cfc28f04`), IO
[UrlService](https://github.com/plentymarkets/plugin-io/blob/stable/src/Services/UrlService.php)
(`069aa1e9dbf875174362bae09d26e807227179cb`) und
[CheckNotFound](https://github.com/plentymarkets/plugin-io/blob/stable/src/Middlewares/CheckNotFound.php)
(`9d1a71b11a967ffd265d98540a0b8228e4bd6f0e`). Die SHAs bezeichnen die gelesenen
Datei-Blobs; die tatsächlich installierten Plugin-Versionen sind nicht verifiziert.

### Lokale Tests und Grenzen des ursprünglichen Phase-1-Stands

Die folgende Tabelle dokumentiert den ursprünglichen 190-Fälle-Lauf vor dem
Buildfix. Die aktuellen Ergebnisse stehen oben. PHP **8.4.23**, Twig **2.16.1**
und **3.30.0**, jeweils ohne PlentyONE-Services:

| Prüfung | Ergebnis je Twig-Version |
| --- | --- |
| `tests/seo_pagination.php` | **190/190 PASS**, 0 Fehler |
| Gesamtes Twig-Inventar mit `tests/twig_regression.php` | **171/171 parsebar** |
| Bestehende Twig-Regressionen samt historischem Baseline-Vergleich | **38/38 PASS** |
| Kontakt-/Newsletter-Layouttests `tests/contact_widget.php` | **60/60 PASS**, fünf Sprachen |

Zusätzlich: **12/12 PHP-Dateien** unter `src/` und `tests/` mit `php -l` gültig;
`git diff --check` bestanden. Der bestehende Kontakt-Widget-Browsertest bestand
mit dem installierten Chrome: **55/55 Szenarien, 1.332 Assertions**, keine
JavaScript-Fehler und keine externen Requests. Sein erster Start wurde wegen
einer fehlenden Playwright-Standard-Browserdatei abgebrochen; die Wiederholung
mit explizitem Chrome-Pfad bestand. Keine Test-Timeouts. Dieser Browsertest
prüft lokale Widget-Vorschauen, keinen vollständigen ShopBuilder-Shop.

Der SEO-Lauf prüft reguläre Kategorien mit 69, 1, 0 und unbekannter Seitenzahl;
Content mit genau einer, mehreren und keiner Liste; gültige/letzte/ungültige Seiten;
leere/nichtnumerische/negative/Array-Seitenparameter; ungültige Größen und
ungültigen Default; Facetten, Preisbereich und Sortierung; Robots-/Blockvorgaben,
Startseite, Produkt-Metadatenpfad, Suche, Quickview und 404; explizite/fehlende
Canonicals, Sprachlinks und wiederholte Seiten-/Filter-/Sprachvarianten.
Kategorie-Service und gemeinsamer Kategorie-Kontext werden vor/nach dem
vorgezogenen Render verglichen. Auch Fehlerfälle räumen den Capture auf.

Für Seite 1, 2 und 69 wird die **tatsächliche PHP-Methode aus Ausgangscommit
`15d06d2`** ausgeführt und mit der neuen verglichen: Listen-HTML byteidentisch,
Artikelreihenfolge und Abfrageparameter identisch, jeweils ein `getResults()`.
Auch der einfache Widget-Aufruf bleibt im HTML-/Abfragevergleich identisch.
Weitere direkte ShopBuilder-Aufrufe prüfen das Beispiel `(60, 24, [727])` sowie
unterschiedliche Quellkategorien, Facetten und Seitengrößen **7, 12, 24 und 48**.
Die gefilterten Fixture-Gesamtzahlen unterscheiden sich von der ungefilterten
Quellzahl; gültige und ungültige Seiten müssen sich nach genau diesem Resultat
richten. Für Content ganz ohne PHP-Listenaufruf und für ausschließlich einfache
Widgets wird ausdrücklich `hasList=false` und `pageMax=null` geprüft.
Das reale `CategoryItemContent`, Filter- und Pagination-Template werden gerendert;
Artikelkacheln, Suchergebnisse und externe Shop-Dienste sind lokale Fixtures.
Dies ist kein Beleg für reale Plenty-Daten, Preisberechnung oder vollständige
Shop-/Browserfunktion. PHP-8.4-/Twig-Deprecations sind separat in den Reports erfasst.

Wiederholung mit vorhandenen lokalen Werkzeugen (Berichte nur unter `.cache/`):

```powershell
$seoPhp = '.cache/php-runtime/php-8.4.23/php.exe'
foreach ($seoEngine in 2, 3) {
    $seoAutoload = ".cache/contact-widget/autoload$seoEngine.php"
    & $seoPhp -d extension_dir=.cache/php-runtime/php-8.4.23/ext -d extension=mbstring tests/seo_pagination.php $seoAutoload ".cache/seo-phase1-twig$seoEngine.json"
    & $seoPhp -d extension_dir=.cache/php-runtime/php-8.4.23/ext -d extension=mbstring tests/twig_regression.php $seoAutoload ".cache/seo-phase1-regression$seoEngine.json" --compare=.cache/contact-widget/baseline-twig2.json
    & $seoPhp -d extension_dir=.cache/php-runtime/php-8.4.23/ext -d extension=mbstring tests/contact_widget.php $seoAutoload ".cache/seo-phase1-contact$seoEngine"
}
```

Die Autoloader/Parser sind lokale Testwerkzeuge, keine Plugin-Abhängigkeiten.
Der neue Test legt seine temporäre Baseline neben dem Report ab und entfernt sie
nach dem Laden. Es wird kein Cache für SEO-Daten oder HTML hinzugefügt.

### Manuelle B2B-Test-Pluginset-Abnahme – teilweise geprüft, weitere Schritte offen

Die oben protokollierte Live-Teilprüfung deckt inzwischen Teile der folgenden
Matrix ab. Profiling, Cache-/Konfigurationsfälle und vollständige Shopfunktionen
bleiben offen; die Matrix ist nicht insgesamt als bestanden freigegeben.

1. Lokalen Diff prüfen und den freigegebenen Stand manuell in ein isoliertes
   **B2B-Test-Pluginset** übertragen. Bestehende Konfigurationen/Zuordnungen vorher
   sichern, Overrides gezielt vergleichen und dort manuell bauen/bereitstellen.
   Keine B2C-Zuordnung, kein gemeinsamer Betrieb beider Themes im selben Pluginset.
   Kein Produktiv-Deploy, kein Sync und keine Cache-Aktion wurde hier ausgeführt.
2. Tatsächliche PHP-/Twig-/Ceres-/IO-Versionen, Plugin-Autoloading des neuen
   Helpers, frühe ShopBuilder-Ausführung und aktive Partial-Zuordnungen prüfen.
   Mit Request-Profiling pro paginierter Liste **genau einen** bisherigen
   `getResults()`-Aufruf nachweisen, ohne zusätzliche Zählabfrage. Komponenten,
   zusätzliche Styles/Scripts und Widget-Registrierung im gebauten Shop prüfen.
3. `/damen/` und `/herren/` jeweils ohne `page`, mit `page=1`, `2`, letzter realer
   Seite und `999` prüfen. Eine reguläre mehrseitige Kategorie, eine Kategorie
   mit genau einer Seite, eine leere Kategorie, eine Content-Seite ohne Liste
   und eine explizite `NOINDEX,NOFOLLOW`-Kategorie in dieselbe Matrix aufnehmen.
   Tatsächliche Seitengrenzen aus **gefilterten** Ergebnissen verwenden.
4. Zusätzlich `page=0`, `-1`, `abc`, leer und eine ungültige Seitengröße prüfen;
   Suche, Facetten, Preise, Sortierung, Währung, Quickview, Produkt, Startseite
   und echte 404 testen. Pro gerendertem Pfad genau ein Robots-Tag, keine
   Lockerung von `NOINDEX`/`NOFOLLOW`, kein leeres oder künstlich paginiertes
   Canonical und die oben beschriebene HTTP-200-Fallbackbehandlung kontrollieren.
5. Auf `/damen/` und `/herren/` Kategorieidentität, Meta-Titel/-Beschreibung,
   Robots, Canonical und Hreflang vor/nach dem ShopBuilder vergleichen; die
   Quellkategorie darf nur die Liste bestimmen. Gültige Listen mit dem vorherigen
   Stand auf Artikel, Reihenfolge, Struktur, Filter und Sortierung vergleichen.
6. DE/EN/FR/IT/ES und kalte/warme Cache-Aufrufe abwechselnd für Seite 1/2/999,
   gefilterte/ungefilterte Varianten und beide Content-Kategorien prüfen.
   Falls ShopBuilder bereits gerendertes HTML liefert und dadurch kein
   `getItemsFromCat()`-Aufruf erfasst wird, greift bewusst der sichere
   Basis-Canonical-/NOINDEX-Fallback. Die vollständige indexierbare Pagination
   ist in diesem Cache-Pfad **noch nicht abgenommen**; nicht durch erneute
   Abfragen oder ungeprüfte Cache-Änderungen umgehen.
7. Widgets, Magic-Menü/Kategorienavigation, Header/Footer, Kontakt/Newsletter,
   Login, Warenkorb, Netto-/Brutto-/Währungs- und Preisverhalten sowie den
   Bestellablauf im echten Test-Shop prüfen. Diese Laufzeittests bleiben offen.

**Geänderte Dateien dieser Phase:** `src/Extensions/Base_Extension.php`,
`src/Helper/SeoPage.php`, `Category/Content/CategoryContent.twig`,
`Category/Content/PreparedShopBuilder.twig`, `Category/Item/CategoryItem.twig`,
`Homepage/Homepage.twig`, `PageDesign/PageDesign.twig`,
`PageDesign/Partials/Head.twig`, `PageDesign/Partials/PageMetadata.twig`
(Twig-Pfade relativ zu `resources/views/`), `tests/seo_pagination.php`,
`tests/twig_regression.php`, `tests/contact_widget.php`, diese README und beide
bestehenden Changelogs. Produktversion unverändert **1.0.7**.

## Newsletter-Hinweis für B2B (2026-11-09)

Eine kompakte Karte erscheint nach dem Scrollen ab 2.000 px. Der Link und die
Texte folgen der Shopsprache DE, EN, FR, IT oder ES. Auf allen fünf
Newsletter-Anmeldeseiten sowie in Quickviews, im ShopBuilder, Warenkorb und
Bestellablauf wird die Karte ausgelassen.

- `PageDesign.twig` bindet `NewsletterPopup.twig` außerhalb von Vue ein. Die
  vorhandenen Popup-Handler in `main`, `cat`, `item` und `vue` verwenden
  die B2B-Karte. Styles stehen in `main.css` und der geladenen Min-Datei.
  Die ausgelieferten Assets verwenden `buildHash` mit dem Zusatz `nl2` für CSS
  und `nl1` für JavaScript.
- Die weiße Karte sitzt rechts unter dem sichtbaren Header und der Vorteilsleiste.
  Sie ist auf dem Desktop 360 px und mobil höchstens 306 px breit. Bei geöffneten
  Shop-Menüs, Filtern, Warenkorb oder Kontaktfenster wird sie ausgeblendet.
  Auf niedrigen Viewports bleibt Platz für die vorhandenen Bedienelemente.
- Bei aktivem Consent-Manager wartet die Karte auf eine Antwort. Wenn die
  Cookie-Sperre konfiguriert und der Manager noch nicht verfügbar ist, bleibt
  sie verborgen. Nur das Schließen über X setzt
  `o46_b2b_newsletter_dismissed` für sieben Tage. Das Cookie ist hostgebunden
  und verwendet `Path=/`, `Secure` und `SameSite=Lax`.
- Lokal geprüft wurden je 60 Layoutfälle mit Twig 2 und 3, alle fünf
  Linkziele sowie 35 Chromium-Fälle über die sieben angeforderten Breiten.
  Cookie-Ablauf und Consent wurden mit lokalen Fixtures simuliert.
  PlentyONE-/Ceres-Abnahme und Live-Anmeldungen sind `NOT_RUN`.

## Kontakt-Widget für B2B (2026-11-03)

Lokal auf dem zuvor sauberen `develop` bei `0b31a98b198d5c48be4aaa6c9e56edfd3678ed98`
ergänzt. Die folgenden Änderungen sind uncommittet und unstaged zur Kontrolle in
GitHub Desktop. Plugin-Identität, Version und vorhandene Konfigurationen bleiben erhalten.

Der schwebende Button **„Kontakt / Beratung“** besteht aus einer weißen
Beschriftungsfläche und einem runden Chat-Symbol in Outlet46-Grün. Er bleibt auf
vollständigen Shopseiten sichtbar. Der Button öffnet ein freundliches Kontaktfenster
mit genau zwei vollständig anklickbaren Kontaktzeilen:

1. **Outlet46 auf WhatsApp – Direktchat öffnen.** Der Link zum Chat mit
   +49 176 85450807 verwendet einen neuen Tab mit `rel="noopener noreferrer"`.
   [WhatsApp-Direktchat](https://wa.me/4917685450807)
2. **Outlet46 B2B – Kontakt per E-Mail:** `mailto:b2b@outlet46.de`, dieselbe
   Adresse wie im vorhandenen B2B-Footer.

Das X schließt ausschließlich das Kontaktfenster. Erneuter Klick auf den Button,
Escape innerhalb des Widgets, ein Außenklick oder der Fokuswechsel zu einer
anderen Shopkontrolle schließen es ebenfalls. Beim Öffnen erhält das X den Fokus;
beim Schließen per X/Escape/Button kehrt er zum Button zurück. Tab kann das
nicht-modale Fenster verlassen. Der Button besitzt `aria-expanded`, `aria-controls`
und `aria-haspopup`; Dialogtitel, beschriftete Schaltflächen und sichtbare
Tastaturfokus-Zustände sind vorhanden. Es gibt keinen dauerhaften Ausblendschalter
und keinen Storage-/Cookie-Zustand für dieses Widget.

### Einbindung und Darstellung

- `PageDesign.twig` bindet das CSS im Head und das Twig-Partial mit einem
  aufgeschobenen Vanilla-JavaScript am Body-Ende **außerhalb von `#vue-app`** ein.
  Die vorhandene Bedingung `isQuickView` bedeutet in diesem Theme tatsächlich
  „kein `quickViewItem` angefordert“. Innerhalb dieser Abgrenzung wird das Widget
  auf vollständigen Seiten einmal eingebunden; Quickview-Ausgaben erhalten weder
  Widget noch dessen CSS/JS. Es gibt keine Einbindung in wiederholte Item-Partials.
- Beide Ressourcen verwenden `plugin_path('GuardiansBasicB2B')` und den bestehenden
  `buildHash`. Keine feste Pluginset-ID, keine externe Bibliothek, kein zusätzlicher
  Dienst und kein Build-Schritt. SVGs sind inline; das Widget führt beim Laden
  keine externen HTTP-Anfragen aus. Die Initialisierung ist gegen doppelte
  Skriptausführung abgesichert und verändert keine Ceres-Komponente.
- Voraussetzung ist das bereits vorhandene B2B-Override `page_design` bzw. `all`.
  Der Provider und die expliziten PlentyONE-Einstellungen werden nicht verändert.
  Die tatsächliche Zuordnung im Test-Pluginset bleibt zu prüfen.
- Desktop: 380 px breites Fenster über dem Button. Mobil: auf die verfügbare
  Breite begrenzt, Safe-Area-Abstände und dynamische Viewporthöhe berücksichtigt;
  bei geringer Höhe scrollt nur das Fenster. Kontaktzeilen sind mindestens 82 px,
  das X 44 px und das Chat-Symbol 56 px groß. Reduzierte Animationen werden beachtet.
- Alle eigenen Klassen beginnen mit `o46-b2b-contact-`. Die einzige Anpassung
  einer vorhandenen Kontrolle ist der Abstand des `#totop`-Buttons auf vollständigen
  Widget-Seiten, damit er den Kontaktbutton nicht überlagert. `z-index: 990` hält
  Warenkorb-Backdrop (997), Warenkorb und Shop-Modals darüber bedienbar.
- Neun neue Schlüssel `Template.o46B2bContact…` je Sprache sind im vorhandenen
  Übersetzungssystem ergänzt: Deutsch, Englisch, Französisch, Italienisch und
  Spanisch. Der deutsche Text liegt unter `de`; bestehende Schlüssel und die
  konfigurierte Shop-Sprache werden nicht verändert.
- Gestaltung nach der beschriebenen [bedrop-Referenz](https://bedrop.de/), angepasst
  an Outlet46. Der übergebene Anhang enthält nur Text; separate Referenz-Screenshots
  lagen diesem Auftrag nicht bei.

### Dateien dieses Auftrags

| Datei | Zweck |
| --- | --- |
| `resources/views/PageDesign/Components/ContactWidget.twig` | Neue Komponente mit lokalen SVGs und Kontaktlinks |
| `resources/css/contact-widget.css` | Layout, Farben, responsive Größen und Fokuszustände |
| `resources/js/contact-widget.js` | Öffnen/Schließen, Fokus und einmalige Initialisierung |
| `resources/views/PageDesign/PageDesign.twig` | Zentrale Einbindung und eigene Body-Klasse |
| `resources/lang/de/Template.properties` | Neue deutsche Widget-Texte |
| `resources/lang/en/Template.properties` | Neue englische Widget-Texte |
| `resources/lang/fr/Template.properties` | Neue französische Widget-Texte |
| `resources/lang/it/Template.properties` | Neue italienische Widget-Texte |
| `resources/lang/es/Template.properties` | Neue spanische Widget-Texte |
| `tests/contact_widget.php` | Lokale Twig-Render-/Einbindungstests und HTML-Vorschauen |
| `tests/contact_widget.cjs` | Lokale Browserprüfung gegen die echten Widget-Dateien |
| `tests/twig_regression.php` | Neues 169. Template; Baseline-Inventur aus dem historischen Git-Stand |
| `README.md` | Einbindung, Verhalten, Dateien und Abnahmegrenzen |
| `meta/documents/changelog_de.md` | Deutscher Änderungseintrag |
| `meta/documents/changelog_en.md` | Englischer Änderungseintrag |

### Lokale Tests und offene Abnahme

| Prüfung | Exaktes Ergebnis |
| --- | --- |
| Twig 2.16.1 / 3.30.0, PHP 8.4.23 | Je **170/170** Templates parsebar, **38/38** bestehende Verhaltenstests und **38/38** Vergleiche zur Twig-2-Baseline erfolgreich |
| Widget-Einbindung, beide Twig-Versionen | Je **60/60** Layoutfälle in DE/EN/FR/IT/ES. Widget, CSS und JS genau einmal pro vollständiger Seite, im Quickview nullmal. Widget außerhalb von Vue. |
| Übersetzungen und Links | **45/45** Texte vorhanden, neun eindeutige Schlüssel je Sprache. WhatsApp-Direktchat und Mailadresse exakt. |
| Chromium 149.0.7827.55, Node 22.14.0 | **55/55** Szenarien, **1332/1332** Assertions; **0** JavaScript-Seitenfehler, **0** externe HTTP-Anfragen |
| Browserumfang | Isoliert, Standard-Theme, Kategorie-, Artikel- und Checkout-CSS einschließlich bestehendem Main-Stylesheet; DE bei 1440×900, 1024×768, 768×1024, 390×844, 320×568, 280×480 und 568×320; EN/FR/IT/ES je CSS-Variante bei 320×568 |
| Bedienung / Integrität | Öffnen per Klick/Enter/Leertaste; X, Escape, Umschalten, Außenklick, Tab-Verlassen; Fokus, doppelte Initialisierung und erneuter Seitenaufruf erfolgreich; Shop-Außenkontrolle und Modals behalten Priorität; Storage-/Cookie-Zugriffe würden den Test abbrechen |
| Layout / Sichtprüfung | Keine gemessenen Layoutverschiebungen und kein horizontaler Überlauf in den 55 Fällen; vollständige Kontaktzeilen erreichbar, Button und Nach-oben-Kontrolle getrennt; Desktop und Smartphone visuell geprüft |
| Kontraste | Fünf geprüfte Farbpaare mindestens 4,75:1; Header-/Launcher-Symbol 6,11:1, Kontakttext 15,65:1, Untertitel 6,62:1 |
| Syntax / Diff | Beide Test-PHP-Dateien mit `php -l`, Widget-JavaScript und Browserprüfung mit `node --check`, `git diff --check`: erfolgreich |

Die Layoutfälle rendern das tatsächliche B2B-Seitenlayout mit ausdrücklich lokalen
Plenty-/Ceres-Service- und Template-Fixtures. Sie beweisen die Einbindung und ersetzen
keinen vollständigen Shop-Render. Der vorhandene Twig-Regressionstest prüft weiterhin
alle bisherigen 38 Fälle. Die aktuelle Inventur enthält das Kontakt-Widget und
den Newsletter-Hinweis. Der historische `--baseline`-Lauf liest die damaligen 168 Dateien
aus Git und verlangt unverändert 168 erfolgreiche Ergebnisse. Engine-Deprecations
werden separat im Bericht behalten (Twig 2: 24, Twig 3: zwei bestehende Makrohinweise).

Wiederholung mit externen Twig-Autoloadern und externem Playwright, ohne produktive
Testabhängigkeiten zu installieren:

```text
php tests/contact_widget.php <twig-autoload.php> .cache/contact-widget
node --check resources/js/contact-widget.js
node --check tests/contact_widget.cjs
node tests/contact_widget.cjs .cache/contact-widget .cache/contact-widget/browser-report.json
```

Für eine vorhandene Playwright-Installation optional `O46_PLAYWRIGHT_MODULE` auf
deren Modulpfad und `O46_BROWSER_EXECUTABLE` auf das lokale Chromium setzen.
Die bereits oben dokumentierten Twig-Regression-Aufrufe bleiben verwendbar.
Vorschauen, Screenshots, Parser und JSON-Berichte liegen lokal im ignorierten
Ordner `.cache/contact-widget/`; `preview-de-theme.html` lässt sich lokal öffnen.
Keine Testbibliothek wird als Plugin-Ressource mitgeliefert.

Der erste Parser-Download scheiterte an der Sandbox-DNS-Auflösung; der anschließende
Download der offiziellen Twig-Archive war erfolgreich. Der erste Headless-Browserstart
wurde von der Windows-Sandbox abgebrochen (Exit 3221225506); der freigegebene Lauf
außerhalb dieser Sandbox war erfolgreich. Keine Test-Timeouts im finalen Lauf.

**NOT_RUN / offen:** PlentyONE-Build und Test-Pluginset-Render mit realer
`page_design`-Zuordnung, Shop-Startseite/Kategorien/Artikel/Suche, Kundenkonto,
echter Warenkorb und Checkout einschließlich Zahlungs-/Amazon-Pay-Abläufen,
konfigurierte Einwilligungs-/B2B-Auswahldialoge und weitere Plugins. Ebenso offen:
reale Safari-/iOS-/Android-Geräte samt Safe-Area und virtueller Tastatur sowie das
tatsächliche Öffnen der WhatsApp-/Mail-Apps. Die Linkziele und Browserattribute sind
lokal geprüft; es wurde keine Nachricht versendet und keine Bestellung ausgelöst.

Keine Änderungen in B2C oder an `main`; kein Commit, Push, Merge, Tag, Release,
Deploy, Sync oder PlentyONE-Schreibzugriff im Rahmen dieses Auftrags.

## Twig-Kompatibilitätsprüfung und Korrektur (2026-11-03)

Ausgang dieses Folgeauftrags: sauberer `develop` bei
`0342310d2b4cb6e915b662557aa445bbef916934` (`baseline anpassung name`).
Die zuvor vorbereitete Plugin-Umbenennung liegt damit inzwischen im Commit vor.
Diese Folgeänderung bleibt lokal, uncommittet und unstaged auf `develop`;
`main` bleibt bei `9fd71bc173bec1a3f9815a807f0cf22292a0e998`.

**Ergebnis: alle sieben ursprünglichen Befunde geklärt und korrigiert;
168/168 Twig-Dateien parsebar unter Twig 2.16.1 und 3.30.0.**
Zehn gefilterte Schleifen in sechs Dateien verwenden jetzt eine Bedingung im
Schleifenkörper. In einer weiteren Datei wurde die unwirksame bedingte Hülle
einer Blockdefinition entfernt. Kein neuer `filter`-Filter und keine neue
Plenty-Erweiterung werden benötigt.

### Ursachen, Korrekturen und Verhalten

Alle Dateipfade in der Tabelle sind relativ zu `resources/views/`;
Zeilen beziehen sich auf den Ausgangscommit `0342310`.

| Datei / ursprüngliche Zeile | Ursprünglicher Fehler / Ursache | Korrektur und Verhalten | Gezielte Prüfung |
| --- | --- | --- | --- |
| `Category/Components/CategoryBreadcrumbs.twig:12` | `for … if not break`: veraltete Schleifenbedingung; `break` wird im Körper verändert. | Bedingung innerhalb der Schleife. Nach der ersten fehlenden Kategorieübersetzung keine weiteren Zwischenkategorien; letzte Kategorie bleibt separat. | 5 Fälle: leer, einzelne Kategorie, normale Folge, erster Eintrag fehlt, Lücke in der Mitte. Links und Reihenfolge identisch. |
| `Category/Item/CategoryItemBrands.twig:26` | `for … if children.details[0]`: alte Filtersyntax im Zähler für übersetzte Kinder. | Unveränderte Bedingung um die Zählererhöhung. Markenlisten, Logo-Fallback und übrige Schleifen bleiben gleich. | 5 Fälle einschließlich leerer Details, gemischter Kinder und nicht fortlaufender Schlüssel. Auswahl und Zähler identisch. |
| `Checkout/OrderDetails.twig:186` | `for … if not amout.isSystemCurrency`: alte Filtersyntax; daneben bereits bestehende Schreibweisen `item.amouts` und `amout`. | Nur Bedingung in den Schleifenkörper verschoben. Datenfelder, Reihenfolge, letzter zugewiesener Betrag und Netto-/Bruttoauswahl bleiben unverändert. | 6 Fälle: kanonisches `amounts` ohne `amouts`, Legacy-Feld mit mehreren Beträgen, globale Bedingung true/false, leere Folge; Preise und Auswahl identisch. |
| `Containers/FeedbackContainer-backup.twig:38` | Drei verschachtelte `for … if customerHasBuyThisItem==false`; Flag ändert sich beim ersten Treffer. | Alle drei Bedingungen an derselben Verarbeitungsebene vor dem jeweiligen Körper geprüft. Erster Treffer und bestehender Varianten-Fallback bleiben gleich. | 7 Fälle: erster/später Treffer, abweichende Varianten-/Bestellpositionen-Reihenfolge, kein Treffer, keine Bestellungen, Gast, leere Varianten. Besuchsfolge und Ergebnis identisch. |
| `Containers/FeedbackForm-backup.twig:8` | Dieselben drei verschachtelten Legacy-Schleifen. | Gleiche begrenzte Korrektur; Formular und bestehende Kauf-/Fallbackentscheidung unverändert. | Dieselben 7 Fälle separat gegen diese Datei geprüft. |
| `DynamicContent/DynamicCatPreviewImages.twig:6` | `for … if hasAttrImages==false`; Flag ändert sich beim ersten Bildfund. | Bedingung um die bestehende innere Schleife. Erkennung stoppt wie bisher nach dem ersten Attribut mit Bild; spätere Ausgabeschleife zeigt weiterhin alle passenden Bilder. | 5 Fälle: leer, keine Bilder, erster/später/letzter Fund. Besuchsfolge, Bildreihenfolge und `null`-Fallback identisch. |
| `Checkout/OrderConfirmation.twig:9` | `block title` unter `if` im `embed`: Blockregistrierung hängt unter Twig 2 nicht von der Bedingung ab; Twig 3 lehnt diese Struktur ab. | Nur die unwirksame `if`-Hülle entfernt. Der übersetzte Bestätigungstitel bleibt wie im tatsächlichen Twig-2-Verhalten immer gesetzt. Kein neuer Kategorie-Titel-Fallback eingeführt. | 3 Renderfälle: Kategorie undefiniert, null und vorhanden; in allen Fällen derselbe Bestätigungstitel wie vor der Änderung. |


<details>
<summary>Vollständige ursprüngliche Fehlermeldungen (Twig 3.30.0, Ausgangscommit)</summary>

```text
resources/views/Category/Components/CategoryBreadcrumbs.twig
Unexpected token "name" of value "if" ("end of statement block" expected) in "resources/views/Category/Components/CategoryBreadcrumbs.twig" at line 12 column 95.

resources/views/Category/Item/CategoryItemBrands.twig
Unexpected token "name" of value "if" ("end of statement block" expected) in "resources/views/Category/Item/CategoryItemBrands.twig" at line 26 column 62.

resources/views/Checkout/OrderConfirmation.twig
A "block" tag cannot be under a "if" tag (line 7) in "resources/views/Checkout/OrderConfirmation.twig" at line 9.

resources/views/Checkout/OrderDetails.twig
Unexpected token "name" of value "if" ("end of statement block" expected) in "resources/views/Checkout/OrderDetails.twig" at line 186 column 58.

resources/views/Containers/FeedbackContainer-backup.twig
Unexpected token "name" of value "if" ("end of statement block" expected) in "resources/views/Containers/FeedbackContainer-backup.twig" at line 38 column 49.

resources/views/Containers/FeedbackForm-backup.twig
Unexpected token "name" of value "if" ("end of statement block" expected) in "resources/views/Containers/FeedbackForm-backup.twig" at line 8 column 49.

resources/views/DynamicContent/DynamicCatPreviewImages.twig
Unexpected token "name" of value "if" ("end of statement block" expected) in "resources/views/DynamicContent/DynamicCatPreviewImages.twig" at line 6 column 64.
```

</details>

**Einordnung A–D:** Die sieben Meldungen sind keine fehlenden Plenty-Funktionen (C).
Sie betreffen unter Twig 2 noch akzeptierte, inzwischen veraltete Syntax (B), die
unter Twig 3 zu tatsächlichen Syntaxfehlern führt (A). Die beiden Parser-Versionen
wurden unverändert eingesetzt. Der Vergleich beweist keine konkrete Plenty-Version:
`plugin.json` verlangt Ceres ohne Versionsbindung, und der Checkout enthält weder
die installierte Ceres-/IO-Version noch den Plenty-Twig-Runtime-Lock (D).
Die genaue installierte Version und die vollständige PlentyONE-Ausführung bleiben
**NOT_RUN / nicht verifiziert**.

In keiner der zehn betroffenen Schleifen wird `loop.index`, `loop.index0`,
`loop.first`, `loop.last`, `loop.length`, `loop.parent` oder ein Include im
geänderten Körper verwendet. Die `loop`-Zugriffe in anderen Schleifen von
`OrderDetails.twig` bleiben unberührt. Ein vorab angewandter Filter wäre insbesondere
bei veränderlichen Abbruchflags ungeeignet; die Bedingungen müssen bei jeder
Iteration den aktuellen Zustand prüfen. Reihenfolge, Schlüssel und bestehende
Zuweisungen bleiben erhalten. Zusätzliche Einrückungs-Leerzeichen zwischen HTML-Tags
werden beim Rendervergleich normalisiert; fachliche Werte und Besuchsfolgen werden exakt verglichen.

Das Verhalten der Titelüberschreibung wurde zuerst unter Twig 2 reproduziert:
die alte Bedingung wirkte bereits dort nicht. Eine Änderung auf `parent()` bei
vorhandener Kategorie hätte das bestehende Verhalten verändert und wurde deshalb
nicht vorgenommen. Ebenso wurden die bestehenden Betragsfeld-Schreibweisen nicht
automatisch auf `amounts`/`amount` korrigiert: Das wäre eine gesonderte Änderung der
Preis-/Währungsauswahl. Diese Datenzuordnung bleibt ein offener Bestandsbefund,
kein verbliebener Twig-Syntaxfehler. Die Backup-Templates wurden beibehalten;
ihre tatsächliche Nutzung im Shop wurde nicht behauptet.

Referenzen: [Twig 2: Deprecations](https://twig.symfony.com/doc/2.x/deprecated.html),
[Twig 2: Schleifenbedingungen und loop-Variablen](https://twig.symfony.com/doc/2.x/tags/for.html),
[Twig: Vererbung und Blockdefinitionen](https://twig.symfony.com/doc/3.x/tags/extends.html),
[PlentyONE-Theme-Dokumentation](https://developers.plentymarkets.com/en-gb/developers/main/plentyshop-plugins/theme-plugins.html).

### Testergebnisse und Grenzen der lokalen Umgebung

Neue reproduzierbare Prüfung: `tests/twig_regression.php`. Sie liest die tatsächlichen
Templates beziehungsweise den fest referenzierten Ausgangscommit und prüft zusätzlich
zur vollständigen Syntaxinventur gezielt alle geänderten Schleifen und den Titelblock.
Die Beispiele verwenden ausschließlich lokale Daten und begrenzte Testservices.

| Lauf / Prüfung | Ergebnis |
| --- | --- |
| Ausgangsstand, Twig 3.30.0 | 161/168 parsebar; alle sieben ursprünglichen Fehler reproduziert; erwarteter Exit 1 |
| Ausgangsstand, Twig 2.16.1 | 168/168 parsebar, 38/38 Verhaltenstests erfolgreich; Exit 0 |
| Korrigierter Stand, Twig 2.16.1 | 168/168 parsebar, 38/38 Verhaltenstests, 38/38 Vergleiche zum Ausgangsstand erfolgreich; Exit 0 |
| Korrigierter Stand, Twig 3.30.0 | 168/168 parsebar, 38/38 Verhaltenstests, 38/38 Vergleiche zum Twig-2-Ausgangsstand erfolgreich; Exit 0 |
| PHP 8.4.23, `php -l` | 8/8 produktive PHP-Dateien plus 1/1 neue Testdatei gültig |
| JSON | 15/15 gültig; `plugin.json` mit `GuardiansBasicB2B`, Version 1.0.7 unverändert |
| PHP-Namespaces und Provider | 8/8 Namespaces korrekt, Service-/DataProvider vorhanden; PHP-Code unverändert |
| Eigene Template-/ResultField-Referenzen | Unverändert 49/53 vorhanden; dieselben vier Bestandslücken wie unten |
| Eigene Ressourcen / Manifest | 42/42 aktive konkrete Ressourcendateien, 8/8 Manifest-Icon-Einträge vorhanden; Manifest unverändert |
| Dynamische Plugin-Pfade | Alle 97 eigenen Aufrufe unverändert; keine alten internen Namespaces, keine festen numerischen Pluginset-Pfade |
| Inhaltserhalt | JS, CSS, Bilder, Sprachdateien, PHP, Konfiguration und Manifest unverändert; produktiver Diff auf genau sieben Twig-Dateien begrenzt |
| `git diff --check` | erfolgreich |

Die Syntaxprüfung registriert ausdrücklich benannte Plenty-/IO-/Ceres-Funktionen
und Filter sowie eigene Funktionen aus `Base_Extension`. Unbekannte Namen werden
nicht pauschal akzeptiert. Die Syntax-Platzhalter werfen bei versehentlicher
Ausführung einen Fehler; sie gelangen nicht in produktiven Code. Die Renderfälle
verwenden eigene konkrete Testcallbacks und prüfen tatsächliche Ausgaben/Zustände.

Ein anfänglicher Testaufbau-Fehler war getrennt zu beheben: Twig 2.16.1 erkennt die
unter PHP 8.4 geänderten Reflection-Namen anonymer Closures nicht zuverlässig.
Die Testcallbacks werden deshalb als gewöhnliche Objektmethoden registriert.
Keine Änderung am Twig-Parser, keine abgeschwächte Assertion und keine produktive
Anpassung war hierfür erforderlich. Der erste Archivdownload scheiterte an der
Sandbox-DNS-Auflösung; der anschließende Download des offiziellen Twig-2.16.1-Archivs
und die finalen Läufe waren erfolgreich. Keine Test-Timeouts.

Deprecations werden separat im JSON-Bericht erfasst, nicht als Syntaxerfolg
verschwiegen. Twig 2 unter PHP 8.4 meldet im finalen Lauf 24 unterschiedliche
Engine-Deprecations. Twig 3 meldet zwei unveränderte Hinweise auf außerhalb des
Template-Roots definierte Makros: `Category/Item/CategoryItem.twig:166` und
`Category/Item/CategoryItemContent.twig:91`. Diese sind keine Syntaxfehler der
geprüften Version und wurden außerhalb des Auftrags nicht umgebaut.

Beispielaufrufe aus dem Repository-Root (externe Autoloader und Ausgabeordner einsetzen;
Twig-Versionen in getrennten PHP-Prozessen ausführen):

```text
php tests/twig_regression.php <twig2-autoload.php> <vorher.json> --baseline
php tests/twig_regression.php <twig2-autoload.php> <nachher-twig2.json> --compare=<vorher.json>
php tests/twig_regression.php <twig3-autoload.php> <nachher-twig3.json> --compare=<vorher.json>
```

Keine Testbibliothek und kein `vendor/` werden im Plugin mitgeliefert. Der Bericht
enthält vollständige Syntaxmeldungen, einzelne Fälle, Vergleichsergebnis und
Deprecations. Die verwendeten lokalen Parser und Rohberichte liegen außerhalb des
Repositories; für Wiederholungen dieselben Parser-Versionen verwenden.

**Weiterhin NOT_RUN:** vollständiger PlentyONE-Build und Render mit realen Services,
tatsächliche installierte PHP-/Twig-/Ceres-/IO-Versionen, Kategorie-/Markenseiten,
Variantenbilder/Quickview, reale Bestellungen mit Netto-/Brutto-/Fremdwährungsdaten,
Bestätigung mit/ohne verknüpfte Kategorie, Feedback bei tatsächlicher Nutzung der
Backup-Templates sowie Warenkorb/Checkout/Amazon Pay. Die unten dokumentierten
vier fehlenden Templates und 20 Übersetzungslücken bleiben unverändert offen.

**Dateien dieses Folgeauftrags:** die sieben Tabellenzeilen, `tests/twig_regression.php`,
`README.md`, `meta/documents/changelog_de.md` und `meta/documents/changelog_en.md`.
Keine Änderung an Version, Plugin-Identität, Ressourcenpfaden oder anderen Shop-Funktionen.
Kein Commit, Push, Merge, Tag, Release, Deploy, Sync oder PlentyONE-Schreibzugriff.

## Historischer Ausgangszustand und Branch-Ablauf der Baseline

- `main`: `9fd71bc173bec1a3f9815a807f0cf22292a0e998`, Erstimport.
- `develop`: `61b84a2fcd5bd0cae0450f3c8a032e42df0f6849`, vorhandener Commit `pluginpath`.
- Zu Beginn war `develop` sauber. Der vorhandene Pfad-Commit bleibt unverändert.
- Nach der abschließenden Nutzeranweisung erfolgt die gesamte Vorbereitung zuerst
  auf `develop`. `main` erhält jetzt keine Baseline-Übernahme.
- Alle neuen Änderungen bleiben uncommittet und unstaged zur Kontrolle in GitHub Desktop.
  Keine neuen Branches, Commits, Merge-Commits, Pushes, Tags oder Releases.
- Die Branch-SHAs entsprechen den genannten Ausgangswerten und lokalen Remote-Tracking-Refs.
  Eine zusätzliche GitHub-Abfrage mit `git ls-remote` scheiterte an DNS-Auflösung;
  der aktuelle Serverstand wurde damit nicht unabhängig bestätigt.

`develop` dient der Weiterentwicklung und den Tests, `main` dem stabilen,
freigegebenen Stand. Erst nach erfolgreicher Abnahme werden Änderungen bewusst
von `develop` nach `main` übernommen. Während der Bearbeitung gab es einen externen
Branchwechsel mit Stash-Konflikten. Die 20 Konfliktblöcke in zehn Dateien wurden
gesichert, auf reine Namespace-Unterschiede geprüft und ohne Inhaltsverlust aufgelöst.
Die abschließenden Vergleichsprüfungen beziehen sich auf den konfliktfreien Stand.

## Versionierung und geplanter Release

Schema: `MAJOR.MINOR.PATCH`. PATCH steht für Fehlerkorrekturen und kleine kompatible
Verbesserungen, MINOR für rückwärtskompatible neue Funktionen, MAJOR für inkompatible
oder grundlegende Änderungen. Versionsnummern werden bei einer Release-Vorbereitung
erhöht, nicht bei jedem Commit. `plugin.json` und beide Changelogs bleiben synchron.

Geplanter Titel: **GuardiansBasic B2B – Baseline v1.0.7**. Geplanter Tag: **v1.0.7**.
Nach manuellem Commit/Push kann der Nutzer diesen Stand zunächst als **Pre-release**
veröffentlichen, solange die PlentyONE-Abnahme aussteht. Erst nach Abnahme als stabil
freigeben und nach `main` übernehmen. Weitere Tags beispielsweise `v1.0.8` und `v1.1.0`;
veröffentlichte Tags nicht nachträglich verschieben. Jetzt wurde nichts veröffentlicht.
Die neue Plugin-Identität erfordert trotz der angeforderten Baseline-Version 1.0.7
eine gesonderte Einrichtung; bestehende Konfigurationen werden nicht automatisch migriert.

## Plugin-Identität und Autoloading

`plugin.json` enthält Name/Namespace `GuardiansBasicB2B`, Version `1.0.7` und:

- ServiceProvider: `GuardiansBasicB2B\Providers\GuardiansBasicServiceProvider`.
- DataProvider: `GuardiansBasicB2B\Containers\GuardiansBasicContainer`.
- Alle acht PHP-Dateien verwenden den neuen Root-Namespace. Imports,
  Controller-Routen, API-Namespace und Klassenverweise wurden entsprechend angepasst.
- Twig-Templates, Includes, Imports, Komponenten und Übersetzungen verwenden
  `GuardiansBasicB2B::…`; Konfigurationen `GuardiansBasicB2B.…` beziehungsweise
  `config("GuardiansBasicB2B")` für die vollständige Konfiguration.
- Die 97 eigenen `plugin_path()`-Aufrufe einschließlich kommentierter Vorlagen verwenden
  `GuardiansBasicB2B`. Ceres und AmazonPayCheckout behalten ihre eigenen Namen.

Bestehende Klassennamen wie `GuardiansBasicServiceProvider`, `GuardiansBasicRouteServiceProvider`,
`GuardiansBasicContainer` und `GuardiansBasicItemListContainer1` bleiben absichtlich erhalten.
Das sind Klassennamen unter dem neuen Namespace, keine Verweise auf das B2C-Plugin.
Auch Hersteller-/Markenangaben wie `eGuardiansBasic` sind keine technischen Identitäten.
Es gibt keine eigene Composer-/Autoload-Konfiguration im Repository; die Zuordnung
von Namespace, `src/` und Klassen-Dateien wurde statisch geprüft.

### Lokaler Ordner und plentyDevTool

Für plentyDevTool muss das Plugin-Hauptverzeichnis **GuardiansBasicB2B** heißen,
passend zu Name und Namespace. Das ist eine Anforderung der
[Plugin-Definition](https://developers.plentymarkets.com/en-gb/developers/main/plugin-definition.html)
und des [plentyDevTool-Git-Ablaufs](https://developers.plentymarkets.com/en-gb/plentydevtool/main/plentydevtool-version-control.html).

Der aktuelle reine Git-Arbeitsordner bleibt für die Kontrolle in GitHub Desktop
zunächst `O46-B2B/GuardiansBasic`. Vor späterer plentyDevTool-Verwendung den gesamten
Checkout bei ausgeschalteter Synchronisierung nach `O46-B2B/GuardiansBasicB2B`
umbenennen und GitHub Desktop auf den verschobenen vorhandenen Checkout verweisen.
Dies ist keine Umbenennung des GitHub-Repositories und keine Änderung der Git-Historie.
`plugin.json` bleibt im Repository-Root; keinen zusätzlichen Unterordner im Repository anlegen.
Erkennung, Installation und Synchronisierung sind noch nicht ausgeführt.

## Dynamische Ressourcen und vorhandener Pfad-Commit

Eigene Ressourcen verwenden `plugin_path('GuardiansBasicB2B')`, fremde Ressourcen
`plugin_path('Ceres')` beziehungsweise `plugin_path('AmazonPayCheckout')`.
Das B2B-Manifest bleibt `B2B.Outlet46.de`; seine acht Icon-Einträge verwenden
`../images/icon/...`, relativ zur Manifest-URL und ohne Twig im JSON.

Die im Auftrag genannten 74 entsprechen **74 ersetzten Quelltextzeilen** in elf
Dateien (`git diff --numstat 9fd71bc..61b84a2`). Die eigenständige B2B-Zählung ergibt
**105 feste URL-Vorkommen**: 101 eigene, zwei Ceres- und zwei Amazon-Pay-Referenzen.
Mehrere URLs stehen in derselben CSS-/HTML-Zeile. Diese Umstellung war bereits im
Commit `pluginpath` enthalten; sie wurde nicht erneut durchgeführt.

| Bereits im Pfad-Commit geänderte Datei | URL-Vorkommen |
| --- | ---: |
| `resources/documents/manifest.json` | 8 |
| `resources/views/Category/Content/CategoryContent.twig` | 1 |
| `resources/views/Category/Item/CategoryItem.twig` | 1 |
| `resources/views/Category/Item/CategoryItemBrands.twig` | 1 |
| `resources/views/Category/Item/Partials/CategoryListItem.twig` | 1 |
| `resources/views/Category/Item/Partials/CategoryListItem2.twig` | 1 |
| `resources/views/Item/SingleItem.twig` | 2 |
| `resources/views/PageDesign/PageDesign.twig` | 16 |
| `resources/views/PageDesign/Partials/Footer.twig` | 25 |
| `resources/views/PageDesign/Partials/Head.twig` | 46 |
| `resources/views/PageDesign/Partials/Header/Header.twig` | 3 |

Herstellerlogos ersetzen weiterhin nur die bestehende `frontend/vendor/`-Basis
durch die eigene dynamische `images/vendors/`-Basis. Bestehende Bedingungen und
Fallbacks bleiben erhalten. Externe URLs, insbesondere `frontend/Payments/`, bleiben
unverändert. Dateinamen, JS-Versionen, Ladefolge, `defer`/`async`, CSS, Bilder,
Preislogik, Mindestbestellwert und andere B2B-Bedingungen wurden nicht umgebaut.

## Lokale Prüfungen der ursprünglichen Baseline (vor der Twig-Korrektur)

Inventar: **2.606 versionierte Dateien**, ohne Git-Metadaten. Geprüft wurden alle
15 JSON-Dateien, alle acht PHP-Dateien, alle 168 Twig-Dateien und sämtliche
versionierten Textressourcen auf veraltete interne Namen und feste Pluginset-Pfade.
Testwerkzeuge und Rohberichte liegen außerhalb des Plugin-Repositories.

| Prüfung | Ergebnis |
| --- | --- |
| JSON-Syntax | 15/15 gültig |
| PHP 8.4.23: `php -l` | 8/8 gültig |
| PHP-Parser vor/nach Änderung | 8/8 jeweils gültig |
| PHP-Namespace und Klassen-Dateien | 8/8 konsistent; Service-/DataProvider 2/2 vorhanden |
| Twig 3.30.0, gesamtes Projekt | 161/168 vor und nach Änderung parsebar; sieben identische Bestandsbefunde, keine neue Parserabweichung |
| PHP/Twig-Vergleich mit `develop` nach Rücknormalisierung des Namens und Zeilenend-Leerzeichen | 176/176 ohne weitere Codeänderung |
| Vorhandener Pfad-Commit gegenüber `main`, nur Ressourcenbasen normalisiert | 11/11 ohne weitere Inhaltsänderung |
| Feste numerische Pluginset-Pfade, auch maskiert/URL-kodiert | 0 |
| Alte interne Namespace-/Konfigurations-/Plugin-Pfad-Referenzen | 0 |
| Eigene aktive, konkret referenzierte Ressourcendateien | 42/42 vorhanden; Herstellerlogo-Verzeichnis vorhanden |
| Manifest-Icon-Einträge | 8/8 vorhanden; 32/32 Auflösungen gegen vier synthetische Pluginset-Basen |
| Statische interne Template-/ResultField-Ziele | 49/53 vorhanden; vier Bestandslücken unten |
| Dynamische Sprach-Templates für DE/EN/FR/IT/ES | 15/15 vorhanden |
| Twig-URL-Ausdrücke gegen vier synthetische Pluginsets | 396/396 korrekt gerendert, einschließlich kommentierter Ausdrücke |
| Herstellerlogo-Ersetzung: null, leer, ersetzbar, extern | 96/96 korrekt |
| Statische Übersetzungsschlüssel | 167 Schlüssel in fünf Sprachdateisätzen geprüft; 20 vorhandene Sprach-/Schlüssel-Lücken unten |
| B2B-JavaScript, CSS und Übersetzungsdateien | 9 JS-, 6 CSS- und 15 Sprachdateien unverändert |
| `config.json` und Manifest-Inhalte | unverändert gegenüber `develop` |
| `git diff --check` | erfolgreich |

Für die lokale Twig-Prüfung wurden Plenty-Funktionen/-Filter nur als Platzhalter
registriert. Die URL-Tests verwenden einen synthetischen `plugin_path()`-Resolver.
Es fand keine Ausführung der Plenty-Services, kein vollständiger Shop-Render und
keine HTTP-/PlentyONE-Abnahme statt. Die installierte PHP-/Twig-Version und externe
Ceres-/AmazonPayCheckout-Ressourcen müssen im Test-Pluginset geprüft werden.

### Ursprüngliche Twig-Befunde der Baselineprüfung

Twig 3.30.0 meldet dieselben Fehler bereits in `develop` vor der Umbenennung:

- `Category/Components/CategoryBreadcrumbs.twig:12`, `Category/Item/CategoryItemBrands.twig:26`,
  `Checkout/OrderDetails.twig:186`, `Containers/FeedbackContainer-backup.twig:38`,
  `Containers/FeedbackForm-backup.twig:8`, `DynamicContent/DynamicCatPreviewImages.twig:6`:
  ältere `for … if …`-Syntax.
- `Checkout/OrderConfirmation.twig:9`: Block innerhalb eines `if` bei Template-Vererbung.

Diese Pfade sind relativ zu `resources/views/`. Die sieben Syntaxbefunde sind
inzwischen wie oben beschrieben behoben und unter Twig 2 sowie Twig 3 geprüft.
Die PlentyONE-Laufzeitabnahme bleibt separat offen.

### Weitere unveränderte Bestandsprobleme

Der ServiceProvider referenziert bei aktivierten Overrides vier nicht vorhandene
Templates: `StaticPages.CancellationRights`, `StaticPages.LegalDisclosure`,
`StaticPages.PrivacyPolicy`, `StaticPages.TermsAndConditions`. Die Ursache bestand
bereits unter dem alten Namespace. Die betreffenden Overrides beziehungsweise `all`
vor einer Testfreigabe prüfen; keine bestehenden Nutzerwerte wurden verändert.

Fehlende literal referenzierte Übersetzungsschlüssel im unveränderten Bestand:
`Template.crossselling.title` und `Template.Manufacturer` in allen fünf Sprachen;
`Template.morethen18` in FR/IT/ES; `Config.g_jugend`, `f_jugend`, `e_jugend`,
`d_jugend`, `c_jugend`, `b_jugend`, `a_jugend` in DE (jeweils mit `Config.`-Präfix).
Das ergibt 20 Sprach-/Schlüssel-Paare. Dynamische Schlüssel und Laufzeit-Fallbacks
erfordern zusätzliche Prüfung mit PlentyONE.

`Stylesheet.twig` enthält ausschließlich kommentierte CSS-Einbindungen, darunter
zwei Verweise auf die nicht vorhandene `css/main.min.css`. Die aktive CSS-Einbindung
erfolgt im Head; die Kommentare wurden nicht aktiviert. Der RouteServiceProvider
wird im bestehenden ServiceProvider doppelt registriert; unverändert belassen.

## Spätere manuelle Einrichtung und Abnahme

Die neue Identität trennt die Plugins. Sie garantiert noch keine erfolgreiche
Installation oder automatische Übertragung von Einstellungen. Aus dem Code folgt:
Konfigurationszugriffe und der DataProvider-Key ändern sich. Deshalb bestehende
B2B-Werte und Content-Zuordnungen vor der späteren Einrichtung sichern und gezielt
beim neuen Plugin prüfen/übertragen, einschließlich `templates.override`,
Homepage-Slider/Banner/USPs, eigener Konfigurationsfelder und externer Template-Verweise.
`config.json` behält alle bisherigen Definitionen und Defaults.

1. Lokalen Diff in GitHub Desktop auf `develop` prüfen, selbst committen und pushen.
2. Bei plentyDevTool-Nutzung den lokalen Ordner wie oben beschrieben angleichen.
   Alternativ das unveränderte GitHub-Repository später als Git-Quelle verwenden.
3. `GuardiansBasicB2B` ausdrücklich im **B2B-Test-Pluginset** installieren; Ceres/IO
   und gegebenenfalls AmazonPayCheckout dort prüfen. B2C behält `GuardiansBasic`
   in seinem separaten Pluginset. Bestehende Plugins nicht löschen oder ersetzen.
4. Bestehende B2B-Konfigurationen, Template-Overrides, Content-/Container-Zuordnungen,
   externe ShopBuilder-/Kategorie-Referenzen und Plugin-Reihenfolge vergleichen.
   Der registrierte Stylesheet-Provider heißt nun
   `GuardiansBasicB2B\Containers\GuardiansBasicContainer`; externe Zuordnungen zum
   alten Key werden durch die Quelltextänderung nicht automatisch angepasst.
5. Die beiden Themes nicht gemeinsam im selben Test-Pluginset aktiv betreiben:
   beide können dieselben IO-Events, Route-Pfade und Twig-Funktionen registrieren.
   Parallele Installation in getrennten Pluginsets ist das Ziel.
6. Vollständige Bereitstellung im B2B-Test-Pluginset durchführen und Build-/PHP-Logs,
   tatsächliche Plugin-Pfade, Konfigurationen und Ressourcen-HTTP-Status prüfen.

Alle folgenden Tests sind **NOT_RUN** und erst im B2B-Test-Pluginset durchzuführen:

- Installation und vollständige Bereitstellung; unabhängige B2C-/B2B-Zuordnung.
- B2B-Startseite, Kategorien, Artikelseiten, Quickview und Suche.
- Login, Registrierung/Kundenkonto und B2B-Preisdarstellung.
- Warenkorb, B2B-Mindestbestellwert, Checkout und Bestellbestätigung.
- Amazon Pay einschließlich CSS/JS und tatsächlichem Checkout-Verhalten.
- Bilder, Herstellerlogos/Fallbacks, Fonts, CSS, JavaScript und Manifest-Icons;
  keine 404 bei eigenen Ressourcen; Ladereihenfolge und `defer`/`async` prüfen.
- Fünf Shop-Sprachen, Übersetzungen und die oben genannten Bestandsprobleme.

Es wurden keine PlentyONE-Einstellungen, Pluginsets, Installationen, Aktivierungen,
Deaktivierungen, Löschungen oder Synchronisierungen durchgeführt.

## Geänderte Dateien der ursprünglichen Baseline-Vorbereitung

60 Dateien gegenüber `develop` (`61b84a2`): `plugin.json`, acht PHP-Dateien,
46 Twig-Dateien und fünf Dokumentationsdateien. Das Manifest ist bereits im
vorhandenen Pfad-Commit korrekt und erhält keinen neuen Diff. Keine Datei gelöscht
oder neu zum Plugin hinzugefügt.

<details>
<summary>Vollständige Dateiliste</summary>

```text
README.md
meta/documents/changelog_de.md
meta/documents/changelog_en.md
meta/documents/user_guide_de.md
meta/documents/user_guide_en.md
plugin.json
resources/views/Basket/Basket.twig
resources/views/Category/Components/CategoryBreadcrumbs.twig
resources/views/Category/Content/CategoryContent.twig
resources/views/Category/Item/CategoryItem.twig
resources/views/Category/Item/CategoryItemBrands.twig
resources/views/Category/Item/CategoryItemContent.twig
resources/views/Category/Item/Partials/CategoryAttributes.twig
resources/views/Category/Item/Partials/CategoryGridOnly.twig
resources/views/Category/Item/Partials/CategoryListItem.twig
resources/views/Category/Item/Partials/CategoryListItem2.twig
resources/views/Category/Item/Partials/CrossSellerBasket.twig
resources/views/Category/Item/Partials/FacetFilter2.twig
resources/views/Category/Item/Partials/FacetFilter3.twig
resources/views/Category/Item/Partials/FacetFilter4.twig
resources/views/Category/Item/Partials/LiveShoppingItem.twig
resources/views/Category/Item/Partials/Pagination.twig
resources/views/Category/Macros/CategoryTree.twig
resources/views/Containers/FeedbackContainer-backup.twig
resources/views/Containers/FeedbackContainer.twig
resources/views/Customer/Components/LoginView.twig
resources/views/Customer/Login.twig
resources/views/DynamicContent/DynamicBasketPreview.twig
resources/views/DynamicContent/DynamicBasketPreviewSmall.twig
resources/views/DynamicContent/DynamicFeedbacks.twig
resources/views/DynamicContent/DynamicLogin.twig
resources/views/Homepage/Homepage.twig
resources/views/Item/Partials/CrossSelling.twig
resources/views/Item/Partials/ManufacturerAddress.twig
resources/views/Item/Partials/StructuredData/Product.twig
resources/views/Item/SingleItem.twig
resources/views/ItemList/ItemListView.twig
resources/views/PageDesign/Components/b2babfrageDE.twig
resources/views/PageDesign/Components/b2babfrageEN.twig
resources/views/PageDesign/Components/b2babfrageES.twig
resources/views/PageDesign/Components/b2babfrageFR.twig
resources/views/PageDesign/Components/b2babfrageIT.twig
resources/views/PageDesign/PageDesign.twig
resources/views/PageDesign/Partials/Footer.twig
resources/views/PageDesign/Partials/Head.twig
resources/views/PageDesign/Partials/Header/Breadcrumb.twig
resources/views/PageDesign/Partials/Header/Header.twig
resources/views/StaticPages/Abverkauf.twig
resources/views/StaticPages/Ballberater.twig
resources/views/StaticPages/Neuheiten.twig
resources/views/StaticPages/Topseller.twig
resources/views/Stylesheet.twig
src/Containers/GuardiansBasicContainer.php
src/Containers/GuardiansBasicItemListContainer1.php
src/Controllers/ContentController.php
src/Extensions/Base_Extension.php
src/Providers/GuardiansBasicRouteServiceProvider.php
src/Providers/GuardiansBasicServiceProvider.php
src/Resources/FacetResource.php
src/Resources/VariationBatchResource.php
```

</details>
