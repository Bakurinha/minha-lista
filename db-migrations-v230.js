/**
 * Contrato técnico das migrações do IndexedDB da V2.3.0.
 *
 * Este módulo descreve quais object stores cada versão introduz e oferece
 * funções pequenas para planejar/aplicar essas mudanças. O núcleo legado
 * continua responsável pelo fluxo de abertura do banco para preservar a
 * compatibilidade já existente.
 */
(() => {
  'use strict';

  const DB_NAME = 'MinhaListaDB';
  const LATEST = 6;

  // V1-V6 representam o histórico de stores, não versões de interface.
  const MIGRATIONS = Object.freeze({
    1: Object.freeze(['catalogs', 'lists', 'history', 'settings']),
    2: Object.freeze(['wishlist']),
    3: Object.freeze(['trash']),
    4: Object.freeze(['referenceProducts', 'referenceMarkets']),
    5: Object.freeze([]),
    6: Object.freeze(['inventory'])
  });

  // Todas as stores usam id, exceto settings, que usa key.
  const keyPath = (store) => (store === 'settings' ? 'key' : 'id');

  function ensureStore(db, store) {
    if (!db.objectStoreNames.contains(store)) {
      db.createObjectStore(store, { keyPath: keyPath(store) });
    }
  }

  // Aplica somente a criação de stores ausentes; não apaga nem reescreve dados.
  function migrate(db, oldVersion, newVersion = LATEST) {
    if (oldVersion > newVersion) {
      throw new Error(`Versão antiga ${oldVersion} maior que a versão alvo ${newVersion}`);
    }

    for (
      let version = Math.max(1, oldVersion + 1);
      version <= newVersion;
      version += 1
    ) {
      for (const store of MIGRATIONS[version] || []) {
        ensureStore(db, store);
      }
    }
  }

  // Retorna apenas o plano de stores que seriam criadas entre duas versões.
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
      Array.from(
        { length: newVersion - Math.max(0, oldVersion) },
        (_, index) => Math.max(1, oldVersion + 1 + index)
      ).flatMap((version) => MIGRATIONS[version] || [])
    );
  }

  window.__mlDbMigrationsV230 = {
    DB_NAME,
    LATEST,
    MIGRATIONS,
    keyPath,
    ensureStore,
    migrate,
    plan
  };
})();
