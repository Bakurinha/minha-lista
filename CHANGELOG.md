# CHANGELOG

## [2.2.1] — 2026-09-08

### Adicionado

- Banco offline de produtos de referência em IndexedDB (`referenceProducts`).
- Banco offline de mercados de referência em IndexedDB (`referenceMarkets`).
- Seed versionado dos bancos de referência através de `REFERENCE_VERSION`.
- Busca offline de produtos por nome, marca, categoria e unidade.
- Inclusão de produtos do banco offline no catálogo pessoal.
- Autocomplete de mercados usando a base offline e mercados já utilizados.
- Suporte estrutural a EAN/código de barras para evolução futura, sem scanner ou API externa nesta versão.
- Snapshot dos dados do produto dentro dos itens das listas.
- Opções configuráveis em **Comprar novamente** para decidir o que será reaproveitado.
- Compatibilidade de normalização para backups de versões anteriores.
- Validação estrutural de backups antes da importação.

### Alterado

- Migração principal de dados mantida em IndexedDB.
- Versão do IndexedDB atualizada para **v5**.
- Catálogo pessoal passou a considerar **nome + marca + unidade** na identificação de produtos.
- Itens das listas passaram a preservar nome, marca, unidade e categoria do produto no momento da inclusão.
- Histórico de preços passou a preservar informações de identificação do produto e dados da compra.
- Observações das listas ampliadas para até **2.000 caracteres**.
- Banco de referência separado dos dados pessoais do usuário.
- Backup pessoal não inclui `referenceProducts` nem `referenceMarkets`.
- Limpeza dos dados pessoais não apaga os bancos de referência offline.
- Duplicação/“Comprar novamente” evita carregar automaticamente dados específicos de uma compra anterior.
- Interface do catálogo passou a oferecer acesso direto ao **✨ Banco offline**.
- Versão visual da aplicação atualizada para **v2.2.1**.
- Cache do Service Worker atualizado para a versão **v2.2.1**.

### Corrigido

- Corrigido o problema em que a pesquisa dentro de uma lista podia inverter a ordem dos caracteres digitados ou reposicionar o cursor.
- Corrigida a reconstrução desnecessária do modal durante a digitação da pesquisa de itens.
- Corrigida a restauração de listas arquivadas.
- Corrigido o mecanismo de desfazer exclusões de listas/itens.
- Corrigidas referências a produtos presentes em listas movidas para a lixeira.
- Corrigidos problemas de integridade em operações que alteram múltiplos stores do IndexedDB.
- Corrigida a persistência de snapshots de produtos em dados antigos.
- Corrigidos problemas de identificação de produtos que consideravam somente o nome.
- Corrigidos problemas de duplicação de listas com dados de compra antigos.
- Melhorada a validação de quantidade, preço, datas e estruturas importadas.
- Melhorado o tratamento de erros em operações assíncronas do IndexedDB.

### Segurança e privacidade

- Mantida a arquitetura **100% local/offline** para os dados do usuário.
- Nenhum Firebase, Firestore, Google Analytics, Supabase ou serviço equivalente foi adicionado.
- Nenhuma API externa de preços ou supermercado foi adicionada.
- Nenhum sistema de login, conta, sincronização em nuvem, publicidade ou pagamento foi adicionado.
- Nenhuma coleta automática de localização ou envio automático dos dados das listas foi implementado.
- Auditoria de rede deve considerar implementação real, não apenas ocorrências dessas palavras em textos explicativos de privacidade/documentação.
- O IndexedDB continua sendo armazenamento local e **não deve ser interpretado como criptografia**.

### Auditoria

Foram previstos/realizados testes estáticos para:

- sintaxe do `app.js`;
- sintaxe do `sw.js`;
- estrutura do `manifest.json`;
- referências dos ícones;
- dimensões dos ícones;
- IDs duplicados no HTML;
- stores do IndexedDB;
- separação dos bancos de referência;
- estrutura de backup;
- ausência de dependências externas na implementação;
- versão do cache do Service Worker.

**Limitação:** o teste E2E completo em navegador não pôde ser concluído de forma confiável no ambiente de desenvolvimento. Portanto, não é declarado como aprovado.
