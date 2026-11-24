# DECISIONS — he4rt ink

**Atualizado em:** 23/11/2026

Registro das decisões de produto e de arquitetura, com contexto, alternativas consideradas e impacto. Os requisitos resultantes estão em `REQUIREMENTS.md`; a visão do produto está em `PRODUCT.md`.

Cada decisão tem um destes status:

- **Aprovada:** decidida explicitamente.
- **Recomendada:** sugestão técnica ainda não aprovada.
- **Pendente:** sem decisão.

---

## 1. Decisões da auditoria da P1 — Prioridade 1

### A01 — Estado do artigo separado do estado da versão

- **Status:** Aprovada (12/11/2026).
- **Contexto:** a tabela de transições original fazia um artigo publicado sair do ar ao ser editado e virar "rejeitado" quando a edição era recusada, contrariando as regras de edição.
- **Decisão:** o artigo tem estado próprio (não publicado, publicado, na lixeira) e cada versão tem o seu (rascunho, pendente, aprovada em vigor, rejeitada, substituída). A versão enviada é um retrato congelado. Com uma versão pendente, o autor pode continuar editando e pode retirá-la da fila.
- **Alternativas descartadas:** um único estado por artigo; bloquear a edição enquanto há versão pendente; permitir edição sem possibilidade de retirada.
- **Impacto:** define a modelagem de artigos e versões, a fila de moderação, as seções de "Meus artigos" e a regra de visibilidade pública.

### A02 — Artigos após a exclusão definitiva da conta

- **Status:** Aprovada (12/11/2026).
- **Contexto:** o documento não dizia o que acontecia com os artigos após a exclusão definitiva.
- **Decisão:** os artigos permanecem no ar com o autor anonimizado. A tela de exclusão informa que o usuário pode mandar artigos para a lixeira antes. Durante a carência de 20 dias, perfil, comentários e curtidas ficam ocultos; os artigos continuam visíveis com o nome do autor.
- **Alternativas descartadas:** excluir os artigos junto com a conta; perguntar ao usuário em um fluxo próprio; manter tudo visível durante a carência; ocultar só o perfil.
- **Impacto:** preserva links e conteúdo usado pela comunidade; exige um "autor anonimizado" no modelo; afeta denúncias (ver derivadas).

### A03 — Penalidades durante a exclusão voluntária

- **Status:** Aprovada (12/11/2026).
- **Contexto:** a regra original impedia suspender uma conta em exclusão, permitindo fugir da suspensão pedindo exclusão e cancelando depois. O mesmo ponto aparecia como pendente.
- **Decisão:** uma conta em carência pode ser penalizada; se o usuário cancelar a exclusão, a penalidade continua valendo. Banimento durante a carência é executado imediatamente. Um usuário suspenso só pode pedir a exclusão depois que a suspensão terminar.
- **Alternativas descartadas:** bloquear o cancelamento enquanto houver processo aberto; manter a regra original.
- **Impacto:** fecha a brecha e remove a pendência original. Ponto de atenção: a LGPD trata a exclusão como direito do titular; manter um canal de contato para pedidos feitos durante a suspensão e validar com assessoria jurídica.

### A04 — Retenção da conta no banimento e fim da restauração após exclusão

- **Status:** Aprovada (12/11/2026).
- **Contexto:** o documento prometia restaurar conta e perfil depois do banimento e da exclusão definitiva, mas mandava apagá-los antes de qualquer contestação.
- **Decisão:** no banimento, conteúdos e interações são excluídos imediatamente; conta e perfil ficam retidos, ocultos e inacessíveis até o fim do prazo de contestação ou até a decisão de uma contestação em análise, e então são excluídos. Após a exclusão definitiva voluntária, não há restauração; uma contestação aceita apenas anula a penalidade no histórico. A reabertura do prazo de contestação só é possível enquanto a conta estiver retida.
- **Alternativas descartadas:** banimento sem retenção e sem restauração; reabertura sempre possível sem restauração; proibir a reabertura.
- **Impacto:** torna a contestação de banimento cumprível; cria um período curto e justificado de retenção.

### A05 — Suspensão oculta em vez de apagar

- **Status:** Aprovada (12/11/2026).
- **Contexto:** a suspensão apagava rascunhos, pendentes e rejeitadas, mas preservava a lixeira; uma contestação aceita não devolvia o conteúdo.
- **Decisão:** durante a suspensão, rascunhos, rejeitadas e lixeira ficam ocultos e preservados; versões pendentes saem da fila e voltam a ser rascunho. Na reativação, tudo volta.
- **Alternativa descartada:** manter a exclusão e registrar a perda.
- **Impacto:** suspensões revertidas não causam perda; a lixeira deixa de ser exceção.

### A06 — Término da suspensão e reativação após contestação

- **Status:** Aprovada (12/11/2026); a reativação após contestação aceita foi alterada pela D63 (19/11/2026): passa a ser imediata, sem autorização.
- **Decisão:** a suspensão termina automaticamente no fim do prazo, com aviso por e-mail. Com contestação de suspensão aceita, a penalidade é anulada e um administrador autoriza a reativação, com justificativa registrada. A contestação é feita pelo link do e-mail da penalidade, sem login.
- **Alternativas descartadas:** reativação sempre manual; reativação imediata ao aceitar a contestação.
- **Impacto:** elimina a dependência de ação manual no fim da suspensão; resolve o acesso ao formulário de contestação com a conta inacessível.

### A07 — Ciclo das denúncias e despublicação

- **Status:** Aprovada (12/11/2026).
- **Contexto:** denúncias não tinham motivo, status nem desfecho; o administrador só tinha medidas extremas para artigos publicados.
- **Decisão:** denúncias têm motivo, status (aberta, procedente, improcedente) e decisão com justificativa; um usuário pode ter uma denúncia aberta por item. O denunciante recebe apenas o aviso de que a denúncia foi analisada. Perfis (bio, foto e username) podem ser denunciados. O administrador pode despublicar um artigo com justificativa; o artigo volta ao autor pelo fluxo da rejeição. A exclusão permanente pelo administrador exige justificativa e notifica o autor.
- **Alternativas descartadas:** ciclo sem despublicação; informar o desfecho ao denunciante; nenhum retorno; denúncias só de artigos e comentários.
- **Impacto:** dá desfechos ao painel de denúncias; adiciona uma ação proporcional reaproveitando o fluxo de rejeição.

### A08 — Administração no MVP

- **Status:** Aprovada (12/11/2026).
- **Decisão:** o MVP tem um único administrador, criado na instalação. Com um único administrador, as regras de conflito de interesse ficam dispensadas. A tela de gestão de administradores fica para depois do MVP; quando existir, a gestão será pelo painel. Códigos de recuperação do 2FA são obrigatórios.
- **Alternativas descartadas:** exigir no mínimo dois administradores; gestão por comando no servidor; tela de gestão no MVP.
- **Riscos assumidos:** o único administrador aprova os próprios artigos e julga contestações das penalidades que aplicou; perda de acesso do administrador depende dos códigos de recuperação.

### A09 — Escopo do MVP

- **Status:** Aprovada (12/11/2026).
- **Decisão:** classificação da seção 8 de `REQUIREMENTS.md`, incluindo no MVP as notificações internas, os e-mails, a interface completa em PT e EN, a contestação de penalidades e o WCAG 2.2 AA como piso.
- **Alternativas descartadas:** notificações internas depois do MVP; MVP só em PT com estrutura pronta para EN.
- **Risco assumido:** MVP grande para um projeto de portfólio; moderação e mídia são os blocos mais caros.

### A10 — Mudanças em relação ao plano anterior

- **Status:** Aprovada (12/11/2026).
- **Decisão:** o editor é Rich Text, substituindo o Markdown do plano anterior. As curtidas em comentários voltam ao escopo (haviam sido omitidas por esquecimento).
- **Impacto:** o Rich Text exige regras de acessibilidade para cores e destaques (A15) e sanitização mais cuidadosa. A regra "um usuário não curte o mesmo comentário mais de uma vez" continua válida. O `PRODUCT.md` e o painel de acompanhamento precisam refletir as mudanças.

### A11 — Organização da documentação

- **Status:** Aprovada (12/11/2026).
- **Decisão:** os requisitos ficam em `REQUIREMENTS.md`, as decisões e a arquitetura em `DECISIONS.md`, e o `PRODUCT.md` continua curto e estratégico, no padrão product.md.
- **Impacto:** o antigo product.md (documento de requisitos) foi dividido entre esses arquivos sem alteração de decisões além das registradas acima.

## 1b. Decisões da auditoria da P1 — Prioridade 2

### A12 — Termos, políticas e idade mínima

- **Status:** Aprovada (12/11/2026).
- **Contexto:** a moderação se apoiava em "conteúdo inadequado" sem uma política pública; faltavam política de privacidade e idade mínima.
- **Decisão:** três páginas públicas (Termos de uso, Política de conteúdo, Política de privacidade); aceite de Termos e Privacidade no cadastro com registro de data e versão, e novo aceite no próximo login quando mudarem. Rejeições, despublicações e penalidades indicam o item da Política de conteúdo violado, além da justificativa. Idade mínima de 16 anos, por autodeclaração, sem armazenar data de nascimento. Apenas cookies essenciais no MVP.
- **Alternativas descartadas:** aceite sem nova versão; justificativa só em texto; idades mínimas de 18 ou 13 anos; data de nascimento no cadastro.
- **Ponto de atenção:** validar com assessoria jurídica os requisitos da LGPD para adolescentes, cookies e pedidos de titulares.

### A13 — Leitura pública dos comentários

- **Status:** Aprovada (12/11/2026).
- **Decisão:** todos leem os comentários, inclusive visitantes; só usuários verificados participam. Para quem não pode participar, não há formulário nem convite.
- **Alternativas descartadas:** leitura só para verificados; leitura só para usuários logados.
- **Impacto:** comentários ficam públicos e indexáveis, com o nome do autor; a Política de privacidade precisa informar isso.

### A14 — Exclusão em cascata e evidências de denúncia

- **Status:** Aprovada (12/11/2026).
- **Decisão:** excluir um comentário apaga todas as respostas, em todos os casos, inclusive no banimento. A denúncia não guarda cópia do conteúdo denunciado.
- **Alternativas descartadas:** marcador "comentário removido" mantendo as respostas; cópia do conteúdo na denúncia.
- **Riscos assumidos:** uma pessoa pode apagar respostas úteis de terceiros ao excluir o comentário de origem; o autor de um conteúdo denunciado pode editá-lo ou excluí-lo antes da análise, e o administrador vê apenas a versão atual.

### A15 — Acessibilidade do editor e das imagens

- **Status:** Aprovada (12/11/2026).
- **Decisão:** cores de texto e destaques vêm de uma paleta fixa, com variações para os temas claro e escuro, todas com contraste mínimo de 4,5:1; o artigo guarda o nome da cor. Sublinhado e texto justificado saem do editor. Texto alternativo obrigatório, com opção explícita de imagem decorativa; legenda opcional.
- **Alternativas descartadas:** remover cores e destaques; manter sublinhado ou justificado; texto alternativo opcional com conformidade parcial.
- **Impacto:** mantém o piso WCAG 2.2 AA sem exceções; exige a paleta em `DESIGN.md`.

### A16 — Imagens

- **Status:** Aprovada (12/11/2026).
- **Decisão:** formatos JPG, PNG e WebP (sem SVG e GIF); metadados removidos no upload; imagens de versões pendentes privadas até a aprovação; limite de cinco imagens internas por versão; são guardadas as 5 versões substituídas mais recentes por artigo.
- **Alternativas descartadas:** aceitar GIF; guardar todas as versões ou as 10 mais recentes.
- **Impacto:** reduz riscos de XSS e de exposição de localização; limita o crescimento do armazenamento.

### A18 — Notificações e e-mails

- **Status:** Aprovada (12/11/2026).
- **Decisão:** aviso ao e-mail antigo quando o e-mail é alterado; aviso de senha alterada; notificação de perfil moderado. O autor de um comentário removido por outra pessoa não é avisado. "Notificações pausadas" significa que as existentes ficam guardadas e o prazo de 90 dias para de contar. Denúncia cujo conteúdo foi excluído antes da análise é encerrada como "conteúdo removido".
- **Alternativas descartadas:** avisar o autor do comentário removido pelo administrador ou pelo autor do artigo.

### A19 — Username, contas não verificadas e troca de e-mail

- **Status:** Aprovada (12/11/2026).
- **Decisão:** username de 3 a 30 caracteres, só minúsculas sem acento, números, hífen e sublinhado, começando por letra, com palavras reservadas. Username liberado fica disponível imediatamente. Contas não verificadas em 7 dias são excluídas. Na troca de e-mail, o usuário segue verificado com o antigo até confirmar o novo em até 24 horas.
- **Alternativas descartadas:** bloquear o username liberado por 90 dias com redirecionamento; nunca reutilizar; excluir contas não verificadas em 30 dias ou mantê-las.
- **Risco assumido:** outra pessoa pode assumir imediatamente o username de alguém conhecido, e links antigos do perfil passam a apontar para ela.

### A20 — Retenção e auditoria

- **Status:** Aprovada (12/11/2026).
- **Decisão:** tabela única de retenção (seção 2.23 de `REQUIREMENTS.md`), incluindo imagens órfãs em 24 horas, denúncias encerradas em 12 meses e tentativas suspeitas de login em 90 dias. A auditoria só aceita inclusões; a única remoção é a da tabela de retenção. A exclusão permanente de artigo é auditada sem conteúdo. Das ações de autores, só eventos de segurança da conta são auditados.
- **Alternativas descartadas:** auditar ações editoriais dos autores; não auditar autores.
- **Impacto:** resolve a contradição entre "preservar o histórico" e a retenção de 12 meses.

### A23 — Entidades conceituais e stack

- **Status:** Aprovada (12/11/2026).
- **Decisão:** acrescentar Penalty, AccountDeletionRequest, SecurityEvent, PolicyVersion e PolicyAcceptance, e ligar ArticleImage às versões. Banco de dados: MariaDB. Stack confirmada: PHP 8.4, Laravel 13, React com TypeScript, Inertia.js, Tailwind CSS, Pest e Vitest.
- **Alternativa descartada:** MySQL.

## 1c. Decisões da auditoria da P1 — Prioridade 3 e pendências originais

### A17 — Descoberta

- **Status:** Aprovada (12/11/2026).
- **Decisão:** ordenação padrão "mais curtidos dos últimos 30 dias". A popularidade é o período em que as curtidas são contadas (7, 30 ou 90 dias, ou histórico completo), com padrão de 30 dias. O artigo mostra a data da primeira publicação, com "atualizado em" quando houver nova versão aprovada; "mais recentes" usa a primeira publicação.
- **Alternativas descartadas:** ordenação padrão por mais recentes ou por curtidas no histórico completo; retirar o filtro de popularidade; usar a data da última versão aprovada.
- **Impacto técnico:** a listagem pública precisa de contagens de curtidas pré-calculadas por período.

### A21 — Campos obrigatórios e lixeira com versão pendente

- **Status:** Aprovada (12/11/2026).
- **Decisão:** para enviar, são obrigatórios título, conteúdo, categoria, idioma e o texto alternativo das imagens; capa e tags são opcionais; rascunhos podem ser salvos vazios. Mandar para a lixeira um artigo com versão pendente a retira da fila e a devolve a rascunho.
- **Alternativas descartadas:** capa e/ou ao menos uma tag obrigatórias.

### A22 — Restauração de versão antiga

- **Status:** Aprovada (12/11/2026).
- **Decisão:** restaurar uma versão aprovada antiga (depois do MVP) sempre passa por aprovação; a restauração cria uma versão pendente.
- **Alternativas descartadas:** publicação imediata; publicação imediata só sem moderação posterior.

### A24 — Simplificação de mecânicas caras

