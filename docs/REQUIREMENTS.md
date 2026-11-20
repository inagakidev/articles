# REQUIREMENTS — he4rt ink

**Versão:** 1.5 — Decisões do handoff de design (D63)
**Data:** 19/11/2026
**Status:** Requisitos de produto da P1 consolidados e aguardando validação final. As escolhas técnicas da seção 10.1 foram decididas em `DECISIONS.md` (D51 a D56).

Este documento reúne os requisitos funcionais, perfis de acesso, regras de publicação, estados, fluxos, interações e escopo do MVP. A visão estratégica do produto está em `PRODUCT.md`. As decisões e suas justificativas estão em `DECISIONS.md`.

**Legenda**

- **[A01]…[A25]**: requisito alterado ou criado por uma decisão da auditoria registrada em `DECISIONS.md`.
- **[P01]…[P10]**: requisito que resolve uma pendência original do documento, registrada em `DECISIONS.md`.
- **RF-001…**: identificador único de cada requisito, nas seções 2 a 5 e 7. Os fluxos da seção 6 e o escopo da seção 8 detalham e agrupam esses requisitos.
- As regras derivadas das decisões (R01 a R16) foram confirmadas em 12/11/2026 e estão listadas em `DECISIONS.md`, seção 2.
- **⏳ Pendente**: ponto ainda não decidido; ver seção 10.

---

## 1. Visão resumida

Plataforma web para publicação, organização e leitura de artigos. Qualquer visitante descobre e lê conteúdos livremente; usuários cadastrados publicam, interagem e organizam seus conteúdos. A qualidade é controlada por aprovação e moderação administrativa.

Objetivos principais:

- Disponibilizar leitura pública e gratuita.
- Facilitar a descoberta de conteúdos.
- Oferecer uma experiência completa de escrita e publicação.
- Permitir interação entre leitores e autores.
- Garantir qualidade por meio de aprovação administrativa.
- Oferecer ferramentas de organização de artigos.
- Disponibilizar mecanismos de moderação, segurança e auditoria.

Público: comunidade He4rt e devs em geral, como autores e como leitores.

---

## 2. P1-01 — Requisitos funcionais

### 2.1. Acesso e interface

- **RF-001** Leitura pública, sem necessidade de cadastro.
- **RF-002** Listagem pública de artigos.
- **RF-003** Pesquisa pública.
- **RF-004** Interações restritas a usuários autenticados e com e-mail verificado.
- **RF-005** Interface responsiva, com abordagem mobile-first.
- **RF-006** Tema claro e escuro.
- **RF-007** Seleção manual de tema ou acompanhamento da preferência do dispositivo.
- **RF-008** Idiomas da interface: português brasileiro e inglês, completos no MVP. **[A09]**
- **RF-009** Datas e horários apresentados conforme o fuso horário do dispositivo.
- **RF-010** WCAG 2.2 nível AA é o piso de acessibilidade do MVP, não uma melhoria posterior. **[A09]**

### 2.2. Cadastro e autenticação

**RF-011** Campos obrigatórios: nome, username, e-mail, senha e confirmação de senha.

No cadastro, o usuário também precisa: **[A12]**

- **RF-012** Declarar ter 16 anos ou mais. Nenhuma data de nascimento é armazenada.
- **RF-013** Aceitar os Termos de uso e a Política de privacidade. A plataforma registra a data e a versão aceita. Quando um desses documentos muda, o usuário aceita a nova versão no próximo login.

Requisitos:

- **RF-014** Verificação de e-mail obrigatória para publicar e interagir.
- **RF-015** Usuários não verificados podem acessar a conta e ler artigos.
- **RF-016** Recuperação de senha por link enviado ao e-mail.
- **RF-017** 2FA obrigatório para administradores, com **códigos de recuperação obrigatórios** gerados na ativação. **[A08]**
- **RF-018** Reset do 2FA do administrador por comando no servidor, como último recurso. **[A08]**
- **RF-019** 2FA opcional para usuários comuns (depois do MVP). **[A09]**
- **RF-020** Rate limiting e cooldown após tentativas repetidas de autenticação.
- **RF-021** CAPTCHA diante de comportamentos suspeitos (depois do MVP). **[A09]**
- **RF-022** Registro de tentativas suspeitas para análise administrativa.

**Verificação de e-mail** **[A19]**

- **RF-023** Contas que não verificam o e-mail em 7 dias são excluídas automaticamente, liberando username e e-mail.

**Eventos de segurança** **[A20]**

- **RF-024** Login suspeito ou bloqueado, troca de e-mail, troca de senha e pedido ou cancelamento de exclusão da conta são registrados como eventos de segurança.

### 2.3. Perfil

**RF-025** Perfil público com: nome, username, biografia, foto de perfil e artigos publicados.

**RF-026** Campos editáveis: nome, username, e-mail, senha, biografia e foto de perfil.

Regras:

- **RF-027** Username: de 3 a 30 caracteres; letras minúsculas sem acento, números, hífen e sublinhado; começa por letra. Por ser sempre em minúsculas, não existem dois usernames que diferem só por maiúsculas. **[A19]**
- **RF-028** Palavras reservadas não podem ser usadas como username (por exemplo: admin, moderador, suporte, api, login e os nomes das rotas da aplicação). **[A19]**
- **RF-029** Username deve estar disponível. Um username liberado, por troca ou por exclusão de conta, fica disponível imediatamente. **[A19]**
- **RF-030** Alteração de e-mail exige nova verificação. O usuário continua verificado com o e-mail antigo até confirmar o novo; se a confirmação não ocorrer em 24 horas, a troca é cancelada. O e-mail antigo recebe um aviso da troca. **[A18] [A19]**
- **RF-031** Alteração de senha gera aviso por e-mail. **[A18]**
- **RF-032** Formatos aceitos para fotos de perfil: JPG/JPEG, PNG e WebP.
- **RF-033** Remoção da foto apresenta avatar padrão.
- **RF-034** Dados obrigatórios não podem ser simplesmente removidos; devem ser editados ou substituídos.
- **RF-035** Bio, foto e username podem ser denunciados (ver 2.14). **[A07]**

### 2.4. Exclusão voluntária da conta

O usuário pode solicitar a exclusão da própria conta.

**Período de carência (20 dias)**

1. **RF-036** Usuário solicita a exclusão. A tela informa que ele pode mandar artigos para a lixeira antes, se quiser que sejam apagados. **[A02]**
2. **RF-037** Inicia-se um período de carência de 20 dias.
3. **RF-038** A conta fica indisponível durante esse período.
4. **RF-039** **Perfil, comentários e curtidas ficam ocultos** durante a carência. **[A02]**
5. **RF-040** Artigos publicados permanecem visíveis com o nome do autor, sem link para o perfil. **[A02] (sem link)**
6. **RF-041** As contagens de curtidas afetadas caem durante a carência e voltam se a exclusão for cancelada. **[A02]**
7. **RF-042** Tentativa de login exige confirmação explícita para cancelar a exclusão.
8. **RF-043** Sem confirmação, o acesso continua bloqueado.
9. **RF-044** Tentativas de login não reiniciam o prazo.
10. **RF-045** Após 20 dias, ocorre a exclusão definitiva.

**RF-046** Se o usuário cancelar a exclusão durante a carência, a conta retorna ao estado anterior, incluindo perfil, artigos, histórico, comentários, curtidas e favoritos, **com exceção de penalidades aplicadas durante a carência, que continuam valendo**. **[A03]**

