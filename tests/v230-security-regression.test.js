'use strict';

const fs = require('fs');
const assert = require('assert');

const index = fs.readFileSync('index.html', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const worker = fs.readFileSync('share-service/worker.js', 'utf8');
const listMarket = fs.readFileSync('list-market-v230.js', 'utf8');
const listMarketCore = fs.readFileSync('app.js', 'utf8');

assert(
  listMarket.includes('O mercado será exibido na lista e ficará associado a ela.'),
  'mercado da lista deve ser apresentado como dado da própria lista'
);
assert(
  listMarket.includes('FALLBACK_MARKETS'),
  'seletor deve possuir fallback local para não depender da leitura do banco para aparecer'
);
assert(
  !/delete\s+next\.marketName/.test(listMarketCore),
  'mercado antigo dos itens não deve ser removido ao salvar o mercado da lista'
);

assert(sw.includes("'./v3-shell.js'"), 'Service Worker deve cachear o shell V3');
assert(sw.includes("'./version-v230.js'"), 'Service Worker deve cachear o versionador');
assert(sw.includes('minha-lista-v2-3-8'), 'Service Worker deve usar o cache da versão atual');
assert(!sw.includes('src="./v3-shell.js"'), 'Service Worker não deve injetar scripts no HTML');
assert(index.includes('list-market-v230.js'), 'HTML deve carregar a entrada do runtime');

assert(/MAX_BODY_BYTES/.test(worker), 'Worker deve limitar tamanho do corpo');
assert(/CORS|Access-Control-Allow-Origin/.test(worker), 'Worker deve declarar CORS');

console.log('V2.3.0 security/regression source audit: OK');
