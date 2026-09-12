(() => {
  'use strict';
  const DB = 'MinhaListaDB',
    VERSION = 6,
    STORE = 'inventory',
    MAX = 1000000;
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? '').replace(
      /[&<>'"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]
    );
  const norm = (s) =>
    String(s ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');
  const uid = () =>
    crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const today = () => {
    const d = new Date(),
      p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const validDate = (v) => {
    if (!v) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    const [y, m, d] = v.split('-').map(Number),
      x = new Date(Date.UTC(y, m - 1, d));
    return x.getUTCFullYear() === y && x.getUTCMonth() === m - 1 && x.getUTCDate() === d;
  };
  const num = (v, max = MAX) => {
    const n = Number(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
  };
  const toast = (m) => {
    const t = $('toast');
    if (t) {
      t.textContent = m;
      t.classList.add('show');
      clearTimeout(t._v);
      t._v = setTimeout(() => t.classList.remove('show'), 2800);
    }
  };
  function openV6() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(DB, VERSION);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'id' });
      };
      r.onsuccess = () => {
        const d = r.result;
        d.onversionchange = () => d.close();
        resolve(d);
      };
      r.onerror = () => reject(r.error || Error('IndexedDB indisponível'));
    });
  }
  let db,
    items = [],
    catalogs = [];
  const all = (store) =>
    new Promise((resolve, reject) => {
      const r = db.transaction(store, 'readonly').objectStore(store).getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  const tx = (stores, fn) =>
    new Promise((resolve, reject) => {
      let t;
      try {
        t = db.transaction(stores, 'readwrite');
        fn(t);
      } catch (e) {
        try {
          t?.abort();
        } catch {}
        reject(e);
        return;
      }
      t.oncomplete = resolve;
      t.onerror = () => reject(t.error || Error('Falha IndexedDB'));
      t.onabort = () => reject(t.error || Error('Transação cancelada'));
    });
  const PRODUCTS = [
    ['Arroz', 'Tio João', 'Alimentos'],
    ['Arroz', 'Camil', 'Alimentos'],
    ['Arroz', 'Urbano', 'Alimentos'],
    ['Feijão carioca', 'Kicaldo', 'Alimentos'],
    ['Feijão carioca', 'Camil', 'Alimentos'],
    ['Feijão preto', 'Kicaldo', 'Alimentos'],
    ['Feijão preto', 'Camil', 'Alimentos'],
    ['Lentilha', 'Yoki', 'Alimentos'],
    ['Grão-de-bico', 'Yoki', 'Alimentos'],
    ['Ervilha seca', 'Yoki', 'Alimentos'],
    ['Açúcar refinado', 'União', 'Alimentos'],
    ['Açúcar cristal', 'União', 'Alimentos'],
    ['Açúcar mascavo', 'Native', 'Alimentos'],
    ['Sal refinado', 'Cisne', 'Alimentos'],
    ['Sal grosso', 'Cisne', 'Alimentos'],
    ['Farinha de trigo', 'Dona Benta', 'Alimentos'],
    ['Farinha de mandioca', 'Yoki', 'Alimentos'],
    ['Fubá', 'Yoki', 'Alimentos'],
    ['Aveia em flocos', 'Quaker', 'Alimentos'],
    ['Granola', 'Mãe Terra', 'Alimentos'],
    ['Macarrão espaguete', 'Adria', 'Alimentos'],
    ['Macarrão parafuso', 'Adria', 'Alimentos'],
    ['Macarrão penne', 'Barilla', 'Alimentos'],
    ['Lasanha', 'Adria', 'Alimentos'],
    ['Molho de tomate', 'Pomarola', 'Alimentos'],
    ['Extrato de tomate', 'Elefante', 'Alimentos'],
    ['Milho verde', 'Quero', 'Alimentos'],
    ['Ervilha', 'Quero', 'Alimentos'],
    ['Atum', 'Gomes da Costa', 'Alimentos'],
    ['Sardinha', 'Coqueiro', 'Alimentos'],
    ['Maionese', 'Hellmanns', 'Alimentos'],
    ['Ketchup', 'Heinz', 'Alimentos'],
    ['Mostarda', 'Heinz', 'Alimentos'],
    ['Molho de pimenta', 'Tabasco', 'Alimentos'],
    ['Azeite de oliva', 'Gallo', 'Alimentos'],
    ['Óleo de soja', 'Liza', 'Alimentos'],
    ['Óleo de milho', 'Liza', 'Alimentos'],
    ['Vinagre de álcool', 'Castelo', 'Alimentos'],
    ['Vinagre balsâmico', 'Castelo', 'Alimentos'],
    ['Caldo de galinha', 'Knorr', 'Alimentos'],
    ['Café torrado e moído', 'Pilão', 'Bebidas'],
    ['Café torrado e moído', '3 Corações', 'Bebidas'],
    ['Café solúvel', 'Nescafé', 'Bebidas'],
    ['Achocolatado', 'Nescau', 'Bebidas'],
    ['Achocolatado', 'Toddy', 'Bebidas'],
    ['Chá mate', 'Leão', 'Bebidas'],
    ['Chá de camomila', 'Leão', 'Bebidas'],
    ['Água mineral', 'Indaiá', 'Bebidas'],
    ['Água mineral', 'Minalba', 'Bebidas'],
    ['Água de coco', 'Kero Coco', 'Bebidas'],
    ['Refrigerante cola', 'Coca-Cola', 'Bebidas'],
    ['Refrigerante cola', 'Pepsi', 'Bebidas'],
    ['Refrigerante guaraná', 'Antarctica', 'Bebidas'],
    ['Refrigerante guaraná', 'Kuat', 'Bebidas'],
    ['Refrigerante laranja', 'Fanta', 'Bebidas'],
    ['Refrigerante limão', 'Sprite', 'Bebidas'],
    ['Suco de uva', 'Aurora', 'Bebidas'],
    ['Suco de laranja', 'Del Valle', 'Bebidas'],
    ['Néctar de pêssego', 'Del Valle', 'Bebidas'],
    ['Isotônico', 'Gatorade', 'Bebidas'],
    ['Leite integral', 'Piracanjuba', 'Laticínios'],
    ['Leite integral', 'Leitíssimo', 'Laticínios'],
    ['Leite desnatado', 'Piracanjuba', 'Laticínios'],
    ['Leite sem lactose', 'Piracanjuba', 'Laticínios'],
    ['Leite fermentado', 'Yakult', 'Laticínios'],
    ['Iogurte natural', 'Nestlé', 'Laticínios'],
    ['Iogurte morango', 'Vigor', 'Laticínios'],
    ['Requeijão', 'Catupiry', 'Laticínios'],
    ['Margarina', 'Qualy', 'Laticínios'],
    ['Manteiga', 'Aviação', 'Laticínios'],
    ['Queijo muçarela', 'Vigor', 'Laticínios'],
    ['Queijo prato', 'Vigor', 'Laticínios'],
    ['Queijo minas', 'Itambé', 'Laticínios'],
    ['Creme de leite', 'Nestlé', 'Laticínios'],
    ['Leite condensado', 'Moça', 'Laticínios'],
    ['Bebida láctea', 'Nescau', 'Laticínios'],
    ['Coalhada', 'Vigor', 'Laticínios'],
    ['Cream cheese', 'Philadelphia', 'Laticínios'],
    ['Parmesão ralado', 'Vigor', 'Laticínios'],
    ['Pudim', 'Royal', 'Laticínios'],
    ['Peito de frango', 'Sadia', 'Carnes'],
    ['Peito de frango', 'Seara', 'Carnes'],
    ['Coxa de frango', 'Sadia', 'Carnes'],
    ['Asa de frango', 'Sadia', 'Carnes'],
    ['Carne moída', 'Friboi', 'Carnes'],
    ['Acém', 'Friboi', 'Carnes'],
    ['Patinho', 'Friboi', 'Carnes'],
    ['Alcatra', 'Friboi', 'Carnes'],
    ['Picanha', 'Friboi', 'Carnes'],
    ['Linguiça toscana', 'Sadia', 'Carnes'],
    ['Linguiça calabresa', 'Perdigão', 'Carnes'],
    ['Salsicha', 'Perdigão', 'Carnes'],
    ['Hambúrguer', 'Sadia', 'Carnes'],
    ['Presunto', 'Sadia', 'Carnes'],
    ['Presunto', 'Perdigão', 'Carnes'],
    ['Mortadela', 'Perdigão', 'Carnes'],
    ['Filé de peixe', 'Copacol', 'Carnes'],
    ['Tilápia', 'Copacol', 'Carnes'],
    ['Camarão', 'Qualitá', 'Carnes'],
    ['Bacon', 'Sadia', 'Carnes'],
    ['Batata', 'Genérico', 'Hortifruti'],
    ['Cebola', 'Genérico', 'Hortifruti'],
    ['Tomate', 'Genérico', 'Hortifruti'],
    ['Cenoura', 'Genérico', 'Hortifruti'],
    ['Beterraba', 'Genérico', 'Hortifruti'],
    ['Abobrinha', 'Genérico', 'Hortifruti'],
    ['Berinjela', 'Genérico', 'Hortifruti'],
    ['Pepino', 'Genérico', 'Hortifruti'],
    ['Pimentão verde', 'Genérico', 'Hortifruti'],
    ['Pimentão vermelho', 'Genérico', 'Hortifruti'],
    ['Banana prata', 'Genérico', 'Hortifruti'],
    ['Maçã', 'Genérico', 'Hortifruti'],
    ['Laranja', 'Genérico', 'Hortifruti'],
    ['Limão', 'Genérico', 'Hortifruti'],
    ['Mamão', 'Genérico', 'Hortifruti'],
    ['Manga', 'Genérico', 'Hortifruti'],
    ['Abacaxi', 'Genérico', 'Hortifruti'],
    ['Melancia', 'Genérico', 'Hortifruti'],
    ['Uva', 'Genérico', 'Hortifruti'],
    ['Morango', 'Genérico', 'Hortifruti'],
    ['Alface', 'Genérico', 'Hortifruti'],
    ['Couve', 'Genérico', 'Hortifruti'],
    ['Espinafre', 'Genérico', 'Hortifruti'],
    ['Brócolis', 'Genérico', 'Hortifruti'],
    ['Couve-flor', 'Genérico', 'Hortifruti'],
    ['Rúcula', 'Genérico', 'Hortifruti'],
    ['Salsa', 'Genérico', 'Hortifruti'],
    ['Cebolinha', 'Genérico', 'Hortifruti'],
    ['Coentro', 'Genérico', 'Hortifruti'],
    ['Alho', 'Genérico', 'Hortifruti'],
    ['Pizza congelada', 'Sadia', 'Congelados'],
    ['Hambúrguer congelado', 'Sadia', 'Congelados'],
    ['Batata congelada', 'Sadia', 'Congelados'],
    ['Lasanha congelada', 'Sadia', 'Congelados'],
    ['Nuggets', 'Sadia', 'Congelados'],
    ['Pão de queijo', 'Forno de Minas', 'Congelados'],
    ['Açaí', 'Frooty', 'Congelados'],
    ['Sorvete', 'Kibon', 'Congelados'],
    ['Legumes congelados', 'Sadia', 'Congelados'],
    ['Frango empanado', 'Sadia', 'Congelados'],
    ['Pão de forma', 'Wickbold', 'Padaria'],
    ['Pão de forma integral', 'Wickbold', 'Padaria'],
    ['Pão francês', 'Genérico', 'Padaria'],
    ['Pão de hambúrguer', 'Pullman', 'Padaria'],
    ['Pão de hot dog', 'Pullman', 'Padaria'],
    ['Torrada', 'Bauducco', 'Padaria'],
    ['Panetone', 'Bauducco', 'Padaria'],
    ['Bolo pronto', 'Pullman', 'Padaria'],
    ['Bisnaguinha', 'Panco', 'Padaria'],
    ['Croissant', 'Seven Boys', 'Padaria'],
    ['Biscoito cream cracker', 'Vitarella', 'Alimentos'],
    ['Biscoito água e sal', 'Piraquê', 'Alimentos'],
    ['Biscoito recheado', 'Oreo', 'Alimentos'],
    ['Biscoito maisena', 'Marilan', 'Alimentos'],
    ['Biscoito wafer', 'Bauducco', 'Alimentos'],
    ['Cookie', 'Bauducco', 'Alimentos'],
    ['Barra de cereal', 'Nestlé', 'Alimentos'],
    ['Chocolate ao leite', 'Nestlé', 'Alimentos'],
    ['Bombom', 'Lacta', 'Alimentos'],
    ['Gelatina', 'Royal', 'Alimentos'],
    ['Detergente líquido', 'Ypê', 'Limpeza'],
    ['Detergente líquido', 'Limpol', 'Limpeza'],
    ['Sabão em pó', 'Omo', 'Limpeza'],
    ['Sabão líquido', 'Omo', 'Limpeza'],
    ['Amaciante', 'Comfort', 'Limpeza'],
    ['Água sanitária', 'Qboa', 'Limpeza'],
    ['Desinfetante', 'Veja', 'Limpeza'],
    ['Limpador multiuso', 'Veja', 'Limpeza'],
    ['Lustra-móveis', 'Veja', 'Limpeza'],
    ['Limpa-vidros', 'Veja', 'Limpeza'],
    ['Esponja de limpeza', 'Bombril', 'Limpeza'],
    ['Palha de aço', 'Bombril', 'Limpeza'],
    ['Sabão em barra', 'Ypê', 'Limpeza'],
    ['Desengordurante', 'Veja', 'Limpeza'],
    ['Saco para lixo', 'Dengo', 'Limpeza'],
    ['Pano de chão', 'Alklin', 'Limpeza'],
    ['Pano multiuso', 'Perfex', 'Limpeza'],
    ['Papel toalha', 'Snob', 'Limpeza'],
    ['Papel higiênico', 'Personal', 'Limpeza'],
    ['Guardanapo', 'Snob', 'Limpeza'],
    ['Sabonete', 'Dove', 'Higiene'],
    ['Sabonete', 'Lux', 'Higiene'],
    ['Shampoo', 'Pantene', 'Higiene'],
    ['Shampoo', 'Seda', 'Higiene'],
    ['Condicionador', 'Pantene', 'Higiene'],
    ['Creme dental', 'Colgate', 'Higiene'],
    ['Creme dental', 'Sorriso', 'Higiene'],
    ['Escova de dentes', 'Colgate', 'Higiene'],
    ['Desodorante', 'Rexona', 'Higiene'],
    ['Desodorante', 'Nivea', 'Higiene'],
    ['Protetor solar', 'Nivea', 'Higiene'],
    ['Hidratante corporal', 'Nivea', 'Higiene'],
    ['Papel absorvente', 'Always', 'Higiene'],
    ['Absorvente', 'Intimus', 'Higiene'],
    ['Fralda descartável', 'Huggies', 'Higiene'],
    ['Fralda descartável', 'Pampers', 'Higiene'],
    ['Lenço umedecido', 'Huggies', 'Higiene'],
    ['Algodão', 'Apolo', 'Higiene'],
    ['Cotonete', 'Johnson’s', 'Higiene'],
    ['Álcool em gel', 'Asseptgel', 'Higiene'],
    ['Ração para cães', 'Pedigree', 'Pet'],
    ['Ração para gatos', 'Whiskas', 'Pet'],
    ['Petisco para cães', 'Pedigree', 'Pet'],
    ['Petisco para gatos', 'Whiskas', 'Pet'],
    ['Areia para gatos', 'Pipicat', 'Pet'],
    ['Tapete higiênico', 'Super Secão', 'Pet'],
    ['Shampoo para cães', 'Sanol', 'Pet'],
    ['Antipulgas', 'Frontline', 'Pet'],
    ['Ração úmida para cães', 'Pedigree', 'Pet'],
    ['Ração úmida para gatos', 'Whiskas', 'Pet'],
    ['Papel alumínio', 'Wyda', 'Casa'],
    ['Filme plástico', 'Wyda', 'Casa'],
    ['Saco zip', 'Wyda', 'Casa'],
    ['Papel manteiga', 'Wyda', 'Casa'],
    ['Filtro de papel', 'Melitta', 'Casa'],
    ['Vela', 'Genérico', 'Casa'],
    ['Fósforo', 'Fiat Lux', 'Casa'],
    ['Isqueiro', 'BIC', 'Casa'],
    ['Esponja de banho', 'Scotch-Brite', 'Casa'],
    ['Luva doméstica', 'Sanro', 'Casa'],
  ];
  const UNITS = {
    Alimentos: ['500 g', '1 kg', '2 kg', '5 kg'],
    Bebidas: ['200 ml', '350 ml', '500 ml', '1 L', '1,5 L', '2 L'],
    Laticínios: ['90 g', '170 g', '200 g', '500 g', '1 L'],
    Carnes: ['300 g', '500 g', '1 kg', '2 kg'],
    Hortifruti: ['500 g', '1 kg', '2 kg', '1 un'],
    Congelados: ['300 g', '400 g', '500 g', '1 kg'],
    Padaria: ['200 g', '400 g', '500 g', '1 kg'],
    Limpeza: ['500 ml', '1 L', '1,5 L', '2 L', '500 g', '1 kg'],
    Higiene: ['50 g', '90 g', '150 ml', '250 ml', '350 ml', '1 un'],
    Pet: ['500 g', '1 kg', '2 kg', '5 kg', '10 kg'],
    Casa: ['1 un', '2 un', '5 un', '10 un', '20 un'],
  };
  const MARKET_NAMES = [
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
    'Sam’s Club',
    'Centro Sul',
    'Mercantil de Brotas',
    'Mercado Popular',
    'Mercado Central',
    'Mercado da Sete Portas',
    'Mercado do Bairro',
    'Bompreço',
    'Walmart',
    'Extra',
    'Pão de Açúcar',
    'Prezunic',
    'Super Muffato',
    'Condor',
    'Angeloni',
    'Giassi',
    'Koch',
    'Fort Atacadista',
    'Mart Minas',
    'Supernosso',
    'BH',
    'EPA',
    'Supermercados BH',
    'Oba Hortifruti',
    'St Marche',
    'Oba',
    'Dia',
    'Dia Brasil',
    'Roldão',
    'Tenda Atacado',
    'Spani Atacadista',
    'Tonin',
    'Villefort',
    'ABC Atacado e Varejo',
    'Supermercado Guanabara',
    'Zona Sul',
    'Prezunic Atacado',
    'Imperatriz',
    'Mateus Supermercados',
    'São Luiz',
    'Mercadinhos São Luiz',
    'Cometa Supermercados',
    'Davo',
    'Confiança',
    'Savegnago',
  ];
  function referenceSeed() {
    const out = [];
    let n = 0;
    for (const [name, brand, category] of PRODUCTS) {
      for (const unit of (UNITS[category] || ['1 un']).slice(0, 7)) {
        n++;
        out.push({ id: `ref-p-${n}`, name, brand, unit, category, ean: '' });
      }
    }
    return out;
  }
  async function ensureReference() {
    try {
      const d = await openV6();
      db = d;
      const settings = await all('settings');
      const current = settings.find((x) => x.key === 'referenceDataVersion')?.value || 0;
      if (current >= 2) {
        catalogs = await all('catalogs');
        return;
      }
      const products = referenceSeed();
      const markets = MARKET_NAMES.map((name, i) => ({ id: `ref-m-${i + 1}`, name }));
      await tx(['referenceProducts', 'referenceMarkets', 'settings'], (t) => {
        const p = t.objectStore('referenceProducts'),
          m = t.objectStore('referenceMarkets');
        p.clear();
        m.clear();
        for (const x of products) p.put(x);
        for (const x of markets) m.put(x);
        t.objectStore('settings').put({ key: 'referenceDataVersion', value: 2 });
      });
      catalogs = await all('catalogs');
      toast(`Banco offline atualizado: ${products.length} produtos e ${markets.length} mercados.`);
    } catch (e) {
      console.error('Referência V2:', e);
    }
  }
  function status(date) {
    if (!date) return ['Sem validade', ''];
    const diff = Math.ceil((new Date(`${date}T23:59:59`) - new Date()) / 86400000);
    if (diff < 0) return ['Vencido', 'danger'];
    if (diff === 0) return ['Vence hoje', 'danger'];
    if (diff <= 7) return [`Vence em ${diff} dia${diff === 1 ? '' : 's'}`, 'warning'];
    return ['Válido', ''];
  }
  function productName(id) {
    const c = catalogs.find((x) => x.id === id);
    return c?.name || 'Produto removido';
  }
  function render() {
    const q = norm($('invSearch')?.value);
    const filter = $('invFilter')?.value || 'all';
    const arr = items
      .filter((i) => {
        const text = norm(
          `${productName(i.mainItemId)} ${i.brand || ''} ${i.location || ''} ${i.marketName || ''}`
        );
        if (q && !text.includes(q)) return false;
        const [st] = status(i.expiryDate);
        if (filter === 'expired' && st !== 'Vencido') return false;
        if (
          filter === 'soon' &&
          ![
            'Vence hoje',
            ...Array.from(
              { length: 7 },
              (_, n) => `Vence em ${n + 1} dia${n + 1 === 1 ? '' : 's'}`
            ),
          ].includes(st)
        )
          return false;
        if (
          filter === 'low' &&
          !(i.quantity > 0 && i.minQuantity > 0 && i.quantity <= i.minQuantity)
        )
          return false;
        return true;
      })
      .sort((a, b) => (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999'));
    $('invSummary').textContent = `${arr.length} ${arr.length === 1 ? 'registro' : 'registros'}`;
    if (!arr.length) {
      $('invCards').innerHTML =
        '<div class="empty"><div class="emoji">🏠</div><strong>Nenhum item no estoque</strong><div>Adicione o que você já tem em casa.</div></div>';
      return;
    }
    $('invCards').innerHTML = arr
      .map((i) => {
        const c = catalogs.find((x) => x.id === i.mainItemId),
          [st, cls] = status(i.expiryDate),
          total = i.quantity * (i.packageQuantity || 1);
        return `<div class="card"><div class="card-head"><div><div class="card-title">${esc(c?.name || i.productName || 'Produto removido')}</div><div class="meta">${i.brand ? `Marca: ${esc(i.brand)} • ` : ''}${i.quantity} × ${i.packageQuantity || 1} ${esc(i.packageUnit || c?.unit || 'un')} = ${total} ${esc(i.packageUnit || c?.unit || 'un')}</div>${i.expiryDate ? `<div class="meta">Validade: <strong>${esc(i.expiryDate.split('-').reverse().join('/'))}</strong> • <span class="pill ${cls}">${esc(st)}</span></div>` : '<div class="meta">Sem validade informada</div>'}${i.location ? `<div class="meta">📍 ${esc(i.location)}</div>` : ''}${i.marketName ? `<div class="meta">🏪 ${esc(i.marketName)}</div>` : ''}${i.notes ? `<div class="meta">📝 ${esc(i.notes)}</div>` : ''}</div><div class="actions"><button class="btn ghost small" data-inv-edit="${esc(i.id)}">✏️</button><button class="btn ghost small" data-inv-minus="${esc(i.id)}">−</button><button class="btn primary small" data-inv-plus="${esc(i.id)}">+</button><button class="btn danger small" data-inv-del="${esc(i.id)}">🗑️</button></div></div></div>`;
      })
      .join('');
  }
  function form(item) {
    const opts = catalogs
      .slice()
      .sort((a, b) => `${a.name} ${a.brand}`.localeCompare(`${b.name} ${b.brand}`, 'pt-BR'))
      .map(
        (c) =>
          `<option value="${esc(c.id)}" ${item?.mainItemId === c.id ? 'selected' : ''}>${esc(`${c.name}${c.brand ? ` — ${c.brand}` : ''}${c.unit ? ` • ${c.unit}` : ''}`)}</option>`
      )
      .join('');
    return `<form id="invForm"><div class="field"><label for="invProduct">Produto *</label><select id="invProduct" class="select" required><option value="">Selecione...</option>${opts}</select></div><div class="form-grid" style="margin-top:9px"><div class="field"><label for="invQty">Quantidade de embalagens *</label><input id="invQty" class="input" inputmode="decimal" required value="${esc(item?.quantity ?? 1)}"></div><div class="field"><label for="invPackQty">Quantidade por embalagem</label><input id="invPackQty" class="input" inputmode="decimal" value="${esc(item?.packageQuantity ?? 1)}"></div><div class="field"><label for="invPackUnit">Unidade da embalagem</label><input id="invPackUnit" class="input" maxlength="30" value="${esc(item?.packageUnit || 'un')}" placeholder="un, kg, L, rolos..."></div><div class="field"><label for="invExpiry">Validade</label><input id="invExpiry" class="input" type="date" value="${esc(item?.expiryDate || '')}"></div><div class="field"><label for="invEntry">Data de entrada</label><input id="invEntry" class="input" type="date" value="${esc(item?.entryDate || today())}"></div><div class="field"><label for="invMin">Estoque mínimo</label><input id="invMin" class="input" inputmode="decimal" value="${esc(item?.minQuantity ?? 0)}"></div><div class="field"><label for="invMarket">Mercado</label><input id="invMarket" class="input" maxlength="120" value="${esc(item?.marketName || '')}" placeholder="Onde comprou?"></div><div class="field"><label for="invLocation">Local</label><input id="invLocation" class="input" maxlength="80" value="${esc(item?.location || '')}" placeholder="Despensa, geladeira..."></div></div><div class="field" style="margin-top:9px"><label for="invNotes">Observações</label><textarea id="invNotes" class="textarea" maxlength="1000">${esc(item?.notes || '')}</textarea></div><button class="btn primary" style="margin-top:12px" type="submit">Salvar estoque</button></form>`;
  }
  function modal(title, body) {
    const m = $('modal'),
      t = $('modalTitle'),
      b = $('modalBody');
    if (!m || !t || !b) return;
    t.textContent = title;
    b.innerHTML = body;
    m.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    const b = $('modalBody');
    if ($('modal')?.classList.contains('show') && b?.querySelector('#invForm')) {
      b.innerHTML = '';
      $('modal').classList.remove('show');
      document.body.style.overflow = '';
      return true;
    }
    return false;
  }
  async function save(e, id) {
    e.preventDefault();
    const mainItemId = $('invProduct').value,
      quantity = num($('invQty').value),
      packageQuantity = num($('invPackQty').value),
      minQuantity = num($('invMin').value);
    if (
      !mainItemId ||
      quantity === null ||
      quantity <= 0 ||
      packageQuantity === null ||
      packageQuantity <= 0 ||
      minQuantity === null
    ) {
      toast('Informe quantidades válidas.');
      return;
    }
    const expiry = $('invExpiry').value || null,
      entry = $('invEntry').value || today();
    if (!validDate(expiry) || !validDate(entry)) {
      toast('Data inválida.');
      return;
    }
    const c = catalogs.find((x) => x.id === mainItemId),
      old = items.find((x) => x.id === id),
      obj = {
        ...(old || {}),
        id: id || uid(),
        mainItemId,
        productName: c?.name || '',
        brand: $('invMarket').value
          ? String(old?.brand || c?.brand || '')
          : String(old?.brand || c?.brand || ''),
        quantity,
        packageQuantity,
        packageUnit: $('invPackUnit').value.trim() || c?.unit || 'un',
        expiryDate: expiry,
        entryDate: entry,
        minQuantity,
        marketName: $('invMarket').value.trim(),
        location: $('invLocation').value.trim(),
        notes: $('invNotes').value.trim(),
        createdAt: old?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    await tx([STORE], (t) => t.objectStore(STORE).put(obj));
    await load();
    if (window.__mlCloseModal) window.__mlCloseModal();
    else {
      close();
      toast(id ? 'Estoque atualizado.' : 'Adicionado ao estoque.');
    }
  }
  async function load() {
    items = await all(STORE);
    catalogs = await all('catalogs');
    render();
  }
  function add() {
    if (!catalogs.length) {
      toast('Cadastre um produto primeiro.');
      return;
    }
    modal('Adicionar ao estoque', form(null));
    $('invForm').onsubmit = (e) => save(e, null);
  }
  function edit(id) {
    const x = items.find((i) => i.id === id);
    if (!x) return;
    modal('Editar estoque', form(x));
    $('invForm').onsubmit = (e) => save(e, id);
  }
  async function adjust(id, delta) {
    const x = items.find((i) => i.id === id);
    if (!x) return;
    const q = Math.max(0, Number(x.quantity) + delta);
    if (q === 0) {
      if (!confirm('A quantidade chegou a zero. Remover este registro do estoque?')) return;
      await tx([STORE], (t) => t.objectStore(STORE).delete(id));
    } else
      await tx([STORE], (t) =>
        t.objectStore(STORE).put({ ...x, quantity: q, updatedAt: new Date().toISOString() })
      );
    await load();
  }
  async function remove(id) {
    const x = items.find((i) => i.id === id);
    if (!x || !confirm(`Excluir ${productName(x.mainItemId)} do estoque?`)) return;
    await tx([STORE], (t) => t.objectStore(STORE).delete(id));
    await load();
    toast('Item removido do estoque.');
  }
  function inject() {
    if ($('inventoryView')) return;
    const settings = $('settingsView'),
      nav = document.querySelector('.nav-inner');
    if (!settings || !nav) return;
    const section = document.createElement('section');
    section.id = 'inventoryView';
    section.className = 'view';
    section.innerHTML =
      '<div class="panel"><h2 class="section-title">🏠 Estoque</h2><div class="row stack-mobile"><input id="invSearch" class="input" placeholder="Pesquisar estoque..." autocomplete="off"><select id="invFilter" class="select"><option value="all">Todos</option><option value="soon">Vencendo em até 7 dias</option><option value="expired">Vencidos</option><option value="low">Estoque baixo</option></select><button class="btn primary" id="invAdd">+ Adicionar</button></div><div class="hint">Controle o que você já tem em casa por lote, quantidade, embalagem, validade e local.</div><div class="toolbar"><span class="muted" id="invSummary">0 registros</span></div></div><div id="invCards" class="cards"></div>';
    settings.parentNode.insertBefore(section, settings);
    const b = document.createElement('button');
    b.dataset.view = 'inventoryView';
    b.innerHTML = '<span class="nav-icon">🏠</span>Estoque';
    nav.insertBefore(b, nav.lastElementChild);
    b.addEventListener('click', () => navigate('inventoryView'));
    $('invAdd').onclick = add;
    $('invSearch').oninput = render;
    $('invFilter').onchange = render;
  }
  function navigate(view, push = true) {
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === view));
    document
      .querySelectorAll('.nav button')
      .forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    if (push) history.pushState({ mlView: view }, '', location.href.split('#')[0]);
  }
  function navHistory() {
    const original = document.querySelectorAll('.nav button');
    original.forEach((b) => {
      if (!b.dataset.mlBound) {
        b.dataset.mlBound = '1';
        b.addEventListener(
          'click',
          (e) => {
            e.stopImmediatePropagation();
            navigate(b.dataset.view);
          },
          true
        );
      }
    });
    if (!history.state?.mlView) history.replaceState({ mlView: 'listsView' }, '', location.href);
  }
  function init() {
    inject();
    navHistory();
    document.addEventListener('click', (e) => {
      const editId = e.target.closest('[data-inv-edit]')?.dataset.invEdit,
        plus = e.target.closest('[data-inv-plus]')?.dataset.invPlus,
        minus = e.target.closest('[data-inv-minus]')?.dataset.invMinus,
        del = e.target.closest('[data-inv-del]')?.dataset.invDel;
      if (editId) edit(editId);
      else if (plus) adjust(plus, 1);
      else if (minus) adjust(minus, -1);
      else if (del) remove(del);
    });
    window.addEventListener('popstate', () => {
      if ($('modal')?.classList.contains('show')) {
        if (window.__mlCloseModal) window.__mlCloseModal();
        else close();
        return;
      }
      const v = history.state?.mlView || 'listsView';
      navigate(v, false);
    });
    load().catch((e) => console.error('Estoque:', e));
  }
  openV6()
    .then((d) => {
      db = d;
      return ensureReference();
    })
    .then(init)
    .catch((e) => console.error('V2.3.0 estoque:', e));
})();
