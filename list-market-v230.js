(() => {
  'use strict';

  // V2.3.0 — Mercado pertence à LISTA, não aos itens.
  const DB = 'MinhaListaDB';
  const STORE = 'lists';
  const MARKET_STORE = 'referenceMarkets';
  const FIELD_ID = 'v230ListMarket';
  const FIELD_MARKER = 'data-v230-list-market';
  const MAX_MARKET = 160;
  const snapshots = new WeakMap();

  const esc = (value) => String(value ?? '').replace(/[&<>\"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
  })[char]);

  const open = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB);
    request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
    request.onsuccess = () => resolve(request.result);
  });

  const readAll = (db, store) => new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(store)) return resolve([]);
    const request = db.transaction(store, 'readonly').objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || Error(`Falha ao ler ${store}`));
  });

  const putList = (db, list) => new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(list);
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error || Error('Falha ao salvar mercado da lista'));
  });

  async function snapshotLists() {
    const db = await open();
    try { return await readAll(db, STORE); } finally { db.close(); }
  }

  function listForm() {
    return document.getElementById('modalBody')?.querySelector('#listForm') || null;
  }

  function marketField(markets, current) {
    const names = [...new Set(markets.map((market) => String(market?.name || '').trim()).filter(Boolean))];
    return `<div class="field" ${FIELD_MARKER} style="margin-top:9px">
      <label for="${FIELD_ID}">Mercado da lista</label>
      <select id="${FIELD_ID}" name="marketName" class="select">
        <option value="">Sem mercado definido</option>
        ${names.map((name) => `<option value="${esc(name)}"${name === current ? ' selected' : ''}>${esc(name)}</option>`).join('')}
      </select>
      <div class="hint">O mercado será exibido na lista e será o mercado principal de todos os produtos dela.</div>
    </div>`;
  }

  async function inject() {
    const form = listForm();
    if (!form || form.querySelector(`[${FIELD_MARKER}]`)) return;
    const db = await open();
    try {
      const [markets, lists] = await Promise.all([readAll(db, MARKET_STORE), readAll(db, STORE)]);
      const idField = form.querySelector('[name="id"], [name="listId"], [data-list-id]');
      const listId = idField?.value || idField?.dataset?.listId || '';
      const name = document.getElementById('lfName')?.value?.trim() || '';
      const date = document.getElementById('lfDate')?.value || '';
      const matching = lists
        .filter((list) => (!listId || list.id === listId) && (!name || list.name === name) && (!date || (list.date || '') === date))
        .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
      const current = matching[0]?.marketName || '';

      const holder = document.createElement('div');
      holder.innerHTML = marketField(markets, current);
      const field = holder.firstElementChild;
      const commentsField = document.getElementById('lfComments')?.closest('.field');
      if (commentsField) commentsField.before(field);
      else form.appendChild(field);
    } finally {
      db.close();
    }
  }

  async function saveMarket(listId, market) {
    if (!listId) return null;
    const value = String(market || '').trim().slice(0, MAX_MARKET);
    const db = await open();
    try {
      const lists = await readAll(db, STORE);
      const current = lists.find((list) => list.id === listId);
      if (!current) return null;
      const next = { ...current, marketName: value, updatedAt: new Date().toISOString() };
      if (value && Array.isArray(next.items)) {
        next.items = next.items.map((item) => {
          const clean = { ...item };
          delete clean.marketName;
          return clean;
        });
      }
      await putList(db, next);
      return next;
    } finally {
      db.close();
    }
  }

  async function persistSubmittedList(form) {
    const before = snapshots.get(form) || [];
    const market = document.getElementById(FIELD_ID)?.value || '';
    const name = document.getElementById('lfName')?.value?.trim() || '';
    const date = document.getElementById('lfDate')?.value || '';

    for (let attempt = 0; attempt < 8; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 120 : 160));
      const after = await snapshotLists();
      const beforeMap = new Map(before.map((list) => [list.id, JSON.stringify(list)]));
      const changed = after.filter((list) => beforeMap.get(list.id) !== JSON.stringify(list));
      const created = after.filter((list) => !beforeMap.has(list.id));
      const candidates = [...created, ...changed]
        .filter((list) => !name || list.name === name)
        .filter((list) => !date || (list.date || '') === date);
      const target = candidates.sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')))[0];
      if (target) return saveMarket(target.id, market);
    }
    return null;
  }

  async function bind(form) {
    if (!form || form.dataset.v230MarketBound === '1') return;
    form.dataset.v230MarketBound = '1';
    try { snapshots.set(form, await snapshotLists()); } catch (error) { console.error(error); }

    form.addEventListener('submit', async () => {
      try {
        const target = await persistSubmittedList(form);
        if (target) setTimeout(() => window.location.reload(), 50);
      } catch (error) {
        console.error('Mercado da lista:', error);
      }
    });
  }

  async function decorateListCards() {
    const container = document.getElementById('listsCards');
    if (!container) return;
    const buttons = [...container.querySelectorAll('[data-action="open-list"]')];
    if (!buttons.length) return;
    const db = await open();
    try {
      const lists = await readAll(db, STORE);
      const byId = new Map(lists.map((list) => [list.id, list]));
      for (const button of buttons) {
        const list = byId.get(button.dataset.id);
        if (!list?.marketName) continue;
        const card = button.closest('.card');
        const title = card?.querySelector('.card-title');
        if (!card || !title || card.querySelector('[data-v230-list-market-badge]')) continue;
        const badge = document.createElement('div');
        badge.className = 'meta';
        badge.dataset.v230ListMarketBadge = '1';
        badge.textContent = `🏪 ${list.marketName}`;
        title.insertAdjacentElement('afterend', badge);
      }
    } finally {
      db.close();
    }
  }

  function scan() {
    const form = listForm();
    if (form) inject().then(() => bind(form)).catch(console.error);
    decorateListCards().catch(console.error);
  }

  function init() {
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('#newListBtn, [data-action="edit-list"]');
      if (!trigger) return;
      setTimeout(scan, 0);
      setTimeout(scan, 100);
      setTimeout(scan, 300);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
