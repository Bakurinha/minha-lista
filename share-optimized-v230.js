// V2.3.4 — Compatibilidade do módulo antigo de compartilhamento.
// A importação de lista compartilhada não usa arquivos JSON.
// O fluxo oficial é o compartilhamento por código em share-config.js.
(() => {
  'use strict';

  window.__mlShareOptimizedLoaded = true;
  window.__mlShareOptimizedLegacyDisabled = true;

  function redirectSharedFileImportToCode() {
    const input = document.getElementById('sharedInput');
    if (!input) return;

    const label = input.closest('label');
    if (!label) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'sharedImportBtn';
    button.className = 'btn ghost file-label';
    button.textContent = '📥 Importar lista compartilhada';
    button.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        document.getElementById('shareListBtn')?.click();
      },
      true
    );

    label.replaceWith(button);
  }

  function init() {
    redirectSharedFileImportToCode();
    setTimeout(redirectSharedFileImportToCode, 300);
    setTimeout(redirectSharedFileImportToCode, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  new MutationObserver(redirectSharedFileImportToCode).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
