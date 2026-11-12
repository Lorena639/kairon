/* KAIRON · Interacción de la web
   1. Intro (partículas que forman el logo, cortinas) y revelado del hero.
   2. Transición entre páginas (cortina).
   3. Cursor personalizado + foco que sigue al ratón + botones magnéticos.
   4. Scroll suave (Lenis) + barra de progreso.
   5. Animaciones con GSAP: revelados, manifiesto, servicios en horizontal,
      cifras con anillos, parallax de la marca de agua.
   6. SOC en vivo: registro de eventos, gráfica y barras (datos simulados).
   7. Tarjetas con foco que sigue al ratón e inclinación 3D.
   8. Formulario (aviso sin servidor). */

document.documentElement.classList.remove("sin-js");
// La preferencia guardada de "menos movimiento" se aplica cuanto antes: la intro y la portada la consultan
try { if (localStorage.getItem("kairon-menos-movimiento") === "1") document.documentElement.classList.add("menos-movimiento"); } catch (e) {}

/* Textos que genera el JavaScript, en el idioma de la página (lang="es" o "ca") */
const CA = document.documentElement.lang === "ca";
const TXT = CA ? {
  eventos: [
    ["ok", "Agent WS-07 en línia"], ["ok", "Integritat de fitxers verificada"], ["aviso", "5 intents de login fallits · srv-01"],
    ["alerta", "Força bruta SSH bloquejada · 203.0.113.9"], ["ok", "Regles actualitzades (v2026.10)"], ["aviso", "USB desconegut a WS-12"],
    ["alerta", "Executable sense signatura · WS-03"], ["ok", "Còpia de seguretat completada"], ["aviso", "Port 3389 exposat · fw-edge"],
    ["ok", "Hash SHA-256 registrat · cas 0427"], ["alerta", "Persistència detectada · tasca programada"], ["ok", "Amenaça continguda en 11 min"],
  ],
  etiquetas: { ok: "OK", aviso: "AVÍS", alerta: "ALERTA" },
  detalle: {
    hora: "Hora", estado: "Estat", siguiente: "Pas següent",
    alerta: { estado: "Escalada a l'analista", siguiente: "Aïllar l'equip, conservar proves i obrir un cas." },
    aviso: { estado: "En revisió", siguiente: "Comprovar si és legítim i ajustar la regla si cal." },
    ok: { estado: "Tancada", siguiente: "Cap acció: queda registrada a l'historial." },
  },
  guion: [
    [0, "alerta", "Executable sense signatura · WS-03 · phishing"], [900, "alerta", "Persistència creada · tasca programada"],
    [1800, "alerta", "Connexió a C2 · 198.51.100.7:443"], [2800, "aviso", "WS-03 aïllat de la xarxa"],
    [3600, "aviso", "IP 198.51.100.7 bloquejada al tallafoc"], [4600, "ok", "Proves recollides · cas 0428 · SHA-256"],
    [5600, "ok", "Amenaça continguda · informe en curs"],
  ],
  enCurso: "Atac en curs…", otroAtaque: "▶ Simular un altre atac",
  enviando: "Enviant…", recibido: "Demo completada", avisoForm: "> Demostració: aquest formulari encara no envia les dades.", pedir: "Demanar auditoria gratuïta",
  latencia: "latència",
} : {
  eventos: [
    ["ok", "Agente WS-07 en línea"], ["ok", "Integridad de archivos verificada"], ["aviso", "5 intentos de login fallidos · srv-01"],
    ["alerta", "Fuerza bruta SSH bloqueada · 203.0.113.9"], ["ok", "Reglas actualizadas (v2026.10)"], ["aviso", "USB desconocido en WS-12"],
    ["alerta", "Ejecutable sin firma · WS-03"], ["ok", "Copia de seguridad completada"], ["aviso", "Puerto 3389 expuesto · fw-edge"],
    ["ok", "Hash SHA-256 registrado · caso 0427"], ["alerta", "Persistencia detectada · tarea programada"], ["ok", "Amenaza contenida en 11 min"],
  ],
  etiquetas: { ok: "OK", aviso: "AVISO", alerta: "ALERTA" },
  detalle: {
    hora: "Hora", estado: "Estado", siguiente: "Siguiente paso",
    alerta: { estado: "Escalada al analista", siguiente: "Aislar el equipo, conservar pruebas y abrir un caso." },
    aviso: { estado: "En revisión", siguiente: "Comprobar si es legítimo y ajustar la regla si hace falta." },
    ok: { estado: "Cerrada", siguiente: "Ninguna acción: queda registrada en el historial." },
  },
  guion: [
    [0, "alerta", "Ejecutable sin firma · WS-03 · phishing"], [900, "alerta", "Persistencia creada · tarea programada"],
    [1800, "alerta", "Conexión a C2 · 198.51.100.7:443"], [2800, "aviso", "WS-03 aislado de la red"],
    [3600, "aviso", "IP 198.51.100.7 bloqueada en el firewall"], [4600, "ok", "Pruebas recogidas · caso 0428 · SHA-256"],
    [5600, "ok", "Amenaza contenida · informe en curso"],
  ],
  enCurso: "Ataque en curso…", otroAtaque: "▶ Simular otro ataque",
  enviando: "Enviando…", recibido: "Demo completada", avisoForm: "> Demostración: este formulario todavía no envía los datos.", pedir: "Pedir auditoría gratuita",
  latencia: "latencia",
};

