const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('app.js', 'utf8');
const inv = fs.readFileSync('inventory.js', 'utf8');
const share = fs.readFileSync('enhancements.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

assert.match(app, /DB_NAME='MinhaListaDB', DB_VERSION=6/, 'app.js must use IndexedDB V6');
assert.match(
  app,
  /objectStoreNames\.contains\('inventory'\)/,
  'app.js must create inventory during upgrade'
);
assert.match(
  inv,
  /const DB='MinhaListaDB', VERSION=6, STORE='inventory'/,
  'inventory module must target V6'
);
assert.match(inv, /const PRODUCTS=\[/, 'reference product seed missing');
assert.match(inv, /const MARKET_NAMES=\[/, 'reference market seed missing');

const productsExpr = inv.match(/const PRODUCTS=(\[[\s\S]*?\n\]);\nconst UNITS=/)?.[1];
const unitsExpr = inv.match(/const UNITS=(\{[\s\S]*?\});\nconst MARKET_NAMES=/)?.[1];
const marketsExpr = inv.match(/const MARKET_NAMES=(\[[\s\S]*?\]);\nfunction referenceSeed/)?.[1];

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
assert.match(share, /shared-list-v3/, 'sharing layer must support V3');
assert(sw.includes('./backup-v230.js'), 'Service Worker must cache backup-v230.js');
assert(sw.includes('./list-enhancements.js'), 'Service Worker must cache list-enhancements.js');
assert(sw.includes('./list-market-v230.js'), 'Service Worker must cache list-market-v230.js');
assert(
  /minha-lista-v2-3-(?:0|1)/.test(sw),
  'Service Worker must use a V2.3.x cache'
);

console.log(
  `V2.3.0 foundation OK: ${productCount} products, ${new Set(markets).size} markets, DB V6/inventory upgrade present.`
);