**Penalidades durante a carência** **[A03]**

- **RF-047** Uma conta em carência **pode** receber suspensão ou banimento.
- **RF-048** Se o usuário cancelar a exclusão, a conta volta já com a penalidade aplicada.
- **RF-049** Um banimento aplicado durante a carência é executado imediatamente.

**Usuário suspenso** **[A03]**

- **RF-050** Um usuário suspenso só pode solicitar a exclusão depois que a suspensão terminar.

**Exclusão definitiva** **[A02]**

- **RF-051** Os artigos publicados **permanecem no ar com o autor anonimizado** (exibido como autor removido).
- **RF-052** Artigos anonimizados não podem mais ser editados por ninguém. O administrador continua podendo despublicá-los ou excluí-los.
- **RF-053** Comentários e curtidas de outros usuários nesses artigos permanecem.
- **RF-054** Os demais efeitos estão em 2.22.

**Retenção de registros administrativos**

- **RF-055** Dados pessoais desnecessários devem ser excluídos.
- **RF-056** Registros administrativos necessários por motivos legais, de segurança e auditoria podem ser preservados.
- **RF-057** A identificação é feita por identificador interno anonimizado.
- **RF-058** Nome, e-mail e username não são mantidos nesses registros.
- **RF-059** Retenção máxima: 12 meses após a exclusão definitiva.
- **RF-060** Após o prazo, os registros preservados são excluídos automaticamente.

**RF-061** Processos administrativos e contestações pendentes continuam mesmo após a exclusão da conta. **Não há restauração de conta ou perfil após a exclusão definitiva.** Uma contestação aceita depois disso apenas anula a penalidade no histórico de auditoria; o usuário pode criar uma nova conta. **[A04]**

**Versões e artigos não publicados na exclusão de conta** **[P04]**

- **RF-062** Ao solicitar a exclusão, as versões pendentes saem da fila e voltam a ser rascunho.
- **RF-063** Na exclusão definitiva, os artigos publicados ficam anonimizados apenas com a versão em vigor; rascunhos, rejeitadas e substituídas são apagados.
- **RF-064** Artigos que nunca foram publicados são apagados.
- **RF-065** Se a exclusão for cancelada, tudo volta como estava, inclusive os rascunhos.

### 2.5. Artigos e editor

O editor é **Rich Text**, com recursos básicos e avançados. **[A10]**

**RF-066** Recursos básicos: negrito, itálico, títulos, listas e links. O sublinhado não é oferecido, para não ser confundido com links. **[A15]**

**RF-067** Recursos avançados: citações, código inline, blocos de código, tabelas, separadores, alinhamento, cores de texto e destaques.

Regras de acessibilidade do editor: **[A15]**

- **RF-068** **Cores de texto e destaques** vêm de uma paleta fixa, sem seletor livre. Cada cor tem uma variação para o tema claro e outra para o escuro, e todas mantêm contraste de pelo menos 4,5:1 com o fundo do artigo (no caso dos destaques, entre o texto e o destaque) nos dois temas. O artigo guarda o nome da cor, não o valor. Os valores ficam em `DESIGN.md`.
- **RF-069** **Alinhamento:** esquerda, centro e direita. Texto justificado não é oferecido.

Outros requisitos:

- **RF-070** Contagem de palavras e caracteres.
- **RF-071** Salvamento automático de rascunhos.
- **RF-072** Pré-visualização.
- **RF-073** Salvar como rascunho.
- **RF-074** Enviar para aprovação.
- **RF-075** Retirar da fila uma versão pendente (ver 2.6). **[A01]**
- **RF-076** Sem organização de blocos por arrastar e soltar.
- **RF-077** Sem limite de quantidade de artigos por usuário.
- **RF-078** Limites de tamanho: título com até 150 caracteres e conteúdo com até 50.000 caracteres. **[P07]**

**Imagens**

- **RF-079** Uma imagem de capa independente.
- **RF-080** Até cinco imagens internas.
- **RF-081** Máximo de 10 MB por imagem.
- **RF-082** Upload diretamente na plataforma.
- **RF-083** Somente imagens, sem vídeos.
- **RF-084** Formatos otimizados para diferentes tamanhos.
- **RF-085** Formatos aceitos: JPG/JPEG, PNG e WebP. SVG e GIF não são aceitos. **[A16]**
- **RF-086** Metadados (como localização GPS e modelo do aparelho) são removidos no upload. **[A16]**
- **RF-087** **Texto alternativo obrigatório** na capa e nas imagens internas, ou marcação explícita da imagem como decorativa. **[A15]**
- **RF-088** Legenda visível opcional. **[A15]**
- **RF-089** O limite de cinco imagens internas vale por versão; uma imagem repetida entre versões conta uma vez. **[A16]**
- **RF-090** Imagens de versões pendentes são privadas: só o autor e o administrador as acessam até a aprovação. **[A16]**
- **RF-091** Dimensões variadas aceitas, com recomendações de dimensões ideais.

**Organização do conteúdo**

- **RF-092** Uma categoria principal por artigo.
- **RF-093** Múltiplas tags.
- **RF-094** Idioma do artigo obrigatório: português ou inglês.
- **RF-095** Sumário automático. O sumário manual fica para depois do MVP. **[A09]**
- **RF-096** Tempo estimado de leitura calculado pela quantidade de palavras. O ajuste manual pelo autor fica para depois do MVP. **[A09]**

**Histórico de versões**

- **RF-097** Edição de um artigo publicado gera uma nova versão, que precisa de aprovação (MVP). **[A09]**
- **RF-098** Ficam guardadas as **5 versões substituídas mais recentes** de cada artigo; as mais antigas são apagadas automaticamente, junto com as imagens que só elas usavam. **[A16]**
- **RF-099** Visualizar e restaurar versões anteriores fica para depois do MVP. **[A09]**
- **RF-100** Restaurar uma versão anteriormente aprovada **sempre passa por aprovação**: a restauração cria uma versão pendente a partir da versão antiga. **[A22]**

### 2.6. Publicação e moderação

Todo artigo novo precisa ser aprovado por um administrador antes de ficar público. O modelo de estados está na seção 5.

Regras:

- **RF-101** Uma versão enviada fica aguardando aprovação como um **retrato congelado** do texto. O administrador aprova exatamente o que foi enviado. **[A01]**
- **RF-102** Cada artigo tem **no máximo um rascunho e uma versão pendente ao mesmo tempo**. **[A01]**
- **RF-103** Com uma versão pendente, o autor pode continuar editando o rascunho e pode **retirar a versão pendente da fila**. **[A01]**
- **RF-104** Ao retirar, a pendente volta a ser o rascunho. Se já existir um rascunho mais recente, o autor escolhe qual manter, e o outro é descartado. **[A01]**
- **RF-105** Se o autor retirar a versão enquanto o administrador a analisa, a retirada prevalece. A decisão sobre uma versão retirada é recusada, com aviso ao administrador. **[A01]**
- **RF-106** Edição de artigo publicado gera uma nova versão pendente. A versão aprovada em vigor permanece pública durante a revisão.
- **RF-107** Rejeição exige justificativa obrigatória e indica o item da Política de conteúdo violado. **[A12]**
- **RF-108** A versão rejeitada permanece disponível ao autor, que pode corrigir e reenviar **a qualquer momento, sem espera**. **[P06] [D63]**
- **RF-109** O administrador não edita o artigo durante a análise: apenas aprova ou rejeita. **[P05]**
- **RF-110** Se uma edição for rejeitada, a versão anterior permanece publicada.
- **RF-111** O administrador pode **despublicar** um artigo publicado, com justificativa obrigatória e indicação do item da Política de conteúdo violado. **[A12]** O artigo volta a não publicado e a versão em vigor passa a rejeitada, com essa justificativa. O autor corrige e reenvia pelo fluxo normal. **[A07]**

