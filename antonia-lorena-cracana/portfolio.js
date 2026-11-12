/* Portfolio de Antonia Lorena Cracana: el expediente forense contado como una película.
   Primera mitad: lo que funciona siempre (huella, filtros, SHA-256, glosario, luz UV, terminal...).
   Segunda mitad: el rodaje (GSAP, ScrollTrigger, SplitText, ScrambleText y Lenis), que se puede
   apagar con el botón «Menos movimiento» y se apaga solo si el sistema pide reducir el movimiento. */
const raiz = document.documentElement;
raiz.classList.add("js");

const NS = "http://www.w3.org/2000/svg";
const ca = raiz.lang === "ca";
const $ = (sel, base = document) => base.querySelector(sel);
const $$ = (sel, base = document) => [...base.querySelectorAll(sel)];
const hayGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && typeof SplitText !== "undefined";
const ratonFino = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- Almacenamiento opcional: la página funciona igual sin él ---------- */
const guardado = {
  leer(almacen, clave) { try { return window[almacen].getItem(clave); } catch { return null; } },
  poner(almacen, clave, valor) { try { window[almacen].setItem(clave, valor); } catch { /* sin almacenamiento */ } }
};

/* ---------- Movimiento: manda lo guardado y, si no hay nada, lo que pida el sistema ---------- */
const sistemaQuieto = matchMedia("(prefers-reduced-motion: reduce)");
const movGuardado = guardado.leer("localStorage", "movimiento");
let quieto = movGuardado ? movGuardado === "reducido" : sistemaQuieto.matches;
raiz.classList.toggle("quieto", quieto);

/* ---------- Textos que dependen del idioma ---------- */
const TXT = ca ? {
  distintos: (n) => `${n} de 64 caràcters són diferents dels de l'empremta original.`,
  intacta: "Coincideix amb l'empremta original: la prova està intacta.",
  selloIntacta: "Intacta", selloAlterada: "Alterada",
  sinSello: "Aquest navegador només calcula l'empremta en una pàgina segura (HTTPS).",
  escena: "ESC",
  de: "Un expedient d'", lema: "Tècnica SOC en pràctiques · Rumb a l'anàlisi forense", saltar: "Salta els títols"
} : {
  distintos: (n) => `${n} de 64 caracteres son distintos a los de la huella original.`,
  intacta: "Coincide con la huella original: la prueba está intacta.",
  selloIntacta: "Intacta", selloAlterada: "Alterada",
  sinSello: "Este navegador solo calcula la huella en una página segura (HTTPS).",
  escena: "ESC",
  de: "Un expediente de", lema: "Técnica SOC en prácticas · Rumbo al análisis forense", saltar: "Saltar los títulos"
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

/* ---------- Huella dactilar: crestas generadas, cada una cortada por un sitio distinto ---------- */
function dibujarHuella(svg) {
  for (let i = 0; i < 17; i++) {
    const r = 14 + i * 12;
    const hueco = 0.1 + ((i * 37) % 11) * 0.11;
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
      arco.setAttribute("pathLength", "1"); // así el trazo se anima de 1 a 0 sin medir cada cresta
      svg.appendChild(arco);
    }
  }
  return $$("path", svg);
}
const huella = $("#huella");
const crestasPortada = dibujarHuella(huella);
const huellaSello = $("#huella-sello");
const crestasSello = dibujarHuella(huellaSello);

/* ---------- Claqueta, código de tiempo, avance y escena activa ---------- */
const escenas = $$(".escena");
const claqueta = $("#claqueta");
const tiempo = $("#tiempo");
const progreso = $("#progreso");
const enlacesNav = $$(".panel nav a");
const pistas = $$(".pista");
const claquetaNum = document.createElement("b");
const claquetaTxt = document.createElement("span");
claqueta.append(claquetaNum, " · ", claquetaTxt);
const pantallaAncha = matchMedia("(min-width: 900px)");
const DURACION = 114; // la película dura 114 segundos: un segundo por cada día en el SOC
let escenaActual = -1;
let irisAbierto = false; // en el plató fijado, la ficha no cuenta como escena hasta que el iris se abre
const dos = (n) => String(n).padStart(2, "0");

