# ARCHITECTURE — he4rt ink

**Atualizado em:** 24/11/2026

Como o código é organizado e escrito. Os princípios estão no `AGENTS.md`; as decisões técnicas, no `DECISIONS.md`; as convenções do banco, na seção 3.6 do `DECISIONS.md` e no `DATABASE.md`.

## 1. Idioma

| O quê                                                                          | Idioma                                                                          |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Código: classes, funções, variáveis, tipos, arquivos, rotas, tabelas e colunas | Inglês                                                                          |
| Comentários, documentação, mensagens de commit e descrições de teste           | Português                                                                       |
| Textos da interface e dos e-mails                                              | Arquivos de tradução (`lang/pt_BR.json`, `lang/en.json`), nunca fixos no código |

Exceção: as ilustrações do mascote têm nomes em português (`procurando`, `rosto`), porque são os mesmos usados no `DESIGN.md` §5.3 e no script `design/mascote/converter.py`.

O domínio usa os termos do `REQUIREMENTS.md` traduzidos de forma estável: artigo `Article`, versão `ArticleVersion`, rascunho `draft`, pendente `pending`, aprovada em vigor `current`, rejeitada `rejected`, substituída `superseded`, lixeira `trashed`, denúncia `Report`, penalidade `Penalty`, contestação `Appeal`.

## 2. Backend

```
app/
├── Models/              Modelos Eloquent
├── Domain/<Módulo>/     Regras e casos de uso de cada módulo
│   ├── Actions/         Um caso de uso por classe
│   ├── Enums/           Estados e tipos (backed enums em string)
│   ├── Queries/         Consultas reutilizadas por mais de um lugar
│   ├── Rules/           Regras de negócio puras, testáveis sem banco
│   ├── Events/          Fatos do domínio ("VersionApproved")
│   ├── Listeners/       Reações a eventos, registradas no AppServiceProvider
│   └── Exceptions/      Recusas de regra de negócio
├── Http/
│   ├── Controllers/<Área>/   Recebem a requisição e devolvem a resposta
│   ├── Requests/<Área>/      Validação de entrada
│   ├── Resources/<Área>/     O que cada modelo envia ao frontend
│   └── Middleware/
├── Policies/            Autorização, uma por modelo
├── Support/<Integração>/   Bibliotecas e serviços externos isolados
├── Jobs/  Notifications/  Mail/  Console/   Convenções do Laravel
└── Providers/
```

### 2.1 Módulos

| Módulo          | Responsabilidade                                                                         |
| --------------- | ---------------------------------------------------------------------------------------- |
| `Accounts`      | Cadastro, username, verificação, segurança, perfil, termos e aceites, exclusão de conta  |
| `Articles`      | Artigos, versões, estados, rascunho, envio e retirada, lixeira                           |
| `Media`         | Imagens: upload (`StoreArticleImage`), processamento, referências e limpeza              |
| `Taxonomy`      | Categorias e tags                                                                        |
| `Moderation`    | Fila, aprovação, rejeição, despublicação, penalidades e contestações                     |
| `Interactions`  | Comentários, curtidas e favoritos                                                        |
| `Reports`       | Denúncias                                                                                |
| `Notifications` | Notificações internas e escolha dos e-mails                                              |
| `Audit`         | Registro de auditoria, só inclusões                                                      |
| `Search`        | Busca e filtros (`ArticleSearch`), a partir da regra única de visibilidade de `Articles` |

**Dependências entre módulos** são explícitas e num sentido só. Um módulo usa outro apenas pelas classes de `Actions` e `Queries` dele, nunca pelos detalhes internos. Quando um módulo precisa reagir a algo de outro sem depender dele, usa um evento: `Articles` dispara `VersionSubmitted`, e `Notifications` reage. Dependências circulares não são permitidas.

### 2.2 Responsabilidade de cada parte

