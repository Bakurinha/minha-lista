// V2.3.3 — Compatibilidade do módulo antigo de compartilhamento.
// O fluxo oficial está em share-config.js e usa código de 12 caracteres.
// Este arquivo é deliberadamente inerte: não abre seletor de arquivos,
// não pede JSON e não registra nenhum listener de compartilhamento.
(() => {
  'use strict';
  window.__mlShareOptimizedLoaded = true;
  window.__mlShareOptimizedLegacyDisabled = true;
})();
