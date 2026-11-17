"""Gerador do mascote vetorial modular (SVG puro, sem raster, sem clipPath, sem filtros).

Convenção: esquerdo/direito = do ponto de vista do PERSONAGEM (padrão de animação).
  -> "R" (direito) fica do lado ESQUERDO da tela; "L" (esquerdo) fica do lado DIREITO da tela.
Cada articulação é um <g> com transform="translate(pivô) rotate(ângulo)" e arte em coordenadas
locais, para que a origem do grupo seja o pivô (importa direto como origem no Rive/Figma/Illustrator).
"""
import math, json, re

O, P, LAV, CR, PK, YE, MI = "#56377F", "#875CCB", "#DCCBFF", "#FFFDF8", "#FFC9D6", "#FFE69A", "#BDEBD9"
PALETTE = {"roxo-principal": P, "roxo-contorno": O, "lavanda": LAV, "creme": CR,
           "rosa": PK, "amarelo": YE, "menta": MI}
SW = 7      # contorno principal
SW2 = 5     # contorno de detalhes
W, H = 400, 460

# ---------------------------------------------------------------- pivôs
PIV = {
    "corpo": (200, 380),
    "rosto": (204, 215),
    "marcador": (158, 70),
    "braco-R": (100, 284), "braco-L": (306, 280),
    "perna-R": (160, 370), "perna-L": (248, 370),
}
EYES = {"R": dict(cx=160, cy=202, rx=40, ry=44, pr=20),
        "L": dict(cx=249, cy=197, rx=42, ry=47, pr=21)}
BROWS = {"R": (158, 142), "L": (252, 134)}
MOUTH_C = (205, 262)
ARM_LEN, WRIST = 46, 42      # punho = pivô da mão no espaço do braço
HAND_C = 13                   # centro da mão em relação ao punho

def f(v):
    return ("%.2f" % v).rstrip("0").rstrip(".")

def T(x=0, y=0, r=0, sx=1, sy=1):
    s = "translate(%s %s)" % (f(x), f(y))
    if r: s += " rotate(%s)" % f(r)
    if sx != 1 or sy != 1: s += " scale(%s %s)" % (f(sx), f(sy))
    return s

def G(id, body, transform=None, label=None, hidden=False, layer=False, pivot=None, extra=""):
    a = ['id="%s"' % id]
    a.append('inkscape:label="%s"' % (label or id))
    if layer: a.append('inkscape:groupmode="layer"')
    if transform: a.append('transform="%s"' % transform)
    if pivot: a.append('data-pivot="%s,%s"' % (f(pivot[0]), f(pivot[1])))
    if hidden: a.append('style="display:none"')
    if extra: a.append(extra)
    return "<g %s>%s</g>" % (" ".join(a), body)

def outlined(shapes, fills, sw=SW):
    """Silhueta unificada: contorno largo atrás + preenchimentos por cima (sem linhas internas)."""
    return ('<g class="contorno" fill="%s" stroke="%s" stroke-width="%s" stroke-linejoin="round" '
            'stroke-linecap="round">%s</g>' % (O, O, sw * 2, "".join(shapes))) + "".join(fills)

def eyelid_d(rx, ry, c):
    """Pálpebra = calota da elipse acima da linha y(c). c=0 aberto, c=1 fechado. Coord. locais."""
    if c <= 0.001: return ""
    c = min(c, 0.999)
    y = -ry + 2 * ry * c
    hx = rx * math.sqrt(max(0.0, 1 - (y / ry) ** 2))
    large = 1 if c > 0.5 else 0
    return "M %s %s A %s %s 0 %d 1 %s %s Z" % (f(-hx), f(y), f(rx), f(ry), large, f(hx), f(y))

def lidline_d(rx, ry, c):
    if c <= 0.001: return ""
    c = min(c, 0.999)
    y = -ry + 2 * ry * c
    hx = rx * math.sqrt(max(0.0, 1 - (y / ry) ** 2))
    return "M %s %s Q 0 %s %s %s" % (f(-hx), f(y), f(y + 3), f(hx), f(y))

# ---------------------------------------------------------------- corpo
KX, CXB = 1.2, 204   # largura do corpo (proporção da referência)
def _wx(d):
    return re.sub(r"(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)",
                  lambda m: "%s %s" % (f(CXB + (float(m.group(1)) - CXB) * KX), m.group(2)), d)
BODY_D = _wx(("M 132 92 C 170 84 212 82 252 86 L 292 128 C 298 200 298 290 290 368 "
          "C 290 378 284 382 274 382 C 224 386 174 386 128 380 C 118 379 113 374 112 364 "
          "C 106 280 106 190 114 108 C 115 98 122 93 132 92 Z"))
