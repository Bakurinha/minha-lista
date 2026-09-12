'use strict';

const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('share-optimized-v230.js', 'utf8');
const shareConfig = fs.readFileSync('share-config.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const runtime = fs.readFileSync('list-market-v230.js', 'utf8');

assert(
  source.includes('__mlShareOptimizedLegacyDisabled = true'),
  'Compatibilidade legada deve estar desativada'
);
assert(source.includes('sharedInput'), 'Importação legada deve ser identificada para substituição');
assert(source.includes('sharedImportBtn'), 'Botão de importação por código deve ser criado');
assert(source.includes('shareListBtn'), 'Importação por código deve reutilizar o fluxo oficial');
assert(source.includes('stopImmediatePropagation'), 'Interceptação segura do botão ausente');
assert(!source.includes('type="file"'), 'Compatibilidade não deve abrir seletor de arquivos');
assert(
  !source.includes('accept="application/json,.json"'),
  'Compatibilidade não deve solicitar JSON'
);
assert(
  shareConfig.includes("format: 'shared-list-v3-compact'"),
  'Formato compacto deve pertencer ao fluxo oficial'
);
assert(shareConfig.includes('delete copy.inventory'), 'Estoque não é removido do payload oficial');
assert(shareConfig.includes('delete copy.stock'), 'Stock não é removido do payload oficial');
assert(shareConfig.includes('id="mlShareCode"'), 'Importação deve oferecer campo de código');
assert(shareConfig.includes('maxlength="12"'), 'Código deve ter 12 caracteres');
assert(sw.includes("'./share-config.js'"), 'Service Worker deve carregar o fluxo oficial');
assert(
  sw.includes("'./share-optimized-v230.js'"),
  'Service Worker deve carregar a compatibilidade'
);
assert(runtime.includes("'./share-config.js'"), 'Runtime deve carregar o fluxo oficial');
assert(runtime.includes("'./share-optimized-v230.js'"), 'Runtime deve carregar a compatibilidade');

console.log('V2.3.4 code-only shared-list import contract: OK');
