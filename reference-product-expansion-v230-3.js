(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const VERSION = 6;
  const TARGET_TOTAL = 2040;
  const MARKER = 'referenceProductExpansionV230_3';

  const GROUPS = [
    [
      'Alimentos',
      [
        'Granola de castanhas',
        'Granola de frutas',
        'Granola de chocolate',
        'Mix de castanhas',
        'Mix de sementes',
        'Pasta de amendoim integral',
        'Pasta de castanha',
        'Tahine de gergelim',
        'Mel orgânico',
        'Melaço de cana',
      ],
    ],
    [
      'Alimentos',
      [
        'Geleia de frutas vermelhas',
        'Geleia de laranja',
        'Geleia de abacaxi',
        'Geleia de maracujá',
        'Doce de banana',
        'Doce de abóbora',
        'Doce de goiaba cremoso',
        'Creme de avelã branco',
        'Cacau em pó',
        'Chocolate em pó 50%',
      ],
    ],
    [
      'Alimentos',
      [
        'Biscoito de canela',
        'Biscoito de limão',
        'Biscoito de baunilha',
        'Biscoito de castanha',
        'Biscoito de mel',
        'Cookies de chocolate branco',
        'Cookies de aveia',
        'Cracker de queijo',
        'Snack de milho',
        'Snack de queijo',
      ],
    ],
    [
      'Bebidas',
      [
        'Suco de acerola',
        'Suco de beterraba',
        'Suco de abacaxi com hortelã',
        'Suco de frutas tropicais',
        'Néctar de pera',
        'Néctar de abacaxi',
        'Néctar de caju',
        'Néctar de frutas vermelhas',
        'Chá de hibisco',
        'Chá de gengibre',
      ],
    ],
    [
      'Bebidas',
      [
        'Café torrado e moído extra forte',
        'Café torrado e moído suave',
        'Café gourmet',
        'Café em grãos',
        'Café solúvel liofilizado',
        'Cappuccino tradicional',
        'Cappuccino chocolate',
        'Chocolate quente em pó',
        'Mate tostado',
        'Chá preto com limão',
      ],
    ],
    [
      'Laticínios',
      [
        'Iogurte de banana',
        'Iogurte de mamão',
        'Iogurte de coco',
        'Iogurte de mel',
        'Iogurte com granola',
        'Bebida láctea de baunilha',
        'Bebida láctea de café',
        'Queijo prato fatiado',
        'Queijo cheddar fatiado',
        'Queijo minas padrão fatiado',
      ],
    ],
    [
      'Laticínios',
      [
        'Creme de ricota',
        'Cream cheese tradicional',
        'Cream cheese com ervas',
        'Manteiga com sal',
        'Manteiga sem sal',
        'Margarina cremosa',
        'Leite fermentado de morango',
        'Leite fermentado de frutas',
        'Sobremesa láctea de chocolate',
        'Sobremesa láctea de morango',
      ],
    ],
    [
      'Carnes',
      [
        'Filé de peito de frango temperado',
        'Filé de coxa de frango',
        'Asa de frango temperada',
        'Drumette de frango',
        'Isca de frango empanada',
        'Bife de alcatra',
        'Bife de maminha',
        'Bife de fraldinha',
        'Hambúrguer bovino congelado',
        'Almôndega de frango congelada',
      ],
    ],
    [
      'Carnes',
      [
        'Linguiça de churrasco',
        'Linguiça cuiabana',
        'Linguiça apimentada',
        'Linguiça de pernil',
        'Salsicha de frango',
        'Salsicha viena',
        'Nuggets de frango',
        'Nuggets de queijo',
        'Isca de peixe empanada',
        'Filé de tilápia congelado',
      ],
    ],
    [
      'Hortifruti',
      [
        'Abóbora japonesa',
        'Abóbora moranga',
        'Batata doce branca',
        'Batata doce roxa',
        'Batata inglesa lavada',
        'Mandioca fresca',
        'Inhame',
        'Chuchu',
        'Maxixe',
        'Jiló',
      ],
    ],
    [
      'Hortifruti',
      [
        'Couve roxa',
        'Acelga',
        'Alho-poró',
        'Aspargo fresco',
        'Tomate cereja amarelo',
        'Tomate italiano',
        'Milho verde fresco',
        'Cogumelo paris fresco',
        'Cogumelo shimeji',
        'Cogumelo shitake',
      ],
    ],
    [
      'Frutas',
      [
        'Banana nanica',
        'Banana maçã',
        'Banana da terra',
        'Maçã gala',
        'Maçã fuji',
        'Laranja pera',
        'Laranja bahia',
        'Limão tahiti',
        'Limão siciliano',
        'Tangerina ponkan',
      ],
    ],
    [
      'Frutas',
      [
        'Melão cantalupo',
        'Melão espanhol',
        'Uva niágara',
        'Uva rubi',
        'Caqui',
        'Pitaya',
        'Maracujá azedo',
        'Goiaba vermelha',
        'Coco verde',
        'Coco seco',
      ],
    ],
    [
      'Congelados',
      [
        'Batata noisette congelada',
        'Batata rústica congelada',
        'Batata smile congelada',
        'Anel de cebola congelado',
        'Legumes ao vapor congelados',
        'Mix de legumes congelado',
        'Brócolis congelado',
        'Couve-flor congelada',
        'Vagem congelada',
        'Milho congelado em grãos',
      ],
    ],
    [
      'Congelados',
      [
        'Lasanha bolonhesa congelada',
        'Lasanha quatro queijos congelada',
        'Lasanha de frango congelada',
        'Ravioli de ricota congelado',
        'Ravioli de espinafre congelado',
        'Canelone de queijo congelado',
        'Esfirra de carne congelada',
        'Esfirra de frango congelada',
        'Quibe congelado',
        'Pastel de carne congelado',
      ],
    ],
    [
      'Padaria',
      [
        'Pão australiano',
        'Pão ciabatta',
        'Pão de centeio',
        'Pão de aveia',
        'Pão de batata doce',
        'Pão de cenoura',
        'Pão de alho',
        'Pão de queijo tradicional',
        'Pão de queijo recheado',
        'Pão sírio',
      ],
    ],
    [
      'Padaria',
      [
        'Torrada tradicional',
        'Torrada integral',
        'Brioche fatiado',
        'Baguete italiana',
        'Baguete integral',
        'Focaccia',
        'Pão de hot dog integral',
        'Pão de hambúrguer integral',
        'Mini pão de leite',
        'Mini croissant',
      ],
    ],
    [
      'Limpeza',
      [
        'Limpador de cozinha',
        'Limpador de banheiro',
        'Limpador perfumado',
        'Limpador de pisos',
        'Limpador de granito',
        'Limpador de cerâmica',
        'Limpador de box',
        'Limpador de ralos',
        'Limpador de azulejo com cloro',
        'Limpador desengordurante cítrico',
      ],
    ],
    [
      'Limpeza',
      [
        'Detergente concentrado neutro',
        'Detergente concentrado limão',
        'Detergente concentrado coco',
        'Sabão líquido para roupas',
        'Sabão líquido para roupas delicadas',
        'Alvejante sem cloro',
        'Alvejante perfumado',
        'Amaciante concentrado',
        'Amaciante para roupas delicadas',
        'Desinfetante lavanda',
      ],
    ],
    [
      'Higiene',
      [
        'Sabonete líquido hidratante',
        'Sabonete líquido antibacteriano',
        'Sabonete íntimo',
        'Shampoo anticaspa',
        'Shampoo infantil',
        'Shampoo hidratante',
        'Condicionador infantil',
        'Condicionador hidratante',
        'Creme para pentear',
        'Máscara capilar',
      ],
    ],
    [
      'Higiene',
      [
        'Creme dental branqueador',
        'Creme dental infantil',
        'Enxaguante bucal',
        'Fio dental',
        'Escova dental macia',
        'Escova dental média',
        'Protetor labial',
        'Hidratante facial',
        'Água micelar',
        'Lenço de papel facial',
      ],
    ],
    [
      'Pet',
      [
        'Ração para cães adultos',
        'Ração para filhotes de cães',
        'Ração para cães idosos',
        'Ração para gatos adultos',
        'Ração para filhotes de gatos',
        'Ração para gatos castrados',
        'Sachê de frango para gatos',
        'Sachê de carne para gatos',
        'Biscoito dental canino',
        'Petisco dental felino',
      ],
    ],
    [
      'Pet',
      [
        'Areia higiênica aglomerante',
        'Areia higiênica perfumada',
        'Granulado sanitário para gatos',
        'Tapete higiênico para cães',
        'Tapete higiênico lavável',
        'Brinquedo de pelúcia para cães',
        'Brinquedo de borracha para cães',
        'Brinquedo com catnip para gatos',
        'Arranhador de papelão',
        'Bebedouro automático para pets',
      ],
    ],
    [
      'Bebê',
      [
        'Fralda tamanho RN',
        'Fralda tamanho P',
        'Fralda tamanho M',
        'Fralda tamanho G',
        'Fralda tamanho XG',
        'Lenço umedecido sem perfume',
        'Lenço umedecido infantil',
        'Sabonete líquido infantil',
        'Shampoo infantil suave',
        'Pomada para assaduras',
      ],
    ],
    [
      'Casa',
      [
        'Papel toalha folha dupla',
        'Papel toalha folha tripla',
        'Papel higiênico folha dupla',
        'Papel higiênico folha tripla',
        'Guardanapo folha simples',
        'Guardanapo folha dupla',
        'Saco para lixo de cozinha',
        'Saco para lixo de banheiro',
        'Filme plástico para alimentos',
        'Papel alumínio extra forte',
      ],
    ],
    [
      'Casa',
      [
        'Esponja para inox',
        'Esponja para antiaderente',
        'Pano multiuso perfumado',
        'Pano de microfibra grande',
        'Pano de microfibra pequeno',
        'Flanela multiuso',
        'Luva para limpeza pesada',
        'Saco zip grande',
        'Saco zip médio',
        'Saco zip pequeno',
      ],
    ],
    [
      'Bebidas',
      [
        'Água mineral com gás',
        'Água mineral premium',
        'Água saborizada de maçã',
        'Água saborizada de laranja',
        'Água saborizada de morango',
        'Água de coco integral',
        'Isotônico de uva',
        'Isotônico de tangerina',
        'Energético de frutas vermelhas',
        'Energético tropical',
      ],
    ],
    [
      'Alimentos',
      [
        'Macarrão penne integral',
        'Macarrão parafuso integral',
        'Macarrão talharim',
        'Macarrão ninho',
        'Macarrão cabelo de anjo',
        'Lasanha seca',
        'Conchiglione',
        'Fusilli tricolore',
        'Risoni',
        'Massa para sopa',
      ],
    ],
    [
      'Alimentos',
      [
        'Molho de tomate tradicional',
        'Molho de tomate com manjericão',
        'Molho de tomate picante',
        'Molho branco',
        'Molho de queijo',
        'Molho de alho cremoso',
        'Molho de pimenta suave',
        'Molho de pimenta extra forte',
        'Molho de mostarda e mel',
        'Molho de salada italiano',
      ],
    ],
  ];

  const BRANDS = [
    'Qualitá',
    'Taeq',
    'Carrefour',
    'Dia',
    'GoodBom',
    'Great Value',
    'Sabor & Vida',
    'Casa Boa',
    'Bom Dia',
    'Vale Mais',
    'Ponto Certo',
    'Preço Bom',
  ];

  const UNITS = [
    '100 g',
    '200 g',
    '250 g',
    '300 g',
    '500 g',
    '750 g',
    '1 kg',
    '1 L',
    '1,5 L',
    '2 L',
  ];

  const norm = (value) =>
    String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, VERSION);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
    });
  }

  function readAll(db, store) {
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(store)) return resolve([]);
      const request = db.transaction(store, 'readonly').objectStore(store).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || Error(`Falha ao ler ${store}`));
    });
  }

  function readSetting(db) {
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains('settings')) return resolve(null);
      const request = db.transaction('settings', 'readonly').objectStore('settings').get(MARKER);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || Error('Falha ao ler marcador da expansão'));
    });
  }

  function writeBatch(db, additions) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['referenceProducts', 'settings'], 'readwrite');
      const products = transaction.objectStore('referenceProducts');
      const settings = transaction.objectStore('settings');
      for (const item of additions) products.put(item);
      settings.put({ key: MARKER, value: 1 });
      transaction.oncomplete = resolve;
      transaction.onerror = () =>
        reject(transaction.error || Error('Falha ao gravar expansão do catálogo'));
      transaction.onabort = () => reject(transaction.error || Error('Expansão cancelada'));
    });
  }

  async function run() {
    try {
      const db = await openDB();
      const current = await readAll(db, 'referenceProducts');
      const marker = await readSetting(db);

      if (marker?.value === 1 || current.length >= TARGET_TOTAL) {
        db.close();
        return;
      }

      const needed = TARGET_TOTAL - current.length;
      const used = new Set(
        current.map((item) => `${norm(item.name)}|${norm(item.brand)}|${norm(item.unit)}`)
      );
      const additions = [];
      let serial = 1;

      outer: for (const [category, names] of GROUPS) {
        for (const name of names) {
          for (const brand of BRANDS) {
            if (additions.length >= needed) break outer;
            const unit = UNITS[serial % UNITS.length];
            const key = `${norm(name)}|${norm(brand)}|${norm(unit)}`;
            if (used.has(key)) continue;
            used.add(key);
            additions.push({
              id: `ref-p-extra3-${serial++}`,
              name,
              brand,
              unit,
              category,
              ean: '',
            });
          }
        }
      }

      if (additions.length !== needed) {
        db.close();
        console.error(
          `Expansão 3 interrompida: necessários ${needed}, gerados ${additions.length}.`
        );
        return;
      }

      await writeBatch(db, additions);
      db.close();
      console.info(
        `Expansão 3 concluída: ${additions.length} produtos adicionados; total-alvo ${TARGET_TOTAL}.`
      );
      location.reload();
    } catch (error) {
      console.error('Expansão 3 do banco de referência:', error);
    }
  }

  run();
})();
