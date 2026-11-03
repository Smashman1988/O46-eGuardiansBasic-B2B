# eGuardiansBasic B2B – Einrichtung

Dieses Theme enthält die bestehenden Outlet46-B2B-Inhalte und Funktionen.
Technischer Plugin-Name und Namespace: `GuardiansBasicB2B`; Baseline-Version: `1.0.7`.
Das B2C-Plugin heißt weiterhin `GuardiansBasic` und gehört in sein separates Pluginset.

## Spätere Einrichtung im B2B-Test-Pluginset

Die Baseline wird zunächst lokal auf `develop` geprüft. Installation, Bereitstellung
und Synchronisierung sind noch nicht durchgeführt. Vor Änderungen vorhandene
B2B-Konfigurationswerte und Content-/Container-Zuordnungen sichern.

- Für plentyDevTool muss der lokale Plugin-Ordner `GuardiansBasicB2B` heißen.
  Der bisherige Git-Arbeitsordner bleibt bis zur manuellen Umstellung erhalten.
- Das neue Plugin gesondert im B2B-Test-Pluginset einrichten. Bestehende Plugins
  nicht löschen oder ersetzen; B2C und B2B nicht zusammen im selben Pluginset aktivieren.
- Vorhandene B2B-Werte in der neuen Plugin-Konfiguration prüfen und bei Bedarf
  manuell übertragen. Template-Overrides stehen unter `templates.override`.
  Keine pauschale Aktivierung aller Overrides: vier Rechtstext-Templates fehlen
  bereits im Bestand; Details stehen in der README.
- Content-Zuordnungen verwenden den neuen Provider-Key
  `GuardiansBasicB2B\Containers\GuardiansBasicContainer`.
  Das Template `Stylesheet.twig` enthält derzeit nur kommentierte Einbindungen;
  die aktiven CSS-Ressourcen werden im Head geladen.
- Nach späterer Bereitstellung alle B2B-Abläufe und Ressourcen im Test-Pluginset
  prüfen. Eine lokale Syntaxprüfung ersetzt diese Abnahme nicht.

Vollständige Prüfergebnisse, Bestandsprobleme, Branch-/Release-Regeln und manuelle
Schritte stehen in der [README](../../README.md). Die historischen Changelog-Einträge
bleiben in [changelog_de.md](changelog_de.md) erhalten.

## Lizenz

GNU AFFERO GENERAL PUBLIC LICENSE; siehe [LICENSE](../../LICENSE).
