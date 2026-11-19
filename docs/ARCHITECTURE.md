# ARCHITECTURE — Plataforma de Artigos

**Atualizado em:** 19/11/2026

Como o código é organizado e escrito. Os princípios estão no `AGENTS.md`; as decisões técnicas, no `DECISIONS.md`; as convenções do banco, na seção 3.6 do `DECISIONS.md` (e, a partir da modelagem de usuários, no `DATABASE.md`).

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

| Módulo          | Responsabilidade                                                                        |
| --------------- | --------------------------------------------------------------------------------------- |
| `Accounts`      | Cadastro, username, verificação, segurança, perfil, termos e aceites, exclusão de conta |
| `Articles`      | Artigos, versões, estados, rascunho, envio e retirada, lixeira                          |
| `Media`         | Imagens: upload, processamento, referências e limpeza                                   |
| `Taxonomy`      | Categorias e tags                                                                       |
| `Moderation`    | Fila, aprovação, rejeição, despublicação, penalidades e contestações                    |
| `Interactions`  | Comentários, curtidas e favoritos                                                       |
| `Reports`       | Denúncias                                                                               |
| `Notifications` | Notificações internas e escolha dos e-mails                                             |
| `Audit`         | Registro de auditoria, só inclusões                                                     |
| `Search`        | Busca e descoberta                                                                      |

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
- **Support:** cada integração externa tem um ponto de entrada (`Support/Images`, `Support/Editor`, `Support/Search`). Interface só quando houver uma segunda implementação. O Cloudflare R2 é usado pelo filesystem do Laravel (`Storage::disk()`), sem camada própria.
- **Jobs:** trabalho demorado ou agendado chama uma Action; não repete a regra.

### 2.3 Configuração

`env()` só aparece em `config/*.php`. O código lê `config('...')`.

## 3. Frontend

```
resources/js/
├── pages/<área>/        Páginas Inertia (o nome segue a rota: auth/login)
├── layouts/             Layouts das páginas (público, conta, aplicação, admin)
├── components/
│   ├── ui/              Base do shadcn/ui ajustada aos tokens
│   ├── effects/         Efeitos copiados de bibliotecas, com fonte e licença no topo
│   ├── blocks/          Seções da página de apresentação
│   ├── site/            Cabeçalho, rodapé, logo, tema e idioma
│   └── <domínio>/       Componentes de uma área (articles/article-card)
├── hooks/               Hooks reutilizáveis
├── lib/                 Utilidades (i18n, cn)
├── types/               Tipos compartilhados
└── test/                Utilidades de teste
```

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