const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hayGSAP = typeof gsap !== "undefined";
const raton = { x: innerWidth / 2, y: innerHeight / 2 };
if (hayGSAP && typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
// GSAP 3.15: SplitText (titulares por líneas y palabras) y ScrambleText (datos que se "descifran")
const haySplit = hayGSAP && typeof SplitText !== "undefined";
const hayScramble = hayGSAP && typeof ScrambleTextPlugin !== "undefined";
if (haySplit) gsap.registerPlugin(SplitText);
if (hayScramble) gsap.registerPlugin(ScrambleTextPlugin);
// Las fuentes (Cinzel) cambian el ancho del texto: se parte en líneas cuando ya están cargadas
const fuentesListas = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
// View Transitions entre páginas (Chrome, Edge y Safari recientes): si el navegador las soporta,
// el CSS (@view-transition) hace la transición y la cortina de JavaScript queda solo como respaldo
const hayTransicionesVista = typeof CSSViewTransitionRule !== "undefined";

window.addEventListener("pointermove", (e) => {
  raton.x = e.clientX;
  raton.y = e.clientY;
  document.documentElement.style.setProperty("--mx", e.clientX + "px");
  document.documentElement.style.setProperty("--my", e.clientY + "px");
}, { passive: true });

/* ---------- 1. Preloader ---------- */
const carga = document.querySelector(".carga");

function partirTitulo() {
  // Divide el titular en letras para animarlas una a una
  // Las palabras con brillo dorado (.oro-brillo) no se parten: el degradado del texto se perdería
  document.querySelectorAll(".hero__titulo .linea > span:not(.oro-brillo), .hero__titulo .linea > em:not(.oro-brillo)").forEach((el) => {
    const texto = el.textContent;
    el.textContent = "";
    [...texto].forEach((ch) => {
      const s = document.createElement("span");
      s.className = "letra";
      s.textContent = ch === " " ? " " : ch;
      s.style.setProperty("--i", String(el.children.length));
      el.appendChild(s);
    });
  });
}
partirTitulo();

function revelarHero() {
  const letras = document.querySelectorAll(".hero__titulo .letra, .hero__titulo .linea > .oro-brillo");
  const titular = document.querySelector(".hero__titular");
  const resto = document.querySelectorAll(".hero__estado, .logo3d, .hero__nombre, .hero__kairos, .hero__sub, .hero__acciones--centro, .hero__scroll, .cabecera, .hero__registro");
  if (titular && haySplit && !reducido) {
    // Titular de la portada: cada línea sube desde detrás de una máscara y las letras pasan
    // de desenfocadas y abiertas a nítidas, como un objetivo que enfoca en el instante justo
    gsap.set(titular, { opacity: 1 });
    fuentesListas.then(() => {
      SplitText.create(titular, {
        type: "lines,words,chars", mask: "lines", linesClass: "titular-linea", aria: "auto",
        onSplit(self) {
          return gsap.timeline({ delay: 0.15 })
            .from(self.lines, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.12 })
            .from(self.chars, { opacity: 0, filter: "blur(12px)", duration: 0.9, ease: "power3.out", stagger: { each: 0.012, from: "start" } }, 0.05);
        },
      });
    });
  } else if (titular) {
    titular.style.opacity = 1;
  }
  if (!hayGSAP || reducido) {
    resto.forEach((r) => (r.style.opacity = 1));
    return;
  }
  gsap.set(resto, { opacity: 0, y: 16 });
  const tl = gsap.timeline();
  if (letras.length) {
    letras.forEach((l) => (l.style.animation = "none"));
    gsap.set(letras, { yPercent: 120, rotateX: -60 });
    tl.to(letras, { yPercent: 0, rotateX: 0, duration: 1.1, ease: "power4.out", stagger: 0.035,
      onComplete: () => letras.forEach((l) => { gsap.set(l, { clearProps: "transform" }); l.style.animation = ""; }) });
  }
  if (resto.length) tl.to(resto, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }, letras.length ? "-=0.7" : 0);
}

function terminarCarga() {
  document.body.classList.remove("sin-scroll");
  if (!carga) return revelarHero();
  if (hayGSAP && !reducido) {
    const salida = gsap.timeline({ paused: true, onComplete: () => carga.remove() })
      .to(".intro__lienzo", { opacity: 0, duration: 0.35 })
      .to(".carga__panel--arriba", { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "<")
      .to(".carga__panel--abajo", { yPercent: 100, duration: 0.9, ease: "power4.inOut" }, "<")
      .to(carga, { opacity: 0, duration: 0.2 }, "-=0.1");
    const entrar = () => { salida.play(); setTimeout(revelarHero, 500); };
    if (window.kaironIntro && window.kaironIntro.vista) {
      // Ya se vio la intro en esta sesión: el velo se funde y la portada entra al momento
      window.dispatchEvent(new Event("kairon-intro-fin"));
      gsap.to(carga, { opacity: 0, duration: 0.4, ease: "power2.out", onComplete: () => carga.remove() });
      revelarHero();
    } else if (window.kaironIntro) window.kaironIntro.start(entrar);
    else entrar();
  } else {
    carga.remove();
    revelarHero();
  }
}

// Portada v6: la intro no se abre con cortinas; el velo se disuelve y la escena 3D toma el relevo
// desde el emblema del logo (la zambullida la hace js/intro.js junto con js/mundo.js).
function cargaV6() {
  const raizHTML = document.documentElement;
  const avisar = () => window.dispatchEvent(new Event("kairon-intro-fin"));
  const retirar = (ms) => { raizHTML.classList.add("intro-fin"); setTimeout(() => carga.remove(), ms); };
  if (!hayGSAP || reducido || raizHTML.classList.contains("menos-movimiento") || !window.kaironIntro) {
    carga.remove();
    raizHTML.classList.add("intro-fin");
    avisar();
    revelarHero();
  } else if (window.kaironIntro.vista) {
    // Ya se vio en esta sesión: entra la portada directamente, con la escena saliendo del fondo
    avisar();
    carga.classList.add("carga--fuera");
    revelarHero();
    retirar(600);
  } else {
    // Mientras dura la intro el contenido del hero espera oculto: al disolverse el velo solo se ve la escena
    raizHTML.classList.add("intro-en-curso");
    let entrada = false;
    const entrar = () => {
      if (entrada) return;
      entrada = true;
      clearTimeout(seguro);
      carga.classList.add("carga--fuera");
      setTimeout(() => { raizHTML.classList.remove("intro-en-curso"); revelarHero(); }, 320);
      retirar(1000);
    };
    // Seguro exterior: si el PNG del logo no llega a cargar ni a fallar, la intro no empieza nunca;
    // a los 8 s la portada entra igualmente
    const seguro = setTimeout(() => { avisar(); entrar(); }, 8000);
    window.kaironIntro.start(entrar);
  }
}

if (carga && carga.classList.contains("carga--v6")) {
  cargaV6();
} else if (carga) {
  document.body.classList.add("sin-scroll");
  terminarCarga(); // sin contador: la intro de película empieza directamente
} else {
  // Páginas sin preloader: la cortina se retira al entrar
  const cortina = document.querySelector(".cortina");
  if (cortina && hayGSAP && !reducido && !hayTransicionesVista) {
    gsap.set(cortina, { scaleY: 1, transformOrigin: "top" });
    gsap.to(cortina, { scaleY: 0, duration: 0.9, ease: "power4.inOut", delay: 0.1 });
  }
  revelarHero();
}

/* ---------- 1b. Logo 3D de la portada: capas apiladas que giran con el ratón ---------- */
const logo3d = document.querySelector(".logo3d");
if (logo3d) {
  const cuerpo = document.createElement("div");
  cuerpo.className = "logo3d__cuerpo";
  const CAPAS = 18, PASO = 1.6; // grosor total ≈ 29 px
  for (let i = CAPAS - 1; i >= 0; i--) {
    const capa = document.createElement("i");
    capa.className = "logo3d__capa" + (i === 0 ? " logo3d__capa--frente" : "");
    const prof = -i * PASO;
    // Las capas de atrás se oscurecen: canto de oro en sombra
    capa.style.transform = `translateZ(${prof}px)`;
    if (i > 0) capa.style.filter = `brightness(${0.78 - (i / CAPAS) * 0.45}) saturate(1.1)`;
    cuerpo.appendChild(capa);
  }
  const sombra = document.createElement("span");
  sombra.className = "logo3d__sombra";
  logo3d.appendChild(sombra);
  logo3d.appendChild(cuerpo);

  if (!reducido && window.matchMedia("(hover: hover)").matches) {
    const objetivo = { x: 0, y: 0 }, actual = { x: 0, y: 0 };
    window.addEventListener("pointermove", (e) => {
      objetivo.x = (e.clientX / innerWidth - 0.5) * 2;
      objetivo.y = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });
    (function girar() {
      actual.x += (objetivo.x - actual.x) * 0.06;
      actual.y += (objetivo.y - actual.y) * 0.06;
      cuerpo.style.transform = `rotateY(${(actual.x * 28).toFixed(2)}deg) rotateX(${(-actual.y * 18).toFixed(2)}deg)`;
      requestAnimationFrame(girar);
    })();
  } else {
    cuerpo.style.transform = "rotateY(-18deg) rotateX(8deg)";
  }
}

/* ---------- 2. Transición entre páginas ---------- */
const cortina = document.querySelector(".cortina");
document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    if (hayTransicionesVista) return; // la transición la hace el navegador con View Transitions
    if (!cortina || !hayGSAP || reducido || a.target === "_blank") return;
    e.preventDefault();
    gsap.set(cortina, { transformOrigin: "bottom" });
    gsap.to(cortina, { scaleY: 1, duration: 0.7, ease: "power4.inOut", onComplete: () => { location.href = a.href; } });
  });
});

