/* Motor de efectos: corte de entrada, tajos, botones, brasas y cifrado de encantamientos */
const NS = "http://www.w3.org/2000/svg";
const raiz = document.documentElement;
raiz.classList.add("vfx"); // sin JS, todo el contenido se ve desde el principio

const guardado = {
  leer(almacen, clave) { try { return window[almacen].getItem(clave); } catch { return null; } },
  poner(almacen, clave, valor) { try { window[almacen].setItem(clave, valor); } catch { /* sin almacenamiento */ } }
};

function crearSvg(nombre, atributos = {}) {
  const el = document.createElementNS(NS, nombre);
  Object.entries(atributos).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/* ---------- Movimiento: preferencia del sistema o botón de la cabecera ---------- */
const botonCalma = document.getElementById("calma");
const sistemaCalmado = matchMedia("(prefers-reduced-motion: reduce)").matches;
const preferencia = guardado.leer("localStorage", "calma");
function ponerCalma(activa, guardar) {
  raiz.classList.toggle("calma", activa);
  botonCalma.setAttribute("aria-pressed", String(activa));
  if (guardar) guardado.poner("localStorage", "calma", activa ? "si" : "no");
}
ponerCalma(preferencia ? preferencia === "si" : sistemaCalmado, false);
botonCalma.addEventListener("click", () => ponerCalma(!raiz.classList.contains("calma"), true));
const calmado = () => raiz.classList.contains("calma");

/* ---------- Corte de entrada: una vez por sesión y sin bloquear la página ---------- */
function lanzarIntro() {
  if (document.querySelector(".corte")) return;
  const corte = document.createElement("div");
  corte.className = "corte";
  corte.setAttribute("aria-hidden", "true");
  // Cada mitad lleva el mismo emblema: al separarse, el símbolo queda partido por el corte
  ["a", "b"].forEach((m) => {
    const mitad = document.createElement("div");
    mitad.className = `corte__mitad corte__mitad--${m}`;
    const emblema = document.createElement("div");
    emblema.className = "emblema";
    const anillo = crearSvg("svg", { class: "emblema__anillo", viewBox: "0 0 200 200" });
    anillo.appendChild(crearSvg("circle", { cx: 100, cy: 100, r: 96, pathLength: 100 }));
    anillo.appendChild(crearSvg("circle", { cx: 100, cy: 100, r: 84, pathLength: 100 }));
    const kanji = document.createElement("span");
    kanji.className = "emblema__kanji";
    kanji.textContent = "解";
    const nombre = document.createElement("span");
    nombre.className = "emblema__nombre";
    nombre.textContent = "MARU";
    emblema.append(anillo, kanji, nombre);
    mitad.appendChild(emblema);
    corte.appendChild(mitad);
  });
  // Tres tajos rápidos y, el último, el corte que abre la pantalla
  const linea = crearSvg("svg", { class: "corte__linea", viewBox: "0 0 100 100", preserveAspectRatio: "none" });
  [[8, 30, 92, 62], [20, 88, 78, 8], [6, 70, 94, 34], [100, 0, 0, 100]].forEach(([x1, y1, x2, y2], i) => {
    linea.appendChild(crearSvg("line", { x1, y1, x2, y2, pathLength: 150, class: i === 3 ? "corte__final" : "corte__rapido" }));
  });
  corte.appendChild(linea);
  const fogonazo = document.createElement("div");
  fogonazo.className = "corte__fogonazo";
  corte.appendChild(fogonazo);
  document.body.appendChild(corte);
  const principal = document.querySelector("main");
  principal.classList.add("temblor");

  const terminar = () => {
    clearTimeout(reloj);
    corte.remove();
    principal.classList.remove("temblor");
    removeEventListener("keydown", terminar);
  };
  const reloj = setTimeout(terminar, 2950);
  corte.addEventListener("pointerdown", terminar); // un clic o una tecla la saltan
  addEventListener("keydown", terminar);
}
if (!calmado() && !guardado.leer("sessionStorage", "corte")) {
  guardado.poner("sessionStorage", "corte", "1");
  lanzarIntro();
}
document.getElementById("repetir").addEventListener("click", () => {
  if (calmado()) return;
  scrollTo({ top: 0, behavior: "instant" });
  lanzarIntro();
});

/* ---------- Tajos cruzados en tarjetas y enlaces ---------- */
document.querySelectorAll(".tajo").forEach((el) => {
  const trazos = crearSvg("svg", { class: "tajo__trazos", viewBox: "0 0 100 100", preserveAspectRatio: "none", "aria-hidden": "true" });
  [[0, 15, 100, 75], [100, 10, 0, 90], [15, 100, 90, 0]].forEach(([x1, y1, x2, y2]) => {
    trazos.appendChild(crearSvg("line", { x1, y1, x2, y2, pathLength: 150 }));
  });
  el.appendChild(trazos);
});

/* ---------- Botones que se parten al pulsarlos ---------- */
document.querySelectorAll(".boton--corte").forEach((boton) => {
  const texto = boton.textContent;
  boton.textContent = "";
  ["a", "b"].forEach((m) => {
    const mitad = document.createElement("span");
    mitad.className = `boton__mitad boton__mitad--${m}`;
    mitad.textContent = texto;
    if (m === "b") mitad.setAttribute("aria-hidden", "true"); // el lector de pantalla solo lee una mitad
    boton.appendChild(mitad);
  });
  boton.addEventListener("pointerdown", () => {
    if (calmado()) return;
    boton.classList.add("boton--cortado");
    setTimeout(() => boton.classList.remove("boton--cortado"), 340);
  });
});

/* ---------- Llama divina: brasas que suben desde el botón ---------- */
const lienzo = document.getElementById("brasas");
const ctx = lienzo.getContext("2d");
const COLORES = ["#8a0014", "#d90429", "#ff4d00", "#f4f3ef"];
const brasas = [];
let animando = false;

function ajustarLienzo() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  lienzo.width = innerWidth * dpr;
  lienzo.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", ajustarLienzo);
ajustarLienzo();

function emitir(boton, cantidad, fuerza) {
  if (calmado()) return;
  const r = boton.getBoundingClientRect();
  for (let i = 0; i < cantidad && brasas.length < 220; i++) {
    brasas.push({
      x: r.left + Math.random() * r.width,
      y: r.top + Math.random() * r.height * 0.4,
      vx: (Math.random() - 0.5) * 1.6 * fuerza,
      vy: -(0.8 + Math.random() * 2.2) * fuerza,
      vida: 1,
      caida: 0.012 + Math.random() * 0.018,
      tam: 1 + Math.random() * 2.6,
      color: COLORES[Math.floor(Math.random() * COLORES.length)]
    });
  }
  if (!animando) { animando = true; requestAnimationFrame(pintarBrasas); }
}

function pintarBrasas() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = brasas.length - 1; i >= 0; i--) {
    const b = brasas[i];
    b.x += b.vx + Math.sin(b.y / 14) * 0.4;
    b.y += b.vy;
    b.vida -= b.caida;
    if (b.vida <= 0) { brasas.splice(i, 1); continue; }
    ctx.globalAlpha = b.vida;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.tam, b.tam);
  }
  ctx.globalAlpha = 1;
  // El bucle solo sigue mientras quedan brasas o algún botón arde
  if (brasas.length || ardiendo) requestAnimationFrame(pintarBrasas);
  else animando = false;
}

