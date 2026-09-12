(() => {
  'use strict';

  /**
   * Camada visual V3 sobre o núcleo existente.
   * Reutiliza os botões atuais de navegação para não duplicar regras de negócio.
   */
  const ICONS = Object.freeze({
    listsView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
    catalogView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H20v14H5.5A1.5 1.5 0 0 0 4 19.5v-14Z"/><path d="M4 19.5A1.5 1.5 0 0 1 5.5 18H20M8 8h8M8 12h8"/></svg>',
    wishlistView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.6 4.6 0 0 1 12 6.5a4.6 4.6 0 0 1 8.8 2.3Z"/></svg>',
    historyView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 4.5v5h5M12 7v5l3.5 2"/></svg>',
    settingsView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z"/><path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4V19a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 3.6 11H3a2 2 0 0 1 0-4h.2A2 2 0 0 0 4.6 3.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 11 2.2V2a2 2 0 0 1 4 0v.2a2 2 0 0 0 1.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 19.6 7h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-.2 4Z"/></svg>',
  });

  const STYLE = `
    :root {
      --v3-accent: #16a34a;
      --v3-accent-soft: rgba(22,163,74,.10);
      --v3-focus: 0 0 0 3px rgba(34,197,94,.16);
    }
    body.v3-ui {
      background:
        radial-gradient(circle at 0% 0%, rgba(22,163,74,.08), transparent 34%),
        var(--bg);
    }
    body.v3-ui .app {
      width: min(100%, 760px);
      max-width: 760px;
      padding-inline: 16px;
    }
    body.v3-ui .panel,
    body.v3-ui .card {
      border-radius: 18px;
      box-shadow: 0 8px 28px rgba(20,40,28,.055);
    }
    body.v3-ui .panel { padding: 16px; }
    body.v3-ui .top {
      position: sticky;
      top: 0;
      z-index: 25;
      padding: 10px 0 12px;
      margin-inline: -2px;
      background: color-mix(in srgb, var(--bg) 88%, transparent);
      backdrop-filter: blur(12px);
    }
    body.v3-ui .v3-menu-toggle {
      width: 46px;
      height: 46px;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--card);
      color: var(--text);
      display: grid;
      place-items: center;
      font: inherit;
      font-size: 23px;
      box-shadow: 0 4px 14px rgba(0,0,0,.05);
      cursor: pointer;
      flex: 0 0 auto;
    }
    body.v3-ui .top > div:first-child {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    body.v3-ui .top h1 { font-size: 25px; }
    body.v3-ui .badge {
      border: 1px solid rgba(22,163,74,.16);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.25);
    }
    body.v3-ui .nav {
      position: fixed;
      inset: 0 auto 0 0;
      width: min(88vw, 320px);
      height: 100dvh;
      padding: max(18px, env(safe-area-inset-top)) 12px max(18px, env(safe-area-inset-bottom));
      background: var(--card);
      border: 0;
      border-right: 1px solid var(--border);
      box-shadow: 18px 0 50px rgba(0,0,0,.12);
      transform: translateX(-104%);
      transition: transform .22s ease;
      z-index: 100;
      overflow: auto;
      backdrop-filter: blur(16px);
    }
    body.v3-ui.v3-menu-open .nav { transform: translateX(0); }
    body.v3-ui .nav-inner {
      max-width: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-top: 58px;
    }
    body.v3-ui .nav button {
      display: grid;
      grid-template-columns: 28px 1fr;
      align-items: center;
      gap: 10px;
      min-height: 48px;
      padding: 8px 12px;
      text-align: left;
      border: 1px solid transparent;
      border-radius: 14px;
      font-size: 14px;
    }
    body.v3-ui .nav button.active {
      border-color: rgba(22,163,74,.16);
      background: var(--v3-accent-soft);
    }
    body.v3-ui .nav-icon {
      display: grid;
      place-items: center;
      margin: 0;
      font-size: 0;
    }
    body.v3-ui .nav-icon svg {
      width: 22px;
      height: 22px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    body.v3-ui .v3-menu-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.38);
      z-index: 90;
      opacity: 0;
      visibility: hidden;
      transition: opacity .2s ease, visibility .2s ease;
    }
    body.v3-ui.v3-menu-open .v3-menu-overlay {
      opacity: 1;
      visibility: visible;
    }
    body.v3-ui .v3-drawer-title {
      position: absolute;
      top: max(18px, env(safe-area-inset-top));
      left: 14px;
      right: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 46px;
      color: var(--text);
      font-weight: 850;
    }
    body.v3-ui .v3-drawer-close {
      width: 42px;
      height: 42px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--card);
      color: var(--text);
      font: inherit;
      font-size: 21px;
      cursor: pointer;
    }
    body.v3-ui .input:focus,
    body.v3-ui .select:focus,
    body.v3-ui .textarea:focus,
    body.v3-ui .btn:focus-visible,
    body.v3-ui .iconbtn:focus-visible,
    body.v3-ui .v3-menu-toggle:focus-visible,
    body.v3-ui .v3-drawer-close:focus-visible {
      outline: none;
      box-shadow: var(--v3-focus);
    }
    body.v3-ui .btn,
    body.v3-ui .iconbtn,
    body.v3-ui .close { transition: transform .12s ease, box-shadow .12s ease; }
    body.v3-ui .btn:active,
    body.v3-ui .iconbtn:active,
    body.v3-ui .close:active,
    body.v3-ui .v3-menu-toggle:active { transform: translateY(1px); }
    @media (min-width: 821px) {
      body.v3-ui .app { padding-top: 18px; }
    }
    @media (max-width: 620px) {
      body.v3-ui .app { width: 100%; padding-inline: 12px; }
      body.v3-ui .top h1 { font-size: 22px; }
      body.v3-ui .top .sub { font-size: 12px; }
    }
    @media (prefers-reduced-motion: reduce) {
      body.v3-ui .nav,
      body.v3-ui .v3-menu-overlay { transition: none; }
    }
  `;

  function closeMenu() {
    document.body.classList.remove('v3-menu-open');
  }

  function openMenu() {
    document.body.classList.add('v3-menu-open');
  }

  function install() {
    if (document.body.dataset.v3ShellInstalled === '1') return;

    const nav = document.querySelector('.nav');
    const top = document.querySelector('.top');
    const navInner = nav?.querySelector('.nav-inner');
    if (!nav || !top || !navInner) return;

    document.body.dataset.v3ShellInstalled = '1';
    document.body.classList.add('v3-ui');

    const style = document.createElement('style');
    style.id = 'v3-shell-style';
    style.textContent = STYLE;
    document.head.appendChild(style);

    const titleWrap = top.firstElementChild;
    if (titleWrap && !titleWrap.querySelector('.v3-menu-toggle')) {
      const toggle = document.createElement('button');
      toggle.className = 'v3-menu-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Abrir menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
      toggle.addEventListener('click', () => {
        const open = !document.body.classList.contains('v3-menu-open');
        document.body.classList.toggle('v3-menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      });
      titleWrap.prepend(toggle);
    }

    const drawerTitle = document.createElement('div');
    drawerTitle.className = 'v3-drawer-title';
    drawerTitle.innerHTML = '<span>Minha Lista</span>';

    const close = document.createElement('button');
    close.className = 'v3-drawer-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar menu');
    close.textContent = '×';
    close.addEventListener('click', closeMenu);
    drawerTitle.appendChild(close);

    nav.appendChild(drawerTitle);

    const overlay = document.createElement('div');
    overlay.className = 'v3-menu-overlay';
    overlay.addEventListener('click', closeMenu);
    document.body.appendChild(overlay);

    navInner.querySelectorAll('button[data-view]').forEach((button) => {
      const icon = button.querySelector('.nav-icon');
      const view = button.dataset.view;
      if (icon && ICONS[view]) icon.innerHTML = ICONS[view];
      button.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
