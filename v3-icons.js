(() => {
  'use strict';

  const ACCENT = '#16a34a';
  const ICONS = Object.freeze({
    '🛒': '<path d="M3 4h2l2.1 10.1A2 2 0 0 0 9.1 16H18a2 2 0 0 0 1.9-1.4L22 7H6"/><path d="M9 20h.01M18 20h.01"/>',
    '📝': '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H20v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    '📦': '<path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="M4 8v9l8 4 8-4V8M12 12v9"/>',
    '⭐': '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    '💰': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M15 9.5c-.6-.7-1.5-1-2.8-1-1.6 0-2.7.8-2.7 2s1.1 1.8 2.7 2.2 2.8.8 2.8 2-1.1 2-2.8 2c-1.3 0-2.3-.4-3-1.1"/>',
    '⚙️': '<path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z"/><path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4V19a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 3.6 11H3a2 2 0 0 1 0-4h.2A2 2 0 0 0 4.6 3.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 11 2.2V2a2 2 0 0 1 4 0v.2a2 2 0 0 0 1.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 19.6 7h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-.2 4Z"/>',
    '✨': '<path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3L12 3ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z"/>',
    '📁': '<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h5l2 2h7.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-14A1.5 1.5 0 0 1 4 17.5l-.5-11Z"/>',
    '🗑️': '<path d="M5 7h14M10 4h4l1 3H9l1-3ZM7 7l1 13h8l1-13M10 10v7M14 10v7"/>',
    '📤': '<path d="M12 16V4M8 8l4-4 4 4M5 13v6h14v-6"/>',
    '📥': '<path d="M12 4v12M8 12l4 4 4-4M5 13v6h14v-6"/>',
    '⬇️': '<path d="M12 4v12M8 12l4 4 4-4M5 19h14"/>',
    '⬆️': '<path d="M12 20V8M8 12l4-4 4 4M5 5h14"/>',
    '🔐': '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    '🧹': '<path d="m4 20 9-9M13 11l4-4 3 3-4 4M6 18l-2 2M14 4l6 6"/>',
    ℹ️: '<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/>',
    '📱': '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M10 6h4M11 18h2"/>',
    '🏪': '<path d="M4 10h16M5 10v10h14V10M3 10l1.5-6h15L21 10M8 20v-6h8v6"/>',
    '⚠️': '<path d="m12 3 9 17H3L12 3Z"/><path d="M12 9v5M12 17h.01"/>',
    '×': '<path d="m6 6 12 12M18 6 6 18"/>',
    '+': '<path d="M12 5v14M5 12h14"/>',
  });

  const STYLE = `
    :root {
      --v3-accent: ${ACCENT};
      --v3-accent-strong: #15803d;
      --v3-accent-soft: rgba(22,163,74,.10);
      --v3-accent-border: rgba(22,163,74,.20);
      --v3-focus: 0 0 0 3px rgba(22,163,74,.16);
    }
    body.v3-ui {
      --primary: var(--v3-accent);
      --primary2: var(--v3-accent-strong);
      --soft: var(--v3-accent-soft);
      --danger: var(--v3-accent);
      --dangerSoft: var(--v3-accent-soft);
      background: var(--bg);
    }
    body.v3-ui .badge,
    body.v3-ui .pill,
    body.v3-ui .notice,
    body.v3-ui .warning,
    body.v3-ui .danger-zone {
      color: var(--v3-accent);
      background: var(--v3-accent-soft);
      border-color: var(--v3-accent-border);
    }
    body.v3-ui .notice strong,
    body.v3-ui .warning strong { color: var(--v3-accent); }
    body.v3-ui .btn.danger { background: var(--v3-accent-soft); color: var(--v3-accent); }
    body.v3-ui .check:checked { background: var(--v3-accent); border-color: var(--v3-accent); }
    body.v3-ui .btn.primary { background: var(--v3-accent); }
    body.v3-ui .btn.primary:active { background: var(--v3-accent-strong); }
    body.v3-ui .input:focus,
    body.v3-ui .select:focus,
    body.v3-ui .textarea:focus { border-color: var(--v3-accent); box-shadow: var(--v3-focus); }
    body.v3-ui .iconbtn,
    body.v3-ui .close,
    body.v3-ui .v3-menu-toggle,
    body.v3-ui .v3-drawer-close {
      color: var(--v3-accent);
    }
    body.v3-ui .iconbtn:hover,
    body.v3-ui .close:hover { background: var(--v3-accent-soft); }
    body.v3-ui .empty .emoji { font-size: 0; }
    body.v3-ui .ml-v3-icon {
      width: 1.15em;
      height: 1.15em;
      display: inline-block;
      vertical-align: -0.18em;
      flex: 0 0 auto;
      color: var(--v3-accent);
    }
    body.v3-ui .ml-v3-icon svg {
      width: 100%;
      height: 100%;
      display: block;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    body.v3-ui .nav-icon .ml-v3-icon { width: 21px; height: 21px; }
    body.v3-ui .iconbtn .ml-v3-icon,
    body.v3-ui .close .ml-v3-icon { width: 19px; height: 19px; }
    body.v3-ui .btn .ml-v3-icon { width: 17px; height: 17px; }
    body.v3-ui .section-title .ml-v3-icon { width: 20px; height: 20px; vertical-align: -0.2em; }
    body.v3-ui .empty .ml-v3-icon { width: 38px; height: 38px; margin-bottom: 7px; }
  `;

  function installStyle() {
    if (document.getElementById('v3-icons-style')) return;
    const style = document.createElement('style');
    style.id = 'v3-icons-style';
    style.textContent = STYLE;
    document.head.appendChild(style);
  }

  function iconSpan(emoji) {
    const span = document.createElement('span');
    span.className = 'ml-v3-icon';
    span.setAttribute('aria-hidden', 'true');
    span.dataset.v3Icon = emoji;
    span.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[emoji]}</svg>`;
    return span;
  }

  function replaceTextNode(node) {
    if (!node.nodeValue || node.parentElement?.closest('.ml-v3-icon')) return;
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION'].includes(parent.tagName)) return;
    const source = node.nodeValue;
    const pattern = new RegExp(
      Object.keys(ICONS)
        .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
      'gu'
    );
    if (!pattern.test(source)) return;
    pattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let last = 0;
    let match;
    while ((match = pattern.exec(source))) {
      if (match.index > last)
        fragment.appendChild(document.createTextNode(source.slice(last, match.index)));
      fragment.appendChild(iconSpan(match[0]));
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
    nodes.forEach(replaceTextNode);
  }

  function install() {
    if (document.body.dataset.v3IconsInstalled === '1') return;
    document.body.dataset.v3IconsInstalled = '1';
    installStyle();
    scan();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) replaceTextNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('ml-v3-icon'))
            scan(node);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
