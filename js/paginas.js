/* KAIRON · Páginas interiores (v6)

   TESIS DE MOVIMIENTO
   La portada es un plano secuencia; las páginas interiores son las fichas del mismo caso. Aquí el
   movimiento no adorna: ordena. Cada página se abre igual (el titular sube tras su máscara y enfoca,
   los datos se descifran, el horizonte se dibuja) y después cada tipo de pieza entra con su propio
   recorte, siempre el mismo para la misma pieza, para que se aprenda a leer:
   - líneas de bloque: se trazan de izquierda a derecha;
   - fichas y avisos: barrido lateral;  tarjetas en fila: suben desde su base;
   - tablas, paneles y formularios: cortina de arriba abajo;  secciones claras: una hoja que se abre;
   - texto de lectura: solo enfoca, no se desplaza.
   Tres piezas cuentan algo con el scroll porque su contenido es una secuencia:
   - servicios.html: índice fijo con visor; el hilo se llena según el servicio que se lee;
   - proyectos.html: fichas apiladas; la que llega tapa a la anterior;
   - futuro.html: las seis fases del plan en una línea de tiempo horizontal ligada al scroll.
   Entre páginas, el titular es el mismo elemento (View Transitions) y viaja de una a otra.

   Reglas:
   - Sin este archivo, o sin GSAP, todo el contenido se ve: los estados de partida los pone GSAP al
     montar, o el CSS bajo la clase "pi-mov" que solo se añade aquí cuando hay movimiento.
   - "Reducir movimiento" (sistema o botón) y el modo presentación (tecla P): nada se fija ni vuela.
     Al pulsar el botón se desmonta o se vuelve a montar al momento.
   - No se anima "transform" en piezas que ya mueve main.js (.valor, .cifra, .ruta__hito,
     .panel__bloque, .persona) y main.js no parte estos titulares (llevan data-partido en el HTML). */

