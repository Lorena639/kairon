/* Laboratorio: cuatro programas pequeños que se ejecutan en el navegador.
   1. Analizador de logs (versión JS de mi analizador en Python)
   2. Encuentra el bug
   3. Playground de expresiones regulares
   4. Del Luau al juego (un script de Roblox y lo que hace) */

import { t, idioma, alCambiarIdioma } from "./i18n.js";
import { resaltar, pintar, fichas } from "./sintaxis.js";
import * as sonido from "./sonido.js";

const $ = (s) => document.querySelector(s);

/** Crea un nodo con texto (nunca innerHTML con lo que escribe el usuario). */
function el(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

/* ================= 1. Analizador de logs ================= */
const UMBRAL = 5; // 401/403 de una misma IP a partir de los cuales se avisa
// IP, fecha, "MÉTODO RUTA PROTOCOLO", código y tamaño (formato combined de Apache/Nginx)
const FORMATO = /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+)[^"]*" (\d{3}) (\S+)/;

function logDeEjemplo() {
  const rutas = ["/", "/servicios", "/css/styles.css", "/img/logo.png", "/contacto", "/blog/ransomware"];
  const ips = ["192.0.2.14", "198.51.100.23", "192.0.2.88", "198.51.100.5"];
  const lineas = [];
  let s = 0;
  const hora = () => { s += 7; return `05/Nov/2026:10:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")} +0100`; };
  const linea = (ip, m, r, c, b) => lineas.push(`${ip} - - [${hora()}] "${m} ${r} HTTP/1.1" ${c} ${b}`);
  for (let i = 0; i < 14; i++) linea(ips[i % 4], "GET", rutas[(i * 5) % rutas.length], 200, 1200 + i * 37);
  linea("198.51.100.23", "GET", "/antiguo.html", 404, 312);
  linea("192.0.2.88", "GET", "/wp-admin", 404, 312);
  linea("192.0.2.14", "GET", "/api/estado", 500, 98);
  for (let i = 0; i < 9; i++) linea("203.0.113.7", "POST", "/login", i === 8 ? 403 : 401, 512);
  linea("203.0.113.7", "GET", "/admin", 403, 280);
  for (let i = 0; i < 3; i++) linea(ips[(i + 1) % 4], "GET", rutas[i], i === 1 ? 304 : 200, 900);
  return lineas.join("\n");
}

function analizar(texto) {
  const porIp = new Map(), porCodigo = new Map(), denegados = new Map();
  const errores = [];
  let validas = 0, invalidas = 0;
  for (const bruta of texto.split(/\r?\n/)) {
    const l = bruta.trim();
    if (!l) continue;
    const m = FORMATO.exec(l);
    if (!m) { invalidas++; continue; }
    validas++;
    const [, ip, , metodo, ruta, codigo] = m;
    porIp.set(ip, (porIp.get(ip) || 0) + 1);
    porCodigo.set(codigo, (porCodigo.get(codigo) || 0) + 1);
    if (codigo >= "400") errores.push([codigo, ip, metodo, ruta]);
    if (codigo === "401" || codigo === "403") denegados.set(ip, (denegados.get(ip) || 0) + 1);
  }
  const sospechosas = [...denegados].filter(([, n]) => n >= UMBRAL).sort((a, b) => b[1] - a[1]);
  return { validas, invalidas, porIp, porCodigo, errores, sospechosas };
}

// Barras de texto, como en una impresión de consola: "#" proporcionales al máximo
function barras(titulo, mapa, alerta) {
  const caja = el("div");
  caja.appendChild(el("p", "campo__etiqueta", titulo));
  const filas = [...mapa].sort((a, b) => b[1] - a[1]).slice(0, 7);
  const max = filas[0]?.[1] || 1;
  const lista = el("ul", "informe__barras");
  filas.forEach(([clave, n]) => {
    const li = el("li", alerta(clave) ? "es-alerta" : "");
    li.append(el("span", "", clave), el("span", "informe__barra", "#".repeat(Math.max(1, Math.round((n / max) * 16)))), el("span", "", String(n)));
    lista.appendChild(li);
  });
  caja.appendChild(lista);
  return caja;
}

let ultimoInforme = null;
function pintarInforme(r, silencio = false) {
  ultimoInforme = r;
  const informe = $("#informe");
  informe.replaceChildren();
  if (!r) return;
  if (!r.validas) {
    informe.appendChild(el("p", "", r.invalidas ? t("ana.formato", r.invalidas) : t("ana.vacio")));
    return;
  }
  const alerta = r.sospechosas.length > 0;
  const veredicto = el("div", `informe__veredicto${alerta ? " informe__veredicto--alerta" : ""}`);
  veredicto.appendChild(el("strong", "", alerta ? t("ana.alerta") : t("ana.limpio")));
  if (alerta) r.sospechosas.forEach(([ip, n]) => veredicto.appendChild(el("p", "", t("ana.alertaDet", ip, n))));
  else veredicto.appendChild(el("p", "", t("ana.limpioDet", UMBRAL)));
  const cifras = el("p", "informe__cifras");
  [[r.validas, "ana.peticiones"], [r.porIp.size, "ana.ips"], [r.errores.length, "ana.errores"], [r.invalidas, "ana.ignoradas"]].forEach(([n, clave]) => {
    const s = el("span");
    s.append(el("b", "", String(n)), document.createTextNode(` ${t(clave)}`));
    cifras.appendChild(s);
  });
  const sospechosas = new Set(r.sospechosas.map(([ip]) => ip));
  const columnas = el("div", "informe__columnas");
  columnas.append(barras(t("ana.porIp"), r.porIp, (ip) => sospechosas.has(ip)), barras(t("ana.porCodigo"), r.porCodigo, (c) => c === "401" || c === "403"));
  informe.append(veredicto, cifras, columnas);
  if (r.errores.length) {
    const det = el("details");
    det.appendChild(el("summary", "", t("ana.verErrores", r.errores.length)));
    const marco = el("div", "informe__tabla");
    const tabla = el("table");
    const cab = tabla.createTHead().insertRow();
    t("ana.cols").forEach((c) => cab.appendChild(el("th", "", c)));
    const cuerpo = tabla.createTBody();
    r.errores.slice(0, 200).forEach((fila) => { const tr = cuerpo.insertRow(); fila.forEach((v) => tr.appendChild(el("td", "", v))); });
    marco.appendChild(tabla);
    det.appendChild(marco);
    informe.appendChild(det);
  }
  if (!silencio) alerta ? sonido.error() : sonido.ok();
}

function iniciarAnalizador() {
  const campo = $("#log");
  $("#analizar").addEventListener("click", () => pintarInforme(analizar(campo.value)));
  $("#ejemplo").addEventListener("click", () => { campo.value = logDeEjemplo(); pintarInforme(analizar(campo.value)); });
  $("#archivo").addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    campo.value = await archivo.slice(0, 2 * 1024 * 1024).text(); // se lee en local; máximo 2 MB
    pintarInforme(analizar(campo.value));
    e.target.value = "";
  });
  alCambiarIdioma(() => { if (ultimoInforme) pintarInforme(ultimoInforme, true); });
}

