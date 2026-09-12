# Minha Lista de Supermercado — V2.3.0

Documento técnico interno. O aplicativo permanece PWA, local e offline, sem redesign visual nesta versão.

## Base

- HTML + CSS + JavaScript puro.
- IndexedDB v6.
- Service Worker + Manifest.
- Sem login, servidor, nuvem, Firebase, Firestore, Analytics, Supabase, anúncios, pagamentos ou API externa de preços.
- Dados pessoais permanecem no dispositivo.

## V2.3.0 — arquitetura e responsabilidades

A V2.3.0 adiciona controle de estoque por lotes, expansão do banco de referência, migrações explícitas, backup atualizado, compartilhamento V3 e verificações de integridade.

### Módulos

- `app.js`: núcleo existente da aplicação e compatibilidade com o fluxo principal.
- `inventory.js`: CRUD do estoque, múltiplos lotes, validade, quantidade mínima e ajustes rápidos.
- `backup-v230.js`: exportação/importação dos dados pessoais e migração de backups V1/V2.
- `db-migrations-v230.js`: contrato documentado das versões do IndexedDB de V1 a V6.
- `db-integrity-v230.js`: diagnóstico da estrutura e dos vínculos do banco, sem reparo automático.
- `enhancements.js`: compartilhamento V3, importação compartilhada e integração com histórico/navegação.
- `list-enhancements.js`: extensão do formulário de itens da lista para validade e dados de embalagem.
- `reference-product-expansion-v230.js`: expansão idempotente do catálogo de referência.
- `reference-market-refresh.js`: seed/atualização idempotente do catálogo de mercados.
- `version-v230.js`: atualização da versão visível no rodapé sem alterar o núcleo.
- `sw.js`: cache PWA e injeção dos módulos necessários nas páginas navegadas.

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

## Banco de referência

`referenceProducts` e `referenceMarkets` são bancos locais de referência, separados dos dados pessoais.

- Produtos de referência são excluídos do backup pessoal.
- A expansão V2.3.0 é idempotente e usa marcador em `settings`.
- A expansão acrescenta até 1000 combinações novas de produtos, evitando duplicidade por nome, marca e unidade.
- O catálogo de mercados possui dezenas de nomes brasileiros, incluindo referências da Bahia/Salvador.

## Migrações IndexedDB

Contrato da V2.3.0:

- V1: `catalogs`, `lists`, `history`, `settings`.
- V2: `wishlist`.
- V3: `trash`.
- V4: `referenceProducts`, `referenceMarkets`.
- V5: nenhuma nova store.
- V6: `inventory`.

A migração deve preservar os dados pessoais existentes. O módulo `db-migrations-v230.js` mantém o contrato técnico separado para auditoria e testes; o núcleo legado continua contendo compatibilidade interna para não alterar o fluxo estável da aplicação sem necessidade.

## Backup

- Formato atual: `backupFormatVersion: 2`.
- Schema atual: IndexedDB v6.
- Inclui `inventory` e os demais dados pessoais.
- Aceita backups V1 e backups legados identificados como `version: "2.2"`.
- Limite de segurança do backup: 20 MB.
- Catálogos e dados de referência internos não são misturados aos dados pessoais.

## Compartilhamento

- Formato V3 aceita payloads V2/V3.
- Apenas a lista e os catálogos necessários são compartilhados.
- Estoque/inventário nunca é incluído no compartilhamento.
- O modo local usa serialização Base64URL.
- O modo remoto opcional usa Worker/KV com origem restrita ao aplicativo.
- TTL remoto: 7 dias.
- Limites e validações de quantidade, datas e strings são aplicados antes do armazenamento.

## Segurança e privacidade

- Conteúdo inserido pelo usuário deve ser escapado antes de entrar em HTML.
- Não usar `sendBeacon`, WebSocket, Firebase, Supabase ou SDK de rastreamento para enviar dados pessoais.
- O Worker aceita apenas a origem oficial do aplicativo e limita corpo, itens, catálogos e validade.
- Dados de estoque não são persistidos em payloads compartilhados.
- O diagnóstico de integridade não executa reparos automáticos, reduzindo o risco de perda silenciosa de dados.

## Service Worker / PWA

O cache é versionado como `minha-lista-v2-3-0` e inclui os módulos V2.3.0 necessários para operação offline. O Service Worker também injeta os módulos de compatibilidade/expansão durante a navegação.

## Compatibilidade

- Migração `lista_supermercado_v1` mantida.
- Backups anteriores compatíveis continuam sendo normalizados antes da importação.
- IDs existentes são preservados quando válidos.
- Produtos antigos sem EAN permanecem válidos.
- O campo `expiryDate` da lista é independente do estoque.

## Auditoria

A entrega V2.3.0 possui testes automatizados de fundação, Stage 2, preservação de dados, segurança/regressão, migração, integridade, versão e compatibilidade da validação V2.2.3.

Limitação: teste E2E completo em navegador real não é declarado como aprovado neste ambiente.
