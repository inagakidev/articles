# Guia de identidade do mascote

## Personalidade
É divertido, curioso, acolhedor e levemente desajeitado. Ele acolhe em momentos de espera, vazio ou conquista, mas nunca compete com o texto.

## Anatomia (o que nunca pode faltar)
1. Corpo de folha, arredondado e levemente ondulado, mais alto que largo.
2. Dobra no canto superior direito, com o verso em lavanda.
3. Marcador roxo no topo, acima do olho direito do personagem (lado esquerdo da tela).
4. Olhos grandes, levemente assimétricos, com contorno grosso, pupila roxa e reflexos.
5. Barriga com linhas de texto em lavanda, de comprimento decrescente.
6. Braços e pernas curtos e grossos, em lavanda, com mãos em formato de luva.
7. Contorno roxo-escuro contínuo, com traço de aparência manual.
8. Textura leve de papel no corpo.

## Paleta
| Cor | Hex | Uso |
|---|---|---|
| Roxo principal | `#875CCB` | Marcador, capas de livro, cabo da lupa |
| Roxo contorno | `#56377F` | Contornos, pupilas, interior da boca |
| Lavanda | `#DCCBFF` | Braços, pernas, sombras de volume, linhas de texto, verso da dobra |
| Creme | `#FFFDF8` | Corpo e barriga |
| Rosa | `#FFC9D6` | Língua, bochechas, borracha do lápis |
| Amarelo | `#FFE69A` | Lápis |

As cores são as da marca (`docs/DESIGN.md` §2.1 e §2.2). A ilustração tem variações de tom da textura e do traço, mas não introduz cores novas.

## Ilustrações
| Nome | Momento |
|---|---|
| `apresentando` | Boas-vindas: página inicial, entrar, criar conta |
| `rosto` | Qualquer uso entre 24 e 96 px |
| `lendo` | Leitura: fim do artigo, novo aceite dos Termos, nenhum favorito |
| `pensativo` | Recuperar senha, busca sem resultados, troca obrigatória de username |
| `comemorando` | Artigo aprovado, e-mail confirmado |
| `escrevendo` | Editor vazio, nada escrito ainda |
| `esperando` | Artigo enviado para revisão, confirmação de e-mail, link de recuperação enviado |
| `procurando` | Busca carregando, erro 404 |
| `dormindo` | Notificações em dia, erro 500, manutenção |
| `ajustando` | Artigo devolvido para ajuste (não usada por enquanto, ver D65) |

O mapa completo de onde cada uma aparece está em `docs/DESIGN.md` §5.3.

## Tamanhos
- **≥ 96 px:** corpo inteiro.
- **24–96 px:** só o `rosto`.
- **< 24 px:** não use o mascote. Use o marcador roxo isolado (favicon e ícones).
- Área de respiro: no mínimo metade da largura de um olho em volta do personagem.

## Animação
A ilustração não tem partes separadas. Se uma tela pedir movimento, use só transformações da imagem inteira (flutuar, aparecer), curtas e com ease-in-out, e respeite `prefers-reduced-motion`.

## Não faça
- Redesenhar com outra estética, mudar proporções ou trocar a assimetria dos olhos.
- Remover a dobra ou o marcador.
- Adicionar cores fora da paleta, sombras projetadas ou texto dentro da arte.
- Usar o mascote como foto de usuário ou no lugar da logo (D66).
