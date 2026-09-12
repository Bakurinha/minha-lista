/**
 * Migrações incrementais do IndexedDB da V2.3.0.
 *
 * Cada versão possui um passo explícito e idempotente. Os passos somente
 * criam stores ausentes: nunca apagam, limpam ou reescrevem dados existentes.
 */
(() => {
  'use strict';

  const DB_NAME = 'MinhaListaDB';
  const LATEST = 6;

  const MIGRATIONS = Object.freeze({
    1: Object.freeze(['catalogs', 'lists', 'history', 'settings']),
    2: Object.freeze(['wishlist']),
    3: Object.freeze(['trash']),
    4: Object.freeze(['referenceProducts', 'referenceMarkets']),
    5: Object.freeze([]),
    6: Object.freeze(['inventory']),
  });

  const keyPath = (store) => (store === 'settings' ? 'key' : 'id');

  function ensureStore(db, store) {
    if (!db?.objectStoreNames?.contains(store)) {
      db.createObjectStore(store, { keyPath: keyPath(store) });
      return true;
    }
    return false;
  }

  function applyVersion(db, version) {
    if (!Number.isInteger(version) || version < 1 || version > LATEST) {
      throw new RangeError(`Versão de migração inválida: ${version}`);
    }

    let created = 0;
    for (const store of MIGRATIONS[version] || []) {
      if (ensureStore(db, store)) created += 1;
    }
    return created;
  }

  function migrate(db, oldVersion, newVersion = LATEST) {
    if (!Number.isInteger(oldVersion) || oldVersion < 0) {
      throw new TypeError('oldVersion inválida');
    }
    if (!Number.isInteger(newVersion) || newVersion < 1) {
      throw new TypeError('newVersion inválida');
    }
    if (oldVersion > newVersion) {
      throw new Error(`Versão antiga ${oldVersion} maior que a versão alvo ${newVersion}`);
    }

    let created = 0;
    for (let version = Math.max(1, oldVersion + 1); version <= newVersion; version += 1) {
      created += applyVersion(db, version);
    }
    return created;
  }

  function plan(oldVersion, newVersion = LATEST) {
    if (!Number.isInteger(oldVersion) || oldVersion < 0) {
      throw new TypeError('oldVersion inválida');
    }
    if (!Number.isInteger(newVersion) || newVersion < 1) {
      throw new TypeError('newVersion inválida');
    }
    if (oldVersion > newVersion) {
      throw new Error('oldVersion não pode ser maior que newVersion');
    }

    return Object.freeze(
      Array.from({ length: newVersion - Math.max(0, oldVersion) }, (_, index) =>
        Math.max(1, oldVersion + 1 + index)
      ).flatMap((version) => MIGRATIONS[version] || [])
    );
  }

  // Abre o banco usando a mesma cadeia incremental usada nos testes.
  // O callback opcional recebe o IDBOpenDBRequest e pode complementar
  // comportamentos de abertura sem duplicar a criação de stores.
  function open(options = {}) {
    const indexedDBApi = options.indexedDB || window.indexedDB;
    const name = options.name || DB_NAME;
    const version = options.version || LATEST;
    if (!indexedDBApi || typeof indexedDBApi.open !== 'function') {
      return Promise.reject(new Error('IndexedDB indisponível'));
    }
    return new Promise((resolve, reject) => {
      const request = indexedDBApi.open(name, version);
      request.onupgradeneeded = (event) => {
        const db = request.result;
        migrate(db, event.oldVersion, event.newVersion || version);
        if (typeof options.onupgradeneeded === 'function') {
          options.onupgradeneeded(event, db, request);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Falha ao abrir IndexedDB'));
      request.onblocked = () => {
        if (typeof options.onblocked === 'function') options.onblocked(request);
      };
    });
  }

  window.__mlDbMigrationsV230 = {
    DB_NAME,
    LATEST,
    MIGRATIONS,
    keyPath,
    ensureStore,
    applyVersion,
    migrate,
    plan,
    open,
  };
})();
