const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('db-integrity-v230.js', 'utf8');
const normalized = source.replace(/\s+/g, '');

assert(
  normalized.includes("constSTORES=['catalogs','lists','history','wishlist','trash','settings','referenceProducts','referenceMarkets','inventory']")
);
assert(source.includes('objectStoreNames.contains(store)'));
assert(source.includes('!catalogs.has(item.mainItemId)'));
assert(source.includes('!catalogs.has(history.mainItemId)'));
assert(source.includes('db.version < VERSION'));
assert(source.includes('window.__mlDbIntegrityV230 = { diagnose, report }'));

console.log('v230 db integrity tests: OK');
