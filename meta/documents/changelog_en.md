# Release Notes for eGuardiansBasic B2B

## Unreleased – preview images in IT/ES autocomplete

- The English-index adapter selects autocomplete mode before constructing the native `SearchItems` factory. It no longer replaces the result fields of a regular item search afterwards; the matching IO image pipeline continues to use `urlPreview`.
- The existing default-image extension is retained. No additional image queries or changes to DE/EN/FR, shared image templates or frontend bundles.
- Regressions now use the actual IO image filter and cover preview/product association, variation priority and placeholders. Fixed locally; native acceptance in plugin set 426 remains pending. See README.

## Unreleased – IT/ES autocomplete route and gallery changes

- Italian and Spanish autocomplete call the existing English-index adapter through the unique GET path `guardiansbasicb2b/item/search/autocomplete`. The IO route is no longer overridden; DE/EN/FR keep using IO. No global service binding, extra search request or storefront language change.
- Enter on a keyboard-selected product opens its localized product URL in IT/ES. Editing the query clears the previous selection. Text suggestions and ordinary Enter retain the form action.
- Color previews rebuild only the affected MagicZoom instance without synthesizing an image-link click. Delayed restarts and global refresh timers are removed; late responses for detached variation tables are ignored.
- All four JS sources and minified bundles are synchronized with the `search3-gallery1` cache suffix. Prepared locally only; native search acceptance and delivery verification in plugin set 426 remain pending. CLS diagnosis does not change CSS. See README and the test report.

## Unreleased – theme bootstrap after search integration

- Autocomplete resolves its service through the existing GET route and `pluginApp`. The global native service binding failed in plugin set 426 with `class IO\Services\ItemSearchAutocompleteService not found`, aborting theme startup and causing the standard Ceres layout to render.
- A bootstrap regression covers theme and route registration. Search tests exercise the corrected API entry point in DE, EN, FR, IT and ES. Native acceptance of the local fix in 426 is pending.

## Unreleased – Italian and Spanish storefront search

- Italian and Spanish text searches use the English index. Product lists and facets share the text filter and price range. Product URLs, display data and customer prices use the current storefront context.
- Autocomplete requests products and English text completions in one batch. IO formats the localized links. Live acceptance in test plugin set 426 is pending.

## Unreleased – brand directory layout and sizes on product cards

- The desktop brand directory reserves space for its alphabet and tiles before the first paint. First-row brand logos load directly. Product lists and product pages also reserve the final desktop header logo height.
- Category, search and embedded product lists batch their existing size lookups for each render. Cards retain the available sizes across variations and their display order.

## Unreleased – search suggestions and numeric search filters

- Autocomplete now displays numeric labels such as `9885396` and preserves leading zeros in text labels. It skips empty or missing labels and highlights the literal search term.
- Pressing Enter after choosing a suggestion with the arrow keys uses the current shop language’s search form, just like the search button. Text suggestions use the same destination; product suggestions keep their product links.
- Applying filters preserves numeric queries, including leading zeros. The filter button uses the destination from a successful facet response and stays disabled when the request fails.

## Unreleased – item Quickview and A–Z brand directory

- Opening item Quickviews repeatedly now leaves one global dropdown handler per document. The four page bundles use the additional cache key `-qv1`.
- The unpaginated brand directory keeps its configured robots directives on the base URL and `?page=1`. Other page numbers and invalid values get `NOINDEX`, the base canonical and no page suffix. An explicit `NOFOLLOW` is preserved.

## Unreleased – populated pages beyond the reported end of embedded item lists (2026-11-10)

- A requested page containing items keeps its own pagination metadata and configured robots directives even when the search reports fewer pages. Empty follow-up pages retain their indexing restrictions. Both decisions use the existing search result.
- A full page whose contents exceed the reported total offers one more navigation link. Infinite Scroll updates the title and description for an additional page confirmed by the appended response. The category bundle uses the new cache key `-nl1-seo2`.
- Embedded lists show the effective sort order after a sorting change. The SEO acceptance report in the README records preview observations and local regression results.

## Unreleased – localized SEO page suffixes (2026-11-09)

- Titles and meta descriptions on valid subsequent pages use the active shop language in the server-rendered HTML. Regional language codes and an empty Twig `locale` are covered.
- The README documents why HTTP 404 responses inherit the sold-out category metadata and proposes a correction. All 31 empty-category regression cases pass under both Twig versions.