let ardiendo = null;
function avivar() {
  if (!ardiendo) return;
  emitir(ardiendo, 2, 1);
  setTimeout(avivar, 70);
}
document.querySelectorAll(".boton--llama").forEach((boton) => {
  const encender = () => { if (!ardiendo) { ardiendo = boton; avivar(); } };
  const apagar = () => { ardiendo = null; };
  boton.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") encender(); });
  boton.addEventListener("pointerleave", apagar);
  boton.addEventListener("focus", encender);
  boton.addEventListener("blur", apagar);
  boton.addEventListener("pointerdown", () => emitir(boton, 70, 2.2));
});

/* ---------- Aparición al hacer scroll ---------- */
const revelables = document.querySelectorAll(".seccion__titulo, .lab__bloque, .sobre__texto > p, .ruta__paso, .tarjeta, .cursos__fila, .contacto__correo");
const vigia = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add("revela--vista");
    vigia.unobserve(el);
    // Al terminar se quitan las clases para que el hover de las tarjetas no herede el retardo
    setTimeout(() => el.classList.remove("revela", "revela--vista"), 900 + 90 * (+el.style.getPropertyValue("--i") || 0));
  });
}, { rootMargin: "0px 0px -12% 0px" });
revelables.forEach((el) => {
  // Los hermanos aparecen en cascada: el retardo depende de su posición
  el.style.setProperty("--i", [...el.parentElement.children].filter((h) => h.matches(".revela, " + el.tagName)).indexOf(el) % 6);
  el.classList.add("revela");
  vigia.observe(el);
});

/* ---------- Progreso de lectura y kanji que se desplaza más lento ---------- */
const progreso = document.getElementById("progreso");
const kanjiPortada = document.querySelector(".portada__kanji");
let pendiente = false;
function alDesplazar() {
  pendiente = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  progreso.style.setProperty("--avance", max > 0 ? (scrollY / max).toFixed(4) : 0);
  if (!calmado() && scrollY < innerHeight * 1.5) kanjiPortada.style.setProperty("--desp", `${(scrollY * 0.35).toFixed(1)}px`);
}
addEventListener("scroll", () => { if (!pendiente) { pendiente = true; requestAnimationFrame(alDesplazar); } }, { passive: true });
alDesplazar();

/* ---------- Menú: marca la sección que se está leyendo ---------- */
const enlacesMenu = new Map([...document.querySelectorAll(".cabecera__nav a")].map((a) => [a.hash.slice(1), a]));
const vigiaMenu = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (!e.isIntersecting) return;
    enlacesMenu.forEach((a, id) => a.setAttribute("aria-current", String(id === e.target.id)));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
enlacesMenu.forEach((_, id) => { const s = document.getElementById(id); if (s) vigiaMenu.observe(s); });
