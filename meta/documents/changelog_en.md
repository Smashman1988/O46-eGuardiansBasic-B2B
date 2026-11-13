# Release Notes for eGuardiansBasic B2B

## Unreleased – Shared assets, critical CSS and navigation (2026-11-13)

- Move twelve identical JS modules into a shared core while preserving execution order, Ceres dependencies and page-specific behavior. Load MagicZoom directly on PDPs and on demand for other Quickviews. Wait for the vendor's internal ready event; handle concurrent loads, errors/timeouts and normal product navigation as fallback. Reject stale Quickview responses and normalize duplicate `quickViewItem` parameters.
- Rebuild all eight production minified JS assets completely from versioned sources with pinned dependencies, preserving vendor payloads/licenses. Existing partial build commands delegate to the full JS build. Page entries no longer carry the extracted implementations.
- Remove only proven duplicate critical-CSS declarations: 1,069–7,404 fewer HTML bytes per page. Preserve layout stabilization and external stylesheets; 23 browser comparison pairs pass.
- Share navigation markup across five language data sets, preserving all links, attributes, order and mobile interactions. Save 21,611–27,945 HTML bytes per language/page. Element counts are unchanged; whitespace text nodes decrease. Ten browser pairs pass; no PHP-time improvement claimed.
- Reuse the PDP basket snapshot in the header (two getters become one), skip 32 unnecessary Quickview translations and register the route provider once. Validate controller IDs, feedback page/count and IT/ES autocomplete parameter types before data access. Preserve dynamic footer URLs, existing attribute batches and getters with side effects.
- Local HTTP comparison: homepage/category approximately 87 KB fewer JS body bytes with one additional request; cold PDP adds 11,679 bytes and two requests. Three-page navigation transfers 875,600 → 417,023 JS bytes including local headers. No native S3/CWV/TTFB claim or Brotli extrapolation.
- [Full report with files, measurements, tests, screenshots and limitations](../../.cache/systematic-optimization-96e50ee-20261113/Pruefbericht.html). Twig 2/3 each pass 173 templates and 585 SEO cases; PHP 13 files, matrix 70 functional/440 layout cases, real asset/MagicZoom loading and targeted regressions pass. Intermediate technical failures are documented. Native after-deployment, customer-class and payment acceptance remain `NOT_TESTED`. Local `develop` only; no commit/push/merge/deployment/sync/cache purge or version increase.

## Unreleased – Global search, early layout and Quickview preparation (2026-11-13)

- Reject stale autocomplete responses after clearing or changing input; remove the full result row and loading state for short queries. Preserve debounce, API routes and all five languages. Four source/active minified bundles remain consistent through a targeted search builder and `search4` marker; +91 JS bytes per bundle, no extra requests. 40 new and 80 existing search scenarios pass; 16 baseline defects reproduced.
- Skip two unused IO getters only in the Quickview branch of `SingleItem`; retain full PDP data and external include contexts. 36 byte-identical Twig render comparisons, 120 preparation contracts and four tracking cases pass. No claimed native PHP/TTFB saving; variation, pricing, basket and order logic unchanged.
- Add 140 bytes of critical CSS for existing ShopBuilder columns configured 50/50 across tablet and desktop, from 768 px. Eight widths preserve final geometry. The native login column change is removed in an isolated HTML/CSS comparison; residual shifts remain separately documented.
- Stabilize shared footer lazy-image layout using the existing inline flow and actual logo aspect ratios. Main CSS, active minified CSS and critical output remain consistent (`footer1`). Eight paired layout checks pass with identical final content and requests; small residual movements remain. No blanket fixed heights, zero-CLS claim or byte-saving claim.
- Review all 13 own PHP files and reconcile all 172 Twig templates against existing audits and current dependency paths. Do not remove uncertain legacy paths or the facet controller; retain all 60 homepage items. 40 native baseline loads, local traces and exact limitations are documented in the [HTML report](../../.cache/global-performance-13af2e8-20261113/Pruefbericht.html).
- Local develop only; native post-deployment acceptance remains open, no production approval. No commit, push, merge, deployment, plugin sync or cache purge. B2C and external plugins unchanged.

