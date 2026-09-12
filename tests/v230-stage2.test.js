const fs = require('fs');
const assert = require('assert');

const read = (path) => fs.readFileSync(path, 'utf8');
const sw = read('sw.js');
const shareConfig = read('share-config.js');
const shareCompat = read('share-optimized-v230.js');
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
  shareConfig.includes("format: 'shared-list-v3-compact'") &&
    shareConfig.includes('delete copy.inventory') &&
    shareConfig.includes('delete copy.stock'),
  'V3 sharing must exclude inventory/stock'
);
assert(
  shareConfig.includes('shared-list-v2') &&
    shareConfig.includes('shared-list-v3') &&
    shareConfig.includes('shared-list-v3-compact'),
  'V2/V3 import compatibility must remain'
);
assert(
  shareConfig.includes('history.replaceState'),
  'share cancel/import URL handling must avoid forced navigation'
);
assert(
  shareConfig.includes('id="mlShareCode"') &&
    shareConfig.includes('maxlength="12"') &&
    shareConfig.includes('data-import'),
  'shared-list import must use the 12-character code UI'
);
assert(
  shareCompat.includes('__mlShareOptimizedLegacyDisabled = true') &&
    shareCompat.includes('sharedInput') &&
    shareCompat.includes('sharedImportBtn') &&
    shareCompat.includes('shareListBtn') &&
    shareCompat.includes('stopImmediatePropagation'),
  'legacy file import must be replaced by the code-sharing flow'
);
assert(
  !shareCompat.includes('type="file"') && !shareCompat.includes('accept="application/json,.json"'),
  'compatibility layer must not create or request JSON files'
);
assert(
  legacyShare.includes('__mlShareLegacyWaiting') && !legacyShare.includes('shareListBtn'),
  'legacy sharing handler must remain disabled to avoid duplicate event handlers'
);
