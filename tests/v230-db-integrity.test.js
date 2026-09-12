const fs = require('fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const source = fs.readFileSync('db-integrity-v230.js', 'utf8');
const normalized = source.replace(/\s+/g, '');

assert(
  normalized.includes("constSTORES=['catalogs','lists','history','wishlist','trash','settings','referenceProducts','referenceMarkets','inventory']")
);
assert(source.includes("constKEY_PATHS=Object.freeze({"));
assert(source.includes('objectStoreNames.contains(store)'));
assert(source.includes('objectStore(store).keyPath'));
assert(source.includes('!catalogs.has(item.mainItemId)'));
assert(source.includes('!catalogs.has(entry.mainItemId)'));
assert(source.includes('!catalogs.has(stock.mainItemId)'));
assert(source.includes('ID de item duplicado globalmente'));
assert(source.includes('validDate'));
assert(source.includes('version < VERSION'));
assert(source.includes('async function runSilent()'));
assert(source.includes('console.warn'));
assert(source.includes('window.__mlDbIntegrityV230 = { diagnose, validateRows, report, runSilent }'));

const context = {
  document: { readyState: 'complete', getElementById: () => null, querySelector: () => null },
  window: null,
  console,
  setTimeout() {},
  alert() {}
};
context.window = context;
vm.runInNewContext(source, context, { timeout: 1000 });

const { validateRows } = context.__mlDbIntegrityV230;
const baseRows = {
  catalogs: [{ id: 'c1', name: 'Arroz', brand: 'Camil', unit: '5 kg', category: 'Alimentos', ean: '' }],
  lists: [{ id: 'l1', name: 'Compra', date: '2026-09-10', items: [{ id: 'i1', mainItemId: 'c1', done: false, quantity: 1, value: 10, date: null, expiryDate: '2026-12-31', marketName: '', comments: '' }] }],
  history: [{ id: 'h1', mainItemId: 'c1', itemName: 'Arroz', value: 10, date: '2026-09-10', marketName: 'Atakarejo' }],
  wishlist: [{ id: 'w1', name: 'Café' }],
  trash: [{ id: 't1', type: 'list', data: { id: 'old-list' } }],
  settings: [{ key: 'theme', value: 'system' }],
  referenceProducts: [{ id: 'rp1', name: 'Arroz', brand: 'Camil' }],
  referenceMarkets: [{ id: 'rm1', name: 'Atakarejo' }],
  inventory: [{ id: 's1', mainItemId: 'c1', quantity: 2, expiryDate: '2026-12-31', entryDate: '2026-09-10', packageQuantity: 5, minQuantity: 1, packageUnit: 'kg', marketName: 'Atakarejo', location: 'A1', notes: '' }]
};

assert.equal(validateRows(baseRows, { version: 6 }).ok, true, 'snapshot válido deve passar');
assert.equal(validateRows({ ...baseRows, lists: [{ ...baseRows.lists[0], date: '2026-02-31' }] }, { version: 6 }).ok, false, 'data impossível deve falhar');
assert.equal(validateRows({ ...baseRows, lists: [{ ...baseRows.lists[0], items: [{ ...baseRows.lists[0].items[0], mainItemId: 'missing' }] }] }, { version: 6 }).ok, false, 'referência de item deve falhar');
assert.equal(validateRows({ ...baseRows, inventory: [{ ...baseRows.inventory[0], mainItemId: 'missing' }] }, { version: 6 }).ok, false, 'referência de estoque deve falhar');
assert.equal(validateRows({ ...baseRows, lists: [{ ...baseRows.lists[0], items: [baseRows.lists[0].items[0], { ...baseRows.lists[0].items[0], id: 'i1' }] }] }, { version: 6 }).ok, false, 'ID duplicado global deve falhar');
assert.equal(validateRows(baseRows, { version: 5 }).ok, false, 'versão inferior deve falhar');

console.log('v230 db integrity tests: OK');