**Seções de "Meus artigos"** **[A01]**

Cada artigo aparece em uma única seção:

- **RF-112** **Publicados:** artigos com versão aprovada em vigor. Exibem o selo "edição pendente" ou "edição rejeitada" quando for o caso.
- **RF-113** **Rascunhos:** artigos nunca publicados cuja versão mais recente é um rascunho.
- **RF-114** **Aguardando aprovação:** artigos nunca publicados cuja versão mais recente está pendente.
- **RF-115** **Rejeitados:** artigos não publicados cuja versão mais recente foi rejeitada, incluindo os despublicados.

**Estimativa de revisão** **[D63]**

- **RF-377** Ao enviar uma versão, o autor vê uma **estimativa** do tempo de revisão ("costuma levar até 6 horas"). A mesma estimativa aparece nas versões que aguardam revisão em "Meus artigos" e nas perguntas frequentes da página de apresentação. É uma estimativa, não um prazo garantido.
- **RF-378** Na fila de aprovação, o administrador vê há quanto tempo cada versão espera. Versões com mais de 6 horas são marcadas como atrasadas e aparecem no dashboard.

**Exclusão de artigos**

- **RF-116** Exclusão pelo autor envia o artigo para a lixeira.
- **RF-117** O artigo desaparece imediatamente da área pública.
- **RF-118** Restauração disponível por sete dias.
- **RF-119** Após sete dias, exclusão permanente.
- **RF-120** Restaurar retorna o artigo ao estado anterior.
- **RF-121** Durante suspensão temporária, o prazo da lixeira fica pausado e os artigos na lixeira são preservados.
- **RF-122** Exclusão permanente pelo administrador exige justificativa e notifica o autor. **[A07]**

- **RF-123** Mandar para a lixeira um artigo com versão pendente retira a versão da fila, e ela volta a ser rascunho. Se o administrador estiver analisando, a retirada prevalece (R03). Na restauração, o artigo volta com esse rascunho. **[A21]**

### 2.7. Categorias e tags

Categorias:

- **RF-124** São fixas e administradas por administradores.
- **RF-125** Cada artigo possui uma categoria principal.
- **RF-126** Antes de excluir uma categoria, os artigos associados devem ser transferidos para outra categoria válida.

Tags:

- **RF-127** Podem ser criadas livremente pelos autores.
- **RF-128** São normalizadas pelo sistema, evitando duplicações e inconsistências.
- **RF-129** Administradores podem excluir ou bloquear tags inadequadas.

### 2.8. Pesquisa e descoberta

**RF-130** A pesquisa considera título, conteúdo, nome do autor, categorias e tags.

**RF-131** Filtros: categoria, tags, autor, popularidade, período de publicação e idioma.

**RF-132** Ordenação: mais recentes, mais antigos e mais curtidos. Ordenação padrão: **mais curtidos dos últimos 30 dias**. **[A17]**

**RF-133** Paginação tradicional, com páginas numeradas.

Definições: **[A17]**

- **RF-134** **Popularidade:** o período em que as curtidas são contadas para a ordenação "mais curtidos": 7, 30 ou 90 dias, ou o histórico completo. Padrão: 30 dias.
- **RF-135** **Período de publicação:** filtra pela data da primeira publicação do artigo. É independente da popularidade.
- **RF-136** **Mais recentes e mais antigos:** usam a data da primeira publicação.

### 2.9. Página de leitura

**RF-137** Apresenta: título, autor, data da primeira publicação (com "atualizado em" quando houver nova versão aprovada) **[A17]**, capa, conteúdo, tempo estimado de leitura, categoria, tags, quantidade de curtidas, quantidade de favoritos e sumário.

A quantidade de visualizações é exclusiva do painel administrativo.

### 2.10. Comentários

- **RF-138** Comentários permitem respostas aninhadas **até 3 níveis**. **[P08]**
- **RF-139** Limites: até 2.000 caracteres por comentário e no máximo um comentário a cada 30 segundos por usuário. **[P08]**
- **RF-140** **Todos podem ler os comentários**, inclusive visitantes. Somente usuários autenticados e com e-mail verificado comentam, respondem e curtem. **[A13]**
- **RF-141** Para quem não pode participar, não é exibido formulário nem convite. **[A13]**
- **RF-142** Comentários são públicos e indexáveis; a Política de privacidade deve informar isso. **[A13]**
- **RF-143** O autor do comentário pode editar e excluir o próprio comentário.
- **RF-144** O autor do artigo pode excluir comentários em seu artigo.
- **RF-145** Administradores podem excluir qualquer comentário.

- **RF-146** Excluir um comentário exclui também todas as respostas, inclusive as escritas por outros usuários. Vale para exclusão pelo autor do comentário, pelo autor do artigo, pelo administrador, na exclusão de conta e no banimento. **[A14]**
- **RF-147** O autor de um comentário removido por outra pessoa não é avisado. **[A18]**

### 2.11. Curtidas

**Em artigos**

- **RF-148** Apenas usuários autenticados e verificados podem curtir.
- **RF-149** Um usuário pode curtir um artigo uma única vez.
- **RF-150** O autor não pode curtir o próprio artigo. Favoritar o próprio artigo é permitido. **[A25]**
- **RF-151** Histórico individual de curtidas é privado.
- **RF-152** Quantidade agregada de curtidas é pública.

**Em comentários** **[A10]**

As curtidas em comentários voltam ao escopo, com as mesmas regras das curtidas em artigos.

- **RF-153** Apenas usuários autenticados e verificados podem curtir.
- **RF-154** Um usuário pode curtir um comentário uma única vez.
- **RF-155** O autor não pode curtir o próprio comentário. **[A25]**
- **RF-156** Histórico individual privado; quantidade agregada pública.
- **RF-157** Ficam ocultas junto com o comentário durante uma suspensão ou durante a carência da exclusão.
- **RF-158** São removidas na exclusão definitiva da conta.

### 2.12. Favoritos

- **RF-159** Apenas usuários autenticados e verificados podem favoritar.
- **RF-160** Lista individual de favoritos é privada.
- **RF-161** Quantidade agregada de favoritos é pública e aparece na página de leitura. As listagens (cards de artigo) não mostram contagens de curtidas nem de favoritos no MVP. **[D63]**
- **RF-162** Não existe ordenação pública por favoritos.

### 2.13. Compartilhamento

**RF-163** Compartilhamento para WhatsApp, LinkedIn, Facebook, X, outras redes sociais e copiar link.

### 2.14. Denúncias **[A07]**

**RF-164** Usuários podem denunciar artigos, comentários e perfis (bio, foto e username).

Regras:

- **RF-165** A denúncia não oculta automaticamente o conteúdo. O conteúdo permanece público até a decisão administrativa.
- **RF-166** O denunciante escolhe um motivo: spam, ofensa ou assédio, plágio, informação enganosa ou outro (com texto livre).
- **RF-167** Cada usuário pode ter **uma denúncia aberta por item**.
- **RF-168** Ninguém denuncia o próprio conteúdo. **[A25]**
- **RF-169** O autor de um artigo pode denunciar comentários feitos nele, além de poder excluí-los. **[P09]**
- **RF-170** Status: aberta, procedente ou improcedente.
- **RF-171** Toda decisão registra o administrador responsável e a justificativa.
- **RF-172** O denunciante recebe apenas o aviso de que a denúncia foi analisada, sem o desfecho.
- **RF-173** Decisões procedentes indicam o item da Política de conteúdo violado. **[A12]**
- **RF-174** A denúncia não guarda cópia do conteúdo denunciado; o administrador analisa a versão atual. **[A14]**
- **RF-175** Se o conteúdo denunciado for excluído antes da análise, a denúncia é encerrada automaticamente com o status "conteúdo removido". **[A18]**

Desfechos de uma denúncia procedente:

- **RF-176** **Artigo:** despublicar, excluir permanentemente ou aplicar penalidade ao autor.
- **RF-177** **Comentário:** excluir o comentário ou aplicar penalidade ao autor.
- **RF-178** **Perfil:**
    - Foto ou bio inadequadas: o administrador as redefine para o padrão (avatar padrão e bio vazia), com justificativa.
    - Username inadequado: o usuário é obrigado a trocar o username no próximo acesso.
    - Casos graves: penalidade normal.

### 2.15. Notificações

**Notificações internas (MVP)** **[A09]**

- **RF-179** Artigo aprovado.
- **RF-180** Artigo rejeitado, com justificativa.
- **RF-181** Artigo despublicado, com justificativa. **[A07]**
- **RF-182** Artigo excluído permanentemente pelo administrador, com justificativa. **[A07]**
- **RF-183** Novo comentário em artigo próprio.
- **RF-184** Curtida em artigo ou comentário próprio, agrupada por item (por exemplo, "5 pessoas curtiram seu artigo"). Favoritos não geram notificação. **[P10]**
- **RF-185** Resposta a comentário.
- **RF-186** Denúncia analisada (para o denunciante). **[A07]**
- **RF-187** Perfil moderado: foto ou bio redefinidas, ou troca de username obrigatória. **[A18]**

Regras:

- **RF-188** Abrir o sino não marca automaticamente como lida.
- **RF-189** Marcação individual ou em massa.
- **RF-190** Exclusão individual ou em massa.
- **RF-191** Retenção de 90 dias.
- **RF-192** Durante a suspensão, as notificações existentes ficam guardadas e o prazo de 90 dias para de contar. Após a reativação, ficam disponíveis novamente. **[A18]**

**E-mails automáticos (MVP)** **[A09]**

- **RF-193** Verificação de e-mail.
- **RF-194** Recuperação de senha.
- **RF-195** Aprovação de artigo.
- **RF-196** Rejeição de artigo.
- **RF-197** Despublicação de artigo. **[A07]**
- **RF-198** Suspensão temporária, com motivo, duração e link de contestação. **[A06]**
- **RF-199** Fim da suspensão e reativação da conta. **[A06]**
- **RF-200** Banimento definitivo, com motivo e link de contestação.
- **RF-201** Resultado da contestação, aceita ou rejeitada.
- **RF-202** Etapas da exclusão de conta: solicitação, cancelamento e conclusão.
- **RF-203** Aviso ao e-mail antigo quando o e-mail da conta é alterado. **[A18]**
- **RF-204** Aviso de senha alterada. **[A18]**

**RF-205** E-mails de rejeição, despublicação, suspensão e banimento indicam o item da Política de conteúdo violado. **[A12]**

### 2.16. Suspensão temporária **[A05] [A06]**

Durante a suspensão:

- **RF-206** A conta fica inacessível.
- **RF-207** **O perfil fica oculto**, como na carência da exclusão. **[A25]**
- **RF-208** Artigos publicados ficam ocultos.
- **RF-209** **Rascunhos e versões rejeitadas ficam ocultos e preservados.** **[A05]**
- **RF-210** **Versões pendentes saem da fila e voltam a ser rascunho.** **[A05]**
- **RF-211** Comentários ficam ocultos.
- **RF-212** Curtidas são preservadas.
- **RF-213** Favoritos são preservados e continuam privados.
- **RF-214** Artigos na lixeira são preservados, e o prazo da lixeira fica pausado.
- **RF-215** Notificações e o prazo de retenção delas ficam pausados.
- **RF-216** Denúncias pendentes contra o usuário permanecem abertas e são priorizadas para análise.

Término:

- **RF-217** A suspensão termina **automaticamente** no fim do prazo, com aviso por e-mail. **[A06]**

Após a reativação:

- **RF-218** Artigos publicados voltam a ficar públicos.
- **RF-219** Rascunhos e rejeitadas voltam a ficar disponíveis ao autor.
- **RF-220** Comentários voltam a aparecer.
- **RF-221** Curtidas e favoritos continuam preservados.
- **RF-222** Notificações ficam disponíveis.
- **RF-223** Prazos pausados são retomados.

### 2.17. Banimento definitivo **[A04]**

No banimento definitivo:

- **RF-224** Artigos, comentários, curtidas, favoritos e discussões associadas são **excluídos imediatamente**.
- **RF-225** **Conta e perfil ficam retidos, ocultos e inacessíveis** até o fim do prazo de contestação ou até a decisão de uma contestação em análise.
- **RF-226** Encerrada a possibilidade de contestação sem aceitação, conta e perfil são excluídos.

**RF-227** Se uma contestação de banimento for aceita enquanto conta e perfil estiverem retidos, apenas conta e perfil retornam. Conteúdos e interações excluídos não são recuperados.

### 2.18. Contestações de penalidades

- **RF-228** O usuário pode contestar suspensão ou banimento.
- **RF-229** A contestação é feita pelo **link enviado no e-mail da penalidade, sem exigir login**, já que a conta está inacessível. **[A06]**
- **RF-230** Prazo padrão: sete dias após a notificação.
- **RF-231** Apenas uma contestação por penalidade.
- **RF-232** Qualquer administrador pode analisar.
- **RF-233** Após a decisão, não existe segunda revisão da mesma penalidade.
- **RF-234** O administrador pode reabrir manualmente um prazo expirado por mais sete dias, com justificativa opcional, **somente enquanto conta e perfil estiverem retidos**. **[A04]**

**Resultado**

Contestação aceita de suspensão:

- **RF-235** A penalidade é anulada.
- **RF-236** A conta é reativada na hora, e o usuário recebe aviso por e-mail. **[A06] [D63]**
- **RF-237** _Revogado pela D63:_ com a reativação imediata, não há autorização pendente nem espera pelo fim do prazo.

Contestação aceita de banimento:

- **RF-238** Somente conta e perfil podem ser restaurados, desde que ainda estejam retidos. **[A04]**
- **RF-239** Conteúdos excluídos não retornam.

Contestação rejeitada:

- **RF-240** O usuário recebe e-mail e notificação interna com a decisão e a justificativa.

**Auditoria das contestações**

**RF-241** Registrar: penalidade original, contestação, justificativa do usuário, administrador responsável pela análise, decisão, justificativa administrativa, data da reativação (registrada como evento do sistema), datas das ações e eventual anulação.

**RF-242** O histórico completo é preservado, sem apagar ou sobrescrever eventos anteriores. Todos os administradores podem consultar o histórico. O usuário não tem página própria para consultar o histórico de penalidades.

**RF-243** Preservar o histórico significa que ele não pode ser alterado: a única remoção é a prevista na tabela de retenção (2.23). **[A20]**

### 2.19. Administração **[A08]**