## Unreleased – Homepage grid and shared card preparation (2026-11-13)

- Add `LiveShoppingGrid` for user-approved slots 1–6 using the existing normal grid. Preserve slot lookups, validity, item order and card data; reuse the existing attribute batch instead of six individual calls. Prepare seven translations and currency once; do not claim six fewer database queries because IO already caches currency within the request.
- Prioritize only the first actually rendered LiveShopping product image, retaining AVIF/fallback URLs and dimensions. Other product images and logos remain lazy; existing card callers retain their behavior. No additional JS/CSS resource or active minified-asset change.
- Prepare the vendor asset prefix once in the existing category grid and remove two unused card macro imports. Preserve the standalone fallback and byte-identical 60-item output. No change to PHP search, pricing, inventory or ordering.
- Document 60 native baseline runs and 36 isolated comparisons. Median TTFB is 5,263 ms with no observed backend attribution; no native loading-time saving claimed. Reviews add 75 requests and confirmed iframe layout shifts; a local `defer` content snippet for category 5153/description 2/de passes 20 browser cases without claiming a CLS fix.
- [Report with tests, screenshots and limitations](../../.cache/homepage-performance-25d2ca8-20261113/Pruefbericht.html). Activation later requires one full-width ShopBuilder code widget in place of the six old widgets. Plenty content unchanged; native post-change acceptance remains open. Local develop only; no commit, push, merge, deployment, sync or cache purge. B2C and variant matrix unchanged.

## Unreleased – Early desktop basket column (2026-11-13)

- Add only the existing `.col-lg-7` geometry from 992 px to the general critical CSS branch in `Head.twig`: exactly 75 bytes, with the same 58.333333% column width as the main stylesheet. No new requests; JS/CSS sources and active minified assets unchanged.
- Document the early MagicZoom close attempt: native touch input reaches a button whose ancestor is still invisible during the opening animation; the vendor guard `!ready || !expanded` rejects the call. The vendor block is identical between `1647723` and `964b6f5`. No MagicZoom fix or completed stress acceptance is claimed; a native historical comparison remains open.
- Leave the mobile Ceres loader's 120 px height change and the existing `.col-md-6` critical CSS gap at 768–991 px unchanged. Local geometry checks do not establish an overall native CLS/LCP improvement. [Report with results and limitations](../../.cache/theme-magiczoom-cls-964b6f5-20261113/Pruefbericht.html).
- No version increase; local develop only. Physical mobile-device checks and native post-deployment acceptance in 426 remain open until user deployment; no production approval. No commit, push, merge, deployment, sync or cache purge. B2C, prices, ordering, variant matrix and payment SDKs unchanged.

## Unreleased – CSS, shop-mode dialog and bounded asset replacement (2026-11-13)

- Remove invalid CSS source syntax and seven already ignored declarations while preserving the effective CSSOM. Checkout minified CSS −219 bytes; main minified CSS unchanged. Twenty local layout/pixel comparisons pass; checkout cache suffix `…-css1`.
- Fix Escape after Tab in the shop-mode dialog. Release the document handler and opening timer on close; tolerate missing dialog markup. Preserve the delay, cookie and destinations. All 280 local browser cases pass, versus 80 passes/200 failures before; 800 repeated cycles leave no handlers/timers. Each of four existing minified bundles grows by 153 bytes, suffix `…-mode1`; no additional requests. Build only the dialog region.
- Remove one unused currency getter in the active footer. Fifteen real renders each with Twig 2 and Twig 3 retain byte-identical output; no claimed database or TTFB saving.
- Bound `build-facet-assets.cjs` replacement by both CSS markers. Preserve all following rules and reject an incomplete block before writing CSS. Six isolated build checks pass; variant matrix and active facet assets unchanged.
- Document 33 native pagination pairs and separate count contexts. Upstream overlaps and platform totals remain open; no theme-side price/result/sort workaround. [Full report](../../.cache/category-rootcause-1647723-20261113/Pruefbericht.html).
- Local develop only. Native post-change acceptance in 426 required after deployment; no production approval. No commit, push, merge, deployment, sync or cache purge. B2C, pricing, ordering, variant matrix and external payment SDKs unchanged.