function medirPelicula() {
  const total = raiz.scrollHeight - innerHeight;
  const avance = total > 0 ? Math.min(Math.max(scrollY / total, 0), 1) : 0;
  progreso.style.transform = `scaleX(${avance})`;
  const cuadros = Math.round(avance * DURACION * 24);
  tiempo.textContent = `00:${dos(Math.floor(cuadros / 1440))}:${dos(Math.floor(cuadros / 24) % 60)}:${dos(cuadros % 24)}`;
  let indice = 0;
  const enPlato = raiz.classList.contains("corte");
  escenas.forEach((e, i) => {
    if (enPlato && e.id === "ficha" && !irisAbierto) return;
    if (e.getBoundingClientRect().top <= innerHeight * 0.5) indice = i;
  });
  if (indice !== escenaActual) cambiarEscena(indice);
}
function cambiarEscena(indice) {
  const primera = escenaActual === -1;
  escenaActual = indice;
  const escena = escenas[indice];
  claquetaNum.textContent = `${TXT.escena} ${dos(indice + 1)}/${dos(escenas.length)}`;
  const texto = pantallaAncha.matches ? escena.dataset.lugar : escena.dataset.escena.toUpperCase();
  if (!quieto && hayGsap && !primera) {
    gsap.to(claquetaTxt, { duration: 0.7, scrambleText: { text: texto, chars: "upperCase", speed: 0.7 }, overwrite: true });
  } else {
    if (hayGsap) gsap.killTweensOf(claquetaTxt);
    claquetaTxt.textContent = texto;
  }
  enlacesNav.forEach((a) => {
    if (a.hash === `#${escena.id}`) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
  pistas.forEach((p) => p.classList.toggle("activa", p.dataset.de === escena.id));
  if (!primera) sonar("claqueta");
  pedirLuz();
}
let medidaPendiente = false;
function pedirMedida() {
  if (medidaPendiente) return;
  medidaPendiente = true;
  requestAnimationFrame(() => { medidaPendiente = false; medirPelicula(); });
}
addEventListener("scroll", pedirMedida, { passive: true });
addEventListener("resize", () => { escenaActual = -1; pedirMedida(); });

/* ---------- Menú de escenas en pantallas estrechas ---------- */
const botonMenu = $("#menu-boton");
const panel = $("#panel");
function ponerMenu(abierto) {
  panel.classList.toggle("abierto", abierto);
  botonMenu.setAttribute("aria-expanded", String(abierto));
}
botonMenu.addEventListener("click", () => ponerMenu(!panel.classList.contains("abierto")));
document.addEventListener("click", (e) => {
  if (!e.target.closest(".barra--sup") || e.target.closest(".panel a")) ponerMenu(false);
});

/* ---------- Pruebas: inclinación, filtro y arrastre con ratón ---------- */
const pruebas = $$(".prueba");
pruebas.forEach((p, i) => p.style.setProperty("--giro", `${[-1.6, 1.2, -0.7, 1.7, -1.1, 0.8, -1.4][i % 7]}deg`));

const filtros = $$(".filtros button");
filtros.forEach((b) => b.addEventListener("click", () => {
  filtros.forEach((o) => { o.classList.toggle("activo", o === b); o.setAttribute("aria-pressed", String(o === b)); });
  pruebas.forEach((p) => {
    p.hidden = b.dataset.f !== "todas" && p.dataset.o !== b.dataset.f;
    p.style.removeProperty("--x");
    p.style.removeProperty("--y");
  });
  if (rodando) {
    // Las tarjetas que aún no habían entrado en plano se muestran ya y se recalcula el travelling
    gsap.set(pruebas, { clearProps: "opacity,visibility,transform" });
    ScrollTrigger.refresh();
  }
}));

if (ratonFino) {
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
const entradaHash = $("#texto-hash");
const salidaHash = $("#hash");
const cambios = $("#cambios");
const veredicto = $("#veredicto");
const textoOriginal = entradaHash.value;
let huellaOriginal = null;
async function sellar() {
  if (!window.crypto?.subtle) { salidaHash.textContent = "—"; cambios.textContent = TXT.sinSello; return; }
  const valor = entradaHash.value;
  const datos = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(valor));
  if (valor !== entradaHash.value) return; // ya se ha escrito otra cosa
  const huellaHex = [...new Uint8Array(datos)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const primera = huellaOriginal === null;
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
  // El tampón: intacta o alterada. Es decorativo; el texto de arriba ya lo anuncia.
  const estado = distintos ? "alterada" : "intacta";
  if (veredicto.dataset.estado !== estado) {
    veredicto.dataset.estado = estado;
    veredicto.textContent = distintos ? TXT.selloAlterada : TXT.selloIntacta;
    veredicto.classList.toggle("alterada", distintos > 0);
    if (!primera) {
      veredicto.classList.remove("golpe");
      void veredicto.offsetWidth; // reinicia la animación del tampón
      veredicto.classList.add("golpe");
      sonar("sello");
    }
  }
}
entradaHash.addEventListener("input", sellar);
$("#restaurar").addEventListener("click", () => { entradaHash.value = textoOriginal; sellar(); });
sellar();

/* ---------- Glosario: definición al pasar, enfocar o tocar ---------- */
const definicion = $("#definicion");
const barraSup = $(".barra--sup");
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
  definicion.style.top = `${arriba > barraSup.offsetHeight + 8 ? arriba : r.bottom + 8}px`;
}
function ocultarDefinicion() {
  terminoActivo?.removeAttribute("aria-describedby");
  terminoActivo = null;
  definicion.hidden = true;
}
$$(".termino").forEach((t) => {
  t.addEventListener("mouseenter", () => mostrarDefinicion(t));
  t.addEventListener("mouseleave", ocultarDefinicion);
  t.addEventListener("focus", () => mostrarDefinicion(t));
  t.addEventListener("blur", ocultarDefinicion);
  t.addEventListener("click", () => mostrarDefinicion(t));
});
addEventListener("scroll", ocultarDefinicion, { passive: true });

/* ---------- Luz ultravioleta: la linterna revela la pista oculta de cada escena ---------- */
const botonUV = $("#uv");
const cuentaUV = $("#uv-cuenta");
const capaUV = $("#uv-capa");
const halladas = new Set();
let luzX = innerWidth / 2, luzY = innerHeight / 2, luzPendiente = false;

function pintarLuz() {
  luzPendiente = false;
  if (!document.body.classList.contains("uv")) return;
  capaUV.style.setProperty("--mx", `${luzX}px`);
  capaUV.style.setProperty("--my", `${luzY}px`);
  pistas.forEach((p) => {
    if (!p.classList.contains("activa")) return;
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
function pedirLuz() { if (!luzPendiente) { luzPendiente = true; requestAnimationFrame(pintarLuz); } }
function moverLuz(x, y) { luzX = x; luzY = y; pedirLuz(); }
addEventListener("pointermove", (e) => moverLuz(e.clientX, e.clientY), { passive: true });
addEventListener("pointerdown", (e) => moverLuz(e.clientX, e.clientY), { passive: true });
addEventListener("touchmove", (e) => moverLuz(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

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
  ponerMenu(false);
});

/* ---------- Luces de la sala: la película es oscura; con luces, las escenas de noche pasan a papel ---------- */
const botonTema = $("#tema");
function ponerLuces(encendidas) {
  raiz.classList.toggle("luces", encendidas);
  botonTema.setAttribute("aria-pressed", String(encendidas));
  guardado.poner("localStorage", "sala", encendidas ? "luces" : "oscura");
}
if (guardado.leer("localStorage", "sala") === "luces") ponerLuces(true);
botonTema.addEventListener("click", () => ponerLuces(!raiz.classList.contains("luces")));

/* ---------- Sonido: apagado por defecto y generado en el navegador ---------- */
const botonSonido = $("#sonido");
let audio = null;
function sonar(tipo) {
  if (!audio) return;
  const osc = audio.createOscillator();
  const vol = audio.createGain();
  const ahora = audio.currentTime;
  const grave = tipo === "sello" || tipo === "claqueta";
  osc.type = grave ? "sine" : "square";
  osc.frequency.setValueAtTime(tipo === "sello" ? 130 : tipo === "claqueta" ? 210 : 1500 + Math.random() * 500, ahora);
  if (grave) osc.frequency.exponentialRampToValueAtTime(tipo === "sello" ? 45 : 90, ahora + 0.16);
  vol.gain.setValueAtTime(tipo === "sello" ? 0.4 : tipo === "claqueta" ? 0.12 : 0.035, ahora);
  vol.gain.exponentialRampToValueAtTime(0.001, ahora + (grave ? 0.2 : 0.03));
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
document.addEventListener("portfolio:pista", () => {
  if (rangoMostrado || halladas.size < pistas.length) return;
  rangoMostrado = true;
  ponerUV(false);
  cierre.showModal();
  sonar("sello");
});

/* ---------- Terminal secreta: tecla ñ o botón de la franja ---------- */
const textoDe = (sel) => $$(sel).map((n) => n.textContent.trim().replace(/\s+/g, " "));
const AYUDA = ca
  ? "Ordres: whoami, ls pruebas, ls casos, cat cv, rumbo, contacto, estado, uv, tema, clear, exit"
  : "Comandos: whoami, ls pruebas, ls casos, cat cv, rumbo, contacto, estado, uv, tema, clear, exit";
const COMANDOS = {
  ayuda: () => AYUDA,
  help: () => AYUDA,
  whoami: () => textoDe(".portada__texto")[0],
  "ls pruebas": () => textoDe(".prueba h3").join("\n"),
  "ls casos": () => textoDe(".caso strong").join("\n"),
  "cat cv": () => textoDe(".cadena li").join("\n\n"),
  rumbo: () => [...textoDe(".rumbo__meta"), ...textoDe(".capitulos li")].join("\n"),
  contacto: () => "antoniacracana@gmail.com\nhttps://github.com/Lorena639",
  estado: () => `${ca ? "Pistes UV" : "Pistas UV"}: ${halladas.size}/${pistas.length}`,
  uv: () => { terminal.close(); ponerUV(!document.body.classList.contains("uv")); return ""; },
  tema: () => { ponerLuces(!raiz.classList.contains("luces")); return "OK"; },
  sudo: () => (ca ? "Aquest incident serà reportat." : "Este incidente será reportado."),
  "rm -rf /": () => (ca ? "Bon intent. La cadena de custòdia ho ha registrat." : "Buen intento. La cadena de custodia lo ha registrado.")
};
const terminal = document.createElement("dialog");
terminal.className = "terminal maq";
terminal.setAttribute("aria-label", "Terminal");
const salida = document.createElement("div");
salida.className = "terminal__salida";
salida.setAttribute("aria-live", "polite");
salida.setAttribute("data-lenis-prevent", "");
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
  e.preventDefault(); // si no, este Enter pulsa el botón de la franja al cerrarse la terminal
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
  ponerMenu(false);
  if (!salida.childElementCount) escribir(AYUDA);
  terminal.showModal();
  entrada.focus();
}
$("#terminal-boton").addEventListener("click", abrirTerminal);
addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() !== "ñ" || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest("input, textarea, dialog")) return;
  e.preventDefault();
  abrirTerminal();
});
// Con un diálogo abierto, la página de detrás no se desplaza
[terminal, cierre].forEach((d) => {
  new MutationObserver(() => { if (d.open) lenis?.stop(); else lenis?.start(); }).observe(d, { attributes: true, attributeFilter: ["open"] });
});

/* ---------- Huella de la portada: las crestas se apartan del ratón ---------- */
if (ratonFino) {
  const crestas = crestasPortada.map((el) => ({
    el,
    puntos: el.getAttribute("d").slice(2).split(" L ").map((p) => p.split(" ").map(Number))
  }));
  const portada = $(".portada");
  let cx = 0, cy = 0, fuerza = 0, objetivo = 0, activo = false;
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
    if (quieto) return;
    const c = new DOMPoint(e.clientX, e.clientY).matrixTransform(huella.getScreenCTM().inverse());
    cx = c.x; cy = c.y; objetivo = 1;
    if (!activo) { activo = true; requestAnimationFrame(deformar); }
  }, { passive: true });
  portada.addEventListener("pointerleave", () => { objetivo = 0; });
}

