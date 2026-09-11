/**
 * Diagnóstico não destrutivo do IndexedDB V2.3.0.
 *
 * Verifica stores, registros básicos, referências entre catálogos/listas/
 * estoque e tipos de campos. O módulo somente diagnostica: não corrige,
 * remove nem reescreve dados automaticamente.
 */
(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const VERSION = 6;
  const STORES = [
    'catalogs',
    'lists',
    'history',
    'wishlist',
    'trash',
    'settings',
    'referenceProducts',
    'referenceMarkets',
    'inventory'
  ];

  const $ = (id) => document.getElementById(id);

  const all = (db, store) => new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || Error('Falha IndexedDB'));
  });

  const open = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
  });

  // Valida apenas o formato de data usado pelos registros do aplicativo.
  const date = (value) => (
    value == null || value === '' || /^\d{4}-\d{2}-\d{2}$/.test(String(value))
  );

  // Campos numéricos de quantidade/valor aceitam zero e números finitos.
  const num = (value) => (
    value == null || value === '' || (
      typeof value === 'number' && Number.isFinite(value) && value >= 0
    )
  );

  const id = (value) => (
    typeof value === 'string' && value.length >= 1 && value.length <= 200
  );

  async function diagnose() {
    const db = await open();

    try {
      const missing = STORES.filter((store) => !db.objectStoreNames.contains(store));

      if (missing.length) {
        return {
          ok: false,
          version: db.version,
          missing,
          counts: {},
          issues: [`Stores ausentes: ${missing.join(', ')}`]
        };
      }

      const rows = Object.fromEntries(
        await Promise.all(STORES.map(async (store) => [store, await all(db, store)]))
      );
      const issues = [];
      const add = (store, message) => issues.push(`${store}: ${message}`);
      const catalogs = new Set();

      // Catálogos são a base das referências usadas por listas e estoque.
      for (const catalog of rows.catalogs) {
        if (!catalog || !id(catalog.id) || typeof catalog.name !== 'string' || !catalog.name.trim()) {
          add('catalogs', 'registro inválido');
        } else if (catalogs.has(catalog.id)) {
          add('catalogs', 'ID duplicado');
        } else {
          catalogs.add(catalog.id);
        }
      }

      const lists = new Set();

      for (const list of rows.lists) {
        if (!list || !id(list.id) || typeof list.name !== 'string' || !list.name.trim() || !Array.isArray(list.items)) {
          add('lists', 'registro inválido');
        } else {
          if (lists.has(list.id)) add('lists', 'ID duplicado');
          lists.add(list.id);

          for (const item of list.items) {
            if (
              !item ||
              !id(item.id) ||
              !id(item.mainItemId) ||
              !catalogs.has(item.mainItemId) ||
              typeof item.done !== 'boolean' ||
              !num(item.quantity) ||
              !num(item.value) ||
              !date(item.date) ||
              !date(item.expiryDate)
            ) {
              add('lists', `item inválido ou órfão (${item?.id || 'sem ID'})`);
            }
          }
        }
      }

      for (const history of rows.history) {
        if (
          !history ||
          !id(history.id) ||
          (history.mainItemId && !catalogs.has(history.mainItemId)) ||
          typeof history.itemName !== 'string' ||
          !num(history.value) ||
          !date(history.date)
        ) {
          add('history', 'registro inválido ou órfão');
        }
      }

      for (const wish of rows.wishlist) {
        if (!wish || !id(wish.id) || typeof wish.name !== 'string' || !wish.name.trim()) {
          add('wishlist', 'registro inválido');
        }
      }

      for (const trash of rows.trash) {
        if (!trash || !id(trash.id) || !['catalog', 'list'].includes(trash.type) || !trash.data) {
          add('trash', 'registro inválido');
        }
      }

      // O estoque referencia o catálogo, mas mantém seus próprios lotes.
      for (const stock of rows.inventory) {
        if (
          !stock ||
          !id(stock.id) ||
          !id(stock.mainItemId) ||
          !catalogs.has(stock.mainItemId) ||
          !num(stock.quantity) ||
          !num(stock.packageQuantity) ||
          !num(stock.minQuantity) ||
          !date(stock.expiryDate) ||
          !date(stock.entryDate) ||
          typeof (stock.packageUnit ?? '') !== 'string'
        ) {
          add('inventory', `lote inválido ou órfão (${stock?.id || 'sem ID'})`);
        }
      }

      for (const setting of rows.settings) {
        if (!setting || typeof setting.key !== 'string') {
          add('settings', 'registro inválido');
        }
      }

      if (db.version < VERSION) {
        add('database', `versão ${db.version}; esperado >= ${VERSION}`);
      }

      const counts = Object.fromEntries(
        STORES.map((store) => [store, rows[store].length])
      );

      return {
        ok: issues.length === 0,
        version: db.version,
        missing: [],
        counts,
        issues
      };
    } finally {
      db.close();
    }
  }

  function report(result) {
    const counts = Object.entries(result.counts)
      .filter(([, count]) => count > 0)
      .map(([store, count]) => `${store}: ${count}`)
      .join('\n');

    return [
      'Integridade do armazenamento',
      '',
      result.ok ? '✓ Nenhum problema encontrado.' : '⚠ Problemas encontrados:',
      result.issues.length
        ? result.issues.slice(0, 20).map((issue) => `• ${issue}`).join('\n')
        : '• Estrutura e referências básicas OK.',
      '',
      `Versão do banco: ${result.version}`,
      '',
      'Registros:',
      counts || 'nenhum',
      result.issues.length > 20 ? '\n...mais problemas foram encontrados.' : ''
    ].join('\n');
  }

  async function run() {
    try {
      const result = await diagnose();
      console.info('[Minha Lista] diagnóstico IndexedDB', result);
      alert(report(result));
      return result;
    } catch (error) {
      console.error(error);
      alert('Não foi possível verificar a integridade do armazenamento.');
    }
  }

  function bind() {
    const host = document.querySelector('#settingsView .panel:nth-of-type(2)');
    if (!host || $('dbIntegrityBtn')) return;

    const button = document.createElement('button');
    button.id = 'dbIntegrityBtn';
    button.className = 'btn ghost';
    button.type = 'button';
    button.textContent = '🔎 Verificar integridade';
    button.addEventListener('click', run);
    host.querySelector('.row')?.appendChild(button);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }

  window.__mlDbIntegrityV230 = { diagnose, report };
})();
