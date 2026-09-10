import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePayload} from '../worker.js';
const catalog={id:'c1',name:'Arroz',brand:'Tio João',unit:'5 kg',category:'Alimentos',notes:'',ean:''};
const item={id:'i1',mainItemId:'c1',done:false,quantity:2,date:'2026-09-08',value:35.5,marketName:'Atakarejo',comments:'',productName:'Arroz',productBrand:'Tio João',productUnit:'5 kg',productCategory:'Alimentos'};
function payload(n=1,format='shared-list-v2'){return{app:'Minha Lista de Supermercado',format,version:format==='shared-list-v3'?3:2,list:{id:'x',name:'Compra',date:'2026-09-08',purchaseType:'local',comments:'',items:Array.from({length:n},(_,i)=>({...item,id:`i${i}`}))},catalogs:[{...catalog}]}}
test('payload V2 mínimo válido',()=>assert.equal(validatePayload(payload()).ok,true));
test('payload V3 mínimo válido',()=>assert.equal(validatePayload(payload(1,'shared-list-v3')).ok,true));
test('V3 com embalagem e validade',()=>{const p=payload(1,'shared-list-v3');p.list.items[0].packageQuantity=20;p.list.items[0].packageUnit='un';p.list.items[0].expiryDate='2026-12-31';assert.equal(validatePayload(p).ok,true)});
test('300 itens',()=>assert.equal(validatePayload(payload(300)).ok,true));
test('item sem ID',()=>{const p=payload();delete p.list.items[0].id;assert.equal(validatePayload(p).ok,false)});
test('referência inválida',()=>{const p=payload();p.list.items[0].mainItemId='missing';assert.equal(validatePayload(p).ok,false)});
test('nome vazio',()=>{const p=payload();p.list.name='';assert.equal(validatePayload(p).ok,false)});
test('formato errado',()=>{const p=payload();p.version=1;assert.equal(validatePayload(p).ok,false)});
test('valor infinito',()=>{const p=payload();p.list.items[0].value=Infinity;assert.equal(validatePayload(p).ok,false)});
test('data inválida',()=>{const p=payload();p.list.items[0].date='08/09/2026';assert.equal(validatePayload(p).ok,false)});
test('data impossível',()=>{const p=payload();p.list.date='2026-02-31';assert.equal(validatePayload(p).ok,false)});
test('validade inválida',()=>{const p=payload(1,'shared-list-v3');p.list.items[0].expiryDate='2026-02-31';assert.equal(validatePayload(p).ok,false)});
test('mais de 2000 itens',()=>assert.equal(validatePayload(payload(2001)).ok,false));
test('catálogo sem nome',()=>{const p=payload();p.catalogs[0].name='';assert.equal(validatePayload(p).ok,false)});
test('catálogo com ID duplicado',()=>{const p=payload();p.catalogs.push({...catalog});p.list.items.push({...item,id:'i2'});assert.equal(validatePayload(p).ok,false)});
test('quantidade negativa',()=>{const p=payload();p.list.items[0].quantity=-1;assert.equal(validatePayload(p).ok,false)});
test('valor negativo',()=>{const p=payload();p.list.items[0].value=-0.01;assert.equal(validatePayload(p).ok,false)});
test('conteúdo por embalagem negativo',()=>{const p=payload(1,'shared-list-v3');p.list.items[0].packageQuantity=-1;assert.equal(validatePayload(p).ok,false)});
test('EAN acima do limite',()=>{const p=payload();p.catalogs[0].ean='123456789012345';assert.equal(validatePayload(p).ok,false)});
test('ID de catálogo ausente',()=>{const p=payload();p.catalogs[0].id='';assert.equal(validatePayload(p).ok,false)});
test('campos XSS são tratados como texto',()=>{
  const dangerous=['<script>alert(1)</script>','<img src=x onerror=alert(1)>','\"><script>alert(1)</script>','javascript:alert(1)'];
  for(const value of dangerous){
    const p=payload(1,'shared-list-v3');
    p.list.items[0].comments=value;
    const r=validatePayload(p);
    assert.equal(r.ok,true,`XSS valor rejeitado indevidamente: ${value}; erro=${r.error}`);
    assert.equal(r.value.list.items[0].comments,value);
  }
});
