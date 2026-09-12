/**
 * Ponte de compatibilidade da abertura do IndexedDB V2.3.0.
 *
 * A página continua usando indexedDB.open() pelo núcleo legado, mas a abertura
 * do MinhaListaDB passa primeiro pelo contrato oficial de migrações.
 * Nenhum outro banco do navegador é afetado.
 */
(() => {
  'use strict';

  const migrations = window.__mlDbMigrationsV230;
  const nativeIndexedDB = window.indexedDB;

  if (!migrations || !nativeIndexedDB || typeof nativeIndexedDB.open !== 'function') return;
  if (nativeIndexedDB.__mlV230BridgeInstalled) return;

  const nativeOpen = nativeIndexedDB.open.bind(nativeIndexedDB);

  const facade = new Proxy(nativeIndexedDB, {
    get(target, property) {
      if (property === '__mlV230BridgeInstalled') return true;
      if (property === 'open') {
        return (name, version) => {
          const request = nativeOpen(name, version);
          if (name === migrations.DB_NAME && version === migrations.LATEST) {
            request.addEventListener('upgradeneeded', (event) => {
              migrations.migrate(
                request.result,
                event.oldVersion,
                event.newVersion || version
              );
            }, { once: true });
          }
          return request;
        };
      }
      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });

  window.indexedDB = facade;
  window.__mlDbOpenBridgeV230 = { DB_NAME: migrations.DB_NAME, LATEST: migrations.LATEST };
})();
