# Release Notes für eGuardiansBasic B2B

## Unreleased – Serverlast bei Varianten und Produktlisten (2026-11-14)

- PDP und Quickview verarbeiten auch langsame, erfolgreiche Varianten-Sammelantworten. Der Batch gibt die im Suchergebnis vorhandene positive Höchstbestellmenge an die Matrix weiter. Bei Transportfehlern oder einem Timeout nach 30 Sekunden greift der bestehende Einzelabruf. Im lokalen 60-Varianten-Test sinkt die Zahl der Abrufe von 61 auf 1. `core.min.js` erhält die Asset-Version 2.
- Vier Tag-Listen bündeln die Kartenattribute. Eingebettete Kategoriefragmente sparen eine Facettenaggregation und den Aufbau des Sortiermenüs. Die PDP verwendet die Wunschlisten-IDs des aktuellen Warenkorbs. `restGetContent` führt keinen ausgehenden HTTP-Abruf mit Cookies mehr aus.
- Die native Nachher-TTFB ist offen. [Lokaler Prüfbericht mit Messwerten und Grenzen](../../.cache/server-phase3-320a901/Pruefbericht.html)

## Unreleased – Separate Asset-Versionsnummern (2026-11-14)

- Basis c112d5c auf develop; bestehende lokale Änderungen erhalten, Plugin-Version 1.0.7 unverändert. Ersetze die zuvor lokal eingeführten Inhalts-Hashes in allen zwölf aktiven eigenen Asset-URLs durch separate Zahlen, zunächst jeweils ?v=1. Die sechs bereinigten Dateinamen und alle ausgelieferten JS-/CSS-Inhalte bleiben erhalten.
- Verwende resources/asset-versions.json als einzige manuelle Versionsquelle. Der bestehende Build schreibt die Zahlen automatisch in PageDesign.twig und Head.twig. Das generierte asset-manifest.json enthält nur Schema, zuletzt akzeptierte Nummer und interne SHA-256-Prüfsumme je Datei; entferne die früheren algorithm-/bytes-Felder. Kein Manifestzugriff, Dateisystem-I/O oder Hash pro Shopaufruf.
- Verlange bei veränderten fertigen Bytes genau den nächsten Versionsschritt. Fehlende Erhöhungen, Rückschritte, Sprünge und Erhöhungen ohne Inhaltsänderung brechen vor Schreibzugriffen ab. Identische Builds und anderer Plenty-buildHash behalten die Nummern. Bestehende Minifizierer, Bundle-Auswahl, plugin_path(), Ladefolge und Fremdplugin-Versionierung bleiben bestehen.
- Numerische Chrome-Cacheprobe: ?v=1 kalt 6.716 Byte, warm 0 Byte, ?v=2 erneut 6.716 Byte; gleiche korrekte Bodies. Dies ist keine Messung über ein echtes Deployment. Gezielte PHP-/Twig-/Build-/CSS-/Browserprüfungen und Grenzen: [HTML-Bericht](../../.cache/asset-numeric-c112d5c-20261114/Asset-Versionen-Pruefbericht.html). Native neue URLs und neue Pluginset-Bereitstellung NOT_TESTED. Keine pauschalen Performancegewinne, kein Commit/Push/Merge/Deployment/Sync/Cache-Purge oder B2C-/Preis-/Bestelländerung.

## Unreleased – Serverseitige Aufbereitung und Twig-Rendering (2026-11-14)

- Basis `debbeda`, lokal auf `develop`, Version 1.0.7 unverändert. Alle 13 eigenen PHP-Dateien und 173 Twig-Templates abgeglichen. [Prüfbericht](../../.cache/server-optimization-debbeda-20261114/Server-Performance-Pruefbericht.html); keine Bereitstellung oder native Nachher-Abnahme dieser Änderungen.
- Ergänze `countsOnly=1` am bestehenden Facetten-Endpunkt und im aktiven Filterclient. Fordere null statt bis zu 50 ungenutzte Artikeldokumente an; erhalte Facetten, Gesamtzahl, Kunden-/Preisrestriktionen sowie IT-/ES-DidYouMean. Ohne ausdrückliches Opt-in bleibt die Vollantwort erhalten. Suchaufrufe und Factories unverändert; kein neuer Cache. Treffer-Fixture: 7.899 → 125 JSON-Byte, keine native Transfermessung. Facetten-Min-JS +15 Byte, vollständiger reproduzierbarer Build, Cachekennung `facets4`.
- Rendere Karten in eigenen Kategorie-/Such-/Inhaltslisten direkt mit begrenztem Include-Kontext. Bei 60 Karten entfallen 60 zusätzliche Makroaufrufe/Ausgabepuffer; öffentliche Makros und Eager-Adapter bleiben erhalten. DE-Fixture: −7.980/−7.989 HTML-Byte durch entfallene Einrückung, identische Karten-/DOM-Semantik. Startseitengrid bytegleich, weiterhin 60 Artikel, ein Kategorieabruf und drei Attribut-Batches. Entferne den ungenutzten Kindkategorien-Durchlauf in der Markenübersicht.
- Gezielte Prüfungen PASS: PHP 13/13; je Twig 2/3 173 Syntax-, 38 Render-, 585 SEO-, 50 PDP-, 50 Header-, 20 Matrix-, 120 Listen-, zehn Makro-/Standalone- und 40 Markenfälle. Bestehende Attribute-/Startseiten-/LiveShopping-/Kartenregressionen, 758 Suchassertions plus 60 Facettenfälle/276 Assertions, 33 lokale Browserfälle, Builds und Diffcheck bestehen. Abbrüche und historische Testannahmen separat dokumentiert; keine Gesamtsuitebehauptung.
- Native PHP-/SQL-/TTFB-Zeiten, Kundenklassen und echter Checkout `NOT_TESTED`. Keine neue globale Cache-Schicht oder Preis-/Bestelländerung. Kein Commit, Push, Merge, Deployment, Sync, Cache-Purge oder B2C-Eingriff.

## Unreleased – Vollständiger CSS-Build und sichere Bereinigung (2026-11-13)

- Basis `6e18519`, ausschließlich lokal auf `develop`, Version 1.0.7 unverändert; vorherige Phase 2 erhalten. [CSS-Prüfbericht](../../.cache/css-cleanup-phase2-20261113/CSS-Pruefbericht.html). Native Nachher-Abnahme `NOT_TESTED`.
- Ersetze Min-Datei-Teilpatches durch einen vollständigen Main-/Checkout-Build mit gepinntem `clean-css 5.3.3`, konsistenten Buildkopien/Manifest und bestehenden Critical-CSS-Ableitungen. `build:css` schreibt erst nach vollständiger Berechnung; `check:css` bleibt schreibfrei. Alte Matrix-/Facet-/Card-Einstiege behalten ihre bisherigen JS-Aufgaben.
- Bereinige belegte Wiederholungen und unmögliche Selektoren: Main-Quelle 310.265 → 306.941 Byte, Main-Min 213.013 → 211.648 Byte (−1.365); 56 doppelte/überschriebene Deklarationen, 26 Regel- und vier Media-Zusammenführungen. Checkout: sieben unmögliche Selektoren, 60 exakte Wiederholungen und vier gesondert belegte dateiübergreifende Deklarationen; Quelle 474.299 → 470.580 Byte (−3.719), Min 346.728 → 345.861 Byte (−867). Beide aktiven Min-Dateien zusammen −2.232 Byte; keine native Transfermessung.
- Prüfe den dateiübergreifenden Abbau eng: redundanter Footer-Styleblock im Head 328 Byte, vier durch Head/Main abgedeckte Checkout-Deklarationen. Head netto 137.260 → 137.184 Byte (−76), einschließlich neu abgeleiteter Ergänzungsblöcke und Cachekennungen. Weitere 56 Main-Deklarationen/1.255 Byte bleiben wegen sonst nötigem neuem Ladevertrag erhalten. Unveränderte CSS-Ladestrategie; kein Coverage-Purge. Dynamische Ceres-/FontAwesome-/Flaggen-/Kunden-/Payment-Zustände bleiben geschützt.
- Gezielte Tests PASS: 19 Buildfälle; je Twig 2/3 173 Syntax-, 38 Render-, 585 SEO-Fälle; Galerie 112, Zoom 21, Builder 8, Navigation/Karten je 10; Matrix 70/440/80/220; Bundles 12, Facetten 33; drei historische Critical-Hauptzweige 23 Paare. Der hashgebundene finale Vergleich umfasst 52 Kontexte: 22 exakt gleich, 30 nur mit dokumentierter gleichwertiger Newsletter-Nullpositions-Schreibweise; keine ungeklärte Eigenschafts- oder Geometrieabweichung, fünf PNG-Paare bytegleich. Lokale Entscheidung B: Freigabe mit dokumentierten Einschränkungen; native Nachher-Abnahme bleibt `NOT_TESTED`. Keine Gesamtsuite-, native Transfer-, TTFB- oder LCP-Gewinnbehauptung; keine Preis-/Bestell-/Zahlungsänderung, kein Commit/Deploy/Sync/Cache-Purge.

## Unreleased – Phase 2: gemeinsame Renderer und weniger Aufbereitung (2026-11-13)

