import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../worker.js';

const APP_ORIGIN = 'https://bakurinha.github.io';
const catalog = {
  id: 'c1',
  name: 'Arroz',
  brand: '',
  unit: 'un',
  category: 'Alimentos',
  notes: '',
  ean: '',
};
const item = {
  id: 'i1',
  mainItemId: 'c1',
  done: false,
  quantity: 1,
  date: '2026-09-08',
  value: 10,
  marketName: '',
  comments: '',
  productName: 'Arroz',
  productBrand: '',
  productUnit: 'un',
  productCategory: 'Alimentos',
};
const payload = {
  app: 'Minha Lista de Supermercado',
  format: 'shared-list-v2',
  version: 2,
  list: {
    id: 'x',
    name: 'Compra',
    date: '2026-09-08',
    purchaseType: 'local',
    comments: '',
    items: [item],
  },
  catalogs: [catalog],
};
function env() {
  const map = new Map();
  return {
    map,
    SHARES: {
      async put(k, v, o) {
        map.set(k, { v, o });
      },
      async get(k) {
        return map.get(k)?.v || null;
      },
    },
  };
}
function req(url, init = {}) {
  return new Request(url, { ...init, headers: { Origin: APP_ORIGIN, ...(init.headers || {}) } });
}

test('OPTIONS retorna CORS somente para a origem da aplicação', async () => {
  const e = env(),
    r = await handleRequest(req('https://share.example/api/share', { method: 'OPTIONS' }), e);
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), APP_ORIGIN);
});
test('POST cria compartilhamento com TTL e link', async () => {
  const e = env(),
    r = await handleRequest(
      req('https://share.example/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
      e
    );
  assert.equal(r.status, 201);
  const data = await r.json();
  assert.match(data.id, /^[A-Za-z0-9_-]{36}$/);
  assert.equal(data.expiresIn, 604800);
  assert.equal(e.map.size, 1);
  assert.equal(e.map.get(data.id).o.expirationTtl, 604800);
  assert.equal(data.url, `https://share.example/s/${data.id}`);
});
test('GET recupera compartilhamento', async () => {
  const e = env();
  e.map.set('a'.repeat(36), { v: JSON.stringify(payload) });
  const r = await handleRequest(
    req(`https://share.example/api/share/${'a'.repeat(36)} `.trim()),
    e
  );
  assert.equal(r.status, 200);
  assert.equal((await r.json()).format, 'shared-list-v2');
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
});
test('GET inexistente retorna 404', async () => {
  const e = env(),
    r = await handleRequest(req(`https://share.example/api/share/${'b'.repeat(36)}`), e);
  assert.equal(r.status, 404);
});
test('GET /s/:id redireciona somente se existir', async () => {
  const e = env(),
    sid = 'c'.repeat(36);
  e.map.set(sid, { v: JSON.stringify(payload) });
  const r = await handleRequest(req(`https://share.example/s/${sid}`), e);
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('Location'), `https://bakurinha.github.io/minha-lista/?shared=${sid}`);
});
test('origem externa é recusada', async () => {
  const e = env(),
    r = await handleRequest(
      new Request('https://share.example/api/share', {
        method: 'POST',
        headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
      e
    );
  assert.equal(r.status, 403);
  assert.equal(e.map.size, 0);
});
test('JSON inválido é recusado', async () => {
  const e = env(),
    r = await handleRequest(
      req('https://share.example/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{',
      }),
      e
    );
  assert.equal(r.status, 400);
  assert.equal(e.map.size, 0);
});
test('método não permitido não cria compartilhamento', async () => {
  const e = env(),
    r = await handleRequest(
      req('https://share.example/api/share', { method: 'PUT', body: JSON.stringify(payload) }),
      e
    );
  assert.equal(r.status, 200);
  assert.equal(e.map.size, 0);
});
