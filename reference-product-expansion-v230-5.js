(() => {
  'use strict';
  const DB = 'MinhaListaDB';
  const VERSION = 6;
  const TARGET_TOTAL = 20000;
  const MARKER = 'referenceProductExpansionV230_6';
  const VARIANTS = [
    'Tradicional',
    'Integral',
    'Zero açúcar',
    'Sem açúcar',
    'Light',
    'Premium',
    'Orgânico',
    'Natural',
    'Artesanal',
    'Caseiro',
    'Especial',
    'Clássico',
    'Sem lactose',
    'Sem glúten',
    'Vegano',
    'Vegetal',
    'Defumado',
    'Apimentado',
    'Suave',
    'Com ervas',
    'Com alho',
    'Com cebola',
    'Com queijo',
    'Com chocolate',
    'Com frutas',
    'Com castanhas',
    'Com mel',
    'Com aveia',
    'Com coco',
    'Multigrãos',
    'Proteico',
    'Fitness',
    'Infantil',
    'Família',
    'Econômico',
    'Seleção especial',
    'Receita original',
    'Extra cremoso',
    'Extra crocante',
    'Zero',
  ];
  const BRAND_POOLS = {
    Alimentos: [
      'Camil',
      'Tio João',
      'Kicaldo',
      'Urbano',
      'Prato Fino',
      'Yoki',
      'Dona Benta',
      'União',
      'Kitano',
      'Quero',
      'Predilecta',
      'Pomarola',
      'Hellmanns',
      'Heinz',
      'Adria',
    ],
    Bebidas: [
      '3 Corações',
      'Pilão',
      'Melitta',
      'Coca-Cola',
      'Pepsi',
      'Guaraná Antarctica',
      'Fanta',
      'Del Valle',
      'Kapo',
      'Indaiá',
      'Leão',
      'Matte Leão',
      'Red Bull',
      'Gatorade',
      'Itubaína',
    ],
    Laticínios: [
      'Nestlé',
      'Ninho',
      'Piracanjuba',
      'Vigor',
      'Itambé',
      'Leitíssimo',
      'Catupiry',
      'Danone',
      'Activia',
      'Batavo',
      'Elegê',
      'Polenghi',
    ],
    Carnes: [
      'Sadia',
      'Perdigão',
      'Seara',
      'Friboi',
      'Swift',
      'Aurora',
      'Copacol',
      'Marba',
      'Minerva',
    ],
    Hortifruti: ['Genérico'],
    Frutas: ['Genérico'],
    Congelados: [
      'Sadia',
      'Perdigão',
      'Seara',
      'McCain',
      'Aurora',
      'Copacol',
      'Forno de Minas',
      'Kibon',
      'Nestlé',
    ],
    Padaria: ['Wickbold', 'Pullman', 'Seven Boys', 'Bauducco', 'Visconti', 'Panco', 'Plus Vita'],
    Limpeza: [
      'Ypê',
      'Omo',
      'Veja',
      'Comfort',
      'Downy',
      'Bombril',
      'Qboa',
      'Brilhante',
      'Minuano',
      'Limpol',
      'Mr. Músculo',
    ],
    Higiene: [
      'Colgate',
      'Oral-B',
      'Rexona',
      'Dove',
      'Pantene',
      'Head & Shoulders',
      'Seda',
      'Nivea',
      'Neutrogena',
      'Closeup',
      'Palmolive',
    ],
    Pet: [
      'Pedigree',
      'Whiskas',
      'Purina',
      'Premier Pet',
      'GranPlus',
      'Golden',
      'Special Dog',
      'Magnus',
      'Pipicat',
      'Kelco',
    ],
    Bebê: ['Huggies', 'Pampers', 'Johnson’s Baby', 'Pom Pom', 'Mili', 'Turma da Mônica', 'Babysec'],
    Casa: [
      'Wyda',
      'Sanremo',
      'Tramontina',
      'Paramount',
      'Dover-Roll',
      'Invicta',
      'Nadir',
      'Termolar',
    ],
  };
  const UNITS = ['200 g', '300 g', '500 g', '750 g', '1 kg', '1 L', '1,5 L', '2 L', '1 un', '2 un'];
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
  function write(db, additions) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['referenceProducts', 'settings'], 'readwrite');
      const products = tx.objectStore('referenceProducts');
      const settings = tx.objectStore('settings');
      additions.forEach((item) => products.put(item));
      settings.put({ key: MARKER, value: 1 });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || Error('Falha ao gravar produtos de referência'));
      tx.onabort = () => reject(tx.error || Error('Expansão cancelada'));
    });
  }
  async function run() {
    try {
      const db = await openDB();
      const current = await all(db, 'referenceProducts');
      const oldMarker = await new Promise((resolve, reject) => {
        const r = db
          .transaction('settings', 'readonly')
          .objectStore('settings')
          .get('referenceProductExpansionV230_5');
        r.onsuccess = () => resolve(r.result || null);
        r.onerror = () => reject(r.error || Error('Falha ao ler marcador'));
      });
      const ownMarker = await new Promise((resolve, reject) => {
        const r = db.transaction('settings', 'readonly').objectStore('settings').get(MARKER);
        r.onsuccess = () => resolve(r.result || null);
        r.onerror = () => reject(r.error || Error('Falha ao ler marcador'));
      });
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
      for (const base of current) {
        if (additions.length >= needed) break;
        const category = base.category || CATEGORIES[(serial - 1) % CATEGORIES.length];
        const brands = BRAND_POOLS[category] || BRAND_POOLS.Alimentos;
        for (const variant of VARIANTS) {
          for (const brand of brands) {
            for (const unit of UNITS) {
              if (additions.length >= needed) break;
              const name = `${base.name} ${variant}`.trim();
              const key = `${norm(name)}|${norm(brand)}|${norm(unit)}`;
              if (used.has(key)) continue;
              used.add(key);
              additions.push({
                id: `ref-p-extra6-${serial++}`,
                name,
                brand,
                unit,
                category,
                ean: '',
              });
            }
          }
        }
      }
      if (additions.length !== needed) {
        db.close();
        console.error(
          `Expansão 6 interrompida: necessários ${needed}, gerados ${additions.length}.`
        );
        return;
      }
      await write(db, additions);
      db.close();
      console.info(
        `Expansão 6 concluída: ${additions.length} produtos adicionados; total-alvo ${TARGET_TOTAL}; expansão anterior detectada=${oldMarker?.value === 1}.`
      );
      location.reload();
    } catch (error) {
      console.error('Expansão 6 do banco de referência:', error);
    }
  }
  const boot = () => run();
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
