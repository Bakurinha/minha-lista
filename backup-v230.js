(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const MAX = 20 * 1024 * 1024;
  const $ = (id) => document.getElementById(id);

  const toast = (message) => {
    const element = $('toast');
    if (element) {
      element.textContent = message;
      element.classList.add('show');
      clearTimeout(element._v230);
      element._v230 = setTimeout(() => element.classList.remove('show'), 2800);
    } else {
      alert(message);
    }
  };

  const open = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB);
    request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
    request.onsuccess = () => resolve(request.result);
  });

  const all = (db, store) => new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || Error('Falha IndexedDB'));
  });

  const tx = (db, stores, fn) => new Promise((resolve, reject) => {
    let transaction;

    try {
      transaction = db.transaction(stores, 'readwrite');
      fn(transaction);
    } catch (error) {
      try {
        transaction?.abort();
      } catch {}
      reject(error);
      return;
    }

    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || Error('Falha IndexedDB'));
    transaction.onabort = () => reject(transaction.error || Error('Transação cancelada'));
  });

  const validDate = (value) => (
    value == null ||
    value === '' ||
    (/^\d{4}-\d{2}-\d{2}$/.test(String(value)) && (() => {
      const [year, month, day] = String(value).split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    })())
  );

  const id = (value) => (
    typeof value === 'string' && value.length >= 1 && value.length <= 200
  );

  const optionalNum = (value, max = 1000000) => (
    value == null ||
    value === '' ||
    (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= max
    )
  );

  const cleanSettings = (settings) => Object.fromEntries(
    Object.entries(settings || {})
      .filter(([key]) => !['referenceDataVersion', 'referenceSeedV230'].includes(key))
  );

  async function snapshot() {
    const db = await open();

    try {
      const stores = [
        'catalogs',
        'lists',
        'history',
        'wishlist',
        'trash',
        'settings',
        'inventory'
      ];
      const rows = await Promise.all(stores.map((store) => all(db, store)));
      const [catalogs, lists, history, wishlist, trash, settings, inventory] = rows;

      return {
        app: 'Minha Lista de Supermercado',
        backupFormatVersion: 2,
        schemaVersion: 6,
        exportedAt: new Date().toISOString(),
        catalogs,
        lists,
        history,
        wishlist,
        trash,
        inventory,
        settings: cleanSettings(
          Object.fromEntries(settings.map((item) => [item.key, item.value]))
        )
      };
    } finally {
      db.close();
    }
  }

  function normalizeLegacyBackup(raw) {
    if (!raw || raw.app !== 'Minha Lista de Supermercado' || raw.backupFormatVersion === 2) {
      return raw;
    }

    if (raw.version !== '2.2') return null;
    if (!Array.isArray(raw.catalogs) || !Array.isArray(raw.lists) || !Array.isArray(raw.history)) {
      return null;
    }

    const data = {
      app: 'Minha Lista de Supermercado',
      backupFormatVersion: 1,
      schemaVersion: Number.isInteger(raw.schemaVersion) ? raw.schemaVersion : 3,
      exportedAt: raw.exportedAt || new Date().toISOString(),
      catalogs: raw.catalogs,
      lists: raw.lists,
      history: raw.history,
      wishlist: Array.isArray(raw.wishlist) ? raw.wishlist : [],
      trash: Array.isArray(raw.trash) ? raw.trash : [],
      settings: (
        raw.settings &&
        typeof raw.settings === 'object' &&
        !Array.isArray(raw.settings)
      ) ? raw.settings : {}
    };

    data.catalogs = data.catalogs.map((catalog) => ({
      ...catalog,
      brand: String(catalog.brand || ''),
      unit: String(catalog.unit || 'un'),
      category: String(catalog.category || 'Outros'),
      notes: String(catalog.notes || '')
    }));

    data.lists = data.lists.map((list) => ({
      ...list,
      purchaseType: list.purchaseType === 'virtual' ? 'virtual' : 'local',
      comments: String(list.comments || ''),
      archived: !!list.archived,
      items: Array.isArray(list.items) ? list.items.map((item) => ({
        ...item,
        quantity: item.quantity == null ? null : item.quantity,
        value: item.value == null ? null : item.value,
        date: item.date || null,
        marketName: String(item.marketName || ''),
        comments: String(item.comments || '')
      })) : []
    }));

    data.history = data.history.map((item) => ({
      ...item,
      mainItemId: item.mainItemId || null,
      itemName: String(item.itemName || ''),
      brand: String(item.brand || ''),
      unit: String(item.unit || ''),
      marketName: String(item.marketName || ''),
      origin: String(item.origin || 'legacy-backup')
    }));

    return data;
  }

  function validate(data) {
    data = normalizeLegacyBackup(data);

    if (!data || data.app !== 'Minha Lista de Supermercado') {
      return 'Arquivo incompatível.';
    }

    if (![1, 2].includes(data.backupFormatVersion)) {
      return 'Versão de backup não suportada.';
    }

    for (const key of ['catalogs', 'lists', 'history', 'wishlist', 'trash']) {
      if (!Array.isArray(data[key])) return `Campo inválido: ${key}.`;
    }

    if (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) {
      return 'Configurações inválidas.';
    }

    if (data.backupFormatVersion === 2 && !Array.isArray(data.inventory)) {
      return 'Estoque inválido.';
    }

    if (JSON.stringify(data).length > MAX) {
      return 'O backup excede 20 MB.';
    }

    const catalogs = new Set();

    for (const catalog of data.catalogs) {
      if (
        !catalog ||
        !id(catalog.id) ||
        typeof catalog.name !== 'string' ||
        !catalog.name.trim() ||
        catalog.name.length > 120
      ) {
        return 'Catálogo inválido.';
      }

      if (catalogs.has(catalog.id)) return 'Catálogo duplicado.';
      catalogs.add(catalog.id);
    }

    const lists = new Set();

    for (const list of data.lists) {
      if (
        !list ||
        !id(list.id) ||
        typeof list.name !== 'string' ||
        !list.name.trim() ||
        list.name.length > 120 ||
        !Array.isArray(list.items) ||
        !validDate(list.date)
      ) {
        return 'Lista inválida.';
      }

      if (lists.has(list.id)) return 'Lista duplicada.';
      lists.add(list.id);

      for (const item of list.items) {
        if (
          !item ||
          !id(item.id) ||
          !id(item.mainItemId) ||
          !catalogs.has(item.mainItemId) ||
          typeof item.done !== 'boolean' ||
          !optionalNum(item.quantity) ||
          !optionalNum(item.value, 1000000000) ||
          !validDate(item.date) ||
          !validDate(item.expiryDate) ||
          !optionalNum(item.packageQuantity) ||
          typeof (item.marketName ?? '') !== 'string' ||
          typeof (item.comments ?? '') !== 'string'
        ) {
          return 'Item de lista inválido.';
        }
      }
    }

    for (const history of data.history) {
      if (
        !history ||
        !id(history.id) ||
        (history.mainItemId && !catalogs.has(history.mainItemId)) ||
        typeof history.itemName !== 'string' ||
        !optionalNum(history.value, 1000000000) ||
        !validDate(history.date)
      ) {
        return 'Histórico inválido.';
      }
    }

    for (const wish of data.wishlist) {
      if (!wish || !id(wish.id) || typeof wish.name !== 'string' || !wish.name.trim()) {
        return 'Lista de desejos inválida.';
      }
    }

    for (const trash of data.trash) {
      if (!trash || !id(trash.id) || !['catalog', 'list'].includes(trash.type) || !trash.data) {
        return 'Lixeira inválida.';
      }
    }

    if (data.backupFormatVersion === 2) {
      for (const stock of data.inventory) {
        if (
          !stock ||
          !id(stock.id) ||
          !id(stock.mainItemId) ||
          !catalogs.has(stock.mainItemId) ||
          !optionalNum(stock.quantity) ||
          !validDate(stock.expiryDate) ||
          !validDate(stock.entryDate) ||
          !optionalNum(stock.packageQuantity) ||
          !optionalNum(stock.minQuantity) ||
          typeof (stock.packageUnit ?? '') !== 'string' ||
          typeof (stock.marketName ?? '') !== 'string' ||
          typeof (stock.location ?? '') !== 'string' ||
          typeof (stock.notes ?? '') !== 'string'
        ) {
          return 'Registro de estoque inválido';
        }
      }
    }

    return null;
  }

  const migrate = (data) => {
    const normalized = normalizeLegacyBackup(data);

    if (normalized && normalized.backupFormatVersion === 2) {
      return normalized;
    }

    if (normalized && normalized.backupFormatVersion === 1) {
      return {
        ...normalized,
        backupFormatVersion: 2,
        schemaVersion: 6,
        inventory: []
      };
    }

    if (data?.backupFormatVersion === 1) {
      return {
        ...data,
        backupFormatVersion: 2,
        schemaVersion: 6,
        inventory: Array.isArray(data.inventory) ? data.inventory : []
      };
    }

    return data;
  };

  const download = (name, text) => {
    const url = URL.createObjectURL(
      new Blob([text], { type: 'application/json' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  async function exportV2() {
    try {
      download(
        `minha-lista-backup-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(await snapshot(), null, 2)
      );
      toast('Backup V2 exportado com estoque.');
    } catch (error) {
      console.error(error);
      toast('Não foi possível exportar o backup.');
    }
  }

  async function importV2(file) {
    if (!file) return;
    if (file.size > MAX) return toast('O backup excede 20 MB.');

    let data;

    try {
      data = JSON.parse(await file.text());
    } catch {
      return toast('Arquivo JSON inválido.');
    }

    data = normalizeLegacyBackup(data);
    const error = validate(data);
    if (error) return toast(error);

    if (!confirm(
      'ATENÇÃO\n\nA importação substituirá os dados pessoais atuais, incluindo o estoque.\n\nContinuar?'
    )) {
      return false;
    }

    data = migrate(data);
    const db = await open();

    try {
      const internal = (await all(db, 'settings'))
        .filter((item) => ['referenceDataVersion', 'referenceSeedV230'].includes(item.key));
      const stores = [
        'catalogs',
        'lists',
        'history',
        'wishlist',
        'trash',
        'settings',
        'inventory'
      ];

      await tx(db, stores, (transaction) => {
        for (const store of stores) transaction.objectStore(store).clear();
        for (const catalog of data.catalogs) transaction.objectStore('catalogs').put(catalog);
        for (const list of data.lists) transaction.objectStore('lists').put(list);
        for (const history of data.history) transaction.objectStore('history').put(history);
        for (const wish of data.wishlist) transaction.objectStore('wishlist').put(wish);
        for (const trash of data.trash) transaction.objectStore('trash').put(trash);
        for (const stock of data.inventory || []) transaction.objectStore('inventory').put(stock);
        for (const [key, value] of Object.entries(cleanSettings(data.settings))) {
          transaction.objectStore('settings').put({ key, value });
        }
        for (const item of internal) transaction.objectStore('settings').put(item);
      });

      db.close();
      toast('Backup restaurado com sucesso.');
      setTimeout(() => location.reload(), 150);
      return true;
    } catch (error) {
      try {
        db.close();
      } catch {}
      console.error(error);
      toast('Erro ao restaurar o backup. Nenhum dado parcial foi aplicado.');
      return false;
    }
  }

  function bind() {
    const button = $('exportBtn');
    const input = $('importInput');

    if (button && !button.dataset.v230Backup) {
      button.dataset.v230Backup = '1';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        exportV2();
      }, { capture: true });
    }

    if (input && !input.dataset.v230Backup) {
      input.dataset.v230Backup = '1';
      input.addEventListener('change', (event) => {
        event.stopImmediatePropagation();
        const file = event.target.files?.[0];
        if (file) importV2(file);
        event.target.value = '';
      }, { capture: true });
    }
  }

  function init() {
    bind();
    new MutationObserver(bind).observe(document.body, {
      subtree: true,
      childList: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.__mlBackupV230 = {
    validate,
    migrate,
    snapshot,
    normalizeLegacyBackup
  };
})();