/* =====================================================================
   EL RODAJE: todo lo que se mueve. Se monta y se desmonta entero, de modo
   que con «Menos movimiento», al imprimir o sin GSAP la página queda quieta
   y completa, tal como está escrita en el HTML.
   ===================================================================== */
let lenis = null;      // desplazamiento suave
let rodaje = null;     // gsap.matchMedia con todas las animaciones
let rodando = false;
let entradaPortada = null;
let titulosActivos = null;
const cifrados = new Map(); // textos que ScrambleText está descifrando, para poder devolverlos intactos
const tic = (t) => lenis?.raf(t * 1000);
const SALIDA = "expo.out";
const RODADOS = ".huella, .huella path, #nombre, .nombre__linea, .portada__ref, .portada__pie, .portada__pie > *, .sello-disp, .ficha, .ficha__marca, .ficha dl > div, #mesa, .cadena li, .carril__avance, .pasos li, .ahora, .sello, .caso > *, #t-rumbo, .rumbo__meta, .rumbo__nota, .capitulos li, .capitulos li > *, .rumbo__base, .franja, .correo, .contacto__enlaces, .reparto > div";

/* Descifra un texto: empieza como ruido y acaba siendo el original */
function cifrar(el, duracion = 0.9, chars = "0123456789ABCDEF") {
  if (!cifrados.has(el)) cifrados.set(el, el.textContent);
  gsap.to(el, { duration: duracion, scrambleText: { text: cifrados.get(el), chars, speed: 0.6 }, overwrite: true });
}

