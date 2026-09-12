'use strict';

const fs = require('fs');
const assert = require('assert');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const versionSource = fs.readFileSync('version-v230.js', 'utf8');
const swSource = fs.readFileSync('sw.js', 'utf8');
const syncSource = fs.readFileSync('scripts/version.js', 'utf8');

assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
assert.strictEqual(manifest.app_version, pkg.version, 'Manifest fora de sincronia');
assert.match(versionSource, new RegExp(`const VERSION = 'v${pkg.version.replace(/\./g, '\\.')}'`));
assert.match(versionSource, /Supermercado\\s\*•\\s\*offline/);
assert.match(versionSource, /textContent = element\.textContent\.replace/);
assert.match(swSource, new RegExp(`minha-lista-v${pkg.version.replace(/\./g, '-')}`));
assert.match(swSource, /\.\/version-v230\.js/);
assert.match(syncSource, /function syncVersion\(version\)/);
assert.match(syncSource, /function bumpVersion\(kind\)/);
assert.match(syncSource, /package\.json/);
assert.match(syncSource, /manifest\.json/);

console.log(`✓ visible version and automatic synchronization contract OK (${pkg.version})`);
