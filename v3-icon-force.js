(() => {
  'use strict';

  function normalizeMenuToggle() {
    const toggle = document.querySelector('.v3-menu-toggle');
    if (!toggle || toggle.querySelector('[data-v3-menu-icon]')) return;
    toggle.style.fontSize = '0';
    toggle.innerHTML = `<svg data-v3-menu-icon viewBox="0 0 24 24" aria-hidden="true"><path class="v3-menu-line line-a" d="M4 7h16"/><path class="v3-menu-line line-b" d="M4 12h16"/><path class="v3-menu-line line-c" d="M4 17h16"/></svg>`;
    const style = document.createElement('style');
    style.id = 'v3-icon-force-style';
    style.textContent = `
      body.v3-ui .v3-menu-toggle::before { content:none !important; }
      body.v3-ui .v3-menu-toggle svg[data-v3-menu-icon] { width:21px; height:21px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
      body.v3-ui.v3-menu-open .v3-menu-toggle .line-a { transform:translateY(5px) rotate(45deg); transform-origin:12px 7px; }
      body.v3-ui.v3-menu-open .v3-menu-toggle .line-b { opacity:0; }
      body.v3-ui.v3-menu-open .v3-menu-toggle .line-c { transform:translateY(-5px) rotate(-45deg); transform-origin:12px 17px; }
    `;
    document.head.appendChild(style);
  }

  function loadMenuAutoclose() {
    if (window.__mlMenuAutocloseRequested) return;
    window.__mlMenuAutocloseRequested = true;
    const script = document.createElement('script');
    script.src = './v3-menu-autoclose.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  function install() {
    if (document.body.dataset.v3IconForceInstalled === '1') return;
    document.body.dataset.v3IconForceInstalled = '1';
    normalizeMenuToggle();
    loadMenuAutoclose();

    const menuObserver = new MutationObserver(() => normalizeMenuToggle());
    menuObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
