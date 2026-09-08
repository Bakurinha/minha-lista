# Minha Lista de Supermercado

## README Técnico Interno — V2.2.1

> **DOCUMENTAÇÃO INTERNA**
>
> Este arquivo é destinado ao acompanhamento, manutenção e evolução do projeto.
> Não é uma documentação de apresentação para usuários finais.

---

# 1. Estado atual do projeto

**Versão:** 2.2.1
**Tipo:** PWA mobile-first
**Arquitetura:** aplicação estática/local
**Frontend:** HTML + CSS + JavaScript puro
**Persistência:** IndexedDB
**Offline:** Service Worker + IndexedDB
**Hospedagem prevista:** GitHub Pages

A aplicação foi projetada para funcionar sem servidor próprio e sem banco de dados remoto.

A versão atual não possui:

* login;
* contas;
* servidor;
* banco remoto;
* sincronização;
* Firebase;
* Firestore;
* Supabase;
* Google Analytics;
* anúncios;
* pagamentos;
* telemetria;
* API externa;
* consulta online de preços;
* scraping;
* coleta automática de localização.

A regra principal da V2.2.1 é:

**dados do usuário ficam localmente no dispositivo.**

---

# 2. Arquivos principais

Estrutura atual:

```text
index.html
app.js
manifest.json
sw.js
icon-192.png
icon-512.png
README.md
CHANGELOG.md
```

### `index.html`

Responsável pela estrutura da interface.

Contém:

* telas;
* modais;
* formulários;
* botões;
* campos de pesquisa;
* navegação;
* referências ao `app.js`;
* referência ao manifest.

Não deve receber scripts externos sem uma decisão explícita de arquitetura.

---

### `app.js`

É o núcleo da aplicação.

Responsável por:

* IndexedDB;
* catálogo;
* listas;
* itens;
* histórico;
* wishlist;
* lixeira;
* backup;
* migração;
* banco offline;
* snapshots;
* filtros;
* modais;
* operações da interface;
* tema;
* PWA;
* validações.

É o arquivo mais crítico do projeto.

---

### `manifest.json`

Define o comportamento da aplicação como PWA.

Inclui:

* nome;
* nome curto;
* ícones;
* `start_url`;
* `display`;
* configurações visuais.

---

### `sw.js`

Responsável por:

* cache;
* funcionamento offline;
* atualização da aplicação;
* interceptação das requisições necessárias.

O Service Worker deve permanecer limitado ao próprio domínio/origem da aplicação.

---

### `icon-192.png`

Ícone PWA de 192×192.

### `icon-512.png`

Ícone PWA de 512×512.

---

# 3. IndexedDB

A aplicação utiliza IndexedDB como armazenamento principal.

Versão atual:

```javascript
DB_VERSION = 5
```

Stores pessoais:

```text
catalogs
lists
history
wishlist
trash
settings
```

Stores de referência:

```text
referenceProducts
referenceMarkets
```

---

# 4. Separação entre dados pessoais e dados de referência

Essa separação é importante.

## Dados pessoais

São criados/modificados pelo usuário:

```text
catalogs
lists
history
wishlist
trash
settings
```

## Dados de referência

São dados pré-cadastrados pelo aplicativo:

```text
referenceProducts
referenceMarkets
```

A base de referência não deve ser tratada como parte dos dados pessoais.

---

# 5. Banco offline de produtos

Store:

```text
referenceProducts
```

Existe para facilitar o cadastro de produtos comuns.

A base possui informações como:

```text
nome
marca
unidade
categoria
```

A pesquisa pode considerar:

* nome;
* marca;
* categoria;
* unidade.

O usuário pode selecionar um produto da base e adicioná-lo ao catálogo pessoal.

Depois disso, o produto passa a ser um registro independente no catálogo pessoal.

A base de referência não é um catálogo comercial oficial.

---

# 6. Banco offline de mercados

Store:

```text
referenceMarkets
```

Foi criado para facilitar a seleção de mercados.

A prioridade inicial da base é Salvador/Bahia.

A pesquisa/autocomplete deve combinar:

1. mercados cadastrados na base de referência;
2. mercados que o usuário já utilizou;
3. entrada manual.

Não existe obrigação de o mercado estar na base.

---

# 7. Versionamento da base de referência

Existe:

```javascript
REFERENCE_VERSION
```

O objetivo é permitir atualização futura da base offline sem precisar apagar os dados pessoais.

O seed deve ser:

* idempotente;
* transacional;
* versionado.

Ou seja, executar o seed novamente não deve criar duplicações indevidas.

---

# 8. Catálogo pessoal

Store:

```text
catalogs
```

Produto pessoal pode possuir:

```text
name
brand
unit
category
notes
```

Existe preparação estrutural para:

```text
EAN / código de barras
```

Mas a V2.2.1 não possui:

* scanner obrigatório;
* consulta online;
* API de produtos;
* sincronização de EAN.

---

# 9. Identidade do produto

Um dos problemas das versões anteriores era identificar produto apenas pelo nome.

A regra atual é considerar:

```text
nome + marca + unidade
```

Exemplo:

```text
Arroz | Camil | 5 kg
Arroz | Tio João | 5 kg
Arroz | Camil | 1 kg
```

São produtos diferentes.

Isso evita colisões no catálogo.

---

# 10. Snapshots de produtos

Os itens das listas não devem depender exclusivamente do cadastro atual do catálogo.

Ao adicionar um produto a uma lista, são preservados dados do produto.

Estrutura conceitual:

```javascript
{
    productName,
    productBrand,
    productUnit,
    productCategory
}
```

Isso é chamado de **snapshot**.

---

## Por que isso existe?

Imagine:

```text
Produto:
Arroz Camil 5 kg
```

O usuário adiciona esse produto à lista.

Depois altera o catálogo para:

```text
Arroz Camil 1 kg
```

A lista antiga não pode mudar automaticamente para 1 kg.

Por isso o item guarda sua própria fotografia dos dados do produto no momento da inclusão.

---

# 11. Compatibilidade com dados antigos

Existe uma rotina:

```javascript
ensureItemSnapshots()
```

Ela serve para dados antigos que ainda não possuem snapshot.

A aplicação tenta preencher os dados ausentes utilizando as informações disponíveis no catálogo.

Isso evita que a atualização para V2.2.1 deixe listas antigas incompletas.

---

# 12. Função `productSnapshot()`

Existe uma função dedicada à criação do snapshot.

A ideia é centralizar a criação dos dados:

```text
nome
marca
unidade
categoria
```

Isso evita que cada parte do aplicativo implemente sua própria versão da estrutura.

Sempre que possível, novas funcionalidades devem utilizar essa mesma lógica.

---

# 13. Dados dos itens da lista

Um item pode conter informações como:

```text
produto
marca
unidade
categoria
quantidade
valor
data
mercado
observação
comprado
```

Além do vínculo com o produto/catalogo, os dados de identificação do produto são preservados no próprio item.

---

# 14. Listas

As listas possuem operações de:

* criar;
* editar;
* abrir;
* duplicar;
* arquivar;
* restaurar;
* excluir;
* desfazer;
* enviar para lixeira;
* recuperar;
* excluir permanentemente;
* comprar novamente.

Uma lista também pode possuir:

* nome;
* data;
* tipo;
* observações.

---

# 15. Observações

O campo de observação da lista foi ampliado.

Limite atual:

```text
2000 caracteres
```

Isso corrige a limitação anterior de 500 caracteres.

---

# 16. Pesquisa dentro da lista

Esse ponto merece atenção especial.

## Problema antigo

Ao pesquisar um item dentro da lista, havia casos em que a digitação apresentava comportamento incorreto.

Exemplo:

```text
Açúcar
```

podia acabar sendo exibido de maneira semelhante a:

```text
racuça
```

ou apresentar comportamento estranho do cursor.

---

## Causa

O modal/lista estava sendo reconstruído durante cada evento:

```javascript
input
```

Isso fazia com que o elemento de entrada pudesse ser destruído e recriado enquanto o usuário digitava.

---

## Solução

