(() => {
  'use strict';

  // Fecha o drawer imediatamente ao selecionar uma opção, sem cancelar a navegação.
  function install() {
    if (document.body.dataset.v3MenuAutocloseInstalled === '1') return;
    document.body.dataset.v3MenuAutocloseInstalled = '1';

    document.addEventListener(
      'click',
      (event) => {
        const button = event.target instanceof Element ? event.target.closest('.nav button[data-view]') : null;
        if (!button) return;

        // Não usa preventDefault/stopPropagation: o handler original continua responsável pela troca de tela.
        document.body.classList.remove('v3-menu-open');
        const toggle = document.querySelector('.v3-menu-toggle');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Abrir menu');
        }
      },
      true
    );
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
