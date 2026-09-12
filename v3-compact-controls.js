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

      /* No celular, campos de texto e seleção ficam menores sem cortar o texto na vertical. */
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
          line-height: 1.25;
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
          line-height: 1.25;
        }

        /* Inclui os campos "Lista" e de escrita dos formulários, não apenas a busca. */
        .input,
        .select {
          height: 40px;
          min-height: 40px;
          padding: 8px 10px;
          font-size: 14px;
          line-height: 1.25;
        }

        .textarea {
          min-height: 72px;
          padding: 8px 10px;
          font-size: 14px;
          line-height: 1.3;
        }

        .sheet .field > .input,
        .sheet .field > .select,
        .sheet .field > .textarea {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .field,
        .field.full {
          min-width: 0;
          max-width: 100%;
        }

        .form-grid {
          min-width: 0;
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

        .input,
        .select {
          height: 38px;
          min-height: 38px;
          padding: 7px 9px;
          font-size: 13px;
        }

        .textarea {
          min-height: 68px;
          padding: 7px 9px;
          font-size: 13px;
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
