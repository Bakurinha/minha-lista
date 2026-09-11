const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const source=fs.readFileSync('backup-v230.js','utf8');
const context={document:{readyState:'complete',getElementById:()=>null,body:{},addEventListener(){}},indexedDB:{},console,URL:{createObjectURL:()=>'',revokeObjectURL(){}},Blob:function(){},setTimeout,clearTimeout,confirm:()=>true,location:{reload(){}},Date,JSON,Promise,Error,Object,Array,Number,String,Boolean,RegExp,Math};
context.window=context;
vm.createContext(context);
vm.runInContext(source,context);
const api=context.__mlBackupV230;
assert(api&&typeof api.validate==='function'&&typeof api.migrate==='function');

const catalog={id:'cat-001',name:'Arroz Integral',brand:'Tio João',unit:'1kg',category:'Alimentos',notes:'Integral'};
const item={id:'item-001',mainItemId:'cat-001',done:false,quantity:2,value:12.5,date:'2026-09-08',expiryDate:'2027-01-15',packageQuantity:1,packageUnit:'kg',marketName:'Atakarejo',comments:'Pacote fechado'};
const inventory={id:'lot-001',mainItemId:'cat-001',quantity:3,packageQuantity:1,packageUnit:'kg',expiryDate:'2027-01-15',entryDate:'2026-09-08',minQuantity:1,marketName:'Atakarejo',location:'Despensa',notes:'Lote A',createdAt:'2026-09-08T10:00:00.000Z',updatedAt:'2026-09-08T10:00:00.000Z'};
const original={app:'Minha Lista de Supermercado',backupFormatVersion:2,schemaVersion:6,exportedAt:'2026-09-08T10:00:00.000Z',catalogs:[catalog],lists:[{id:'list-001',name:'Compras da semana',date:'2026-09-08',purchaseType:'local',comments:'Feira',archived:false,items:[item]}],history:[{id:'hist-001',mainItemId:'cat-001',itemName:'Arroz Integral',brand:'Tio João',unit:'1kg',marketName:'Atakarejo',value:12.5,date:'2026-09-08',origin:'list'}],wishlist:[{id:'wish-001',name:'Café',createdAt:'2026-09-08T10:00:00.000Z'}],trash:[{id:'trash-001',type:'catalog',data:catalog,deletedAt:'2026-09-08T10:00:00.000Z'}],inventory:[inventory],settings:{theme:'dark',foo:'bar'}};

assert.strictEqual(api.validate(original),null,'backup V2 válido deve passar');
const migrated=api.migrate(original);
assert.strictEqual(api.validate(migrated),null,'backup V2 após migrate deve continuar válido');
assert.deepStrictEqual(migrated.catalogs,original.catalogs);
assert.deepStrictEqual(migrated.lists,original.lists);
assert.deepStrictEqual(migrated.history,original.history);
assert.deepStrictEqual(migrated.wishlist,original.wishlist);
assert.deepStrictEqual(migrated.trash,original.trash);
assert.deepStrictEqual(migrated.inventory,original.inventory);
assert.deepStrictEqual(migrated.settings,original.settings);
assert.strictEqual(migrated.schemaVersion,6);

const legacy={version:'2.2',app:'Minha Lista de Supermercado',schemaVersion:3,exportedAt:original.exportedAt,catalogs:[{id:'cat-001',name:'Arroz Integral'}],lists:[{id:'list-001',name:'Compras',items:[{id:'item-001',mainItemId:'cat-001',done:false,quantity:2,value:12.5}]}],history:[],wishlist:[],trash:[],settings:{theme:'light'}};
const legacyMigrated=api.migrate(legacy);
assert.strictEqual(api.validate(legacyMigrated),null,'backup legado 2.2 deve migrar e continuar válido');
assert.strictEqual(legacyMigrated.backupFormatVersion,2);
assert.strictEqual(legacyMigrated.schemaVersion,6);
assert.deepStrictEqual(legacyMigrated.inventory,[]);
assert.strictEqual(legacyMigrated.catalogs[0].name,'Arroz Integral');
assert.strictEqual(legacyMigrated.lists[0].items[0].mainItemId,'cat-001');

const bad=JSON.parse(JSON.stringify(original));
bad.inventory[0].mainItemId='missing-catalog';
assert.notStrictEqual(api.validate(bad),null,'estoque órfão deve ser rejeitado');

console.log('V2.3.0 data preservation tests: OK');