Foi criada/separada a renderização:

```javascript
renderListItemsOnly()
```

Agora:

```text
usuário digita
       ↓
atualiza estado da pesquisa
       ↓
renderiza somente os itens
```

O campo de pesquisa permanece existente.

---

## Regra para manutenção

**Não reconstruir o input de pesquisa inteiro a cada `input`.**

Novos filtros devem preferencialmente atualizar apenas a área de resultados.

---

# 17. Histórico de preços

Store:

```text
history
```

O histórico preserva informações da compra.

Pode incluir:

```text
produto
marca
unidade
categoria
quantidade
valor
mercado
data
```

O objetivo é impedir que uma alteração posterior do catálogo destrua o contexto histórico.

---

# 18. Histórico é imutável conceitualmente

Uma alteração no catálogo atual não deve reescrever o passado.

Exemplo:

```text
2026
Arroz Camil 5 kg
R$ 25,00
```

Se o produto atualmente passar a ser:

```text
Arroz Camil 1 kg
```

o registro histórico antigo deve continuar representando:

```text
Arroz Camil 5 kg
R$ 25,00
```

---

# 19. Comprar novamente

A função cria uma nova lista a partir de uma lista existente.

O usuário pode decidir o que será reaproveitado.

Opções:

```text
quantidades
valores
mercados
observações
```

Padrão atual:

```text
Quantidade → manter
Valor → não manter
Mercado → não manter
Observação → não manter
```

Os itens da nova lista começam:

```text
comprado = false
```

---

# 20. Por que valores e mercados não são copiados por padrão?

Porque são informações específicas da compra anterior.

Exemplo:

Lista antiga:

```text
Carrefour
Arroz R$ 25
```

Uma nova compra pode ocorrer:

```text
Atacadão
Arroz R$ 29
```

Portanto, carregar automaticamente esses dados poderia gerar informação errada.

---

# 21. Duplicação de listas

A duplicação não deve simplesmente clonar tudo.

Dados relacionados especificamente à compra anterior precisam ser tratados.

Especial atenção para:

```text
data
valor
mercado
comprado
```

O objetivo é duplicar a estrutura/intenção da lista, e não falsificar uma nova compra com os dados da antiga.

---

# 22. Lixeira

Existe um sistema de lixeira/recovery.

Operações importantes:

```text
excluir
↓
lixeira
↓
restaurar
```

Também existe:

```text
desfazer
```

e exclusão permanente.

Ao alterar a lixeira, verificar dependências entre:

* catálogo;
* listas;
* itens;
* histórico;
* wishlist.

---

# 23. Integridade entre stores

Algumas operações alteram mais de um store do IndexedDB.

Exemplo conceitual:

```text
excluir lista
+
criar registro na lixeira
```

Essas operações precisam ser tratadas de forma transacional sempre que possível.

Não assumir que uma operação composta terminou apenas porque uma chamada de escrita retornou.

---

# 24. Migração do localStorage

Versões antigas utilizavam:

```text
lista_supermercado_v1
```

A V2 migrou os dados para IndexedDB.

A migração deve ser:

* idempotente;
* segura;
* compatível;
* sem duplicação;
* sem apagar dados prematuramente.

A regra é:

**primeiro garantir a migração; depois considerar os dados antigos tratados.**

---

# 25. Backup

O backup é JSON.

Ele deve conter os dados pessoais necessários para restauração.

Não deve incluir:

```text
referenceProducts
referenceMarkets
referenceDataVersion
```

A base de referência pertence ao aplicativo, não ao backup pessoal.

---

# 26. Importação de backup

Um backup importado não deve ser aceito cegamente.

É necessário validar:

* estrutura;
* versão;
* tipos;
* arrays esperados;
* objetos esperados;
* dados mínimos.

O objetivo é impedir que um JSON inválido destrua o banco atual.

---

# 27. `clearAll()`

A limpeza geral deve afetar apenas os dados pessoais.

Não deve apagar:

```text
referenceProducts
referenceMarkets
```

A base offline precisa continuar disponível depois que o usuário limpar suas listas/catalogo.