## Unreleased – Theme audit, card batching and lazy observers (2026-11-13)

- Remove one unused second configuration read and the overwritten first `loginSuccess` property; preserve effective configuration and translated messages.
- Reuse the existing attribute batch for up to four visible PDP recommendations. Four single calls become one batch containing four search factories; no additional item query or matrix data changes.
- Disconnect the previous Lozad observer on rebinding, observe appended images as a group and initialize InfiniteScroll only with a next-page link. Preserve `pagehide`/BFcache. Rebuild only affected owned regions with idempotent `build-lazy-assets.cjs`; append `-lazy1`, increasing minified assets by 310 or 207 bytes.
- Verify 24 bootstrap configurations, five message objects and 36 list/50 recommendation cases per Twig 2/3, 16 browser-observer cases and all 34 existing regression groups after the documented Quickview fixture update. Distinguish 76 native baseline captures, controlled replays and pending native post-change acceptance.
- Inventory all 13 owned PHP/171 Twig files, active assets and dynamic entry points. Leave unproven Homepage/tag-list templates unchanged. Legacy CSS source errors, external payment SDKs and customer/checkout contexts remain open; no unsupported LCP/server speed claim. [Audit report](../../.cache/theme-performance-final-20261113/Pruefbericht.html).
- Local develop only; preserve prior local work. No commit, push, merge, deployment, sync or cache purge. B2C, prices, inventory and order logic unchanged.

## Unreleased – InfiniteScroll lifecycle and whole-shop performance audit

- Replace the category bundle's InfiniteScroll `unload` listener with `pagehide`; preserve history and scroll state when `event.persisted` is true. Normal navigation retains normalization and cleanup. Keep source and active minified asset consistent; cache suffix `…-language1-history1`, +31 uncompressed minified bytes.
- Pass 60 local before/after history cases across five languages: BFcache restoration changes from 0/30 to 30/30 in the isolated dependency fixture. No demonstrated timing gain; native whole-shop verification remains open. All 33 executed existing check groups pass after documented fixture corrections.
- Document PageDesign loading order, LCP/CLS evidence, 28 native payment measurements, 65 language/page source checks and 64 image cases. Reject the one-eager-image alternative; retain existing CSS, facets and variant matrix.
- Payment SDK scoping remains FAIL: PayPal 6.8.0 initializes beyond the Vue/additional-scripts branch; no supported selective provider hook has been established. Basket category 5482 and checkout category 5484 confirmed. No plugin configuration changes or unsafe HTML/script filtering; support draft prepared locally only. No payment acceptance or claimed 429/CORS fix.
- [Audit report](../../.cache/shop-performance-5f83-20261112/Pruefbericht.html). Local develop only; no commit, push, merge, deployment, sync or cache purge. B2C, prices, rounding, inventory and order logic remain unchanged.

## Unreleased – Shared head routes without an additional PDP controller

- Reuse existing IO/hreflang targets in the existing modal flow across categories, search and PDPs. Preserve the configured ShopBuilder dialog; remove duplicate route JSON and the language observer from the facet controller. Preserve editorial/forced canonical SEO policy and mark the existing navigation route in the head when needed.
- Remove the facet asset and extra route JSON on PDPs. Preserve category/search facets and unapplied selections. Carry verified variant IDs through IO's registered path route; ignore Quickview context and arbitrary query parameters. Forward only explicit valid currency/shipping-country context on PDPs; no quantity, price or ordering changes.
- Rebuild only the existing modal regions in all four active bundles (`…-language1`); other bundle regions remain byte-identical. Facet asset `facets3`: 7,518 bytes. PDP net −6,721 uncompressed JS bytes and one fewer asset; category/search +797 bytes at the same asset count. Repeated local HTTP/Brotli/LCP/CPU measurements and limitations are documented; no native performance approval.
- Document five languages, 197 product/variant/modal cases and the completed facet/search/SEO/Quickview/matrix/gallery/rating/layout regressions with exact results and interrupted attempts. Local develop only; native post-change acceptance in 426 pending. No commit, push, merge, deployment, sync or cache purge. B2C unchanged.

