(() => {
  'use strict';

  const STYLE_ID = 'ml-v3-compact-controls';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Controles de consulta/seleção ficam compactos sem alterar os breakpoints. */
      #listSearch,
      #catalogSearch,
      #wishSearch {
        flex: 0 1 360px;
        width: min(360px, 100%);
      }

      #inventoryView select,
      #inventoryView .select,
      #shareSelect {
        width: auto;
        min-width: 120px;
        max-width: 300px;
      }

      .sheet .field > .input,
      .sheet .field > .select {
        max-width: 520px;
      }

      @media (max-width: 620px) {
        #listSearch,
        #catalogSearch,
        #wishSearch,
        #inventoryView select,
        #inventoryView .select,
        #shareSelect,
        .sheet .field > .input,
        .sheet .field > .select {
          width: 100%;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