SHADE_R = _wx(("M 292 140 C 296 210 296 290 289 366 C 288 376 282 380 272 380 C 226 384 176 384 130 378 "
           "C 122 377 117 373 116 366 C 160 371 222 370 262 362 C 274 359 278 352 279 340 "
           "C 284 270 286 200 292 140 Z"))
SHADE_L = _wx("M 115 118 C 110 200 110 290 117 362 C 122 300 123 200 127 122 C 125 112 118 112 115 118 Z")
FOLD_SHADOW = _wx("M 262 124 C 272 132 284 134 292 128 L 293 142 C 280 145 266 138 262 124 Z")
FOLD_D = _wx("M 252 86 C 250 104 254 118 262 124 C 272 130 282 130 292 128 Z")
BELLY_D = _wx(("M 140 288 C 180 280 240 280 268 290 C 270 318 268 342 264 354 "
           "C 222 361 178 361 144 355 C 139 338 137 312 140 288 Z"))

def body_art():
    base = G("corpo-preenchimento", '<path d="%s" fill="%s"/>' % (BODY_D, CR), label="Corpo · preenchimento")
    vol = G("corpo-volume",
            '<path d="%s" fill="%s" opacity="0.8"/><path d="%s" fill="%s" opacity="0.45"/>'
            '<path d="%s" fill="%s" opacity="0.22"/>' % (SHADE_R, LAV, SHADE_L, LAV, FOLD_SHADOW, P),
            label="Sombra e volume")
    belly = G("barriga",
              '<path d="%s" fill="%s"/>' % (BELLY_D, CR) +
              G("barriga-linhas",
                '<g stroke="%s" stroke-width="9" stroke-linecap="round" fill="none">'
                '<path d="M 150 306 L 262 300"/><path d="M 150 328 L 246 323"/><path d="M 150 348 L 214 345"/></g>' % LAV,
                label="Linhas de texto"),
              label="Barriga (frente)")
    outline = G("corpo-contorno", '<path d="%s" fill="none" stroke="%s" stroke-width="%d" stroke-linejoin="round"/>'
                % (BODY_D, O, SW), label="Corpo · contorno")
    fold = G("dobra-papel",
             '<path d="%s" fill="%s" stroke="%s" stroke-width="%d" stroke-linejoin="round"/>'
             '<path d="M 258 96 C 258 108 261 116 266 120" fill="none" stroke="%s" stroke-width="4" '
             'stroke-linecap="round" opacity="0.7"/>' % (FOLD_D, LAV, O, SW2, CR),
             label="Dobra do papel")
    return base + vol + belly + outline + fold

def bookmark(rot=0):
    x, y = PIV["marcador"]
    art = ('<path d="M -16 -2 L 16 -2 L 16 40 L 0 29 L -16 40 Z" fill="%s" stroke="%s" stroke-width="%d" '
           'stroke-linejoin="round"/><path d="M -10 3 L -4 3 L -4 30 L -10 34 Z" fill="%s" opacity="0.55"/>'
           % (P, O, SW2, LAV))
    return G("marcador", art, T(x, y, rot), "Acessório · marcador de página", pivot=(x, y))

# ---------------------------------------------------------------- olhos
def eye(side, st):
    e = EYES[side]; rx, ry, pr = e["rx"], e["ry"], e["pr"]
    mode = st.get("eyes", "aberto")
    c = st.get("lid", 0.0)
    if isinstance(c, dict): c = c.get(side, 0)
    px, py = st.get("pupil", (0, 0))
    if isinstance(st.get("pupil"), dict): px, py = st["pupil"][side]
    ps = st.get("pupil_scale", 1)
    pupil = G("pupila-" + side,
              '<circle r="%s" fill="%s"/><circle cx="%s" cy="%s" r="%s" fill="%s"/>'
              '<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (
                  f(pr), O, f(pr * .35), f(-pr * .35), f(pr * .36), CR, f(-pr * .38), f(pr * .42), f(pr * .17), CR),
              T(px, py, 0, ps, ps), "Pupila " + side, pivot=(0, 0))
    lid = G("palpebra-" + side,
            '<path class="lid-fill" d="%s" fill="%s"/><path class="lid-line" d="%s" fill="none" stroke="%s" '
            'stroke-width="%d" stroke-linecap="round"/>' % (eyelid_d(rx, ry, c), CR, lidline_d(rx, ry, c), O, SW2),
            label="Pálpebra " + side, extra='data-rx="%s" data-ry="%s" data-closure="%s"' % (rx, ry, f(c)))
    opened = G("olho-%s-aberto" % side,
               '<ellipse rx="%s" ry="%s" fill="#FFFFFF"/>' % (rx, ry) + pupil + lid +
               '<ellipse rx="%s" ry="%s" fill="none" stroke="%s" stroke-width="%d"/>' % (rx, ry, O, SW - 1),
               label="Olho aberto", hidden=(mode != "aberto"))
    happy = G("olho-%s-feliz" % side,
              '<path d="M %s 8 Q 0 %s %s 8" fill="none" stroke="%s" stroke-width="%d" stroke-linecap="round"/>'
              % (f(-rx * .7), f(-ry * .75), f(rx * .7), O, SW),
              label="Olho fechado feliz (^)", hidden=(mode != "feliz"))
    sleep = G("olho-%s-sono" % side,
              '<path d="M %s 2 Q 0 %s %s 2" fill="none" stroke="%s" stroke-width="%d" stroke-linecap="round"/>'
              % (f(-rx * .7), f(ry * .45), f(rx * .7), O, SW),
              label="Olho fechado dormindo", hidden=(mode != "sono"))
    name = "Olho direito (R)" if side == "R" else "Olho esquerdo (L)"
    return G("olho-" + side, opened + happy + sleep, T(e["cx"], e["cy"]), name, pivot=(e["cx"], e["cy"]))

