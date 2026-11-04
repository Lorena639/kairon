/* KAIRON · Intro del logo (JavaScript puro, sin librerías)
   Nada más cargar la página:
   1. Miles de partículas doradas se arremolinan y convergen hasta formar el logo completo
      (las posiciones salen de leer los píxeles del PNG del logo en un canvas).
   2. Las partículas se funden con el logo real, con acabado de oro metálico.
   3. Un destello recorre el logo y un brillo salta en la esfera de la brújula.
   4. El logo se encoge y vuela hasta su sitio en la cabecera mientras se abren las cortinas.
   Todo con canvas 2D, transform y opacity: nada que fuerce reflow durante la animación. */

(function () {
  const carga = document.querySelector(".carga");
  const lienzo = carga && carga.querySelector(".intro__lienzo");
  const logoFinal = carga && carga.querySelector(".intro__logo");
  const fogonazo = carga && carga.querySelector(".intro__fogonazo");
  const lente = carga && carga.querySelector(".intro__lente");
  const eslogan = carga && carga.querySelector(".intro__eslogan");
  if (!carga || !lienzo || !logoFinal) return;

  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = lienzo.getContext("2d", { alpha: true });
  const raiz = document.documentElement.dataset.raiz || "./";
  const ORO = [[212, 175, 122], [233, 207, 160], [255, 243, 214], [140, 107, 63]];

  // Facilidades de easing (sin librerías)
  const expoOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const cubicInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  // Sprites de partícula pre-dibujados (un círculo suave por tono de oro) para no calcular degradados por fotograma
  const sprites = ORO.map(([r, g, b]) => {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const x = c.getContext("2d");
    const grad = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.35, `rgba(${r},${g},${b},0.85)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = grad;
    x.fillRect(0, 0, 32, 32);
    return c;
  });

  let particulas = [];
  let ancho = 0, alto = 0, dpr = 1;
  let objetivo = { x: 0, y: 0, w: 0, h: 0 }; // rectángulo del logo en pantalla
  let listo = false;

  const imagen = new Image();
  imagen.src = raiz + "img/kairon-logo-dorado.png";

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth;
    alto = window.innerHeight;
    lienzo.width = Math.round(ancho * dpr);
    lienzo.height = Math.round(alto * dpr);
    lienzo.style.width = ancho + "px";
    lienzo.style.height = alto + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = Math.min(ancho * 0.6, 560);
    const h = w * (imagen.naturalHeight / imagen.naturalWidth || 0.9);
    objetivo = { x: (ancho - w) / 2, y: (alto - h) / 2 - alto * 0.04, w, h };
    logoFinal.style.width = w + "px";
    logoFinal.style.left = objetivo.x + "px";
    logoFinal.style.top = objetivo.y + "px";
  }

  // Lee el PNG en un canvas pequeño y guarda las coordenadas de los píxeles opacos
  function muestrear() {
    const paso = ancho < 720 ? 4 : 3; // separación entre partículas en píxeles de pantalla
    const cols = Math.floor(objetivo.w / paso);
    const filas = Math.floor(objetivo.h / paso);
    const c = document.createElement("canvas");
    c.width = cols;
    c.height = filas;
    const cx = c.getContext("2d", { willReadFrequently: true });
    cx.drawImage(imagen, 0, 0, cols, filas);
    const datos = cx.getImageData(0, 0, cols, filas).data;
    particulas = [];
    const centroX = ancho / 2, centroY = alto / 2;
    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < cols; x++) {
        const a = datos[(y * cols + x) * 4 + 3];
        if (a < 90) continue;
        const tx = objetivo.x + x * paso + paso / 2;
        const ty = objetivo.y + y * paso + paso / 2;
        // Posición de partida: un anillo amplio alrededor del centro, con giro
        const ang = Math.random() * Math.PI * 2;
        const radio = Math.max(ancho, alto) * (0.35 + Math.random() * 0.45);
        const color = Math.random() < 0.12 ? 2 : Math.random() < 0.5 ? 0 : 1; // índice del tono
        particulas.push({
          sx: centroX + Math.cos(ang) * radio,
          sy: centroY + Math.sin(ang) * radio,
          tx, ty,
          giro: (Math.random() < 0.5 ? -1 : 1) * (1.8 + Math.random() * 2.2), // vórtice: todas giran, en uno u otro sentido
          retraso: Math.hypot(tx - centroX, ty - centroY) / Math.hypot(objetivo.w, objetivo.h) * 0.35 + Math.random() * 0.2,
          tam: 1.4 + Math.random() * 1.6,
          color,
        });
      }
    }
  }

  function dibujar(progreso, alfaGlobal) {
    ctx.clearRect(0, 0, ancho, alto);
    ctx.globalCompositeOperation = "lighter";
    const centroX = ancho / 2, centroY = alto / 2;
    for (let i = 0; i < particulas.length; i++) {
      const p = particulas[i];
      const t = expoOut(clamp01((progreso - p.retraso) / (1 - p.retraso)));
      // Trayectoria curva: interpola en polares respecto al centro para que "orbiten" al llegar
      const ax = p.sx - centroX, ay = p.sy - centroY;
      const bx = p.tx - centroX, by = p.ty - centroY;
      const angA = Math.atan2(ay, ax) + p.giro * (1 - t);
      const rA = Math.hypot(ax, ay);
      const x = centroX + (Math.cos(angA) * rA) * (1 - t) + bx * t;
      const y = centroY + (Math.sin(angA) * rA) * (1 - t) + by * t;
      const s = p.tam * (1 + (1 - t) * 1.5);
      const a = alfaGlobal * (0.25 + 0.75 * t);
      ctx.globalAlpha = a;
      ctx.drawImage(sprites[p.color], x - s * 2, y - s * 2, s * 4, s * 4);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // Vuelo final del logo hasta la cabecera
  function volarACabecera() {
    const destino = document.querySelector(".cabecera .logo");
    if (!destino) return;
    const r = destino.getBoundingClientRect();
    // El logo de la cabecera es horizontal; el de la intro es apilado: escalamos por anchura del emblema
    const escala = (r.height * 1.9) / objetivo.h;
    const dx = r.left + r.width * 0.12 - (objetivo.x + objetivo.w / 2);
    const dy = r.top + r.height / 2 - (objetivo.y + objetivo.h / 2);
    logoFinal.style.transition = "transform 1s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.4s ease 0.7s";
    logoFinal.style.transform = `translate(${dx}px, ${dy}px) scale(${escala})`;
    logoFinal.style.opacity = "0";
  }

  function empezar(alTerminar) {
    if (reducido) { alTerminar(); return; }
    carga.classList.add("intro-activa");
    medir();
    muestrear();
    const inicio = performance.now();
    const D_PARTICULAS = 3200, D_FUNDIDO = 600, D_DESTELLO = 1300, D_PAUSA = 1500;
    // Posición del destello: la esfera de la brújula del emblema (proporciones del PNG del logo)
    if (lente) { lente.style.left = (objetivo.x + objetivo.w * 0.503) + "px"; lente.style.top = (objetivo.y + objetivo.h * 0.105) + "px"; }
    if (eslogan) { eslogan.style.top = (objetivo.y + objetivo.h + 28) + "px"; eslogan.textContent = ""; }
    let letrasEslogan = 0;
    const textoEslogan = (eslogan && eslogan.dataset.texto) || "";
    let fase = 0;
    function cuadro(ahora) {
      const t = ahora - inicio;
      if (t < D_PARTICULAS) {
        dibujar(t / D_PARTICULAS, 1);
      } else if (t < D_PARTICULAS + D_FUNDIDO) {
        const f = (t - D_PARTICULAS) / D_FUNDIDO;
        if (fase === 0) {
          fase = 1;
          logoFinal.classList.add("visible");
          if (fogonazo) fogonazo.classList.add("activo");
        }
        dibujar(1, 1 - cubicInOut(f));
      } else if (t < D_PARTICULAS + D_FUNDIDO + D_DESTELLO) {
        if (fase === 1) {
          fase = 2;
          ctx.clearRect(0, 0, ancho, alto);
          logoFinal.classList.add("destello");
          if (lente) setTimeout(() => lente.classList.add("activo"), 500);
        }
      } else if (t < D_PARTICULAS + D_FUNDIDO + D_DESTELLO + D_PAUSA) {
        // pausa con el logo completo: se escribe el eslogan letra a letra
        if (eslogan) {
          eslogan.classList.add("activo");
          const n = Math.min(textoEslogan.length, Math.floor((t - D_PARTICULAS - D_FUNDIDO - D_DESTELLO) / 55));
          if (n !== letrasEslogan) { letrasEslogan = n; eslogan.textContent = textoEslogan.slice(0, n).toUpperCase(); }
        }
      } else {
        if (fase === 2) { fase = 3; if (eslogan) eslogan.style.opacity = "0"; volarACabecera(); alTerminar(); }
        return;
      }
      programar(cuadro);
    }
    programar(cuadro);
  }

  // Programa el siguiente fotograma con rAF y, si no llega en 60 ms, con un temporizador
  function programar(fn) {
    let hecho = false;
    const id = requestAnimationFrame((t) => { if (!hecho) { hecho = true; clearTimeout(tm); fn(t); } });
    const tm = setTimeout(() => { if (!hecho) { hecho = true; cancelAnimationFrame(id); fn(performance.now()); } }, 60);
  }

  window.addEventListener("resize", () => { if (carga.classList.contains("intro-activa")) { medir(); } });
  imagen.onload = () => { listo = true; };

  window.kaironIntro = {
    start(alTerminar) {
      if (listo) empezar(alTerminar);
      else {
        imagen.addEventListener("load", () => empezar(alTerminar), { once: true });
        imagen.addEventListener("error", alTerminar, { once: true }); // si falla el PNG, entra la web igualmente
      }
    },
  };
})();
