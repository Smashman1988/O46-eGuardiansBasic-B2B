# Release Notes for eGuardiansBasic B2B

## v1.0.8 (2026-11-04) – prepared locally

### Visual polish, still 1.0.8

- Explicit full-width desktop navigation with 12 px outer insets; seven equal slots from 1400 px and four direct links across the second row. Font breakpoint accommodates long translations; order, 57 px height and mobile Magic menu retained.
- Search is 34 px high and at most 560 px wide. Original PNG logo and embedded slogan retain their intrinsic aspect ratio at every width. White header remains 82 px on desktop / 91 px on mobile.
- Desktop basket caption is visually hidden but retained for assistive technology. Existing icon, dynamic quantity and adjacent total remain; fixed 36 px icon and constant counter center from 0 to 100. Large totals fit without overflow. Header Twig, bindings, production JavaScript and API behavior are unchanged.
- Only the existing CSS suffix and critical CSS updated; header3 cache key, plugin version 1.0.8. Final local checks pass: 185 layout cases, 8000 quantity/price states, 50 interaction cases, Twig, widget and integrity tests. Measurements/screenshots in README; PlentyONE NOT_RUN. No commits or deployment.

### Targeted refinement, still 1.0.8

- Desktop: seven existing dropdown categories in row one and four direct links in row two; shared Twig markup and mobile order remain entirely unchanged.
- Dark active dropdown background and white arrow, opening below both rows, cancellation of pending close delays when switching menus, hover and keyboard support. CSS reading-flow with the unchanged DOM as fallback.
- White desktop header increased from 72 to 82 px, centered content up to 1600 px, search capped at 760 px, wider spacing and complete basket totals. Navigation remains 57 px.
- Updated only the existing header CSS suffix, production minified file and critical CSS; header2 cache key without changing the plugin version. No production JavaScript, macro, Header Twig, widget or configuration changes.
- Re-ran and extended all previous local header checks: 175 layout cases / 9698 assertions, 50 control cases / 709 assertions, 15 keyboard cases / 334 assertions, all passing. Further evidence, measurements and screenshots are in the README. Actual PlentyONE acceptance NOT_RUN; local uncommitted changes on develop only.

### Initial implementation

- Premium Compact header retaining the B2B logo, with a wider search field, horizontal customer controls and integrated reviews/language/currency controls. Compacted the benefits bar while preserving its content.
- One shared category structure with two black desktop rows (28 + 1 + 28 = 57 px), all eleven categories in the agreed order, red Limited Deals and white Home & Living. Desktop dropdowns sit below both rows and support hover and keyboard focus through CSS.
- Activated the existing Home & Living blocks (cat-4103) in DE/EN/FR/IT/ES, retaining B2B URLs, currency parameters and eight children per language. Preserved Magic menu styling and handlers; the shared top-level category order also applies on mobile.
- Isolated additions to main.css and the production main-211025.min.css, preserving the entire previous production content. Matching critical CSS, cache busting and a guarded header-only build. No changes to production JavaScript, the contact widget or configuration.
- Local validation: 175/175 layout cases, 50/50 control cases, 169/169 Twig templates and 38/38 regressions per Twig version; contact widget 55/55 browser cases. Measurements, screenshots, pre-existing source CSS parser issues and limitations are recorded in the README.
- Actual PlentyONE/Ceres acceptance remains NOT_RUN. Local uncommitted changes on develop only; no commits, pushes, merges, tags, releases, deployments or synchronizations.

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
