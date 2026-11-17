# Kit do mascote — vetorial, modular e pronto para animação

> **Neste repositório:** os SVGs usados pela aplicação ficam em `resources/images/mascote/` (principal, avatar, `expressoes/` e `poses/`). Aqui em `design/mascote/` ficam o guia, as pranchas (`svg/`), o rig para web (`web/`), a base para o Rive (`rive/`) e os scripts que regeneram tudo (`fonte/`). Os PNGs não estão versionados; regenere-os com `fonte/build.py` quando forem necessários (por exemplo, para e-mails). Onde e como usar o mascote na interface está em `docs/DESIGN.md`, §5.3.

Todo o kit é vetorial (SVG puro). Não há imagens raster, `clipPath`, máscaras nem filtros, e por isso ele exporta bem para Figma, Illustrator, Inkscape e Rive.

## Conteúdo
| Pasta / arquivo | O que é |
|---|---|
| `svg/mascote-principal.svg` | Mascote principal (pose padrão, expressão Feliz, com lápis) |
| `svg/mascote-rig-camadas.svg` | **Arquivo mestre em camadas**: todas as bocas, estados de olho, bochechas, acessórios e efeitos, com as variantes ocultas (`display:none`). Os grupos têm nomes legíveis (`inkscape:label`) e `data-pivot` |
| `svg/mascote-avatar.svg` | Versão compacta (só cabeça) para tamanhos pequenos, de 24 a 96 px |
| `svg/expressoes/` | As 10 expressões (corpo inteiro) + `biblioteca-expressoes.svg` (prancha) |
| `svg/poses/` | As 10 poses |
| `svg/componentes/biblioteca-componentes.svg` | Bocas, olhos, sobrancelhas, acessórios e efeitos soltos para reaproveitar |
| `png/` | PNGs transparentes: principal (128 a 2048 px), avatar (32 a 512 px), poses e expressões (512 e 1024 px) |
| `web/` | `mascote-rig.svg` + `mascote-rig.js` + `mascote-dados.json`: as 10 animações rodando no navegador, sem dependências. `demo.html` mostra tudo funcionando |
| `rive/` | Base limpa para importar no Rive, partes trocáveis e o roteiro de montagem (`LEIA-RIVE.md`) |
| `GUIA-DE-IDENTIDADE.md` | Proporções, cores, contornos e regras de uso |

## Convenções
- **Esquerdo/direito = do ponto de vista do personagem** (o padrão em animação). `braco-R` (direito) aparece à **esquerda** da tela.
- Cada articulação é um `<g>` com `transform="translate(pivô) rotate(θ)"`. A origem do grupo é o pivô, e o atributo `data-pivot` informa o pivô no espaço do grupo pai.
- Arte de corpo e rosto em coordenadas absolutas dentro de um grupo deslocado, para facilitar a edição.

## Pivôs (canvas 400 × 460)
| Grupo | Pivô | Uso |
|---|---|---|
| `rig` | 0,0 | Pulo e deslocamento geral |
| `corpo` | 200,380 (base) | Inclinação, squash/stretch (máx. ±4%), respiração |
| `rosto` | 204,215 | “Virar a cabeça”: desloque 2–6 px em x e incline levemente |
| `marcador` | 158,70 (topo) | Balanço secundário |
| `olho-R` / `olho-L` | 160,202 / 249,197 | — |
| `pupila-*` | centro do olho | Olhar: deslocamento máx. ≈ 12 px |
| `palpebra-*` | — | Calota da elipse (0 = aberto, 1 = fechado); fórmula em `mascote-rig.js` → `eyelidD` |
| `sobrancelha-R` / `-L` | 158,142 / 252,134 | Subir/descer ±12 px, girar ±16° |
| `boca` | 205,262 (escala 1,25) | Troca de variante por visibilidade |
| `braco-R` / `braco-L` | 100,284 / 306,280 (ombro) | Rotação livre |
| `mao-R` / `mao-L` | 0,42 no espaço do braço (punho) | Rotação ±40° |
| `perna-R` / `perna-L` | 160,370 / 248,370 (quadril) | Rotação ±25°, elevação até 10 px |

## Regerar
Os arquivos foram gerados por script (`fonte/mascot.py`, `fonte/build.py`). Ajuste uma coordenada no script e todas as poses, expressões e PNGs são atualizados de forma consistente. Para gerar os PNGs, o script usa `rsvg-convert`.
