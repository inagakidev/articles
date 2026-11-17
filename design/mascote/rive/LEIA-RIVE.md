# Montagem no Rive

Um arquivo `.riv` só pode ser criado dentro do editor do Rive, então não há como gerá-lo fora dele. Este kit traz os SVGs preparados para importação e o roteiro abaixo, que reproduz o mesmo rig da versão web.

## 1. Importar
1. Arraste `mascote-rig-camadas.svg` (ou `mascote-rive-base.svg`, sem variantes ocultas) para um novo arquivo do Rive. Artboard: 480 × 520.
2. O Rive converte cada `<g>` em um Group com a mesma hierarquia. Como cada articulação foi exportada com a **origem no pivô**, os pontos de rotação já entram corretos.
3. Se alguma variante oculta não for importada, importe as partes de `rive/bocas/` e `rive/olhos/` e encaixe-as dentro dos grupos `boca` e `olho-*`.

## 2. Rig
- Use os **Groups** como articulações (é suficiente para este personagem). Bones são opcionais, apenas se você quiser deformar o corpo.
- Para a pálpebra, anime a *posição Y* de um retângulo cor creme usado como **clipping** dentro do olho, ou faça um morph de vértices da forma `palpebra-*`.
- Os pivôs estão na tabela do `LEIA-ME.md`.

## 3. Timelines sugeridas (mesmos valores de `web/mascote-rig.js`)
| Timeline | Loop | Chaves principais |
|---|---|---|
| idle | 2,4 s | corpo scaleY 1→1,018; braços ±2,5°; marcador ±3° |
| blink | 0,18 s | pálpebras 0→1→0 (camada aditiva sobre as demais) |
| wave | 0,62 s | braco-L −150° ±12°; mao-L ±22° |
| thinking | 3 s | braco-R −95°; mao-R ±10°; pupilas oscilando |
| reading | 2,2 s | pupilas x −12→+10, descendo 4 px por linha |
| writing | 0,42 s | braco-L 52° ±7°; mao-L 30° ±10° |
| celebrate | 0,9 s | rig y 0→−52→0; squash 9% no pouso; braços ±160° |
| sad | 4 s | corpo −4°; rosto y +6; marcador −16° |
| sleep | 3,6 s | corpo scaleY ±3%; boca scale ±30%; Zzz flutuando |
| walk | 0,8 s | pernas alternando elevação de 10 px; corpo ±3°; braços ±16° |

## 4. State Machine
- **Inputs:** `expressao` (Number 0–9), `acao` (Trigger: wave/celebrate), `lendo`, `escrevendo` e `dormindo` (Boolean), `andando` (Boolean).
- **Layer 1 (corpo):** idle ⇄ walk / reading / writing / sleep; wave e celebrate disparam e retornam a idle.
- **Layer 2 (rosto):** troca de expressão por visibilidade/opacidade das variantes.
- **Layer 3:** blink aleatório a cada 3–5 s (desativado em sleep).
