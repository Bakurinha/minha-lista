/**
 * Ponte de compatibilidade da abertura do IndexedDB V2.3.0.
 *
 * A página continua usando indexedDB.open() pelo núcleo legado, mas a abertura
 * do MinhaListaDB passa primeiro pelo contrato oficial de migrações.
 * Nenhum outro banco do navegador é afetado.
 *
 * Também normaliza conteúdo legado de privacidade antes que a interface seja
 * exibida. Isso evita que instalações/caches antigos exponham a versão 2.2.2
 * ou uma descrição de compartilhamento que não corresponde ao fluxo atual.
 */
(() => {
  'use strict';

  const LEGACY_VERSION = /\bV?2\.2\.2\b/gi;

  function normalizeLegacyPrivacy(root = document) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION'].includes(parent.tagName)) continue;
      if (LEGACY_VERSION.test(node.nodeValue || '')) nodes.push(node);
      LEGACY_VERSION.lastIndex = 0;
    }

    nodes.forEach((node) => {
      node.nodeValue = String(node.nodeValue || '')
        .replace(LEGACY_VERSION, 'esta versão')
        .replace(/esta versão não envia o conteúdo das listas para servidores/gi, 'esta versão só envia dados quando você solicita o compartilhamento')
        .replace(/não possui Analytics, login, Firebase ou banco de usuários/gi, 'não usa login nem banco de usuários para o funcionamento local');
      LEGACY_VERSION.lastIndex = 0;
    });
  }

  // Instala antes do app.js, pois este arquivo é carregado diretamente no HTML.
  // O observer também cobre modais criados dinamicamente pelo núcleo legado.
  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
    normalizeLegacyPrivacy();
    const privacyObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              if (LEGACY_VERSION.test(node.nodeValue || '')) {
                node.nodeValue = String(node.nodeValue || '').replace(LEGACY_VERSION, 'esta versão');
                LEGACY_VERSION.lastIndex = 0;
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              normalizeLegacyPrivacy(node);
            }
          });
        } else if (mutation.type === 'characterData') {
          normalizeLegacyPrivacy(mutation.target.parentElement || document);
        }
      }
    });
    privacyObserver.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
    window.__mlLegacyPrivacyGuardV230 = true;
  }

  const migrations = window.__mlDbMigrationsV230;
  const nativeIndexedDB = window.indexedDB;

  if (!migrations || !nativeIndexedDB || typeof nativeIndexedDB.open !== 'function') return;
  if (nativeIndexedDB.__mlV230BridgeInstalled) return;

  const nativeOpen = nativeIndexedDB.open.bind(nativeIndexedDB);

  const facade = new Proxy(nativeIndexedDB, {
    get(target, property) {
      if (property === '__mlV230BridgeInstalled') return true;
      if (property === 'open') {
        return (name, version) => {
          const request = nativeOpen(name, version);
          if (name === migrations.DB_NAME && version === migrations.LATEST) {
            request.addEventListener(
              'upgradeneeded',
              (event) => {
                migrations.migrate(request.result, event.oldVersion, event.newVersion || version);
              },
              { once: true }
            );
          }
          return request;
        };
      }
      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  window.indexedDB = facade;
  window.__mlDbOpenBridgeV230 = { DB_NAME: migrations.DB_NAME, LATEST: migrations.LATEST };
})();