- **Status:** Aprovada (12/11/2026).
- **Decisão:** os prazos "pausados" na suspensão (lixeira e notificações) são implementados como extensão do prazo pelos dias de suspensão, com as rotinas de limpeza ignorando itens de usuários suspensos. A contagem de visitas de anônimos será reavaliada quando entrar, depois do MVP.

### A25 — Casos de borda de permissões

- **Status:** Aprovada (12/11/2026).
- **Decisão:** o autor não curte o próprio artigo nem o próprio comentário (favoritar o próprio artigo é permitido); ninguém denuncia o próprio conteúdo; o perfil de um usuário suspenso fica oculto.
- **Motivo:** a ordenação padrão por curtidas tornaria a autocurtida uma forma de autopromoção; o perfil sem artigos expunha a suspensão publicamente.

### Pendências originais resolvidas

| Código | Pendência                                   | Decisão                                                                                                                      |
| ------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| P01    | Exclusão de artigo e histórico de versões   | Todas as versões são apagadas; imagens pela rotina de imagens sem uso                                                        |
| P02    | Exclusão de artigo e comentários            | Comentários e respostas são apagados                                                                                         |
| P03    | Exclusão de artigo e denúncias              | Denúncias abertas encerradas como "conteúdo removido"                                                                        |
| P04    | Versões pendentes na exclusão de conta      | Voltam a rascunho no pedido; na exclusão definitiva, publicados ficam só com a versão em vigor e não publicados são apagados |
| P05    | Edição pelo administrador durante a análise | Não permitida; o administrador aprova ou rejeita                                                                             |
| P06    | Reenvio de artigos rejeitados               | Sem espera (alterada pela D63; antes, 24 horas após cada rejeição)                                                           |
| P07    | Limite de tamanho do artigo                 | Título até 150 caracteres; conteúdo até 50.000                                                                               |
| P08    | Limites dos comentários                     | Até 2.000 caracteres, um a cada 30 segundos, respostas até 3 níveis                                                          |
| P09    | Autor do artigo denunciando comentários     | Permitido                                                                                                                    |
| P10    | Notificações de curtidas e favoritos        | Só curtidas (em artigos e comentários próprios), agrupadas por item                                                          |

Todas aprovadas em 12/11/2026.

## 1d. Decisões de produto registradas no PRODUCT.md

| Tema                  | Decisão                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Administradora do MVP | Amanda, responsável pelo projeto, como única administradora.                                                                                                 |
| Métricas de sucesso   | Artigos publicados por mês e autores ativos por mês (autores com pelo menos um artigo aprovado no mês).                                                      |
| Oferta                | Gratuita para ler e publicar durante o MVP; o modelo será revisto depois.                                                                                    |
| Problema e propósito  | A comunidade já publica no dev.to; a plataforma é o espaço próprio da He4rt, com publicação revisada. É, antes de tudo, um projeto de estudo e de portfólio. |

Todas aprovadas em 12/11/2026.

---

## 2. Regras derivadas

Propostas como consequência das decisões acima e confirmadas explicitamente em 12/11/2026. Status: Aprovada.

| Regra | Origem | Descrição                                                                                                                                  |
| ----- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| R01   | A01    | No máximo um rascunho e uma versão pendente por artigo ao mesmo tempo.                                                                     |
| R02   | A01    | Ao retirar a pendente, ela volta a ser o rascunho; se houver um rascunho mais recente, o autor escolhe qual manter.                        |
| R03   | A01    | Se o autor retirar a versão durante a análise, a retirada prevalece e a decisão do administrador é recusada com aviso.                     |
| R04   | A01    | O autor corrige uma versão rejeitada criando um rascunho a partir dela.                                                                    |
| R05   | A01    | O salvamento automático não cria versões.                                                                                                  |
| R06   | A02    | Durante a carência, o nome do autor aparece nos artigos sem link para o perfil.                                                            |
| R07   | A02    | Durante a carência, as contagens de curtidas caem e voltam se a exclusão for cancelada.                                                    |
| R08   | A02    | Artigos anonimizados não podem ser editados; o administrador pode despublicar ou excluir.                                                  |
| R09   | A02    | Comentários e curtidas de outros usuários em artigos anonimizados permanecem.                                                              |
| R10   | A02    | Denúncias contra artigos que permanecem no ar continuam abertas após a exclusão da conta do autor.                                         |
| R11   | A06    | _Revogada pela D63:_ a reativação após contestação aceita é imediata.                                                                      |
| R12   | A07    | Desfechos de denúncia de perfil: redefinir foto e bio para o padrão; exigir troca de username no próximo acesso; casos graves, penalidade. |
| R13   | A07    | Lista inicial de motivos: spam, ofensa ou assédio, plágio, informação enganosa, outro.                                                     |
| R14   | A08    | Reset do 2FA do administrador por comando no servidor, como último recurso.                                                                |
| R15   | A08    | Com mais de um administrador, as regras de conflito de interesse passam a valer.                                                           |
| R16   | A10    | Curtidas em comentários seguem as mesmas regras das curtidas em artigos.                                                                   |

---

## 3. Decisões técnicas iniciais

### 3.1. Stack [A23]

| Camada         | Tecnologia                         | Status   |
| -------------- | ---------------------------------- | -------- |
| Backend        | PHP 8.4 + Laravel 13               | Aprovada |
| Frontend       | React + TypeScript                 | Aprovada |
| Integração     | Inertia.js                         | Aprovada |
| Banco de dados | MariaDB                            | Aprovada |
| Estilização    | Tailwind CSS                       | Aprovada |
| Testes         | Pest (backend) e Vitest (frontend) | Aprovada |
| Editor         | Tiptap 3 + tiptap-php [D51]        | Aprovada |
| Imagens        | Intervention Image 4 [D52]         | Aprovada |
| Armazenamento  | Cloudflare R2 [D53]                | Aprovada |
| Busca          | MariaDB FULLTEXT [D54]             | Aprovada |
| Backup         | Spatie Laravel Backup + R2 [D55]   | Aprovada |
| Administrador  | Coluna `is_admin` [D56]            | Aprovada |

### 3.2. Organização em módulos

Autenticação e usuários; perfis; artigos; editor e mídia; categorias e tags; publicação e aprovação; comentários; curtidas e favoritos; denúncias; notificações; moderação; administração e auditoria; pesquisa e descoberta; métricas e visualizações.

### 3.3. Entidades conceituais

User, Profile, Article, ArticleVersion, ArticleImage, Category, Tag, ArticleTag, Comment, Like, Favorite, Report, Notification, AdminAuditLog, Appeal, ArticleView, Penalty, AccountDeletionRequest, SecurityEvent, PolicyVersion, PolicyAcceptance.

Ajustes decorrentes das decisões:

- **Article** e **ArticleVersion** seguem o modelo de dois estados [A01].
- **ArticleImage** se liga às versões, não ao artigo; uma imagem pode ser compartilhada entre versões [A16] [A23].
- **Like** cobre artigos e comentários [A10].
- **Report** tem motivo, status e alvo (artigo, comentário ou perfil) [A07].
- **Penalty** guarda suspensões e banimentos, com tipo, motivo, item da política, duração, responsável e status (ativa, encerrada, anulada); **Appeal** se refere a uma Penalty [A23].
- **AccountDeletionRequest** guarda a carência de 20 dias e seu status (em carência, cancelado, concluído) [A23].
- **SecurityEvent** guarda tentativas suspeitas de login e eventos de segurança da conta [A20] [A23].
- **PolicyVersion** e **PolicyAcceptance** guardam as versões dos termos e os aceites [A12] [A23].

Esta lista é conceitual e não representa o modelo definitivo do banco de dados.

### 3.4. Diretrizes arquiteturais

| Diretriz                                                                                                                                                            | Status                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Separar artigo de versões, permitindo histórico, aprovação de edições e preservação da versão publicada                                                             | Aprovada [A01]          |
| Autorização no backend; a interface não é camada de segurança                                                                                                       | Aprovada                |
| Registrar ações administrativas com responsável, data, tipo e informações de rastreabilidade                                                                        | Aprovada                |
| Separar notificações internas do envio de e-mails                                                                                                                   | Recomendada             |
| Centralizar o gerenciamento de imagens (upload, validação, otimização, tamanhos, alt, legenda, limpeza de órfãos)                                                   | Recomendada             |
| Filas para operações demoradas: e-mails, imagens, exclusões programadas, limpeza de registros, métricas                                                             | Recomendada             |
| Uma regra única de visibilidade pública usada em todas as consultas públicas                                                                                        | Recomendada (auditoria) |
| Operações transacionais para aprovação, rejeição, penalidades, exclusão de conta, curtidas e transferência de categoria; e-mails só após a confirmação da transação | Recomendada (auditoria) |
| Contagens armazenadas de curtidas e favoritos, com recálculo periódico                                                                                              | Recomendada (auditoria) |
| Exclusões em massa como operações de domínio auditadas, não cascatas automáticas no banco                                                                           | Recomendada (auditoria) |
| Rich Text armazenado em formato estruturado, sanitizado na exibição, com texto puro extraído para busca e contagens                                                 | Recomendada (auditoria) |

### 3.5. Pontos técnicos não definidos

- Estratégia de cache.
- Provedor de e-mail transacional (p8-01, D71). A hospedagem foi decidida na D78.
- Política técnica de exclusão e retenção.
- Processamento de visualizações.

Editor, imagens, busca, backup e identificação do administrador foram decididos em D51 a D56; o versionamento do conteúdo, na D79.

### 3.6. Convenções do banco de dados

Aprovadas em 18/11/2026, depois de uma auditoria das migrations.

| Convenção                                              | Motivo                                                                                                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conexão sempre em UTC (`time_zone = '+00:00'`)         | Com o fuso do servidor, valores padrão do banco ficavam 3 horas atrás da aplicação, e todas as datas andavam 3 horas ao mudar de servidor ou restaurar um backup. Coberto por teste |
| Collation `utf8mb4_uca1400_ai_ci`                      | A `utf8mb4_unicode_ci` trata todos os emojis como iguais e quebraria campos únicos, como tags. A nova continua sem diferenciar maiúsculas e acentos. Coberto por teste              |
| Datas em inteiro (Unix) sempre sem sinal               | Inteiros com sinal param em janeiro de 2038                                                                                                                                         |
| Toda migration desfaz o que faz                        | O CI desfaz e refaz todas as migrations em cada execução                                                                                                                            |
| Migrations já aplicadas em produção nunca são editadas | Até o primeiro deploy, as migrations iniciais ainda podem ser corrigidas, porque não há dados a preservar; depois, toda mudança é uma migration nova                                |

As convenções de modelagem (chaves estrangeiras, estados, índices e anonimização de contas) serão definidas no `DATABASE.md`, na modelagem de usuários.

---

## 4. Decisões durante a implementação

### D50 — Times e passkeys do starter kit

- **Status:** Aprovada (12/11/2026).
- **Contexto:** o starter kit React do Laravel 13 criou tabelas e código para times (`teams`, `current_team_id`) e para passkeys, que não estão no `REQUIREMENTS.md`.
- **Decisão:** remover times e passkeys antes da Fase 03. As colunas de 2FA permanecem, para o 2FA obrigatório da administradora e o 2FA de usuários previsto para depois do MVP.
- **Alternativas descartadas:** manter passkeys; manter os dois.
- **Motivo:** ainda não há código próprio sobre esses recursos; removê-los depois das Policies e do modelo de usuários custaria muito mais.

### D51 — Editor Rich Text

- **Status:** Aprovada (14/11/2026).
- **Contexto:** RF-066 a RF-078 e A15 exigem tabelas, código, alinhamento restrito, cores e destaques de paleta fixa guardados pelo nome e nenhum sublinhado. A diretriz 3.4 pede Rich Text em formato estruturado, sanitizado na exibição, com texto puro extraído.
- **Decisão:** Tiptap 3 no frontend, com conteúdo persistido em JSON. As extensões habilitadas são só as previstas nos requisitos: sublinhado desligado (vem ativo no StarterKit), alinhamento limitado a esquerda, centro e direita, cor e destaque por uma extensão própria que grava o nome da cor. No backend, o tiptap-php valida o JSON, gera o HTML aceitando apenas os elementos permitidos e extrai o texto puro para busca, contagem de palavras e tempo de leitura. Prévia e página pública usam a mesma renderização no servidor.
- **Alternativas descartadas:** Lexical e Plate (sem renderizador em PHP; sanitização dependeria do navegador ou de um servidor Node); CKEditor 5 (persiste HTML e tem licença GPL ou comercial).
- **Esquema único:** os elementos, formatações e atributos permitidos, os nomes das cores da paleta e os alinhamentos aceitos ficam em um único arquivo de esquema, lido pelas extensões do Tiptap e do tiptap-php. Nenhum dos lados mantém lista própria.
- **Testes de paridade:** um conjunto compartilhado de documentos JSON de exemplo, cada um com o HTML esperado, cobre todos os elementos permitidos e casos proibidos (sublinhado, texto justificado, cor fora da paleta, `<script>`). Vitest e Pest verificam os mesmos arquivos.
- **Conteúdo fora do esquema:** no envio para aprovação, o servidor recusa o documento com erro de validação, em vez de remover em silêncio o que não reconhece. O autor nunca envia algo diferente do que viu na prévia.
- **Riscos:** o esquema é interpretado por duas bibliotecas; os testes de paridade detectam divergências, mas precisam acompanhar cada extensão nova. O tiptap-php tem ciclo de lançamentos mais lento que o Tiptap; uma atualização do Tiptap pode exigir extensão PHP própria.

### D52 — Processamento de imagens

- **Status:** Aprovada (14/11/2026).
- **Contexto:** RF-079 a RF-091 e A16 exigem JPG, PNG e WebP, remoção de metadados, vários tamanhos, limite de 10 MB e imagens compartilhadas entre versões.
- **Decisão:** Intervention Image 4 com o driver GD, usado por um único componente de processamento. A imagem é regravada (o que descarta EXIF, GPS e modelo do aparelho) depois de corrigida a orientação; o original tratado é guardado e os tamanhos derivados são gerados em WebP, em fila. Um arquivo físico não pertence a uma versão: as versões referenciam imagens, e a remoção acontece pela rotina de imagens sem referência (24 horas).
- **Alternativas descartadas:** spatie/laravel-medialibrary (cada mídia pertence a um único registro, o que conflita com o compartilhamento entre versões); usar GD diretamente.
- **Impacto:** o servidor de produção precisa de GD com WebP e da extensão `exif`.

### D53 — Armazenamento de imagens

- **Status:** Aprovada (14/11/2026).
- **Decisão:** Cloudflare R2, acessado só pelo filesystem do Laravel (driver S3); em desenvolvimento, disco local. Imagens e backups ficam em buckets separados, com credenciais independentes e menor privilégio.
- **Entrega:** o bucket de imagens é privado. As imagens são servidas por uma rota da aplicação que aplica a regra de acesso (pendente: só autor e administrador; aprovada: pública) e redireciona para uma URL pré-assinada de curta duração. A expiração é arredondada para janelas fixas, para que a URL fique estável e o navegador consiga reaproveitar o cache.
- **Alternativas consideradas:** disco local do servidor (prende a aplicação a uma máquina e mistura arquivos com o backup do servidor); bucket público com cópia na aprovação (exige mover arquivos na aprovação, despublicação e suspensão, e complica imagens compartilhadas); servir os bytes pela aplicação (gasta PHP e banda do servidor sem necessidade).
- **Impacto:** exige o pacote `league/flysystem-aws-s3-v3`. Se o desempenho exigir CDN para imagens aprovadas, a alternativa é um segundo bucket público só com derivados de imagens aprovadas.

### D54 — Busca

