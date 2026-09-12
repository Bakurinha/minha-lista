const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('app.js', 'utf8');
const inv = fs.readFileSync('inventory.js', 'utf8');
const share = fs.readFileSync('share-config.js', 'utf8');
const shareCompat = fs.readFileSync('share-optimized-v230.js', 'utf8');
const legacyShare = fs.readFileSync('enhancements.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const dbBridge = fs.readFileSync('db-open-bridge-v230.js', 'utf8');

assert.match(
  app,
  /DB_NAME\s*=\s*['"]MinhaListaDB['"][\s\S]*?DB_VERSION\s*=\s*6/,
  'app.js must use IndexedDB V6'
);
assert.match(
  app,
  /objectStoreNames\.contains\('inventory'\)/,
  'app.js must create inventory during upgrade'
);
assert.match(
  inv,
  /const\s+DB\s*=\s*['"]MinhaListaDB['"][\s\S]*?VERSION\s*=\s*6,[\s\S]*?STORE\s*=\s*['"]inventory['"]/,
  'inventory module must target V6'
);
assert.match(inv, /const\s+PRODUCTS\s*=\s*\[/, 'reference product seed missing');
assert.match(inv, /const\s+MARKET_NAMES\s*=\s*\[/, 'reference market seed missing');

const productsExpr = inv.match(
  /const\s+PRODUCTS\s*=\s*(\[[\s\S]*?\n\s*\]);\s*const\s+UNITS\s*=/
)?.[1];
const unitsExpr = inv.match(
  /const\s+UNITS\s*=\s*(\{[\s\S]*?\n\s*\});\s*const\s+MARKET_NAMES\s*=/
)?.[1];
const marketsExpr = inv.match(
  /const\s+MARKET_NAMES\s*=\s*(\[[\s\S]*?\n\s*\]);\s*function\s+referenceSeed/
)?.[1];

assert(productsExpr && unitsExpr && marketsExpr, 'reference seed structure changed');

const products = Function(`return ${productsExpr}`)();
const units = Function(`return ${unitsExpr}`)();
const markets = Function(`return ${marketsExpr}`)();
const productCount = products.reduce(
  (count, product) => count + (units[product[2]] || ['1 un']).slice(0, 7).length,
  0
);

assert(productCount >= 1000, `reference products: ${productCount}`);
assert(new Set(markets).size >= 50, `reference markets: ${new Set(markets).size}`);
assert.match(share, /shared-list-v3(?:-compact)?/, 'sharing layer must support V3');
assert(share.includes('shared-list-v2'), 'sharing layer must retain V2 compatibility');
assert(share.includes('id="mlShareCode"'), 'sharing layer must expose code import');
assert(share.includes('maxlength="12"'), 'sharing code must be 12 characters');
assert(
  shareCompat.includes('__mlShareOptimizedLegacyDisabled = true'),
  'compatibility shim must be disabled'
);
assert(legacyShare.includes('__mlShareLegacyWaiting'), 'legacy sharing shim missing');
assert(dbBridge.includes('normalizeLegacyPrivacy'), 'legacy privacy normalization is missing');
assert(
  dbBridge.includes('MutationObserver'),
  'legacy privacy guard must cover dynamic first-run modal'
);
assert(
  dbBridge.includes('esta versão só envia dados quando você solicita o compartilhamento'),
  'privacy text must reflect explicit sharing'
);
assert(sw.includes('./backup-v230.js'), 'Service Worker must cache backup-v230.js');
assert(sw.includes('./list-enhancements.js'), 'Service Worker must cache list-enhancements.js');
assert(sw.includes('./list-market-v230.js'), 'Service Worker must cache list-market-v230.js');
assert(/minha-lista-v2-3-\d+/.test(sw), 'Service Worker must use a V2.3.x cache');

console.log('V2.3.7 foundation source invariants OK');
