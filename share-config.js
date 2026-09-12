// V2.3.1 — endpoint remoto + correção do fluxo do botão Compartilhar.
// O botão precisa ser tratado aqui porque o app legado e o módulo otimizado
// estavam competindo pelo mesmo clique e o módulo procurava #listSelect,
// elemento que não existe na interface real.
window.MINHA_LISTA_SHARE_API = 'https://minha-lista.suportebakura.workers.dev';

(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const API = String(window.MINHA_LISTA_SHARE_API || '').replace(/\/+$/, '');
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
        if (db.objectStoreNames.contains('catalogs') && db.objectStoreNames.contains('lists'))
          return db;
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

  async function all(store) {
    const db = await openReady();
    return new Promise((resolve, reject) => {
      const request = db.transaction(store, 'readonly').objectStore(store).getAll();
      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  }

  const norm = (value) =>
    String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');

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

  async function shareRemote(list) {
    const catalogs = await all('catalogs');
    const payload = cleanPayload(list, catalogs);
    const response = await fetch(`${API}/api/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    if (!response.ok) throw Error(`share-http-${response.status}`);
    const data = await response.json();
    if (!data?.url) throw Error('share-response');
    return String(data.url);
  }

  async function copy(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const area = document.createElement('textarea');
    area.value = text;
    area.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }

  function closeModal(modal) {
    modal?.remove();
  }

  function showLink(list, link) {
    if (navigator.share) {
      navigator
        .share({
          title: `Minha Lista — ${list.name}`,
          text: `Lista compartilhada: ${list.name}`,
          url: link,
        })
        .catch((error) => {
          if (error?.name !== 'AbortError') showLinkModal(list, link);
        });
      return;
    }
    showLinkModal(list, link);
  }

  function showLinkModal(list, link) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `<div class="sheet"><div class="sheet-head"><h2>Compartilhar lista</h2><button type="button" class="close" data-close>×</button></div><p class="muted">Link curto da lista <strong>${String(list.name).replace(/[&<>\"]/g, '')}</strong></p><input class="input" readonly value="${link.replace(/&/g, '&amp;').replace(/\"/g, '&quot;')}"><div class="row" style="margin-top:10px"><button type="button" class="btn primary" data-copy>Copiar link</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('[data-close]').onclick = () => closeModal(modal);
    modal.querySelector('[data-copy]').onclick = async () => {
      try {
        await copy(link);
        notify('Link copiado.');
      } catch {
        notify('Não foi possível copiar o link.');
      }
    };
  }

  async function shareListById(id) {
    const lists = await all('lists');
    const list = lists.find((item) => item.id === id && !item.archived);
    if (!list) return notify('A lista selecionada não foi encontrada.');
    try {
      const link = await shareRemote(list);
      showLink(list, link);
    } catch (error) {
      console.error(error);
      notify('Não foi possível gerar o link de compartilhamento.');
    }
  }

  async function openShareChooser() {
    const lists = (await all('lists')).filter((list) => !list.archived);
    if (!lists.length) return notify('Crie uma lista primeiro.');
    if (lists.length === 1) return shareListById(lists[0].id);

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `<div class="sheet"><div class="sheet-head"><h2>Compartilhar lista</h2><button type="button" class="close" data-close>×</button></div><div class="field"><label for="mlShareSelect">Escolha a lista</label><select id="mlShareSelect" class="select">${lists.map((list) => `<option value="${String(list.id).replace(/\"/g, '&quot;')}">${String(list.name).replace(/[&<>\"]/g, '')}</option>`).join('')}</select></div><button type="button" class="btn primary" style="margin-top:12px" data-share>Compartilhar</button></div>`;
    document.body.appendChild(modal);
    modal.querySelector('[data-close]').onclick = () => closeModal(modal);
    modal.querySelector('[data-share]').onclick = async () => {
      const id = modal.querySelector('#mlShareSelect')?.value;
      closeModal(modal);
      if (id) await shareListById(id);
    };
  }

  function bind() {
    const button = document.getElementById('shareListBtn');
    if (!button || button.dataset.mlShareConfigBound === '1') return;
    button.dataset.mlShareConfigBound = '1';
    button.type = 'button';
    button.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        openShareChooser().catch((error) => {
          console.error(error);
          notify('Não foi possível abrir o compartilhamento.');
        });
      },
      true
    );
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
  new MutationObserver(bind).observe(document.documentElement, { childList: true, subtree: true });
})();