- **Status:** Aprovada (14/11/2026).
- **Decisão:** índice FULLTEXT do MariaDB, sem mecanismo externo e sem Laravel Scout. A consulta de busca fica em um único componente, que compõe a regra única de visibilidade pública (p5-01); nenhum outro módulo monta `MATCH ... AGAINST`. Uma interface só será criada quando houver uma segunda implementação (Meilisearch), se houver necessidade comprovada.
- **Alternativas descartadas:** Meilisearch ou Typesense no MVP (serviço extra e regra de visibilidade replicada no índice); Scout com driver de banco (camada sem ganho atual).
- **Riscos:** sem tolerância a erros de digitação nem variações de palavras. O InnoDB ignora palavras com menos de 3 caracteres (`innodb_ft_min_token_size`), o que afeta termos técnicos como "Go", "JS", "UI" e "C#". Mitigação definida na p5-04 (D85): termos curtos tratados no código, sem mudar o servidor.

### D55 — Backups

- **Status:** Aprovada (14/11/2026).
- **Decisão:** spatie/laravel-backup, com backup diário do banco, retenção de sete cópias diárias e quatro semanais, destino em bucket R2 privado exclusivo para backups, notificação por e-mail em caso de falha ou backup antigo e teste de restauração na p8-05.
- **Imagens:** o pacote copia apenas arquivos locais e não lê o bucket de imagens. As imagens terão uma cópia própria e agendada do bucket de imagens para o bucket de backups, guardando por um período os objetos apagados, para que uma restauração do banco encontre as imagens que ele referencia.
- **Conta separada:** o bucket de backups fica em uma conta Cloudflare diferente da conta das imagens, para que a suspensão de uma conta ou uma credencial comprometida não atinja imagens e backups ao mesmo tempo. A credencial da aplicação acessa só esse bucket. Como a limpeza das cópias antigas e o monitoramento do pacote precisam listar e apagar, a proteção contra exclusão indevida vem de uma regra de retenção (bloqueio) no próprio bucket, que impede apagar cópias recentes mesmo com a credencial comprometida. A disponibilidade desse recurso no R2 e o prazo do bloqueio são confirmados ao configurar o backup (p8-05).
- **Riscos:** imagens e backups continuam no mesmo provedor; outro provedor pode ser adotado quando o projeto crescer. Os backups guardam dados de contas excluídas até expirarem (cerca de quatro semanas); a Política de privacidade deve informar isso, e uma restauração deve executar de novo as rotinas de retenção.

### D56 — Identificação do administrador

- **Status:** Aprovada (14/11/2026).
- **Decisão:** coluna booleana `is_admin` em `users`, fora dos atributos preenchíveis em massa. A administradora é criada por um comando de instalação (RF-244). As Policies verificam o atributo diretamente, sem liberação geral ao administrador, porque ele também tem restrições (P05, R08 e, no futuro, R15). O painel exige 2FA confirmado (RF-017).
- **Alternativas descartadas:** coluna `role` (pouco ganho, já que os níveis futuros exigem permissões e não só papéis); spatie/laravel-permission (excessivo para um único administrador).
- **Impacto:** os níveis de administração (depois do MVP) exigirão migrar para um modelo de permissões.

### D57 — Mascote

- **Status:** Aprovada (16/11/2026); contextos de uso atualizados pela D61 (17/11/2026); arte e formato substituídos pela D65 (19/11/2026).
- **Contexto:** o kit do mascote chegou em três versões: vetorial chapada (SVGs do kit), vetorial com degradês (só na prancha HTML, sem arquivos exportados) e traçada a partir da ilustração original.
- **Decisão:** a versão oficial é a vetorial chapada, em `design/mascote/`, com os SVGs usados pela aplicação em `resources/images/mascote/`. Onde e como o mascote aparece está em `DESIGN.md` §5.3: estados vazios, boas-vindas, artigo aprovado, aguardando aprovação e páginas de erro; nunca na leitura, no editor, no painel administrativo, em rejeições ou penalidades. É sempre decorativo. A animação usa o rig próprio do kit, portado para TypeScript, sem Rive. PNGs só para e-mails, regenerados pelos scripts do kit. A versão traçada fica fora do repositório.
- **Alternativas descartadas:** versão com degradês (sem arquivos exportados e contrária ao guia de identidade); versão traçada (até 2,1 MB por SVG e com artefatos visíveis em fundo escuro; serve só para apresentação); Rive (dependência a mais e formato editável apenas no editor deles); mascote como foto padrão de usuário (confundiria perfis comuns e o autor anonimizado com a plataforma; usam-se iniciais).

### D58 — Paleta do editor e links no artigo

- **Status:** Aprovada (16/11/2026).
- **Contexto:** RF-068 e A15 exigem cores de texto e destaques por nome, com variação por tema e contraste mínimo de 4,5:1. O `DESIGN.md` recebido não tinha essa paleta.
- **Decisão:** seis cores (`lavanda`, `rosa`, `amarelo`, `menta`, `azul`, `pessego`), cada uma com texto e destaque para os temas claro e escuro, em `DESIGN.md` §2.11. Todas as combinações de texto colorido com destaque passam (mínimo 4,62:1), então podem ser usadas juntas. Links no corpo do artigo são sempre sublinhados, porque o texto lavanda e o link têm cores próximas; como o editor não oferece sublinhado, sublinhado no artigo significa sempre link.
- **Alternativas descartadas:** destaques em tons mais claros que os pastéis (quase invisíveis sobre o fundo); pastéis como destaque no tema escuro (áreas claras grandes); proibir texto colorido dentro de destaque (desnecessário depois de ajustar os tons de texto).
- **Impacto:** a verificação de contraste da paleta faz parte dos testes do frontend; o esquema do editor (D51) lista exatamente esses seis nomes.

### D59 — Precedência entre DESIGN.md e os requisitos

- **Status:** Aprovada (16/11/2026).
- **Decisão:** quando `DESIGN.md` contradiz `PRODUCT.md` ou `REQUIREMENTS.md`, valem estes dois. Por isso, as sugestões durante a digitação na busca e o destaque de artigos no perfil ficam para depois do MVP, e o painel pessoal não tem números em destaque, gráficos nem métricas de leitura.
- **Motivo:** o escopo do MVP já aprovado (A09) e as anti-referências do produto ("sem contadores em destaque", "sem analytics de leitura para autores") não devem mudar por uma decisão visual.

### D60 — Implementação dos tokens visuais

- **Status:** Aprovada (17/11/2026).
- **Decisão:** os tokens semânticos do `DESIGN.md` são a única fonte de cor, definidos no `@theme` do Tailwind e redefinidos no bloco `.dark`. A paleta padrão do Tailwind é removida, para que nenhum componente use cor fora dos tokens. Os nomes usados pelos componentes do shadcn são apenas apelidos desses tokens. O tema escuro continua com o mecanismo do starter kit (classe `.dark`, cookie `appearance`). Manrope e Nunito Sans são servidas pela própria aplicação (Fontsource, OFL).
- **Alternativas descartadas:** manter as variáveis do shadcn com valores próprios ao lado dos tokens (duas fontes de cor que divergiriam); manter a paleta padrão do Tailwind (permitiria cores fora do design system); trocar para `[data-theme]` (mudaria Blade, hook, Tailwind e componentes sem ganho); fontes pela CDN Bunny (requisição a terceiros, contrária ao uso só de cookies e recursos essenciais).
- **Impacto:** a página promocional do Laravel foi substituída por uma página inicial mínima. Estados desabilitados usam tokens próprios em vez de opacidade, e anéis de foco são opacos (DESIGN §2.8).

### D61 — Telas de referência

- **Status:** Aprovada (17/11/2026).
- **Contexto:** as telas desktop e mobile e uma prancha de estilo foram desenhadas num canvas de design privado (o link não fica no repositório), com valores que o `DESIGN.md` deixava em aberto e alguns pontos que contrariavam decisões anteriores.
- **Decisão:**
    - Raios, escala tipográfica, sombras e larguras de layout da prancha passam a valer (`DESIGN.md` §3.3, §4.1, §4.3, §11).
    - A paleta do editor continua a da D58; as telas foram corrigidas.
    - O mascote passa a aparecer também no editor vazio, no fim do artigo, no envio para revisão e na busca carregando, mas não no artigo não aprovado nem no despublicado (atualiza a D57; mapa completo em `DESIGN.md` §5.3).
    - A seção "Em destaque" do perfil sai do MVP (D59), e a busca vazia não sugere grafia, porque o FULLTEXT do MariaDB não faz isso (D54).
    - As contagens de favoritos, que faltavam nas telas, entram na leitura e nos cards (RF-137, RF-161). Os cards voltaram a ficar sem contagens pela D63.
    - A interface usa "Aguardando revisão" e "Não aprovado" para os estados pendente e rejeitado (`DESIGN.md` §8.13).
- **Alternativas descartadas:** a paleta da prancha (reaproveitava cores de estado como texto e, no tema escuro, texto colorido sobre destaque ficava perto de 1:1); mascote também na rejeição, com pose neutra.
- **Pendente:** as telas no tema escuro. O nome do produto foi definido na D66.

### D62 — Interface em português e inglês

- **Status:** Aprovada (18/11/2026).
- **Contexto:** RF-008 exige a interface completa em PT e EN no MVP; o critério da p2-06 é uma página funcionando nos dois idiomas, sem strings fixas.
- **Decisão:**
    - Os textos da interface ficam em `lang/pt_BR.json` e `lang/en.json`, com chaves por área (`site.nav.login`, `theme.system`). O Laravel usa os mesmos arquivos no servidor, e o React os lê com uma função `t()` própria, sem biblioteca.
    - O tipo das chaves vem do arquivo em português, então uma chave inexistente ou uma tradução faltando em inglês é erro de compilação. Um teste confere que os dois idiomas têm as mesmas chaves e os mesmos valores substituíveis.
    - O idioma vem do cookie essencial `locale` (escolha da pessoa) ou, sem ele, do navegador; o padrão é português. A preferência salva na conta entra com a modelagem de usuários.
    - As mensagens de validação em português foram copiadas uma vez de laravel-lang/lang 15.39.0 (MIT, com a licença em `lang/pt_BR`), sem dependência no projeto.
- **Alternativas descartadas:** i18next e react-i18next (biblioteca maior e traduções separadas das do Laravel); enviar as traduções pelo servidor a cada página (respostas maiores); o texto em inglês como chave, padrão do Laravel (impede detectar texto fixo esquecido); instalar o laravel-lang/publisher (exige a extensão `bcmath`).
- **Pendente:** revisar o tom das mensagens de validação herdadas do pacote, que são formais demais para o PRODUCT.

### D63 — Handoff de design

- **Status:** Aprovada (19/11/2026).
- **Contexto:** o handoff de design consolidou as telas de referência em especificação de tokens, componentes, estados, movimento e acessibilidade, e trouxe três decisões de produto. Alguns pontos contrariavam decisões anteriores.
- **Decisões de produto:**
    - Depois de uma rejeição, o autor corrige e reenvia na hora, sem a espera de 24 horas (altera a P06 e o RF-108).
    - Quando o administrador aceita a contestação de uma suspensão, a conta volta na hora, sem passo de autorização, e o usuário recebe o aviso por e-mail (altera a A06, o RF-236, o RF-241 e revoga o RF-237 e a R11). A auditoria registra quem aceitou; a reativação fica registrada como evento do sistema.
    - A revisão tem uma **estimativa** de 6 horas, mostrada ao autor como estimativa e não como prazo garantido, porque o MVP tem uma única administradora (A08). No admin, versões com mais de 6 horas ficam marcadas como atrasadas (RF-377, RF-378).
    - A página de apresentação entra no MVP, em `/`; a listagem de artigos passa para `/artigos` (RF-379 a RF-383).
    - Os cards de artigo não mostram contagens no MVP; curtidas e favoritos aparecem na página de leitura (altera o RF-161 e o RF-368).
- **Decisões de design:**
    - Tags e categorias usam pares de pastel com texto escuro do mesmo tom (lavanda `#56377F`, menta `#245C48`, amarelo `#70520A`, rosa `#8B304B`, azul `#24527A`, pêssego `#292638`). Para não confundir com estados, que usam as mesmas cores, categoria é pill sem ícone e estado é etiqueta retangular com ícone.
    - Capas de artigo usam só pastéis fixos, iguais nos dois temas, incluindo o lilás `#EDE4FF`, nunca um token de superfície.
    - Raios: 16 px em blocos internos e 24 px em cards e diálogos.
    - Avisos grandes no tema escuro usam fundo translúcido do pastel com texto pastel; o contraste é verificado sobre a superfície em que aparecem.
    - O mascote não aparece na exclusão de conta nem no painel administrativo, nem no logo do admin.
- **Mantido, apesar do handoff:**
    - O tema escuro continua na classe `.dark` (D60), e não no atributo `data-theme`: o próprio handoff diz que o `DESIGN.md` prevalece.
    - O mascote continua sempre decorativo (`alt=""`), inclusive quando é o personagem da tela: o texto ao lado já comunica a mensagem.
- **Técnicas:**
    - Componentes de efeito vindos de Magic UI, Aceternity, Animate UI e React Bits entram como código-fonte em `components/effects/`, com `// fonte: <URL> · licença: <licença>` no topo, e só depois de conferida a licença de cada um. Nenhum kit de UI como dependência.
    - As abas deslizantes começam em CSS, com os atributos do Radix; `motion` só entra se o CSS não bastar, e nunca na primeira carga da Home.
    - Acessibilidade automatizada com o plugin de navegador do Pest e axe a cada PR, sem nenhuma violação "serious" ou "critical".
- **Alternativas descartadas:** prazo de 6 horas como garantia (inviável com uma administradora); manter a espera de 24 horas; tags com texto `#292638` em todos os pastéis; mascote com descrição para leitor de tela; axe no Vitest (o jsdom não calcula layout nem contraste).
- **Riscos:** sem espera entre reenvios, a única administradora pode receber versões em sequência do mesmo artigo; o limite de uma versão pendente por artigo (RF-102) continua valendo.

### D64 — Convenções de código

- **Status:** Aprovada (19/11/2026).
- **Decisão:** as convenções ficam no `ARCHITECTURE.md`. Em resumo:
    - nomes no código em inglês; comentários, documentação, commits e descrições de teste em português;
    - modelos Eloquent em `app/Models` e o domínio organizado por módulo em `app/Domain/<Módulo>` (Actions, Enums, Queries, Rules, Events, Exceptions), com controllers, validação e Resources em `app/Http`;
    - testes no estilo de funções do Pest.
- **Alternativas descartadas:** nomes do domínio em português (misturaria idiomas no mesmo arquivo); modelos dentro de cada módulo (exige configurar factories, autenticação e descoberta de Policies fora do padrão); só as pastas padrão do Laravel (regras de um domínio espalhadas); testes em classes PHPUnit (os testes de navegador só aceitam funções, e os dois estilos ficariam misturados).
- **Impacto:** o código de frontend já escrito em português foi renomeado, e os testes existentes foram convertidos para funções do Pest com descrições em português.

### D65 — Mascote em ilustração WEBP

- **Status:** Aprovada (19/11/2026). Substitui a D57 no formato e nas artes; os contextos de uso continuam os da D57 e da D61.
- **Contexto:** o mascote foi redesenhado como ilustração, com textura de papel e traço manual, e ficou melhor que o kit vetorial chapado. A ilustração não tem versão vetorial.
- **Decisão:**
    - São dez ilustrações: `apresentando`, `rosto`, `lendo`, `pensativo`, `comemorando`, `escrevendo`, `esperando`, `procurando`, `dormindo` e `ajustando`. O mapa de uso fica em `DESIGN.md` §5.3.
    - A aplicação usa WEBP com transparência em `resources/images/mascote/`, gerado por `design/mascote/converter.py` a partir dos PNGs originais: largura de 600 px (192 px no rosto), o dobro do maior tamanho de exibição, com qualidade 85. Cada arquivo tem entre 9 e 62 KB, contra 0,8 a 7 MB dos PNGs. Um teste limita cada ilustração a 80 KB.
    - Os PNGs e os arquivos de trabalho ficam fora do repositório, no Drive do projeto (pasta `mascote-poses-v2`, variante `sem-risquinhos`), para não pesar no histórico do git.
    - Abaixo de 96 px usa-se o `rosto`; abaixo de 24 px, o mascote não é usado. O favicon e o ícone da tela inicial são os da logo (D66).
    - O kit vetorial (SVGs, rig para web, base para o Rive e scripts) foi removido do repositório e continua no histórico do git.
