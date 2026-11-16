/* Portfolio de João Daniel: el editor escribe el código de cada sección y el papel lo imprime.
   - Escritorio (≥1000 px): editor fijo a la izquierda que teclea el archivo de la sección que se lee.
   - Móvil: el código de cada hoja va plegado dentro de la propia hoja.
   - Cada hoja se imprime línea a línea la primera vez que entra en pantalla.
   - "Menos movimiento" (botón o ajuste del sistema): todo aparece ya escrito e impreso. */

import { iniciarIdioma, alCambiarIdioma, t } from "./i18n.js";
import { fichas, pintar, resaltar } from "./sintaxis.js";
import * as sonido from "./sonido.js";
import { iniciarLaboratorio } from "./lab.js";

const raiz = document.documentElement;
const $ = (s, d = document) => d.querySelector(s);
const $$ = (s, d = document) => [...d.querySelectorAll(s)];
const hayGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && typeof SplitText !== "undefined";
const hojas = $$(".hoja");

/* ---------- Menos movimiento ---------- */
const sistemaCalmado = matchMedia("(prefers-reduced-motion: reduce)").matches;
let preferencia = null;
try { preferencia = localStorage.getItem("calma-dani"); } catch { /* sin almacenamiento */ }
const botonCalma = $("#calma");
function ponerCalma(si, guardar) {
  raiz.classList.toggle("calma", si);
  botonCalma.setAttribute("aria-pressed", String(si));
  if (guardar) { try { localStorage.setItem("calma-dani", si ? "si" : "no"); } catch { /* sin almacenamiento */ } }
}
ponerCalma(preferencia ? preferencia === "si" : sistemaCalmado, false);
const calmado = () => raiz.classList.contains("calma");

/* ---------- Idioma y sonido ---------- */
iniciarIdioma();
const anuncio = $("#editor-estado");
sonido.iniciarSonido($("#sonido"), (activo) => { anuncio.textContent = t(activo ? "sonido.on" : "sonido.off"); });

/* ---------- Código de cada hoja: datos y versión plegable para móvil ---------- */
const codigos = new Map();
hojas.forEach((hoja) => {
  const fuente = $(".fuente code", hoja);
  if (!fuente) return;
  const datos = { archivo: hoja.dataset.archivo, lenguaje: hoja.dataset.lenguaje, texto: fuente.textContent };
  datos.lineas = datos.texto.split("\n").map((l) => ({ texto: l, fichas: fichas(l, datos.lenguaje) }));
  codigos.set(hoja, datos);
  const plegable = document.createElement("details");
  plegable.className = "fuente-movil";
  plegable.innerHTML = `<summary><svg class="icono" aria-hidden="true"><use href="#i-codigo"/></svg><span></span> · ${datos.archivo}</summary><pre><code>${resaltar(datos.texto, datos.lenguaje)}</code></pre>`;
  $(".fuente", hoja).after(plegable);
});
function textosPlegables() { $$(".fuente-movil summary span").forEach((s) => { s.textContent = t("editor.ver"); }); }
textosPlegables();
alCambiarIdioma(textosPlegables);

/* ---------- Editor: teclea el archivo de la hoja activa ---------- */
const editor = { codigo: $("#editor-codigo code"), archivo: $("#editor-archivo"), lenguaje: $("#editor-lenguaje"), luz: $("#editor-luz"), estado: $("#editor-estado"), pos: $("#editor-pos") };
let hojaEditor = null;
let tecleo = null;
let pendiente = null; // impresión que espera a que termine el tecleo actual

