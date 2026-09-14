(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const VERSION = 6;
  const TARGET_TOTAL = 2040;
  const MARKER = 'referenceProductExpansionV230_4';
  const NAMES = [
    'Açúcar mascavo orgânico',
    'Adoçante líquido',
    'Adoçante em pó',
    'Arroz integral vermelho',
    'Arroz sete grãos',
    'Aveia instantânea',
    'Canjica branca',
    'Cevada em grãos',
    'Farinha de arroz integral',
    'Farinha de coco',
    'Fécula de batata',
    'Flocos de milho',
    'Gergelim branco',
    'Gergelim preto',
    'Linhaça dourada',
    'Linhaça marrom',
    'Polvilho granulado',
    'Semente de girassol',
    'Semente de abóbora',
    'Trigo para quibe',
    'Biscoito de gengibre',
    'Biscoito de banana',
    'Biscoito de amêndoas',
    'Biscoito amanteigado',
    'Biscoito salgado integral',
    'Cookie de castanha',
    'Cookie de aveia e mel',
    'Cracker integral',
    'Palito de gergelim',
    'Snack de batata',
    'Molho de tomate rústico',
    'Molho de tomate com alho',
    'Molho de tomate com cebola',
    'Molho de queijo cheddar',
    'Molho teriyaki',
    'Molho de pimenta defumada',
    'Molho de mostarda',
    'Molho de iogurte',
    'Molho de ervas finas',
    'Molho de alho picante',
    'Azeite de oliva suave',
    'Azeite extravirgem português',
    'Vinagre balsâmico',
    'Vinagre de arroz',
    'Vinagre de vinho rosé',
    'Óleo de abacate',
    'Óleo de amendoim',
    'Óleo de linhaça',
    'Óleo de gergelim',
    'Óleo de girassol alto oleico',
    'Suco de acerola integral',
    'Suco de caju integral',
    'Suco de morango',
    'Suco de melão',
    'Suco de tangerina',
    'Néctar de pêssego branco',
    'Néctar de frutas tropicais',
    'Chá branco',
    'Chá de frutas cítricas',
    'Chá de erva-cidreira',
    'Café tradicional',
    'Café intenso',
    'Café orgânico',
    'Café gourmet em cápsulas',
    'Café solúvel cremoso',
    'Cappuccino avelã',
    'Cappuccino canela',
    'Chocolate em pó',
    'Achocolatado zero açúcar',
    'Chocolates em pó',
    'Queijo prato',
    'Queijo coalho em cubos',
    'Queijo meia cura',
    'Queijo canastra',
    'Queijo parmesão em pedaço',
    'Queijo provolone fatiado',
    'Queijo gouda fatiado',
    'Ricota temperada',
    'Creme de ricota',
    'Iogurte de maracujá',
    'Iogurte de frutas tropicais',
    'Iogurte de baunilha',
    'Iogurte de café',
    'Bebida láctea de chocolate',
    'Bebida láctea de morango',
    'Manteiga clarificada',
    'Margarina com sal',
    'Creme vegetal',
    'Sobremesa de baunilha',
    'Sobremesa de caramelo',
    'Filé de peito de frango resfriado',
    'Filé de coxa de frango resfriado',
    'Asa de frango',
    'Coração de frango',
    'Pernil suíno',
    'Lombo suíno fatiado',
    'Bisteca suína',
    'Patinho moído',
    'Acém moído',
    'Capa de filé',
    'Maminha bovina',
    'Alcatra em bifes',
    'Coxão duro em bifes',
    'Fraldinha temperada',
    'Costela suína',
    'Costela bovina temperada',
    'Peixe branco congelado',
    'Sardinha fresca',
    'Filé de merluza',
    'Filé de salmão congelado',
    'Batata doce',
    'Batata asterix',
    'Batata bolinha',
    'Cebola roxa',
    'Cebola branca',
    'Alho nacional',
    'Gengibre fresco',
    'Mandioquinha',
    'Quiabo',
    'Vagem fresca',
    'Tomate cereja',
    'Tomate italiano',
    'Tomate grape',
    'Pepino japonês fresco',
    'Pimentão laranja',
    'Pimentão roxo',
    'Abóbora cabotiá',
    'Abóbora japonesa em cubos',
    'Couve manteiga picada',
    'Mix de folhas',
    'Banana nanica',
    'Banana da terra',
    'Maçã fuji',
    'Maçã verde',
    'Pera argentina',
    'Uva preta sem semente',
    'Uva crimson',
    'Manga espada',
    'Manga rosa',
    'Mamão havaí',
    'Morango orgânico',
    'Mirtilo congelado',
    'Framboesa congelada',
    'Ameixa seca',
    'Damasco seco',
    'Tâmara sem caroço',
    'Castanha de caju torrada',
    'Noz pecã',
    'Amêndoa torrada',
    'Pistache sem sal',
    'Batata palito congelada',
    'Batata ondulada congelada',
    'Batata rústica congelada',
    'Mandioca palito congelada',
    'Brócolis congelado em floretes',
    'Couve-flor congelada em floretes',
    'Mix oriental congelado',
    'Ervilha congelada',
    'Milho congelado',
    'Espinafre congelado',
    'Lasanha de carne congelada',
    'Lasanha de queijo congelada',
    'Lasanha de espinafre congelada',
    'Nhoque de batata congelado',
    'Ravioli de quatro queijos congelado',
    'Capeletti de carne congelado',
    'Canelone de frango congelado',
    'Pizza de calabresa congelada',
    'Pizza de frango congelada',
    'Torta salgada congelada',
    'Pão integral multigrãos',
    'Pão de aveia integral',
    'Pão de centeio integral',
    'Pão australiano fatiado',
    'Pão de forma sem casca',
    'Pão de leite',
    'Pão de queijo congelado',
    'Baguete francesa',
    'Baguete de alho',
    'Torrada de alho',
    'Bolo de cenoura',
    'Bolo de chocolate',
    'Bolo de coco',
    'Bolo de banana',
    'Bolo de limão',
    'Rosca doce',
    'Rosca de coco',
    'Rosca de chocolate',
    'Sonho de chocolate',
    'Sonho de creme',
    'Detergente para louça neutro',
    'Detergente para louça maçã',
    'Detergente para louça coco',
    'Sabão em barra glicerinado',
    'Sabão em barra coco',
    'Sabão líquido para louças',
    'Lava roupas líquido',
    'Lava roupas em cápsulas',
    'Alvejante perfumado',
    'Amaciante floral',
    'Desinfetante cítrico',
    'Desinfetante eucalipto',
    'Desinfetante floral',
    'Limpador perfumado de pisos',
    'Limpador de cozinha',
    'Limpador de banheiro',
    'Limpador de inox',
    'Limpa vidros com álcool',
    'Limpa estofados',
    'Limpa carpetes',
    'Esponja mágica',
    'Esponja de silicone',
    'Escova para copos',
    'Escova sanitária',
    'Escova para tanque',
    'Rodo com espuma',
    'Rodo mágico',
    'Mop compacto',
    'Pano de microfibra para vidro',
    'Pano absorvente',
    'Papel toalha decorado',
    'Papel toalha premium',
    'Papel higiênico folha tripla',
    'Papel higiênico folha quádrupla',
    'Guardanapo folha dupla',
    'Guardanapo gourmet',
    'Saco para lixo biodegradável',
    'Saco para lixo perfumado',
    'Saco zip para freezer',
    'Filme plástico com cortador',
    'Sabonete líquido floral',
    'Sabonete líquido neutro',
    'Sabonete líquido infantil',
    'Sabonete hidratante de aveia',
    'Shampoo antirresíduos',
    'Shampoo nutritivo',
    'Shampoo para cabelos lisos',
    'Shampoo para cabelos cacheados',
    'Condicionador nutritivo',
    'Condicionador para cabelos lisos',
    'Creme de pentear',
    'Máscara de hidratação capilar',
    'Gel capilar',
    'Creme corporal de aveia',
    'Creme corporal de amêndoas',
    'Hidratante corporal intensivo',
    'Hidratante facial em gel',
    'Protetor solar em spray',
    'Protetor solar infantil',
    'Protetor labial hidratante',
    'Desodorante roll-on neutro',
    'Desodorante aerosol sem perfume',
    'Desodorante aerosol floral',
    'Lenço umedecido refrescante',
    'Algodão quadrado',
    'Algodão em rolo',
    'Cotonete com haste flexível',
    'Fio dental mentolado',
    'Enxaguante bucal suave',
    'Escova dental extramacia',
    'Ração para cães de pequeno porte',
    'Ração para cães de médio porte',
    'Ração para cães de grande porte',
    'Ração para filhotes porte pequeno',
    'Ração para gatos adultos castrados',
    'Ração para gatos adultos indoor',
    'Sachê de frango para gatos',
    'Sachê de peixe para gatos',
    'Patê de frango para gatos',
    'Patê de salmão para gatos',
    'Petisco de frango para cães',
    'Petisco de fígado para cães',
    'Petisco de carne para gatos',
    'Petisco de peixe para gatos',
    'Biscoito funcional para cães',
    'Biscoito dental para cães',
    'Areia vegetal perfumada',
    'Areia mineral para gatos',
    'Tapete higiênico lavável',
    'Tapete higiênico absorvente',
    'Fralda infantil RN',
    'Fralda infantil P',
    'Fralda infantil M',
    'Fralda infantil G',
    'Fralda infantil XG',
    'Fralda infantil XXG',
    'Lenço umedecido para bebê',
    'Sabonete em barra infantil',
    'Sabonete líquido para bebê',
    'Shampoo para bebê',
    'Papinha de banana',
    'Papinha de maçã',
    'Papinha de legumes',
    'Cereal infantil de arroz',
    'Cereal infantil de aveia',
    'Biscoito infantil',
    'Suco infantil de maçã',
    'Suco infantil de uva',
    'Água de coco infantil',
    'Leite infantil em pó',
    'Carvão vegetal premium',
    'Acendedor para churrasqueira',
    'Palito para churrasco bambu',
    'Espeto de madeira',
    'Papel manteiga antiaderente',
    'Papel para air fryer',
    'Forma descartável de alumínio',
    'Forma descartável de papel',
    'Filtro de café tamanho 102',
    'Filtro de café tamanho 103',
    'Pilha alcalina C',
    'Pilha alcalina D',
    'Pilha recarregável AA',
    'Pilha recarregável AAA',
    'Lâmpada LED 9W',
    'Lâmpada LED 12W',
    'Lâmpada LED 15W',
    'Lâmpada LED 20W',
    'Fita adesiva larga',
    'Fita adesiva dupla face forte',
  ];
  const BRANDS = [
    'Qualitá',
    'Carrefour',
    'Taeq',
    'GoodBom',
    'Great Value',
    'Sabor & Vida',
    'Casa Boa',
    'Bom Dia',
    'Vale Mais',
    'Ponto Certo',
  ];
  const CATEGORIES = [
    'Alimentos',
    'Bebidas',
    'Laticínios',
    'Carnes',
    'Hortifruti',
    'Frutas',
    'Congelados',
    'Padaria',
    'Limpeza',
    'Higiene',
    'Pet',
    'Bebê',
    'Casa',
    'Outros',
  ];
  const UNITS = ['200 g', '300 g', '500 g', '750 g', '1 kg', '1 L', '1,5 L', '2 L', '1 un', '2 un'];

  const norm = (value) =>
    String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');
  function openDB() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(DB, VERSION);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error || Error('IndexedDB indisponível'));
    });
  }
  function all(db, store) {
    return new Promise((resolve, reject) => {
      const r = db.transaction(store, 'readonly').objectStore(store).getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error || Error(`Falha ao ler ${store}`));
    });
  }
  function getSetting(db, key) {
    return new Promise((resolve, reject) => {
      const r = db.transaction('settings', 'readonly').objectStore('settings').get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  }
  function write(db, additions) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['referenceProducts', 'settings'], 'readwrite');
      const products = tx.objectStore('referenceProducts');
      const settings = tx.objectStore('settings');
      additions.forEach((x) => products.put(x));
      settings.put({ key: MARKER, value: 1 });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || Error('Falha ao gravar produtos de referência'));
      tx.onabort = () => reject(tx.error || Error('Expansão cancelada'));
    });
  }

  async function updateStatus() {
    const host = document.querySelector('#catalogView .panel');
    if (!host) return;
    let el = document.getElementById('referenceCatalogStatus');
    if (!el) {
      el = document.createElement('div');
      el.id = 'referenceCatalogStatus';
      el.className = 'hint';
      el.style.marginTop = '8px';
      host.appendChild(el);
    }
    try {
      const db = await openDB();
      const [products, markets] = await Promise.all([
        all(db, 'referenceProducts'),
        all(db, 'referenceMarkets'),
      ]);
      db.close();
      el.textContent = `Banco offline: ${products.length.toLocaleString('pt-BR')} produtos • ${markets.length.toLocaleString('pt-BR')} mercados`;
      el.setAttribute(
        'aria-label',
        `Banco offline: ${products.length} produtos e ${markets.length} mercados`
      );
    } catch (error) {
      el.textContent = 'Banco offline: não foi possível consultar a quantidade agora.';
      console.error('Status do banco offline:', error);
    }
  }

  async function run() {
    try {
      updateStatus();
      const db = await openDB();
      const current = await all(db, 'referenceProducts');
      const ownMarker = await getSetting(db, MARKER);
      if (ownMarker?.value === 1 || current.length >= TARGET_TOTAL) {
        db.close();
        return;
      }
      const needed = TARGET_TOTAL - current.length;
      const used = new Set(
        current.map((item) => `${norm(item.name)}|${norm(item.brand)}|${norm(item.unit)}`)
      );
      const additions = [];
      let serial = 1;
      outer: for (const name of NAMES) {
        for (const brand of BRANDS) {
          if (additions.length >= needed) break outer;
          const unit = UNITS[(serial - 1) % UNITS.length];
          const key = `${norm(name)}|${norm(brand)}|${norm(unit)}`;
          if (used.has(key)) continue;
          used.add(key);
          additions.push({
            id: `ref-p-extra4-${serial++}`,
            name,
            brand,
            unit,
            category: CATEGORIES[(serial - 1) % CATEGORIES.length],
            ean: '',
          });
        }
      }
      if (additions.length !== needed) {
        db.close();
        console.error(
          `Expansão 4 interrompida: necessários ${needed}, gerados ${additions.length}.`
        );
        return;
      }
      await write(db, additions);
      db.close();
      console.info(
        `Expansão 4 concluída: ${additions.length} produtos adicionados; total-alvo ${TARGET_TOTAL}.`
      );
      setTimeout(updateStatus, 100);
      location.reload();
    } catch (error) {
      console.error('Expansão 4 do banco de referência:', error);
    }
  }

  function bootStatus() {
    updateStatus();
    const observer = new MutationObserver(() => updateStatus());
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(updateStatus, 3000);
  }
  if (document.readyState === 'loading')
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        bootStatus();
        run();
      },
      { once: true }
    );
  else {
    bootStatus();
    run();
  }
})();