def brow(side, st):
    bx, by = BROWS[side]
    dy, rot = st.get("brow_" + side, (0, 0))
    d = "M -18 4 Q 0 -7 18 4"
    return G("sobrancelha-" + side,
             '<path d="%s" fill="none" stroke="%s" stroke-width="6" stroke-linecap="round"/>' % (d, O),
             T(bx, by + dy, rot), "Sobrancelha " + side, pivot=(bx, by))

# ---------------------------------------------------------------- bocas
def _open(d, tongue):
    return ('<path d="%s" fill="%s" stroke="%s" stroke-width="4" stroke-linejoin="round"/>'
            '<path d="%s" fill="%s"/>' % (d, O, O, tongue, PK))
def _line(d, w=5):
    return '<path d="%s" fill="none" stroke="%s" stroke-width="%d" stroke-linecap="round"/>' % (d, O, w)

MOUTHS = {
    "sorriso": ("Sorriso fechado", _line("M -13 -2 Q 0 11 13 -2")),
    "sorriso-aberto": ("Sorriso aberto", _open("M -15 -5 Q 0 -1 15 -5 Q 13 16 0 17 Q -13 16 -15 -5 Z",
                                               "M -8 11 Q 0 4 8 11 Q 4 15.6 0 15.8 Q -4 15.6 -8 11 Z")),
    "gargalhada": ("Gargalhada", _open("M -22 -7 Q 0 -1 22 -7 Q 20 24 0 25 Q -20 24 -22 -7 Z",
                                       "M -12 17 Q 0 6 12 17 Q 6 23.5 0 23.8 Q -6 23.5 -12 17 Z")),
    "o": ("Boca em O", '<ellipse rx="7" ry="9" fill="%s" stroke="%s" stroke-width="3"/>'
                       '<path d="M -4 5 Q 0 2 4 5 Q 2 8 0 8 Q -2 8 -4 5 Z" fill="%s"/>' % (O, O, PK)),
    "o-grande": ("Espanto", '<ellipse rx="11" ry="14" fill="%s" stroke="%s" stroke-width="3"/>'
                            '<path d="M -7 8 Q 0 3 7 8 Q 4 12.5 0 12.8 Q -4 12.5 -7 8 Z" fill="%s"/>' % (O, O, PK)),
    "reta": ("Reta", _line("M -10 1 L 10 1")),
    "triste": ("Triste", _line("M -12 7 Q 0 -5 12 7")),
    "ondulada": ("Ondulada (confusa)", _line("M -15 2 Q -8 -5 0 2 Q 8 9 15 2")),
    "orgulho": ("Sorriso de canto", _line("M -14 -1 Q 2 11 16 -7")),
    "concentrada": ("Concentrada (língua)", _line("M -10 1 Q 0 -1 10 1") +
                    '<path d="M 3 2 Q 4 11 9 11 Q 13 10 12 2" fill="%s" stroke="%s" stroke-width="3" '
                    'stroke-linejoin="round"/>' % (PK, O)),
    "pensativa": ("Pensativa", _line("M -9 3 Q 3 -2 13 0")),
    "sono": ("Sonolenta", '<ellipse cx="0" cy="2" rx="5" ry="4" fill="%s"/>' % O),
}

def mouth(st, all_variants=False):
    cur = st.get("mouth", "sorriso-aberto")
    parts = ""
    for k, (label, art) in MOUTHS.items():
        if all_variants or k == cur:
            parts += G("boca-" + k, art, label="Boca · " + label, hidden=(k != cur))
    return G("boca", parts, T(MOUTH_C[0], MOUTH_C[1], 0, 1.25, 1.25), "Boca", pivot=MOUTH_C)

