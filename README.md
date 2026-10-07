# Minha Lista de Supermercado — V2.3.13

PWA de lista de supermercado com funcionamento **local-first e offline**. Os dados pessoais do uso normal ficam no IndexedDB do dispositivo. O compartilhamento por código é opcional e só envia dados quando o usuário solicita explicitamente.

## Arquitetura atual

- HTML, CSS e JavaScript puro.
- IndexedDB `MinhaListaDB`, schema físico V6.
- Service Worker + Web App Manifest.
- Sem login, Firebase, Firestore, Supabase ou Analytics.
- O núcleo funciona sem servidor.
- O compartilhamento por código usa, quando solicitado, um Cloudflare Worker/KV temporário.
- Migrações do banco são incrementais e não apagam stores nem dados existentes.

### Stores

`catalogs`, `lists`, `history`, `wishlist`, `trash`, `settings`, `referenceProducts`, `referenceMarkets` e `inventory`.

A chave antiga `lista_supermercado_v1` continua contemplada pela migração legada.

## Responsabilidades dos módulos

- `app.js`: núcleo, CRUD principal, mercado da lista, histórico e inicialização da aplicação.
- `db-migrations-v230.js`: somente contrato/migrações do IndexedDB; não manipula interface.
- `db-open-bridge-v230.js`: abertura compatível do banco e normalizações legadas.
- `inventory.js`: estoque e lotes.
- `backup-v230.js`: backup/importação, formato atual 2, schema 6.
- `share-config.js`: fluxo oficial de compartilhamento por código.
- `share-optimized-v230.js` e `enhancements.js`: compatibilidade com fluxos antigos.
- `reference-market-refresh.js`: conferência real do banco de referência no IndexedDB.
- `reference-product-expansion-v230-5.js`: expansão idempotente do catálogo de referência até o alvo atual.
- `v3-shell.js`, `v3-icons.js`, `v3-icon-force.js`: camada visual V3.
- `v3-compact-controls.js`: campos de pesquisa compactos e responsivos, preservando os listeners dos inputs originais.
- `initial-loading.js`: mantém a interface oculta até núcleo, UI e banco de referência terminarem a preparação.
- `list-market-v230.js`: entrada/bootstrap do runtime V2.3.x; o mercado da lista é tratado nativamente em `app.js`.
- `version-v230.js`: sincronização da versão visível.

## Mercado da lista

O mercado pertence à **lista**, não ao item.

- Novas edições gravam `list.marketName`.
- Novos registros de preço usam o mercado da lista.
- Campos `item.marketName` antigos continuam preservados para compatibilidade e para não destruir backups/dados históricos.
- A interface não solicita mercado por item.
- Duplicação e “comprar novamente” mantêm o mercado da lista.

## Histórico de preços

A visualização consolida o histórico por **produto + mercado** e mostra somente o registro mais recente de cada combinação. Registros antigos continuam armazenados; a regra é de exibição, não de exclusão.

## Banco de referência e carregamento

A aplicação faz uma verificação real do IndexedDB em cada inicialização. Não depende mais de um marcador de `localStorage` para considerar o banco pronto.

A tela inicial permanece em “carregando...” até:

1. o núcleo carregar os dados;
2. a camada visual V3 ser instalada;
3. os controles de pesquisa serem preparados;
4. o banco de referência ser conferido/expandido.

Existe um limite de segurança de espera para evitar uma tela bloqueada permanentemente em caso de erro inesperado.

## Pesquisa responsiva

Os campos de pesquisa usam uma área visual compacta, com largura responsiva normal e crescimento **vertical** de até duas linhas. Depois do limite, o próprio campo rola verticalmente. O input original permanece no DOM e continua recebendo os eventos usados pelo núcleo.

Abrangência atual: listas, itens cadastrados, lista de desejos, estoque, histórico, pesquisas do banco offline e pesquisa dentro da lista.

## Compartilhamento e privacidade

O uso normal do aplicativo não envia listas, estoque ou histórico para um servidor.

Ao escolher **Compartilhar lista**:

- somente a lista selecionada e os catálogos necessários são enviados;
- estoque/inventário é excluído;
- o Worker valida limites e estrutura do payload;
- o código possui 12 caracteres;
- o compartilhamento expira em 7 dias no KV.

O serviço atual é `https://minha-lista.suportebakura.workers.dev`.

## Service Worker / PWA

Cache atual: `minha-lista-v2-3-13`.

O cache inclui o núcleo, módulos V3, backup, compartilhamento, banco de referência, manifest e ícones necessários para o funcionamento offline após a instalação.

## Validação

Os workflows cobrem:

- sintaxe dos módulos críticos;
- migrações V1 → V6;
- preservação de dados;
- integridade do banco;
- regressões de segurança;
- versão visível;
- contrato da UI V3 e pesquisas;
- compartilhamento e Worker;
- auditoria de bootstrap/runtime.

A aprovação dos testes de fonte/CI não substitui teste E2E em Chrome/Android real. Alterações visuais e comportamento específico de PWA instalada devem ser confirmados também em navegador/dispositivo real.

## Próximas etapas

Depois da estabilização V2.3.13, os itens não críticos do roadmap continuam sendo tratados por prioridade: melhorias de acessibilidade/responsividade, comentários técnicos, migração gradual para TypeScript, evolução visual V3 e novas funcionalidades.