- **Alternativas descartadas:** manter o kit vetorial ao lado das ilustrações (dois estilos na mesma interface); versionar os PNGs, inclusive com Git LFS (cerca de 36 MB que só servem de origem); converter a ilustração em SVG traçado (a D57 já mostrou arquivos de até 2,1 MB com artefatos).
- **Impacto:**
    - A animação pelo rig do kit deixa de existir. Se uma tela pedir movimento, ele se limita a transformações CSS da imagem inteira, desligadas com `prefers-reduced-motion`.
    - Clientes de e-mail não exibem WEBP de forma confiável. Quando os e-mails forem feitos, o script ganha uma saída em PNG.
- **Pendente:** a ilustração `ajustando` foi feita para o artigo devolvido para ajuste, mas a D61 tira o mascote do artigo não aprovado. Até nova decisão, ela não é usada.

### D66 — Nome e logo: he4rt ink

- **Status:** Aprovada (19/11/2026). Resolve a pendência do nome do produto na D61.
- **Decisão:**
    - O produto se chama **he4rt ink**, sempre em minúsculas, e a tagline é "he4rt developers".
    - A logo é o ícone de folha com coração mais o nome desenhado. Ela aparece no cabeçalho do site e nas telas de entrar e criar conta; o ícone sozinho aparece no cabeçalho do celular, no favicon e no ícone da tela inicial; a versão com tagline fica no rodapé. O mapa está em `DESIGN.md` §5.4.
    - O mascote deixa de ser usado como logo e fica só nos estados e momentos de `DESIGN.md` §5.3.
    - As variações são separadas da prancha da marca por `design/logo/gerar.mjs`, que também gera `favicon.svg`, `favicon.ico` e `apple-touch-icon.png`. A prancha fica fora do repositório, como os originais do mascote.
    - No tema escuro, a logo usa as cores da variação branca da prancha (ícone branco, coração roxo, nome em branco e lavanda). As duas versões são trocadas só com CSS, sem JavaScript, para não piscar ao carregar.
    - As cores da logo ficam na arte e não viram tokens da interface (D60): são marca, não cor de componente.
- **Alternativas descartadas:** o rosto do mascote como logo (mistura a marca com a ilustração de estados); SVG da logo embutido no código dos componentes (cerca de 9 KB de caminhos dentro do JavaScript, repetidos para cada tema); a tagline no cabeçalho (fica ilegível na altura do cabeçalho).
- **Impacto:** `APP_NAME` passa a ser "he4rt ink", o que muda o título das páginas e o remetente dos e-mails. Os documentos do projeto passam a usar o nome.

### D67 — Filas, agendador e e-mail

- **Status:** Aprovada (19/11/2026).
- **Decisão:**
    - A fila usa o driver `database` do Laravel, já configurado. Todo e-mail sai pela fila, com 3 tentativas e espera de 1 e 5 minutos entre elas, e só depois da confirmação da transação. Os e-mails de verificação e de recuperação de senha do Laravel passam a usar as notificações em `app/Notifications`, que são as mesmas com fila.
    - O idioma do e-mail é o da requisição que pediu o envio, guardado na notificação, porque o worker não conhece a requisição. Quando a preferência de idioma for salva na conta, ela passa a valer.
    - As rotinas agendadas ficam em `routes/console.php`. As primeiras apagam os links de recuperação de senha vencidos e os jobs com falha com mais de 7 dias, que guardam o conteúdo do e-mail, inclusive o endereço da pessoa (linha nova na tabela de retenção, `REQUIREMENTS.md` §2.23).
    - Localmente, o `composer dev` sobe também o agendador (`schedule:work`), e os e-mails vão para o Mailpit 1.33.1 (MIT), pelo `compose.yaml`: SMTP na porta 1025 e caixa de entrada em `http://localhost:8025`. Sem Docker, `MAIL_MAILER=log` grava os e-mails no log. Os testes usam fila síncrona e o mailer `array`.
- **Alternativas descartadas:** Redis e Horizon para a fila (mais um serviço para manter, sem volume que justifique); enviar os e-mails na hora (a requisição fica esperando o servidor de e-mail e falha junto com ele); binário do Mailpit sem Docker (mais um executável para baixar e atualizar à mão); manter jobs com falha sem prazo (dados pessoais guardados sem limite).
- **Pendente:**
    - Produção precisa de um worker permanente (`queue:work`), reiniciado a cada deploy, e de um cron que rode `schedule:run` a cada minuto (p8-01). Como o worker monta os links fora de uma requisição, `APP_URL` precisa ser o endereço público.
    - O provedor de e-mail de produção e o remetente (`MAIL_FROM_ADDRESS`).
    - Os textos dos e-mails de verificação e de recuperação de senha ainda são os do Laravel, em inglês; a tradução entra na p3-05 e na p3-06.
    - Alerta quando a fila parar ou acumular jobs com falha (fase 8).

### D68 — Entrar: sessão, limite de tentativas e eventos de segurança

- **Status:** Aprovada (19/11/2026). A sessão sempre lembrada foi substituída pela sessão de 14 dias sem uso (D73).
- **Decisão:**
    - A tela de entrar não tem "Lembrar de mim", como a prancha: a sessão é sempre lembrada, e a pessoa continua conectada até sair. Quem escreve volta ao rascunho sem entrar de novo.
    - O limite de tentativas é o do próprio Fortify: 5 senhas erradas por minuto para o mesmo e-mail e IP. O login fica pausado até o prazo acabar, mesmo com a senha certa, e a tela mostra o aviso da prancha com os segundos que faltam. O limitador nomeado do starter kit foi retirado, porque contava também os logins certos e respondia com erro 429, sem disparar o evento `Lockout`.
    - Cada pausa vira um evento de segurança `login_blocked` em `security_events`, com o e-mail digitado, a conta (quando existe), o IP e o navegador. Um registro por pausa, não por tentativa, para não encher a tabela durante um ataque. Esses eventos somem depois de 90 dias (§2.23), pelo `model:prune` diário; os outros tipos de evento de segurança ficam enquanto a conta existir.
    - Os links "Termos de uso" e "Privacidade" do painel entram com as páginas, na fatia 4.
    - **Diferenças da prancha, pedidas na revisão:** no celular, o mascote fica num palco lilás com a órbita compacta e o formulário numa folha que sobe por cima (escolhida entre três propostas); a órbita e a flutuação do mascote são contínuas, em vez de pararem depois de uma volta; o painel não tem a estrela, o círculo e a onda soltos.
    - Como o movimento é contínuo, o painel tem o botão "Pausar animações" do RF-383 (WCAG 2.2.2): no rodapé do painel no desktop e no topo do palco no celular. A escolha fica no navegador (`localStorage`), vale para o site inteiro e é aplicada antes de a página aparecer. "Reduzir movimento" no sistema continua parando tudo.
    - O mascote segue o mapa do canvas (`DESIGN.md` §5.3), menos onde ele contraria a D57 e a D61: sem mascote em artigo não aprovado, na exclusão de conta e no admin. O texto alternativo continua vazio (D57), embora as pranchas usem uma descrição.
- **Alternativas descartadas:** caixa "Lembrar de mim" (diverge da prancha); sessão de 2 horas sem lembrar (quem escreve perderia o acesso no meio do texto); manter o limitador nomeado e acrescentar o do Fortify (exigiria copiar o pipeline de login do Fortify para a aplicação); registrar cada tentativa errada (ruído e dados pessoais sem ganho para a análise).
- **Atualização (D70):** o limite por IP que valha para vários e-mails foi acrescentado. O CAPTCHA diante de comportamento suspeito fica para depois do MVP (RF-021).

### D69 — Recuperar senha

- **Status:** Aprovada (19/11/2026).
- **Decisão:**
    - O pedido do link responde sempre da mesma forma, com conta ou sem conta e mesmo quando é repetido cedo demais: a tela "Link enviado" diz "Se existir uma conta com…" e nunca revela quem está cadastrado. A mensagem de "não encontramos esse e-mail" do Fortify deixou de ser usada.
    - O link vale por 60 minutos, e um novo link para o mesmo e-mail só sai depois de 60 segundos. A tela mostra a contagem no botão "Reenviar link".
    - Ao salvar a nova senha, todas as sessões abertas da conta são encerradas, inclusive as lembradas (D68), a troca vira o evento de segurança `password_changed` (RF-024) e a pessoa recebe o e-mail "Sua senha foi alterada", com o caminho para recuperar o acesso se não foi ela. A ação `SecureAccountAfterPasswordChange` faz os três passos e será reaproveitada na troca de senha logada (fatia 6), mantendo a sessão atual.
    - Os e-mails da conta saem em PT e EN: os templates de notificação e da moldura do Laravel foram publicados em `resources/views/vendor` com os textos em `lang/` (`mail.*`), e o rodapé deixou o "All rights reserved" por uma frase que diz por que a pessoa recebeu o e-mail.
    - A tela de nova senha não tem prancha no canvas: ela segue o cartão de "Recuperar senha", com os mesmos componentes. As telas em cartão passaram a montar o topo (mascote, título e texto) com `AuthCardHeader`, porque o mascote e o título mudam com o estado.
- **Alternativas descartadas:** manter a mensagem de e-mail não encontrado (permite descobrir quem tem conta); manter as outras sessões (quem tinha acesso indevido continuaria dentro da conta); traduzir os textos do Laravel usando o próprio inglês como chave (a D62 escolheu chaves por área).
- **Atualização (D70):** o limite por IP para os pedidos de link e o visual dos e-mails com a marca foram feitos.

### D70 — Limite por IP e e-mails com a marca

- **Status:** Aprovada (19/11/2026). Resolve as pendências da D68 e da D69.
- **Decisão:**
    - Além do limite por e-mail do Fortify, o middleware `ThrottleAuthByIp` limita cada IP: 20 envios por minuto na tela de entrar e 10 pedidos de link de senha por hora, para qualquer e-mail. No login, o bloqueio por IP segue o mesmo caminho do bloqueio por e-mail (aviso com contagem e evento `login_blocked`); no pedido de link, a tela mostra quantos minutos faltam. Como o limite é por rede, e não por conta, ele não revela quem tem conta.
    - Os e-mails usam o tema `he4rt` (`resources/views/vendor/mail/html/themes/he4rt.css`): o tema do Laravel com as cores da marca, cartão de cantos arredondados e botão roxo. O cabeçalho mostra a logo em PNG (`public/images/email/logo.png`, gerada por `design/logo/gerar.mjs`), porque clientes de e-mail não exibem SVG.
- **Alternativas descartadas:** CAPTCHA já no MVP (fora do escopo, RF-021); limite por IP mais baixo no login (redes compartilhadas, como a de um evento da comunidade, bloqueariam pessoas legítimas); logo como texto no e-mail (perde a identidade).
- **Pendente:** a logo do e-mail é carregada de `APP_URL`, que precisa ser o endereço público em produção (já exigido pela D67).

### D71 — Provedor de e-mail com baixo acoplamento

- **Status:** Proposta (19/11/2026). **O provedor de e-mail é uma decisão em aberto até a P8-01.**
- **Contexto:** hoje os e-mails saem pela fila para o Mailpit, que só existe no desenvolvimento. Em produção, um provedor entrega os e-mails, assina com o domínio (DKIM) e avisa sobre bounces e reclamações. O projeto quer poder trocar de provedor sem retrabalho.
- **Decisão:**
    - **Envio:** a aplicação só envia por `Notification` ou `Mailable` do Laravel, sempre pela fila. O provedor é escolhido só por configuração (`MAIL_MAILER` e `config/mail.php`); trocar de provedor é mudar o `.env` e, se preciso, instalar o pacote do transporte. Nenhum SDK de provedor entra no domínio.
    - **Avisos do provedor:** bounces e reclamações chegam por webhook a um único ponto de entrada em `app/Support/Mail`. Cada provedor tem um adaptador que traduz o aviso para eventos próprios (`EmailBounced`, `EmailComplained`); o domínio reage a esses eventos e para de enviar para o endereço, sem saber qual provedor avisou (p6-17).
    - **Falha do provedor:** em produção, o mailer padrão é o `failover` do Laravel: provedor principal, provedor reserva e, por último, `log`.
    - **Conferência:** o comando `php artisan mail:test {e-mail}` envia na hora, sem fila, um e-mail com a configuração atual e mostra o erro do transporte quando ele falha. Serve para conferir um provedor novo antes de virar a chave.
    - **Até a P8-01:** nenhum provedor é escolhido, instalado, configurado ou integrado, e nenhum é tratado como padrão. Não há credenciais, variáveis de ambiente nem configuração de fornecedor no projeto: as entradas de fornecedores que vinham no esqueleto do Laravel (`config/mail.php` e `config/services.php`) foram retiradas. O desenvolvimento continua com o Mailpit local e o mailer `array` nos testes, sem depender de fornecedor.
    - **Na P8-01:** comparar os fornecedores disponíveis pelos critérios abaixo e apresentar prós, contras, custos e implicações técnicas de cada um antes de recomendar ou implementar qualquer solução.
    - **Critérios de avaliação:**
        - integração nativa com o Laravel;
        - entregabilidade de e-mails transacionais;
        - webhooks para eventos de entrega, bounce e reclamação;
        - plano gratuito e custo conforme o volume esperado da comunidade;
        - localização e tratamento dos dados, considerando a LGPD;
        - suporte a domínio próprio e DKIM.
    - **Domínio:** SPF, DKIM e DMARC configurados no DNS antes do primeiro envio real. A Política de privacidade lista o provedor como operador, porque ele processa nome, e-mail e conteúdo das mensagens.
- **Alternativas descartadas:** uma interface própria de "enviador de e-mail" na aplicação (o mailer do Laravel já é essa abstração, e duplicá-la só acrescentaria código); usar o SDK do provedor para recursos extras (prende o código a ele); enviar de um servidor próprio, sem provedor (IP sem reputação, e-mails no spam).

### D72 — Criar conta

- **Status:** Aprovada (20/11/2026).
- **Decisão:**
    - Senha: mínimo de 8 caracteres e recusa de senhas que já apareceram em vazamentos (consulta que envia só o começo do hash; fora do ar, a senha é aceita). Sem regras de composição.
    - Username de 3 a 30 caracteres, minúsculas sem acento, números, `-` e `_`, começando por letra; palavras reservadas e o começo de qualquer rota da aplicação são recusados; disponibilidade consultada enquanto a pessoa digita.
    - A declaração de 16 anos ou mais é obrigatória e não é guardada; nenhuma data de nascimento é registrada (RF-012).
    - Versões dos Termos e da Privacidade em `policy_versions`, aceite em `policy_acceptances`; o texto de cada versão fica em `resources/policies`. A versão inicial é provisória (`2026-11-draft`) até os textos finais. O novo aceite no login e o visual das páginas ficam para a fatia 4.
    - A conta guarda o idioma (`users.locale`), usado nos e-mails enviados sem requisição.
    - "Usar outro e-mail" troca o e-mail de uma conta ainda não confirmada e manda um novo link; a troca vira o evento `email_changed`.
    - Contas não confirmadas são excluídas no 8º dia pelo `model:prune` diário.
    - A variante "Criar conta vindo de Escrever", os passos 1-2-3 e o "Começar meu primeiro artigo" entram com o editor (fatia 8); até lá, "E-mail confirmado" leva à página inicial.
    - A tabela de perfil (bio e foto) entra na fatia 6, quando for usada.

### D73 — Termos e políticas

