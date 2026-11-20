# DECISIONS — he4rt ink

**Atualizado em:** 19/11/2026

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

- Estratégia de versionamento do conteúdo.
- Estratégia de cache.
- Infraestrutura de hospedagem (p8-01). Requisitos já conhecidos: PHP 8.4 com GD (WebP) e `exif`, MariaDB, worker de fila permanente, agendador e acesso ao R2. De preferência com controle da configuração do MariaDB (ver D54).
- Política técnica de exclusão e retenção.
- Processamento de visualizações.

Editor, imagens, busca, backup e identificação do administrador foram decididos em D51 a D56.

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
- **Riscos:** sem tolerância a erros de digitação nem variações de palavras. O InnoDB ignora palavras com menos de 3 caracteres (`innodb_ft_min_token_size`), o que afeta termos técnicos como "Go", "JS", "UI" e "C#". Mitigação a definir na p5-04: reduzir o valor no servidor (exige controle da configuração do MariaDB, ver 3.5) ou tratar termos curtos à parte.

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

- **Status:** Aprovada (19/11/2026).
- **Decisão:**
    - A tela de entrar não tem "Lembrar de mim", como a prancha: a sessão é sempre lembrada, e a pessoa continua conectada até sair. Quem escreve volta ao rascunho sem entrar de novo.
    - O limite de tentativas é o do próprio Fortify: 5 senhas erradas por minuto para o mesmo e-mail e IP. O login fica pausado até o prazo acabar, mesmo com a senha certa, e a tela mostra o aviso da prancha com os segundos que faltam. O limitador nomeado do starter kit foi retirado, porque contava também os logins certos e respondia com erro 429, sem disparar o evento `Lockout`.
    - Cada pausa vira um evento de segurança `login_blocked` em `security_events`, com o e-mail digitado, a conta (quando existe), o IP e o navegador. Um registro por pausa, não por tentativa, para não encher a tabela durante um ataque. Esses eventos somem depois de 90 dias (§2.23), pelo `model:prune` diário; os outros tipos de evento de segurança ficam enquanto a conta existir.
    - Os links "Termos de uso" e "Privacidade" do painel entram com as páginas, na fatia 4.
    - **Diferenças da prancha, pedidas na revisão:** no celular, o mascote fica num palco lilás com a órbita compacta e o formulário numa folha que sobe por cima (escolhida entre três propostas); a órbita e a flutuação do mascote são contínuas, em vez de pararem depois de uma volta; o painel não tem a estrela, o círculo e a onda soltos.
    - Como o movimento é contínuo, o painel tem o botão "Pausar animações" do RF-383 (WCAG 2.2.2): no rodapé do painel no desktop e no topo do palco no celular. A escolha fica no navegador (`localStorage`), vale para o site inteiro e é aplicada antes de a página aparecer. "Reduzir movimento" no sistema continua parando tudo.
    - O mascote segue o mapa do canvas (`DESIGN.md` §5.3), menos onde ele contraria a D57 e a D61: sem mascote em artigo não aprovado, na exclusão de conta e no admin. O texto alternativo continua vazio (D57), embora as pranchas usem uma descrição.
- **Alternativas descartadas:** caixa "Lembrar de mim" (diverge da prancha); sessão de 2 horas sem lembrar (quem escreve perderia o acesso no meio do texto); manter o limitador nomeado e acrescentar o do Fortify (exigiria copiar o pipeline de login do Fortify para a aplicação); registrar cada tentativa errada (ruído e dados pessoais sem ganho para a análise).
- **Pendente:** um limite por IP que valha para vários e-mails, contra tentativas em massa; hoje o limite é por e-mail e IP. O CAPTCHA diante de comportamento suspeito fica para depois do MVP (RF-021).

### D69 — Recuperar senha

- **Status:** Aprovada (19/11/2026).
- **Decisão:**
    - O pedido do link responde sempre da mesma forma, com conta ou sem conta e mesmo quando é repetido cedo demais: a tela "Link enviado" diz "Se existir uma conta com…" e nunca revela quem está cadastrado. A mensagem de "não encontramos esse e-mail" do Fortify deixou de ser usada.
    - O link vale por 60 minutos, e um novo link para o mesmo e-mail só sai depois de 60 segundos. A tela mostra a contagem no botão "Reenviar link".
    - Ao salvar a nova senha, todas as sessões abertas da conta são encerradas, inclusive as lembradas (D68), a troca vira o evento de segurança `password_changed` (RF-024) e a pessoa recebe o e-mail "Sua senha foi alterada", com o caminho para recuperar o acesso se não foi ela. A ação `SecureAccountAfterPasswordChange` faz os três passos e será reaproveitada na troca de senha logada (fatia 6), mantendo a sessão atual.
    - Os e-mails da conta saem em PT e EN: os templates de notificação e da moldura do Laravel foram publicados em `resources/views/vendor` com os textos em `lang/` (`mail.*`), e o rodapé deixou o "All rights reserved" por uma frase que diz por que a pessoa recebeu o e-mail.
    - A tela de nova senha não tem prancha no canvas: ela segue o cartão de "Recuperar senha", com os mesmos componentes. As telas em cartão passaram a montar o topo (mascote, título e texto) com `AuthCardHeader`, porque o mascote e o título mudam com o estado.
- **Alternativas descartadas:** manter a mensagem de e-mail não encontrado (permite descobrir quem tem conta); manter as outras sessões (quem tinha acesso indevido continuaria dentro da conta); traduzir os textos do Laravel usando o próprio inglês como chave (a D62 escolheu chaves por área).
- **Pendente:** um limite por IP para os pedidos de link, contra o envio em massa para e-mails diferentes (hoje o limite é por e-mail); o visual dos e-mails com a marca.
