/* Portfolio de João Daniel · "Cueva brillante"
   Arranca la cueva jugable, los menús de RPG y el desplazamiento suave.
   - Los paneles "se encienden" a saltos (como un sprite) al entrar en pantalla.
   - Diario de misiones: en pantalla ancha, lista a la izquierda y detalle a la derecha.
   - "Menos movimiento" (botón o ajuste del sistema): sin desplazamiento suave ni apariciones. */

import { iniciarIdioma, alCambiarIdioma } from "./i18n.js";
import * as sonido from "./sonido.js";
import { iniciarCueva } from "./cueva.js";
import { iniciarLaboratorio } from "./lab.js";
import { JUGADOR, OBJETOS, aLienzo } from "./sprites.js";

const raiz = document.documentElement;
const $ = (s, d = document) => d.querySelector(s);
const $$ = (s, d = document) => [...d.querySelectorAll(s)];
const hayGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
raiz.classList.add("js");

/* ---------- Menos movimiento ---------- */
const botonCalma = $("#calma");
let preferencia = null;
try { preferencia = localStorage.getItem("calma-dani"); } catch { /* sin almacenamiento */ }
function ponerCalma(si, guardar) {
  raiz.classList.toggle("calma", si);
  botonCalma.setAttribute("aria-pressed", String(si));
  if (guardar) { try { localStorage.setItem("calma-dani", si ? "si" : "no"); } catch { /* sin almacenamiento */ } }
}
ponerCalma(preferencia ? preferencia === "si" : matchMedia("(prefers-reduced-motion: reduce)").matches, false);
const calmado = () => raiz.classList.contains("calma");

/* ---------- Idioma y sonido ---------- */
iniciarIdioma();
sonido.iniciarSonido($("#sonido"));

/* ---------- Desplazamiento suave y enlaces internos ---------- */
let lenis = null;
function irA(id) {
  const destino = document.getElementById(id);
  if (!destino) return;
  if (lenis) lenis.scrollTo(destino, { offset: -$(".barra").offsetHeight - 12, duration: 1.3 });
  else destino.scrollIntoView({ behavior: calmado() ? "auto" : "smooth" });
  history.replaceState(null, "", `#${id}`);
  // El foco pasa al título de la sección para quien navega con teclado o lector de pantalla
  const titulo = $("h2", destino);
  if (titulo) { titulo.setAttribute("tabindex", "-1"); titulo.focus({ preventScroll: true }); }
}
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.hash.length < 2) return;
  e.preventDefault();
  irA(a.hash.slice(1));
});

/* ---------- Retrato de la ficha y hoguera del contacto ---------- */
function pintarSprite(lienzo, filas) {
  if (!lienzo) return;
  const c = lienzo.getContext("2d");
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, 16, 16);
  c.drawImage(aLienzo(filas), 0, 0);
}
pintarSprite($("#retrato"), JUGADOR.abajo[0]);
pintarSprite($("#hoguera"), OBJETOS.hoguera);

/* ---------- Diario de misiones: lista + detalle ---------- */
function iniciarMisiones() {
  const lista = $(".misiones__lista");
  const misiones = $$(".mision");
  const pestanas = misiones.map((m, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mision-tab";
    b.setAttribute("role", "tab");
    b.id = `tab-${m.id}`;
    b.setAttribute("aria-controls", m.id);
    m.setAttribute("role", "tabpanel");
    m.setAttribute("aria-labelledby", b.id);
    b.addEventListener("click", () => elegir(i, true));
    b.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); elegir((i + 1) % misiones.length, true); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); elegir((i - 1 + misiones.length) % misiones.length, true); }
    });
    lista.appendChild(b);
    return b;
  });
  const rotular = () => pestanas.forEach((b, i) => {
    b.innerHTML = "";
    const nombre = document.createElement("strong");
    nombre.textContent = $(".mision__nombre", misiones[i]).textContent;
    const estado = document.createElement("span");
    estado.textContent = $(".mision__estado", misiones[i]).textContent;
    estado.style.color = getComputedStyle($(".mision__estado", misiones[i])).color;
    b.append(nombre, estado);
  });
  const ancho = matchMedia("(min-width: 900px)");
  let actual = 0;
  function elegir(i, foco) {
    actual = i;
    pestanas.forEach((b, j) => { b.setAttribute("aria-selected", String(j === i)); b.tabIndex = j === i ? 0 : -1; });
    misiones.forEach((m, j) => { m.hidden = ancho.matches && j !== i; });
    if (foco) { pestanas[i].focus(); sonido.blip(); }
  }
  rotular();
  elegir(0, false);
  ancho.addEventListener("change", () => elegir(actual, false));
  alCambiarIdioma(rotular);
}
iniciarMisiones();

/* ---------- Menú: marca la sección que se está leyendo ---------- */
const enlaces = new Map($$(".barra__nav a").map((a) => [a.hash.slice(1), a]));
const vigia = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => { if (e.isIntersecting) enlaces.forEach((a, id) => a.setAttribute("aria-current", String(id === e.target.id))); });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main > section").forEach((s) => vigia.observe(s));

/* ---------- Movimiento: desplazamiento suave y paneles que se encienden ---------- */
function arrancarMovimiento() {
  if (!hayGsap || calmado()) return;
  gsap.registerPlugin(ScrollTrigger);
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.12, anchors: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((tiempo) => lenis?.raf(tiempo * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // Se encienden a saltos, como un sprite que aparece, con un pequeño retraso entre hermanos
  const piezas = $$(".seccion__titulo, .seccion__nota, .panel, .programa, .bolsa__objetos li, .arbol__nivel, .nodo, .mision-tab");
  piezas.forEach((p) => p.classList.add("por-encender"));
  ScrollTrigger.batch(piezas, {
    start: "top 88%",
    once: true,
    onEnter: (lote) => gsap.fromTo(lote, { opacity: 0, y: 12 }, {
      opacity: 1, y: 0, duration: 0.42, ease: "steps(5)", stagger: 0.06,
      onStart() { lote.forEach((p) => p.classList.remove("por-encender")); }
    })
  });
}

botonCalma.addEventListener("click", () => {
  const si = !calmado();
  ponerCalma(si, true);
  if (si) {
    $$(".por-encender").forEach((p) => p.classList.remove("por-encender"));
    gsap?.set?.($$(".panel, .programa, .nodo, .bolsa__objetos li, .arbol__nivel, .seccion__titulo, .seccion__nota, .mision-tab"), { clearProps: "opacity,transform" });
    lenis?.destroy(); lenis = null;
  }
});

/* ---------- Arranque ---------- */
iniciarCueva({ calmado, irA });
iniciarLaboratorio();
(document.fonts?.ready ?? Promise.resolve()).then(arrancarMovimiento);
