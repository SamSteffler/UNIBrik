# Diagrama UML - Projeto UNIBrik

## Marketplace Universitário para Venda/Troca/Doação

---

## CLASSES PRINCIPAIS DO SISTEMA

### 1. Classe: **Servidor**

**Responsabilidade**: Controlador central da aplicação que gerencia todas as requisições HTTP e coordena as operações entre os diferentes módulos do sistema.

#### Atributos

- `porta: number` - Porta de execução do servidor (padrão: 3000)
- `database: Database` - Referência à instância do banco de dados
- `productManager: ProductManager` - Gerenciador de produtos
- `messageManager: MessageManager` - Gerenciador de mensagens

#### Métodos

**Operações Gerais:**
- `iniciar(): void` - Inicia o servidor e configura rotas
- `configurarMiddleware(): void` - Configura CORS, JSON parser e logging
- `verificarPermissaoAdmin(userId): boolean` - Verifica se usuário é administrador

**Autenticação:**
- `registrarUsuario(dados): Usuario` - Registra novo usuário
- `autenticar(email, senha): Usuario` - Autentica usuário com credenciais
- `autenticarGoogle(token): Usuario` - Autentica via Google OAuth
- `buscarUsuario(id): Usuario` - Busca dados de usuário específico
- `atualizarUsuario(id, dados): Usuario` - Atualiza informações do usuário

**Gerenciamento de Produtos:**
- `criarProduto(dados): Produto` - Cria novo anúncio de produto
- `buscarProdutos(filtros): Produto[]` - Busca produtos com filtros
- `obterProduto(id): Produto` - Obtém detalhes de um produto
- `atualizarProduto(id, dados): Produto` - Atualiza produto existente
- `deletarProduto(id): boolean` - Remove produto do sistema

**Administração:**
- `aprovarUsuario(id): boolean` - Aprova/desbloqueia usuário
- `bloquearUsuario(id): boolean` - Bloqueia usuário
- `aprovarProduto(id): boolean` - Aprova produto para publicação
- `bloquearProduto(id): boolean` - Bloqueia produto
- `listarUsuarios(filtros): Usuario[]` - Lista usuários do sistema

---

### 2. Classe: **Usuario**

**Responsabilidade**: Representa um usuário do sistema (estudante) com suas informações pessoais e de acesso.

#### Atributos

- `id: number` - Identificador único interno
- `publicId: string` - Identificador público (nanoid)
- `nome: string` - Nome completo do usuário
- `email: string` - Email único para login
- `senha: string` - Hash da senha (bcrypt)
- `foto: string` - URL da foto de perfil
- `telefone: string` - Telefone de contato
- `dataNascimento: Date` - Data de nascimento
- `endereco: Endereco` - Endereço completo (CEP, rua, número, complemento, bairro, cidade, UF)
- `role: string` - Papel no sistema ('user', 'admin', 'supervisor')
- `aprovado: boolean` - Status de aprovação (true = ativo, false = bloqueado)
- `dataCriacao: Date` - Data de registro no sistema

#### Métodos

- `validarCredenciais(senha): boolean` - Valida senha fornecida
- `atualizarPerfil(dados): void` - Atualiza dados do perfil
- `isAdmin(): boolean` - Verifica se tem permissões administrativas
- `podeAnunciar(): boolean` - Verifica se pode criar anúncios
- `podeFavoritar(): boolean` - Verifica se pode favoritar produtos

---

### 3. Classe: **Produto**

**Responsabilidade**: Representa um item anunciado no marketplace (venda/troca/doação).

#### Atributos

- `id: number` - Identificador único do produto
- `titulo: string` - Título do anúncio
- `descricao: string` - Descrição detalhada do produto
- `condicao: string` - Estado do produto ('Novo', 'Seminovo', 'Usado')
- `categoria: string` - Categoria do produto (Eletrônicos, Livros, Móveis, etc.)
- `preco: number` - Preço do produto (0 = gratuito)
- `vendedorId: number` - ID do usuário vendedor (FK para Usuario)
- `localizacao: string` - Local de retirada ('UFSM', 'Em casa', 'A combinar')
- `status: string` - Status de aprovação ('pending', 'allowed', 'blocked')
- `imagens: string[]` - Array de URLs das imagens (máximo 8)
- `dataCriacao: Date` - Data de criação do anúncio
- `favoritadoPor: number[]` - IDs dos usuários que favoritaram

