# 🛒 Minha Lista de Supermercado

PWA mobile-first para criação e gerenciamento de listas de supermercado.

A aplicação foi projetada com foco em **privacidade, funcionamento offline e armazenamento local**. Os dados pessoais permanecem no dispositivo do usuário através do IndexedDB.

**Versão atual: 2.2.1**

---

## Principais características

### 📝 Listas de compras

- Múltiplas listas.
- Criação, edição e exclusão.
- Listas locais ou virtuais.
- Data opcional.
- Observações.
- Marcação de itens comprados.
- Arquivamento e restauração.
- Lixeira.
- Desfazer exclusões.
- Duplicação de listas.
- Comprar novamente.

### 📦 Itens cadastrados

O catálogo pessoal permite armazenar:

- Nome.
- Marca.
- Unidade/apresentação.
- Categoria.
- Observações.

A identificação de produtos considera a combinação de:

- nome;
- marca;
- unidade.

Isso permite, por exemplo, cadastrar o mesmo produto em marcas ou apresentações diferentes.

### ✨ Banco offline de produtos

A aplicação possui uma base local de referência com produtos comuns de supermercado.

É possível:

- pesquisar por nome;
- pesquisar por marca;
- pesquisar por categoria;
- pesquisar por unidade;
- selecionar um produto;
- adicioná-lo ao catálogo pessoal;
- editar os dados posteriormente.

O banco de referência é apenas uma **base de conveniência offline** e não representa um cadastro comercial oficial.

### 🏪 Banco offline de mercados

Existe também uma base local de mercados de referência, inicialmente priorizando estabelecimentos comuns na Bahia/Salvador.

Ela é utilizada para:

- autocomplete;
- seleção rápida;
- padronização de nomes.

Mercados que não estejam na base podem ser digitados manualmente.

### 💰 Histórico de preços

O aplicativo mantém histórico local de preços, incluindo, quando disponíveis:

- produto;
- marca;
- unidade;
- categoria;
- quantidade;
- valor;
- mercado;
- data.

Os registros históricos preservam informações do produto para evitar alterações retroativas quando o catálogo pessoal for editado.

### 🔄 Snapshots

Os itens das listas armazenam um snapshot dos dados do produto no momento da inclusão.

Assim, alterar posteriormente:

- nome;
- marca;
- unidade;
- categoria

no catálogo não altera a descrição histórica já registrada em uma lista.

---

## 🔁 Comprar novamente

A função permite criar uma nova lista a partir de uma anterior.

O usuário pode escolher:

- manter quantidades;
- manter valores;
- manter mercados;
- manter observações.

Por padrão:

- quantidades: mantidas;
- valores: não mantidos;
- mercados: não mantidos;
- observações: não mantidas.

A nova compra começa com os itens não marcados como comprados.

---

## 💾 Backup

A aplicação permite exportar e importar backups em JSON.

O backup contém somente dados pessoais do usuário, como:

- catálogo;
- listas;
- histórico;
- lista de desejos;
- lixeira;
- configurações pertinentes.

Os bancos:

- `referenceProducts`
- `referenceMarkets`

**não fazem parte do backup pessoal**.

A importação valida a estrutura do arquivo antes de substituir os dados atuais.

É recomendável manter backups periódicos.

---

## 🔄 Compatibilidade e migração

A aplicação mantém compatibilidade com a estrutura antiga baseada em:

`lista_supermercado_v1`

Os dados antigos podem ser migrados para o IndexedDB.

A estrutura de backups anteriores também possui mecanismos de normalização para preservar dados quando campos introduzidos posteriormente ainda não existiam.

---

## 🗃️ Armazenamento

O banco principal utiliza IndexedDB.

### Dados do usuário

- `catalogs`
- `lists`
- `history`
- `wishlist`
- `trash`
- `settings`

### Dados de referência offline

- `referenceProducts`
- `referenceMarkets`

Os bancos de referência são independentes dos dados pessoais e são preservados quando o usuário limpa seus dados.

