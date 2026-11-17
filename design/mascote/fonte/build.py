import os, re, json, shutil, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
import mascot as m
from mascot import G, T, f, O, P, LAV, CR, PK, YE, MI

OUT = "out/mascote-kit"
shutil.rmtree("out", ignore_errors=True)
for d in ["svg/expressoes", "svg/poses", "svg/componentes", "png/principal", "png/expressoes", "png/poses",
          "png/avatar", "web", "rive/bocas", "rive/olhos"]:
    os.makedirs(os.path.join(OUT, d), exist_ok=True)

def save(path, txt):
    with open(os.path.join(OUT, path), "w") as fh: fh.write(txt)

def png(svg_path, png_path, w):
    subprocess.run(["rsvg-convert", "-w", str(w), "-b", "none", os.path.join(OUT, svg_path), "-o",
                    os.path.join(OUT, png_path)], check=True)

VB = (-40, -40, 480, 520)  # margem para braços erguidos e efeitos

# 1. principal --------------------------------------------------------------------------
save("svg/mascote-principal.svg", m.svg_doc(m.character("padrao"), VB, "Mascote · principal"))
for w in (128, 256, 512, 1024, 2048):
    png("svg/mascote-principal.svg", "png/principal/mascote-principal-%dpx.png" % w, w)

# 2+5. arquivo em camadas / rig (todas as variações, ocultas) ------------------------------
rig_body = m.character("padrao", all_variants=True)
save("svg/mascote-rig-camadas.svg", m.svg_doc(rig_body, VB, "Mascote · rig com todas as camadas"))
save("web/mascote-rig.svg", m.svg_doc(rig_body, VB, "Mascote · rig web"))

# 3. expressões ----------------------------------------------------------------------------
for k, e in m.EXPRESSIONS.items():
    p = "svg/expressoes/expressao-%s.svg" % k
    body = m.character("padrao", expr=e, show_props=False)
    save(p, m.svg_doc(body, VB, "Expressão · " + e["nome"]))
    png(p, "png/expressoes/expressao-%s-512px.png" % k, 512)
    png(p, "png/expressoes/expressao-%s-1024px.png" % k, 1024)

