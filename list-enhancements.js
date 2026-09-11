(() => {
  'use strict';

  const DB = 'MinhaListaDB';

  const open = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });

  const all = (db, store) => new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

  const put = async (db, store, value) => new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readwrite').objectStore(store).put(value);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  const field = (id, label, type = 'text') =>
    `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" name="${id}" type="${type}" ${type === 'number' ? 'min="0" step="any"' : ''}></div>`;

  function inject() {
    const form = document.getElementById('itemForm');
    if (!form || form.querySelector('[data-v230-list-fields]')) return;

    const wrap = document.createElement('div');
    wrap.dataset.v230ListFields = '1';
    wrap.className = 'row stack-mobile';
    wrap.innerHTML =
      field('v230PackageQuantity', 'Conteúdo por embalagem', 'number') +
      field('v230PackageUnit', 'Unidade da embalagem') +
      field('v230ExpiryDate', 'Validade', 'date');

    const submit = form.querySelector('button[type="submit"]');
    if (submit) form.insertBefore(wrap, submit);
    else form.appendChild(wrap);
  }

  const values = () => ({
    packageQuantity: document.getElementById('v230PackageQuantity')?.value ?? '',
    packageUnit: document.getElementById('v230PackageUnit')?.value ?? '',
    expiryDate: document.getElementById('v230ExpiryDate')?.value ?? ''
  });

  async function snapshot() {
    const db = await open();
    try {
      return await all(db, 'lists');
    } finally {
      db.close();
    }
  }

  function num(value) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const number = Number(String(value).replace(',', '.'));
    return Number.isFinite(number) && number >= 0 ? number : null;
  }

  async function patch(before, extra, existingId) {
    const after = await snapshot();
    let target = null;

    if (existingId) {
      for (const list of after) {
        const item = (list.items || []).find((entry) => entry.id === existingId);
        if (item) {
          target = { list, item };
          break;
        }
      }
    } else {
      const beforeIds = new Set(
        before.flatMap((list) => (list.items || []).map((item) => item.id))
      );

      for (const list of after) {
        const item = (list.items || []).find((entry) => !beforeIds.has(entry.id));
        if (item) {
          target = { list, item };
          break;
        }
      }
    }

    if (!target) return;

    const item = target.item;
    const quantity = num(extra.packageQuantity);

    if (extra.packageQuantity !== '' && quantity !== null) {
      item.packageQuantity = quantity;
    } else {
      delete item.packageQuantity;
    }

    if (String(extra.packageUnit).trim()) {
      item.packageUnit = String(extra.packageUnit).trim().slice(0, 60);
    } else {
      delete item.packageUnit;
    }

    if (extra.expiryDate) item.expiryDate = extra.expiryDate;
    else delete item.expiryDate;

    // When the list has its own market, it is the source of truth.
    // Keep legacy list data intact; only clear the item's market after
    // the item is actually saved into a market-scoped list.
    if (String(target.list.marketName || '').trim()) {
      delete item.marketName;
    }

    item.updatedAt = new Date().toISOString();

    const db = await open();
    try {
      await put(db, 'lists', target.list);
    } finally {
      db.close();
    }
  }

  async function wrapForm(form) {
    if (!form || form.dataset.v230Wrapped) return;

    const original = form.onsubmit;
    if (typeof original !== 'function') return;

    form.dataset.v230Wrapped = '1';
    form.onsubmit = async (event) => {
      const before = await snapshot().catch(() => []);
      const existingId = form.dataset.v230ExistingId || '';
      const extra = values();

      await original(event);
      if (form.isConnected) return;

      await patch(before, extra, existingId).catch(console.error);
    };
  }

  async function markEdit(listId, index) {
    const db = await open();

    try {
      const list = await new Promise((resolve, reject) => {
        const request = db.transaction('lists', 'readonly').objectStore('lists').get(listId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const item = list?.items?.[Number(index)];
      const form = document.getElementById('itemForm');
      if (!item || !form) return;

      form.dataset.v230ExistingId = item.id;

      const quantity = document.getElementById('v230PackageQuantity');
      const unit = document.getElementById('v230PackageUnit');
      const expiry = document.getElementById('v230ExpiryDate');

      if (quantity) quantity.value = item.packageQuantity ?? '';
      if (unit) unit.value = item.packageUnit ?? '';
      if (expiry) expiry.value = item.expiryDate ?? '';

      await wrapForm(form);
    } finally {
      db.close();
    }
  }

  function init() {
    const scan = () => {
      inject();
      wrapForm(document.getElementById('itemForm'));
    };

    scan();

    const observer = new MutationObserver(() => scan());
    observer.observe(document.body, { subtree: true, childList: true });

    document.addEventListener('click', (event) => {
      const element = event.target.closest('[data-action="edit-item"]');
      if (element) {
        Promise.resolve()
          .then(() => markEdit(element.dataset.list, element.dataset.index))
          .catch(console.error);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
