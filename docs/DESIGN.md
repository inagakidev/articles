# Design System --- Plataforma de Artigos

> Documento de referência visual e de interação da plataforma. Consolida
> as decisões tomadas durante o planejamento do design system. Valores
> de cores e tokens identificados como preliminares devem ser validados
> antes da implementação final.
>
> **Revisão técnica de cores e acessibilidade (14/11/2026):** a seção 2
> foi reorganizada em tokens semânticos por tema, com auditoria completa
> de contraste (§2.9) e registro de alterações (§2.10). As demais
> decisões do documento foram preservadas; ajustes pontuais em §7.3,
> §8.2, §12, §13 e §14 apenas referenciam os novos tokens.
>
> **Integração ao projeto (16/11/2026):** acrescentadas a paleta do
> editor (§2.11), o uso do mascote (§5.3) e a regra de links
> sublinhados no artigo (§8.3). Itens que contrariavam `PRODUCT.md` e
> `REQUIREMENTS.md` foram ajustados (§6.2, §8.6, §8.9, §8.10), pois
> esses documentos prevalecem.

## 1. Direção visual

### 1.1 Conceito

**Playful & Colorful** --- uma interface alegre, criativa e acolhedora,
com aparência jovem e profissional.

A identidade visual deve tornar a experiência agradável sem competir com
a finalidade principal do produto: descobrir, publicar e ler artigos.

### 1.2 Princípios

- **Conteúdo em primeiro lugar:** capas, títulos e textos dos artigos
  são protagonistas.
- **Cor com propósito:** lavanda é a cor de assinatura; cores
  secundárias apoiam categorias, estados e ilustrações.
- **Personalidade sem excesso:** formas arredondadas, doodles e
  detalhes coloridos aparecem de maneira equilibrada.
- **Consistência:** componentes semelhantes devem se comportar e
  parecer semelhantes em toda a plataforma.
- **Acessibilidade:** a identidade visual não pode comprometer
  legibilidade, contraste ou navegação.

## 2. Cores

> **Revisão técnica da paleta --- 14/11/2026.** Todas as razões de
> contraste desta seção foram recalculadas com a fórmula de luminância
> relativa da WCAG 2.x (sRGB linearizado; `(L1 + 0,05) / (L2 + 0,05)`),
> com arredondamento em duas casas decimais. Os 11 pares da análise
> visual anterior foram confirmados sem divergência.

### 2.0 Status dos valores

Cada valor desta seção tem um dos status abaixo. O status vale para o
**par foreground/background no uso documentado** --- nenhuma cor é
"aprovada" isoladamente.

| Status         | Significado                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Aprovado**   | Valor existente mantido; razão de contraste calculada atende ao critério WCAG 2.2 AA do uso indicado. Ainda depende dos testes listados em §12.2.   |
| **Preliminar** | Valor novo ou alterado nesta revisão; contraste calculado atende ao critério, mas ainda precisa de validação visual em telas reais, nos dois temas. |
| **Restrito**   | Valor mantido, mas proibido em determinados usos (ex.: texto normal). As restrições estão na própria tabela.                                        |
| **Pendente**   | Ainda não verificado. Não usar em produção sem verificação.                                                                                         |

Critérios usados:

- **Texto normal:** ≥ 4,5:1 (WCAG 1.4.3).
- **Texto grande** (≥ 24 px regular ou ≥ 18,66 px bold): ≥ 3:1 (1.4.3).
- **Componentes de interface e gráficos essenciais** --- bordas de
  campos, ícones informativos, indicador de foco, contorno de controles:
  ≥ 3:1 em relação às cores adjacentes (1.4.11).
- **Decorativo:** sem mínimo, desde que nenhuma informação dependa dele.
- **Desabilitado:** isento pela WCAG, mas precisa permanecer
  identificável (ver §2.8).

### 2.1 Cor de assinatura: lavanda

A lavanda é a cor principal da identidade. Deve aparecer em ações
primárias, estados ativos, foco e pequenos destaques.

| Token            | Hex       | Status                | Uso permitido                                                                     | Não usar para                                                                          |
| ---------------- | --------- | --------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Lavender 50      | `#F7F3FF` | Aprovado              | `surface-muted` (claro), fundos de apoio                                          | ---                                                                                    |
| Lavender 100     | `#EDE4FF` | Aprovado              | `surface-selected` (claro): navegação ativa, item selecionado                     | ---                                                                                    |
| Lavender 200     | `#DCCBFF` | Restrito              | Fundos pastéis, tags, decoração; `primary-active` no tema escuro                  | Texto ou ícone sobre fundos claros                                                     |
| Lavender 300     | `#C6ACFA` | Restrito              | Decoração no tema claro; `primary-text`, `focus` e `primary-hover` no tema escuro | Texto, ícone ou borda essencial no tema claro (1,97:1 sobre branco)                    |
| Lavender 400     | `#A982E8` | Restrito              | Doodles e destaques decorativos no tema claro; `primary` no tema escuro           | Texto, ícone ou borda essencial no tema claro (2,98:1 sobre branco)                    |
| Lavender 500     | `#875CCB` | Aprovado              | `primary` (claro): fundo de botão com texto branco (4,75:1); `focus` (claro)      | Texto normal sobre Lavender 50 (4,34:1) ou Lavender 100 (3,88:1) --- usar Lavender 600 |
| **Lavender 600** | `#6E48AF` | **Preliminar (novo)** | `primary-text` (links e texto lavanda no tema claro), `primary-hover` (claro)     | ---                                                                                    |
| Lavender 700     | `#56377F` | Aprovado              | Texto/ícone sobre fundos lavanda claros; `primary-active` (claro)                 | ---                                                                                    |

**Por que Lavender 600:** a escala tinha um salto entre 500 e 700. O
Lavender 500 passa com texto branco, mas **não** serve como texto sobre
os próprios tons claros de lavanda (4,34:1 sobre Lavender 50; 3,88:1
sobre Lavender 100). O 600 fecha esse vão, preserva o matiz da marca e
atende ≥ 5,3:1 em todas as superfícies claras --- além de dar ao hover
do botão primário um escurecimento natural (500 → 600 → 700).

### 2.2 Cores secundárias decorativas

| Cor     | Hex       | Status   | Uso permitido                                       | Não usar para                             |
| ------- | --------- | -------- | --------------------------------------------------- | ----------------------------------------- |
| Rosa    | `#FFC9D6` | Restrito | Fundo de tags, ilustrações, fundo do estado Danger  | Texto ou ícone sobre fundo claro (1,44:1) |
| Amarelo | `#FFE69A` | Restrito | Fundo de tags, ilustrações, fundo do estado Warning | Texto ou ícone sobre fundo claro (1,23:1) |
| Menta   | `#BDEBD9` | Restrito | Fundo de tags, ilustrações, fundo do estado Success | Texto ou ícone sobre fundo claro (1,31:1) |
| Azul    | `#BFE2FF` | Restrito | Fundo de tags, ilustrações, fundo do estado Info    | Texto ou ícone sobre fundo claro          |
| Pêssego | `#FFCBAF` | Restrito | Fundo de tags e ilustrações                         | Texto ou ícone sobre fundo claro          |

As cores decorativas podem identificar categorias, mas não devem
comunicar sozinhas estados funcionais como erro, sucesso ou alerta.

No tema claro, pastéis são **sempre fundo**, nunca foreground. No tema
escuro, os mesmos pastéis podem ser usados como texto/ícone sobre as
superfícies escuras (≥ 9:1, ver §2.4 e §2.9).

### 2.3 Neutros do tema claro

| Token conceitual   | Hex       | Status                | Observação                                                                                                                                      |
| ------------------ | --------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Background         | `#FFFDF8` | Aprovado              | Fundo principal off-white                                                                                                                       |
| Surface            | `#FFFFFF` | Aprovado              | Cards e superfícies principais                                                                                                                  |
| Surface muted      | `#F7F3FF` | Aprovado              | Áreas de apoio (= Lavender 50)                                                                                                                  |
| Surface hover      | `#F8F5FC` | Aprovado              | Hover de superfícies                                                                                                                            |
| Text primary       | `#292638` | Aprovado              | ≥ 13,4:1 em todas as superfícies claras                                                                                                         |
| **Text secondary** | `#6B6675` | **Preliminar (novo)** | Candidato da análise anterior, agora formalizado. ≥ 4,5:1 em todas as superfícies claras (mínimo 4,53:1 sobre Lavender 100 --- margem estreita) |
| **Text muted**     | `#77717F` | **Preliminar (novo)** | Apenas sobre Background e Surface (≥ 4,64:1). **Reprova** sobre Surface muted (4,32:1) --- ali usar Text secondary                              |
| Border             | `#EDE8E1` | Restrito              | **Somente decorativo** (1,22:1): divisórias e contornos de cards, que não carregam informação                                                   |
| **Border strong**  | `#8A8394` | **Preliminar (novo)** | Contorno de campos, checkboxes, radios e outros controles cujo limite precisa ser percebido (≥ 3,34:1, WCAG 1.4.11)                             |

### 2.4 Cores funcionais

Os pares fundo/texto originais foram **confirmados** e valem para os
dois temas (o contraste do par não depende do tema ao redor).

| Estado  | Fundo     | Texto     | Contraste | Status   | Texto/ícone sobre Surface (claro) | Texto/ícone sobre Surface (escuro) |
| ------- | --------- | --------- | --------: | -------- | --------------------------------- | ---------------------------------- |
| Success | `#BDEBD9` | `#245C48` |    5,95:1 | Aprovado | `#245C48` --- 7,78:1              | `#BDEBD9` --- 9,93:1               |
| Warning | `#FFE69A` | `#70520A` |    5,87:1 | Aprovado | `#70520A` --- 7,24:1              | `#FFE69A` --- 10,55:1              |
| Danger  | `#FFC9D6` | `#8B304B` |    5,56:1 | Aprovado | `#8B304B` --- 8,01:1              | `#FFC9D6` --- 9,02:1               |
| Info    | `#BFE2FF` | `#24527A` |    6,06:1 | Aprovado | `#24527A` --- 8,19:1              | `#BFE2FF` --- 9,62:1               |

