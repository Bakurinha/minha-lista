const fs = require('fs');
const assert = require('assert');

const versionSource = fs.readFileSync('version-v230.js', 'utf8');
const swSource = fs.readFileSync('sw.js', 'utf8');

assert.match(versionSource, /const VERSION = 'v2\.3\.0';/);
assert.match(versionSource, /Supermercado\\s\*•\\s\*offline/);
assert.match(versionSource, /textContent = element\.textContent\.replace/);
assert.match(swSource, /minha-lista-v2-3-\d+/);
assert.doesNotMatch(swSource, /minha-lista-v2-3-0-stage2/);
assert.match(swSource, /\.\/version-v230\.js/);

console.log('✓ v2.3.0 visible version and cache contract OK');
