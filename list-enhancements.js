(()=>{
'use strict';
const DB='MinhaListaDB';
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open(DB);r.onerror=()=>rej(r.error);r.onsuccess=()=>res(r.result)});
const all=(d,s)=>new Promise((res,rej)=>{const r=d.transaction(s,'readonly').objectStore(s).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)});
const put=(d,s,v)=>new Promise((res,rej)=>{const r=d.transaction(s,'readwrite').objectStore(s).put(v);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)});
function field(id,label,type='text'){return `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" name="${id}" type="${type}" ${type==='number'?'min="0" step="any"':''}></div>`}
function inject(){const f=document.getElementById('itemForm');if(!f||f.querySelector('[data-v230-list-fields]'))return;const wrap=document.createElement('div');wrap.dataset.v230ListFields='1';wrap.className='row stack-mobile';wrap.innerHTML=field('v230PackageQuantity','Conteúdo por embalagem','number')+field('v230PackageUnit','Unidade da embalagem')+field('v230ExpiryDate','Validade','date');const submit=f.querySelector('button[type="submit"]');if(submit)f.insertBefore(wrap,submit);else f.appendChild(wrap)}
function values(){return{packageQuantity:document.getElementById('v230PackageQuantity')?.value||'',packageUnit:document.getElementById('v230PackageUnit')?.value||'',expiryDate:document.getElementById('v230ExpiryDate')?.value||''}}
async function snapshot(){const d=await open();try{return await all(d,'lists')}finally{d.close()}}
async function patch(before,extra){const after=await snapshot(),beforeMap=new Map(before.flatMap(l=>(l.items||[]).map(i=>[i.id,JSON.stringify(i)])));let target=null;for(const l of after){for(const i of l.items||[]){if(!beforeMap.has(i.id)||JSON.stringify(i)!==beforeMap.get(i.id)){target={list:l,item:i};break}}if(target)break}if(!target)return;const i=target.item;if(extra.packageQuantity!==''&&Number.isFinite(Number(String(extra.packageQuantity).replace(',','.'))))i.packageQuantity=Number(String(extra.packageQuantity).replace(',','.'));else delete i.packageQuantity;if(extra.packageUnit)i.packageUnit=String(extra.packageUnit).slice(0,60);else delete i.packageUnit;if(extra.expiryDate)i.expiryDate=extra.expiryDate;else delete i.expiryDate;i.updatedAt=new Date().toISOString();const d=await open();try{await put(d,'lists',target.list)}finally{d.close()}}
function capture(){const f=document.getElementById('itemForm');if(!f||f.dataset.v230Capture)return;f.dataset.v230Capture='1';f.addEventListener('submit',async()=>{try{const before=await snapshot(),extra=values();setTimeout(()=>patch(before,extra).catch(console.error),300)}catch(e){console.error(e)}},true)}
function init(){inject();capture();new MutationObserver(()=>{inject();capture()}).observe(document.body,{subtree:true,childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
