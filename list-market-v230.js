(() => {
  'use strict';

  // Entrada do runtime V2.3.x. O mercado da lista agora é tratado nativamente
  // pelo núcleo (app.js); este arquivo mantém o bootstrap por compatibilidade.
  const MODULES = [
    './v3-icons.js',
    './v3-icon-force.js',
    './share-config.js',
    './backup-v230.js',
    './share-optimized-v230.js',
    './enhancements.js',
    './inventory.js',
    './list-enhancements.js',
    './etapa2-keep-list.js',
    './db-integrity-v230.js',
    './version-v230.js',
    './v3-shell.js',
    './v3-compact-controls.js',
    './reference-market-refresh.js',
  ];

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .catch((error) => console.error('Service Worker: registro indisponível.', error));
  }

  function finish() {
    window.__mlRuntimeReadyV230 = true;
    window.dispatchEvent(new CustomEvent('ml:runtime-ready'));
    registerServiceWorker();
  }

  function loadSequentially(index = 0) {
    if (index >= MODULES.length) {
      finish();
      return;
    }

    const src = MODULES[index];
    if (document.querySelector(`script[data-v230-runtime="${src}"]`)) {
      loadSequentially(index + 1);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.dataset.v230Runtime = src;
    script.onload = () => loadSequentially(index + 1);
    script.onerror = () => {
      console.error(`V2.3.x: falha ao carregar ${src}`);
      loadSequentially(index + 1);
    };
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadSequentially(), { once: true });
  } else {
    loadSequentially();
  }
})();
