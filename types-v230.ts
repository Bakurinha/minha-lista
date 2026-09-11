/**
 * Contratos TypeScript da V2.3.0.
 *
 * Este arquivo é somente tipagem/documentação nesta etapa: o aplicativo em
 * produção continua sendo JavaScript puro e não depende de compilação TS.
 */

export type ISODate = `${number}-${number}-${number}`;

export interface CatalogItem {
  id: string;
  name: string;
  brand?: string;
  unit?: string;
  category?: string;
  ean?: string;
  notes?: string;
}

export interface ListItem {
  id: string;
  mainItemId: string;
  quantity: number;
  unit?: string;
  value: number;
  done: boolean;
  date?: ISODate | string;
  expiryDate?: ISODate | string;
  market?: string;
  notes?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  date?: ISODate | string;
  items: ListItem[];
  createdAt?: number | string;
  updatedAt?: number | string;
}

/** Um registro representa um lote independente do mesmo produto. */
export interface InventoryLot {
  id: string;
  catalogId?: string;
  mainItemId: string;
  quantity: number;
  packageQuantity?: number;
  packageUnit?: string;
  expiryDate?: ISODate | string;
  entryDate?: ISODate | string;
  minQuantity?: number;
  marketName?: string;
  location?: string;
  notes?: string;
  createdAt?: number | string;
  updatedAt?: number | string;
}

export interface HistoryItem {
  id: string;
  mainItemId?: string;
  itemName: string;
  value: number;
  date?: ISODate | string;
  market?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  notes?: string;
}

export type TrashType = 'catalog' | 'list';

export interface TrashItem {
  id: string;
  type: TrashType;
  data: unknown;
}

export interface SettingItem {
  key: string;
  value: unknown;
}

export interface BackupV2 {
  backupFormatVersion: 2;
  schemaVersion: 6;
  catalogs: CatalogItem[];
  lists: ShoppingList[];
  history: HistoryItem[];
  wishlist: WishlistItem[];
  trash: TrashItem[];
  settings: SettingItem[];
  inventory: InventoryLot[];
}

export interface SharedListV3 {
  version: 3;
  list: ShoppingList;
  catalogs: CatalogItem[];
}

export interface DbMigrationContract {
  readonly 1: readonly ['catalogs', 'lists', 'history', 'settings'];
  readonly 2: readonly ['wishlist'];
  readonly 3: readonly ['trash'];
  readonly 4: readonly ['referenceProducts', 'referenceMarkets'];
  readonly 5: readonly [];
  readonly 6: readonly ['inventory'];
}
