import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePayload} from '../worker.js';
const catalog={id:'c1',name:'Arroz',brand:'Tio João',unit:'5 kg',category:'Alimentos',notes:'',ean:''};
const item={id:'i1',mainItemId:'c1',done:false,quantity:2,date:'2026-09-08',value:35.5,marketName:'Atakarejo',comments:'',productName:'Arroz',productBrand:'Tio João',productUnit:'5 kg',productCategory:'Alimentos'};
function payload(n=1){return{app:'Minha Lista de Supermercado',format:'shared-list-v2',version:2,list:{id:'x',name:'Compra',date:'2026-09-08',purchaseType:'local',comments:'',items:Array.from({length:n},(_,i)=>({...item,id:`i${i}`}))},catalogs:[catalog]}}
test('payload mínimo válido',()=>assert.equal(validatePayload(payload()).ok,true));
test('300 itens',()=>assert.equal(validatePayload(payload(300)).ok,true));
test('referência inválida',()=>{const p=payload();p.list.items[0].mainItemId='missing';assert.equal(validatePayload(p).ok,false)});
test('nome vazio',()=>{const p=payload();p.list.name='';assert.equal(validatePayload(p).ok,false)});
test('formato errado',()=>{const p=payload();p.version=1;assert.equal(validatePayload(p).ok,false)});
test('valor infinito',()=>{const p=payload();p.list.items[0].value=Infinity;assert.equal(validatePayload(p).ok,false)});
test('data inválida',()=>{const p=payload();p.list.items[0].date='08/09/2026';assert.equal(validatePayload(p).ok,false)});
test('data impossível',()=>{const p=payload();p.list.date='2026-02-31';assert.equal(validatePayload(p).ok,false)});
test('mais de 2000 itens',()=>assert.equal(validatePayload(payload(2001)).ok,false));
test('catálogo sem nome',()=>{const p=payload();p.catalogs[0].name='';assert.equal(validatePayload(p).ok,false)});
