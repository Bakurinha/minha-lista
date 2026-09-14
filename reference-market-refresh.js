(() => {
  'use strict';
  if (window.__mlReferenceMarketRefreshV230_5) return;
  window.__mlReferenceMarketRefreshV230_5 = true;

  const DB = 'MinhaListaDB';
  const VERSION = 6;
  const STORE = 'referenceMarkets';
  const REFERENCE_DATA_MARKER = 'referenceDataVersion';
  const PRODUCT_EXPANSION_MARKER = 'referenceProductExpansionV230_5';
  const PRODUCT_TARGET = 10040;
  const MARKETS = [
    'Atakarejo', 'Atacadão', 'Assaí Atacadista', 'Hiperideal', 'RedeMix',
    'Mercantil Rodrigues', 'Mix Bahia', 'Novo Mix', 'Mix Mateus', 'GBarbosa',
    'Carrefour', "Sam's Club", 'Pão de Açúcar', 'Mercantil de Brotas',
    'Mercado Central', 'Mercado da Sete Portas', 'Mercado do Bairro',
    'Super Muffato', 'Condor', 'Angeloni', 'Giassi', 'Koch', 'Fort Atacadista',
    'Mart Minas', 'Supernosso', 'EPA', 'Supermercados BH', 'Oba Hortifruti',
    'St Marche', 'Dia Brasil', 'Roldão', 'Tenda Atacado', 'Spani Atacadista',
    'Tonin', 'Villefort', 'ABC Atacado e Varejo', 'Guanabara', 'Zona Sul',
    'Imperatriz', 'Savegnago', 'Tauste', 'Zaffari', 'Nacional', 'Muffato Max',
    'Hortifruti Natural da Terra', 'Mineirão Atacarejo', 'Total Atacado',
    'RF Atacado', 'Sol e Mar Supermercados', 'Mercadinhos São Luiz',
    'Cometa Supermercados', 'São Luiz', 'Davo Supermercados',
    'Confiança Supermercados', 'Koch Hipermercado',
  ];

  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, VERSION);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
    });
  }

  function count(db, store) {
    return new Promise((resolve, reject) => {
      const request = db.transaction(store, 'readonly').objectStore(store).count();
      request.onsuccess = () => resolve(request.result || 0);
      request.onerror = () => reject(request.error || Error(`Falha ao contar ${store}`));
    });
  }

  function all(db, store) {
    return new Promise((resolve, reject) => {
      const request = db.transaction(store, 'readonly').objectStore(store).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || Error(`Falha ao ler ${store}`));
    });
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function sameMarkets(current) {
    if (current.length !== MARKETS.length) return false;
    const names = new Set(current.map((item) => String(item?.name || '').trim()));
    return MARKETS.every((name) => names.has(name));
  }

  async function refresh() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        const db = await open();
        const [productCount, currentMarkets] = await Promise.all([
          count(db, 'referenceProducts'),
          all(db, STORE),
        ]);

        if (!sameMarkets(currentMarkets)) {
          await new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE, 'settings'], 'readwrite');
            const markets = transaction.objectStore(STORE);
            const settings = transaction.objectStore('settings');
            markets.clear();
            MARKETS.forEach((name, index) => markets.put({ id: `ref-m-${index + 1}`, name }));
            settings.put({ key: REFERENCE_DATA_MARKER, value: 1 });
            transaction.oncomplete = resolve;
            transaction.onerror = () =>
              reject(transaction.error || Error('Falha ao atualizar mercados'));
            transaction.onabort = () => reject(transaction.error || Error('Atualização cancelada'));
          });
        } else {
          await new Promise((resolve, reject) => {
            const transaction = db.transaction('settings', 'readwrite');
            transaction.objectStore('settings').put({ key: REFERENCE_DATA_MARKER, value: 1 });
            transaction.oncomplete = resolve;
            transaction.onerror = () =>
              reject(transaction.error || Error('Falha ao atualizar marcador'));
            transaction.onabort = () => reject(transaction.error || Error('Atualização cancelada'));
          });
        }

        const marker = await new Promise((resolve, reject) => {
          const request = db.transaction('settings', 'readonly').objectStore('settings').get(PRODUCT_EXPANSION_MARKER);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error || Error('Falha ao ler marcador da expansão'));
        });
        db.close();

        if (productCount < PRODUCT_TARGET && marker?.value !== 1) loadProductExpansion();
        return;
      } catch (error) {
        console.error('Referência de mercados:', error);
        await wait(100);
      }
    }
  }

  function loadProductExpansion() {
    const marker = PRODUCT_EXPANSION_MARKER;
    if (document.querySelector(`script[data-reference-expansion="${marker}"]`)) return;
    const script = document.createElement('script');
    script.src = './reference-product-expansion-v230-5.js';
    script.dataset.referenceExpansion = marker;
    script.defer = true;
    document.head.appendChild(script);
  }

  refresh();
})();
