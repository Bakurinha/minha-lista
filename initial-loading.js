(() => {
  'use strict';

  const ID = 'initialLoading';
  const STYLE_ID = 'initialLoadingStyle';

  function mount() {
    if (!document.body || document.getElementById(ID)) return;

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        #${ID} {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          background: var(--bg, #f4f7f5);
          color: var(--text, #172019);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: opacity .18s ease, visibility .18s ease;
        }
        #${ID}.is-hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        #${ID} .initial-loading-box {
          text-align: center;
          padding: 24px;
        }
        #${ID} .initial-loading-title {
          font-size: 20px;
          font-weight: 800;
        }
        #${ID} .initial-loading-subtitle {
          margin-top: 6px;
          color: var(--muted, #68736c);
          font-size: 13px;
        }
        #${ID} .initial-loading-spinner {
          width: 26px;
          height: 26px;
          margin: 0 auto 12px;
          border: 3px solid rgba(22,163,74,.18);
          border-top-color: var(--primary, #16a34a);
          border-radius: 50%;
          animation: initialLoadingSpin .7s linear infinite;
        }
        @keyframes initialLoadingSpin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    const overlay = document.createElement('div');
    overlay.id = ID;
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = `
      <div class="initial-loading-box">
        <div class="initial-loading-spinner" aria-hidden="true"></div>
        <div class="initial-loading-title">Minha Lista</div>
        <div class="initial-loading-subtitle">carregando...</div>
      </div>
    `;
    document.body.prepend(overlay);
  }

  function isAppRendered() {
    const cards = document.getElementById('listsCards');
    return !!cards && (cards.children.length > 0 || cards.innerHTML.trim() !== '');
  }

  function hide() {
    const overlay = document.getElementById(ID);
    if (!overlay) return;
    overlay.classList.add('is-hidden');
    setTimeout(() => overlay.remove(), 220);
  }

  function watch() {
    const started = Date.now();
    const timer = setInterval(() => {
      if (isAppRendered() || Date.now() - started >= 10000) {
        clearInterval(timer);
        hide();
      }
    }, 50);
  }

  function init() {
    mount();
    watch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