#### Métodos

- `adicionarImagem(url): void` - Adiciona imagem ao produto
- `removerImagem(url): void` - Remove imagem do produto
- `atualizarDados(dados): void` - Atualiza informações do produto
- `aprovar(): void` - Marca produto como aprovado
- `bloquear(): void` - Marca produto como bloqueado
- `isGratuito(): boolean` - Verifica se produto é gratuito
- `pertenceAo(userId): boolean` - Verifica se produto pertence ao usuário

---

### 4. Classe: **Website**

**Responsabilidade**: Interface frontend (Vue.js) que gerencia a interação do usuário com o sistema.

#### Atributos

- `usuarioAtual: Usuario` - Usuário logado no momento
- `router: Router` - Controlador de rotas e navegação
- `estadoGlobal: Object` - Estado reativo da aplicação

#### Métodos

**Navegação:**
- `navegarPara(rota): void` - Navega para rota específica
- `verificarAutenticacao(): boolean` - Verifica se usuário está autenticado
- `redirecionarLogin(): void` - Redireciona para página de login

**Exibição:**
- `exibirHome(): void` - Renderiza página inicial
- `exibirProduto(id): void` - Exibe detalhes do produto
- `exibirBusca(filtros): void` - Exibe resultados de busca
- `exibirPerfil(): void` - Exibe perfil do usuário
- `exibirMensagens(): void` - Exibe conversas do chat

**Interação:**
- `realizarBusca(query, filtros): void` - Executa busca de produtos
- `favoritarProduto(id): void` - Adiciona/remove produto dos favoritos
- `abrirChat(vendedorId, produtoId): void` - Abre conversa com vendedor
- `criarAnuncio(dados): void` - Cria novo anúncio
- `editarAnuncio(id, dados): void` - Edita anúncio existente

---

### 5. Classe: **Database**

**Responsabilidade**: Gerencia persistência de dados e estrutura do banco SQLite.

#### Atributos

- `conexao: SQLiteDatabase` - Conexão ativa com banco de dados
- `caminhoArquivo: string` - Caminho do arquivo do banco (unibrik.db)

#### Métodos

**Inicialização:**
- `conectar(): void` - Estabelece conexão com banco
- `criarTabelas(): void` - Cria estrutura de tabelas
- `criarIndices(): void` - Cria índices para otimização

**Operações Genéricas:**
- `executar(sql, params): void` - Executa comando SQL
- `buscar(sql, params): Object` - Busca um registro
- `buscarTodos(sql, params): Object[]` - Busca múltiplos registros
- `inserir(tabela, dados): number` - Insere registro e retorna ID
- `atualizar(tabela, id, dados): boolean` - Atualiza registro
- `deletar(tabela, id): boolean` - Deleta registro

**Tabelas do Sistema:**
- `usuarios` - Armazena dados dos usuários
- `produtos` - Armazena anúncios de produtos
- `mensagens` - Armazena mensagens do chat
- `favoritos` - Relacionamento usuário-produto (favoritos)
- `imagens_produto` - Armazena URLs das imagens dos produtos

---

### 6. Classe: **MessageManager**

**Responsabilidade**: Gerencia sistema de mensagens/chat entre usuários.

#### Atributos

- `database: Database` - Referência ao banco de dados

#### Métodos

- `listarConversas(userId): Conversa[]` - Lista todas as conversas do usuário
- `obterMensagens(produtoId, userId, outroUserId): Mensagem[]` - Busca mensagens de uma conversa
- `enviarMensagem(produtoId, remetenteId, destinatarioId, texto): Mensagem` - Envia nova mensagem
- `marcarComoLida(mensagemId): boolean` - Marca mensagem como lida
- `marcarConversaComoLida(produtoId, userId, outroUserId): boolean` - Marca toda conversa como lida
- `contarNaoLidas(userId): number` - Conta mensagens não lidas do usuário
- `obterUltimaMensagem(produtoId, userId, outroUserId): Mensagem` - Retorna última mensagem da conversa

**Estruturas de Dados:**

