'use strict';

const fs = require('fs');
const assert = require('assert');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const index = fs.readFileSync('index.html', 'utf8');
const runtime = fs.readFileSync('list-market-v230.js', 'utf8');
const shell = fs.readFileSync('v3-shell.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const version = fs.readFileSync('version-v230.js', 'utf8');
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
assert(
  shell.includes("button.addEventListener('click', () => closeMenu());"),
  'Fechamento do menu não deve bloquear o clique de navegação'
);
assert(shell.includes('function closeMenu()'), 'closeMenu deve ser não destrutivo');
assert(!iconForce.includes('v3-menu-autoclose.js'), 'Autoclose duplicado ainda é carregado');

for (const asset of [
  './v3-icons.js',
  './v3-icon-force.js',
  './v3-shell.js',
  './v3-compact-controls.js',
  './reference-market-refresh.js',
]) {
  assert(runtime.includes(`'${asset}'`), `${asset} não está no bootstrap do runtime`);
  assert(sw.includes(`'${asset}'`), `${asset} não está no cache do Service Worker`);
}

assert(icons.includes('const ICONS'), 'Mapa principal de ícones ausente');
assert(iconForce.includes('Extended_Pictographic'), 'Fallback pictográfico ausente');

const searchIds = [
  'listSearch',
  'catalogSearch',
  'wishSearch',
  'invSearch',
  'historyItemSearch',
  'historyMarketSearch',
  'refProductSearch',
  'refCatalogSearch',
  'listItemSearch',
];
for (const id of searchIds) assert(compact.includes(`'${id}'`), `Pesquisa ${id} ausente`);
assert(compact.includes('MAX_SEARCH_LINES = 2'), 'Pesquisa deve crescer no máximo duas linhas');
assert(compact.includes('autosizeSearch'), 'Pesquisa não possui autosize por linha');
assert(compact.includes("removeAttribute('maxlength')"), 'Pesquisa possui limite artificial');
assert(
  compact.includes("visual.className = 'input ml-search-multiline'"),
  'Estilo base do campo não é preservado'
);
assert(compact.includes('width: 100% !important'), 'Pesquisa deve manter largura responsiva');
assert(compact.includes('min-height: 36px !important'), 'Altura inicial compacta ausente');
assert(compact.includes('padding: 7px 10px !important'), 'Compactação vertical ausente');
assert(compact.includes('white-space: pre-wrap'), 'Quebra de linha ausente');
assert(compact.includes('overflow-wrap: anywhere'), 'Texto longo não está protegido');
assert(compact.includes('mlSearchControlsInstalled'), 'Sinal de instalação dos controles ausente');
assert(
  compact.includes("dispatchEvent(new Event('input', { bubbles: true }))"),
  'Pesquisa visual não sincroniza com o listener original'
);

assert(
  index.includes('<script src="./initial-loading.js"></script>'),
  'Loading inicial não é carregado diretamente'
);
assert(
  !index.includes('<script src="./v3-icons.js"></script>'),
  'Ícones ainda são carregados duas vezes'
);
assert(!version.includes('v3-shell.js'), 'Versionador não deve carregar o shell V3');
assert(version.includes(`const VERSION = 'v${pkg.version}'`), 'Versão visual fora de sincronia');
assert(
  sw.includes(`minha-lista-v${pkg.version.replace(/\./g, '-')}`),
  'Cache PWA fora de sincronia'
);

assert(sharing.includes('openReady'), 'Compartilhamento não aguarda o banco');
assert(sharing.includes("get('shared')"), 'Importação remota por shared ausente');
assert(
  sharing.includes('id="mlShareCode"') && sharing.includes('maxlength="12"'),
  'Código de compartilhamento inválido'
);
assert(
  shareCompat.includes('sharedInput') && shareCompat.includes('sharedImportBtn'),
  'Compatibilidade da importação por código ausente'
);

console.log(`V3 UI/runtime contract: OK (${pkg.version})`);
