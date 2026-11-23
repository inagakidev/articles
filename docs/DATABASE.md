# DATABASE — he4rt ink

**Atualizado em:** 22/11/2026

As tabelas do domínio e as convenções de modelagem. As convenções gerais do banco (UTC, collation, datas, migrations reversíveis) estão na seção 3.6 do `DECISIONS.md`. Este documento cresce a cada fatia. O perfil (bio e foto) entra na fatia 6.

## 1. Convenções de modelagem

| Convenção                                                                                                  | Exemplo                                                     |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Tabelas no plural e em inglês, colunas em `snake_case`                                                     | `security_events.ip_address`                                |
| Tipos e estados como string, mapeados para um enum do domínio                                              | `type` → `App\Domain\Accounts\Enums\SecurityEventType`      |
| Registro de histórico só com `created_at`; nunca é alterado                                                | `SecurityEvent::UPDATED_AT = null`                          |
| Chave estrangeira para a conta vira nula quando a conta é excluída, se o registro precisa sobreviver a ela | `security_events.user_id` (`nullOnDelete`)                  |
| Prazo de retenção no método `prunable()` do modelo, com o `model:prune` diário                             | `SecurityEvent::prunable()`                                 |
| Registro que depende da conta e não tem valor sem ela é apagado junto                                      | `policy_acceptances.user_id` (`cascadeOnDelete`)            |
| Dado de referência que outros registros citam não é apagado enquanto citado                                | `policy_acceptances.policy_version_id` (`restrictOnDelete`) |

A anonimização de registros de contas excluídas (12 meses, `REQUIREMENTS.md` §2.23) é definida com a exclusão voluntária de conta (fatia 22).

## 2. Tabelas

### `users`

A conta (D72). Além das colunas do Laravel e do Fortify (`name`, `email`, `email_verified_at`, `password`, `remember_token` e as de 2FA):

| Coluna                     | Tipo               | Observação                                                                       |
| -------------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `username`                 | string(30), único  | Minúsculas sem acento, números, `-` e `_`, começando por letra (RF-027 a RF-029) |
| `locale`                   | string(5), `pt_BR` | Idioma da conta, usado nos e-mails enviados sem requisição (D62)                 |
| `is_admin`                 | boolean, `false`   | A administradora da instalação (D56, D75); fora do preenchimento em massa        |
| `bio`                      | string(300), nulo  | Bio do perfil público (RF-025)                                                   |
| `avatar_path`              | string, nulo       | Caminho da foto no disco de mídia (`avatars/<uuid>.webp`, D77)                   |
| `pending_email`            | string, nulo       | E-mail novo esperando a confirmação (RF-030)                                     |
| `pending_email_expires_at` | timestamp, nulo    | Fim do prazo de 24 h da troca                                                    |

**Retenção:** conta que não confirma o e-mail em 7 dias é apagada no 8º dia (`User::prunable()`, RF-023), e username e e-mail ficam livres na hora. Nenhuma data de nascimento é guardada (RF-012).

### `policy_versions`

Versões das três políticas (RF-013, RF-272, D72, D73). O texto de cada versão fica em `resources/policies/<tipo>/<versão>.<idioma>.json`.

| Coluna         | Tipo       | Observação                                      |
| -------------- | ---------- | ----------------------------------------------- |
| `id`           | bigint     |                                                 |
| `type`         | string(20) | `terms` ou `privacy`                            |
| `version`      | string(20) | Rótulo exibido, como `1.0`                      |
| `draft`        | boolean    | Versão provisória, até a validação jurídica     |
| `published_at` | timestamp  | A versão em vigor é a mais recente já publicada |

Único em `(type, version)`.

### `policy_acceptances`

O aceite de cada pessoa (RF-013).

| Coluna              | Tipo      | Observação                                    |
| ------------------- | --------- | --------------------------------------------- |
| `id`                | bigint    |                                               |
| `user_id`           | bigint    | Apagado junto com a conta                     |
| `policy_version_id` | bigint    | A versão não pode ser apagada enquanto aceita |
| `accepted_at`       | timestamp |                                               |

Único em `(user_id, policy_version_id)`.

### `security_events`

Eventos de segurança da conta (RF-022, RF-024, D68, D69).

| Coluna       | Tipo              | Observação                                                                                 |
| ------------ | ----------------- | ------------------------------------------------------------------------------------------ |
| `id`         | bigint            |                                                                                            |
| `user_id`    | bigint, nulo      | A conta, quando o e-mail digitado pertence a uma. Nulo depois da exclusão da conta         |
| `type`       | string(40)        | `login_blocked`, `password_changed`, `email_changed`; os demais entram com as fatias deles |
| `email`      | string, nulo      | O e-mail digitado, para analisar tentativas contra contas inexistentes                     |
| `ip_address` | string(45), nulo  | IPv4 ou IPv6                                                                               |
| `user_agent` | string(512), nulo | Cortado em 512 caracteres                                                                  |
| `created_at` | timestamp         |                                                                                            |

Índice em `(type, created_at)`, usado pela retenção e pela análise do administrador.

**Retenção:** `login_blocked` some depois de 90 dias; os demais tipos ficam enquanto a conta existir.