/* ================= 2. Encuentra el bug ================= */
const BUGS = [
  {
    lenguaje: "Python",
    codigo: `def media(notas):
    total = 0
    for i in range(1, len(notas)):
        total += notas[i]
    return total / len(notas)

print(media([7, 8, 10]))  # 8.33?`,
    culpable: 2,
    explicacion: {
      es: "<code>range(1, len(notas))</code> empieza en 1 y se salta la primera nota, así que imprime 6.0 en vez de 8.33. Arreglo: <code>for nota in notas:</code>, o directamente <code>sum(notas) / len(notas)</code>.",
      en: "<code>range(1, len(notas))</code> starts at 1 and skips the first grade, so it prints 6.0 instead of 8.33. Fix: <code>for nota in notas:</code>, or simply <code>sum(notas) / len(notas)</code>.",
      pt: "<code>range(1, len(notas))</code> começa em 1 e salta a primeira nota, por isso imprime 6.0 em vez de 8.33. Correção: <code>for nota in notas:</code>, ou simplesmente <code>sum(notas) / len(notas)</code>."
    }
  },
  {
    lenguaje: "JavaScript",
    codigo: `function puedeVotar(edad) {
  if (edad = 18) {
    return true;
  }
  return edad > 18;
}
console.log(puedeVotar(15)); // true?!`,
    culpable: 1,
    explicacion: {
      es: "<code>edad = 18</code> asigna en vez de comparar: la condición vale 18, que cuenta como verdadero, y la función siempre devuelve true. Arreglo: todo el <code>if</code> sobra con <code>return edad >= 18;</code> (y para comparar, <code>===</code>).",
      en: "<code>edad = 18</code> assigns instead of comparing: the condition evaluates to 18, which is truthy, so the function always returns true. Fix: replace the whole <code>if</code> with <code>return edad >= 18;</code> (and use <code>===</code> to compare).",
      pt: "<code>edad = 18</code> atribui em vez de comparar: a condição vale 18, que conta como verdadeiro, e a função devolve sempre true. Correção: o <code>if</code> inteiro sobra com <code>return edad >= 18;</code> (e para comparar, <code>===</code>)."
    }
  },
  {
    lenguaje: "Luau",
    codigo: `local monedas = {5, 10, 20}
for i = 0, #monedas do
  print(monedas[i] * 2)
end`,
    culpable: 1,
    explicacion: {
      es: "En Luau las tablas empiezan en 1, no en 0: <code>monedas[0]</code> es <code>nil</code> y multiplicarlo da error en la primera vuelta. Arreglo: <code>for i = 1, #monedas do</code>, o <code>for _, m in ipairs(monedas) do</code>.",
      en: "In Luau, tables start at 1, not 0: <code>monedas[0]</code> is <code>nil</code> and multiplying it throws on the first iteration. Fix: <code>for i = 1, #monedas do</code>, or <code>for _, m in ipairs(monedas) do</code>.",
      pt: "Em Luau as tabelas começam em 1, não em 0: <code>monedas[0]</code> é <code>nil</code> e multiplicá-lo dá erro na primeira volta. Correção: <code>for i = 1, #monedas do</code>, ou <code>for _, m in ipairs(monedas) do</code>."
    }
  }
];