/* ---------- 3. Cursor, foco y botones magnéticos ---------- */
const cursor = document.querySelector(".cursor");
const anillo = document.querySelector(".cursor__anillo");
if (cursor && anillo && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const suave = { x: raton.x, y: raton.y };
  let estira = 0, anguloCursor = 0;
  (function mover() {
    const dx = raton.x - suave.x, dy = raton.y - suave.y;
    suave.x += dx * 0.16;
    suave.y += dy * 0.16;
    // El anillo se estira en la dirección del movimiento, como una gota, y recupera su forma al parar
    const rapidez = Math.hypot(dx, dy);
    estira += (Math.min(rapidez / 160, 0.45) - estira) * 0.2;
    if (rapidez > 1.5) anguloCursor = Math.atan2(dy, dx);
    cursor.style.transform = `translate(${raton.x}px, ${raton.y}px) translate(-50%, -50%)`;
    anillo.style.transform = `translate(${suave.x}px, ${suave.y}px) translate(-50%, -50%) rotate(${anguloCursor.toFixed(3)}rad) scale(${(1 + estira).toFixed(3)}, ${(1 - estira * 0.45).toFixed(3)})`;
    requestAnimationFrame(mover);
  })();
  window.addEventListener("pointerdown", () => document.body.classList.add("cursor--pulsa"));
  window.addEventListener("pointerup", () => document.body.classList.remove("cursor--pulsa"));
  document.querySelectorAll("a, button, input, textarea, label, .letra").forEach((el) => {
    el.addEventListener("pointerenter", () => document.body.classList.add("cursor--enlace"));
    el.addEventListener("pointerleave", () => document.body.classList.remove("cursor--enlace"));
  });

  // Botones magnéticos: se acercan al ratón
  document.querySelectorAll(".boton").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      b.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
}

/* ---------- 4. Scroll suave y progreso ---------- */
let lenis = null;
if (typeof Lenis !== "undefined" && !reducido) {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  window.kaironLenis = lenis; // la portada (js/v6.js) lee de aquí la posición y la velocidad del scroll
  if (hayGSAP) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    (function bucle(t) { lenis.raf(t); requestAnimationFrame(bucle); })(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const destino = document.querySelector(a.getAttribute("href"));
      if (!destino) return;
      e.preventDefault();
      lenis.scrollTo(destino, { offset: 0 });
    });
  });
}

const progreso = document.querySelector(".progreso");
if (progreso) {
  const actualizarProgreso = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progreso.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener("scroll", actualizarProgreso, { passive: true });
  actualizarProgreso();
}