- Basis `ac1138b`, ausschließlich lokal auf `develop`, unveränderte Version 1.0.7. [Phase-2-Prüfbericht](../../.cache/phase2-ac1138b-20261113/Phase2-Pruefbericht.html). Native Nachher-Abnahme in Pluginset 426: `NOT_TESTED`; die Abnahme des Ausgangsstands gilt nicht für diese Änderungen.
- Ersetze 25 vollständige PDP-Property-Filter durch einen Index in der bestehenden Extension: 12.500 → 500 ID-Zugriffe bei 500 Properties, unveränderte erste Treffer und Ausgabe. Verwende die sortierte Bildliste erneut und reduziere die Übersetzungen für sieben Matrixspalten von 28 auf 14. Fasse 17 Provider-Registrierungsblöcke in einer expliziten Tabelle zusammen; Reihenfolge, Konfiguration und Eventverhalten bleiben erhalten, 316 → 145 Zeilen.
- Verwende einen gemeinsamen Produktkarten-Renderer und einen kleinen Adapter für den bestehenden Eager-Modus. Reduziere Template-Whitespace und dekorative Elemente bei gleicher sichtbarer Ausgabe und Geometrie. Die lokale 60-Karten-Fixture spart je Sprache 65.770 unkomprimierte HTML-Byte und 150 Elemente; keine Netzwerktransferbehauptung. Alle 60 Artikel, sechs LiveShopping-Slots und Attributbatches bleiben erhalten. Die nötige Kartenregel vergrößert das Haupt-Min-CSS um 146 Byte; drei Critical-CSS-Zweige bleiben konsistent.
- Zentralisiere die Suche mit einmaliger Registrierung globaler Listener. Baue das generische Listing-Item-Modul aus einer gemeinsamen Quelle nur in die bestehenden Main-/Kategorie-/Vue-Einstiege ein; keine zusätzliche Request-Datei, eigene PDP-Implementierung und gemeinsamer Core-Cache erhalten. Nutze konservative Terser-Kompression ohne Unsafe-Optionen/Property-Mangling und Cachekennung `core2`. Lokal sinken die ausgewählten Core-/Item-/Zoom-Dateien der kalten PDP von 267.641 auf 255.919 Body-Byte (−11.722), weiterhin drei Requests. Der kontrollierte unkomprimierte HTTP-Lauf Home → Kategorie → PDP sinkt für die betrachteten JS-Bundles von 329.190 auf 319.521 Transfer-Byte (−9.669), weiterhin fünf Requests; spätere Navigationen übertragen auf beiden Ständen null Byte. Gemischte CPU-Einzelläufe belegen keinen allgemeinen Laufzeitgewinn; native Nachher-Abnahme bleibt `NOT_TESTED`.
- Verwerfe den früheren Lazy-Observer-Start nach dem HTML-Parsing: Im Kontrollfall verzögert ein langsames zusätzliches Bild `window.load` und die Bedieninitialisierung von rund 123 auf 1.458 ms bei 1.400 ms Bildverzögerung. Der bisherige Start bleibt erhalten; kein belegter nativer LCP-/CLS-Gewinn.
- Verwerfe den Mengen-Getter im Header wegen nachgewiesener requestinterner IO-Netto-Preis-Seiteneffekte. Behalte den bisherigen Basket-Getter/PDP-Snapshot. Verwerfe die Checkout-CSS-Entfernung wegen abweichender früher Geometrie in zwölf Fällen. Preis-, Steuer-, Versand-, Bestell- und Zahlungslogik bleiben unverändert.
- Gezielte Prüfungen PASS: 13 PHP-Dateien, 58 Providervergleiche; je Twig 2/3 173 Templates, 585 SEO-Verträge, 360 Kartenkontrakte und 50 PDP-/50 Header-/60 Property-/20 Matrix-Bytevergleiche. Weitere ausgeführte Regressionen und technische Grenzen stehen im Bericht; keine Gesamtsuite- oder native PHP-/TTFB-/INP-Gewinnbehauptung. Kein Commit, Push, Merge, Deployment, Sync, Cache-Purge oder Eingriff in Plenty-Inhalte, Konfiguration, fremde Plugins oder B2C.

## Unreleased – Gemeinsame Assets, Critical CSS und Navigation (2026-11-13)

- Führe zwölf identische JS-Module in einem gemeinsamen Core zusammen; erhalte Reihenfolge, Ceres-Abhängigkeiten und seitenspezifische Logik. Lade MagicZoom auf PDPs direkt und sonst erst bei Quickview. Berücksichtige das interne Vendor-Ready-Signal, parallele Aufrufe, Fehler/Timeout und normale Produktnavigation als Fallback. Verhindere veraltete Quickview-Antworten und doppelte `quickViewItem`-Parameter.
- Baue alle acht produktiven Min-JS-Dateien vollständig und reproduzierbar mit gepinnten Abhängigkeiten; erhalte Vendor-Payloads und Lizenzen. Alte Teil-Builder delegieren an den vollständigen JS-Build. Die vier Seitenskripte enthalten die ausgelagerten Implementierungen nicht mehr.
- Entferne ausschließlich nachweislich redundante Critical-CSS-Deklarationen: je HTML-Antwort −1.069 bis −7.404 Byte. Layoutstabilisierungen und externe Stylesheets bleiben unverändert; 23 Browser-Vergleichspaare PASS.
- Vereinheitliche fünf aktive Kategorie-Navigationen mit sprachabhängigen Daten. Erhalte alle Links, Attribute, Reihenfolgen und mobile Bedienung; spare 21.611–27.945 HTML-Byte pro Sprache/Seite. Elementanzahl gleich, weniger Whitespace-Textknoten. Zehn Browserpaare PASS; kein PHP-Laufzeitgewinn.
- Verwende den PDP-Basket-Snapshot im Header erneut (2 → 1 Getter), überspringe 32 Quickview-Übersetzungen und registriere den Route-Provider einmal. Validiere Controller-IDs, Feedbackseite/maxcount und IT-/ES-Autocomplete-Parametertypen vor Datenzugriff. Dynamische Footerauflösung, vorhandene Attributbatches und Getter mit Seiteneffekten bleiben erhalten.
- Lokaler HTTP-Vergleich: Startseite/Kategorie ca. 87 KB weniger JS-Body bei einem zusätzlichen Request; kalte PDP +11.679 Byte und zwei zusätzliche Requests. Dreiseitige Navigation 875.600 → 417.023 Byte JS-Transfer, inklusive lokaler Header. Keine Aussage über native S3-/CWV-/TTFB-Gewinne; keine Brotli-Hochrechnung.
- [Bericht mit vollständigen Dateien, Messwerten, Tests, Screenshots und Grenzen](../../.cache/systematic-optimization-96e50ee-20261113/Pruefbericht.html). Twig 2/3 jeweils 173 Templates und 585 SEO-Fälle, PHP 13 Dateien, Matrix 70 Funktionen/440 Layouts, echte Asset-/MagicZoom-Ladekette und gezielte Regressionen PASS. Technische Zwischenabbrüche dokumentiert. Native Nachher-Abnahme, Kundenklassen und Zahlungen `NOT_TESTED`. Nur lokal auf `develop`, kein Commit/Push/Merge/Deploy/Sync/Cache-Purge, keine Versionsanhebung.

## Unreleased – Globale Suche, frühes Layout und Quickview-Aufbereitung (2026-11-13)

- Verhindere veraltete Autocomplete-Antworten nach Löschen oder erneuter Eingabe; entferne bei kurzem Suchtext die gesamte Ergebniszeile und den Ladezustand. Bestehende Debounce, API-Routen und fünf Sprachen unverändert. Vier Quellen/aktive Min-Dateien konsistent, gezielter Such-Builder und Kennung `search4`; +91 JS-Byte pro Bundle, keine zusätzlichen Requests. 40 neue und 80 bestehende Suchszenarien PASS; 16 ALT-Fehler reproduziert.
- Überspringe zwei ungenutzte IO-Getter ausschließlich im Quickview-Zweig von `SingleItem`; volle PDP und externe Include-Kontexte behalten die bisherige Datenversorgung. 36 bytegleiche Twig-Rendervergleiche, 120 Vorbereitungskontrakte und vier Trackingfälle PASS. Keine behauptete native PHP-/TTFB-Zeitersparnis; Varianten-, Preis-, Basket- und Bestelllogik unverändert.
- Ergänze 140 Byte Critical CSS für vorhandene ShopBuilder-Spalten mit durchgehender 50/50-Konfiguration ab 768 px. Acht Breiten ohne Änderung der fertigen Geometrie geprüft. Der native Login-Spaltenwechsel ist im isolierten HTML-/CSS-Vergleich beseitigt; verbleibende Shifts separat dokumentiert.
- Stabilisiere den gemeinsamen Footer beim Lazy-Laden durch vorhandenen Inlinefluss und echte Logo-Seitenverhältnisse. Haupt-CSS, Min-Datei und Critical-Ausgabe konsistent (`footer1`). Acht gepaarte Layoutprüfungen PASS, fertige Ausgabe und Requests unverändert; kleine Restbewegungen bleiben. Keine pauschalen Höhen, kein Null-CLS- oder Byteeinsparungsversprechen.
- Prüfe 13 eigene PHP-Dateien und aktualisiere das Inventar aller 172 Twig-Dateien anhand bestehender Audits und aktueller Abhängigkeiten. Keine riskante Altcode-/Facettencontroller-Entfernung; 60 Startseitenartikel bleiben erhalten. 40 native Ausgangsmessungen, lokale Traces und genaue Grenzen im [HTML-Bericht](../../.cache/global-performance-13af2e8-20261113/Pruefbericht.html).
- Nur lokal auf develop; native Nachher-Abnahme offen, keine Produktionsfreigabe. Kein Commit, Push, Merge, Deployment, Plugin-Sync oder Cache-Purge. B2C und externe Plugins unverändert.

