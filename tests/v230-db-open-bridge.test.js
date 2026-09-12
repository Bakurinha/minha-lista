const fs=require('fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');

const migrationSource=fs.readFileSync('db-migrations-v230.js','utf8');
const bridgeSource=fs.readFileSync('db-open-bridge-v230.js','utf8');

const calls=[];
const names=new Set();
const db={objectStoreNames:{contains:(name)=>names.has(name)}};
let upgradeListener=null;
const request={
  result:db,
  addEventListener(type,fn){if(type==='upgradeneeded')upgradeListener=fn}
};
const nativeIndexedDB={
  open(name,version){calls.push({name,version});return request}
};

const context={window:{indexedDB:nativeIndexedDB},Object,Array,Number,String,TypeError,Error,RangeError,Promise,Proxy,Reflect};
vm.createContext(context);
vm.runInContext(migrationSource,context);
vm.runInContext(bridgeSource,context);

assert(context.window.__mlDbMigrationsV230);
assert(context.window.__mlDbOpenBridgeV230);
assert.notStrictEqual(context.window.indexedDB,nativeIndexedDB,'a página deve usar a fachada da IndexedDB');

const opened=context.window.indexedDB.open('MinhaListaDB',6);
assert.strictEqual(opened,request);
assert.deepStrictEqual(calls,[{name:'MinhaListaDB',version:6}]);
assert.equal(typeof upgradeListener,'function','a ponte deve instalar o listener de migração');

const fakeNames=new Set();
request.result.objectStoreNames={contains:(name)=>fakeNames.has(name)};
request.result.createObjectStore=(name)=>{fakeNames.add(name)};
upgradeListener({oldVersion:0,newVersion:6});
assert(fakeNames.has('catalogs'));
assert(fakeNames.has('inventory'));

console.log('V2.3.0 database opener bridge tests: OK');