- **Status:** Aprovada (20/11/2026).
- **Contexto:** o canvas ganhou as pranchas "Políticas e privacidade": as três páginas com o texto jurídico completo (versão 1.0), o novo aceite e um formulário de pedido de dados.
- **Decisão:**
    - **Três páginas** (RF-272): `/terms`, `/privacy` e `/content-policy`, no desenho das pranchas: abas entre os documentos, índice "Nesta página" que acompanha a leitura, resumo em cartões, seções numeradas com tabelas, histórico de versões e o quadro "Ficou com alguma dúvida?". O cabeçalho continua o atual: "Artigos", "Categorias", "Buscar" e "Escrever" entram com as fatias deles.
    - **Texto:** o das pranchas, publicado como versão 1.0 **provisória** (`policy_versions.draft`) até a validação jurídica (RF-276, p8-07). Cada versão fica em `resources/policies/<tipo>/<versão>.<idioma>.json`, em PT e EN, com resumo, seções e "o que mudou". O formato estruturado, em vez de Markdown, permite as tabelas e os cartões do desenho e deixa os itens da Política de conteúdo endereçáveis pelo número, como a moderação vai precisar (RF-107). O texto é montado como elementos React, sem HTML: só negrito e links internos ou de e-mail.
    - **Contatos** (`privacidade@he4rt.ink`, `contato@he4rt.ink`) ficam em `config/app.php` (`contacts`), trocáveis sem mexer nos textos.
    - **Política de conteúdo:** itens numerados com exemplo do que não pode e do que pode. O link `?item=4.2` destaca o item e mostra um aviso no topo. A prancha pulava do 3.1 para o 3.4; o item de imagens virou 3.2, porque a moderação vai citar esses números. Ela não tem aceite próprio: vale pelos Termos.
    - **Novo aceite** (RF-013): quando entra em vigor uma versão nova dos Termos ou da Privacidade, o middleware `EnsurePoliciesAccepted` leva a pessoa à tela "Atualizamos…", que mostra o que mudou e a versão aceita antes. Um aceite vale para os documentos pendentes. Ler as políticas, trocar o idioma e sair continuam livres; depois do aceite, a pessoa volta para onde ia.
    - **Sessão:** dura enquanto há uso e cai depois de 14 dias parada (`SESSION_LIFETIME=20160`), sem o "lembrar de mim". Atualiza a D68 e é o que a Política de privacidade descreve.
    - **"Baixar PDF"** virou "Imprimir ou salvar em PDF": a página tem versão de impressão limpa e o botão abre a impressão do navegador, sem biblioteca nova.
    - **Pedido de dados (LGPD):** entra como fatia própria (24), depois da moderação, porque alguém precisa atender os pedidos (RF-384 a RF-389). Até lá, "Ficou com alguma dúvida?" leva ao e-mail de privacidade.
- **Alternativas descartadas:** texto em Markdown (não representa as tabelas e os cartões e não endereça os itens); publicar o texto como final sem a validação jurídica; gerar PDF no servidor (dependência nova); manter a sessão lembrada para sempre (o texto da política já previa 14 dias e é mais seguro); fazer o pedido de dados agora sem ninguém para atender.
- **Pendente:** validação jurídica dos textos (RF-276) e publicação da versão final (p8-07); o domínio `he4rt.ink` dos contatos.

### D74 — Página de apresentação

- **Status:** Aprovada (20/11/2026).
- **Contexto:** a página de apresentação (p5-10) vem antes das fatias de categorias e de leitura pública, mas a prancha mostra categorias, artigos publicados e autores do mês.
- **Decisão:**
    - **Seções prontas e ocultas:** `/` (`HomeController`) já envia `categories`, `recentArticles` e `authors` no formato final (`resources/js/types/articles.ts`), vazios por enquanto. Sem dados, a faixa de categorias e os autores não aparecem, e o lugar dos cartões vira um convite: "Os primeiros artigos estão chegando", com o botão para escrever. As fatias de categorias e de leitura pública só preenchem os dados, aplicando a regra única de visibilidade (RF-381) e só o perfil público de quem publicou (RF-382).
    - **Sem "Ler artigos" por enquanto:** "Ler artigos", "Ler os artigos", "Explorar artigos" e "Ver todos os artigos" voltam quando a listagem em `/artigos` existir. No lugar de "Ler artigos" do cabeçalho fica "Entrar", que a prancha não tinha; para quem já entrou, o botão principal vira "Meus artigos".
    - **Revisão, não "revisão da comunidade":** quem revisa é a administração (D56), então o texto de "Para quem lê" diz só "revisão".
    - **Efeitos próprios:** marquee, palavras que se revezam, marca-texto, brilho no texto e no botão, feixe na borda, ondas e linha do tempo que se preenche ao rolar são CSS em `app.css`, sem Magic UI, Aceternity ou `motion`. Como na D72, o movimento é contínuo (as palavras do título giram sem parar, em vez de pararem na última) e tudo pausa com o "Pausar animações" do cabeçalho. Na revisão, a página ganhou mais movimento que a prancha: brilho que segue o mouse nos cartões (só com mouse), cursor piscando no editor de exemplo, linhas com varredura de luz, seletor de idioma que alterna sozinho e paleta que ondula. Os mascotes ficam sem quadro de fundo, apoiados numa sombra no chão; pausado ou com "reduzir movimento", cada efeito fica no estado final legível (a primeira palavra, o marca-texto pintado, as faixas sem rolar). As manchas de cor que derivavam atrás da abertura saíram depois, a pedido: a abertura fica sem gradientes. Também a pedido, "Como funciona" trocou a linha do tempo por cards que se empilham com a rolagem: cada passo entra com um "pop", fica preso abaixo do cabeçalho, e o próximo sobe por cima dele (CSS `position: sticky` e `animation-timeline: view()`; sem suporte ou com "reduzir movimento", só empilha).
    - **Cabeçalho e rodapé:** além do que a prancha tinha, o cabeçalho ganhou os botões de tema e de idioma, no mesmo formato do "Pausar animações"; no celular, "Começar a escrever" vira "Escrever" para tudo caber. O rodapé é o do site, com os seletores de idioma e tema, em vez do rodapé reduzido da prancha.
    - **Troca de tema e de idioma:** com a View Transitions API, sem biblioteca. O tema novo se revela num círculo que cresce a partir do botão clicado (no rodapé, a partir da lista); o idioma troca com um esmaecer e desfoque curtos, pela opção `viewTransition` das visitas do Inertia. O ícone do tema, o código do idioma e o ícone de pausar entram girando. Sem suporte no navegador ou com "reduzir movimento", a troca é instantânea. Os botões de tema, idioma e pausa do cabeçalho são redondos e sem borda.
    - **Grade de recursos:** o cartão da prévia ocupa duas colunas numa linha só, em vez de duas linhas, para não sobrar espaço vazio; o do tema escuro ocupa a linha inteira e fecha a grade.
    - **Cartões e faixa de artigos:** cada cartão ocupa 350 px, então uma fileira rolante só não mostra a própria cópia ao lado numa tela de 1920 px a partir de seis cartões. Com menos de seis artigos, os cartões ficam parados em grade; de seis a onze, uma faixa; a partir de doze, duas faixas em sentidos opostos, como na prancha. A fatia 12 deve enviar até doze artigos recentes. A cópia que fecha a faixa fica fora do leitor de tela e do teclado.
- **Alternativas descartadas:** dados de exemplo na página (mostraria artigos e autores que não existem); esconder as seções sem convite (a página ficaria sem mostrar que dá para publicar); instalar as bibliotecas de efeitos (peso e componentes sem uso, D63).
- **Pendente:** nada; os dados e os botões de leitura chegaram com a fatia 12 (D83).

### D75 — Administradora e painel

- **Status:** Aprovada (21/11/2026).
- **Contexto:** a fatia 5 traz a administradora (p3-07 a p3-12). O canvas tem a prancha "Admin · Painel", mas nenhuma para ativar o 2FA ou digitar o código no login, e o painel mostra seções e métricas que só existem em fatias futuras.
- **Decisão:**
    - **Quem é a administradora:** a coluna `is_admin` (D56), ligada só pelo comando `php artisan admin:create`, que cria a conta já confirmada e com as políticas aceitas, ou promove uma conta confirmada que já existe. Há uma só (RF-244); o comando recusa a segunda. `php artisan admin:reset-2fa` é o último recurso do RF-018: apaga o 2FA, encerra as sessões e registra o evento de segurança.
    - **Acesso ao painel:** `/admin` exige conta confirmada, o Gate `access-admin` e o 2FA confirmado (`EnsureTwoFactorConfirmed`). Sem o 2FA, a administradora vai para a ativação, que pede a senha antes. Visitante vai para o login; outra pessoa recebe 403. O mapa de cada ação para a sua regra está em `ARCHITECTURE.md` §2.3.
    - **Telas de 2FA sem prancha:** no visual das telas de conta em cartão, com um ícone no lugar do mascote, que não entra em segurança nem na administração (DESIGN §5.3). A ativação tem três passos: ligar; escanear o QR code (ou digitar a chave) e confirmar com o código; guardar os códigos de recuperação, com copiar, baixar em .txt e "Guardei os códigos" antes de seguir. Os códigos aparecem uma vez; depois, só gerando novos. O código de 6 dígitos tem uma caixa por dígito, aceita colar e envia sozinho ao completar. No login, dá para trocar para um código de recuperação.
    - **Depois do login:** a administradora vai para o painel, e o login vale como senha confirmada pelo tempo de sempre, para a ativação não pedir a senha de novo logo em seguida.
    - **2FA só da administradora no MVP:** a ação de ativar do Fortify foi trocada por uma que recusa com 403 quem não administra (RF-019), e a de desligar recusa a administradora (RF-017). Em Configurações › Segurança, só ela vê o 2FA: o estado, o aviso de que não dá para desligar e "Gerar novos códigos de recuperação", com os códigos novos aparecendo uma vez.
    - **Menu da conta e saída:** os cabeçalhos do site, da apresentação e do painel têm o menu da conta (nome, e-mail, Configurações, "Sair" e, para a administradora, "Painel da administração"). Quem já entrou e abre o login ou o cadastro volta para o início, em vez de cair na confirmação de e-mail. A tela "Confira seu e-mail" ganhou "Voltar ao início" e "Sair e entrar com outra conta": antes, quem entrava numa conta sem confirmar ficava preso nela.
    - **Painel só com o que existe:** a lateral tem só "Painel"; Fila de aprovação, Denúncias, Usuários, Contestações, Categorias e tags e Auditoria entram com as fatias delas. Das métricas, só "Usuários cadastrados", que já tem dado; "Precisa da sua atenção" mostra "Tudo em dia" até os avisos existirem. No celular, a lateral vira uma faixa acima do conteúdo.
- **Alternativas descartadas:** esperar pranchas de 2FA (a fatia ficaria sem as telas que a protegem); mostrar as seções futuras desativadas ou com zero (links que não levam a nada e números falsos); ligar o 2FA ao abrir a página, num GET (um prefetch poderia trocar o segredo já escaneado); pedir o 2FA para usar o site, e não só o painel (a D56 restringe ao painel).
- **Pendente:** o painel ganha seções, métricas e avisos com as fatias 7, 16, 20 e 21; a troca de administradora pelo painel fica para depois do MVP (RF-245).

### D76 — Curvatura por papel

- **Status:** Aprovada (21/11/2026).
- **Contexto:** as telas usavam mais de 15 raios diferentes, muitos escritos à mão (de 2 a 40 px), e a escala da prancha de estilo (6 a 24 px) já não era seguida. Foi pedido que tudo fosse redondo.
- **Decisão:** "bem redondo", com quatro papéis (`DESIGN.md` §4.1): controles, selos, avatares e caixas de ícone em pílula ou círculo (`rounded-full`); blocos dentro de cards, menus e a área de texto com 20 px (`rounded-inner`); cards e avisos com 28 px (`rounded-card`); painéis grandes e diálogos com 36 px (`rounded-section`). Os tokens ficam no `@theme` e todas as telas foram migradas. Avatares passam a ser círculos, em vez de quadrados arredondados.
- **Alternativas descartadas:** botões e campos com 16 px (menos redondo do que o pedido); pílula só nos botões, com campos de 16 px (inconsistente entre controles vizinhos).
- **Impacto:** a área de texto de várias linhas (bio) fica com 20 px, porque em pílula o texto encostaria nas curvas.

### D77 — Perfil e configurações

- **Status:** Aprovada (21/11/2026).
- **Contexto:** a fatia 6 traz o armazenamento (p2-09), a troca de e-mail e de senha logada (p3-06) e o perfil público com edição (p3-10). As pranchas "Configurações" desktop e mobile não concordam sobre onde ficam e-mail e senha, e mostram seções de fatias futuras.
- **Decisão:**
    - **Seções:** "Conta e perfil" (foto, nome, username e bio), "Aparência e idioma" e, para conta confirmada, "Privacidade e segurança" (e-mail, senha e o 2FA da administradora), como no mobile. "Notificações" entra com a fatia 19 e "Excluir conta" com a 22. A exclusão imediata do kit inicial saiu, porque contrariava a carência de 20 dias. No celular, as seções viram uma faixa rolável acima do conteúdo, em vez da tela de lista da prancha; tema, idioma e "Sair" já ficam no cabeçalho.
    - **Foto de perfil (RF-026, RF-032, RF-033):** JPG, PNG ou WebP até 10 MB e com pelo menos 96 px. O `ImageProcessor` (`Support/Images`, D52) corrige a orientação, recorta um quadrado de 512 px pelo centro e regrava em WebP sem metadados, na hora, sem fila: é uma imagem pequena. O arquivo tem nome novo a cada troca (`avatars/<uuid>.webp`) e a foto anterior é apagada depois que a nova está salva. Sem foto, iniciais num pastel derivado do nome, igual em todas as páginas.
    - **Armazenamento (D53):** disco `media` local fora da pasta pública em desenvolvimento e `r2` (S3 do Cloudflare) em produção, escolhidos por `MEDIA_DISK`. A rota `/media/{caminho}` aplica a regra de acesso: por enquanto só fotos de perfil, que são públicas; qualquer outro caminho dá 404. No R2 ela redireciona para uma URL pré-assinada (`Support/Media/MediaDelivery`) assinada com o começo da hora como data e válida por duas horas, então todo pedido da mesma hora recebe a mesma URL e o navegador reaproveita o cache; o redirecionamento fica em cache até a próxima hora, e não há consulta prévia ao bucket (o R2 responde 404 sozinho). No disco local, a rota envia o arquivo com cache longo, já que o nome muda a cada troca.
    - **Troca de e-mail (RF-030):** o e-mail novo recebe um link assinado que vale 24 horas e leva o hash do endereço pendente, então cancelar ou pedir outra troca invalida o link anterior. O e-mail atual recebe o aviso. A conta segue verificada com o e-mail atual até a confirmação, que funciona sem login e registra o evento de segurança. Conta ainda não confirmada troca o e-mail pela tela de confirmação (D72).
    - **Senha logada (RF-031):** a troca encerra as outras sessões, registra o evento e manda o aviso, mantendo a sessão atual (a mesma ação da recuperação, D69). A data da última troca vem do evento.
    - **Perfil público (RF-025):** em `/@username`, com nome, username, bio, foto e desde quando a pessoa está na comunidade, nunca o e-mail. Conta sem e-mail confirmado não tem perfil público, porque pode ser excluída em 7 dias. Os artigos e "Compartilhar perfil" entraram com a fatia 14 (D86).
    - **Bio:** até 300 caracteres, o tamanho da bio da prancha com folga.
- **Alternativas descartadas:** seguir a prancha desktop (e-mail e senha no perfil, e a aba de segurança vazia para quem não administra); processar a foto na fila (mais um estado de "processando" para uma imagem de 512 px); exigir login para confirmar o e-mail novo (o link costuma ser aberto no celular).
    - **Username antigo não redireciona:** depois da troca, `/@antigo` deixa de funcionar e o username fica livre na hora (RF-029), como a prancha avisa. Redirecionar ligaria a identidade antiga à nova, o que expõe quem troca de username justamente para se desvincular.

