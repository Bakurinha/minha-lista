(() => {
  'use strict';

  const VERSION = 'v2.3.0';
  const VERSION_PATTERN = /v\d+\.\d+\.\d+/gi;

  function updateVisibleVersion() {
    document.querySelectorAll('.sub').forEach((element) => {
      if (/Supermercado\s*•\s*offline/i.test(element.textContent || '')) {
        element.textContent = element.textContent.replace(VERSION_PATTERN, VERSION);
      }
    });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
        VERSION_PATTERN.lastIndex = 0;
        if (VERSION_PATTERN.test(node.nodeValue || '')) nodes.push(node);
      }
    }

    nodes.forEach((node) => {
      node.nodeValue = (node.nodeValue || '').replace(VERSION_PATTERN, VERSION);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateVisibleVersion, { once: true });
  } else {
    updateVisibleVersion();
  }
})();