**Administradores no MVP**

- **RF-244** O MVP tem **um único administrador**, criado na instalação da aplicação.
- **RF-245** A tela para criar e remover administradores pelo painel fica para depois do MVP.
- **RF-246** Com um único administrador, as regras de conflito de interesse ficam dispensadas: ele aprova os próprios artigos e julga as contestações das penalidades que aplicou. Isso é uma limitação conhecida do MVP.
- **RF-247** Quando houver mais de um administrador, passam a valer duas regras: um administrador não aprova o próprio artigo e não julga a contestação de uma penalidade que ele aplicou.

**O painel administrativo permite:**

- **RF-248** Consultar usuários.
- **RF-249** Aprovar e rejeitar artigos.
- **RF-250** Despublicar artigos, com justificativa. **[A07]**
- **RF-251** Gerenciar categorias e tags.
- **RF-252** Consultar e decidir denúncias. **[A07]**
- **RF-253** Redefinir foto e bio de perfis denunciados e exigir troca de username. **[A07]**
- **RF-254** Suspender usuários.
- **RF-255** Banir usuários.
- **RF-256** Reativar contas.
- **RF-257** Excluir artigos permanentemente, com justificativa. **[A07]**
- **RF-258** Excluir comentários.
- **RF-259** Consultar histórico de moderação.
- **RF-260** Analisar contestações.

**RF-261** Níveis de administração: depois do MVP.

### 2.20. Dashboard administrativo

**MVP (básico)** **[A09]**

- **RF-262** Contagens de usuários cadastrados, artigos publicados, artigos aguardando aprovação, versões atrasadas (RF-378) e denúncias abertas.

**Depois do MVP** **[A09]**:

- **RF-263** Comentários.
- **RF-264** Artigos mais curtidos, mais favoritados e mais visualizados.
- **RF-265** Crescimento de usuários e atividade ao longo do tempo.
- **RF-266** Rankings de mais curtidos e mais favoritados nos últimos 7, 30 e 90 dias e no histórico completo.
- **RF-267** Visualizações: exclusivas dos administradores, exibidas só como indicadores, sem ordenação por visualizações, no máximo uma por usuário por artigo a cada 24 horas, visitantes anônimos contabilizados por cookies ou identificadores de sessão, registros individuais retidos por 12 meses e excluídos automaticamente.

### 2.21. Exportação e LGPD

- **RF-268** Exportação de dados pessoais e artigos em JSON fica para depois do MVP. **[A09]**
- **RF-269** Até lá, um canal de contato atende pedidos de dados da LGPD manualmente. **[A09]**
- **RF-270** Dados editáveis podem ser removidos diretamente pelo usuário.
- **RF-271** Dados obrigatórios precisam ser editados ou substituídos.

**Termos e políticas** **[A12]**

- **RF-272** Três páginas públicas: Termos de uso, Política de conteúdo (o que é proibido publicar) e Política de privacidade.
- **RF-273** Aceite de Termos e Privacidade no cadastro, com registro de data e versão; novo aceite no próximo login quando mudarem.
- **RF-274** Idade mínima: 16 anos, por autodeclaração.
- **RF-275** No MVP, apenas cookies essenciais (sessão e preferências de tema e idioma), informados na Política de privacidade. A contagem de visitas, depois do MVP, exigirá aviso próprio.
- **RF-276** Validar com assessoria jurídica os requisitos da LGPD para cookies, adolescentes e pedidos de titulares.

### 2.22. Regras de exclusão e impacto nas interações

**Exclusão definitiva de conta**

- **RF-277** Artigos publicados permanecem, com o autor anonimizado. **[A02]**
- **RF-278** Remove comentários do usuário e todas as respostas associadas, mesmo as escritas por outros usuários. **[A14]**
- **RF-279** Remove curtidas (em artigos e comentários) e atualiza as contagens.
- **RF-280** Remove favoritos e atualiza as quantidades públicas.
- **RF-281** **Denúncias contra artigos que permanecem no ar continuam abertas.** **[A02]**
- **RF-282** Denúncias contra o que foi removido (perfil e comentários) são encerradas e excluídas.
- **RF-283** Denúncias feitas pelo usuário são encerradas e excluídas.
- **RF-284** Não interfere em denúncias de outros usuários contra o mesmo artigo.

**Exclusão permanente de artigo**

- **RF-285** Remove suas métricas de curtidas, favoritos e visualizações.
- **RF-286** É registrada na auditoria com identificador, responsável, data e motivo, sem guardar o conteúdo. **[A20]**
- **RF-287** Apaga todas as versões; as imagens são removidas pela rotina de imagens sem uso. **[P01]**
- **RF-288** Apaga os comentários e as respostas do artigo. **[P02]**
- **RF-289** Encerra as denúncias abertas sobre o artigo e sobre seus comentários com o status "conteúdo removido". **[P03]**
- **RF-290** Vale tanto para o fim do prazo da lixeira quanto para a exclusão pelo administrador.

### 2.23. Retenção de dados **[A20]**

| Dado                                      | Prazo                                                  | Depois do prazo                           |
| ----------------------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| Conta em carência de exclusão             | 20 dias                                                | Exclusão definitiva; artigos anonimizados |
| Conta e perfil de usuário banido          | Até encerrar a contestação                             | Exclusão                                  |
| Conta nunca verificada                    | 7 dias                                                 | Exclusão                                  |
| Confirmação de troca de e-mail            | 24 horas                                               | Troca cancelada                           |
| Artigo na lixeira                         | 7 dias, pausado na suspensão (A24)                     | Exclusão permanente                       |
| Versões substituídas                      | As 5 mais recentes por artigo                          | As mais antigas são apagadas              |
| Imagem sem nenhuma versão que a use       | 24 horas                                               | Arquivo apagado                           |
| Notificações                              | 90 dias, pausado na suspensão (A24)                    | Exclusão                                  |
| Denúncias encerradas                      | 12 meses                                               | Exclusão                                  |
| Tentativas suspeitas de login             | 90 dias                                                | Exclusão                                  |
| Registros de auditoria de conta excluída  | 12 meses após a exclusão, anonimizados                 | Exclusão                                  |
| Visualizações individuais (depois do MVP) | 12 meses                                               | Exclusão                                  |
| Backups (D55)                             | 7 cópias diárias e 4 semanais (até cerca de 5 semanas) | Cópia expirada é apagada                  |

**Backups** **[D55]**

- **RF-374** Dados excluídos, incluindo os de contas excluídas, permanecem nos backups até a cópia expirar, no máximo cerca de cinco semanas. A Política de privacidade informa esse prazo.
- **RF-375** As rotinas de retenção calculam os prazos pelas datas registradas no banco. Depois de restaurar um backup, elas são executadas novamente e apagam o que já venceu.
- **RF-376** Pedidos de exclusão de conta feitos entre o último backup e a restauração não estão no banco restaurado. O roteiro de restauração os reaplica a partir dos e-mails de confirmação (RF-202). Limitação conhecida: no máximo 24 horas de pedidos dependem dessa reaplicação manual.

### 2.24. Auditoria **[A20]**

- **RF-291** O registro de auditoria só aceita inclusões. Ninguém edita nem remove registros manualmente; a única remoção é a prevista na tabela de retenção.
- **RF-292** Registros de contas ativas são mantidos enquanto a conta existir. Na exclusão da conta, são anonimizados e apagados 12 meses depois.
- **RF-293** São auditadas todas as ações administrativas, incluindo a exclusão permanente de artigos (sem conteúdo).
- **RF-294** Das ações de autores, apenas os eventos de segurança da conta (2.2).

