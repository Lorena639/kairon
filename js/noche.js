/* KAIRON · «Una noche de guardia» · el director de la portada
   La página es una noche entera y el scroll es el reloj. Este archivo convierte la posición del scroll en
   una hora, y la hora en todo lo demás: color del cielo, vuelo de la cámara sobre la tierra (js/noche-tierra.js),
   las frases de cada escena y la regla de horas del pie de pantalla.

   Cómo está hecho
   - Una sola función por fotograma (gsap.ticker): mueve el scroll suave (Lenis), calcula el estado de la
     película y pinta la tierra solo si algo ha cambiado.
   - El estado sale de una lista de «claves» (posición de scroll → valores) medida sobre las secciones reales;
     entre dos claves se interpola. Bajando o subiendo, la misma posición da siempre la misma imagen.
   - Las escenas que se quedan en pantalla usan position: sticky (CSS); aquí solo se calcula su avance local.
   - Con «menos movimiento» no hay vuelo ni escenas fijadas: cambia el color con la hora y poco más.

   Índice: 1 base · 2 cielo y paleta · 3 claves · 4 escenas · 5 fotograma · 6 entrada · 7 interfaz · 8 demo y atajos
           9 formulario · 10 sonido · 11 sorpresas · 12 aplicación instalable */
(() => {
  "use strict";

  /* ---------- 1. Base ---------- */
  const html = document.documentElement;
  html.classList.remove("sin-js");
  const CA = html.lang === "ca";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const hayGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const haySplit = hayGSAP && typeof SplitText !== "undefined";
  const reducidoSO = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ratonFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  try { if (localStorage.getItem("kairon-menos-movimiento") === "1") html.classList.add("menos-movimiento"); } catch (e) { /* sin almacenamiento */ }
  try { if (sessionStorage.getItem("kairon-presentacion") === "1") html.classList.add("presentacion"); } catch (e) { /* sin almacenamiento */ }
  const quieto = () => reducidoSO.matches || html.classList.contains("menos-movimiento");

  const TXT = CA ? {
    calma: "Tot en calma.", desvelo: "Seguim desperts.", manana: "Ja hem repassat la nit.",
    eventos: [["ok", "Agent WS-07 en línia"], ["ok", "Integritat de fitxers verificada"], ["aviso", "5 intents d'accés fallits · srv-01"], ["ok", "Regles actualitzades (v2026.11)"], ["aviso", "USB desconegut a WS-12"], ["ok", "Còpia de seguretat completada"], ["aviso", "Port 3389 exposat · fw-edge"], ["ok", "Empremta SHA-256 registrada · cas 0427"], ["ok", "Agent WS-03 en línia"], ["ok", "Certificat renovat · correu"]],
    etiquetas: { ok: "OK", aviso: "Avís", alerta: "Alerta", bloqueo: "Bloqueig" },
    planes: { vigia: "Vigía", centinela: "Centinela", guardian: "Guardián", egida: "Égida" },
    conIva: "al mes, IVA inclòs.", masIva: (e) => `al mes + IVA, uns ${e} per equip.`,
    errores: { falta: "Aquest camp és obligatori.", correo: "Escriu un correu vàlid, com ara nom@empresa.cat.", largo: "És massa llarg: com a màxim {n} caràcters." },
    enviando: "Enviant…", recibido: "Rebut (demostració)", avisoForm: "Demostració: aquest formulari encara no envia les dades.",
    sonidoOn: "Desactivar el so ambient", sonidoOff: "Activar el so ambient", abrirMenu: "Obrir el menú", cerrarMenu: "Tancar el menú",
    pestana: "Seguim de guàrdia · KAIRON",
    agarrado: "L'has agafat pel floc. Això és kairos: l'instant oportú.", pasado: "Ha passat. Per darrere ja no hi ha d'on agafar-lo.",
  } : {
    calma: "Todo en calma.", desvelo: "Seguimos despiertos.", manana: "Ya hemos repasado la noche.",
    eventos: [["ok", "Agente WS-07 en línea"], ["ok", "Integridad de archivos verificada"], ["aviso", "5 intentos de acceso fallidos · srv-01"], ["ok", "Reglas actualizadas (v2026.11)"], ["aviso", "USB desconocido en WS-12"], ["ok", "Copia de seguridad completada"], ["aviso", "Puerto 3389 expuesto · fw-edge"], ["ok", "Huella SHA-256 registrada · caso 0427"], ["ok", "Agente WS-03 en línea"], ["ok", "Certificado renovado · correo"]],
    etiquetas: { ok: "OK", aviso: "Aviso", alerta: "Alerta", bloqueo: "Bloqueo" },
    planes: { vigia: "Vigía", centinela: "Centinela", guardian: "Guardián", egida: "Égida" },
    conIva: "al mes, IVA incluido.", masIva: (e) => `al mes + IVA, unos ${e} por equipo.`,
    errores: { falta: "Este campo es obligatorio.", correo: "Escribe un correo válido, como nombre@empresa.es.", largo: "Es demasiado largo: como máximo {n} caracteres." },
    enviando: "Enviando…", recibido: "Recibido (demostración)", avisoForm: "Demostración: este formulario todavía no envía los datos.",
    sonidoOn: "Desactivar el sonido ambiente", sonidoOff: "Activar el sonido ambiente", abrirMenu: "Abrir menú", cerrarMenu: "Cerrar menú",
    pestana: "Seguimos de guardia · KAIRON",
    agarrado: "Lo has agarrado por el mechón. Eso es kairos: el instante oportuno.", pasado: "Ha pasado. Por detrás ya no hay de dónde agarrarlo.",
  };

  const limita = (v, a, b) => Math.min(b, Math.max(a, v));
  const mezcla = (a, b, t) => a + (b - a) * t;
  const tramo = (v, a, b) => limita((v - a) / (b - a), 0, 1);
  const suave = (t) => t * t * (3 - 2 * t);
  const paso = (v, a, b) => suave(tramo(v, a, b));
  // «Espera y golpea»: casi nada hasta la mitad y luego todo de una vez. Es la curva del instante.
  const golpe = (t) => (t < 0.5 ? 0.2 * t * t * 2 : 0.1 + 0.9 * (1 - Math.pow(1 - (t - 0.5) * 2, 3)));

  if (hayGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (haySplit) gsap.registerPlugin(SplitText);
    if (typeof ScrambleTextPlugin !== "undefined") gsap.registerPlugin(ScrambleTextPlugin);
    if (typeof CustomEase !== "undefined") {
      gsap.registerPlugin(CustomEase);
      CustomEase.create("k.out", "0.16,1,0.3,1");
      CustomEase.create("k.inOut", "0.76,0,0.24,1");
    }
    gsap.defaults({ ease: typeof CustomEase !== "undefined" ? "k.out" : "expo.out", duration: 1.1 });
  }
  const K_OUT = hayGSAP && typeof CustomEase !== "undefined" ? "k.out" : "expo.out";

  /* ---------- 2. Cielo y paleta: el color de cada hora ---------- */
  // Posición en la paleta («tono»): 0 anochecer · 1 noche cerrada · 2 antes del alba · 3 hora dorada · 4 día
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const TONOS = [
    { t: 0, alto: "#070b13", medio: "#0d1626", bajo: "#22314d", tierra: "#0b0f14", linea: "#d4af7a", luz: "#ffe2b0" },
    { t: 1, alto: "#04060a", medio: "#080c14", bajo: "#111b2c", tierra: "#090c11", linea: "#caa670", luz: "#ffe2b0" },
    { t: 2, alto: "#0d1424", medio: "#2a3350", bajo: "#7a6068", tierra: "#0c1016", linea: "#dcbd8e", luz: "#ffe9c4" },
    { t: 2.5, alto: "#4d4b66", medio: "#a8826c", bajo: "#f0c98e", tierra: "#120f10", linea: "#ecd3a4", luz: "#fff1d6" },
    { t: 3, alto: "#c59a62", medio: "#dcb985", bajo: "#f4e3bd", tierra: "#17120d", linea: "#f6e6c2", luz: "#ffffff" },
    { t: 3.45, alto: "#e9d2a4", medio: "#f0dfbb", bajo: "#f7ecd3", tierra: "#d9bd8b", linea: "#fbf1da", luz: "#ffffff" }, // la tierra, bañada de oro
    { t: 4, alto: "#f8f5ee", medio: "#f8f5ee", bajo: "#f8f5ee", tierra: "#f8f5ee", linea: "#b79b6e", luz: "#f8f5ee" },
  ].map((p) => ({ t: p.t, alto: hex(p.alto), medio: hex(p.medio), bajo: hex(p.bajo), tierra: hex(p.tierra), linea: hex(p.linea), luz: hex(p.luz) }));
  const CAMPOS_COLOR = ["alto", "medio", "bajo", "tierra", "linea", "luz"];
  const color = { alto: [0, 0, 0], medio: [0, 0, 0], bajo: [0, 0, 0], tierra: [0, 0, 0], linea: [0, 0, 0], luz: [0, 0, 0] };
  function paleta(tono) {
    let i = 0;
    while (i < TONOS.length - 2 && tono > TONOS[i + 1].t) i++;
    const a = TONOS[i], b = TONOS[i + 1], k = tramo(tono, a.t, b.t);
    CAMPOS_COLOR.forEach((c) => { for (let j = 0; j < 3; j++) color[c][j] = Math.round(mezcla(a[c][j], b[c][j], k)); });
  }
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

  // Estrellas: se dibujan una vez; el generador con semilla da siempre el mismo cielo
  const lienzoEstrellas = $(".cielo__estrellas");
  function estrellas() {
    if (!lienzoEstrellas) return;
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    lienzoEstrellas.width = Math.round(W * dpr); lienzoEstrellas.height = Math.round(H * dpr);
    const ctx = lienzoEstrellas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let s = 91;
    const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const n = Math.round((W * H) / 3400);
    for (let k = 0; k < n; k++) {
      const x = r() * W, y = Math.pow(r(), 1.5) * H * 0.78, t = r();
      const tono = t < 0.18 ? "241,220,176" : t < 0.26 ? "190,226,236" : "236,240,247";
      const radio = 0.35 + r() * r() * 1.2, alfa = 0.2 + r() * 0.6;
      ctx.fillStyle = `rgba(${tono},${alfa.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(x, y, radio, 0, Math.PI * 2); ctx.fill();
      if (radio > 1.25) { // las más brillantes llevan el destello en cruz del emblema
        ctx.fillStyle = `rgba(${tono},${(alfa * 0.5).toFixed(2)})`;
        const l = 4 + r() * 6;
        ctx.fillRect(x - l, y - 0.3, l * 2, 0.6); ctx.fillRect(x - 0.3, y - l, 0.6, l * 2);
      }
    }
  }

  /* ---------- 3. La tierra y las claves de la película ---------- */
  const contenedorTierra = $(".tierra");
  let T = null;
  if (contenedorTierra && window.kaironTierra && hayGSAP) {
    T = window.kaironTierra.crear(contenedorTierra, { bucle: false, movil: window.innerWidth < 760, dprMax: window.innerWidth < 760 ? 2 : 1.5 });
  }
  const hayPeli = !!T;
  if (hayPeli) {
    html.classList.add("peli");
    html.classList.toggle("peli--quieta", quieto());
    estrellas();
  }

  const sec = {};
  ["inicio", "guardia", "servicios", "soc", "incidente", "amanecer", "informe", "planes", "metodo", "testimonios", "faq", "equipo", "contacto"].forEach((id) => { sec[id] = { el: document.getElementById(id), top: 0, alto: 0 }; });
  const pasoNoche = $(".anochece__paso");
  let claves = [], vh = window.innerHeight, maxScroll = 1;
  const rango = { guardia: [0, 1], instante: [0, 1], amanecer: [0, 1], anochece: [0, 1] };
  const CAMPOS = ["tono", "hora", "viaje", "camY", "camZ", "cabeceo", "guinada", "fov", "mapa", "brillo", "luces", "baliza", "alfa"];
  const H = (h, m) => h * 60 + m; // minutos desde la medianoche del primer día (las 00:30 son 24:30)

  function medir() {
    vh = window.innerHeight;
    maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    Object.values(sec).forEach((s) => { if (s.el) { const r = s.el.getBoundingClientRect(); s.top = r.top + window.scrollY; s.alto = r.height; } });
    const q = quieto();
    const estrecha = window.innerWidth / vh < 0.85;
    const lista = [];
    let previa = { tono: 0, hora: H(23, 0), viaje: 0, camY: 2.5, camZ: 0, cabeceo: 0.045, guinada: 0, fov: 40, mapa: 0, brillo: 1, luces: 1, baliza: 1, alfa: 1 };
    const k = (y, v) => { previa = Object.assign({}, previa, v); lista.push(Object.assign({ y }, previa)); };
    const s = sec;

    // 23:00 Anochece
    k(0, {});
    k(s.inicio.alto * 0.85, { tono: 0.6, hora: H(23, 40), viaje: 5, camY: 2.3, cabeceo: 0.01 });
    // 00:30 La guardia: vuelo bajo por el valle
    const g0 = s.guardia.top, g1 = g0 + Math.max(1, s.guardia.alto - vh);
    rango.guardia = [g0, g1];
    k(g0, { tono: 1, hora: H(24, 30), viaje: 7, camY: 2.0, cabeceo: -0.05, fov: 42 });
    k(g1, { hora: H(24, 58), viaje: 24, camY: 1.8, cabeceo: -0.03, guinada: 0.05 });
    // Lectura: la cámara mira al cielo y la tierra queda como una franja al pie
    k(s.servicios.top + vh * 0.25, { hora: H(25, 15), viaje: 28, camY: 2.6, cabeceo: 0.325, guinada: 0, fov: 40, brillo: 0.9 });
    k(s.soc.top + vh * 0.25, { hora: H(26, 20), viaje: 38 });
    // 03:07 El instante: la cámara baja al valle y el tiempo se para
    const i0 = s.incidente.top, i1 = i0 + Math.max(1, s.incidente.alto - vh);
    rango.instante = [i0, i1];
    k(i0 - vh * 0.5, { hora: H(27, 0), viaje: 47, camY: 2.6, cabeceo: 0.2 });
    k(i0, { hora: H(27, 7), viaje: 52, camY: 2.5, cabeceo: -0.085, guinada: -0.13, fov: 40, brillo: 1 });
    k(i1, { hora: H(27, 18), camY: 2.25, cabeceo: -0.07, guinada: -0.17, fov: 32 });
    // 06:45 Amanece: del negro al oro; después la cámara sube y la tierra se vuelve el mapa del informe
    const a0 = s.amanecer.top, a1 = a0 + Math.max(1, s.amanecer.alto - vh), ap = (p) => a0 + (a1 - a0) * p;
    rango.amanecer = [a0, a1];
    k(ap(0), { tono: 1.5, hora: H(30, 0), viaje: 54, camY: 2.6, cabeceo: 0.05, guinada: 0, fov: 40 });
    k(ap(0.16), { tono: 2, hora: H(30, 25), viaje: 55 });
    k(ap(0.34), { tono: 2.5, hora: H(30, 45), viaje: 56, cabeceo: 0.08 });
    k(ap(0.5), { tono: 3, hora: H(31, 5), viaje: 57, camY: 3, cabeceo: 0.09, luces: 0.3, baliza: 0.3 });
    k(ap(0.66), { tono: 3.25, hora: H(31, 40), camY: 5, cabeceo: -0.08, luces: 0, baliza: 0 });
    k(ap(1), { tono: 4, hora: H(33, 0), viaje: 58, camY: 30, camZ: 22, cabeceo: -1.5, mapa: 1, alfa: 0.85 });
    // 09:00 A plena luz: el mapa queda de fondo, cada vez más tenue
    k(s.informe.top + vh * 0.2, { alfa: 0.62, hora: H(33, 14) });
    k(s.planes.top - vh * 0.2, { alfa: 0.5, hora: H(34, 0) });
    k(s.planes.top + vh * 0.3, { alfa: 0.15, hora: H(34, 30) });
    k(s.metodo.top, { hora: H(36, 0) });
    k(s.testimonios.top, { hora: H(39, 0) });
    k(s.faq.top, { hora: H(41, 30) });
    // 22:59 Vuelve la noche: el día se apaga y la cámara baja otra vez al valle
    const e0 = s.equipo.top, eh = pasoNoche ? pasoNoche.offsetHeight : vh, ep = (p) => e0 + eh * p;
    rango.anochece = [e0 - vh * 0.4, e0 + eh];
    k(ep(-0.4), { hora: H(43, 30) });
    k(ep(0.1), { tono: 3.2, hora: H(44, 30), alfa: 0.85, camY: 14, camZ: 12, cabeceo: -0.8, mapa: 0.6 });
    k(ep(0.42), { tono: 2.4, hora: H(45, 30), alfa: 1, camY: 3.4, camZ: 0, cabeceo: 0.02, mapa: 0, viaje: 62, luces: 0.5 });
    k(ep(0.8), { tono: 0.5, hora: H(46, 30), viaje: 64, camY: 2.6, cabeceo: 0.24, luces: 1, baliza: 1 });
    k(s.contacto.top, { tono: 0.7, hora: H(46, 59), viaje: 68, cabeceo: 0.21 });
    k(maxScroll, { tono: 1, hora: H(47, 0), viaje: 74, cabeceo: 0.12 });

    if (q) {
      // Sin movimiento: la cámara no vuela. Se queda en el encuadre de lectura y solo cambia el color.
      lista.forEach((c) => { c.viaje = 4; c.camY = 2.6; c.camZ = 0; c.cabeceo = 0.24; c.guinada = 0; c.fov = 40; c.mapa = 0; c.alfa = c.tono > 3.4 ? 0 : 1; c.brillo = 0.9; });
      lista[0].cabeceo = 0.045; lista[0].camY = 2.5;
    }
    if (estrecha) lista.forEach((c) => { c.fov += 16; c.camY += 0.25; });
    claves = lista.sort((a, b) => a.y - b.y);

    // La regla de horas: cada muesca, donde empieza su acto
    $$(".horas li a").forEach((a) => {
      const d = document.querySelector(a.getAttribute("href"));
      if (d) a.parentElement.style.setProperty("--x", limita((d.getBoundingClientRect().top + window.scrollY) / maxScroll, 0, 1).toFixed(4));
    });
    calcularParadas();
    sucio = true;
  }

  const estado = {};
  function estadoEn(y) {
    let a = claves[0], b = claves[claves.length - 1];
    if (y <= a.y) b = a;
    else if (y >= b.y) a = b;
    else for (let i = 0; i < claves.length - 1; i++) if (y >= claves[i].y && y <= claves[i + 1].y) { a = claves[i]; b = claves[i + 1]; break; }
    const t = a === b || b.y === a.y ? 0 : suave((y - a.y) / (b.y - a.y));
    CAMPOS.forEach((c) => { estado[c] = mezcla(a[c], b[c], t); });
    return estado;
  }

  /* ---------- 4. Escenas: lo que pasa dentro de cada acto según su avance (0 a 1) ---------- */
  const E = { entrada: hayPeli && !quieto() ? 0 : 1 }; // la escena se enciende al cargar
  const frasesGuardia = $$(".guardia__frase");
  const pasosInstante = $$(".instante__paso");
  const crono = $(".instante__crono"), intentosEl = $(".instante__intentos");
  const tituloAmanecer = $(".amanecer__titulo"), frasesAmanecer = $$(".amanecer__frase");
  const fraseNoche = $(".anochece__frase");
  const astro = $(".cielo__hora");
  const rotulos = $$(".rotulo").map((el) => ({ el, i: +el.dataset.actor, o: 0, obj: 0 }));
  const pos = { x: 0, y: 0, visible: false };
  const pieInstante = $(".instante__pie");

  // Una frase visible entre a y b del avance: entra subiendo y enfocando, sale hacia arriba
  function frase(el, p, a, b, sinSalida) {
    if (!el) return;
    const m = 0.045;
    const ent = suave(tramo(p, a, a + m)), sal = sinSalida ? 0 : suave(tramo(p, b - m, b));
    const o = ent * (1 - sal);
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translate3d(0,${((1 - ent) * 30 - sal * 24).toFixed(1)}px,0)`;
    el.style.filter = o > 0.985 ? "none" : `blur(${((1 - o) * 9).toFixed(1)}px)`;
    el.style.pointerEvents = o > 0.5 ? "" : "none";
  }
  const limpiar = (els) => els.forEach((el) => { if (el) { el.style.opacity = ""; el.style.transform = ""; el.style.filter = ""; el.style.pointerEvents = ""; } });

  // Balizas de KAIRON a lo largo del valle: en cada tramo del vuelo se ve la que toca
  const TORRES = [17, 36, 62, 84];
  function torre(viaje) {
    let z = TORRES[TORRES.length - 1];
    for (let i = 0; i < TORRES.length; i++) if (TORRES[i] - viaje > 1.5) { z = TORRES[i]; break; }
    const a = T.actor[0];
    a.z = z; a.x = T.eje(z) + (z === TORRES[0] ? -6.2 : z === TORRES[2] ? -4.4 : 5.4); // −X es la derecha de la pantalla
    return paso(z - viaje, 44, 30) * paso(z - viaje, 1.5, 4); // se apaga lejos y al pasar por debajo
  }

  // Dónde ocurre el instante (coordenadas de mundo): el servidor en el valle, el intruso en una sierra lejana
  const Z3 = 52;
  const lugar = { srv: [0, 0], intruso: [0, 0] };
  function prepararInstante() {
    const zs = Z3 + 13.5, zi = Z3 + 37;
    lugar.srv = [T.eje(zs) - 1.6, zs];
    lugar.intruso = [T.eje(zi) - 10, zi];
    T.amenazaPos.set(lugar.srv[0], lugar.srv[1]);
    const srv = T.actor[9], malo = T.actor[1];
    srv.x = lugar.srv[0]; srv.z = lugar.srv[1];
    malo.x = lugar.intruso[0]; malo.z = lugar.intruso[1];
    // La cadena: seis balizas en arco, del servidor a la torre de KAIRON
    const zt = TORRES[2], xt = T.eje(zt) - 4.4;
    for (let i = 0; i < 6; i++) {
      const t = (i + 1) / 7, c = T.actor[2 + i];
      c.x = mezcla(lugar.srv[0], xt, t) - Math.sin(Math.PI * t) * 2.2;
      c.z = mezcla(lugar.srv[1], zt, t) + Math.sin(Math.PI * t) * 2.5;
    }
  }

  const X = { luces: 1, baliza: 1 }; // énfasis que añaden las escenas
  let segundosInstante = -1, horaInstante = -1;

  function escenaGuardia(y, e) {
    const p = tramo(y, rango.guardia[0], rango.guardia[1]);
    if (y < rango.guardia[0] - vh || y > rango.guardia[1] + vh) return;
    frase(frasesGuardia[0], p, 0.03, 0.34);
    frase(frasesGuardia[1], p, 0.37, 0.67);
    frase(frasesGuardia[2], p, 0.71, 1, true);
    X.luces = 1 + 0.7 * paso(p, 0.02, 0.14) * (1 - paso(p, 0.62, 0.74));
    X.baliza = 1 + 1.5 * paso(p, 0.7, 0.8); // «Nosotros sí»: la baliza de KAIRON se aviva
    rotulos[0].obj = Math.max(rotulos[0].obj, paso(p, 0.72, 0.8));
  }

  function escenaInstante(y, e) {
    const [i0, i1] = rango.instante;
    horaInstante = -1;
    if (y < i0 - vh * 1.2 || y > i1 + vh) { segundosInstante = -1; return; }
    const p = tramo(y, i0, i1);
    frase(pasosInstante[0], p, 0.0, 0.15);
    frase(pasosInstante[1], p, 0.17, 0.4);
    frase(pasosInstante[2], p, 0.43, 0.61);
    frase(pasosInstante[3], p, 0.64, 0.82);
    frase(pasosInstante[4], p, 0.85, 1, true);
    if (crono) crono.style.opacity = paso(y, i0 - vh * 0.3, i0).toFixed(3);
    if (pieInstante) { const o = paso(p, 0.88, 0.95); pieInstante.style.opacity = o.toFixed(3); pieInstante.style.pointerEvents = o > 0.5 ? "" : "none"; }

    // El intruso aparece en la sierra lejana y prueba cinco contraseñas: cada una, un destello que cruza el valle
    const malo = T.actor[1], bala = T.actor[8], srv = T.actor[9];
    const llega = paso(p, 0.02, 0.1), seVa = paso(p, 0.76, 0.86);
    malo.f = llega * (1 - seVa);
    srv.f = paso(y, i0 - vh * 0.4, i0) * 0.9;
    const tiros = tramo(p, 0.17, 0.42) * 5;         // 0..5 intentos
    const n = Math.min(5, Math.floor(tiros)), fr = tiros - Math.floor(tiros);
    const volando = tiros > 0 && tiros < 5;
    const vuelo = volando ? tramo(fr, 0.05, 0.8) : 0;
    bala.f = volando && fr < 0.8 ? 1 : 0;
    bala.x = mezcla(lugar.intruso[0], lugar.srv[0], vuelo);
    bala.z = mezcla(lugar.intruso[1], lugar.srv[1], vuelo);
    bala.y = mezcla(T.altura(lugar.intruso[0], lugar.intruso[1]), T.altura(lugar.srv[0], lugar.srv[1]), vuelo) + Math.sin(Math.PI * vuelo) * 2.6;
    // Cada golpe tiñe de rojo las líneas alrededor del servidor; al quinto, la mancha se queda
    const eco = volando ? paso(fr, 0.8, 0.86) * (1 - paso(fr, 0.86, 1)) : 0;
    const fija = paso(p, 0.4, 0.44) * (1 - paso(p, 0.7, 0.8));
    e.amenaza = Math.max(eco * 0.9, fija);
    e.amenazaRadio = Math.max(0.9 + n * 0.28 + eco * 0.5, fija * 2.5);
    if (intentosEl) intentosEl.textContent = String(n + (volando && fr > 0.8 ? 1 : 0) > 5 ? 5 : n + (volando && fr > 0.8 ? 1 : 0));

    // «Lo vemos»: la alerta salta de baliza en baliza hasta KAIRON
    e.cadena = paso(p, 0.44, 0.58);
    e.cadenaF = 1 - paso(p, 0.86, 0.96) * 0.7;
    X.baliza = 1 + 1.8 * paso(p, 0.55, 0.62) * (1 - paso(p, 0.9, 1) * 0.5);
    // «Le cerramos el paso»: el cerco de oro espera… y se cierra de golpe
    const cierre = golpe(tramo(p, 0.62, 0.74));
    e.anillo = paso(p, 0.62, 0.66) * (1 - paso(p, 0.9, 1) * 0.55);
    e.anilloRadio = mezcla(7.5, 2.1, cierre);

    rotulos[0].obj = Math.max(rotulos[0].obj, paso(p, 0.5, 0.58));
    rotulos[1].obj = paso(p, 0.03, 0.12) * (1 - seVa);
    rotulos[2].obj = paso(y, i0 - vh * 0.2, i0 + 10) * (1 - paso(p, 0.94, 1));

    // El cronómetro: 03:07:00 → 38 s hasta la alerta → 24 s hasta el bloqueo → diez minutos después
    let seg;
    if (p < 0.17) seg = 0;
    else if (p < 0.44) seg = tramo(p, 0.17, 0.44) * 38;
    else if (p < 0.62) seg = 38;
    else if (p < 0.74) seg = 38 + tramo(p, 0.62, 0.74) * 24;
    else if (p < 0.85) seg = 62;
    else seg = 62 + paso(p, 0.85, 0.93) * 600;
    seg = Math.round(seg);
    if (y >= i0 && y <= i1) horaInstante = H(27, 7) + seg / 60;
    if (crono && seg !== segundosInstante) {
      if (sonido.activo && segundosInstante >= 0) {
        if (seg === 38 && segundosInstante < 38) sonido.tono(880, 0.5, 0.06);          // alerta
        if (seg === 62 && segundosInstante < 62) { sonido.tono(196, 0.9, 0.07); sonido.tono(392, 0.9, 0.04); } // bloqueo
      }
      segundosInstante = seg;
      const total = 3 * 3600 + 7 * 60 + seg;
      crono.textContent = [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60].map((v) => String(v).padStart(2, "0")).join(":");
      crono.style.color = p >= 0.74 ? "var(--oro-vivo)" : "";
    }
  }

  function escenaAmanecer(y) {
    const [a0, a1] = rango.amanecer;
    if (y < a0 - vh || y > a1 + vh) return;
    const p = tramo(y, a0, a1);
    frase(tituloAmanecer, p, 0.2, 0.62);
    frase(frasesAmanecer[0], p, 0.28, 0.6);
    frase(frasesAmanecer[1], p, 0.68, 1, true);
  }

  // La hora en grande que sale tras las crestas al empezar cada acto
  const ASTROS = [["guardia", "00:30"], ["instante", "03:07"], ["amanecer", "06:45"]];
  let astroTexto = "";
  function astroEn(y, tono) {
    if (!astro) return;
    let o = 0, ty = 0, texto = astroTexto;
    for (const [id, t] of ASTROS) {
      const y0 = rango[id][0] - vh * 0.5, y1 = rango[id][0] + vh * 0.5;
      if (y > y0 && y < y1) {
        const p = tramo(y, y0, y1);
        o = paso(p, 0.02, 0.22) * (1 - paso(p, 0.6, 0.96));
        ty = mezcla(50, -8, suave(p));
        texto = t;
      }
    }
    if (texto !== astroTexto) { astroTexto = texto; astro.textContent = texto; }
    astro.style.opacity = (o * 0.92).toFixed(3);
    astro.style.transform = `translate3d(0,${ty.toFixed(2)}vh,0)`;
    astro.style.color = astroTexto === "03:07" ? "var(--rojo)" : "var(--oro)";
  }

  /* ---------- 5. El fotograma: un solo bucle para todo ---------- */
  let lenis = null, sucio = true, yPintada = -1, tiempoAnterior = 0, luzAnterior = "";
  const raton = { x: 0, y: 0, sx: 0, sy: 0, px: -9, py: -9, activo: false, fuerza: 0 };
  const farolEl = $(".farol");
  const raiz = html.style;
  const titularCielo = $(".titular__cielo");
  const horasReloj = $(".horas__reloj"), horasHora = $(".horas__hora");
  let horaTexto = "";
  const enlacesHoras = $$(".horas li a");
  const objetivosHoras = enlacesHoras.map((a) => document.querySelector(a.getAttribute("href")));

  function ponerHora(minutos, conSegundos) {
    const m = ((Math.floor(minutos) % 1440) + 1440) % 1440;
    const t = String(Math.floor(m / 60) % 24).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
    if (t !== horaTexto && horasHora) { horaTexto = t; horasHora.textContent = t; }
  }

  function fotograma(tiempo) {
    const ahora = tiempo * 1000;
    const dt = Math.min(0.05, (ahora - tiempoAnterior) / 1000); tiempoAnterior = ahora;
    if (document.hidden) return;
    const y = window.scrollY;
    const mueve = y !== yPintada;

    // El farol sigue al cursor con un poco de inercia
    raton.sx += (raton.x - raton.sx) * 0.07; raton.sy += (raton.y - raton.sy) * 0.07;
    const ratonMueve = Math.abs(raton.x - raton.sx) + Math.abs(raton.y - raton.sy) > 0.0006;

    if (!hayPeli) { if (mueve) { yPintada = y; interfaz(y, 0); } return; }

    const S = estadoEn(y);
    const noche = S.tono < 3.6;
    // De día el mapa está quieto: solo se repinta si el scroll se mueve. De noche las luces parpadean siempre.
    const vivo = noche && S.alfa > 0.02 && !quieto();
    if (!mueve && !sucio && !vivo && !ratonMueve && E.entrada >= 1) return;
    sucio = false; yPintada = y;

    const e = T.e, q = quieto();
    X.luces = 1; X.baliza = 1;
    rotulos.forEach((r) => { r.obj = 0; });
    e.amenaza = 0; e.anillo = 0; e.cadena = 0;
    T.actor[1].f = 0; T.actor[8].f = 0; T.actor[9].f = 0;

    if (!q) {
      escenaGuardia(y, e);
      escenaInstante(y, e);
      escenaAmanecer(y);
      astroEn(y, S.tono);
      if (fraseNoche) frase(fraseNoche, tramo(y, rango.anochece[0], rango.anochece[1]), 0.3, 0.96);
      // En la portada, la etiqueta de la baliza
      rotulos[0].obj = Math.max(rotulos[0].obj, (1 - paso(y, vh * 0.12, vh * 0.4)) * E.entrada);
    }

    // Color de la hora: cielo (CSS) y tierra (WebGL) salen de la misma paleta
    paleta(S.tono);
    raiz.setProperty("--cielo-alto", rgb(color.alto));
    raiz.setProperty("--cielo-medio", rgb(color.medio));
    raiz.setProperty("--cielo-bajo", rgb(color.bajo));
    raiz.setProperty("--estrellas", ((1 - paso(S.tono, 1.4, 2.5)) * (0.8 + 0.2 * tramo(S.tono, 0, 1)) * E.entrada).toFixed(3));
    const sol = paso(S.tono, 1.7, 2.6) * (1 - paso(S.tono, 3.2, 3.95));
    raiz.setProperty("--sol", sol.toFixed(3));
    raiz.setProperty("--sol-escala", mezcla(0.16, 1.15, paso(S.tono, 1.7, 3.3)).toFixed(3));
    const luz = S.tono > 2.62 ? "dia" : "noche";
    if (luz !== luzAnterior) { luzAnterior = luz; html.dataset.luz = luz; raiz.setProperty("--color-escena", luz === "dia" ? "var(--tinta)" : "var(--marfil)"); }
    const C = (c, v) => c.setRGB(v[0] / 255, v[1] / 255, v[2] / 255, THREE.SRGBColorSpace);
    C(T.col.tierra, color.tierra); C(T.col.bruma, color.bajo); C(T.col.linea, color.linea); C(T.col.luz, color.luz);

    // Cámara: sigue el eje del valle y cede un poco al cursor
    const mx = q ? 0 : raton.sx, my = q ? 0 : raton.sy;
    e.viaje = S.viaje;
    e.camY = S.camY; e.camZ = S.camZ;
    e.camX = mezcla(T.eje(S.viaje + 4) * 0.85, T.eje(S.viaje + 22), S.mapa);
    e.cabeceo = S.cabeceo - my * 0.012 * (1 - S.mapa);
    e.guinada = S.guinada - mx * 0.03 * (1 - S.mapa);
    e.fov = S.fov; e.mapa = S.mapa; e.alfa = S.alfa;
    e.brilloLineas = S.brillo * mezcla(0.0, 1, E.entrada);
    e.luces = S.luces * X.luces * E.entrada;
    e.baliza = S.baliza * X.baliza * torre(S.viaje) * E.entrada;
    // Penumbra bajo los textos que van sobre la tierra: la portada (abajo a la izquierda) y el instante (columna izquierda)
    const vPortada = (1 - paso(y, vh * 0.25, vh * 0.8)) * E.entrada, vInstante = paso(y, rango.instante[0] - vh * 0.5, rango.instante[0]) * (1 - paso(y, rango.instante[1], rango.instante[1] + vh * 0.6));
    const vGuardia = paso(y, rango.guardia[0] - vh * 0.5, rango.guardia[0]) * (1 - paso(y, rango.guardia[1], rango.guardia[1] + vh * 0.5));
    if (vInstante > 0.01) { e.veloX = 0.16; e.veloY = 0.4; e.veloRX = 0.42; e.veloRY = 0.52; e.velo = vInstante * 0.96; }
    else if (vGuardia > 0.01) { e.veloX = 0.2; e.veloY = 0.44; e.veloRX = 0.46; e.veloRY = 0.42; e.velo = vGuardia * 0.94; }
    else { e.veloX = 0.17; e.veloY = 0.76; e.veloRX = 0.42; e.veloRY = 0.44; e.velo = vPortada * 0.94; }
    e.grosor = (html.classList.contains("presentacion") ? 1.25 : 0.78) * Math.pow(Math.min(window.devicePixelRatio || 1, 2), 0.8);

    // El farol: ilumina y levanta la tierra donde apunta el cursor
    raton.fuerza += ((raton.activo && noche && !q ? 1 : 0) - raton.fuerza) * 0.08;
    e.farolF = raton.fuerza * (1 - S.mapa);
    if (raton.activo) T.apuntar(raton.x, -raton.y);
    if (farolEl) {
      farolEl.style.opacity = (raton.fuerza * (1 - paso(S.tono, 2.2, 3))).toFixed(3);
      farolEl.style.transform = `translate3d(${raton.px.toFixed(1)}px,${raton.py.toFixed(1)}px,0)`;
    }

    T.aquietar(q);
    T.pintar(ahora);

    // Etiquetas colgadas de las luces
    rotulos.forEach((r) => {
      r.o += (r.obj - r.o) * 0.14;
      if (r.o < 0.01) { if (r.el.style.opacity !== "0") r.el.style.opacity = "0"; return; }
      T.proyectar(r.i, pos);
      r.el.style.opacity = (pos.visible ? r.o : 0).toFixed(3);
      r.el.style.transform = `translate3d(${(pos.x + 6).toFixed(1)}px,${(pos.y - 9).toFixed(1)}px,0)`;
    });

    // El titular se pone tras las crestas al empezar a bajar
    if (titularCielo && y < vh * 1.4 && !q) titularCielo.style.transform = `translate3d(0,${(y * 1.5).toFixed(1)}px,0)`;

    interfaz(y, horaInstante >= 0 ? horaInstante : S.hora);
  }

  // Regla de horas, cabecera y controles
  let ultimoScroll = window.scrollY, recorrido = 0;
  const cabecera = $(".cabecera");
  function interfaz(y, hora) {
    if (horasReloj) horasReloj.style.setProperty("--avance", limita(y / maxScroll, 0, 1).toFixed(4));
    if (hayPeli) ponerHora(hora);
    let activa = 0;
    objetivosHoras.forEach((o, i) => { if (o && o.getBoundingClientRect().top <= vh * 0.5) activa = i; });
    enlacesHoras.forEach((a, i) => a.classList.toggle("activa", i === activa));
    // La cabecera se retira al bajar y vuelve al subir (con margen, para que no parpadee)
    const dy = y - ultimoScroll; ultimoScroll = y;
    if (cabecera && !html.classList.contains("menu-abierto")) {
      if (y <= 240) { cabecera.classList.remove("cabecera--oculta"); recorrido = 0; }
      else if (dy !== 0) {
        recorrido = Math.sign(dy) === Math.sign(recorrido) ? recorrido + dy : dy;
        if (recorrido > 48) cabecera.classList.add("cabecera--oculta");
        else if (recorrido < -48) cabecera.classList.remove("cabecera--oculta");
      }
    }
  }

  /* ---------- 6. Arranque y entrada ---------- */
  function arrancar() {
    if (hayGSAP) {
      if (typeof Lenis !== "undefined" && !quieto()) {
        lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
        window.kaironLenis = lenis;
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000), false, true);
        gsap.ticker.lagSmoothing(0);
      }
      ScrollTrigger.config({ ignoreMobileResize: true });
      ScrollTrigger.addEventListener("refresh", medir);
      gsap.ticker.add(fotograma);
    } else {
      window.addEventListener("scroll", () => interfaz(window.scrollY, 0), { passive: true });
    }
    if (hayPeli) prepararInstante();
    medir();
    revelados();
    entrada();
    const listo = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    listo.then(() => { if (hayGSAP) ScrollTrigger.refresh(); else medir(); });
    window.addEventListener("load", () => { if (hayGSAP) ScrollTrigger.refresh(); else medir(); });
    let anchoPrevio = window.innerWidth, tm = 0;
    window.addEventListener("resize", () => {
      sucio = true;
      if (Math.abs(window.innerWidth - anchoPrevio) < 2) return; // la barra del móvil cambia el alto: no se redibuja el cielo
      anchoPrevio = window.innerWidth;
      clearTimeout(tm); tm = setTimeout(estrellas, 200);
    });
    document.addEventListener("visibilitychange", () => { sucio = true; });
  }

  // La entrada: la tierra se enciende y el titular sale de detrás de las crestas, como la luna
  function entrada() {
    const lineas = $$(".titular__linea");
    const resto = [$(".titular__tierra"), ...$$(".anochecer__pie > *"), $(".ahora")].filter(Boolean);
    if (!hayGSAP || quieto()) { E.entrada = 1; return; }
    const tl = gsap.timeline({ delay: 0.15, onUpdate: () => { sucio = true; } });
    if (hayPeli) {
      gsap.set(lineas, { y: "64vh" });
      tl.to(E, { entrada: 1, duration: 2.6, ease: "power2.out" }, 0)
        .to(lineas, { y: 0, duration: 1.9, ease: K_OUT, stagger: 0.16 }, 0.35);
    } else if (haySplit) {
      tl.from(lineas, { yPercent: 105, duration: 1.2, stagger: 0.12 }, 0);
    }
    tl.from(resto, { opacity: 0, y: 24, duration: 1.1, stagger: 0.09, clearProps: "transform,opacity" }, hayPeli ? 1.35 : 0.5)
      .from([cabecera, $(".horas")].filter(Boolean), { opacity: 0, duration: 1.1, stagger: 0.08, clearProps: "opacity" }, hayPeli ? 1.1 : 0.3);
  }

  // Títulos y textos de las secciones de lectura: cada línea sube desde detrás de su horizonte, una vez
  function revelados() {
    if (!hayGSAP || quieto()) return;
    const fuentes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fuentes.then(() => {
      if (haySplit) {
        $$(".capitular").forEach((t) => {
          let hecho = false;
          SplitText.create(t, {
            type: "lines", mask: "lines", autoSplit: true, aria: "auto",
            onSplit(self) {
              if (hecho) return null;
              return gsap.from(self.lines, { yPercent: 104, duration: 1.1, stagger: 0.12, scrollTrigger: { trigger: t, start: "top 86%", once: true, onEnter: () => { hecho = true; } } });
            },
          });
        });
      }
      const grupos = [".oficios__voz", ".oficio", ".oficios__mas", ".libro__cabecera > :not(.capitular)", ".libro__hoja", ".informe__texto > :not(.capitular)", ".planes__entrada", ".calculo", ".tarifas tbody tr", ".planes__nota", ".metodo__pasos li", ".medidas > :not(.capitular)", ".testimonios .sello", ".testimonio", ".faq__lista", ".persona", ".pie__llamada > :not(.capitular)", ".formulario", ".pie__base"];
      grupos.forEach((selector) => {
        const piezas = $$(selector);
        if (!piezas.length) return;
        gsap.set(piezas, { opacity: 0, y: 24 });
        ScrollTrigger.batch(piezas, { start: "top 88%", once: true, onEnter: (lote) => gsap.to(lote, { opacity: 1, y: 0, duration: 1.1, stagger: { amount: Math.min(0.5, lote.length * 0.08) }, clearProps: "transform,opacity" }) });
      });
      // El parte: la hoja cae sobre el mapa, el lacre se estampa y las huellas se descifran
      const hoja = $(".hoja"), lacre = $(".hoja__lacre");
      if (hoja) {
        gsap.set(hoja, { opacity: 0, y: 60, rotation: 2.5 });
        if (lacre) gsap.set(lacre, { opacity: 0, scale: 1.7, rotation: 24 });
        ScrollTrigger.create({ trigger: hoja, start: "top 82%", once: true, onEnter: () => {
          const tl = gsap.timeline();
          tl.to(hoja, { opacity: 1, y: 0, rotation: window.innerWidth > 1080 ? -1.1 : 0, duration: 1.2, clearProps: "transform" });
          if (lacre) tl.to(lacre, { opacity: 1, scale: 1, rotation: 9, duration: 0.5, ease: "power4.in", clearProps: "transform,opacity", onComplete: () => sonido.tono(150, 0.25, 0.08) }, 0.9);
          if (typeof ScrambleTextPlugin !== "undefined") $$(".huella", hoja).forEach((h, i) => tl.to(h, { duration: 0.9, ease: "none", scrambleText: { text: h.textContent, chars: "0123456789abcdef", speed: 0.6 } }, 0.5 + i * 0.12));
        } });
      }
    });
  }

  /* ---------- 7. Interfaz ---------- */
  // La hora real de Barcelona, en la portada y en el pie
  const relojes = $$(".ahora__hora"), estadoAhora = $(".ahora__estado");
  function horaReal() {
    let h = "--:--", n = 12;
    try {
      h = new Intl.DateTimeFormat(CA ? "ca-ES" : "es-ES", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Madrid" }).format(new Date());
      n = parseInt(h, 10);
    } catch (e) { const d = new Date(); h = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); n = d.getHours(); }
    relojes.forEach((r) => { r.textContent = h; r.dateTime = h; });
    if (estadoAhora) estadoAhora.textContent = n < 6 ? TXT.desvelo : n >= 9 && n < 11 ? TXT.manana : TXT.calma;
  }
  horaReal();
  setInterval(horaReal, 20000);

  // El farol y la luz de las tarjetas siguen al cursor
  if (ratonFino) {
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      raton.x = (e.clientX / window.innerWidth - 0.5) * 2; raton.y = (e.clientY / window.innerHeight - 0.5) * 2;
      raton.px = e.clientX; raton.py = e.clientY; raton.activo = true;
    }, { passive: true });
    document.addEventListener("pointerleave", () => { raton.activo = false; });
    $$(".oficio").forEach((o) => o.addEventListener("pointermove", (e) => {
      const r = o.getBoundingClientRect();
      o.style.setProperty("--lx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      o.style.setProperty("--ly", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    }));
  }

  // Menú a pantalla completa
  const botonMenu = $(".menu-boton"), menuMovil = $(".menu-movil");
  function menu(abrir) {
    if (!botonMenu || !menuMovil) return;
    html.classList.toggle("menu-abierto", abrir);
    botonMenu.setAttribute("aria-expanded", String(abrir));
    botonMenu.setAttribute("aria-label", abrir ? TXT.cerrarMenu : TXT.abrirMenu);
    menuMovil.setAttribute("aria-hidden", String(!abrir));
    if (lenis) abrir ? lenis.stop() : lenis.start();
    if (abrir) { const a = $("a", menuMovil); if (a) setTimeout(() => a.focus(), 80); } else botonMenu.focus();
  }
  if (botonMenu) botonMenu.addEventListener("click", () => menu(!html.classList.contains("menu-abierto")));
  if (menuMovil) menuMovil.addEventListener("click", (e) => { if (e.target.closest("a")) menu(false); });

  // Enlaces internos: con el scroll suave, van a su sitio sin saltos
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const d = document.querySelector(a.getAttribute("href"));
    if (!d) return;
    e.preventDefault();
    ir(d.getBoundingClientRect().top + window.scrollY + (d.id === "incidente" || d.id === "guardia" || d.id === "amanecer" ? 2 : 0));
    if (d.id === "contacto") setTimeout(() => { const n = $("#nombre"); if (n) n.focus({ preventScroll: true }); }, 1300);
    history.replaceState(null, "", a.getAttribute("href"));
  });
  function ir(y, duracion) {
    y = limita(y, 0, maxScroll);
    if (lenis && !quieto()) lenis.scrollTo(y, { duration: duracion || 1.6 });
    else window.scrollTo(0, y);
  }

  // El libro de guardia: cada pocos segundos se apunta algo más (simulado)
  const libro = $(".libro__entradas"), cifra = $(".libro__cifra");
  if (libro) {
    let minutos = 2 * 60 + 31, indice = 0, visto = false, total = cifra ? +cifra.dataset.vivo : 0;
    const apuntar = () => {
      if (!visto || document.hidden || quieto()) return;
      const [tipo, texto] = TXT.eventos[indice++ % TXT.eventos.length];
      minutos += 2 + Math.floor(Math.random() * 6);
      const li = document.createElement("li");
      li.className = tipo;
      const hora = `0${Math.floor(minutos / 60) % 24}`.slice(-2) + ":" + `0${minutos % 60}`.slice(-2) + ":" + `0${Math.floor(Math.random() * 60)}`.slice(-2);
      li.innerHTML = "<time></time><b></b><span></span>";
      li.children[0].textContent = hora; li.children[1].textContent = TXT.etiquetas[tipo]; li.children[2].textContent = texto;
      libro.prepend(li);
      if (hayGSAP) gsap.from(li, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, duration: 0.6, clearProps: "all" });
      while (libro.children.length > 6) libro.lastElementChild.remove();
      if (tipo === "aviso") { const a = $("[data-avisos]"); if (a) a.textContent = String(+a.textContent + 1); }
      sonido.tono(tipo === "aviso" ? 520 : 1180, 0.12, 0.018);
    };
    const contar = () => {
      if (!visto || document.hidden || !cifra) return;
      total += 3 + Math.floor(Math.random() * 38);
      cifra.textContent = total.toLocaleString("es-ES");
    };
    if ("IntersectionObserver" in window) new IntersectionObserver((en) => { visto = en[0].isIntersecting; }, { threshold: 0.2 }).observe(libro);
    setInterval(apuntar, 3400);
    setInterval(contar, 450);
  }

  // Calculadora de planes: cuántos equipos → qué plan y cuánto
  const calculo = $(".calculo");
  if (calculo) {
    calculo.hidden = false;
    const control = $("#calculo-equipos"), nEl = $(".calculo__n"), planEl = $(".calculo__plan"), precioEl = $(".calculo__precio"), notaEl = $(".calculo__nota");
    const euros = (v) => v.toLocaleString("es-ES", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " €";
    const calcular = () => {
      const n = +control.value;
      let plan, precio, nota;
      if (n <= 2) { plan = "vigia"; precio = 9.9; nota = TXT.conIva; }
      else if (n <= 5) { plan = "centinela"; precio = 24.9; nota = TXT.conIva; }
      else if (n <= 10) { plan = "guardian"; precio = 64.9; nota = TXT.conIva; }
      else { plan = "egida"; precio = 590 + Math.max(0, n - 25) * 12; nota = TXT.masIva(euros(Math.round((precio / n) * 100) / 100)); }
      nEl.textContent = String(n); planEl.textContent = TXT.planes[plan]; precioEl.textContent = euros(precio); notaEl.textContent = nota;
      $$(".tarifas tbody tr").forEach((tr) => tr.classList.toggle("elegido", tr.dataset.plan === plan));
    };
    control.addEventListener("input", calcular);
    calcular();
  }

  /* ---------- 8. La demo: simular el ataque y atajos para presentar ---------- */
  function simular() {
    const [i0, i1] = rango.instante;
    if (!hayPeli || quieto()) { ir(sec.incidente.top); return; }
    const empezar = () => { if (lenis) lenis.scrollTo(i1 - 4, { duration: 15, easing: (t) => t }); };
    if (Math.abs(window.scrollY - i0) < 40) empezar();
    else { lenis ? lenis.scrollTo(i0 + 2, { duration: 1.4, onComplete: empezar }) : window.scrollTo(0, i0 + 2); }
  }
  $$(".simular").forEach((b) => b.addEventListener("click", simular));

  let paradas = [0];
  function calcularParadas() {
    const lista = [0];
    const fr = (r, ps) => ps.forEach((p) => lista.push(Math.round(mezcla(r[0], r[1], p))));
    if (hayPeli && !quieto()) { fr(rango.guardia, [0.2, 0.52, 0.86]); fr(rango.instante, [0.08, 0.3, 0.52, 0.76, 0.96]); fr(rango.amanecer, [0.45, 0.86]); }
    ["servicios", "soc", "informe", "planes", "metodo", "testimonios", "faq", "equipo", "contacto"].forEach((id) => { if (sec[id].el) lista.push(Math.round(sec[id].top - (id === "equipo" ? -vh * 0.9 : 60))); });
    if (quieto() || !hayPeli) ["guardia", "incidente", "amanecer"].forEach((id) => lista.push(Math.round(sec[id].top)));
    paradas = [...new Set(lista.map((y) => limita(y, 0, maxScroll)))].sort((a, b) => a - b);
  }

  const atajos = $(".atajos");
  const verAtajos = (v) => { if (atajos) { atajos.classList.toggle("visible", v); atajos.setAttribute("aria-hidden", String(!v)); } };
  if (atajos) atajos.addEventListener("click", () => verAtajos(false));
  let tecleado = "";
  window.addEventListener("keydown", (e) => {
    const campo = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === "Escape") { verAtajos(false); if (html.classList.contains("menu-abierto")) menu(false); return; }
    // Con Ctrl, Cmd o Alt el atajo es del navegador: no se toca
    if (campo || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    const tecla = e.key.toLowerCase();
    if (e.key.length === 1) { tecleado = (tecleado + tecla).slice(-6); if (tecleado === "kairos") { tecleado = ""; mechon(); return; } }
    if (e.key === "?") { e.preventDefault(); verAtajos(!atajos.classList.contains("visible")); }
    else if (tecla === "a" && !tecleado.endsWith("ka")) { simular(); }
    else if (tecla === "p") {
      const activo = html.classList.toggle("presentacion");
      try { sessionStorage.setItem("kairon-presentacion", activo ? "1" : "0"); } catch (err) { /* sin almacenamiento */ }
      if (hayGSAP) setTimeout(() => ScrollTrigger.refresh(), 300);
    }
    else if (tecla === "e") { window.location.href = "sobre-mi.html"; }
    else if (e.key === "Home") { e.preventDefault(); ir(0); }
    else if (e.key === "End") { e.preventDefault(); ir(sec.contacto.top); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const y = window.scrollY;
      const destino = e.key === "ArrowDown" ? paradas.find((p) => p > y + 12) : paradas.slice().reverse().find((p) => p < y - 12);
      if (destino !== undefined) { e.preventDefault(); ir(destino, 1.3); }
    }
  });

  // «Menos movimiento»: al cambiarlo se recarga la coreografía entera
  const botonMovimiento = $(".control--movimiento");
  if (botonMovimiento) {
    botonMovimiento.setAttribute("aria-pressed", String(html.classList.contains("menos-movimiento")));
    botonMovimiento.addEventListener("click", () => {
      const activo = !html.classList.contains("menos-movimiento");
      try { localStorage.setItem("kairon-menos-movimiento", activo ? "1" : "0"); } catch (e) { /* sin almacenamiento */ }
      window.location.reload();
    });
  }

  /* ---------- 9. Formulario: validación campo a campo (es una demostración: no envía) ---------- */
  const formulario = $(".formulario");
  if (formulario) {
    const campos = $$("input:not([name=web]), textarea", formulario);
    const validar = (c) => {
      const v = c.value.trim();
      let m = "";
      if (c.required && !v) m = TXT.errores.falta;
      else if (c.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = TXT.errores.correo;
      else if (c.maxLength > 0 && v.length > c.maxLength) m = TXT.errores.largo.replace("{n}", c.maxLength);
      const err = document.getElementById("error-" + c.id);
      if (err) { err.textContent = m; err.hidden = !m; }
      if (m) c.setAttribute("aria-invalid", "true"); else c.removeAttribute("aria-invalid");
      return !m;
    };
    campos.forEach((c) => {
      const err = document.createElement("p");
      err.className = "formulario__error"; err.id = "error-" + c.id; err.hidden = true;
      c.closest(".formulario__campo").after(err);
      c.setAttribute("aria-describedby", err.id);
      c.addEventListener("input", () => { if (c.getAttribute("aria-invalid") === "true") validar(c); });
      c.addEventListener("blur", () => { if (c.value) validar(c); });
    });
    formulario.addEventListener("submit", (e) => {
      e.preventDefault();
      const malos = campos.filter((c) => !validar(c));
      if (malos.length) { malos[0].focus(); return; }
      const trampa = $('input[name="web"]', formulario);
      if (trampa && trampa.value) { formulario.reset(); return; } // un robot ha rellenado el campo trampa
      const aviso = $(".formulario__aviso", formulario), boton = $("button[type=submit]", formulario);
      const texto = boton.textContent;
      boton.disabled = true; boton.textContent = TXT.enviando;
      setTimeout(() => {
        boton.textContent = TXT.recibido;
        if (aviso) { aviso.textContent = TXT.avisoForm; aviso.hidden = false; }
        setTimeout(() => { boton.disabled = false; boton.textContent = texto; }, 4000);
      }, 900);
    });
  }

  /* ---------- 10. Sonido: apagado por defecto; sintetizado, sin archivos ---------- */
  const sonido = {
    activo: false, ctx: null, ambiente: null,
    tono(frec, dur, vol) {
      if (!this.activo || !this.ctx) return;
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(frec, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(frec * 0.62, c.currentTime + dur);
      g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + dur);
    },
    // El ambiente de la noche: dos notas graves muy bajas que respiran
    encender() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.ctx.resume();
      const c = this.ctx, salida = c.createGain();
      salida.gain.value = 0; salida.gain.linearRampToValueAtTime(0.028, c.currentTime + 2.5); salida.connect(c.destination);
      const osc = [55, 82.5].map((f) => { const o = c.createOscillator(); o.type = "sine"; o.frequency.value = f; o.connect(salida); o.start(); return o; });
      const lfo = c.createOscillator(), prof = c.createGain();
      lfo.frequency.value = 0.07; prof.gain.value = 0.012; lfo.connect(prof).connect(salida.gain); lfo.start();
      this.ambiente = { salida, osc: osc.concat(lfo) };
      this.activo = true;
      this.tono(660, 0.5, 0.05);
    },
    apagar() {
      this.activo = false;
      if (this.ambiente) { const a = this.ambiente; a.salida.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4); setTimeout(() => a.osc.forEach((o) => o.stop()), 500); this.ambiente = null; }
    },
  };
  const botonSonido = $(".control--sonido");
  if (botonSonido && (window.AudioContext || window.webkitAudioContext)) {
    botonSonido.addEventListener("click", () => {
      const activar = !sonido.activo;
      activar ? sonido.encender() : sonido.apagar();
      botonSonido.setAttribute("aria-pressed", String(activar));
      botonSonido.setAttribute("aria-label", activar ? TXT.sonidoOn : TXT.sonidoOff);
    });
    document.addEventListener("pointerover", (e) => { if (sonido.activo && e.target.closest && e.target.closest(".boton, .enlace")) sonido.tono(1320, 0.07, 0.012); });
  } else if (botonSonido) botonSonido.hidden = true;

  /* ---------- 11. Sorpresas ---------- */
  // Al cambiar de pestaña, el título avisa de que la guardia sigue
  const titulo = document.title;
  document.addEventListener("visibilitychange", () => { document.title = document.hidden ? TXT.pestana : titulo; });

  // Para quien abre la consola
  try {
    console.log("%cKAIRON%c\n¿Mirando el código? Bien hecho: nosotros también leemos los registros.\nPrueba a escribir «kairos» en la página.", "font:600 22px Cinzel,serif;color:#d4af7a", "font:14px Georgia,serif;color:#8c6b3f");
  } catch (e) { /* sin consola */ }

  // Escribir «kairos»: el instante cruza la pantalla. Solo se le puede agarrar de frente, mientras pasa.
  let mechonActivo = false;
  function mechon() {
    if (mechonActivo) return;
    mechonActivo = true;
    const el = document.createElement("button");
    el.type = "button"; el.className = "mechon"; el.setAttribute("aria-label", "καιρός");
    el.innerHTML = '<span lang="el">καιρός</span>';
    document.body.append(el);
    let agarrado = false;
    const fin = () => { if (el.isConnected) el.remove(); aviso(agarrado ? TXT.agarrado : TXT.pasado); mechonActivo = false; };
    el.addEventListener("click", () => { agarrado = true; fin(); });
    sonido.tono(1560, 0.6, 0.03);
    if (hayGSAP && !quieto()) gsap.fromTo(el, { xPercent: -120, x: 0 }, { x: window.innerWidth + 300, duration: 2.1, ease: "power1.in", onComplete: fin });
    else setTimeout(fin, 4000);
  }
  function aviso(texto) {
    const el = document.createElement("p");
    el.className = "aviso-flotante"; el.setAttribute("role", "status"); el.textContent = texto;
    document.body.append(el);
    setTimeout(() => el.classList.add("visible"), 20);
    setTimeout(() => { el.classList.remove("visible"); setTimeout(() => el.remove(), 700); }, 5200);
  }

  /* ---------- 12. Aplicación instalable y estado de la red ---------- */
  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    const raizSitio = html.dataset.raiz || "./";
    navigator.serviceWorker.register(raizSitio + "sw.js", { scope: raizSitio }).catch(() => { /* sin service worker */ });
  }
  let promptInstalar = null;
  const botonInstalar = $(".instalar");
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); promptInstalar = e; if (botonInstalar) botonInstalar.hidden = false; });
  if (botonInstalar) botonInstalar.addEventListener("click", async () => { if (!promptInstalar) return; promptInstalar.prompt(); await promptInstalar.userChoice; promptInstalar = null; botonInstalar.hidden = true; });
  window.addEventListener("appinstalled", () => { if (botonInstalar) botonInstalar.hidden = true; });
  const avisoRed = $(".aviso-red");
  const red = () => { if (avisoRed) avisoRed.hidden = navigator.onLine; };
  window.addEventListener("online", red); window.addEventListener("offline", red); red();

  // Para las pruebas y para depurar desde la consola
  window.kaironNoche = { ir, simular, estado: () => Object.assign({}, estado), tierra: T, medir };

  arrancar();
})();