function pintarEditor(datos, caracteres) {
  let quedan = caracteres, html = "", lineaCursor = 0, columna = 0;
  datos.lineas.forEach((l, i) => {
    if (quedan < 0) return;
    const visibles = Math.min(l.texto.length, quedan);
    const conCursor = quedan <= l.texto.length;
    html += `<span class="l${conCursor ? " l--activa" : ""}">${pintar(l.fichas, visibles)}${conCursor ? '<span class="editor__caret"></span>' : ""}</span>`;
    if (conCursor) { lineaCursor = i + 1; columna = visibles + 1; }
    quedan -= l.texto.length + 1; // +1 por el salto de línea
  });
  editor.codigo.innerHTML = html;
  editor.pos.textContent = `Ln ${lineaCursor || datos.lineas.length}, Col ${columna || 1}`;
}

function estadoEditor(clave) {
  editor.luz.dataset.estado = clave;
  editor.estado.textContent = t(`editor.${clave}`);
}

/** Muestra el archivo de la hoja; si `teclear`, lo escribe y llama a `alTerminar` al compilar. */
function abrirEnEditor(hoja, teclear, alTerminar) {
  const datos = codigos.get(hoja);
  if (!datos || hoja === hojaEditor) { alTerminar?.(); return; }
  hojaEditor = hoja;
  // Si se corta un tecleo a medias (se ha bajado rápido), esa hoja se imprime igualmente
  tecleo?.kill();
  const anterior = pendiente;
  pendiente = null;
  anterior?.();
  editor.archivo.textContent = datos.archivo;
  editor.lenguaje.textContent = datos.lenguaje;
  const total = datos.texto.length;
  if (!teclear || calmado() || !hayGsap) {
    pintarEditor(datos, total);
    estadoEditor("impreso");
    alTerminar?.();
    return;
  }
  const progreso = { n: 0 };
  let tecleados = 0;
  pendiente = alTerminar || null;
  estadoEditor("escribiendo");
  tecleo = gsap.timeline()
    .to(progreso, {
      n: total, duration: Math.min(1.5, 0.35 + total / 420), ease: "none",
      onUpdate: () => { const n = Math.round(progreso.n); if (n !== tecleados) { tecleados = n; pintarEditor(datos, n); sonido.tecla(); } }
    })
    .call(() => estadoEditor("compilando"))
    .to({}, { duration: 0.28 })
    .call(() => { estadoEditor("impreso"); pendiente = null; alTerminar?.(); });
}
alCambiarIdioma(() => { if (editor.luz.dataset.estado) estadoEditor(editor.luz.dataset.estado); });

/* ---------- Impresión línea a línea ---------- */
// Unidades que se imprimen como una línea; los párrafos y títulos se parten en sus líneas reales
const UNIDADES = ".orden, .linea-imp, .hoja__titulo, .hoja > p, .sobre__texto > p, .ruta li, thead tr, tbody tr, .resultado, .proyecto > *, .curso, .correo, .acciones, .programa > *, .pie-hoja";
const TEXTO_PARTIBLE = "P, H2";
const impresas = new WeakSet();

function unidadesDe(hoja) {
  const todas = $$(UNIDADES, hoja).filter((u) => !u.closest(".fuente, .fuente-movil"));
  return todas.filter((u) => !todas.some((otra) => otra !== u && otra.contains(u)));
}

function ocultarParaImprimir(hoja) {
  if (impresas.has(hoja)) return;
  hoja.classList.add("por-imprimir");
}

function imprimir(hoja) {
  if (impresas.has(hoja)) return;
  impresas.add(hoja);
  hoja.classList.remove("por-imprimir");
  const marcas = $$(".marca", hoja);
  if (calmado() || !hayGsap) { marcas.forEach((m) => m.classList.add("marca--puesta")); return; }
  const partidos = [];
  const lineas = [];
  unidadesDe(hoja).forEach((u) => {
    if (TEXTO_PARTIBLE.includes(u.tagName) && u.textContent.trim().length > 40) {
      const s = SplitText.create(u, { type: "lines", linesClass: "linea-papel", aria: "auto" });
      partidos.push(s);
      lineas.push(...s.lines);
    } else {
      lineas.push(u);
    }
  });
  // Ritmo de impresora térmica: cada línea se revela de izquierda a derecha a saltos
  const porLinea = Math.max(0.05, Math.min(0.14, 2.2 / lineas.length));
  gsap.set(lineas, { clipPath: "inset(0 100% 0 0)" });
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(lineas, { clearProps: "clipPath" });
      partidos.forEach((s) => s.revert());
    }
  });
  lineas.forEach((l, i) => {
    tl.to(l, { clipPath: "inset(0 0% 0 0)", duration: porLinea * 1.6, ease: "steps(12)", onStart: sonido.linea }, i * porLinea);
  });
  marcas.forEach((m) => tl.call(() => m.classList.add("marca--puesta"), null, Math.min(0.5, tl.duration() * 0.4)));
}