let bugActual = 0;
let bugResuelto = false;
function pintarBug() {
  const caja = $("#bug-codigo");
  const bug = BUGS[bugActual];
  bugResuelto = false;
  $("#bug-respuesta").replaceChildren();
  caja.replaceChildren();
  bug.codigo.split("\n").forEach((texto, i) => {
    const b = el("button", "bug__linea");
    b.type = "button";
    b.innerHTML = pintar(fichas(texto, bug.lenguaje)) || " "; // código propio, no del usuario
    b.addEventListener("click", () => elegirLinea(i, b));
    caja.appendChild(b);
  });
}

function respuestaBug(i) {
  const bug = BUGS[bugActual];
  const r = $("#bug-respuesta");
  r.replaceChildren();
  if (i === bug.culpable) {
    r.appendChild(el("strong", "", t("bug.encontrado")));
    const p = el("p");
    p.innerHTML = bug.explicacion[idioma()]; // texto propio con <code>
    r.appendChild(p);
  } else {
    r.appendChild(el("strong", "", t("bug.bien")));
    r.appendChild(el("p", "", t("bug.pista")));
  }
}

let ultimaElegida = -1;
function elegirLinea(i, boton) {
  ultimaElegida = i;
  const bug = BUGS[bugActual];
  if (i === bug.culpable) {
    bugResuelto = true;
    boton.classList.add("bug__linea--culpable");
    sonido.ok();
  } else if (!bugResuelto) {
    boton.classList.add("bug__linea--bien");
    sonido.error();
  }
  respuestaBug(i);
}

