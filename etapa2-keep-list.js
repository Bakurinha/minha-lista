(() => {
  'use strict';

  const KEY = '__mlReturnListAfterItemEdit';
  let pendingListId = '';
  let retries = 0;

  function openListFallback(listId) {
    if (!listId) return true;
    const modal = document.getElementById('modal');
    const itemForm = document.getElementById('itemForm');
    if (modal?.classList.contains('show') && !itemForm) {
      sessionStorage.removeItem(KEY);
      return true;
    }
    const button = [...document.querySelectorAll('[data-action="open-list"]')].find(
      (element) => element.dataset.id === listId
    );
    if (!button) return false;
    sessionStorage.removeItem(KEY);
    button.click();
    return true;
  }

  function restorePendingList() {
    const listId = sessionStorage.getItem(KEY) || pendingListId;
    if (!listId) return;
    if (openListFallback(listId)) return;
    if (retries++ < 24) setTimeout(restorePendingList, 250);
    else sessionStorage.removeItem(KEY);
  }

  document.addEventListener(
    'click',
    (event) => {
      const edit = event.target.closest('[data-action="edit-item"]');
      if (edit) pendingListId = edit.dataset.list || '';
    },
    true
  );

  document.addEventListener(
    'submit',
    (event) => {
      if (!(event.target instanceof HTMLFormElement) || event.target.id !== 'itemForm') return;
      if (!pendingListId) return;
      sessionStorage.setItem(KEY, pendingListId);
      retries = 0;
      setTimeout(restorePendingList, 1200);
    },
    true
  );

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(restorePendingList, 700), {
      once: true,
    });
  } else {
    setTimeout(restorePendingList, 700);
  }
})();
