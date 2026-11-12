/* KAIRON · Intro del logo (JavaScript puro, sin librerías) · v6
   Nada más cargar la portada, en menos de 3 segundos:
   1. Oscuridad y un solo punto de oro: el instante.
   2. Del punto sale un vórtice de partículas que forja el logo en relieve
      (las posiciones salen de leer los píxeles del PNG oficial en un canvas; el logo no se redibuja).
   3. Las partículas se funden con el logo real y un barrido de luz cruza sus biseles.
   4. Zambullida: el emblema 3D de la escena (js/mundo.js) aparece calcado sobre el del logo (misma caja,
      mismos píxeles), el logo 2D se desvanece y la cámara se retira: el emblema ya es el centro del
      globo del radar. Sin corte y sin salto.
      (Si no hay escena 3D, el logo vuela a la cabecera como antes.)
   Se puede saltar con clic, tecla, rueda o toque; solo se ve una vez por sesión y un temporizador
   de seguridad garantiza que nunca se queda colgada.
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
  imagen.src = raiz + "img/relieve/kairon-relieve-logo.png"; // logo con relieve de la hoja de marca

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
        // Posición de partida: el punto de oro del centro (un radio mínimo, para que no nazcan apiladas)
        const ang = Math.random() * Math.PI * 2;
        const radio = 2 + Math.random() * 10;
        const color = Math.random() < 0.12 ? 2 : Math.random() < 0.5 ? 0 : 1; // índice del tono
        particulas.push({
          sx: centroX + Math.cos(ang) * radio,
          sy: centroY + Math.sin(ang) * radio,
          tx, ty,
          giro: 2.4 + Math.random() * 2.6, // vórtice: todas giran en el mismo sentido, como un remolino
          vuelo: Math.max(ancho, alto) * (0.12 + Math.random() * 0.3), // cuánto se abren antes de caer a su sitio
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
      // En polares: el ángulo se desenrolla hacia el del destino y el radio se abre y vuelve a cerrarse
      const angB = Math.atan2(by, bx);
      const rB = Math.hypot(bx, by);
      const rA = Math.hypot(ax, ay);
      const ang = angB - p.giro * (1 - t);
      const r = rA + (rB - rA) * t + Math.sin(Math.PI * t) * p.vuelo;
      const x = centroX + Math.cos(ang) * r;
      const y = centroY + Math.sin(ang) * r;
      const s = p.tam * (1 + (1 - t) * 1.5);
      const a = alfaGlobal * (0.35 + 0.65 * t);
      ctx.globalAlpha = a;
      ctx.drawImage(sprites[p.color], x - s * 2, y - s * 2, s * 4, s * 4);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // El punto de oro: el instante. Crece, late una vez y de él nace el vórtice
  function dibujarPunto(t, alfa) {
    const cx = ancho / 2, cy = alto / 2;
    const e = expoOut(clamp01(t));
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alfa;
    const r = 6 + e * 26;
    ctx.drawImage(sprites[2], cx - r, cy - r, r * 2, r * 2);
    ctx.globalAlpha = alfa * 0.55;
    const largo = 20 + e * Math.min(ancho, 900) * 0.2; // destello horizontal fino, como una lente
    ctx.drawImage(sprites[1], cx - largo, cy - 1.5, largo * 2, 3);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // Zambullida: la escena 3D arranca con su emblema exactamente encima del emblema de este logo (misma
  // posición, misma escala y los mismos píxeles: los dos salen del mismo PNG). El logo 2D se queda quieto y
  // se desvanece; cuando ya solo se ve el emblema 3D, la cámara se retira y el globo crece a su alrededor.
  function zambullir() {
    const mundo = window.kaironMundo;
    if (!document.querySelector(".mundo") || !mundo || mundo.ligero) return false;
    // Se congela la escala que lleve el logo en ese momento (la animación CSS de acercamiento manda sobre el estilo)
    const escalaActual = getComputedStyle(logoFinal).transform;
    logoFinal.style.animation = "none";
    logoFinal.style.transform = escalaActual === "none" ? "scale(1)" : escalaActual;
    const img = logoFinal.querySelector("img") || logoFinal;
    const r = img.getBoundingClientRect(); // ya incluye la escala congelada
    const c = mundo.recorte || { w: 546, h: 482, x: 45, y: 0, rw: 431, rh: 360 };
    carga.classList.add("intro-zambullida");
    mundo.entrada({ left: r.left + r.width * (c.x / c.w), top: r.top + r.height * (c.y / c.h), width: r.width * (c.rw / c.w), height: r.height * (c.rh / c.h) });
    void logoFinal.offsetWidth; // fuerza el estilo de partida antes de la transición
    // El velo se aclara en 0,28 s (CSS); el logo 2D empieza a irse cuando ya se ve el emblema 3D debajo
    logoFinal.style.transition = "opacity 0.32s cubic-bezier(0.4, 0, 0.6, 1) 0.22s";
    logoFinal.style.opacity = "0";
    return true;
  }

  // Vuelo final del logo hasta la cabecera (respaldo sin escena 3D)
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
    // Ventana sin tamaño (por ejemplo, oculta): no hay nada que dibujar y entra la web igualmente
    if (objetivo.w < 8 || objetivo.h < 8) { alTerminar(); return; }
    muestrear();
    const inicio = performance.now();
    // Duraciones cortas: la intro entera dura unos 3 s (antes, casi 7 s) y se puede saltar
    const D_PUNTO = 380, D_PARTICULAS = 1300, D_FUNDIDO = 300, D_DESTELLO = 560, D_PAUSA = 260;
    // Posición del destello: la esfera de la brújula del emblema (proporciones del PNG del logo)
    if (lente) { lente.style.left = (objetivo.x + objetivo.w * 0.495) + "px"; lente.style.top = (objetivo.y + objetivo.h * 0.128) + "px"; }
    if (eslogan) { eslogan.style.top = (objetivo.y + objetivo.h + 28) + "px"; eslogan.textContent = ""; }
    let letrasEslogan = 0;
    const textoEslogan = (eslogan && eslogan.dataset.texto) || "";
    let fase = 0;
    let saltada = false;
    // Saltar la intro: clic, toque, rueda o cualquier tecla llevan directamente a la web
    const eventosSalto = ["pointerdown", "keydown", "wheel", "touchstart"];
    function saltar() {
      if (saltada || fase === 3) return;
      saltada = true;
      terminar();
    }
    eventosSalto.forEach((ev) => window.addEventListener(ev, saltar, { passive: true }));
    // Cada fase se activa en cuanto ha pasado su hora, aunque un fotograma lento se salte su ventana:
    // así la intro nunca se queda colgada (antes podía bloquear la página en equipos lentos).
    const T0 = D_PUNTO, T1 = T0 + D_PARTICULAS, T2 = T1 + D_FUNDIDO, T3 = T2 + D_DESTELLO, T4 = T3 + D_PAUSA;
    function terminar() {
      if (fase === 3) return;
      fase = 3;
      clearTimeout(vigilante);
      eventosSalto.forEach((ev) => window.removeEventListener(ev, saltar));
      ctx.clearRect(0, 0, ancho, alto);
      logoFinal.classList.add("visible");
      if (eslogan) eslogan.style.opacity = "0";
      if (!zambullir()) volarACabecera();
      alTerminar();
    }
    // Temporizador de seguridad: pase lo que pase, la web entra como mucho 1,5 s después de lo previsto
    const vigilante = setTimeout(() => { saltada = true; terminar(); }, T4 + 1500);
    function cuadro(ahora) {
      if (saltada || fase === 3) return;
      const t = ahora - inicio;
      if (t < T1) {
        dibujar(clamp01((t - T0 * 0.55) / (T1 - T0 * 0.55)), 1);
        if (t < T0 + 320) dibujarPunto(t / T0, t < T0 ? 1 : 1 - (t - T0) / 320);
      }
      if (t >= T1 && fase === 0) {
        fase = 1;
        logoFinal.classList.add("visible");
        if (fogonazo) fogonazo.classList.add("activo");
      }
      if (t >= T1 && t < T2) dibujar(1, 1 - cubicInOut((t - T1) / D_FUNDIDO));
      if (t >= T2 && fase === 1) {
        fase = 2;
        ctx.clearRect(0, 0, ancho, alto);
        logoFinal.classList.add("destello");
        if (lente) setTimeout(() => lente.classList.add("activo"), 180);
      }
      if (t >= T2 && t < T4 && eslogan) {
        // con el logo ya forjado se escribe el eslogan letra a letra
        eslogan.classList.add("activo");
        const n = Math.min(textoEslogan.length, Math.floor((t - T2) / 30));
        if (n !== letrasEslogan) { letrasEslogan = n; eslogan.textContent = textoEslogan.slice(0, n).toUpperCase(); }
      }
      if (t >= T4) { terminar(); return; }
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

  // La intro completa solo se ve la primera vez de cada sesión; al volver a la portada se entra directamente
  let vista = false;
  try { vista = sessionStorage.getItem("kairon-intro") === "1"; } catch (e) {}
  if (/[?&]intro\b/.test(location.search)) vista = false; // ?intro la repite (para ensayar la presentación)

  window.kaironIntro = {
    vista,
    start(alTerminarWeb) {
      try { sessionStorage.setItem("kairon-intro", "1"); } catch (e) {}
      // Al acabar la intro se avisa a escena.js, que espera a ese momento para cargar Three.js
      let avisado = false;
      const alTerminar = () => {
        if (avisado) return;
        avisado = true;
        window.dispatchEvent(new Event("kairon-intro-fin"));
        alTerminarWeb();
      };
      if (listo) empezar(alTerminar);
      else {
        imagen.addEventListener("load", () => empezar(alTerminar), { once: true });
        imagen.addEventListener("error", alTerminar, { once: true }); // si falla el PNG, entra la web igualmente
      }
    },
  };
})();
