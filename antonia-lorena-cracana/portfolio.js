/* Portfolio: huella dibujada, pruebas que se mueven, filtro, SHA-256 real, glosario y luz UV */
document.documentElement.classList.add("js");

const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS = "http://www.w3.org/2000/svg";
const ca = document.documentElement.lang === "ca";

/* ---------- Textos que dependen del idioma ---------- */
const TXT = ca ? {
  distintos: (n) => `${n} de 64 caràcters són diferents dels de l'empremta original.`,
  intacta: "Coincideix amb l'empremta original: la prova està intacta."
} : {
  distintos: (n) => `${n} de 64 caracteres son distintos a los de la huella original.`,
  intacta: "Coincide con la huella original: la prueba está intacta."
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
    if (luz > 0.8 && !halladas.has(p)) {
      halladas.add(p);
      document.dispatchEvent(new CustomEvent("portfolio:pista"));
    }
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

/* ---------- Almacenamiento opcional: la página funciona igual sin él ---------- */
const guardado = {
  leer(almacen, clave) { try { return window[almacen].getItem(clave); } catch { return null; } },
  poner(almacen, clave, valor) { try { window[almacen].setItem(clave, valor); } catch { /* sin almacenamiento */ } }
};

/* ---------- Intro: la carpeta se abre una vez por sesión y no bloquea nada ---------- */
if (!reducido && !guardado.leer("sessionStorage", "carpeta")) {
  guardado.poner("sessionStorage", "carpeta", "1");
  const carpeta = document.createElement("div");
  carpeta.className = "carpeta maq";
  carpeta.setAttribute("aria-hidden", "true");
  const izquierda = document.createElement("span");
  izquierda.textContent = "Expediente ALC";
  carpeta.append(izquierda, document.createElement("span"));
  document.body.appendChild(carpeta);
  setTimeout(() => carpeta.remove(), 1300);
}

/* ---------- Huella: las crestas se apartan del ratón ---------- */
if (!reducido && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const crestas = [...huella.querySelectorAll("path")].map((el) => ({
    el,
    puntos: el.getAttribute("d").slice(2).split(" L ").map((p) => p.split(" ").map(Number))
  }));
  const portada = document.querySelector(".portada");
  let cx = 0, cy = 0, fuerza = 0, objetivo = 0, activo = false, preparada = false;
  function deformar(ms) {
    fuerza += (objetivo - fuerza) * 0.12;
    const temblor = 1 + 0.08 * Math.sin(ms / 70);
    crestas.forEach(({ el, puntos }) => {
      el.setAttribute("d", "M " + puntos.map(([x, y]) => {
        const dx = x - cx, dy = y - cy, dist = Math.hypot(dx, dy) || 1;
        const empuje = dist < 95 ? ((1 - dist / 95) ** 2) * 26 * fuerza * temblor : 0;
        return `${(x + (dx / dist) * empuje).toFixed(1)} ${(y + (dy / dist) * empuje).toFixed(1)}`;
      }).join(" L "));
    });
    if (objetivo || fuerza > 0.01) requestAnimationFrame(deformar);
    else activo = false;
  }
  portada.addEventListener("pointermove", (e) => {
    if (!preparada) { // la línea discontinua de la animación inicial ya no hace falta
      crestas.forEach(({ el }) => { el.getAnimations().forEach((a) => a.finish()); el.style.removeProperty("stroke-dasharray"); });
      preparada = true;
    }
    const c = new DOMPoint(e.clientX, e.clientY).matrixTransform(huella.getScreenCTM().inverse());
    cx = c.x; cy = c.y; objetivo = 1;
    if (!activo) { activo = true; requestAnimationFrame(deformar); }
  }, { passive: true });
  portada.addEventListener("pointerleave", () => { objetivo = 0; });
}

/* ---------- Botones nuevos de la cinta ---------- */
function botonCinta(texto, etiqueta, pulsado) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "uv-boton";
  b.textContent = texto;
  b.setAttribute("aria-label", etiqueta);
  if (pulsado !== undefined) b.setAttribute("aria-pressed", String(pulsado));
  botonUV.before(b);
  return b;
}