## Unreleased – Localized filter removal URLs and product language switching

Historical local intermediate state: the additional PDP controller, route JSON and blanket parameter forwarding have been superseded by the shared head/modal approach above. The removal/reset fix remains in place.

- Fix the natively reproduced removal/reset links losing their EN/FR/IT/ES prefix. The shared facet partial now obtains the current localized IO route with `getCanonicalURL(null, true)` instead of the language-stripped request path. No hard-coded prefix assembly; editorial canonicals are not navigation targets. Preserve the existing filter/price/query parameter handling.
- Extend the existing language dialog handler to product detail pages. IO provides item/variation routes through safely encoded JSON; preserve URL parameters and fragments. Explain and disable unavailable routes. No changes to item, matrix, pricing or ordering logic.
- Synchronize `facets.js` and its active minified file, with JS identifier `facets2`. The asset grows by 390 to 9,200 uncompressed bytes and is additionally loaded with `defer` on PDPs. CSS and the four main bundles are unchanged; retain 69 initial facet elements and no additional group requests. No unproven performance gain claimed.
- Locally verify 100 URL combinations per Twig version, 162 focused browser cases including 60 product language switches, 534 existing facet browser cases, 133 facet and 585 SEO/layout cases per Twig version, plus search/matrix regressions. The report documents fixtures, corrected test doubles, interrupted attempts and limitations. Native post-change acceptance in plugin set 426 remains required; the previously failing native build is not approved. Local `develop` only; no commit, push, merge, deployment, sync or cache purge. B2C unchanged.

## Unreleased – Facet state, language switching and compact rendering

- Fix the three reproduced facet defects: price parameters receive NOINDEX while preserving existing robots restrictions; active filters and reset survive empty result buckets; the existing language dialog retains filter semantics using the actual translated IO routes.
- Build checkbox/value lists on first opening from compact existing IO data. Reuse rendered elements and refresh counts/values after changes. No group requests or additional server-side facet search; typing a price does not search until Apply. Server-rendered removal links also work without a matching checkbox. Missing metadata uses a translated notice and the selected ID.
- Add keyboard/focus support, an explicit error state instead of a false zero count, stale-response protection and idempotent initialization. Share one controller across the active category/search/list partials. One additional initial JS asset; all four existing JS bundles remain unchanged. Build the new minified asset and narrowly scoped CSS additions; cache identifiers `facets1` and `…-perf1-facets1`.
- Measure 459,255 → 16,717 facet HTML bytes and 3,059 → 69 initial facet elements for All Items locally. Its cold compressed total drops by 1,605 bytes; smaller lists transfer 1,707–2,916 more bytes. No demonstrated first-interaction improvement or native TTFB/PHP saving claimed. The report includes 120 controlled measurements, screenshots and limitations.
- Run 534 local browser cases, including 100 combinations/open-close cycles and 50 language, zero-result and price cases each; also Twig 2/3, SEO, search and matrix regressions. Five languages and eight viewport widths. Native acceptance of this version in plugin set 426 remains pending; no production approval. Matrix, pricing/rounding/orders, gallery, Quickview data and B2C unchanged. No commit, push, merge, deployment, sync or cache purge.

## Unreleased – Verified PHP cleanup from the theme audit

- Remove the unused category getter from `getItemsFromCatSimple`. Preserve search options, price filters, item cards and the routed category. Save one getter and service resolution per invocation; do not equate this with a database query because IO already uses an in-memory cache.
- Remove the unused second feedback repository resolution and import from `dynamicGetFeedbacks`. Preserve the actual feedback query and JSON/HTML output.
- Compare real PHP/Twig paths using explicit service fixtures under Twig 2/3 and independent existing regressions. Document native baseline measurements, separate public Lighthouse references, the inventory and untested contexts in README and the audit report.
- Local `develop` changes only; native acceptance of the new PHP changes in pluginset 426 remains pending. Preserve the variation matrix, pricing/ordering logic and all frontend assets. No commit, push, deployment, sync or cache purge.

## Unreleased – Contact collision protection, early zoom geometry and data-loading audit