## Unreleased – first page of empty item categories (2026-11-09)

- Following the user's explicit rule, unfiltered empty item categories retain eligibility for their configured indexing directives on the base URL and `page=1`. Zero items no longer force `NOINDEX` there; explicit `NOINDEX`, `NOFOLLOW` and `forceNoIndex` remain preserved.
- Empty price-filter results, hard filter/search parameters, invalid page inputs and follow-up pages remain restricted. This exception applies to regular item categories; existing treatment of empty embedded content lists is unchanged. No change to item counts, bounds, canonicals or queries, and no URL/category-ID special cases.
- Added 31 targeted safeguards and updated the previous empty-category first-page expectation. Each Twig 2/3 passed 295/295 SEO cases, 171/171 syntax checks, 38/38 regressions and 60/60 layout cases; JavaScript 111/111 plus 22/22 local Chrome cases, widget browser 55/55 with 1,332 assertions, PHP lint 12/12 passed. No PlentyONE validator/build or deployment of this new PHP fix.
- Full recheck of preview plugin set 426 still has no overall approval: count/tail-page inconsistencies and the real 404 metadata route remain unresolved; the new first-page exception has not been deployed there. See README for exact evidence and limits.

## Unreleased – SEO JavaScript delivery asset (2026-11-09)

- Transferred the corrected metadata block from `cat.js` into the actually referenced `cat-020726.min.js` using the existing Terser 5.44.0 installation. Every byte outside that block remains unchanged. No active historical JavaScript build process exists in the current checkout.
- Only the category bundle receives `?v={{ buildHash }}-nl1-seo1`. Existing bundle selection, `defer` and all other asset URLs are preserved. Metadata regressions can now target the minified asset explicitly; Twig/layout tests verify its inclusion and exact cache version.
- Local checks: minified asset 111/111 metadata cases and 22/22 Chrome cases; each Twig 2/3 passed 264/264 SEO cases, 171/171 syntax checks, 38/38 regressions and 60/60 layout cases. All previous 261 SEO results remain identical. Existing preview still serves the old file; no deployment, cache invalidation or B2C change. See README for evidence and build limits.

## Unreleased – JavaScript page numbering and tail-page investigation (2026-11-09)

- Category JavaScript now consumes existing `SeoPage` data instead of trusting URL page numbers. Invalid, empty, ambiguous or unproven follow-up pages receive no artificial title/description suffix. Valid numbering, including Infinite Scroll and History, remains supported; robots and canonical are untouched.
- `PageMetadata.twig` only exposes existing pagination state as HTML metadata. No change to PHP queries, item counting or server-side SEO decisions, and no additional query. Ordinary content and simple widgets gain no artificial pagination.
- Investigated men's/women's tail pages in shared sessions, new HTTP sessions and reverse order: 36/36 HTTP 200, stable IDs, no duplicates within or across the last three nonempty pages of each list. The count discrepancy persists; no specific aggregation/cache cause has been proven. See README for evidence, proposed investigation and acceptance limits.
- Reran regressions: each Twig 2/3 passed 261/261 SEO cases, 171/171 syntax checks, 38/38 existing regressions and 60/60 layout cases; all previous 250 results remain identical. JavaScript: 111/111 VM cases and 22/22 local Chrome cases; existing widget browser suite 55/55 with 1,332 assertions. PHP lint 12/12 passed. No PlentyONE build/live acceptance of the local fix, deployment or cache invalidation; B2C unchanged.

## Unreleased – PlentyONE validation of SEO code (2026-11-09)

- Corrected all four reported PHP validation locations: create `SeoPage` via `pluginApp()` instead of direct `new`, replace `is_finite()` with bounded integer validation, and replace both dynamic `$parse()` calls with a named private method.
- Create the invalid-pagination exception via `pluginApp()` too. Preserve validation, exception type/message, routed category context, the single item query and SEO behavior.
- Checked introduced native functions against the official allowlist and added a targeted source regression guard. Each of Twig 2/3 passed 250/250 cases including 190/190 identical before-fix results, 171/171 syntax checks, 38/38 existing regressions and 60/60 layout cases. Browser: 55 scenarios/1,332 assertions passed; PHP lint 12/12 and diff check passed.
- The actual PlentyONE validator/build has not been run after this fix; local tests do not replace it. Local develop changes only, with no version change, commit, push, merge, deployment or synchronization; B2C unchanged. See README for evidence and acceptance limits.

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
