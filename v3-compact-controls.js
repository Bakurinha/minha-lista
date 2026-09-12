(() => {
  'use strict';

  const STYLE_ID = 'ml-v3-compact-controls';
  const SEARCH_IDS = [
    'listSearch',
    'catalogSearch',
    'wishSearch',
    'invSearch',
    'historyItemSearch',
    'historyMarketSearch',
  ];
  const MAX_SEARCH_LINES = 5;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /*
       * Pesquisa responsiva: o input original permanece no DOM para preservar
       * todos os listeners do app. A textarea visual cresce com o texto e
       * sincroniza o valor de volta para o input original.
       */
      .ml-search-multiline-wrap {
        display: flex;
        flex: 0 1 420px;
        width: min(100%, 420px);
        min-width: 0;
        max-width: 420px;
        align-self: flex-start;
      }

      .ml-search-multiline {
        display: block;
        flex: 1 1 auto;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        min-height: 36px;
        box-sizing: border-box;
        border: 1px solid var(--border);
        border-radius: 13px;
        padding: 7px 10px;
        font: inherit;
        font-size: 14px;
        line-height: 1.35;
        background: var(--card);
        color: var(--text);
        outline: none;
        resize: none;
        overflow-x: hidden;
        overflow-y: hidden;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .ml-search-multiline:focus {
        border-color: #22c55e;
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
      }

      .ml-search-original-hidden {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
        opacity: 0 !important;
        pointer-events: none !important;
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
        .ml-search-multiline-wrap {
          flex: 0 1 100%;
          width: 100%;
          max-width: 100%;
        }

        .ml-search-multiline {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          min-height: 36px;
          max-height: 102px;
          padding: 7px 10px;
          font-size: 14px;
          line-height: 1.35;
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

        .input,
        .select {
          min-width: 0;
          max-width: 100%;
          height: 40px;
          min-height: 40px;
          padding: 8px 10px;
          font-size: 14px;
          line-height: 1.25;
        }

        .textarea {
          min-width: 0;
          max-width: 100%;
          min-height: 72px;
          max-height: 180px;
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
        .field.full,
        .form-grid {
          min-width: 0;
          max-width: 100%;
        }
      }

      @media (max-width: 380px) {
        .ml-search-multiline {
          min-height: 34px;
          max-height: 92px;
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
          max-height: 160px;
          padding: 7px 9px;
          font-size: 13px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function autosizeSearch(field) {
    if (!(field instanceof HTMLTextAreaElement)) return;

    field.style.height = 'auto';
    const computed = getComputedStyle(field);
    const lineHeight = parseFloat(computed.lineHeight) || 19;
    const padding =
      (parseFloat(computed.paddingTop) || 0) + (parseFloat(computed.paddingBottom) || 0);
    const border =
      (parseFloat(computed.borderTopWidth) || 0) + (parseFloat(computed.borderBottomWidth) || 0);
    const minHeight = lineHeight + padding + border;
    const maxHeight = lineHeight * MAX_SEARCH_LINES + padding + border;
    const nextHeight = Math.min(Math.max(field.scrollHeight, minHeight), maxHeight);

    field.style.height = `${nextHeight}px`;
    field.style.overflowY = field.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  function syncVisualToOriginal(visual, original) {
    const value = visual.value;
    if (original.value === value) return;

    original.value = value;
    original.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function syncOriginalToVisual(original, visual) {
    if (visual.value !== original.value) visual.value = original.value;
    autosizeSearch(visual);
  }

  function makeSearchMultiline(original) {
    if (!(original instanceof HTMLInputElement)) return;
    if (original.dataset.mlSearchMultiline === '1') return;

    original.dataset.mlSearchMultiline = '1';
    original.removeAttribute('maxlength');

    const wrap = document.createElement('div');
    wrap.className = 'ml-search-multiline-wrap';
    wrap.dataset.mlSearchWrap = original.id;

    const visual = document.createElement('textarea');
    visual.className = 'ml-search-multiline';
    visual.id = `${original.id}Multiline`;
    visual.rows = 1;
    visual.value = original.value;
    visual.placeholder = original.placeholder;
    visual.setAttribute('aria-label', original.getAttribute('aria-label') || 'Pesquisar');
    visual.autocomplete = original.autocomplete || 'off';
    visual.inputMode = 'search';
    visual.enterKeyHint = 'search';

    original.classList.add('ml-search-original-hidden');
    original.setAttribute('aria-hidden', 'true');
    original.tabIndex = -1;

    original.parentNode.insertBefore(wrap, original);
    wrap.appendChild(visual);
    wrap.appendChild(original);

    visual.addEventListener('input', () => {
      syncVisualToOriginal(visual, original);
      autosizeSearch(visual);
    });

    original.addEventListener('input', () => syncOriginalToVisual(original, visual));
    original.addEventListener('change', () => syncOriginalToVisual(original, visual));

    autosizeSearch(visual);
  }

  function upgradeSearchFields() {
    for (const id of SEARCH_IDS) makeSearchMultiline(document.getElementById(id));
  }

  function init() {
    injectStyles();
    upgradeSearchFields();

    const observer = new MutationObserver(upgradeSearchFields);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