### `categories`

Categorias fixas, administradas pela administradora (RF-124, D79). As dez iniciais são criadas pela migration.

| Coluna       | Tipo              | Observação                                                        |
| ------------ | ----------------- | ----------------------------------------------------------------- |
| `slug`       | string(60), único | Não muda ao renomear, para os links de filtro seguirem válidos    |
| `name_pt_br` | string(40), único | Nome em português                                                 |
| `name_en`    | string(40), único | Nome em inglês                                                    |
| `color`      | string(20)        | Pastel do DESIGN §2.7 → `App\Domain\Taxonomy\Enums\CategoryColor` |

### `tags`

| Coluna           | Tipo               | Observação                                                      |
| ---------------- | ------------------ | --------------------------------------------------------------- |
| `name`           | string(40), único  | Já normalizado (`TagName::normalize`, RF-128)                   |
| `loose_key`      | string(40), índice | Chave aproximada para sugerir uniões (`TagName::looseKey`, D79) |
| `blocked_at`     | timestamp, nulo    | Bloqueada não pode ser usada (RF-129)                           |
| `merged_into_id` | `tags.id`, nulo    | Unida a outra: vira apelido dela (`nullOnDelete`)               |

### `articles`

O artigo, independente das versões (REQUIREMENTS §5.1, D79).

| Coluna               | Tipo                        | Observação                                                              |
| -------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `user_id`            | `users.id`, nulo            | Autoria; o artigo sobrevive à conta (`nullOnDelete`)                    |
| `state`              | string(20)                  | `unpublished` ou `published` → `ArticleState`                           |
| `current_version_id` | `article_versions.id`, nulo | A versão aprovada em vigor, a que o público lê                          |
| `first_published_at` | timestamp, nulo             | Primeira publicação (RF-137)                                            |
| `deleted_at`         | timestamp, nulo             | Na lixeira; o `state` fica guardado para a restauração (RF-340, RF-341) |

### `article_versions`

Uma cópia completa do conteúdo, com o próprio estado (REQUIREMENTS §5.2, D79).

| Coluna                                        | Tipo                        | Observação                                                                 |
| --------------------------------------------- | --------------------------- | -------------------------------------------------------------------------- |
| `article_id`                                  | `articles.id`               | Apagada junto com o artigo (`cascadeOnDelete`)                             |
| `status`                                      | string(20)                  | `draft`, `pending`, `approved`, `rejected`, `superseded` → `VersionStatus` |
| `title`                                       | string(150), nulo           | RF-078; o rascunho pode ficar vazio (RF-318)                               |
| `content`                                     | JSON, nulo                  | Documento do Tiptap (D51)                                                  |
| `content_text`                                | longtext, nulo              | Texto puro, para busca e contagens                                         |
| `language`                                    | string(5), nulo             | `pt_BR` ou `en` (RF-094)                                                   |
| `category_id`                                 | `categories.id`, nulo       | Não deixa apagar a categoria em uso (`restrictOnDelete`, RF-126)           |
| `based_on_id`                                 | `article_versions.id`, nulo | A versão de onde o rascunho partiu                                         |
| `submitted_at`, `decided_at`                  | timestamp, nulo             | Envio e decisão da revisão                                                 |
| `decided_by_id`                               | `users.id`, nulo            | Quem decidiu (`nullOnDelete`)                                              |
| `decision_reason`                             | text, nulo                  | Justificativa da rejeição ou despublicação                                 |
| `draft_slot`, `pending_slot`, `approved_slot` | gerada, única               | `article_id` quando o status bate; garante RF-351 no banco                 |

### `article_version_tag`

Tags de cada versão (chave composta). Apagar a versão ou a tag apaga a ligação.

### `article_images`

Imagens enviadas para um artigo (RF-079 a RF-091, D52, D81). Os arquivos ficam no disco de mídia em `images/<uuid>/original.webp` e `images/<uuid>/<largura>.webp`.

| Coluna       | Tipo             | Observação                                                    |
| ------------ | ---------------- | ------------------------------------------------------------- |
| `uuid`       | uuid, único      | Nome no disco e na URL; o id numérico não aparece             |
| `article_id` | `articles.id`    | Apagada junto com o artigo (`cascadeOnDelete`)                |
| `user_id`    | `users.id`, nulo | Quem enviou (`nullOnDelete`)                                  |
| `width`      | smallint         | Largura do original tratado (até 3.200 px)                    |
| `height`     | smallint         | Altura do original tratado                                    |
| `size`       | int              | Bytes do original tratado                                     |
| `variants`   | JSON, nulo       | Larguras já geradas pela fila (480, 960, 1600, só as menores) |

Índice em `created_at`, para a limpeza das imagens sem uso (p4-11).

### `article_version_image`

Imagens citadas por cada versão, no texto ou na capa (chave composta). Decide quem pode ver a imagem (RF-090) e o que a limpeza preserva. Recalculada a cada salvamento do rascunho.

A versão ganhou `cover_image_id` (`article_images.id`, nulo, `nullOnDelete`), `cover_alt` (string(250), nulo) e `cover_decorative` (boolean, `false`).