O seed dos dados de referência é versionado e executado de maneira idempotente.

---

## 🔐 Privacidade

Esta versão foi projetada para funcionar localmente.

Não possui:

- login;
- servidor próprio;
- banco remoto;
- sincronização em nuvem;
- Firebase;
- Firestore;
- Google Analytics;
- Supabase;
- anúncios;
- pagamentos;
- coleta automática de localização;
- API externa de preços;
- scraping de supermercados;
- telemetria.

A aplicação não envia automaticamente o conteúdo das listas para servidores.

Ao utilizar exportação ou compartilhamento, o usuário decide manualmente onde o arquivo será salvo ou enviado através dos recursos do próprio dispositivo.

### Importante sobre segurança

O IndexedDB é armazenamento local, mas **não é criptografia**.

Se outra pessoa tiver acesso ao perfil/navegador/dispositivo e às ferramentas adequadas, dados armazenados localmente podem potencialmente ser acessados.

---

## 📱 PWA e funcionamento offline

A aplicação utiliza:

- HTML;
- CSS;
- JavaScript puro;
- IndexedDB;
- Service Worker;
- Web App Manifest.

Não depende de frameworks ou CDNs externos.

Os recursos necessários são armazenados pelo Service Worker para permitir utilização offline.

Após uma atualização, caso a versão anterior continue aparecendo, feche/reabra a PWA ou faça uma atualização forçada para permitir que o novo Service Worker assuma o controle.

---

## 🧾 EAN / código de barras

A estrutura está preparada para uma futura evolução envolvendo EAN/código de barras.

Nesta versão:

- não há scanner obrigatório;
- não há consulta online de produtos;
- não há API externa;
- o recurso não é necessário para utilizar o aplicativo.

---

## 🛡️ Arquitetura de privacidade

O princípio desta versão é:

**dados pessoais locais + dados de referência locais.**

Os dados pessoais não são enviados para serviços externos.

Os bancos de referência também são armazenados localmente e não precisam de conexão para funcionar.

Uma futura versão poderá eventualmente oferecer sincronização ou recursos Premium, mas isso **não faz parte da V2.2.1**.

---

## 🧪 Auditoria e testes

A versão passa por auditorias estáticas envolvendo:

- sintaxe JavaScript;
- Service Worker;
- manifest;
- IDs HTML;
- stores IndexedDB;
- estrutura de backup;
- separação entre dados pessoais e referência;
- referências de recursos;
- dependências externas;
- implementação de comunicação de rede.

Também são considerados fluxos como:

1. criação de lista;
2. inclusão de produto;
3. edição de marca e unidade;
4. pesquisa de itens;
5. marcação de compra;
6. duplicação;
7. arquivamento;
8. restauração;
9. lixeira;
10. desfazer;
11. comprar novamente;
12. histórico;
13. snapshots;
14. exportação;
15. importação;
16. migração;
17. funcionamento offline.

**Limitação:** o teste E2E completo em navegador não pôde ser concluído de forma confiável no ambiente de desenvolvimento. Não é declarado como executado quando não foi.

---

## 📁 Arquivos principais

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

---

## 🚀 Instalação

Hospede os arquivos em um endereço HTTPS, como GitHub Pages.

No Android/Chrome:

1. Abra a aplicação pelo endereço HTTPS.
2. Abra o menu do navegador.
3. Escolha **Instalar aplicativo** ou **Adicionar à tela inicial**, conforme a opção disponível.
4. Abra a PWA instalada.

Para atualizações, pode ser necessário fechar e reabrir a PWA ou realizar uma atualização forçada para que o novo cache seja carregado.

---

## ⚠️ Observações

Esta aplicação não pretende substituir sistemas comerciais de gestão de supermercados.

O banco offline de produtos e mercados é apenas uma lista de referência para facilitar o uso.

Preços são informados manualmente pelo usuário.

Não existe, nesta versão, coleta automática de preços ou sincronização online.

---

## Licença

Defina aqui a licença desejada para o projeto caso ele seja publicado como código aberto.