### D78 — Hospedagem

- **Status:** Aprovada (21/11/2026).
- **Contexto:** p8-01. Requisitos já registrados (seção 3.5, D52 a D54, D71): PHP 8.4 com GD (WebP) e `exif`, MariaDB com controle da configuração, worker de fila permanente, agendador a cada minuto e acesso ao R2. Foi pedido publicar o frontend na Vercel.
- **Decisão:** VPS Cloud Compute da Vultr na região de São Paulo, com 2 GB de RAM, gerenciado pelo Ploi (plano Basic): MariaDB no próprio servidor, worker pelo Supervisor, agendador pelo cron, SSL e deploy repetível pelo script [`deploy/ploi-deploy.sh`](../deploy/ploi-deploy.sh). Imagens e backups seguem no R2 (D53, D55). O passo a passo está em [`DEPLOY.md`](DEPLOY.md). Custo estimado em novembro de 2026: cerca de US$ 15 do servidor (com o acréscimo regional) e US$ 9 do Ploi, por mês.
- **Alternativas descartadas:**
    - Vercel: com Inertia, as páginas do React vêm do Laravel, então o frontend não roda sozinho; e a plataforma, serverless, não tem fila permanente nem agendador.
    - Laravel Cloud: sem manutenção de servidor, mas oferece MySQL em vez de MariaDB, sem controle da configuração do FULLTEXT (D54), sem região no Brasil e com conta variável.
    - Railway: conta variável, sem região no Brasil e banco em container com menos controle.
    - Forge: equivalente ao Ploi, por US$ 12 em vez de US$ 9.
    - Hospedagem compartilhada: não permite worker permanente.
- **Riscos:** as atualizações de segurança do servidor ficam com o projeto (o Ploi automatiza parte); o banco e a aplicação dividem o mesmo servidor, então um pico de uso afeta os dois.
- **Pendente:** o provedor de e-mail (p8-01, D71), sem o qual a conta não é confirmada; o backup e a restauração (p8-05).

### D79 — Artigos, versões, categorias e tags

- **Status:** Aprovada (22/11/2026).
- **Contexto:** a fatia 7 modela artigos e versões (p4-01), os estados (p4-02) e categorias e tags (p4-03). A estratégia de versionamento do conteúdo estava em aberto (seção 3.5).
- **Decisão:**
    - **Versionamento por cópia completa:** cada versão guarda título, conteúdo (JSON do Tiptap e o texto puro extraído), idioma, categoria e tags. A versão enviada fica congelada, a publicada segue no ar durante uma edição (RF-330) e o histórico é a lista de versões. Diferenças entre versões não são guardadas: o conteúdo tem até 50.000 caracteres (RF-078), e a cópia é o modelo mais simples de aprovar, rejeitar e restaurar.
    - **Artigo:** guarda o estado (não publicado ou publicado), a versão em vigor e a primeira publicação. A lixeira é a exclusão suave do Laravel (`deleted_at`): o estado continua guardado, e a restauração o devolve sem regra extra (RF-340, RF-341). O artigo sobrevive à exclusão da conta, sem autoria, até a anonimização (fatia 22).
    - **Limites no banco (RF-351):** colunas geradas únicas garantem no máximo um rascunho, uma pendente e uma em vigor por artigo, mesmo com dois pedidos ao mesmo tempo. Rejeitadas e substituídas se acumulam.
    - **Estados:** `ArticleState` e `VersionStatus`, com as transições em regras puras (`VersionTransitions`, `ArticleTransitions`), testadas para cada par permitido e recusado. A correção de uma versão rejeitada é um rascunho novo baseado nela (`based_on_id`), e a versão rejeitada não muda. As ações que usam as regras (enviar, retirar, aprovar, rejeitar, despublicar) entram com as fatias 8, 10 e 16.
    - **Categorias:** nome em português e em inglês, um dos pastéis do DESIGN e um slug que não muda ao renomear. As dez iniciais são as da página de apresentação. Excluir uma categoria em uso exige escolher o destino, e todas as versões que a usam são transferidas na mesma transação (RF-126); o banco também impede a exclusão direta.
    - **Tags:** guardadas já na forma normalizada (minúsculas, sem acento, hífen no lugar de espaço, mantendo `#`, `+` e `.`), com até 40 caracteres. Unir leva as versões para a tag certa e transforma a antiga em apelido, então quem digitá-la depois cai na tag certa. A tela sugere uniões por uma chave aproximada ("reactjs" e "react-js" parecem "react"), guardada e indexada em `tags.loose_key`, para consultar só as tags parecidas com as da página exibida; quem une é a administradora. Tag bloqueada não pode ser usada (RF-129); excluir tira a tag de todas as versões.
    - **Tela:** "Categorias e tags" no painel, no desenho da prancha, com o nome nos dois idiomas e a cor no criar e renomear. As categorias reais passam a aparecer na página de apresentação (D74).
- **Alternativas descartadas:** guardar diferenças entre versões (complexo para aprovar e restaurar, sem ganho no tamanho dos artigos); um campo de estado "na lixeira" (exigiria guardar o estado anterior à parte); a categoria no artigo em vez da versão (mudar a categoria de um artigo publicado não passaria pela revisão); nome de categoria só em português.
- **Pendente:** as tabelas de imagens entram com a fatia 9 (D81), porque o formato delas depende do processamento de lá; o registro de auditoria das ações da administradora em categorias e tags entrou com a auditoria (D87); o slug e o endereço do artigo, com a leitura (fatia 12, D83).

### D80 — Editor, salvamento automático e prévia

- **Status:** Aprovada (21/11/2026).
- **Contexto:** a fatia 8 entrega a escrita (p4-04), o editor (p4-05) e a prévia (p4-06), nas pranchas "Editor", "Editor vazio", "Prévia" e "Detalhes do artigo · mobile". A D51 define Tiptap 3 e tiptap-php; faltava decidir como o esquema é compartilhado, como o rascunho é salvo e onde o código é colorido.
- **Decisão:**
    - **Esquema:** o `Support/Editor/EditorSchema` é a única lista de nós, marcas, atributos, cores, alinhamentos, níveis de título e linguagens de código. O editor recebe do servidor as listas que mostra (cores, linguagens, limites) e monta só as extensões correspondentes. A paridade é conferida por uma fixture compartilhada (`tests/Fixtures/editor/parity.json`), lida pelo Pest e pelo Vitest: o editor tem exatamente os nós e marcas do servidor, e o documento com todos os elementos volta igual dos dois lados.
    - **Limpeza ao salvar:** o `DocumentSanitizer` percorre o JSON pela lista permitida e descarta o que não conhece (link fora de http, https e mailto; cor fora da paleta; sublinhado; justificado). O editor não produz nada disso, então só uma requisição forjada perde conteúdo. A recusa explícita de conteúdo fora do esquema, prevista na D51, vale no envio para aprovação (fatia 10).
    - **Renderização:** o `ArticleRenderer` gera, no servidor, o HTML, o sumário (títulos com âncora), o texto puro, as contagens e o tempo de leitura (200 palavras por minuto, mínimo de 1). A prévia e a página pública (fatia 12) usam o mesmo resultado. Cor e destaque saem como classes com o nome da paleta, com valor por tema no CSS.
    - **Código colorido no servidor:** `tempest/highlight` (MIT), sem JavaScript de coloração no navegador. As 37 linguagens oferecidas estão no esquema; o bloco de código é sempre escuro, nos dois temas.
    - **Salvamento automático:** o editor manda só os campos alterados, 1,2 s depois da última mudança, por JSON (`POST /articles` cria; `PUT /articles/{id}/draft` atualiza), com nova tentativa a cada 8 s em falha de rede e aviso ao sair com algo não salvo. O artigo só é criado no primeiro salvamento: abrir "Escrever" e sair não deixa rascunho vazio. Depois dele, a URL vira a de edição sem recarregar.
    - **Rascunho de artigo já enviado ou publicado:** o rascunho é copiado da versão pendente, senão da aprovada, senão da rejeitada (`StartDraft`, RF-103, RF-330), com `based_on_id`. Revisto na D82: a cópia acontece no primeiro salvamento, não ao abrir. A versão em vigor continua no ar.
    - **Espaços do conteúdo:** o `TrimStrings` do Laravel não roda nas rotas de rascunho, porque cortaria os espaços entre trechos de texto do JSON. Só o título é aparado, na própria validação.
    - **Limites:** título de 150 caracteres, conteúdo de 50.000 (medido no texto puro depois da limpeza), até 10 tags, idioma entre os da interface. Tag bloqueada é recusada com o nome dela.
- **Fora desta fatia:** o painel "o que falta" já aparece, mas o botão de envio fica oculto até a fatia 10; capa e imagens no editor, na fatia 9. A prancha mostra um subtítulo, que não existe nos requisitos e ficou de fora.
- **Alternativas descartadas:** guardar HTML (perde a validação estrutural da D51); colorir o código no navegador com Shiki ou highlight.js (mais JavaScript na leitura, e a prévia dependeria do navegador); salvar por formulário do Inertia (cada salvamento recarregaria as props da página); criar o artigo ao abrir "Escrever" (deixaria rascunhos vazios).

### D81 — Imagens dos artigos

- **Status:** Aprovada (22/11/2026).
- **Contexto:** a fatia 9 entrega a capa e as imagens no editor (p4-07, RF-079 a RF-091). A D52 define o processamento e a D53, o armazenamento e a entrega; faltava o modelo de dados, a regra de acesso e o caminho do envio até o texto.
- **Decisão:**
    - **A imagem pertence ao artigo**, não à versão (`article_images`). As versões só a citam (`article_version_image`), então a cópia de uma versão para um rascunho não duplica arquivos, e uma imagem repetida entre versões conta uma vez (RF-089). A ligação é recalculada a cada salvamento, a partir do texto e da capa.
    - **Envio:** `POST /articles/{id}/images`, em JSON, só para quem escreveu. Aceita JPG, PNG e WebP até 10 MB (RF-081, RF-085) e até 50 megapixels: um arquivo pequeno pode virar uma imagem enorme ao ser aberto. Só durante o processamento, a memória do PHP sobe para 512 MB, se estiver abaixo disso. O artigo novo é criado antes do envio, porque a imagem pertence a ele.
    - **Processamento:** o `ImageProcessor` desvira pela orientação da câmera, limita o maior lado a 3.200 px e regrava em WebP sem metadados (RF-086). As larguras 480, 960 e 1600 são geradas pela fila (`GenerateImageVariants`), só as menores que o original. Até a fila terminar, a rota entrega o original.
    - **No texto:** o nó `image` do esquema guarda o id, o texto alternativo, a legenda e a marcação de decorativa (RF-087, RF-088). O servidor recusa imagem de outro artigo e mais de cinco no texto (RF-080); a capa não entra na conta. O renderer gera `<figure>` com `srcset`, dimensões e carregamento preguiçoso, e alt vazio na imagem decorativa. Imagem colada de outro site é ignorada: só entra o que passou pelo envio.
    - **Capa:** na versão (`cover_image_id`, `cover_alt`, `cover_decorative`), escolhida no painel de detalhes, como na prancha.
    - **Acesso (RF-090):** a imagem é pública quando a versão em vigor de um artigo publicado, fora da lixeira, a cita. Fora disso, só o autor e a administradora a veem; para os demais, a rota responde 404, sem revelar que existe. A pública vai com cache longo; a privada, com cache privado de 5 minutos, porque pode mudar de estado na aprovação.
    - **O que falta para enviar:** havendo imagens ou capa, entra o item "Texto alternativo das imagens", com "Corrigir" levando ao primeiro campo vazio. A recusa do envio sem texto alternativo entra com o envio (fatia 10).
    - **Limpeza:** imagem enviada há mais de 24 horas que nenhuma versão cita (no texto ou na capa) é apagada pelo `model:prune` diário, com os arquivos (REQUIREMENTS §7). Apagar o artigo de vez também apaga os arquivos das imagens dele, porque o banco só apaga as linhas.
- **Fora desta fatia:** a retenção das versões substituídas (p4-11, fatia 11): o `model:prune` diário guarda as cinco mais recentes de cada artigo, ordenadas pela data da aprovação; as substituídas só passam a existir com a aprovação (fatia 16). Quando ela apagar versões, as imagens que ficarem sem uso caem na limpeza acima. As recomendações de dimensões (RF-091) aparecem só como "JPG, PNG ou WebP · até 10 MB", como na prancha.
- **Alternativas descartadas:** imagem por versão (duplicaria arquivos a cada edição); guardar a URL no documento (a URL muda com a entrega da D53 e não carrega a regra de acesso); gerar os tamanhos durante o envio (a resposta demoraria vários segundos em fotos grandes).

### D82 — Envio para revisão, Meus artigos e lixeira

- **Status:** Aprovada (23/11/2026).
- **Contexto:** a fatia 10 entrega o envio e a retirada da fila (p4-08), Meus artigos (p4-09) e a lixeira (p4-10), nas pranchas "Meus artigos" e nos estados de envio, retirada e lixeira. A D80 criava o rascunho ao abrir o editor; com as seções de Meus artigos, isso mudaria o artigo de seção sem nenhuma edição.
- **Decisão:**
    - **O rascunho nasce no primeiro salvamento.** Abrir o editor ou a prévia mostra a versão de trabalho (`WorkingVersion`: o rascunho; senão a pendente, a em vigor ou a última rejeitada), sem criar nada. O `StartDraft` só roda quando chega um salvamento. Revisa a D80 nesse ponto.
    - **Envio (`SubmitDraft`):** só o rascunho vai à fila, e só sem outra pendente (RF-102, RF-344). A lista do que falta (`SubmissionChecklist`) confere título, conteúdo, categoria, idioma, texto alternativo em todas as imagens e na capa (RF-318), e se o conteúdo está dentro do esquema: aqui o servidor recusa em vez de limpar (D51). O editor confere a mesma lista antes de enviar, para não esperar a recusa. Depois do envio, o autor vai para Meus artigos, com o aviso "Enviado para revisão" e a estimativa de até 6 horas (RF-377).
    - **Retirada (`WithdrawPending`):** a pendente volta a rascunho (RF-345). Com um rascunho mais novo, o autor escolhe qual manter, e a outra é descartada (RF-104); é o único caso com confirmação. A retirada simples tem "Desfazer", que reenvia.
    - **Meus artigos (`AuthorArticles`):** cada artigo em uma única seção. Publicado fica em Publicados, com o selo "Edição aguardando revisão" ou "Edição rejeitada". Os demais vão pela versão mais recente: rascunho, aguardando revisão ou não aprovado (RF-112 a RF-115). Uma pendente com rascunho mais novo fica em Rascunhos, com "Versão anterior na fila" e a retirada à mão. Seções vazias não aparecem. A página substitui o painel do kit inicial (`/dashboard` redireciona para `/my-articles`).
    - **Lixeira:** "Mover para a lixeira" fica em "Mais ações", sem "Tem certeza?", com "Desfazer" no aviso. A restauração vale por 7 dias e devolve o estado de antes (RF-336). Depois disso, o `model:prune` diário apaga o artigo de vez, com as versões e os arquivos das imagens (RF-119).
- **Fora desta fatia:** "Ver" o artigo publicado (feito na fatia 12, D83) e "Copiar link" do aviso de aprovação (fatia 16); curtidas na linha; o item da Política de conteúdo na justificativa e o registro da exclusão definitiva na auditoria (feitos na fatia 16, D87); o aviso de aprovação (fatia 19); pausar o prazo da lixeira durante uma suspensão (A24, fatia 21).
- **Alternativas descartadas:** tratar um rascunho nunca editado como inexistente nas seções (a regra ficaria escondida na consulta); pedir confirmação para mandar à lixeira (a restauração de 7 dias e o "Desfazer" já protegem); exclusão definitiva pelo autor antes dos 7 dias (os requisitos a deixam para a rotina e para a administradora, RF-342).

