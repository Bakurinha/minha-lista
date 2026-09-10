(()=>{
'use strict';
const DB='MinhaListaDB',TARGET=6;
if(!window.__MINHA_LISTA_DB_BOOTSTRAP__){
  window.__MINHA_LISTA_DB_BOOTSTRAP__=true;
  const original=IDBFactory.prototype.open;
  IDBFactory.prototype.open=function(name,version,options){
    const target=name===DB&&typeof version==='number'&&version<TARGET?TARGET:version;
    const req=original.call(this,name,target,options);
    if(name===DB&&target===TARGET&&version!==TARGET){
      req.addEventListener('upgradeneeded',()=>{
        const d=req.result;
        if(!d.objectStoreNames.contains('inventory'))d.createObjectStore('inventory',{keyPath:'id'});
      });
    }
    return req;
  };
}
})();
