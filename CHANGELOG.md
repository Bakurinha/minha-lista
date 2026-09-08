\# 🛒 Minha Lista de Supermercado — V2.2



\## ✨ Novidades da V2.2



A V2.2 consolida a estrutura do aplicativo, melhora a experiência no celular e reforça a segurança e integridade dos dados.



\### 📦 Itens Cadastrados



A antiga "Lista Principal" foi substituída por \*\*Itens Cadastrados\*\*, funcionando como catálogo mestre de produtos.



Agora cada produto pode possuir:



\* Nome

\* Marca

\* Unidade de medida

\* Categoria

\* Observações



Produtos com o mesmo nome podem coexistir quando possuem marcas ou unidades diferentes.



\---



\### 📝 Listas de compras



As listas agora possuem:



\* Nome

\* Data

\* Tipo de compra

\* Observações

\* Itens

\* Estado ativo/arquivado/lixeira



Tipos de compra:



\* 🏪 Compra local

\* 🌐 Compra virtual



Também foram adicionadas funções para:



\* Criar

\* Editar

\* Abrir

\* Duplicar

\* Arquivar

\* Restaurar

\* Excluir

\* Excluir permanentemente

\* Pesquisar



\---



\### 📁 Listas arquivadas



Listas antigas podem ser arquivadas sem serem apagadas.



É possível:



\* Visualizar listas arquivadas

\* Restaurar

\* Comprar novamente



A restauração de uma lista arquivada foi separada corretamente da restauração da lixeira.



\---



\### 🗑️ Lixeira



Listas e produtos excluídos podem ser enviados para a lixeira.



É possível:



\* Restaurar

\* Excluir permanentemente

\* Esvaziar a lixeira



Os dados da lista são preservados durante a exclusão, incluindo produtos, quantidades, valores, mercados, observações e estados de compra.



\---



\### ↩️ Desfazer exclusões



As exclusões agora possuem ações independentes de \*\*Desfazer\*\*.



Cada exclusão registra sua própria ação, evitando que uma exclusão posterior execute acidentalmente o desfazimento de uma operação anterior.



\---



\### 🛒 Comprar novamente



Foi adicionada a função \*\*Comprar novamente\*\*.



Ela permite utilizar uma lista anterior ou arquivada como base para criar uma nova lista, sem modificar a original.



Os produtos podem ser reutilizados e as quantidades podem ser mantidas quando disponíveis.



\---



\### 📋 Copiar produtos entre listas



Agora é possível copiar produtos de uma lista para outra.



A lista original permanece intacta e os itens copiados recebem novos identificadores internos.



\---



\### 📋 Duplicação configurável



Ao duplicar uma lista, é possível escolher quais informações serão copiadas:



\* Produtos

\* Quantidades

\* Valores

\* Mercados

\* Observações

\* Itens comprados



Por padrão, os itens comprados não são marcados como comprados na nova lista.



\---



\### ⭐ Lista de desejos



Foi adicionada uma lista de desejos para produtos que ainda não serão comprados imediatamente.



Permite:



\* Adicionar

\* Editar

\* Excluir

\* Pesquisar

\* Definir preço desejado

\* Adicionar observações

\* Informar marca

\* Informar unidade

\* Adicionar o produto a uma lista de compras



Adicionar um desejo a uma lista não remove automaticamente o desejo original.



\---



\### 💰 Histórico de preços



O histórico de preços foi ampliado e passou a preservar registros antigos.



Cada alteração relevante cria um novo registro em vez de substituir o anterior.



É possível consultar:



\* Produto

\* Marca

\* Mercado

\* Data

\* Valor

\* Menor preço

\* Maior preço

\* Preço mais recente



O histórico foi estruturado pensando em futuras funções de comparação de preços.



\---



\### 🔎 Pesquisa e filtros



Foram adicionadas pesquisas em diferentes áreas:



\*\*Catálogo\*\*



\* Nome

\* Marca

