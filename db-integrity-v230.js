(()=>{
'use strict';
const DB='MinhaListaDB',VERSION=6;
const STORES=['catalogs','lists','history','wishlist','trash','settings','referenceProducts','referenceMarkets','inventory'];
const $=id=>document.getElementById(id);
const all=(db,store)=>new Promise((resolve,reject)=>{const r=db.transaction(store,'readonly').objectStore(store).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error||Error('Falha IndexedDB'))});
const open=()=>new Promise((resolve,reject)=>{const r=indexedDB.open(DB);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||Error('IndexedDB indisponível'))});
const date=v=>v==null||v===''||/^\d{4}-\d{2}-\d{2}$/.test(String(v));
const num=v=>v==null||v===''||(typeof v==='number'&&Number.isFinite(v)&&v>=0);
const id=v=>typeof v==='string'&&v.length>=1&&v.length<=200;
async function diagnose(){
 const d=await open();
 try{
  const missing=STORES.filter(s=>!d.objectStoreNames.contains(s));
  if(missing.length)return {ok:false,version:d.version,missing,counts:{},issues:[`Stores ausentes: ${missing.join(', ')}`]};
  const rows=Object.fromEntries(await Promise.all(STORES.map(async s=>[s,await all(d,s)])));
  const issues=[];const add=(s,msg)=>issues.push(`${s}: ${msg}`);
  const catalogs=new Set();
  for(const c of rows.catalogs){if(!c||!id(c.id)||typeof c.name!=='string'||!c.name.trim())add('catalogs','registro inválido');else if(catalogs.has(c.id))add('catalogs','ID duplicado');else catalogs.add(c.id)}
  const lists=new Set();
  for(const l of rows.lists){if(!l||!id(l.id)||typeof l.name!=='string'||!l.name.trim()||!Array.isArray(l.items))add('lists','registro inválido');else{if(lists.has(l.id))add('lists','ID duplicado');lists.add(l.id);for(const i of l.items){if(!i||!id(i.id)||!id(i.mainItemId)||!catalogs.has(i.mainItemId)||typeof i.done!=='boolean'||!num(i.quantity)||!num(i.value)||!date(i.date)||!date(i.expiryDate))add('lists',`item inválido ou órfão (${i?.id||'sem ID'})`)}}}
  for(const h of rows.history){if(!h||!id(h.id)||h.mainItemId&&!catalogs.has(h.mainItemId)||typeof h.itemName!=='string'||!num(h.value)||!date(h.date))add('history','registro inválido ou órfão')}
  for(const w of rows.wishlist)if(!w||!id(w.id)||typeof w.name!=='string'||!w.name.trim())add('wishlist','registro inválido');
  for(const t of rows.trash)if(!t||!id(t.id)||!['catalog','list'].includes(t.type)||!t.data)add('trash','registro inválido');
  for(const x of rows.inventory){if(!x||!id(x.id)||!id(x.mainItemId)||!catalogs.has(x.mainItemId)||!num(x.quantity)||!num(x.packageQuantity)||!num(x.minQuantity)||!date(x.expiryDate)||!date(x.entryDate)||typeof (x.packageUnit??'')!=='string')add('inventory',`lote inválido ou órfão (${x?.id||'sem ID'})`)}
  for(const s of rows.settings)if(!s||typeof s.key!=='string')add('settings','registro inválido');
  if(d.version<6)add('database',`versão ${d.version}; esperado >= 6`);
  const counts=Object.fromEntries(STORES.map(s=>[s,rows[s].length]));
  return {ok:issues.length===0,version:d.version,missing:[],counts,issues};
 }finally{d.close()}
}
function report(r){const counts=Object.entries(r.counts).filter(([,n])=>n>0).map(([k,n])=>`${k}: ${n}`).join('\n');return `Integridade do armazenamento\n\n${r.ok?'✓ Nenhum problema encontrado.':'⚠ Problemas encontrados:'}\n${r.issues.length?r.issues.slice(0,20).map(x=>`• ${x}`).join('\n'):'• Estrutura e referências básicas OK.'}\n\nVersão do banco: ${r.version}\n\nRegistros:\n${counts||'nenhum'}${r.issues.length>20?'\n\n...mais problemas foram encontrados.':''}`}
async function run(){try{const r=await diagnose();console.info('[Minha Lista] diagnóstico IndexedDB',r);alert(report(r));return r}catch(e){console.error(e);alert('Não foi possível verificar a integridade do armazenamento.')}}
function bind(){const host=document.querySelector('#settingsView .panel:nth-of-type(2)');if(!host||$('dbIntegrityBtn'))return;const b=document.createElement('button');b.id='dbIntegrityBtn';b.className='btn ghost';b.type='button';b.textContent='🔎 Verificar integridade';b.addEventListener('click',run);host.querySelector('.row')?.appendChild(b)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
window.__mlDbIntegrityV230={diagnose,report};
})();