## Unreleased – Startseiten-Grid und gemeinsame Kartenvorbereitung (2026-11-13)

- Ergänze `LiveShoppingGrid` für die vom Nutzer freigegebenen Slots 1–6 im bestehenden normalen Grid. Erhalte Slotabrufe, Gültigkeit, Artikelreihenfolge und Kartendaten; verwende den vorhandenen Attributbatch statt sechs Einzelaufrufen. Bereite sieben Übersetzungen und Währung einmal vor; kein behaupteter Wegfall von sechs Datenbankabfragen, da IO die Währung bereits im Request cached.
- Priorisiere ausschließlich das erste tatsächlich ausgegebene LiveShopping-Produktbild mit unveränderten AVIF-/Fallback-URLs und Abmessungen. Andere Bilder/Logos bleiben lazy; vorhandene Kartenaufrufe ändern ihr Verhalten nicht. Keine neue JS-/CSS-Ressource oder Änderung aktiver Min-Assets.
- Bereite den Herstellerpfad einmal im vorhandenen Kategoriegrid vor und entferne zwei unbenutzte Makroimports aus der Karte. Erhalte den Einzelkarten-Fallback und die bytegleiche 60-Artikel-Ausgabe. Keine Änderung an PHP-Suche, Preis-/Bestands- oder Bestelllogik.
- Dokumentiere 60 native Ausgangsmessungen und 36 isolierte Vergleiche. TTFB-Median 5.263 ms ohne beobachtbare Backend-Aufteilung; keine native Ladezeiteinsparung behauptet. Reviews: 75 Requests und nachgewiesener iframe-CLS; lokale `defer`-Inhaltsvorlage für Kategorie 5153/Beschreibung 2/de mit 20 erfolgreichen Browserfällen, ohne behauptete CLS-Behebung.
- [Bericht mit Tests, Screenshots und Grenzen](../../.cache/homepage-performance-25d2ca8-20261113/Pruefbericht.html). Die neue Partial benötigt später ein vollbreites ShopBuilder-Codewidget statt der bisherigen sechs Einzelwidgets. Plenty-Inhalte unverändert; native Nachher-Abnahme offen. Nur lokal auf develop, kein Commit/Push/Merge/Deployment/Sync/Cache-Purge. B2C und Variantenmatrix unverändert.

## Unreleased – Frühe Desktop-Warenkorbspalte (2026-11-13)

- Ergänze ausschließlich im allgemeinen Critical-CSS-Zweig von `Head.twig` die vorhandene `.col-lg-7`-Geometrie ab 992 px: genau 75 Byte, 58,333333 % Spaltenbreite entsprechend dem Hauptstylesheet. Keine neuen Requests; JS-/CSS-Quellen und aktive Min-Dateien unverändert.
- Dokumentiere den frühen MagicZoom-Schließversuch: Native Touch-Eingabe erreicht den noch über einen Vorfahren unsichtbaren Button während der Öffnungsanimation; der Vendor-Guard `!ready || !expanded` verwirft den Aufruf. Vendor-Block zwischen `1647723` und `964b6f5` identisch. Kein MagicZoom-Fix und keine abgeschlossene Stressabnahme behauptet; nativer ALT-Vergleich offen.
- Mobile Ceres-Laderhöhe von 120 px und bestehende Tablet-Lücke der Critical-Regel `.col-md-6` bei 768–991 px bleiben unverändert. Lokale Geometrieprüfungen belegen keinen gesamten nativen CLS-/LCP-Gewinn. [Prüfbericht mit Ergebnissen und Grenzen](../../.cache/theme-magiczoom-cls-964b6f5-20261113/Pruefbericht.html).
- Keine Versionsanhebung; lokal auf develop. Reales Mobilgerät und native Nachher-Abnahme nach Benutzerbereitstellung in 426 offen; keine Produktionsfreigabe. Kein Commit, Push, Merge, Deployment, Sync oder Cache-Purge. B2C, Preise, Bestelllogik, Matrix und Zahlungs-SDKs unverändert.

## Unreleased – CSS, Shop-Auswahldialog und sichere Asset-Ersetzung (2026-11-13)

- Entferne ungültige CSS-Quellsyntax und sieben bereits ignorierte Deklarationen ohne Änderung der wirksamen CSSOM. Checkout-Min-Datei −219 Byte; Haupt-Min-CSS unverändert. 20 lokale Layout-/Pixelvergleiche PASS; neue Checkout-Kennung `…-css1`.
- Behebe Escape nach vorherigem Tab im Shop-Auswahldialog. Entferne beim Schließen Dokument-Handler und Öffnungstimer; fehlendes Modal bleibt ohne Ausnahme. Verzögerung, Cookie und Ziele erhalten. 280 lokale Browserfälle PASS gegenüber 80 PASS/200 FAIL im Ausgangsstand; 800 Wiederholungszyklen ohne verbliebene Handler/Timer. Vier aktive Min-Bundles jeweils +153 Byte, Kennung `…-mode1`, keine neuen Requests; begrenzter `build-shop-mode-assets.cjs`.
- Entferne den ungenutzten Währungs-Getter im aktiven Footer. Je 15 Twig-2-/Twig-3-Fälle mit bytegleicher Ausgabe; kein behaupteter Datenbank-/TTFB-Gewinn.
- Begrenze `build-facet-assets.cjs` auf Start-/Endmarkierung seines CSS-Blocks. Nachfolgende Regeln bleiben erhalten; ein fehlender Abschluss bricht vor der CSS-Schreiboperation ab. Sechs isolierte Build-Prüfungen PASS. Keine Änderung an der Variantenmatrix oder aktiven Facetten-Assets.
- Dokumentiere 33 native Pagination-Paare und getrennte Zählkontexte. Upstream-Überschneidungen und Plattformzähler bleiben offen; keine Preis-/Ergebnis-/Sortierkorrektur im Theme. [Vollständiger Bericht](../../.cache/category-rootcause-1647723-20261113/Pruefbericht.html).
- Ausschließlich lokal auf develop. Native Nachher-Abnahme nach Bereitstellung in 426 erforderlich; keine Produktionsfreigabe. Kein Commit, Push, Merge, Deployment, Sync oder Cache-Purge. B2C, Preise, Bestelllogik, Matrix und externe Zahlungs-SDKs unverändert.

## Unreleased – Theme-Audit, Karten-Batch und Lazy-Observer (2026-11-13)

- Entferne einen ungenutzten zweiten Config-Lesevorgang und den überschriebenen ersten `loginSuccess`-Eintrag; wirksame Konfigurationen und Texte bleiben erhalten.
- Nutze den vorhandenen Attribut-Batch für maximal vier sichtbare PDP-Empfehlungen. Vier Einzelaufrufe → ein Sammelaufruf mit vier Suchfabriken; keine neue Artikelabfrage oder Änderung der Matrixversorgung.
- Löse vorherige Lozad-Observer beim erneuten Binden, fasse Lazy-Bilder je Append zusammen und starte InfiniteScroll nur mit Folgelink. Bewahre `pagehide`/BFcache. Betroffene eigene Bundle-Bereiche mit idempotentem `build-lazy-assets.cjs` synchronisiert; Cachezusatz `-lazy1`, Min-Mehrgröße 310 bzw. 207 Byte.
- Prüfe 24 Bootstrap-Konfigurationen, je Twig 2/3 fünf Meldungsobjekte sowie 36 Listen-/50 Empfehlungskombinationen, 16 Browser-Observer-Fälle und 34 bestehende Regressionstestgruppen nach dokumentierter Quickview-Fixture-Anpassung. Trenne 76 native Ausgangsmessungen, lokale Replays und offene native Nachher-Abnahme.
- Inventar aller 13 PHP-/171 Twig-Dateien und aktiven Assets. Nicht nachgewiesen aktive Homepage-/Taglisten bleiben unverändert. CSS-Quellfehler, Fremd-SDKs, Kundenkontext und Checkout offen; keine unbelegte LCP-/PHP-Einsparung. [Prüfbericht](../../.cache/theme-performance-final-20261113/Pruefbericht.html).
- Nur lokal auf develop; vorherige Änderungen erhalten. Kein Commit/Push/Merge/Deployment/Sync/Cache-Purge. B2C, Preise, Bestände und Bestelllogik unverändert.

## Unreleased – InfiniteScroll-Lifecycle und shopweiter Performance-Audit