\* Categoria



\*\*Listas\*\*



\* Nome

\* Marca

\* Mercado



\*\*Histórico\*\*



\* Produto

\* Marca

\* Mercado



Dentro das listas também existem filtros para:



\* Todos

\* Pendentes

\* Comprados

\* Categoria

\* Mercado

\* Preço

\* Data



Além disso, foi adicionada ordenação por:



\* Ordem original

\* Pendentes primeiro

\* Comprados primeiro

\* Nome A-Z

\* Preço

\* Data



\---



\### 💵 Valores e quantidades



Melhorias no tratamento de valores:



\* Suporte a `18,90`

\* Suporte a `18.90`

\* Exibição em formato brasileiro: `R$ 18,90`

\* Validação de valores inválidos

\* Bloqueio de valores negativos



As quantidades também passaram a possuir validação para evitar:



\* `NaN`

\* `Infinity`

\* Valores absurdamente grandes

\* Valores inválidos



O cálculo do total considera quantidade quando informada:



`quantidade × valor`



\---



\### 📊 Resumo da lista



Cada lista apresenta:



\* Total de itens

\* Itens comprados

\* Itens pendentes

\* Valor total



Os subtotais dos itens também podem ser calculados quando existe quantidade.



\---



\### 💾 Backup e restauração



O sistema agora possui backup estruturado em JSON.



O backup inclui:



\* Catálogo

\* Listas

\* Histórico

\* Lista de desejos

\* Lixeira

\* Configurações

\* Informações necessárias para compatibilidade futura



O arquivo possui controle de versão próprio:



\* `backupFormatVersion`

\* `schemaVersion`

\* `exportedAt`



A importação realiza validações antes de substituir os dados atuais.



\---



\### 🔄 Migração da V1



A antiga chave:



`lista\\\_supermercado\\\_v1`



continua sendo reconhecida.



A migração:



\* Preserva os itens existentes

\* Mantém o estado comprado/não comprado

\* Cria os produtos no catálogo

\* Cria uma lista equivalente

\* Evita duplicações

\* Só remove os dados antigos após uma migração concluída com sucesso



\---



\### 🗄️ IndexedDB



O armazenamento principal foi consolidado no \*\*IndexedDB\*\*.



Banco:



`MinhaListaDB`



Stores principais:



\* `catalogs`

\* `lists`

\* `history`

\* `wishlist`

\* `trash`

\* `settings`



Operações que envolvem múltiplos stores utilizam transações apropriadas para reduzir o risco de inconsistência ou perda de dados.



\---



\### 🔐 Integridade dos dados



A V2.2 recebeu diversas melhorias para evitar referências quebradas.



Um produto não pode ser removido do catálogo enquanto estiver sendo utilizado por:



\* Lista ativa

\* Lista arquivada

\* Lista na lixeira



As operações críticas também possuem tratamento de erros do IndexedDB.



Em caso de falha, a interface não deve informar que uma operação foi concluída quando ela não foi realmente gravada.



\---



\### 🔒 Privacidade



A V2.2 continua sendo uma aplicação local.



Nesta versão:



\* Não existe login

\* Não existe Firebase

\* Não existe sincronização em nuvem

\* Não existe banco de usuários

\* Não existe Analytics

\* Não existe coleta de preços

\* Não existe API externa

\* Não existe envio automático das listas para servidores



Os dados permanecem armazenados localmente no dispositivo.



A primeira inicialização apresenta informações sobre o armazenamento local e a política de privacidade da versão atual.



\---



\### 📤 Compartilhamento de listas



Foi implementado um formato versionado de compartilhamento:



`shared-list-v1`



É possível:



\* Compartilhar uma lista

\* Exportar a lista para arquivo

\* Importar uma lista compartilhada

\* Validar o conteúdo importado

\* Criar novos identificadores internos

\* Resolver produtos já existentes

\* Criar produtos ausentes no catálogo



