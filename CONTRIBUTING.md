# Contribuindo

## Mensagens de commit

Os commits seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/). A mensagem diz o que mudou no código e por quê, de forma que quem lê o histórico entenda a mudança sem abrir o diff.

### Formato

```
<tipo>(<escopo>): <descrição>

<corpo opcional>

<rodapé opcional>
```

- **Descrição:** em português, no imperativo ("adiciona", "corrige", "remove"), começando em minúscula, sem ponto final, com até 72 caracteres.
- **Corpo:** explica o motivo e o contexto quando a descrição não basta. Separado da descrição por uma linha em branco.
- **Rodapé:** `BREAKING CHANGE: <o que quebra>` e referências a decisões (`Refs: A16`), quando houver.

### Tipos

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade para o usuário |
| `fix` | Correção de bug |
| `refactor` | Mudança de código sem alterar comportamento |
| `perf` | Melhoria de desempenho |
| `test` | Criação ou ajuste de testes |
| `docs` | Somente documentação |
| `style` | Formatação, sem mudança de lógica |
| `build` | Dependências, build e empacotamento |
| `ci` | Pipelines de integração contínua |
| `chore` | Manutenção que não se encaixa nos tipos acima |
| `revert` | Reversão de um commit anterior |

### Escopos

O escopo é a área do código afetada. Use um destes, ou omita quando a mudança for transversal:

`auth`, `users`, `profile`, `articles`, `editor`, `media`, `categories`, `tags`, `moderation`, `comments`, `likes`, `favorites`, `reports`, `notifications`, `admin`, `audit`, `search`, `i18n`, `theme`, `db`, `deps`, `config`.

### O que não entra na mensagem

- **Fases, tarefas e IDs do roadmap** (`Fase 02`, `p2-01`, `P1`). Eles descrevem o plano, não a mudança.
- **Descrições vagas:** `ajustes`, `melhorias`, `wip`, `update`, `correções diversas`.
- **Nomes de arquivos no lugar do efeito:** `altera User.php` não diz o que aconteceu.
- **Mais de uma mudança não relacionada no mesmo commit.** Se a descrição precisa de "e" para juntar duas coisas diferentes, separe em dois commits.

### Exemplos

| Evite | Prefira |
|---|---|
| `feat: fase 02 concluída` | `feat(auth): exige verificação de e-mail para publicar artigos` |
| `chore: setup inicial p2-01` | `chore: cria aplicação Laravel 13 com React, Inertia e MariaDB` |
| `fix: ajustes` | `fix(comments): impede resposta além do terceiro nível` |
| `refactor: remove coisas do starter kit` | `refactor(auth): remove passkeys do starter kit` |
| `test: testes` | `test(articles): cobre transições inválidas de estado da versão` |
| `update deps` | `build(deps): atualiza Inertia para 3.1` |

Com corpo e rodapé:

```
feat(media): remove metadados EXIF das imagens no upload

Fotos tiradas no celular carregam localização GPS e modelo do
aparelho. Os metadados são descartados antes de salvar o arquivo.

Refs: A16
```
