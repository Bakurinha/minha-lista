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
    inventoryView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5 12 4l8 4.5v9L12 22l-8-4.5v-9Z"/><path d="M4 8.5 12 13l8-4.5M12 13v9M8 6.2l8 4.6"/></svg>',
    settingsView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z"/><path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4V19a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 3.6 11H3a2 2 0 0 1 0-4h.2A2 2 0 0 0 4.6 3.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 11 2.2V2a2 2 0 0 1 4 0v.2a2 2 0 0 0 1.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 19.6 7h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-.2 4Z"/></svg>',
  });

  const STYLE = `
    :root { --v3-accent:#16a34a; --v3-accent-soft:rgba(22,163,74,.10); --v3-focus:0 0 0 3px rgba(34,197,94,.16); }
    body.v3-ui { background:radial-gradient(circle at 50% -10%,rgba(22,163,74,.10),transparent 38%),var(--bg); letter-spacing:-.01em; }
    body.v3-ui .app { width:min(100%,780px); max-width:780px; padding:18px 18px 104px; }
    body.v3-ui .top { position:sticky; top:0; z-index:25; padding:10px 0 16px; margin:-2px 0 8px; background:color-mix(in srgb,var(--bg) 86%,transparent); backdrop-filter:blur(16px) saturate(1.15); }
    body.v3-ui .top > div:first-child { display:flex; align-items:center; gap:12px; min-width:0; }
    body.v3-ui .top h1 { font-size:clamp(22px,5vw,28px); letter-spacing:-.04em; line-height:1.05; }
    body.v3-ui .top .sub { opacity:.78; }
    body.v3-ui .badge { min-width:46px; height:46px; border-radius:15px; background:var(--v3-accent-soft); color:var(--v3-accent); border:1px solid rgba(22,163,74,.14); box-shadow:0 5px 18px rgba(22,163,74,.08); }
    body.v3-ui .panel, body.v3-ui .card { border-radius:20px; box-shadow:0 10px 30px rgba(20,40,28,.045); }
    body.v3-ui .panel { padding:18px; margin-bottom:14px; }
    body.v3-ui .card { padding:15px; transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease; }
    body.v3-ui .card:hover { transform:translateY(-1px); box-shadow:0 13px 34px rgba(20,40,28,.07); }
    body.v3-ui .section-title { font-size:18px; letter-spacing:-.025em; }
    body.v3-ui .input, body.v3-ui .select, body.v3-ui .textarea { border-radius:14px; min-height:46px; border-color:color-mix(in srgb,var(--border) 86%,transparent); box-shadow:inset 0 1px 1px rgba(0,0,0,.02); }
    body.v3-ui .btn, body.v3-ui .iconbtn, body.v3-ui .close { border-radius:14px; }
    body.v3-ui .btn { min-height:46px; padding-inline:15px; }
    body.v3-ui .btn.primary { box-shadow:0 5px 14px rgba(22,163,74,.15); }
    body.v3-ui .btn.ghost, body.v3-ui .iconbtn, body.v3-ui .close { background:color-mix(in srgb,var(--card) 88%,var(--soft)); border:1px solid var(--border); }
    body.v3-ui .stats { gap:10px; }
    body.v3-ui .stat { border:1px solid color-mix(in srgb,var(--border) 65%,transparent); background:color-mix(in srgb,var(--card) 72%,var(--soft)); border-radius:15px; padding:12px 9px; }
    body.v3-ui .subcard { border-radius:16px; padding:13px; }
    body.v3-ui .item { padding:13px 2px; }
    body.v3-ui .check { width:27px; height:27px; border-radius:9px; }
    body.v3-ui .nav { position:fixed; inset:0 auto 0 0; width:min(88vw,340px); height:100dvh; padding:max(18px,env(safe-area-inset-top)) 13px max(18px,env(safe-area-inset-bottom)); background:color-mix(in srgb,var(--card) 94%,transparent); border:0; border-right:1px solid var(--border); box-shadow:22px 0 60px rgba(0,0,0,.15); transform:translateX(-104%); transition:transform .22s cubic-bezier(.2,.8,.2,1); z-index:100; overflow:auto; backdrop-filter:blur(20px) saturate(1.1); }
    body.v3-ui.v3-menu-open .nav { transform:translateX(0); }
    body.v3-ui .nav-inner { max-width:none; display:flex; flex-direction:column; gap:5px; padding-top:62px; }
    body.v3-ui .nav button { display:grid; grid-template-columns:34px 1fr; align-items:center; gap:11px; min-height:52px; padding:9px 12px; text-align:left; border:1px solid transparent; border-radius:15px; font-size:14px; font-weight:750; color:var(--muted); transition:background .15s ease,color .15s ease,transform .12s ease; }
    body.v3-ui .nav button:hover { background:var(--v3-accent-soft); color:var(--text); }
    body.v3-ui .nav button:active { transform:scale(.985); }
    body.v3-ui .nav button.active { border-color:rgba(22,163,74,.14); background:var(--v3-accent-soft); color:var(--v3-accent); }
    body.v3-ui .nav-icon { width:34px; height:34px; display:grid; place-items:center; margin:0; font-size:0; border-radius:11px; background:color-mix(in srgb,var(--card) 78%,var(--soft)); }
    body.v3-ui .nav button.active .nav-icon { background:rgba(22,163,74,.13); }
    body.v3-ui .nav-icon svg { width:21px; height:21px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
    body.v3-ui .v3-menu-overlay { position:fixed; inset:0; background:rgba(5,10,7,.42); z-index:90; opacity:0; visibility:hidden; pointer-events:none; transition:opacity .2s ease,visibility .2s ease; backdrop-filter:blur(2px); }
    body.v3-ui.v3-menu-open .v3-menu-overlay { opacity:1; visibility:visible; pointer-events:auto; }
    body.v3-ui .v3-drawer-title { position:absolute; top:max(18px,env(safe-area-inset-top)); left:14px; right:14px; display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:46px; color:var(--text); font-weight:850; letter-spacing:-.02em; }
    body.v3-ui .v3-drawer-close { width:42px; height:42px; border:1px solid var(--border); border-radius:12px; background:var(--card); color:var(--text); font:inherit; font-size:21px; cursor:pointer; display:grid; place-items:center; position:relative; z-index:2; }
    body.v3-ui .v3-menu-toggle { width:46px; height:46px; border:1px solid var(--border); border-radius:14px; background:var(--card); color:var(--text); display:grid; place-items:center; font:inherit; font-size:0; box-shadow:0 5px 16px rgba(0,0,0,.055); cursor:pointer; flex:0 0 auto; position:relative; }
    body.v3-ui .v3-menu-toggle::before { content:'☰'; font-size:21px; line-height:1; }
    body.v3-ui.v3-menu-open .v3-menu-toggle::before { content:'×'; font-size:25px; }
    body.v3-ui .input:focus, body.v3-ui .select:focus, body.v3-ui .textarea:focus, body.v3-ui .btn:focus-visible, body.v3-ui .iconbtn:focus-visible, body.v3-ui .v3-menu-toggle:focus-visible, body.v3-ui .v3-drawer-close:focus-visible { outline:none; box-shadow:var(--v3-focus); }
    body.v3-ui .btn, body.v3-ui .iconbtn, body.v3-ui .close, body.v3-ui .v3-menu-toggle { transition:transform .12s ease,box-shadow .12s ease; }
    body.v3-ui .btn:active, body.v3-ui .iconbtn:active, body.v3-ui .close:active, body.v3-ui .v3-menu-toggle:active { transform:translateY(1px); }
    @media (min-width:821px) { body.v3-ui .app { padding-top:24px; } }
    @media (max-width:620px) { body.v3-ui .app { width:100%; padding:10px 12px 102px; } body.v3-ui .top { padding-bottom:13px; } body.v3-ui .top h1 { font-size:22px; } body.v3-ui .top .sub { font-size:12px; } body.v3-ui .panel { padding:15px; border-radius:18px; } body.v3-ui .card { border-radius:17px; } body.v3-ui .nav { width:min(88vw,330px); } }
    @media (prefers-reduced-motion:reduce) { body.v3-ui .nav,body.v3-ui .v3-menu-overlay,body.v3-ui .card { transition:none; } }
  `;

  function syncNavButtons(navInner) {
    navInner.querySelectorAll('button[data-view]').forEach((button) => {
      const icon = button.querySelector('.nav-icon');
      const view = button.dataset.view;
      if (icon && ICONS[view]) icon.innerHTML = ICONS[view];
      if (button.dataset.v3Bound === '1') return;
      button.dataset.v3Bound = '1';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeMenu(event);
      });
    });
  }

  function closeMenu(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    document.body.classList.remove('v3-menu-open');
    const toggle = document.querySelector('.v3-menu-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    }
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
      toggle.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          const open = !document.body.classList.contains('v3-menu-open');
          document.body.classList.toggle('v3-menu-open', open);
          toggle.setAttribute('aria-expanded', String(open));
          toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        },
        true
      );
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
    close.addEventListener('click', closeMenu, true);
    drawerTitle.appendChild(close);
    nav.appendChild(drawerTitle);

    const overlay = document.createElement('div');
    overlay.className = 'v3-menu-overlay';
    overlay.addEventListener('click', closeMenu, true);
    document.body.appendChild(overlay);

    syncNavButtons(navInner);
    const observer = new MutationObserver(() => syncNavButtons(navInner));
    observer.observe(navInner, { childList: true, subtree: true });

    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') closeMenu(event);
      },
      true
    );
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
