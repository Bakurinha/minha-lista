(() => {
  'use strict';
  if (window.__mlReferenceMarketRefreshV230_6?.refresh) return;
  const DB = 'MinhaListaDB', VERSION = 6, STORE = 'referenceMarkets';
  const REFERENCE_DATA_MARKER = 'referenceDataVersion';
  const PRODUCT_EXPANSION_MARKER = 'referenceProductExpansionV230_6';
  const INITIAL_CHECK_MARKER = 'referenceInitialCheckV230_6';
  const PRODUCT_TARGET = 20000;
  const MARKETS = [
    'Atakarejo','Atacadão','Assaí Atacadista','Hiperideal','RedeMix','Mercantil Rodrigues','Mix Bahia','Novo Mix','Mix Mateus','GBarbosa','Carrefour',"Sam's Club",'Pão de Açúcar','Mercantil de Brotas','Mercado Central','Mercado da Sete Portas','Mercado do Bairro','Super Muffato','Condor','Angeloni','Giassi','Koch','Fort Atacadista','Mart Minas','Supernosso','EPA','Supermercados BH','Oba Hortifruti','St Marche','Dia Brasil','Roldão','Tenda Atacado','Spani Atacadista','Tonin','Villefort','ABC Atacado e Varejo','Guanabara','Zona Sul','Imperatriz','Savegnago','Tauste','Zaffari','Nacional','Muffato Max','Hortifruti Natural da Terra','Mineirão Atacarejo','Total Atacado','RF Atacado','Sol e Mar Supermercados','Mercadinhos São Luiz','Cometa Supermercados','São Luiz','Davo Supermercados','Confiança Supermercados','Koch Hipermercado','Grupo Mateus','Novo Atacarejo','Mateus Supermercados','Hiper Bompreço','Bompreço','Carrefour Bairro','Carrefour Express','TodoDia','Mercado Extra','Extra Hiper','Pão de Açúcar Minuto','Prezunic','Supermarket','Mundial','Princesa Supermercados','Hortifruti','Redeconomia','Multi Market','Inter Supermercados','Dom Atacadista','Campineira','Enxuto','Covabra','Tauste Supermercados','Confiança','Jaú Serve','Delta Max','São Vicente','Paulistão Atacadista','Pague Menos','Barbosa Supermercados','Ipanema','Semar Supermercados','Shibata','Sonda','Joanin','Nagumo','Mambo','Hirota Food','Asun','Bistek','Comper','Avenida','Tatico','Bahamas','Bahamas Mix','Mart Plus','Centerbox','Bom Vizinho','Frangolândia','Pinheiro Supermercado','Unicompra','Rede Super Líder','Primato Supermercado','Verona Supermercados','Bavaresco','Andorinha Supermercado','Supermercado Tibúrcio','Supermercado Bernardão','Bonanza Supermercado','Supermercado Moranguinho','Quartetto Supermercados','Supermercado Baklizi','Supermercado Pepão','Supermercado Delta Max',
  ];
  function open() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(DB, VERSION);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error || Error('IndexedDB indisponível'));
    });
  }
  function count(db, store) {
    return new Promise((resolve, reject) => {
      const r = db.transaction(store, 'readonly').objectStore(store).count();
      r.onsuccess = () => resolve(r.result || 0);
      r.onerror = () => reject(r.error || Error(`Falha ao contar ${store}`));
    });
  }
  function getSetting(db, key) {
    return new Promise((resolve, reject) => {
      const r = db.transaction('settings', 'readonly').objectStore('settings').get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error || Error(`Falha ao ler ${key}`));
    });
  }
  function setSetting(db, key, value) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      tx.objectStore('settings').put({ key, value });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || Error(`Falha ao gravar ${key}`));
      tx.onabort = () => reject(tx.error || Error(`Atualização cancelada: ${key}`));
    });
  }
  function allMarkets(db) {
    return new Promise((resolve, reject) => {
      const r = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error || Error('Falha ao ler mercados'));
    });
  }
  function sameMarkets(current) {
    if (current.length !== MARKETS.length) return false;
    const names = new Set(current.map((item) => String(item?.name || '').trim()));
    return MARKETS.every((name) => names.has(name));
  }
  function writeMarkets(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE, 'settings'], 'readwrite');
      const markets = tx.objectStore(STORE);
      markets.clear();
      MARKETS.forEach((name, index) => markets.put({ id: `ref-m-${index + 1}`, name }));
      tx.objectStore('settings').put({ key: REFERENCE_DATA_MARKER, value: 1 });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || Error('Falha ao atualizar mercados'));
      tx.onabort = () => reject(tx.error || Error('Atualização de mercados cancelada'));
    });
  }
  function showStatus(productCount, marketCount, expanding, manual = false) {
    const message = expanding
      ? `Banco de referência: ${productCount.toLocaleString('pt-BR')} produtos • ${marketCount.toLocaleString('pt-BR')} mercados • expansão em andamento`
      : `${manual ? 'Banco offline atualizado:' : 'Banco de referência:'} ${productCount.toLocaleString('pt-BR')} produtos • ${marketCount.toLocaleString('pt-BR')} mercados`;
    const show = () => {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toast._referenceStatusTimer);
      toast._referenceStatusTimer = setTimeout(() => toast.classList.remove('show'), 5000);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show, { once: true });
    else show();
  }
  function loadProductExpansion() {
    const marker = PRODUCT_EXPANSION_MARKER;
    if (document.querySelector(`script[data-reference-expansion="${marker}"]`)) return;
    const script = document.createElement('script');
    script.src = './reference-product-expansion-v230-5.js?v=6';
    script.dataset.referenceExpansion = marker;
    script.defer = true;
    document.head.appendChild(script);
  }
  async function refresh({ manual = false } = {}) {
    try {
      const db = await open();
      if (!manual) {
        const initial = await getSetting(db, INITIAL_CHECK_MARKER);
        if (initial?.value === 1) {
          db.close();
          return null;
        }
        await setSetting(db, INITIAL_CHECK_MARKER, 1);
      }
      let [productCount, currentMarkets, marker] = await Promise.all([
        count(db, 'referenceProducts'),
        allMarkets(db),
        getSetting(db, PRODUCT_EXPANSION_MARKER),
      ]);
      if (!sameMarkets(currentMarkets)) {
        await writeMarkets(db);
        currentMarkets = MARKETS.map((name, index) => ({ id: `ref-m-${index + 1}`, name }));
      } else {
        await setSetting(db, REFERENCE_DATA_MARKER, 1);
      }
      if (productCount < PRODUCT_TARGET) {
        if (marker?.value === 1) await setSetting(db, PRODUCT_EXPANSION_MARKER, 0);
        db.close();
        showStatus(productCount, currentMarkets.length, true, manual);
        loadProductExpansion();
        return null;
      }
      await setSetting(db, PRODUCT_EXPANSION_MARKER, 1);
      db.close();
      showStatus(productCount, currentMarkets.length, false, manual);
      return { productCount, marketCount: currentMarkets.length };
    } catch (error) {
      console.error('Referência de mercados/produtos:', error);
      return null;
    }
  }
  window.__mlReferenceMarketRefreshV230_6 = { refresh };
  refresh();
})();
