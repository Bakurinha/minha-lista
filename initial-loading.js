(() => {
  'use strict';

  const ID = 'initialLoading';
  const STYLE_ID = 'initialLoadingStyle';
  const BODY_CLASS = 'initial-loading-active';
  const MAX_WAIT_MS = 45000;

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      body.${BODY_CLASS} > *:not(#${ID}) {
        visibility: hidden !important;
      }
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
        width: min(360px, calc(100vw - 40px));
        box-sizing: border-box;
        text-align: center;
        padding: 28px 24px;
      }
      #${ID} .initial-loading-title {
        font-size: 22px;
        font-weight: 800;
        letter-spacing: -0.2px;
      }
      #${ID} .initial-loading-subtitle {
        margin-top: 6px;
        color: var(--muted, #68736c);
        font-size: 13px;
      }
      #${ID} .initial-loading-spinner {
        width: 28px;
        height: 28px;
        margin: 0 auto 13px;
        border: 3px solid rgba(22, 163, 74, .18);
        border-top-color: var(--primary, #16a34a);
        border-radius: 50%;
        animation: initialLoadingSpin .7s linear infinite;
      }
      @keyframes initialLoadingSpin {
        to { transform: rotate(360deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        #${ID} .initial-loading-spinner { animation-duration: 1.4s; }
      }
    `;
    document.head.appendChild(style);
  }

  function mount() {
    if (!document.body) return;
    installStyle();
    document.body.classList.add(BODY_CLASS);

    if (document.getElementById(ID)) return;
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

  function appReady() {
    return window.__mlAppReadyV230?.ready === true;
  }

  function referenceReady() {
    return window.__mlReferenceReadyV230?.ready === true;
  }

  function uiReady() {
    const body = document.body;
    return (
      body?.dataset?.v3IconsInstalled === '1' &&
      body?.dataset?.v3ShellInstalled === '1' &&
      body?.dataset?.mlSearchControlsInstalled === '1'
    );
  }

  function hide() {
    const overlay = document.getElementById(ID);
    if (!overlay) return;
    document.body.classList.remove(BODY_CLASS);
    overlay.classList.add('is-hidden');
    setTimeout(() => overlay.remove(), 220);
  }

  function watch() {
    const started = Date.now();
    const timer = setInterval(() => {
      if ((appReady() && referenceReady() && uiReady()) || Date.now() - started >= MAX_WAIT_MS) {
        clearInterval(timer);
        hide();
      }
    }, 50);
  }

  function init() {
    mount();
    watch();
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init, { once: true });
})();
