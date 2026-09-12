'use strict';

const fs = require('fs');
const assert = require('assert');

const shell = fs.readFileSync('v3-shell.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const version = fs.readFileSync('version-v230.js', 'utf8');
const runtime = fs.readFileSync('list-market-v230.js', 'utf8');
const icons = fs.readFileSync('v3-icons.js', 'utf8');
const iconForce = fs.readFileSync('v3-icon-force.js', 'utf8');
const compact = fs.readFileSync('v3-compact-controls.js', 'utf8');
const sharing = fs.readFileSync('share-config.js', 'utf8');
const shareCompat = fs.readFileSync('share-optimized-v230.js', 'utf8');

assert(shell.includes('v3-menu-toggle'), 'Botão hamburger ausente');
assert(shell.includes('v3-menu-overlay'), 'Overlay do menu ausente');
assert(shell.includes('v3-menu-open'), 'Estado do menu ausente');
assert(/width:\s*min\(100%,780px\)/.test(shell), 'Limite responsivo desktop ausente');
assert(shell.includes('max-width:780px'), 'Max-width responsivo ausente');
assert(shell.includes('prefers-reduced-motion'), 'Acessibilidade de movimento ausente');
assert(shell.includes('Escape'), 'Fechamento do menu por teclado ausente');
assert(shell.includes('ICONS'), 'Sistema visual de ícones ausente');
assert(shell.includes('data-view'), 'Reutilização da navegação existente ausente');
assert(runtime.includes("'./v3-icons.js'"), 'Ícones não estão no bootstrap do runtime');
assert(
  runtime.includes("'./v3-icon-force.js'"),
  'Normalização de ícones não está no bootstrap do runtime'
);
assert(
  runtime.includes("'./v3-compact-controls.js'"),
  'Controles responsivos não estão no bootstrap do runtime'
);
assert(sw.includes("'./v3-icons.js'"), 'Ícones não estão no cache do Service Worker');
assert(
  sw.includes("'./v3-icon-force.js'"),
  'Normalização de ícones não está no cache do Service Worker'
);
assert(
  sw.includes("'./v3-compact-controls.js'"),
  'Controles responsivos não estão no cache do Service Worker'
);
assert(sw.includes('minha-lista-v2-3-7'), 'Cache PWA não está na versão atual');
assert(icons.includes('const ICONS'), 'Mapa principal de ícones ausente');
assert(iconForce.includes('Extended_Pictographic'), 'Fallback pictográfico ausente');
assert(compact.includes('#listSearch'), 'Pesquisa de listas não está configurada');
assert(compact.includes('#catalogSearch'), 'Pesquisa de catálogo não está configurada');
assert(compact.includes('#wishSearch'), 'Pesquisa de desejos não está configurada');
assert(compact.includes('MAX_SEARCH_LINES = 5'), 'Pesquisa não possui limite vertical responsivo');
assert(compact.includes('autosizeSearch'), 'Pesquisa não possui autosize por linha');
assert(
  compact.includes("removeAttribute('maxlength')"),
  'Pesquisa ainda possui limite artificial de caracteres'
);
assert(compact.includes('white-space: pre-wrap'), 'Pesquisa não permite quebra de linha');
assert(
  compact.includes('overflow-wrap: anywhere'),
  'Pesquisa não trata textos longos responsivamente'
);
assert(compact.includes('@media (max-width: 620px)'), 'Ajuste mobile ausente');
assert(compact.includes('max-height: 112px'), 'Limite vertical mobile ausente');
assert(
  compact.includes('max-width: 180px'),
  'Seleção ainda não possui limite responsivo no mobile'
);
assert(compact.includes('@media (max-width: 380px)'), 'Ajuste para telas pequenas ausente');
assert(sharing.includes('openReady'), 'Compartilhamento não aguarda o banco ficar pronto');
assert(
  sharing.includes('while (Date.now() - started < timeout)'),
  'Compartilhamento não possui espera/repetição durante a inicialização do banco'
);
assert(
  sharing.includes("objectStoreNames.contains('catalogs')") &&
    sharing.includes("objectStoreNames.contains('lists')"),
  'Compartilhamento não valida as stores necessárias'
);
assert(sharing.includes("get('shared')"), 'Importação remota por shared ausente');
assert(
  sharing.includes('id="mlShareCode"') && sharing.includes('maxlength="12"'),
  'Importação por código não está configurada'
);
assert(
  shareCompat.includes('sharedInput') && shareCompat.includes('sharedImportBtn'),
  'Importação legada não é redirecionada para o código'
);
assert(
  !shareCompat.includes('type="file"') && !shareCompat.includes('accept="application/json,.json"'),
  'Fluxo de compatibilidade não deve abrir seletor de arquivos'
);
assert(
  /navigator\.serviceWorker[\s\S]*?\.register\(/.test(runtime),
  'Service Worker não está registrado pelo runtime'
);
assert(version.includes("script.src = './v3-shell.js'"), 'Shell não está ligado ao versionador');

console.log('V2.3.7 UI/sharing contract: OK');
