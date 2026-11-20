"""Converte as ilustrações do mascote (PNG) nos WEBP usados pela aplicação.

Uso:
    python3 design/mascote/converter.py <pasta com os PNGs>

A pasta é a `sem-risquinhos/alta-resolucao` dos originais (ver LEIA-ME.md).
Requer Pillow com suporte a WEBP.
"""

import sys
from pathlib import Path

from PIL import Image

# Arquivo original -> nome da arte na aplicação (DESIGN.md §5.3).
ARTS = {
    "07-mascote-apresentando-v2.png": "apresentando",
    "04-mascote-rosto.png": "rosto",
    "02-mascote-lendo.png": "lendo",
    "03-mascote-pensativo.png": "pensativo",
    "05-mascote-comemorando.png": "comemorando",
    "06-mascote-escrevendo.png": "escrevendo",
    "08-mascote-esperando.png": "esperando",
    "09-mascote-procurando.png": "procurando",
    "10-mascote-dormindo.png": "dormindo",
    "11-mascote-ajustando.png": "ajustando",
}

# O dobro do maior tamanho de exibição, para telas de alta densidade:
# corpo inteiro até 300 px e avatar até 96 px.
WIDTH = {"rosto": 192}
DEFAULT_WIDTH = 600

# Na 85 a textura do papel e o contorno ficam iguais ao PNG; na 80 a textura
# começa a alisar. A transparência é preservada sem perda.
QUALITY = 85

OUTPUT = Path(__file__).resolve().parents[2] / "resources/images/mascote"


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)

    source = Path(sys.argv[1])
    missing = [name for name in ARTS if not (source / name).is_file()]
    if missing:
        sys.exit("Arquivos não encontrados: " + ", ".join(missing))

    OUTPUT.mkdir(parents=True, exist_ok=True)

    for filename, art in ARTS.items():
        image = Image.open(source / filename).convert("RGBA")
        width = WIDTH.get(art, DEFAULT_WIDTH)
        height = round(image.height * width / image.width)
        target = OUTPUT / f"{art}.webp"

        image.resize((width, height), Image.LANCZOS).save(
            target, "WEBP", quality=QUALITY, method=6, alpha_quality=100
        )
        print(f"{art:13} {width}x{height}  {target.stat().st_size / 1024:5.1f} KB")


if __name__ == "__main__":
    main()