- **Models:** relações, casts, atributos e escopos simples (`whereState`). Sem regra de negócio e sem efeitos colaterais.
- **Actions:** cada classe é um caso de uso (`SubmitVersion`, `ApproveVersion`), com um método público `handle()`. Recebem dados já validados, verificam a regra, gravam dentro de `DB::transaction()` quando há mais de uma escrita e disparam eventos. Notificações e e-mails só saem depois da confirmação da transação (`afterCommit`).
- **Rules:** regras que não precisam de banco (o username é válido? a transição de estado é permitida?), testadas com testes unitários.
- **Queries:** consultas usadas em mais de um lugar viram uma classe. A regra única de visibilidade pública (`REQUIREMENTS.md` §5.3) é a primeira: listagem, busca, perfil e leitura usam a mesma.
- **Exceptions:** uma recusa de regra de negócio (versão retirada durante a análise) lança uma exceção do domínio com a chave de tradução da mensagem. O controller ou o handler global a transforma em resposta.
- **Controllers:** finos. Autorizam (Policy), chamam a Action ou a Query e devolvem a página Inertia ou o redirecionamento. Não têm regra de negócio.
- **Requests:** toda entrada é validada no servidor, com as mensagens de `lang/`.
- **Resources:** nenhum modelo vai direto para o Inertia. Cada página recebe só os campos de que precisa, por um `JsonResource`, para não expor dados por acidente.
- **Policies:** toda operação protegida passa por uma Policy. Não há liberação geral para o administrador (`Gate::before`), porque ele também tem restrições (D56).
- **Support:** cada integração externa tem um ponto de entrada (`Support/Images`, `Support/Editor`, `Support/Search`). O `Support/Images/ImageProcessor` é o único que usa o Intervention Image (D52); as imagens ficam no disco `config('filesystems.media')` e saem só pela rota `media.show`, que aplica a regra de acesso; como cada imagem chega ao navegador (URL assinada no R2 ou o arquivo local) fica no `Support/Media/MediaDelivery` (D53, D77). Interface só quando houver uma segunda implementação. O Cloudflare R2 é usado pelo filesystem do Laravel (`Storage::disk()`), sem camada própria.
- **E-mail (D71):** a aplicação só envia por `Notification` ou `Mailable` do Laravel, sempre pela fila. O provedor aparece só em `config/mail.php` e no `.env` (`MAIL_MAILER`), e trocar de provedor não muda código. Nunca usar o SDK de um provedor no domínio. O que for específico de um provedor (webhooks de bounce e reclamação) fica em `Support/Mail`, com um adaptador por provedor que traduz o aviso para eventos próprios (`EmailBounced`, `EmailComplained`). O comando `php artisan mail:test {e-mail}` confere a configuração atual.
- **Jobs:** trabalho demorado ou agendado chama uma Action; não repete a regra.

### 2.3 Mapa de autorização

Cada ação dos perfis de `REQUIREMENTS.md` §3 tem uma regra no servidor. As linhas marcadas "fatia N" ganham a Policy junto com a funcionalidade; o frontend só esconde o que a regra já recusa.

