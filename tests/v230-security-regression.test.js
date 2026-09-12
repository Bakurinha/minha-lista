'use strict';

const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('app.js', 'utf8');
const inv = fs.readFileSync('inventory.js', 'utf8');
const list = fs.readFileSync('list-enhancements.js', 'utf8');
const listMarket = fs.readFileSync('list-market-v230.js', 'utf8');
const listMarketCore = listMarket.split('\n// Bootstrap V2.3.0')[0];
const share = fs.readFileSync('share-optimized-v230.js', 'utf8');
const backup = fs.readFileSync('backup-v230.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const worker = fs.readFileSync('share-service/worker.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');

assert(app.includes('textContent'), 'renderização segura por texto deve existir');
assert(!app.includes('sendBeacon'), 'não deve usar sendBeacon');
assert(!app.includes('WebSocket'), 'não deve usar WebSocket');
assert(!app.includes('firebase'), 'não deve depender de Firebase');
assert(!app.includes('supabase'), 'não deve depender de Supabase');

assert(share.includes('shared-list-v3'), 'compartilhamento deve suportar V3');
assert(backup.includes('backupFormatVersion: 2'), 'backup deve usar formato V2');
assert(backup.includes('inventory'), 'backup deve preservar inventário');
assert(list.includes('Mercado antigo do item é preservado'), 'mercado legado deve ser explicitamente preservado');
assert(!/delete\s+item\.marketName/.test(list), 'mercado antigo dos itens não deve ser apagado durante a atualização');

assert(listMarket.includes('v230ListMarket'), 'mercado da lista deve possuir campo próprio');
assert(listMarket.includes('marketName'), 'mercado da lista deve ser persistido em marketName');
assert(listMarket.includes('MAX_MARKET'), 'mercado da lista deve possuir limite de tamanho');
assert(!listMarketCore.includes('inventory'), 'implementação do mercado da lista não deve acessar estoque');
assert(listMarket.includes('O mercado será exibido na lista e ficará associado a ela.'), 'mercado da lista deve ser apresentado como dado da própria lista');
assert(listMarket.includes('FALLBACK_MARKETS'), 'seletor deve possuir fallback local para não depender da leitura do banco para aparecer');
assert(!/delete\s+next\.marketName/.test(listMarketCore), 'mercado antigo dos itens não deve ser removido ao salvar o mercado da lista');

assert(sw.includes("'./v3-shell.js'"), 'Service Worker deve cachear o shell V3');
assert(sw.includes("'./version-v230.js'"), 'Service Worker deve cachear o versionador');
assert(!sw.includes('src="./v3-shell.js"'), 'Service Worker não deve injetar scripts no HTML');
assert(index.includes('list-market-v230.js'), 'HTML deve carregar a entrada do runtime');

assert(/MAX_BODY_BYTES/.test(worker), 'Worker deve limitar tamanho do corpo');
assert(/CORS|Access-Control-Allow-Origin/.test(worker), 'Worker deve declarar CORS');

console.log('V2.3.0 security/regression source audit: OK');