Sempre associar o estado a texto e/ou ícone --- nunca depender apenas da
cor. O contorno pastel de um alerta sobre uma superfície branca tem
contraste baixo (≈ 1,2--1,4:1); por isso o significado precisa estar
no ícone e no texto, não no contorno.

### 2.5 Tema escuro

O tema escuro será **escuro colorido**, não uma simples inversão do tema
claro. A lavanda e as cores secundárias permanecem como acentos,
ajustadas para manter legibilidade.

| Token conceitual     | Hex       | Status                    | Observação                                                                                                                                                                                                     |
| -------------------- | --------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background           | `#292638` | Aprovado                  | ---                                                                                                                                                                                                            |
| Surface              | `#342E42` | Aprovado                  | ---                                                                                                                                                                                                            |
| Surface elevated     | `#3A344A` | Aprovado                  | ---                                                                                                                                                                                                            |
| **Surface muted**    | `#3F3850` | **Preliminar (alterado)** | Antes `#51465F`, valor compartilhado com Border. Ver justificativa abaixo                                                                                                                                      |
| **Surface hover**    | `#3F3850` | **Preliminar (novo)**     | Mesmo valor de Surface muted, com função distinta                                                                                                                                                              |
| **Surface selected** | `#4A3D66` | **Preliminar (novo)**     | Equivalente escuro de Lavender 100                                                                                                                                                                             |
| Text primary         | `#FFFFFF` | Aprovado                  | ≥ 9,7:1 em todas as superfícies escuras                                                                                                                                                                        |
| Text secondary       | `#D2C9DE` | Aprovado                  | ≥ 6,1:1 em todas as superfícies escuras                                                                                                                                                                        |
| **Text muted**       | `#B3A9C2` | **Preliminar (novo)**     | ≥ 4,95:1 sobre Background, Surface, Elevated e Muted. **Não usar** sobre Surface selected (4,36:1)                                                                                                             |
| Primary              | `#A982E8` | Restrito                  | Fundo de botão **com texto `#292638`** (4,93:1). **Texto branco reprova** (2,98:1). Como texto, só passa sobre Background (4,93:1); sobre Surface (4,36:1) e Elevated (3,98:1) reprova --- usar `primary-text` |
| **Primary text**     | `#C6ACFA` | **Preliminar (novo)**     | = Lavender 300. Links e texto lavanda no tema escuro (≥ 4,97:1)                                                                                                                                                |
| Border               | `#51465F` | Restrito                  | **Somente decorativo** (1,48:1 sobre Surface)                                                                                                                                                                  |
| **Border strong**    | `#958AA6` | **Preliminar (novo)**     | Contorno de campos e controles (≥ 3,41:1)                                                                                                                                                                      |