---

# 28. `replaceAll()`

A substituição durante importação também deve preservar os stores de referência.

A importação substitui os dados pessoais.

As bases:

```text
referenceProducts
referenceMarkets
```

continuam intactas.

---

# 29. Wishlist

A lista de desejos deve utilizar identificação de produto mais robusta.

Não utilizar apenas:

```text
nome
```

como identidade.

Marca e unidade precisam ser consideradas quando disponíveis.

---

# 30. Categorias

Produtos possuem categoria.

A categoria é utilizada para:

* organização;
* pesquisa;
* banco de referência;
* identificação visual;
* futuras melhorias de filtragem.

---

# 31. EAN

Existe preparação para EAN/código de barras.

**Não implementar consulta online nesta versão.**

Possíveis evoluções futuras:

```text
EAN manual
↓
scanner
↓
identificação automática
```

Mas isso pertence a versões futuras.

---

# 32. Privacidade

A V2.2.1 foi deliberadamente mantida local.

Não há envio automático dos dados das listas para terceiros.

Não há:

```text
Firebase
Firestore
Analytics
Supabase
API de preços
servidor
login
cloud sync
```

---

# 33. IndexedDB não é criptografia

Importante:

**IndexedDB é armazenamento local, não criptografia.**

A aplicação não deve afirmar que os dados estão criptografados.

Se outra pessoa tiver acesso ao perfil do navegador/dispositivo, dados locais podem potencialmente ser acessados.

---

# 34. Rede

A aplicação não deve depender de rede para as funções principais.

O `sw.js` possui tratamento para manter a lógica dentro da origem da aplicação.

O `fetch()` existente no Service Worker é parte do funcionamento normal do PWA/cache.

Isso não significa que exista uma API externa.

Durante auditorias, diferenciar:

```text
fetch interno do Service Worker
```

de:

```text
requisição para serviço externo
```

---

# 35. Dependências externas

A aplicação foi construída sem frameworks/CDNs obrigatórios.

Não adicionar futuramente:

```text
<script src="https://...">
<link href="https://...">
```

sem uma decisão consciente.

O objetivo é manter:

```text
HTML
CSS
JS
IndexedDB
Service Worker
```

suficientes para executar a aplicação.

---

# 36. Service Worker

O cache precisa ser versionado.

V2.2.1 utiliza:

```text
minha-lista-v2-2-1
```

Ao atualizar a aplicação:

1. alterar a versão;
2. atualizar o nome do cache;
3. garantir que os arquivos novos estejam no cache;
4. remover caches antigos quando apropriado;
5. testar atualização;
6. testar funcionamento offline.

---

# 37. Problemas de cache durante desenvolvimento

Se uma alteração parecer não aparecer:

1. fechar a PWA;
2. abrir novamente;
3. atualizar;
4. se necessário, limpar o cache/service worker;
5. testar novamente.

Não assumir imediatamente que o código novo não foi publicado.

PWA + Service Worker pode manter arquivos antigos em cache.

---

# 38. Auditoria estática

Comandos utilizados:

```bash
node --check app.js
node --check sw.js
```

Também verificar:

* JSON do manifest;
* IDs duplicados;
* funções duplicadas;
* referências de ícones;
* tamanho dos ícones;
* stores IndexedDB;
* versão do banco;
* referência dos bancos offline;
* estrutura do backup;
* Service Worker;
* URLs externas;
* dependências;
* APIs externas.

---

# 39. Auditoria de rede

Pesquisar código real relacionado a:

```text
fetch
XMLHttpRequest
navigator.sendBeacon
WebSocket
importScripts
Firebase
Firestore
Supabase
Analytics
GTM
```

Mas não considerar uma simples ocorrência textual na documentação como evidência de dependência.

Exemplo:

```text
"não utiliza Firebase"
```

não significa que Firebase esteja instalado.

É necessário analisar o código executável.

---

# 40. Teste E2E

O teste E2E completo em navegador não deve ser declarado como aprovado sem execução real e confiável.

Na auditoria atual:

* testes estáticos: realizados;
* validações estruturais: realizadas;
* teste E2E completo: não considerado aprovado.

Quando o ambiente permitir, testar manualmente ou automaticamente:

```text
abrir aplicação
↓
criar lista
↓
adicionar produto
↓
editar marca/unidade
↓
pesquisar item
↓
marcar comprado
↓
duplicar
↓
arquivar
↓
restaurar
↓
lixeira
↓
desfazer
↓
comprar novamente
↓
histórico
↓
backup
↓
importação
↓
migração
↓
offline
```

---

# 41. Regras para futuras alterações

Antes de modificar o projeto:

### 1. Não quebrar dados existentes

Sempre considerar versões anteriores.

### 2. Não quebrar migração

Dados antigos precisam continuar utilizáveis.

### 3. Não quebrar backup

Backups antigos devem ser aceitos sempre que possível.

### 4. Não apagar dados silenciosamente

Qualquer operação destrutiva deve ser deliberada.

### 5. Preservar funcionamento offline

Não introduzir dependência de internet sem decisão explícita.

### 6. Não adicionar serviços externos

Especialmente:

```text
Firebase
Analytics
APIs
CDNs
telemetria
```

sem mudar conscientemente a arquitetura.

### 7. Atualizar versão

Alterações estruturais precisam refletir a versão correta.

### 8. Atualizar Service Worker

Alterou arquivos do aplicativo?

Verificar cache.

### 9. Auditar novamente

Toda alteração significativa deve ser seguida de auditoria.

### 10. Registrar no CHANGELOG

Registrar:

* o que mudou;
* por que mudou;
* problema corrigido;
* impacto;
* testes realizados.

---

# 42. Próximas possibilidades

Ideias que podem ser implementadas futuramente:

## EAN

```text
EAN manual
scanner
identificação de produto
```

## Banco de produtos

Expandir progressivamente:

```text
produtos
marcas
unidades
categorias
```

## Banco de mercados

Expandir a cobertura:

```text
Salvador
Bahia
outras regiões
```

## Comparação de preços

Pode futuramente existir uma estrutura para comparação.

Mas a V2.2.1 **não coleta preços automaticamente**.

## Sincronização

Uma futura versão Premium poderia eventualmente utilizar:

```text
login
Firebase/Auth
Firestore
sync
```

Isso seria uma mudança arquitetural importante e não faz parte desta versão.

---

# 43. Regra fundamental do projeto

A V2.2.1 deve continuar sendo:

> **uma PWA local, offline, simples e sem dependência de serviços externos.**

Qualquer alteração que mude essa característica deve ser tratada como mudança de arquitetura, e não como simples melhoria de interface.

---

# 44. Estado de referência da V2.2.1

No momento desta documentação:

```text
DB_VERSION = 5
REFERENCE_VERSION = 1
```

Stores:

```text
catalogs
lists
history
wishlist
trash
settings
referenceProducts
referenceMarkets
```

Principais correções da versão:

```text
✓ pesquisa dentro da lista
✓ snapshots de produtos
✓ marca/unidade
✓ observações até 2000 caracteres
✓ banco offline de produtos
✓ banco offline de mercados
✓ autocomplete de mercados
✓ duplicação de listas
✓ comprar novamente
✓ histórico
✓ lixeira
✓ restauração
✓ desfazer
✓ backup
✓ importação
✓ migração
✓ separação entre dados pessoais e referência
```

---

# 45. Regra para não esquecer

Ao trabalhar neste projeto no futuro, lembrar:

**Não é necessário colocar tudo no servidor.**

A arquitetura atual foi escolhida justamente para que:

```text
lista
catálogo
histórico
wishlist
lixeira
configurações
```

continuem funcionando localmente.

O banco offline de referência também deve permanecer local.

A evolução para recursos online, se acontecer, deve ser feita posteriormente e de forma controlada.

---

# 46. Versão

**Minha Lista de Supermercado — V2.2.1**

Data de referência:

**08/09/2026**

Status:

**versão de desenvolvimento/uso pessoal, com auditoria estática realizada e E2E de navegador ainda não considerado aprovado.**
