(() => {
  'use strict';

  // Correção exclusiva da área de pesquisa de Itens Cadastrados e Lista de desejos.
  const STYLE_ID = 'ml-v3-compact-controls';
  const SEARCH_IDS = ['catalogSearch', 'wishSearch'];
  const MAX_SEARCH_LINES = 5;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ml-search-multiline-wrap {
        display: block !important;
        width: min(100%, 320px) !important;
        max-width: 320px !important;
        min-width: 0 !important;
        flex: 0 1 320px !important;
        box-sizing: border-box !important;
      }
      .ml-search-multiline {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        min-height: 36px !important;
        max-height: calc(1.35em * ${MAX_SEARCH_LINES} + 18px) !important;
        box-sizing: border-box !important;
        resize: none !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        white-space: pre-wrap !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
      }
      @media (max-width: 620px) {
        .ml-search-multiline-wrap {
          width: 100% !important;
          max-width: 100% !important;
          flex: 1 1 100% !important;
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
    const padding = (parseFloat(computed.paddingTop) || 0) + (parseFloat(computed.paddingBottom) || 0);
    const border = (parseFloat(computed.borderTopWidth) || 0) + (parseFloat(computed.borderBottomWidth) || 0);
    const minHeight = lineHeight + padding + border;
    const maxHeight = lineHeight * MAX_SEARCH_LINES + padding + border;
    const nextHeight = Math.min(Math.max(field.scrollHeight, minHeight), maxHeight);
    field.style.height = `${nextHeight}px`;
    field.style.overflowY = field.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  function makeSearchMultiline(original) {
    if (!(original instanceof HTMLInputElement)) return;
    if (!SEARCH_IDS.includes(original.id) || original.dataset.mlSearchMultiline === '1') return;

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
    visual.spellcheck = false;

    original.classList.add('ml-search-original-hidden');
    original.setAttribute('aria-hidden', 'true');
    original.tabIndex = -1;

    original.parentNode.insertBefore(wrap, original);
    wrap.appendChild(visual);
    wrap.appendChild(original);

    visual.addEventListener('input', () => {
      original.value = visual.value;
      original.dispatchEvent(new Event('input', { bubbles: true }));
      autosizeSearch(visual);
    });

    original.addEventListener('input', () => {
      if (visual.value !== original.value) visual.value = original.value;
      autosizeSearch(visual);
    });

    original.addEventListener('change', () => {
      if (visual.value !== original.value) visual.value = original.value;
      autosizeSearch(visual);
    });

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
