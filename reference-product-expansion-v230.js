(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const VERSION = 6;
  const TARGET = 1000;
  const MARKER = 'referenceProductExpansionV230';

  const groups = [
    ['Alimentos', ['Arroz integral', 'Arroz parboilizado', 'Feijão branco', 'Feijão fradinho', 'Feijão vermelho', 'Lentilha vermelha', 'Quinoa', 'Cuscuz marroquino', 'Tapioca', 'Polvilho doce', 'Polvilho azedo', 'Farofa pronta', 'Farinha de aveia', 'Farinha de milho', 'Semolina', 'Canjiquinha'], ['Camil', 'Tio João', 'Urbano', 'Yoki', 'Kicaldo', 'Qualitá', 'Renata', 'Dona Benta'], ['500 g', '1 kg', '2 kg', '5 kg']],
    ['Alimentos', ['Biscoito integral', 'Biscoito de aveia', 'Biscoito de coco', 'Biscoito de leite', 'Biscoito de chocolate', 'Biscoito de polvilho', 'Cracker integral', 'Rosquinha de coco', 'Rosquinha de chocolate', 'Cookies integrais', 'Granola sem açúcar', 'Barra de proteína', 'Pipoca para micro-ondas', 'Batata palha', 'Amendoim torrado', 'Castanha de caju'], ['Bauducco', 'Piraquê', 'Marilan', 'Vitarella', 'Nestlé', 'Mãe Terra', 'Yoki', 'Qualitá'], ['80 g', '100 g', '150 g', '200 g', '300 g', '400 g', '500 g']],
    ['Bebidas', ['Suco de maçã', 'Suco de manga', 'Suco de maracujá', 'Suco de goiaba', 'Suco de caju', 'Suco de cranberry', 'Néctar de manga', 'Néctar de uva', 'Chá verde', 'Chá preto', 'Chá de erva-doce', 'Chá de hortelã', 'Água tônica', 'Água com gás', 'Água saborizada', 'Bebida vegetal de aveia'], ['Del Valle', 'Aurora', 'Kapo', 'Leão', 'Matte Leão', 'Minalba', 'Indaiá', 'Ades'], ['200 ml', '330 ml', '500 ml', '1 L', '1,5 L']],
    ['Laticínios', ['Iogurte grego', 'Iogurte desnatado', 'Iogurte sem lactose', 'Iogurte de baunilha', 'Iogurte de frutas vermelhas', 'Bebida láctea de morango', 'Bebida láctea de chocolate', 'Leite em pó integral', 'Leite em pó instantâneo', 'Leite em pó desnatado', 'Queijo coalho', 'Queijo provolone', 'Queijo gouda', 'Ricota fresca', 'Cream cheese light', 'Mousse de chocolate'], ['Nestlé', 'Vigor', 'Itambé', 'Piracanjuba', 'Ninho', 'Batavo', 'Elegê', 'Catupiry'], ['90 g', '120 g', '170 g', '200 g', '300 g', '400 g', '500 g', '1 kg']],
    ['Carnes', ['Filé de peito de frango', 'Filé de coxa de frango', 'Filé de sobrecoxa', 'Frango inteiro', 'Carne de sol', 'Músculo bovino', 'Costela bovina', 'Contrafilé', 'Coxão mole', 'Coxão duro', 'Lagarto bovino', 'Fraldinha', 'Cupim', 'Lombo suíno', 'Pernil suíno', 'Costelinha suína'], ['Sadia', 'Seara', 'Friboi', 'Swift', 'Perdigão', 'Aurora', 'Minerva', 'Qualitá'], ['300 g', '500 g', '700 g', '1 kg', '1,5 kg', '2 kg']],
    ['Hortifruti', ['Batata-doce', 'Batata inglesa', 'Mandioca', 'Inhame', 'Cará', 'Chuchu', 'Abóbora', 'Jiló', 'Quiabo', 'Vagem', 'Milho verde fresco', 'Ervilha fresca', 'Repolho verde', 'Repolho roxo', 'Aipo', 'Nabo'], ['Hortifruti', 'Qualitá', 'Carrefour', 'Oba', 'Sítio Verde', 'Feira', 'Da Horta', 'Genérico'], ['500 g', '1 kg', '2 kg', '1 un', '2 un']],
    ['Congelados', ['Pizza de calabresa', 'Pizza de frango', 'Pizza quatro queijos', 'Pizza marguerita', 'Lasanha bolonhesa', 'Lasanha quatro queijos', 'Nuggets de frango', 'Hambúrguer bovino', 'Hambúrguer de frango', 'Batata noisette', 'Batata rústica', 'Mix de legumes', 'Brócolis congelado', 'Couve-flor congelada', 'Açaí com banana', 'Pão de queijo recheado'], ['Sadia', 'Seara', 'Perdigão', 'Forno de Minas', 'Frooty', 'Kibon', 'Qualitá', 'Swift'], ['300 g', '400 g', '500 g', '600 g', '1 kg']],
    ['Padaria', ['Pão integral', 'Pão de leite', 'Pão australiano', 'Pão multigrãos', 'Pão de centeio', 'Pão sírio', 'Pão de alho', 'Pão brioche', 'Pão de milho', 'Pão de batata', 'Mini pão francês', 'Mini croissant', 'Rosca doce', 'Bolo de chocolate', 'Bolo de cenoura', 'Torta de frango'], ['Wickbold', 'Pullman', 'Panco', 'Seven Boys', 'Bauducco', 'Plus Vita', 'Visconti', 'Qualitá'], ['200 g', '300 g', '400 g', '500 g', '600 g', '1 kg']],
    ['Limpeza', ['Limpador perfumado', 'Limpador para banheiro', 'Limpador para cozinha', 'Limpador desengordurante', 'Limpa inox', 'Limpa piso', 'Limpa pedra', 'Limpa forno', 'Removedor', 'Cera líquida', 'Cera para piso', 'Detergente para louças', 'Sabão líquido para roupas', 'Alvejante sem cloro', 'Tira-manchas', 'Neutralizador de odores'], ['Veja', 'Ypê', 'Limpol', 'Omo', 'Vanish', 'Bombril', 'Comfort', 'Qboa'], ['250 ml', '500 ml', '750 ml', '1 L', '1,5 L', '2 L']],
    ['Higiene', ['Sabonete líquido', 'Sabonete infantil', 'Shampoo anticaspa', 'Shampoo infantil', 'Condicionador hidratante', 'Máscara capilar', 'Creme para pentear', 'Gel para cabelo', 'Pomada capilar', 'Fio dental', 'Enxaguante bucal', 'Creme dental infantil', 'Escova dental infantil', 'Hidratante facial', 'Protetor labial', 'Lenço de papel'], ['Dove', 'Nivea', 'Pantene', 'Seda', 'Colgate', 'Sorriso', 'Oral-B', 'Johnson’s'], ['50 g', '90 g', '100 ml', '150 ml', '200 ml', '250 ml', '350 ml', '500 ml']],
    ['Pet', ['Ração premium para cães', 'Ração para cães adultos', 'Ração para filhotes', 'Ração para cães idosos', 'Ração premium para gatos', 'Ração para gatos adultos', 'Ração para filhotes de gatos', 'Ração para gatos castrados', 'Sachê para cães', 'Sachê para gatos', 'Bifinho para cães', 'Palito dental para cães', 'Areia higiênica para gatos', 'Granulado sanitário', 'Tapete absorvente', 'Pote para ração'], ['Pedigree', 'Whiskas', 'Premier', 'Purina', 'Royal Canin', 'Golden', 'Special Dog', 'Pipicat'], ['100 g', '300 g', '500 g', '1 kg', '2 kg', '5 kg', '10 kg', '15 kg']]
  ];

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('referenceProducts')) {
          database.createObjectStore('referenceProducts', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('settings')) {
          database.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || Error('IndexedDB indisponível'));
    });
  }

  const norm = (value) => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');

  function run() {
    openDB().then(async (db) => {
      const current = await new Promise((resolve, reject) => {
        const request = db.transaction('referenceProducts', 'readonly')
          .objectStore('referenceProducts')
          .getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      const settings = await new Promise((resolve, reject) => {
        const request = db.transaction('settings', 'readonly')
          .objectStore('settings')
          .get(MARKER);
        request.onsuccess = () => resolve(request.result?.value || 0);
        request.onerror = () => reject(request.error);
      });

      if (settings >= 1 || current.length >= 1000) {
        db.close();
        return;
      }

      const used = new Set(
        current.map((item) => `${norm(item.name)}|${norm(item.brand)}|${norm(item.unit)}`)
      );
      const additions = [];
      let serial = 1;

      for (const [category, names, brands, units] of groups) {
        for (const name of names) {
          for (const brand of brands) {
            for (const unit of units) {
              if (additions.length >= TARGET) break;

              const key = `${norm(name)}|${norm(brand)}|${norm(unit)}`;
              if (used.has(key)) continue;

              used.add(key);
              additions.push({
                id: `ref-p-extra-${serial++}`,
                name,
                brand,
                unit,
                category,
                ean: ''
              });
            }
            if (additions.length >= TARGET) break;
          }
          if (additions.length >= TARGET) break;
        }
        if (additions.length >= TARGET) break;
      }

      await new Promise((resolve, reject) => {
        const transaction = db.transaction(['referenceProducts', 'settings'], 'readwrite');
        const products = transaction.objectStore('referenceProducts');
        const settingsStore = transaction.objectStore('settings');

        for (const item of additions) products.put(item);
        settingsStore.put({ key: MARKER, value: 1 });

        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(
          transaction.error || Error('Falha ao expandir banco de referência')
        );
        transaction.onabort = () => reject(
          transaction.error || Error('Transação cancelada')
        );
      });

      db.close();
      if (additions.length) location.reload();
    }).catch((error) => {
      console.error('Expansão do banco de referência:', error);
    });
  }

  run();
})();