/* ---------- 5. Animaciones con GSAP ---------- */
if (hayGSAP && !reducido) {
  gsap.utils.toArray(".revelar").forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  // Marca de agua: parallax
  const marca = document.querySelector(".hero__marca");
  if (marca) {
    gsap.to(marca, { yPercent: 40, xPercent: -40, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  // Manifiesto palabra a palabra
  const manifiesto = document.querySelector(".manifiesto__texto");
  if (manifiesto) {
    const palabras = manifiesto.querySelectorAll(".palabra");
    ScrollTrigger.create({
      trigger: manifiesto, start: "top 75%", end: "bottom 40%", scrub: true,
      onUpdate: (self) => {
        const n = Math.floor(self.progress * palabras.length);
        palabras.forEach((p, i) => p.classList.toggle("encendida", i <= n));
      },
    });
  }

  // Servicios: scroll horizontal fijado (solo en pantallas anchas)
  const servicios = document.querySelector(".servicios");
  const pista = document.querySelector(".servicios__pista");
  if (servicios && pista) {
    ScrollTrigger.matchMedia({
      "(min-width: 1024px)": () => {
        const paneles = gsap.utils.toArray(".servicio");
        const indices = document.querySelectorAll(".servicio__indice span");
        const desplazamiento = () => pista.scrollWidth - innerWidth;
        const tween = gsap.to(pista, {
          x: () => -desplazamiento(),
          ease: "none",
          scrollTrigger: {
            trigger: servicios, pin: true, scrub: 1, start: "top top",
            end: () => "+=" + desplazamiento(), invalidateOnRefresh: true,
            onUpdate: (self) => {
              const i = Math.min(paneles.length - 1, Math.floor(self.progress * paneles.length + 0.0001));
              indices.forEach((s, k) => s.classList.toggle("activo", k === i));
            },
          },
        });
        paneles.forEach((p, i) => {
          const partes = p.querySelectorAll(".servicio__numero, .servicio__titulo, .servicio__texto, .servicio__datos, .hero__acciones");
          if (i === 0) {
            gsap.from(partes, { y: 70, opacity: 0, duration: 1.2, ease: "power4.out", stagger: 0.08,
              scrollTrigger: { trigger: servicios, start: "top 60%" } });
          } else {
            gsap.from(partes, { y: 70, opacity: 0, duration: 1.2, ease: "power4.out", stagger: 0.08,
              scrollTrigger: { trigger: p, containerAnimation: tween, start: "left 75%" } });
          }
        });
      },
      "(max-width: 1023px)": () => {
        gsap.utils.toArray(".servicio").forEach((p) => {
          gsap.from(p.querySelectorAll(".servicio__numero, .servicio__titulo"), {
            y: 60, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.1,
            scrollTrigger: { trigger: p, start: "top 70%" },
          });
        });
      },
    });
  }

  // Cifras: contador + anillo
  gsap.utils.toArray(".cifra").forEach((c) => {
    const valorEl = c.querySelector(".cifra__valor");
    const anilloEl = c.querySelector(".cifra__anillo .valor");
    const fin = parseFloat(valorEl.dataset.valor);
    const decimales = (valorEl.dataset.valor.split(".")[1] || "").length;
    const pct = parseFloat(c.dataset.pct || 100);
    // Odómetro: cada dígito rueda hasta su valor
    const textoFinal = fin.toLocaleString("es-ES", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
    const odo = document.createElement("span");
    odo.className = "odometro";
    [...textoFinal].forEach((ch) => {
      if (!/\d/.test(ch)) { const s = document.createElement("span"); s.textContent = ch; odo.appendChild(s); return; }
      const col = document.createElement("span");
      col.className = "odometro__col";
      const tira = document.createElement("span");
      tira.innerHTML = "0123456789".split("").map((d) => `<span>${d}</span>`).join("");
      col.appendChild(tira);
      col.dataset.digito = ch;
      odo.appendChild(col);
    });
    valorEl.replaceChild(odo, valorEl.firstChild);
    ScrollTrigger.create({ trigger: c, start: "top 85%", once: true, onEnter: () => {
      odo.querySelectorAll(".odometro__col").forEach((col, i) => {
        const tira = col.firstChild;
        tira.style.transitionDelay = (i * 0.08) + "s";
        requestAnimationFrame(() => { tira.style.transform = `translateY(-${(Number(col.dataset.digito) * 1.15).toFixed(2)}em)`; });
      });
    } });
    if (anilloEl) {
      gsap.to(anilloEl, { strokeDashoffset: 276 - (276 * pct) / 100, duration: 2.2, ease: "power2.out", scrollTrigger: { trigger: c, start: "top 85%" } });
    }
  });

  // Barras (panel SOC y niveles de habilidades) entran al verse
  gsap.utils.toArray(".panel__barras").forEach((barras) => {
    ScrollTrigger.create({
      trigger: barras, start: "top 88%", once: true,
      onEnter: () => barras.querySelectorAll("li").forEach((li) => li.style.setProperty("--w", li.dataset.w + "%")),
    });
  });

  // Pasos apilados: cada tarjeta se encoge y oscurece un poco cuando la siguiente la tapa
  if (window.innerWidth >= 720) {
    gsap.utils.toArray(".pasos .paso").forEach((p, i, arr) => {
      if (i === arr.length - 1) return;
      // El contenido se desvanece en proporción a lo que la siguiente tarjeta lo va tapando
      gsap.to(p, { scale: 0.96, transformOrigin: "top center", ease: "none",
        scrollTrigger: { trigger: arr[i + 1], start: "top 60%", end: "top 20%", scrub: true,
          onUpdate: (self) => p.style.setProperty("--tapa", String(1 - self.progress * 0.7)) } });
    });
  }

  // Pasos del incidente: la línea se dibuja y cada paso se activa al pasar
  const pasos = document.querySelector(".pasos");
  if (pasos) {
    const items = pasos.querySelectorAll(".paso");
    ScrollTrigger.create({
      trigger: pasos, start: "top 70%", end: "bottom 60%", scrub: true,
      onUpdate: (self) => {
        pasos.style.setProperty("--linea-h", self.progress * 100 + "%");
        items.forEach((p, i) => p.classList.toggle("activo", i / items.length <= self.progress));
      },
    });
  }

  // Títulos de sección: SplitText los parte en líneas con máscara; cada línea sube y se asienta.
  // Se vuelve a partir solo si cambia el ancho (autoSplit), así no se rompe al girar el móvil.
  gsap.utils.toArray(".equipo__titulo, .soc__titulo, .pagina__titulo, .contacto__titulo, .informe__titulo").forEach((t) => {
    if (t.querySelector(".oro-brillo") || t.dataset.partido) return; // los que llevan brillo se quedan enteros
    t.dataset.partido = "1";
    t.classList.remove("revelar");
    t.style.opacity = 1;
    t.style.transform = "none";
    if (!haySplit) return;
    fuentesListas.then(() => {
      SplitText.create(t, {
        type: "lines,words", mask: "lines", autoSplit: true, aria: "auto",
        onSplit(self) {
          return gsap.from(self.words, {
            yPercent: 115, rotate: 3, duration: 1.1, ease: "expo.out", stagger: 0.06,
            scrollTrigger: { trigger: t, start: "top 88%", once: true },
          });
        },
      });
    });
  });

  // Etiquetas mono: efecto de "descifrado" al entrar en pantalla
  const GLIFOS = "KAIRON01<>/\\|#$%&*+=-_";
  gsap.utils.toArray(".mono").forEach((el) => {
    if (el.closest(".carga, .menu, .hero__registro, .panel__alertas, .registro__linea, .atajos, .pie__estado") || el.children.length) return;
    const final = el.textContent;
    if (!final.trim() || final.length > 60) return;
    ScrollTrigger.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: () => {
        if (hayScramble) {
          // ScrambleText: los caracteres se "descifran" de izquierda a derecha con glifos de la marca
          gsap.to(el, { duration: Math.min(1.2, 0.35 + final.length * 0.025), ease: "none",
            scrambleText: { text: final, chars: GLIFOS, revealDelay: 0.15, speed: 0.6, tweenLength: false } });
          return;
        }
        let paso = 0;
        const total = 14;
        const tic = setInterval(() => {
          paso++;
          const fijas = Math.floor((paso / total) * final.length);
          el.textContent = final.split("").map((c, i) => (i < fijas || c === " " || c === "·" ? c : GLIFOS[Math.floor(Math.random() * GLIFOS.length)])).join("");
          if (paso >= total) { el.textContent = final; clearInterval(tic); }
        }, 40);
      },
    });
  });

  // Marquee: avanza con GSAP y se acelera e inclina con la velocidad del scroll (como Lusion).
  // Antes se cambiaba la duración de la animación CSS en cada scroll y la cinta saltaba de posición.
  const pistas = [...document.querySelectorAll(".marquee__pista")];
  if (pistas.length) {
    const estado = pistas.map((p) => ({ p, x: 0, dir: p.classList.contains("marquee__pista--inversa") ? 1 : -1 }));
    pistas.forEach((p) => { p.style.animation = "none"; });
    let velocidad = 0, inclinacion = 0;
    if (lenis) lenis.on("scroll", ({ velocity }) => { velocidad = velocity; });
    gsap.ticker.add((tiempo, delta) => {
      const dt = Math.min(delta, 50) / 1000;
      velocidad *= 0.92;
      inclinacion += (Math.max(-10, Math.min(10, velocidad * 0.25)) - inclinacion) * 0.12;
      estado.forEach((e) => {
        // Periodo exacto: distancia entre el inicio de las dos copias (incluye el hueco entre ellas)
        const hijos = e.p.children;
        const mitad = hijos.length > 1 ? hijos[1].offsetLeft - hijos[0].offsetLeft : e.p.scrollWidth / 2;
        if (!mitad) return;
        const rapidez = mitad / 30 + Math.min(Math.abs(velocidad), 60) * 6; // px por segundo
        e.x += e.dir * rapidez * dt;
        if (e.x <= -mitad) e.x += mitad;
        if (e.x > 0) e.x -= mitad;
        e.p.style.transform = `translate3d(${e.x.toFixed(2)}px,0,0) skewX(${inclinacion.toFixed(2)}deg)`;
      });
    });
  }

  // Parallax: el emblema del manifiesto crece y gira con el scroll; los radares de servicios se desplazan
  const fondoManifiesto = document.querySelector(".manifiesto__fondo");
  if (fondoManifiesto) {
    gsap.to(fondoManifiesto, { scale: 1.25, yPercent: -30, ease: "none", scrollTrigger: { trigger: ".manifiesto", start: "top bottom", end: "bottom top", scrub: true } });
  }
  gsap.utils.toArray(".informe__bloque, .cifras, .equipo, .faq").forEach((s) => {
    gsap.from(s, { opacity: 0.4, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top 60%", scrub: true } });
  });

  // Tarjetas: entran con un pequeño giro 3D escalonado
  gsap.utils.toArray(".persona").forEach((c, i) => {
    gsap.from(c, { clipPath: "inset(0 0 100% 0 round 18px)", duration: 1.2, ease: "expo.out", delay: i * 0.12,
      scrollTrigger: { trigger: c, start: "top 88%" },
      onComplete: () => gsap.set(c, { clearProps: "clipPath" }) }); // sin clip-path al final: si no, el giro 3D se aplana y el dorso no se ve
  });
  gsap.utils.toArray(".valor, .cifra, .testimonio, .ruta__hito, .panel__bloque").forEach((c, i) => {
    gsap.from(c, { rotateX: -10, y: 30, transformOrigin: "top center", duration: 1, ease: "power3.out", delay: (i % 4) * 0.08,
      scrollTrigger: { trigger: c, start: "top 90%" } });
  });

  // (Las palabras gigantes de contorno detrás de cada sección se quitaron en el rediseño v5:
  // repetían el nombre en texto tipográfico, contra el manual de marca, y recargaban la página.)

  // El método: el paso que está a la altura del centro se marca como activo
  const pasosMetodo = document.querySelectorAll(".metodo__paso");
  pasosMetodo.forEach((p) => {
    ScrollTrigger.create({ trigger: p, start: "top 60%", end: "bottom 40%",
      onToggle: (self) => p.classList.toggle("activo", self.isActive) });
  });

  // Escena 3D fija: cámara ligada al scroll (se aleja y gira), se funde al llegar a los servicios
  const escenaFija = document.querySelector(".hero .hero__escena");
  if (escenaFija && window.innerWidth >= 720) {
    escenaFija.classList.add("fija");
    const fin = document.querySelector(".servicios") || document.querySelector(".manifiesto");
    gsap.to(escenaFija, { opacity: 0, ease: "none", scrollTrigger: { trigger: fin, start: "top 90%", end: "top 30%", scrub: true } });
  }

  // Logo un poco más pequeño al bajar
  const logo = document.querySelector(".cabecera .oro-metal") || document.querySelector(".cabecera .brillo") || document.querySelector(".cabecera .logo");
  if (logo) gsap.to(logo, { scale: 0.85, transformOrigin: "left center", ease: "none", scrollTrigger: { start: 0, end: 200, scrub: true } });
} else {
  document.querySelectorAll(".revelar").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
  document.querySelectorAll(".palabra").forEach((p) => p.classList.add("encendida"));
  document.querySelectorAll(".cifra__valor[data-valor]").forEach((el) => { el.firstChild.textContent = parseFloat(el.dataset.valor).toLocaleString("es-ES"); });
  document.querySelectorAll(".panel__barras li").forEach((li) => li.style.setProperty("--w", li.dataset.w + "%"));
}

// Chronos y kairos: una regla de 60 marcas que avanza con el scroll; una sola es el momento justo
const reglaKairos = document.querySelector(".kairos__regla");
if (reglaKairos) {
  const MARCAS = 60, MOMENTO = 42;
  for (let i = 0; i < MARCAS; i++) {
    const m = document.createElement("i");
    if (i === MOMENTO) { m.className = "momento"; m.dataset.texto = reglaKairos.dataset.momento; }
    reglaKairos.appendChild(m);
  }
  const marcas = reglaKairos.children;
  const pintar = (p) => {
    const n = Math.round(p * MARCAS);
    for (let i = 0; i < MARCAS; i++) marcas[i].classList.toggle("pasada", i < n);
  };
  if (hayGSAP && !reducido) {
    ScrollTrigger.create({ trigger: reglaKairos, start: "top 90%", end: "top 35%", scrub: true, onUpdate: (self) => pintar(self.progress) });
  } else {
    pintar(1);
  }
}

// Los controles flotantes solo se ven en la primera pantalla: más abajo tapaban texto
const controlesFlotantes = document.querySelector(".controles");
if (controlesFlotantes) {
  const verControles = () => controlesFlotantes.classList.toggle("controles--ocultos", window.scrollY > window.innerHeight * 0.5);
  window.addEventListener("scroll", verControles, { passive: true });
  verControles();
}

/* ---------- 6. SOC en vivo (datos simulados para la práctica) ---------- */
const eventos = TXT.eventos;
function hora(desfase = 0) {
  const d = new Date(Date.now() - desfase);
  return d.toTimeString().slice(0, 8);
}
function alimentar(lista, max, plantilla) {
  if (!lista) return;
  let i = Math.floor(Math.random() * eventos.length);
  for (let k = 0; k < Math.min(max, 5); k++) lista.appendChild(plantilla(eventos[(i + k) % eventos.length], (5 - k) * 1400));
  if (reducido) return;
  setInterval(() => {
    i = (i + 1 + Math.floor(Math.random() * 3)) % eventos.length;
    lista.appendChild(plantilla(eventos[i], 0));
    while (lista.children.length > max) lista.removeChild(lista.firstChild);
  }, 1800 + Math.random() * 800);
}
alimentar(document.querySelector(".hero__registro ul"), 6, ([tipo, msg], desfase) => {
  const li = document.createElement("li");
  li.className = "registro__linea";
  li.innerHTML = `<time>${hora(desfase)}</time><span class="${tipo}">${msg}</span>`;
  return li;
});
// Consola de alertas: la más nueva arriba, con filtros, pausa y detalle al pulsar
const consola = document.querySelector(".panel__alertas");
const detalle = document.querySelector(".panel__detalle");
const botonesFiltro = document.querySelectorAll(".panel__filtros .filtro");
const botonPausa = document.querySelector(".panel__pausa");
let consolaPausada = false;

function contarAlertas() {
  botonesFiltro.forEach((b) => {
    const f = b.dataset.filtro;
    b.querySelector("b").textContent = f === "todas" ? consola.children.length : consola.querySelectorAll(`[data-tipo="${f}"]`).length;
  });
}
function mostrarDetalle(fila, tipo, msg, cuando) {
  consola.querySelectorAll(".elegida").forEach((e) => e.classList.remove("elegida"));
  fila.classList.add("elegida");
  const info = TXT.detalle[tipo];
  detalle.innerHTML = `<span class="etiqueta etiqueta--${tipo}">${TXT.etiquetas[tipo]}</span><h3>${msg}</h3><dl><dt>${TXT.detalle.hora}</dt><dd>${cuando}</dd><dt>${TXT.detalle.estado}</dt><dd>${info.estado}</dd><dt>${TXT.detalle.siguiente}</dt><dd>${info.siguiente}</dd></dl>`;
}
function agregarAlerta(tipo, msg, desfase = 0) {
  if (!consola) return;
  const cuando = hora(desfase);
  const li = document.createElement("li");
  li.dataset.tipo = tipo;
  li.innerHTML = `<button type="button"><time>${cuando}</time><span>${msg}</span><span class="etiqueta etiqueta--${tipo}">${TXT.etiquetas[tipo]}</span></button>`;
  li.firstChild.addEventListener("click", () => mostrarDetalle(li, tipo, msg, cuando));
  consola.prepend(li);
  while (consola.children.length > 30) consola.removeChild(consola.lastChild);
  contarAlertas();
  // Aviso para la escena 3D de la portada: cada alerta nueva late sobre el globo
  if (!desfase) window.dispatchEvent(new CustomEvent("kairon-alerta", { detail: { tipo } }));
}
if (consola) {
  botonesFiltro.forEach((b) => b.addEventListener("click", () => {
    consola.dataset.filtro = b.dataset.filtro;
    botonesFiltro.forEach((o) => { o.classList.toggle("activo", o === b); o.setAttribute("aria-pressed", String(o === b)); });
  }));
  if (botonPausa) botonPausa.addEventListener("click", () => {
    consolaPausada = !consolaPausada;
    botonPausa.setAttribute("aria-pressed", String(consolaPausada));
    botonPausa.classList.toggle("activo", consolaPausada);
  });
  for (let k = 0; k < 6; k++) { const [t, m] = eventos[k % eventos.length]; agregarAlerta(t, m, (6 - k) * 1400); }
  if (!reducido) setInterval(() => {
    if (consolaPausada) return;
    const [t, m] = eventos[Math.floor(Math.random() * eventos.length)];
    agregarAlerta(t, m);
  }, 2400);
}
// Durante el simulador de ataque, el estado de los sistemas también reacciona
function estadoIncidente(activo) {
  const fila = document.querySelector('[data-sistema="agentes"]');
  if (!fila) return;
  fila.classList.toggle("en-incidente", activo);
  fila.querySelector("b").textContent = activo ? "41 / 42" : "42 / 42";
}

// Gráfica: eventos por minuto, línea con relleno, se va desplazando
const grafica = document.querySelector(".panel__grafica");
if (grafica) {
  const ctx = grafica.getContext("2d");
  const datos = Array.from({ length: 60 }, () => 30 + Math.random() * 40);
  let fase = 0;
  function dibujar() {
    const w = grafica.clientWidth, h = grafica.clientHeight;
    if (grafica.width !== w * 2) { grafica.width = w * 2; grafica.height = h * 2; }
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // rejilla
    ctx.strokeStyle = "rgba(196,151,75,0.12)";
    ctx.lineWidth = 1;
    for (let y = 0; y <= 4; y++) { ctx.beginPath(); ctx.moveTo(0, (h / 4) * y); ctx.lineTo(w, (h / 4) * y); ctx.stroke(); }
    const paso = w / (datos.length - 1);
    const punto = (i) => [i * paso - fase * paso, h - (datos[i] / 100) * h];
    ctx.beginPath();
    datos.forEach((v, i) => { const [x, y] = punto(i); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(212,175,122,0.45)"); g.addColorStop(1, "rgba(212,175,122,0)");
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.beginPath();
    datos.forEach((v, i) => { const [x, y] = punto(i); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = "#e9cfa0"; ctx.lineWidth = 2; ctx.shadowColor = "#d4af7a"; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
    // punto final
    const [px, py] = punto(datos.length - 1);
    ctx.fillStyle = "#fff3d6"; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
  }
  dibujar();
  if (!reducido) {
    setInterval(() => {
      datos.push(Math.max(8, Math.min(96, datos[datos.length - 1] + (Math.random() - 0.5) * 24 + (Math.random() < 0.06 ? 30 : 0))));
      datos.shift();
    }, 900);
    (function anim() { fase = (fase + 0.012) % 1; dibujar(); requestAnimationFrame(anim); })();
  }
  const contador = document.querySelector("[data-vivo]");
  if (contador && !reducido) {
    let v = parseInt(contador.dataset.vivo, 10);
    setInterval(() => { v += Math.floor(Math.random() * 40) + 5; contador.firstChild.textContent = v.toLocaleString("es-ES"); }, 1200);
  }
}

/* ---------- 7. Tarjetas: foco e inclinación ---------- */
document.querySelectorAll(".panel__bloque, .persona, .valor, .cifra").forEach((card) => {
  const esPersona = card.classList.contains("persona");
  const estado = { rx: 0, ry: 0, tx: 0, ty: 0, activo: false, raf: 0 };
  const pintar = () => {
    if (card.classList.contains("girada")) { estado.raf = 0; estado.activo = false; return; } // girada: manda el giro, no la inclinación
    estado.rx += (estado.tx - estado.rx) * 0.1;
    estado.ry += (estado.ty - estado.ry) * 0.1;
    card.style.transform = `perspective(900px) rotateX(${estado.rx.toFixed(2)}deg) rotateY(${estado.ry.toFixed(2)}deg)`;
    if (Math.abs(estado.tx - estado.rx) > 0.02 || Math.abs(estado.ty - estado.ry) > 0.02 || estado.activo) {
      estado.raf = requestAnimationFrame(pintar);
    } else {
      estado.raf = 0;
      if (!estado.activo) card.style.transform = "";
    }
  };
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    card.style.setProperty("--x", x + "px");
    card.style.setProperty("--y", y + "px");
    if (esPersona && !reducido && !card.classList.contains("girada")) {
      estado.activo = true;
      estado.tx = ((y / r.height) - 0.5) * -7;
      estado.ty = ((x / r.width) - 0.5) * 9;
      if (!estado.raf) estado.raf = requestAnimationFrame(pintar);
    }
  });
  card.addEventListener("pointerleave", () => {
    if (!esPersona) return;
    estado.activo = false;
    estado.tx = 0; estado.ty = 0;
    if (!estado.raf) estado.raf = requestAnimationFrame(pintar);
  });
});

/* ---------- 7a. Simulador de ataque (demo) ---------- */
const botonSimular = document.querySelector(".simular");
if (botonSimular) {
  const guion = TXT.guion;
  botonSimular.addEventListener("click", () => {
    if (document.body.classList.contains("simulando")) return;
    document.body.classList.add("simulando");
    botonSimular.classList.add("activo");
    botonSimular.textContent = TXT.enCurso;
    botonSimular.classList.add("sin-deslizar");
    if (window.kaironEscena) window.kaironEscena.ataque(true);
    const pasosEl = document.querySelectorAll(".paso");
    const registro = document.querySelector(".hero__registro ul");
    guion.forEach(([t, tipo, msg], i) => {
      setTimeout(() => {
        const etiqueta = TXT.etiquetas[tipo];
        agregarAlerta(tipo, msg);
        if (i === 0) estadoIncidente(true);
        if (i === guion.length - 1) estadoIncidente(false);
        if (registro) {
          const li = document.createElement("li");
          li.className = "registro__linea";
          li.innerHTML = `<time>${hora()}</time><span class="${tipo}">${msg}</span>`;
          registro.appendChild(li);
          while (registro.children.length > 6) registro.removeChild(registro.firstChild);
        }
        const paso = pasosEl[Math.min(Math.floor(i / 1.5), pasosEl.length - 1)];
        pasosEl.forEach((p) => p.classList.remove("ardiendo"));
        if (paso) paso.classList.add(tipo === "alerta" ? "ardiendo" : "activo");
        if (i === 3 && window.kaironEscena) window.kaironEscena.ataque(false);
      }, t);
    });
    setTimeout(() => {
      document.body.classList.remove("simulando");
      botonSimular.classList.remove("activo");
      botonSimular.textContent = TXT.otroAtaque;
      pasosEl.forEach((p) => p.classList.remove("ardiendo"));
    }, 7000);
  });
}

/* ---------- 7a2. Tarjetas de equipo: giro para ver el expediente ---------- */
document.querySelectorAll(".persona--giro").forEach((card) => {
  let girada = false;
  const aplicar = () => {
    card.classList.toggle("girada", girada);
    card.style.transition = "transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
    card.style.transform = girada ? "perspective(1200px) rotateY(180deg)" : "";
  };
  card.addEventListener("click", (e) => { if (e.target.closest("a")) return; girada = !girada; aplicar(); });
  card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); girada = !girada; aplicar(); } });
  // Se vuelve a girar con otro clic, con Escape o al pulsar fuera (no al salir el ratón: al rotar cambia el área y saltaría)
  document.addEventListener("pointerdown", (e) => { if (girada && !card.contains(e.target)) { girada = false; aplicar(); } });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && girada) { girada = false; aplicar(); } });
  card.dataset.giro = "1";
});

