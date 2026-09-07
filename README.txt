MINHA LISTA DE SUPERMERCADO — V2.0

Arquivos:
- index.html
- manifest.json
- sw.js
- icon-192.png
- icon-512.png

INSTALAÇÃO NO GITHUB PAGES
1. Abra o repositório que já usa para a PWA.
2. Substitua os arquivos da versão anterior por estes arquivos.
3. Faça o commit.
4. Abra o endereço HTTPS do GitHub Pages e atualize.
5. Se a PWA instalada ainda mostrar a versão antiga, feche-a completamente e abra novamente. Em último caso, remova a PWA da tela inicial e instale novamente.

DADOS
A V2 usa IndexedDB (MinhaListaDB). A antiga chave localStorage "lista_supermercado_v1" é migrada automaticamente para uma "Lista antiga" quando encontrada.

BACKUP
Use Configurações > Exportar backup regularmente. O backup é JSON e fica no dispositivo após o download.