- Ersetze im Kategorie-Bundle den InfiniteScroll-`unload`-Listener durch `pagehide`; bewahre bei `event.persisted` History und Scrollzustand. Normale Navigation behält Normalisierung und Bereinigung. Quelle/aktive Min-Datei konsistent, Cachekennung `…-language1-history1`, +31 unkomprimierte Min-Byte.
- Prüfe 60 lokale ALT-/NEU-Historyfälle in fünf Sprachen: BFcache-Rückkehr ALT 0/30, NEU 30/30 im isolierten Modulfixture. Kein belastbarer Zeitgewinn; native Ganzshop-Nachprüfung offen. 33 ausgeführte bestehende Prüfgruppen nach dokumentierten Fixture-Korrekturen PASS.
- Dokumentiere PageDesign-Ladefolge, LCP-/CLS-Belege, 28 native Zahlungs-Messungen, 65 Sprach-/Seiten-Quelltextprüfungen und 64 Bildfälle. Ein-Bild-eager-Alternative verworfen; keine neue CSS-/Facetten-/Matrixoptimierung.
- Zahlungs-SDK-Begrenzung weiterhin FAIL: PayPal 6.8.0 startet auch außerhalb des Vue-/Additional-Scripts-Zweigs; selektiver unterstützter Provider-Hook nicht nachgewiesen. Warenkorb 5482/Kasse 5484 bestätigt. Keine Plugin-Konfigurationsänderung oder unsichere HTML-/Scriptfilterung; Supporttext nur lokal vorbereitet. Keine Zahlungsfreigabe und kein behaupteter 429-/CORS-Fix.
- [Prüfbericht](../../.cache/shop-performance-5f83-20261112/Pruefbericht.html). Nur lokal auf develop; kein Commit/Push/Merge/Deployment/Sync/Cache-Purge. B2C, Preise, Rundung, Bestände und Bestelllogik unverändert.

## Unreleased – Gemeinsame Head-Routen, kein zusätzlicher PDP-Controller

- Verwende vorhandene IO-/hreflang-Ziele im bestehenden Modalablauf gemeinsam für Kategorien, Suche und PDP. Behalte den konfigurierten ShopBuilder-Dialog; entferne doppelte Sprachrouten-JSON-Ausgabe und Sprach-Observer aus dem Facettencontroller. Redaktionelle/erzwungene Canonicals behalten ihre SEO-Wirkung; die vorhandene Bedienroute wird bei Bedarf im Head separat markiert.
- Entferne Facettenasset und Zusatz-JSON auf PDPs. Erhalte Kategorie-/Suchfacetten und noch nicht angewendete Filter. Unterstütze geprüfte Varianten-IDs über die registrierte IO-Pfadroute; ignoriere Quickview-Kontext und beliebige Queryparameter. Auf PDP nur explizite gültige Währungs-/Versandlandparameter übernehmen; keine Mengen-/Preis-/Bestelländerung.
- Baue ausschließlich die bestehenden Modalbereiche der vier aktiven Bundles neu (`…-language1`); übrige Bundlebereiche bleiben bytegleich. Facettenasset `facets3`: 7.518 Byte. PDP netto −6.721 unkomprimierte JS-Byte und ein Asset weniger; Kategorie/Suche +797 Byte bei gleicher Assetzahl. Wiederholte lokale HTTP-/Brotli-/LCP-/CPU-Messungen und deren Grenzen im Bericht; keine native Performancefreigabe.
- Dokumentiere fünf Sprachen, 197 Artikel-/Varianten-/Modalfälle und vollständige ausgeführte Facetten-/Such-/SEO-/Quickview-/Matrix-/Galerie-/Bewertungs-/Layoutregressionen mit genauen Ergebnissen und Testabbrüchen. Nur lokal auf develop; native Nachher-Abnahme in 426 offen. Kein Commit/Push/Merge/Deployment/Sync/Cache-Purge; B2C unverändert.

## Unreleased – Sprachsichere Filterlinks und Artikel-Sprachwechsel

Historischer lokaler Zwischenstand: PDP-Zusatzcontroller, Routen-JSON und pauschale Parameterübernahme wurden durch den darüber beschriebenen gemeinsamen Head-/Modalansatz ersetzt. Die Entfernen-/Reset-Korrektur bleibt erhalten.

- Korrigiere die nativ belegten sprachlosen Entfernen-/Reset-Links in EN/FR/IT/ES. Das gemeinsame Facetten-Partial verwendet die aktuelle IO-Sprachroute mit `getCanonicalURL(null, true)` statt des sprachbereinigten Request-Pfads. Keine feste Präfixverkettung; redaktionelle Canonicals werden nicht zu Bedienlinks. Bestehende Filter-/Preis-/Query-Parameterbehandlung bleibt erhalten.
- Erweitere den vorhandenen Sprachdialog-Handler auf Produktdetailseiten. IO liefert die Artikel-/Variantenrouten über sicher kodiertes JSON; vorhandene URL-Parameter und Fragmente bleiben erhalten. Fehlende Routen werden erklärt und gesperrt. Keine Änderung an Artikel-, Matrix-, Preis- oder Bestelllogik.
- Synchronisiere `facets.js` und die aktive Min-Datei, neue JS-Kennung `facets2`. Das Asset wächst um 390 auf 9.200 unkomprimierte Byte und wird zusätzlich auf PDPs mit `defer` geladen. CSS und vier Hauptbundles bleiben unverändert; 69 initiale Facettenelemente, keine zusätzlichen Gruppenrequests. Kein unbewiesener Performancegewinn.
- Prüfe lokal 100 URL-Kombinationen je Twig-Version, 162 gezielte Browserfälle einschließlich 60 Artikel-Sprachwechseln, 534 bestehende Facetten-Browserfälle, je 133 Facetten- und 585 SEO-/Layoutfälle unter Twig 2/3 sowie Such-/Matrixregressionen. Bericht dokumentiert Testumgebung, korrigierte Testdoubles, Abbrüche und Grenzen. Native Nachher-Abnahme in Pluginset 426 bleibt erforderlich; keine Freigabe des bisher fehlerhaften nativen Stands. Nur lokal auf `develop`; kein Commit/Push/Merge/Deployment/Sync/Cache-Purge, B2C unverändert.

## Unreleased – Facettenzustand, Sprachwechsel und kompakte Ausgabe

- Behebe die drei nachgewiesenen Facettenfehler: Preisparameter erhalten NOINDEX unter Wahrung bestehender Robots-Regeln; aktive Filter und Reset bleiben auch ohne Ergebnis-Buckets erhalten; der Sprachdialog übernimmt den fachlichen Filterzustand auf die echten übersetzten IO-Routen.
- Stelle Checkboxen/Wertelisten erst beim ersten Öffnen aus kompakten vorhandenen IO-Daten her. Bereits erzeugte Elemente bleiben erhalten, geänderte Werte/Zahlen werden aktualisiert. Keine Gruppenanfragen und keine zusätzliche serverseitige Facettensuche; Preis-Eingabe startet erst beim Anwenden eine Anfrage. Entfernen arbeitet über serverseitig erzeugte Links, auch ohne passende Checkbox. Fehlende Metadaten werden mit übersetztem Hinweis und ID dargestellt.
- Ergänze Tastatur/Fokus, Fehleranzeige statt falscher Nulltreffer, veraltete-Antwort-Abwehr und Schutz vor mehrfacher Initialisierung. Verwende einen gemeinsamen Controller für die aktiven Kategorie-/Such-/Listen-Partials. Ein zusätzliches initiales JS-Asset; vorhandene vier JS-Bundles unverändert. Aktualisiere die Facetten-Min-Datei und ausschließlich begrenzte CSS-Ergänzungen; Cache-Kennungen `facets1` bzw. `…-perf1-facets1`.
- Messe lokal bei „Alle Artikel“ 459.255 → 16.717 Byte Facetten-HTML und 3.059 → 69 initiale Facettenelemente. Der kalte komprimierte Gesamttransfer sinkt dort um 1.605 Byte; kleinere Listen übertragen 1.707–2.916 Byte mehr. Kein nachgewiesener Gewinn bis zur ersten Interaktion, keine native TTFB-/PHP-Einsparung behauptet. 120 kontrollierte Messläufe, alle Grenzen und Screenshots im Prüfbericht.
- Prüfe 534 lokale Browserfälle einschließlich 100 Kombinationen/Öffnungszyklen und je 50 Sprach-, Nulltreffer- und Preisfällen; zusätzlich Twig 2/3, SEO-, Such- und Matrixregressionen. Fünf Sprachen und acht Breiten. Native Abnahme dieses Stands in 426 offen; keine Produktivfreigabe. Variantenmatrix, Preise/Rundung/Bestellungen, Galerie, Quickview-Daten und B2C unverändert. Kein Commit/Push/Merge/Deployment/Sync/Cache-Purge.

## Unreleased – Geprüfte PHP-Bereinigung aus dem Theme-Audit

