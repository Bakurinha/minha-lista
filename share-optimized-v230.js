(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const MAX_LINK = 12000;
  const SHARE_ID_RE = /^[A-Za-z0-9_-]{36}$/;
  const API = String(globalThis.MINHA_LISTA_SHARE_API || '')
    .trim()
    .replace(/\/+$/, '');

  const norm = (value) =>
    String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');

  const uid = () =>
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

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

  const readAll = (store) =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(DB);
      request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
      request.onsuccess = () => {
        const db = request.result;
        try {
          const tx = db.transaction(store, 'readonly');
          const query = tx.objectStore(store).getAll();
          query.onsuccess = () => resolve(query.result || []);
          query.onerror = () => reject(query.error || Error('Falha na leitura'));
          tx.oncomplete = () => db.close();
          tx.onerror = () => {
            db.close();
            reject(tx.error || Error('Falha IndexedDB'));
          };
        } catch (error) {
          db.close();
          reject(error);
        }
      };
    });

  const write = (fn) =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(DB);
      request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
      request.onsuccess = () => {
        const db = request.result;
        let tx;
        try {
          tx = db.transaction(['catalogs', 'lists'], 'readwrite');
          fn(tx);
        } catch (error) {
          try {
            tx?.abort();
          } catch {}
          db.close();
          reject(error);
          return;
        }
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
      };
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

  async function localLink(payload) {
    if (typeof CompressionStream !== 'function') throw Error('compression-unavailable');
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
    return { url: await localLink(payload), remote: false };
  }

  async function copy(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const area = document.createElement('textarea');
    area.value = text;
    area.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(area);
    area.select();
    if (!document.execCommand('copy')) throw Error('copy-failed');
    area.remove();
  }

  async function importPayload(payload) {
    if (
      !payload ||
      payload.app !== 'Minha Lista de Supermercado' ||
      payload.format !== 'shared-list-v3-compact' ||
      payload.version !== 3 ||
      !payload.list ||
      !Array.isArray(payload.list.items) ||
      !Array.isArray(payload.catalogs)
    )
      throw Error('incompatible');

    const catalogs = await readAll('catalogs');
    const byKey = new Map(
      catalogs.map((catalog) => [
        `${norm(catalog.name)}|${norm(catalog.brand)}|${norm(catalog.unit || 'un')}`,
        catalog.id,
      ])
    );
    const map = new Map();
    const newCatalogs = [];

    for (const catalog of payload.catalogs) {
      if (!catalog || typeof catalog.name !== 'string' || !catalog.name.trim()) {
        throw Error('invalid-catalog');
      }
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

    const items = payload.list.items.map((item) => {
      const mainItemId = map.get(item.mainItemId);
      if (!mainItemId) throw Error('invalid-reference');
      const copy = { ...item, id: uid(), mainItemId };
      delete copy.inventory;
      delete copy.stock;
      return copy;
    });

    const newList = {
      ...payload.list,
      id: uid(),
      name: String(payload.list.name || 'Lista compartilhada').slice(0, 120),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
      items,
    };

    await write((tx) => {
      for (const catalog of newCatalogs) tx.objectStore('catalogs').put(catalog);
      tx.objectStore('lists').put(newList);
    });
  }

  async function importCompressedHash() {
    if (!location.hash.startsWith('#lista-gz=')) return false;
    const encoded = location.hash.slice('#lista-gz='.length);
    history.replaceState(null, '', location.pathname + location.search);
    try {
      if (!encoded || encoded.length > MAX_LINK) throw Error('invalid');
      const payload = await compressedDecode(encoded);
      if (
        !confirm(
          `Importar a lista "${String(payload?.list?.name || 'Lista compartilhada').slice(0, 120)}"?\n\nEla será adicionada como uma nova lista.`
        )
      )
        return true;
      await importPayload(payload);
      location.reload();
    } catch (error) {
      console.error(error);
      notify('Não foi possível importar o link compactado. Nenhum dado foi alterado.');
    }
    return true;
  }

  async function selectedList() {
    const select = document.getElementById('shareSelect');
    if (!select?.value) return null;
    return (await readAll('lists')).find((list) => list.id === select.value) || null;
  }

  function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  function showModal(lists) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    if (!modal || !title || !body) return notify('Interface de compartilhamento indisponível.');

    const active = lists.filter((list) => !list.archived);
    if (!active.length) return notify('Crie uma lista primeiro.');

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
      .join(
        ''
      )}</select></div><div class="subcard" style="margin-top:10px"><strong>🔗 Compartilhamento compacto</strong><div class="hint">O estoque não entra no payload. Links locais usam GZIP para reduzir o tamanho.</div><div class="row stack-mobile" style="margin-top:9px"><button class="btn primary" type="button" id="mlCompactCopy">🔗 Copiar link</button><button class="btn ghost" type="button" id="mlCompactShare">📱 Compartilhar</button></div></div>`;
    title.textContent = 'Compartilhar lista';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    document.getElementById('mlCompactCopy').onclick = async () => {
      const list = await selectedList();
      if (!list) return notify('Selecione uma lista.');
      try {
        const result = await makeLink(list);
        await copy(result.url);
        notify(result.remote ? '🔗 Link curto copiado.' : '🔗 Link compactado copiado.');
      } catch (error) {
        notify(
          error.message === 'local-link-too-large'
            ? 'Lista grande demais para link. Use o compartilhamento remoto.'
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
          notify(result.remote ? '🔗 Link curto copiado.' : '🔗 Link compactado copiado.');
        }
      } catch (error) {
        if (error.name !== 'AbortError') notify('Não foi possível compartilhar.');
      }
    };
  }

  function bind() {
    const button = document.getElementById('shareListBtn');
    if (!button || button.dataset.mlCompactShare) return;
    button.dataset.mlCompactShare = '1';
    button.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        readAll('lists')
          .then(showModal)
          .catch(() => notify('Não foi possível abrir o compartilhamento.'));
      },
      { capture: true }
    );
  }

  function init() {
    // O listener usa captura e é registrado antes do módulo legado de compartilhamento.
    bind();
    setTimeout(bind, 250);
    setTimeout(() => importCompressedHash(), 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
