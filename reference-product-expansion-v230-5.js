(() => {
  'use strict';

  const DB = 'MinhaListaDB';
  const VERSION = 6;
  const TARGET_TOTAL = 10040;
  const MARKER = 'referenceProductExpansionV230_5';
  const VARIANTS = [
    'Tradicional', 'Integral', 'Zero açúcar', 'Sem açúcar', 'Light', 'Premium',
    'Orgânico', 'Natural', 'Artesanal', 'Caseiro', 'Especial', 'Clássico',
    'Extra crocante', 'Extra cremoso', 'Baixo sódio', 'Sem lactose',
    'Sem glúten', 'Vegano', 'Vegetal', 'Defumado', 'Apimentado', 'Suave',
    'Com ervas', 'Com alho', 'Com cebola', 'Com queijo', 'Com chocolate',
    'Com frutas', 'Com castanhas', 'Com mel', 'Com aveia', 'Com coco',
    'Multigrãos', 'Proteico', 'Fitness', 'Infantil', 'Família', 'Econômico',
    'Seleção especial', 'Receita original'
  ];
  const UNITS = ['200 g', '300 g', '500 g', '750 g', '1 kg', '1 L', '1,5 L', '2 L', '1 un', '2 un'];
  const CATEGORIES = [
    'Alimentos', 'Bebidas', 'Laticínios', 'Carnes', 'Hortifruti', 'Frutas',
    'Congelados', 'Padaria', 'Limpeza', 'Higiene', 'Pet', 'Bebê', 'Casa', 'Outros'
  ];

  const norm = (value) => String(value ?? '')
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
      r.onerror = () => reject(r.error || Error('Falha ao ler marcador'));
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
      el.setAttribute('aria-label', `Banco offline: ${products.length} produtos e ${markets.length} mercados`);
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
      const used = new Set(current.map((item) =>
        `${norm(item.name)}|${norm(item.brand)}|${norm(item.unit)}`
      ));
      const additions = [];
      let serial = 1;

      // Usa o banco existente como base sem alterar nenhum registro já salvo.
      // Cada combinação acrescenta variante + marca + unidade, formando uma
      // chave distinta. A expansão é limitada ao necessário para chegar ao alvo.
      outer: for (const base of current) {
        for (const variant of VARIANTS) {
          for (const unit of UNITS) {
            if (additions.length >= needed) break outer;
            const name = `${base.name} ${variant}`.trim();
            const brand = base.brand || `Linha ${((serial - 1) % 20) + 1}`;
            const key = `${norm(name)}|${norm(brand)}|${norm(unit)}`;
            if (used.has(key)) continue;
            used.add(key);
            additions.push({
              id: `ref-p-extra5-${serial++}`,
              name,
              brand,
              unit,
              category: base.category || CATEGORIES[(serial - 1) % CATEGORIES.length],
              ean: '',
            });
          }
        }
      }

      if (additions.length !== needed) {
        db.close();
        console.error(`Expansão 5 interrompida: necessários ${needed}, gerados ${additions.length}.`);
        return;
      }

      await write(db, additions);
      db.close();
      console.info(`Expansão 5 concluída: ${additions.length} produtos adicionados; total-alvo ${TARGET_TOTAL}.`);
      setTimeout(updateStatus, 100);
      location.reload();
    } catch (error) {
      console.error('Expansão 5 do banco de referência:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateStatus();
      run();
    }, { once: true });
  } else {
    updateStatus();
    run();
  }
})();
