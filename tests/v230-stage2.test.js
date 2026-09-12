const fs = require('fs');
const assert = require('assert');

const read = (path) => fs.readFileSync(path, 'utf8');
const sw = read('sw.js');
const share = read('share-optimized-v230.js');
const legacyShare = read('enhancements.js');

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
  /format:\s*['"]shared-list-v3-compact['"]/.test(share) &&
    share.includes('delete copy.inventory') &&
    share.includes('delete copy.stock'),
  'V3 sharing must exclude inventory/stock'
);
assert(
  share.includes('shared-list-v2') &&
    share.includes('shared-list-v3') &&
    share.includes('shared-list-v3-compact'),
  'V2/V3 import compatibility must remain'
);
assert(
  share.includes('history.replaceState'),
  'share cancel/import URL handling must avoid forced navigation'
);
assert(
  share.includes('__mlShareOptimizedLoaded = true'),
  'optimized sharing module must be the authoritative implementation'
);
assert(
  legacyShare.includes('__mlShareLegacyWaiting') && !legacyShare.includes('shareListBtn'),
  'legacy sharing handler must remain disabled to avoid duplicate event handlers'
);