**Mensagem:**
- `id: number` - Identificador da mensagem
- `produtoId: number` - Produto relacionado à conversa
- `remetenteId: number` - ID do usuário que enviou
- `destinatarioId: number` - ID do usuário que recebe
- `texto: string` - Conteúdo da mensagem
- `lida: boolean` - Se foi lida ou não
- `dataEnvio: Date` - Data/hora do envio

**Conversa:**
- `produtoId: number` - Produto sobre o qual conversam
- `outroUsuarioId: number` - ID do outro participante
- `nomeOutroUsuario: string` - Nome do outro participante
- `fotoOutroUsuario: string` - Foto do outro participante
- `tituloProduto: string` - Título do produto
- `ultimaMensagem: string` - Texto da última mensagem
- `dataUltimaMensagem: Date` - Data da última mensagem
- `naoLidas: number` - Quantidade de mensagens não lidas

---

### 7. Classe: **ProductManager**

**Responsabilidade**: Gerencia operações de produtos, favoritos e imagens.

#### Atributos

- `database: Database` - Referência ao banco de dados

#### Métodos

**Operações de Produtos:**
- `criar(produto): Produto` - Cria novo produto
- `buscarPorId(id): Produto` - Busca produto específico
- `buscar(query, limite): Produto[]` - Busca simples por texto
- `buscarComFiltros(filtros): Produto[]` - Busca avançada com múltiplos filtros
- `listarPorVendedor(vendedorId): Produto[]` - Lista produtos de um vendedor
- `listarGratuitos(limite): Produto[]` - Lista produtos gratuitos
- `listarRecentes(limite): Produto[]` - Lista produtos mais recentes
- `atualizar(id, dados): Produto` - Atualiza produto
- `deletar(id): boolean` - Deleta produto

**Operações de Favoritos:**
- `adicionarFavorito(userId, produtoId): boolean` - Adiciona produto aos favoritos
- `removerFavorito(userId, produtoId): boolean` - Remove produto dos favoritos
- `verificarFavorito(userId, produtoId): boolean` - Verifica se produto é favorito
- `listarFavoritos(userId, limite, offset): Produto[]` - Lista favoritos do usuário

**Operações de Imagens:**
- `adicionarImagens(produtoId, urls): void` - Adiciona múltiplas imagens
- `listarImagens(produtoId): string[]` - Lista imagens de um produto
- `removerImagem(produtoId, url): boolean` - Remove imagem específica

**Busca Otimizada (FTS5):**
- `configurarBuscaTexto(): void` - Configura índice de busca full-text
- `sincronizarIndiceBusca(): void` - Sincroniza índice com tabela de produtos

---

## RELAÇÕES ENTRE AS CLASSES

### 1. Dependências (uses)

**Servidor depende de:**
- `Database` - Para persistência de dados
- `ProductManager` - Para operações com produtos
- `MessageManager` - Para sistema de mensagens

**ProductManager depende de:**
- `Database` - Para acessar tabelas de produtos, favoritos e imagens

**MessageManager depende de:**
- `Database` - Para acessar tabela de mensagens

**Website depende de:**
- `Servidor` - Para todas as requisições HTTP (via API REST)

### 2. Associações (Banco de Dados)

**Usuario → Produto (1:N)**
- Um usuário pode criar vários produtos
- Atributo: `vendedorId` em Produto

**Usuario ↔ Produto (N:M) - Favoritos**
- Usuários podem favoritar vários produtos
- Produtos podem ser favoritados por vários usuários
- Tabela intermediária: `favoritos`

**Usuario → Mensagem (1:N) - Como Remetente**
- Um usuário pode enviar várias mensagens
- Atributo: `remetenteId` em Mensagem

**Usuario → Mensagem (1:N) - Como Destinatário**
- Um usuário pode receber várias mensagens
- Atributo: `destinatarioId` em Mensagem

**Produto → Mensagem (1:N)**
- Um produto pode ter várias mensagens relacionadas
- Atributo: `produtoId` em Mensagem

**Produto → Imagem (1:N)**
- Um produto pode ter várias imagens (até 8)
- Atributo: `produtoId` em tabela `imagens_produto`

### 3. Composição

**Servidor compõe:**
- Rotas HTTP (endpoints REST)
- Middleware de autenticação e validação

