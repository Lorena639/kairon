/* Expansión de dominio: la página entera se convierte unos segundos en el Santuario Malévolo.
   Fases: invocación (texto y anillos) → el dominio se expande en círculo → lluvia de tajos
   sobre la página → se cierra. Se lanza con el botón o escribiendo «ryoiki tenkai». */

const NS = "http://www.w3.org/2000/svg";
const raiz = document.documentElement;
const calmado = () => raiz.classList.contains("calma");
const DURACION = 7200; // ms totales del dominio
let activo = null;

function linea(svg) {
  // Tajo aleatorio que cruza la pantalla de lado a lado
  const a = Math.random() * Math.PI;
  const cx = Math.random() * 100, cy = Math.random() * 100, l = 90 + Math.random() * 60;
  const l2 = document.createElementNS(NS, "line");
  l2.setAttribute("x1", cx - Math.cos(a) * l); l2.setAttribute("y1", cy - Math.sin(a) * l);
  l2.setAttribute("x2", cx + Math.cos(a) * l); l2.setAttribute("y2", cy + Math.sin(a) * l);
  l2.setAttribute("pathLength", "100");
  if (Math.random() < 0.3) l2.classList.add("dominio__tajo--rojo");
  svg.appendChild(l2);
  setTimeout(() => l2.remove(), 600);
}

function expandir() {
  if (activo) return;
  const capa = document.createElement("div");
  capa.className = `dominio${calmado() ? " dominio--calma" : ""}`;
  capa.setAttribute("role", "dialog");
  capa.setAttribute("aria-modal", "true");
  capa.setAttribute("aria-label", "Expansión de dominio: Santuario Malévolo. Pulsa Escape para cerrar.");
  capa.innerHTML = `
    <div class="dominio__circulo"></div>
    <svg class="dominio__anillos" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="96" pathLength="100"/><circle cx="100" cy="100" r="80" pathLength="100"/><circle cx="100" cy="100" r="64" pathLength="100"/>
    </svg>
    <div class="dominio__texto">
      <p class="dominio__invocacion">領域展開</p>
      <p class="dominio__nombre">伏魔御廚子</p>
      <p class="dominio__traduccion">Expansión de dominio · Santuario Malévolo</p>
    </div>
    <svg class="dominio__tajos" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
    <button type="button" class="dominio__cerrar">Cerrar dominio (Esc)</button>`;
  document.body.appendChild(capa);
  raiz.classList.add("en-dominio");
  const svg = capa.querySelector(".dominio__tajos");
  const cerrar = capa.querySelector(".dominio__cerrar");
  const volver = document.activeElement;
  cerrar.focus({ preventScroll: true });

  const relojes = [];
  let lluvia = null;
  if (!calmado()) {
    // A los 2,4 s el dominio ya cubre la pantalla y empiezan a llover tajos
    relojes.push(setTimeout(() => {
      capa.classList.add("dominio--tajos");
      lluvia = setInterval(() => { linea(svg); if (Math.random() < 0.5) linea(svg); }, 110);
    }, 2400));
  }
  relojes.push(setTimeout(() => terminar(), calmado() ? 3000 : DURACION));

  function terminar() {
    if (!activo) return;
    relojes.forEach(clearTimeout);
    clearInterval(lluvia);
    capa.classList.add("dominio--saliendo");
    raiz.classList.remove("en-dominio");
    removeEventListener("keydown", teclas);
    setTimeout(() => capa.remove(), 500);
    activo = null;
    if (volver && volver.focus) volver.focus({ preventScroll: true });
  }
  function teclas(e) {
    if (e.key === "Escape") terminar();
    if (e.key === "Tab") { e.preventDefault(); cerrar.focus(); } // el foco no sale del dominio
  }
  cerrar.addEventListener("click", terminar);
  addEventListener("keydown", teclas);
  activo = terminar;
}

document.getElementById("expandir").addEventListener("click", expandir);

// Código secreto: escribir «ryoiki tenkai» fuera de un campo de texto
const CLAVE = "ryoiki tenkai";
let escrito = "";
addEventListener("keydown", (e) => {
  if (e.target.closest && e.target.closest("input, textarea, [contenteditable]")) return;
  if (e.key.length !== 1) return;
  escrito = (escrito + e.key.toLowerCase()).slice(-CLAVE.length);
  if (escrito === CLAVE) { escrito = ""; expandir(); }
});
