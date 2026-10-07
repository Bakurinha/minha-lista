'use strict';

const fs = require('fs');
const assert = require('assert');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const app = fs.readFileSync('app.js', 'utf8');
const inv = fs.readFileSync('inventory.js', 'utf8');
const list = fs.readFileSync('list-enhancements.js', 'utf8');
const runtime = fs.readFileSync('list-market-v230.js', 'utf8');
const share = fs.readFileSync('share-config.js', 'utf8');
const shareCompat = fs.readFileSync('share-optimized-v230.js', 'utf8');
const backup = fs.readFileSync('backup-v230.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const worker = fs.readFileSync('share-service/worker.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');

assert(app.includes('textContent'), 'Renderização segura por texto deve existir');
assert(!app.includes('sendBeacon'), 'Não deve usar sendBeacon');
assert(!app.includes('WebSocket'), 'Não deve usar WebSocket');
assert(!app.includes('firebase'), 'Não deve depender de Firebase');
assert(!app.includes('supabase'), 'Não deve depender de Supabase');

assert(share.includes('shared-list-v3-compact'), 'Compartilhamento oficial deve suportar V3 compacto');
assert(share.includes('/api/share'), 'Compartilhamento oficial deve usar a API configurada');
assert(shareCompat.includes('__mlShareOptimizedLoaded'), 'Shim legado deve permanecer controlado');
assert(backup.includes('backupFormatVersion: 2'), 'Backup deve usar formato V2');
assert(backup.includes('inventory'), 'Backup deve preservar inventário');

assert(app.includes('id="lfMarket"'), 'Mercado da lista deve estar no formulário principal');
assert(
  app.includes("marketName: $('lfMarket').value.trim().slice(0, 160)"),
  'Mercado da lista deve ser persistido pelo núcleo'
);
assert(!app.includes('id="ifMarket"'), 'Mercado não deve ser editado por item');
assert(!app.includes('lfMarketFilter'), 'Filtro legado de mercado por item ainda está ativo');
assert(!app.includes('dpMarkets'), 'Duplicação ainda expõe mercado por item');
assert(!app.includes('baMarkets'), 'Comprar novamente ainda expõe mercado por item');
assert(
  app.includes("const currentMarket = String(l.marketName || '').trim()") &&
    app.includes('marketName: currentMarket'),
  'Histórico novo deve usar o mercado da lista'
);
assert(
  list.includes('Mercado antigo do item é preservado'),
  'Compatibilidade com marketName legado do item deve ser preservada'
);
assert(!/delete\s+item\.marketName/.test(list), 'Mercado legado do item não pode ser apagado');

assert(app.includes('function latestHistoryRows'), 'Consolidação do histórico ausente');
assert(
  app.includes("${historyIdentity(h)}|${normalize(h.marketName || '')}"),
  'Histórico deve consolidar por produto + mercado'
);

assert(!runtime.includes('indexedDB.open'), 'Bootstrap não deve duplicar persistência de mercado');
assert(runtime.includes("'./v3-compact-controls.js'"), 'Bootstrap deve carregar pesquisas responsivas');
assert(/navigator\.serviceWorker[\s\S]*?\.register\(/.test(runtime), 'Service Worker deve ter um registro único no runtime');
assert(!/serviceWorker\.register/.test(app), 'Núcleo não deve registrar o Service Worker novamente');

assert(sw.includes(`minha-lista-v${pkg.version.replace(/\./g, '-')}`), 'Cache PWA deve seguir package.json');
assert(!sw.includes('v3-menu-autoclose.js'), 'Cache não deve manter autoclose duplicado');
assert(index.includes('initial-loading.js'), 'Loading inicial deve ser explícito');
assert(index.includes('temporariamente ao serviço de compartilhamento'), 'Privacidade estática deve explicar envio explícito');

assert(/MAX_BODY_BYTES/.test(worker), 'Worker deve limitar o corpo');
assert(/CORS|Access-Control-Allow-Origin/.test(worker), 'Worker deve declarar CORS');
assert(/expirationTtl:\s*SHARE_TTL/.test(worker), 'Worker deve expirar compartilhamentos');

console.log(`security/regression source audit: OK (${pkg.version})`);
