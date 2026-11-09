# Release Notes für eGuardiansBasic B2B

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
