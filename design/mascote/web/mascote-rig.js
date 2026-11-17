/*!
 * MascoteRig — anima o SVG modular do mascote (web/mascote-rig.svg) sem dependências.
 * Uso:
 *   const rig = new MascoteRig(svgElement, dados);   // dados = conteúdo de mascote-dados.json
 *   rig.play("idle");  rig.setExpression("curioso");  rig.stop();
 * Animações: idle, blink, wave, thinking, reading, writing, celebrate, sad, sleep, walk
 * Respeita prefers-reduced-motion (mostra a pose estática).
 */
(function (global) {
  "use strict";
  const TAU = Math.PI * 2;

  function eyelidD(rx, ry, c) {
    if (c <= 0.001) return "";
    c = Math.min(c, 0.999);
    const y = -ry + 2 * ry * c, hx = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2));
    return `M ${-hx} ${y} A ${rx} ${ry} 0 ${c > 0.5 ? 1 : 0} 1 ${hx} ${y} Z`;
  }
  function lidLineD(rx, ry, c) {
    if (c <= 0.001) return "";
    c = Math.min(c, 0.999);
    const y = -ry + 2 * ry * c, hx = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2));
    return `M ${-hx} ${y} Q 0 ${y + 3} ${hx} ${y}`;
  }
  // piscada: 0 → 1 → 0 em ~0,18 s, a cada `period` segundos
  function blink(t, period, offset = 0.4) {
    const ph = (t + offset) % period, d = 0.18;
    return ph < d ? Math.sin(Math.PI * ph / d) : 0;
  }
  const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));

  const SLEEP = { nome: "Dormindo", eyes: "sono", mouth: "sono", face: [0, 4], brow_R: [4, -6], brow_L: [4, 6], blush: true, face_rot: -8 };
  const MOUTH_SCALE = 1.25;

  class MascoteRig {
    constructor(svg, data) {
      this.svg = svg; this.data = data;
      this.state = {}; this.anim = null; this.raf = null; this.override = null;
      this.reduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this._tick = this._tick.bind(this);
    }
    q(id) { return this.svg.querySelector("#" + id); }
    show(id, on) { const el = this.q(id); if (el) el.style.display = on ? "" : "none"; }

    /** Define a transformação de uma articulação em relação ao seu pivô (data-pivot). */
    joint(id, { x = 0, y = 0, r = 0, sx = 1, sy = 1 } = {}) {
      const el = this.q(id); if (!el) return;
      const [px, py] = (el.dataset.pivot || "0,0").split(",").map(Number);
      if (id === "boca") { sx *= MOUTH_SCALE; sy *= MOUTH_SCALE; }
      el.setAttribute("transform", `translate(${px + x} ${py + y}) rotate(${r}) scale(${sx} ${sy})`);
    }
    lid(side, c) {
      const el = this.q("palpebra-" + side); if (!el) return;
      const rx = +el.dataset.rx, ry = +el.dataset.ry;
      el.querySelector(".lid-fill").setAttribute("d", eyelidD(rx, ry, c));
      el.querySelector(".lid-line").setAttribute("d", lidLineD(rx, ry, c));
    }
    pupil(side, x, y, s = 1) {
      this.q("pupila-" + side).setAttribute("transform", `translate(${x} ${y}) scale(${s} ${s})`);
    }

    /** Aplica uma expressão (nome da biblioteca ou objeto com os mesmos campos). */
    setExpression(e) {
      if (typeof e === "string") e = e === "dormindo" ? SLEEP : this.data.expressions[e];
      const st = {
        eyes: e.eyes || "aberto", mouth: e.mouth || "sorriso-aberto", blush: !!e.blush, fx: e.fx || null,
        lid: typeof e.lid === "object" && e.lid ? e.lid : { R: e.lid || 0, L: e.lid || 0 },
        pupil: e.pupil && !Array.isArray(e.pupil) ? e.pupil : { R: e.pupil || [0, 0], L: e.pupil || [0, 0] },
        pupilScale: e.pupil_scale || 1, face: e.face || [0, 0], faceRot: e.face_rot || 0,
        browR: e.brow_R || [0, 0], browL: e.brow_L || [0, 0],
      };
      this.state = st;
      for (const s of ["R", "L"]) {
        for (const m of ["aberto", "feliz", "sono"]) this.show(`olho-${s}-${m}`, st.eyes === m);
      }
      for (const m of this.data.mouths) this.show("boca-" + m, m === st.mouth);
      this.show("bochechas", st.blush);
      this.show("fx-expr-interrogacao", st.fx === "interrogacao");
      this.show("fx-expr-lagrima", st.fx === "lagrima");
      this.face(); this.eyes(); this.joint("boca");
      return st;
    }
    face(dx = 0, dy = 0, dr = 0) {
      const st = this.state;
      this.joint("rosto", { x: st.face[0] + dx, y: st.face[1] + dy, r: st.faceRot + dr });
      this.joint("sobrancelha-R", { y: st.browR[0], r: st.browR[1] });
      this.joint("sobrancelha-L", { y: st.browL[0], r: st.browL[1] });
    }
    eyes(blinkAmt = 0, look = [0, 0]) {
      const st = this.state;
      for (const s of ["R", "L"]) {
        this.lid(s, Math.max(st.lid[s] || 0, blinkAmt));
        const p = st.pupil[s];
        this.pupil(s, p[0] + look[0], p[1] + look[1], st.pupilScale);
      }
    }

    /** Pose neutra (a mesma do arquivo principal). */
    reset() {
      this.joint("rig"); this.joint("corpo"); this.joint("marcador"); this.joint("sombra");
      this.joint("braco-R", { r: 12 }); this.joint("braco-L", { r: -12 });
      this.joint("mao-R"); this.joint("mao-L");
      this.joint("perna-R"); this.joint("perna-L");
      ["lapis-escrita-wrap", "prop-folha", "prop-livro", "fx-lib-zzz", "fx-lib-confete", "fx-lib-ideia", "fx-lib-brilho"]
        .forEach((id) => this.show(id, false));
      this.show("lapis", true);
      ["fx-lib-zzz", "fx-lib-confete", "fx-lib-ideia", "fx-lib-brilho"].forEach((id) => {
        const el = this.q(id); if (el) { el.removeAttribute("transform"); el.style.opacity = ""; }
      });
      this.setExpression(this.override || "feliz");
    }
    breathe(t, amp = 0.018, period = 2.4) {
      const b = Math.sin(TAU * t / period);
      this.joint("corpo", { sx: 1 - amp * 0.5 * b, sy: 1 + amp * b });
      return b;
    }

    play(name) {
      const a = ANIMS[name]; if (!a) throw new Error("Animação desconhecida: " + name);
      this.stop(); this.reset();
      if (a.expr) this.setExpression(this.override && a.allowOverride ? this.override : a.expr);
      if (a.setup) a.setup(this);
      this.anim = a; this.t0 = performance.now();
      if (this.reduced) { a.update(this, 0.6); return; }
      this.raf = requestAnimationFrame(this._tick);
    }
    stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; }
    _tick(now) {
      this.anim.update(this, (now - this.t0) / 1000);
      this.raf = requestAnimationFrame(this._tick);
    }
  }

  const fxFloat = (rig, id, t, amp = 6, period = 2) => {
    const el = rig.q(id); if (!el) return;
    el.setAttribute("transform", `translate(0 ${-amp * Math.sin(TAU * t / period)})`);
  };

  const ANIMS = {
    idle: { expr: "feliz", allowOverride: true, update(r, t) {
      const b = r.breathe(t);
      r.joint("marcador", { r: 3 * Math.sin(TAU * t / 2.4 + 1) });
      r.joint("braco-R", { r: 12 + 2.5 * b }); r.joint("braco-L", { r: -12 - 2.5 * b });
      r.joint("sombra", { sx: 1 + 0.015 * b });
      r.eyes(blink(t, 3.4), [2 * Math.sin(t * 0.6), 1.5 * Math.sin(t * 0.43)]);
    } },
    blink: { expr: "feliz", allowOverride: true, update(r, t) {
      r.breathe(t, 0.008);
      const k = Math.floor(t / 1.4) % 3 === 2 ? Math.max(blink(t, 1.4), blink(t - 0.26, 1.4)) : blink(t, 1.4); // piscada dupla de vez em quando
      r.eyes(k);
    } },
    wave: { expr: "muito-feliz", setup(r) { r.show("fx-lib-brilho", true); }, update(r, t) {
      const w = Math.sin(TAU * t * 1.6), up = ease(t / 0.35);
      r.breathe(t, 0.01);
      r.joint("braco-L", { r: -12 + up * (-138 + 12 * w) });
      r.joint("mao-L", { r: up * (-12 + 22 * Math.sin(TAU * t * 1.6 + 0.7)) });
      r.joint("corpo", { r: -3 * up + 1.2 * w * up });
      r.joint("perna-R", { r: -3 }); r.joint("perna-L", { r: 3 });
      r.q("fx-lib-brilho").style.opacity = 0.55 + 0.45 * Math.sin(TAU * t * 1.6);
    } },
    thinking: { expr: "pensativo", setup(r) { r.show("fx-lib-ideia", true); r.show("lapis", false); }, update(r, t) {
      r.breathe(t, 0.012, 3);
      const up = ease(t / 0.45);
      r.joint("braco-R", { r: 12 + up * (-107) });
      r.joint("mao-R", { r: 10 * Math.sin(TAU * t * 1.1) });
      r.joint("braco-L", { r: -14 });
      r.joint("corpo", { r: -2 + Math.sin(TAU * t / 3) });
      r.eyes(blink(t, 4.2), [5 * Math.sin(t * 0.9), -1 + 2 * Math.sin(t * 0.6)]);
      fxFloat(r, "fx-lib-ideia", t, 5, 1.8);
      r.q("fx-lib-ideia").style.opacity = ease((t - 0.8) / 0.4);
    } },
    reading: { expr: { ...{ pupil: [-2, 9], mouth: "sorriso", brow_L: [-4, -4] } }, setup(r) {
      r.show("prop-folha", true); r.show("lapis", false);
    }, update(r, t) {
      r.breathe(t, 0.01, 3);
      r.joint("braco-R", { r: -52.8 }); r.joint("braco-L", { r: 48.8 });
      const line = 2.2, ph = (t % line) / line, row = Math.floor(t / line) % 3;
      const x = ph < 0.85 ? -12 + 22 * (ph / 0.85) : 10 - 22 * ((ph - 0.85) / 0.15);
      r.eyes(blink(t, 5), [x + 2, -4 + 4 * row]);
      r.face(0.6 * x * 0.2, 0);
    } },
    writing: { expr: "concentrado", setup(r) {
      r.show("prop-folha", true); r.show("lapis-escrita-wrap", true); r.show("lapis", false);
    }, update(r, t) {
      r.breathe(t, 0.008, 3);
      const w = Math.sin(TAU * t * 2.4);
      r.joint("corpo", { r: 2 });
      r.joint("braco-R", { r: -47 });
      r.joint("braco-L", { r: 52 + 7 * w });
      r.joint("mao-L", { r: 30 + 10 * Math.sin(TAU * t * 4.8) });
      r.eyes(blink(t, 4.6), [-3 + 4 * w, 2]);
    } },
    celebrate: { expr: "muito-feliz", setup(r) { r.show("fx-lib-confete", true); r.show("lapis", false); }, update(r, t) {
      const P = 0.9, p = (t % P) / P, air = p < 0.72;
      const h = air ? Math.sin(Math.PI * p / 0.72) : 0;
      const sq = air ? 0 : Math.sin(Math.PI * (p - 0.72) / 0.28);
      r.joint("rig", { y: -52 * h });
      r.joint("corpo", { sx: 1 + 0.07 * sq - 0.03 * h, sy: 1 - 0.09 * sq + 0.04 * h });
      r.joint("braco-R", { r: 160 + 12 * Math.sin(TAU * t * 2.2) });
      r.joint("braco-L", { r: -160 - 12 * Math.sin(TAU * t * 2.2) });
      r.joint("perna-R", { r: 12 * h }); r.joint("perna-L", { r: -12 * h });
      r.joint("sombra", { sx: 1 - 0.35 * h });
      r.joint("marcador", { r: -10 * h });
      const c = r.q("fx-lib-confete");
      c.setAttribute("transform", `translate(200 ${200 + 10 * Math.sin(TAU * t)}) rotate(${4 * Math.sin(TAU * t * 0.7)}) translate(-200 -200)`);
    } },
    sad: { expr: "triste", update(r, t) {
      r.breathe(t, 0.02, 4);
      const s = Math.sin(TAU * t / 4);
      r.joint("corpo", { r: -4 + s, sx: 1.01, sy: 0.98 });
      r.joint("braco-R", { r: -6 }); r.joint("braco-L", { r: 6 });
      r.joint("marcador", { r: -16 + 2 * s });
      r.face(0, 6 + s, 0);
      r.eyes(blink(t, 5, 1) * 0.8, [0, 1 + s]);
    } },
    sleep: { expr: SLEEP, setup(r) { r.show("fx-lib-zzz", true); }, update(r, t) {
      const b = r.breathe(t, 0.03, 3.6);
      r.joint("corpo", { r: -3, sx: 1 - 0.015 * b, sy: 1 + 0.03 * b });
      r.joint("marcador", { r: -14 + 2 * b });
      r.joint("braco-R", { r: 6 }); r.joint("braco-L", { r: -6 });
      r.joint("boca", { sx: 1 + 0.25 * b, sy: 1 + 0.35 * b });
      fxFloat(r, "fx-lib-zzz", t, 8, 3.6);
      r.q("fx-lib-zzz").style.opacity = 0.6 + 0.4 * Math.sin(TAU * t / 3.6);
    } },
    walk: { expr: { pupil: [7, 0], mouth: "sorriso" }, update(r, t) {
      const ph = TAU * t / 0.8, s = Math.sin(ph);
      r.joint("perna-R", { y: -10 * Math.max(0, s), r: 8 * s });
      r.joint("perna-L", { y: -10 * Math.max(0, -s), r: 8 * s });
      r.joint("rig", { y: -5 * Math.abs(Math.sin(ph)) });
      r.joint("corpo", { r: 3 * s });
      r.joint("braco-R", { r: 14 + 16 * s }); r.joint("braco-L", { r: -14 + 16 * s });
      r.joint("marcador", { r: -4 * s });
      r.joint("sombra", { sx: 1 - 0.04 * Math.abs(s) });
      r.eyes(blink(t, 3.8), [0, 0]);
    } },
  };

  MascoteRig.ANIMATIONS = Object.keys(ANIMS);
  MascoteRig.eyelidD = eyelidD;
  global.MascoteRig = MascoteRig;
})(typeof window !== "undefined" ? window : globalThis);
