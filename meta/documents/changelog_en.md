# Release Notes for eGuardiansBasic B2B

## v1.0.7 (2026-11-03)

### Changed

- Independent B2B plugin identity `GuardiansBasicB2B`, including PHP namespaces, service/data providers, Twig templates, translations and configuration references. Existing class names are retained.
- The existing B2B path commit is retained as the baseline on `develop`: 74 replaced source lines in eleven files, containing 105 fixed URL occurrences. Own resources, Ceres and AmazonPayCheckout use dynamic paths instead of fixed plugin set IDs. Transfer to `main` follows only after acceptance.
- Own `plugin_path()` calls use `GuardiansBasicB2B`; manufacturer-logo replacements and fallbacks are preserved.
- Eight manifest icons use relative paths. B2B manifest content, JavaScript/CSS files, loading conditions and B2B functionality are preserved.
- Documented versioning, branch workflow and manual setup of the new plugin identity. Existing PlentyONE configurations and container mappings must be checked and, where needed, transferred manually in the B2B test plugin set.

### Acceptance status

- Prepared locally; detailed validation results and pre-existing issues are recorded in the README. PlentyONE installation, deployment and storefront acceptance remain pending.
- Planned after manual commit/push: `v1.0.7`, “GuardiansBasic B2B – Baseline v1.0.7”, initially a pre-release until PlentyONE acceptance. No tag, release, commit, push or sync was performed as part of this preparation.

## v0.0.1 (2017-08-02)

### Added

- Initial plugin files.
- Functionality for overriding CSS, templates and partials by activating the respective template in the plugin config.
