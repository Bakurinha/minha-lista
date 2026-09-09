# Minha Lista de Supermercado — V2.3.0

PWA pessoal de supermercado, local, offline e privacy-first.

## Base
- HTML + CSS + JavaScript puro.
- IndexedDB local, com módulo de estoque em schema V6.
- Service Worker + Manifest.
- Sem login, Analytics, anúncios, Firebase, Firestore, Supabase ou API externa de preços.
- Dados pessoais permanecem no dispositivo.
- Compartilhamento remoto continua opcional e desativado enquanto `MINHA_LISTA_SHARE_API` estiver vazio.

## V2.3.0
- Controle de estoque por registros/lotes.
- Quantidade de embalagens e quantidade por embalagem.
- Unidade da embalagem.
- Validade e data de entrada.
- Estoque mínimo e alerta de estoque baixo.
- Local de armazenamento, mercado e observações.
- Filtros de vencidos, vencendo e estoque baixo.
- Validade e apresentação adicionadas aos itens de lista sem quebrar dados antigos.
- Navegação interna preparada para o botão voltar do Android.
- Banco de referência offline ampliado para mais de 1.000 combinações de produtos e mais de 50 mercados.
- Banco de referência continua separado dos dados pessoais.
- Cache do Service Worker atualizado para V2.3.0.

## Compatibilidade
- Migração legada `lista_supermercado_v1` continua preservada.
- Dados pessoais existentes não são apagados pela criação do store `inventory`.
- Campos novos de itens são opcionais e retrocompatíveis.
- Backups existentes continuam contendo os campos antigos; os novos campos de itens são preservados quando presentes.
- Compartilhamento V2 continua compatível; estoque não é incluído no payload de compartilhamento.

## Privacidade
O estoque, listas, preços e observações são armazenados localmente. O banco de referência é somente material de consulta e não faz parte dos dados pessoais. IndexedDB é armazenamento local, não criptografia.

## Banco offline
`referenceProducts` e `referenceMarkets` são bancos de referência locais. A versão de referência é controlada separadamente e sua atualização não deve apagar listas, histórico, desejos, lixeira, configurações ou estoque.

## Auditoria e CI
A CI valida sintaxe de todos os módulos JavaScript, testes do serviço de compartilhamento e integridade da V2.3.0, incluindo o store de estoque, validade, embalagem, navegação e cache do PWA.

Limitação: testes E2E completos em navegador físico não são declarados como aprovados apenas pela CI; a validação final de interação deve ser feita no Android/Chrome após a publicação.