function iniciarBug() {
  pintarBug();
  $("#bug-siguiente").addEventListener("click", () => { bugActual = (bugActual + 1) % BUGS.length; ultimaElegida = -1; pintarBug(); });
  alCambiarIdioma(() => { if (ultimaElegida >= 0) respuestaBug(ultimaElegida); });
}

/* ================= 3. Playground de expresiones regulares ================= */
const LINEAS_REGEX = logDeEjemplo().split("\n").filter((_, i) => i % 2 === 0 || i > 14).slice(0, 14);

function probarRegex() {
  const campo = $("#rx-patron");
  const cuenta = $("#rx-cuenta");
  const lista = $("#rx-lineas");
  let re = null;
  try { re = new RegExp(campo.value, "g"); campo.removeAttribute("aria-invalid"); }
  catch (e) {
    campo.setAttribute("aria-invalid", "true");
    cuenta.textContent = t("rx.error", e.message.replace(/^Invalid regular expression: /, ""));
    cuenta.classList.add("regex__cuenta--error");
    return;
  }
  cuenta.classList.remove("regex__cuenta--error");
  let coinciden = 0;
  lista.replaceChildren();
  LINEAS_REGEX.forEach((linea) => {
    const li = el("li");
    let ultimo = 0, hubo = false;
    if (campo.value) {
      for (const m of linea.matchAll(re)) {
        if (m[0] === "") continue; // evita bucles con patrones vacíos
        hubo = true;
        li.append(document.createTextNode(linea.slice(ultimo, m.index)), el("mark", "", m[0]));
        ultimo = m.index + m[0].length;
      }
    }
    li.append(document.createTextNode(linea.slice(ultimo)));
    if (hubo) { li.classList.add("coincide"); coinciden++; }
    lista.appendChild(li);
  });
  cuenta.textContent = t("rx.coinciden", coinciden, LINEAS_REGEX.length);
  document.querySelectorAll("#regex .chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.patron === campo.value)));
}

function iniciarRegex() {
  const campo = $("#rx-patron");
  campo.addEventListener("input", probarRegex);
  document.querySelectorAll("#regex .chip").forEach((c) => c.addEventListener("click", () => { campo.value = c.dataset.patron; probarRegex(); sonido.tecla(); }));
  probarRegex();
  alCambiarIdioma(probarRegex);
}

/* ================= 4. Del Luau al juego ================= */
const SCRIPT_LUAU = `local coin = script.Parent
local VALUE = 5

coin.Touched:Connect(function(part)
  local player = game.Players:GetPlayerFromCharacter(part.Parent)
  if player then
    player.leaderstats.Coins.Value += VALUE
    coin:Destroy()
  end
end)`;
const PASOS_AL_TOCAR = [3, 4, 5, 6, 7]; // líneas (desde 0) que se ejecutan al tocar la moneda

function iniciarLuau() {
  const pre = $("#lu-codigo");
  pre.innerHTML = resaltar(SCRIPT_LUAU, "Luau");
  const lineas = pre.querySelectorAll(".l");
  const iluminar = (indices, separacion = 110) => indices.forEach((n, k) => setTimeout(() => {
    lineas[n].classList.add("l--ejecuta");
    setTimeout(() => lineas[n].classList.remove("l--ejecuta"), 420);
  }, k * separacion));

  const lienzo = $("#lu-lienzo");
  const c = lienzo.getContext("2d");
  const W = 360, H = 240;
  const css = getComputedStyle(document.documentElement);
  const color = (v) => css.getPropertyValue(v).trim();
  const jugador = { x: 60, y: H / 2, lado: 22 };
  const moneda = { x: 260, y: 90, r: 10, viva: true };
  const teclas = new Set();
  let objetivo = null, monedas = 0, animando = false, ultimo = 0;

  function ajustar() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    dibujar();
  }
  function dibujar() {
    c.fillStyle = color("--papel"); c.fillRect(0, 0, W, H);
    c.fillStyle = color("--linea"); // rejilla de puntos, como la placa base de Roblox
    for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) c.fillRect(x, y, 2, 2);
    if (moneda.viva) {
      c.beginPath(); c.arc(moneda.x, moneda.y, moneda.r, 0, Math.PI * 2);
      c.fillStyle = color("--amarillo"); c.fill();
      c.lineWidth = 2; c.strokeStyle = color("--tinta"); c.stroke();
    }
    c.fillStyle = color("--tinta");
    c.fillRect(jugador.x - jugador.lado / 2, jugador.y - jugador.lado / 2, jugador.lado, jugador.lado);
    c.fillStyle = color("--papel"); // ojos
    c.fillRect(jugador.x - 6, jugador.y - 4, 3, 4); c.fillRect(jugador.x + 3, jugador.y - 4, 3, 4);
  }
  function nuevaMoneda() {
    moneda.x = 30 + Math.random() * (W - 60);
    moneda.y = 30 + Math.random() * (H - 60);
    if (Math.hypot(moneda.x - jugador.x, moneda.y - jugador.y) < 60) return nuevaMoneda();
    moneda.viva = true;
    dibujar();
  }
  function paso(ahora) {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000 || 0.016);
    ultimo = ahora;
    let dx = 0, dy = 0;
    if (teclas.has("left")) dx -= 1; if (teclas.has("right")) dx += 1;
    if (teclas.has("up")) dy -= 1; if (teclas.has("down")) dy += 1;
    if (objetivo) { dx = objetivo.x - jugador.x; dy = objetivo.y - jugador.y; if (Math.hypot(dx, dy) < 3) dx = dy = 0; }
    const largo = Math.hypot(dx, dy);
    if (largo > 0) {
      jugador.x = Math.min(W - 11, Math.max(11, jugador.x + (dx / largo) * 160 * dt));
      jugador.y = Math.min(H - 11, Math.max(11, jugador.y + (dy / largo) * 160 * dt));
    }
    if (moneda.viva && Math.abs(jugador.x - moneda.x) < jugador.lado / 2 + moneda.r && Math.abs(jugador.y - moneda.y) < jugador.lado / 2 + moneda.r) {
      moneda.viva = false; // coin.Touched -> GetPlayerFromCharacter -> if player -> += VALUE -> Destroy
      monedas += 5;
      $("#lu-monedas").textContent = String(monedas);
      sonido.moneda();
      iluminar(PASOS_AL_TOCAR);
      setTimeout(nuevaMoneda, 700);
    }
    dibujar();
    if (teclas.size || objetivo) requestAnimationFrame(paso); else animando = false;
  }
  function mover() { if (!animando) { animando = true; ultimo = performance.now(); requestAnimationFrame(paso); } }

  const MAPA = { ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right", ArrowUp: "up", w: "up", ArrowDown: "down", s: "down" };
  lienzo.addEventListener("keydown", (e) => { const d = MAPA[e.key] || MAPA[e.key.toLowerCase()]; if (d) { e.preventDefault(); teclas.add(d); objetivo = null; mover(); } });
  lienzo.addEventListener("keyup", (e) => { const d = MAPA[e.key] || MAPA[e.key.toLowerCase()]; if (d) teclas.delete(d); });
  lienzo.addEventListener("blur", () => teclas.clear());
  const aLienzo = (e) => { const r = lienzo.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
  lienzo.addEventListener("pointerdown", (e) => { lienzo.setPointerCapture(e.pointerId); objetivo = aLienzo(e); mover(); });
  lienzo.addEventListener("pointermove", (e) => { if (objetivo) objetivo = aLienzo(e); });
  const soltar = () => { objetivo = null; };
  lienzo.addEventListener("pointerup", soltar);
  lienzo.addEventListener("pointercancel", soltar);

  ajustar();
  iluminar([0, 1], 160); // al cargar se ejecutan las dos primeras líneas
}

export function iniciarLaboratorio() {
  iniciarAnalizador();
  iniciarBug();
  iniciarRegex();
  iniciarLuau();
}