/* ---------- 7b. Menú móvil y botón arriba ---------- */
const botonMenu = document.querySelector(".menu-boton");
if (botonMenu) {
  const alternar = (abrir) => {
    document.body.classList.toggle("menu-abierto", abrir);
    botonMenu.setAttribute("aria-expanded", String(abrir));
    const panel = document.querySelector(".menu-movil");
    if (panel) panel.setAttribute("aria-hidden", String(!abrir));
    if (lenis) abrir ? lenis.stop() : lenis.start();
  };
  // Con el menú cerrado sus enlaces no deben recibir el foco del teclado (antes se tabulaba por un panel invisible)
  const panelMenu = document.querySelector(".menu-movil");
  if (panelMenu) {
    panelMenu.inert = true;
    // (este oyente se ejecuta antes que el que abre o cierra: si ahora está abierto, va a cerrarse)
    botonMenu.addEventListener("click", () => { panelMenu.inert = document.body.classList.contains("menu-abierto"); });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") panelMenu.inert = true; });
    panelMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { panelMenu.inert = true; }));
  }
  botonMenu.addEventListener("click", () => alternar(!document.body.classList.contains("menu-abierto")));
  document.querySelectorAll(".menu-movil a").forEach((a) => a.addEventListener("click", () => alternar(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") alternar(false); });
}

const cabeceraEl = document.querySelector(".cabecera");
// Cabecera clara cuando debajo hay una sección marfil
const secundariasClaras = document.querySelectorAll(".claro");
function comprobarCabeceraClara() {
  if (!cabeceraEl || !secundariasClaras.length) return;
  const y = 40;
  let clara = false;
  if (document.documentElement.classList.contains("v6-amanecer")) {
    // Portada: el fondo claro es un fundido (js/v6.js); la cabecera cambia cuando ya es más de día que de noche
    clara = document.documentElement.classList.contains("v6-de-dia");
  } else {
    secundariasClaras.forEach((s) => { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom >= y) clara = true; });
  }
  cabeceraEl.classList.toggle("cabecera--clara", clara);
}
window.addEventListener("scroll", comprobarCabeceraClara, { passive: true });
comprobarCabeceraClara();
let ultimoScroll = 0;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (cabeceraEl && !document.body.classList.contains("menu-abierto")) {
    cabeceraEl.classList.toggle("cabecera--oculta", y > ultimoScroll && y > 240);
  }
  ultimoScroll = y;
}, { passive: true });

