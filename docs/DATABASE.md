# DATABASE — he4rt ink

**Atualizado em:** 20/11/2026

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

| Coluna     | Tipo               | Observação                                                                       |
| ---------- | ------------------ | -------------------------------------------------------------------------------- |
| `username` | string(30), único  | Minúsculas sem acento, números, `-` e `_`, começando por letra (RF-027 a RF-029) |
| `locale`   | string(5), `pt_BR` | Idioma da conta, usado nos e-mails enviados sem requisição (D62)                 |

**Retenção:** conta que não confirma o e-mail em 7 dias é apagada no 8º dia (`User::prunable()`, RF-023), e username e e-mail ficam livres na hora. Nenhuma data de nascimento é guardada (RF-012).

### `policy_versions`

Versões dos Termos de uso e da Política de privacidade (RF-013, D72). O texto de cada versão fica em `resources/policies/<tipo>/<versão>.<idioma>.md`.

| Coluna         | Tipo       | Observação                                                      |
| -------------- | ---------- | --------------------------------------------------------------- |
| `id`           | bigint     |                                                                 |
| `type`         | string(20) | `terms` ou `privacy`                                            |
| `version`      | string(20) | Ex.: `2026-11-draft`; o sufixo `-draft` marca versão provisória |
| `published_at` | timestamp  | A versão em vigor é a mais recente já publicada                 |

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
