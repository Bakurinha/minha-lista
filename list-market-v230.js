(() => {
  'use strict';

  // V2.3.0 — Mercado pertence à LISTA, não aos itens.
  // Este módulo é deliberadamente independente do app.js para preservar
  // compatibilidade com listas antigas e evitar alterações destrutivas.
  const DB = 'MinhaListaDB';
  const STORE = 'lists';
  const MARKET_STORE = 'referenceMarkets';
  const FIELD_ID = 'v230ListMarket';
  const FIELD_MARKER = 'data-v230-list-market';
  const MAX_MARKET = 160;

  const esc = (value) => String(value ?? '').replace(/[&<>\"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;',
    "'": '&#39;'
  })[char]);

  const open = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB);
    request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
    request.onsuccess = () => resolve(request.result);
  });

  const readAll = (db, store) => new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(store)) {
      resolve([]);
      return;
    }
    const request = db.transaction(store, 'readonly').objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || Error(`Falha ao ler ${store}`));
  });

  const putList = (db, list) => new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(list);
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error || Error('Falha ao salvar mercado da lista'));
  });

  function listForm() {
    const body = document.getElementById('modalBody');
    return body?.querySelector('#listForm') || null;
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
    if (!form || form.querySelector(`[${FIELD_MARKER}]`)) return false;

    const db = await open();
    try {
      const [markets, lists] = await Promise.all([
        readAll(db, MARKET_STORE),
        readAll(db, STORE)
      ]);
      const idField = form.querySelector('[name="id"], [name="listId"], [data-list-id]');
      const listId = idField?.value || idField?.dataset?.listId || '';
      const current = lists.find((list) => list.id === listId)?.marketName || '';

      const holder = document.createElement('div');
      holder.innerHTML = marketField(markets, current);
      const field = holder.firstElementChild;
      const comments = form.querySelector('#lfComments');
      const commentsField = comments?.closest('.field');
      if (commentsField) commentsField.before(field);
      else form.appendChild(field);
      return true;
    } finally {
      db.close();
    }
  }

  async function normalizeListMarket(listId, market) {
    if (!listId) return;
    const value = String(market || '').trim().slice(0, MAX_MARKET);
    const db = await open();
    try {
      const lists = await readAll(db, STORE);
      const current = lists.find((list) => list.id === listId);
      if (!current) return;

      const next = { ...current, marketName: value };
      if (value && Array.isArray(next.items)) {
        // Regra V2.3.0: mercado da lista substitui mercado individual dos itens.
        next.items = next.items.map((item) => {
          const clean = { ...item };
          delete clean.marketName;
          return clean;
        });
      }
      next.updatedAt = new Date().toISOString();
      await putList(db, next);
    } finally {
      db.close();
    }
  }

  function refreshListUI(listId) {
    // app.js mantém currentListId/renderListModal em seu próprio escopo.
    // Um reload é usado apenas como fallback visual; os dados já estão salvos.
    if (listId && document.getElementById('modal')?.classList.contains('show')) {
      setTimeout(() => window.location.reload(), 0);
    } else {
      window.location.reload();
    }
  }

  function bind(form) {
    if (!form || form.dataset.v230MarketBound === '1') return;
    form.dataset.v230MarketBound = '1';

    // O app.js instala o onsubmit depois que abre o modal. Portanto usamos
    // um listener de submit + atraso curto para deixar o salvamento nativo
    // terminar antes de normalizar o campo no mesmo registro da lista.
    form.addEventListener('submit', () => {
      const market = document.getElementById(FIELD_ID)?.value || '';
      setTimeout(async () => {
        try {
          const db = await open();
          const lists = await readAll(db, STORE);
          db.close();
          const name = document.getElementById('lfName')?.value?.trim() || '';
          const date = document.getElementById('lfDate')?.value || '';
          const target = lists
            .filter((list) => list.name === name && (list.date || '') === date)
            .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')))[0];
          if (!target) return;
          await normalizeListMarket(target.id, market);
          refreshListUI(target.id);
        } catch (error) {
          console.error('Mercado da lista:', error);
        }
      }, 350);
    });
  }

  function scan() {
    inject().then(() => bind(listForm())).catch(console.error);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