const arriba = document.querySelector(".arriba");
if (arriba) {
  window.addEventListener("scroll", () => arriba.classList.toggle("visible", window.scrollY > innerHeight), { passive: true });
}

/* ---------- 7c. Reloj de Barcelona y latencia (pie) ---------- */
const relojPie = document.querySelector(".pie__reloj");
if (relojPie) {
  const latencia = document.querySelector(".pie__latencia");
  const pintar = () => {
    relojPie.textContent = new Date().toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid", hour12: false });
    if (latencia && Math.random() < 0.3) latencia.textContent = TXT.latencia + " " + (8 + Math.floor(Math.random() * 9)) + " ms";
  };
  pintar();
  setInterval(pintar, 1000);
}

/* ---------- 7c2. Pistas arrastrables con etiqueta en el cursor ---------- */
document.querySelectorAll(".arrastrable").forEach((pista) => {
  let etiqueta = document.querySelector(".cursor__texto");
  if (!etiqueta) { etiqueta = document.createElement("span"); etiqueta.className = "cursor__texto"; document.body.appendChild(etiqueta); }
  let bajando = false, x0 = 0, s0 = 0, movido = false;
  pista.addEventListener("pointerenter", () => { etiqueta.textContent = pista.dataset.arrastra || "Arrastra"; document.body.classList.add("cursor--arrastra"); });
  const soltar = () => { document.body.classList.remove("cursor--arrastra"); bajando = false; pista.classList.remove("arrastrando"); };
  pista.addEventListener("pointerleave", soltar);
  window.addEventListener("scroll", () => { if (document.body.classList.contains("cursor--arrastra")) soltar(); }, { passive: true });
  document.addEventListener("pointermove", (e) => { if (document.body.classList.contains("cursor--arrastra") && !e.target.closest(".arrastrable")) soltar(); }, { passive: true });
  pista.addEventListener("pointermove", (e) => {
    etiqueta.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(1)`;
    if (!bajando) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 4) movido = true;
    pista.scrollLeft = s0 - dx;
  });
  pista.addEventListener("pointerdown", (e) => { bajando = true; movido = false; x0 = e.clientX; s0 = pista.scrollLeft; pista.classList.add("arrastrando"); pista.setPointerCapture(e.pointerId); });
  pista.addEventListener("pointerup", () => { bajando = false; pista.classList.remove("arrastrando"); });
  pista.addEventListener("click", (e) => { if (movido) { e.preventDefault(); e.stopPropagation(); } }, true);
});

/* ---------- 7d. Flechas de testimonios ---------- */
const pistaTestimonios = document.querySelector(".testimonios__pista");
if (pistaTestimonios) {
  document.querySelectorAll(".flecha[data-dir]").forEach((f) => {
    f.addEventListener("click", () => {
      const ancho = pistaTestimonios.querySelector(".testimonio").getBoundingClientRect().width + 24;
      pistaTestimonios.scrollBy({ left: ancho * Number(f.dataset.dir), behavior: "smooth" });
    });
  });
}

/* ---------- 7e. Atajos de teclado para presentar ---------- */
const atajos = document.querySelector(".atajos");
const secciones = [...document.querySelectorAll("main > section, main > .marquee")];
function irA(el) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0 });
  else el.scrollIntoView({ behavior: "smooth" });
}
window.addEventListener("keydown", (e) => {
  const enCampo = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);
  if (enCampo) return;
  if (e.key === "?") {
    e.preventDefault();
    if (atajos) { const v = atajos.classList.toggle("visible"); atajos.setAttribute("aria-hidden", String(!v)); }
    return;
  }
  if (e.key === "Escape" && atajos) { atajos.classList.remove("visible"); atajos.setAttribute("aria-hidden", "true"); }
  if (e.key.toLowerCase() === "a" && botonSimular) { e.preventDefault(); irA(document.querySelector("#incidente")); setTimeout(() => botonSimular.click(), 900); }
  if (e.key.toLowerCase() === "p") {
    const activo = document.documentElement.classList.toggle("presentacion");
    try { sessionStorage.setItem("kairon-presentacion", activo ? "1" : "0"); } catch (err) {}
    if (typeof ScrollTrigger !== "undefined") setTimeout(() => ScrollTrigger.refresh(), 300);
  }
  if (e.key.toLowerCase() === "e") { const a = document.querySelector('a[href="sobre-mi.html"]'); if (a) a.click(); }
  if (e.key === "Home") { e.preventDefault(); irA(document.querySelector("main")); }
  if (e.key === "End") { e.preventDefault(); irA(document.querySelector("#contacto") || document.querySelector(".pie")); }
  if ((e.key === "ArrowDown" || e.key === "ArrowUp") && typeof window.kaironParadas === "function") {
    // Portada v6: hay secciones fijadas con varias paradas dentro; las posiciones las da js/v6.js
    const paradas = window.kaironParadas();
    const y = window.scrollY;
    const destino = e.key === "ArrowDown" ? paradas.find((p) => p > y + 12) : paradas.slice().reverse().find((p) => p < y - 12);
    if (destino !== undefined) {
      e.preventDefault();
      if (lenis) lenis.scrollTo(destino, { duration: 1.4 });
      else window.scrollTo({ top: destino, behavior: document.documentElement.classList.contains("menos-movimiento") || reducido ? "auto" : "smooth" });
    }
    return;
  }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    const y = window.scrollY + 10;
    const idx = secciones.findIndex((s) => s.offsetTop > y);
    const destino = e.key === "ArrowDown" ? secciones[idx] : secciones.slice(0, Math.max(idx, 0)).reverse().find((s) => s.offsetTop < y - 10) || secciones[0];
    if (destino) { e.preventDefault(); irA(destino); }
  }
});
if (atajos) atajos.addEventListener("click", () => { atajos.classList.remove("visible"); atajos.setAttribute("aria-hidden", "true"); });

/* ---------- 7f. Imprimir / PDF (informe.html) ---------- */
document.querySelectorAll(".imprimir").forEach((b) => b.addEventListener("click", () => window.print()));

/* ---------- 7g. Service worker (app instalable y sin conexión) ---------- */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  const raiz = document.documentElement.dataset.raiz || "./";
  navigator.serviceWorker.register(raiz + "sw.js", { scope: raiz }).catch(() => {});
}

/* ---------- 7h. Puntos laterales ---------- */
const puntos = document.querySelectorAll(".puntos a");
if (puntos.length) {
  const objetivos = [...puntos].map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const marcar = () => {
    const y = window.scrollY + innerHeight * 0.4;
    let activo = 0;
    objetivos.forEach((s, i) => { if (s.getBoundingClientRect().top + window.scrollY <= y) activo = i; });
    puntos.forEach((a, i) => a.classList.toggle("activo", i === activo));
  };
  window.addEventListener("scroll", marcar, { passive: true });
  marcar();
}

/* ---------- 7i. Preferencia "menos movimiento" ---------- */
try { if (sessionStorage.getItem("kairon-presentacion") === "1") document.documentElement.classList.add("presentacion"); } catch (e) {}

const botonMovimiento = document.querySelector(".control--movimiento");
try {
  if (localStorage.getItem("kairon-menos-movimiento") === "1") {
    document.documentElement.classList.add("menos-movimiento");
    if (botonMovimiento) botonMovimiento.setAttribute("aria-pressed", "true");
  }
} catch (e) {}
if (botonMovimiento) {
  botonMovimiento.addEventListener("click", () => {
    const activo = document.documentElement.classList.toggle("menos-movimiento");
    botonMovimiento.setAttribute("aria-pressed", String(activo));
    try { localStorage.setItem("kairon-menos-movimiento", activo ? "1" : "0"); } catch (e) {}
    if (lenis) activo ? lenis.stop() : lenis.start();
  });
}

/* ---------- 7j. Sonido ambiente opcional (WebAudio, sin archivos) ---------- */
const botonSonido = document.querySelector(".control--sonido");
let audio = null;
function ping(frec = 880, dur = 0.35, vol = 0.05) {
  if (!audio) return;
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(frec, audio.currentTime);
  o.frequency.exponentialRampToValueAtTime(frec * 0.6, audio.currentTime + dur);
  g.gain.setValueAtTime(vol, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
  o.connect(g).connect(audio.destination);
  o.start();
  o.stop(audio.currentTime + dur);
}
let temporizadorPing = null;
if (botonSonido) {
  botonSonido.addEventListener("click", () => {
    const activar = botonSonido.getAttribute("aria-pressed") !== "true";
    botonSonido.setAttribute("aria-pressed", String(activar));
    if (activar) {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      audio.resume();
      ping(660, 0.5, 0.06);
      temporizadorPing = setInterval(() => ping(880 + Math.random() * 120, 0.4, 0.035), 2600);
      document.querySelectorAll("a, button").forEach((el) => el.addEventListener("pointerenter", clicSuave));
    } else {
      clearInterval(temporizadorPing);
      document.querySelectorAll("a, button").forEach((el) => el.removeEventListener("pointerenter", clicSuave));
    }
  });
}
function clicSuave() { ping(1400, 0.08, 0.02); }
window.kaironPing = ping;

/* ---------- 7k. Clic en el globo: aparece una amenaza y el radar la neutraliza ---------- */
const escenaHero = document.querySelector(".hero .hero__escena");
if (escenaHero) {
  escenaHero.addEventListener("pointerdown", () => {
    if (window.kaironEscena && window.kaironEscena.impacto) window.kaironEscena.impacto();
    ping(220, 0.6, 0.05);
  });
}

/* ---------- 7l. Instalar app, estado de red y compartir ---------- */
let promptInstalar = null;
const botonInstalar = document.querySelector(".instalar");
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  promptInstalar = e;
  if (botonInstalar) botonInstalar.hidden = false;
});
if (botonInstalar) {
  botonInstalar.addEventListener("click", async () => {
    if (!promptInstalar) return;
    promptInstalar.prompt();
    await promptInstalar.userChoice;
    promptInstalar = null;
    botonInstalar.hidden = true;
  });
}
window.addEventListener("appinstalled", () => { if (botonInstalar) botonInstalar.hidden = true; });

const avisoRed = document.querySelector(".aviso-red");
function estadoRed() { if (avisoRed) avisoRed.hidden = navigator.onLine; }
window.addEventListener("online", estadoRed);
window.addEventListener("offline", estadoRed);
estadoRed();

const botonCompartir = document.querySelector(".compartir");
if (botonCompartir && navigator.share) {
  botonCompartir.hidden = false;
  botonCompartir.addEventListener("click", () => {
    navigator.share({ title: document.title, url: location.href }).catch(() => {});
  });
}

/* ---------- 8. Formulario ---------- */
const formulario = document.querySelector(".formulario");
if (formulario) {
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!formulario.checkValidity()) return formulario.reportValidity();
    const trampa = formulario.querySelector('input[name="web"]');
    if (trampa && trampa.value) { formulario.reset(); return; } // bot detectado: no se hace nada
    const aviso = formulario.querySelector(".formulario__aviso");
    const boton = formulario.querySelector("button[type=submit]");
    const textoBoton = boton ? boton.textContent.trim() : ""; // cada página tiene su propio texto en el botón
    if (boton) {
      boton.disabled = true;
      boton.textContent = TXT.enviando;
      setTimeout(() => {
        boton.classList.add("enviado");
        boton.textContent = TXT.recibido;
        if (aviso) { aviso.textContent = TXT.avisoForm; aviso.hidden = false; }
        formulario.reset();
        setTimeout(() => { boton.disabled = false; boton.classList.remove("enviado"); boton.textContent = textoBoton || TXT.pedir; }, 4000);
      }, 900);
    } else {
      if (aviso) { aviso.textContent = TXT.avisoForm; aviso.hidden = false; }
      formulario.reset();
    }
  });
}