**Por que alterar Surface muted:** `#51465F` acumulava as funções de
superfície e de borda (a tabela original o listava como "Surface muted
/ Border"). Como superfície, reprovou com os tokens necessários sobre
ela: Text muted 3,92:1, Primary text 4,47:1 e Border strong 2,70:1.
Além disso, uma borda `#51465F` desaparece sobre uma superfície da
mesma cor. `#3F3850` mantém a mesma família de cor (violeta acinzentado)
e aprova todos esses pares. `#51465F` continua como Border.

### 2.6 Tokens semânticos

Componentes devem consumir **apenas tokens semânticos** (por função),
nunca o nome da cor (`lavender-500`) nem hex direto. Os tokens de
paleta (§2.1--§2.5) existem só para alimentar os semânticos. Os dois
temas têm conjuntos independentes: o mesmo token pode ter valores e
até lógicas diferentes em cada tema.

#### 2.6.1 Tema claro

| Token semântico         | Variável CSS                                                          | Valor                             | Origem              | Status     | Uso                                                                                                    |
| ----------------------- | --------------------------------------------------------------------- | --------------------------------- | ------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| Background              | `--color-bg`                                                          | `#FFFDF8`                         | Neutro              | Aprovado   | Fundo da página                                                                                        |
| Surface                 | `--color-surface`                                                     | `#FFFFFF`                         | Neutro              | Aprovado   | Cards, campos, modais                                                                                  |
| Surface elevated        | `--color-surface-elevated`                                            | `#FFFFFF`                         | Neutro              | Preliminar | Menus, popovers, modais. No claro, a elevação vem de `shadow-*` + `--color-border`, nunca só da sombra |
| Surface muted           | `--color-surface-muted`                                               | `#F7F3FF`                         | Lavender 50         | Aprovado   | Áreas de apoio, blocos secundários                                                                     |
| Surface selected        | `--color-surface-selected`                                            | `#EDE4FF`                         | Lavender 100        | Aprovado   | Item de navegação ativo, linha/opção selecionada                                                       |
| Surface hover           | `--color-surface-hover`                                               | `#F8F5FC`                         | Neutro              | Aprovado   | Hover de itens de lista, cards clicáveis, botões terciários                                            |
| Text primary            | `--color-text-primary`                                                | `#292638`                         | Neutro              | Aprovado   | Títulos, corpo, rótulos                                                                                |
| Text secondary          | `--color-text-secondary`                                              | `#6B6675`                         | Neutro              | Preliminar | Metadados, descrições, texto auxiliar                                                                  |
| Text muted              | `--color-text-muted`                                                  | `#77717F`                         | Neutro              | Preliminar | Texto de baixa ênfase, **somente** sobre `bg` e `surface`                                              |
| Text on primary         | `--color-text-on-primary`                                             | `#FFFFFF`                         | Neutro              | Aprovado   | Texto e ícone sobre `primary`, `primary-hover`, `primary-active`                                       |
| Text on selected        | `--color-text-on-selected`                                            | `#56377F`                         | Lavender 700        | Aprovado   | Texto e ícone sobre `surface-selected`                                                                 |
| Primary                 | `--color-primary`                                                     | `#875CCB`                         | Lavender 500        | Aprovado   | Fundo do botão primário, página atual da paginação, indicadores                                        |
| Primary hover           | `--color-primary-hover`                                               | `#6E48AF`                         | Lavender 600        | Preliminar | Hover do botão primário                                                                                |
| Primary active          | `--color-primary-active`                                              | `#56377F`                         | Lavender 700        | Aprovado   | Pressed do botão primário                                                                              |
| Primary text            | `--color-primary-text`                                                | `#6E48AF`                         | Lavender 600        | Preliminar | Links, texto e ícones lavanda sobre qualquer superfície clara                                          |
| Border                  | `--color-border`                                                      | `#EDE8E1`                         | Neutro              | Restrito   | Divisórias e contornos decorativos                                                                     |
| Border strong           | `--color-border-strong`                                               | `#8A8394`                         | Neutro              | Preliminar | Contorno de campos e controles                                                                         |
| Focus                   | `--color-focus`                                                       | `#875CCB`                         | Lavender 500        | Aprovado   | Anel de foco (ver §2.8)                                                                                |
| Success bg / on-bg / fg | `--color-success-bg` / `--color-success-on-bg` / `--color-success-fg` | `#BDEBD9` / `#245C48` / `#245C48` | Menta + funcional   | Aprovado   | Alertas, badges e ícones de sucesso                                                                    |
| Warning bg / on-bg / fg | `--color-warning-*`                                                   | `#FFE69A` / `#70520A` / `#70520A` | Amarelo + funcional | Aprovado   | Alertas de atenção                                                                                     |
| Danger bg / on-bg / fg  | `--color-danger-*`                                                    | `#FFC9D6` / `#8B304B` / `#8B304B` | Rosa + funcional    | Aprovado   | Erros, validação, ações destrutivas                                                                    |
| Info bg / on-bg / fg    | `--color-info-*`                                                      | `#BFE2FF` / `#24527A` / `#24527A` | Azul + funcional    | Aprovado   | Mensagens informativas                                                                                 |
| Disabled bg             | `--color-disabled-bg`                                                 | `#EDE8E1`                         | Neutro              | Preliminar | Fundo de controle desabilitado                                                                         |
| Disabled text           | `--color-disabled-text`                                               | `#8A8394`                         | Neutro              | Preliminar | Texto/ícone desabilitado (isento de contraste)                                                         |

#### 2.6.2 Tema escuro

| Token semântico         | Variável CSS               | Valor                             | Origem              | Status                                | Uso                                                                                   |
| ----------------------- | -------------------------- | --------------------------------- | ------------------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| Background              | `--color-bg`               | `#292638`                         | Neutro escuro       | Aprovado                              | Fundo da página                                                                       |
| Surface                 | `--color-surface`          | `#342E42`                         | Neutro escuro       | Aprovado                              | Cards, campos                                                                         |
| Surface elevated        | `--color-surface-elevated` | `#3A344A`                         | Neutro escuro       | Aprovado                              | Menus, popovers, modais. No escuro a elevação vem principalmente da cor da superfície |
| Surface muted           | `--color-surface-muted`    | `#3F3850`                         | Neutro escuro       | Preliminar                            | Áreas de apoio                                                                        |
| Surface selected        | `--color-surface-selected` | `#4A3D66`                         | Lavanda escura      | Preliminar                            | Item ativo, seleção                                                                   |
| Surface hover           | `--color-surface-hover`    | `#3F3850`                         | Neutro escuro       | Preliminar                            | Hover                                                                                 |
| Text primary            | `--color-text-primary`     | `#FFFFFF`                         | ---                 | Aprovado                              | Títulos, corpo                                                                        |
| Text secondary          | `--color-text-secondary`   | `#D2C9DE`                         | ---                 | Aprovado                              | Metadados, descrições                                                                 |
| Text muted              | `--color-text-muted`       | `#B3A9C2`                         | ---                 | Preliminar                            | Baixa ênfase; **não** sobre `surface-selected`                                        |
| Text on primary         | `--color-text-on-primary`  | `#292638`                         | Neutro              | Aprovado                              | Texto sobre `primary` --- **escuro**, não branco                                      |
| Text on selected        | `--color-text-on-selected` | `#FFFFFF`                         | ---                 | Preliminar                            | Texto sobre `surface-selected` (9,77:1)                                               |
| Primary                 | `--color-primary`          | `#A982E8`                         | Lavender 400        | Aprovado                              | Fundo do botão primário, indicadores                                                  |
| Primary hover           | `--color-primary-hover`    | `#C6ACFA`                         | Lavender 300        | Preliminar                            | No escuro, hover **clareia**                                                          |
| Primary active          | `--color-primary-active`   | `#DCCBFF`                         | Lavender 200        | Preliminar                            | Pressed                                                                               |
| Primary text            | `--color-primary-text`     | `#C6ACFA`                         | Lavender 300        | Preliminar                            | Links, texto e ícones lavanda                                                         |
| Border                  | `--color-border`           | `#51465F`                         | Neutro escuro       | Restrito                              | Divisórias decorativas                                                                |
| Border strong           | `--color-border-strong`    | `#958AA6`                         | Neutro escuro       | Preliminar                            | Contorno de campos e controles                                                        |
| Focus                   | `--color-focus`            | `#C6ACFA`                         | Lavender 300        | Preliminar                            | Anel de foco                                                                          |
| Success bg / on-bg / fg | `--color-success-*`        | `#BDEBD9` / `#245C48` / `#BDEBD9` | Menta + funcional   | Aprovado (bg/on-bg) · Preliminar (fg) | `fg` = texto/ícone direto sobre superfície escura                                     |
| Warning bg / on-bg / fg | `--color-warning-*`        | `#FFE69A` / `#70520A` / `#FFE69A` | Amarelo + funcional | Aprovado · Preliminar                 | Idem                                                                                  |
| Danger bg / on-bg / fg  | `--color-danger-*`         | `#FFC9D6` / `#8B304B` / `#FFC9D6` | Rosa + funcional    | Aprovado · Preliminar                 | Idem                                                                                  |
| Info bg / on-bg / fg    | `--color-info-*`           | `#BFE2FF` / `#24527A` / `#BFE2FF` | Azul + funcional    | Aprovado · Preliminar                 | Idem                                                                                  |
| Disabled bg             | `--color-disabled-bg`      | `#3A344A`                         | Neutro escuro       | Preliminar                            | Fundo de controle desabilitado                                                        |
| Disabled text           | `--color-disabled-text`    | `#8F84A0`                         | Neutro escuro       | Preliminar                            | Texto/ícone desabilitado (isento)                                                     |

#### 2.6.3 Variáveis CSS de referência

O tema escuro é ativado pela classe `.dark` no elemento `<html>`, a
mesma convenção do Tailwind (`dark:`) e dos componentes da interface.

```css
:root {
    /* Superfícies */
    --color-bg: #fffdf8;
    --color-surface: #ffffff;
    --color-surface-elevated: #ffffff;
    --color-surface-muted: #f7f3ff;
    --color-surface-selected: #ede4ff;
    --color-surface-hover: #f8f5fc;
    /* Texto */
    --color-text-primary: #292638;
    --color-text-secondary: #6b6675;
    --color-text-muted: #77717f;
    --color-text-on-primary: #ffffff;
    --color-text-on-selected: #56377f;
    /* Marca */
    --color-primary: #875ccb;
    --color-primary-hover: #6e48af;
    --color-primary-active: #56377f;
    --color-primary-text: #6e48af;
    /* Bordas e foco */
    --color-border: #ede8e1;
    --color-border-strong: #8a8394;
    --color-focus: #875ccb;
    /* Funcionais */
    --color-success-bg: #bdebd9;
    --color-success-on-bg: #245c48;
    --color-success-fg: #245c48;
    --color-warning-bg: #ffe69a;
    --color-warning-on-bg: #70520a;
    --color-warning-fg: #70520a;
    --color-danger-bg: #ffc9d6;
    --color-danger-on-bg: #8b304b;
    --color-danger-fg: #8b304b;
    --color-info-bg: #bfe2ff;
    --color-info-on-bg: #24527a;
    --color-info-fg: #24527a;
    /* Desabilitado */
    --color-disabled-bg: #ede8e1;
    --color-disabled-text: #8a8394;
}

.dark {
    --color-bg: #292638;
    --color-surface: #342e42;
    --color-surface-elevated: #3a344a;
    --color-surface-muted: #3f3850;
    --color-surface-selected: #4a3d66;
    --color-surface-hover: #3f3850;
    --color-text-primary: #ffffff;
    --color-text-secondary: #d2c9de;
    --color-text-muted: #b3a9c2;
    --color-text-on-primary: #292638;
    --color-text-on-selected: #ffffff;
    --color-primary: #a982e8;
    --color-primary-hover: #c6acfa;
    --color-primary-active: #dccbff;
    --color-primary-text: #c6acfa;
    --color-border: #51465f;
    --color-border-strong: #958aa6;
    --color-focus: #c6acfa;
    --color-success-bg: #bdebd9;
    --color-success-on-bg: #245c48;
    --color-success-fg: #bdebd9;
    --color-warning-bg: #ffe69a;
    --color-warning-on-bg: #70520a;
    --color-warning-fg: #ffe69a;
    --color-danger-bg: #ffc9d6;
    --color-danger-on-bg: #8b304b;
    --color-danger-fg: #ffc9d6;
    --color-info-bg: #bfe2ff;
    --color-info-on-bg: #24527a;
    --color-info-fg: #bfe2ff;
    --color-disabled-bg: #3a344a;
    --color-disabled-text: #8f84a0;
}
```

**Seleção do tema:** o usuário escolhe claro, escuro ou sistema
(RF-006, RF-007); "sistema" acompanha `prefers-color-scheme`, inclusive
se a preferência mudar com a página aberta. A escolha fica no cookie
essencial `appearance` (RF-275). Com "escuro", o servidor já entrega
a página com a classe; com "sistema", um script no `<head>` aplica a
classe antes da primeira pintura. Assim não há troca de tema visível
durante o carregamento.

Os tokens de pastéis decorativos para tags (`--color-tag-pink`,
`--color-tag-yellow` etc.) usam os mesmos hex de §2.2 nos dois temas,
sempre com `--color-tag-text: #292638`.

### 2.7 Recomendações de uso

**Botões**

| Variante   | Claro                                                                                                                                       | Escuro                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Primário   | Fundo `primary` `#875CCB` + texto `#FFFFFF` (4,75:1)                                                                                        | Fundo `primary` `#A982E8` + texto `#292638` (4,93:1). **Nunca texto branco** (2,98:1) |
| Secundário | Fundo `surface-muted` ou pastel + texto `text-primary` (≥ 9,8:1); contorno `border-strong` se o botão estiver sobre superfície da mesma cor | Fundo `surface-muted` + texto `text-primary`; contorno `border-strong`                |
| Terciário  | Sem fundo; texto `primary-text` `#6E48AF` (≥ 5,3:1)                                                                                         | Sem fundo; texto `primary-text` `#C6ACFA` (≥ 4,97:1)                                  |
| Destrutivo | Fundo `danger-bg` + texto `danger-on-bg`, sempre com rótulo explícito ("Excluir artigo"), não só ícone                                      | Idem                                                                                  |

**Texto**

- Texto em lavanda: usar **somente** `primary-text` (Lavender 600 no
  claro, Lavender 300 no escuro). Lavender 400 nunca é texto no claro;
  Lavender 500 só é texto sobre `surface`/`bg` brancos e, mesmo assim,
  prefira `primary-text` para manter uma regra única.
- Texto sobre lavanda clara (navegação ativa, item selecionado):
  `text-on-selected`.
- `text-muted` não é uma alternativa genérica a `text-secondary`: só
  pode ser usado sobre `bg` e `surface`.
- Placeholder de campo: usar `text-muted` sobre `surface` (4,72:1). O
  placeholder nunca substitui o rótulo (§7.3).

**Reservados para decoração**

- Tema claro: Lavender 200, 300 e 400; todos os pastéis como
  foreground; `border` (`#EDE8E1`).
- Tema escuro: `border` (`#51465F`).
- Doodles e ilustrações podem usar livremente essas cores, desde que
  não transmitam informação necessária.

**Tags e categorias (pills)**

- Fundo pastel + texto `#292638` (≥ 9,8:1 em todas as combinações),
  nos dois temas. Lavender 700 também pode ser usado como texto no
  claro (≥ 6,4:1).
- A categoria é identificada pelo **texto** da tag; a cor é reforço.
- Para não confundir categoria com estado: categorias usam pill sem
  ícone de estado; estados usam etiqueta retangular com ícone (§7.2).
- O contorno da pill não precisa de 3:1, porque o texto já identifica
  o componente. Se a tag for clicável (filtro), o estado selecionado
  precisa de indicação além da cor (ícone de check ou contorno
  `border-strong`).

**Estados funcionais**

- Sempre: cor + ícone Lucide + texto. Ex.: ícone `circle-alert` +
  "Não foi possível salvar".
- Alerta/badge: `*-bg` + `*-on-bg`.
- Mensagem inline sob campo, sem fundo: `*-fg` direto sobre a superfície.
- Bordas de campo em erro: `danger-fg` (≥ 8:1 no claro; `#FFC9D6`
  9,02:1 no escuro) + mensagem de texto.

**Contraste no tema escuro**

- Lavanda no escuro **clareia** para ganhar contraste (hover → 300,
  pressed → 200), o inverso do tema claro.
- Texto sobre `primary` é escuro (`#292638`).
- Pastéis funcionam como foreground sobre superfícies escuras (≥ 9:1)
  --- é assim que o escuro fica "colorido" sem perder legibilidade.
- Evitar grandes áreas pastéis no escuro (alertas de página inteira);
  preferir faixa lateral pastel + ícone e texto `*-fg` sobre `surface`.

### 2.8 Estados interativos

| Estado                  | Regra                                                                                                                                                                                                                                                                        | Claro                                                                        | Escuro                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Foco**                | Anel `outline: 2px solid var(--color-focus)` com `outline-offset: 2px`. O deslocamento faz o anel ficar sobre a superfície, e não sobre o próprio componente; por isso o contraste relevante é anel × superfície. Usar `:focus-visible`. Não remover outline sem substituto  | `#875CCB`: 4,75:1 em `surface`, 4,67:1 em `bg`, 3,88:1 em `surface-selected` | `#C6ACFA`: 7,48:1 em `bg`, 6,04:1 em `surface-elevated`            |
| **Hover**               | Muda fundo e/ou sombra (§9.3). O texto mantém ≥ 4,5:1 no estado hover. Hover nunca é o único indicador de que algo é interativo                                                                                                                                              | Primário → `#6E48AF` (texto 6,54:1); superfícies → `surface-hover`           | Primário → `#C6ACFA` (texto 7,48:1); superfícies → `surface-hover` |
| **Pressed**             | Cor `primary-active` + leve redução de escala (§7.1), respeitando `prefers-reduced-motion`                                                                                                                                                                                   | `#56377F` (texto 9,34:1)                                                     | `#DCCBFF` (texto 9,82:1)                                           |
| **Selecionado / ativo** | `surface-selected` + `text-on-selected` + indicador não cromático (ícone filled, peso de fonte ou marcador) e `aria-current`/`aria-selected`                                                                                                                                 | `#56377F` sobre `#EDE4FF` (7,62:1)                                           | `#FFFFFF` sobre `#4A3D66` (9,77:1)                                 |
| **Desabilitado**        | Isento de contraste (WCAG 1.4.3), mas usar tokens explícitos, **não opacidade** no componente inteiro (o resultado varia conforme o fundo). Atributo `disabled` ou `aria-disabled="true"`. Não usar disabled como única forma de explicar por que a ação não está disponível | `#8A8394` sobre `#EDE8E1` (2,99:1)                                           | `#8F84A0` sobre `#3A344A` (3,38:1)                                 |
| **Erro**                | `border-strong` → `danger-fg`; mensagem com ícone abaixo do campo; `aria-invalid` + `aria-describedby`                                                                                                                                                                       | `#8B304B`                                                                    | `#FFC9D6`                                                          |

### 2.9 Auditoria de contraste --- todos os pares testados

Legenda: **Aprovado** = atende ao critério do uso; **Só texto grande / UI** = passa 3:1 mas não 4,5:1, portanto proibido para texto normal; **Reprovado** = não atende nem a 3:1; **Decorativo** e **Isento** = sem mínimo aplicável no uso previsto.

Pares marcados com † documentam **usos proibidos** e o motivo da restrição. A margem do par C08 (4,53:1) é estreita: qualquer ajuste em Lavender 100 ou Text secondary exige recálculo.

| #     | Tema   | Uso                                                       | Foreground | Background |   Razão | Critério | Resultado                |
| ----- | ------ | --------------------------------------------------------- | ---------- | ---------- | ------: | -------- | ------------------------ |
| C01   | Claro  | Texto principal / background                              | `#292638`  | `#FFFDF8`  | 14,46:1 | ≥ 4,5:1  | Aprovado                 |
| C02   | Claro  | Texto principal / surface                                 | `#292638`  | `#FFFFFF`  | 14,70:1 | ≥ 4,5:1  | Aprovado                 |
| C03   | Claro  | Texto principal / surface muted                           | `#292638`  | `#F7F3FF`  | 13,45:1 | ≥ 4,5:1  | Aprovado                 |
| C04   | Claro  | Texto principal / surface hover                           | `#292638`  | `#F8F5FC`  | 13,62:1 | ≥ 4,5:1  | Aprovado                 |
| C05   | Claro  | Texto secundário / background                             | `#6B6675`  | `#FFFDF8`  |  5,46:1 | ≥ 4,5:1  | Aprovado                 |
| C06   | Claro  | Texto secundário / surface                                | `#6B6675`  | `#FFFFFF`  |  5,55:1 | ≥ 4,5:1  | Aprovado                 |
| C07   | Claro  | Texto secundário / surface muted                          | `#6B6675`  | `#F7F3FF`  |  5,08:1 | ≥ 4,5:1  | Aprovado                 |
| C08   | Claro  | Texto secundário / surface selected                       | `#6B6675`  | `#EDE4FF`  |  4,53:1 | ≥ 4,5:1  | Aprovado                 |
| C09   | Claro  | Texto muted / surface                                     | `#77717F`  | `#FFFFFF`  |  4,72:1 | ≥ 4,5:1  | Aprovado                 |
| C10   | Claro  | Texto muted / background                                  | `#77717F`  | `#FFFDF8`  |  4,64:1 | ≥ 4,5:1  | Aprovado                 |
| C11 † | Claro  | Texto muted / surface muted                               | `#77717F`  | `#F7F3FF`  |  4,32:1 | ≥ 4,5:1  | **Só texto grande / UI** |
| C12   | Claro  | Botão primário: texto / primary                           | `#FFFFFF`  | `#875CCB`  |  4,75:1 | ≥ 4,5:1  | Aprovado                 |
| C13   | Claro  | Botão primário hover: texto / Lavender 600                | `#FFFFFF`  | `#6E48AF`  |  6,54:1 | ≥ 4,5:1  | Aprovado                 |
| C14   | Claro  | Botão primário pressed: texto / Lavender 700              | `#FFFFFF`  | `#56377F`  |  9,34:1 | ≥ 4,5:1  | Aprovado                 |
| C15   | Claro  | Item ativo: Lavender 700 / Lavender 100                   | `#56377F`  | `#EDE4FF`  |  7,62:1 | ≥ 4,5:1  | Aprovado                 |
| C16   | Claro  | Link (primary-text) / surface                             | `#6E48AF`  | `#FFFFFF`  |  6,54:1 | ≥ 4,5:1  | Aprovado                 |
| C17   | Claro  | Link (primary-text) / surface muted                       | `#6E48AF`  | `#F7F3FF`  |  5,99:1 | ≥ 4,5:1  | Aprovado                 |
| C18   | Claro  | Link (primary-text) / surface selected                    | `#6E48AF`  | `#EDE4FF`  |  5,34:1 | ≥ 4,5:1  | Aprovado                 |
| C19   | Claro  | Lavender 500 como texto / surface                         | `#875CCB`  | `#FFFFFF`  |  4,75:1 | ≥ 4,5:1  | Aprovado                 |
| C20 † | Claro  | Lavender 500 como texto / Lavender 50                     | `#875CCB`  | `#F7F3FF`  |  4,34:1 | ≥ 4,5:1  | **Só texto grande / UI** |
| C21 † | Claro  | Lavender 500 como texto / Lavender 100                    | `#875CCB`  | `#EDE4FF`  |  3,88:1 | ≥ 4,5:1  | **Só texto grande / UI** |
| C22 † | Claro  | Lavender 400 como texto / surface                         | `#A982E8`  | `#FFFFFF`  |  2,98:1 | ≥ 4,5:1  | **Reprovado**            |
| C23 † | Claro  | Lavender 300 / surface                                    | `#C6ACFA`  | `#FFFFFF`  |  1,97:1 | ≥ 4,5:1  | **Reprovado**            |
| C24   | Claro  | Foco (Lavender 500) / surface                             | `#875CCB`  | `#FFFFFF`  |  4,75:1 | ≥ 3:1    | Aprovado                 |
| C25   | Claro  | Foco (Lavender 500) / background                          | `#875CCB`  | `#FFFDF8`  |  4,67:1 | ≥ 3:1    | Aprovado                 |
| C26   | Claro  | Foco (Lavender 500) / surface selected                    | `#875CCB`  | `#EDE4FF`  |  3,88:1 | ≥ 3:1    | Aprovado                 |
| C27   | Claro  | Border (divisória) / surface                              | `#EDE8E1`  | `#FFFFFF`  |  1,22:1 | ---      | Decorativo               |
| C28   | Claro  | Border strong (campo) / surface                           | `#8A8394`  | `#FFFFFF`  |  3,65:1 | ≥ 3:1    | Aprovado                 |
| C29   | Claro  | Border strong (campo) / background                        | `#8A8394`  | `#FFFDF8`  |  3,59:1 | ≥ 3:1    | Aprovado                 |
| C30   | Claro  | Border strong (campo) / surface muted                     | `#8A8394`  | `#F7F3FF`  |  3,34:1 | ≥ 3:1    | Aprovado                 |
| C31   | Claro  | Success: texto / fundo                                    | `#245C48`  | `#BDEBD9`  |  5,95:1 | ≥ 4,5:1  | Aprovado                 |
| C32   | Claro  | Warning: texto / fundo                                    | `#70520A`  | `#FFE69A`  |  5,87:1 | ≥ 4,5:1  | Aprovado                 |
| C33   | Claro  | Danger: texto / fundo                                     | `#8B304B`  | `#FFC9D6`  |  5,56:1 | ≥ 4,5:1  | Aprovado                 |
| C34   | Claro  | Info: texto / fundo                                       | `#24527A`  | `#BFE2FF`  |  6,06:1 | ≥ 4,5:1  | Aprovado                 |
| C35   | Claro  | Success: texto/ícone / surface                            | `#245C48`  | `#FFFFFF`  |  7,78:1 | ≥ 4,5:1  | Aprovado                 |
| C36   | Claro  | Warning: texto/ícone / surface                            | `#70520A`  | `#FFFFFF`  |  7,24:1 | ≥ 4,5:1  | Aprovado                 |
| C37   | Claro  | Danger: texto/ícone / surface                             | `#8B304B`  | `#FFFFFF`  |  8,01:1 | ≥ 4,5:1  | Aprovado                 |
| C38   | Claro  | Info: texto/ícone / surface                               | `#24527A`  | `#FFFFFF`  |  8,19:1 | ≥ 4,5:1  | Aprovado                 |
| C39   | Claro  | Tag: texto principal / Rosa                               | `#292638`  | `#FFC9D6`  | 10,20:1 | ≥ 4,5:1  | Aprovado                 |
| C40   | Claro  | Tag: texto principal / Amarelo                            | `#292638`  | `#FFE69A`  | 11,93:1 | ≥ 4,5:1  | Aprovado                 |
| C41   | Claro  | Tag: texto principal / Menta                              | `#292638`  | `#BDEBD9`  | 11,23:1 | ≥ 4,5:1  | Aprovado                 |
| C42   | Claro  | Tag: texto principal / Azul                               | `#292638`  | `#BFE2FF`  | 10,88:1 | ≥ 4,5:1  | Aprovado                 |
| C43   | Claro  | Tag: texto principal / Pêssego                            | `#292638`  | `#FFCBAF`  | 10,09:1 | ≥ 4,5:1  | Aprovado                 |
| C44   | Claro  | Tag: texto principal / Lavender 200                       | `#292638`  | `#DCCBFF`  |  9,82:1 | ≥ 4,5:1  | Aprovado                 |
| C45 † | Claro  | Pastel (Menta) como texto / surface                       | `#BDEBD9`  | `#FFFFFF`  |  1,31:1 | ≥ 4,5:1  | **Reprovado**            |
| C46   | Claro  | Disabled: texto / fundo                                   | `#8A8394`  | `#EDE8E1`  |  2,99:1 | isento   | Isento                   |
| E01   | Escuro | Texto principal / background                              | `#FFFFFF`  | `#292638`  | 14,70:1 | ≥ 4,5:1  | Aprovado                 |
| E02   | Escuro | Texto principal / surface                                 | `#FFFFFF`  | `#342E42`  | 13,00:1 | ≥ 4,5:1  | Aprovado                 |
| E03   | Escuro | Texto principal / surface elevated                        | `#FFFFFF`  | `#3A344A`  | 11,86:1 | ≥ 4,5:1  | Aprovado                 |
| E04   | Escuro | Texto principal / surface muted (novo)                    | `#FFFFFF`  | `#3F3850`  | 11,09:1 | ≥ 4,5:1  | Aprovado                 |
| E05   | Escuro | Texto principal / surface selected                        | `#FFFFFF`  | `#4A3D66`  |  9,77:1 | ≥ 4,5:1  | Aprovado                 |
| E06   | Escuro | Texto secundário / background                             | `#D2C9DE`  | `#292638`  |  9,20:1 | ≥ 4,5:1  | Aprovado                 |
| E07   | Escuro | Texto secundário / surface                                | `#D2C9DE`  | `#342E42`  |  8,14:1 | ≥ 4,5:1  | Aprovado                 |
| E08   | Escuro | Texto secundário / surface elevated                       | `#D2C9DE`  | `#3A344A`  |  7,43:1 | ≥ 4,5:1  | Aprovado                 |
| E09   | Escuro | Texto secundário / surface muted (novo)                   | `#D2C9DE`  | `#3F3850`  |  6,95:1 | ≥ 4,5:1  | Aprovado                 |
| E10   | Escuro | Texto muted / background                                  | `#B3A9C2`  | `#292638`  |  6,56:1 | ≥ 4,5:1  | Aprovado                 |
| E11   | Escuro | Texto muted / surface                                     | `#B3A9C2`  | `#342E42`  |  5,80:1 | ≥ 4,5:1  | Aprovado                 |
| E12   | Escuro | Texto muted / surface elevated                            | `#B3A9C2`  | `#3A344A`  |  5,29:1 | ≥ 4,5:1  | Aprovado                 |
| E13   | Escuro | Texto muted / surface muted (novo)                        | `#B3A9C2`  | `#3F3850`  |  4,95:1 | ≥ 4,5:1  | Aprovado                 |
| E14   | Escuro | Botão primário: texto escuro / primary                    | `#292638`  | `#A982E8`  |  4,93:1 | ≥ 4,5:1  | Aprovado                 |
| E15   | Escuro | Botão primário hover: texto / Lavender 300                | `#292638`  | `#C6ACFA`  |  7,48:1 | ≥ 4,5:1  | Aprovado                 |
| E16   | Escuro | Botão primário pressed: texto / Lavender 200              | `#292638`  | `#DCCBFF`  |  9,82:1 | ≥ 4,5:1  | Aprovado                 |
| E17 † | Escuro | Texto branco / primary (#A982E8)                          | `#FFFFFF`  | `#A982E8`  |  2,98:1 | ≥ 4,5:1  | **Reprovado**            |
| E18   | Escuro | Primary #A982E8 como texto / background                   | `#A982E8`  | `#292638`  |  4,93:1 | ≥ 4,5:1  | Aprovado                 |
| E19 † | Escuro | Primary #A982E8 como texto / surface                      | `#A982E8`  | `#342E42`  |  4,36:1 | ≥ 4,5:1  | **Só texto grande / UI** |
| E20 † | Escuro | Primary #A982E8 como texto / surface elevated             | `#A982E8`  | `#3A344A`  |  3,98:1 | ≥ 4,5:1  | **Só texto grande / UI** |
| E21   | Escuro | Link (primary-text) / background                          | `#C6ACFA`  | `#292638`  |  7,48:1 | ≥ 4,5:1  | Aprovado                 |
| E22   | Escuro | Link (primary-text) / surface                             | `#C6ACFA`  | `#342E42`  |  6,61:1 | ≥ 4,5:1  | Aprovado                 |
| E23   | Escuro | Link (primary-text) / surface elevated                    | `#C6ACFA`  | `#3A344A`  |  6,04:1 | ≥ 4,5:1  | Aprovado                 |
| E24   | Escuro | Link (primary-text) / surface selected                    | `#C6ACFA`  | `#4A3D66`  |  4,97:1 | ≥ 4,5:1  | Aprovado                 |
| E25   | Escuro | Primary como componente / surface                         | `#A982E8`  | `#342E42`  |  4,36:1 | ≥ 3:1    | Aprovado                 |
| E26   | Escuro | Foco (Lavender 300) / background                          | `#C6ACFA`  | `#292638`  |  7,48:1 | ≥ 3:1    | Aprovado                 |
| E27   | Escuro | Foco (Lavender 300) / surface elevated                    | `#C6ACFA`  | `#3A344A`  |  6,04:1 | ≥ 3:1    | Aprovado                 |
| E28   | Escuro | Border (divisória) / surface                              | `#51465F`  | `#342E42`  |  1,48:1 | ---      | Decorativo               |
| E29   | Escuro | Border strong (campo) / background                        | `#958AA6`  | `#292638`  |  4,52:1 | ≥ 3:1    | Aprovado                 |
| E30   | Escuro | Border strong (campo) / surface                           | `#958AA6`  | `#342E42`  |  4,00:1 | ≥ 3:1    | Aprovado                 |
| E31   | Escuro | Border strong (campo) / surface elevated                  | `#958AA6`  | `#3A344A`  |  3,65:1 | ≥ 3:1    | Aprovado                 |
| E32   | Escuro | Border strong (campo) / surface muted (novo)              | `#958AA6`  | `#3F3850`  |  3,41:1 | ≥ 3:1    | Aprovado                 |
| E33 † | Escuro | Texto muted / #51465F (valor anterior de surface muted)   | `#B3A9C2`  | `#51465F`  |  3,92:1 | ≥ 4,5:1  | **Só texto grande / UI** |
| E34 † | Escuro | Link / #51465F (valor anterior de surface muted)          | `#C6ACFA`  | `#51465F`  |  4,47:1 | ≥ 4,5:1  | **Só texto grande / UI** |
| E35 † | Escuro | Border strong / #51465F (valor anterior de surface muted) | `#958AA6`  | `#51465F`  |  2,70:1 | ≥ 3:1    | **Reprovado**            |
| E36   | Escuro | Success: texto / fundo pastel                             | `#245C48`  | `#BDEBD9`  |  5,95:1 | ≥ 4,5:1  | Aprovado                 |
| E37   | Escuro | Warning: texto / fundo pastel                             | `#70520A`  | `#FFE69A`  |  5,87:1 | ≥ 4,5:1  | Aprovado                 |
| E38   | Escuro | Danger: texto / fundo pastel                              | `#8B304B`  | `#FFC9D6`  |  5,56:1 | ≥ 4,5:1  | Aprovado                 |
| E39   | Escuro | Info: texto / fundo pastel                                | `#24527A`  | `#BFE2FF`  |  6,06:1 | ≥ 4,5:1  | Aprovado                 |
| E40   | Escuro | Success (Menta) texto/ícone / surface                     | `#BDEBD9`  | `#342E42`  |  9,93:1 | ≥ 4,5:1  | Aprovado                 |
| E41   | Escuro | Warning (Amarelo) texto/ícone / surface                   | `#FFE69A`  | `#342E42`  | 10,55:1 | ≥ 4,5:1  | Aprovado                 |
| E42   | Escuro | Danger (Rosa) texto/ícone / surface                       | `#FFC9D6`  | `#342E42`  |  9,02:1 | ≥ 4,5:1  | Aprovado                 |
| E43   | Escuro | Info (Azul) texto/ícone / surface                         | `#BFE2FF`  | `#342E42`  |  9,62:1 | ≥ 4,5:1  | Aprovado                 |
| E44   | Escuro | Tag: texto escuro / Lavender 200                          | `#292638`  | `#DCCBFF`  |  9,82:1 | ≥ 4,5:1  | Aprovado                 |
| E45   | Escuro | Disabled: texto / fundo                                   | `#8F84A0`  | `#3A344A`  |  3,38:1 | isento   | Isento                   |

### 2.10 Registro de alterações da revisão de cores

Nenhum valor aprovado anteriormente foi substituído na paleta de marca,
nos pastéis ou nos pares funcionais. As mudanças se limitam a novos
tokens e a uma separação de função no tema escuro.

| #   | Token                                  | Antes                                  | Depois                | Tipo         | Justificativa                                                                                                                                                                                |
| --- | -------------------------------------- | -------------------------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Lavender 600                           | ---                                    | `#6E48AF`             | Novo         | Lavender 500 reprova como texto sobre Lavender 50 (4,34:1) e 100 (3,88:1). O 600 cobre texto/links (≥ 5,34:1) e o hover do primário (texto branco 6,54:1), sem mudar a cor de ação principal |
| 2   | Primary text (claro)                   | Implícito: Lavender 500                | `#6E48AF`             | Novo token   | Regra única para texto lavanda, válida em todas as superfícies claras                                                                                                                        |
| 3   | Primary hover / active (claro)         | Não definidos                          | `#6E48AF` / `#56377F` | Novos tokens | Escurecimento progressivo coerente com a escala; texto branco ≥ 6,54:1                                                                                                                       |
| 4   | Text secondary (claro)                 | Candidato `#6B6675` (análise anterior) | `#6B6675`             | Formalizado  | ≥ 4,53:1 em todas as superfícies claras                                                                                                                                                      |
| 5   | Text muted (claro)                     | ---                                    | `#77717F`             | Novo         | Terceiro nível de ênfase; restrito a `bg`/`surface` (reprova em `surface-muted`, 4,32:1)                                                                                                     |
| 6   | Border strong (claro)                  | ---                                    | `#8A8394`             | Novo         | `#EDE8E1` tem 1,22:1 e não identifica limites de campos (WCAG 1.4.11). `#EDE8E1` permanece para divisórias                                                                                   |
| 7   | Disabled bg / text (claro)             | ---                                    | `#EDE8E1` / `#8A8394` | Novos        | Estado explícito em vez de opacidade                                                                                                                                                         |
| 8   | Surface muted (escuro)                 | `#51465F`                              | `#3F3850`             | **Alterado** | `#51465F` era superfície e borda ao mesmo tempo; como superfície, reprovou Text muted (3,92:1), Primary text (4,47:1) e Border strong (2,70:1). Continua como Border                         |
| 9   | Surface hover / selected (escuro)      | ---                                    | `#3F3850` / `#4A3D66` | Novos        | Equivalentes funcionais de `surface-hover` e Lavender 100                                                                                                                                    |
| 10  | Text muted (escuro)                    | ---                                    | `#B3A9C2`             | Novo         | ≥ 4,95:1 em bg, surface, elevated e muted                                                                                                                                                    |
| 11  | Text on primary (escuro)               | Não definido                           | `#292638`             | Novo token   | Texto branco sobre `#A982E8` reprova (2,98:1); texto escuro passa (4,93:1)                                                                                                                   |
| 12  | Primary text (escuro)                  | Implícito: `#A982E8`                   | `#C6ACFA`             | Novo token   | `#A982E8` como texto reprova em Surface (4,36:1) e Elevated (3,98:1); Lavender 300 passa em todas (≥ 4,97:1)                                                                                 |
| 13  | Primary hover / active (escuro)        | Não definidos                          | `#C6ACFA` / `#DCCBFF` | Novos tokens | No escuro o hover clareia; texto `#292638` ≥ 7,48:1                                                                                                                                          |
| 14  | Focus (escuro)                         | Não definido                           | `#C6ACFA`             | Novo token   | ≥ 6,04:1 sobre superfícies escuras                                                                                                                                                           |
| 15  | Border strong (escuro)                 | ---                                    | `#958AA6`             | Novo         | `#51465F` tem 1,48:1 sobre Surface                                                                                                                                                           |
| 16  | Disabled bg / text (escuro)            | ---                                    | `#3A344A` / `#8F84A0` | Novos        | Idem ao claro                                                                                                                                                                                |
| 17  | Funcionais `*-fg` (escuro)             | ---                                    | Pastéis de §2.2       | Novo uso     | Texto/ícone de estado direto sobre superfície escura (≥ 9,02:1), sem criar novos hex                                                                                                         |
| 18  | Lavender 200/300/400 e pastéis (claro) | Uso livre                              | Restritos             | Regra de uso | 400 = 2,98:1 e 300 = 1,97:1 sobre branco: somente decoração no claro                                                                                                                         |

### 2.11 Paleta do editor

Atende ao RF-068 e à decisão A15: cores de texto e destaques do editor
vêm de uma paleta fixa, sem seletor livre. O artigo guarda **apenas o
nome** da cor (`lavanda`, `rosa` …); o valor vem do tema ativo. Status
de todos os valores: **Preliminar** (calculado; validação visual
pendente).

| Nome      | Texto · claro | Texto · escuro | Destaque · claro | Destaque · escuro |
| --------- | ------------- | -------------- | ---------------- | ----------------- |
| `lavanda` | `#56377F`     | `#DCCBFF`      | `#DCCBFF`        | `#4A3D66`         |
| `rosa`    | `#9B2F55`     | `#FFC9D6`      | `#FFC9D6`        | `#5E2E44`         |
| `amarelo` | `#735500`     | `#FFE69A`      | `#FFE69A`        | `#584616`         |
| `menta`   | `#1D6549`     | `#BDEBD9`      | `#BDEBD9`        | `#1F4A3D`         |
| `azul`    | `#1F5A8A`     | `#BFE2FF`      | `#BFE2FF`        | `#1E3E5C`         |
| `pessego` | `#8F451A`     | `#FFCBAF`      | `#FFCBAF`        | `#5E3A28`         |

Texto sem cor dentro de um destaque usa `#292638` no claro e `#FFFFFF`
no escuro.

**Contraste calculado** (mínimo de cada grupo):

| Par                                                 |  Claro | Escuro |
| --------------------------------------------------- | -----: | -----: |
| Texto colorido / fundo do artigo (`bg` e `surface`) | 6,81:1 | 8,68:1 |
| Texto sem cor / destaque                            | 9,82:1 | 9,12:1 |
| Texto colorido / destaque (todas as 36 combinações) | 4,62:1 | 6,09:1 |

Como todas as combinações passam, texto colorido e destaque podem ser
usados juntos sem restrição.

Decisões da paleta:

- **Destaque claro = pastéis da marca.** Tons mais claros passavam com
  mais folga, mas ficavam quase invisíveis sobre `bg` (1,1:1). As cores
  de texto do claro foram escurecidas o suficiente para passar sobre
  todos os pastéis.
- **Destaque escuro = tons profundos com texto branco**, e não pastéis,
  para evitar áreas claras grandes no tema escuro (§2.7).
- **Lavanda é diferente da cor de link** (Lavender 700 no claro, 200 no
  escuro; links usam `primary-text`). A diferença entre os dois é
  pequena (1,3–1,4:1), por isso links no corpo do artigo são sempre
  sublinhados (§8.3). Como o editor não oferece sublinhado (A15),
  sublinhado no artigo significa sempre link.
- Os nomes são independentes dos tokens funcionais: mudar `danger-fg`
  não altera a cor `rosa` dos artigos já publicados.

A verificação desses pares é automatizada nos testes do frontend e deve
ser refeita a cada ajuste de valor.

## 3. Tipografia

### 3.1 Famílias

- **Manrope:** títulos principais e subtítulos.
- **Nunito Sans:** corpo dos artigos, interface, botões, formulários e
  metadados.

Ambas são fontes sem serifa.

### 3.2 Pesos previstos

Família Pesos

---

Manrope 500, 600, 700, 800
Nunito Sans 400, 500, 600, 700

A hierarquia deve ser construída principalmente com tamanho, peso,
espaçamento e comprimento de linha. Evitar usar muitos pesos sem
necessidade.

## 4. Formas, superfícies e profundidade

### 4.1 Formas

- Linguagem geral arredondada.
- Botões, campos, cards, avatares e modais devem compartilhar uma
  escala coerente de raios.
- Elementos em formato pill são reservados principalmente para tags,
  categorias e itens de navegação selecionados.

Os valores exatos de `border-radius` ainda devem ser definidos como
tokens durante a implementação.

### 4.2 Cards de artigos

- Superfície branca no tema claro.
- Pequenos blocos gráficos coloridos e detalhes orgânicos.
- Evitar cards inteiramente preenchidos com cores fortes.
- Sombra suave e neutra.
- Hover com elevação/sombra um pouco mais perceptível, sem movimento
  exagerado.

### 4.3 Sombras

Escala conceitual inicial:

- `shadow-sm`
- `shadow-md`
- `shadow-lg`
- `shadow-hover`

Os valores concretos devem ser definidos e testados no tema claro e
escuro. Sombras não devem ser o único recurso para indicar separação ou
foco.

## 5. Ilustrações e elementos gráficos

### 5.1 Estilo

- **Doodles:** rabiscos, estrelas, traços manuais e formas orgânicas.
- **Execução equilibrada:** desenhos simples, com personalidade e
  pequenos detalhes coloridos.
- Usar especialmente em estados vazios, onboarding, mensagens e áreas
  de destaque.
- Ilustrações são complementares e não devem competir com o conteúdo
  editorial.

### 5.2 Estados vazios

Cada contexto deve ter mensagem, elemento visual e ação adequados.
Exemplos:

- Busca sem resultados: orientar a tentar outros termos.
- Nenhum artigo publicado: oferecer caminhos para explorar ou
  publicar.
- Nenhum favorito: incentivar a salvar artigos.
- Lista ainda vazia: explicar o que aparecerá ali e como começar.

Evitar repetir a mesma ilustração e mensagem em todos os cenários.

### 5.3 Mascote

O mascote é a folha de papel com marcador do kit vetorial chapado
(`design/mascote/`). Proporções, paleta, contornos e limites de animação
estão em `design/mascote/GUIA-DE-IDENTIDADE.md`; a paleta dele é a
própria paleta da marca (§2.1 e §2.2). As versões com degradês e a
versão traçada não são usadas na interface.

**Papel:** acolher em momentos de espera, vazio ou conquista. Nunca
compete com o texto, nunca carrega informação sozinho.

| Contexto                                                   | Usa o mascote?     | Pose / expressão                  |
| ---------------------------------------------------------- | ------------------ | --------------------------------- |
| Busca sem resultados                                       | Sim                | `pose-lupa`                       |
| Nenhum favorito                                            | Sim                | `pose-segurando-folha`            |
| Nenhum rascunho ou artigo                                  | Sim                | `pose-escrevendo`                 |
| Notificações em dia                                        | Sim                | `pose-dormindo`                   |
| Cadastro, login e verificação de e-mail                    | Sim, pequeno       | `pose-acenando`                   |
| Artigo aprovado (notificação, e-mail)                      | Sim                | `pose-comemorando`                |
| Artigo aguardando aprovação                                | Sim, discreto      | `pose-lendo`                      |
| Erro 404                                                   | Sim                | `pose-lupa` + `expressao-confuso` |
| Erro 500                                                   | Sim                | `expressao-cansado`               |
| Manutenção                                                 | Sim                | `pose-dormindo`                   |
| Favicon e ícones menores que 24 px                         | Só o marcador roxo | ---                               |
| Página de leitura, editor, painel administrativo           | **Não**            | ---                               |
| Rejeição, despublicação, suspensão, banimento, contestação | **Não**            | ---                               |
| Foto padrão de usuário                                     | **Não** (ver §6.2) | ---                               |

Os estados vazios de §5.2 continuam contextuais: cada um com mensagem e
ação próprias, e a pose da tabela como apoio visual.

**Por que não em rejeições e penalidades:** a mensagem precisa ser
respeitosa e dizer o próximo passo (`PRODUCT.md`, Tone). Um mascote
triste ou comemorando nesses momentos soa infantil ou irônico.

**Regras de uso**

- Sempre decorativo: `alt=""` e `aria-hidden="true"`. O texto ao lado
  comunica a mensagem sem depender da imagem.
- Sem texto dentro da arte, para a interface funcionar igual em PT e EN.
- Tamanho: corpo inteiro a partir de 96 px; entre 24 e 96 px, só o
  avatar (`mascote-avatar.svg`); abaixo de 24 px, só o marcador.
- Respiro mínimo de ½ largura de olho ao redor.
- Animação apenas onde acrescenta algo (estado vazio, artigo aprovado),
  com o rig próprio do kit, sem bibliotecas externas. Com
  `prefers-reduced-motion`, a pose fica estática.
- E-mails usam PNG, porque clientes de e-mail não exibem SVG.

**Tema escuro:** o contorno `#56377F` tem cerca de 1,6:1 sobre `bg`
escuro. Como o mascote é decorativo, não há mínimo exigido, mas a
leitura da silhueta precisa ser verificada visualmente (§12.2).

## 6. Ícones e avatares

### 6.1 Ícones

- Biblioteca escolhida: **Lucide Icons**.
- Outline como estilo padrão.
- Filled para estados ativos, favoritos selecionados e itens marcados.
- Tamanhos previstos: 16 px, 20 px e 24 px.
- Espessura de traço de referência: 2 px.

Ícones informativos devem ter rótulos acessíveis quando seu significado
não for evidente. Não usar apenas a cor para distinguir estados.

### 6.2 Avatares

- Fotos em formato quadrado com cantos arredondados.
- Manter proporção e enquadramento consistentes.
- Sem foto: iniciais do nome sobre fundo pastel (§2.2), com texto
  `#292638` (≥ 9,8:1). A cor do fundo é derivada do usuário, para
  ser estável entre páginas.
- O mascote nunca é usado como foto de usuário: um perfil sem foto
  pareceria um perfil oficial da plataforma, e o autor anonimizado
  seria confundido com ele.

## 7. Componentes e padrões de interface

### 7.1 Botões

Sistema combinado:

- **Primário:** lavanda mais intensa, para a ação principal.
- **Secundário:** tons pastéis ou superfície neutra, com menor ênfase.
- **Terciário:** estilo de texto ou sem fundo, para ações de menor
  prioridade.

Comportamento: - Mudança suave de cor no hover. - Pequena elevação ou
alteração de sombra. - Feedback de pressionamento com leve redução de
escala. - Estados de carregamento, sucesso e desabilitado. - Respeitar
`prefers-reduced-motion`.

### 7.2 Tags, categorias e status

Tratamento misto:

- **Tags e categorias:** pills coloridas, com fundos pastéis e texto
  de contraste adequado.
- **Metadados e status:** etiquetas retangulares com cantos levemente
  arredondados.
- **Estados funcionais:** usar cores semânticas próprias e texto/ícone
  que explicitem o significado.

### 7.3 Formulários

- Fundo branco ou neutro.
- Bordas discretas no estado normal, usando `--color-border-strong`
  (≥ 3:1 com a superfície, exigido para identificar o limite do
  campo). `--color-border` é apenas decorativo e não serve para campos.
- Destaque em lavanda no foco (`--color-focus`, ver §2.8).
- Estados de erro e sucesso com cores semânticas (`--color-*-fg`),
  sempre acompanhadas de ícone e texto.
- Placeholder em `--color-text-muted`.
- Cantos arredondados.
- Rótulos persistentes; placeholder não deve substituir label.
- Mensagens de validação próximas ao campo correspondente.

### 7.4 Editor de artigos

O editor terá identidade própria, mantendo consistência com o restante
do sistema:

- Área ampla e limpa, com foco na escrita.
- Barra de ferramentas acessível.
- Detalhes visuais sutis da identidade Playful & Colorful.
- Boa legibilidade e espaçamento para textos longos.
- Feedback de salvamento e erros próximo ao contexto da edição.
- Evitar elementos decorativos que distraiam durante a escrita.

### 7.5 Modais e diálogos

- Estrutura minimalista, cantos arredondados e pequenos detalhes da
  identidade.
- Título e descrição objetivos.
- Ação principal claramente destacada.
- Ação destrutiva identificada de forma inequívoca.
- Cancelamento sempre disponível.
- Fechar com `Esc` quando apropriado.
- Gerenciar foco: manter o foco dentro do modal enquanto aberto e
  devolvê-lo ao elemento de origem ao fechar.

### 7.6 Feedback de ações

Combinação de feedbacks:

- **Toasts:** confirmações rápidas, como favoritar ou copiar link.
- **Inline:** erros de validação, falhas em formulários e problemas
  que exigem correção.
- **Ações destrutivas:** confirmação antes de excluir conteúdos ou
  executar operações irreversíveis.
- Mensagens devem ser anunciadas adequadamente por tecnologias
  assistivas.

### 7.7 Carregamento

- **Skeletons:** cards, listagens, perfis e páginas de conteúdo.
- **Spinners:** ações pontuais, como salvar, publicar e favoritar.
- Botões em carregamento devem manter suas dimensões e evitar cliques
  duplicados.
- Não adicionar atrasos artificiais para exibir animações.

### 7.8 Notificações

- Ícone de sino com contador de não lidas.
- Lista limpa e organizada por data.
- Ícones por categoria.
- Destaque discreto para notificações novas.
- Marcar individualmente como lida ou marcar todas como lidas.

## 8. Padrões de páginas e navegação

### 8.1 Navegação contextual

O cabeçalho se adapta à finalidade da página:

- **Página inicial e listagens:** navegação mais presente.
- **Leitura:** cabeçalho discreto, priorizando o artigo.
- **Editor:** navegação simplificada para favorecer a concentração.
- **Administração:** acesso claro às ferramentas de gerenciamento.

### 8.2 Navegação principal

- Fundo branco ou off-white.
- Links inativos sem fundo permanente.
- Item ativo com Lavender 100 (`--color-surface-selected`) e texto
  `--color-text-on-selected`, além de ícone filled e `aria-current`.
- Hover suave (`--color-surface-hover`).
- Tipografia Nunito Sans.
- Ações destacadas em lavanda intensa.
- Elementos arredondados e estilo pill quando apropriado.

### 8.3 Página de leitura

Estilo **editorial moderno**:

- Coluna central com largura confortável para textos longos.
- Hierarquia tipográfica expressiva.
- Título e informações do autor organizados.
- Capa em destaque.
- Pequenos detalhes coloridos sem competir com o conteúdo.
- Espaçamento generoso entre parágrafos e seções.
- Links no corpo do artigo são sempre sublinhados, além da cor
  `primary-text`. Isso os distingue do texto colorido da paleta do
  editor (§2.11) e atende ao WCAG 1.4.1.

### 8.4 Listagens e cards

- Três cards por linha em desktop.
- Dois em tablet.
- Um em mobile.
- Em telas muito largas, manter três colunas e limitar a largura do
  conteúdo.
- Cards brancos com detalhes gráficos coloridos sutis.
- Capas em proporção padrão 16:9, usando `object-fit: cover`.
- Não exigir que a imagem enviada tenha exatamente 16:9; fazer
  enquadramento responsivo.
- Quando não houver capa, usar fallback em lavanda ou outra cor
  pastel.

### 8.5 Paginação

Paginação tradicional:

- Números de páginas.
- Botões anterior e próximo.
- Página atual destacada em lavanda.
- Estados desabilitados identificáveis.
- Preservar busca e filtros ao trocar de página.
- URLs que permitam acessar e compartilhar uma página específica.

### 8.6 Busca

Busca híbrida:

- Busca completa ao pressionar Enter ou acionar o botão.
- Indicador de carregamento.
- Estado vazio quando não houver resultados.
- Ação para limpar a pesquisa.
- Preservar termos na URL.
- **Depois do MVP:** sugestões dinâmicas durante a digitação, com
  debounce. Não estão nos requisitos e multiplicariam as consultas de
  busca.

### 8.7 Filtros

- Botão "Filtros" abre painel expansível.
- Listagem permanece limpa quando o painel está fechado.
- Permitir combinar filtros.
- Oferecer ação para limpar todos.
- Exibir filtros ativos como pills.
- Preservar filtros na URL.
- No mobile, o painel pode abrir como bottom sheet.

### 8.8 Navegação mobile

Modelo híbrido:

- Barra inferior para as áreas principais.
- Menu adicional para opções secundárias.
- Ícones outline como padrão e filled para itens ativos.
- Indicador da página selecionada em lavanda.
- Reduzir ou ocultar a barra em contextos como leitura e edição,
  quando ela prejudicar o espaço útil.

### 8.9 Perfil do autor

Estilo editorial:

- Cabeçalho personalizado.
- Avatar quadrado com cantos arredondados.
- Nome e biografia.
- Detalhes visuais sutis.
- Artigos publicados organizados em cards.
- **Depois do MVP:** destacar artigos relevantes no perfil (não está
  nos requisitos).
- Priorizar a produção do autor em vez de métricas sociais.

### 8.10 Painel pessoal

- Área do autor: "Meus artigos" (seções do RF-112 ao RF-115),
  notificações e atalhos para escrever.
- O estado de cada artigo fica sempre claro (rascunho, aguardando
  aprovação, publicado, rejeitado).
- Sem números em destaque, gráficos ou métricas de leitura:
  `PRODUCT.md` exclui analytics para autores e contadores em destaque.
- Ícones pequenos e cores pastéis como apoio.

### 8.11 Configurações

Organização por categorias, com navegação lateral em telas maiores:

- Conta e perfil.
- Aparência.
- Idioma.
- Notificações.
- Privacidade e segurança.

No mobile, adaptar a navegação para um seletor ou menu compacto.

### 8.12 Área administrativa

Mesma identidade visual, com menos decoração:

- Lavanda como cor de destaque.
- Tabelas e listas com hierarquia clara.
- Ações administrativas bem identificadas.
- Filtros e indicadores organizados.
- Confirmações cuidadosas para ações destrutivas.

## 9. Movimento e transições

### 9.1 Intensidade

Animações moderadas: a interface deve parecer responsiva e viva, sem
movimento excessivo.

### 9.2 Tokens preliminares

Token Valor inicial

---

`duration-fast` `150ms`
`duration-normal` `250ms`
`duration-slow` `350ms`
`ease-standard` `ease-in-out`
`ease-emphasized` `cubic-bezier(0.2, 0.8, 0.2, 1)`

### 9.3 Aplicações

- Cards: elevação ou sombra leve no hover.
- Botões: mudança de cor e elevação; leve escala ao pressionar.
- Modais: fade e pequeno deslocamento.
- Menus e notificações: transições suaves.
- Favoritos: feedback visual curto e claro.

Respeitar `prefers-reduced-motion`, removendo ou reduzindo movimentos
não essenciais.

## 10. Densidade visual

Densidade escolhida: **confortável**.

- Espaço suficiente entre elementos para facilitar a leitura.
- Cards com padding confortável.
- Boa distância entre seções.
- Listagens informativas sem ficarem apertadas.
- Uso eficiente da tela em desktop e mobile.

A escala exata de espaçamento ainda deve ser definida em tokens durante
a implementação.

## 11. Responsividade

Adotar abordagem mobile-first:

- Uma coluna de cards em mobile, duas em tablet e três em desktop.
- Navegação adaptada ao contexto e ao tamanho da tela.
- Filtros em painel apropriado para toque no mobile.
- Formulários e controles com áreas de interação confortáveis.
- Leitura com largura de linha adequada em diferentes telas.
- Evitar que barras fixas cubram conteúdo ou controles.

Os breakpoints exatos ainda precisam ser definidos na implementação.

## 12. Acessibilidade

Meta do projeto: **WCAG 2.2 nível AA**.

Requisitos de implementação:

- Validar contraste de texto, ícones informativos, bordas essenciais,
  foco e estados de componentes.
- Não usar cor como único meio de transmitir informação.
- Garantir navegação completa por teclado.
- Manter indicadores de foco visíveis.
- Usar labels associados aos campos e mensagens de erro claras.
- Dar nomes acessíveis a controles com ícones.
- Gerenciar foco corretamente em modais e menus.
- Anunciar feedbacks dinâmicos por tecnologias assistivas.
- Respeitar `prefers-reduced-motion`.
- Garantir alvos de interação adequados, especialmente em telas
  sensíveis ao toque.

### 12.1 Situação da paleta

As razões de contraste da seção 2 foram **calculadas** (§2.9). Cálculo
não equivale a conformidade: o projeto **não** pode ser declarado
conforme à WCAG 2.2 AA antes de uma avaliação completa, com testes
manuais, ferramentas automatizadas e tecnologias assistivas, em
componentes reais e nos dois temas. Valores marcados como
**Preliminar** dependem de validação visual.

### 12.2 Pendências de verificação

| Área                     | O que verificar                                                                                                                                                                                        | Critérios WCAG relacionados                  | Situação                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| Foco de teclado          | Anel visível em todos os componentes interativos, nos dois temas, incluindo sobre `surface-selected`, cards e botões primários; foco não encoberto por cabeçalho fixo, barra inferior mobile ou toasts | 2.4.7, 2.4.11, 1.4.11                        | Contraste do anel calculado; comportamento pendente          |
| Hover e pressed          | Texto mantém ≥ 4,5:1 em todos os estados; hover não é o único indicador de interatividade; conteúdo exibido em hover pode ser dispensado e permanece visível                                           | 1.4.3, 1.4.13                                | Contraste dos botões calculado; demais componentes pendentes |
| Estados desabilitados    | Controles desabilitados identificáveis; motivo da indisponibilidade comunicado quando relevante; `disabled`/`aria-disabled` corretos                                                                   | 4.1.2                                        | Tokens preliminares; pendente                                |
| Bordas e divisórias      | Confirmar que nenhum componente depende de `--color-border` para ser identificado (cards clicáveis, tabelas administrativas, separação de seções)                                                      | 1.4.11                                       | Pendente                                                     |
| Ícones funcionais        | Ícones informativos com ≥ 3:1 e nome acessível; ícones decorativos com `aria-hidden`; estados filled/outline não dependem só de cor                                                                    | 1.1.1, 1.4.1, 1.4.11                         | Pendente                                                     |
| Campos de formulário     | Bordas `border-strong`, rótulos associados, erros com `aria-invalid` e `aria-describedby`, mensagens anunciadas, autocomplete                                                                          | 1.3.1, 1.4.11, 3.3.1, 3.3.2, 3.3.7           | Pendente                                                     |
| Modais                   | Foco preso no modal, retorno ao elemento de origem, `Esc`, título associado (`aria-labelledby`), ação destrutiva inequívoca                                                                            | 2.1.2, 2.4.3, 4.1.2                          | Pendente                                                     |
| Notificações e toasts    | Anúncio via `aria-live` sem roubar foco; tempo suficiente ou dispensa manual; contador do sino com nome acessível                                                                                      | 4.1.3, 2.2.1                                 | Pendente                                                     |
| Contraste no tema escuro | Validar visualmente os 13 tokens escuros preliminares; testar pastéis como foreground em textos longos; checar halação de `#FFFFFF` sobre `#292638` em leitura longa                                   | 1.4.3, 1.4.11                                | Calculado; validação visual pendente                         |
| Navegação por teclado    | Ordem lógica, sem armadilhas, atalhos de busca, paginação, filtros (painel e bottom sheet), editor e barra de ferramentas                                                                              | 2.1.1, 2.4.3, 2.4.1                          | Pendente                                                     |
| `prefers-reduced-motion` | Remover/reduzir elevação, escala ao pressionar, deslocamento de modais e animação de favoritos                                                                                                         | 2.3.3 (AAA, adotado como boa prática), 2.2.2 | Pendente                                                     |
| Alvos de toque           | ≥ 24 × 24 px CSS (AA); recomendado 44 × 44 px em mobile                                                                                                                                                | 2.5.8                                        | Pendente                                                     |
| Conteúdo sobre imagens   | Texto sobre capas de artigos e fallbacks pastéis                                                                                                                                                       | 1.4.3                                        | Pendente --- não coberto pela auditoria de paleta            |
| Paleta do editor         | Validar visualmente os 12 valores e as 36 combinações de §2.11 nos dois temas, com texto longo                                                                                                         | 1.4.3                                        | Calculado; validação visual pendente                         |
| Mascote no tema escuro   | Silhueta legível sobre `bg` e `surface` escuros                                                                                                                                                        | --- (decorativo)                             | Pendente                                                     |

## 13. Tokens a formalizar na implementação

A implementação deverá transformar as decisões em tokens centralizados,
evitando valores dispersos nos componentes.

Grupos necessários:

- **Cores:** marca, neutros, superfícies, texto, bordas, estados e
  acentos decorativos. **Proposta inicial documentada em §2.6**
  (tokens semânticos e variáveis CSS por tema).
- **Tipografia:** famílias, tamanhos, pesos, alturas de linha e
  espaçamento entre letras.
- **Espaçamento:** escala consistente para padding, gap e margens.
- **Raios:** campos, botões, cards, modais, avatares e pills.
- **Sombras:** níveis de elevação e hover.
- **Movimento:** duração e curvas de easing.
- **Breakpoints:** pontos de adaptação responsiva.
- **Camadas:** níveis de sobreposição para menus, popovers, drawers e
  modais.

## 14. Pendências antes de considerar o sistema pronto

1.  ~~Calcular os pares de cores para WCAG 2.2 AA~~ --- feito em §2.9.
    Pendente: validar visualmente os tokens **Preliminares** em telas
    reais, nos dois temas, e repetir o cálculo após qualquer ajuste.
2.  Definir os valores finais dos tokens de tipografia, espaçamento,
    raios, sombras e breakpoints.
3.  Testar os componentes em telas reais e com conteúdo editorial longo.
4.  Verificar navegação por teclado e leitores de tela.
5.  Verificar o comportamento de `prefers-reduced-motion`.
6.  Documentar variantes e estados de cada componente na implementação.
7.  Executar as verificações listadas em §12.2.
8.  ~~Definir a paleta de visualização de dados do painel pessoal~~ ---
    fora do MVP: o painel pessoal não tem gráficos (§8.10).

---

## Resumo das decisões

---

Área Decisão

---

Direção visual Playful & Colorful

Cor de assinatura Lavender (escala 50--700, com
600 adicionado para texto e hover)

Tokens de cor Semânticos, independentes por tema
(§2.6)

Botões Primários intensos, secundários
pastéis e terciários discretos

Tipografia Manrope + Nunito Sans

Formas Arredondadas

Animações Moderadas

Fundo claro Off-white, com cards brancos

Cores secundárias Sistema híbrido: funcionais e
decorativas

Cards de artigos Brancos com detalhes gráficos
coloridos

Capas Proporção 16:9

Grid 3 desktop, 2 tablet, 1 mobile

Sombras Suaves

Navegação Arredondada, com elementos pill

Ícones Lucide, outline padrão e filled em
estados ativos

Tema escuro Escuro colorido

Ilustrações Doodles equilibrados

Mascote Kit vetorial chapado; estados
vazios, boas-vindas e conquistas
(§5.3)

Paleta do editor 6 cores por nome, texto e
destaque por tema (§2.11)

Avatares Quadrados com cantos
arredondados; iniciais sem foto

Tags e status Pills para tags; etiquetas para
metadados/status

Formulários Neutros, com foco em lavanda

Editor Área ampla e limpa, com barra de
ferramentas própria

Leitura Editorial moderna

Cabeçalho Contextual

Estados vazios Contextuais

Feedback Toasts + inline

Modais Equilibrados e acessíveis

Paginação Tradicional

Busca Ao enviar; sugestões depois do
MVP

Filtros Painel expansível

Navegação mobile Barra inferior + menu adicional

Botões Interativos, com movimento moderado

Carregamento Skeletons + spinners

Notificações Lista limpa, ícones por categoria e
contador

Perfil Editorial

Painel pessoal Estado dos artigos, sem métricas

Configurações Categorias com navegação lateral

Administração Híbrida, mais funcional e menos
decorativa

Densidade Confortável

Acessibilidade Meta WCAG 2.2 AA; contraste da
paleta calculado, conformidade
ainda não avaliada
-----------------------------------------------------------------------
