# he4rt ink

Publicação e leitura de artigos técnicos para a comunidade He4rt e para devs em geral. Escreva, envie para revisão, publique.

## Register

product

## Users

**Autores.** Membros da comunidade He4rt e devs em geral que querem publicar o que estão aprendendo e construindo. Não querem montar nem manter um blog próprio para isso.

**Leitores.** Devs que chegam por um link compartilhado na comunidade, numa busca ou numa indicação. Querem ler um texto técnico com calma, sem criar conta e sem distrações.

**Administradores.** Quem revisa e aprova os artigos antes de irem ao ar e modera denúncias. No MVP, uma única pessoa: Amanda, responsável pelo projeto.

O que querem resolver: autores, publicar um texto técnico revisado num lugar que a comunidade lê; leitores, encontrar conteúdo técnico em que possam confiar.

## Problem

A comunidade He4rt já publica artigos, mas em uma plataforma externa e genérica, o dev.to. Não existe um espaço que seja da própria comunidade, onde a produção dela apareça como um conjunto e onde as regras de publicação sejam definidas por ela.

O he4rt ink dá à He4rt esse espaço: um lugar próprio para publicar, com revisão antes de cada publicação, para que quem escreve publique com segurança e quem chega veja que a comunidade tem o seu próprio "dev.to".

## Product Purpose

A plataforma permite que um dev escreva um artigo num editor de texto rico, salve como rascunho, envie para revisão e o veja publicado depois da aprovação de um administrador. Qualquer pessoa pode ler, buscar e filtrar os artigos publicados. Usuários com conta verificada podem comentar, curtir, favoritar e denunciar.

É, antes de tudo, um projeto de estudo e de portfólio: serve para aprender e demonstrar engenharia de software full-stack, com autenticação, autorização no backend, modelagem de dados e testes automatizados.

Sucesso é medido por:

- Artigos publicados por mês.
- Autores ativos por mês: autores com pelo menos um artigo aprovado no mês.

## Brand Personality

Editorial, direta e acolhedora com quem está publicando pela primeira vez. Respeita o texto do autor e o tempo de quem lê.

### Tone

Frases curtas, em linguagem de dev, sem jargão de marketing. Mensagens de erro dizem o que aconteceu e como resolver, sem pedir desculpas e sem ser vagas. Quando um artigo não é aprovado, a mensagem é respeitosa e diz qual é o próximo passo. Nada de gamificação nem de linguagem de rede social ("viralize", "bombou", "engaje").

## Anti-references

- A interface MUST NOT parecer um feed de rede social: sem rolagem infinita, sem ranking de autores e sem contadores em destaque.
- As páginas de leitura MUST NOT priorizar métricas de engajamento sobre o texto. As curtidas aparecem, mas não competem com o conteúdo.
- As páginas públicas MUST NOT ter cara de painel administrativo genérico.
- A leitura MUST NOT ser interrompida por pop-ups de cadastro, banners de newsletter ou paywall.

## Design Principles

1. A leitura vem primeiro: tipografia, medida de linha e hierarquia são definidas antes de qualquer elemento de interface.
2. O autor sempre sabe em que estado está o artigo: rascunho, aguardando revisão ou publicado.
3. O que o autor vê na prévia é exatamente o que vai ser publicado.
4. Ler não exige conta. A conta só é pedida para escrever, comentar ou curtir.
5. A experiência é a mesma em português e em inglês.

## Accessibility & Inclusion

- O texto MUST atender ao contraste WCAG 2.2 AA: 4,5:1 para texto normal e 3:1 para texto grande e para componentes de interface, nos temas claro e escuro.
- Toda ação MUST funcionar por teclado, com foco sempre visível.
- O artigo renderizado MUST preservar a estrutura semântica do conteúdo (títulos, listas, tabelas, código), para leitores de tela.
- Blocos de código MUST ser legíveis no celular, com rolagem horizontal própria, sem quebrar o layout da página.
- Animações MUST respeitar a preferência de movimento reduzido do sistema.
- A interface MUST estar completa em português e em inglês.
- Recursos de formatação do editor (cores, destaques) MUST NOT permitir combinações que fiquem abaixo do contraste AA em qualquer um dos temas.
- Toda imagem de artigo MUST ter texto alternativo ou ser marcada explicitamente como decorativa.

## Offer

Gratuita para ler e para publicar durante o MVP. O modelo será revisto depois, sem plano pago previsto até lá.

## Boundaries

- Não é uma rede social: sem seguidores, feed personalizado, recomendações ou mensagens privadas.
- Não publica nada sem a revisão de um administrador.
- Não publica vídeos.
- Não tem monetização, assinaturas nem marketplace de conteúdo.
- Não tem analytics de leitura para autores; visualizações são um indicador interno da administração.

## Stack

- REQUIREMENTS.md: requisitos funcionais, perfis, regras de publicação, estados, fluxos e escopo do MVP
- DECISIONS.md: decisões de produto e de arquitetura, com justificativas
- ARCHITECTURE.md: camadas, responsabilidades e convenções
- DATABASE.md: modelagem e relacionamentos
- DESIGN.md: tokens visuais, paleta do editor e uso do mascote
- AGENTS.md: convenções para agentes de código (opcional)
