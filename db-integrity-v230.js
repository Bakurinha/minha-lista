/**
 * Diagnóstico não destrutivo do IndexedDB V2.3.0.
 *
 * Verifica a estrutura física do banco, registros, IDs, referências entre
 * catálogos/listas/histórico/estoque e tipos básicos de dados.
 * O diagnóstico nunca corrige, remove ou reescreve dados automaticamente.
 *
 * Este módulo é deliberadamente separado do fluxo de correção: encontrar
 * uma inconsistência não autoriza o app a apagar ou "consertar" o registro.
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
    'inventory',
  ];
  const KEY_PATHS = Object.freeze({
    catalogs: 'id',
    lists: 'id',
    history: 'id',
    wishlist: 'id',
    trash: 'id',
    settings: 'key',
    referenceProducts: 'id',
    referenceMarkets: 'id',
    inventory: 'id',
  });

  const $ = (id) => document.getElementById(id);

  // Leitura isolada de uma store para manter o diagnóstico readonly.
  const all = (db, store) =>
    new Promise((resolve, reject) => {
      let request;
      try {
        request = db.transaction(store, 'readonly').objectStore(store).getAll();
      } catch (error) {
        reject(error);
        return;
      }
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || Error('Falha IndexedDB'));
    });

  const open = () =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(DB);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
    });

  const validId = (value) =>
    typeof value === 'string' && value.trim().length >= 1 && value.length <= 200;

  const validString = (value, required = false) =>
    typeof value === 'string' && (!required || value.trim().length > 0);

  const validNumber = (value, max = 1000000000) =>
    value == null ||
    value === '' ||
    (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max);

  const validDate = (value) => {
    if (value == null || value === '') return true;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  };

  const validEan = (value) =>
    value == null ||
    value === '' ||
    (typeof value === 'string' && /^(?:\d{8}|\d{12,14})$/.test(value.replace(/\D/g, '')));

  function duplicateIds(records) {
    const seen = new Set();
    const duplicates = new Set();
    for (const record of records) {
      if (!validId(record?.id)) continue;
      if (seen.has(record.id)) duplicates.add(record.id);
      else seen.add(record.id);
    }
    return duplicates;
  }

  /**
   * Valida um snapshot já carregado. A função é pura e não toca no IndexedDB,
   * facilitando testes e futuras ferramentas de diagnóstico.
   *
   * As referências são verificadas onde o domínio exige vínculo forte:
   * itens de lista/estoque apontam para um catálogo existente, por exemplo.
   */
  function validateRows(rows, meta = {}) {
    const issues = [];
    const add = (store, message) => issues.push(`${store}: ${message}`);
    const catalogs = new Set();
    const globalIds = new Set();
    const counts = Object.fromEntries(
      STORES.map((store) => [store, Array.isArray(rows[store]) ? rows[store].length : 0])
    );

    for (const store of STORES) {
      if (!Array.isArray(rows[store]))
        add('database', `snapshot ausente ou inválido para ${store}`);
    }

    // Primeiro detectamos problemas estruturais comuns a qualquer store.
    for (const store of STORES) {
      const duplicates = duplicateIds((rows[store] || []).filter((record) => store !== 'settings'));
      for (const duplicate of duplicates) add(store, `ID duplicado (${duplicate})`);
    }

    // Catálogo é a referência primária para itens de listas e estoque.
    for (const catalog of rows.catalogs || []) {
      if (
        !catalog ||
        !validId(catalog.id) ||
        !validString(catalog.name, true) ||
        !validEan(catalog.ean)
      ) {
        add('catalogs', `registro inválido (${catalog?.id || 'sem ID'})`);
        continue;
      }
      if (catalogs.has(catalog.id)) add('catalogs', `ID duplicado (${catalog.id})`);
      catalogs.add(catalog.id);
      if (catalog.brand != null && !validString(catalog.brand))
        add('catalogs', `brand inválido (${catalog.id})`);
      if (catalog.unit != null && !validString(catalog.unit))
        add('catalogs', `unit inválido (${catalog.id})`);
      if (catalog.category != null && !validString(catalog.category))
        add('catalogs', `category inválido (${catalog.id})`);
      if (catalog.notes != null && !validString(catalog.notes))
        add('catalogs', `notes inválido (${catalog.id})`);
    }

    // Listas mantêm seus itens embutidos. O diagnóstico valida tanto a lista
    // quanto a referência do item ao catálogo, sem tentar reconstruí-la.
    for (const list of rows.lists || []) {
      if (
        !list ||
        !validId(list.id) ||
        !validString(list.name, true) ||
        !Array.isArray(list.items) ||
        !validDate(list.date)
      ) {
        add('lists', `registro inválido (${list?.id || 'sem ID'})`);
        continue;
      }
      if (list.marketName != null && !validString(list.marketName))
        add('lists', `marketName inválido (${list.id})`);

      for (const item of list.items) {
        const itemId = item?.id || 'sem ID';
        if (
          !item ||
          !validId(item.id) ||
          !validId(item.mainItemId) ||
          !catalogs.has(item.mainItemId)
        ) {
          add('lists', `item inválido ou órfão (${itemId})`);
          continue;
        }
        if (globalIds.has(item.id)) add('lists', `ID de item duplicado globalmente (${item.id})`);
        globalIds.add(item.id);
        if (typeof item.done !== 'boolean') add('lists', `done inválido (${item.id})`);
        if (
          !validNumber(item.quantity) ||
          !validNumber(item.value) ||
          !validNumber(item.packageQuantity)
        ) {
          add('lists', `quantidade/valor inválido (${item.id})`);
        }
        if (!validDate(item.date) || !validDate(item.expiryDate))
          add('lists', `data inválida (${item.id})`);
        for (const field of [
          'productName',
          'productBrand',
          'productUnit',
          'productCategory',
          'marketName',
          'comments',
          'packageUnit',
        ]) {
          if (item[field] != null && !validString(item[field]))
            add('lists', `${field} inválido (${item.id})`);
        }
      }
    }

    for (const entry of rows.history || []) {
      if (
        !entry ||
        !validId(entry.id) ||
        (entry.mainItemId != null &&
          (!validId(entry.mainItemId) || !catalogs.has(entry.mainItemId))) ||
        !validString(entry.itemName, true) ||
        !validNumber(entry.value) ||
        !validDate(entry.date)
      ) {
        add('history', `registro inválido ou órfão (${entry?.id || 'sem ID'})`);
      }
      if (entry?.marketName != null && !validString(entry.marketName))
        add('history', `marketName inválido (${entry?.id || 'sem ID'})`);
    }

    for (const wish of rows.wishlist || []) {
      if (!wish || !validId(wish.id) || !validString(wish.name, true))
        add('wishlist', `registro inválido (${wish?.id || 'sem ID'})`);
    }

    for (const removed of rows.trash || []) {
      if (
        !removed ||
        !validId(removed.id) ||
        !['catalog', 'list'].includes(removed.type) ||
        !removed.data ||
        typeof removed.data !== 'object'
      ) {
        add('trash', `registro inválido (${removed?.id || 'sem ID'})`);
      }
    }

    for (const setting of rows.settings || []) {
      if (!setting || !validString(setting.key, true)) add('settings', 'registro inválido');
    }

    for (const product of rows.referenceProducts || []) {
      if (!product || !validId(product.id) || !validString(product.name, true))
        add('referenceProducts', `registro inválido (${product?.id || 'sem ID'})`);
    }

    for (const market of rows.referenceMarkets || []) {
      if (!market || !validId(market.id) || !validString(market.name, true))
        add('referenceMarkets', `registro inválido (${market?.id || 'sem ID'})`);
    }

    // Estoque também aponta para catálogo, mas seus lotes possuem campos
    // adicionais de validade, quantidade, mercado e localização.
    for (const stock of rows.inventory || []) {
      const stockId = stock?.id || 'sem ID';
      if (
        !stock ||
        !validId(stock.id) ||
        !validId(stock.mainItemId) ||
        !catalogs.has(stock.mainItemId) ||
        !validNumber(stock.quantity) ||
        !validNumber(stock.packageQuantity) ||
        !validNumber(stock.minQuantity) ||
        !validDate(stock.expiryDate) ||
        !validDate(stock.entryDate) ||
        (stock.packageUnit != null && !validString(stock.packageUnit))
      ) {
        add('inventory', `lote inválido ou órfão (${stockId})`);
      }
      for (const field of ['marketName', 'location', 'notes']) {
        if (stock?.[field] != null && !validString(stock[field]))
          add('inventory', `${field} inválido (${stockId})`);
      }
    }

    const version = meta.version ?? null;
    if (version !== null && version < VERSION)
      add('database', `versão ${version}; esperado >= ${VERSION}`);

    return {
      ok: issues.length === 0,
      version,
      missing: Array.isArray(meta.missing) ? meta.missing : [],
      counts,
      issues,
    };
  }

  // Diagnóstico físico: stores/keyPaths primeiro, conteúdo depois.
  async function diagnose() {
    const db = await open();
    try {
      const missing = STORES.filter((store) => !db.objectStoreNames.contains(store));
      const keyPathIssues = [];

      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) continue;
        try {
          const actual = db.transaction(store, 'readonly').objectStore(store).keyPath;
          if (actual !== KEY_PATHS[store])
            keyPathIssues.push(`${store}: keyPath "${actual}"; esperado "${KEY_PATHS[store]}"`);
        } catch (error) {
          keyPathIssues.push(`${store}: não foi possível ler keyPath (${error.message || 'erro'})`);
        }
      }

      if (missing.length) {
        return {
          ok: false,
          version: db.version,
          missing,
          counts: {},
          issues: [`Stores ausentes: ${missing.join(', ')}`, ...keyPathIssues],
        };
      }

      const rows = Object.fromEntries(
        await Promise.all(STORES.map(async (store) => [store, await all(db, store)]))
      );
      const result = validateRows(rows, { version: db.version, missing });
      result.issues.unshift(...keyPathIssues);
      result.ok = result.issues.length === 0;
      return result;
    } finally {
      db.close();
    }
  }

  // Converte o resultado para uma mensagem humana curta, limitando a saída
  // para não transformar um banco muito corrompido em um alerta interminável.
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
        ? result.issues
            .slice(0, 20)
            .map((issue) => `• ${issue}`)
            .join('\n')
        : '• Estrutura, tipos e referências básicas OK.',
      '',
      `Versão do banco: ${result.version}`,
      '',
      'Registros:',
      counts || 'nenhum',
      result.issues.length > 20 ? '\n...mais problemas foram encontrados.' : '',
    ].join('\n');
  }

  async function runManual() {
    try {
      const result = await diagnose();
      console.info('[Minha Lista] diagnóstico IndexedDB', result);
      alert(report(result));
      return result;
    } catch (error) {
      console.error('[Minha Lista] falha no diagnóstico IndexedDB', error);
      alert('Não foi possível verificar a integridade do armazenamento.');
      return null;
    }
  }

  async function runSilent() {
    try {
      const result = await diagnose();
      if (!result.ok) console.warn('[Minha Lista] inconsistência IndexedDB detectada', result);
      else console.info('[Minha Lista] diagnóstico IndexedDB OK');
      return result;
    } catch (error) {
      console.warn('[Minha Lista] diagnóstico IndexedDB indisponível', error);
      return null;
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
    button.addEventListener('click', runManual);
    host.querySelector('.row')?.appendChild(button);
  }

  function boot() {
    bind();
    // Diagnóstico automático silencioso: apenas registra problemas no console.
    setTimeout(runSilent, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.__mlDbIntegrityV230 = { diagnose, validateRows, report, runSilent };
})();