def face(st, all_variants=False):
    fx, fy = st.get("face", (0, 0))
    rx_, ry_ = PIV["rosto"]
    blush = G("bochechas", '<ellipse cx="122" cy="250" rx="13" ry="7" fill="%s"/>'
              '<ellipse cx="290" cy="245" rx="13" ry="7" fill="%s"/>' % (PK, PK),
              label="Bochechas", hidden=not st.get("blush"))
    inner = blush + eye("R", st) + eye("L", st) + brow("R", st) + brow("L", st) + mouth(st, all_variants)
    return G("rosto", '<g transform="translate(%d %d)">%s</g>' % (-rx_, -ry_, inner),
             T(rx_ + fx, ry_ + fy, st.get("face_rot", 0)), "Rosto", pivot=PIV["rosto"])

# ---------------------------------------------------------------- membros
def hand_art(side):
    s = -1 if side == "R" else 1   # polegar voltado para o corpo
    shapes = ['<circle cx="0" cy="%d" r="23"/>' % HAND_C,
              '<ellipse cx="%d" cy="0" rx="10" ry="12" transform="rotate(%d %d 0)"/>' % (s * 18, -s * 30, s * 18)]
    fills = ['<g fill="%s">%s</g>' % (LAV, "".join(shapes)),
             '<ellipse cx="-7" cy="5" rx="8" ry="6" fill="%s" opacity="0.6"/>' % CR]
    return outlined(shapes, fills, SW / 2 + 0.5)

def arm(side, rot, hand_rot=0, held_back="", held_front="", hidden=False):
    sx, sy = PIV["braco-" + side]
    shapes = ['<path d="M -17 0 A 17 17 0 0 1 17 0 L 15 %d A 15 15 0 0 1 -15 %d Z"/>' % (ARM_LEN, ARM_LEN)]
    fills = ['<g fill="%s">%s</g>' % (LAV, shapes[0]),
             '<path d="M -8 -4 L -6 36" stroke="%s" stroke-width="5" stroke-linecap="round" opacity="0.6"/>' % CR]
    upper = G("antebraco-" + side, outlined(shapes, fills, SW / 2 + 0.5), label="Braço " + side + " · segmento")
    hand = G("mao-" + side, held_back + G("mao-%s-arte" % side, hand_art(side), label="Mão · arte") + held_front,
             T(0, WRIST, hand_rot), "Mão " + ("direita" if side == "R" else "esquerda") + " (" + side + ")",
             pivot=(0, WRIST))
    return G("braco-" + side, upper + hand, T(sx, sy, rot),
             "Braço " + ("direito" if side == "R" else "esquerdo") + " (" + side + ")", pivot=(sx, sy), hidden=hidden)

def leg(side, rot):
    hx, hy = PIV["perna-" + side]
    s = -1 if side == "R" else 1
    shapes = ['<path d="M -21 -14 L 21 -14 L 19 34 L -19 34 Z"/>',
              '<ellipse cx="%d" cy="40" rx="32" ry="18"/>' % (s * 7)]
    fills = ['<g fill="%s">%s</g>' % (LAV, "".join(shapes)),
             '<ellipse cx="%d" cy="35" rx="15" ry="7" fill="%s" opacity="0.6"/>' % (s * 2 - 4, CR),
             '<path d="M %d 50 Q %d 57 %d 50" fill="none" stroke="%s" stroke-width="4" stroke-linecap="round" opacity="0.35"/>'
             % (s * 7 - 20, s * 7, s * 7 + 20, P)]
    return G("perna-" + side, outlined(shapes, fills, SW / 2 + 0.5), T(hx, hy, rot),
             "Perna " + ("direita" if side == "R" else "esquerda") + " (" + side + ")", pivot=(hx, hy))

def sit_feet():
    out = ""
    for side, cx in (("R", 150), ("L", 258)):
        shapes = ['<ellipse cx="%d" cy="392" rx="36" ry="25"/>' % cx]
        fills = ['<ellipse cx="%d" cy="392" rx="36" ry="25" fill="%s"/>' % (cx, LAV),
                 '<ellipse cx="%d" cy="397" rx="18" ry="12" fill="%s" opacity="0.7"/>' % (cx, CR)]
        out += G("pe-sentado-" + side, outlined(shapes, fills, SW / 2 + 0.5), label="Pé sentado " + side)
    return G("pernas-sentado", out, label="Pernas · sentado")

