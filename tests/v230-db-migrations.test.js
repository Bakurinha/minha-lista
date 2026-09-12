const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const source = fs.readFileSync('db-migrations-v230.js', 'utf8');
const context = {
  window: {},
  Object,
  Array,
  Number,
  String,
  TypeError,
  Error,
  RangeError,
  Promise,
};
vm.createContext(context);
vm.runInContext(source, context);
const api = context.window.__mlDbMigrationsV230;
assert(api, 'contrato de migraçoes nao carregado');
assert.strictEqual(api.DB_NAME, 'MinhaListaDB');
assert.strictEqual(api.LATEST, 6);
assert.deepStrictEqual(Array.from(api.MIGRATIONS[1]), ['catalogs', 'lists', 'history', 'settings']);
assert.deepStrictEqual(Array.from(api.MIGRATIONS[2]), ['wishlist']);
assert.deepStrictEqual(Array.from(api.MIGRATIONS[3]), ['trash']);
assert.deepStrictEqual(Array.from(api.MIGRATIONS[4]), ['referenceProducts', 'referenceMarkets']);
assert.deepStrictEqual(Array.from(api.MIGRATIONS[5]), []);
assert.deepStrictEqual(Array.from(api.MIGRATIONS[6]), ['inventory']);
assert.strictEqual(api.keyPath('settings'), 'key');
assert.strictEqual(api.keyPath('inventory'), 'id');
assert.deepStrictEqual(Array.from(api.plan(0, 6)), [
  'catalogs',
  'lists',
  'history',
  'settings',
  'wishlist',
  'trash',
  'referenceProducts',
  'referenceMarkets',
  'inventory',
]);
assert.deepStrictEqual(Array.from(api.plan(5, 6)), ['inventory']);
assert.throws(() => api.plan(7, 6), /oldVersion/);
assert.throws(() => api.plan(-1, 6), /oldVersion/);
assert.throws(() => api.plan(0, 0), /newVersion/);
assert.throws(() => api.applyVersion(0), /Versão de migração inválida/);
assert.throws(() => api.applyVersion(7), /Versão de migração inválida/);

function fakeDb(initial = []) {
  const names = new Set(initial);
  return {
    objectStoreNames: { contains: (name) => names.has(name) },
    createObjectStore: (name, options) => {
      names.add(name);
      return { name, keyPath: options.keyPath };
    },
    names,
  };
}

const fresh = fakeDb();
assert.strictEqual(api.migrate(fresh, 0, 6), 9, 'banco novo deve criar todas as stores históricas');
assert.deepStrictEqual(Array.from(fresh.names), [
  'catalogs',
  'lists',
  'history',
  'settings',
  'wishlist',
  'trash',
  'referenceProducts',
  'referenceMarkets',
  'inventory',
]);
assert.strictEqual(api.migrate(fresh, 0, 6), 0, 'migração repetida deve ser idempotente');

const v5 = fakeDb([
  'catalogs',
  'lists',
  'history',
  'settings',
  'wishlist',
  'trash',
  'referenceProducts',
  'referenceMarkets',
]);
assert.strictEqual(api.migrate(v5, 5, 6), 1);
assert(v5.names.has('inventory'));
assert.strictEqual(api.migrate(v5, 6, 6), 0);

const partial = fakeDb(['catalogs', 'lists', 'history', 'settings']);
assert.strictEqual(api.migrate(partial, 2, 4), 3, 'o plano deve aplicar somente as versões 3 e 4');
assert(partial.names.has('trash'));
assert(partial.names.has('referenceProducts'));
assert(partial.names.has('referenceMarkets'));

let opened = false;
const fakeIndexedDB = {
  open() {
    const request = {
      result: null,
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
      onblocked: null,
    };
    queueMicrotask(() => {
      const db = fakeDb();
      request.result = db;
      request.onupgradeneeded?.({ oldVersion: 0, newVersion: 6 });
      opened = true;
      request.onsuccess?.();
    });
    return request;
  },
};

(async () => {
  const openedDb = await api.open({ indexedDB: fakeIndexedDB });
  assert(opened, 'open() deve efetuar a abertura');
  assert(openedDb.names.has('inventory'), 'open() deve aplicar a cadeia incremental');
  assert(openedDb.names.has('catalogs'));
  console.log('V2.3.0 migration contract tests: OK');
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