/* ---------- Modo oscuro: sala de pruebas ---------- */
const raizHtml = document.documentElement;
const botonTema = botonCinta("◐", ca ? "Mode fosc" : "Modo oscuro", false);
function ponerTema(oscuro) {
  raizHtml.classList.toggle("oscuro", oscuro);
  botonTema.setAttribute("aria-pressed", String(oscuro));
  guardado.poner("localStorage", "tema", oscuro ? "oscuro" : "claro");
}
if (guardado.leer("localStorage", "tema") === "oscuro") ponerTema(true);
botonTema.addEventListener("click", () => ponerTema(!raizHtml.classList.contains("oscuro")));
// El papel impreso siempre sale claro
let temaAlImprimir = false;
addEventListener("beforeprint", () => { temaAlImprimir = raizHtml.classList.contains("oscuro"); raizHtml.classList.remove("oscuro"); });
addEventListener("afterprint", () => raizHtml.classList.toggle("oscuro", temaAlImprimir));

/* ---------- Sonido: apagado por defecto y generado en el navegador ---------- */
const botonSonido = botonCinta("♪", ca ? "So" : "Sonido", false);
let audio = null;
function sonar(tipo) {
  if (!audio) return;
  const osc = audio.createOscillator();
  const vol = audio.createGain();
  const ahora = audio.currentTime;
  const sello = tipo === "sello";
  osc.type = sello ? "sine" : "square";
  osc.frequency.setValueAtTime(sello ? 130 : 1500 + Math.random() * 500, ahora);
  if (sello) osc.frequency.exponentialRampToValueAtTime(45, ahora + 0.16);
  vol.gain.setValueAtTime(sello ? 0.4 : 0.035, ahora);
  vol.gain.exponentialRampToValueAtTime(0.001, ahora + (sello ? 0.2 : 0.03));
  osc.connect(vol).connect(audio.destination);
  osc.start(ahora);
  osc.stop(ahora + 0.22);
}
botonSonido.addEventListener("click", () => {
  const activar = !audio;
  if (activar) { audio = new AudioContext(); sonar("sello"); }
  else { audio.close(); audio = null; }
  botonSonido.setAttribute("aria-pressed", String(activar));
});

/* ---------- Rango: encontrar todas las pistas tiene premio ---------- */
const cierre = document.createElement("dialog");
cierre.className = "cierre";
const cierreSello = document.createElement("p");
cierreSello.className = "cierre__sello maq";
cierreSello.textContent = ca ? "Cas tancat" : "Caso cerrado";
const cierreTexto = document.createElement("p");
cierreTexto.textContent = ca
  ? "Has trobat totes les pistes amb la llum ultraviolada. Rang: investigadora. Parlem?"
  : "Has encontrado todas las pistas con la luz ultravioleta. Rango: investigadora. ¿Hablamos?";
const cierreCorreo = document.createElement("a");
cierreCorreo.className = "boton maq";
cierreCorreo.href = "mailto:antoniacracana@gmail.com";
cierreCorreo.textContent = ca ? "Escriu-me" : "Escríbeme";
const cierreBoton = document.createElement("button");
cierreBoton.type = "button";
cierreBoton.className = "boton boton--suave maq";
cierreBoton.textContent = ca ? "Tanca" : "Cerrar";
cierreBoton.addEventListener("click", () => cierre.close());
cierre.append(cierreSello, cierreTexto, cierreCorreo, cierreBoton);
document.body.appendChild(cierre);
let rangoMostrado = false;
function comprobarRango() {
  if (rangoMostrado || halladas.size < pistas.length) return;
  rangoMostrado = true;
  ponerUV(false);
  cierre.showModal();
  sonar("sello");
}
document.addEventListener("portfolio:pista", comprobarRango);

/* ---------- Terminal secreta: tecla ñ o botón de la cinta ---------- */
const textoDe = (sel) => [...document.querySelectorAll(sel)].map((n) => n.textContent.trim());
const AYUDA = ca
  ? "Ordres: whoami, ls pruebas, ls casos, cat cv, contacto, estado, uv, tema, clear, exit"
  : "Comandos: whoami, ls pruebas, ls casos, cat cv, contacto, estado, uv, tema, clear, exit";