A importação trata o arquivo como \*\*dados\*\*, nunca como código executável.



\---



\### 🛡️ Segurança



Foram reforçadas as proteções contra conteúdo malicioso.



Informações fornecidas pelo usuário são tratadas como texto antes de serem exibidas.



Isso inclui:



\* Produtos

\* Marcas

\* Mercados

\* Observações

\* Nomes de listas



Também foram realizadas melhorias para evitar XSS durante importações e compartilhamentos.



\---



\### 📱 Experiência mobile



A interface foi aprimorada para uso em smartphones:



\* Botões maiores

\* Formulários mais compactos

\* Melhor espaçamento

\* Melhor uso do teclado

\* Navegação simplificada

\* Feedback visual

\* Melhor organização dos cards

\* Suporte adequado ao zoom



Também foram adicionadas melhorias de acessibilidade, incluindo `aria-label` em controles de ícone e associação adequada entre campos e seus rótulos.



\---



\### 🎨 Temas



Agora existem três opções:



\* Sistema

\* Claro

\* Escuro



A preferência é armazenada localmente e aplicada imediatamente.



\---



\### ⚙️ Configurações



A nova área de configurações reúne:



\*\*Aparência\*\*



\* Tema



\*\*Dados\*\*



\* Exportar backup

\* Importar backup



\*\*Organização\*\*



\* Listas arquivadas

\* Lixeira



\*\*Privacidade\*\*



\* Informações sobre armazenamento local

\* Informações sobre envio de dados



\*\*Dados avançados\*\*



\* Limpar histórico

\* Apagar todos os dados



\---



\### 📱 PWA



A estrutura PWA foi atualizada:



\* Manifest revisado

\* Ícones 192×192 e 512×512

\* Ícones preparados para instalação

\* Suporte a `maskable`

\* Service Worker atualizado

\* Cache V2.2

\* Funcionamento offline

\* `skipWaiting()`

\* `clients.claim()`



A estratégia de cache também foi revisada para evitar retornar `index.html` indevidamente quando outros recursos falharem.



\---



\## 🏗️ Preparação para versões futuras



A arquitetura da V2.2 foi organizada pensando em futuras versões, mas \*\*nenhuma dessas funções está ativa atualmente\*\*.



Possíveis evoluções:



\* Conta de usuário

\* Google Login

\* Firebase Authentication

\* Firestore

\* Sincronização entre dispositivos

\* Backup automático

\* Compartilhamento avançado

\* Coleta de preços

\* Comparação de preços

\* EAN/Barcode

\* APIs de mercados

\* Radar de Ofertas

\* Versão Premium

\* Anúncios na versão gratuita



Esses recursos permanecem planejados para versões futuras e não fazem parte da V2.2.



\---



\## 🧪 Verificações realizadas



A versão final passou por verificações de:



\* Sintaxe JavaScript

\* Sintaxe do Service Worker

\* Validação do Manifest

\* Referências dos ícones

\* Integridade do ZIP

\* Estrutura dos arquivos

\* Ausência de recursos externos desnecessários

\* Ausência de Firebase

\* Ausência de Analytics

\* Ausência de APIs externas

\* Ausência de coleta de preços

\* Ausência de mecanismos de envio automático de dados

\* Validação das operações IndexedDB

\* Validação das principais regras de integridade



> Observação: testes completos de interação em navegador/Android real ainda devem ser realizados após a publicação no GitHub Pages.



\---



\## 📌 V2.2 em resumo



A V2.2 transforma o aplicativo de uma simples lista de supermercado em uma estrutura mais completa de \*\*gerenciamento local de compras\*\*, adicionando catálogo de produtos, múltiplas listas, histórico de preços, desejos, arquivamento, lixeira, compartilhamento, backup e uma arquitetura preparada para futuras expansões.



O foco principal desta versão foi:



\*\*Integridade dos dados → Privacidade → Estabilidade → Experiência mobile → Preparação para o futuro.\*\*