/* Título que sube por detrás de una máscara, palabra a palabra */
function titular(h, desde = "top 88%") {
  SplitText.create(h, {
    type: "lines,words", mask: "lines", linesClass: "renglon", autoSplit: true,
    onSplit: (s) => gsap.from(s.words, {
      yPercent: 118, duration: 1.15, ease: SALIDA, stagger: 0.06,
      scrollTrigger: { trigger: h, start: desde, once: true }
    })
  });
}

function rodar(ancho) {
  const limpiezas = [];
  const arriba = () => `top ${barraSup.offsetHeight}px`;
  raiz.classList.toggle("dolly", ancho);
  raiz.classList.toggle("eslabones", ancho);
  raiz.classList.toggle("teaser", ancho);

  /* --- 01 · Portada: entrada al cargar y, al bajar, la cámara entra en la huella --- */
  const plano = $(".portada__plano");
  const lineas = $$(".nombre__linea");
  const nombre = SplitText.create(lineas, { type: "chars", charsClass: "letra" });
  gsap.set(crestasPortada, { strokeDasharray: 1, strokeDashoffset: 1 });
  entradaPortada = gsap.timeline({ paused: true, defaults: { ease: SALIDA } })
    .from(nombre.chars, { yPercent: 125, duration: 1.3, stagger: 0.028 }, 0)
    .to(crestasPortada, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut", stagger: 0.012 }, 0.1)
    .call(() => cifrar($("#ref"), 1.2, "upperCase"), null, 0.3)
    .from(".portada__pie > *", { y: 34, opacity: 0, duration: 1.1, stagger: 0.12 }, 0.75)
    .from(".sello-disp", { scale: 2.6, opacity: 0, duration: 0.5, ease: "back.out(2.4)" }, 1.7)
    .call(() => sonar("sello"), null, 1.75);

  const centro = () => {
    const h = huella.getBoundingClientRect(), p = plano.getBoundingClientRect();
    return `${((h.left + h.width / 2 - p.left) / p.width * 100).toFixed(1)}% ${((h.top + h.height * 0.5 - p.top) / p.height * 100).toFixed(1)}%`;
  };
  const ficha = $(".ficha");
  const filas = $$(".ficha dl > div");
  // El plató solo se fija si la ficha entera cabe en el encuadre; si no, cada escena va por su cuenta
  raiz.classList.add("corte");
  const relleno = parseFloat(getComputedStyle(ficha).paddingTop) * 2;
  if ($("dl", ficha).offsetHeight + relleno > ficha.clientHeight + 2 || plano.scrollHeight > plano.clientHeight + 2) raiz.classList.remove("corte");
  if (raiz.classList.contains("corte")) {
    let foco = centro();
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".plato", start: arriba, end: ancho ? "+=210%" : "+=170%", pin: true, scrub: 0.5, anticipatePin: 1,
        invalidateOnRefresh: true, onRefreshInit: () => { foco = centro(); }
      },
      // La claqueta pasa a «Ficha» cuando el iris ya ha abierto de verdad (el avance va suavizado)
      onUpdate: () => { const abierto = tl.time() > 0.85; if (abierto !== irisAbierto) { irisAbierto = abierto; pedirMedida(); } }
    });
    tl.to(huella, { scale: ancho ? 3.2 : 2.4, rotation: -10, transformOrigin: "50% 50%", duration: 1, ease: "power2.in" }, 0)
      .to(lineas, { xPercent: (i) => [-16, 12, -9][i], duration: 0.8, ease: "power1.in" }, 0.05)
      .fromTo(["#nombre", ".portada__ref", ".portada__pie"], { opacity: 1 }, { opacity: 0, duration: 0.4, ease: "power1.in", immediateRender: false }, 0.3)
      .fromTo(ficha, { clipPath: () => `circle(0% at ${foco})` }, { clipPath: () => `circle(150% at ${foco})`, duration: 0.6, ease: "power2.in" }, 0.45)
      .fromTo(".ficha__marca", { xPercent: 10 }, { xPercent: -16, duration: 1.4, ease: "none" }, 0.6)
      .from(filas, { y: 60, opacity: 0, duration: 0.45, ease: "power3.out", stagger: 0.14 }, 0.9)
      .to({}, { duration: 0.35 });
    // Con teclado: si el foco entra en la ficha antes de que se abra el iris, la cámara va hasta ella
    const abrirFicha = (e) => {
      const st = tl.scrollTrigger;
      if (irisAbierto || !e.target.matches(":focus-visible")) return;
      const y = st.start + (st.end - st.start) * 0.92;
      if (lenis) lenis.scrollTo(y, { duration: 0.8 }); else scrollTo(0, y);
    };
    ficha.addEventListener("focusin", abrirFicha);
    limpiezas.push(() => { ficha.removeEventListener("focusin", abrirFicha); irisAbierto = false; raiz.classList.remove("corte"); });
  } else {
    gsap.fromTo(".ficha__marca", { xPercent: 6 }, { xPercent: -24, ease: "none", scrollTrigger: { trigger: ficha, start: "top bottom", end: "bottom top", scrub: true } });
    filas.forEach((fila) => {
      gsap.from(fila, { y: 56, opacity: 0, duration: 1.1, ease: SALIDA, scrollTrigger: { trigger: fila, start: "top 90%", once: true, onEnter: () => cifrar($("dt", fila), 0.8, "upperCase") } });
    });
  }

  /* --- 03 · Pruebas: travelling sobre la mesa (ancho) o tarjetas que caen (estrecho) --- */
  titular($("#t-pruebas"));
  const mesa = $("#mesa");
  const visor = $(".mesa-visor");
  if (ancho) {
    const recorrido = () => Math.max(mesa.scrollWidth - visor.clientWidth, 1);
    const travelling = gsap.to(mesa, {
      x: () => -recorrido(), ease: "none",
      scrollTrigger: { trigger: ".pruebas", start: arriba, end: () => `+=${recorrido()}`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
    });
    gsap.from(pruebas, { y: 90, opacity: 0, rotation: (i) => (i % 2 ? 7 : -7), duration: 1.1, ease: SALIDA, stagger: 0.07, scrollTrigger: { trigger: mesa, start: "top 85%", once: true } });
    // Con teclado: al enfocar algo de una tarjeta, la cámara va hasta ella
    const seguirFoco = (e) => {
      const st = travelling.scrollTrigger;
      const tarjeta = e.target.closest(".prueba");
      if (!tarjeta || !st || !e.target.matches(":focus-visible")) return;
      const p = Math.min(Math.max((tarjeta.offsetLeft + tarjeta.offsetWidth / 2 - visor.clientWidth / 2) / recorrido(), 0), 1);
      const y = st.start + p * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { duration: 0.8 }); else scrollTo(0, y);
    };
    mesa.addEventListener("focusin", seguirFoco);
    limpiezas.push(() => mesa.removeEventListener("focusin", seguirFoco));
  } else {
    gsap.set(pruebas, { opacity: 0, y: 60 });
    ScrollTrigger.batch(pruebas, { start: "top 92%", once: true, onEnter: (lote) => gsap.to(lote, { opacity: 1, y: 0, duration: 1, ease: SALIDA, stagger: 0.09 }) });
  }

  /* --- 04 · Cadena de custodia: un eslabón por plano (ancho) o línea de tiempo (estrecho) --- */
  const eslabones = $$(".cadena li");
  if (ancho) {
    // Marcas del carril: el nombre de cada eslabón, con el actual encendido
    const marcas = document.createElement("div");
    marcas.className = "carril__marcas maq";
    marcas.append(...eslabones.map((li) => { const m = document.createElement("span"); m.textContent = $("h3", li).textContent; return m; }));
    $(".carril").append(marcas);
    limpiezas.push(() => marcas.remove());
    const encender = (n) => {
      [...marcas.children].forEach((m, i) => m.classList.toggle("activa", i === n));
      eslabones.forEach((li, i) => li.classList.toggle("en-plano", i === n));
    };
    encender(0);
    gsap.set(eslabones.slice(1), { opacity: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".custodia", start: arriba, end: "+=320%", pin: true, scrub: 0.5, anticipatePin: 1 }, onUpdate: () => encender(Math.min(Math.floor(tl.time() + 0.2), eslabones.length - 1)) });
    eslabones.forEach((li, i) => {
      if (i > 0) {
        tl.fromTo(li, { opacity: 0, yPercent: 16 }, { opacity: 1, yPercent: 0, duration: 0.4, ease: "power2.out" }, i)
          .call(() => cifrar($(".cuando", li), 0.8), null, i + 0.02);
      }
      if (i < eslabones.length - 1) tl.to(li, { opacity: 0, yPercent: -16, duration: 0.4, ease: "power2.in" }, i + 0.6);
    });
    tl.fromTo(".carril__avance", { scaleX: 0.04 }, { scaleX: 1, duration: eslabones.length - 0.6, ease: "none" }, 0)
      .to({}, { duration: 0.4 });
    // Con teclado: al enfocar algo de un eslabón que no está en plano, se va hasta él
    const irAEslabon = (e) => {
      const li = e.target.closest("li");
      const st = tl.scrollTrigger;
      if (!li || li.classList.contains("en-plano") || !e.target.matches(":focus-visible")) return;
      const y = st.start + (st.end - st.start) * ((eslabones.indexOf(li) + 0.45) / tl.duration());
      if (lenis) lenis.scrollTo(y, { duration: 0.8 }); else scrollTo(0, y);
    };
    $(".cadena").addEventListener("focusin", irAEslabon);
    limpiezas.push(() => { $(".cadena").removeEventListener("focusin", irAEslabon); eslabones.forEach((li) => li.classList.remove("en-plano")); });
  } else {
    titular($("#t-custodia"));
    eslabones.forEach((li) => {
      gsap.from(li, { y: 50, opacity: 0, duration: 1.1, ease: SALIDA, scrollTrigger: { trigger: li, start: "top 88%", once: true, onEnter: () => cifrar($(".cuando", li), 0.8) } });
    });
  }

  /* --- 05 · Cómo trabajo: los cuatro pasos, uno tras otro --- */
  titular($("#t-metodo"));
  $$(".pasos li").forEach((li, i) => {
    gsap.timeline({ scrollTrigger: { trigger: li, start: "top 88%", once: true }, delay: ancho ? i * 0.12 : 0, defaults: { ease: SALIDA } })
      .from(li, { "--linea": 0, duration: 1.2 }, 0)
      .from(li, { y: 40, opacity: 0, duration: 1.1 }, 0);
  });
  gsap.from(".ahora", { y: 30, opacity: 0, duration: 1, ease: SALIDA, scrollTrigger: { trigger: ".ahora", start: "top 92%", once: true } });

  /* --- 06 · El sello: apertura en iris desde el negro y una huella que se dibuja al bajar --- */
  gsap.fromTo(".sello", { clipPath: "circle(0vmax at 50% 30vh)" }, { clipPath: "circle(130vmax at 50% 30vh)", ease: "power1.in", scrollTrigger: { trigger: ".sello", start: "top 96%", end: "top 30%", scrub: true } });
  gsap.fromTo(crestasSello, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", stagger: 0.02, scrollTrigger: { trigger: ".sello", start: "top 55%", end: "bottom 85%", scrub: 0.4 } });
  titular($("#t-sello"), "top 70%");

  /* --- 07 · Casos abiertos --- */
  titular($("#t-casos"));
  $$(".caso").forEach((caso) => {
    gsap.from(caso.children, { yPercent: 70, opacity: 0, duration: 1.1, ease: SALIDA, stagger: 0.08, scrollTrigger: { trigger: caso, start: "top 90%", once: true } });
  });

  /* --- 08 · Continuará: las franjas se cierran y los capítulos van entrando --- */
  const capitulos = $$(".capitulos li");
  // El teaser solo se fija si todo cabe entre las dos franjas; si no, la escena baja con normalidad
  const conTeaser = ancho && $(".rumbo__plano").scrollHeight <= $(".rumbo").clientHeight - 2 * $(".franja").offsetHeight - 16;
  raiz.classList.toggle("teaser", conTeaser);
  gsap.fromTo(".franja", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".rumbo", start: "top 75%", end: "top 25%", scrub: true } });
  if (conTeaser) {
    const titulo = $("#t-rumbo");
    // Cuánto hay que bajar el título para que arranque centrado en el encuadre
    const bajar = () => $(".rumbo").clientHeight / 2 - (titulo.offsetTop + titulo.offsetHeight / 2);
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".rumbo", start: arriba, end: "+=170%", pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.fromTo(titulo, { y: bajar, scale: 2.5 }, { y: 0, scale: 1, duration: 1, ease: "power2.inOut" }, 0.35)
      .from(".rumbo__meta", { opacity: 0, y: 30, duration: 0.5, ease: "power2.out" }, 1.05)
      .from(".rumbo__nota", { opacity: 0, y: 20, duration: 0.4, ease: "power2.out" }, 1.3);
    capitulos.forEach((li, i) => {
      tl.from(li, { "--linea": 0, duration: 0.5, ease: "power2.out" }, 1.6 + i * 0.45)
        .from(li.children, { opacity: 0, y: 26, duration: 0.45, ease: "power2.out", stagger: 0.06 }, 1.65 + i * 0.45);
    });
    tl.from(".rumbo__base", { opacity: 0, y: 20, duration: 0.5, ease: "power2.out" }, 3.1)
      .to({}, { duration: 0.5 });
  } else {
    titular($("#t-rumbo"), "top 80%");
    gsap.from([".rumbo__meta", ".rumbo__nota"], { y: 30, opacity: 0, duration: 1, ease: SALIDA, stagger: 0.1, scrollTrigger: { trigger: ".rumbo__meta", start: "top 88%", once: true } });
    capitulos.forEach((li) => {
      gsap.timeline({ scrollTrigger: { trigger: li, start: "top 88%", once: true }, defaults: { ease: SALIDA } })
        .from(li, { "--linea": 0, duration: 1.2 }, 0)
        .from(li.children, { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.05);
    });
    gsap.from(".rumbo__base", { y: 30, opacity: 0, duration: 1, ease: SALIDA, scrollTrigger: { trigger: ".rumbo__base", start: "top 92%", once: true } });
  }
  gsap.fromTo(".franja", { scaleY: 1 }, { scaleY: 0, ease: "none", immediateRender: false, scrollTrigger: { trigger: ".contacto", start: "top 80%", end: "top 35%", scrub: true } });

  /* --- 09 · Escena final y créditos --- */
  titular($("#t-contacto"), "top 75%");
  gsap.from([".correo", ".contacto__enlaces"], { y: 40, opacity: 0, duration: 1.1, ease: SALIDA, stagger: 0.12, scrollTrigger: { trigger: ".correo", start: "top 92%", once: true } });
  titular($(".creditos__fin"), "top 85%");
  gsap.set(".reparto > div", { opacity: 0, y: 30 });
  ScrollTrigger.batch(".reparto > div", { start: "top 94%", once: true, onEnter: (lote) => gsap.to(lote, { opacity: 1, y: 0, duration: 1, ease: SALIDA, stagger: 0.1 }) });
  return limpiezas;
}

