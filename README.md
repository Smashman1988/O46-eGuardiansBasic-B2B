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

**Lokal implementiert und geprüft, PlentyONE-Abnahme NOT_RUN.** Arbeitsstand auf
`develop`, Ausgangscommit `15d06d2d336717c500e680c5e850c4e3f1b90b09`.
Keine Versions-, Konfigurations-, Asset-, Tracking- oder B2C-Änderung; kein Commit,
Push, Merge, Tag, Release, Deploy, Pluginset-Sync oder Cache-Invalidieren.

Die Ursache lag in drei getrennten Stellen: `PageMetadata.twig` ersetzte bestehende
Robots-Vorgaben auf Folgeseiten pauschal durch `INDEX,FOLLOW`; `Head.twig` übernahm
`page` ohne belegte Artikelliste und setzte fehlendes `pageMax` auf 1;
`getItemsFromCat()` berechnete Seitendaten aus Rohwerten statt aus den validierten
Suchoptionen. Die Content-Liste wurde zudem erst nach dem Head abgefragt.

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

### Lokale Tests und Grenzen

PHP **8.4.23**, Twig **2.16.1** und **3.30.0**, jeweils ohne PlentyONE-Services:

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

### Manuelle B2B-Test-Pluginset-Abnahme – vollständig NOT_RUN

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
