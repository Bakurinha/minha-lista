const fs = require('fs'),
  vm = require('vm'),
  assert = require('assert');
const source = fs.readFileSync('backup-v230.js', 'utf8');
const context = {
  document: { readyState: 'complete', getElementById: () => null, body: {} },
  MutationObserver: class {
    observe() {}
  },
  indexedDB: {},
  alert() {},
  confirm() {
    return false;
  },
  console,
  URL,
  Blob,
  setTimeout,
  clearTimeout,
};
vm.runInNewContext(source, context);
const api = context.__mlBackupV230;
const legacy = {
  app: 'Minha Lista de Supermercado',
  version: '2.2',
  schemaVersion: 3,
  exportedAt: '2026-01-01T00:00:00.000Z',
  catalogs: [{ id: 'cat-001', name: 'Arroz' }],
  lists: [
    {
      id: 'list-001',
      name: 'Compras',
      date: '2026-01-01',
      items: [
        {
          id: 'item-001',
          mainItemId: 'cat-001',
          done: false,
          quantity: 2,
          value: 10,
          date: '2026-01-01',
        },
      ],
    },
  ],
  history: [
    {
      id: 'hist-001',
      mainItemId: 'cat-001',
      itemName: 'Arroz',
      value: 10,
      date: '2026-01-01',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};
assert.strictEqual(api.validate(legacy), null);
const normalized = api.normalizeLegacyBackup(legacy);
assert.strictEqual(normalized.backupFormatVersion, 1);
assert.strictEqual(normalized.lists[0].purchaseType, 'local');
assert.strictEqual(normalized.catalogs[0].brand, '');
assert.strictEqual(normalized.history[0].origin, 'legacy-backup');
const migrated = api.migrate(legacy);
assert.strictEqual(migrated.backupFormatVersion, 2);
assert.strictEqual(migrated.schemaVersion, 6);
assert.deepStrictEqual(migrated.inventory, []);
assert.strictEqual(migrated.lists[0].items[0].mainItemId, 'cat-001');
console.log('OK: backup V2.2 normalizado e migrado para V2/schema 6');