| Ação (perfil)                                                              | Regra no servidor                                                                                            | Onde                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| Ler artigos, comentários e perfis; buscar e filtrar (todos)                | Sem login; o que aparece passa pela regra única de visibilidade (§5.3)                                       | Query, fatias 12 a 14             |
| Entrar, ver e atualizar a própria conta (não verificado em diante)         | `auth`; só a própria conta (`$request->user()`)                                                              | Fortify e Configurações           |
| Criar e salvar rascunho (verificado)                                       | `verified` + `ArticlePolicy::create` (conta sem suspensão)                                                   | fatia 8                           |
| Editar, enviar, retirar da fila, excluir e restaurar o próprio artigo      | `ArticlePolicy` (autoria e estado da versão)                                                                 | fatias 8 e 10                     |
| Comentar, responder, editar e excluir o próprio comentário                 | `verified` + `CommentPolicy`                                                                                 | `routes/interactions.php`, feito  |
| Curtir artigos e comentários de outras pessoas                             | `verified` + `LikeContent` (não é o próprio; só artigo visível)                                              | `routes/interactions.php`, feito  |
| Favoritar                                                                  | `verified` + `FavoriteArticle` (só artigo visível); a lista é sempre a da pessoa logada                      | `routes/interactions.php`, feito  |
| Denunciar artigo, comentário ou perfil                                     | `verified` + `SubmitReport` (não é o próprio; uma aberta por item, pelo banco)                               | `routes/interactions.php`, feito  |
| Ver, marcar e excluir as próprias notificações                             | `auth`; só as da pessoa (`UserNotifications::find`)                                                          | `routes/notifications.php`, feito |
| Pedir a exclusão da conta                                                  | `auth` + sem suspensão ativa                                                                                 | fatia 22                          |
| Ativar o 2FA (administradora); desligar (ninguém no MVP)                   | `EnableTwoFactor` e `DisableTwoFactor` no lugar das ações do Fortify (RF-017, RF-019)                        | `Domain/Accounts/Actions`, feito  |
| Gerenciar categorias e tags (administradora)                               | Rotas do painel + `CategoryPolicy` e `TagPolicy` (RF-124, RF-129)                                            | `routes/admin.php`, feito         |
| Abrir o painel da administração                                            | `verified` + Gate `access-admin` + 2FA confirmado (`EnsureTwoFactorConfirmed`)                               | `routes/admin.php`, feito         |
| Aprovar, rejeitar, despublicar, penalizar, julgar denúncias e contestações | Rotas do painel + ações de `Moderation`, que recusam penalizar a si mesma ou outra administradora (P05, R08) | `routes/admin.php`, feito         |

### 2.4 Configuração

`env()` só aparece em `config/*.php`. O código lê `config('...')`.

## 3. Frontend

O frontend segue os mesmos módulos do backend: cada área tem a própria pasta em `components/` e em `pages/`, e o que é de interface genérica fica em `ui/`, separado da estrutura das páginas, que fica em `layouts/`.

```
resources/js/
├── pages/<módulo>/       Páginas Inertia (o nome segue a rota: auth/login)
├── layouts/              Moldura de cada tipo de página (público, leitura, apresentação, conta, editor, admin)
│   └── parts/            Peças que só os layouts usam: cabeçalhos, rodapé, menu da conta e logo
├── components/
│   ├── ui/               Primitivos e design system: botão, campos, pill, mascote, paginação, campo de busca
│   ├── articles/         Cartão, leitura, sumário e selo de status do artigo
│   ├── editor/           Editor, imagens e detalhes do artigo
│   ├── my-articles/      Linhas e avisos de Meus artigos
│   ├── search/           Caixa de busca e filtros
│   ├── landing/          Seções da página de apresentação
│   ├── account/          Configurações, segurança e 2FA
│   ├── admin/            Navegação e peças do painel
│   ├── policies/         Termos e políticas
│   └── preferences/      Tema e idioma (cabeçalhos, rodapé e Configurações)
├── hooks/                Hooks reutilizáveis
├── lib/                  Utilidades (i18n, datas, cn)
├── types/                Tipos compartilhados
└── test/                 Utilidades de teste
```

