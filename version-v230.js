(() => {
  'use strict';

  const VERSION = 'v2.3.0';

  function updateVisibleVersion() {
    document.querySelectorAll('.sub').forEach((element) => {
      if (element.textContent.includes('Minha lista')) return;
      if (/Supermercado\s*•\s*offline\s*•\s*v\d+\.\d+\.\d+/i.test(element.textContent)) {
        element.textContent = element.textContent.replace(
          /v\d+\.\d+\.\d+/i,
          VERSION
        );
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateVisibleVersion, { once: true });
  } else {
    updateVisibleVersion();
  }
})();
