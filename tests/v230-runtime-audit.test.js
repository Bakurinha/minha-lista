'use strict';

const fs = require('fs');
const assert = require('assert');

const migrations = fs.readFileSync('db-migrations-v230.js', 'utf8');
const loading = fs.readFileSync('initial-loading.js', 'utf8');
const refresh = fs.readFileSync('reference-market-refresh.js', 'utf8');
const runtime = fs.readFileSync('list-market-v230.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

assert(!migrations.includes('document.'), 'Migrações não podem manipular DOM');
assert(!migrations.includes('MutationObserver'), 'Migrações não podem observar UI');
assert(migrations.includes('__mlDbMigrationsV230'), 'API de migrações ausente');

assert(index.includes('<script src="./initial-loading.js"></script>'), 'Loading deve iniciar direto no HTML');
assert(loading.includes('__mlAppReadyV230'), 'Loading não espera o núcleo');
assert(loading.includes('__mlReferenceReadyV230'), 'Loading não espera o banco de referência');
assert(loading.includes('v3ShellInstalled'), 'Loading não espera o shell visual');
assert(loading.includes('mlSearchControlsInstalled'), 'Loading não espera os controles de pesquisa');

assert(app.includes('__mlAppReadyV230'), 'Núcleo não sinaliza prontidão');
assert(
  !/seedReferenceData[\s\S]*?\.clear\(\)/.test(app.slice(app.indexOf('async function seedReferenceData'), app.indexOf('function productSnapshot'))),
  'Seed de referência não pode limpar um catálogo já expandido'
);
assert(refresh.includes('__mlReferenceReadyV230'), 'Referência não sinaliza prontidão');
assert(!refresh.includes('localStorage'), 'Prontidão do banco não pode depender de localStorage');
assert(refresh.includes('ml:app-ready'), 'Banco de referência deve aguardar o núcleo antes da auditoria');
assert(refresh.includes("count(db, 'referenceProducts')"), 'Verificação deve consultar o IndexedDB real');
assert(refresh.includes('PRODUCT_TARGET = 20000'), 'Alvo do catálogo de referência mudou inesperadamente');

assert(runtime.includes("'./v3-compact-controls.js'"), 'Pesquisa responsiva ausente do bootstrap');
assert(runtime.includes("'./reference-market-refresh.js'"), 'Verificação do banco ausente do bootstrap');
assert((runtime.match(/serviceWorker[\s\S]*?register/g) || []).length >= 1, 'Runtime não registra Service Worker');
assert(!app.includes('serviceWorker.register'), 'Registro duplicado do Service Worker no núcleo');

console.log('runtime/startup audit: OK');