### 2.25. Página de apresentação **[D63]**

- **RF-379** A página de apresentação fica em `/` e é pública. A listagem de artigos (RF-002) passa para `/artigos`.
- **RF-380** A página apresenta a plataforma, explica em três passos como funciona a publicação (rascunho, revisão, publicado), mostra artigos publicados recentes e responde perguntas frequentes, incluindo a estimativa de revisão (RF-377).
- **RF-381** Os artigos mostrados seguem a regra única de visibilidade pública (seção 5.3).
- **RF-382** A seção da comunidade mostra apenas autores com artigo publicado e só os dados do perfil público (nome e foto). A Política de privacidade informa esse uso.
- **RF-383** Animações contínuas da página podem ser pausadas por um botão "Pausar animações", e a escolha fica guardada no navegador da pessoa. Com "reduzir movimento" ativo no sistema, nada se move.

---

## 3. P1-02 — Perfis de acesso e permissões

### 3.1. Visitante

**RF-295** Pode: acessar a página inicial, listar artigos publicados, pesquisar, aplicar filtros, ler artigos completos, **ler comentários** [A13], consultar perfis públicos, compartilhar artigos e ler os Termos e as políticas.

**RF-296** Não pode: comentar, curtir, favoritar, publicar, denunciar ou acessar funcionalidades privadas.

### 3.2. Usuário não verificado

**RF-297** Pode: fazer login, ler artigos e comentários, pesquisar e navegar, consultar o próprio perfil e atualizar dados permitidos. A conta é excluída se não for verificada em 7 dias. **[A13] [A19]**

**RF-298** Não pode: publicar artigos, comentar, curtir, favoritar ou denunciar.

### 3.3. Usuário verificado

**RF-299** Pode:

- **RF-300** Ler artigos.
- **RF-301** Criar artigos e salvar rascunhos.
- **RF-302** Editar seus próprios artigos.
- **RF-303** Enviar artigos para aprovação e **retirar da fila suas versões pendentes**. **[A01]**
- **RF-304** Excluir e restaurar seus artigos dentro do prazo.
- **RF-305** Comentar, responder, editar e excluir seus próprios comentários.
- **RF-306** Curtir artigos e **comentários** de outras pessoas. **[A10] [A25]**
- **RF-307** Favoritar artigos.
- **RF-308** Denunciar artigos, comentários e **perfis** de outras pessoas, incluindo comentários nos próprios artigos. **[A07] [A25] [P09]**
- **RF-309** Consultar suas notificações.
- **RF-310** Gerenciar o próprio perfil.
- **RF-311** Solicitar exclusão da conta (exceto durante uma suspensão). **[A03]**

**RF-312** Depois do MVP: consultar e restaurar versões anteriores; exportar dados pessoais e artigos. **[A09]**

### 3.4. Administrador

**RF-313** Pode tudo o que está em 2.19, além de consultar auditoria e métricas administrativas.

- **RF-314** No MVP há um único administrador, criado na instalação. **[A08]**
- **RF-315** Níveis administrativos diferentes: depois do MVP. **[A08]**

---

## 4. P1-03 — Regras de publicação

### 4.1. Condições para publicação

- **RF-316** Usuário autenticado, com e-mail verificado.
- **RF-317** Conta não suspensa e não banida.
- **RF-318** Campos obrigatórios para enviar: título, conteúdo, categoria e idioma, além do texto alternativo em todas as imagens. Capa e tags são opcionais. Um rascunho pode ser salvo sem nenhum campo preenchido. **[A21]**
- **RF-319** Artigo novo precisa ser enviado para aprovação.
- **RF-320** Artigo só fica público após aprovação administrativa.

### 4.2. Criação

- **RF-321** O usuário cria o artigo e pode salvá-lo como rascunho.
- **RF-322** O salvamento automático mantém o rascunho atualizado e **não cria versões**.
- **RF-323** O autor pode visualizar uma prévia e enviar para aprovação.

### 4.3. Aprovação

- **RF-324** O administrador analisa a versão enviada, que está congelada. **[A01]**
- **RF-325** Se aprovada, a versão passa a ser a aprovada em vigor e o artigo fica público.
- **RF-326** Se rejeitada, a justificativa é obrigatória.
- **RF-327** O autor recebe notificação e e-mail.

### 4.4. Edição

- **RF-328** O autor pode editar seus artigos.
- **RF-329** A edição de artigo publicado cria uma nova versão pendente ao ser enviada.
- **RF-330** A versão em vigor permanece pública e só é substituída após a aprovação da nova.
- **RF-331** Com uma versão pendente, o autor pode continuar editando o rascunho e pode retirar a pendente da fila. **[A01]**

### 4.5. Rejeição e despublicação

- **RF-332** Rejeição exige justificativa.
- **RF-333** O autor pode corrigir e reenviar.
- **RF-334** Quando existir, a versão publicada anteriormente permanece pública.
- **RF-335** Despublicação pelo administrador exige justificativa e devolve o artigo ao autor pelo mesmo fluxo da rejeição. **[A07]**

### 4.6. Restauração

- **RF-336** Restaurar artigo da lixeira retorna ao estado anterior, dentro de sete dias.
- **RF-337** Restaurar versão anteriormente aprovada (depois do MVP) cria uma versão pendente, que passa pela aprovação normal. **[A22]**

---

## 5. P1-04 — Estados **[A01]**

O estado do artigo e o estado de cada versão são independentes.

### 5.1. Estados do artigo

| Estado        | Descrição                                                        |
| ------------- | ---------------------------------------------------------------- |
| Não publicado | Nunca teve versão aprovada, ou foi despublicado                  |
| Publicado     | Existe uma versão aprovada em vigor                              |
| Na lixeira    | Removido pelo autor; guarda o estado anterior para a restauração |

Transições:

- **RF-338** Não publicado → Publicado: primeira aprovação de uma versão.
- **RF-339** Publicado → Não publicado: despublicação pelo administrador. **[A07]**
- **RF-340** Não publicado ou Publicado → Na lixeira: exclusão pelo autor.
- **RF-341** Na lixeira → estado anterior: restauração dentro de sete dias.
- **RF-342** Na lixeira → excluído permanentemente: após sete dias, ou por exclusão permanente do administrador.

### 5.2. Estados da versão

| Estado            | Descrição                                              |
| ----------------- | ------------------------------------------------------ |
| Rascunho          | Editável; recebe o salvamento automático               |
| Pendente          | Retrato congelado enviado para aprovação; não editável |
| Aprovada em vigor | A versão que o público lê                              |
| Rejeitada         | Recusada na revisão ou despublicada, com justificativa |
| Substituída       | Aprovada anteriormente; mantida no histórico           |

Transições:

- **RF-343** (nova) → Rascunho: criação do artigo ou início de uma edição.
- **RF-344** Rascunho → Pendente: envio para aprovação, desde que não exista outra pendente.
- **RF-345** Pendente → Rascunho: retirada pelo autor, ou retirada automática quando o autor é suspenso. **[A01] [A05]**
- **RF-346** Pendente → Aprovada em vigor: aprovação. A versão em vigor anterior, se houver, passa a Substituída.
- **RF-347** Pendente → Rejeitada: rejeição com justificativa.
- **RF-348** Aprovada em vigor → Rejeitada: despublicação com justificativa. **[A07]**
- **RF-349** Rejeitada → Rascunho: o autor corrige a partir da versão rejeitada.
- **RF-350** Substituída → Aprovada em vigor: restauração de versão (depois do MVP).

