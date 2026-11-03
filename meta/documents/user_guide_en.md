# eGuardiansBasic B2B – Setup

This theme contains the existing Outlet46 B2B content and functionality.
Technical plugin name and namespace: `GuardiansBasicB2B`; baseline version: `1.0.7`.
The B2C plugin remains `GuardiansBasic` and belongs in its separate plugin set.

## Later setup in the B2B test plugin set

The baseline is initially reviewed locally on `develop`. Installation, deployment
and synchronisation have not been performed. Before making changes, preserve the
existing B2B configuration values and content/container mappings.

- For plentyDevTool, the local plugin folder must be named `GuardiansBasicB2B`.
  The current Git working folder remains in place until the manual adjustment.
- Set up the new plugin separately in the B2B test plugin set. Do not delete or
  replace existing plugins; do not activate B2C and B2B together in the same set.
- Check existing B2B values in the new plugin configuration and transfer them
  manually where needed. Template overrides are configured under `templates.override`.
  Do not enable all overrides indiscriminately: four legal-page templates are
  already missing in the existing code; see the README for details.
- Content mappings use the new provider key
  `GuardiansBasicB2B\Containers\GuardiansBasicContainer`.
  The `Stylesheet.twig` template currently contains only commented includes;
  active CSS resources are loaded in the head.
- After later deployment, test all B2B workflows and resources in the test plugin
  set. Local syntax validation does not replace this acceptance process.

Full validation results, existing issues, branch/release rules and manual steps
are documented in the [README](../../README.md). Historical changelog entries
remain in [changelog_en.md](changelog_en.md).

## License

GNU AFFERO GENERAL PUBLIC LICENSE; see [LICENSE](../../LICENSE).