/* ---------- Títulos de crédito iniciales: una vez por sesión y siempre saltables ---------- */
function proyectarTitulos() {
  const capa = document.createElement("div");
  capa.className = "titulos";
  const hoja = (lado) => { const d = document.createElement("div"); d.className = `titulos__hoja titulos__hoja--${lado}`; return d; };
  const carton = (...hijos) => { const d = document.createElement("div"); d.className = "titulos__carton"; d.setAttribute("aria-hidden", "true"); d.append(...hijos); return d; };
  const linea = (clase, texto) => { const p = document.createElement("p"); p.className = clase; p.textContent = texto; return p; };
  const cuenta = linea("titulos__cuenta", "3");
  const nombre = linea("titulos__nombre", "Antonia ");
  const cursiva = document.createElement("em");
  cursiva.textContent = "Lorena";
  nombre.append(cursiva, " Cracana");
  const lema = linea("maq", TXT.lema);
  const cartonCuenta = carton(cuenta);
  const cartonNombre = carton(linea("maq", TXT.de), nombre, lema);
  const saltar = document.createElement("button");
  saltar.type = "button";
  saltar.className = "mando maq titulos__saltar";
  saltar.textContent = TXT.saltar;
  const hojas = [hoja("sup"), hoja("inf")];
  capa.append(...hojas, cartonCuenta, cartonNombre, saltar);
  document.body.appendChild(capa);
  lenis?.stop();

  const letras = SplitText.create(nombre, { type: "words,chars", aria: "none" });
  let terminado = false;
  const terminar = () => {
    if (terminado) return;
    terminado = true;
    tl.kill();
    removeEventListener("keydown", porTecla);
    capa.removeEventListener("wheel", terminar);
    capa.removeEventListener("touchmove", terminar);
    capa.remove();
    titulosActivos = null;
    lenis?.start();
    if (entradaPortada && entradaPortada.progress() === 0) entradaPortada.play();
  };
  const porTecla = (e) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); terminar(); } };
  saltar.addEventListener("click", terminar);
  addEventListener("keydown", porTecla);
  capa.addEventListener("wheel", terminar, { passive: true });
  capa.addEventListener("touchmove", terminar, { passive: true });

  const tl = gsap.timeline({ onComplete: terminar });
  tl.set(cartonCuenta, { opacity: 1 })
    .from(cuenta, { scale: 0.7, opacity: 0, duration: 0.25, ease: "power2.out" });
  ["3", "2", "1"].forEach((n, i) => {
    tl.call(() => { cuenta.textContent = n; sonar("tecla"); }, null, 0.1 + i * 0.42)
      .fromTo(cuenta, { rotation: -6 }, { rotation: 0, duration: 0.4, ease: "power2.out" }, 0.1 + i * 0.42);
  });
  tl.set(cartonCuenta, { opacity: 0 }, 1.4)
    .set(cartonNombre, { opacity: 1 }, 1.5)
    .from(cartonNombre.firstElementChild, { opacity: 0, y: 12, duration: 0.6, ease: SALIDA }, 1.5)
    .from(letras.chars, { yPercent: 60, opacity: 0, filter: "blur(10px)", duration: 1.1, ease: SALIDA, stagger: 0.035 }, 1.65)
    .from(lema, { opacity: 0, duration: 0.8 }, 2.5)
    .call(() => cifrar(lema, 0.9, "upperCase"), null, 2.5)
    .to(cartonNombre, { opacity: 0, scale: 1.04, duration: 0.5, ease: "power2.in" }, 4)
    .to(saltar, { opacity: 0, duration: 0.3 }, 4)
    .call(() => entradaPortada?.play(), null, 4.45)
    .to(hojas[0], { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, 4.35)
    .to(hojas[1], { yPercent: 100, duration: 1.1, ease: "expo.inOut" }, 4.35);
  titulosActivos = terminar;
}

