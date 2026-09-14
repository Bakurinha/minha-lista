(() => {
  'use strict';
  const DB = 'MinhaListaDB';
  const VERSION = 6;
  const STORE = 'referenceMarkets';
  const MARKER = 'referenceDataVersion';

  const MARKETS = [
    'Atakarejo',
    'Atacadão',
    'Assaí Atacadista',
    'Hiperideal',
    'RedeMix',
    'Mercantil Rodrigues',
    'Mix Bahia',
    'Novo Mix',
    'Mix Mateus',
    'GBarbosa',
    'Carrefour',
    "Sam's Club",
    'Pão de Açúcar',
    'Mercantil de Brotas',
    'Mercado Central',
    'Mercado da Sete Portas',
    'Mercado do Bairro',
    'Super Muffato',
    'Condor',
    'Angeloni',
    'Giassi',
    'Koch',
    'Fort Atacadista',
    'Mart Minas',
    'Supernosso',
    'EPA',
    'Supermercados BH',
    'Oba Hortifruti',
    'St Marche',
    'Dia Brasil',
    'Roldão',
    'Tenda Atacado',
    'Spani Atacadista',
    'Tonin',
    'Villefort',
    'ABC Atacado e Varejo',
    'Guanabara',
    'Zona Sul',
    'Imperatriz',
    'Savegnago',
    'Tauste',
    'Zaffari',
    'Nacional',
    'Muffato Max',
    'Hortifruti Natural da Terra',
    'Mineirão Atacarejo',
    'Total Atacado',
    'RF Atacado',
    'Sol e Mar Supermercados',
    'Mercadinhos São Luiz',
    'Cometa Supermercados',
    'São Luiz',
    'Davo Supermercados',
    'Confiança Supermercados',
    'Koch Hipermercado',
  ];

  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, VERSION);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
    });
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function refresh() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        const db = await open();
        const request = db.transaction('settings', 'readonly').objectStore('settings').get(MARKER);

        const version = await new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result?.value || 0);
          request.onerror = () => reject(request.error);
        });

        if (version < 2) {
          db.close();
          await wait(100);
          continue;
        }

        await new Promise((resolve, reject) => {
          const transaction = db.transaction(['referenceMarkets', 'settings'], 'readwrite');
          const markets = transaction.objectStore(STORE);
          const settings = transaction.objectStore('settings');

          markets.clear();
          MARKETS.forEach((name, index) => {
            markets.put({ id: `ref-m-${index + 1}`, name });
          });
          settings.put({ key: MARKER, value: 3 });

          transaction.oncomplete = resolve;
          transaction.onerror = () =>
            reject(transaction.error || Error('Falha ao atualizar mercados'));
          transaction.onabort = () => reject(transaction.error || Error('Atualização cancelada'));
        });

        db.close();
        return;
      } catch (error) {
        console.error('Referência de mercados:', error);
        await wait(100);
      }
    }
  }

  function loadProductExpansion() {
    const marker = 'referenceProductExpansionV230_3';
    if (document.querySelector(`script[data-reference-expansion="${marker}"]`)) return;
    const script = document.createElement('script');
    script.src = './reference-product-expansion-v230-3.js';
    script.dataset.referenceExpansion = marker;
    script.defer = true;
    document.head.appendChild(script);
  }

  // A expansão 2 não é mais disparada automaticamente para evitar gravações concorrentes.
  // A expansão 3 usa o total acumulado como alvo e completa o catálogo atual.
  loadProductExpansion();
  refresh();
})();
