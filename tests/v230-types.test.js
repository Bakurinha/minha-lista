'use strict';

const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('types-v230.ts', 'utf8');

for (const name of [
  'CatalogItem',
  'ListItem',
  'ShoppingList',
  'InventoryLot',
  'HistoryItem',
  'WishlistItem',
  'TrashItem',
  'SettingItem',
  'BackupV2',
  'SharedListV3',
  'DbMigrationContract',
]) {
  assert(source.includes(`interface ${name}`), `Contrato ausente: ${name}`);
}

assert(source.includes('export type ISODate'), 'ISODate ausente');
assert(source.includes("export type TrashType = 'catalog' | 'list'"), 'TrashType inválido');
assert(source.includes('packageQuantity?: number'), 'packageQuantity ausente');
assert(source.includes('packageUnit?: string'), 'packageUnit ausente');
assert(source.includes('expiryDate?: ISODate | string'), 'expiryDate ausente');
assert(source.includes('inventory: InventoryLot[]'), 'inventory ausente no backup');
assert(source.includes('version: 3'), 'versão V3 do compartilhamento ausente');
assert(source.includes("readonly 6: readonly ['inventory']"), 'migração V6 ausente');

console.log('V2.3.0 TypeScript contracts: OK');