# ---------------------------------------------------------------- acessórios (coord. locais)
def pencil(tf="", id="lapis"):
    sil = ['<path d="M -11 -34 L 0 -66 L 11 -34 L 11 56 Q 11 66 0 66 Q -11 66 -11 56 Z"/>']
    fills = ['<path d="M -11 -34 L 11 -34 L 11 46 L -11 46 Z" fill="%s"/>' % YE,
             '<path d="M 3 -34 L 11 -34 L 11 46 L 3 46 Z" fill="%s" opacity="0.18"/>' % O,
             '<path d="M -11 -34 L 0 -66 L 11 -34 Z" fill="%s"/>' % CR,
             '<path d="M -4.5 -53 L 0 -66 L 4.5 -53 Z" fill="%s"/>' % O,
             '<path d="M -11 46 L 11 46 L 11 55 L -11 55 Z" fill="%s"/>' % LAV,
             '<path d="M -11 55 L 11 55 L 11 57 Q 11 66 0 66 Q -11 66 -11 57 Z" fill="%s"/>' % PK,
             '<path d="M -11 -34 L 11 -34" stroke="%s" stroke-width="3"/>' % O,
             '<path d="M -11 46 L 11 46 M -11 55 L 11 55" stroke="%s" stroke-width="3"/>' % O]
    return G(id, outlined(sil, fills, SW2 / 2 + 0.5), tf, "Acessório · lápis")

def book_open(tf="", id="livro-aberto"):
    sil = ['<path d="M -66 -34 Q -32 -46 0 -36 Q 32 -46 66 -34 L 66 36 Q 32 26 0 38 Q -32 26 -66 36 Z"/>']
    fills = ['<path d="M -62 -40 Q -32 -50 0 -40 Q 32 -50 62 -40 L 62 -32 Q 32 -42 0 -34 Q -32 -42 -62 -32 Z" fill="%s"/>' % CR,
             '<path d="M -66 -34 Q -32 -44 0 -34 L 0 38 Q -32 26 -66 36 Z" fill="%s"/>' % P,
             '<path d="M 66 -34 Q 32 -44 0 -34 L 0 38 Q 32 26 66 36 Z" fill="%s"/>' % P,
             '<path d="M -56 -26 Q -32 -34 -10 -28 L -10 -18 Q -32 -24 -56 -16 Z" fill="%s" opacity="0.45"/>' % LAV,
             '<path d="M 0 -34 L 0 38" stroke="%s" stroke-width="4" stroke-linecap="round"/>' % O]
    sil2 = ['<path d="M -62 -40 Q -32 -50 0 -40 Q 32 -50 62 -40 L 62 -32 L -62 -32 Z"/>']
    return G(id, outlined(sil2 + sil, fills, SW2 / 2 + 0.5), tf, "Acessório · livro aberto")

def book_closed(tf="", id="livro-fechado"):
    sil = ['<rect x="-130" y="-26" width="260" height="52" rx="10"/>']
    fills = ['<rect x="-130" y="-26" width="260" height="52" rx="10" fill="%s"/>' % P,
             '<path d="M -118 -6 L 124 -6 L 124 14 L -118 14 Z" fill="%s"/>' % CR,
             '<path d="M -118 0 L 124 0 M -118 7 L 124 7" stroke="%s" stroke-width="2.5"/>' % LAV,
             '<path d="M -118 -6 L 124 -6 M -118 14 L 124 14" stroke="%s" stroke-width="3"/>' % O,
             '<rect x="-112" y="-20" width="70" height="8" rx="4" fill="%s" opacity="0.5"/>' % LAV,
             '<path d="M 60 -26 L 60 -40 L 70 -34 L 80 -40 L 80 -26" fill="%s" stroke="%s" stroke-width="4" stroke-linejoin="round"/>' % (YE, O)]
    return G(id, outlined(sil, fills, SW2 / 2 + 0.5), tf, "Acessório · livro fechado")

def sheet(tf="", id="folha", check=False):
    sil = ['<path d="M -32 -42 L 22 -42 L 34 -30 L 34 42 L -32 42 Z"/>']
    fills = ['<path d="M -32 -42 L 22 -42 L 34 -30 L 34 42 L -32 42 Z" fill="%s"/>' % CR,
             '<path d="M 22 -42 L 22 -30 L 34 -30 Z" fill="%s" stroke="%s" stroke-width="3" stroke-linejoin="round"/>' % (LAV, O),
             '<g stroke="%s" stroke-width="6" stroke-linecap="round"><path d="M -20 -22 L 12 -22"/>'
             '<path d="M -20 -6 L 22 -6"/><path d="M -20 10 L 18 10"/><path d="M -20 26 L 4 26"/></g>' % LAV]
    if check:
        fills.append('<circle cx="24" cy="30" r="17" fill="%s" stroke="%s" stroke-width="4"/>'
                     '<path d="M 16 30 L 22 36 L 32 24" fill="none" stroke="%s" stroke-width="5" '
                     'stroke-linecap="round" stroke-linejoin="round"/>' % (MI, O, O))
    return G(id, outlined(sil, fills, SW2 / 2 + 0.5), tf, "Acessório · folha" + (" aprovada" if check else ""))

