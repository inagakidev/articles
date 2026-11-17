# Guia de identidade do mascote

## Personalidade
É divertido, curioso, acolhedor e levemente desajeitado. Ele se move com leveza, com um pouco de exagero (squash no pouso, balanço do marcador), mas nunca de forma frenética.

## Anatomia (o que nunca pode faltar)
1. Corpo de folha, arredondado e levemente ondulado, mais alto que largo (razão L:A ≈ 0,75).
2. Dobra no canto superior direito, com o verso em lavanda.
3. Marcador roxo no topo, acima do olho direito do personagem (lado esquerdo da tela).
4. Olhos grandes, levemente assimétricos (o esquerdo é ~5% maior), quase encostados, com contorno grosso, pupila roxa e dois reflexos.
5. Barriga creme com 3 linhas de texto em lavanda, de comprimento decrescente.
6. Braços e pernas curtos e grossos, em lavanda, com mãos em formato de luva.
7. Contorno roxo-escuro contínuo.

## Paleta (exclusiva)
| Cor | Hex | Uso |
|---|---|---|
| Roxo principal | `#875CCB` | Marcador, capas de livro, cabo da lupa, Zzz |
| Roxo contorno | `#56377F` | Todos os contornos, pupilas, interior da boca |
| Lavanda | `#DCCBFF` | Braços, pernas, sombras de volume, linhas de texto, verso da dobra |
| Creme | `#FFFDF8` | Corpo, barriga, pálpebras, reflexos nos membros |
| Rosa | `#FFC9D6` | Língua, bochechas, borracha do lápis |
| Amarelo | `#FFE69A` | Lápis, brilhos, lâmpada |
| Menta | `#BDEBD9` | Lente da lupa, selo “aprovado”, lágrima |

O branco `#FFFFFF` aparece só no fundo dos olhos e nos reflexos. Volumes usam lavanda/roxo com opacidade, nunca uma cor nova nem degradês.

## Contornos
- Corpo: 7 px · olhos: 6 px · detalhes e acessórios: 5 px · membros: 4,5 px (canvas de 400 px de largura).
- Junções e pontas sempre arredondadas.
- Membros e acessórios usam a técnica de **silhueta unificada** (contorno por trás e preenchimento por cima), que evita linhas internas entre partes sobrepostas.
- Ao escalar o personagem, escale o traço junto.

## Tamanhos
- **≥ 96 px:** corpo inteiro.
- **24–96 px:** use o avatar (`mascote-avatar.svg`).
- **< 24 px:** não use o mascote. Prefira o marcador roxo isolado como ícone.
- Área de respiro: no mínimo ½ da largura de um olho em volta do personagem.

## Expressões
São construídas sempre com os mesmos componentes:
- **Olhos:** aberto (com pálpebra de 0 a 100%), fechado feliz (^) e dormindo (‿).
- **Pupilas:** posição (±12 px) e escala (0,75–1,2).
- **Sobrancelhas:** deslocamento vertical e rotação.
- **Bocas (12):** sorriso, sorriso aberto, gargalhada, O, espanto, reta, triste, ondulada, sorriso de canto, concentrada, pensativa, sonolenta.
- **Extras:** bochechas, interrogação, lágrima.

Combinações novas são permitidas, desde que o personagem não pareça agressivo ou cruel.

## Animação: limites
- Squash/stretch do corpo: no máximo ±4% em respiração e ±9% no pouso de um pulo.
- Não rotacione o rosto mais que ±10°. A “cabeça” é o próprio corpo, então incline o grupo `corpo`.
- Prefira ciclos curtos (0,8–4 s) e ease-in-out. Respeite `prefers-reduced-motion`.

## Não faça
- Redesenhar com outra estética, mudar proporções ou trocar a assimetria dos olhos.
- Remover a dobra ou o marcador.
- Adicionar cores fora da paleta, degradês, sombras projetadas com filtro ou texturas raster.
- Achatar o arquivo ou converter as camadas em uma única forma.
