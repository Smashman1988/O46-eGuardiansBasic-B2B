# Release Notes for eGuardiansBasic B2B

## Unreleased – contact widget (2026-11-03)

- Added a persistent B2B contact launcher with Outlet46 styling, a responsive contact panel, local CSS/vanilla JavaScript and inline SVGs. Only the panel can be closed; no persistent dismissal state or additional service.
- Exactly two contact options: the Outlet46 WhatsApp channel in a new tab with `noopener noreferrer`, and `mailto:b2b@outlet46.de`. No personal WhatsApp conversation is promised.
- Included once through the existing B2B page layout using dynamic `GuardiansBasicB2B` plugin paths, outside Vue and omitted from Quickviews. Existing configuration is preserved.
- Added keyboard controls, focus handling, safe-area spacing, bounded panel height and nine dedicated translation keys in DE/EN/FR/IT/ES. Adjusted the existing back-to-top control's spacing on widget pages.
- Local validation: 169/169 Twig templates and 50/50 layout cases per Twig 2/3 version, existing 38/38 regressions with baseline comparison, and 55 browser scenarios with 1332 assertions. Actual PlentyONE/storefront/device acceptance remains NOT_RUN; details and reproduction steps are in the README.
- Local uncommitted changes on `develop` only; no version change, push, merge, deployment, sync or PlentyONE modification.

## v1.0.7 (2026-11-03)

### Changed

- Reviewed Twig compatibility: moved ten legacy loop conditions in six templates into their respective loop bodies, preserving state-dependent stopping conditions and iteration order.
- Replaced the conditionally declared order-confirmation title block with a valid block definition. Preserved the confirmation title that was already unconditional in actual Twig 2 execution; introduced no change to category-title selection.
- All 168 Twig files parse under Twig 2.16.1 and 3.30.0; added 38 targeted regression tests including comparison with the baseline. PlentyONE acceptance and separate pre-existing issues remain open; individual findings and test limitations are documented in the README.

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