- **Dependências num sentido só:** `pages` usa `layouts` (pelo `app.tsx`), módulos e `ui`; `layouts` usa `parts`, módulos e `ui`; um módulo usa `ui`, `lib`, `hooks`, `types` e, quando precisa, outro módulo, sem ciclos (hoje só `landing` usa `articles`); `ui` não importa nenhum módulo, layout ou rota. Nenhum módulo importa `layouts` ou `pages`.
- **Onde fica cada componente:** um componente genérico, sem regra de negócio nem rota, usado em mais de um lugar, fica em `components/ui` (botão, campo, aviso, mascote), com as variações como props ou variantes (`size="xl"`), em vez de classes repetidas em cada página. O que pertence a uma área fica na pasta do módulo, mesmo que outra área o use (o cartão de artigo é de `articles`). A estrutura das páginas fica em `layouts/`.
- **Arquivos** em kebab-case (`article-card.tsx`); componentes em PascalCase (`ArticleCard`).
- **Componentes de bibliotecas** entram só como código-fonte do componente usado, quando a tela que o usa é implementada, nunca como dependência (D63).
- **Estilo:** só os tokens do `DESIGN.md`, por classes do Tailwind. Sem hex nem paleta padrão do Tailwind; a paleta padrão foi removida (D60).
- **Texto:** sempre `t('chave')`. As chaves são agrupadas por área (`site.nav.login`, `account.login.headline`).
- **Rotas:** sempre pelas funções geradas pelo Wayfinder (`login()`, `update()`), nunca URL escrita à mão.
- **Regras de negócio** vivem no backend. O frontend pode antecipar uma validação para dar retorno rápido, mas a decisão é sempre do servidor.

## 4. Testes

| Tipo           | Ferramenta               | Onde                                 | O que cobre                                              |
| -------------- | ------------------------ | ------------------------------------ | -------------------------------------------------------- |
| Unidade        | Pest                     | `tests/Unit`                         | Rules e lógica pura, sem banco                           |
| Funcionalidade | Pest                     | `tests/Feature/<Área>`               | Fluxos HTTP, Actions, Policies e persistência no MariaDB |
| Navegador      | Pest + axe               | `tests/Browser`                      | Acessibilidade das telas e fluxos críticos               |
| Componentes    | Vitest + Testing Library | Ao lado do componente (`*.test.tsx`) | Comportamento visível e acessível dos componentes        |

- **Estilo do Pest:** funções (`it()`, `test()`, `expect()`), com descrições em português. É o estilo próprio do Pest e o único que os testes de navegador aceitam.
- **Banco:** os testes de funcionalidade usam `RefreshDatabase` no banco `articles_testing`, no mesmo MariaDB da produção.
- **Factories** têm estados com nome (`->unverified()`, `->admin()`, `->suspended()`).
- **Testes validam comportamento**, não detalhes de implementação: a resposta, o que foi gravado, o que a pessoa vê.
- Cada fatia acrescenta as suas telas ao teste de acessibilidade.

## 5. Ferramentas

| Ferramenta                   | O que verifica                                                 | Comando                |
| ---------------------------- | -------------------------------------------------------------- | ---------------------- |
| Pint (`laravel`)             | Formatação do PHP                                              | `composer lint`        |
| PHPStan + Larastan (nível 7) | Tipos e erros do PHP                                           | `composer types:check` |
| Vite+ (oxlint e oxfmt)       | Lint e formatação do frontend e da documentação                | `npm run check`        |
| TypeScript                   | Tipos do frontend                                              | `npm run types:check`  |
| Hook `commit-msg`            | Mensagem de commit (`CONTRIBUTING.md`)                         | Automático no commit   |
| CI                           | Tudo acima, migrations reversíveis e mensagens de commit do PR | `composer ci:check`    |

`composer ci:check` roda localmente o mesmo que o CI.

## 6. Uma fatia, do começo ao fim

1. Ler os requisitos e as decisões da fatia, e as pranchas do canvas das telas.
2. Apresentar a abordagem, os riscos e o que muda no que já existe.
3. Backend: migration, modelo, Rules, Actions, Policy, Request, controller, rotas e testes.
4. Telas: idênticas às pranchas, com os componentes que elas usam pela primeira vez, traduzidas e com os estados.
5. Testes de componentes e de acessibilidade das telas novas.
6. `composer ci:check`, capturas comparadas com o canvas, commits e PR.
