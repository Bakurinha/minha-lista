'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACKAGE = path.join(ROOT, 'package.json');
const LOCK = path.join(ROOT, 'package-lock.json');
const SW = path.join(ROOT, 'sw.js');
const VERSION_FILE = path.join(ROOT, 'version-v230.js');
const MANIFEST = path.join(ROOT, 'manifest.json');
const INDEX = path.join(ROOT, 'index.html');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function versionToCache(version) {
  return version.replace(/\./g, '-');
}

function validateVersion(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Versão inválida: ${version}`);
}

function syncVersion(version) {
  validateVersion(version);
  const cache = `minha-lista-v${versionToCache(version)}`;

  const pkg = readJson(PACKAGE);
  pkg.version = version;
  writeJson(PACKAGE, pkg);

  if (fs.existsSync(LOCK)) {
    const lock = readJson(LOCK);
    lock.version = version;
    if (lock.packages?.['']) lock.packages[''].version = version;
    writeJson(LOCK, lock);
  }

  let sw = fs.readFileSync(SW, 'utf8');
  sw = sw.replace(/const CACHE = 'minha-lista-v[^']+';/, `const CACHE = '${cache}';`);
  fs.writeFileSync(SW, sw);

  let versionSource = fs.readFileSync(VERSION_FILE, 'utf8');
  versionSource = versionSource.replace(
    /const VERSION = 'v[^']+';/,
    `const VERSION = 'v${version}';`
  );
  fs.writeFileSync(VERSION_FILE, versionSource);

  let index = fs.readFileSync(INDEX, 'utf8');
  index = index.replace(
    /(class="sub">Supermercado • offline • )v\d+\.\d+\.\d+(<\/div>)/,
    `$1v${version}$2`
  );
  fs.writeFileSync(INDEX, index);

  const manifest = readJson(MANIFEST);
  manifest.app_version = version;
  writeJson(MANIFEST, manifest);

  console.log(`Versão sincronizada: ${version} (${cache})`);
}

function bumpVersion(kind) {
  const pkg = readJson(PACKAGE);
  const parts = pkg.version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN))
    throw new Error(`Versão atual inválida: ${pkg.version}`);

  if (kind === 'major') {
    parts[0] += 1;
    parts[1] = 0;
    parts[2] = 0;
  } else if (kind === 'minor') {
    parts[1] += 1;
    parts[2] = 0;
  } else if (kind === 'patch') {
    parts[2] += 1;
  } else {
    throw new Error('Use patch, minor ou major.');
  }
  syncVersion(parts.join('.'));
}

const command = process.argv[2] || 'sync';
const pkg = readJson(PACKAGE);
if (command === 'sync') syncVersion(pkg.version);
else bumpVersion(command);