### D83 — Listagem, leitura e endereço do artigo

- **Status:** Aprovada (23/11/2026).
- **Contexto:** a fatia 12 entrega a regra única de visibilidade (p5-01), a listagem em `/artigos` (p5-02), a leitura (p5-03) e o layout editorial (p5-08), nas pranchas "Home", "Leitura" e "Página não encontrada". O endereço do artigo estava em aberto desde a D79. Curtidas, favoritos, comentários, compartilhar, denunciar, busca e filtros ainda não existem.
- **Decisão:**
    - **Endereço:** `/artigos/{slug}`, com o slug gerado do título na primeira publicação (`AssignSlug`) e que nunca muda, nem com um título novo, para os links compartilhados não quebrarem. Título repetido ganha `-2`, `-3`, contando a lixeira; o índice único do banco segura a corrida. A aprovação (fatia 16) chama o `AssignSlug`; até lá, só a factory e o conteúdo de demonstração publicam. A listagem fica em `/artigos`, como pede o RF-379, embora as rotas da conta estejam em inglês.
    - **Regra única de visibilidade (`PublicArticles::query()`):** publicado, fora da lixeira, com versão em vigor e slug. A listagem, a leitura, a apresentação e o acesso público às imagens (RF-090) partem dela; a busca e o perfil vão partir. A situação do autor (RF-353) entra nela com as penalidades (fatia 21).
    - **Listagem:** do mais novo para o mais antigo, pela primeira publicação (RF-136), 12 por página, com páginas numeradas (RF-133; no celular, "Página X de Y"). As categorias aparecem como filtro (`?categoria=`), só as que têm artigo. O cartão leva um resumo tirado do começo do texto, porque a versão não tem campo de resumo, e o tempo de leitura sai do texto puro, sem renderizar o documento.
    - **Leitura:** o mesmo componente da prévia (`ArticleView`) e a mesma montagem no servidor (`ArticlePage`), então o que o autor vê antes de enviar é o que vai ao ar. "Atualizado em" aparece quando a versão em vigor foi aprovada num dia depois da primeira publicação (RF-137). Cabeçalho discreto com barra de leitura presa à rolagem (CSS `animation-timeline`; sem suporte, não aparece), sumário que marca o título em leitura e, no celular, abre por baixo. No fim, o mascote lendo e "Ver mais artigos de {categoria}". Artigo de conta excluída mostra "Autor removido", sem link de perfil (RF-051).
    - **404:** artigo fora do ar e endereço que não existe mostram a mesma página "Não achamos esta página", sem revelar se o artigo existe. Vale para 404 dentro de uma rota (pelo tratamento de exceções) e para endereço sem rota (`Route::fallback`, que passa pelos middlewares e mantém cabeçalho e idioma). Pedidos JSON e imagens continuam com a resposta curta.
    - **Cabeçalho do site:** ganha "Artigos" e "Categorias" (que leva ao filtro da listagem) e, para visitante, "Escrever", que leva ao cadastro, no lugar de "Criar conta", como na prancha. No celular, a navegação vai para um menu.
    - **Apresentação (D74):** recebe os 12 artigos recentes, quem publicou no mês e os botões de leitura de volta ("Ler artigos", "Ler os artigos", "Explorar artigos", "Ver todos os artigos"). "Entrar" continua no cabeçalho, ao lado de "Ler artigos".
    - **Meus artigos (D82):** o publicado ganha "Ver", que abre a leitura.
- **Fora desta fatia:** ordenar e filtrar (botão "Filtros" e "Ordenar por") e a caixa de busca no cabeçalho e no 404 (fatia 13; "mais curtidos" depende das curtidas, fatia 17); curtir, favoritar, compartilhar, denunciar e comentários na leitura (fatias 14, 17, 18 e 20); tags como links de filtro (fatia 13). O subtítulo abaixo do título da prancha não existe nos dados: não há campo de resumo no editor.
- **Alternativas descartadas:** id no endereço (`/artigos/42-titulo`, que acompanha o título mas carrega o número); slug que muda com o título (quebraria links compartilhados); escopo no modelo para a visibilidade (a ARCHITECTURE pede a regra como `Query`, que também agrupa as consultas da listagem); páginas 404 diferentes para "não existe" e "saiu do ar" (revelaria artigos despublicados).

### D84 — 2FA da administradora desligado por enquanto

- **Status:** Aprovada (23/11/2026).
- **Contexto:** a D75 exige o 2FA para abrir o painel (RF-017). A pessoa responsável pelo produto pediu para tirar o 2FA agora e colocar outra forma de proteção depois, ainda sem definição.
- **Decisão:**
    - **Desligado, não removido:** um interruptor, `auth.admin_two_factor` em `config/auth.php`, fica em `false`. Com ele desligado, o painel abre só com a senha (o `EnsureTwoFactorConfirmed` deixa passar), o login não pede o código mesmo para quem já tinha o 2FA (o pipeline do Fortify pula o desafio), a ativação em `/admin/two-factor` responde 404, Configurações › Segurança não mostra o 2FA e o selo "2FA ativo" some do cabeçalho do painel.
    - **O código continua:** telas, ações, colunas, o comando `admin:reset-2fa` e os testes do 2FA ligado ficam no projeto; os testes ligam o interruptor para descrever a D75. Ligar o interruptor devolve tudo como era.
    - **O que continua protegendo o painel:** conta confirmada, a permissão de administradora (só uma, criada por comando), o limite de tentativas de login e o registro de eventos de segurança.
- **Riscos:** com a senha como único fator, uma senha vazada abre o painel. Até a nova proteção existir, a senha da administradora deve ser longa e única. Abrir o site ao público sem segundo fator é uma decisão a revisar antes da p8-06.
- **Pendente:** escolher a nova proteção (por exemplo, passkeys/WebAuthn, código por e-mail ou religar o TOTP) e registrar a decisão. RF-017 e RF-018 ficam suspensos até lá.
- **Alternativas descartadas:** remover todo o código do 2FA (a nova proteção pode reaproveitar parte dele, e religar ficaria caro); desligar só no ambiente local (o pedido vale para o produto).

### D85 — Busca

- **Status:** Aprovada (24/11/2026).
- **Contexto:** a fatia 13 entrega a busca (p5-04), os filtros e a ordenação (p5-05) e os testes da visibilidade (p5-09), nas pranchas "Busca com filtros", "Busca sem resultados" e na folha de filtros do celular. A D54 deixou para cá o tratamento dos termos com menos de 3 letras. As curtidas, de que dependem a ordenação "mais curtidos" e o filtro de popularidade, só chegam na fatia 17.
- **Decisão:**
    - **Endereço:** `/busca`, com os parâmetros em português (`q`, `categoria`, `autor`, `idioma`, `tags[]`, `periodo`, `ordem`), compartilháveis. `/artigos/busca` confundiria com o slug de um artigo. Valor que não faz sentido no endereço é ignorado, sem erro.
    - **Consulta única (`ArticleSearch`):** parte da regra única de visibilidade (`PublicArticles`) e é o único lugar com `MATCH ... AGAINST`. Índice FULLTEXT em `article_versions(title, content_text)`, consultado na versão em vigor. Cada termo precisa aparecer em algum lugar: título ou texto (com prefixo, "fila" acha "filas"), nome ou username do autor, nome da categoria ou tag. Palavras comuns em português e em inglês são ignoradas; as em inglês estão na lista do InnoDB e, sozinhas, nunca dariam resultado.
    - **Termos curtos (pendência da D54):** tratados no código, sem mudar o MariaDB. "Go", "JS", "UI" e "C#" procuram a palavra inteira no título (`REGEXP`), o nome da categoria e a tag de mesmo nome. Quando a busca tem um termo curto, aparece o aviso "Termos curtos ainda são limitados". Letras soltas são ignoradas.
    - **Ordenação e filtros:** "Mais recentes" (padrão por enquanto) e "Mais antigos", pela primeira publicação (RF-136). Filtros de categoria, autor, idioma, tags (até 5, com sugestões das tags dos artigos visíveis) e período da primeira publicação: último mês, 6 meses ou 1 ano (RF-135). Cada mudança já busca; "Ver N resultados" só fecha o painel ou a folha. Os filtros ligados aparecem como chips, cada um com "Remover".
    - **Sem resultado:** dicas (grafia, termos mais gerais e, com categoria, tirar o filtro), "Buscar em todas as categorias", "Ver todos os artigos", o aviso dos termos curtos e os três artigos mais recentes da categoria escolhida, ou de todas.
    - **Onde a busca aparece:** no cabeçalho do site (desktop) com o termo atual, como botão no celular e na leitura, no topo da página de busca no celular e no 404, com exemplos que se revezam no lugar do placeholder (troca simples de texto, que para com "Pausar animações") e rótulo fixo. As tags da leitura levam à busca por elas.
    - **Listagem com os mesmos filtros:** `/artigos` é a busca sem termo. Usa o `ArticleSearch`, os mesmos parâmetros e o mesmo "Ordenar por" e "Filtros" ao lado do título, como na prancha "Home"; as categorias continuam também em chips. Categoria que não existe no endereço só não acha nada, em vez de dar 404.
    - **Cabeçalho mais leve (pedido na revisão):** o cabeçalho do site fica com logo, "Artigos", a busca, tema, idioma, "Entrar" ou o avatar e "Escrever". "Categorias" saiu da barra (as categorias seguem em chips na listagem, e o 404 leva a elas), e "Meus artigos" foi para o menu do avatar, junto de Configurações e Sair, em todos os cabeçalhos. Revisa a D83 nesse ponto.
    - **Foco do campo de busca:** nos campos da busca e dos filtros, o anel de foco cobre a borda (deslocamento de −1 px) em vez de ficar 2 px fora dela, para aparecer uma linha só. Continua com 2 px na cor de foco (DESIGN §2.8).
    - **Testes:** o FULLTEXT do InnoDB só enxerga dados confirmados, então a busca por texto tem uma suíte própria (`tests/Search`), que migra o banco a cada teste e roda por último. Filtros e termos curtos ficam nos testes de sempre.
- **Fora desta fatia:** "Mais curtidos" como padrão e o filtro de popularidade (7, 30, 90 dias ou sempre) entram com as curtidas (fatia 17; resolvido na D88). A sugestão de grafia da prancha ("kubernetes" em vez de "kubernets") precisaria de um dicionário; fica a dica genérica.
- **Alternativas descartadas:** `innodb_ft_min_token_size = 2` (depende de configuração do servidor em cada ambiente e de reconstruir o índice); mostrar "Mais curtidos" com todas as curtidas em zero (o controle não mudaria nada); ordenar por relevância (os requisitos pedem só as três ordens do RF-132); exigir só um dos termos (resultados demais e sem ordem de relevância para separar).

### D86 — Perfil com artigos e compartilhar

- **Status:** Aprovada (24/11/2026).
- **Contexto:** a fatia 14 entrega os artigos no perfil público (p5-06) e o compartilhamento (p5-07), nas pranchas "Perfil do autor" e "Compartilhar artigo". A RF-163 pede WhatsApp, LinkedIn, Facebook, X, "outras redes sociais" e copiar o link. Denunciar perfil e artigo entra com a fatia 20; curtir e favoritar, com a 17 e a 18.
- **Decisão:**
    - **Perfil:** os artigos vêm da regra única de visibilidade (`PublicArticles::byAuthor`), 12 por página, mais recentes ou mais antigos primeiro, com "Mostrando X–Y de N" quando há mais de uma página. A contagem "N artigos publicados" conta só os visíveis. Esconder o perfil em carência de exclusão e em suspensão entra com as fatias 21 e 22, junto da regra de visibilidade do autor.
    - **Compartilhar:** um módulo próprio (`components/share`), usado na leitura (abaixo das tags e ao lado do sumário, como na prancha) e no perfil ("Compartilhar perfil"). Os botões abrem as páginas de compartilhar de cada rede numa aba nova; o e-mail abre o programa de e-mail; o link vem do navegador na hora e pode ser copiado, com o aviso "Link copiado". No celular, o diálogo sobe de baixo. "Outras redes" são cobertas pelo compartilhar do próprio aparelho ("Mais opções do aparelho"), que só aparece onde o navegador oferece. Nenhum script das redes é carregado: só links, sem rastreio.
    - **Logos das redes:** os desenhos do Simple Icons (CC0) copiados para `components/share/brand-icons.tsx`, com fonte e licença no topo, porque o `lucide-react` não tem ícones de marca. O do LinkedIn vem da versão 9.21.0, a última que o trazia.
    - **Fim da leitura:** ganha "Achou útil? Compartilhe com quem pode gostar.".
- **Fora desta fatia:** "Denunciar perfil" e "Denunciar" na leitura (fatia 20); "Copiar link" no aviso de aprovação de Meus artigos (fatia 16).
- **Alternativas descartadas:** botões oficiais das redes (carregam scripts de terceiros e rastreiam quem lê); só o compartilhar do aparelho (não existe na maioria dos navegadores de desktop); o endereço montado no servidor (o navegador já sabe o endereço certo, inclusive pelo túnel da prévia).

### D87 — Moderação, auditoria e painel

- **Status:** Aprovada (24/11/2026).
- **Contexto:** a fatia 16 entrega aprovação e rejeição com e-mail (p6-05, p6-06), despublicação e exclusão pela administradora (p6-07), auditoria (p6-09) e o painel (p6-15), nas pranchas "Admin · Painel", "Fila de aprovação", "Revisar versão", "Rejeitar" e "Auditoria". Nenhuma prancha mostra onde despublicar ou excluir um artigo publicado.
- **Decisão:**
    - **Módulos:** `Domain/Moderation` (aprovar, rejeitar, despublicar, excluir, a fila e os itens da Política) e `Domain/Audit` (registro e consulta). A moderação usa `Articles` e `Audit`; a auditoria não depende de ninguém.
    - **Aprovar (`ApproveVersion`):** a versão entra em vigor, o artigo fica publicado e ganha o endereço fixo na primeira aprovação (D83). Numa edição, a versão anterior passa a substituída, e a retenção da fatia 11 passa a agir. A data da primeira publicação não muda.
    - **Rejeitar, despublicar e excluir:** exigem o item da Política de conteúdo e a justificativa (10 a 2000 caracteres). Os itens vêm do próprio texto da Política em vigor (`ContentPolicyItems`), então mudam junto com ela; a versão guarda o item em `decision_policy_item`. Despublicar devolve o artigo a não publicado, com a versão em vigor rejeitada e o endereço guardado. Excluir apaga o artigo, as versões e os arquivos das imagens, inclusive na lixeira.
    - **Retirada durante a análise (RF-105, R03):** a decisão trava a versão no banco e é recusada, com aviso, se ela não estiver mais pendente.
    - **Fila:** versões pendentes de artigos fora da lixeira, as mais antigas primeiro, com o tipo (novo ou edição), busca por título ou autor e o selo "atrasada" depois de 6 horas (RF-378). A contagem aparece na lateral do painel. Depois de decidir, a revisão segue para a próxima da fila; J e K andam entre elas.
    - **Revisão:** o retrato congelado com a mesma renderização da leitura (`ArticlePage`), e "Sobre a versão" com o texto alternativo das imagens, o número de links e o idioma. Os links não são abertos, porque conferir se estão quebrados exigiria acessar sites de fora.
    - **Despublicar e excluir pela leitura:** um menu "Moderação" na página do artigo, só para a administradora, com um diálogo para cada ação.
    - **E-mails à autora (p6-05):** aprovado, rejeitado (com o item e a justificativa, e o aviso de que a versão publicada continua no ar quando é edição), despublicado e excluído, nos dois idiomas, pela fila e só depois de a decisão estar gravada. Sem nenhuma escolha de provedor (D71). O aviso dentro do site entra com as notificações (fatia 19).
    - **Auditoria:** `audit_logs` guarda quem fez, a ação, o alvo em texto ("“Título” de @username", para continuar legível depois que o artigo some), o item e a justificativa, nunca o conteúdo. O modelo recusa alterar e apagar (RF-291). Registra aprovação, rejeição, despublicação, exclusão, as ações em categorias e tags (pendência da D79) e a exclusão automática da lixeira vencida, sem responsável (pendência da D82). A página filtra por ação, período e busca, e exporta o filtro em CSV.
    - **Lixeira com versão na fila (RF-123):** ir para a lixeira devolve a versão da fila a rascunho; se já existe um rascunho, fica o rascunho, que é o trabalho mais novo, e a versão da fila é descartada.
    - **Painel:** usuários, artigos publicados, aguardando aprovação e, em "Precisa da sua atenção", as versões atrasadas com "Revisar".
    - **Meus artigos:** a rejeição mostra o item da Política, com link para ele (pendência da D82).
