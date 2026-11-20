# DATABASE — he4rt ink

**Atualizado em:** 19/11/2026

As tabelas do domínio e as convenções de modelagem. As convenções gerais do banco (UTC, collation, datas, migrations reversíveis) estão na seção 3.6 do `DECISIONS.md`. Este documento cresce a cada fatia; a modelagem completa de usuários entra na fatia 3.

## 1. Convenções de modelagem

| Convenção                                                                                                  | Exemplo                                                |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Tabelas no plural e em inglês, colunas em `snake_case`                                                     | `security_events.ip_address`                           |
| Tipos e estados como string, mapeados para um enum do domínio                                              | `type` → `App\Domain\Accounts\Enums\SecurityEventType` |
| Registro de histórico só com `created_at`; nunca é alterado                                                | `SecurityEvent::UPDATED_AT = null`                     |
| Chave estrangeira para a conta vira nula quando a conta é excluída, se o registro precisa sobreviver a ela | `security_events.user_id` (`nullOnDelete`)             |
| Prazo de retenção no método `prunable()` do modelo, com o `model:prune` diário                             | `SecurityEvent::prunable()`                            |

A anonimização de registros de contas excluídas (12 meses, `REQUIREMENTS.md` §2.23) é definida na fatia 3.

## 2. Tabelas

### `security_events`

Eventos de segurança da conta (RF-022, RF-024, D68, D69).

| Coluna       | Tipo              | Observação                                                                         |
| ------------ | ----------------- | ---------------------------------------------------------------------------------- |
| `id`         | bigint            |                                                                                    |
| `user_id`    | bigint, nulo      | A conta, quando o e-mail digitado pertence a uma. Nulo depois da exclusão da conta |
| `type`       | string(40)        | `login_blocked`, `password_changed`; os demais tipos entram com as fatias deles    |
| `email`      | string, nulo      | O e-mail digitado, para analisar tentativas contra contas inexistentes             |
| `ip_address` | string(45), nulo  | IPv4 ou IPv6                                                                       |
| `user_agent` | string(512), nulo | Cortado em 512 caracteres                                                          |
| `created_at` | timestamp         |                                                                                    |

Índice em `(type, created_at)`, usado pela retenção e pela análise do administrador.

**Retenção:** `login_blocked` some depois de 90 dias; os demais tipos ficam enquanto a conta existir.
