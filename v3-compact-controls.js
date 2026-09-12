(() => {
  'use strict';

  const STYLE_ID = 'ml-v3-compact-controls';
  // Todos os campos de pesquisa que precisam do mesmo comportamento responsivo.
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
      /* Pesquisa: largura responsiva, sem limite artificial de caracteres. */
      #listSearch,
      #catalogSearch,
      #wishSearch,
      #invSearch,
      #historyItemSearch,
      #historyMarketSearch {
        flex: 1 1 360px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        resize: none;
        overflow-x: hidden;
        overflow-y: auto;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        word-break: break-word;
        line-height: 1.35;
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
        #invSearch,
        #historyItemSearch,
        #historyMarketSearch {
          flex: 1 1 100%;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          height: 36px;
          min-height: 36px;
          max-height: 112px;
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
        #listSearch,
        #catalogSearch,
        #wishSearch,
        #invSearch,
        #historyItemSearch,
        #historyMarketSearch {
          height: 34px;
          min-height: 34px;
          max-height: 102px;
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
    const minHeight = parseFloat(computed.minHeight) || lineHeight + padding + border;
    const maxHeight = lineHeight * MAX_SEARCH_LINES + padding + border;
    field.style.height = `${Math.min(Math.max(field.scrollHeight, minHeight), maxHeight)}px`;
    field.style.overflowY = field.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  function makeSearchMultiline(field) {
    if (!field || field.dataset.mlSearchMultiline === '1') return;

    // O núcleo usa oninput; preservamos esse handler ao trocar input por textarea.
    if (field instanceof HTMLInputElement) {
      const area = document.createElement('textarea');
      const inputHandler = field.oninput;
      const changeHandler = field.onchange;
      const keydownHandler = field.onkeydown;
      for (const attr of field.attributes) {
        if (attr.name !== 'type' && attr.name !== 'value') area.setAttribute(attr.name, attr.value);
      }
      area.id = field.id;
      area.className = field.className;
      area.value = field.value;
      area.placeholder = field.placeholder;
      area.rows = 1;
      if (typeof inputHandler === 'function') area.oninput = inputHandler;
      if (typeof changeHandler === 'function') area.onchange = changeHandler;
      if (typeof keydownHandler === 'function') area.onkeydown = keydownHandler;
      field.replaceWith(area);
      field = area;
    }

    field.dataset.mlSearchMultiline = '1';
    field.removeAttribute('maxlength');
    field.setAttribute('rows', '1');
    field.addEventListener('input', () => autosizeSearch(field));
    autosizeSearch(field);
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
