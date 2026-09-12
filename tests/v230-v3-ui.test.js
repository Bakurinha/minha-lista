'use strict';

const fs = require('fs');
const assert = require('assert');

const shell = fs.readFileSync('v3-shell.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const version = fs.readFileSync('version-v230.js', 'utf8');
const runtime = fs.readFileSync('list-market-v230.js', 'utf8');

assert(shell.includes('v3-menu-toggle'), 'Botão hamburger ausente');
assert(shell.includes('v3-menu-overlay'), 'Overlay do menu ausente');
assert(shell.includes('v3-menu-open'), 'Estado do menu ausente');
assert(shell.includes('width: min(100%, 760px)'), 'Limite responsivo desktop ausente');
assert(shell.includes('max-width: 760px'), 'Max-width responsivo ausente');
assert(shell.includes('prefers-reduced-motion'), 'Acessibilidade de movimento ausente');
assert(shell.includes('Escape'), 'Fechamento do menu por teclado ausente');
assert(shell.includes('ICONS'), 'Sistema visual de ícones ausente');
assert(shell.includes('data-view'), 'Reutilização da navegação existente ausente');
assert(sw.includes("'./v3-shell.js'"), 'Shell não está no cache do Service Worker');
assert(runtime.includes("'./v3-shell.js'"), 'Shell não está no bootstrap do runtime');
assert(
  runtime.includes('navigator.serviceWorker.register'),
  'Service Worker não está registrado pelo runtime'
);
assert(version.includes("script.src = './v3-shell.js'"), 'Shell não está ligado ao versionador');

console.log('V2.3.0/V3 UI contract: OK');
