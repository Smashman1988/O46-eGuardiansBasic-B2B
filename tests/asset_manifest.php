<?php
// Test-only expectation: independently verify numeric versions and delivered bytes.
function verifiedThemeAssetPath($asset) {
    static $verified = [];
    if (isset($verified[$asset])) { return $verified[$asset]; }
    $root = dirname(__DIR__) . '/resources/';
    $manifest = json_decode(file_get_contents($root . 'asset-manifest.json'), true);
    $versions = json_decode(file_get_contents($root . 'asset-versions.json'), true);
    if (!is_array($manifest) || ($manifest['schemaVersion'] ?? null) !== 2
        || !is_array($manifest['assets'] ?? null) || !is_array($versions)) {
        throw new RuntimeException('Invalid theme asset manifest schema');
    }
    $entry = $manifest['assets'][$asset] ?? null;
    if (!preg_match('~^(?:js|css)/[a-zA-Z0-9.-]+\.(?:js|css)$~', $asset) || !is_array($entry)
        || !preg_match('/^[0-9a-f]{64}$/', $entry['sha256'] ?? '')
        || !is_int($entry['version'] ?? null) || $entry['version'] < 1
        || ($versions[$asset] ?? null) !== $entry['version']
        || !is_file($root . $asset) || hash_file('sha256', $root . $asset) !== $entry['sha256']) {
        throw new RuntimeException('Theme asset version/config/hash mismatch: ' . $asset);
    }
    return $verified[$asset] = $asset . '?v=' . $entry['version'];
}
