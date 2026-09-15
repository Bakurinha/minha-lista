# Minha Lista de Supermercado — V2.3.12

Documento técnico interno. O aplicativo permanece PWA, local e offline, sem redesign visual nesta versão.

## Base

- HTML + CSS + JavaScript puro.
- IndexedDB v6.
- Service Worker + Manifest.
- Sem login, servidor, nuvem, Firebase, Firestore, Analytics, Supabase, anúncios, pagamentos ou API externa de preços.
- Dados pessoais permanecem no dispositivo.

## V2.3.12 — arquitetura e responsabilidades

A V2.3.12 mantém a base V2.3 e reúne melhorias de confiabilidade, catálogo de referência offline, migrações explícitas, backup, compartilhamento, integridade e interface V3.

### Módulos principais

- `app.js`: núcleo da aplicação, IndexedDB e fluxo principal.
- `inventory.js`: CRUD do estoque, múltiplos lotes, validade, quantidade mínima e ajustes rápidos.
- `backup-v230.js`: exportação/importação dos dados pessoais e compatibilidade com backups anteriores.
- `db-migrations-v230.js`: contrato das versões do IndexedDB de V1 a V6.
- `db-integrity-v230.js`: diagnóstico da estrutura e dos vínculos do banco, sem reparo automático.
- `enhancements.js`: compartilhamento, importação compartilhada e integrações da interface.
- `list-enhancements.js`: extensões do formulário de itens da lista.
- `reference-market-refresh.js`: verificação e atualização idempotente do catálogo de mercados.
- `reference-product-expansion-v230-5.js`: expansão idempotente do catálogo de produtos de referência até o alvo atual de 20.000 registros.
- `version-v230.js`: atualização da versão visível no aplicativo.
- `sw.js`: cache PWA e disponibilidade offline dos módulos necessários.

## Modelo de estoque

Cada registro de estoque representa um lote independente:

`id, catalogId/mainItemId, quantity, packageQuantity, packageUnit, expiryDate, entryDate, minQuantity, marketName, location, notes, createdAt, updatedAt`

Regras importantes:

- `quantity` continua representando a quantidade de embalagens/lotes conforme o modelo do estoque.
- `packageQuantity` e `packageUnit` são opcionais e não reutilizam o campo `unit` do produto.
- Um mesmo produto pode possuir vários lotes.
- A validade é informativa: vencido, vence hoje ou vence em X dias.
- Lotes não são apagados automaticamente por validade.
- O filtro de estoque considera validade e quantidade mínima.

## Banco de referência offline

`referenceProducts` e `referenceMarkets` são bancos locais de referência, separados dos dados pessoais.

- Produtos de referência não fazem parte do backup pessoal.
- O catálogo de produtos possui expansão incremental e idempotente.
- O alvo atual da expansão é **20.000 produtos**.
- A expansão adiciona somente registros que ainda não existem e preserva os registros já armazenados.
- O catálogo de mercados é mantido com **120 mercados de referência**.
- A quantidade efetivamente disponível depende do estado do IndexedDB no dispositivo e da conclusão da preparação local.

## Migrações IndexedDB

Contrato atual:

- V1: `catalogs`, `lists`, `history`, `settings`.
- V2: `wishlist`.
- V3: `trash`.
- V4: `referenceProducts`, `referenceMarkets`.
- V5: nenhuma nova store.
- V6: `inventory`.

A migração deve preservar os dados pessoais existentes. O núcleo e o módulo `db-migrations-v230.js` mantêm compatibilidade com estruturas anteriores sem operações destrutivas desnecessárias.

## Backup

- Formato atual: `backupFormatVersion: 2`.
- Schema atual: IndexedDB v6.
- Inclui os dados pessoais atuais, incluindo `inventory`.
- Aceita backups anteriores compatíveis.
- Limite de segurança do backup: 20 MB.
- Catálogos e dados de referência internos não são misturados indevidamente aos dados pessoais.

## Compartilhamento

- O formato atual aceita payloads legados compatíveis.
- Apenas a lista e os catálogos necessários são compartilhados.
- Estoque/inventário não é incluído no compartilhamento.
- O modo local usa serialização compacta apropriada ao fluxo offline.
- O modo remoto opcional utiliza o Worker/KV existente quando configurado.
- Limites e validações de quantidade, datas e strings são aplicados antes do armazenamento.

## Segurança e privacidade

- Conteúdo inserido pelo usuário deve ser escapado antes de entrar em HTML.
- Não usar mecanismos de rastreamento ou envio externo de dados pessoais.
- O Worker, quando utilizado, aplica as validações e restrições previstas pelo aplicativo.
- Dados de estoque não são persistidos em payloads compartilhados.
- O diagnóstico de integridade não executa reparos automáticos, reduzindo o risco de perda silenciosa de dados.

## Service Worker / PWA

O cache atual é `minha-lista-v2-3-12` e inclui os módulos necessários para operação offline, incluindo os módulos de catálogo de referência e interface V3. O Service Worker também mantém disponíveis módulos usados durante a navegação e preparação local.

## Estado conhecido / pendências

- O **flash visual de ícones/renderização** durante a inicialização e algumas operações continua pendente; tentativas anteriores não devem ser consideradas uma correção definitiva.
- A **inicialização da aplicação antes da conclusão do banco de referência** está registrada no backlog para investigação: a interface não deve expor estados intermediários do catálogo durante o carregamento.
- A centralização do mercado na lista e a exibição de somente a última edição no histórico permanecem como etapas de backlog.
- Testes E2E completos em Chrome/Android real não são declarados como aprovados neste ambiente.

## Compatibilidade

- Migração `lista_supermercado_v1` mantida.
- Backups anteriores compatíveis continuam sendo normalizados antes da importação.
- IDs existentes são preservados quando válidos.
- Produtos antigos sem EAN permanecem válidos.
- O campo `expiryDate` da lista é independente do estoque.

## Auditoria

As verificações automatizadas existentes cobrem fundação, migração, preservação de dados, segurança/regressão, integridade, versão, compatibilidade e partes da interface.

**Limitação:** a validação de comportamento visual e E2E completo em navegador real continua dependente de teste no dispositivo/navegador do usuário.
