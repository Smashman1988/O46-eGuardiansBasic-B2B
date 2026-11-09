# Outlet46 – eGuardiansBasic B2B

Version **1.0.8**, lokal vorbereitet am **2026-11-04** auf **develop** (uncommittet).
Die PlentyONE-Abnahme steht aus. Dies ist noch kein freigegebener Shop-Stand.

Dieses Repository enthält die eigenen Inhalte und Funktionen des B2B-Shops.
Der technische Plugin-Name und PHP-/Twig-Namespace lauten `GuardiansBasicB2B`;
der Marketplace-Name ist in Deutsch und Englisch `eGuardiansBasic B2B`.
Das getrennte B2C-Plugin heißt weiterhin `GuardiansBasic`. Das GitHub-Repository
bleibt [O46-eGuardiansBasic-B2B](https://github.com/Smashman1988/O46-eGuardiansBasic-B2B).
B2C wurde nur als technische Referenz gelesen; keine B2C-Dateien wurden übernommen.

## Premium-Kompakt – gezielte Nachbesserung, weiterhin 1.0.8 (2026-11-04)

Aktueller Auftrag auf dem zuvor sauberen **develop**, HEAD
`4b4503f29e87f732878ebebf0ecccdc14e61dea5` (`neuer header test`).
Die erste 1.0.8-Umsetzung ist bereits in diesem Commit enthalten und bleibt erhalten.
Diese Nachbesserung ist **lokal, uncommittet und unstaged**. Version und Plugin-Identität
sind unverändert. Die darunter archivierte Erstumsetzung beschreibt den vorherigen Stand.

### Ziel und Ursache

Die bisherige Desktop-Aufteilung mischte Dropdowns und Direktlinks in beiden Zeilen.
Der 72-px-Kopf verteilte fast die gesamte zusätzliche Bildschirmbreite auf die Suche,
während Kundenfunktionen bis an den rechten Rand reichten. Außerdem fehlte eine
eindeutige Kennzeichnung des geöffneten Menüs. Eine laufende CSS-Schließverzögerung
konnte beim Wechsel kurzfristig zwei Dropdowns sichtbar lassen.

### Gezielte Änderungen

- **Nur Desktop-CSS ordnet um:** Zeile 1 enthält Herren, Damen, Kinder, Sport,
  Home & Living, Alles unter X€! und Accessoires; Zeile 2 Alle Artikel,
  Limited-Deals, Letzte Größe und Marken A-Z. Die tatsächlichen `eg-ddown`-
  Blöcke und direkten Links wurden in DE/EN/FR/IT/ES geprüft: überall genau sieben
  Dropdowns und vier Direktlinks. Ein gemeinsames Raster verwendet deren vorhandene
  IDs und gibt langen Übersetzungen mehr Platz. Keine Kategorie wird dupliziert.
- **Alle fünf Makros und Header.twig bleiben vollständig unverändert.** Die
  mobile Reihenfolge bleibt exakt Alle Artikel, Herren, Damen, Kinder, Sport,
  Home & Living, Limited-Deals, Alles unter X€!, Accessoires, Letzte Größe,
  Marken A-Z. Weiße Menüflächen, grüner Kopf, Pfeile, Scrollsperre, Zurückfunktion
  und alle vorhandenen Event-Attribute bleiben erhalten.
- Desktop-Dropdowns beginnen weiterhin unter der kompletten **57-px-Navigation**.
  Das aktive Dropdown erhält einen dunkelgrauen Hintergrund (`#292929`),
  die Dropdown-Kategorien einen kleinen weißen Pfeil. Kein grüner Rahmen oder
  Unterstrich. Hover und Tastaturfokus werden berücksichtigt; bei gleichzeitigem
  Fokus und Mauszeiger erhält das mit der Maus gewählte Dropdown Vorrang.
- Die 300-ms-Schließverzögerung hält das Menü während des Mauswegs über Zeile 2
  offen. Beim Wechsel zu einem anderen Menü wird eine bereits laufende Verzögerung
  gezielt abgebrochen, sodass nur das neu ausgewählte Dropdown sichtbar bleibt.
  Frame-Stichproben prüfen den durchgehend sichtbaren Zustand beim Überqueren der
  zweiten Zeile. Keine neuen JavaScript-Handler und keine Änderung produktiver JS-Dateien.
- Der weiße Desktop-Kopf misst **82 px**. Sein Inhalt ist zentriert auf maximal
  1600 px mit 24 px Innenabstand begrenzt; Logo/Suche/Funktionen erhalten 20–36 px
  Zwischenraum. Die Suche bleibt flexibel und maximal 760 px breit. Kundenfunktionen
  haben 24 px Abstand und schrumpfen nicht. Logo und Slogan bleiben vollständig;
  Warenkorbsumme bis `123.456,78` wurde in jeder Desktop-Breite und Sprache geprüft.
- Der gemeinsame Desktop-/Hamburger-Breakpoint bleibt **992 px**, die größere
  Navigationsschrift ab 1400 px. Mobil bleiben Höhe und Layout unverändert.
- `reading-flow: grid-rows` lässt unterstützende Browser der sichtbaren Desktop-
  Reihenfolge auch per Tab folgen, ohne den mobilen DOM umzubauen. Der unveränderte
  DOM bleibt der Fallback für Browser ohne diese CSS-Eigenschaft; dort kann die
  Tab-Reihenfolge zwischen den Desktop-Zeilen wechseln. Beide Reihenfolgen wurden
  mit echten Tab-Tastendrücken in Chromium geprüft. Andere Browser/Screenreader
  sind NOT_RUN. Grundlage: [Chrome-Dokumentation zu CSS reading-flow](https://developer.chrome.com/blog/reading-flow?hl=en).

### CSS und geschützte Bereiche

Die produktive `main-211025.min.css` bleibt maßgeblich. Nur der vorhandene
Premium-Kompakt-Zusatz wurde angepasst; das eingefrorene Legacy-Präfix bleibt
unverändert. Derselbe geprüfte Zusatz steht in `main.css`, der Min-Datei und
dem Critical CSS in `Head.twig`. Der vorhandene abgesicherte Build wurde genutzt,
keine komplette CSS-Neuerzeugung. Beide CSS-URLs verwenden nun
`?v=1.0.8-header2-{{ buildHash }}`, ohne Versionssprung.

Die bekannten Parserbefunde der alten editierbaren main-/checkout-CSS-Quellen
sind unverändert; produktive Main-CSS und isolierter Zusatz parsen fehlerfrei.
Kontakt-Widget, alle JS-Dateien, Checkout-CSS, Übersetzungen, PHP, Konfiguration,
Header-Twig, Kategorie-Makros und `plugin.json` sind unverändert.

### Vorher-/Nachher-Messung

Lokaler Chromium 149.0.7827.55, echte Twig-Templates und produktive Assets, ohne
PlentyONE-Services. Werte in px für DE; Gesamt enthält die Vorteilsleiste.
Die 5 px mobil sind der bestehende Platzhalter bei geschlossenem Magic-Menü.

| Breite | Weißer Kopf | Navigation/Platzhalter | Gesamt | Suchspalte |
| ---: | ---: | ---: | ---: | ---: |
| 2560 | 72 → 82 | 57 → 57 | 155 → 165 | 1.712,64 → 760 |
| 1920 | 72 → 82 | 57 → 57 | 155 → 165 | 1.181,94 → 760 |
| 1600 | 72 → 82 | 57 → 57 | 155 → 165 | 917,58 → 760 |
| 1440 | 72 → 82 | 57 → 57 | 172 → 182 | 784,78 → 734,23 |
| 1366 | 72 → 82 | 57 → 57 | 172 → 182 | 723,36 → 663,48 |
| 1280 | 72 → 82 | 57 → 57 | 172 → 182 | 651,98 → 581,27 |
| 1200 | 72 → 82 | 57 → 57 | 172 → 182 | 585,58 → 504,8 |
| 1024 | 72 → 82 | 57 → 57 | 172 → 182 | 439,5 → 336,55 |
| 992 | 72 → 82 | 57 → 57 | 172 → 182 | 412,95 → 305,95 |
| 991 | 91 → 91 | 5 → 5 | 138 → 138 | 991 → 991 |
| 768 | 91 → 91 | 5 → 5 | 138 → 138 | 768 → 768 |
| 430 | 91 → 91 | 5 → 5 | 174 → 174 | 430 → 430 |
| 390 | 91 → 91 | 5 → 5 | 174 → 174 | 390 → 390 |
| 375 | 91 → 91 | 5 → 5 | 174 → 174 | 375 → 375 |
| 320 | 91 → 91 | 5 → 5 | 192 → 192 | 320 → 320 |

Alle fünf Sprachen: je **35/35 Layoutfälle** und **10/10 Funktionsfälle PASS**.
Zusätzliche Randbreiten: 575, 576, 577, 767, 769, 993, 1199, 1201, 1399, 1400,
1401, 1679, 1680, 1681, 1899, 1900, 1901, 2499, 2500 und 2501 px.

### Erneut ausgeführte und ergänzte Tests

| Prüfung | Ergebnis |
| --- | --- |
| Hauptmatrix, fünf Sprachen × 25 Breiten | 125/125 PASS; 7594 Assertions |
| Weitere zehn Randbreiten × fünf Sprachen | 50/50 PASS; 2104 Assertions |
| Gesamt Layout einschließlich Header-Abständen und großer Warenkorbsumme | **175/175 PASS; 9698 Assertions** |
| Funktionsmatrix, fünf Sprachen × fünf Seitenmodi × Desktop/Mobil | 50/50 PASS; 709 Assertions |
| Native Tab-Reihenfolge und DOM-Fallback bei 992/1440/1920, fünf Sprachen | 15/15 PASS; 334 Assertions |
| Sticky bei echtem Scrollen, alle 15 Pflichtbreiten | 15/15 vorher und nachher PASS; je 19 Assertions |
| Twig 2.16.1 und Twig 3.30.0 | je 169/169 Templates, 38/38 bestehende Regressionen mit Baseline-Vergleich |
| Header-Render, fünf Sprachen, fünf Modi, EUR/USD | je 50/50 pro Twig-Version PASS |
| Kontakt-Widget | je 50/50 Renderfälle pro Twig-Version; 55/55 Browserfälle, 1332 Assertions |
| Statische Integrität, Makros, Header, Assets, JSON | 90/90 PASS, darin 15/15 JSON-Dateien |
| Isolierter Build-Abgleich, PHP-/Node-Syntax, git diff --check | PASS |
| Finale Browser-/Konsolenfehler, fehlende lokale Ressourcen, externe Requests | jeweils 0 |
| Echte PlentyONE-/Ceres-Abnahme | **NOT_RUN** |

Die Layoutmatrix prüft alle sieben Dropdowns, die vier Direktlink-Positionen,
aktive Zustände per Maus/Tastatur, Dropdown-Unterkanten, direkten Menüwechsel,
Textgrenzen, Overflow, Header-Abstände und vollständige Summen. Bei 1440/1920 px
wird der Mausweg über Zeile 2 bildweise auf Sichtbarkeit geprüft. Mobil werden
Home-Untermenü/Zurück/Scrollsperre in jeder Breite und alle übrigen sechs Untermenüs
zusätzlich bei 390/768 px getestet. Die Funktionsmatrix klickt auch alle vier
Direktlinks je Sprache und Desktop-Seitenmodus und prüft deren unveränderte Ziele.
Suche/Livesuche, Konto, Merkliste, Warenkorb, Sprache und Währung verwenden die
unveränderten produktiven Handler mit expliziten lokalen Service-Testantworten.

Zwei frühe Browserläufe endeten reproduzierbar am neuen Ein-Dropdown-Validator;
die CSS-Ursache wurde behoben und die volle Matrix anschließend erfolgreich
ausgeführt. Keine Test-/Tool-Timeouts in diesem Nachbesserungsauftrag. Bekannte
Twig-Deprecations unter PHP 8.4 sind getrennt dokumentiert, keine neuen Parserfehler.

### Screenshots, Berichte und Wiederholung

- 1440 px: [vorher](.cache/premium-header-refinement/before/de-1440-header.png),
  [nachher](.cache/premium-header-refinement/after/de-1440-header.png).
- 1920 px: [vorher](.cache/premium-header-refinement/before/de-1920-header.png),
  [nachher](.cache/premium-header-refinement/after/de-1920-header.png),
  [aktives Dropdown](.cache/premium-header-refinement/after/de-1920-active-dropdown.png).
- [Große Warenkorbsumme](.cache/premium-header-refinement/after/de-1440-large-total.png),
  [Magic-Untermenü](.cache/premium-header-refinement/after/de-390-magic-home.png).
- [Hauptmatrix](.cache/premium-header-refinement/after/browser-report.json),
  [Randbreiten](.cache/premium-header-refinement/after/boundary-report.json),
  [Funktionsmatrix](.cache/premium-header-refinement/after/integration-report.json),
  [Tastaturprüfung](.cache/premium-header-refinement/after/focus-order-report.json),
  [statische Prüfungen](.cache/premium-header-refinement/static-report.json).

Alle Artefakte liegen lokal in der ignorierten Ablage `.cache/premium-header-refinement/`.
Der bestehende Renderer unterstützt zusätzlich
`--baseline=4b4503f29e87f732878ebebf0ecccdc14e61dea5` für den Vorher-Stand;
`--baseline` ohne Wert behält seine frühere Bedeutung. Die bestehenden Browser-
Aufrufe `--baseline`, `--boundaries`, `--integration`, `--sticky` und
`--probe` bleiben bestehen; `--focus-order` ergänzt die Tastaturprüfung.
Toolpfade und Aufrufe entsprechen dem darunter dokumentierten lokalen Testaufbau.

### Geänderte Dateien und offene Abnahme

Neun Dateien: `resources/css/main.css`, `resources/css/main-211025.min.css`,
`resources/views/PageDesign/Partials/Head.twig`, `tests/premium_header.cjs`,
`tests/premium_header.php`, `tests/premium_header_static.cjs`, `README.md`,
`meta/documents/changelog_de.md`, `meta/documents/changelog_en.md`.

Weiterhin NOT_RUN: echter PlentyONE-/Ceres-Render, reale Kunden-/Preis-/Warenkorb-
zustände, tatsächlicher Sprach-/Währungswechsel, Checkout, Kategorie-HTTP-Status,
externe Ressourcen/Flags, Deployment-Cache und physische Mobilgeräte/andere Browser.
Die lokale Ceres-Flagge ist weiterhin eine Test-SVG; keine echte Bestellung oder
produktive Datenänderung. Bestehende unabhängige Baseline-Befunde bleiben bestehen.

**Nur B2B geändert; B2C und main unverändert.** HEAD bleibt `4b4503f29e87f732878ebebf0ecccdc14e61dea5`,
main bleibt `9fd71bc173bec1a3f9815a807f0cf22292a0e998`. Keine Commits, kein Push,
Merge, Tag, Release, Deployment oder Sync. Alle Änderungen lokal auf develop.

## Erster Premium-Kompakt-Stand – historisch vor der Nachbesserung (1.0.8)

Ausgangsstand: sauberer Branch **develop**, HEAD
`8eeb24f7732c2cb5558b2dbf148eb85182708f0d` (`tele-box`). Die vorhandenen
Kontakt-Widget- und Twig-Korrekturen sind darin bereits enthalten und bleiben
erhalten. Tatsächlicher Repository-/Pluginordner: `O46-B2B/GuardiansBasic`;
technische Plugin-Identität weiterhin `GuardiansBasicB2B`. Kein Ordner umbenannt.
Die älteren Abschnitte unten dokumentieren ihre jeweiligen damaligen Arbeitsstände.

### Header, Navigation und Magic-Menü

- Weißer Desktop-Kopf mit **72 px** Höhe: unverändertes B2B-Logo samt Slogan
  proportional verkleinert, breitere Produktsuche und horizontale grüne Symbole
  für Merken, Konto und Warenkorb. Warenkorbsumme und Mengenanzeige bleiben erhalten;
  die Warenkorb-Beschriftung nutzt den vorhandenen Übersetzungsschlüssel.
- Google-Bewertung, Sprache und Währung sind in den Kopf integriert. Sie sind nun
  auch mobil Teil des Sticky-Headers; die sichtbare weiße Gesamthöhe bleibt mobil
  bei 91 px. Bestehende URLs, Suchformular, Livesuche, Modal- und Basket-Attribute
  sowie alle B2B-Bedingungen bleiben erhalten. Ein überzähliges schließendes
  `span` im angefassten Merkliste-Link wurde entfernt.
- Desktop ab **992 px**: eine gemeinsame `top-menu`-Liste als Raster mit sechs
  und fünf Einträgen. Zeile 1: Alle Artikel, Herren, Damen, Kinder, Sport,
  Home & Living. Zeile 2: Limited-Deals, Alles unter X€!, Accessoires, Letzte
  Größe, Marken A-Z. **28 + 1 + 28 = 57 px** Gesamthöhe, schwarze Flächen und
  graue Trennlinien. Limited-Deals ausschließlich rot; Home & Living weiß.
- Die vollständigen Sport-/Home-Blöcke wurden in den vorhandenen Makros versetzt,
  damit DOM- und Tastaturreihenfolge der gewünschten Navigation folgen. Auch die
  mobile Liste nutzt diese gemeinsame Hauptkategorien-Reihenfolge. Ihre Optik,
  Dropdown-Struktur, grüner Kopf, weiße Flächen, Pfeile, Zurücknavigation,
  Öffnen/Schließen, Scrollsperre und vorhandenen Animationen bleiben erhalten.
  Es gibt weder ein zweites Menü noch eine separat gepflegte Kategorienliste.
- Desktop-Dropdowns beginnen unter beiden Zeilen. `:focus-within` macht sie
  mit der Tastatur zugänglich; sichtbare neutrale Fokusrahmen bleiben erhalten.
  Ein kurzer Sichtbarkeitswechsel (100 ms Öffnen / 160 ms Schließen) erlaubt den
  Mausweg über die zweite Zeile, ohne deren Links mit einer Fläche zu überdecken.
  Alle produktiven JS-Dateien und bestehenden Handler sind unverändert.
- Die Vorteilsleiste behält sämtliche B2B-Texte, Übersetzungen und Symbole;
  Desktop-Abstände und Schrift sind kompakter. Keine neuen Leistungsversprechen.

### Home & Living in allen fünf Sprachen

Alle fünf B2B-Blöcke waren vorhanden und auskommentiert. DE kommentierte direkt
den Block aus; EN/IT/ES schlossen den nachfolgenden Trenner ein; FR begann den
Kommentar bereits am vorangehenden Trenner. Jeder Block wurde einzeln aktiviert.
Kategorie **4103**, acht Unterkategorien, URLs, Übersetzungen, Kinderreihenfolge,
Währungsparameter und Event-Attribute sind aus dem jeweiligen B2B-Bestand erhalten.
Der automatisierte Vergleich bestätigt **55/55 unveränderte Kategorieblöcke**
(elf pro Sprache, bis auf äußere Aktivierung/Position und Leerraum).

| Sprache | Beschriftung | Vorhandene B2B-URL | Lokales Ergebnis |
| --- | --- | --- | --- |
| DE | Home & Living | `/home-living/` | 35/35 Layout; 10/10 Funktionen PASS |
| EN | Home & Living | `/en/home-living/` | 35/35 Layout; 10/10 Funktionen PASS |
| FR | Maison & Vie | `/fr/maison-vie/` | 35/35 Layout; 10/10 Funktionen PASS |
| IT | Casa e vita | `/it/casa-e-vita/` | 35/35 Layout; 10/10 Funktionen PASS |
| ES | Vida en el hogar | `/es/vida-en-el-hogar/` | 35/35 Layout; 10/10 Funktionen PASS |

Die Tests verfolgen auch die vorhandenen Home-Unterkategorie-Links mit USD.
Das bestätigt lokale Linkbildung und Browsernavigation; echte Kategorie-Inhalte
und HTTP-Status im Shop bleiben NOT_RUN.

### CSS-Assets und sicherer Build

Maßgeblich bleibt `resources/css/main-211025.min.css`, eingebunden im
`Head.twig` einschließlich Noscript-Fallback. **Alle ursprünglichen 200.532
Bytes dieser lokalen Produktivdatei bleiben als Präfix unverändert.** Nur der
abgegrenzte Premium-Kompakt-Block wird aus dem Ende von `main.css` minifiziert
und angehängt (4.209 Bytes minifizierter CSS-Inhalt).
Derselbe Block wird einmal als Critical CSS im Head eingebunden, damit er schon
vor dem asynchron geladenen Gesamt-CSS wirkt. Kein zusätzlicher HTTP-Request.
Beide CSS-URLs verwenden `?v=1.0.8-{{ buildHash }}`.

`scripts/build-header-css.cjs` prüft den eingefrorenen Produktivbestand per
SHA-256 und stoppt bei einer Abweichung; es baut **nur den Header-Zusatz** mit
clean-css 5.3.3, ohne Rebase oder globale Optimierung. Die Quelldatei, der
produktive Zusatz und der Critical-CSS-Block werden gemeinsam geprüft.
SHA-256 des ursprünglichen CSS, nach CRLF→LF-Normalisierung:
`c62cf6e83159a8208a0c008b718ebdeb31e7d509ffc95513db967f3c19269d69`.

Die älteren editierbaren CSS-Quellen sind bereits vor diesem Auftrag nicht
vollständig mit den Produktivdateien synchron. PostCSS meldet unverändert
`main.css:12714:5 – Unknown word right` und
`checkout.css:8516:27 – Unknown word //`. Deshalb **kein vollständiger CSS-Build**
und keine Rekonstruktion. Die produktive main-Min-Datei und der isolierte neue
Quellblock parsen fehlerfrei. Eine vollständig fehlerfreie Quell-CSS-Syntax wird
ausdrücklich nicht behauptet. Checkout-CSS, Kontakt-Widget, JS, Konfiguration,
Übersetzungsdateien und PHP bleiben unverändert.

### Gemessene Höhen und Bildschirmbreiten

Chromium 149, lokale HTTP-Vorschau aus den **echten Twig-Templates**, produktiven
CSS-Dateien und unveränderten JS-Bundles. Weißer Kopf umfasst vorher auch die
separate 30-px-Zusatzleiste. Gesamt umfasst Kopf, Navigation und Vorteilsleiste.
Alle Werte in px, Tabelle für DE. Unter 992 px sind die 5 px der bestehende
Platzhalter bei geschlossenem Magic-Menü, keine Desktop-Menüzeile.

| Breite | Weißer Kopf vorher → nachher | Navigation/Platzhalter vorher → nachher | Gesamt vorher → nachher | DE/EN/FR/IT/ES |
| ---: | ---: | ---: | ---: | --- |
| 2560 | 100 → 72 | 62 → 57 | 198 → 155 | 5/5 PASS |
| 1920 | 94 → 72 | 59 → 57 | 213 → 155 | 5/5 PASS |
| 1600 | 94 → 72 | 48,5 → 57 | 196,5 → 155 | 5/5 PASS |
| 1440 | 94 → 72 | 48,5 → 57 | 196,5 → 172 | 5/5 PASS |
| 1366 | 93 → 72 | 48,5 → 57 | 189,5 → 172 | 5/5 PASS |
| 1280 | 93 → 72 | 48,5 → 57 | 189,5 → 172 | 5/5 PASS |
| 1200 | 93 → 72 | 48,5 → 57 | 189,5 → 172 | 5/5 PASS |
| 1024 | 91 → 72 | 48,5 → 57 | 181,5 → 172 | 5/5 PASS |
| 992 | 91 → 72 | 53,5 → 57 | 186,5 → 172 | 5/5 PASS |
| 991 | 91 → 91 | 5 → 5 | 138 → 138 | 5/5 PASS |
| 768 | 91 → 91 | 5 → 5 | 138 → 138 | 5/5 PASS |
| 430 | 91 → 91 | 5 → 5 | 174 → 174 | 5/5 PASS |
| 390 | 91 → 91 | 5 → 5 | 174 → 174 | 5/5 PASS |
| 375 | 91 → 91 | 5 → 5 | 174 → 174 | 5/5 PASS |
| 320 | 91 → 91 | 5 → 5 | 192 → 192 | 5/5 PASS |

Zusätzlich in allen Sprachen geprüft: **575, 576, 577, 767, 769, 993, 1199,
1201, 1399, 1400, 1401, 1679, 1680, 1681, 1899, 1900, 1901, 2499, 2500,
2501 px**. Damit 35 Breiten × 5 Sprachen = **175/175 Layoutfälle**.
Desktop-Navigation stets 57 px, Weißbereich 72 px. Die gesamte Desktop-Höhe
liegt je nach Textumbruch bei DE/EN/IT zwischen 155 und 172 px, bei FR/ES
zwischen 155 und 189 px. Keine abgeschnittenen Hauptkategorien, Überlappungen
oder horizontalen Seiten-Scrollbalken in dieser Matrix.

### Testnachweise und Grenzen

| Prüfung | Ergebnis |
| --- | --- |
| Hauptmatrix: 25 Breiten × fünf Sprachen | 125/125 PASS, 4454 Assertions |
| Weitere zehn Randbreiten × fünf Sprachen | 50/50 PASS, 1329 Assertions |
| Handler/Funktionen: fünf Sprachen × fünf Seitentypen × Desktop/Mobil, USD | 50/50 PASS, 609 Assertions |
| Echtes Scrollen/Sticky bei allen 15 Pflichtbreiten | 15/15 vorher und 15/15 nachher PASS, je 19 Assertions |
| Twig 2.16.1 / Twig 3.30.0 | je 169/169 Templates parsebar; je 38/38 bestehende Regressionen einschließlich Baseline-Vergleich |
| Header-Render mit echtem Twig, fünf Sprachen, fünf Modi, EUR/USD | 50/50 pro Twig-Version PASS |
| Statische Integrität, Assets, Kategorieblöcke und JSON | 78/78 PASS; 15/15 JSON-Dateien gültig |
| Build und Critical-CSS-Abgleich | PASS; eingefrorenes Präfix und identischer Zusatz bestätigt |
| Bestehendes Kontakt-Widget | 50/50 Layoutfälle unter Twig 3; 55/55 Browserfälle, 1332 Assertions PASS |
| PHP-/Node-Syntax der neuen Test-/Build-Dateien, git diff --check | PASS |
| Finale Browserfehler / Konsolenfehler / fehlende lokale Ressourcen / externe Requests | jeweils 0 |
| Echter PlentyONE-/Ceres-Shop, externe Ressourcen und echte Services | **NOT_RUN** |

Die Funktionsmatrix umfasst Home, Kategorie, Artikel, Checkout und die bestehende
Vue-Kategorie-Bedingung. Sie klickt Konto, Sprach- und Währungsmodal, Merkliste,
Warenkorb, Home-Unterkategorien und Suchformular; die Livesuche sendet eine Anfrage
und rendert deren lokale Testantwort. Kein JavaScript-Handler wurde nachgebaut.
Die Antwortdaten, Login-Inhalte, Kategorienziele und Ceres-Flagge sind jedoch
explizite Test-Doubles. Eine Flaggen-Test-SVG ersetzt alle lokalen Ceres-Flaggen;
die tatsächlichen sprachspezifischen Ceres-URLs im Template bleiben erhalten.
Kein Login mit echten Daten, keine Warenkorbmutation, keine Bestellung.

Zwischenläufe sind keine Abnahme: Der erste Browserstart wurde durch die Sandbox
abgebrochen; nach freigegebenem lokalem Start liefen die Tests. Einige Browserläufe
wurden für gezielte Korrekturen manuell beendet. Der lokale PHP-Renderer benötigte
die Aktivierung des vorhandenen mbstring-Moduls. Testbefunde zu einer falschen
Unterkategorie-ID im Test, fehlendem Footer-Scrollbutton und URL-Kodierung spanischer
Links wurden im Testaufbau korrigiert. Ein SVG-Flex-Überlappungsbefund wurde im
Header-CSS behoben. Die finalen Ergebnisse oben enthalten diese Korrekturen.
Kein finaler Testlauf wurde durch ein Timeout abgebrochen. Vorhandene Twig-
Deprecations unter PHP 8.4 werden separat erfasst (24 in Twig 2, zwei in Twig 3).

### Lokale Artefakte und Wiederholung

Die ignorierte Ablage `.cache/premium-header/` enthält Vorher-/Nachher-HTML,
Screenshots und Rohberichte; sie wird nicht als Plugin-Code ausgeliefert.

- [Vorher, DE 1440 px](.cache/premium-header/before/de-1440-header.png)
- [Nachher, DE 1440 px](.cache/premium-header/after/de-1440-header.png)
- [Home-Dropdown, Desktop](.cache/premium-header/after/de-1440-dropdown.png)
- [Home-Untermenü, Magic-Menü 390 px](.cache/premium-header/after/de-390-magic-home.png)
- [Vorher-Messwerte](.cache/premium-header/before/browser-report.json),
  [Nachher-Matrix](.cache/premium-header/after/browser-report.json),
  [Randbreiten](.cache/premium-header/after/boundary-report.json),
  [Funktionsmatrix](.cache/premium-header/integration/integration-report.json),
  [statische Prüfungen](.cache/premium-header/static-report.json).

Weitere Screenshots heißen `{sprache}-{breite}.png` beziehungsweise
`{sprache}-{breite}-header.png` in `before/` und `after/`.
Die Vergleichs-Vollbilder decken alle 15 Pflichtbreiten in allen fünf Sprachen ab.

Werkzeuge extern/lokal bereitstellen, keine Laufzeitabhängigkeit ins Plugin aufnehmen:

```powershell
$env:O46_CLEAN_CSS_MODULE = (Resolve-Path .cache/asset-tools/node_modules/clean-css).Path
node scripts/build-header-css.cjs --check
node tests/premium_header_static.cjs .cache/premium-header/static-report.json
# PHP mit mbstring; autoload2.php oder autoload3.php aus der lokalen Testumgebung:
php -d extension=mbstring tests/premium_header.php <twig-autoload.php> .cache/premium-header/after
php -d extension=mbstring tests/premium_header.php <twig-autoload.php> .cache/premium-header/before --baseline
# Bei externer Installation O46_PLAYWRIGHT_MODULE / O46_BROWSER_EXECUTABLE setzen.
node tests/premium_header.cjs .cache/premium-header/before --baseline
node tests/premium_header.cjs .cache/premium-header/after
node tests/premium_header.cjs .cache/premium-header/after --boundaries
node tests/premium_header.cjs .cache/premium-header/after --integration
node tests/premium_header.cjs .cache/premium-header/after --sticky
```

### Vollständige Dateiliste dieses Header-Auftrags

```text
plugin.json
README.md
meta/documents/changelog_de.md
meta/documents/changelog_en.md
resources/views/PageDesign/Partials/Header/Header.twig
resources/views/PageDesign/Partials/Head.twig
resources/views/Category/Macros/CategoryTreeDE.twig
resources/views/Category/Macros/CategoryTreeEN.twig
resources/views/Category/Macros/CategoryTreeFR.twig
resources/views/Category/Macros/CategoryTreeIT.twig
resources/views/Category/Macros/CategoryTreeES.twig
resources/css/main.css
resources/css/main-211025.min.css
scripts/build-header-css.cjs
tests/premium_header.php
tests/premium_header.cjs
tests/premium_header_static.cjs
```

### Offene PlentyONE-Abnahme und Git-Status

**NOT_RUN:** tatsächlicher B2B-Test-Pluginset-Render mit Ceres/IO, Login/Konto,
B2B-Preis-/Kundenstatus, echter Warenkorb samt Mengen/Summen, Währungs-/Sprachwechsel,
Livesuche mit echten Treffern, Checkout, Kategorieinhalte und Ziel-HTTP-Status,
externe Fonts/Flags/Plugin-Ressourcen, Cache-Busting nach Bereitstellung sowie
physische Mobilgeräte und andere Browser. Keine lokale Vorschau ersetzt diese Abnahme.
Bestehende frühere Template-/Übersetzungsbefunde bleiben im Baseline-Abschnitt unten dokumentiert.

Ausschließlich **B2B** geändert; **B2C und main unverändert**. HEAD bleibt
`8eeb24f7732c2cb5558b2dbf148eb85182708f0d`; `main` bleibt
`9fd71bc173bec1a3f9815a807f0cf22292a0e998`. Alle 17 Dateien sind lokal,
uncommittet und unstaged auf **develop**. **Keine Commits, kein Push, kein Merge,
keine Tags, kein Release, kein PlentyONE-Deployment und keine Synchronisierung.**
Die spätere Prüfung und der Commit/Push erfolgen durch den Nutzer in GitHub Desktop.

## Kontakt-Widget für B2B (2026-11-03)

Lokal auf dem zuvor sauberen `develop` bei `0b31a98b198d5c48be4aaa6c9e56edfd3678ed98`
ergänzt. Die folgenden Änderungen sind uncommittet und unstaged zur Kontrolle in
GitHub Desktop. Plugin-Identität, Version und vorhandene Konfigurationen bleiben erhalten.

Der schwebende Button **„Kontakt / Beratung“** besteht aus einer weißen
Beschriftungsfläche und einem runden Chat-Symbol in Outlet46-Grün. Er bleibt auf
vollständigen Shopseiten sichtbar. Der Button öffnet ein freundliches Kontaktfenster
mit genau zwei vollständig anklickbaren Kontaktzeilen:

1. **Outlet46 auf WhatsApp – Unser WhatsApp-Kanal:**
   [WhatsApp-Kanal](https://whatsapp.com/channel/0029VbDashBBPzjbqTzmQb3m),
   neuer Tab mit `rel="noopener noreferrer"`. Dies ist ein Kanal; individuelle
   Beratung oder Antworten über WhatsApp werden nicht versprochen.
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
| Twig 2.16.1 / 3.30.0, PHP 8.4.23 | Je **169/169** Templates parsebar; **38/38** bestehende Verhaltenstests und **38/38** Vergleiche zur Twig-2-Baseline erfolgreich |
| Widget-Einbindung, beide Twig-Versionen | Je **50/50** Layoutfälle: neun vollständige Seitentypen plus Quickview, jeweils DE/EN/FR/IT/ES; Widget/CSS/JS genau einmal bzw. im Quickview nullmal; außerhalb von Vue |
| Übersetzungen und Links | **45/45** neue Texte vorhanden, neun identische eindeutige Schlüssel je Sprache; WhatsApp-Kanal und Mailadresse exakt; kein Telegram |
| Chromium 149.0.7827.55, Node 22.14.0 | **55/55** Szenarien, **1332/1332** Assertions; **0** JavaScript-Seitenfehler, **0** externe HTTP-Anfragen |
| Browserumfang | Isoliert, Standard-Theme, Kategorie-, Artikel- und Checkout-CSS einschließlich bestehendem Main-Stylesheet; DE bei 1440×900, 1024×768, 768×1024, 390×844, 320×568, 280×480 und 568×320; EN/FR/IT/ES je CSS-Variante bei 320×568 |
| Bedienung / Integrität | Öffnen per Klick/Enter/Leertaste; X, Escape, Umschalten, Außenklick, Tab-Verlassen; Fokus, doppelte Initialisierung und erneuter Seitenaufruf erfolgreich; Shop-Außenkontrolle und Modals behalten Priorität; Storage-/Cookie-Zugriffe würden den Test abbrechen |
| Layout / Sichtprüfung | Keine gemessenen Layoutverschiebungen und kein horizontaler Überlauf in den 55 Fällen; vollständige Kontaktzeilen erreichbar, Button und Nach-oben-Kontrolle getrennt; Desktop und Smartphone visuell geprüft |
| Kontraste | Fünf geprüfte Farbpaare mindestens 4,75:1; Header-/Launcher-Symbol 6,11:1, Kontakttext 15,65:1, Untertitel 6,62:1 |
| Syntax / Diff | Beide Test-PHP-Dateien mit `php -l`, Widget-JavaScript und Browserprüfung mit `node --check`, `git diff --check`: erfolgreich |

Die Layoutfälle rendern das tatsächliche B2B-Seitenlayout mit ausdrücklich lokalen
Plenty-/Ceres-Service- und Template-Fixtures. Sie beweisen die Einbindung und ersetzen
keinen vollständigen Shop-Render. Der vorhandene Twig-Regressionstest prüft weiterhin
alle bisherigen 38 Fälle unverändert; nur die aktuelle Inventur ist um die neue
Komponente erweitert. Der historische `--baseline`-Lauf liest die damaligen 168 Dateien
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
