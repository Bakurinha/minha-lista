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

      /* No celular, os controles não devem ocupar toda a largura disponível. */
      @media (max-width: 620px) {
        #listSearch,
        #catalogSearch,
        #wishSearch {
          flex: 0 1 220px;
          width: 220px;
          max-width: 220px;
          min-width: 0;
          height: 36px;
          min-height: 36px;
          padding: 7px 10px;
          font-size: 14px;
        }

        #inventoryView select,
        #inventoryView .select,
        #shareSelect {
          flex: 0 1 auto;
          width: auto;
          min-width: 0;
          max-width: 180px;
          height: 34px;
          min-height: 34px;
          padding: 6px 9px;
          font-size: 13px;
        }

        .sheet .field > .input,
        .sheet .field > .select {
          width: 100%;
          max-width: 280px;
          min-width: 0;
          box-sizing: border-box;
        }
      }

      @media (max-width: 380px) {
        #listSearch,
        #catalogSearch,
        #wishSearch {
          width: 180px;
          max-width: 180px;
          height: 34px;
          min-height: 34px;
          padding: 6px 9px;
          font-size: 13px;
        }

        #inventoryView select,
        #inventoryView .select,
        #shareSelect {
          max-width: 155px;
          height: 32px;
          min-height: 32px;
          padding: 5px 8px;
          font-size: 12px;
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