- Entferne den unbenutzten Kategorie-Getter aus `getItemsFromCatSimple`. Suchoptionen, Preisfilter, Artikelkarten und die aktuelle Seitenkategorie bleiben erhalten. Ein Getter und eine Serviceauflösung weniger je Aufruf; keine pauschale Behauptung einer zusätzlichen Datenbankabfrage wegen des vorhandenen IO-MemoryCache.
- Entferne die unbenutzte zweite Feedback-Repository-Auflösung aus `dynamicGetFeedbacks` samt Import. Der tatsächliche Bewertungsabruf sowie JSON-/HTML-Ausgabe bleiben erhalten.
- Prüfe die realen PHP-/Twig-Pfade mit expliziten Servicefixtures unter Twig 2/3 und unabhängigen bestehenden Regressionen. Native Messungen des Ausgangsstands, öffentliche Lighthouse-Referenz, Inventar und offene Kontexte stehen im README und Auditbericht.
- Ausschließlich lokal auf `develop`; neue PHP-Änderungen noch nicht in Pluginset 426 abgenommen. Variantenmatrix, Preis-/Bestelllogik und sämtliche Frontend-Assets unverändert. Kein Commit, Push, Deployment, Sync oder Cache-Purge.

## Unreleased – Kollisionsschutz, frühe Zoom-Geometrie und Datenladeprüfung

- Bestehenden Kontaktwidget-Kollisionsschutz auf Desktop und Tablet erweitern. Nur tatsächliche Überdeckung blendet den geschlossenen Auslöser aus; offene Panels bleiben erhalten. Keine zusätzlichen globalen Scrollhandler; aktive JS-Kennung `contact3`.
- Fünf bestehende MagicZoom-Geometrieregeln durch den vorhandenen Build früh im PDP-Critical-CSS bereitstellen, begrenzt auf `#ItemImgZoom`. Keine feste Galeriehöhe, zusätzliche vollständige Vendor-CSS oder neue Regelquelle. Aktive Min-Bundles unverändert.
- Zwei unbenutzte Datenladeaufrufe aus der gemeinsamen PDP-/Quickview-Vorbereitung entfernen (`getVariationList` und `getBasePriceList`). Verwendete Varianten-, Preis-, Bestands- und Warenkorbdaten unverändert; kein Preis-Cache.
- Direkte Matrixversorgung ausdrücklich gegen die erreichbare IO-VariationList mit SingleItem-ResultFields vergleichen: fünf Sprachen, Gastkontexte, PDP/Quickview, führende EAN-Nullen und zusätzliche 60 reale Varianten. Ersatz mangels vollständiger Kontext-/Filter-/Twig-Nachweise noch nicht aktiviert; bestehende kompakte Sonderabfrage erhalten. 60-Zeilen-Matrixtests, Twig 2/3, Browserregressionen und getrennte lokale/nativ vorhandene Nachweise im README/Prüfbericht.
- Keine Bereitstellung, kein Plugin-Sync und keine Cache-Invalidierung. Native Abnahme der lokalen Änderungen in 426 steht aus.

## Unreleased – Layoutstabilität und shopweiter Performance-Audit

- Halte die fünf Bewertungssterne auf PDP und Quickview auch auf Desktop in einer Zeile: beide Ebenen verwenden dieselbe intrinsisch breite Rasterzelle statt der zu schmalen 105-px-Fläche. Die prozentuale Füllung bezieht sich auf die Sterne; der übersetzte Bewertungslink bleibt erhalten. 300 Sprach-/Breiten-/Bewertungsfälle geprüft.
- Begrenze das bestehende 1000×600-Unternehmensvideo proportional auf seine Containerbreite und lasse den Warenkorb-Link seine konfigurierten Seitenabstände bei der Breitenberechnung berücksichtigen. Behebe damit vorhandene horizontale Überläufe ohne Änderung der Inhalte, Links oder Bestelllogik.
- Reserviere vor der Matrixinitialisierung nur im vollständigen Tabellenlayout den Platz der bereits bekannten Variantenzeilen; verwende die vorhandene Attribut-Map ohne zusätzlichen Serviceaufruf. Befüllte Zeilen behalten ihre natürliche Höhe.
- Stabilisiere die bestehenden Galerie-Miniaturen vor und während MagicZoomPlus, unter Beibehaltung ihrer Bildproportionen. Übernehme die Rahmengeometrie in die frühen PDP-Styles; mobile Großansicht und Bildwechsel bleiben unverändert.
- Stelle die vorhandenen Footer-, Raster- und responsiven Anzeige-Regeln vor dem asynchronen Haupt-CSS bereit, ausdrücklich auf den Footer begrenzt und in der Reihenfolge der aktiven Min-CSS. Dies verhindert insbesondere das starke Umsortieren auf kurzen Seiten; Header und Produktraster bleiben erhalten.
- Reserviere in bestehenden ShopBuilder-Inhalten Platz für das Unternehmensbanner, die vier zugehörigen Bilder und die fünf verwendeten Zahlungslogos anhand ihrer tatsächlichen Abmessungen. Stelle das vorhandene Zahlungsraster nur im bekannten Zahlungsarten-Widget früh bereit; andere eingebettete Listen bleiben unverändert. Keine neuen Bilder, Bibliotheken oder API-Aufrufe.
- Synchronisiere Min-/Critical-CSS mit dem vorhandenen Build und verwende die CSS-Kennung `nl3-matrix4-logo1-gallery3-perf1`. Produktives JavaScript einschließlich aller Min-Dateien und Preis-/Bestelllogik bleibt bytegleich.
- Native Preview 426, öffentliche Produktion 427, lokale Antwortvergleiche und Lighthouse werden getrennt dokumentiert. PageSpeed-API und Weboberfläche melden HTTP 429; keine Preview-Token oder Shop-Sitzungen an PageSpeed Insights übermittelt. Lokale Prüfungen und noch offene Abnahme siehe README/Performancebericht. Keine Bereitstellung.

## Unveröffentlicht – EAN ohne Kopierbuttons

- EAN-Kopierbuttons, Symbol, Clipboard-/Fallback-Logik, Kopierfeedback, versteckte Statusausgabe, ausschließlich zugehörige CSS-Regeln und JS-Übersetzungen vollständig aus PDP/Quickview entfernt. Gemeinsame Variantenbild-Handler und sonstige Verbraucher bleiben erhalten.
- EAN-Anzeige, variantengenaue Werte einschließlich führender Nullen, Textmarkierung und manuelles Kopieren bleiben erhalten. Keine geänderte Bestelllogik oder zusätzliche API-Abfrage. Desktop weiterhin sieben Spalten; mobile EAN-/Summenzeile ohne Restlücke und ohne zusätzliche Höhe.
- Vier aktive JS-Min-Dateien und Min-/Critical-CSS synchronisiert. Neue Kennungen: `gallery2-matrix3` (JS), `nl3-matrix4-logo1-gallery3` (CSS). Kopierfunktionsprüfungen/Mock aus der gemeinsamen Matrixsuite entfernt, Prüfung der EAN-Textdarstellung erhalten und ergänzt.
- Native Ausgangsprüfung von 426: Preview bestätigt, fünf geladene Assets hashgleich zu `718ad95`. Neue Entfernung nur lokal geprüft: unter anderem 100 Quickview-Zyklen, 200 schnelle Desktop-Farbwechsel, 20 Wischtests und 100 Nachher-Layouts in fünf Sprachen. Vollständige Testmatrix und verbleibende externe Preview-/native Abnahmegrenzen in README/Prüfbericht. Keine Bereitstellung ausgeführt.

## Unveröffentlicht – letzte Korrekturen nach der gallery2-matrix2-Abnahme

- Geschlossenes Kontaktwidget unter 992 px nur bei tatsächlicher Überschneidung mit Matrix-/Warenkorbartikelbereichen vorübergehend ausblenden. Offene Kontaktfenster und Desktop bleiben erhalten; dynamische Quickviews werden ohne neuen Scrollhandler berücksichtigt.
- Ursache des 70-px-PDP-Sprungs behoben: Die Miniaturleiste bestimmt im gestapelten Layout nicht mehr die Galeriehöhe, sondern scrollt innerhalb der vom Hauptbild bestimmten Höhe. Keine neue feste Höhe oder Änderung am Bildformat.
- Artikel-Tracking nur auf vollständigen PDPs einmal ausführen. AJAX-Quickviews registrieren keine nie ausführbaren `window.load`-Handler mehr. Trackingdaten und bislang tatsächlich ausgeführte Ereignisse bleiben erhalten; Wachstum der PlentyONE-Vorschau-Handler bleibt als externe Einschränkung dokumentiert.
- Aktives Min-/Critical-CSS synchronisiert (`nl3-matrix3-logo1-gallery3`); Widget-Assets mit `contact2`. Galerie-/Matrix-JavaScript einschließlich Min-Dateien unverändert. Keine zusätzlichen Serviceabfragen oder Änderungen an Geschäftslogik.
- Lokale Regressionen einschließlich 100 Quickview-Zyklen, 200 schnellen Desktop-Wechseln und Hoch-/Querformatwechseln bestanden. Nachher-Abnahme des neuen Codes in Pluginset 426 steht aus. README/Prüfbericht trennen den bereits nativ abgenommenen gallery2-Ausgangsstand von diesen lokalen Änderungen. Keine Bereitstellung ausgeführt.

