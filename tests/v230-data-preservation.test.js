const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('backup-v230.js', 'utf8');
const context = {
  document: { readyState: 'complete', getElementById: () => null, body: {}, addEventListener() {} },
  indexedDB: {},
  console,
  URL: { createObjectURL: () => '', revokeObjectURL() {} },
  Blob: function () {},
  setTimeout,
  clearTimeout,
  confirm: () => true,
  location: { reload() {} },
  Date,
  JSON,
  Promise,
  Error,
  Object,
  Array,
  Number,
  String,
  Boolean,
  RegExp,
  Math,
  MutationObserver: class {
    observe() {}
  },
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context);
const api = context.__mlBackupV230;
assert(api && typeof api.validate === 'function' && typeof api.migrate === 'function');

const catalog = {
  id: 'cat-001',
  name: 'Arroz Integral',
  brand: 'Tio João',
  unit: '1kg',
  category: 'Alimentos',
  notes: 'Integral',
};
const item = {
  id: 'item-001',
  mainItemId: 'cat-001',
  done: false,
  quantity: 2,
  value: 12.5,
  date: '2026-09-08',
  expiryDate: '2027-01-15',
  packageQuantity: 1,
  packageUnit: 'kg',
  marketName: 'Atakarejo',
  comments: 'Pacote fechado',
};
const inventory = {
  id: 'lot-001',
  mainItemId: 'cat-001',
  quantity: 3,
  packageQuantity: 1,
  packageUnit: 'kg',
  expiryDate: '2027-01-15',
  entryDate: '2026-09-08',
  minQuantity: 1,
  marketName: 'Atakarejo',
  location: 'Despensa',
  notes: 'Lote A',
  createdAt: '2026-09-08T10:00:00.000Z',
  updatedAt: '2026-09-08T10:00:00.000Z',
};
const original = {
  app: 'Minha Lista de Supermercado',
  backupFormatVersion: 2,
  schemaVersion: 6,
  exportedAt: '2026-09-08T10:00:00.000Z',
  catalogs: [catalog],
  lists: [
    {
      id: 'list-001',
      name: 'Compras da semana',
      date: '2026-09-08',
      purchaseType: 'local',
      comments: 'Feira',
      archived: false,
      marketName: 'Atakarejo',
      items: [item],
    },
  ],
  history: [
    {
      id: 'hist-001',
      mainItemId: 'cat-001',
      itemName: 'Arroz Integral',
      brand: 'Tio João',
      unit: '1kg',
      marketName: 'Atakarejo',
      value: 12.5,
      date: '2026-09-08',
      origin: 'list',
    },
  ],
  wishlist: [{ id: 'wish-001', name: 'Café', createdAt: '2026-09-08T10:00:00.000Z' }],
  trash: [
    { id: 'trash-001', type: 'catalog', data: catalog, deletedAt: '2026-09-08T10:00:00.000Z' },
  ],
  inventory: [inventory],
  settings: { theme: 'dark', foo: 'bar' },
};

const before = JSON.parse(JSON.stringify(original));
assert.strictEqual(api.validate(original), null, 'backup V2 válido deve passar');
const migrated = api.migrate(original);
assert.deepStrictEqual(original, before, 'migrate não pode mutar o backup de entrada');
assert.strictEqual(api.validate(migrated), null, 'backup V2 após migrate deve continuar válido');
assert.deepStrictEqual(
  migrated,
  original,
  'migração V2 deve ser identidade e preservar todos os campos'
);

const serialized = JSON.stringify(migrated);
const restored = JSON.parse(serialized);
const restoredMigrated = api.migrate(restored);
assert.strictEqual(api.validate(restoredMigrated), null, 'backup restaurado deve continuar válido');
assert.deepStrictEqual(restoredMigrated, migrated, 'round-trip backup JSON não pode alterar dados');
for (const key of ['catalogs', 'lists', 'history', 'wishlist', 'trash', 'inventory', 'settings'])
  assert.deepStrictEqual(
    restoredMigrated[key],
    original[key],
    `${key} foi alterado durante o round-trip`
  );

const legacy = {
  version: '2.2',
  app: 'Minha Lista de Supermercado',
  schemaVersion: 3,
  exportedAt: original.exportedAt,
  catalogs: [{ id: 'cat-001', name: 'Arroz Integral' }],
  lists: [
    {
      id: 'list-001',
      name: 'Compras',
      items: [{ id: 'item-001', mainItemId: 'cat-001', done: false, quantity: 2, value: 12.5 }],
    },
  ],
  history: [],
  wishlist: [],
  trash: [],
  settings: { theme: 'light' },
};
const legacyBefore = JSON.parse(JSON.stringify(legacy));
const legacyMigrated = api.migrate(legacy);
assert.deepStrictEqual(legacy, legacyBefore, 'migração legada não pode mutar a entrada');
assert.strictEqual(
  api.validate(legacyMigrated),
  null,
  'backup legado 2.2 deve migrar e continuar válido'
);
assert.strictEqual(legacyMigrated.backupFormatVersion, 2);
assert.strictEqual(legacyMigrated.schemaVersion, 6);
assert.strictEqual(
  JSON.stringify(legacyMigrated.inventory),
  JSON.stringify([]),
  'backup legado deve iniciar com estoque vazio'
);
assert.strictEqual(legacyMigrated.catalogs[0].name, 'Arroz Integral');
assert.strictEqual(legacyMigrated.lists[0].items[0].mainItemId, 'cat-001');

const legacyRoundTrip = api.migrate(JSON.parse(JSON.stringify(legacyMigrated)));
assert.strictEqual(
  JSON.stringify(legacyRoundTrip),
  JSON.stringify(legacyMigrated),
  'backup legado migrado deve sobreviver ao round-trip'
);

const cases = [
  [
    'estoque órfão',
    () => {
      const bad = JSON.parse(JSON.stringify(original));
      bad.inventory[0].mainItemId = 'missing-catalog';
      return api.validate(bad);
    },
  ],
  [
    'item órfão',
    () => {
      const bad = JSON.parse(JSON.stringify(original));
      bad.lists[0].items[0].mainItemId = 'missing-catalog';
      return api.validate(bad);
    },
  ],
  [
    'data impossível',
    () => {
      const bad = JSON.parse(JSON.stringify(original));
      bad.lists[0].date = '2026-02-31';
      return api.validate(bad);
    },
  ],
];
for (const [label, run] of cases) assert.notStrictEqual(run(), null, `${label} deve ser rejeitado`);

console.log('V2.3.0 data preservation tests: OK');