- Extend existing contact-widget collision protection to desktop and tablet. Hide the closed launcher only on actual overlap; preserve open panels. No additional global scroll handlers; active script suffix `contact3`.
- Generate five existing MagicZoom geometry rules into the existing early PDP style, scoped to `#ItemImgZoom`. No fixed gallery height, additional full vendor stylesheet or second rule source. Active minified bundles remain unchanged.
- Remove two unused preparation calls shared by PDP and quickview (`getVariationList` and `getBasePriceList`). Preserve consumed variation, price, stock and basket data; no price cache.
- Compare direct matrix data against the available IO VariationList with SingleItem result fields: five languages, guest contexts, PDP/quickview, leading EAN zeros and an additional 60 real variations. Preserve the compact custom endpoint until customer-context, filtering and direct Twig equivalence are fully demonstrated. Document 60-row fixtures, Twig 2/3, browser regressions and separate local/native evidence in README/report.
- No deployment, plugin sync or cache invalidation. Native acceptance of the local changes in pluginset 426 remains pending.

## Unreleased – Layout stability and shop-wide performance audit

- Keep all five PDP and quickview rating stars on one row, including desktop: both layers share an intrinsic-width grid cell instead of the undersized 105px area. Percentage fill is relative to the stars; preserve the translated review link. Verify 300 language/width/rating cases.
- Constrain the existing 1000×600 company video proportionally to its container and let the basket link account for its configured side margins. Remove existing horizontal overflow without changing content, destinations or ordering logic.
- Reserve the initial full-table matrix body using the already available variation map and existing row geometry. Populated rows retain natural height; no additional service request.
- Stabilize gallery thumbnail frames before and during MagicZoomPlus initialization while preserving image proportions; include their geometry in PDP critical CSS. Preserve mobile expansion and gallery switching.
- Deliver existing footer, grid and responsive visibility rules before the asynchronous main stylesheet, scoped to the footer and following the active minified cascade. Prevent large column rearrangements on short pages while preserving header and product grids.
- Reserve space for the existing company banner, four company images and five payment logos using their measured intrinsic dimensions. Make the existing payment grid available early only inside its known widget; preserve other embedded lists. No new images, libraries or API calls.
- Synchronize minified/critical CSS through the existing build; use CSS suffix `nl3-matrix4-logo1-gallery3-perf1`. All production JavaScript and minified bundles, pricing and ordering logic remain byte-identical.
- Document native preview 426, public production 427, controlled local comparisons and Lighthouse separately. Both PageSpeed API and UI return HTTP 429; no preview tokens or shop sessions sent to PageSpeed Insights. See README/performance report for exact tests and pending native acceptance. No deployment.

## Unreleased – EAN display without copy buttons

- Remove EAN copy buttons, icon, clipboard/fallback logic, copy feedback, hidden status output, dedicated CSS and JS translations from PDP and quickview. Preserve shared variation-image handlers and other consumers.
- Preserve exact per-variation EAN values, leading zeros, selectable text and manual copying. No ordering logic changes or additional API calls. Desktop retains seven columns; the mobile EAN/subtotal row has no empty button space or additional height.
- Synchronize all four active minified JS bundles and minified/critical CSS. New suffixes: `gallery2-matrix3` (JS), `nl3-matrix4-logo1-gallery3` (CSS). Remove obsolete copy-function tests/mocks from the shared matrix suite and retain/extend plain-text EAN checks.
- Native baseline check confirms preview set 426 and five loaded assets matching `718ad95`. The removal is tested locally only, including 100 quickview cycles, 200 rapid desktop color switches, 20 gallery swipes and 100 post-change layouts in five languages. README/report document the complete targeted test matrix and external preview/native acceptance limits. No deployment performed.

## Unreleased – final fixes after gallery2-matrix2 acceptance

