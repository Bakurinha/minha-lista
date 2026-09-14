(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const VERSION = 6;
  const TARGET = 1000;
  const MARKER = 'referenceProductExpansionV230_2';

  // Segunda expansão do catálogo de referência: 200 produtos novos x 5 marcas = 1000 registros.
  // Os nomes abaixo não repetem os nomes definidos nas expansões de referência existentes.
  const GROUPS = [
    [
      'Alimentos',
      [
        'Farofa de bacon',
        'Farofa de alho',
        'Farofa de cebola',
        'Farofa de banana',
        'Farofa de manteiga',
        'Arroz vermelho',
        'Arroz negro',
        'Arroz japonês',
        'Arroz arbóreo',
        'Arroz basmati',
        'Feijão azuki',
        'Feijão mungo',
        'Grão-de-bico cozido',
        'Grão-de-bico seco',
        'Ervilha partida',
        'Lentilha marrom',
        'Lentilha verde',
        'Amaranto em grãos',
        'Semente de chia',
        'Semente de linhaça',
      ],
      ['Camil', 'Urbano', 'Yoki', 'Qualitá', 'Taeq'],
      ['250 g', '500 g', '1 kg', '2 kg'],
    ],
    [
      'Alimentos',
      [
        'Molho de pimenta',
        'Molho barbecue',
        'Molho de alho',
        'Molho de ervas',
        'Molho rosé',
        'Molho madeira',
        'Molho cheddar',
        'Molho quatro queijos',
        'Molho pesto',
        'Molho shoyu',
        'Vinagre de álcool',
        'Vinagre de maçã',
        'Vinagre de vinho tinto',
        'Vinagre de vinho branco',
        'Azeite extra virgem',
        'Azeite de oliva',
        'Óleo de girassol',
        'Óleo de canola',
        'Óleo de milho',
        'Óleo de coco',
      ],
      ['Hemmer', 'Cepêra', 'Predilecta', 'Qualitá', 'Taeq'],
      ['250 ml', '500 ml', '750 ml', '1 L'],
    ],
    [
      'Alimentos',
      [
        'Creme de cebola',
        'Caldo de galinha',
        'Caldo de carne',
        'Caldo de legumes',
        'Caldo de bacon',
        'Sopa de legumes',
        'Sopa de cebola',
        'Sopa de ervilha',
        'Sopa de galinha',
        'Sopa de lentilha',
        'Purê de batata instantâneo',
        'Polenta instantânea',
        'Cuscuz nordestino',
        'Cuscuz paulista',
        'Farinha de rosca',
        'Farinha de arroz',
        'Farinha de linhaça',
        'Farinha de amêndoas',
        'Fubá mimoso',
        'Fubá pré-cozido',
      ],
      ['Knorr', 'Maggi', 'Yoki', 'Qualitá', 'Kitano'],
      ['40 g', '80 g', '200 g', '500 g', '1 kg'],
    ],
    [
      'Bebidas',
      [
        'Suco de abacaxi',
        'Suco de pêssego',
        'Suco de pera',
        'Suco de laranja',
        'Suco de limão',
        'Suco de melancia',
        'Suco de frutas vermelhas',
        'Néctar de pêssego',
        'Néctar de goiaba',
        'Néctar de maracujá',
        'Néctar de laranja',
        'Néctar de maçã',
        'Bebida de soja',
        'Bebida de amêndoas',
        'Bebida de coco',
        'Bebida de arroz',
        'Água de coco',
        'Água mineral sem gás',
        'Água alcalina',
        'Água com limão',
      ],
      ['Del Valle', 'Ades', 'Minalba', 'Qualitá', 'Taeq'],
      ['200 ml', '330 ml', '500 ml', '1 L', '1,5 L'],
    ],
    [
      'Bebidas',
      [
        'Refrigerante laranja',
        'Refrigerante limão',
        'Refrigerante uva',
        'Refrigerante citrus',
        'Refrigerante cola zero',
        'Bebida energética',
        'Bebida isotônica',
        'Bebida esportiva de laranja',
        'Bebida esportiva de limão',
        'Água aromatizada de limão',
        'Água aromatizada de frutas vermelhas',
        'Chá mate',
        'Chá de camomila',
        'Chá de capim-limão',
        'Chá de frutas vermelhas',
        'Chá de pêssego',
        'Chá de limão',
        'Café solúvel',
        'Café descafeinado',
        'Café em cápsulas',
      ],
      ['Coca-Cola', 'Pepsi', 'Gatorade', 'Leão', '3 Corações'],
      ['200 ml', '250 ml', '350 ml', '500 ml', '1 L'],
    ],
    [
      'Laticínios',
      [
        'Leite semidesnatado',
        'Leite desnatado',
        'Leite sem lactose integral',
        'Leite sem lactose desnatado',
        'Leite fermentado',
        'Iogurte de coco',
        'Iogurte de frutas',
        'Iogurte de morango',
        'Iogurte de pêssego',
        'Iogurte de ameixa',
        'Iogurte de coco com granola',
        'Iogurte proteico',
        'Bebida láctea de baunilha',
        'Bebida láctea de frutas',
        'Coalhada integral',
        'Coalhada desnatada',
        'Queijo minas padrão',
        'Queijo minas frescal',
        'Queijo estepe',
        'Queijo parmesão ralado',
      ],
      ['Piracanjuba', 'Vigor', 'Itambé', 'Batavo', 'Qualitá'],
      ['90 g', '120 g', '170 g', '200 g', '500 g', '1 L'],
    ],
    [
      'Carnes',
      [
        'Peito de peru fatiado',
        'Mortadela tradicional',
        'Mortadela defumada',
        'Salame italiano',
        'Salame hamburguês',
        'Presunto cozido',
        'Presunto parma',
        'Linguiça toscana',
        'Linguiça calabresa defumada',
        'Linguiça de frango',
        'Linguiça suína',
        'Hambúrguer artesanal bovino',
        'Almôndega bovina congelada',
        'Kafta bovina',
        'Espetinho de frango',
        'Espetinho bovino',
        'Carne seca dessalgada',
        'Costela suína temperada',
        'Bife de patinho',
        'Bife de coxão mole',
      ],
      ['Sadia', 'Seara', 'Aurora', 'Swift', 'Perdigão'],
      ['200 g', '300 g', '500 g', '700 g', '1 kg'],
    ],
    [
      'Hortifruti',
      [
        'Abobrinha italiana',
        'Berinjela',
        'Pimentão verde',
        'Pimentão vermelho',
        'Pimentão amarelo',
        'Pepino japonês',
        'Pepino comum',
        'Rabanete',
        'Beterraba',
        'Batata baroa',
        'Couve manteiga',
        'Couve-flor fresca',
        'Brócolis ninja',
        'Espinafre',
        'Agrião',
        'Rúcula',
        'Salsa',
        'Coentro',
        'Cebolinha',
        'Manjericão fresco',
      ],
      ['Qualitá', 'Carrefour', 'Taeq', 'Oba', 'Hortifruti'],
      ['1 un', '2 un', '300 g', '500 g', '1 kg'],
    ],
    [
      'Hortifruti',
      [
        'Abacaxi pérola',
        'Abacate',
        'Manga palmer',
        'Manga tommy',
        'Mamão formosa',
        'Mamão papaia',
        'Melancia',
        'Melão amarelo',
        'Melão orange',
        'Kiwi',
        'Pera portuguesa',
        'Pera williams',
        'Uva verde sem semente',
        'Uva roxa sem semente',
        'Morango fresco',
        'Mirtilo',
        'Framboesa',
        'Ameixa fresca',
        'Pêssego fresco',
        'Nectarina',
      ],
      ['Qualitá', 'Carrefour', 'Taeq', 'Oba', 'Hortifruti'],
      ['150 g', '250 g', '500 g', '1 kg', '1 un'],
    ],
    [
      'Congelados',
      [
        'Ravioli de carne congelado',
        'Ravioli de queijo congelado',
        'Capeletti de frango congelado',
        'Capeletti de carne congelado',
        'Nhoque congelado',
        'Panqueca de carne congelada',
        'Panqueca de frango congelada',
        'Panqueca de queijo congelada',
        'Escondidinho de carne congelado',
        'Escondidinho de frango congelado',
        'Aipim congelado',
        'Mandioca congelada',
        'Milho congelado',
        'Ervilha congelada',
        'Espinafre congelado',
        'Cenoura congelada',
        'Vagem congelada',
        'Mix de vegetais congelado',
        'Massa folhada congelada',
        'Massa para pastel congelada',
      ],
      ['Sadia', 'Seara', 'Perdigão', 'Qualitá', 'Swift'],
      ['300 g', '400 g', '500 g', '600 g', '1 kg'],
    ],
    [
      'Padaria',
      [
        'Pão de hambúrguer',
        'Pão de cachorro-quente',
        'Pão de hot dog brioche',
        'Pão de leite integral',
        'Pão de batata recheado',
        'Pão de milho caseiro',
        'Pão multigrãos com castanhas',
        'Pão integral com sementes',
        'Pão com queijo',
        'Pão de calabresa',
        'Croissant de chocolate',
        'Croissant de queijo',
        'Croissant tradicional',
        'Sonho de creme',
        'Sonho de doce de leite',
        'Rosca de coco',
        'Rosca de canela',
        'Bolo de laranja',
        'Bolo de fubá',
        'Bolo de milho',
      ],
      ['Bauducco', 'Pullman', 'Panco', 'Seven Boys', 'Qualitá'],
      ['150 g', '250 g', '300 g', '400 g', '500 g', '600 g'],
    ],
    [
      'Limpeza',
      [
        'Limpador para vidro',
        'Limpador para madeira',
        'Limpador para mármore',
        'Limpador para porcelanato',
        'Limpador para azulejo',
        'Limpador para inox',
        'Limpador para carpetes',
        'Limpador para estofados',
        'Limpador tira gordura',
        'Limpador bactericida',
        'Desengordurante para forno',
        'Desengordurante para fogão',
        'Desengordurante para churrasqueira',
        'Limpa telas',
        'Limpa eletrônicos',
        'Limpa tapetes',
        'Limpa laminados',
        'Limpa rejuntes',
        'Limpa piscina doméstica',
        'Neutralizador de odores para tecidos',
      ],
      ['Veja', 'Ypê', 'Limpol', 'Qualitá', 'Bombril'],
      ['250 ml', '500 ml', '750 ml', '1 L', '1,5 L'],
    ],
    [
      'Limpeza',
      [
        'Esponja dupla face',
        'Esponja de aço',
        'Esponja antiaderente',
        'Escova para louças',
        'Escova para garrafas',
        'Escova para roupas',
        'Escova para sapatos',
        'Vassoura multiuso',
        'Rodo grande',
        'Rodo pequeno',
        'Pá para lixo',
        'Pano de microfibra',
        'Pano para chão',
        'Flanela de limpeza',
        'Luva de borracha doméstica',
        'Saco para freezer',
        'Saco para lixo pequeno',
        'Saco para lixo médio',
        'Saco para lixo grande',
        'Saco para lixo reforçado',
      ],
      ['Bombril', 'Scotch-Brite', 'Condor', 'Qualitá', 'Ypê'],
      ['1 un', '2 un', '3 un', '5 un', '10 un', '50 un'],
    ],
    [
      'Higiene',
      [
        'Sabonete esfoliante',
        'Sabonete glicerinado',
        'Sabonete antibacteriano',
        'Sabonete hidratante',
        'Sabonete em barra infantil',
        'Shampoo para cabelos secos',
        'Shampoo para cabelos oleosos',
        'Shampoo para cabelos cacheados',
        'Shampoo para cabelos coloridos',
        'Shampoo reparador',
        'Condicionador para cabelos secos',
        'Condicionador para cabelos cacheados',
        'Condicionador reparador',
        'Leave-in capilar',
        'Óleo capilar',
        'Creme corporal',
        'Hidratante corporal',
        'Hidratante para mãos',
        'Protetor solar facial',
        'Protetor solar corporal',
      ],
      ['Dove', 'Nivea', 'Pantene', 'Seda', 'Johnson’s'],
      ['70 g', '90 g', '100 ml', '200 ml', '300 ml', '400 ml'],
    ],
    [
      'Higiene',
      [
        'Desodorante roll-on',
        'Desodorante aerosol masculino',
        'Desodorante aerosol feminino',
        'Talco para pés',
        'Talco infantil',
        'Algodão em bolas',
        'Algodão em discos',
        'Cotonete',
        'Lenço umedecido',
        'Absorvente diário',
        'Absorvente noturno',
        'Absorvente com abas',
        'Escova interdental',
        'Raspador de língua',
        'Creme para dentadura',
        'Barbeador descartável',
        'Lâmina para barbear',
        'Espuma de barbear',
        'Gel pós-barba',
        'Aparelho de depilação descartável',
      ],
      ['Rexona', 'Nivea', 'Always', 'Oral-B', 'Gillette'],
      ['10 un', '20 un', '50 un', '100 ml', '150 ml', '200 ml'],
    ],
    [
      'Pet',
      [
        'Biscoito canino',
        'Biscoito felino',
        'Petisco de carne para cães',
        'Petisco de frango para cães',
        'Petisco de peixe para gatos',
        'Petisco de salmão para gatos',
        'Patê de frango para cães',
        'Patê de carne para cães',
        'Patê de peixe para gatos',
        'Patê de fígado para gatos',
        'Leite para gatos',
        'Suplemento vitamínico para pets',
        'Shampoo para cães',
        'Shampoo para gatos',
        'Condicionador para cães',
        'Desembaraçador para pets',
        'Colônia para cães',
        'Colônia para gatos',
        'Higienizador de patas',
        'Limpador de orelhas para pets',
      ],
      ['Pedigree', 'Whiskas', 'Premier', 'Purina', 'Special Dog'],
      ['50 g', '100 g', '200 g', '300 g', '500 g', '1 L'],
    ],
    [
      'Pet',
      [
        'Tapete higiênico perfumado',
        'Tapete higiênico extra absorvente',
        'Areia vegetal para gatos',
        'Areia de sílica',
        'Areia aglomerante',
        'Granulado de madeira para gatos',
        'Pá higiênica para gatos',
        'Comedouro para cães',
        'Comedouro para gatos',
        'Bebedouro para cães',
        'Bebedouro para gatos',
        'Brinquedo mordedor para cães',
        'Bola para cães',
        'Bola com guizo para gatos',
        'Arranhador para gatos',
        'Coleira para cães',
        'Coleira para gatos',
        'Guia para cães',
        'Peitoral para cães',
        'Brinquedo de corda para cães',
      ],
      ['Pipicat', 'Premier', 'Petz', 'Cobasi', 'Special Dog'],
      ['1 un', '2 un', '4 un', '10 un', '20 un'],
    ],
    [
      'Outros',
      [
        'Papel manteiga',
        'Papel vegetal',
        'Papel para forno',
        'Saco zip para alimentos',
        'Saco para assar alimentos',
        'Forma de alumínio descartável',
        'Forma de papel para bolo',
        'Guardanapo decorado',
        'Guardanapo de papel grande',
        'Toalha de papel reforçada',
        'Palito de dente',
        'Palito para churrasco',
        'Espeto de bambu',
        'Filtro de papel para café',
        'Filtro permanente para café',
        'Forma de gelo reutilizável',
        'Saco para gelo',
        'Carvão vegetal',
        'Acendedor ecológico',
        'Fósforo extra longo',
      ],
      ['Qualitá', 'Carrefour', 'Taeq', 'Bom Preço', 'Dia'],
      ['10 un', '20 un', '50 un', '100 un', '1 pacote'],
    ],
    [
      'Outros',
      [
        'Pilha alcalina AA',
        'Pilha alcalina AAA',
        'Pilha botão CR2032',
        'Lâmpada LED branca',
        'Lâmpada LED amarela',
        'Lâmpada LED bulbo',
        'Lâmpada LED vela',
        'Extensão elétrica doméstica',
        'Adaptador de tomada',
        'Fita adesiva transparente',
        'Fita isolante',
        'Fita dupla face',
        'Saco plástico para freezer',
        'Filme plástico reforçado',
        'Papel toalha industrial',
        'Pano multiuso',
        'Pregador de roupas',
        'Varal de roupas compacto',
        'Cabide plástico',
        'Cabide infantil',
      ],
      ['Elgin', 'Intelbras', 'Qualitá', 'Carrefour', 'Tramontina'],
      ['1 un', '2 un', '4 un', '6 un', '10 un'],
    ],
    [
      'Alimentos',
      [
        'Doce de leite cremoso',
        'Doce de leite com coco',
        'Geleia de morango',
        'Geleia de uva',
        'Geleia de frutas vermelhas',
        'Geleia de damasco',
        'Geleia de goiaba',
        'Creme de avelã',
        'Creme de amendoim',
        'Pasta de amendoim crocante',
        'Mel silvestre',
        'Mel de laranjeira',
        'Melado de cana',
        'Xarope de bordo',
        'Coco ralado úmido',
        'Coco ralado seco',
        'Leite de coco',
        'Creme de coco',
        'Castanha-do-pará',
        'Nozes sem casca',
      ],
      ['Predilecta', 'Queensberry', 'Nestlé', 'Qualitá', 'Taeq'],
      ['200 g', '250 g', '350 g', '400 g', '500 ml'],
    ],
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

  function readStore(db, store) {
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(store)) return resolve([]);
      const request = db.transaction(store, 'readonly').objectStore(store).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || Error(`Falha ao ler ${store}`));
    });
  }

  async function run() {
    try {
      const db = await openDB();
      const markerRecord = await new Promise((resolve, reject) => {
        if (!db.objectStoreNames.contains('settings')) return resolve(null);
        const request = db.transaction('settings', 'readonly').objectStore('settings').get(MARKER);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || Error('Falha ao ler marcador da expansão'));
      });

      if (markerRecord?.value === 1) {
        db.close();
        return;
      }

      const current = await readStore(db, 'referenceProducts');
      const used = new Set(
        current.map((item) => `${norm(item.name)}|${norm(item.brand)}|${norm(item.unit)}`)
      );
      const additions = [];
      let serial = 1;

      outer: for (const [category, names, brands, units] of GROUPS) {
        for (let i = 0; i < names.length; i += 1) {
          const name = names[i];
          const unit = units[i % units.length];
          for (const brand of brands) {
            if (additions.length >= TARGET) break outer;
            const key = `${norm(name)}|${norm(brand)}|${norm(unit)}`;
            if (used.has(key)) continue;
            used.add(key);
            additions.push({
              id: `ref-p-extra2-${serial++}`,
              name,
              brand,
              unit,
              category,
              ean: '',
            });
          }
        }
      }

      if (additions.length !== TARGET) {
        db.close();
        console.error(`Expansão 2 interrompida: esperados ${TARGET}, gerados ${additions.length}.`);
        return;
      }

      await new Promise((resolve, reject) => {
        const transaction = db.transaction(['referenceProducts', 'settings'], 'readwrite');
        const products = transaction.objectStore('referenceProducts');
        const settings = transaction.objectStore('settings');
        for (const item of additions) products.put(item);
        settings.put({ key: MARKER, value: 1 });
        transaction.oncomplete = resolve;
        transaction.onerror = () =>
          reject(transaction.error || Error('Falha ao gravar segunda expansão de produtos'));
        transaction.onabort = () =>
          reject(transaction.error || Error('Segunda expansão cancelada'));
      });

      db.close();
      console.info(
        `Segunda expansão concluída: ${additions.length} produtos adicionados ao banco offline.`
      );
    } catch (error) {
      console.error('Expansão 2 do banco de referência:', error);
    }
  }

  run();
})();
