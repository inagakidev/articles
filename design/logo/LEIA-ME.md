# Logo

A logo he4rt ink usada pela aplicação fica em `resources/images/logo/`, em seis arquivos: ícone, ícone + nome e ícone + nome + tagline, cada um para o tema claro e para o escuro. Onde cada variação aparece está em `docs/DESIGN.md` §5.4, e a decisão na D66 (`docs/DECISIONS.md`).

## Original
A prancha da marca (`logos.svg`), com todas as variações de cor, não fica no repositório. Ela está no Drive do projeto; peça o acesso a quem mantém o projeto.

## Gerar os arquivos
```bash
node design/logo/gerar.mjs <caminho da prancha logos.svg>
```

O script usa o Playwright, que já é dependência do projeto, para ler a prancha e gravar:

- as variações em `resources/images/logo/`;
- `public/favicon.svg` (o ícone roxo), `public/favicon.ico` (16, 32 e 48 px) e `public/apple-touch-icon.png` (180 px sobre o fundo creme).

Os elementos são escolhidos pela posição na prancha (`VARIANTS` no script). Se a prancha mudar de ordem, confira o resultado antes de fazer commit.
