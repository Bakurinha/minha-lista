'use strict';

const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('share-optimized-v230.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const runtime = fs.readFileSync('list-market-v230.js', 'utf8');

assert(source.includes("CompressionStream('gzip')"), 'Compressão GZIP ausente');
assert(source.includes("DecompressionStream('gzip')"), 'Descompressão GZIP ausente');
assert(source.includes('#lista-gz='), 'Formato de link compactado ausente');
assert(source.includes('shared-list-v3-compact'), 'Formato compacto ausente');
assert(source.includes('delete copy.inventory'), 'Estoque não é removido do payload');
assert(source.includes('delete copy.stock'), 'Stock não é removido do payload');
assert(source.includes('stopImmediatePropagation'), 'Interceptação segura do botão ausente');
assert(
  sw.indexOf("'./share-optimized-v230.js'") < sw.indexOf("'./enhancements.js'"),
  'Otimizador deve carregar antes do compartilhamento legado'
);
assert(
  runtime.indexOf("'./share-optimized-v230.js'") < runtime.indexOf("'./enhancements.js'"),
  'Otimizador deve carregar antes do compartilhamento legado no runtime'
);
assert(
  !sw.includes('src="./share-optimized-v230.js"'),
  'Service Worker não deve injetar o otimizador'
);

console.log('V2.3.0 optimized sharing contract: OK');
