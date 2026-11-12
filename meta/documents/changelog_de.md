# Release Notes für eGuardiansBasic B2B

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