def magnifier(tf="", id="lupa"):
    sil = ['<circle r="30"/>', '<path d="M 20 22 L 52 58" stroke-width="22" stroke-linecap="round"/>']
    fills = ['<path d="M 22 24 L 52 58" stroke="%s" stroke-width="14" stroke-linecap="round"/>' % P,
             '<circle r="30" fill="%s"/>' % LAV,
             '<circle r="22" fill="%s" opacity="0.55" stroke="%s" stroke-width="3"/>' % (MI, O),
             '<path d="M -13 -8 Q -10 -15 -2 -16" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>']
    return G(id, outlined(sil, fills, SW2 / 2 + 0.5), tf, "Acessório · lupa")

def fx_sparkle(tf, color=YE, id="fx-brilho"):
    return G(id, '<g stroke="%s" stroke-width="7" stroke-linecap="round" fill="none">'
             '<path d="M 0 -16 L 4 -34"/><path d="M 14 -6 L 30 -16"/><path d="M -14 -6 L -28 -18"/></g>' % color,
             tf, "Efeito · brilho")

def fx_zzz(tf):
    z = lambda x, y, s: ('<path d="M %s %s l %s 0 l %s %s l %s 0" fill="none" stroke="%s" stroke-width="%s" '
                         'stroke-linecap="round" stroke-linejoin="round"/>' % (f(x), f(y), f(s), f(-s), f(s), f(s), P, f(s / 4)))
    return G("fx-zzz", z(0, 0, 14) + z(20, -26, 18) + z(46, -58, 24), tf, "Efeito · Zzz")

def fx_question(tf):
    return G("fx-interrogacao", '<path d="M -10 -12 Q -10 -26 2 -26 Q 14 -26 14 -14 Q 14 -6 4 -2 L 2 6" fill="none" '
             'stroke="%s" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'
             '<circle cx="2" cy="20" r="4.5" fill="%s"/>' % (P, P), tf, "Efeito · interrogação")

def fx_idea(tf):
    sil = ['<circle cx="0" cy="0" r="24"/>', '<rect x="-11" y="18" width="22" height="16" rx="5"/>']
    fills = ['<rect x="-11" y="18" width="22" height="16" rx="5" fill="%s"/>' % LAV,
             '<circle r="24" fill="%s"/>' % YE,
             '<path d="M -8 6 Q -8 -6 0 -6 Q 8 -6 8 6" fill="none" stroke="%s" stroke-width="3" stroke-linecap="round"/>' % O,
             '<ellipse cx="-9" cy="-10" rx="5" ry="7" fill="%s" opacity="0.8"/>' % CR]
    rays = ('<g stroke="%s" stroke-width="6" stroke-linecap="round"><path d="M 0 -36 L 0 -48"/>'
            '<path d="M 28 -24 L 37 -32"/><path d="M -28 -24 L -37 -32"/></g>' % YE)
    bubbles = ('<g fill="%s" stroke="%s" stroke-width="4"><circle cx="-46" cy="52" r="6"/>'
               '<circle cx="-32" cy="36" r="9"/></g>' % (CR, O))
    return G("fx-ideia", bubbles + rays + outlined(sil, fills, SW2 / 2 + 0.5), tf, "Efeito · ideia")

def fx_confetti(tf):
    items = [(-120, -40, PK, 20), (-80, -110, YE, -30), (90, -120, MI, 15), (130, -30, PK, 40),
             (-140, 60, MI, -10), (150, 70, YE, 25), (-30, -150, P, 10), (40, -160, PK, -40)]
    s = ""
    for x, y, c, r in items:
        s += '<rect x="-6" y="-10" width="12" height="20" rx="3" fill="%s" stroke="%s" stroke-width="3" transform="translate(%d %d) rotate(%d)"/>' % (c, O, x, y, r)
    s += '<g fill="%s" stroke="%s" stroke-width="3"><circle cx="-100" cy="0" r="6"/><circle cx="118" cy="-80" r="6"/><circle cx="0" cy="-130" r="5"/></g>' % (YE, O)
    return G("fx-confete", s, tf, "Efeito · confete")

def fx_tear(tf):
    return G("fx-lagrima", '<path d="M 0 -10 Q 8 2 6 6 Q 0 14 -6 6 Q -8 2 0 -10 Z" fill="%s" stroke="%s" stroke-width="3" '
             'stroke-linejoin="round"/>' % (MI, O), tf, "Efeito · lágrima")