## Unveröffentlicht – mobiler Bild-Tap in der Variantenmatrix

- Mobil öffnet ein Tipp auf Matrixbild oder Lupe die vorhandene MagicZoomPlus-Großansicht mit den Bildern der angetippten Variante. Mengen und aktive Variante bleiben erhalten. Desktop-Klicks wechseln weiterhin nur die Galerie links.
- Quickview initialisiert bei Bedarf eine eigene native Instanz aus denselben bereits geladenen Bilddaten und beendet sie beim Schließen/Entfernen. Keine neue sichtbare Galerie, zusätzlichen Serviceabfragen oder künstlichen Bildlink-Klicks.
- Bereitschaft der großen Aufnahme wird abgewartet; schnelle Tipps werden bis dahin zusammengefasst. Das verhindert veraltete Bilder und die im ersten lokalen Entwurf gefundene Vendor-Race-Bedingung. Quellen/Min-Dateien und JS-Kennung `gallery2-matrix2` synchronisiert.
- Native Abnahme des zuvor bereitgestellten Stands `245e2a8` in Pluginset 426 und lokale Tests der neuen Änderung sind getrennt in README/Prüfbericht dokumentiert. Neue Änderung nicht bereitgestellt.

## Unveröffentlicht – Variantengruppen, Header-Logo und Newsletter-Kanal

- Mobile Varianten einschließlich EAN-/Summenzeile erhalten eine durchgehende stärkere Unterkante in `#969696`, ohne zusätzliche Höhe. Aktive Zeile, Seitenbalken, Desktop-Tabelle und schmale Karten bleiben erhalten; keine neuen Auswahlsymbole.
- Das unveränderte Header-Logo skaliert im Verhältnis 1114:226 in die verfügbare Spaltenbreite. Konkurrierende feste Bildhöhen entfallen; identische Haupt-/Critical-CSS-Regeln und Bildabmessungen reservieren die Größe vor dem Bilddownload.
- Das bestehende Newsletter-Popup bietet E-Mail und den offiziellen WhatsApp-Kanal mit den vorgegebenen Texten in fünf Sprachen. Newsletter-Routen, Scroll-Auslösung, Consent, Cookie-Laufzeit und Schließen bleiben erhalten. WhatsApp öffnet nach Klick in einem neuen Tab mit `noopener noreferrer`.
- Aktives CSS und kritische Regeln synchronisiert, CSS-Kennung `nl3-matrix3-logo1`. Kein zusätzliches JavaScript, Tracking oder API-Aufruf; JS-Dateien und Geschäftslogik unverändert. Lokale Tests und native Abnahmegrenzen in README/Prüfbericht. Keine Bereitstellung ausgeführt.

## Unveröffentlicht – gezielter Variantenmatrix-Nachtrag

- Deutlichere, einheitliche graue Zell-, Zeilen- und EAN-/Summengrenzen ohne höhere Zeilen; Zebra-Streifen bleiben erhalten.
- Vollständige übersetzte Spaltennamen, sofern sie in die tatsächliche Zelle passen. Vorhandene Kurzformen nur bei Platzmangel; PDP und Quickview verwenden dieselbe Messung.
- Ein gemeinsamer Wrapper begrenzt den vorhandenen Sticky-Tabellenkopf auf Kopf und Variantenkörper, vor dem Summen-/Warenkorb-Fußbereich. Keine Scrollhandler.
- Aktive Variante mit vorhandenem grünem Seitenbalken und dezenter hellgrüner Fläche (`#e6f1d9`), ohne Häkchen oder zusätzliches Auswahlsymbol.
- Quellen, aktive Min-Dateien, kritisches PDP-CSS und Cache-Zusatz `matrix2` synchronisiert. Keine neuen API-Abfragen oder Änderungen an Preis-, Bestands- und Bestelllogik. Lokale Tests und noch offene native Abnahme sind in README/Prüfbericht dokumentiert. Der bestätigte Kontaktwidget-Konflikt ist separat dokumentiert; Widget unverändert.

## Unveröffentlicht – responsive Variantenmatrix

- Produktdetailseite und Quickview verwenden weiterhin dieselbe Variantenmatrix. Breite Container zeigen die vollständige Tabelle; schmalere Container eine kompakte Tabelle mit sichtbarer EAN-/Summenzeile und nur sehr schmale Container kompakte Karten.
- Spaltenüberschriften bleiben beim Scrollen unter dem Shop- bzw. Modal-Kopf sichtbar. Die Quickview nutzt die verfügbare Breite und Höhe besser, mit eigenem Inhalts-Scrollbereich und erreichbarem Schließen-Button.
- Mobile EAN-Kopierfunktion in DE/EN/FR/IT/ES; genaue Zuordnung aus dem vorhandenen Varianten-Batch, führende Nullen und fehlende Werte bleiben erhalten. Keine zusätzlichen Varianten-/EAN-Abfragen oder Änderungen an Mengen, Preisen, Summen, Warenkorb- und Galerielogik.
- Die Matrixregeln stehen aus derselben CSS-Quelle auch im kritischen PDP-CSS bereit. Das verhindert den unformatierten Tabellenkopf vor dem asynchronen Hauptstylesheet; eine kleine Platzreserve begrenzt den Sprung des noch leeren Summenbereichs beim Zeilenaufbau.
- Betroffene CSS-/JS-Min-Dateien und Cache-Kennungen (`matrix1`) aktualisiert; unbeteiligte Bundle-Inhalte erhalten. Lokale Funktions-, Layout- und Regressionstests sowie getrennte Vorher-/Nachher-Messungen sind in README und Prüfbericht dokumentiert. Native Abnahme nach separater Bereitstellung in Test-Pluginset 426 steht aus.

## Unveröffentlicht – Vorschaubilder in IT/ES-Suchvorschlägen

- Der EN-Suchadapter wählt den Autocomplete-Modus vor dem Aufbau der nativen `SearchItems`-Factory. Das nachträgliche Ersetzen der ResultFields einer normalen Artikelsuche entfällt; die passende IO-Bildverarbeitung liefert weiterhin `urlPreview`.
- Die vorhandene Defaultbild-Erweiterung bleibt erhalten. Keine zusätzlichen Bildabfragen, keine Änderungen an DE/EN/FR, gemeinsamen Bildvorlagen oder Frontend-Bundles.
- Regressionen verwenden nun den echten IO-Bildfilter und prüfen Vorschaubild-/Produktzuordnung, Variantenpriorität und Platzhalter. Lokal korrigiert; native Abnahme in Pluginset 426 steht aus. Details in README.

## Unveröffentlicht – IT/ES-Vorschlagsroute und Galeriewechsel

- IT/ES rufen den vorhandenen EN-Suchadapter über den eindeutigen GET-Pfad `guardiansbasicb2b/item/search/autocomplete` auf. Die gleichnamige IO-Route wird nicht mehr überschrieben; DE/EN/FR bleiben auf IO. Keine globale Service-Bindung, zusätzliche Suchanfrage oder Änderung der Shopsprache.
- Enter nach Pfeilauswahl eines Produkts öffnet in IT/ES dessen lokalisierte Produkt-URL. Eine neue Eingabe hebt die vorherige Auswahl auf. Textvorschläge und normales Enter behalten das Formularziel.
- Farbwechsel erneuern nur die betroffene MagicZoom-Instanz ohne künstlichen Bildlink-Klick. Verzögerte Neustarts und globale Refresh-Timer entfallen; verspätete Antworten für entfernte Variantentabellen werden ignoriert.
- Alle vier JS-Quellen und Min-Bundles sind synchron; Cache-Zusatz `search3-gallery1`. Nur lokal vorbereitet. Native Suchabnahme und erneute Auslieferungsprüfung in Pluginset 426 stehen aus. CLS-Diagnose ohne CSS-Änderung; Details in README und Prüfbericht.

## Unveröffentlicht – Theme-Boot nach Suchintegration

- Der Vorschlagsdienst wird über die bestehende GET-Route und `pluginApp` geladen. Die globale native Service-Bindung hatte in Pluginset 426 mit `class IO\Services\ItemSearchAutocompleteService not found` den Start des Themes abgebrochen und das Ceres-Standardlayout ausgelöst.
- Ein Bootstrap-Regressionstest prüft die Theme- und Routenregistrierung. Die Suchtests führen den korrigierten API-Einstieg in DE, EN, FR, IT und ES aus. Die native Abnahme des lokalen Fixes in 426 steht aus.

## Unveröffentlicht – Italienische und spanische Shopsuche

- Für IT und ES verwendet die Textsuche den englischen Index. Ergebnislisten und Facetten teilen sich Textfilter und Preisgrenzen. Produkt-URLs, Darstellung und Kundenpreise folgen weiterhin dem lokalen Shopkontext.
- Die Vorschlagssuche fordert Produkte und englische Textvervollständigungen gemeinsam an. Der vorhandene IO-Formatter liefert die lokalisierten Links. Die Live-Abnahme im Test-Pluginset 426 steht aus.

## Unveröffentlicht – Markenlayout und Größen auf Artikelkarten

