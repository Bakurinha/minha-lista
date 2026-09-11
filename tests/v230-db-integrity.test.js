const fs=require('fs'),assert=require('assert');
const source=fs.readFileSync('db-integrity-v230.js','utf8');
assert(source.includes("const STORES=['catalogs','lists','history','wishlist','trash','settings','referenceProducts','referenceMarkets','inventory']"));
assert(source.includes("objectStoreNames.contains(s)"));
assert(source.includes("!catalogs.has(i.mainItemId)"));
assert(source.includes("!catalogs.has(x.mainItemId)"));
assert(source.includes("d.version<6"));
assert(source.includes("window.__mlDbIntegrityV230={diagnose,report}"));
console.log('v230 db integrity tests: OK');
