(()=>{
'use strict';
const DB_NAME='MinhaListaDB',LATEST=6;
const MIGRATIONS=Object.freeze({
  1:Object.freeze(['catalogs','lists','history','settings']),
  2:Object.freeze(['wishlist']),
  3:Object.freeze(['trash']),
  4:Object.freeze(['referenceProducts','referenceMarkets']),
  5:Object.freeze([]),
  6:Object.freeze(['inventory'])
});
const keyPath=s=>s==='settings'?'key':'id';
function ensureStore(db,store){
  if(!db.objectStoreNames.contains(store))db.createObjectStore(store,{keyPath:keyPath(store)});
}
function migrate(db,oldVersion,newVersion=LATEST){
  if(oldVersion>newVersion)throw new Error(`Versão antiga ${oldVersion} maior que a versão alvo ${newVersion}`);
  for(let version=Math.max(1,oldVersion+1);version<=newVersion;version++)for(const store of MIGRATIONS[version]||[])ensureStore(db,store);
}
function plan(oldVersion,newVersion=LATEST){
  if(!Number.isInteger(oldVersion)||oldVersion<0)throw new TypeError('oldVersion inválida');
  if(!Number.isInteger(newVersion)||newVersion<1)throw new TypeError('newVersion inválida');
  if(oldVersion>newVersion)throw new Error('oldVersion não pode ser maior que newVersion');
  return Object.freeze(Array.from({length:newVersion-Math.max(0,oldVersion)},(_,i)=>Math.max(1,oldVersion+1+i)).flatMap(version=>MIGRATIONS[version]||[]));
}
window.__mlDbMigrationsV230={DB_NAME,LATEST,MIGRATIONS,keyPath,ensureStore,migrate,plan};
})();
