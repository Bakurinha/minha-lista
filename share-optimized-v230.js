(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const MAX_LINK = 12000;
  const SHARE_ID_RE = /^[A-Za-z0-9_-]{36}$/;
  const API = String(globalThis.MINHA_LISTA_SHARE_API || '')
    .trim()
    .replace(/\/+$/, '');

  // Marca a implementação como fonte única do compartilhamento antes de outros módulos carregarem.
  window.__mlShareOptimizedLoaded = true;

  const norm = (value) =>
    String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');

  const uid = () =>
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

  const notify = (message) => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toast._mlShareOptimized);
      toast._mlShareOptimized = setTimeout(() => toast.classList.remove('show'), 2800);
    } else {
      alert(message);
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function openReady(timeout = 10000) {
    const started = Date.now();
    let lastError = null;

    while (Date.now() - started < timeout) {
      let db = null;
      try {
        db = await new Promise((resolve, reject) => {
          const request = indexedDB.open(DB);
          request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
          request.onsuccess = () => resolve(request.result);
        });

        const ready =
          db.objectStoreNames.contains('catalogs') && db.objectStoreNames.contains('lists');
        if (ready) return db;

        db.close();
        lastError = Error('Banco de dados ainda não está pronto');
      } catch (error) {
        try {
          db?.close();
        } catch {}
        lastError = error;
      }
      await sleep(200);
    }

    throw lastError || Error('Banco de dados ainda não está pronto');
  }

  const readAll = async (store) => {
    const db = await openReady();
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        try {
          db.close();
        } catch {}
        fn(value);
      };
      try {
        if (!db.objectStoreNames.contains(store)) {
          finish(resolve, []);
          return;
        }
        const query = db.transaction(store, 'readonly').objectStore(store).getAll();
        query.onsuccess = () => finish(resolve, query.result || []);
        query.onerror = () => finish(reject, query.error || Error('Falha na leitura'));
      } catch (error) {
        finish(reject, error);
      }
    });
  };

  const write = (fn) =>
    new Promise(async (resolve, reject) => {
      let db;
      try {
        db = await openReady();
        if (!db.objectStoreNames.contains('catalogs') || !db.objectStoreNames.contains('lists')) {
          throw Error('Banco de dados incompleto');
        }
        const tx = db.transaction(['catalogs', 'lists'], 'readwrite');
        fn(tx);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error || Error('Falha IndexedDB'));
        };
        tx.onabort = () => {
          db.close();
          reject(tx.error || Error('Transação cancelada'));
        };
      } catch (error) {
        try {
          db?.close();
        } catch {}
        reject(error);
      }
    });

  function cleanPayload(list, catalogs) {
    const used = new Set((list.items || []).map((item) => item.mainItemId).filter(Boolean));
    return {
      app: 'Minha Lista de Supermercado',
      format: 'shared-list-v3-compact',
      version: 3,
      list: {
        ...list,
        items: (list.items || []).map((item) => {
          const copy = { ...item };
          delete copy.inventory;
          delete copy.stock;
          return copy;
        }),
      },
      catalogs: catalogs
        .filter((catalog) => used.has(catalog.id))
        .map((catalog) => ({ ...catalog })),
    };
  }

  async function compressedEncode(value) {
    if (typeof CompressionStream !== 'function') throw Error('compression-unavailable');
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const input = new TextEncoder().encode(JSON.stringify(value));
    await writer.write(input);
    await writer.close();
    const buffer = await new Response(stream.readable).arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 32768) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function compressedDecode(value) {
    if (typeof DecompressionStream !== 'function') throw Error('decompression-unavailable');
    let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    await writer.write(bytes);
    await writer.close();
    const buffer = await new Response(stream.readable).arrayBuffer();
    return JSON.parse(new TextDecoder().decode(buffer));
  }

  async function buildPayload(list) {
    return cleanPayload(list, await readAll('catalogs'));
  }

  async function remoteShare(payload) {
    if (!API) throw Error('share-api-disabled');
    const response = await fetch(`${API}/api/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    if (!response.ok) throw Error(`share-http-${response.status}`);
    const data = await response.json();
    if (!data?.url || !SHARE_ID_RE.test(String(data.id || ''))) throw Error('share-response');
    return data.url;
  }

  async function makeLocalLink(payload) {
    const encoded = await compressedEncode(payload);
    const link = `${location.href.split('#')[0]}#lista-gz=${encoded}`;
    if (link.length > MAX_LINK) throw Error('local-link-too-large');
    return link;
  }

  async function makeLink(list) {
    const payload = await buildPayload(list);
    if (API) {
      try {
        return { url: await remoteShare(payload), remote: true };
      } catch (error) {
        console.warn('Compartilhamento remoto indisponível:', error);
      }
    }
    return { url: await makeLocalLink(payload), remote: false };
  }

  async function copy(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(area);
    area.select();
    if (!document.execCommand('copy')) throw Error('copy-failed');
    area.remove();
  }

  function normalizeImportedPayload(payload) {
    if (!payload || payload.app !== 'Minha Lista de Supermercado') throw Error('incompatible');
    const allowed = new Set(['shared-list-v2', 'shared-list-v3', 'shared-list-v3-compact']);
    if (!allowed.has(payload.format) || ![2, 3].includes(payload.version)) throw Error('incompatible');
    if (payload.format === 'shared-list-v2' && payload.version !== 2) throw Error('incompatible');
    if (
      (payload.format === 'shared-list-v3' || payload.format === 'shared-list-v3-compact') &&
      payload.version !== 3
    )
      throw Error('incompatible');
    if (!payload.list || !Array.isArray(payload.list.items) || !Array.isArray(payload.catalogs))
      throw Error('incompatible');
    return payload;
  }

  async function importPayload(payload, options = {}) {
    const normalized = normalizeImportedPayload(payload);
    const shouldConfirm = options.confirm !== false;
    if (
      shouldConfirm &&
      !confirm(
        `Importar a lista \"${String(normalized.list.name || 'Lista compartilhada').slice(0, 120)}\"?\n\nEla será adicionada como uma nova lista.`
      )
    )
      return false;

    const catalogs = await readAll('catalogs');
    const byKey = new Map(
      catalogs.map((catalog) => [
        `${norm(catalog.name)}|${norm(catalog.brand)}|${norm(catalog.unit || 'un')}`,
        catalog.id,
      ])
    );
    const map = new Map();
    const newCatalogs = [];

    for (const catalog of normalized.catalogs) {
      if (!catalog || typeof catalog.name !== 'string' || !catalog.name.trim())
        throw Error('invalid-catalog');
      const key = `${norm(catalog.name)}|${norm(catalog.brand)}|${norm(catalog.unit || 'un')}`;
      const existing = byKey.get(key);
      if (existing) {
        map.set(catalog.id, existing);
        continue;
      }
      const created = {
        ...catalog,
        id: uid(),
        name: String(catalog.name).slice(0, 120),
        brand: String(catalog.brand || '').slice(0, 120),
        unit: String(catalog.unit || 'un').slice(0, 60),
        category: String(catalog.category || 'Outros').slice(0, 80),
        notes: String(catalog.notes || '').slice(0, 2000),
        ean: String(catalog.ean || '')
          .replace(/\D/g, '')
          .slice(0, 14),
      };
      newCatalogs.push(created);
      map.set(catalog.id, created.id);
    }

    const items = normalized.list.items.map((item) => {
      const mainItemId = map.get(item.mainItemId);
      if (!mainItemId) throw Error('invalid-reference');
      const copy = { ...item, id: uid(), mainItemId };
      delete copy.inventory;
      delete copy.stock;
      return copy;
    });

    const now = new Date().toISOString();
    const newList = {
      ...normalized.list,
      id: uid(),
      name: String(normalized.list.name || 'Lista compartilhada').slice(0, 120),
      createdAt: now,
      updatedAt: now,
      archived: false,
      items,
    };

    await write((tx) => {
      for (const catalog of newCatalogs) tx.objectStore('catalogs').put(catalog);
      tx.objectStore('lists').put(newList);
    });
    return true;
  }

  async function importLocalHash() {
    if (location.hash.startsWith('#lista-gz=')) {
      const encoded = location.hash.slice('#lista-gz='.length);
      try {
        if (!encoded || encoded.length > MAX_LINK) throw Error('invalid');
        const payload = await compressedDecode(encoded);
        history.replaceState(null, '', location.pathname + location.search);
        const changed = await importPayload(payload);
        if (changed) location.reload();
      } catch (error) {
        console.error(error);
        notify(
          'Não foi possível importar o link compactado. Nenhum dado foi alterado.'
        );
      }
      return true;
    }

    if (location.hash.startsWith('#lista=')) {
      const raw = location.hash.slice('#lista='.length);
      try {
        if (!raw || raw.length > MAX_LINK) throw Error('invalid');
        let base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const payload = JSON.parse(new TextDecoder().decode(bytes));
        history.replaceState(null, '', location.pathname + location.search);
        const changed = await importPayload(payload);
        if (changed) location.reload();
      } catch (error) {
        console.error(error);
        notify('Não foi possível importar o link da lista. Nenhum dado foi alterado.');
      }
      return true;
    }

    return false;
  }

  async function importRemote() {
    const params = new URLSearchParams(location.search);
    const sid = params.get('shared');
    if (!sid) return false;

    history.replaceState(null, '', location.pathname);
    if (!SHARE_ID_RE.test(sid)) {
      notify('Link de compartilhamento inválido.');
      return true;
    }
    if (!API) {
      notify('Compartilhamento remoto não está configurado nesta versão.');
      return true;
    }

    try {
      const response = await fetch(`${API}/api/share/${sid}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw Error(response.status === 404 ? 'not-found' : 'remote-failed');
      const payload = await response.json();
      const changed = await importPayload(payload);
      if (changed) location.reload();
    } catch (error) {
      console.error(error);
      notify(
        error.message === 'not-found'
          ? 'Compartilhamento expirado ou não encontrado.'
          : 'Não foi possível obter a lista compartilhada.'
      );
    }
    return true;
  }

  async function copyData() {
    const list = await selectedList();
    if (!list) return notify('Selecione uma lista.');
    try {
      await copy(JSON.stringify(await buildPayload(list), null, 2));
      notify('📋 Dados copiados.');
    } catch {
      notify('Não foi possível copiar os dados.');
    }
  }

  async function exportList() {
    const list = await selectedList();
    if (!list) return notify('Selecione uma lista.');
    try {
      const payload = await buildPayload(list);
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      );
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download =
        'lista-' +
        (norm(list.name)
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 60) || 'lista') +
        '.json';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify('📁 Arquivo JSON criado.');
    } catch {
      notify('Não foi possível exportar a lista.');
    }
  }

  async function selectedList() {
    const select = document.getElementById('shareSelect');
    if (!select?.value) return null;
    return (await readAll('lists')).find((list) => list.id === select.value) || null;
  }

  function showModal(lists) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    if (!modal || !title || !body) {
      notify('Interface de compartilhamento indisponível.');
      return;
    }

    const active = lists.filter((list) => !list.archived);
    if (!active.length) {
      notify('Crie uma lista primeiro.');
      return;
    }

    body.innerHTML = `<div class="field"><label for="shareSelect">Escolha a lista</label><select id="shareSelect" class="select">${active
      .map(
        (list) =>
          `<option value="${String(list.id).replace(/"/g, '&quot;')}">${String(
            list.name || 'Lista'
          ).replace(
            /[&<>\"]/g,
            (char) =>
              ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
              })[char]
          )}</option>`
      )
      .join('')}</select></div><div class="subcard" style="margin-top:10px"><strong>🔗 Compartilhamento</strong><div class="hint">O estoque não entra no compartilhamento. O app tenta usar link remoto curto e, quando não disponível, usa link local compactado.</div><div class="row stack-mobile" style="margin-top:9px"><button class="btn primary" type="button" id="mlCompactCopy">Copiar link</button><button class="btn ghost" type="button" id="mlCompactShare">Compartilhar</button><button class="btn ghost" type="button" id="mlCompactData">Copiar dados</button><button class="btn ghost" type="button" id="mlCompactExport">Exportar JSON</button></div></div>`;
    title.textContent = 'Compartilhar lista';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    document.getElementById('mlCompactCopy').onclick = async () => {
      const list = await selectedList();
      if (!list) return notify('Selecione uma lista.');
      try {
        const result = await makeLink(list);
        await copy(result.url);
        notify(result.remote ? '🔗 Link curto copiado.' : '🔗 Link local compactado copiado.');
      } catch (error) {
        notify(
          error.message === 'local-link-too-large'
            ? 'Lista grande demais para link local.'
            : error.message === 'compression-unavailable'
              ? 'Este navegador não suporta compartilhamento local compactado.'
              : 'Não foi possível gerar o link.'
        );
      }
    };

    document.getElementById('mlCompactShare').onclick = async () => {
      const list = await selectedList();
      if (!list) return notify('Selecione uma lista.');
      try {
        const result = await makeLink(list);
        if (typeof navigator.share === 'function') {
          await navigator.share({
            title: list.name || 'Lista de supermercado',
            text: 'Lista de supermercado',
            url: result.url,
          });
        } else {
          await copy(result.url);
          notify(result.remote ? '🔗 Link curto copiado.' : '🔗 Link local compactado copiado.');
        }
      } catch (error) {
        if (error.name !== 'AbortError') notify('Não foi possível compartilhar.');
      }
    };

    document.getElementById('mlCompactData').onclick = copyData;
    document.getElementById('mlCompactExport').onclick = exportList;
  }

  function bindShareButton() {
    const button = document.getElementById('shareListBtn');
    if (!button || button.dataset.mlShareOptimized) return;
    button.dataset.mlShareOptimized = '1';
    button.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        readAll('lists')
          .then(showModal)
          .catch((error) => {
            console.error(error);
            notify('Não foi possível abrir o compartilhamento.');
          });
      },
      { capture: true }
    );
  }

  async function init() {
    bindShareButton();
    setTimeout(bindShareButton, 150);
    setTimeout(bindShareButton, 500);
    setTimeout(async () => {
      if (!(await importRemote())) await importLocalHash();
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
