const fs = require('fs');
const assert = require('assert');

const read = (path) => fs.readFileSync(path, 'utf8');
const sw = read('sw.js');
const share = read('enhancements.js');

assert(
  /minha-lista-v2-3-\d+/.test(sw) &&
    sw.includes('./backup-v230.js') &&
    sw.includes('./list-enhancements.js'),
  'Stage 2 assets must be cached'
);
assert(
  sw.includes('./share-config.js') &&
    sw.includes('./enhancements.js') &&
    sw.includes('./inventory.js') &&
    sw.includes('./reference-market-refresh.js'),
  'existing Stage 2 scripts must remain injected'
);
assert(
  /format:\s*['"]shared-list-v3['"]/.test(share) &&
    share.includes('delete x.inventory') &&
    share.includes('delete x.stock'),
  'V3 sharing must exclude inventory/stock'
);
assert(
  share.includes('shared-list-v2') && share.includes('shared-list-v3'),
  'V2/V3 import compatibility must remain'
);
assert(
  share.includes('history.replaceState'),
  'share cancel/import URL handling must avoid forced navigation'
);
