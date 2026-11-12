/* KAIRON · Coreografía de la portada (v6)

   TESIS DE MOVIMIENTO
   Kairos es agarrar el instante. Toda la portada es un único plano secuencia alrededor de un solo
   objeto, el globo del radar con el emblema dentro: nada aparece porque sí, la cámara llega.

   - Momento de autor: la intro. Un punto de oro (el instante), un vórtice que forja el logo en
     relieve, un barrido de luz y la zambullida: el emblema pasa a ser el centro del globo.
   - Continuidad: un lienzo WebGL fijo (js/mundo.js) y una cámara ligada al scroll que va de pose
     en pose: frente (hero) → órbita con el anillo del tiempo (manifiesto) → una faceta por servicio
     (radar, escudo, informe sellado) → vista cenital (el barrido es el visor del SOC) → el rojo que
     se extiende y la onda dorada que lo contiene (incidente) → retirada y calma (contacto).
   - Respuesta: la velocidad del scroll abre la aberración cromática y el brillo; el cursor deja una
     estela de fluido en el hero; cada alerta de la consola late sobre el globo.
   - Tipografía: líneas que suben tras una máscara y enfocan (desenfoque → nítido); el manifiesto
     se enciende palabra a palabra; los datos se descifran. Cada sección entra con un recorte
     distinto (clip-path), no con el mismo fundido.
   - Presupuesto: un solo suavizado (Lenis) más la amortiguación de la cámara; desenfoques solo en
     textos cortos; la escena no se dibuja con la pestaña oculta ni cuando está apagada.
   - Sin movimiento (preferencia del sistema o botón "Reducir movimiento"): nada se fija ni vuela;
     todo el contenido está visible y la escena queda quieta.

   Este archivo solo dirige: crea los ScrollTrigger, calcula las claves de cámara y se las pasa a
   mundo.js. Si GSAP no carga, la página se queda en su estado visible por defecto. */

