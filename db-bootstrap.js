(()=>{
'use strict';
const DB='MinhaListaDB',TARGET=6,STORE='inventory';
if(globalThis.__MINHA_LISTA_DB_BOOTSTRAP__)return;
globalThis.__MINHA_LISTA_DB_BOOTSTRAP__=true;
const original=IDBFactory.prototype.open;
IDBFactory.prototype.open=function(name,version,options){
  if(name!==DB||typeof version!=='number'||version>=TARGET)return original.call(this,name,version,options);
  const req=original.call(this,name,TARGET,options);
  req.addEventListener('upgradeneeded',()=>{
    const d=req.result;
    if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'});
  });
  return req;
};
})();
