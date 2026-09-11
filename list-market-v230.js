(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const STORE = 'lists';
  const MAX_MARKET = 160;
  const FIELD_MARKER = 'data-v230-list-market';

  const open = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB);
    request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
    request.onsuccess = () => resolve(request.result);
  });

  const allLists = (db) => new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || Error('Falha na leitura das listas'));
  });

  const putList = (db, list) => new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(list);
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error || Error('Falha ao salvar mercado da lista'));
  });

  const getMarkets = (db) => new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains('referenceMarkets')) {
      resolve([]);
      return;
    }
    const request = db.transaction('referenceMarkets', 'readonly')
      .objectStore('referenceMarkets')
      .getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || Error('Falha ao ler mercados'));
  });

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);

  function marketField(markets, current = '') {
    const options = [
      '<option value="">Sem mercado definido</option>',
      ...markets.map((market) => {
        const name = String(market.name || '').trim();
        return name
          ? `<option value="${esc(name)}"${name === current ? ' selected' : ''}>${esc(name)}</option>`
          : '';
      })
    ].join('');

    return `<div class="field" ${FIELD_MARKER}>
      <label for="v230ListMarket">Mercado da lista</label>
      <select class="select" id="v230ListMarket" name="v230ListMarket">
        ${options}
      </select>
      <div class="hint">Define o mercado principal desta lista. O mercado individual dos itens continua disponível.</div>
    </div>`;
  }

  function findListForm() {
    const body = document.getElementById('modalBody');
    if (!body) return null;

    const forms = [...body.querySelectorAll('form')];
    return forms.find((form) => {
      const text = form.textContent || '';
      return /lista/i.test(text) && !form.querySelector('#itemForm, [name="mainItemId"], [data-action="edit-item"]');
    }) || null;
  }

  async function inject() {
    const form = findListForm();
    if (!form || form.querySelector(`[${FIELD_MARKER}]`)) return;

    const db = await open();
    try {
      const markets = await getMarkets(db);
      let current = '';
      const marker = form.querySelector('[name="id"], [name="listId"], [data-list-id]');
      const listId = marker?.value || marker?.dataset?.listId || '';

      if (listId) {
        const lists = await allLists(db);
        current = lists.find((list) => list.id === listId)?.marketName || '';
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'field full';
      wrapper.innerHTML = marketField(markets, current);
      const field = wrapper.firstElementChild;
      const submit = form.querySelector('button[type="submit"]');
      if (submit) form.insertBefore(wrapper, submit);
      else form.appendChild(wrapper);

      if (field) field.closest('.field')?.removeAttribute('full');
    } finally {
      db.close();
    }
  }

  async function patchChangedList(before, market) {
    const db = await open();
    try {
      const after = await allLists(db);
      const beforeById = new Map(before.map((list) => [list.id, JSON.stringify(list)]));
      const changed = after.filter((list) => beforeById.get(list.id) !== JSON.stringify(list));
      const target = changed.length === 1
        ? changed[0]
        : after.find((list) => !beforeById.has(list.id));

      if (!target) return;

      const value = String(market || '').trim().slice(0, MAX_MARKET);
      if (target.marketName === value) return;

      target.marketName = value;
      target.updatedAt = new Date().toISOString();
      await putList(db, target);
    } finally {
      db.close();
    }
  }

  function wrap(form) {
    if (!form || form.dataset.v230MarketWrapped) return;

    const original = form.onsubmit;
    if (typeof original !== 'function') return;

    form.dataset.v230MarketWrapped = '1';
    form.onsubmit = async (event) => {
      const db = await open();
      let before = [];
      try {
        before = await allLists(db);
      } finally {
        db.close();
      }

      const market = document.getElementById('v230ListMarket')?.value || '';
      await original(event);

      if (form.isConnected) return;
      await patchChangedList(before, market).catch(console.error);
    };
  }

  function scan() {
    inject().catch(console.error);
    const form = findListForm();
    wrap(form);
  }

  function init() {
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
