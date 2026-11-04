/* Portfolio: huella dibujada, pruebas que se mueven, filtro, SHA-256 real y aparición al hacer scroll */
document.documentElement.classList.add("js");

const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS = "http://www.w3.org/2000/svg";

/* ---------- Huella dactilar: arcos que se dibujan al cargar ---------- */
const huella = document.getElementById("huella");
for (let i = 0; i < 17; i++) {
  const r = 18 + i * 13;
  const hueco = 0.28 + ((i * 37) % 11) / 40;           // cada línea se abre por un sitio distinto
  const ini = Math.PI * (1.02 + hueco * 0.2);
  const fin = Math.PI * (2.0 + (i % 3 === 0 ? 0.32 : 0.62)) - hueco * 0.3;
  const punto = (a) => `${(200 + Math.cos(a) * r).toFixed(1)} ${(270 + Math.sin(a) * r * 1.22).toFixed(1)}`;
  const arco = document.createElementNS(NS, "path");
  arco.setAttribute("d", `M ${punto(ini)} A ${r} ${(r * 1.22).toFixed(1)} 0 ${fin - ini > Math.PI ? 1 : 0} 1 ${punto(fin)}`);
  huella.appendChild(arco);
  if (!reducido) {
    const largo = arco.getTotalLength();
    arco.style.strokeDasharray = largo;
    arco.animate([{ strokeDashoffset: largo }, { strokeDashoffset: 0 }], { duration: 1100, delay: i * 45, easing: "ease-out", fill: "backwards" });
  }
}

/* ---------- Pruebas: inclinación, filtro y arrastre con ratón ---------- */
const pruebas = document.querySelectorAll(".prueba");
pruebas.forEach((p, i) => p.style.setProperty("--giro", `${[-1.6, 1.2, -0.7, 1.7, -1.1, 0.8, -1.4][i % 7]}deg`));

const filtros = document.querySelectorAll(".filtros button");
filtros.forEach((b) => b.addEventListener("click", () => {
  filtros.forEach((o) => { o.classList.toggle("activo", o === b); o.setAttribute("aria-pressed", String(o === b)); });
  pruebas.forEach((p) => {
    p.hidden = b.dataset.f !== "todas" && p.dataset.o !== b.dataset.f;
    p.style.removeProperty("--x");
    p.style.removeProperty("--y");
  });
}));

if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  pruebas.forEach((p) => {
    let x = 0, y = 0, ix = 0, iy = 0;
    p.addEventListener("pointerdown", (e) => {
      x = parseFloat(p.style.getPropertyValue("--x")) || 0;
      y = parseFloat(p.style.getPropertyValue("--y")) || 0;
      ix = e.clientX; iy = e.clientY;
      p.setPointerCapture(e.pointerId);
      p.classList.add("moviendo");
    });
    p.addEventListener("pointermove", (e) => {
      if (!p.classList.contains("moviendo")) return;
      p.style.setProperty("--x", `${x + e.clientX - ix}px`);
      p.style.setProperty("--y", `${y + e.clientY - iy}px`);
    });
    const soltar = () => p.classList.remove("moviendo");
    p.addEventListener("pointerup", soltar);
    p.addEventListener("pointercancel", soltar);
  });
}

/* ---------- Sello: SHA-256 real con la API del navegador ---------- */
const entradaHash = document.getElementById("texto-hash");
const salidaHash = document.getElementById("hash");
async function sellar() {
  if (!crypto.subtle) { salidaHash.textContent = "Tu navegador no permite calcularla aquí."; return; }
  const valor = entradaHash.value;
  const datos = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(valor));
  if (valor !== entradaHash.value) return; // ya se ha escrito otra cosa
  salidaHash.textContent = [...new Uint8Array(datos)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
entradaHash.addEventListener("input", sellar);
sellar();

/* ---------- Aparición al entrar en pantalla ---------- */
const aparecen = document.querySelectorAll(".aparece");
if (reducido || !("IntersectionObserver" in window)) {
  aparecen.forEach((a) => a.classList.add("visto"));
} else {
  const vigia = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visto"); vigia.unobserve(e.target); } });
  }, { threshold: 0.15 });
  aparecen.forEach((a) => vigia.observe(a));
}
