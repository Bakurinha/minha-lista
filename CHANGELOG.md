# CHANGELOG — Minha Lista de Supermercado

## V2.3.10 — 14/09/2026

### Catálogo de referência offline

- Corrigido o acionamento da segunda expansão do catálogo para não depender da conclusão da atualização dos mercados.
- A segunda expansão mantém o alvo de `1000` novos registros e evita duplicidade por nome, marca e unidade.
- Service Worker atualizado para `minha-lista-v2-3-10` para forçar a atualização dos módulos no PWA.

### Versionamento

- Versão do aplicativo alinhada em `2.3.10`.
- `package.json`, `package-lock.json` e manifest sincronizados.
- Versão visual atualizada para `v2.3.10`.

## V2.3.9 — 14/09/2026

### Versionamento e manutenção

- Versão do aplicativo alinhada em `2.3.9`.
- `package.json` e `package-lock.json` mantidos sincronizados.
- Manifest, versão visual e Service Worker sincronizados com a versão do aplicativo.
- Cache do Service Worker alinhado para `minha-lista-v2-3-9`.
- Scripts existentes de sincronização de versão preservados como mecanismo oficial de versionamento.

### Etapas P0 recentes

- Ajustes responsivos das áreas de pesquisa para telas móveis.
- Edição de itens dentro de listas corrigida sem fechamento indevido da lista.
- Tela de carregamento inicial adicionada para reduzir o flash visual durante a inicialização.
- Primeira tela de privacidade permanece pendente para revisão futura.

## V2.3.0 — 11/09/2026

### Confiabilidade e dados

- Corrigida a navegação dentro da lista e o comportamento de edição/cancelamento.
- Importação e migração de JSON legado reforçadas com validação automatizada.
- Adicionadas verificações somente leitura de integridade do IndexedDB.
- Adicionado teste completo de preservação de listas, catálogos, histórico, desejos, lixeira, configurações e estoque.
- Migrações do IndexedDB formalizadas da V1 à V6 sem operações destrutivas.
- Auditoria de segurança/regressão mantida no CI.

### Organização técnica

- Código formatado e padronizado com Prettier.
- Comentários técnicos adicionados aos pontos críticos de migração, integridade, abertura do banco e compartilhamento.
- Contratos TypeScript adicionados de forma incremental, sem reescrever o JavaScript existente.
- TypeScript passa a ser validado no CI sem gerar arquivos para produção.

### Interface V3

- Limite responsivo do conteúdo consolidado para telas grandes.
- Novo shell visual reutilizável com menu hambúrguer.
- Navegação lateral reutiliza os botões existentes e preserva a lógica do aplicativo.
- Ícones vetoriais padronizados para a navegação.
- Foco visível, Escape para fechar o menu e suporte a movimento reduzido.

### Compartilhamento

- Adicionado formato local compacto com GZIP para reduzir o tamanho dos links.
- Estoque permanece fora de qualquer payload compartilhado.
- Compartilhamento remoto continua compatível com o Worker atual.
- Formatos legados continuam sendo aceitos pelo fluxo existente.

### Versionamento

- `package.json` tornou-se a fonte de versão do aplicativo.
- Comandos `version:sync`, `version:patch`, `version:minor` e `version:major` adicionados.
- Service Worker, versão visual e manifest são sincronizados automaticamente.
- Versão do aplicativo permanece separada da versão do IndexedDB.

### Offline

- Service Worker atualizado para incluir o shell V3 e o compartilhamento compacto.
- Cache versionado conforme a versão do aplicativo.

### Auditoria

- Suítes V2.2.3, fundação V2.3.0, Stage 2, preservação, migração, integridade, segurança, versão, TypeScript, UI V3 e compartilhamento são executadas pelo CI.
- E2E completo em navegador real continua explicitamente não declarado como aprovado neste ambiente.

## V2.2.2 — 08/09/2026

### Corrigido

- Pesquisa dentro da lista ajustada para preservar o campo de entrada durante a digitação.
- Handlers de itens da lista reorganizados para evitar reconstruções e reanexações desnecessárias.
- Layout responsivo dos grupos de controles corrigido para impedir que botões ultrapassem o container em telas maiores.
- Lixeira organizada em seções independentes para listas excluídas e itens excluídos.
- Compartilhamento reforçado com múltiplos fallbacks locais.

### Cadastro e identificação

- Formulário completo na criação de produtos.
- Marca opcional.
- Unidade padrão `un`.
- EAN opcional com validação.
- ID interno único independente de nome, marca, unidade e EAN.
- Snapshots de produto mantidos nos itens das listas compartilhadas.

### Offline

- Estrutura de EAN adicionada aos produtos de referência.
- Banco offline de produtos e mercados permanece separado dos dados pessoais.
- Cache do Service Worker atualizado para V2.2.2.

### Privacidade

- Mantida a arquitetura local/offline.
- Nenhum servidor, login, sincronização em nuvem, Analytics, Firebase, Firestore, Supabase, anúncio, pagamento ou API externa de preços foi adicionado.

### Auditoria

- Sintaxe JavaScript validada com Node.
- Estrutura da aplicação, IndexedDB, EAN, lixeira, compartilhamento e layout revisados.
- E2E em navegador real não é declarado como aprovado neste ambiente.
