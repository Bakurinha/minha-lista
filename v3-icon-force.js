(() => {
  'use strict';

  const FALLBACK = '<circle cx="12" cy="12" r="8.5"/><path d="M9 12h6M12 9v6"/>';

  function iconNode(value) {
    const span = document.createElement('span');
    span.className = 'ml-v3-icon';
    span.setAttribute('aria-hidden', 'true');
    span.dataset.v3IconFallback = value;
    span.innerHTML = `<svg viewBox="0 0 24 24">${FALLBACK}</svg>`;
    return span;
  }

  function replaceUnsupported(node) {
    if (!node.nodeValue || node.parentElement?.closest('.ml-v3-icon')) return;
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION'].includes(parent.tagName)) return;
    const source = node.nodeValue;
    const pattern = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu;
    if (!pattern.test(source)) return;
    pattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let last = 0;
    let match;
    while ((match = pattern.exec(source))) {
      if (match.index > last)
        fragment.appendChild(document.createTextNode(source.slice(last, match.index)));
      fragment.appendChild(iconNode(match[0]));
      last = match.index + match[0].length;
    }
    if (last < source.length) fragment.appendChild(document.createTextNode(source.slice(last)));
    node.replaceWith(fragment);
  }

  function scan(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(replaceUnsupported);
  }

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
    scan();
    normalizeMenuToggle();
    loadMenuAutoclose();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) replaceUnsupported(node);
          else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('ml-v3-icon'))
            scan(node);
        });
      }
      normalizeMenuToggle();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