- **Fora desta fatia:** denúncias abertas no painel e as ações de denúncias, penalidades e contestações na auditoria (fatias 20 e 21); a notificação dentro do site e o aviso "Aprovado" em Meus artigos (fatia 19); anonimizar e apagar os registros de contas excluídas (fatia 22).
- **Alternativas descartadas:** auditoria por eventos e listeners (mais peças, sem ganho, enquanto só a moderação registra); itens da Política numa tabela própria (duplicaria o texto da Política, que já é a fonte); exclusão pela autora antes dos 7 dias (os requisitos a deixam para a rotina e a administradora).

### D88 — Comentários e curtidas

- **Status:** Aprovada (24/11/2026).
- **Contexto:** a fatia 17 entrega os comentários com respostas (p6-01) e as curtidas em artigos e comentários (p6-02), na prancha "Comentários · logada" (desktop e mobile). A D85 deixou para cá "Mais curtidos" e o filtro de popularidade.
- **Decisão:**
    - **Módulo:** `Domain/Interactions` (comentar, editar, curtir, a consulta dos comentários e as regras). Depende só de `Articles` (a regra única de visibilidade). A remoção pela administradora fica em `Moderation` (`RemoveComment`), porque é moderação e grava auditoria.
    - **Quem participa (RF-140, RF-141):** qualquer pessoa lê os comentários e vê a contagem de curtidas; comentar, responder e curtir exigem conta com e-mail confirmado. Só em artigos visíveis pela regra única.
    - **Limites (`CommentRules`):** até 2000 caracteres; respostas até o terceiro nível; 30 segundos entre comentários da mesma conta, conferidos no banco com a linha da conta travada (duas abas não furam o limite), além do limite de requisições por minuto na rota.
    - **Editar e excluir:** quem escreveu edita (aparece "editado" só quando o texto muda) e exclui; a autora do artigo também exclui comentários no próprio artigo. Excluir leva junto as respostas, e o diálogo avisa quantas. A administradora remove o comentário de outra pessoa com item da Política e justificativa, registrado na auditoria (`comment_deleted`), sem guardar o texto.
    - **Páginas da conversa (pedido na revisão):** 5 comentários de primeiro nível por página, cada um com todas as respostas, e a paginação numerada da listagem para trocar de página (`?comentarios=N`), sem rolagem sem fim. Trocar de página recarrega só os comentários e leva a leitura e o foco ao título "Comentários". Um comentário novo entra no fim da conversa, então publicar abre a página dele; responder, editar e apagar ficam na mesma página (ou na última, se ela acabar).
    - **Conversa mais viva (pedido na revisão):** o campo começa numa linha e abre ao focar, com a dica e o botão; Ctrl + Enter (⌘ + Enter) publica. O contador aparece só a partir de 90% do limite, em âmbar, e em vermelho no limite. O comentário publicado entra subindo, com o fundo destacado por um instante, e a página rola até ele. As datas são relativas ("agora", "há 5 minutos", "ontem") até uma semana, com a data completa na dica, e se atualizam sozinhas. A conversa vazia convida com o mascote só quem pode comentar; para quem não pode, segue o texto simples (RF-141).
    - **Ações da leitura só com ícones (pedido na revisão):** curtir (coração e contagem), ir para os comentários (balão e contagem) e compartilhar, sem texto visível, com o nome para leitores de tela e na dica. Ao curtir, o coração pula e solta uma rajada de corações que sobem; cada curtida solta uma rajada nova, e várias podem estar no ar ao mesmo tempo. "Pausar animações" e "reduzir movimento" desligam a rajada. A curtida continua uma por pessoa.
    - **Curtidas:** uma por pessoa e item, garantida pela chave primária (`article_id, user_id` e `comment_id, user_id`); curtir de novo não faz nada. Autocurtida recusada (RF-152). A contagem é pública, quem curtiu não aparece. O botão muda na hora e confirma com o servidor; recarrega só as curtidas.
    - **"Mais curtidos" (pendência da D85):** passa a ser a ordem padrão da busca e da listagem, pelas curtidas recebidas no período de popularidade (7, 30 ou 90 dias, ou sempre; padrão 30), desempatando pela publicação mais recente. Endereço: `ordem=curtidos` e `popularidade=7|30|90|sempre`, omitidos quando são o padrão.
    - **Meus artigos:** os publicados mostram o número de curtidas, como na prancha.
- **Fora desta fatia:** "Denunciar" no menu do comentário (fatia 20); notificações de comentários e curtidas (fatia 19); esconder comentários de contas suspensas ou em exclusão (fatias 21 e 22); favoritos (p6-03).
- **Alternativas descartadas:** contadores guardados nas tabelas de artigos e comentários (mais escrita e risco de divergir, sem necessidade com os índices atuais); profundidade ilimitada com recursão (a prancha e os requisitos param no terceiro nível, e a leitura no celular ficaria estreita demais); exclusão lógica do comentário com "comentário removido" (nenhum requisito pede o rastro, e o texto não deve sobreviver).

### D89 — Favoritos

- **Status:** Aprovada (24/11/2026).
- **Contexto:** a fatia 18 entrega os favoritos (p6-03), nas pranchas "Favoritos" (desktop e mobile) e "Favoritos vazio". A prancha "Leitura" tem o botão "Favoritar"; a D88 deixou as ações da leitura só com ícones.
- **Decisão:**
    - **Módulo:** `Domain/Interactions`, junto de comentários e curtidas: `FavoriteArticle` (salvar e tirar) e `UserFavorites` (a lista). Depende só da regra única de visibilidade (`PublicArticles`).
    - **Quem favorita (RF-159, RF-150):** conta com e-mail confirmado, só em artigo visível. A autora pode favoritar o próprio artigo. Um favorito por pessoa e artigo, pela chave primária; salvar de novo não faz nada.
    - **Na leitura (RF-161):** o marcador com a contagem pública, na barra de ícones, depois do balão de comentários. Muda na hora e confirma com o servidor. Quem não pode favoritar vê só a contagem, sem convite (RF-141).
    - **A lista (RF-160):** `/favoritos`, sempre da pessoa logada, com "Só você vê esta lista.", a ordem "Salvos recentemente" (padrão) ou "Publicados recentemente" (`ordem=publicados`) e 12 por página. Entra no menu do avatar, junto de "Meus artigos". Sem ordenação pública por favoritos (RF-162) e sem contagens nos cartões (RF-161).
    - **Artigo fora do ar:** despublicado ou na lixeira, continua na lista como um cartão tracejado "Este artigo não está mais disponível", sem nada do conteúdo, até a pessoa remover. Não volta a ser favoritado enquanto estiver fora do ar. Excluído de vez, some da lista (RF-372).
    - **Remover:** sai na hora, com o aviso "Removido dos favoritos" e "Desfazer" (DESIGN, tabela de ações). Desfazer devolve o artigo ao mesmo lugar da lista: o servidor aceita a data em que ele tinha sido salvo, se estiver no passado.
    - **Lista vazia:** o mascote lendo, "Nada salvo ainda" e "Explorar artigos", como na prancha.
- **Fora desta fatia:** apagar os favoritos na exclusão definitiva da conta já acontece pelo banco; o fluxo de exclusão entra na fatia 22. Rankings de mais favoritados ficam com as métricas do painel.
- **Alternativas descartadas:** contador guardado no artigo (mesmo motivo da D88); tirar da lista os artigos fora do ar sem avisar (a prancha pede o aviso, e a pessoa perderia o registro sem saber); "Desfazer" refazendo o favorito com a data de agora (o artigo pularia para o topo de "Salvos recentemente").

### D90 — Notificações e endereços que deixam de receber e-mails

- **Status:** Aprovada (24/11/2026).
- **Contexto:** a fatia 19 entrega as notificações dentro do site (p6-04), o restante dos e-mails possíveis agora (p6-05) e a parte de bounces e reclamações (p6-17), nas pranchas "Notificações", "Menu do sino" e "Notificações vazias". O provedor de e-mail continua em aberto até a P8-01 (D71).
- **Decisão:**
    - **Módulo:** `Domain/Notifications` reage a eventos de `Interactions` (`CommentPosted`, `ContentLiked`, disparados só depois de gravados), que não sabe das notificações. A moderação já avisava a autora por `Notification` do Laravel; os mesmos avisos ganham o canal do site.
    - **Formato:** a tabela de notificações do Laravel, com `type` próprio e `data` mínimo. O texto é montado na tela, no idioma de quem lê, e não guardado pronto.
    - **O que avisa (RF-179 a RF-185):** artigo aprovado (ou edição aprovada), não aprovado, despublicado e excluído, com o item da Política e o caminho para Meus artigos; comentário no artigo da pessoa; resposta a um comentário dela; curtidas em artigo ou comentário dela. Ninguém é avisado do que ela mesma fez, e quem é autora do artigo e do comentário respondido recebe só o aviso da resposta. Denúncia analisada (RF-186) e perfil moderado (RF-187) entram com as fatias 20 e 21.
    - **Curtidas agrupadas (RF-184):** enquanto o aviso não é lido, novas curtidas no mesmo item entram nele ("5 pessoas curtiram seu artigo"), sem dizer quem; a mesma pessoa não conta duas vezes. Lido, a próxima curtida abre um aviso novo. Descurtir não muda o aviso.
    - **Abrir e ler (RF-188, RF-189):** abrir o sino ou a página não marca nada como lido. Clicar num aviso leva ao destino (o comentário já na página da conversa dele) e marca como lido. "Marcar como lida" e "Marcar todas como lidas" na página e no sino.
    - **Excluir (RF-190):** um por um ou "Limpar lidas".
    - **Retenção (RF-191):** 90 dias depois da última novidade, pelo `model:prune` diário. A pausa durante a suspensão (RF-192) entra com a fatia 21.
    - **Tela:** o sino no cabeçalho, com a contagem de não lidas (até "9+") e as cinco últimas, num menu não modal (o resto da página continua acessível). A página `/notificacoes` tem "Todas" e "Não lidas", grupos "Hoje", "Ontem" e "Anteriores", 20 por página, e o mascote dormindo quando não há nada. A contagem atualiza a cada navegação, sem conexão em tempo real.
    - **Endereços que deixam de receber e-mails (p6-17, parte neutra):** eventos próprios `EmailBounced` e `EmailComplained` em `app/Support/Mail`, sem nada de provedor. Ao receber um deles, a conta com aquele e-mail é marcada (`email_suppressed_at`, `email_suppressed_reason`) e o canal de e-mail do Laravel deixa de enviar para ela, porque a conta não informa mais o endereço. Os avisos no site continuam. Trocar o e-mail da conta desfaz a marcação.
    - **E-mails (p6-05):** os da moderação seguem como na D87. Os de suspensão, banimento, contestação e exclusão de conta (RF-198 a RF-202) entram com as fatias 21 e 22; os de troca de e-mail e de senha (RF-203, RF-204) já existem.
- **Fora desta fatia:** o webhook e o adaptador do provedor que disparam `EmailBounced` e `EmailComplained` entram com o provedor (P8-12), sem escolha de fornecedor até a P8-01 (D71). Avisos em tempo real (sem recarregar) ficam para depois, se fizerem falta.
- **Alternativas descartadas:** tabela própria de notificações (a do Laravel já serve e combina com as notificações existentes); guardar o texto pronto (ficaria no idioma de quando foi criado); uma notificação por curtida (contraria o RF-184 e enche a lista); webhook genérico agora (sem provedor, não há como verificar a assinatura dos avisos).

### D91 — Denúncias e troca obrigatória de username

- **Status:** Aprovada (24/11/2026).
- **Contexto:** a fatia 20 entrega as denúncias (p6-08), nas pranchas "Denunciar" (desktop e mobile) e "Admin · Denúncias". Um dos desfechos de perfil obriga a trocar o username, cuja tela era da fatia 23; os desfechos com penalidade dependem da fatia 21.
- **Decisão:**
    - **Módulo:** `Domain/Reports` (denunciar, decidir, a fila e fechar o que foi removido). Os desfechos usam as ações de `Moderation` (despublicar, excluir artigo, excluir comentário e a nova `ModerateProfile`), que não sabem das denúncias.
    - **Denunciar (RF-164 a RF-169):** artigo, comentário ou perfil, por conta confirmada, só o que está à vista. Pela leitura (ícone de bandeira na barra de ações), pelo menu do comentário e pelo perfil. Ninguém denuncia o que é seu; a autora do artigo denuncia comentários nele. Uma denúncia aberta por pessoa e item, pelo índice único do banco; depois da decisão, pode denunciar de novo. "Outro" exige detalhes. O conteúdo continua no ar (RF-165), e o botão fica parado com "Denúncia em análise" enquanto a da pessoa está aberta.
    - **Painel:** `/admin/reports`, com uma linha por item (várias denúncias do mesmo item viram uma), das mais denunciadas e mais antigas primeiro; abas Abertas, Procedentes, Improcedentes e Conteúdo removido; filtro por tipo; J e K andam pelas abertas. A análise mostra o item como está agora, os motivos com a contagem e os detalhes escritos, sem dizer quem denunciou. A lateral e o painel mostram os itens com denúncia aberta (RF-262).
    - **Decidir (RF-170 a RF-173):** a decisão vale para todas as denúncias abertas do item, com a justificativa sempre e o item da Política nas procedentes. Artigo: despublicar ou excluir de vez. Comentário: excluir (avisando quantas respostas vão junto). Perfil: redefinir foto, bio e/ou exigir a troca do username. Improcedente fica na auditoria (`report_dismissed`); as procedentes ficam pela ação aplicada. As denúncias são fechadas antes do desfecho, para a exclusão não as marcar como removidas.
    - **Quem denunciou (RF-172, RF-186):** recebe só "Sua denúncia foi analisada", sem o desfecho. **Perfil moderado (RF-187):** a dona recebe o aviso com o que voltou ao padrão e o item da Política (`profile_moderated` na auditoria).
    - **Conteúdo removido antes (RF-175):** excluir o comentário, o artigo de vez ou a conta fecha as denúncias abertas deles com "conteúdo removido", inclusive das respostas e dos comentários que saem junto pelo banco. Artigo na lixeira não fecha a denúncia, porque pode voltar.
    - **Troca obrigatória de username (RF-178, trazida da fatia 23):** a conta fica marcada e, no próximo acesso, toda página leva a `/trocar-username` (políticas, idioma e sair continuam livres), com o motivo, as regras conferidas enquanto a pessoa digita e a disponibilidade. O username antigo não vale, fica livre na hora e o endereço antigo do perfil deixa de funcionar.
    - **Pausar animações:** passa a desligar também as entradas presas à rolagem (`.reveal`, `.stack-pop`), como o "reduzir movimento" do sistema já fazia.
- **Fora desta fatia:** os desfechos com penalidade (suspensão e banimento) e a prioridade de quem tem penalidade ativa entram com a fatia 21.
- **Alternativas descartadas:** copiar o conteúdo na denúncia (contraria o RF-174); uma decisão por denúncia (a mesma coisa julgada várias vezes, com resultados que podem divergir); esconder o conteúdo denunciado até a análise (contraria o RF-165); guardar o "em análise" como status próprio (os requisitos só têm aberta, procedente e improcedente).
