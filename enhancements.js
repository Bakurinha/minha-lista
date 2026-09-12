// V2.3.1 — Compatibilidade legada.
// O compartilhamento agora é centralizado em share-optimized-v230.js.
// Este arquivo permanece para instalações/cache antigos que ainda tentem carregá-lo.
(() => {
  'use strict';
  if (window.__mlShareOptimizedLoaded) return;
  window.__mlShareLegacyWaiting = true;
})();