**ProductManager compõe:**
- Operações CRUD de produtos
- Sistema de favoritos
- Gerenciamento de imagens

**Website compõe:**
- Componentes de interface (Header, Cards, Filters, Chat)
- Views/Páginas (Home, Busca, Produto, Perfil, etc.)

---

## FLUXOS PRINCIPAIS DO SISTEMA

### 1. Autenticação de Usuário

```
Website (LoginView) 
  → Servidor.autenticar(email, senha)
    → Database.buscar(usuarios, email)
      → Valida senha (bcrypt)
        → Retorna Usuario
  → Website atualiza estado (localStorage)
  → Redireciona para perfil
```

### 2. Criação de Anúncio

```
Website (CreateProductView)
  → Servidor.criarProduto(dados)
    → Verifica permissões (não supervisor)
      → ProductManager.criar(produto)
        → Database.inserir(produtos) [status='pending']
          → Retorna Produto
  → Website redireciona para página do produto
  → Admin aprova posteriormente
```

### 3. Busca de Produtos

```
Website (SearchView)
  → Servidor.buscarProdutos(filtros)
    → ProductManager.buscarComFiltros(filtros)
      → Database.buscarTodos(produtos) + FTS5
        → Aplica filtros SQL (categoria, preço, localização, condição)
          → Retorna Produto[]
  → Website renderiza resultados
```

### 4. Chat entre Usuários

```
Website (ProductView)
  → Clica em "Conversar com vendedor"
    → Servidor.obterMensagens(produtoId, userId, vendedorId)
      → MessageManager.obterMensagens()
        → Database.buscarTodos(mensagens)
          → Retorna Mensagem[]
  → Website exibe ChatPopup
  → Usuario envia mensagem
    → Servidor.enviarMensagem(dados)
      → MessageManager.enviarMensagem()
        → Database.inserir(mensagens)
  → Atualiza interface
```

### 5. Sistema de Favoritos

```
Website (ProductView)
  → Clica na estrela
    → Servidor.adicionarFavorito(userId, produtoId)
      → ProductManager.adicionarFavorito()
        → Database.inserir(favoritos) [idempotente]
          → Retorna sucesso
  → Website atualiza UI (estrela dourada)

Website (MyFavoritesView)
  → Servidor.listarFavoritos(userId)
    → ProductManager.listarFavoritos()
      → Database.buscarTodos(favoritos JOIN produtos)
        → Retorna Produto[]
  → Renderiza lista de favoritos
```

---

## PADRÕES DE PROJETO UTILIZADOS

### MVC (Model-View-Controller)
- **Model**: Database, Usuario, Produto (entidades e persistência)
- **View**: Website e componentes Vue (interface)
- **Controller**: Servidor (lógica de negócio e rotas)

### Repository Pattern
- `ProductManager` e `MessageManager` encapsulam acesso aos dados
- Abstrai operações do banco de dados

### Singleton
- `Database` mantém única instância de conexão
- Estado global da autenticação no Website

### Service Layer
- `ProductManager` e `MessageManager` como camada de serviço
- Separam lógica de negócio do controlador

### Observer Pattern
- Sistema reativo do Vue.js (Website)
- Notificação de mudanças de estado

---

## RESUMO DO SISTEMA

### Tecnologias
- **Backend**: Node.js + Express
- **Frontend**: Vue.js 3
- **Banco de Dados**: SQLite com FTS5
- **Autenticação**: Bcrypt + Google OAuth

### Funcionalidades Principais

**Para Usuários:**
- Criar anúncios (venda/troca/doação)
- Buscar produtos com filtros avançados
- Favoritar produtos
- Chat com vendedores
- Gerenciar perfil e anúncios

**Para Administradores:**
- Aprovar/bloquear usuários e produtos
- Deletar conteúdo inadequado
- Visualizar todo o sistema
- Gerenciar moderação

### Segurança e Regras
- Produtos criados com status `pending` (requerem aprovação)
- Supervisores podem administrar mas não anunciar
- Usuários bloqueados perdem acesso ao sistema
- Senhas criptografadas com bcrypt
- Sistema de roles (user/admin/supervisor)

---

**Documento criado para auxiliar na construção do Diagrama UML do projeto UNIBrik**
