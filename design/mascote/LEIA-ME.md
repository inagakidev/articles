# Mascote

As ilustrações usadas pela aplicação ficam em `resources/images/mascote/`, em WEBP. Onde e como usar cada uma está em `docs/DESIGN.md` §5.3, e as regras de identidade estão em [GUIA-DE-IDENTIDADE.md](GUIA-DE-IDENTIDADE.md). A decisão está registrada na D65 (`docs/DECISIONS.md`).

## Originais
Os PNGs em alta resolução e os arquivos de trabalho não ficam no repositório, para não pesar no histórico do git. Eles estão no Drive do projeto, na pasta `mascote-poses-v2`:

- `sem-risquinhos/alta-resolucao/`: poses 01 a 05;
- `mascote-poses-novas/sem-risquinhos/alta-resolucao/`: poses 06 a 11.

A aplicação usa a variante `sem-risquinhos`. A pose 01 foi substituída pela 07, uma versão mais nítida da mesma arte. Peça o acesso à pasta a quem mantém o projeto.

## Gerar os WEBP
Junte os PNGs das duas pastas `alta-resolucao` em uma pasta local e rode:

```bash
python3 design/mascote/converter.py <pasta com os PNGs>
```

O script requer Pillow com suporte a WEBP. Ele redimensiona cada arte para o dobro do maior tamanho de exibição (600 px de largura; 192 px no `rosto`), converte com qualidade 85 mantendo a transparência e grava em `resources/images/mascote/`. Para incluir uma ilustração nova, acrescente-a ao dicionário `ARTS` do script e à lista `mascotArts` em `resources/js/components/mascot.tsx`.

Um teste do frontend confere que cada arquivo da pasta tem uma arte correspondente e pesa no máximo 80 KB.