/* ---------- Desplazamiento, editor activo y menú ---------- */
const enlacesMenu = new Map($$(".barra__nav a").map((a) => [a.hash.slice(1), a]));
function marcarMenu(id) {
  enlacesMenu.forEach((a, clave) => a.setAttribute("aria-current", String(clave === id)));
}

let lenis = null;
function arrancarMovimiento() {
  if (!hayGsap) { hojas.forEach(imprimir); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  if (!calmado() && typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.12, anchors: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((tiempo) => lenis?.raf(tiempo * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const escritorio = matchMedia("(min-width: 1000px)");
  hojas.forEach((hoja) => {
    ocultarParaImprimir(hoja);
    // Primera entrada: el editor la teclea (en escritorio) y después el papel la imprime
    ScrollTrigger.create({
      trigger: hoja, start: "top 78%", once: true,
      onEnter: () => {
        if (escritorio.matches) abrirEnEditor(hoja, true, () => imprimir(hoja));
        else imprimir(hoja);
      }
    });
    // Hoja activa: la que cruza el centro de la pantalla
    ScrollTrigger.create({
      trigger: hoja, start: "top 50%", end: "bottom 50%",
      onToggle: (st) => {
        if (!st.isActive) return;
        marcarMenu(hoja.id);
        if (escritorio.matches && impresas.has(hoja)) abrirEnEditor(hoja, false);
      }
    });
  });
}

// Los enlaces internos se desplazan con Lenis teniendo en cuenta la barra fija
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || !lenis) return;
  const destino = document.getElementById(a.hash.slice(1));
  if (!destino) return;
  e.preventDefault();
  lenis.scrollTo(destino, { offset: -$(".barra").offsetHeight, duration: 1.2 });
  history.replaceState(null, "", a.hash);
});

/* ---------- Botones de la barra y del pie ---------- */
botonCalma.addEventListener("click", () => {
  const si = !calmado();
  ponerCalma(si, true);
  if (si) {
    hojas.forEach((h) => { h.classList.remove("por-imprimir"); imprimir(h); });
    gsap?.globalTimeline?.progress?.(1);
    lenis?.destroy(); lenis = null;
  }
});

$("#reimprimir").addEventListener("click", () => {
  if (calmado() || !hayGsap) return;
  hojaEditor = null;
  hojas.forEach((h) => { impresas.delete(h); $$(".marca", h).forEach((m) => m.classList.remove("marca--puesta")); });
  const arriba = () => {
    hojas.forEach((h) => {
      const r = h.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) { h.classList.add("por-imprimir"); abrirEnEditor(h, true, () => imprimir(h)); }
      else { h.classList.add("por-imprimir"); ScrollTrigger.create({ trigger: h, start: "top 78%", once: true, onEnter: () => abrirEnEditor(h, matchMedia("(min-width: 1000px)").matches, () => imprimir(h)) }); }
    });
  };
  if (lenis) lenis.scrollTo(0, { duration: 1.2, onComplete: arriba }); else { scrollTo(0, 0); arriba(); }
});

/* ---------- Arranque ---------- */
iniciarLaboratorio();
raiz.classList.add("js");
// Se espera a las fuentes para que los cortes de línea de la impresión sean los definitivos
(document.fonts?.ready ?? Promise.resolve()).then(arrancarMovimiento);