- Die Desktop-Markenübersicht baut Alphabet und Kacheln mit den endgültigen Layoutmaßen auf. Logos der ersten Markenreihe laden direkt. Die Desktop-Höhe des Headerlogos steht auch auf Artikellisten und Produktdetailseiten beim ersten Zeichnen fest.
- Kategorie-, Such- und eingebettete Artikellisten bündeln die bestehenden Größenabfragen je Renderaufruf. Größenreihenfolge und Größen von Geschwistervarianten bleiben erhalten.

## Unveröffentlicht – Suchvorschläge und numerische Suchfilter

- Die Vorschlagsliste zeigt numerische API-Labels wie `9885396` an. Führende Nullen in Textlabels bleiben erhalten. Leere oder fehlende Labels werden übersprungen. Die Hervorhebung behandelt Suchbegriff und Beschriftung als Text.
- Enter nach Pfeilauswahl verwendet wie der Suchbutton das Formularziel der aktuellen Shopsprache. Textvorschläge nutzen dasselbe Ziel; angeklickte Produktvorschläge behalten ihren Produktlink.
- Numerische Suchbegriffe und führende Nullen bleiben beim Filtern erhalten. Der Filterbutton übernimmt das Ziel der erfolgreichen Facettenantwort; bei fehlgeschlagener Anfrage bleibt er ohne Ziel gesperrt.

## Unveröffentlicht – Quickview und Marken A–Z

- Wiederholtes Öffnen von Artikel-Quickviews registriert den globalen Dropdown-Handler nur einmal pro Dokument. Die vier Seiten-Bundles verwenden den zusätzlichen Cache-Schlüssel `-qv1`.
- Auf der unpaginierten Markenübersicht behalten Basis-URL und `?page=1` ihre Robots-Vorgaben. Weitere und ungültige Seitenwerte erhalten `NOINDEX`, den Canonical der Basis-URL und keinen Seitenzusatz. Ein konfiguriertes `NOFOLLOW` bleibt erhalten.

## Unveröffentlicht – gefüllte Randseiten eingebetteter Artikellisten (2026-11-10)

- Enthält die aufgerufene Folgeseite trotz überschrittener gemeldeter Seitengrenze Artikel, bleiben ihre eigenen SEO-Metadaten und die konfigurierten Robots-Vorgaben erhalten. Leere Folgeseiten bleiben gesperrt. Die Entscheidung verwendet das vorhandene Suchergebnis.
- Eine volle Randseite, die der gemeldeten Trefferzahl widerspricht, bietet einen weiteren Navigationslink an. Infinite Scroll berücksichtigt eine tatsächlich nachgeladene Randseite in Titel und Beschreibung. Das eingebundene Kategorie-Bundle verwendet den neuen Cache-Schlüssel `-nl1-seo2`.
- Eingebettete Listen zeigen nach einem Sortierwechsel die wirksame Sortierung an. Die Preview-Befunde und lokalen Regressionsergebnisse stehen im SEO-Abnahmebericht der README.

## Unveröffentlicht – lokalisierte SEO-Seitenzusätze (2026-11-09)

- Titel und Meta-Description gültiger Folgeseiten beziehen den Sprachzusatz bereits im Server-HTML aus der aktiven Shop-Sprache. Regionale Sprachcodes und ein leeres Twig-`locale` sind abgedeckt.
- Die Ursache der Ausverkauft-Metadaten auf HTTP-404-Antworten sowie der Korrekturvorschlag sind in der README dokumentiert. Die 31 Schutzfälle für leere Kategorien bestehen in beiden Twig-Versionen.

## Unveröffentlicht – leere Artikelkategorien auf Seite 1 (2026-11-09)

- Auf ausdrückliche Nutzervorgabe bleiben ungefilterte leere Artikelkategorien auf der Basis-URL und bei `page=1` für ihre vorhandene Indexierungsvorgabe offen. Null Artikel erzwingen dort nicht mehr pauschal `NOINDEX`; explizites `NOINDEX`, `NOFOLLOW` und `forceNoIndex` bleiben erhalten.
- Leere Preisfilter-Ergebnisse, harte Filter-/Suchparameter, ungültige Seiteneingaben und Folgeseiten bleiben gesperrt. Die Ausnahme betrifft reguläre Artikelkategorien; die bisherige Behandlung leerer eingebetteter Content-Listen bleibt erhalten. Keine Änderung an Artikelzählung, Seitengrenzen, Canonicals oder Abfragen; keine URL-/Kategorie-ID-Sonderfälle.
- 31 gezielte Schutzfälle ergänzt und den bisherigen Erwartungswert für leere Kategorie-Seite 1 angepasst. Twig 2/3 jeweils 295/295 SEO-Fälle, 171/171 Syntax, 38/38 Regressionen und 60/60 Layoutfälle bestanden; JavaScript 111/111 plus 22/22 lokale Chrome-Fälle, Widget-Browser 55/55 mit 1.332 Assertions, PHP-Lint 12/12 bestanden. PlentyONE-Validator/Build und Bereitstellung dieses neuen PHP-Fixes nicht ausgeführt.
- Der vollständige Gegencheck im Test-Pluginset 426 bleibt ohne Gesamtfreigabe: Zähl-/Randseitenabweichungen und der reale 404-Metadatenpfad sind weiterhin offen; die neu gewünschte Erstseiten-Ausnahme ist dort noch nicht bereitgestellt. Umfang, genaue Ergebnisse und Grenzen stehen in der README.

## Unveröffentlicht – Auslieferungsdatei des SEO-JavaScripts (2026-11-09)

- Den korrigierten Metadatenblock aus `cat.js` in die tatsächlich eingebundene `cat-020726.min.js` übernommen. Vorhandenen Terser 5.44.0 verwendet; der gesamte Bundle-Inhalt außerhalb dieses Blocks bleibt bytegleich. Ein aktiver historischer JS-Buildprozess ist im aktuellen Checkout nicht vorhanden.
- Nur der Kategorie-Bundle erhält die Cache-URL `?v={{ buildHash }}-nl1-seo1`. Bestehende Auswahl der Seiten-Bundles, `defer` und alle anderen Asset-URLs bleiben erhalten. Die Metadatenregression kann jetzt ausdrücklich gegen die minifizierte Datei laufen; Twig-/Layouttests prüfen deren Einbindung und exakte Cache-Version.
- Lokal: Min-Datei 111/111 Metadatenfälle und 22/22 Chrome-Fälle; je Twig 2/3 264/264 SEO-Fälle, 171/171 Syntax, 38/38 Regressionen und 60/60 Layoutfälle bestanden. Alle vorherigen 261 SEO-Ergebnisse identisch. Der vorhandene Preview liefert weiterhin die alte Datei; keine Bereitstellung, Cache-Invalidierung oder B2C-Änderung durchgeführt. Details und Build-Grenzen in der README.

## Unveröffentlicht – JavaScript-Seitennummerierung und Randseitenanalyse (2026-11-09)

- Kategorie-JavaScript verwendet die vorhandenen `SeoPage`-Daten statt ungeprüfter URL-Seitennummern. Ungültige, leere, mehrdeutige und unbelegte Folgeseiten erhalten keine künstlichen Titel-/Beschreibungszusätze. Gültige Nummerierung einschließlich Infinite Scroll und History bleibt erhalten; Robots und Canonical werden nicht verändert.
- `PageMetadata.twig` stellt nur den bestehenden Paginierungszustand als HTML-Metadatum bereit. Keine Änderung an PHP-Abfrage, Artikelzählung oder serverseitiger SEO-Entscheidung und keine zusätzliche Abfrage. Content ohne Hauptliste und einfache Widgets bleiben ohne künstliche Pagination.
- Herren-/Damen-Randseiten in bestehender Sitzung, mit neuen HTTP-Sitzungen und in umgekehrter Reihenfolge untersucht: 36/36 HTTP 200, identische IDs, keine Wiederholungen innerhalb oder zwischen den jeweils letzten drei nicht leeren Seiten. Die Zählabweichung bleibt bestehen; eine konkrete Aggregations-/Cache-Ursache ist nicht nachgewiesen. Details, Korrekturvorschlag und Abnahmegrenzen in der README.
- Erneute Regressionen: je Twig 2/3 261/261 SEO-Fälle, 171/171 Syntaxprüfungen, 38/38 bestehende Regressionen und 60/60 Layoutfälle; alle vorherigen 250 Ergebnisse identisch. JavaScript: 111/111 VM-Fälle und 22/22 lokale Chrome-Fälle; bestehender Widget-Browserlauf 55/55 mit 1.332 Assertions. PHP-Lint 12/12 bestanden. Keine PlentyONE-Build-/Live-Abnahme des lokalen Fixes, kein Deployment oder Cache-Invalidieren, B2C unverändert.

## Unveröffentlicht – PlentyONE-Validierung des SEO-Codes (2026-11-09)

