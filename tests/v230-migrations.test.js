const fs=require('fs');
const assert=require('assert');
const migration=fs.readFileSync('db-migrations-v230.js','utf8');
const app=fs.readFileSync('app.js','utf8');
const expected={1:['catalogs','lists','history','settings'],2:['wishlist'],3:['trash'],4:['referenceProducts','referenceMarkets'],5:[],6:['inventory']};
for(const [version,stores] of Object.entries(expected)){
  assert(migration.includes(`${version}:Object.freeze([${stores.map(s=>`'${s}'`).join(',')}])`),`Contrato de migração V${version} ausente ou divergente no módulo`);
  assert(app.includes(`${version}:[${stores.map(s=>`'${s}'`).join(',')}]`),`Fallback de migração V${version} ausente ou divergente no app.js`);
}
assert(migration.includes("const DB_NAME='MinhaListaDB',LATEST=6"));
assert(app.includes("const DB_NAME='MinhaListaDB', DB_VERSION=6"));
assert(migration.includes('function migrate(db,oldVersion,newVersion=LATEST)'));
assert(migration.includes('function plan(oldVersion,newVersion=LATEST)'));
assert(migration.includes("window.__mlDbMigrationsV230={DB_NAME,LATEST,MIGRATIONS,keyPath,ensureStore,migrate,plan}"));
console.log('V2.3.0 migration contract checks passed.');