# ---------------------------------------------------------------- expressões
EXPRESSIONS = {
    "feliz":        dict(nome="Feliz", pupil=(2, -2), mouth="sorriso-aberto"),
    "muito-feliz":  dict(nome="Muito feliz", eyes="feliz", brow_R=(-6, 0), brow_L=(-6, 0), mouth="gargalhada", blush=True),
    "curioso":      dict(nome="Curioso", pupil=(6, -6), brow_L=(-10, -8), mouth="o"),
    "pensativo":    dict(nome="Pensativo", pupil=(-7, -10), lid=0.12, brow_R=(-6, -8), brow_L=(3, -6), mouth="pensativa"),
    "confuso":      dict(nome="Confuso", pupil={"R": (-4, 2), "L": (5, -3)}, brow_R=(2, 14), brow_L=(-9, -6),
                         mouth="ondulada", fx="interrogacao"),
    "surpreso":     dict(nome="Surpreso", pupil=(0, 0), pupil_scale=0.8, brow_R=(-12, 0), brow_L=(-12, 0), mouth="o-grande"),
    "concentrado":  dict(nome="Concentrado", lid=0.35, pupil=(0, 5), brow_R=(5, 12), brow_L=(5, -12), mouth="concentrada"),
    "cansado":      dict(nome="Cansado", lid=0.55, pupil=(0, 7), brow_R=(4, -8), brow_L=(4, 8), mouth="reta", face=(0, 3)),
    "triste":       dict(nome="Triste", lid=0.18, pupil=(0, 7), brow_R=(-2, -16), brow_L=(-2, 16), mouth="triste", fx="lagrima"),
    "orgulhoso":    dict(nome="Orgulhoso", lid=0.42, pupil=(3, 2), brow_R=(-5, -4), brow_L=(-5, 4), mouth="orgulho",
                         blush=True, face=(0, -3)),
}

def expr_fx(st, all_variants=False):
    if all_variants:
        k = st.get("fx")
        return (G("fx-expr-interrogacao", fx_question(T(338, 100, 12)), hidden=(k != "interrogacao"), label="Interrogação") +
                G("fx-expr-lagrima", fx_tear(T(126, 244)), hidden=(k != "lagrima"), label="Lágrima"))
    k = st.get("fx")
    if k == "interrogacao": return fx_question(T(338, 100, 12))
    if k == "lagrima": return fx_tear(T(126, 244))
    return ""

# ---------------------------------------------------------------- poses
def aim(side, target, offset=0):
    sx, sy = PIV["braco-" + side]
    dx, dy = target[0] - sx, target[1] - sy
    return math.degrees(math.atan2(dy, dx)) - 90 + offset

POSES = {
    "padrao":   dict(nome="Padrão", expr="feliz", arm_R=12, arm_L=-12, leg_R=0, leg_L=0,
                     hand_R_back=pencil(T(-4, 4, -8), "lapis")),
    "acenando": dict(nome="Acenando", expr="muito-feliz", arm_R=10, arm_L=-150, hand_L=-15, leg_R=-3, leg_L=3,
                     body_rot=-3, fx=fx_sparkle(T(370, 120, 20))),
    "lendo":    dict(nome="Lendo um artigo", expr=dict(EXPRESSIONS["curioso"], pupil=(-2, 9), mouth="sorriso", brow_L=(-4, -4)),
                     arm_R=aim("R", (150, 322)), arm_L=aim("L", (258, 322)), arms_front=True,
                     held=sheet(T(204, 314, -4, 1.4, 1.4), "folha")),
    "escrevendo": dict(nome="Escrevendo com um lápis", expr="concentrado", body_rot=2,
                       arm_R=aim("R", (148, 338)), arm_L=aim("L", (246, 318)), arms_front=True, hand_L=30,
                       held=sheet(T(196, 334, 8, 1.35, 1.1), "folha"),
                       hand_L_front=pencil(T(-8, -10, -150, .8, .8), "lapis")),
    "segurando-folha": dict(nome="Segurando uma folha", expr="feliz", arm_R=10, arm_L=-140, hand_L=10,
                            hand_L_front=sheet(T(6, -20, 8), "folha"), fx=fx_sparkle(T(380, 60, 10))),
    "comemorando": dict(nome="Comemorando publicação aprovada", expr="muito-feliz", root=(0, -26), arm_R=165, arm_L=-160,
                        leg_R=12, leg_L=-12, hand_L_front=sheet(T(4, -26, 10), "folha", check=True),
                        fx=fx_confetti(T(200, 200))),
    "pensando": dict(nome="Pensando em uma solução", expr="pensativo", arm_R=aim("R", (190, 276)), arms_front=True,
                     arm_L=-14, body_rot=-2, fx=fx_idea(T(90, 60))),
    "lupa":     dict(nome="Procurando com uma lupa", expr=dict(EXPRESSIONS["curioso"], pupil={"R": (4, 0), "L": (0, 0)},
                     pupil_scale=1.2), arm_R=12, arm_L=aim("L", (322, 240)), arms_front=True,
                     held=magnifier(T(249, 197, -15, 1.3, 1.3), "lupa")),
    "dormindo": dict(nome="Dormindo sobre um livro", expr=dict(nome="Dormindo", eyes="sono", mouth="sono", face=(0, 4),
                     brow_R=(4, -6), brow_L=(4, 6), blush=True, face_rot=-8), sit=True, root=(0, 8), body_rot=-3, bookmark=-14,
                     arm_R=aim("R", (132, 350)), arm_L=aim("L", (276, 348)), arms_front=True,
                     held=book_closed(T(204, 386), "livro"), fx=fx_zzz(T(330, 96))),
    "caminhando": dict(nome="Caminhando", expr=dict(EXPRESSIONS["feliz"], pupil=(7, 0), mouth="sorriso"), body_rot=3,
                       root=(0, -4), arm_R=-22, arm_L=-30, leg_R=20, leg_L=18),
    "sentado-lendo": dict(nome="Sentado lendo", expr=dict(EXPRESSIONS["feliz"], pupil=(0, 9), mouth="sorriso"), sit=True,
                          root=(0, 10), arm_R=aim("R", (136, 318)), arm_L=aim("L", (272, 316)), arms_front=True,
                          held=book_open(T(204, 318, 0, 1.25, 1.25)), fx=fx_sparkle(T(352, 120, 25), P)),
}