- Temporarily hide the closed contact widget below 992 px only when its actual footprint overlaps a matrix or basket item. Keep open contact panels and desktop behavior intact; observe dynamic quickviews without another scroll handler.
- Fix the cause of the 70 px PDP jump: in the stacked layout, thumbnails scroll within the height established by the main image instead of determining the gallery height. No new fixed height or image aspect ratio change.
- Execute item tracking once on full PDPs only. AJAX quickviews no longer register window load handlers that can never execute. Tracking data and previously executed events remain intact; growing PlentyONE preview listeners are documented as an external limitation.
- Synchronize active minified/critical CSS (`nl3-matrix3-logo1-gallery3`) and version widget assets with `contact2`. Gallery/matrix JavaScript and its minified files remain unchanged. No additional service requests or business logic changes.
- Local regressions passed, including 100 quickview cycles, 200 rapid desktop switches and portrait/landscape changes. Native post-change acceptance in plugin set 426 is pending. README/report distinguish the already accepted gallery2 baseline from these local changes. No deployment performed.

## Unreleased – mobile image tap in the variation matrix

- On mobile, tapping a matrix image or magnifier opens the existing MagicZoomPlus expanded view for that variation. Quantities and the active variation are retained. Desktop clicks continue to update only the gallery on the left.
- Quickview initializes one native instance on demand from the same cached image data and disposes it on dismissal/removal. No additional visible gallery, service requests or synthetic image-link clicks.
- Expansion waits for the selected large image to become ready; rapid taps are coalesced until then. This prevents stale images and the vendor lifecycle race found in the first local implementation. Sources/minified files and the `gallery2-matrix2` JS suffix are synchronized.
- Native acceptance of previously deployed commit `245e2a8` in plugin set 426 and local tests of the new change are documented separately in README/the report. The new change has not been deployed.

## Unreleased – variation groups, header logo and newsletter channel

- Mobile variations, including the EAN/subtotal row, receive a stronger full-width lower boundary in `#969696` without additional height. Active shading, side bar, desktop columns and narrow cards remain; no new selection symbols.
- The existing header logo scales at its original 1114:226 ratio within the available column. Conflicting fixed heights are removed; matching main/critical CSS and image dimensions reserve its size before download completion.
- The existing newsletter popup offers email and the official WhatsApp channel with the requested copy in five languages. Localized newsletter routes, scroll trigger, consent, cookie duration and dismissal are retained. WhatsApp opens only after a click in a new tab with `noopener noreferrer`.
- Synchronized active CSS and critical rules with the `nl3-matrix3-logo1` CSS suffix. No additional JavaScript, tracking or API requests; JS files and business logic unchanged. README and the report document local tests and pending native acceptance. No deployment performed.

## Unreleased – focused variation matrix follow-up

- Clearer, consistent grey cell, row and EAN/subtotal boundaries without taller rows; alternating row backgrounds retained.
- Full translated column names whenever they fit the actual cell. Existing abbreviations are used only when necessary; PDP and quickview share the measurement.
- A wrapper bounds the existing sticky heading to the header and variation body, before the totals/basket footer. No scroll handlers.
- The active variation retains its green side bar and gains a subtle light green background (`#e6f1d9`), with no checkmark or additional selection icon.
- Synchronized source and active minified assets, critical PDP CSS and the `matrix2` cache suffix. No additional API requests or changes to price, stock or ordering logic. README and the report document local tests and pending native acceptance. The confirmed contact-widget obstruction is documented separately; the widget is unchanged.

## Unreleased – responsive variation matrix

- Product pages and quickviews retain their shared variation matrix. Wide containers show the complete table; narrower containers use a compact table with a visible EAN/subtotal row, and only very narrow containers switch to compact cards.
- Column headings stay visible while scrolling below the shop or modal header. Quickviews use available width and height more efficiently, with a scrolling content area and an accessible close button.
- Mobile EAN copying in DE/EN/FR/IT/ES preserves the exact variation mapping, leading zeros and missing values from the existing batch. No additional variation/EAN requests or changes to quantity, price, totals, basket and gallery logic.
- The same matrix CSS source also supplies the PDP's existing critical-style path. This prevents unformatted headings before the asynchronous main stylesheet loads; a small reserved space limits the initial footer movement when rows are inserted.
- Updated affected CSS/JS minified assets and cache suffixes (`matrix1`), preserving unrelated bundle contents. Local functional, layout and regression checks and separate before/after measurements are documented in README and the test report. Native acceptance awaits a separate deployment to test plugin set 426.

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
