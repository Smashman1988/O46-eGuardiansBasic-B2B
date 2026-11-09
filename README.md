# Outlet46 – eGuardiansBasic B2B

Technische Baseline **1.0.7**, lokal vorbereitet am **2026-11-03** auf **develop**.
Die PlentyONE-Abnahme steht aus. Dies ist noch kein freigegebener Shop-Stand.

Dieses Repository enthält die eigenen Inhalte und Funktionen des B2B-Shops.
Der technische Plugin-Name und PHP-/Twig-Namespace lauten `GuardiansBasicB2B`;
der Marketplace-Name ist in Deutsch und Englisch `eGuardiansBasic B2B`.
Das getrennte B2C-Plugin heißt weiterhin `GuardiansBasic`. Das GitHub-Repository
bleibt [O46-eGuardiansBasic-B2B](https://github.com/Smashman1988/O46-eGuardiansBasic-B2B).
B2C wurde nur als technische Referenz gelesen; keine B2C-Dateien wurden übernommen.

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