(function () {
  "use strict";

  const html = document.documentElement;
  if (html.classList.contains("portada-v6")) return;

  const hayGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const haySplit = hayGSAP && typeof SplitText !== "undefined";
  const hayScramble = hayGSAP && typeof ScrambleTextPlugin !== "undefined";
  const reducidoSO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const quieto = () => reducidoSO || html.classList.contains("menos-movimiento") || html.classList.contains("presentacion");
  const ancha = () => window.innerWidth >= 1024;
  const ratonFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const fuentes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const CA = html.lang === "ca";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const GLIFOS = "KAIRON01<>/\\|#$%&*+=-_";
  const HEX = "0123456789abcdef";

  /* ¿Se ha llegado desde otra página de KAIRON con una transición de vista? Entonces el titular ya
     viaja de una página a otra y no se vuelve a animar al llegar (las dos cosas a la vez se pisan). */
  const llegoConTransicion = (function () {
    if (typeof CSSViewTransitionRule === "undefined" || reducidoSO) return false;
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      return !!document.referrer && new URL(document.referrer).origin === location.origin && (!nav || nav.type === "navigate");
    } catch (e) { return false; }
  })();

  /* ---------- 1. Titulares: líneas que suben tras una máscara y enfocan (como en la portada) ---------- */
  function titulos() {
    if (!haySplit) return;
    $$("main h1, main h2").forEach((t) => {
      if (t.closest("[hidden], details, .pi-sin-partir") || t.querySelector(".oro-brillo")) return;
      const esH1 = t.tagName === "H1";
      if (esH1 && llegoConTransicion) return;
      fuentes.then(() => {
        if (!contexto) return;
        contexto.add(() => {
          SplitText.create(t, {
            type: "lines", mask: "lines", linesClass: "titular-linea", autoSplit: true, aria: "auto",
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 108, filter: "blur(12px)", opacity: 0, duration: esH1 ? 1.3 : 1.15, ease: "expo.out",
                stagger: 0.1, delay: esH1 ? 0.15 : 0,
                scrollTrigger: esH1 ? null : { trigger: t, start: "top 88%", once: true },
              });
            },
          });
        });
      });
    });
  }

  /* ---------- 2. Cabecera de página: entradilla, datos que se descifran y salida con el scroll ---------- */
  function cabecera() {
    const cab = $(".pagina--cabeza, .pagina, .error404");
    if (!cab) return;
    const retraso = llegoConTransicion ? 0.55 : 0.5;
    const intro = $(".pagina__intro, .hero__sub", cab);
    if (intro) gsap.from(intro, { opacity: 0, filter: "blur(10px)", y: 14, duration: 1.2, ease: "power3.out", delay: retraso, clearProps: "filter,transform" });

    const datos = $$(".pi-datos li", cab);
    if (datos.length) {
      gsap.from(datos, { opacity: 0, duration: 0.5, stagger: 0.09, delay: retraso + 0.25, ease: "power1.out" });
      if (hayScramble) {
        datos.forEach((li, i) => {
          const final = li.textContent;
          gsap.to(li, { duration: Math.min(1.3, 0.5 + final.length * 0.025), ease: "none", delay: retraso + 0.25 + i * 0.09,
            scrambleText: { text: final, chars: GLIFOS, revealDelay: 0.2, speed: 0.6, tweenLength: false } });
        });
      }
    }
    const extra = $$(".informe__datos, .hero__acciones, .pi-salidas, .det-nota, .det-entrada", cab);
    if (extra.length) gsap.from(extra, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.3, ease: "expo.out", delay: retraso + 0.2, stagger: 0.1, clearProps: "clipPath" });

    // Al bajar, el texto de la cabecera se retira despacio y el globo se aleja: la página "despega"
    if (cab.classList.contains("pagina--cabeza")) {
      const caja = $(".contenedor", cab), escena = $(".pagina__escena", cab);
      const st = { trigger: cab, start: "top top", end: "bottom top", scrub: true };
      if (caja) gsap.to(caja, { yPercent: -10, opacity: 0.25, ease: "none", scrollTrigger: st });
      if (escena) gsap.to(escena, { yPercent: 14, scale: 1.12, ease: "none", scrollTrigger: st });
    }
  }

  /* ---------- 3. Entradas de sección: cada tipo de pieza, su recorte ---------- */
  const RECORTES = {
    izquierda: { de: { clipPath: "inset(0% 100% 0% 0%)" }, a: { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "expo.out" }, paso: 0.1 },
    sube: { de: { clipPath: "inset(100% 0% 0% 0%)" }, a: { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.out" }, paso: 0.08 },
    cortina: { de: { clipPath: "inset(0% 0% 100% 0%)" }, a: { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.out" }, paso: 0.12 },
    diagonal: { de: { clipPath: "polygon(0% 0%, 0% 0%, -18% 100%, -18% 100%)" }, a: { clipPath: "polygon(0% 0%, 118% 0%, 100% 100%, 0% 100%)", duration: 1.3, ease: "expo.out" }, paso: 0.1 },
    iris: { de: { clipPath: "circle(0% at 0% 0%)" }, a: { clipPath: "circle(150% at 0% 0%)", duration: 1.5, ease: "power3.out" }, paso: 0.1 },
    enfoque: { de: { opacity: 0, filter: "blur(9px)" }, a: { opacity: 1, filter: "blur(0px)", duration: 1.05, ease: "power2.out" }, paso: 0.08, limpia: "filter" },
    fila: { de: { opacity: 0, x: -14 }, a: { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }, paso: 0.05, limpia: "transform" },
    ficha: { de: { opacity: 0, scale: 0.9 }, a: { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, paso: 0.04, limpia: "transform" },
  };
  // Qué recorte lleva cada pieza. El orden importa: una pieza solo recibe el primero que la nombra.
  const ENTRADAS = [
    [".ficha:not(.pi-pila .ficha), .detalle__rec, .plan-aviso, .det-aviso, .faq__item, .det-grupo details", "izquierda"],
    [".fichas__limite, .informe__sello, .det-rel__lista li, .explorar__lista li", "diagonal"],
    [".modulos > li, .viaje > li, .paso, .det-paso, .det-tarjeta", "sube"],
    [".tabla, .panel, .det-planes, .det-tabla, .pi-huella, .det-calc, .det-huella", "cortina"],
    [".formulario", "iris"],
    [".principios > li, .ficha__datos > li", "ficha"],
    [".detalle__lista > li, .detalle__pasos > li, .persona .servicio__datos > li", "fila"],
    [".vision__texto, .vision__nota, .informe__texto, .informe__nota, .contacto__sub, .vision, .pi-entradilla, .det-prosa, .det-entrada, .metodo__paso p, .enlace-detalle, .pi-pila__leyenda", "enfoque"],
  ];

  function entradas() {
    const tomadas = new Set();
    ENTRADAS.forEach(([selector, tipo]) => {
      const r = RECORTES[tipo];
      const piezas = $$("main " + selector.split(", ").join(", main ")).filter((el) => {
        if (tomadas.has(el) || el.closest(".pagina--cabeza, .pi-ruta--horizontal, [hidden]")) return false;
        // Dentro de un <details> cerrado no hay nada que revelar
        const d = el.parentElement && el.parentElement.closest("details:not([open])");
        if (d) return false;
        tomadas.add(el);
        return true;
      });
      if (!piezas.length) return;
      gsap.set(piezas, r.de);
      ScrollTrigger.batch(piezas, {
        start: "top 90%", once: true,
        onEnter: (lote) => gsap.to(lote, Object.assign({}, r.a, {
          stagger: r.paso,
          onComplete: () => gsap.set(lote, { clearProps: r.limpia || "clipPath" }),
        })),
      });
    });

    // Secciones claras: se abren como una hoja que sube y pierde las esquinas redondeadas
    $$("main > section.claro, main > .pin-spacer > section.claro").forEach((s) => {
      gsap.fromTo(s, { clipPath: "inset(8% 6% 0% 6% round 56px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
        scrollTrigger: { trigger: s, start: "top bottom", end: "top 40%", scrub: true },
      });
    });

    // Líneas de bloque: se trazan cuando el bloque entra (la línea la dibuja el CSS con .pi-vista)
    $$(".vision__bloque, .informe__bloque, .detalle__serv, .det-seccion--borde, .ficha:not(.pi-pila .ficha)").forEach((b) => {
      b.classList.add("pi-trazo");
      ScrollTrigger.create({ trigger: b, start: "top 92%", once: true, onEnter: () => b.classList.add("pi-vista") });
    });
  }

  /* ---------- 4. Datos que se descifran: huellas, horas y precios ---------- */
  function datos() {
    if (!hayScramble) return;
    // Huellas y horas de las tablas del informe
    $$(".tabla tbody tr").forEach((fila) => {
      const celdas = $$("td:first-child, td code", fila).filter((c) => !c.children.length && /^[0-9a-f:….E]+$/i.test(c.textContent.trim()));
      if (!celdas.length) return;
      const finales = celdas.map((c) => c.textContent);
      const descifrar = (dur) => celdas.forEach((c, i) => gsap.to(c, { duration: dur, ease: "none", overwrite: true,
        scrambleText: { text: finales[i], chars: /[a-f…]/.test(finales[i]) ? HEX : "0123456789", speed: 0.5, revealDelay: dur * 0.3 } }));
      ScrollTrigger.create({ trigger: fila, start: "top 92%", once: true, onEnter: () => descifrar(0.9) });
      fila.addEventListener("pointerenter", () => { if (!quieto()) descifrar(0.45); });
    });
    // Precios e importes de la tabla de planes y números de la consola
    $$(".det-planes__precio, .panel__estados b").forEach((el) => {
      if (el.children.length) return;
      const final = el.textContent;
      gsap.to(el, { duration: 1, ease: "none", scrambleText: { text: final, chars: "0123456789", speed: 0.5, revealDelay: 0.3 },
        scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
  }

  /* ---------- 5. Piezas que avanzan con el scroll ---------- */
  // Un hilo que se llena mientras se recorre una lista con orden real (pasos del SOC, contacto, hoja de ruta)
  function hilos() {
    $$(".pi-hilo").forEach((lista) => {
      lista.style.setProperty("--pi-avance", "0");
      ScrollTrigger.create({ trigger: lista, start: "top 82%", end: "bottom 55%", scrub: 0.5,
        onUpdate: (self) => lista.style.setProperty("--pi-avance", self.progress.toFixed(4)) });
    });
  }

  // Informe: la cronología se recorre fila a fila; la fila de la alerta es el instante
  function cronologia() {
    const tabla = $(".pi-crono");
    if (!tabla) return;
    const filas = $$("tbody tr", tabla);
    ScrollTrigger.create({
      trigger: tabla, start: "top 70%", end: "bottom 60%", scrub: 0.3,
      onUpdate: (self) => {
        const n = Math.round(self.progress * filas.length);
        filas.forEach((f, i) => { f.classList.toggle("es-pasada", i < Math.max(n, 1)); f.classList.toggle("es-actual", i === Math.max(n, 1) - 1); });
      },
    });
  }

  // Proyectos: cada ficha se encoge y se apaga un poco cuando la siguiente la tapa
  function pila() {
    const fichas = $$(".pi-pila .ficha");
    if (!fichas.length || !window.matchMedia("(min-width: 900px) and (min-height: 680px)").matches) return;
    fichas.forEach((f, i) => {
      gsap.from(f, { clipPath: "inset(0% 0% 100% 0% round 22px)", duration: 1.2, ease: "expo.out",
        scrollTrigger: { trigger: f, start: "top 92%", once: true }, clearProps: "clipPath" });
      const sig = fichas[i + 1];
      if (!sig) return;
      // Solo cuando la siguiente ya la pisa: mientras se lee, la ficha no se apaga
      gsap.to(f, { scale: 0.95 - (fichas.length - i) * 0.004, filter: "brightness(0.72)", ease: "none",
        scrollTrigger: { trigger: sig, start: () => "top " + Math.round(f.getBoundingClientRect().height + 150) + "px", end: "top 130px", scrub: true, invalidateOnRefresh: true } });
    });
  }

  // Futuro: en pantallas anchas las seis fases pasan en horizontal mientras la sección está fijada
  let paradasRuta = null;
  function ruta() {
    const bloque = $(".pi-ruta");
    if (!bloque) return;
    const pista = $(".pi-ruta__pista", bloque), visor = $(".pi-ruta__visor", bloque);
    const fases = $$(".pi-ruta__fase", bloque), cuenta = $(".pi-ruta__cuenta b", bloque);
    const marcar = (p) => {
      bloque.style.setProperty("--pi-avance", p.toFixed(4));
      const n = Math.min(fases.length - 1, Math.floor(p * fases.length + 0.0001));
      fases.forEach((f, i) => f.classList.toggle("es-pasada", i <= n));
      if (cuenta) cuenta.textContent = String(n + 1).padStart(2, "0");
    };
    if (ancha() && window.innerHeight >= 620) {
      bloque.classList.add("pi-ruta--horizontal");
      const recorrido = () => Math.max(0, pista.scrollWidth - visor.clientWidth);
      const st = ScrollTrigger.create({
        trigger: bloque, pin: true, start: "top top", end: () => "+=" + Math.round(recorrido() + window.innerHeight * 0.4),
        scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => { gsap.set(pista, { x: -recorrido() * self.progress }); marcar(self.progress); },
        onRefresh: (self) => { gsap.set(pista, { x: -recorrido() * self.progress }); marcar(self.progress); },
      });
      marcar(0);
      // Paradas para las flechas del teclado (main.js las pide a window.kaironParadas si existe)
      paradasRuta = () => fases.map((f, i) => Math.round(st.start + (st.end - st.start) * (i / (fases.length - 1))));
      return () => { bloque.classList.remove("pi-ruta--horizontal"); gsap.set(pista, { clearProps: "transform" }); paradasRuta = null; marcar(1); };
    }
    // Estrecha: la lista sigue en vertical y el hilo se llena con el scroll
    marcar(0);
    ScrollTrigger.create({ trigger: pista, start: "top 75%", end: "bottom 60%", scrub: 0.4, onUpdate: (self) => marcar(self.progress) });
    return () => marcar(1);
  }

  /* ---------- 6. Montaje y desmontaje (botón "Reducir movimiento", tecla P, cambio de ancho) ---------- */
  let contexto = null, limpiezas = [];
  function montar() {
    if (!hayGSAP || quieto() || contexto) return;
    html.classList.add("pi-mov");
    contexto = gsap.context(() => {
      cabecera();
      const fin = ruta(); // primero lo que fija: cambia la altura de la página
      if (fin) limpiezas.push(fin);
      entradas();
      datos();
      hilos();
      cronologia();
      pila();
    });
    titulos();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }
  function desmontar() {
    if (!contexto) return;
    contexto.revert();
    contexto = null;
    limpiezas.forEach((f) => f());
    limpiezas = [];
    html.classList.remove("pi-mov");
    $$(".pi-trazo").forEach((b) => b.classList.remove("pi-trazo", "pi-vista"));
    $$(".pi-hilo").forEach((l) => l.style.removeProperty("--pi-avance"));
    $$(".pi-crono tr").forEach((f) => f.classList.remove("es-pasada", "es-actual"));
    ScrollTrigger.refresh();
  }
  const remontar = () => setTimeout(() => { desmontar(); montar(); }, 0);

  /* ---------- 7. Lo que funciona también sin movimiento ---------- */
  // 7.1 Servicios: el índice marca el servicio que se está leyendo y el visor cambia de dibujo
  const rail = $(".pi-serv__rail");
  if (rail) {
    const enlaces = $$(".pi-serv__indice a", rail), lienzos = $$(".pi-serv__visor canvas", rail);
    const articulos = enlaces.map((a) => document.getElementById(a.getAttribute("href").slice(1)));
    const lista = $(".pi-serv__lista");
    const activar = (i) => {
      enlaces.forEach((a, k) => { if (k === i) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      lienzos.forEach((c, k) => { c.classList.toggle("es-activo", k === i); if (k === i) c.removeAttribute("data-pausa"); else c.setAttribute("data-pausa", ""); });
    };
    activar(0);
    const leer = () => {
      const medio = window.innerHeight * 0.42;
      let i = 0;
      articulos.forEach((art, k) => { if (art && art.getBoundingClientRect().top <= medio) i = k; });
      activar(i);
      if (lista) {
        const r = lista.getBoundingClientRect();
        rail.style.setProperty("--pi-avance", Math.max(0, Math.min(1, (medio - r.top) / Math.max(1, r.height))).toFixed(4));
      }
    };
    window.addEventListener("scroll", leer, { passive: true });
    window.addEventListener("resize", leer);
    leer();
  }

  // 7.2 Informe: comprobación de huella SHA-256 en el navegador
  const huella = $(".pi-huella");
  if (huella && window.crypto && window.crypto.subtle && typeof TextEncoder !== "undefined") {
    const campo = $("input", huella), salida = $("output", huella), estado = $(".pi-huella__estado", huella);
    const original = campo.value;
    let hashOriginal = null;
    const calcular = () => window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(campo.value)).then((bytes) => {
      const hex = Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
      if (hashOriginal === null) hashOriginal = hex;
      salida.textContent = hex;
      if (estado) {
        const igual = campo.value === original;
        estado.dataset.estado = igual ? "igual" : "distinta";
        estado.textContent = igual ? huella.dataset.igual : huella.dataset.distinta;
      }
    });
    campo.addEventListener("input", calcular);
    calcular();
    huella.hidden = false;
  }

  // 7.3 Foco de luz en las piezas y enlaces que se acercan al ratón
  if (ratonFino) {
    $$(".ficha, .viaje > li, .detalle__rec, .tabla, .fichas__limite, .pi-huella, .det-tarjeta").forEach((el) => {
      el.classList.add("pi-foco");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--pi-x", (e.clientX - r.left) + "px");
        el.style.setProperty("--pi-y", (e.clientY - r.top) + "px");
      }, { passive: true });
    });
    $$(".servicio__mas, .persona__enlaces a, .pie__redes a, .pi-salidas a, .det-rel__lista a").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        if (quieto()) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.translate = (dx * 0.18).toFixed(1) + "px " + (dy * 0.3).toFixed(1) + "px";
      }, { passive: true });
      el.addEventListener("pointerleave", () => { el.style.translate = ""; });
    });
  }

  // 7.4 Transiciones entre páginas: si se pulsa una tarjeta con título propio, ese título es el que
  // viaja y se convierte en el titular de la página siguiente (en vez del titular actual)
  const NOMBRE = "kairon-titulo";
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("main a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || quieto()) return;
    const destino = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(destino) || /^https?:/.test(destino)) return;
    const titulo = a.querySelector("h2, h3, b, strong") || (a.closest("h2, h3") ? a : null);
    if (!titulo) return;
    $$(".pagina__titulo, .error404 h1").forEach((t) => { t.style.viewTransitionName = "none"; });
    titulo.style.viewTransitionName = NOMBRE;
  });
  // Si se vuelve atrás con la página guardada en memoria, cada nombre vuelve a su sitio
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    $$("[style*='view-transition-name']").forEach((el) => { el.style.viewTransitionName = ""; });
  });

  /* ---------- 8. Arranque ---------- */
  if (!hayGSAP) return;
  montar();
  window.kaironParadas = undefined;
  // Flechas ↓/↑ en la página con la línea de tiempo fijada: una parada por fase
  if ($(".pi-ruta")) {
    window.kaironParadas = function () {
      const y0 = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
      const lista = [0];
      $$("main > section, main > .pin-spacer > section, main .vision__bloque").forEach((s) => {
        if (s.classList.contains("pi-ruta") && paradasRuta) return;
        lista.push(Math.round(s.getBoundingClientRect().top + y0 - 80));
      });
      if (paradasRuta) lista.push(...paradasRuta());
      return [...new Set(lista.map((y) => Math.max(0, Math.min(max, y))))].sort((a, b) => a - b);
    };
  }
  fuentes.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());

  const botonMovimiento = $(".control--movimiento");
  if (botonMovimiento) botonMovimiento.addEventListener("click", remontar);
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "p" || ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
    remontar();
  });
  let eraAncha = ancha();
  window.addEventListener("resize", () => {
    if (ancha() === eraAncha) return;
    eraAncha = ancha();
    remontar();
  });
  // Al abrir una pregunta cambia el alto de la página
  $$("main details").forEach((d) => d.addEventListener("toggle", () => ScrollTrigger.refresh()));
})();
