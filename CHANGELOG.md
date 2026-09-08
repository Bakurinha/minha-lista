# CHANGELOG — Minha Lista de Supermercado

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
