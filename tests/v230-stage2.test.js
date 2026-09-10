const fs=require('fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const backupSource=fs.readFileSync('backup-v230.js','utf8');
const app=fs.readFileSync('app.js','utf8');
const share=fs.readFileSync('enhancements.js','utf8');
const list=fs.readFileSync('list-enhancements.js','utf8');
const worker=fs.readFileSync('share-service/worker.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const context={document:{readyState:'loading',addEventListener(){}},window:null,console,alert(){},URL,Blob,TextEncoder};
context.window=context;
vm.runInNewContext(backupSource,context,{timeout:1000});
const {validate,migrate}=context.__mlBackupV230;
function baseBackup(version=2){return{app:'Minha Lista de Supermercado',backupFormatVersion:version,schemaVersion:version===2?6:1,catalogs:[{id:'c1',name:'Arroz'}],lists:[{id:'l1',name:'Compra',date:'2026-09-10',items:[{id:'i1',mainItemId:'c1',done:false,quantity:1,value:10,date:null,expiryDate:'2026-12-31',packageQuantity:5,packageUnit:'kg',marketName:'',comments:''}]}],history:[],wishlist:[],trash:[],settings:{theme:'system'}}}
assert.equal(validate(baseBackup(2)),null,'V2 backup must validate');
assert.deepEqual(migrate(baseBackup(1)).inventory,[],'V1 must migrate with empty inventory');
assert.equal(validate({...baseBackup(2),referenceProducts:[{id:'rp',name:'private'}]}),null,'extra reference fields are ignored by V2 import validation');
assert.equal(validate({...baseBackup(2),inventory:[{id:'s1',mainItemId:'c1',quantity:2,expiryDate:'2026-12-31',entryDate:'2026-09-10',packageQuantity:10,minQuantity:1,packageUnit:'un',marketName:'Atakarejo',location:'A1',notes:''}]}),null,'V2 inventory must validate');
assert.notEqual(validate({...baseBackup(2),inventory:[{id:'s1',mainItemId:'missing',quantity:2}]}),null,'invalid inventory reference must fail');
assert.equal(validate({...baseBackup(2),lists:[{id:'l1',name:'Compra',date:'2026-02-31',items:[]}]} )!=='',true,'impossible list date must fail');
assert(sw.includes('./backup-v230.js')&&sw.includes('./list-enhancements.js'),'Stage 2 assets must be cached');
assert(share.includes("format:'shared-list-v3'")&&share.includes("delete x.inventory")&&share.includes("delete x.stock"),'V3 sharing must exclude inventory/stock');
assert(share.includes("shared-list-v2")&&share.includes("shared-list-v3"),'V2/V3 import compatibility must remain');
assert(share.includes('history.replaceState'),'share cancel/import URL handling must avoid forced navigation');
assert(!share.includes("navigator.sendBeacon")&&!share.includes("WebSocket")&&!share.includes("firebase")&&!share.includes("supabase"),'No tracking/backend SDKs allowed');
assert(list.includes('data-v230-existing-id')||list.includes('v230ExistingId'),'list editing must track the real item ID');
assert(list.includes('f.isConnected'),'invalid form submission must not patch inventory/list extras');
assert(app.includes("const esc=s=>String(s??'').replace(/[&<>'\\\"]/g"),'app must retain centralized HTML escaping');
for(const dangerous of ['<script>alert(1)</script>','<img src=x onerror=alert(1)>','\"><script>alert(1)</script>','javascript:alert(1)']){
  assert(worker.includes('text(i.comments,2000)'),'worker must keep imported comments as text');
  assert(!share.includes(dangerous),'dangerous test strings must not be embedded as executable markup');
}
assert(worker.includes("if(!iid||!mainItemId"),'worker must reject missing item IDs');
assert(worker.includes('MAX_BODY_BYTES')&&worker.includes('expirationTtl:SHARE_TTL'),'worker payload limit and TTL must remain enforced');
console.log('V2.3.0 Stage 2 source/migration/privacy/XSS invariants OK');