def character(pose_key="padrao", expr=None, all_variants=False, show_props=True):
    p = POSES[pose_key]
    st = expr if expr is not None else p["expr"]
    if isinstance(st, str): st = EXPRESSIONS[st]
    bx, by = PIV["corpo"]
    rx, ry = p.get("root", (0, 0))
    sit = p.get("sit", False)
    back_arms = not p.get("arms_front", False)

    hb_R = p.get("hand_R_back", "") if show_props else ""
    hf_L = p.get("hand_L_front", "") if show_props else ""
    if all_variants:
        hf_L += G("lapis-escrita-wrap", pencil(T(-8, -10, -150, .8, .8), "lapis-escrita"), hidden=True,
                  label="Lápis de escrita (oculto)")
    arms = arm("R", p.get("arm_R", 12), p.get("hand_R", 0), held_back=hb_R) + \
           arm("L", p.get("arm_L", -12), p.get("hand_L", 0), held_front=hf_L)

    body_inner = (body_art() + bookmark(p.get("bookmark", 0)) + face(st, all_variants) + expr_fx(st, all_variants))
    if sit: body_inner += sit_feet()
    held = p.get("held", "") if show_props else ""
    if all_variants:
        held += (G("prop-folha", sheet(T(204, 322, -4, 1.4, 1.4), "folha-leitura"), hidden=True, label="Folha (leitura/escrita)") +
                 G("prop-livro", book_open(T(204, 318, 0, 1.25, 1.25), "livro-leitura"), hidden=True, label="Livro aberto"))
    body_inner += G("acessorios-segurados", held, label="Acessórios segurados")
    body_inner += G("bracos", arms, label="Braços")
    corpo = G("corpo", '<g transform="translate(%d %d)">%s</g>' % (-bx, -by, body_inner),
              T(bx, by, p.get("body_rot", 0)), "Corpo + cabeça (pivô na base)", pivot=PIV["corpo"])
    legs = "" if sit else G("pernas", leg("R", p.get("leg_R", 0)) + leg("L", p.get("leg_L", 0)), label="Pernas")
    rig = G("rig", legs + corpo, T(rx, ry), "Rig (raiz)", pivot=(0, 0))
    shadow_scale = 1 - abs(ry) / 120
    shadow = G("sombra", '<ellipse cx="0" cy="0" rx="132" ry="14" fill="%s" opacity="0.75"/>' % LAV,
               T(204, 432 if not sit else 418, 0, shadow_scale, 1), "Sombra no chão", pivot=(204, 432))
    fxs = p.get("fx", "") if show_props else ""
    if all_variants:
        fxs += (G("fx-lib-zzz", fx_zzz(T(330, 96)), hidden=True, label="Zzz") +
                G("fx-lib-confete", fx_confetti(T(200, 200)), hidden=True, label="Confete") +
                G("fx-lib-ideia", fx_idea(T(90, 60)), hidden=True, label="Ideia") +
                G("fx-lib-brilho", fx_sparkle(T(370, 120, 20), YE, "fx-brilho-2"), hidden=True, label="Brilho"))
    fx = G("efeitos", fxs, label="Efeitos")
    return shadow + rig + fx

HEADER = ('<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" '
          'viewBox="%s" width="%s" height="%s">')

def svg_doc(body, vb=(0, 0, W, H), title="Mascote"):
    return (HEADER % (" ".join(map(str, vb)), vb[2], vb[3]) + "<title>%s</title>" % title +
            G("mascote", body, label="Mascote", layer=True) + "</svg>\n")
