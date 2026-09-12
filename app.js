(() => {
  'use strict';
  const DB_NAME = 'MinhaListaDB',
    DB_VERSION = 6,
    OLD_KEY = 'lista_supermercado_v1',
    BACKUP_VERSION = 1,
    SHARED_FORMAT = 'shared-list-v1',
    REFERENCE_VERSION = 1;
  const STORES = ['catalogs', 'lists', 'history', 'wishlist', 'trash', 'settings'];
  const REFERENCE_STORES = ['referenceProducts', 'referenceMarkets'];
  const ALL_STORES = [...STORES, ...REFERENCE_STORES];
  const REFERENCE_PRODUCTS = [
    ['Arroz', 'Tio João', '5 kg', 'Alimentos'],
    ['Arroz', 'Camil', '5 kg', 'Alimentos'],
    ['Feijão carioca', 'Kicaldo', '1 kg', 'Alimentos'],
    ['Feijão carioca', 'Camil', '1 kg', 'Alimentos'],
    ['Açúcar refinado', 'União', '1 kg', 'Alimentos'],
    ['Café', 'Pilão', '500 g', 'Bebidas'],
    ['Café', '3 Corações', '500 g', 'Bebidas'],
    ['Leite integral', 'Leitíssimo', '1 L', 'Laticínios'],
    ['Leite integral', 'Piracanjuba', '1 L', 'Laticínios'],
    ['Margarina', 'Qualy', '500 g', 'Laticínios'],
    ['Óleo de soja', 'Liza', '900 ml', 'Alimentos'],
    ['Macarrão espaguete', 'Adria', '500 g', 'Alimentos'],
    ['Molho de tomate', 'Pomarola', '300 g', 'Alimentos'],
    ['Milho verde', 'Quero', '170 g', 'Alimentos'],
    ['Ervilha', 'Quero', '170 g', 'Alimentos'],
    ['Farinha de trigo', 'Dona Benta', '1 kg', 'Alimentos'],
    ['Farinha de mandioca', 'Yoki', '500 g', 'Alimentos'],
    ['Sal refinado', 'Cisne', '1 kg', 'Alimentos'],
    ['Aveia em flocos', 'Quaker', '170 g', 'Alimentos'],
    ['Achocolatado', 'Nescau', '370 g', 'Alimentos'],
    ['Biscoito cream cracker', 'Vitarella', '350 g', 'Alimentos'],
    ['Biscoito recheado', 'Oreo', '90 g', 'Alimentos'],
    ['Pão de forma', 'Wickbold', '500 g', 'Padaria'],
    ['Pão francês', 'Genérico', '1 kg', 'Padaria'],
    ['Ovos', 'Mantiqueira', '12 un', 'Alimentos'],
    ['Queijo muçarela', 'Vigor', '150 g', 'Laticínios'],
    ['Presunto', 'Sadia', '200 g', 'Alimentos'],
    ['Iogurte natural', 'Nestlé', '170 g', 'Laticínios'],
    ['Requeijão', 'Catupiry', '200 g', 'Laticínios'],
    ['Manteiga', 'Aviação', '200 g', 'Laticínios'],
    ['Água mineral', 'Indaiá', '1,5 L', 'Bebidas'],
    ['Refrigerante cola', 'Coca-Cola', '2 L', 'Bebidas'],
    ['Refrigerante guaraná', 'Antarctica', '2 L', 'Bebidas'],
    ['Suco de uva', 'Aurora', '1 L', 'Bebidas'],
    ['Cerveja sem álcool', 'Heineken 0.0', '330 ml', 'Bebidas'],
    ['Peito de frango', 'Sadia', '1 kg', 'Carnes'],
    ['Carne moída', 'Friboi', '1 kg', 'Carnes'],
    ['Acém', 'Friboi', '1 kg', 'Carnes'],
    ['Linguiça', 'Sadia', '1 kg', 'Carnes'],
    ['Filé de peixe', 'Copacol', '500 g', 'Carnes'],
    ['Batata', 'Genérico', '1 kg', 'Hortifruti'],
    ['Cebola', 'Genérico', '1 kg', 'Hortifruti'],
    ['Tomate', 'Genérico', '1 kg', 'Hortifruti'],
    ['Banana prata', 'Genérico', '1 kg', 'Hortifruti'],
    ['Maçã', 'Genérico', '1 kg', 'Hortifruti'],
    ['Laranja', 'Genérico', '1 kg', 'Hortifruti'],
    ['Alface', 'Genérico', '1 un', 'Hortifruti'],
    ['Cenoura', 'Genérico', '1 kg', 'Hortifruti'],
    ['Brócolis', 'Genérico', '1 un', 'Hortifruti'],
    ['Batata congelada', 'Sadia', '1 kg', 'Congelados'],
    ['Pizza congelada', 'Sadia', '460 g', 'Congelados'],
    ['Hambúrguer', 'Sadia', '672 g', 'Congelados'],
    ['Detergente líquido', 'Ypê', '500 ml', 'Limpeza'],
    ['Sabão em pó', 'Omo', '1,6 kg', 'Limpeza'],
    ['Amaciante', 'Comfort', '1,5 L', 'Limpeza'],
    ['Água sanitária', 'Qboa', '1 L', 'Limpeza'],
    ['Desinfetante', 'Veja', '500 ml', 'Limpeza'],
    ['Limpador multiuso', 'Veja', '500 ml', 'Limpeza'],
    ['Esponja de limpeza', 'Bombril', '3 un', 'Limpeza'],
    ['Papel toalha', 'Snob', '2 rolos', 'Limpeza'],
    ['Papel higiênico', 'Personal', '12 rolos', 'Limpeza'],
    ['Sabonete', 'Dove', '90 g', 'Higiene'],
    ['Shampoo', 'Pantene', '350 ml', 'Higiene'],
    ['Condicionador', 'Pantene', '175 ml', 'Higiene'],
    ['Creme dental', 'Colgate', '90 g', 'Higiene'],
    ['Escova de dentes', 'Colgate', '1 un', 'Higiene'],
    ['Desodorante', 'Rexona', '150 ml', 'Higiene'],
    ['Fralda descartável', 'Huggies', 'XXG 32 un', 'Higiene'],
    ['Ração para cães', 'Pedigree', '10,1 kg', 'Outros'],
    ['Ração para gatos', 'Whiskas', '10,1 kg', 'Outros'],
    ['Areia para gatos', 'Pipicat', '4 kg', 'Outros'],
    ['Guardanapo', 'Snob', '50 un', 'Outros'],
    ['Papel alumínio', 'Wyda', '30 m', 'Outros'],
    ['Filme plástico', 'Wyda', '15 m', 'Outros'],
    ['Leite condensado', 'Moça', '395 g', 'Alimentos'],
    ['Creme de leite', 'Nestlé', '200 g', 'Laticínios'],
    ['Maionese', 'Hellmanns', '500 g', 'Alimentos'],
    ['Ketchup', 'Heinz', '397 g', 'Alimentos'],
    ['Mostarda', 'Heinz', '255 g', 'Alimentos'],
    ['Extrato de tomate', 'Elefante', '340 g', 'Alimentos'],
    ['Temperos', 'Kitano', '50 g', 'Alimentos'],
  ].map(([name, brand, unit, category, ean], i) => ({
    id: `ref-p-${i + 1}`,
    name,
    brand,
    unit,
    category,
    ean: ean || '',
  }));
  const REFERENCE_MARKETS = [
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
  ].map((name, i) => ({ id: `ref-m-${i + 1}`, name }));
  let db = null,
    catalogs = [],
    lists = [],
    history = [],
    wishlist = [],
    trash = [],
    settings = {},
    referenceProducts = [],
    referenceMarkets = [];
  let currentListId = null,
    modalPreviousFocus = null,
    modalReturnListId = null,
    undoTimer = null,
    undoAction = null,
    lastListSearch = '',
    listState = {
      q: '',
      filter: 'all',
      category: '',
      market: '',
      minPrice: '',
      maxPrice: '',
      date: '',
      sort: 'default',
    };
  const $ = (id) => document.getElementById(id);
  const nowISO = () => new Date().toISOString();
  const uid = () =>
    crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const localToday = () => {
    const d = new Date(),
      p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const esc = (s) =>
    String(s ?? '').replace(
      /[&<>'"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]
    );
  const normalize = (s) =>
    String(s ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');
  const finitePositive = (v, max = 1000000) => {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) && n > 0 && n <= max ? n : null;
  };
  const finiteNonNegative = (v, max = 1000000000) => {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
    return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
  };
  function parseMoney(v) {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    let s = String(v).trim().replace(/R\$/gi, '').replace(/\s/g, '');
    if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 && n <= 1000000000 ? n : null;
  }
  function money(v) {
    const n = Number(v);
    return Number.isFinite(n)
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
      : '—';
  }
  function formatDate(s) {
    if (!s) return '—';
    const p = String(s).split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : String(s);
  }
  function dateSortValue(s) {
    return s ? String(s) : '0000-00-00';
  }
  function safeFileName(s) {
    return (
      normalize(s)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'lista'
    );
  }
  function notify(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 2800);
  }
  function confirmText(msg) {
    return window.confirm(msg);
  }
  function showError(
    err,
    msg = 'Não foi possível concluir a operação. Seus dados anteriores foram preservados.'
  ) {
    console.error(err);
    notify(msg);
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, DB_VERSION);
      r.onupgradeneeded = () => {
        const d = r.result;
        for (const s of ALL_STORES)
          if (!d.objectStoreNames.contains(s))
            d.createObjectStore(s, { keyPath: s === 'settings' ? 'key' : 'id' });
        if (!d.objectStoreNames.contains('inventory'))
          d.createObjectStore('inventory', { keyPath: 'id' });
      };
      r.onsuccess = () => {
        db = r.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      r.onerror = () => reject(r.error || new Error('IndexedDB indisponível'));
      r.onblocked = () => notify('Feche outra aba do aplicativo para concluir a atualização.');
    });
  }
  function transaction(stores, mode, work) {
    return new Promise((resolve, reject) => {
      let tx;
      try {
        tx = db.transaction(stores, mode);
      } catch (e) {
        reject(e);
        return;
      }
      let result;
      let settled = false;
      tx.oncomplete = () => {
        settled = true;
        resolve(result);
      };
      tx.onerror = () => {
        if (!settled) reject(tx.error || new Error('Falha na transação IndexedDB'));
      };
      tx.onabort = () => {
        if (!settled) reject(tx.error || new Error('Transação cancelada'));
      };
      try {
        result = work(tx);
      } catch (e) {
        try {
          tx.abort();
        } catch {}
        reject(e);
      }
    });
  }
  const getAll = (s) =>
    transaction(
      [s],
      'readonly',
      (tx) =>
        new Promise((resolve, reject) => {
          const r = tx.objectStore(s).getAll();
          r.onsuccess = () => resolve(r.result || []);
          r.onerror = () => reject(r.error);
        })
    );
  function replaceAll(data) {
    return transaction(STORES, 'readwrite', (tx) => {
      for (const s of STORES) tx.objectStore(s).clear();
      for (const c of data.catalogs) tx.objectStore('catalogs').put(c);
      for (const l of data.lists) tx.objectStore('lists').put(l);
      for (const h of data.history) tx.objectStore('history').put(h);
      for (const w of data.wishlist) tx.objectStore('wishlist').put(w);
      for (const t of data.trash) tx.objectStore('trash').put(t);
      for (const [key, value] of Object.entries(data.settings || {})) {
        if (key !== 'referenceDataVersion') tx.objectStore('settings').put({ key, value });
      }
      tx.objectStore('settings').put({ key: 'referenceDataVersion', value: REFERENCE_VERSION });
    });
  }
  function writeStores(stores, fn) {
    return transaction(stores, 'readwrite', fn);
  }
  function catalogIdentity(c) {
    return `${normalize(c.name)}|${normalize(c.brand)}|${normalize(c.unit)}`;
  }
  function catalogById(id) {
    return catalogs.find((c) => c.id === id);
  }
  function catalogName(id) {
    return catalogById(id)?.name || 'Produto removido';
  }
  function catalogDisplay(c) {
    return `${c.name}${c.brand ? ` — ${c.brand}` : ''}${c.unit ? ` • ${c.unit}` : ''}`;
  }
  function normalizeEan(v) {
    return String(v ?? '')
      .replace(/\D/g, '')
      .slice(0, 14);
  }
  function validEan(v) {
    const e = normalizeEan(v);
    return e === '' || /^(?:\d{8}|\d{12,14})$/.test(e);
  }
  function getMarketNames() {
    return [
      ...new Set(
        referenceMarkets
          .map((m) => m.name)
          .concat(
            history.map((h) => String(h.marketName || '').trim()),
            lists.flatMap((l) => (l.items || []).map((i) => String(i.marketName || '').trim()))
          )
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  async function seedReferenceData() {
    const current = await getAll('settings');
    const installed = current.find((x) => x.key === 'referenceDataVersion')?.value || 0;
    if (installed === REFERENCE_VERSION) return;
    await transaction(['referenceProducts', 'referenceMarkets', 'settings'], 'readwrite', (tx) => {
      const p = tx.objectStore('referenceProducts'),
        m = tx.objectStore('referenceMarkets');
      p.clear();
      m.clear();
      for (const x of REFERENCE_PRODUCTS) p.put(x);
      for (const x of REFERENCE_MARKETS) m.put(x);
      tx.objectStore('settings').put({ key: 'referenceDataVersion', value: REFERENCE_VERSION });
    });
  }
  function productSnapshot(c) {
    return {
      productName: c?.name || '',
      productBrand: c?.brand || '',
      productUnit: c?.unit || 'un',
      productCategory: c?.category || 'Outros',
    };
  }
  function itemDisplayData(i) {
    const c = catalogById(i.mainItemId);
    return {
      name: i.productName ?? c?.name ?? 'Produto removido',
      brand: i.productBrand ?? c?.brand ?? '',
      unit: i.productUnit ?? c?.unit ?? 'un',
      category: i.productCategory ?? c?.category ?? 'Outros',
    };
  }
  async function ensureItemSnapshots() {
    let changed = false;
    const next = lists.map((l) => {
      let listChanged = false;
      const items = (l.items || []).map((i) => {
        const d = itemDisplayData(i);
        if (
          i.productName === undefined ||
          i.productBrand === undefined ||
          i.productUnit === undefined ||
          i.productCategory === undefined
        ) {
          listChanged = true;
          changed = true;
          return { ...i, ...productSnapshot(catalogById(i.mainItemId)) };
        }
        return i;
      });
      return listChanged ? { ...l, items } : l;
    });
    if (changed) {
      await writeStores(['lists'], (tx) => {
        const st = tx.objectStore('lists');
        for (const l of next) if (l !== lists.find((x) => x.id === l.id)) st.put(l);
      });
      lists = next;
    }
  }
  async function referenceProductsAll() {
    return getAll('referenceProducts');
  }
  async function referenceMarketsAll() {
    return getAll('referenceMarkets');
  }
  function referenceProductMatches(q) {
    const n = normalize(q);
    return referenceProducts
      .filter((x) => !n || normalize(`${x.name} ${x.brand} ${x.unit} ${x.category}`).includes(n))
      .slice(0, 80);
  }
  async function addReferenceProductToCatalog(refId) {
    const r = referenceProducts.find((x) => x.id === refId);
    if (!r) return null;
    const existing = catalogs.find(
      (c) =>
        catalogIdentity(c) === `${normalize(r.name)}|${normalize(r.brand)}|${normalize(r.unit)}`
    );
    if (existing) return existing;
    const c = {
      id: uid(),
      ean: normalizeEan(r.ean),
      name: r.name,
      brand: r.brand,
      unit: r.unit,
      category: r.category,
      notes: '',
    };
    await writeStores(['catalogs'], (tx) => tx.objectStore('catalogs').put(c));
    catalogs.push(c);
    catalogs.sort((a, b) => catalogDisplay(a).localeCompare(catalogDisplay(b), 'pt-BR'));
    return c;
  }
  function referenceProductModal(listId, existing) {
    let q = '';
    const render = () => {
      const arr = referenceProductMatches(q);
      $('refProductResults').innerHTML = arr.length
        ? arr
            .map(
              (r) =>
                `<button type="button" class="card" data-ref-id="${esc(r.id)}" style="width:100%;text-align:left"><strong>${esc(r.name)}</strong><div class="meta">${esc(r.brand)} • ${esc(r.unit)} • ${esc(r.category)}</div></button>`
            )
            .join('')
        : '<div class="empty">Nenhum produto encontrado.</div>';
      document.querySelectorAll('[data-ref-id]').forEach(
        (b) =>
          (b.onclick = async () => {
            try {
              const c = await addReferenceProductToCatalog(b.dataset.refId);
              const seeded = existing
                ? { ...existing, mainItemId: c.id, ...productSnapshot(c) }
                : {
                    id: uid(),
                    mainItemId: c.id,
                    done: false,
                    quantity: null,
                    date: null,
                    value: null,
                    marketName: '',
                    comments: '',
                    ...productSnapshot(c),
                  };
              closeModal();
              showModal(
                existing ? 'Editar produto' : 'Adicionar produto',
                itemForm(listId, seeded),
                'ifProduct'
              );
              bindItemForm(listId, existing ? seeded : null);
            } catch (e) {
              showError(e);
            }
          })
      );
    };
    showModal(
      '✨ Banco offline de produtos',
      `<div class="field"><label for="refProductSearch">Pesquisar produto</label><input id="refProductSearch" class="input" placeholder="Nome, marca, categoria ou unidade..." autocomplete="off"></div><div id="refProductResults" class="cards" style="margin-top:10px"></div>`,
      'refProductSearch'
    );
    $('refProductSearch').oninput = (e) => {
      q = e.target.value;
      render();
    };
    render();
  }
  function referenceCatalogModal() {
    let q = '';
    const render = () => {
      const arr = referenceProductMatches(q);
      $('refCatalogResults').innerHTML = arr.length
        ? arr
            .map(
              (r) =>
                `<button type="button" class="card" data-ref-cat="${esc(r.id)}" style="width:100%;text-align:left"><strong>${esc(r.name)}</strong><div class="meta">${esc(r.brand)} • ${esc(r.unit)} • ${esc(r.category)}</div></button>`
            )
            .join('')
        : '<div class="empty">Nenhum produto encontrado.</div>';
      document.querySelectorAll('[data-ref-cat]').forEach(
        (b) =>
          (b.onclick = async () => {
            try {
              await addReferenceProductToCatalog(b.dataset.refCat);
              await load();
              referenceCatalogModal();
              notify('Produto adicionado ao catálogo.');
            } catch (e) {
              showError(e);
            }
          })
      );
    };
    showModal(
      '✨ Banco offline de produtos',
      `<div class="field"><label for="refCatalogSearch">Pesquisar produto</label><input id="refCatalogSearch" class="input" placeholder="Nome, marca, categoria ou unidade..." autocomplete="off"></div><div id="refCatalogResults" class="cards" style="margin-top:10px"></div>`,
      'refCatalogSearch'
    );
    $('refCatalogSearch').oninput = (e) => {
      q = e.target.value;
      render();
    };
    render();
  }
  async function migrateOld() {
    const raw = localStorage.getItem(OLD_KEY);
    if (!raw) return;
    const existing = await Promise.all(STORES.map(getAll));
    const byStore = Object.fromEntries(STORES.map((s, i) => [s, existing[i]]));
    if (byStore.settings.some((x) => x.key === 'migrationV1Complete')) {
      try {
        localStorage.removeItem(OLD_KEY);
      } catch {}
      return;
    }
    let old;
    try {
      old = JSON.parse(raw);
    } catch {
      notify(
        'Os dados antigos não puderam ser migrados porque o formato está inválido. Eles foram preservados.'
      );
      return;
    }
    if (!Array.isArray(old)) return;
    const catMap = new Map();
    const catalogsNew = [];
    for (const x of old) {
      const name = String(x?.name || '').trim();
      if (!name) continue;
      const key = `${normalize(name)}||un`;
      if (!catMap.has(key)) {
        const c = { id: uid(), name, brand: '', unit: 'un', category: 'Outros', notes: '' };
        catMap.set(key, c);
        catalogsNew.push(c);
      }
    }
    const listItems = [];
    for (const x of old) {
      const name = String(x?.name || '').trim();
      const c = catMap.get(`${normalize(name)}||un`);
      if (c)
        listItems.push({
          id: uid(),
          mainItemId: c.id,
          done: !!x?.done,
          quantity: null,
          date: null,
          value: null,
          marketName: '',
          comments: '',
        });
    }
    const newList = listItems.length
      ? {
          id: uid(),
          name: 'Lista antiga',
          date: localToday(),
          createdAt: nowISO(),
          purchaseType: 'local',
          comments: 'Migrada automaticamente da versão anterior.',
          archived: false,
          items: listItems,
        }
      : null;
    try {
      await writeStores(['catalogs', 'lists', 'settings'], (tx) => {
        const co = tx.objectStore('catalogs'),
          lo = tx.objectStore('lists'),
          so = tx.objectStore('settings');
        for (const c of catalogsNew) co.put(c);
        if (newList) lo.put(newList);
        so.put({
          key: 'migrationV1Complete',
          value: { at: nowISO(), migratedItems: listItems.length },
        });
      });
      try {
        localStorage.removeItem(OLD_KEY);
      } catch {}
      notify('Dados da versão anterior migrados com sucesso.');
    } catch (err) {
      showError(
        err,
        'A migração não foi concluída. Os dados antigos foram preservados para nova tentativa.'
      );
    }
  }

  function normalizeData() {
    catalogs = catalogs
      .filter(Boolean)
      .map((c) => ({
        ...c,
        id: validId(c.id) ? c.id : uid(),
        ean: normalizeEan(c.ean),
        brand: String(c.brand || ''),
        unit: String(c.unit || 'un'),
        category: String(c.category || 'Outros'),
        notes: String(c.notes || ''),
      }));
    lists = lists
      .filter(Boolean)
      .map((l) => ({
        ...l,
        items: Array.isArray(l.items)
          ? l.items.map((i) => ({
              ...i,
              done: !!i.done,
              quantity: i.quantity ?? null,
              date: i.date || null,
              value: i.value ?? null,
              marketName: String(i.marketName || ''),
              comments: String(i.comments || ''),
            }))
          : [],
        purchaseType: l.purchaseType === 'virtual' ? 'virtual' : 'local',
        archived: !!l.archived,
        comments: String(l.comments || ''),
      }));
    history = history
      .filter(Boolean)
      .map((h) => ({
        ...h,
        mainItemId: h.mainItemId || null,
        itemName: String(h.itemName || ''),
        brand: String(h.brand || ''),
        unit: String(h.unit || ''),
        marketName: String(h.marketName || ''),
        origin: String(h.origin || 'legacy-local'),
      }));
    wishlist = wishlist
      .filter(Boolean)
      .map((w) => ({
        ...w,
        brand: String(w.brand || ''),
        unit: String(w.unit || 'un'),
        notes: String(w.notes || ''),
      }));
    trash = trash
      .filter(Boolean)
      .map((t) =>
        t.type === 'catalog'
          ? {
              ...t,
              data: t.data
                ? {
                    ...t.data,
                    brand: String(t.data.brand || ''),
                    unit: String(t.data.unit || 'un'),
                    category: String(t.data.category || 'Outros'),
                    notes: String(t.data.notes || ''),
                  }
                : t.data,
            }
          : t
      );
  }
  async function load() {
    const [c, l, h, w, t, s, rp, rm] = await Promise.all(
      [...STORES, ...REFERENCE_STORES].map(getAll)
    );
    catalogs = c;
    lists = l;
    history = h;
    wishlist = w;
    trash = t;
    referenceProducts = rp;
    referenceMarkets = rm;
    settings = {};
    for (const x of s) settings[x.key] = x.value;
    normalizeData();
    await ensureItemSnapshots();
    catalogs.sort((a, b) => catalogDisplay(a).localeCompare(catalogDisplay(b), 'pt-BR'));
    lists.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    renderAll();
  }
  function applyTheme() {
    const mode = ['system', 'light', 'dark'].includes(settings.theme) ? settings.theme : 'system';
    document.documentElement.dataset.theme = mode === 'system' ? '' : mode;
    $('themeSelect').value = mode;
  }
  async function setTheme(mode) {
    if (!['system', 'light', 'dark'].includes(mode)) mode = 'system';
    try {
      await writeStores(['settings'], (tx) =>
        tx.objectStore('settings').put({ key: 'theme', value: mode })
      );
      settings.theme = mode;
      applyTheme();
    } catch (e) {
      showError(e);
    }
  }
  function switchView(id) {
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === id));
    document
      .querySelectorAll('.nav button')
      .forEach((b) => b.classList.toggle('active', b.dataset.view === id));
    if (id === 'listsView') renderLists();
    if (id === 'catalogView') renderCatalog();
    if (id === 'wishlistView') renderWishlist();
    if (id === 'historyView') renderHistory();
  }
  function renderAll() {
    renderLists();
    renderCatalog();
    renderWishlist();
    renderHistory();
    $('globalBadge').textContent = lists
      .filter((l) => !l.archived)
      .reduce((n, l) => n + (l.items || []).filter((i) => !i.done).length, 0);
    applyTheme();
  }
  function listTotal(l) {
    return (l.items || []).reduce((s, i) => {
      const v = Number(i.value),
        q = Number(i.quantity);
      if (!Number.isFinite(v)) return s;
      return s + v * (Number.isFinite(q) && q > 0 ? q : 1);
    }, 0);
  }
  function renderLists() {
    const q = normalize($('listSearch').value);
    const arr = lists.filter((l) => !l.archived && normalize(l.name).includes(q));
    $('listsSummary').textContent = `${arr.length} ${arr.length === 1 ? 'lista' : 'listas'}`;
    if (!arr.length) {
      $('listsCards').innerHTML =
        '<div class="empty"><div class="emoji">🛍️</div><strong>Nenhuma lista encontrada</strong><div>Crie uma nova lista para começar.</div></div>';
      return;
    }
    $('listsCards').innerHTML = arr
      .map((l) => {
        const items = l.items || [],
          done = items.filter((i) => i.done).length,
          total = listTotal(l);
        return `<div class="card"><div class="card-head"><div><div class="card-title">${esc(l.name)}</div><div class="meta">${l.purchaseType === 'virtual' ? '🌐 Compra virtual' : '🏪 Compra local'}${l.date ? ` • 📅 ${formatDate(l.date)}` : ''} • ${items.length} ${items.length === 1 ? 'item' : 'itens'} • ${done} comprados</div>${l.comments ? `<div class="meta">📝 ${esc(l.comments)}</div>` : ''}${total ? `<div class="meta">Total: <strong>${money(total)}</strong></div>` : ''}</div><div class="actions"><button class="btn primary small" data-action="open-list" data-id="${esc(l.id)}">Abrir</button><button class="btn ghost small" data-action="edit-list" data-id="${esc(l.id)}" aria-label="Editar lista">✏️ Editar</button><button class="btn ghost small" data-action="duplicate-list" data-id="${esc(l.id)}" aria-label="Duplicar lista">📋 Duplicar</button><button class="btn ghost small" data-action="buy-again" data-id="${esc(l.id)}" aria-label="Comprar novamente">🛒 Comprar novamente</button><button class="btn ghost small" data-action="archive-list" data-id="${esc(l.id)}" aria-label="Arquivar lista">📁 Arquivar</button><button class="btn danger small" data-action="delete-list" data-id="${esc(l.id)}" aria-label="Excluir lista">🗑️ Excluir</button></div></div></div>`;
      })
      .join('');
  }
  function renderCatalog() {
    const q = normalize($('catalogSearch').value);
    const arr = catalogs.filter((c) =>
      normalize(`${c.name} ${c.brand || ''} ${c.category || ''} ${c.unit || ''}`).includes(q)
    );
    if (!arr.length) {
      $('catalogCards').innerHTML =
        '<div class="empty"><div class="emoji">📦</div><strong>Nenhum item cadastrado</strong><div>Adicione produtos para começar.</div></div>';
      return;
    }
    $('catalogCards').innerHTML = arr
      .map((c) => {
        const used =
          lists.reduce(
            (n, l) => n + (l.items || []).filter((i) => i.mainItemId === c.id).length,
            0
          ) +
          trash
            .filter((t) => t.type === 'list')
            .reduce(
              (n, t) => n + (t.data?.items || []).filter((i) => i.mainItemId === c.id).length,
              0
            );
        return `<div class="card"><div class="card-head"><div><div class="card-title">${esc(c.name)}</div><div class="meta">${c.brand ? `Marca: ${esc(c.brand)} • ` : ''}${c.unit ? `Unidade: ${esc(c.unit)} • ` : ''}${c.category ? `Categoria: ${esc(c.category)} • ` : ''}Usado em ${used} item(ns)</div>${c.notes ? `<div class="meta">📝 ${esc(c.notes)}</div>` : ''}</div><div class="actions"><button class="btn ghost small" data-action="edit-catalog" data-id="${esc(c.id)}" aria-label="Editar item">✏️ Editar</button><button class="btn danger small" data-action="delete-catalog" data-id="${esc(c.id)}" aria-label="Excluir item">🗑️ Excluir</button></div></div></div>`;
      })
      .join('');
  }
  function renderWishlist() {
    const q = normalize($('wishSearch').value);
    const arr = wishlist.filter((w) =>
      normalize(`${w.name} ${w.brand || ''} ${w.unit || ''} ${w.notes || ''}`).includes(q)
    );
    if (!arr.length) {
      $('wishlistCards').innerHTML =
        '<div class="empty"><div class="emoji">⭐</div><strong>Nenhum desejo cadastrado</strong><div>Adicione algo que você quer comprar no futuro.</div></div>';
      return;
    }
    $('wishlistCards').innerHTML = arr
      .map(
        (w) =>
          `<div class="card"><div class="card-head"><div><div class="card-title">${esc(w.name)}</div><div class="meta">${w.brand ? `Marca: ${esc(w.brand)} • ` : ''}${w.unit ? `Unidade: ${esc(w.unit)} • ` : ''}${w.targetPrice != null ? `Preço desejado: ${money(w.targetPrice)}` : ''}</div>${w.notes ? `<div class="meta">📝 ${esc(w.notes)}</div>` : ''}</div><div class="actions"><button class="btn primary small" data-action="wish-to-list" data-id="${esc(w.id)}">🛒 Na lista</button><button class="btn ghost small" data-action="edit-wish" data-id="${esc(w.id)}" aria-label="Editar desejo">✏️ Editar</button><button class="btn danger small" data-action="delete-wish" data-id="${esc(w.id)}" aria-label="Excluir desejo">🗑️ Excluir</button></div></div></div>`
      )
      .join('');
  }
  function renderHistory() {
    const qi = normalize($('historyItemSearch').value),
      qm = normalize($('historyMarketSearch').value);
    const arr = history.filter(
      (h) =>
        normalize(`${h.itemName || ''} ${h.brand || ''}`).includes(qi) &&
        normalize(h.marketName || '').includes(qm)
    );
    $('historySummary').textContent =
      `${arr.length} ${arr.length === 1 ? 'registro' : 'registros'}`;
    if (!arr.length) {
      $('historyCards').innerHTML =
        '<div class="empty"><div class="emoji">💰</div><strong>Nenhum histórico encontrado</strong><div>Preços informados nas listas aparecerão aqui.</div></div>';
      return;
    }
    const grouped = new Map();
    for (const h of arr) {
      const key =
        h.mainItemId || `${normalize(h.itemName)}|${normalize(h.brand)}|${normalize(h.unit)}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(h);
    }
    $('historyCards').innerHTML = [...grouped.values()]
      .map((rows) => {
        const nums = rows.map((x) => Number(x.value)).filter(Number.isFinite),
          min = nums.length ? Math.min(...nums) : null,
          max = nums.length ? Math.max(...nums) : null,
          latest = rows
            .slice()
            .sort((a, b) =>
              `${dateSortValue(b.date)}|${b.createdAt || ''}`.localeCompare(
                `${dateSortValue(a.date)}|${a.createdAt || ''}`
              )
            )[0];
        const title = latest?.itemName || rows[0].itemName || 'Produto';
        return `<div class="card"><div class="card-head"><div><div class="card-title">${esc(title)}</div><div class="meta">${rows.length} ${rows.length === 1 ? 'registro' : 'registros'} • menor ${min != null ? money(min) : '—'} • maior ${max != null ? money(max) : '—'} • mais recente ${latest ? money(latest.value) : '—'}</div>${latest?.brand || latest?.unit ? `<div class="meta">${latest.brand ? `Marca: ${esc(latest.brand)} • ` : ''}${latest.unit ? `Unidade: ${esc(latest.unit)}` : ''}</div>` : ''}</div></div><div class="table-wrap"><table class="history-table"><thead><tr><th>Mercado</th><th>Data</th><th>Valor</th></tr></thead><tbody>${rows
          .slice()
          .sort((a, b) =>
            `${dateSortValue(b.date)}|${b.createdAt || ''}`.localeCompare(
              `${dateSortValue(a.date)}|${a.createdAt || ''}`
            )
          )
          .map(
            (h) =>
              `<tr><td>${esc(h.marketName || '—')}</td><td>${formatDate(h.date)}</td><td class="price">${money(h.value)}</td></tr>`
          )
          .join('')}</tbody></table></div></div>`;
      })
      .join('');
  }

  function showModal(title, body, focusId, returnListId = null) {
    modalPreviousFocus = document.activeElement;
    modalReturnListId = returnListId;
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = body;
    $('modal').classList.add('show');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const el = focusId
        ? $(focusId)
        : $('modalBody').querySelector('input,select,textarea,button');
      el?.focus();
    }, 30);
  }
  function closeModal(restoreList = true) {
    const el = modalPreviousFocus,
      returnListId = modalReturnListId;
    $('modal').classList.remove('show');
    $('modalBody').innerHTML = '';
    document.body.style.overflow = '';
    currentListId = null;
    modalPreviousFocus = null;
    modalReturnListId = null;
    el?.focus?.();
    if (restoreList && returnListId && lists.some((l) => l.id === returnListId)) {
      currentListId = returnListId;
      renderListModal();
    }
  }
  function listForm(l) {
    return `<form id="listForm"><div class="field"><label for="lfName">Nome da lista *</label><input id="lfName" class="input" maxlength="120" required value="${esc(l?.name || '')}" autocomplete="off"></div><div class="form-grid" style="margin-top:9px"><div class="field"><label for="lfDate">Data</label><input id="lfDate" class="input" type="date" value="${esc(l?.date || '')}"></div><div class="field"><label for="lfType">Tipo de compra</label><select id="lfType" class="select"><option value="local" ${l?.purchaseType !== 'virtual' ? 'selected' : ''}>🏪 Compra local</option><option value="virtual" ${l?.purchaseType === 'virtual' ? 'selected' : ''}>🌐 Compra virtual</option></select></div></div><div class="field" style="margin-top:9px"><label for="lfComments">Observações</label><textarea id="lfComments" class="textarea" rows="3" maxlength="2000" placeholder="Ex.: comprar somente se estiver em promoção...">${esc(l?.comments || '')}</textarea></div><div style="margin-top:12px"><button class="btn primary" type="submit">Salvar lista</button></div></form>`;
  }
  const categories = [
    'Alimentos',
    'Bebidas',
    'Carnes',
    'Hortifruti',
    'Laticínios',
    'Higiene',
    'Limpeza',
    'Padaria',
    'Congelados',
    'Outros',
  ];
  function catalogForm(c) {
    return `<form id="catalogForm"><div class="field"><label for="cfName">Nome *</label><input id="cfName" class="input" maxlength="120" required value="${esc(c?.name || '')}" autocomplete="off"></div><div class="form-grid" style="margin-top:9px"><div class="field"><label for="cfBrand">Marca</label><input id="cfBrand" class="input" maxlength="80" value="${esc(c?.brand || '')}" placeholder="Opcional"></div><div class="field"><label for="cfUnit">Unidade</label><input id="cfUnit" class="input" maxlength="40" value="${esc(c?.unit || 'un')}" placeholder="Ex.: 1 kg, 500 ml, un"></div><div class="field"><label for="cfCategory">Categoria</label><select id="cfCategory" class="select">${categories.map((x) => `<option value="${esc(x)}" ${c?.category === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div><div class="field"><label for="cfEan">EAN / código de barras</label><input id="cfEan" class="input" inputmode="numeric" maxlength="14" value="${esc(c?.ean || '')}" placeholder="Opcional"></div></div><div class="hint">ID interno único é gerado automaticamente e é diferente do EAN.</div><div class="field" style="margin-top:9px"><label for="cfNotes">Observações</label><textarea id="cfNotes" class="textarea" rows="3" maxlength="1000">${esc(c?.notes || '')}</textarea></div><div style="margin-top:12px"><button class="btn primary" type="submit">Salvar item</button></div></form>`;
  }
  function wishForm(w) {
    return `<form id="wishForm"><div class="field"><label for="wfName">Produto *</label><input id="wfName" class="input" maxlength="120" required value="${esc(w?.name || '')}" autocomplete="off"></div><div class="form-grid" style="margin-top:9px"><div class="field"><label for="wfBrand">Marca</label><input id="wfBrand" class="input" maxlength="80" value="${esc(w?.brand || '')}"></div><div class="field"><label for="wfUnit">Unidade</label><input id="wfUnit" class="input" maxlength="40" value="${esc(w?.unit || 'un')}"></div><div class="field"><label for="wfPrice">Preço desejado</label><input id="wfPrice" class="input" inputmode="decimal" placeholder="Ex.: 300,00" value="${w?.targetPrice != null ? String(w.targetPrice).replace('.', ',') : ''}"></div></div><div class="field" style="margin-top:9px"><label for="wfNotes">Observação</label><textarea id="wfNotes" class="textarea" rows="3" maxlength="500">${esc(w?.notes || '')}</textarea></div><div style="margin-top:12px"><button class="btn primary" type="submit">Salvar desejo</button></div></form>`;
  }
  function itemForm(listId, item) {
    const opts = catalogs
      .slice()
      .sort((a, b) => catalogDisplay(a).localeCompare(catalogDisplay(b), 'pt-BR'))
      .map(
        (c) =>
          `<option value="${esc(c.id)}" ${item?.mainItemId === c.id ? 'selected' : ''}>${esc(catalogDisplay(c))}</option>`
      )
      .join('');
    const d = item ? itemDisplayData(item) : { name: '', brand: '', unit: 'un' };
    const markets = [...new Set(referenceMarkets.map((m) => m.name).concat(getMarketNames()))];
    return `<form id="itemForm"><div class="field"><label for="ifProduct">Produto *</label><div class="row"><select id="ifProduct" class="select" required><option value="">Selecione...</option>${opts}</select><button type="button" class="btn ghost" id="ifReferenceBtn">✨ Banco</button></div></div><div class="form-grid" style="margin-top:9px"><div class="field"><label for="ifBrand">Marca</label><input id="ifBrand" class="input" maxlength="80" value="${esc(d.brand)}" placeholder="Ex.: Qualy"></div><div class="field"><label for="ifUnit">Unidade</label><input id="ifUnit" class="input" maxlength="40" value="${esc(d.unit || 'un')}" placeholder="Ex.: 1 kg, 500 ml, un"></div><div class="field"><label for="ifQty">Quantidade</label><input id="ifQty" class="input" inputmode="decimal" value="${item?.quantity ?? ''}" placeholder="Ex.: 2"></div><div class="field"><label for="ifValue">Valor</label><input id="ifValue" class="input" inputmode="decimal" value="${item?.value != null ? String(item.value).replace('.', ',') : ''}" placeholder="Ex.: 18,90"></div><div class="field"><label for="ifDate">Data</label><input id="ifDate" class="input" type="date" value="${esc(item?.date || '')}"></div><div class="field"><label for="ifMarket">Mercado</label><input id="ifMarket" class="input" list="marketList" maxlength="100" value="${esc(item?.marketName || '')}" placeholder="Ex.: Atakarejo"></div></div><div class="field" style="margin-top:9px"><label for="ifComments">Observações</label><textarea id="ifComments" class="textarea" rows="3" maxlength="500" placeholder="Ex.: sem açúcar, tamanho grande...">${esc(item?.comments || '')}</textarea></div><datalist id="marketList">${markets.map((x) => `<option value="${esc(x)}"></option>`).join('')}</datalist><div style="margin-top:12px"><button class="btn primary" type="submit">Salvar produto</button></div></form>`;
  }

  async function saveList(e, id) {
    e.preventDefault();
    try {
      const name = $('lfName').value.trim();
      if (!name) {
        notify('Digite um nome para a lista.');
        return;
      }
      let obj = id ? lists.find((x) => x.id === id) : null;
      if (id && !obj) {
        notify('Lista não encontrada.');
        return;
      }
      if (!obj) obj = { id: uid(), createdAt: nowISO(), items: [], archived: false };
      const updated = {
        ...obj,
        name,
        date: $('lfDate').value || null,
        purchaseType: $('lfType').value === 'virtual' ? 'virtual' : 'local',
        comments: $('lfComments').value.trim(),
      };
      await writeStores(['lists'], (tx) => tx.objectStore('lists').put(updated));
      closeModal();
      await load();
      notify(id ? 'Lista atualizada.' : 'Lista criada.');
    } catch (err) {
      showError(err, 'Não foi possível salvar a lista.');
    }
  }
  async function addCatalog() {
    const input = $('catalogInput'),
      name = input.value.trim();
    showModal(
      'Adicionar item',
      catalogForm({ name, brand: '', unit: 'un', category: 'Outros', ean: '', notes: '' }),
      'cfName'
    );
    $('catalogForm').onsubmit = async (e) => {
      e.preventDefault();
      const updated = {
        id: uid(),
        name: $('cfName').value.trim(),
        brand: $('cfBrand').value.trim(),
        unit: $('cfUnit').value.trim() || 'un',
        category: $('cfCategory').value,
        ean: normalizeEan($('cfEan').value),
        notes: $('cfNotes').value.trim(),
      };
      if (!updated.name) {
        notify('Digite um nome.');
        return;
      }
      if (!validEan(updated.ean)) {
        notify('EAN inválido. Use 8, 12, 13 ou 14 dígitos.');
        return;
      }
      if (catalogs.some((x) => catalogIdentity(x) === catalogIdentity(updated))) {
        notify('Já existe um produto com a mesma combinação de nome, marca e unidade.');
        return;
      }
      try {
        await writeStores(['catalogs'], (tx) => tx.objectStore('catalogs').put(updated));
        input.value = '';
        closeModal();
        await load();
        notify('Item cadastrado.');
        input.focus();
      } catch (err) {
        showError(err, 'Não foi possível cadastrar o item.');
      }
    };
  }
  function editCatalog(id) {
    const c = catalogById(id);
    if (!c) return;
    showModal('Editar item', catalogForm(c), 'cfName');
    $('catalogForm').onsubmit = async (e) => {
      e.preventDefault();
      const updated = {
        ...c,
        name: $('cfName').value.trim(),
        brand: $('cfBrand').value.trim(),
        unit: $('cfUnit').value.trim() || 'un',
        category: $('cfCategory').value,
        ean: normalizeEan($('cfEan').value),
        notes: $('cfNotes').value.trim(),
      };
      if (!updated.name) {
        notify('Digite um nome.');
        return;
      }
      if (!validEan(updated.ean)) {
        notify('EAN inválido. Use 8, 12, 13 ou 14 dígitos.');
        return;
      }
      if (catalogs.some((x) => x.id !== id && catalogIdentity(x) === catalogIdentity(updated))) {
        notify('Já existe um produto com a mesma combinação de nome, marca e unidade.');
        return;
      }
      try {
        await writeStores(['catalogs'], (tx) => tx.objectStore('catalogs').put(updated));
        closeModal();
        await load();
        notify('Item atualizado.');
      } catch (err) {
        showError(err, 'Não foi possível atualizar o item.');
      }
    };
  }
  async function deleteCatalog(id) {
    const c = catalogById(id);
    if (!c) return;
    const referenced =
      lists.some((l) => (l.items || []).some((i) => i.mainItemId === id)) ||
      trash.some(
        (t) => t.type === 'list' && (t.data?.items || []).some((i) => i.mainItemId === id)
      );
    if (referenced) {
      notify('Este item está sendo utilizado em uma lista e não pode ser excluído agora.');
      return;
    }
    if (!confirmText(`Excluir "${c.name}" dos itens cadastrados?`)) return;
    const t = { id: uid(), type: 'catalog', data: c, deletedAt: nowISO() };
    try {
      await writeStores(['catalogs', 'trash'], (tx) => {
        tx.objectStore('catalogs').delete(id);
        tx.objectStore('trash').put(t);
      });
      await load();
      setUndo('Item excluído', async () => {
        await writeStores(['catalogs', 'trash'], (tx) => {
          tx.objectStore('catalogs').put(c);
          tx.objectStore('trash').delete(t.id);
        });
      });
    } catch (err) {
      showError(err);
    }
  }

  function resetListState() {
    listState = {
      q: '',
      filter: 'all',
      category: '',
      market: '',
      minPrice: '',
      maxPrice: '',
      date: '',
      sort: 'default',
    };
  }
  function listItemLabel(i) {
    const c = catalogById(i.mainItemId);
    return c ? catalogDisplay(c) : 'Produto removido';
  }
  function itemSubtotal(i) {
    const v = Number(i.value);
    if (!Number.isFinite(v)) return null;
    const q = Number(i.quantity);
    return v * (Number.isFinite(q) && q > 0 ? q : 1);
  }
  function filteredListItems(l) {
    const s = listState,
      q = normalize(s.q),
      allItems = (l.items || []).map((x, idx) => ({ ...x, _idx: idx }));
    let items = allItems.filter((i) => {
      const d = itemDisplayData(i);
      const text = normalize(`${d.name} ${d.brand} ${d.unit} ${d.category} ${i.marketName || ''}`);
      if (q && !text.includes(q)) return false;
      if (s.filter === 'done' && !i.done) return false;
      if (s.filter === 'pending' && i.done) return false;
      if (s.category && d.category !== s.category) return false;
      if (s.market && normalize(i.marketName) !== normalize(s.market)) return false;
      const sub = itemSubtotal(i);
      if (s.minPrice !== '' && (sub === null || sub < Number(s.minPrice))) return false;
      if (s.maxPrice !== '' && (sub === null || sub > Number(s.maxPrice))) return false;
      if (s.date && i.date !== s.date) return false;
      return true;
    });
    if (s.sort === 'name')
      items.sort((a, b) => listItemLabel(a).localeCompare(listItemLabel(b), 'pt-BR'));
    if (s.sort === 'pending') items.sort((a, b) => Number(a.done) - Number(b.done));
    if (s.sort === 'done') items.sort((a, b) => Number(b.done) - Number(a.done));
    if (s.sort === 'price')
      items.sort((a, b) => (itemSubtotal(a) ?? Infinity) - (itemSubtotal(b) ?? Infinity));
    if (s.sort === 'date')
      items.sort((a, b) => dateSortValue(b.date).localeCompare(dateSortValue(a.date)));
    return { allItems, items };
  }
  function renderListItemsOnly() {
    const l = lists.find((x) => x.id === currentListId);
    if (!l || !$('listItems')) return;
    const { allItems, items } = filteredListItems(l);
    $('listItems').innerHTML = items.length
      ? items
          .map((x) => {
            const d = itemDisplayData(x),
              sub = itemSubtotal(x);
            return `<div class="item ${x.done ? 'done' : ''}"><input class="check" type="checkbox" data-action="toggle-item" data-list="${esc(l.id)}" data-index="${x._idx}" ${x.done ? 'checked' : ''} aria-label="Marcar ${esc(d.name)} como comprado"><div class="item-main"><div class="item-name">${esc(d.name)}${x.quantity ? ` × ${esc(x.quantity)}${d.unit ? ` ${esc(d.unit)}` : ''}` : ''}</div><div class="item-meta">${d.brand ? `Marca: ${esc(d.brand)} • ` : ''}${d.unit ? `Unidade: ${esc(d.unit)} • ` : ''}${d.category ? `Categoria: ${esc(d.category)} • ` : ''}${x.value != null ? `${money(x.value)}${x.quantity ? ` • Subtotal: ${money(sub)}` : ''}` : 'Sem valor'}${x.marketName ? ` • ${esc(x.marketName)}` : ''}${x.date ? ` • ${formatDate(x.date)}` : ''}</div>${x.comments ? `<div class="item-meta">📝 ${esc(x.comments)}</div>` : ''}</div><div class="item-actions"><button class="iconbtn" data-action="edit-item" data-list="${esc(l.id)}" data-index="${x._idx}" aria-label="Editar produto">✏️</button><button class="iconbtn" data-action="delete-item" data-list="${esc(l.id)}" data-index="${x._idx}" aria-label="Excluir produto">🗑️</button></div></div>`;
          })
          .join('')
      : '<div class="empty"><div class="emoji">🛒</div><strong>Nenhum item encontrado</strong><div>Ajuste a pesquisa ou adicione um produto.</div></div>';
  }
  function renderListModal() {
    const l = lists.find((x) => x.id === currentListId);
    if (!l) {
      closeModal();
      return;
    }
    const { allItems } = filteredListItems(l);
    const s = listState,
      total = allItems.length,
      done = allItems.filter((x) => x.done).length,
      sum = allItems.reduce((acc, i) => acc + (itemSubtotal(i) || 0), 0);
    const cats = [
      ...new Set(allItems.map((i) => itemDisplayData(i).category).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const markets = [...new Set(allItems.map((i) => i.marketName).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );
    showModal(
      l.name,
      `<div class="meta">${l.purchaseType === 'virtual' ? '🌐 Compra virtual' : '🏪 Compra local'}${l.date ? ` • 📅 ${formatDate(l.date)}` : ''}</div>${l.comments ? `<div class="panel" style="margin-top:9px">📝 ${esc(l.comments)}</div>` : ''}<div class="stats"><div class="stat"><strong>${total}</strong><span>itens</span></div><div class="stat"><strong>${done}</strong><span>comprados</span></div><div class="stat"><strong>${total - done}</strong><span>pendentes</span></div><div class="stat"><strong>${money(sum)}</strong><span>total</span></div></div><div class="row stack-mobile" style="margin:12px 0"><input id="listItemSearch" class="input" placeholder="Pesquisar item, marca, unidade ou mercado..." value="${esc(s.q)}" aria-label="Pesquisar itens da lista" autocomplete="off"><button class="btn ghost" id="filterBtn">🔎 Filtros</button></div><div id="advancedFilters" class="filters ${s.category || s.market || s.minPrice || s.maxPrice || s.date ? 'show' : ''}"><div class="form-grid"><div class="field"><label for="lfCatFilter">Categoria</label><select id="lfCatFilter" class="select"><option value="">Todas</option>${cats.map((x) => `<option value="${esc(x)}" ${s.category === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div><div class="field"><label for="lfMarketFilter">Mercado</label><select id="lfMarketFilter" class="select"><option value="">Todos</option>${markets.map((x) => `<option value="${esc(x)}" ${s.market === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div><div class="field"><label for="lfMinPrice">Preço mínimo</label><input id="lfMinPrice" class="input" inputmode="decimal" value="${esc(s.minPrice)}" placeholder="R$ 0,00"></div><div class="field"><label for="lfMaxPrice">Preço máximo</label><input id="lfMaxPrice" class="input" inputmode="decimal" value="${esc(s.maxPrice)}" placeholder="R$ 0,00"></div><div class="field"><label for="lfDateFilter">Data</label><input id="lfDateFilter" class="input" type="date" value="${esc(s.date)}"></div></div><button class="btn ghost small" id="clearFiltersBtn" style="margin-top:9px">Limpar filtros</button></div><div class="form-grid" style="margin-top:9px"><div class="field"><label for="listFilter">Situação</label><select id="listFilter" class="select"><option value="all" ${s.filter === 'all' ? 'selected' : ''}>Todos</option><option value="pending" ${s.filter === 'pending' ? 'selected' : ''}>Pendentes</option><option value="done" ${s.filter === 'done' ? 'selected' : ''}>Comprados</option></select></div><div class="field"><label for="listSort">Ordenação</label><select id="listSort" class="select"><option value="default" ${s.sort === 'default' ? 'selected' : ''}>Ordem original</option><option value="pending" ${s.sort === 'pending' ? 'selected' : ''}>Pendentes primeiro</option><option value="done" ${s.sort === 'done' ? 'selected' : ''}>Comprados primeiro</option><option value="name" ${s.sort === 'name' ? 'selected' : ''}>Nome A–Z</option><option value="price" ${s.sort === 'price' ? 'selected' : ''}>Preço</option><option value="date" ${s.sort === 'date' ? 'selected' : ''}>Data</option></select></div></div><div class="row stack-mobile" style="margin:12px 0"><button class="btn primary" id="addItemBtn">+ Adicionar produto</button><button class="btn ghost" id="copyItemsBtn">📋 Copiar produtos</button><button class="btn ghost" id="buyAgainBtn">🛒 Comprar novamente</button><button class="btn danger small" id="clearDoneBtn">Limpar comprados</button></div><div id="listItems"></div>`
    );
    bindListModalEvents();
    renderListItemsOnly();
  }

  function bindListModalEvents() {
    let searchFrame = 0;
    $('listItemSearch').oninput = (e) => {
      const input = e.target,
        value = input.value,
        start = input.selectionStart,
        end = input.selectionEnd;
      listState.q = value;
      cancelAnimationFrame(searchFrame);
      searchFrame = requestAnimationFrame(() => {
        renderListItemsOnly();
        const current = $('listItemSearch');
        if (current && document.activeElement === input) {
          current.value = value;
          try {
            current.focus({ preventScroll: true });
            current.setSelectionRange(start, end);
          } catch {}
        }
      });
    };
    $('listFilter').onchange = (e) => {
      listState.filter = e.target.value;
      renderListItemsOnly();
    };
    $('listSort').onchange = (e) => {
      listState.sort = e.target.value;
      renderListItemsOnly();
    };
    $('filterBtn').onclick = () => {
      $('advancedFilters').classList.toggle('show');
    };
    $('lfCatFilter').onchange = (e) => {
      listState.category = e.target.value;
      renderListItemsOnly();
    };
    $('lfMarketFilter').onchange = (e) => {
      listState.market = e.target.value;
      renderListItemsOnly();
    };
    $('lfMinPrice').oninput = (e) => {
      const v = parseMoney(e.target.value);
      listState.minPrice = v == null ? '' : String(v);
      renderListItemsOnly();
    };
    $('lfMaxPrice').oninput = (e) => {
      const v = parseMoney(e.target.value);
      listState.maxPrice = v == null ? '' : String(v);
      renderListItemsOnly();
    };
    $('lfDateFilter').onchange = (e) => {
      listState.date = e.target.value;
      renderListItemsOnly();
    };
    $('clearFiltersBtn').onclick = () => {
      listState.category = '';
      listState.market = '';
      listState.minPrice = '';
      listState.maxPrice = '';
      listState.date = '';
      renderListItemsOnly();
    };
    $('addItemBtn').onclick = () => {
      if (!catalogs.length) {
        notify('Cadastre pelo menos um produto primeiro.');
        return;
      }
      const listId = currentListId;
      showModal('Adicionar produto', itemForm(listId, null), 'ifProduct', listId);
      bindItemForm(listId, null);
    };
    $('copyItemsBtn').onclick = () => copyItemsModal(currentListId);
    $('buyAgainBtn').onclick = () => buyAgainFromList(currentListId);
    $('clearDoneBtn').onclick = clearDoneItems;
  }

  function openListNoReset(id) {
    if (!lists.some((l) => l.id === id)) return;
    currentListId = id;
    renderListModal();
  }
  async function deleteItem(listId, index) {
    const l = lists.find((x) => x.id === listId),
      removed = l?.items?.[index];
    if (!l || !removed) return;
    if (!confirmText(`Excluir "${catalogName(removed.mainItemId)}" desta lista?`)) return;
    const next = { ...l, items: l.items.slice(0, index).concat(l.items.slice(index + 1)) };
    try {
      await writeStores(['lists'], (tx) => tx.objectStore('lists').put(next));
      await load();
      openListNoReset(listId);
      setUndo('Produto excluído', async () => {
        await writeStores(['lists'], (tx) => {
          const cur = lists.find((x) => x.id === listId) || l;
          const arr = Array.isArray(cur.items) ? cur.items.slice() : [];
          arr.splice(Math.min(index, arr.length), 0, removed);
          tx.objectStore('lists').put({ ...cur, items: arr });
        });
        await load();
        openListNoReset(listId);
      });
    } catch (err) {
      showError(err);
    }
  }
  async function clearDoneItems() {
    const l = lists.find((x) => x.id === currentListId);
    if (!l) return;
    const remaining = l.items.filter((i) => !i.done),
      removed = l.items.filter((i) => i.done);
    if (!removed.length) return;
    if (!confirmText('Tem certeza que deseja remover os itens comprados desta lista?')) return;
    try {
      await writeStores(['lists'], (tx) => tx.objectStore('lists').put({ ...l, items: remaining }));
      await load();
      openListNoReset(l.id);
      setUndo('Itens comprados removidos', async () => {
        const cur = lists.find((x) => x.id === l.id) || l;
        await writeStores(['lists'], (tx) =>
          tx.objectStore('lists').put({ ...cur, items: [...cur.items, ...removed] })
        );
        await load();
        openListNoReset(l.id);
      });
    } catch (err) {
      showError(err);
    }
  }
  function bindItemForm(listId, existing) {
    $('ifProduct').onchange = () => {
      const c = catalogById($('ifProduct').value);
      if (c) {
        $('ifBrand').value = c.brand || '';
        $('ifUnit').value = c.unit || 'un';
      }
    };
    $('ifReferenceBtn').onclick = () => referenceProductModal(listId, existing);
    $('itemForm').onsubmit = async (e) => {
      e.preventDefault();
      const l = lists.find((x) => x.id === listId),
        mainItemId = $('ifProduct').value;
      if (!l || !mainItemId) {
        notify('Selecione um produto.');
        return;
      }
      const rawQty = $('ifQty').value.trim(),
        quantity = rawQty === '' ? null : finitePositive(rawQty, 1000000);
      if (rawQty !== '' && quantity === null) {
        notify('Quantidade inválida. Use um número positivo e razoável.');
        return;
      }
      const rawValue = $('ifValue').value.trim(),
        value = rawValue === '' ? null : parseMoney(rawValue);
      if (rawValue !== '' && value === null) {
        notify('Valor inválido. Use um valor em reais, como 18,90.');
        return;
      }
      const obj = existing
        ? { ...existing }
        : {
            id: uid(),
            mainItemId,
            done: false,
            quantity: null,
            date: null,
            value: null,
            marketName: '',
            comments: '',
          };
      const old = {
        mainItemId: obj.mainItemId,
        value: obj.value,
        date: obj.date,
        marketName: obj.marketName,
        brand: obj.productBrand,
        unit: obj.productUnit,
      };
      const updated = {
        ...obj,
        mainItemId,
        quantity,
        date: $('ifDate').value || null,
        value,
        marketName: $('ifMarket').value.trim(),
        comments: $('ifComments').value.trim(),
        ...productSnapshot({
          name: catalogById(mainItemId)?.name,
          brand: $('ifBrand').value.trim(),
          unit: $('ifUnit').value.trim() || 'un',
          category: catalogById(mainItemId)?.category || 'Outros',
        }),
      };
      const nextItems = existing
        ? l.items.map((i) => (i.id === existing.id ? updated : i))
        : [...l.items, updated];
      const changed =
        old.mainItemId !== updated.mainItemId ||
        old.value !== updated.value ||
        old.date !== updated.date ||
        old.marketName !== updated.marketName ||
        old.brand !== updated.productBrand ||
        old.unit !== updated.productUnit;
      const writes = ['lists'];
      let hist = null;
      if (updated.value != null && (!existing || changed)) {
        const c = catalogById(updated.mainItemId);
        hist = {
          id: uid(),
          mainItemId: c?.id || null,
          itemName: c?.name || 'Produto removido',
          brand: updated.productBrand || c?.brand || '',
          unit: updated.productUnit || c?.unit || '',
          value: updated.value,
          marketName: updated.marketName || '',
          date: updated.date || localToday(),
          createdAt: nowISO(),
          origin: 'manual-list',
        };
        writes.push('history');
      }
      try {
        await writeStores(writes, (tx) => {
          tx.objectStore('lists').put({ ...l, items: nextItems });
          if (hist) tx.objectStore('history').put(hist);
        });
        closeModal(false);
        await load();
        openListNoReset(l.id);
        notify(existing ? 'Produto atualizado.' : 'Produto adicionado.');
      } catch (err) {
        showError(err, 'Não foi possível salvar o produto.');
      }
    };
  }

  function duplicateList(id) {
    const l = lists.find((x) => x.id === id);
    if (!l) return;
    showModal(
      'Duplicar lista',
      `<div class="muted">Escolha o que deseja levar para a nova lista. Itens comprados ficam desmarcados por padrão.</div><form id="duplicateForm"><div class="checkrow"><input id="dpProducts" type="checkbox" checked><label for="dpProducts">Produtos</label></div><div class="checkrow"><input id="dpQty" type="checkbox" checked><label for="dpQty">Quantidades</label></div><div class="checkrow"><input id="dpValues" type="checkbox" checked><label for="dpValues">Valores</label></div><div class="checkrow"><input id="dpMarkets" type="checkbox" checked><label for="dpMarkets">Mercados</label></div><div class="checkrow"><input id="dpNotes" type="checkbox" checked><label for="dpNotes">Observações</label></div><div class="checkrow"><input id="dpDone" type="checkbox"><label for="dpDone">Itens comprados marcados</label></div><div class="field" style="margin-top:9px"><label for="dpName">Nome da nova lista</label><input id="dpName" class="input" maxlength="120" value="${esc(l.name + ' (cópia)')}"></div><button class="btn primary" style="margin-top:12px" type="submit">Duplicar</button></form>`,
      'dpName'
    );
    $('duplicateForm').onsubmit = async (e) => {
      e.preventDefault();
      const name = $('dpName').value.trim() || `${l.name} (cópia)`;
      const items = (l.items || [])
        .map((i) => ({
          id: uid(),
          mainItemId: i.mainItemId,
          done: $('dpDone').checked ? !!i.done : false,
          quantity: $('dpQty').checked ? i.quantity : null,
          date: null,
          value: $('dpValues').checked ? i.value : null,
          marketName: $('dpMarkets').checked ? i.marketName : '',
          comments: $('dpNotes').checked ? i.comments : '',
          productName: i.productName,
          productBrand: i.productBrand,
          productUnit: i.productUnit,
          productCategory: i.productCategory,
        }))
        .filter((i) => ($('dpProducts').checked ? true : false));
      const copy = {
        ...l,
        id: uid(),
        name,
        createdAt: nowISO(),
        date: localToday(),
        archived: false,
        items,
      };
      try {
        await writeStores(['lists'], (tx) => tx.objectStore('lists').put(copy));
        closeModal();
        await load();
        notify('Lista duplicada.');
      } catch (err) {
        showError(err, 'Não foi possível duplicar a lista.');
      }
    };
  }
  function copyItemsModal(sourceId) {
    const source = lists.find((l) => l.id === sourceId);
    if (!source) return;
    const items = source.items || [];
    if (!items.length) {
      notify('A lista não possui produtos para copiar.');
      return;
    }
    const other = lists.filter((l) => !l.archived && l.id !== sourceId);
    if (!other.length) {
      notify('Crie outra lista ativa primeiro.');
      return;
    }
    showModal(
      'Copiar produtos para outra lista',
      `<form id="copyForm"><div class="field"><label for="copyTarget">Lista de destino</label><select id="copyTarget" class="select">${other.map((l) => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select></div><div class="hint">Selecione quais produtos deseja copiar.</div><div id="copyChecks">${items.map((i, n) => `<div class="checkrow"><input id="cp${n}" type="checkbox" checked data-copy-index="${n}"><label for="cp${n}">${esc(listItemLabel(i))}</label></div>`).join('')}</div><button class="btn primary" style="margin-top:12px" type="submit">Copiar selecionados</button></form>`,
      'copyTarget'
    );
    $('copyForm').onsubmit = async (e) => {
      e.preventDefault();
      const target = lists.find((l) => l.id === $('copyTarget').value);
      const selected = [...document.querySelectorAll('[data-copy-index]:checked')]
        .map((x) => items[Number(x.dataset.copyIndex)])
        .filter(Boolean);
      if (!target || !selected.length) {
        notify('Selecione pelo menos um produto.');
        return;
      }
      const additions = selected.map((i) => ({ ...i, id: uid(), done: false }));
      try {
        await writeStores(['lists'], (tx) =>
          tx.objectStore('lists').put({ ...target, items: [...(target.items || []), ...additions] })
        );
        closeModal();
        await load();
        notify('Produtos copiados para a lista selecionada.');
      } catch (err) {
        showError(err);
      }
    };
  }
  async function buyAgainFromList(id) {
    const l = lists.find((x) => x.id === id);
    if (!l) return;
    showModal(
      '🛒 Comprar novamente',
      `<div class="muted">Escolha quais informações da compra anterior devem ser reaproveitadas.</div><form id="buyAgainForm"><div class="checkrow"><input id="baQty" type="checkbox" checked><label for="baQty">Manter quantidades</label></div><div class="checkrow"><input id="baValues" type="checkbox"><label for="baValues">Manter valores</label></div><div class="checkrow"><input id="baMarkets" type="checkbox"><label for="baMarkets">Manter mercados</label></div><div class="checkrow"><input id="baNotes" type="checkbox"><label for="baNotes">Manter observações</label></div><div class="field" style="margin-top:9px"><label for="baName">Nome da nova lista</label><input id="baName" class="input" maxlength="120" value="${esc(l.name + ' (nova compra)')}"></div><button class="btn primary" style="margin-top:12px" type="submit">Criar nova lista</button></form>`,
      'baName'
    );
    $('buyAgainForm').onsubmit = async (e) => {
      e.preventDefault();
      const copy = {
        ...l,
        id: uid(),
        name: $('baName').value.trim() || `${l.name} (nova compra)`,
        createdAt: nowISO(),
        date: localToday(),
        archived: false,
        items: (l.items || []).map((i) => {
          const d = itemDisplayData(i);
          return {
            ...i,
            id: uid(),
            done: false,
            quantity: $('baQty').checked ? i.quantity : null,
            value: $('baValues').checked ? i.value : null,
            date: null,
            marketName: $('baMarkets').checked ? i.marketName : '',
            comments: $('baNotes').checked ? i.comments : '',
            productName: d.name,
            productBrand: d.brand,
            productUnit: d.unit,
            productCategory: d.category,
          };
        }),
      };
      try {
        await writeStores(['lists'], (tx) => tx.objectStore('lists').put(copy));
        await load();
        closeModal();
        notify('Nova lista criada para comprar novamente.');
      } catch (err) {
        showError(err);
      }
    };
  }

  function buyAgainFromHistory() {
    const arr = history
      .slice()
      .sort((a, b) => dateSortValue(b.date).localeCompare(dateSortValue(a.date)));
    if (!arr.length) {
      notify('Não há histórico para usar.');
      return;
    }
    const groups = new Map();
    for (const h of arr) {
      const key =
        h.mainItemId || `${normalize(h.itemName)}|${normalize(h.brand)}|${normalize(h.unit)}`;
      if (!groups.has(key)) groups.set(key, h);
    }
    const rows = [...groups.values()];
    showModal(
      'Comprar novamente do histórico',
      `<form id="historyBuyForm"><div class="field"><label for="historyBuyName">Nome da nova lista</label><input id="historyBuyName" class="input" maxlength="120" value="Nova compra - ${formatDate(localToday())}"></div><div class="hint">Selecione os produtos que deseja levar.</div>${rows.map((h, n) => `<div class="checkrow"><input id="hb${n}" type="checkbox" checked data-hbuy="${n}"><label for="hb${n}">${esc(h.itemName)}${h.brand ? ` — ${esc(h.brand)}` : ''}${h.unit ? ` • ${esc(h.unit)}` : ''}</label></div>`).join('')}<button class="btn primary" style="margin-top:12px" type="submit">Criar lista</button></form>`,
      'historyBuyName'
    );
    $('historyBuyForm').onsubmit = async (e) => {
      e.preventDefault();
      const chosen = [...document.querySelectorAll('[data-hbuy]:checked')]
        .map((x) => rows[Number(x.dataset.hbuy)])
        .filter(Boolean);
      if (!chosen.length) {
        notify('Selecione pelo menos um produto.');
        return;
      }
      const newCatalogs = [];
      const items = [];
      for (const h of chosen) {
        let c =
          catalogs.find((c) => c.id === h.mainItemId) ||
          catalogs.find(
            (c) =>
              catalogIdentity(c) ===
              `${normalize(h.itemName)}|${normalize(h.brand)}|${normalize(h.unit)}`
          );
        if (!c) {
          c = {
            id: uid(),
            name: h.itemName,
            brand: h.brand || '',
            unit: h.unit || 'un',
            category: 'Outros',
            notes: '',
          };
          newCatalogs.push(c);
        }
        items.push({
          id: uid(),
          mainItemId: c.id,
          done: false,
          quantity: null,
          date: null,
          value: h.value ?? null,
          marketName: h.marketName || '',
          comments: '',
          productName: h.itemName || c.name,
          productBrand: h.brand || c.brand || '',
          productUnit: h.unit || c.unit || 'un',
          productCategory: c.category || 'Outros',
        });
      }
      const l = {
        id: uid(),
        name: $('historyBuyName').value.trim() || 'Nova compra',
        date: localToday(),
        createdAt: nowISO(),
        purchaseType: 'local',
        comments: 'Criada a partir do histórico de preços.',
        archived: false,
        items,
      };
      try {
        await writeStores(['catalogs', 'lists'], (tx) => {
          for (const c of newCatalogs) tx.objectStore('catalogs').put(c);
          tx.objectStore('lists').put(l);
        });
        closeModal();
        await load();
        notify('Nova lista criada a partir do histórico.');
      } catch (err) {
        showError(err);
      }
    };
  }

  function archiveList(id) {
    const l = lists.find((x) => x.id === id);
    if (!l) return;
    try {
      writeStores(['lists'], (tx) => tx.objectStore('lists').put({ ...l, archived: true }))
        .then(() => load())
        .then(() => notify('Lista arquivada.'))
        .catch(showError);
    } catch (e) {
      showError(e);
    }
  }
  function archivedModal() {
    const arr = lists.filter((l) => l.archived);
    showModal(
      '📁 Listas arquivadas',
      arr.length
        ? arr
            .map(
              (l) =>
                `<div class="card" style="margin-bottom:8px"><div class="card-head"><div><div class="card-title">${esc(l.name)}</div><div class="meta">${(l.items || []).length} itens${l.date ? ` • ${formatDate(l.date)}` : ''}</div></div><div class="actions"><button class="btn primary small" data-action="restore-archived" data-id="${esc(l.id)}">↩️ Restaurar</button><button class="btn ghost small" data-action="buy-again" data-id="${esc(l.id)}">🛒 Comprar novamente</button><button class="btn danger small" data-action="delete-list" data-id="${esc(l.id)}">🗑️ Excluir</button></div></div></div>`
            )
            .join('')
        : '<div class="empty">Nenhuma lista arquivada.</div>'
    );
  }
  async function restoreArchived(id) {
    const l = lists.find((x) => x.id === id && x.archived);
    if (!l) return;
    try {
      await writeStores(['lists'], (tx) => tx.objectStore('lists').put({ ...l, archived: false }));
      await load();
      archivedModal();
      notify('Lista restaurada.');
    } catch (err) {
      showError(err);
    }
  }
  async function deleteList(id) {
    const l = lists.find((x) => x.id === id);
    if (!l || !confirmText(`Mover a lista "${l.name}" para a lixeira?`)) return;
    const t = { id: uid(), type: 'list', data: l, deletedAt: nowISO() };
    try {
      await writeStores(['lists', 'trash'], (tx) => {
        tx.objectStore('lists').delete(id);
        tx.objectStore('trash').put(t);
      });
      await load();
      closeModal();
      setUndo('Lista movida para a lixeira', async () => {
        await writeStores(['lists', 'trash'], (tx) => {
          tx.objectStore('lists').put(l);
          tx.objectStore('trash').delete(t.id);
        });
        await load();
      });
    } catch (err) {
      showError(err);
    }
  }
  function trashCard(t) {
    return `<div class="card" style="margin-top:8px"><div class="card-head"><div><div class="card-title">${esc(t.data?.name || 'Item')}</div><div class="meta">Excluído em ${formatDate(String(t.deletedAt || '').slice(0, 10))}</div></div><div class="actions"><button class="btn primary small" data-action="restore-trash" data-id="${esc(t.id)}">↩️ Restaurar</button><button class="btn danger small" data-action="purge-trash" data-id="${esc(t.id)}">🗑️ Excluir</button></div></div></div>`;
  }
  function trashModal() {
    const listsTrash = trash.filter((x) => x.type === 'list'),
      itemsTrash = trash.filter((x) => x.type === 'catalog');
    const section = (title, arr, empty) =>
      `<div class="subcard" style="margin-top:10px"><h3 class="section-title">${title}</h3>${arr.length ? arr.map(trashCard).join('') : `<div class="empty" style="padding:20px 8px">${empty}</div>`}</div>`;
    showModal(
      '🗑️ Lixeira',
      `<div class="hint">Listas e itens excluídos ficam separados. Restaurar uma lista também recupera produtos excluídos que sejam necessários para suas referências.</div>${section('📝 Listas excluídas', listsTrash, 'Nenhuma lista excluída.')}${section('📦 Itens excluídos', itemsTrash, 'Nenhum item excluído.')}${trash.length ? '<button class="btn danger" style="margin-top:12px" id="emptyTrashBtn">Esvaziar lixeira</button>' : ''}`
    );
  }
  async function restoreTrash(id) {
    const t = trash.find((x) => x.id === id);
    if (!t) return;
    if (t.type === 'catalog' && catalogs.some((c) => c.id === t.data?.id)) {
      notify('O produto já existe no catálogo.');
      return;
    }
    if (t.type === 'list' && lists.some((l) => l.id === t.data?.id)) {
      notify('A lista já existe.');
      return;
    }
    try {
      if (t.type === 'catalog') {
        await writeStores(['catalogs', 'trash'], (tx) => {
          tx.objectStore('catalogs').put(t.data);
          tx.objectStore('trash').delete(id);
        });
      } else {
        const refs = [...(t.data.items || [])].map((i) => i.mainItemId).filter(Boolean);
        const missing = refs.filter((cid) => !catalogs.some((c) => c.id === cid));
        const recover = trash.filter((x) => x.type === 'catalog' && missing.includes(x.data?.id));
        if (missing.length !== recover.length) {
          notify(
            'Não foi possível restaurar esta lista sem quebrar referências de produtos. Restaure primeiro os produtos relacionados.'
          );
          return;
        }
        await writeStores(['lists', 'catalogs', 'trash'], (tx) => {
          tx.objectStore('lists').put(t.data);
          for (const c of recover) tx.objectStore('catalogs').put(c.data);
          tx.objectStore('trash').delete(id);
          for (const c of recover) tx.objectStore('trash').delete(c.id);
        });
      }
      await load();
      trashModal();
      notify('Item restaurado.');
    } catch (err) {
      showError(err);
    }
  }
  async function purgeTrash(id) {
    if (!confirmText('Excluir permanentemente este item?')) return;
    try {
      await writeStores(['trash'], (tx) => tx.objectStore('trash').delete(id));
      await load();
      trashModal();
      notify('Excluído permanentemente.');
    } catch (err) {
      showError(err);
    }
  }
  async function emptyTrash() {
    if (!trash.length || !confirmText('Esvaziar a lixeira permanentemente?')) return;
    try {
      await writeStores(['trash'], (tx) => tx.objectStore('trash').clear());
      await load();
      trashModal();
      notify('Lixeira esvaziada.');
    } catch (err) {
      showError(err);
    }
  }

  function setUndo(label, action) {
    undoAction = action;
    clearTimeout(undoTimer);
    const t = $('toast');
    t.innerHTML = `${esc(label)} <button id="undoBtn" class="btn small" style="margin-left:8px;background:#fff;color:#172019;min-height:32px">Desfazer</button>`;
    t.classList.add('show');
    $('undoBtn').onclick = async () => {
      clearTimeout(undoTimer);
      const fn = undoAction;
      undoAction = null;
      t.classList.remove('show');
      try {
        if (fn) await fn();
      } catch (err) {
        showError(err);
      }
    };
    undoTimer = setTimeout(() => {
      undoAction = null;
      t.classList.remove('show');
    }, 6000);
  }

  function backupSnapshot() {
    const safeSettings = Object.fromEntries(
      Object.entries(settings).filter(([key]) => key !== 'referenceDataVersion')
    );
    return {
      app: 'Minha Lista de Supermercado',
      backupFormatVersion: BACKUP_VERSION,
      schemaVersion: DB_VERSION,
      exportedAt: nowISO(),
      catalogs,
      lists,
      history,
      wishlist,
      trash,
      settings: safeSettings,
    };
  }
  async function exportBackup() {
    try {
      const data = backupSnapshot(),
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
        url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.href = url;
      a.download = `minha-lista-backup-${localToday()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify('Backup exportado com sucesso.');
    } catch (err) {
      showError(err, 'Não foi possível exportar o backup.');
    }
  }
  function validateDate(v) {
    return v == null || v === '' || /^\d{4}-\d{2}-\d{2}$/.test(String(v));
  }
  function validId(v) {
    return typeof v === 'string' && v.length >= 6 && v.length <= 100;
  }
  function validateCatalog(c) {
    return (
      c &&
      validId(c.id) &&
      typeof c.name === 'string' &&
      c.name.trim().length > 0 &&
      c.name.length <= 120 &&
      typeof c.brand === 'string' &&
      typeof c.unit === 'string' &&
      typeof c.category === 'string' &&
      typeof c.notes === 'string' &&
      validEan(c.ean)
    );
  }
  function validateItem(i) {
    return (
      i &&
      validId(i.id) &&
      validId(i.mainItemId) &&
      typeof i.done === 'boolean' &&
      (i.quantity == null || finitePositive(i.quantity, 1000000) !== null) &&
      (i.value == null || finiteNonNegative(i.value, 1000000000) !== null) &&
      validateDate(i.date) &&
      typeof i.marketName === 'string' &&
      typeof i.comments === 'string'
    );
  }
  function validateList(l, catalogIds) {
    return (
      l &&
      validId(l.id) &&
      typeof l.name === 'string' &&
      l.name.trim().length > 0 &&
      l.name.length <= 120 &&
      validateDate(l.date) &&
      ['local', 'virtual'].includes(l.purchaseType) &&
      typeof l.comments === 'string' &&
      typeof l.archived === 'boolean' &&
      Array.isArray(l.items) &&
      l.items.every((i) => validateItem(i) && catalogIds.has(i.mainItemId))
    );
  }
  function validateHistory(h, catalogIds) {
    return (
      h &&
      validId(h.id) &&
      (!h.mainItemId || catalogIds.has(h.mainItemId)) &&
      typeof h.itemName === 'string' &&
      typeof h.brand === 'string' &&
      typeof h.unit === 'string' &&
      finiteNonNegative(h.value, 1000000000) !== null &&
      typeof h.marketName === 'string' &&
      validateDate(h.date) &&
      typeof h.createdAt === 'string' &&
      typeof h.origin === 'string'
    );
  }
  function validateWishlist(w) {
    return (
      w &&
      validId(w.id) &&
      typeof w.name === 'string' &&
      w.name.trim().length > 0 &&
      typeof w.brand === 'string' &&
      typeof w.unit === 'string' &&
      (w.targetPrice == null || finiteNonNegative(w.targetPrice, 1000000000) !== null) &&
      typeof w.notes === 'string'
    );
  }
  function validateTrash(t, catalogIds, listIds) {
    return (
      t &&
      validId(t.id) &&
      ['catalog', 'list'].includes(t.type) &&
      typeof t.deletedAt === 'string' &&
      t.data &&
      ((t.type === 'catalog' && validateCatalog(t.data)) ||
        (t.type === 'list' && validateList(t.data, catalogIds)))
    );
  }
  function normalizeLegacyBackup(raw) {
    if (!raw || raw.app !== 'Minha Lista de Supermercado') return null;
    if (raw.backupFormatVersion === BACKUP_VERSION) return raw;
    if (raw.version !== '2.2') return null;
    if (!Array.isArray(raw.catalogs) || !Array.isArray(raw.lists) || !Array.isArray(raw.history))
      return null;
    const d = {
      app: 'Minha Lista de Supermercado',
      backupFormatVersion: BACKUP_VERSION,
      schemaVersion: Number.isInteger(raw.schemaVersion) ? raw.schemaVersion : 3,
      exportedAt: raw.exportedAt || nowISO(),
      catalogs: raw.catalogs,
      lists: raw.lists,
      history: raw.history,
      wishlist: Array.isArray(raw.wishlist) ? raw.wishlist : [],
      trash: Array.isArray(raw.trash) ? raw.trash : [],
      settings:
        raw.settings && typeof raw.settings === 'object' && !Array.isArray(raw.settings)
          ? raw.settings
          : {},
    };
    const fixCat = (c) => ({
      ...c,
      ean: normalizeEan(c.ean),
      brand: String(c.brand || ''),
      unit: String(c.unit || 'un'),
      category: String(c.category || 'Outros'),
      notes: String(c.notes || ''),
    });
    d.catalogs = d.catalogs.map(fixCat);
    d.lists = d.lists.map((l) => ({
      ...l,
      purchaseType: l.purchaseType === 'virtual' ? 'virtual' : 'local',
      comments: String(l.comments || ''),
      archived: !!l.archived,
      items: Array.isArray(l.items)
        ? l.items.map((i) => ({
            ...i,
            quantity: i.quantity == null ? null : i.quantity,
            value: i.value == null ? null : i.value,
            date: i.date || null,
            marketName: String(i.marketName || ''),
            comments: String(i.comments || ''),
          }))
        : [],
    }));
    d.history = d.history.map((h) => ({
      ...h,
      mainItemId: h.mainItemId || null,
      itemName: String(h.itemName || ''),
      brand: String(h.brand || ''),
      unit: String(h.unit || ''),
      marketName: String(h.marketName || ''),
      origin: String(h.origin || 'legacy-backup'),
    }));
    d.wishlist = d.wishlist.map((w) => ({
      ...w,
      brand: String(w.brand || ''),
      unit: String(w.unit || 'un'),
      notes: String(w.notes || ''),
    }));
    d.trash = d.trash.map((t) => ({
      ...t,
      data: t.data && t.type === 'catalog' ? fixCat(t.data) : t.data,
    }));
    return d;
  }
  function validateBackup(data) {
    if (
      !data ||
      data.app !== 'Minha Lista de Supermercado' ||
      data.backupFormatVersion !== BACKUP_VERSION
    )
      return 'Formato de backup incompatível.';
    if (!Number.isInteger(data.schemaVersion) || data.schemaVersion < 1)
      return 'Versão do schema inválida.';
    for (const k of ['catalogs', 'lists', 'history', 'wishlist', 'trash'])
      if (!Array.isArray(data[k])) return `Campo inválido: ${k}.`;
    if (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings))
      return 'Configurações inválidas.';
    if (JSON.stringify(data).length > 20 * 1024 * 1024)
      return 'O arquivo é grande demais para ser importado com segurança.';
    const cids = new Set();
    for (const c of data.catalogs) {
      if (!validateCatalog(c) || cids.has(c.id)) return 'Catálogo inválido ou duplicado.';
      cids.add(c.id);
    }
    const trashCatalogIds = new Set(
      data.trash.filter((t) => t?.type === 'catalog' && t.data?.id).map((t) => t.data.id)
    );
    const allCatalogIds = new Set([...cids, ...trashCatalogIds]);
    const lids = new Set();
    for (const l of data.lists) {
      if (!validateList(l, allCatalogIds) || lids.has(l.id))
        return 'Lista inválida, com referência quebrada ou duplicada.';
      lids.add(l.id);
    }
    for (const h of data.history)
      if (!validateHistory(h, allCatalogIds))
        return 'Histórico inválido ou com referência quebrada.';
    for (const w of data.wishlist) if (!validateWishlist(w)) return 'Lista de desejos inválida.';
    const tids = new Set();
    for (const t of data.trash) {
      if (!validateTrash(t, allCatalogIds, lids) || tids.has(t.id))
        return 'Lixeira inválida ou duplicada.';
      tids.add(t.id);
    }
    return null;
  }
  function sanitizeBackup(data) {
    const copy = JSON.parse(JSON.stringify(data));
    for (const c of copy.catalogs) {
      c.ean = normalizeEan(c.ean);
      c.brand = String(c.brand || '');
      c.unit = String(c.unit || 'un');
      c.category = String(c.category || 'Outros');
      c.notes = String(c.notes || '');
    }
    for (const l of copy.lists) {
      l.purchaseType = l.purchaseType === 'virtual' ? 'virtual' : 'local';
      l.comments = String(l.comments || '');
      l.items = l.items.map((i) => ({
        ...i,
        marketName: String(i.marketName || ''),
        comments: String(i.comments || ''),
      }));
    }
    for (const h of copy.history) {
      h.brand = String(h.brand || '');
      h.unit = String(h.unit || '');
      h.marketName = String(h.marketName || '');
      h.origin = String(h.origin || 'import');
    }
    for (const w of copy.wishlist) {
      w.brand = String(w.brand || '');
      w.unit = String(w.unit || 'un');
      w.notes = String(w.notes || '');
    }
    delete copy.settings.referenceDataVersion;
    return copy;
  }
  async function importBackup(file) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      notify('O backup excede o limite de segurança de 20 MB.');
      return;
    }
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      notify('Arquivo JSON inválido.');
      return;
    }
    data = normalizeLegacyBackup(data);
    if (!data) {
      notify('Formato de backup incompatível.');
      return;
    }
    const err = validateBackup(data);
    if (err) {
      notify(err);
      return;
    }
    if (
      !confirmText(
        'ATENÇÃO\n\nA importação substituirá os dados atuais. Recomenda-se exportar um backup antes.\n\nContinuar?'
      )
    )
      return;
    try {
      const prepared = sanitizeBackup(data);
      prepared.settings = {
        ...prepared.settings,
        migrationV1Complete: { at: nowISO(), reason: 'backup-import' },
      };
      await replaceAll(prepared);
      await load();
      notify('Backup restaurado com sucesso.');
    } catch (e) {
      showError(e, 'Erro ao restaurar o backup. Os dados atuais foram preservados.');
    }
  }
  async function importShared(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      notify('Arquivo de lista compartilhada grande demais.');
      return;
    }
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      notify('Arquivo de lista compartilhada inválido.');
      return;
    }
    if (
      !data ||
      data.app !== 'Minha Lista de Supermercado' ||
      data.format !== SHARED_FORMAT ||
      data.sharedFormatVersion !== 1 ||
      !data.list ||
      !Array.isArray(data.catalogs)
    ) {
      notify('Formato de lista compartilhada incompatível.');
      return;
    }
    const incomingCatalogs = data.catalogs;
    if (
      incomingCatalogs.length > 5000 ||
      !Array.isArray(data.list.items) ||
      data.list.items.length > 5000
    ) {
      notify('A lista compartilhada excede limites de segurança.');
      return;
    }
    const map = new Map(),
      newCats = [],
      incomingById = new Map();
    for (const c0 of incomingCatalogs) {
      if (
        !c0 ||
        typeof c0.id !== 'string' ||
        !validId(c0.id) ||
        typeof c0.name !== 'string' ||
        c0.name.trim().length === 0 ||
        c0.name.length > 120 ||
        typeof c0.brand !== 'string' ||
        typeof c0.unit !== 'string' ||
        typeof c0.category !== 'string' ||
        typeof c0.notes !== 'string'
      ) {
        notify('A lista compartilhada possui um catálogo inválido.');
        return;
      }
      if (map.has(c0.id)) {
        notify('A lista compartilhada possui identificadores duplicados.');
        return;
      }
      const c = {
        id: uid(),
        ean: normalizeEan(c0.ean),
        name: c0.name.trim(),
        brand: c0.brand.slice(0, 80),
        unit: c0.unit.slice(0, 40) || 'un',
        category: categories.includes(c0.category) ? c0.category : 'Outros',
        notes: c0.notes.slice(0, 1000),
      };
      const existing = catalogs.find((x) => catalogIdentity(x) === catalogIdentity(c));
      incomingById.set(c0.id, c);
      if (existing) map.set(c0.id, existing.id);
      else {
        map.set(c0.id, c.id);
        newCats.push(c);
      }
    }
    const l0 = data.list;
    if (
      typeof l0.name !== 'string' ||
      l0.name.length > 120 ||
      !validateDate(l0.date) ||
      !['local', 'virtual'].includes(l0.purchaseType) ||
      typeof l0.comments !== 'string'
    ) {
      notify('A lista compartilhada possui dados de lista inválidos.');
      return;
    }
    const items = [];
    for (const i of l0.items) {
      if (
        !i ||
        typeof i.id !== 'string' ||
        !validId(i.id) ||
        typeof i.mainItemId !== 'string' ||
        !map.has(i.mainItemId) ||
        typeof i.done !== 'boolean' ||
        (i.quantity != null && finitePositive(i.quantity, 1000000) === null) ||
        (i.value != null && finiteNonNegative(i.value, 1000000000) === null) ||
        !validateDate(i.date) ||
        typeof i.marketName !== 'string' ||
        typeof i.comments !== 'string'
      ) {
        notify('A lista compartilhada possui um item inválido.');
        return;
      }
      items.push({
        id: uid(),
        mainItemId: map.get(i.mainItemId),
        done: i.done,
        quantity: i.quantity == null ? null : finitePositive(i.quantity, 1000000),
        date: i.date || null,
        value: i.value == null ? null : finiteNonNegative(i.value, 1000000000),
        marketName: i.marketName.slice(0, 100),
        comments: i.comments.slice(0, 500),
        productName: String(i.productName || incomingById.get(i.mainItemId)?.name || 'Produto'),
        productBrand: String(i.productBrand || incomingById.get(i.mainItemId)?.brand || ''),
        productUnit: String(i.productUnit || incomingById.get(i.mainItemId)?.unit || 'un'),
        productCategory: String(
          i.productCategory || incomingById.get(i.mainItemId)?.category || 'Outros'
        ),
      });
    }
    const newList = {
      id: uid(),
      name: l0.name.trim().slice(0, 120) || 'Lista compartilhada',
      date: l0.date || localToday(),
      createdAt: nowISO(),
      purchaseType: l0.purchaseType,
      comments: l0.comments.slice(0, 500),
      archived: false,
      items,
    };
    try {
      await writeStores(['catalogs', 'lists'], (tx) => {
        for (const c of newCats) tx.objectStore('catalogs').put(c);
        tx.objectStore('lists').put(newList);
      });
      await load();
      notify('Lista compartilhada importada como uma nova lista.');
    } catch (e) {
      showError(e, 'Não foi possível importar a lista compartilhada.');
    }
  }
  function shareList() {
    const active = lists.filter((l) => !l.archived);
    if (!active.length) {
      notify('Crie uma lista primeiro.');
      return;
    }
    if (active.length === 1) {
      shareSpecificList(active[0]);
      return;
    }
    showModal(
      'Compartilhar lista',
      `<div class="field"><label for="shareSelect">Escolha a lista</label><select id="shareSelect" class="select">${active.map((l) => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select></div><button class="btn primary" style="margin-top:12px" id="doShare">Compartilhar</button>`,
      'shareSelect'
    );
    $('doShare').onclick = () =>
      shareSpecificList(lists.find((l) => l.id === $('shareSelect').value));
  }
  async function shareSpecificList(l) {
    if (!l) return;
    const ids = new Set((l.items || []).map((i) => i.mainItemId));
    const payload = {
      app: 'Minha Lista de Supermercado',
      format: SHARED_FORMAT,
      sharedFormatVersion: 1,
      exportedAt: nowISO(),
      list: {
        ...l,
        items: (l.items || []).map((i) => ({
          ...i,
          mainItemId: i.mainItemId,
          productName: i.productName,
          productBrand: i.productBrand,
          productUnit: i.productUnit,
          productCategory: i.productCategory,
        })),
      },
      catalogs: catalogs.filter((c) => ids.has(c.id)).map((c) => ({ ...c })),
    };
    const json = JSON.stringify(payload, null, 2),
      blob = new Blob([json], { type: 'application/json' });
    try {
      if (typeof navigator.share === 'function') {
        const file = new File([blob], `lista-${safeFileName(l.name)}.json`, {
          type: 'application/json',
        });
        let canFile = true;
        try {
          canFile =
            typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] });
        } catch {
          canFile = false;
        }
        if (canFile) {
          await navigator.share({
            title: l.name,
            text: 'Lista compartilhada pelo Minha Lista',
            files: [file],
          });
          closeModal();
          return;
        }
        await navigator.share({ title: l.name, text: json });
        closeModal();
        return;
      }
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(json);
          closeModal();
          notify('Lista copiada para a área de transferência. Cole onde quiser para compartilhar.');
          return;
        } catch {}
      }
      const url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.href = url;
      a.download = `lista-${safeFileName(l.name)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      closeModal();
      notify('Arquivo da lista criado para compartilhamento.');
    } catch (e) {
      if (e.name !== 'AbortError')
        showError(
          e,
          'Não foi possível compartilhar a lista. Tente copiar o conteúdo ou exportar o arquivo novamente.'
        );
    }
  }
  function privacyModal() {
    showModal(
      '🔐 Privacidade e dados',
      `<div class="notice"><strong>Esta versão é local.</strong><br>Seus produtos, listas, preços e observações são armazenados localmente neste dispositivo. A V2.2.2 não envia o conteúdo das listas para servidores, não coleta preços, não possui Analytics, login, Firebase ou banco de usuários.</div><div class="panel" style="margin-top:10px"><strong>Backup e compartilhamento</strong><br><span class="muted">Ao exportar ou compartilhar, você escolhe manualmente onde o arquivo será salvo/enviado usando os recursos do próprio aparelho. O aplicativo não envia esses dados por conta própria.</span></div><div class="panel"><strong>Armazenamento</strong><br><span class="muted">O IndexedDB não é criptografia. Se o dispositivo ou navegador for comprometido, o armazenamento local não deve ser considerado um cofre de dados.</span></div><button class="btn primary" id="privacyClose">Entendi</button>`,
      'privacyClose'
    );
    $('privacyClose').onclick = closeModal;
  }
  function firstRunPrivacy() {
    if (settings.privacySeen) return;
    showModal(
      '🔐 Privacidade dos seus dados',
      `<div class="notice"><strong>Sua lista fica neste dispositivo.</strong><br>Produtos, preços e observações são armazenados localmente. A V2.2.2 não envia o conteúdo das suas listas para servidores e não realiza coleta de preços.</div><p class="muted">Você pode exportar seus dados a qualquer momento em Configurações → Exportar backup.</p><button class="btn primary" id="privacyUnderstand">Entendi</button>`,
      'privacyUnderstand'
    );
    $('privacyUnderstand').onclick = async () => {
      try {
        await writeStores(['settings'], (tx) =>
          tx.objectStore('settings').put({ key: 'privacySeen', value: true })
        );
        settings.privacySeen = true;
        closeModal();
      } catch (e) {
        showError(e);
      }
    };
  }
  async function clearHistory() {
    if (!history.length || !confirmText('Limpar todo o histórico de preços?')) return;
    try {
      await writeStores(['history'], (tx) => tx.objectStore('history').clear());
      await load();
      notify('Histórico limpo.');
    } catch (e) {
      showError(e);
    }
  }
  async function clearAll() {
    if (
      !confirmText(
        'ATENÇÃO: apagar todos os dados pessoais (produtos, listas, desejos, lixeira, histórico e configurações locais)? O banco offline de produtos e mercados será preservado. Esta ação não pode ser desfeita.'
      )
    )
      return;
    try {
      await writeStores(STORES, (tx) => {
        for (const s of STORES) tx.objectStore(s).clear();
        tx.objectStore('settings').put({ key: 'referenceDataVersion', value: REFERENCE_VERSION });
      });
      localStorage.removeItem(OLD_KEY);
      catalogs = [];
      lists = [];
      history = [];
      wishlist = [];
      trash = [];
      settings = {};
      await load();
      notify('Todos os dados foram apagados.');
    } catch (e) {
      showError(e, 'Não foi possível apagar todos os dados.');
    }
  }
  function installHint() {
    showModal(
      '📱 Instalação',
      `<p class="muted">Abra o aplicativo pelo endereço HTTPS do GitHub Pages. No Chrome do Android, use o menu do navegador e escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>, conforme a opção disponível.</p><p class="muted">Depois de atualizar os arquivos, feche e reabra a PWA se o navegador ainda mostrar a versão anterior.</p><button class="btn primary" id="installClose">Entendi</button>`,
      'installClose'
    );
    $('installClose').onclick = closeModal;
  }

  $('newListBtn').onclick = () => {
    showModal('Nova lista', listForm(null), 'lfName');
    $('listForm').onsubmit = (e) => saveList(e, null);
  };
  $('modalClose').onclick = closeModal;
  $('modal').onclick = (e) => {
    if (e.target === $('modal')) closeModal();
  };
  $('listSearch').oninput = renderLists;
  $('catalogSearch').oninput = renderCatalog;
  $('wishSearch').oninput = renderWishlist;
  $('historyItemSearch').oninput = renderHistory;
  $('historyMarketSearch').oninput = renderHistory;
  $('referenceCatalogBtn').onclick = referenceCatalogModal;
  $('catalogInput').onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCatalog();
    }
  };
  $('addCatalogBtn').onclick = addCatalog;
  $('wishInput').onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addWish();
    }
  };
  $('addWishBtn').onclick = addWish;
  $('clearHistoryBtn').onclick = clearHistory;
  $('historyBuyAgainBtn').onclick = buyAgainFromHistory;
  $('clearHistoryBtn2').onclick = clearHistory;
  $('exportBtn').onclick = exportBackup;
  $('importInput').onchange = (e) => {
    const f = e.target.files?.[0];
    if (f) importBackup(f);
    e.target.value = '';
  };
  $('sharedInput').onchange = (e) => {
    const f = e.target.files?.[0];
    if (f) importShared(f);
    e.target.value = '';
  };
  $('clearAllBtn').onclick = clearAll;
  $('themeSelect').onchange = (e) => setTheme(e.target.value);
  $('privacyBtn').onclick = privacyModal;
  $('trashBtn').onclick = trashModal;
  $('shareListBtn').onclick = shareList;
  $('showArchivedBtn').onclick = archivedModal;
  $('showArchivedBtn2').onclick = archivedModal;
  $('installHintBtn').onclick = installHint;
  document
    .querySelectorAll('.nav button')
    .forEach((b) => (b.onclick = () => switchView(b.dataset.view)));

  async function addWish() {
    const input = $('wishInput'),
      name = input.value.trim();
    if (!name) return;
    const w = { id: uid(), name, brand: '', unit: 'un', targetPrice: null, notes: '' };
    if (
      wishlist.some(
        (x) =>
          normalize(x.name) === normalize(name) &&
          normalize(x.brand) === normalize(w.brand) &&
          normalize(x.unit) === normalize(w.unit)
      )
    ) {
      notify('Esse desejo já está cadastrado.');
      return;
    }
    try {
      await writeStores(['wishlist'], (tx) => tx.objectStore('wishlist').put(w));
      input.value = '';
      await load();
      input.focus();
      notify('Desejo adicionado.');
    } catch (e) {
      showError(e, 'Não foi possível adicionar o desejo.');
    }
  }
  function editWish(id) {
    const w = wishlist.find((x) => x.id === id);
    if (!w) return;
    showModal('Editar desejo', wishForm(w), 'wfName');
    $('wishForm').onsubmit = async (e) => {
      e.preventDefault();
      const raw = $('wfPrice').value.trim(),
        target = raw === '' ? null : parseMoney(raw);
      if (raw !== '' && target === null) {
        notify('Preço desejado inválido.');
        return;
      }
      const updated = {
        ...w,
        name: $('wfName').value.trim(),
        brand: $('wfBrand').value.trim(),
        unit: $('wfUnit').value.trim() || 'un',
        targetPrice: target,
        notes: $('wfNotes').value.trim(),
      };
      if (!updated.name) {
        notify('Digite um nome.');
        return;
      }
      try {
        await writeStores(['wishlist'], (tx) => tx.objectStore('wishlist').put(updated));
        closeModal();
        await load();
        notify('Desejo atualizado.');
      } catch (e) {
        showError(e);
      }
    };
  }
  async function deleteWish(id) {
    const w = wishlist.find((x) => x.id === id);
    if (!w) return;
    if (!confirmText(`Excluir "${w.name}" da lista de desejos?`)) return;
    try {
      await writeStores(['wishlist'], (tx) => tx.objectStore('wishlist').delete(id));
      await load();
      setUndo('Desejo excluído', async () => {
        await writeStores(['wishlist'], (tx) => tx.objectStore('wishlist').put(w));
        await load();
      });
    } catch (e) {
      showError(e);
    }
  }
  function addWishToList(id) {
    const w = wishlist.find((x) => x.id === id);
    if (!w) return;
    const active = lists.filter((l) => !l.archived);
    if (!active.length) {
      notify('Crie uma lista primeiro.');
      return;
    }
    showModal(
      'Adicionar desejo a uma lista',
      `<form id="wishToListForm"><div class="field"><label for="wtList">Lista</label><select id="wtList" class="select">${active.map((l) => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select></div><div class="field" style="margin-top:9px"><label for="wtQty">Quantidade</label><input id="wtQty" class="input" inputmode="decimal" value="1"></div><button class="btn primary" style="margin-top:12px" type="submit">Adicionar</button></form>`,
      'wtList'
    );
    $('wishToListForm').onsubmit = async (e) => {
      e.preventDefault();
      const l = lists.find((x) => x.id === $('wtList').value),
        qty = finitePositive($('wtQty').value, 1000000);
      if (!l || !qty) {
        notify('Informe uma quantidade válida.');
        return;
      }
      let c = catalogs.find(
        (x) =>
          catalogIdentity(x) === `${normalize(w.name)}|${normalize(w.brand)}|${normalize(w.unit)}`
      );
      const newCat = !c;
      if (!c)
        c = {
          id: uid(),
          name: w.name,
          brand: w.brand || '',
          unit: w.unit || 'un',
          category: 'Outros',
          notes: w.notes || '',
        };
      const item = {
        id: uid(),
        mainItemId: c.id,
        done: false,
        quantity: qty,
        date: null,
        value: null,
        marketName: '',
        comments: '',
        ...productSnapshot(c),
      };
      try {
        await writeStores(newCat ? ['catalogs', 'lists'] : ['lists'], (tx) => {
          if (newCat) tx.objectStore('catalogs').put(c);
          tx.objectStore('lists').put({ ...l, items: [...(l.items || []), item] });
        });
        closeModal();
        await load();
        notify('Desejo adicionado à lista.');
      } catch (e) {
        showError(e);
      }
    };
  }

  // Event delegation keeps dynamically rendered controls working without stale handlers.
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-action="toggle-item"]');
    if (el) toggleItem(Number(el.dataset.index), el.checked);
  });
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el) {
      const id = el.dataset.id,
        action = el.dataset.action;
      if (action === 'open-list') {
        resetListState();
        currentListId = id;
        renderListModal();
      } else if (action === 'edit-list') {
        const l = lists.find((x) => x.id === id);
        if (l) {
          showModal('Editar lista', listForm(l), 'lfName');
          $('listForm').onsubmit = (e2) => saveList(e2, id);
        }
      } else if (action === 'duplicate-list') duplicateList(id);
      else if (action === 'archive-list') archiveList(id);
      else if (action === 'delete-list') deleteList(id);
      else if (action === 'edit-catalog') editCatalog(id);
      else if (action === 'delete-catalog') deleteCatalog(id);
      else if (action === 'edit-wish') editWish(id);
      else if (action === 'delete-wish') deleteWish(id);
      else if (action === 'wish-to-list') addWishToList(id);
      else if (action === 'restore-archived') restoreArchived(id);
      else if (action === 'buy-again') buyAgainFromList(id);
      else if (action === 'edit-item') {
        const l = lists.find((x) => x.id === el.dataset.list),
          it = l?.items?.[Number(el.dataset.index)];
        if (it) {
          showModal('Editar produto', itemForm(l.id, it), 'ifProduct', l.id);
          bindItemForm(l.id, it);
        }
      } else if (action === 'delete-item') deleteItem(el.dataset.list, Number(el.dataset.index));
      else if (action === 'restore-trash') restoreTrash(id);
      else if (action === 'purge-trash') purgeTrash(id);
      return;
    }
    if (e.target.id === 'emptyTrashBtn') emptyTrash();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('modal').classList.contains('show')) closeModal();
  });

  async function init() {
    if (!('indexedDB' in window)) {
      alert('Este navegador não suporta IndexedDB.');
      return;
    }
    try {
      await openDB();
      await seedReferenceData();
      await migrateOld();
      await load();
      setTimeout(firstRunPrivacy, 250);
    } catch (err) {
      console.error(err);
      alert(
        'Não foi possível abrir o armazenamento local. Tente novamente pelo endereço HTTPS do GitHub Pages.'
      );
    }
  }
  if ('serviceWorker' in navigator)
    window.addEventListener('load', () =>
      navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('Service Worker:', e))
    );
  init();
})();
