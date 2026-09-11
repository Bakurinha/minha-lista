const fs = require('fs');
const assert = require('node:assert/strict');

const app = fs.readFileSync('app.js', 'utf8');
const share = fs.readFileSync('enhancements.js', 'utf8');
const backup = fs.readFileSync('backup-v230.js', 'utf8');
const inventory = fs.readFileSync('inventory.js', 'utf8');
const list = fs.readFileSync('list-enhancements.js', 'utf8');
const listMarket = fs.readFileSync('list-market-v230.js', 'utf8');
const worker = fs.readFileSync('share-service/worker.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

assert(app.includes("const esc=s=>String(s??'').replace"), 'escape centralizado ausente');
assert(app.includes('textContent'), 'renderização textual segura deve existir');
assert(!app.includes('navigator.sendBeacon'), 'sendBeacon não deve existir');
assert(!app.includes('WebSocket'), 'WebSocket não deve existir');
assert(!app.includes('firebase'), 'Firebase não deve existir');
assert(!app.includes('supabase'), 'Supabase não deve existir');

assert(share.includes('history.replaceState'), 'importação compartilhada deve preservar histórico');
assert(
  share.includes('delete x.inventory') && share.includes('delete x.stock'),
  'estoque não pode entrar no compartilhamento'
);
assert(
  share.includes('shared-list-v2') && share.includes('shared-list-v3'),
  'compatibilidade V2/V3 deve permanecer'
);

assert(
  /const MAX\s*=\s*20\s*\*\s*1024\s*\*\s*1024/.test(backup),
  'limite de backup deve permanecer'
);
assert(backup.includes('backupFormatVersion: 2'), 'backup V2 deve permanecer');
assert(backup.includes('inventory'), 'backup deve preservar estoque');

assert(
  inventory.includes('expiryDate') && inventory.includes('minQuantity'),
  'estoque deve manter validade e estoque mínimo'
);
assert(
  (list.includes('f.isConnected') || list.includes('form.isConnected')),
  'formulário inválido não pode aplicar patch posterior'
);
assert(
  list.includes('target.list.marketName') && list.includes('delete item.marketName'),
  'item deve perder mercado quando a lista possui mercado'
);
assert(
  list.includes('target.list.marketName') && list.includes('Keep legacy list data intact'),
  'listas legadas devem ser preservadas durante a regra de mercado'
);

assert(listMarket.includes('v230ListMarket'), 'mercado da lista deve possuir campo próprio');
assert(listMarket.includes('marketName'), 'mercado da lista deve ser persistido em marketName');
assert(listMarket.includes('MAX_MARKET'), 'mercado da lista deve possuir limite de tamanho');
assert(!listMarket.includes('inventory'), 'mercado da lista não deve acessar estoque');
assert(
  listMarket.includes('substitui o mercado individual dos itens'),
  'mercado da lista deve ser apresentado como fonte de verdade'
);
assert(
  /target\.items\s*=\s*\(target\.items\s*\|\|\s*\[\]\)\.map\s*\(\s*\(?item\)?\s*=>\s*\{[\s\S]*?delete\s+next\.marketName/.test(listMarket),
  'ao atribuir mercado à lista, mercados existentes dos itens devem ser removidos'
);

assert(worker.includes('MAX_BODY_BYTES'), 'Worker deve limitar corpo recebido');
assert(
  /expirationTtl\s*:\s*SHARE_TTL/.test(worker),
  'Worker deve aplicar TTL'
);
assert(worker.includes('ID_RE'), 'ID do compartilhamento deve ter formato restrito');
assert(worker.includes('APP_ORIGIN'), 'CORS deve ficar restrito à origem do aplicativo');
assert(worker.includes('expiryDate'), 'Worker deve validar validade do V3');

assert(
  sw.includes('db-integrity-v230.js') && sw.includes('db-migrations-v230.js'),
  'módulos de integridade/migração devem estar no SW'
);
assert(sw.includes('list-market-v230.js'), 'módulo de mercado da lista deve estar no SW');
assert(sw.includes('minha-lista-v2-3-0'), 'cache V2.3.0 deve ser versionado');

console.log('V2.3.0 security/regression source audit: OK');