(function () {
  const html = document.documentElement;
  if (!document.querySelector(".mundo")) return;

  const hayGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const haySplit = hayGSAP && typeof SplitText !== "undefined";
  const hayScramble = hayGSAP && typeof ScrambleTextPlugin !== "undefined";
  const reducidoSO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sinMovimiento = () => reducidoSO || html.classList.contains("menos-movimiento");
  const mundo = () => window.kaironMundo || null;
  const fuentes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const ancha = () => window.innerWidth >= 1024;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  /* ---------- 1. Claves de cámara: de las secciones al mundo ---------- */
  let entradas = [];  // { st, poses: [nombres] }
  let paradas = [0];  // posiciones de scroll para las flechas del teclado
  function calcularClaves() {
    const lista = [];
    entradas.forEach(({ st, poses }) => {
      const a = st.start, b = Math.max(st.end, a + 1), n = poses.length;
      poses.forEach((p, i) => {
        // Cada pose tiene una meseta (para leer) y entre mesetas la cámara vuela
        const t0 = n === 1 ? 0 : (i + (i === 0 ? 0 : 0.28)) / n;
        const t1 = n === 1 ? 1 : (i + (i === n - 1 ? 1 : 0.72)) / n;
        lista.push({ y: a + (b - a) * t0, pose: p }, { y: a + (b - a) * t1, pose: p });
      });
    });
    if (mundo() && lista.length) mundo().claves(lista);
  }

  /* ---------- 2. Montaje con movimiento ---------- */
  let contexto = null;
  let fijadas = [];
  function montar() {
    if (!hayGSAP) return;
    entradas = [];
    fijadas = [];
    const quieto = sinMovimiento();
    html.classList.toggle("v6-anim", !quieto);
    contexto = gsap.context(() => {
      const secciones = $$("main [data-pose]");

      secciones.forEach((el) => {
        const poses = quieto ? [el.classList.contains("v6-hero") ? "hero" : el.dataset.pose === "oculto" ? "oculto" : "fondo"] : el.dataset.pose.split(" ");
        const fijar = !quieto && el.dataset.fijar && (el.classList.contains("v6-manifiesto") || ancha());
        if (el.classList.contains("v6-hero")) {
          entradas.push({ st: ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom 75%" }), poses });
        } else if (el.classList.contains("v6-manifiesto") && fijar) {
          entradas.push({ st: manifiesto(el), poses });
        } else if (el.classList.contains("v6-servicios") && fijar) {
          entradas.push({ st: servicios(el), poses });
        } else if (el.classList.contains("v6-servicios") && !quieto) {
          // Sin fijar (móvil): cada tarjeta trae su propia pose al pasar
          $$(".v6-servicio", el).forEach((card) => {
            entradas.push({ st: ScrollTrigger.create({ trigger: card, start: "top 62%", end: "bottom 62%" }), poses: [card.dataset.poseMovil] });
            gsap.from(card, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 82%", once: true }, onComplete: () => gsap.set(card, { clearProps: "clipPath" }) });
          });
        } else {
          entradas.push({ st: ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%" }), poses });
        }
      });

      if (!quieto) {
        titulos();
        recortes();
        datos();
      }
    });
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }

  function desmontar() {
    if (contexto) contexto.revert();
    contexto = null;
    html.classList.remove("v6-anim");
    $$(".v6-servicios--fijo").forEach((s) => s.classList.remove("v6-servicios--fijo"));
    $$(".v6-manifiesto--fijo").forEach((s) => s.classList.remove("v6-manifiesto--fijo"));
  }

  /* --- Manifiesto: fijado; las frases se encienden palabra a palabra mientras la cámara orbita --- */
  function manifiesto(sec) {
    const frases = $$(".v6-frase", sec);
    const pie = $(".v6-manifiesto__pie", sec);
    sec.classList.add("v6-manifiesto--fijo");
    const palabras = frases.map((f) => (haySplit ? SplitText.create(f, { type: "words", wordsClass: "v6-palabra", aria: "auto" }).words : [f]));
    const oculto = { opacity: 0, filter: "blur(14px)", yPercent: 55, rotateX: -50 };
    const visible = { opacity: 1, filter: "blur(0px)", yPercent: 0, rotateX: 0, ease: "power3.out" };

    // La primera frase entra sola, al llegar; el resto lo gobierna el scroll
    gsap.fromTo(palabras[0], oculto, Object.assign({ duration: 1, stagger: 0.07, scrollTrigger: { trigger: sec, start: "top 55%", once: true } }, visible));

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: "top top", end: "+=" + (sec.dataset.fijar || 220) + "%", pin: true, scrub: true, anticipatePin: 1,
        onRefresh: (self) => { sec.dataset.inicio = self.start; },
      },
    });
    gsap.set(frases.slice(1), { autoAlpha: 1 });
    gsap.set(palabras.slice(1).flat(), oculto);
    // Solo opacidad (no visibility): los enlaces del pie siguen en el orden de tabulación
    gsap.set(pie, { opacity: 0, y: 30 });
    const salir = { autoAlpha: 0, yPercent: -35, filter: "blur(10px)", duration: 0.7, ease: "power2.in" };
    tl.to(frases[0], salir, 1.2)
      .to(palabras[1], Object.assign({ duration: 0.8, stagger: 0.1 }, visible), 1.7)
      .to(frases[1], salir, 4.1)
      .to(palabras[2], Object.assign({ duration: 0.8, stagger: 0.1 }, visible), 4.6)
      .to(pie, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, 6.2)
      .to({}, { duration: 0.9 }); // respiro final
    fijadas.push({ st: tl.scrollTrigger, pasos: [0, 0.42, 0.98] });
    // Teclado: al enfocar un enlace del pie (aún transparente), el scroll va al final del manifiesto
    const stM = tl.scrollTrigger;
    pie.addEventListener("focusin", () => {
      if (sec.classList.contains("v6-manifiesto--fijo") && stM.progress < 0.9) irA(stM.start + (stM.end - stM.start) * 0.98);
    });
    return stM;
  }

  /* --- Servicios: fijado en escritorio; una tarjeta por faceta del globo --- */
  function servicios(sec) {
    const tarjetas = $$(".v6-servicio", sec);
    const indice = $$(".v6-servicios__indice li", sec);
    sec.classList.add("v6-servicios--fijo");
    // Solo opacidad y recorte (no visibility): los enlaces de las tres tarjetas siguen en el orden de tabulación.
    // Como están apiladas, solo la activa recibe el puntero.
    const fuera = { clipPath: "inset(0% 0% 100% 0%)", opacity: 0, yPercent: -8 };
    const dentro = { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, yPercent: 0 };
    gsap.set(tarjetas.slice(1), { clipPath: "inset(100% 0% 0% 0%)", opacity: 0, yPercent: 8, pointerEvents: "none" });
    gsap.from(tarjetas[0], { clipPath: "inset(100% 0% 0% 0%)", yPercent: 8, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: sec, start: "top 45%", once: true } });
    let activo = 0;
    const marcar = (i) => {
      if (i === activo) return;
      activo = i;
      indice.forEach((li, k) => li.classList.toggle("activo", k === i));
      tarjetas.forEach((t, k) => { t.style.pointerEvents = k === i ? "" : "none"; });
    };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: "top top", end: "+=" + (sec.dataset.fijar || 240) + "%", pin: true, scrub: true, anticipatePin: 1,
        onUpdate: (self) => marcar(self.progress < 0.34 ? 0 : self.progress < 0.67 ? 1 : 2),
      },
    });
    tl.to(tarjetas[0], Object.assign({ duration: 0.8, ease: "power2.inOut" }, fuera), 2.4)
      .to(tarjetas[1], Object.assign({ duration: 0.9, ease: "power2.out" }, dentro), 2.9)
      .to(tarjetas[1], Object.assign({ duration: 0.8, ease: "power2.inOut" }, fuera), 5.7)
      .to(tarjetas[2], Object.assign({ duration: 0.9, ease: "power2.out" }, dentro), 6.2)
      .to({}, { duration: 1.9 });
    const st = tl.scrollTrigger;
    const pasos = [0.02, 0.5, 0.98];
    fijadas.push({ st, pasos });
    // Teclado: al enfocar un enlace de una tarjeta que no se ve, el scroll va a su parada
    tarjetas.forEach((t, i) => t.addEventListener("focusin", () => {
      if (!sec.classList.contains("v6-servicios--fijo") || activo === i) return;
      irA(st.start + (st.end - st.start) * pasos[i]);
    }));
    return st;
  }

  /* --- Títulos de sección: cada línea sube tras una máscara y enfoca --- */
  function titulos() {
    if (!haySplit) return;
    $$(".v6-titulo").forEach((t) => {
      fuentes.then(() => {
        if (!contexto) return;
        contexto.add(() => {
          SplitText.create(t, {
            type: "lines", mask: "lines", autoSplit: true, aria: "auto",
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 108, filter: "blur(12px)", opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.1,
                scrollTrigger: { trigger: t, start: "top 86%", once: true },
              });
            },
          });
        });
      });
    });
  }

  /* --- Entradas de sección con recorte: cada una el suyo --- */
  function recortes() {
    // Secciones claras: se abren como una hoja que sube y pierde las esquinas redondeadas
    $$(".v6-cortina").forEach((s) => {
      gsap.fromTo(s, { clipPath: "inset(10% 7% 0% 7% round 64px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
        scrollTrigger: { trigger: s, start: "top bottom", end: "top 35%", scrub: true },
      });
    });
    // Panel del SOC: se descubre de arriba abajo, como un barrido
    const panel = $(".v6-panel");
    if (panel) {
      gsap.from(panel, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.6, ease: "expo.out",
        scrollTrigger: { trigger: panel, start: "top 82%", once: true }, onComplete: () => gsap.set(panel, { clearProps: "clipPath" }) });
    }
    // Planes: cada fila se descubre de izquierda a derecha, en orden
    const planes = $$(".v6-plan");
    if (planes.length) {
      gsap.from(planes, { clipPath: "inset(0% 100% 0% 0%)", duration: 1.1, ease: "expo.out", stagger: 0.12,
        scrollTrigger: { trigger: planes[0], start: "top 84%", once: true }, onComplete: () => gsap.set(planes, { clearProps: "clipPath" }) });
    }
    // Medidas: suben desde su propia línea base
    const medidas = $$(".v6-medida");
    if (medidas.length) {
      gsap.from(medidas, { clipPath: "inset(100% 0% 0% 0%)", yPercent: 12, duration: 1, ease: "expo.out", stagger: 0.1,
        scrollTrigger: { trigger: medidas[0], start: "top 86%", once: true }, onComplete: () => gsap.set(medidas, { clearProps: "clipPath,transform" }) });
    }
    // Textos de apoyo: aparecen enfocando, sin desplazarse
    $$(".v6-soc__entrada, .v6-planes__entrada, .v6-planes__nota, .v6-sello").forEach((el) => {
      gsap.from(el, { opacity: 0, filter: "blur(8px)", duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true }, onComplete: () => gsap.set(el, { clearProps: "filter" }) });
    });
  }

  /* --- Datos: las cifras se descifran al entrar --- */
  function datos() {
    if (!hayScramble) return;
    $$(".v6-cifra").forEach((el) => {
      const final = el.dataset.cifra || el.textContent;
      gsap.to(el, { duration: 1.1, ease: "none", scrambleText: { text: final, chars: "0123456789", speed: 0.5, revealDelay: 0.35 },
        scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
  }

  /* ---------- 3. Paradas para las flechas del teclado (modo presentación en clase) ---------- */
  function calcularParadas() {
    const lista = [0];
    const y0 = window.scrollY;
    $$("main > section, main > .pin-spacer > section").forEach((s) => {
      const fija = fijadas.find((f) => f.st.trigger === s);
      if (fija) fija.pasos.forEach((p) => lista.push(Math.round(fija.st.start + (fija.st.end - fija.st.start) * p)));
      else if (!s.classList.contains("v6-hero")) lista.push(Math.round(s.getBoundingClientRect().top + y0));
    });
    const max = document.documentElement.scrollHeight - window.innerHeight;
    paradas = [...new Set(lista.map((y) => Math.max(0, Math.min(max, y))))].sort((a, b) => a - b);
  }
  window.kaironParadas = () => paradas;

  function irA(y) {
    const l = window.kaironLenis;
    if (l && !sinMovimiento()) l.scrollTo(y, { duration: 1.2 });
    else window.scrollTo(0, y);
  }

  /* ---------- 4. Arranque ---------- */
  if (hayGSAP) {
    ScrollTrigger.addEventListener("refresh", () => { calcularClaves(); calcularParadas(); });
    montar();
    // El scroll (posición y velocidad) se pasa a la escena en cada fotograma
    let yAnterior = window.scrollY;
    gsap.ticker.add(() => {
      const m = mundo();
      if (!m) return;
      const y = window.scrollY, l = window.kaironLenis;
      m.scroll(y, l ? l.velocity : y - yAnterior);
      yAnterior = y;
    });
    // Las fuentes y las imágenes cambian las alturas: se recalcula todo cuando están
    fuentes.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => {
      ScrollTrigger.refresh();
      // Si se llega con un ancla (index.html#contacto), se vuelve a ir a ella con las medidas ya correctas
      if (location.hash.length > 1) {
        const destino = document.getElementById(location.hash.slice(1));
        if (destino) window.scrollTo(0, destino.getBoundingClientRect().top + window.scrollY);
      }
    });
  } else {
    // Sin GSAP: el scroll se pasa igualmente, con una sola pose de fondo tras el hero
    window.addEventListener("scroll", () => { const m = mundo(); if (m) m.scroll(window.scrollY, 0); }, { passive: true });
    const m = mundo();
    if (m) m.claves([{ y: 0, pose: "hero" }, { y: window.innerHeight * 0.5, pose: "hero" }, { y: window.innerHeight, pose: "fondo" }]);
  }

  // Botón "Reducir movimiento": se desmonta o se vuelve a montar la coreografía al momento
  const botonMovimiento = $(".control--movimiento");
  if (botonMovimiento && hayGSAP) {
    botonMovimiento.addEventListener("click", () => setTimeout(() => {
      desmontar();
      montar();
      const m = mundo();
      if (m) m.asentar();
    }, 0));
  }
  // Al cruzar el ancho en el que los servicios se fijan, se vuelve a montar
  let eraAncha = ancha();
  window.addEventListener("resize", () => {
    if (ancha() === eraAncha || !hayGSAP) return;
    eraAncha = ancha();
    desmontar();
    montar();
  });

  /* ---------- 5. La escena al entrar, el fluido y los avisos ---------- */
  // Si la intro ya terminó (o no hay), la escena entra por su cuenta; si está en marcha, la lanza la zambullida
  if (!$(".carga") || (window.kaironIntro && window.kaironIntro.vista)) {
    const m = mundo();
    if (m) m.entrada(null);
  }

  // Estela de fluido del cursor: solo en el hero, y solo cuando la intro ha terminado
  function iniciarFluido() {
    const lienzo = $(".v6-fluido");
    if (!lienzo || typeof window.kaironFluido !== "function" || sinMovimiento()) return;
    try { if (window.kaironFluido(lienzo)) html.classList.add("con-fluido"); } catch (e) { /* sin fluido: la portada sigue igual */ }
  }
  if (html.classList.contains("intro-fin") || !$(".carga")) setTimeout(iniciarFluido, 400);
  else window.addEventListener("kairon-intro-fin", () => setTimeout(iniciarFluido, 1600), { once: true });

  // Cada alerta nueva de la consola late sobre el globo mientras se ve el SOC o corre el simulador
  const seccionSoc = $(".v6-soc");
  window.addEventListener("kairon-alerta", (e) => {
    const m = mundo();
    if (!m || sinMovimiento()) return;
    const r = seccionSoc ? seccionSoc.getBoundingClientRect() : null;
    const enSoc = r && r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.2;
    if (enSoc || document.body.classList.contains("simulando")) m.alerta(e.detail.tipo);
  });

  // Clic en el fondo del hero: aparece una amenaza sobre el globo y el radar la apaga al pasar
  const hero = $(".v6-hero");
  if (hero) {
    hero.addEventListener("pointerdown", (e) => {
      if (e.target.closest("a, button") || sinMovimiento()) return;
      if (window.kaironEscena) window.kaironEscena.impacto();
      if (window.kaironPing) window.kaironPing(220, 0.6, 0.05);
    });
  }
})();
