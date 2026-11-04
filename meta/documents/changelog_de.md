# Release Notes für eGuardiansBasic B2B

## v1.0.8 (2026-11-04) – lokal vorbereitet

- Premium-Kompakt-Header mit bestehendem B2B-Logo, breiter Suche, horizontalen Kundenfunktionen und integrierter Bewertung/Sprach-/Währungswahl. Vorteilsleiste mit unveränderten Inhalten kompakter.
- Gemeinsame Kategorienstruktur mit zwei schwarzen Desktop-Zeilen (28 + 1 + 28 = 57 px); elf Kategorien in abgestimmter Reihenfolge, Limited-Deals ausschließlich rot, Home & Living weiß. Desktop-Dropdowns unter beiden Zeilen, Hover- und Tastaturzugang per CSS.
- Vorhandene Home-&-Living-Blöcke (cat-4103) in DE/EN/FR/IT/ES aktiviert; B2B-URLs, Währungsparameter und acht Unterkategorien je Sprache erhalten. Magic-Menü-Optik und Handler unverändert; gemeinsame Hauptkategorien-Reihenfolge gilt auch mobil.
- Begrenzter Zusatz zu main.css und zur produktiven main-211025.min.css; deren bisheriger Inhalt bleibt erhalten. Identisches Critical CSS und Cache-Busting im Head; abgesicherter Build nur für den Header-Zusatz. Keine JS-, Kontakt-Widget- oder Konfigurationsänderungen.
- Lokal: 175/175 Layoutfälle, 50/50 Funktionsfälle, 169/169 Twig-Templates und 38/38 Regressionen je Twig-Version; Kontakt-Widget 55/55 Browserfälle. Messwerte, Screenshots, bestehende Quell-CSS-Parserbefunde und Testgrenzen in der README.
- Echte PlentyONE-/Ceres-Abnahme NOT_RUN. Änderungen ausschließlich lokal und uncommittet auf develop; keine Commits, Pushes, Merges, Tags, Releases, Deployments oder Synchronisierungen.

## Unveröffentlicht – Kontakt-Widget (2026-11-03)

- Dauerhaft verfügbarer B2B-Kontaktbutton mit Outlet46-Gestaltung, responsivem Kontaktfenster, lokalem CSS/Vanilla-JavaScript und Inline-SVGs ergänzt. Nur das Fenster ist schließbar; kein dauerhafter Ausblendstatus oder zusätzlicher Dienst.
- Genau zwei Kontaktwege: Outlet46-WhatsApp-Kanal im neuen Tab mit `noopener noreferrer` sowie `mailto:b2b@outlet46.de`. Kein persönlicher WhatsApp-Chat wird versprochen.
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