**RF-351** Limites: no máximo um Rascunho e uma Pendente por artigo ao mesmo tempo.

### 5.3. Visibilidade pública

Um artigo é visível publicamente quando, ao mesmo tempo:

- **RF-352** o artigo está **Publicado**;
- **RF-353** o autor não está suspenso nem banido (autor em carência de exclusão não interfere; autor anonimizado também não).

Essa regra vale para listagem, busca, filtros, perfil e página de leitura.

### 5.4. Situação do autor

**RF-354** A situação da conta do autor (ativa, em carência de exclusão, suspensa, banida com conta retida, anonimizada) **não é um estado do artigo**. Ela é uma condição sobreposta, avaliada pela regra de visibilidade da seção 5.3 e pelas regras de 2.4, 2.16 e 2.17.

---

## 6. P1-05 — Fluxos

### 6.1. Criação

1. Usuário autenticado e verificado acessa a criação.
2. Preenche título e conteúdo.
3. Adiciona capa e imagens opcionais.
4. Seleciona categoria.
5. Adiciona tags.
6. Define idioma.
7. O sumário e o tempo de leitura são gerados automaticamente.
8. Salva rascunho ou envia para aprovação.
9. Pode visualizar a prévia antes do envio.

### 6.2. Aprovação

1. A versão enviada chega à fila administrativa, congelada.
2. O administrador consulta o conteúdo.
3. Se o autor retirou a versão nesse meio-tempo, a decisão é recusada com aviso.
4. O administrador aprova ou rejeita.
5. Aprovada: a versão entra em vigor e o artigo fica público.
6. Rejeitada: justificativa obrigatória.
7. O autor recebe notificação e e-mail.
8. O autor pode corrigir e reenviar.

### 6.3. Edição de artigo publicado

1. O autor acessa um artigo próprio publicado.
2. Edita um rascunho; a versão em vigor continua pública.
3. Envia: o rascunho vira uma versão pendente.
4. Enquanto pendente, o autor pode seguir editando um novo rascunho ou retirar a pendente.
5. O administrador aprova ou rejeita.
6. Aprovada: substitui a versão em vigor, que passa a Substituída.
7. Rejeitada: a versão em vigor continua pública.

### 6.4. Exclusão de artigo

1. O autor solicita a exclusão.
2. O sistema pede confirmação.
3. O artigo vai para a lixeira e desaparece da área pública.
4. O autor pode restaurar durante sete dias.
5. Após o prazo, o artigo é excluído permanentemente.

### 6.5. Despublicação **[A07]**

1. O administrador despublica um artigo publicado, informando a justificativa.
2. O artigo volta a Não publicado; a versão em vigor passa a Rejeitada.
3. O autor recebe notificação e e-mail com a justificativa.
4. O autor corrige e reenvia pelo fluxo de aprovação.

### 6.6. Denúncia **[A07]**

1. O usuário verificado denuncia um artigo, comentário ou perfil, escolhendo um motivo.
2. O conteúdo continua visível.
3. O administrador analisa e marca como procedente ou improcedente, com justificativa.
4. Se procedente, aplica um dos desfechos de 2.14.
5. O denunciante recebe o aviso de que a denúncia foi analisada.

### 6.7. Suspensão **[A05] [A06]**

1. O administrador aplica a suspensão com motivo e duração.
2. O usuário recebe e-mail com motivo, duração e link de contestação.
3. A conta fica inacessível.
4. Perfil, artigos publicados, rascunhos, rejeitadas e comentários ficam ocultos; versões pendentes voltam a rascunho.
5. Curtidas, favoritos e lixeira são preservados; prazos de lixeira e notificações ficam pausados.
6. No fim do prazo, a conta é reativada automaticamente e o usuário recebe e-mail.
7. Na reativação, todo o conteúdo preservado volta.

### 6.8. Banimento **[A04]**

1. O administrador aplica o banimento.
2. O usuário recebe e-mail com motivo e link de contestação.
3. Conteúdos, interações e discussões associadas são excluídos imediatamente.
4. Conta e perfil ficam retidos, ocultos e inacessíveis.
5. Sem contestação aceita até o fim do prazo (ou da análise), conta e perfil são excluídos.
6. Registros administrativos necessários são preservados conforme a política de retenção.

### 6.9. Contestação

1. O usuário recebe o e-mail da penalidade com o link de contestação.
2. Tem sete dias para contestar pelo link, sem login.
3. Qualquer administrador pode analisar.
4. Rejeitada: o usuário recebe e-mail e notificação interna com a justificativa.
5. Aceita, para suspensão: a penalidade é anulada, a conta é reativada na hora e o usuário recebe aviso por e-mail.
6. Aceita, para banimento: conta e perfil retidos são restaurados; conteúdos não voltam.

Se o prazo expirar, um administrador pode reabri-lo por mais sete dias, somente enquanto conta e perfil estiverem retidos.

### 6.10. Exclusão voluntária de conta **[A02] [A03]**

1. O usuário solicita a exclusão; a tela informa que ele pode mandar artigos para a lixeira antes.
2. Recebe e-mail confirmando a solicitação.
3. Durante 20 dias: conta indisponível; perfil, comentários e curtidas ocultos; artigos visíveis com o nome do autor.
4. Penalidades podem ser aplicadas nesse período.
5. Para cancelar, o usuário faz login e confirma explicitamente; recebe e-mail de cancelamento. Penalidades aplicadas na carência continuam valendo.
6. Sem cancelamento, a exclusão definitiva acontece no 20º dia: artigos ficam anonimizados e os demais efeitos de 2.22 são aplicados. O usuário recebe e-mail de conclusão.

---

## 7. P1-06 — Comentários, curtidas, favoritos e denúncias

### 7.1. Comentários

- **RF-355** Leitura pública; participação exige autenticação e e-mail verificado. **[A13]**
- **RF-356** Permitem respostas aninhadas até 3 níveis. **[P08]**
- **RF-357** O usuário pode editar e excluir comentários próprios.
- **RF-358** O autor do artigo pode excluir comentários em seu artigo.
- **RF-359** O administrador pode excluir qualquer comentário.
- **RF-360** Ficam ocultos durante a suspensão do autor e durante a carência da exclusão. **[A02]**
- **RF-361** Na exclusão definitiva da conta, comentários e todas as respostas associadas são removidos. **[A14]**

### 7.2. Curtidas

- **RF-362** Em artigos e em comentários. **[A10]**
- **RF-363** Uma curtida por usuário por item; o autor não curte o próprio conteúdo. **[A25]**
- **RF-364** Exigem autenticação e e-mail verificado.
- **RF-365** Histórico individual privado; quantidade agregada pública.
- **RF-366** Removidas na exclusão definitiva da conta, com atualização das contagens.

### 7.3. Favoritos

- **RF-367** Exigem autenticação e e-mail verificado.
- **RF-368** Lista individual privada; quantidade agregada pública, exibida na página de leitura (RF-161).
- **RF-369** Removidos na exclusão definitiva da conta, com atualização das contagens.

### 7.4. Denúncias

Ver 2.14 e 6.6. **[A07]**

### 7.5. Regras de exclusão