/* ---------- Montar y desmontar el rodaje ---------- */
function montar(conTitulos) {
  if (!hayGsap || quieto || rodando) return;
  rodando = true;
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.11, anchors: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tic);
    gsap.ticker.lagSmoothing(0);
  }
  rodaje = gsap.matchMedia();
  rodaje.add({ ancho: "(min-width: 900px) and (min-height: 640px)", estrecho: "(max-width: 899px), (max-height: 639px)" }, (c) => {
    const limpiezas = rodar(c.conditions.ancho);
    // Si la portada ya se había presentado (cambio de tamaño, vuelta de imprimir), no se repite
    if (!conTitulos) entradaPortada.progress(1);
    return () => { limpiezas.forEach((f) => f()); raiz.classList.remove("dolly", "eslabones", "teaser", "corte"); };
  });
  // Los títulos (y la entrada de la portada que va detrás) solo la primera vez de cada sesión
  if (conTitulos && scrollY <= 4 && !guardado.leer("sessionStorage", "titulos")) {
    guardado.poner("sessionStorage", "titulos", "1");
    proyectarTitulos();
  } else if (entradaPortada) {
    entradaPortada.progress(1);
  }
  conTitulos = false;
  document.fonts?.ready.then(() => { if (rodando) ScrollTrigger.refresh(); });
}
function desmontar() {
  if (!rodando) return;
  rodando = false;
  titulosActivos?.();
  rodaje.revert();
  rodaje = null;
  // GSAP deja algún estilo en línea al revertir; se limpia para que mande solo la hoja de estilos
  gsap.set(RODADOS, { clearProps: "all" });
  gsap.set(pruebas, { clearProps: "opacity,visibility,transform,translate,rotate,scale" });
  entradaPortada = null;
  cifrados.forEach((texto, el) => { gsap.killTweensOf(el); el.textContent = texto; });
  cifrados.clear();
  gsap.ticker.remove(tic);
  lenis?.destroy();
  lenis = null;
  raiz.classList.remove("dolly", "eslabones", "teaser", "corte");
}

