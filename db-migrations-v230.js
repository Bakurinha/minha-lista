/**
 * Migrações incrementais do IndexedDB da V2.3.0.
 *
 * Cada versão possui um passo explícito e idempotente. Os passos somente
 * criam stores ausentes: nunca apagam, limpam ou reescrevem dados existentes.
 * O fluxo legado de abertura do banco pode usar migrate() diretamente dentro
 * do evento onupgradeneeded.
 */
(() => {
  'use strict';

  const DB_NAME = 'MinhaListaDB';
  const LATEST = 6;

  // Histórico declarativo das stores introduzidas em cada versão do banco.
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
    if (!db?.objectStoreNames?.contains(store)) {
      db.createObjectStore(store, { keyPath: keyPath(store) });
      return true;
    }
    return false;
  }

  // Um passo de migração é deliberadamente pequeno e idempotente.
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

  // Aplica todos os passos entre duas versões sem apagar nem reescrever dados.
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
    for (
      let version = Math.max(1, oldVersion + 1);
      version <= newVersion;
      version += 1
    ) {
      created += applyVersion(db, version);
    }
    return created;
  }

  // Retorna somente as stores que seriam introduzidas no intervalo solicitado.
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
    applyVersion,
    migrate,
    plan
  };
})();