# folha de expressões (recorte do rosto)
cells = ""
for i, (k, e) in enumerate(m.EXPRESSIONS.items()):
    x, y = (i % 5) * 260, (i // 5) * 300
    face_only = m.body_art() + m.bookmark() + m.face(e) + m.expr_fx(e)
    cells += G("cel-" + k, '<rect x="%d" y="%d" width="240" height="290" rx="24" fill="#F7F2FF"/>'
               '<svg x="%d" y="%d" width="240" height="250" viewBox="84 60 240 250">%s</svg>'
               '<text x="%d" y="%d" text-anchor="middle" font-family="Nunito, Arial, sans-serif" font-size="20" '
               'font-weight="700" fill="%s">%s</text>' % (x, y, x, y, face_only, x + 120, y + 274, O, e["nome"]),
               label="Expressão · " + e["nome"])
sheet = ('<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" '
         'viewBox="-10 -10 1310 610" width="1310" height="610"><title>Biblioteca de expressões</title>%s</svg>' % cells)
# corta o corpo abaixo do rosto: usamos viewBox por célula ⇒ simplificação: mantém corpo inteiro reduzido
save("svg/expressoes/biblioteca-expressoes.svg", sheet)
png("svg/expressoes/biblioteca-expressoes.svg", "png/expressoes/biblioteca-expressoes.png", 1980)

# 4. poses --------------------------------------------------------------------------------
for k, p in m.POSES.items():
    if k == "padrao": continue
    sp = "svg/poses/pose-%s.svg" % k
    save(sp, m.svg_doc(m.character(k), VB, "Pose · " + p["nome"]))
    png(sp, "png/poses/pose-%s-512px.png" % k, 512)
    png(sp, "png/poses/pose-%s-1024px.png" % k, 1024)

# 3b. componentes faciais / acessórios ----------------------------------------------------
def label(x, y, t, size=16):
    return ('<text x="%s" y="%s" text-anchor="middle" font-family="Nunito, Arial, sans-serif" font-size="%d" '
            'font-weight="700" fill="%s">%s</text>' % (x, y, size, O, t))
lib = ""
# bocas
row = ""
for i, (k, (lb, art)) in enumerate(m.MOUTHS.items()):
    x = 70 + i * 110
    row += G("lib-boca-" + k, '<g transform="translate(%d 70) scale(2)">%s</g>' % (x, art) + label(x, 135, lb.split(" (")[0], 13),
             label="Boca · " + lb)
lib += G("lib-bocas", label(40, 20, "BOCAS", 18).replace('text-anchor="middle"', 'text-anchor="start"') + row, label="Bocas")
# olhos
row = ""
e = m.EYES["L"]
states = [("aberto", dict(eyes="aberto"), "Aberto"), ("meio", dict(eyes="aberto", lid=0.45), "Semicerrado"),
          ("quase", dict(eyes="aberto", lid=0.75), "Quase fechado"), ("feliz", dict(eyes="feliz"), "Fechado feliz"),
          ("sono", dict(eyes="sono"), "Dormindo"), ("surpreso", dict(eyes="aberto", pupil_scale=0.75), "Pupila pequena"),
          ("cima", dict(eyes="aberto", pupil=(-8, -12)), "Olhar p/ cima")]
for i, (k, st, lb) in enumerate(states):
    x = 80 + i * 150
    ey = m.eye("L", st).replace('id="olho-L', 'id="lib-olho-%s' % k).replace('id="pupila-L', 'id="lib-pupila-%s' % k).replace('id="palpebra-L', 'id="lib-palpebra-%s' % k)
    ey = re.sub(r'transform="translate\(249 197\)"', 'transform="translate(%d 260)"' % x, ey, count=1)
    lib += ey + label(x, 330, lb, 13)
lib += label(40, 200, "OLHOS", 18).replace('text-anchor="middle"', 'text-anchor="start"')
# sobrancelhas
brows = [((0, 0), "Neutra"), ((-10, 0), "Erguida"), ((0, 14), "Concentrada"), ((0, -16), "Triste"), ((0, 10), "Brava/foco"), ((-8, -8), "Curiosa")]
for i, ((dy, r), lb) in enumerate(brows):
    x = 80 + i * 130
    lib += G("lib-sobrancelha-%d" % i, '<path d="M -18 4 Q 0 -7 18 4" fill="none" stroke="%s" stroke-width="6" stroke-linecap="round" '
             'transform="translate(%d %d) rotate(%d) scale(1.6)"/>' % (O, x, 400 + dy, r) + label(x, 445, lb, 13), label="Sobrancelha · " + lb)
lib += label(40, 370, "SOBRANCELHAS", 18).replace('text-anchor="middle"', 'text-anchor="start"')
# acessórios
lib += label(40, 490, "ACESSÓRIOS E EFEITOS", 18).replace('text-anchor="middle"', 'text-anchor="start"')
lib += m.pencil(T(70, 600, 30), "lib-lapis") + m.book_open(T(230, 600), "lib-livro-aberto") + \
       m.book_closed(T(470, 610, 0, .7, .7), "lib-livro-fechado") + m.sheet(T(660, 600), "lib-folha") + \
       m.sheet(T(760, 600), "lib-folha-aprovada", check=True) + m.magnifier(T(870, 590), "lib-lupa") + \
       G("lib-marcador", m.bookmark().replace('id="marcador"', 'id="lib-marcador-arte"'), "translate(822 530)") + \
       m.fx_idea(T(1120, 600)).replace('id="fx-ideia"', 'id="lib-ideia"') + \
       m.fx_zzz(T(1220, 640)).replace('id="fx-zzz"', 'id="lib-zzz"')
comp = ('<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" '
        'viewBox="0 0 1340 700" width="1340" height="700"><title>Componentes reutilizáveis</title>'
        '<rect width="1340" height="700" fill="#FFFDF8"/>%s</svg>' % lib)
save("svg/componentes/biblioteca-componentes.svg", comp)
png("svg/componentes/biblioteca-componentes.svg", "png/biblioteca-componentes.png", 2010)

# avatar para tamanhos pequenos ------------------------------------------------------------
KY, Y0 = 0.74, 86
def wy(d):
    return re.sub(r"(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)",
                  lambda mm: "%s %s" % (mm.group(1), f(Y0 + (float(mm.group(2)) - Y0) * KY)), d)
av_body = ('<path d="%s" fill="%s"/><path d="%s" fill="%s" opacity="0.8"/><path d="%s" fill="%s" opacity="0.45"/>'
           '<path d="%s" fill="%s" opacity="0.22"/><path d="%s" fill="none" stroke="%s" stroke-width="9" stroke-linejoin="round"/>'
           '<path d="%s" fill="%s" stroke="%s" stroke-width="6" stroke-linejoin="round"/>' % (
               wy(m.BODY_D), CR, wy(m.SHADE_R), LAV, wy(m.SHADE_L), LAV, m.FOLD_SHADOW, P, wy(m.BODY_D), O, m.FOLD_D, LAV, O))
av_face = m.face(dict(m.EXPRESSIONS["feliz"], face=(0, -8)))
avatar = ('<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" '
          'viewBox="74 52 262 262" width="262" height="262"><title>Mascote · avatar</title>%s</svg>'
          % G("avatar", G("avatar-corpo", av_body, label="Corpo compacto") + m.bookmark() + av_face, label="Avatar", layer=True))
save("svg/mascote-avatar.svg", avatar)
for w in (32, 64, 128, 256, 512):
    png("svg/mascote-avatar.svg", "png/avatar/mascote-avatar-%dpx.png" % w, w)

# rive: estado base limpo + partes trocáveis -------------------------------------------------
save("rive/mascote-rive-base.svg", m.svg_doc(m.character("padrao", show_props=False), VB, "Mascote · base Rive"))
for k, (lb, art) in m.MOUTHS.items():
    save("rive/bocas/boca-%s.svg" % k, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 60 60" width="60" height="60">'
         '<g id="boca-%s">%s</g></svg>' % (k, art))
for side in "RL":
    e = m.EYES[side]
    for k, st in [("aberto", {}), ("feliz", dict(eyes="feliz")), ("sono", dict(eyes="sono"))]:
        ey = m.eye(side, dict(st, pupil=(0, 0))).replace(' style="display:none"', '')
        # mantém só o estado pedido
        ey = re.sub(r'<g id="olho-%s-(aberto|feliz|sono)"[^>]*>' % side, lambda mm: mm.group(0), ey)
        part = m.eye(side, dict(st, pupil=(0, 0)))
        part = re.sub(r'transform="translate\([^)]*\)"', 'transform="translate(60 60)"', part, count=1)
        i_a, i_f, i_s = (part.index('<g id="olho-%s-%s"' % (side, n)) for n in ("aberto", "feliz", "sono"))
        end = part.rindex("</g>")
        segs = {"aberto": part[i_a:i_f], "feliz": part[i_f:i_s], "sono": part[i_s:end]}
        part = part[:i_a] + segs[k].replace(' style="display:none"', '') + "</g>"
        save("rive/olhos/olho-%s-%s.svg" % (side, k), '<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 120 120" width="120" height="120">%s</svg>' % part)

# dados para o rig web ---------------------------------------------------------------------
web_data = {"eyes": m.EYES, "expressions": {k: {kk: vv for kk, vv in v.items() if kk != "fx" or True}
                                              for k, v in m.EXPRESSIONS.items()},
            "mouths": list(m.MOUTHS.keys()), "palette": m.PALETTE, "pivots": m.PIV}
save("web/mascote-dados.json", json.dumps(web_data, ensure_ascii=False, indent=1))
shutil.copy("src/mascote-rig.js", os.path.join(OUT, "web/mascote-rig.js"))
shutil.copy("src/LEIA-ME.md", OUT); shutil.copy("src/GUIA-DE-IDENTIDADE.md", OUT)
shutil.copy("src/LEIA-RIVE.md", os.path.join(OUT, "rive"))
shutil.copy("svg_placeholder", OUT) if False else None
os.makedirs(os.path.join(OUT, "fonte"), exist_ok=True)
for fn in ("mascot.py", "build.py"): shutil.copy(fn, os.path.join(OUT, "fonte"))
shutil.copy(os.path.join(OUT, "svg/mascote-rig-camadas.svg"), os.path.join(OUT, "rive/mascote-rig-camadas.svg"))
print("ok")
