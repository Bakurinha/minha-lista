(() => {
  'use strict';

  // V2.3.0 — Mercado pertence à LISTA, sem apagar dados legados dos itens.
  const DB = 'MinhaListaDB';
  const STORE = 'lists';
  const MARKET_STORE = 'referenceMarkets';
  const FIELD_ID = 'v230ListMarket';
  const FIELD_MARKER = 'data-v230-list-market';
  const HYDRATED_MARKER = 'data-v230-list-market-hydrated';
  const MAX_MARKET = 160;
  const FALLBACK_MARKETS = [
    'Atakarejo',
    'Atacadão',
    'Assaí Atacadista',
    'Hiperideal',
    'RedeMix',
    'Mercantil Rodrigues',
    'Mix Bahia',
    'Novo Mix',
    'Mix Mateus',
    'GBarbosa',
    'Carrefour',
    "Sam's Club",
    'Centro Sul',
    'Mercantil de Brotas',
    'Mercado Popular',
    'Mercado Central',
    'Mercado da Sete Portas',
    'Mercado do Bairro',
  ];
  const snapshots = new WeakMap();
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>\"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[char]
    );
  const open = () =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(DB);
      request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
      request.onsuccess = () => resolve(request.result);
    });
  const readAll = (db, store) =>
    new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(store)) return resolve([]);
      const request = db.transaction(store, 'readonly').objectStore(store).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || Error(`Falha ao ler ${store}`));
    });
  const putList = (db, list) =>
    new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(list);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error || Error('Falha ao salvar mercado da lista'));
    });
  async function snapshotLists() {
    const db = await open();
    try {
      return await readAll(db, STORE);
    } finally {
      db.close();
    }
  }
  function listForm() {
    return document.getElementById('modalBody')?.querySelector('#listForm') || null;
  }
  function marketField(names, current) {
    const unique = [...new Set(names.map((name) => String(name || '').trim()).filter(Boolean))];
    return `<div class="field" ${FIELD_MARKER} style="margin-top:9px"><label for="${FIELD_ID}">Mercado da lista</label><select id="${FIELD_ID}" name="marketName" class="select"><option value="">Sem mercado definido</option>${unique.map((name) => `<option value="${esc(name)}"${name === current ? ' selected' : ''}>${esc(name)}</option>`).join('')}</select><div class="hint">O mercado será exibido na lista e ficará associado a ela.</div></div>`;
  }
  function insertMarketField(form) {
    if (!form || form.querySelector(`[${FIELD_MARKER}]`)) return;
    const holder = document.createElement('div');
    holder.innerHTML = marketField(FALLBACK_MARKETS, '');
    const field = holder.firstElementChild;
    const commentsField = document.getElementById('lfComments')?.closest('.field');
    if (commentsField) commentsField.before(field);
    else form.appendChild(field);
  }
  async function hydrateMarketField(form) {
    const field = form?.querySelector(`[${FIELD_MARKER}]`);
    if (!field || field.hasAttribute(HYDRATED_MARKER)) return;
    const select = field.querySelector(`#${FIELD_ID}`);
    if (!select) return;
    try {
      const db = await open();
      try {
        const [markets, lists] = await Promise.all([readAll(db, MARKET_STORE), readAll(db, STORE)]);
        const idField = form.querySelector('[name="id"], [name="listId"], [data-list-id]');
        const listId = idField?.value || idField?.dataset?.listId || '';
        const name = document.getElementById('lfName')?.value?.trim() || '';
        const date = document.getElementById('lfDate')?.value || '';
        const matching = lists
          .filter(
            (list) =>
              (!listId || list.id === listId) &&
              (!name || list.name === name) &&
              (!date || (list.date || '') === date)
          )
          .sort((a, b) =>
            String(b.updatedAt || b.createdAt || '').localeCompare(
              String(a.updatedAt || a.createdAt || '')
            )
          );
        const current = matching[0]?.marketName || '';
        const names = [
          ...markets.map((market) => market?.name),
          ...FALLBACK_MARKETS,
          ...(current ? [current] : []),
        ];
        const unique = [
          ...new Set(names.map((value) => String(value || '').trim()).filter(Boolean)),
        ];
        select.innerHTML = `<option value="">Sem mercado definido</option>${unique.map((nameValue) => `<option value="${esc(nameValue)}"${nameValue === current ? ' selected' : ''}>${esc(nameValue)}</option>`).join('')}`;
        select.value = current || '';
        field.setAttribute(HYDRATED_MARKER, '1');
      } finally {
        db.close();
      }
    } catch (error) {
      console.error('Mercado da lista: falha ao carregar referências.', error);
    }
  }
  async function saveMarket(listId, market) {
    if (!listId) return null;
    const value = String(market || '')
      .trim()
      .slice(0, MAX_MARKET);
    const db = await open();
    try {
      const lists = await readAll(db, STORE);
      const current = lists.find((list) => list.id === listId);
      if (!current) return null;
      const next = { ...current, marketName: value, updatedAt: new Date().toISOString() };
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
      const target = candidates.sort((a, b) =>
        String(b.updatedAt || b.createdAt || '').localeCompare(
          String(a.updatedAt || a.createdAt || '')
        )
      )[0];
      if (target) return saveMarket(target.id, market);
    }
    return null;
  }
  async function bind(form) {
    if (!form || form.dataset.v230MarketBound === '1') return;
    form.dataset.v230MarketBound = '1';
    try {
      snapshots.set(form, await snapshotLists());
    } catch (error) {
      console.error(error);
    }
    form.addEventListener('submit', async (event) => {
      if (event.target !== form) return;
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
    if (form) {
      insertMarketField(form);
      hydrateMarketField(form).catch(console.error);
      bind(form);
    }
    decorateListCards().catch(console.error);
  }
  function ensureIntegrityDiagnostics() {
    if (window.__mlDbIntegrityV230 || document.querySelector('script[data-v230-integrity]')) return;
    const script = document.createElement('script');
    script.src = './db-integrity-v230.js';
    script.async = false;
    script.dataset.v230Integrity = '1';
    document.head.appendChild(script);
  }
  function init() {
    ensureIntegrityDiagnostics();
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('#newListBtn, [data-action="edit-list"]');
      if (!trigger) return;
      setTimeout(scan, 0);
      setTimeout(scan, 50);
      setTimeout(scan, 150);
      setTimeout(scan, 300);
    });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

// V2.3.x — Centraliza o mercado dos itens no mercado da LISTA sem reescrever dados legados.
(() => {
  'use strict';

  const ITEM_FORM_ID = 'itemForm';
  const ITEM_MARKET_ID = 'ifMarket';
  const ACTIVE_LIST_KEY = '__mlV230ActiveListId';
  const MARKET_HIDDEN_MARKER = 'data-v230-item-market-hidden';

  function rememberListId(trigger) {
    const id = trigger?.dataset?.list || trigger?.dataset?.id || trigger?.closest?.('[data-list]')?.dataset?.list;
    if (id) window[ACTIVE_LIST_KEY] = id;
  }

  function inferActiveListId() {
    if (window[ACTIVE_LIST_KEY]) return String(window[ACTIVE_LIST_KEY]);
    const rendered = document.querySelector('#listItems [data-list]');
    if (rendered?.dataset?.list) return String(rendered.dataset.list);
    return '';
  }

  async function getListMarket(listId) {
    if (!listId) return '';
    const db = await open();
    try {
      const lists = await readAll(db, STORE);
      return String(lists.find((list) => list.id === listId)?.marketName || '').trim();
    } finally {
      db.close();
    }
  }

  function hideItemMarketField(form) {
    const input = form?.querySelector(`#${ITEM_MARKET_ID}`);
    if (!input || input.closest(`[${MARKET_HIDDEN_MARKER}]`)) return;
    const field = input.closest('.field');
    if (!field) return;
    field.setAttribute(MARKET_HIDDEN_MARKER, '1');
    field.classList.add('hidden');
    input.setAttribute('aria-hidden', 'true');
    input.tabIndex = -1;
    input.readOnly = true;
  }

  async function syncItemMarket(form) {
    const input = form?.querySelector(`#${ITEM_MARKET_ID}`);
    if (!input) return;
    const listId = inferActiveListId();
    if (!listId) return;
    try {
      const market = await getListMarket(listId);
      input.value = market;
      hideItemMarketField(form);
      form.dataset.v230ItemMarketListId = listId;
      form.dataset.v230ItemMarketSynced = '1';
    } catch (error) {
      console.error('Mercado do item: falha ao sincronizar com a lista.', error);
    }
  }

  function stripRenderedItemMarkets() {
    const container = document.getElementById('listItems');
    if (!container) return;
    const listMarket = String(window.__mlV230RenderedListMarket || '').trim();
    if (!listMarket) return;
    const suffix = ` • ${listMarket}`;
    container.querySelectorAll('.item-meta').forEach((node) => {
      const text = String(node.textContent || '');
      if (!text.includes(suffix)) return;
      node.textContent = text.replace(suffix, '');
    });
  }

  async function cacheRenderedListMarket() {
    const listId = inferActiveListId();
    if (!listId) return;
    try {
      window.__mlV230RenderedListMarket = await getListMarket(listId);
      stripRenderedItemMarkets();
    } catch (error) {
      console.error('Mercado da lista: falha ao preparar visualização.', error);
    }
  }

  function observeItemForm() {
    const form = document.getElementById(ITEM_FORM_ID);
    if (!form) return;
    hideItemMarketField(form);
    syncItemMarket(form).catch(console.error);
    if (form.dataset.v230MarketSubmitBound === '1') return;
    form.dataset.v230MarketSubmitBound = '1';
    form.addEventListener(
      'submit',
      () => {
        const input = form.querySelector(`#${ITEM_MARKET_ID}`);
        if (!input) return;
        // O núcleo legado ainda lê ifMarket; mantemos o campo somente como valor técnico.
        syncItemMarket(form).catch(console.error);
      },
      true
    );
  }

  function initCentralization() {
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest?.('[data-list], [data-action="open-list"], [data-action="add-item"], [data-action="edit-item"]');
      if (!trigger) return;
      rememberListId(trigger);
      setTimeout(() => {
        cacheRenderedListMarket().catch(console.error);
        observeItemForm();
      }, 0);
      setTimeout(() => observeItemForm(), 60);
    });

    const observer = new MutationObserver(() => {
      observeItemForm();
      stripRenderedItemMarkets();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    observeItemForm();
    cacheRenderedListMarket().catch(console.error);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initCentralization, { once: true });
  else initCentralization();
})();

// Bootstrap V2.3.0: camada global de ícones vem antes dos módulos que geram conteúdo dinâmico.
(() => {
  'use strict';
  const MODULES = [
    './v3-icons.js',
    './v3-icon-force.js',
    './share-config.js',
    './backup-v230.js',
    './share-optimized-v230.js',
    './enhancements.js',
    './inventory.js',
    './reference-market-refresh.js',
    './list-enhancements.js',
    './etapa2-keep-list.js',
    './db-integrity-v230.js',
    './version-v230.js',
    './v3-shell.js',
  ];
  function loadSequentially(index = 0) {
    if (index >= MODULES.length) return registerServiceWorker();
    const src = MODULES[index];
    if (document.querySelector(`script[data-v230-runtime="${src}"]`))
      return loadSequentially(index + 1);
    const script = document.createElement('script');
    script.src = src;
    script.dataset.v230Runtime = src;
    script.onload = () => loadSequentially(index + 1);
    script.onerror = () => console.error(`V2.3.0: falha ao carregar ${src}`);
    document.head.appendChild(script);
  }
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .catch((error) => console.error('Service Worker: registro indisponível.', error));
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', () => loadSequentially(), { once: true });
  else loadSequentially();
})();
