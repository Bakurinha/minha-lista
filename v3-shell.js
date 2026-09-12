(() => {
  'use strict';

  /**
   * Camada visual V3 sobre o núcleo existente.
   * Reutiliza os botões atuais de navegação para não duplicar regras de negócio.
   */
  const ICONS = Object.freeze({
    listsView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14M5 12h14M5 19h14"/><path d="M3.5 5h.01M3.5 12h.01M3.5 19h.01"/></svg>',
    catalogView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14v15H5a2 2 0 0 1 0-4h14"/><path d="M5 4.5a2 2 0 0 0 0 4h14M9 12h6M9 15h6"/></svg>',
    wishlistView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 8.8c0 5-8 9.7-8 9.7S4 13.8 4 8.8A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 8 2.8Z"/></svg>',
    historyView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 5v5h5M12 7v5l3 2"/></svg>',
    inventoryView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 8-4 8 4v9l-8 4-8-4V8Z"/><path d="m4 8 8 4 8-4M12 12v9"/></svg>',
    settingsView:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M19 13.5a7.7 7.7 0 0 0 0-3l1.4-1.1-1.8-3.1-1.7.7a8 8 0 0 0-2.6-1.5L14 3.7h-3.6l-.3 1.8a8 8 0 0 0-2.6 1.5l-1.7-.7L4 9.4l1.4 1.1a7.7 7.7 0 0 0 0 3L4 14.6l1.8 3.1 1.7-.7a8 8 0 0 0 2.6 1.5l.3 1.8H14l.3-1.8a8 8 0 0 0 2.6-1.5l1.7.7 1.8-3.1-1.4-1.1Z"/></svg>',
  });

  const STYLE = `
    :root { --v3-accent:#16a34a; --v3-accent-soft:rgba(22,163,74,.10); --v3-focus:0 0 0 3px rgba(22,163,74,.18); }
    body.v3-ui { background:radial-gradient(circle at 50% -10%,rgba(22,163,74,.09),transparent 38%),var(--bg); letter-spacing:-.01em; }
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
    body.v3-ui .btn.ghost, body.v3-ui .iconbtn, body.v3-ui .close { background:color-mix(in srgb,var(--card) 88%,var(--soft)); border:1px solid var(--border); color:var(--v3-accent); }
    body.v3-ui .btn.danger { background:var(--v3-accent-soft); color:var(--v3-accent); border:1px solid rgba(22,163,74,.14); }
    body.v3-ui .stats { gap:10px; }
    body.v3-ui .stat { border:1px solid color-mix(in srgb,var(--border) 65%,transparent); background:color-mix(in srgb,var(--card) 72%,var(--soft)); border-radius:15px; padding:12px 9px; }
    body.v3-ui .subcard { border-radius:16px; padding:13px; }
    body.v3-ui .item { padding:13px 2px; }
    body.v3-ui .check { width:27px; height:27px; border-radius:9px; accent-color:var(--v3-accent); }
    body.v3-ui .nav { position:fixed; inset:0 auto 0 0; width:min(88vw,340px); height:100dvh; padding:max(18px,env(safe-area-inset-top)) 13px max(18px,env(safe-area-inset-bottom)); background:color-mix(in srgb,var(--card) 94%,transparent); border:0; border-right:1px solid var(--border); box-shadow:22px 0 60px rgba(0,0,0,.15); transform:translateX(-104%); transition:transform .22s cubic-bezier(.2,.8,.2,1); z-index:100; overflow:auto; backdrop-filter:blur(20px) saturate(1.1); }
    body.v3-ui.v3-menu-open .nav { transform:translateX(0); }
    body.v3-ui .nav-inner { max-width:none; display:flex; flex-direction:column; gap:5px; padding-top:62px; }
    body.v3-ui .nav button { display:grid; grid-template-columns:34px 1fr; align-items:center; gap:11px; min-height:52px; padding:9px 12px; text-align:left; border:1px solid transparent; border-radius:15px; font-size:14px; font-weight:750; color:var(--v3-accent); transition:background .15s ease,color .15s ease,transform .12s ease; }
    body.v3-ui .nav button:hover { background:var(--v3-accent-soft); color:var(--v3-accent); }
    body.v3-ui .nav button:active { transform:scale(.985); }
    body.v3-ui .nav button.active { border-color:rgba(22,163,74,.14); background:var(--v3-accent-soft); color:var(--v3-accent); }
    body.v3-ui .nav-icon { width:34px; height:34px; display:grid; place-items:center; margin:0; font-size:0; border-radius:11px; background:color-mix(in srgb,var(--card) 78%,var(--soft)); color:var(--v3-accent); }
    body.v3-ui .nav button.active .nav-icon { background:rgba(22,163,74,.13); }
    body.v3-ui .nav-icon svg { width:21px; height:21px; fill:none; stroke:currentColor; stroke-width:1.9; stroke-linecap:round; stroke-linejoin:round; }
    body.v3-ui .v3-menu-overlay { position:fixed; inset:0; background:rgba(5,10,7,.42); z-index:90; opacity:0; visibility:hidden; pointer-events:none; transition:opacity .2s ease,visibility .2s ease; backdrop-filter:blur(2px); }
    body.v3-ui.v3-menu-open .v3-menu-overlay { opacity:1; visibility:visible; pointer-events:auto; }
    body.v3-ui .v3-drawer-title { position:absolute; top:max(18px,env(safe-area-inset-top)); left:14px; right:14px; display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:46px; color:var(--v3-accent); font-weight:850; letter-spacing:-.02em; }
    body.v3-ui .v3-drawer-close { width:42px; height:42px; border:1px solid var(--border); border-radius:12px; background:var(--card); color:var(--v3-accent); font:inherit; cursor:pointer; display:grid; place-items:center; position:relative; z-index:2; }
    body.v3-ui .v3-drawer-close svg { width:21px; height:21px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; }
    body.v3-ui .v3-menu-toggle { width:46px; height:46px; border:1px solid rgba(22,163,74,.22); border-radius:14px; background:var(--card); color:var(--v3-accent); display:grid; place-items:center; font:inherit; font-size:0; box-shadow:0 5px 16px rgba(22,163,74,.10); cursor:pointer; flex:0 0 auto; position:relative; }
    body.v3-ui .v3-menu-toggle::before { content:'☰'; font-size:21px; line-height:1; }
    body.v3-ui.v3-menu-open .v3-menu-toggle::before { content:'×'; font-size:25px; }
    body.v3-ui .input:focus, body.v3-ui .select:focus, body.v3-ui .textarea:focus, body.v3-ui .btn:focus-visible, body.v3-ui .iconbtn:focus-visible, body.v3-ui .v3-menu-toggle:focus-visible, body.v3-ui .v3-drawer-close:focus-visible { outline:none; box-shadow:var(--v3-focus); }
    body.v3-ui .btn, body.v3-ui .iconbtn, body.v3-ui .close, body.v3-ui .v3-menu-toggle { transition:transform .12s ease,box-shadow .12s ease; }
    body.v3-ui .btn:active, body.v3-ui .iconbtn:active, body.v3-ui .close:active, body.v3-ui .v3-menu-toggle:active { transform:translateY(1px); }
    body.v3-ui .iconbtn, body.v3-ui .close { color:var(--v3-accent) !important; }
    body.v3-ui .iconbtn svg, body.v3-ui .close svg { width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:1.9; stroke-linecap:round; stroke-linejoin:round; }
    @media (min-width:821px) { body.v3-ui .app { padding-top:24px; } }
    @media (max-width:620px) { body.v3-ui .app { width:100%; padding:10px 12px 102px; } body.v3-ui .top { padding-bottom:13px; } body.v3-ui .top h1 { font-size:22px; } body.v3-ui .top .sub { font-size:12px; } body.v3-ui .panel { padding:15px; border-radius:18px; } body.v3-ui .card { border-radius:17px; } body.v3-ui .nav { width:min(88vw,330px); } }
    @media (prefers-reduced-motion:reduce) { body.v3-ui .nav,body.v3-ui .v3-menu-overlay,body.v3-ui .card { transition:none; } }
  `;

  function syncNavButtons(navInner) {
    navInner.querySelectorAll('button[data-view]').forEach((button) => {
      const icon = button.querySelector('.nav-icon');
      const view = button.dataset.view;
      if (icon && ICONS[view] && icon.dataset.v3IconView !== view) {
        icon.innerHTML = ICONS[view];
        icon.dataset.v3IconView = view;
      }
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
    close.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
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