- Die vier gemeldeten PHP-Validierungsstellen korrigiert: `SeoPage` über `pluginApp()` statt direktem `new`, `is_finite()` durch sichere Bereichs-/Ganzzahlprüfung ersetzt und beide dynamischen `$parse()`-Aufrufe in eine benannte private Methode überführt.
- Auch die Exception bei ungültigen effektiven Seitendaten wird über `pluginApp()` erzeugt. Validierungen, Exception-Typ/-Text, Kategorie-Kontext, einzelne Artikelabfrage und SEO-Verhalten bleiben erhalten.
- Neue PHP-Funktionen gegen die offizielle Erlaubnisliste geprüft und gezielten Source-Regressionscheck ergänzt. Twig 2/3: jeweils 250/250 Fälle einschließlich 190/190 identischer Vorher-Ergebnisse, 171/171 Syntaxprüfungen, 38/38 bestehende Regressionen und 60/60 Layoutfälle bestanden. Browser: 55 Szenarien/1.332 Assertions bestanden; PHP-Lint 12/12 und Diff-Check bestanden.
- Der echte PlentyONE-Validator/Build wurde nach dem Fix nicht ausgeführt. Lokale Tests ersetzen diese Prüfung nicht. Änderungen nur lokal auf `develop`, ohne Versionsänderung, Commit, Push, Merge, Deployment oder Sync; B2C unverändert. Details und Abnahmegrenzen in der README.

## Unveröffentlicht – SEO Phase 1 (2026-11-09)

- Robots-Vorgaben einschließlich `NOINDEX`, `NOFOLLOW` und `forceNoIndex` bleiben auf Folgeseiten erhalten. Query-Regeln prüfen tatsächliche Parameternamen statt URL-Teilstrings.
- Reguläre Kategorien und eindeutig zugeordnete eingebettete Hauptlisten verwenden belegte Seitengrenzen. Ungültige oder nicht belegbare Folgeseiten erhalten `NOINDEX` und einen Basis-Canonical; der HTTP-Status bleibt in Phase 1 unverändert.
- Content-ShopBuilder wird einmal vor dem Head gerendert und sein HTML im Body wiederverwendet. Dieselbe gefilterte Artikelabfrage liefert Listen- und SEO-Daten ohne zusätzliche Zählabfrage. Quellkategorien überschreiben den Seitenkontext nicht mehr, auch bei einfachen Widgets.
- Seitennummern und Seitengrößen stammen aus validierten Suchoptionen. Explizite Canonicals bleiben erhalten; Content ohne Liste und Produktseiten erhalten keine künstlichen `page`-Canonicals.
- Lokal unter Twig 2/3 jeweils 190 SEO-Regressionen, 171 Template-Syntaxprüfungen, 38 bestehende Regressionen und 60 Layoutfälle bestanden. Individuelle ShopBuilder-Aufrufe einschließlich `(60, 24, [727])`, verschiedener Seitengrößen, gefilterter Gesamtzahlen und Content ohne Listenaufruf geprüft. Listen-HTML auf gültigen Seiten gegen die bisherige PHP-Methode verglichen; bestehender Widget-Browsertest mit 55 Szenarien und 1.332 Assertions bestanden. Echte PlentyONE-, Cache- und Shop-Abnahme bleibt NOT_RUN; Schritte und Grenzen stehen in der README.
- Nur lokale Änderungen auf `develop`, ohne Versionsänderung, Commit, Push, Deployment, Sync oder Cache-Invalidierung.

## Unveröffentlicht – Newsletter-Hinweis (2026-11-09)

- Kompakte B2B-Newsletter-Karte mit fünf Sprachfassungen und Anmeldelinks ergänzt. Sie erscheint ab 2.000 px Scrolltiefe und bleibt auf den Newsletter-Seiten ausgeblendet.
- Eine graugrüne Kontur hebt die Newsletter-Karte besser vom Seiteninhalt ab.
- Die Karte wartet auf die Antwort des Consent-Managers. Schließen über X merkt die Auswahl sieben Tage in einem eigenen, hostgebundenen B2B-Cookie.

## Unveröffentlicht – Kategorienavigation (2026-11-09)

- Home & Living ersetzt „Letzte Größe“ in der B2B-Kategorienavigation für DE, EN, FR, IT und ES. Die vorhandenen sprachspezifischen Unterkategorien sind wieder verfügbar.
- Die zuvor ausgeblendeten Preisstufen unter „Alles unter X Euro“ sind in allen fünf Sprachversionen wieder verfügbar.
- Der Eintrag „Gratis-Artikel“ unter „Alles unter X Euro“ ist in allen fünf Sprachversionen ausgeblendet.

## Unveröffentlicht – Kontakt-Widget (2026-11-03)

- Dezente Konturen heben das weiße Kontaktlabel, die grüne Chat-Blase und das geöffnete Kontaktfenster besser vom Seiteninhalt ab.
- Dauerhaft verfügbarer B2B-Kontaktbutton mit Outlet46-Gestaltung, responsivem Kontaktfenster, lokalem CSS/Vanilla-JavaScript und Inline-SVGs ergänzt. Nur das Fenster ist schließbar; kein dauerhafter Ausblendstatus oder zusätzlicher Dienst.
- Das Kontakt-Widget bietet einen WhatsApp-Direktchat mit +49 176 85450807 im neuen Tab mit `noopener noreferrer` sowie `mailto:b2b@outlet46.de`.
- Einmalige Einbindung über das bestehende B2B-Seitenlayout mit dynamischen `GuardiansBasicB2B`-Pluginpfaden, außerhalb von Vue und ohne Widget in Quickviews. Vorhandene Konfigurationen bleiben erhalten.
- Tastaturbedienung, Fokusführung, Safe-Area-Abstände, begrenzte Fensterhöhe und neun eigene Übersetzungsschlüssel in DE/EN/FR/IT/ES ergänzt. Abstand der vorhandenen Nach-oben-Kontrolle auf Widget-Seiten angepasst.
- Lokal geprüft: je 169/169 Twig-Templates und 50/50 Layoutfälle unter Twig 2/3, bestehende 38/38 Regressionen mit Baseline-Vergleich sowie 55 Browserszenarien mit 1332 Assertions. Echte PlentyONE-/Shop-/Geräteabnahme bleibt NOT_RUN; Details und Wiederholung in der README.
- Nur lokale, uncommittete Änderungen auf `develop`; keine Versionsänderung, kein Push, Merge, Deploy, Sync oder PlentyONE-Eingriff.

## v1.0.7 (2026-11-03)

### Geändert

- Twig-Kompatibilität nachgeprüft: zehn veraltete Schleifenbedingungen in sechs Templates in den jeweiligen Schleifenkörper verschoben; zustandsabhängige Abbruchbedingungen und Reihenfolge erhalten.
- Den bedingt deklarierten Titelblock der Bestellbestätigung auf eine gültige Blockdefinition umgestellt. Der bereits unter Twig 2 tatsächlich unbedingte Bestätigungstitel bleibt erhalten; keine Änderung der Kategorie-Titelauswahl eingeführt.
- Alle 168 Twig-Dateien unter Twig 2.16.1 und 3.30.0 parsebar; 38 gezielte Regressionstests einschließlich Vergleich zum Ausgangsstand ergänzt. PlentyONE-Abnahme und getrennte Bestandsprobleme bleiben offen; Einzelbefunde und Testgrenzen stehen in der README.

- Eigenständige B2B-Plugin-Identität `GuardiansBasicB2B`, einschließlich PHP-Namespaces, Service-/DataProvider, Twig-Templates, Übersetzungen und Konfigurationsreferenzen. Bestehende Klassennamen bleiben erhalten.
- Der vorhandene B2B-Pfad-Commit wird unverändert als Grundlage auf `develop` verwendet: 74 ersetzte Quelltextzeilen in elf Dateien, tatsächlich 105 feste URL-Vorkommen. Eigene Ressourcen, Ceres und AmazonPayCheckout verwenden dynamische Pfade statt fester Pluginset-IDs. Die Übernahme nach `main` folgt erst nach Abnahme.
- Eigene `plugin_path()`-Aufrufe verwenden `GuardiansBasicB2B`; Herstellerlogo-Ersetzungen und Fallbacks bleiben erhalten.
- Acht Manifest-Icons verwenden relative Pfade. B2B-Manifest-Inhalte, JavaScript-/CSS-Dateien, Ladebedingungen und B2B-Funktionen bleiben erhalten.
- Versionierung, Branch-Ablauf und manuelle Einrichtung der neuen Plugin-Identität dokumentiert. Bestehende PlentyONE-Konfigurationen und Container-Zuordnungen müssen im B2B-Test-Pluginset geprüft und bei Bedarf manuell übertragen werden.

### Abnahmestand

- Lokal vorbereitet; genaue Prüfergebnisse und Bestandsprobleme stehen in der README. PlentyONE-Installation, Bereitstellung und Shop-Abnahme sind noch offen.
- Geplant nach manuellem Commit/Push: `v1.0.7`, „GuardiansBasic B2B – Baseline v1.0.7“, zunächst als Pre-release bis zur PlentyONE-Abnahme. Kein Tag, Release, Commit, Push oder Sync wurde im Rahmen dieser Vorbereitung ausgeführt.

## v0.0.1 (2017-08-02)

### Hinzugefügt

- Initiale Plugin-Dateien.
- Funktionalität zum Überschreiben von CSS, Templates und Partials durch Aktivierung der Templates in der Plugin-Config.
