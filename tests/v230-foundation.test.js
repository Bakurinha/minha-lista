const fs = require('fs');
const assert = require('node:assert/strict');

const app = fs.readFileSync('app.js', 'utf8');
const inventory = fs.readFileSync('inventory.js', 'utf8');
const markets = fs.readFileSync('reference-market-refresh.js', 'utf8');
const share = fs.readFileSync('enhancements.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

assert(app.includes("const DB_NAME='MinhaListaDB', DB_VERSION=6"), 'IndexedDB deve estar na versão 6');
assert(app.includes('referenceProducts') && app.includes('referenceMarkets'), 'stores de referência ausentes');
assert(inventory.includes('inventory'), 'módulo de estoque ausente');
assert(markets.includes('referenceMarkets'), 'módulo de mercados de referência ausente');
assert(share.includes('shared-list-v3'), 'sharing layer must support V3');

const productCount = (app.match(/\['[^\n]+?\]/g) || []).length;
const referenceProductSection = app.match(/const REFERENCE_PRODUCTS=\[([\s\S]*?)\]\n\.map/);
const referenceMarketSection = app.match(/const REFERENCE_MARKETS=\[([\s\S]*?)\]\.map/);
const productEntries = referenceProductSection ? (referenceProductSection[1].match(/\['/g) || []).length : 0;
const markets = referenceMarketSection ? (referenceMarketSection[1].match(/'[^']+'/g) || []).length : 0;

assert(productCount >= 1000 || productEntries >= 70, `reference products: ${Math.max(productCount, productEntries)}`);
assert(new Set((app.match(/'[^']+'/g) || []).filter(x => x.length > 2)).size >= 50, `reference markets: ${markets}`);
assert.match(share, /shared-list-v3/, 'sharing layer must support V3');
assert(sw.includes('./backup-v230.js'), 'Service Worker must cache backup-v230.js');
assert(sw.includes('./list-enhancements.js'), 'Service Worker must cache list-enhancements.js');
assert(sw.includes('./list-market-v230.js'), 'Service Worker must cache list-market-v230.js');
assert(/minha-lista-v2-3-\d+/.test(sw), 'Service Worker must use a V2.3.x cache');

console.log('V2.3.0 foundation checks: OK');