- **RF-370** Excluir um comentário também exclui as respostas associadas, em todos os casos. **[A14]**
- **RF-371** Excluir uma conta remove comentários, curtidas e favoritos; os artigos permanecem anonimizados.
- **RF-372** Exclusão de artigo remove suas métricas de curtidas, favoritos e visualizações.
- **RF-373** Denúncias de outros usuários sobre o mesmo artigo permanecem abertas quando apenas um denunciante é excluído.

---

## 8. P1-07 — Escopo **[A09]**

Classificação aprovada em 12/11/2026.

### 8.1. MVP

**Contas e segurança**

- Cadastro, login e logout.
- Verificação de e-mail e recuperação de senha.
- Perfil público e edição de perfil.
- Exclusão voluntária de conta com carência.
- 2FA obrigatório para o administrador, com códigos de recuperação.
- Rate limiting no login.

**Artigos**

- Editor Rich Text.
- Rascunho com salvamento automático e prévia.
- Capa e imagens internas.
- Categoria, tags e idioma.
- Envio para aprovação, aprovação e rejeição com justificativa.
- Retirada de versão pendente.
- Edição de artigo publicado como nova versão.
- Lixeira de sete dias.

**Leitura e descoberta**

- Página de apresentação em `/`, com a listagem em `/artigos`. **[D63]**
- Listagem paginada e página de leitura.
- Pesquisa, filtros e ordenação.
- Compartilhamento.
- Tempo de leitura e sumário automáticos.

**Interações**

- Comentários com respostas.
- Curtidas em artigos e em comentários.
- Favoritos.
- Denúncias de artigos, comentários e perfis.

**Moderação e administração**

- Fila de aprovação.
- Despublicação e exclusão de comentários.
- Suspensão, banimento e contestação.
- Auditoria das ações do administrador.
- Dashboard básico.
- Gestão de categorias e tags.

**Comunicação**

- Notificações internas.
- E-mails automáticos listados em 2.15.

**Base transversal**

- Interface completa em PT e EN.
- WCAG 2.2 AA como piso.
- Temas claro e escuro.
- Layout responsivo, mobile-first.

### 8.2. Depois do MVP

- Tela de histórico e restauração de versões antigas.
- 2FA para usuários comuns.
- CAPTCHA e ferramentas avançadas de segurança.
- Exportação em JSON (até lá, atendimento manual de pedidos da LGPD).
- Dashboard avançado, rankings por período e métricas de visualização.
- Tela de gestão de administradores e níveis de administração.
- Sumário manual e ajuste manual do tempo de leitura.
- Relatórios administrativos avançados.

### 8.3. Fora do escopo inicial

- Publicação de vídeos.
- Organização de blocos por arrastar e soltar.
- Aplicativo mobile nativo.
- Monetização e assinaturas.
- Marketplace de conteúdo.
- Sistema de mensagens privadas.

Esses itens delimitam o escopo e não representam decisões definitivas sobre versões futuras.

**Risco conhecido:** mesmo com os cortes, o MVP é grande para um projeto de portfólio. Os blocos mais caros são moderação (penalidades e contestação) e mídia (imagens).

---

## 9. Critérios gerais de qualidade

A implementação deve considerar: segurança no backend, validação de dados, integridade referencial, controle de acesso, responsividade, acessibilidade (WCAG 2.2 AA), desempenho, consistência de dados, rastreabilidade administrativa, tratamento de erros, proteção de uploads, e retenção e exclusão de dados.

As decisões técnicas e a arquitetura estão em `DECISIONS.md`.

---

## 10. Pendências

### 10.1. Escolhas técnicas para o início da Fase 02

Decididas em 14/11/2026 e registradas em `DECISIONS.md`:

1. Editor Rich Text: Tiptap 3 com tiptap-php (D51).
2. Imagens: Intervention Image 4 (D52) e Cloudflare R2 (D53).
3. Busca: MariaDB FULLTEXT (D54).
4. Backup: Spatie Laravel Backup com R2 (D55). A hospedagem fica para a p8-01.
5. Identificação do administrador: coluna `is_admin` (D56).

### 10.2. Resolvidas

| Pendência                                            | Resolução                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| Níveis administrativos                               | Depois do MVP; MVP com um administrador [A08]                                  |
| Suspensão de usuário em exclusão voluntária          | Permitida; vale se a exclusão for cancelada [A03]                              |
| Contestar penalidade aplicada durante a exclusão     | Segue normalmente; sem restauração após a exclusão definitiva [A03] [A04]      |
| Divisão entre MVP e posterior                        | Aprovada [A09]                                                                 |
| Primeira versão pública                              | Corresponde ao MVP da seção 8.1 [A09]                                          |
| Modelo de permissões                                 | Seções 2.19 e 3 [A08]                                                          |
| Estado de suspensão do autor versus estado editorial | Condição sobreposta, fora do estado do artigo [A01]                            |
| Exclusão permanente de artigo na auditoria           | Registrada sem conteúdo [A20]                                                  |
| Ações de autores auditadas                           | Somente eventos de segurança da conta [A20]                                    |
| Termos, políticas, cookies e idade mínima            | Seções 2.2 e 2.21 [A12]                                                        |
| Visibilidade dos comentários                         | Leitura pública [A13]                                                          |
| Exclusão em cascata e evidências                     | Cascata mantida; sem cópia do conteúdo denunciado [A14]                        |
| Acessibilidade do editor e texto alternativo         | Seção 2.5 [A15]                                                                |
| Imagens                                              | Seção 2.5 [A16]                                                                |
| Popularidade, ordenação padrão e datas               | Seções 2.8 e 2.9 [A17]                                                         |
| Notificações e e-mails                               | Seção 2.15 [A18]                                                               |
| Username, contas não verificadas e troca de e-mail   | Seções 2.2 e 2.3 [A19]                                                         |
| Retenção e auditoria                                 | Seções 2.23 e 2.24 [A20]                                                       |
| Campos obrigatórios e lixeira com versão pendente    | Seções 2.6 e 4.1 [A21]                                                         |
| Restauração de versão sem revisão                    | Sempre passa por aprovação [A22]                                               |
| Entidades faltantes e banco de dados                 | `DECISIONS.md` [A23]                                                           |
| Mecânicas caras                                      | Pausa como extensão do prazo; visitas anônimas reavaliadas depois do MVP [A24] |
| Permissões em casos de borda                         | Seções 2.11, 2.14 e 2.16 [A25]                                                 |
| Exclusão de artigo e histórico de versões            | Versões apagadas [P01]                                                         |
| Exclusão de artigo e comentários                     | Comentários e respostas apagados [P02]                                         |
| Exclusão de artigo e denúncias                       | Encerradas como "conteúdo removido" [P03]                                      |
| Versões pendentes na exclusão de conta               | Seção 2.4 [P04]                                                                |
| Edição pelo administrador durante a análise          | Não permitida [P05]                                                            |
| Reenvio de artigos rejeitados                        | Sem espera; antes eram 24 horas [P06] [D63]                                    |
| Limite de tamanho do artigo                          | 150 caracteres no título, 50.000 no conteúdo [P07]                             |
| Limites dos comentários                              | 2.000 caracteres, um a cada 30 segundos, até 3 níveis [P08]                    |
| Autor do artigo denunciando comentários              | Permitido [P09]                                                                |
| Notificações de curtidas e favoritos                 | Só curtidas, agrupadas por item [P10]                                          |

### 10.3. Regras derivadas

As 16 regras derivadas das decisões da auditoria (R01 a R16) foram confirmadas em 12/11/2026 e estão listadas em `DECISIONS.md`, seção 2.
