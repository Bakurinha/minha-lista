# Minha Lista de Supermercado — V2.2.2 (interno)

Documento técnico interno da versão V2.2.2. O aplicativo permanece PWA, local e offline.

## Base
- HTML + CSS + JavaScript puro.
- IndexedDB v5.
- Service Worker + Manifest.
- Sem login, servidor, nuvem, Firebase, Firestore, Analytics, Supabase, anúncios, pagamentos ou API externa de preços.
- Dados pessoais permanecem no dispositivo.

## Alterações da V2.2.2
- Corrigido o fluxo de pesquisa dentro da lista para não reconstruir o campo de pesquisa durante a digitação; os resultados são atualizados sem substituir o input.
- Tratamento dos controles de itens da lista passou a usar delegação de eventos, evitando reanexação de handlers durante a pesquisa.
- Layout dos `.row` ajustado para quebra responsiva; campos e botões não devem sair do container em desktop/tablet.
- Lixeira separada visualmente em **Listas excluídas** e **Itens excluídos**, mantendo restauração, exclusão permanente e desfazer.
- Cadastro de produto agora abre formulário completo na criação, permitindo nome, marca opcional, unidade (padrão `un`), categoria, EAN opcional e observações.
- ID interno permanece independente de nome/marca/unidade/EAN e é gerado automaticamente.
- Adicionada estrutura opcional de EAN/código de barras aos produtos pessoais e produtos de referência, com validação de 8, 12, 13 ou 14 dígitos.
- Compartilhamento melhorado: tenta compartilhamento nativo de arquivo; quando indisponível, tenta compartilhamento de texto; depois usa área de transferência e, por último, arquivo JSON local.
- Lista compartilhada preserva snapshots de nome, marca, unidade e categoria dos itens.
- Banco de referência offline continua separado dos dados pessoais e excluído do backup pessoal.
- Versão do cache do Service Worker atualizada para V2.2.2.

## Compatibilidade
- Migração `lista_supermercado_v1` mantida.
- Backups anteriores compatíveis continuam sendo normalizados antes da importação.
- IDs existentes são preservados quando válidos.
- Produtos antigos sem EAN permanecem válidos.

## Banco offline
`referenceProducts` e `referenceMarkets` são bancos de referência locais. O seed é versionado e idempotente. A expansão diária do banco deve ocorrer de forma controlada, sem misturar dados pessoais com dados de referência.

## Compartilhamento
O aplicativo não possui servidor de compartilhamento. A lista é serializada localmente em JSON. A disponibilidade de `navigator.share` depende do navegador e do dispositivo.

## Auditoria
Executados nesta entrega:
- `node --check app.js`
- `node --check sw.js`
- verificação estrutural de versão, IndexedDB, referências offline, EAN, compartilhamento, lixeira e layout.

Limitação: teste E2E completo em navegador real não é declarado como aprovado neste ambiente.
