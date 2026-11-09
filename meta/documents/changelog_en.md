# Release Notes for eGuardiansBasic B2B

## Unreleased – SEO phase 1 (2026-11-09)

- Preserve existing robots restrictions, including `NOINDEX`, `NOFOLLOW` and forced noindex, on subsequent pages. Query rules now inspect actual parameter names instead of URL substrings.
- Use proven page limits for regular categories and unambiguous embedded main lists. Invalid or unproven follow-up URLs receive noindex and a base canonical; HTTP status handling remains unchanged in phase 1.
- Render content ShopBuilder once before the head and reuse its HTML in the body. The same filtered item query supplies list and SEO data without another count query. Source categories no longer overwrite the routed page context, including in simple widgets.
- Derive page numbers and sizes from validated search options. Respect explicit canonicals and avoid artificial page canonicals on content without a list and on product pages.
- Passed 190 SEO cases, 171 template syntax checks, 38 existing regressions and 60 layout cases on each of Twig 2 and 3. Covered individual ShopBuilder calls including `(60, 24, [727])`, different page sizes, filtered totals and content with no list call. Compared valid-page list HTML against the previous PHP method; passed the existing widget browser test with 55 scenarios and 1,332 assertions. Actual PlentyONE, cache and shop acceptance remains NOT_RUN; see README for steps and limitations.
- Local changes on develop only; no version change, commit, push, deployment, synchronization or cache invalidation.

## Unreleased – newsletter prompt (2026-11-09)

- Added a compact B2B newsletter card with five localized messages and signup links. It appears after 2,000 px of scrolling and stays hidden on newsletter signup pages.
- A grey-green border helps the newsletter card stand out against the page.
- The card waits for a response from the consent manager. Dismissing it with the close button saves that choice for seven days in a dedicated, host-only B2B cookie.

## Unreleased – category navigation (2026-11-09)

- Home & Living replaces “Last size” in the B2B category navigation for DE, EN, FR, IT, and ES. The existing localized subcategories are available again.
- The previously hidden price tiers under “Everything under X euros” are available again in all five languages.
- The “Free article” entry under “Everything under X euros” is hidden in all five languages.

## Unreleased – contact widget (2026-11-03)

- Subtle borders help the white contact label, green chat bubble and open contact panel stand out against the page.
- Added a persistent B2B contact launcher with Outlet46 styling, a responsive contact panel, local CSS/vanilla JavaScript and inline SVGs. Only the panel can be closed; no persistent dismissal state or additional service.
- The contact widget offers a direct WhatsApp chat with +49 176 85450807 in a new tab with `noopener noreferrer`, and `mailto:b2b@outlet46.de`.
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
