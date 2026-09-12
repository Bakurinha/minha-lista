// V2.3.2 — compartilhamento por código + importação remota robusta.
// Este módulo é a entrada única do botão Compartilhar e não altera o IndexedDB original.
window.MINHA_LISTA_SHARE_API = 'https://minha-lista.suportebakura.workers.dev';

(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const API = String(window.MINHA_LISTA_SHARE_API || '').replace(/\/+$/, '');
  const CODE_RE = /^[A-Za-z0-9_-]{12}$/;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const notify = (message) => {
    const toast = document.getElementById('toast');
    if (!toast) return alert(message);
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._mlShareConfig);
    toast._mlShareConfig = setTimeout(() => toast.classList.remove('show'), 2800);
  };
  async function openReady(timeout = 10000) {
    const started = Date.now(); let lastError = null;
    while (Date.now() - started < timeout) {
      let db = null;
      try {
        db = await new Promise((resolve, reject) => { const request = indexedDB.open(DB); request.onerror = () => reject(request.error || Error('IndexedDB indisponível')); request.onsuccess = () => resolve(request.result); });
        if (db.objectStoreNames.contains('catalogs') && db.objectStoreNames.contains('lists')) return db;
        db.close(); lastError = Error('Banco de dados ainda não está pronto');
      } catch (error) { try { db?.close(); } catch {} lastError = error; }
      await sleep(200);
    }
    throw lastError || Error('Banco de dados ainda não está pronto');
  }
  async function all(store) {
    const db = await openReady();
    return new Promise((resolve, reject) => {
      let done = false;
      const finish = (fn, value) => { if (done) return; done = true; try { db.close(); } catch {} fn(value); };
      try { const request = db.transaction(store, 'readonly').objectStore(store).getAll(); request.onsuccess = () => finish(resolve, request.result || []); request.onerror = () => finish(reject, request.error || Error('Falha na leitura')); }
      catch (error) { finish(reject, error); }
    });
  }
  function writeImported(list, catalogs) {
    return new Promise(async (resolve, reject) => {
      let db;
      try {
        db = await openReady(); const tx = db.transaction(['catalogs', 'lists'], 'readwrite');
        for (const catalog of catalogs) tx.objectStore('catalogs').put(catalog);
        tx.objectStore('lists').put(list);
        tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => { db.close(); reject(tx.error || Error('Falha IndexedDB')); }; tx.onabort = () => { db.close(); reject(tx.error || Error('Transação cancelada')); };
      } catch (error) { try { db?.close(); } catch {} reject(error); }
    });
  }
  const norm = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
  const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  function cleanPayload(list, catalogs) {
    const used = new Set((list.items || []).map((item) => item.mainItemId).filter(Boolean));
    return { app: 'Minha Lista de Supermercado', format: 'shared-list-v3-compact', version: 3, list: { ...list, items: (list.items || []).map((item) => { const copy = { ...item }; delete copy.inventory; delete copy.stock; return copy; }) }, catalogs: catalogs.filter((catalog) => used.has(catalog.id)).map((catalog) => ({ ...catalog })) };
  }
  async function createShare(list) {
    if (!API) throw Error('share-api-disabled');
    const response = await fetch(`${API}/api/share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cleanPayload(list, await all('catalogs'))), cache: 'no-store' });
    if (!response.ok) throw Error(`share-http-${response.status}`);
    const data = await response.json(); const code = String(data?.id || '');
    if (!CODE_RE.test(code)) throw Error('share-response');
    return { code, url: String(data.url || `${API}/s/${code}`) };
  }
  async function copy(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const area = document.createElement('textarea'); area.value = text; area.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0'; document.body.appendChild(area); area.select(); if (!document.execCommand('copy')) throw Error('copy-failed'); area.remove();
  }
  function closeModal(modal) { modal?.remove(); }
  function modalBase(title, body) {
    const modal = document.createElement('div'); modal.className = 'modal show';
    modal.innerHTML = `<div class="sheet"><div class="sheet-head"><h2>${title}</h2><button type="button" class="close" data-close>×</button></div>${body}</div>`;
    document.body.appendChild(modal); modal.querySelector('[data-close]')?.addEventListener('click', () => closeModal(modal)); return modal;
  }
  async function shareListById(id) {
    const list = (await all('lists')).find((item) => item.id === id && !item.archived);
    if (!list) return notify('A lista selecionada não foi encontrada.');
    try {
      const result = await createShare(list);
      const modal = modalBase('Lista compartilhada', `<p class="muted">Use este código para importar a lista em outro aparelho.</p><div class="panel" style="text-align:center;margin:12px 0"><strong style="font-size:28px;letter-spacing:2px;word-break:break-all">${result.code}</strong></div><div class="row"><button type="button" class="btn primary" data-copy-code>Copiar código</button><button type="button" class="btn ghost" data-copy-link>Copiar link</button></div><p class="hint">O código é a forma principal de compartilhamento. O link fica disponível apenas como compatibilidade.</p>`);
      modal.querySelector('[data-copy-code]').onclick = async () => { try { await copy(result.code); notify('Código copiado.'); } catch { notify('Não foi possível copiar o código.'); } };
      modal.querySelector('[data-copy-link]').onclick = async () => { try { await copy(result.url); notify('Link copiado.'); } catch { notify('Não foi possível copiar o link.'); } };
    } catch (error) { console.error(error); notify('Não foi possível gerar o código de compartilhamento.'); }
  }
  async function importCode(code, askConfirmation = true) {
    const normalizedCode = String(code || '').trim();
    if (!CODE_RE.test(normalizedCode)) { notify('Código inválido. Use os 12 caracteres do compartilhamento.'); return false; }
    if (!API) { notify('Compartilhamento remoto não está configurado nesta versão.'); return false; }
    try {
      const response = await fetch(`${API}/api/share/${encodeURIComponent(normalizedCode)}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw Error(response.status === 404 ? 'not-found' : 'remote-failed');
      const payload = await response.json();
      if (payload?.app !== 'Minha Lista de Supermercado' || !['shared-list-v2', 'shared-list-v3', 'shared-list-v3-compact'].includes(payload?.format) || ![2, 3].includes(payload?.version) || !payload.list || !Array.isArray(payload.list.items) || !Array.isArray(payload.catalogs)) throw Error('incompatible');
      if (askConfirmation && !confirm(`Importar a lista "${String(payload.list.name || 'Lista compartilhada').slice(0, 120)}"?\n\nEla será adicionada como uma nova lista.`)) return false;
      const existing = await all('catalogs');
      const byKey = new Map(existing.map((catalog) => [`${norm(catalog.name)}|${norm(catalog.brand)}|${norm(catalog.unit || 'un')}`, catalog.id]));
      const map = new Map(); const newCatalogs = [];
      for (const catalog of payload.catalogs) {
        if (!catalog || typeof catalog.name !== 'string' || !catalog.name.trim()) throw Error('invalid-catalog');
        const key = `${norm(catalog.name)}|${norm(catalog.brand)}|${norm(catalog.unit || 'un')}`; const found = byKey.get(key);
        if (found) { map.set(catalog.id, found); continue; }
        const created = { ...catalog, id: uid(), name: String(catalog.name).slice(0, 120), brand: String(catalog.brand || '').slice(0, 120), unit: String(catalog.unit || 'un').slice(0, 60), category: String(catalog.category || 'Outros').slice(0, 80), notes: String(catalog.notes || '').slice(0, 2000), ean: String(catalog.ean || '').replace(/\D/g, '').slice(0, 14) };
        newCatalogs.push(created); map.set(catalog.id, created.id);
      }
      const items = payload.list.items.map((item) => { const mainItemId = map.get(item.mainItemId); if (!mainItemId) throw Error('invalid-reference'); const copyItem = { ...item, id: uid(), mainItemId }; delete copyItem.inventory; delete copyItem.stock; return copyItem; });
      const now = new Date().toISOString(); const newList = { ...payload.list, id: uid(), name: String(payload.list.name || 'Lista compartilhada').slice(0, 120), createdAt: now, updatedAt: now, archived: false, items };
      await writeImported(newList, newCatalogs); notify('Lista importada com sucesso.'); setTimeout(() => location.reload(), 350); return true;
    } catch (error) { console.error(error); notify(error.message === 'not-found' ? 'Código expirado ou não encontrado.' : 'Não foi possível importar a lista. Nenhum dado foi alterado.'); return false; }
  }
  function openShareMenu() {
    all('lists').then((lists) => {
      const active = lists.filter((list) => !list.archived);
      const modal = modalBase('Compartilhamento', `<div class="panel"><h3 style="margin-top:0">Compartilhar uma lista</h3><p class="muted">Gere um código curto para enviar a outra pessoa.</p><div class="field"><label for="mlShareList">Lista</label><select id="mlShareList" class="select">${active.map((list) => `<option value="${String(list.id).replace(/\"/g, '&quot;')}">${String(list.name).replace(/[&<>\"]/g, '')}</option>`).join('')}</select></div><button type="button" class="btn primary" style="margin-top:10px" data-generate ${active.length ? '' : 'disabled'}>Gerar código</button></div><div class="panel"><h3 style="margin-top:0">Importar por código</h3><p class="muted">Cole o código de 12 caracteres recebido.</p><input id="mlShareCode" class="input" inputmode="text" autocomplete="off" maxlength="12" placeholder="Ex.: 9EDme3EzZjqI" style="text-transform:none"><button type="button" class="btn primary" style="margin-top:10px" data-import>Importar lista</button></div>${active.length ? '' : '<p class="hint">Crie uma lista antes de compartilhar.</p>'}`);
      modal.querySelector('[data-generate]')?.addEventListener('click', async () => { const id = modal.querySelector('#mlShareList')?.value; if (!id) return; closeModal(modal); await shareListById(id); });
      modal.querySelector('[data-import]')?.addEventListener('click', async () => { const code = modal.querySelector('#mlShareCode')?.value; if (await importCode(code)) closeModal(modal); });
    }).catch((error) => { console.error(error); notify('Não foi possível abrir o compartilhamento.'); });
  }
  async function consumeIncomingCode() {
    const sid = new URLSearchParams(location.search).get('shared');
    if (!sid || window.__mlShareIncomingHandled) return;
    window.__mlShareIncomingHandled = true; history.replaceState(null, '', location.pathname); await importCode(sid);
  }
  function requestServiceWorkerUpdate() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistration('./').then((registration) => registration?.update()).catch(() => {});
  }
  function bind() {
    const button = document.getElementById('shareListBtn');
    if (!button || button.dataset.mlShareConfigBound === '2') return;
    button.dataset.mlShareConfigBound = '2'; button.type = 'button';
    button.addEventListener('click', (event) => { event.preventDefault(); event.stopImmediatePropagation(); openShareMenu(); }, true);
  }
  function init() { bind(); requestServiceWorkerUpdate(); setTimeout(bind, 300); setTimeout(consumeIncomingCode, 700); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
  new MutationObserver(bind).observe(document.documentElement, { childList: true, subtree: true });
})();
