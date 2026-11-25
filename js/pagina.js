/* KAIRON · el paisaje de las páginas interiores
   Cada página interior es una hora de la noche (atributos data-hora y data-tono en <html>, que pone
   tools/interiores.py). Su cabecera muestra el mismo territorio de la portada (js/noche-tierra.js) con el cielo y
   las líneas de esa hora, las estrellas si es de noche, y la hora en grande saliendo tras las crestas.
   En la página de contacto la hora es la real de Barcelona.
   Solo se dibuja mientras la cabecera está a la vista; con «menos movimiento» se dibuja y se queda quieto.
   Sin WebGL (o sin JavaScript) queda el cielo pintado con CSS. */
(function () {
  "use strict";
  const html = document.documentElement;
  const cabeza = document.querySelector(".pagina--cabeza");

  /* ---------- 1. La hora y su paleta (los mismos tonos que la portada, js/noche.js) ---------- */
  const TONOS = [
    { t: 0, alto: "#070b13", medio: "#0d1626", bajo: "#22314d", tierra: "#0b0f14", linea: "#d4af7a", luz: "#ffe2b0" },
    { t: 1, alto: "#04060a", medio: "#080c14", bajo: "#111b2c", tierra: "#090c11", linea: "#caa670", luz: "#ffe2b0" },
    { t: 2, alto: "#0d1424", medio: "#2a3350", bajo: "#7a6068", tierra: "#0c1016", linea: "#dcbd8e", luz: "#ffe9c4" },
    { t: 2.5, alto: "#4d4b66", medio: "#a8826c", bajo: "#f0c98e", tierra: "#120f10", linea: "#ecd3a4", luz: "#fff1d6" },
    { t: 3, alto: "#c59a62", medio: "#dcb985", bajo: "#f4e3bd", tierra: "#17120d", linea: "#f6e6c2", luz: "#ffffff" },
    { t: 3.45, alto: "#e9d2a4", medio: "#f0dfbb", bajo: "#f7ecd3", tierra: "#d9bd8b", linea: "#fbf1da", luz: "#ffffff" },
    { t: 4, alto: "#f8f5ee", medio: "#f8f5ee", bajo: "#f8f5ee", tierra: "#f8f5ee", linea: "#a08352", luz: "#f8f5ee" },
  ];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mezcla = (a, b, k) => a + (b - a) * k;
  function paleta(tono) {
    let i = 0;
    while (i < TONOS.length - 2 && tono > TONOS[i + 1].t) i++;
    const a = TONOS[i], b = TONOS[i + 1], k = Math.min(1, Math.max(0, (tono - a.t) / (b.t - a.t)));
    const c = {};
    ["alto", "medio", "bajo", "tierra", "linea", "luz"].forEach((n) => { const x = hex(a[n]), y = hex(b[n]); c[n] = x.map((v, j) => Math.round(mezcla(v, y[j], k))); });
    return c;
  }
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

  // La hora real en Barcelona (para «ahora»): hora y minutos, y el tono del cielo que le toca
  function horaReal() {
    let h = 21, m = 0;
    try {
      const p = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Madrid" }).formatToParts(new Date());
      h = +p.find((x) => x.type === "hour").value % 24; m = +p.find((x) => x.type === "minute").value;
    } catch (e) { const d = new Date(); h = d.getHours(); m = d.getMinutes(); }
    const t = h + m / 60;
    // noche cerrada de 23 a 4:30; alba hasta las 8; día (el mapa) hasta las 18; hora dorada y anochecer hasta las 21
    const tono = t >= 23 || t < 4.5 ? 1 : t < 6 ? mezcla(1, 2, (t - 4.5) / 1.5) : t < 8 ? mezcla(2, 3, (t - 6) / 2) : t < 18 ? 4 : t < 19.5 ? 3 : t < 21 ? mezcla(3, 0, (t - 19.5) / 1.5) : mezcla(0, 1, (t - 21) / 2);
    return { texto: String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"), tono };
  }

  let tono = parseFloat(html.dataset.tono);
  const cieloHora = document.querySelector(".cielo-hora");
  if (html.dataset.hora === "ahora") {
    const r = horaReal();
    tono = r.tono;
    if (cieloHora) cieloHora.textContent = r.texto;
  }
  if (isNaN(tono)) tono = 1;
  const col = paleta(tono);
  // Los colores de la hora se quedan en la cabecera de la página: el resto (secciones, pie) sigue siendo de noche
  // con los valores por defecto de css/kairon.css. Si se pusieran en <html>, una página de día tendría el pie marfil.
  if (cabeza) {
    cabeza.style.setProperty("--cielo-alto", rgb(col.alto));
    cabeza.style.setProperty("--cielo-medio", rgb(col.medio));
    cabeza.style.setProperty("--cielo-bajo", rgb(col.bajo));
    cabeza.style.setProperty("--sol", Math.min(1, Math.max(0, (tono - 1.8) / 0.9)).toFixed(2));
  }
  // Alba (cielo claro, tierra oscura): el título va en tinta sobre el cielo. Día: la tierra es el mapa del informe y
  // todo el texto de la cabecera va en tinta.
  const claro = tono > 2.12, dia = tono >= 3.9;
  if (cabeza) { cabeza.classList.toggle("pagina--alba", claro && !dia); cabeza.classList.toggle("pagina--dia", dia); }
  const cabecera = document.querySelector(".cabecera");
  // El menú va en tinta solo mientras está sobre una cabecera clara; sin cabecera de página, siempre de noche.
  // «Clara» se mide en lo alto del cielo, que es lo que queda detrás del menú: al anochecer (malva) va en marfil.
  const lineal = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const cieloArribaClaro = 0.2126 * lineal(col.alto[0]) + 0.7152 * lineal(col.alto[1]) + 0.0722 * lineal(col.alto[2]) > 0.3;
  function luzCabecera() {
    const arriba = !!cabeza && cabeza.getBoundingClientRect().bottom > 90;
    const dia = cieloArribaClaro && arriba;
    if ((html.dataset.luz === "dia") !== dia) {
      html.dataset.luz = dia ? "dia" : "noche";
      // el velo del menú toma el color del cielo de la hora mientras está encima de ella
      if (cabecera) cabecera.style.setProperty("--cielo-alto", dia ? rgb(col.alto) : "");
    }
  }
  luzCabecera();
  window.addEventListener("scroll", luzCabecera, { passive: true });

  /* ---------- 1b. La ronda: cada sección de noche es un rato más de guardia ---------- */
  // Arriba de cada sección, un punto de luz en el horizonte se abre en una línea de oro y, debajo, la hora de la
  // guardia avanza unos minutos desde la de la página. Es solo decoración (aria-hidden): dibujada es el estado normal;
  // la espera solo existe si hay JavaScript, IntersectionObserver y movimiento. Nunca esconde texto.
  (function ronda() {
    const secciones = [...document.querySelectorAll("main > section:not(.pagina--cabeza):not(.claro):not(.pagina--equipo)")];
    const base = (html.dataset.hora === "ahora" ? horaReal().texto : html.dataset.hora || "").match(/^(\d{1,2}):(\d{2})$/);
    if (!secciones.length || !base) return;
    const MINUTOS = 9;
    const inicio = +base[1] * 60 + +base[2];
    const reloj = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
    const sinMovimiento = html.classList.contains("menos-movimiento") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    html.classList.add("con-ronda");
    const marcas = secciones.map((seccion, i) => {
      const marca = document.createElement("span");
      marca.className = "ronda";
      marca.setAttribute("aria-hidden", "true");
      const linea = document.createElement("i");
      linea.className = "ronda__linea";
      const hora = document.createElement("span");
      hora.className = "ronda__hora";
      const minuto = inicio + (i + 1) * MINUTOS;
      hora.textContent = reloj(minuto);
      marca.append(linea, hora);
      seccion.prepend(marca);
      return { marca, hora, minuto };
    });
    if (sinMovimiento || !("IntersectionObserver" in window)) return;
    marcas.forEach((x) => x.marca.classList.add("ronda--espera"));
    const vigia = new IntersectionObserver((entradas) => entradas.forEach((en) => {
      const x = marcas.find((k) => k.marca === en.target);
      if (!x) return;
      // las que ya quedaron arriba (al entrar por un ancla) se dibujan sin más
      if (!en.isIntersecting && en.boundingClientRect.top > 0) return;
      vigia.unobserve(en.target);
      x.marca.classList.remove("ronda--espera");
      if (!en.isIntersecting) return;
      // el reloj corre los minutos que han pasado desde la sección anterior
      const desde = x.minuto - MINUTOS, t0 = performance.now(), dura = 1100;
      const avanzar = (t) => {
        const k = Math.min(1, (t - t0) / dura);
        x.hora.textContent = reloj(Math.round(desde + MINUTOS * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(avanzar);
      };
      requestAnimationFrame(avanzar);
    }), { rootMargin: "0px 0px -15% 0px" });
    marcas.forEach((x) => vigia.observe(x.marca));
    // Un salto largo (tecla Fin, un ancla) puede dejar atrás una sección sin que llegue a verse: esas se dibujan ya
    window.addEventListener("scroll", () => marcas.forEach((x) => {
      if (x.marca.classList.contains("ronda--espera") && x.marca.getBoundingClientRect().top < 0) {
        vigia.unobserve(x.marca);
        x.marca.classList.remove("ronda--espera");
      }
    }), { passive: true });
  })();

  if (!cabeza) return;

  /* ---------- 2. Estrellas (solo de noche): se dibujan una vez, siempre el mismo cielo ---------- */
  const brillo = Math.max(0, 1 - Math.max(0, tono - 1.4) / 1.1);
  if (brillo > 0.05) {
    const lienzo = document.createElement("canvas");
    lienzo.className = "cielo-estrellas";
    lienzo.setAttribute("aria-hidden", "true");
    lienzo.style.opacity = brillo.toFixed(2);
    cabeza.prepend(lienzo);
    const dibujar = () => {
      const W = cabeza.clientWidth, H = cabeza.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
      lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
      const x = lienzo.getContext("2d");
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      let s = 91;
      const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
      const n = Math.round((W * H) / 3600);
      for (let k = 0; k < n; k++) {
        const px = r() * W, py = Math.pow(r(), 1.5) * H * 0.7, t = r();
        const tinte = t < 0.18 ? "241,220,176" : t < 0.26 ? "190,226,236" : "236,240,247";
        const radio = 0.35 + r() * r() * 1.2, alfa = 0.2 + r() * 0.6;
        x.fillStyle = `rgba(${tinte},${alfa.toFixed(2)})`;
        x.beginPath(); x.arc(px, py, radio, 0, Math.PI * 2); x.fill();
        if (radio > 1.25) { const l = 4 + r() * 6; x.fillStyle = `rgba(${tinte},${(alfa * 0.5).toFixed(2)})`; x.fillRect(px - l, py - 0.3, l * 2, 0.6); x.fillRect(px - 0.3, py - l, 0.6, l * 2); }
      }
    };
    dibujar();
    let espera = 0;
    window.addEventListener("resize", () => { clearTimeout(espera); espera = setTimeout(dibujar, 200); });
  }

  /* ---------- 3. El territorio ---------- */
  const contenedor = cabeza.querySelector(".pagina__escena");
  if (!contenedor || !window.kaironTierra || !window.THREE) return;
  const quieto = () => html.classList.contains("menos-movimiento") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const movil = window.innerWidth < 760;
  const T = window.kaironTierra.crear(contenedor, { bucle: false, movil, dprMax: movil ? 2 : 1.5 });
  if (!T) return;
  html.classList.add("con-tierra");

  const C = (c, v) => c.setRGB(v[0] / 255, v[1] / 255, v[2] / 255, THREE.SRGBColorSpace);
  C(T.col.tierra, col.tierra); C(T.col.bruma, col.bajo); C(T.col.linea, col.linea); C(T.col.luz, col.luz);

  // A las 03:07 se ve, lejos, la luz roja del intruso
  const hora307 = html.dataset.hora === "03:07";
  if (hora307 && T.actor[1]) T.actor[1].f = 1;

  const e = T.e;
  function encuadre() {
    const estrecha = window.innerWidth / window.innerHeight < 0.85 || window.innerWidth < 860;
    if (dia) {
      // A plena luz la cámara sube y mira abajo: el terreno es el mapa, con los equipos como puntos de tinta
      e.viaje = 8; e.camY = 38; e.camZ = 16; e.camX = T.eje(30); e.cabeceo = -1.5; e.guinada = 0; e.fov = estrecha ? 60 : 46;
      e.mapa = 1; e.tinta = 1; e.cuenta = 0.6;
    } else {
      // En el móvil la cámara mira un poco hacia abajo: el horizonte sube y el texto queda sobre la tierra oscura
      e.viaje = 6; e.camZ = 0; e.camY = estrecha ? 3 : 2.3;
      e.camX = T.eje(10) * 0.85;
      e.cabeceo = estrecha ? -0.06 : 0.07; e.guinada = 0; e.fov = estrecha ? 60 : 40;
    }
    e.grosor = 0.78 * Math.pow(Math.min(window.devicePixelRatio || 1, 2), 0.8);
    // las luces de los equipos se apagan con el día; la baliza de KAIRON siempre
    e.luces = dia ? 0.75 : Math.max(0.15, 1 - Math.max(0, tono - 2.2) / 0.8); e.baliza = dia ? 0 : 1; e.alfa = dia ? 0.9 : 1; e.brilloLineas = 1;
    // Penumbra bajo el texto de la cabecera (abajo a la izquierda en escritorio; todo el ancho en móvil)
    e.velo = dia ? 0.85 : claro ? 0.82 : 0.9;
    if (estrecha) { e.veloX = 0.5; e.veloY = 0.62; e.veloRX = 0.9; e.veloRY = 0.5; }
    else { e.veloX = 0.24; e.veloY = 0.66; e.veloRX = 0.5; e.veloRY = 0.42; }
  }
  encuadre();

  let visible = true, sucio = true, ultimo = 0;
  const raton = { x: 0, y: 0, f: 0, activo: false };
  if ("IntersectionObserver" in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) sucio = true; }).observe(contenedor);
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (ev) => { raton.x = (ev.clientX / window.innerWidth - 0.5) * 2; raton.y = (ev.clientY / window.innerHeight - 0.5) * 2; raton.activo = true; }, { passive: true });
    document.addEventListener("pointerleave", () => { raton.activo = false; });
  }
  window.addEventListener("resize", () => { encuadre(); T.ajustar(); sucio = true; });

  function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    if (!visible || document.hidden) return;
    const q = quieto();
    T.aquietar(q);
    const objetivo = raton.activo && !q && !claro ? 1 : 0;
    raton.f += (objetivo - raton.f) * 0.08;
    e.farolF = raton.f;
    if (raton.activo) T.apuntar(raton.x, -raton.y);
    // Las luces parpadean despacio: basta con unos 30 dibujos por segundo; quieto, solo cuando algo cambia
    if (q && !sucio && Math.abs(objetivo - raton.f) < 0.002) return;
    if (ahora - ultimo < 32 && !sucio) return;
    ultimo = ahora; sucio = false;
    T.pintar(ahora);
  }
  requestAnimationFrame(cuadro);
})();