/* ---------- Botón «Menos movimiento» ---------- */
const botonMov = $("#movimiento");
function ponerQuieto(valor, guardar) {
  quieto = valor;
  raiz.classList.toggle("quieto", quieto);
  botonMov.setAttribute("aria-pressed", String(quieto));
  if (guardar) guardado.poner("localStorage", "movimiento", quieto ? "reducido" : "completo");
  if (quieto) desmontar(); else montar(false);
  escenaActual = -1;
  medirPelicula();
}
botonMov.setAttribute("aria-pressed", String(quieto));
botonMov.addEventListener("click", () => ponerQuieto(!quieto, true));
sistemaQuieto.addEventListener("change", (e) => { if (!guardado.leer("localStorage", "movimiento")) ponerQuieto(e.matches, false); });

/* ---------- Enlaces internos: con desplazamiento suave si se está rodando ---------- */
document.addEventListener("click", (e) => {
  const enlace = e.target.closest('a[href^="#"]');
  if (!enlace || !lenis) return;
  const destino = document.getElementById(enlace.hash.slice(1));
  if (!destino) return;
  e.preventDefault();
  // Una escena fijada vive dentro del hueco que le reserva ScrollTrigger: se va al principio del hueco
  const hueco = destino.closest(".pin-spacer") || destino;
  lenis.scrollTo(hueco, { offset: -barraSup.offsetHeight + 1, duration: 1.4 });
  history.replaceState(null, "", enlace.hash);
  destino.setAttribute("tabindex", "-1");
  destino.focus({ preventScroll: true });
});

