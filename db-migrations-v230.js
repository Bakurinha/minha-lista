/**
 * Migrações incrementais do IndexedDB da V2.3.0.
 *
 * Cada versão possui um passo explícito e idempotente. Os passos somente
 * criam stores ausentes: nunca apagam, limpam ou reescrevem dados existentes.
 *
 * Regra importante: a versão do banco representa o schema físico. Dados de
 * usuário são tratados pelos módulos de backup/migração e não devem ser
 * descartados durante onupgradeneeded.
 */
(() => {
  'use strict';

  const DB_NAME = 'MinhaListaDB';
  const LATEST = 6;

  // O mapa é a fonte única da sequência de criação das stores.
  // Manter versões, mesmo vazias, torna a evolução futura previsível.
  const MIGRATIONS = Object.freeze({
    1: Object.freeze(['catalogs', 'lists', 'history', 'settings']),
    2: Object.freeze(['wishlist']),
    3: Object.freeze(['trash']),
    4: Object.freeze(['referenceProducts', 'referenceMarkets']),
    5: Object.freeze([]),
    6: Object.freeze(['inventory']),
  });

  // Todas as stores usam ID como chave primária, exceto settings, que usa
  // a própria chave de configuração para evitar registros duplicados.
  const keyPath = (store) => (store === 'settings' ? 'key' : 'id');

  // Criação idempotente: abrir um banco já atualizado não altera seus dados.
  function ensureStore(db, store) {
    if (!db?.objectStoreNames?.contains(store)) {
      db.createObjectStore(store, { keyPath: keyPath(store) });
      return true;
    }
    return false;
  }

  // Executa exatamente um passo da sequência e informa quantas stores foram
  // realmente criadas. O retorno é útil para testes e diagnóstico.
  function applyVersion(db, version) {
    if (!Number.isInteger(version) || version < 1 || version > LATEST) {
      throw new RangeError(`Versão de migração inválida: ${version}`);
    }

    let created = 0;
    for (const store of MIGRATIONS[version] || []) {
      if (ensureStore(db, store)) created += 1;
    }
    return created;
  }

  // Percorre todos os passos intermediários. Isso evita caminhos especiais
  // como "2 -> 6" que poderiam esquecer uma alteração de versão anterior.
  function migrate(db, oldVersion, newVersion = LATEST) {
    if (!Number.isInteger(oldVersion) || oldVersion < 0) {
      throw new TypeError('oldVersion inválida');
    }
    if (!Number.isInteger(newVersion) || newVersion < 1) {
      throw new TypeError('newVersion inválida');
    }
    if (oldVersion > newVersion) {
      throw new Error(`Versão antiga ${oldVersion} maior que a versão alvo ${newVersion}`);
    }

    let created = 0;
    for (let version = Math.max(1, oldVersion + 1); version <= newVersion; version += 1) {
      created += applyVersion(db, version);
    }
    return created;
  }

  // Gera apenas o plano lógico da migração. Não toca no banco e é utilizado
  // pelos testes para verificar a sequência antes de uma alteração real.
  function plan(oldVersion, newVersion = LATEST) {
    if (!Number.isInteger(oldVersion) || oldVersion < 0) {
      throw new TypeError('oldVersion inválida');
    }
    if (!Number.isInteger(newVersion) || newVersion < 1) {
      throw new TypeError('newVersion inválida');
    }
    if (oldVersion > newVersion) {
      throw new Error('oldVersion não pode ser maior que newVersion');
    }

    return Object.freeze(
      Array.from({ length: newVersion - Math.max(0, oldVersion) }, (_, index) =>
        Math.max(1, oldVersion + 1 + index)
      ).flatMap((version) => MIGRATIONS[version] || [])
    );
  }

  // Abre o banco usando a mesma cadeia incremental usada nos testes.
  // O callback opcional recebe o IDBOpenDBRequest e pode complementar
  // comportamentos de abertura sem duplicar a criação de stores.
  function open(options = {}) {
    const indexedDBApi = options.indexedDB || window.indexedDB;
    const name = options.name || DB_NAME;
    const version = options.version || LATEST;
    if (!indexedDBApi || typeof indexedDBApi.open !== 'function') {
      return Promise.reject(new Error('IndexedDB indisponível'));
    }
    return new Promise((resolve, reject) => {
      const request = indexedDBApi.open(name, version);
      request.onupgradeneeded = (event) => {
        const db = request.result;
        migrate(db, event.oldVersion, event.newVersion || version);
        if (typeof options.onupgradeneeded === 'function') {
          options.onupgradeneeded(event, db, request);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Falha ao abrir IndexedDB'));
      request.onblocked = () => {
        if (typeof options.onblocked === 'function') options.onblocked(request);
      };
    });
  }

  window.__mlDbMigrationsV230 = {
    DB_NAME,
    LATEST,
    MIGRATIONS,
    keyPath,
    ensureStore,
    applyVersion,
    migrate,
    plan,
    open,
  };
})();

// Etapa 3: cria o overlay de carregamento imediatamente, antes do núcleo principal.
(() => {
  if (!document.getElementById('initialLoading')) {
    const style = document.createElement('style');
    style.id = 'initialLoadingStyle';
    style.textContent = `
      #initialLoading { position:fixed; inset:0; z-index:9999; display:grid; place-items:center; background:#f4f7f5; color:#172019; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; transition:opacity .18s ease,visibility .18s ease; }
      #initialLoading .box { text-align:center; padding:24px; }
      #initialLoading .spin { width:26px; height:26px; margin:0 auto 12px; border:3px solid rgba(22,163,74,.18); border-top-color:#16a34a; border-radius:50%; animation:initialLoadingSpin .7s linear infinite; }
      #initialLoading .title { font-size:20px; font-weight:800; }
      #initialLoading .sub { margin-top:6px; color:#68736c; font-size:13px; }
      @keyframes initialLoadingSpin { to { transform:rotate(360deg); } }
    `;
    document.head.appendChild(style);
    const overlay = document.createElement('div');
    overlay.id = 'initialLoading';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = '<div class="box"><div class="spin" aria-hidden="true"></div><div class="title">Minha Lista</div><div class="sub">carregando...</div></div>';
    document.body.prepend(overlay);
  }
  const script = document.createElement('script');
  script.src = './initial-loading.js';
  script.async = false;
  script.dataset.v230InitialLoading = '1';
  document.head.appendChild(script);
})();

// Etapa 4: a primeira tela usa o conteúdo atual de privacidade sem alterar
// o fluxo de confirmação já implementado em app.js.
(() => {
  'use strict';

  const TITLE_PATTERN = /^\s*(?:🔐\s*)?Privacidade dos seus dados\s*$/u;

  function isFirstRunPrivacy(title) {
    return TITLE_PATTERN.test(String(title?.textContent || ''));
  }

  function updateFirstRunPrivacy() {
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    if (!isFirstRunPrivacy(title) || !body) return false;

    title.textContent = 'Privacidade dos seus dados';

    const action = body.querySelector('#privacyUnderstand');
    if (!action) return false;

    const updated = document.createDocumentFragment();
    const notice = document.createElement('div');
    notice.className = 'notice';
    notice.innerHTML = '<strong>Esta versão é local.</strong><br>Seus produtos, listas, preços e observações são armazenados localmente neste dispositivo. A V2.2.2 não envia o conteúdo das listas para servidores, não coleta preços, não possui Analytics, login, Firebase ou banco de usuários.';
    updated.appendChild(notice);

    const backup = document.createElement('div');
    backup.className = 'panel';
    backup.style.marginTop = '10px';
    backup.innerHTML = '<strong>Backup e compartilhamento</strong><br><span class="muted">Ao exportar ou compartilhar, você escolhe manualmente onde o arquivo será salvo/enviado usando os recursos do próprio aparelho. O aplicativo não envia esses dados por conta própria.</span>';
    updated.appendChild(backup);

    const storage = document.createElement('div');
    storage.className = 'panel';
    storage.innerHTML = '<strong>Armazenamento</strong><br><span class="muted">O IndexedDB não é criptografia. Se o dispositivo ou navegador for comprometido, o armazenamento local não deve ser considerado um cofre de dados.</span>';
    updated.appendChild(storage);

    updated.appendChild(action);
    body.replaceChildren(updated);
    return true;
  }

  function watch() {
    const started = Date.now();
    const timer = setInterval(() => {
      if (updateFirstRunPrivacy() || Date.now() - started >= 5000) {
        clearInterval(timer);
      }
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watch, { once: true });
  } else {
    watch();
  }
})();