const COMANDOS = {
  ayuda: () => AYUDA,
  help: () => AYUDA,
  whoami: () => document.querySelector(".portada__texto").textContent.trim(),
  "ls pruebas": () => textoDe(".prueba h3").join("\n"),
  "ls casos": () => textoDe(".caso strong").join("\n"),
  "cat cv": () => textoDe(".cadena li").map((t) => t.replace(/\s+/g, " ")).join("\n\n"),
  contacto: () => "antoniacracana@gmail.com\nhttps://github.com/Lorena639",
  estado: () => `${ca ? "Pistes UV" : "Pistas UV"}: ${halladas.size}/${pistas.length}`,
  uv: () => { terminal.close(); ponerUV(!document.body.classList.contains("uv")); return ""; },
  tema: () => { ponerTema(!raizHtml.classList.contains("oscuro")); return "OK"; },
  sudo: () => (ca ? "Aquest incident serà reportat." : "Este incidente será reportado."),
  "rm -rf /": () => (ca ? "Bon intent. La cadena de custòdia ho ha registrat." : "Buen intento. La cadena de custodia lo ha registrado.")
};
const terminal = document.createElement("dialog");
terminal.className = "terminal maq";
terminal.setAttribute("aria-label", ca ? "Terminal" : "Terminal");
const salida = document.createElement("div");
salida.className = "terminal__salida";
salida.setAttribute("aria-live", "polite");
const formLinea = document.createElement("div");
formLinea.className = "terminal__linea";
const prompt = document.createElement("span");
prompt.textContent = "alc@expediente:~$";
const entrada = document.createElement("input");
entrada.setAttribute("aria-label", ca ? "Ordre" : "Comando");
entrada.autocomplete = "off";
entrada.spellcheck = false;
entrada.autocapitalize = "off";
formLinea.append(prompt, entrada);
terminal.append(salida, formLinea);
document.body.appendChild(terminal);
function escribir(texto, clase) {
  const p = document.createElement("p");
  p.textContent = texto;
  if (clase) p.className = clase;
  salida.appendChild(p);
  salida.scrollTop = salida.scrollHeight;
}
entrada.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") { if (e.key.length === 1) sonar("tecla"); return; }
  e.preventDefault(); // si no, este Enter pulsa el botón de la cinta al cerrarse la terminal
  const orden = entrada.value.trim().toLowerCase();
  entrada.value = "";
  if (!orden) return;
  escribir(`$ ${orden}`, "terminal__eco");
  if (orden === "exit") { terminal.close(); return; }
  if (orden === "clear") { salida.replaceChildren(); return; }
  const accion = COMANDOS[orden] || (orden.startsWith("sudo ") ? COMANDOS.sudo : null);
  const resultado = accion ? accion() : (ca ? `Ordre desconeguda: ${orden}. Prova «help».` : `Comando desconocido: ${orden}. Prueba «help».`);
  if (resultado) escribir(resultado);
});
function abrirTerminal() {
  if (terminal.open) return;
  if (!salida.childElementCount) escribir(AYUDA);
  terminal.showModal();
  entrada.focus();
}
botonCinta(">_", ca ? "Obre la terminal" : "Abrir la terminal").addEventListener("click", abrirTerminal);
addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() !== "ñ" || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest("input, textarea, dialog")) return;
  e.preventDefault();
  abrirTerminal();
});

/* ---------- Títulos a máquina y tarjetas que caen sobre la mesa ---------- */
if (!reducido && "IntersectionObserver" in window) {
  const vigiaEntrada = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      // Un título recortado no cuenta como visible: se vigila su contenedor
      (e.target.querySelector(":scope > h2.escribe") || e.target).classList.add("entrado");
      vigiaEntrada.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll("main h2").forEach((h) => { h.classList.add("escribe"); vigiaEntrada.observe(h.parentElement); });
  pruebas.forEach((p, i) => {
    p.classList.add("cae");
    p.style.setProperty("--retardo", `${i * 70}ms`);
    vigiaEntrada.observe(p);
  });
}

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