/* ---------- Imprimir: el expediente sale en papel, quieto y claro ---------- */
let rodabaAlImprimir = false;
addEventListener("beforeprint", () => { rodabaAlImprimir = rodando; desmontar(); });
addEventListener("afterprint", () => { if (rodabaAlImprimir && !quieto) montar(false); });
$("#imprimir").addEventListener("click", () => print());

/* ---------- Volver a ver los títulos ---------- */
$("#repetir").addEventListener("click", () => {
  if (!rodando) { scrollTo(0, 0); return; }
  lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0);
  entradaPortada.pause(0);
  proyectarTitulos();
});

/* ---------- Acción ---------- */
medirPelicula();
// El rodaje mide textos (qué cabe en cada plano fijo), así que espera a las tipografías; como mucho 1,5 s
const fuentes = ['300 1em "Fraunces"', 'italic 300 1em "Fraunces"', '1em "Instrument Sans"', '1em "Courier Prime"'];
Promise.race([
  Promise.all(fuentes.map((f) => document.fonts?.load(f))).catch(() => {}),
  new Promise((listo) => setTimeout(listo, 1500))
]).then(() => {
  montar(true);
  medirPelicula();
  raiz.classList.remove("telon"); // los títulos ya tapan la pantalla, o no tocaban
});

/* ---------- Fundido de fondo entre escenas ----------
   Una capa fija pinta el fondo. Cuando el borde superior de una escena entra por abajo (85 % de la
   pantalla) empieza a mezclarse su color con el de la anterior, y termina cuando ese borde llega al 25 %.
   Funciona con y sin rodaje (también con «Menos movimiento», porque no es movimiento sino color), y
   relee los colores al encender o apagar las luces. */
(() => {
  const escenas = [...document.querySelectorAll("main .escena, .creditos")];
  if (escenas.length < 2) return;
  const capa = document.createElement("div");
  capa.className = "fondo-cine";
  capa.setAttribute("aria-hidden", "true");
  document.body.prepend(capa);
  raiz.classList.add("fundido");

  const aRgb = (c) => {
    c = c.trim();
    if (c[0] === "#") {
      if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
      return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    }
    const n = c.match(/[\d.]+/g);
    return n ? n.slice(0, 3).map(Number) : [11, 10, 9];
  };
  let colores = [];
  const leerColores = () => { colores = escenas.map((e) => aRgb(getComputedStyle(e).getPropertyValue("--fondo"))); };
  const suave = (t) => t * t * (3 - 2 * t);

  let pendiente = false;
  function pintar() {
    pendiente = false;
    const alto = innerHeight;
    let [r, g, b] = colores[0];
    const velo = escenas.map(() => 1);
    for (let i = 1; i < escenas.length; i++) {
      const arriba = escenas[i].getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (alto * 0.85 - arriba) / (alto * 0.6)));
      if (p <= 0) break;
      const k = suave(p), c = colores[i];
      r += (c[0] - r) * k; g += (c[1] - g) * k; b += (c[2] - b) * k;
      // Fundido encadenado: lo que queda arriba de la escena que se va se desvanece con su fondo,
      // para que su texto claro no quede a medias sobre el papel (o al revés)
      velo[i - 1] = 1 - 0.9 * k;
    }
    escenas.forEach((e, i) => {
      // filter (no opacity) para no pisar las opacidades que anima GSAP; se quita del todo si no hace falta,
      // porque un filter convierte la sección en contenedor de los elementos fijados
      const fijado = e.style.position === "fixed" || e.querySelector('[style*="position: fixed"]');
      const valor = velo[i] < 0.995 && !fijado ? `opacity(${velo[i].toFixed(3)})` : "";
      if (e.style.filter !== valor) e.style.filter = valor;
    });
    capa.style.backgroundColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };

  leerColores();
  pintar();
  addEventListener("scroll", pedir, { passive: true });
  addEventListener("resize", pedir);
  new MutationObserver(() => { leerColores(); pedir(); }).observe(raiz, { attributes: true, attributeFilter: ["class"] });
})();
