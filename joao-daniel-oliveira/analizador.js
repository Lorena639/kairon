/* Analizador de logs: versión en JavaScript de mi analizador en Python.
   Lee líneas en formato de log de acceso (Apache/Nginx "combined"), cuenta peticiones
   por IP y por código de estado, lista los errores y marca posible fuerza bruta. */

import { corte, golpe, tajo } from "./sonido.js?v=1";

const UMBRAL_FUERZA_BRUTA = 5; // 401/403 de una misma IP a partir de los cuales se avisa
// IP, fecha entre corchetes, "MÉTODO RUTA PROTOCOLO", código y tamaño
const LINEA = /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+)[^"]*" (\d{3}) (\S+)/;

const campo = document.getElementById("log");
const informe = document.getElementById("informe");

// Log de ejemplo: tráfico normal, unos errores y una IP probando contraseñas
function crearEjemplo() {
  const rutas = ["/", "/servicios", "/css/styles.css", "/img/logo.png", "/contacto", "/blog/ransomware"];
  const ips = ["192.0.2.14", "198.51.100.23", "192.0.2.88", "198.51.100.5"];
  const lineas = [];
  let segundo = 0;
  const hora = () => { segundo += 7; const m = String(Math.floor(segundo / 60) % 60).padStart(2, "0"); const s = String(segundo % 60).padStart(2, "0"); return `05/Nov/2026:10:${m}:${s} +0100`; };
  const linea = (ip, metodo, ruta, codigo, tam) => lineas.push(`${ip} - - [${hora()}] "${metodo} ${ruta} HTTP/1.1" ${codigo} ${tam}`);
  for (let i = 0; i < 22; i++) linea(ips[i % 4], "GET", rutas[(i * 5) % rutas.length], 200, 1200 + i * 37);
  linea("198.51.100.23", "GET", "/antiguo.html", 404, 312);
  linea("192.0.2.88", "GET", "/wp-admin", 404, 312);
  linea("192.0.2.14", "GET", "/api/estado", 500, 98);
  for (let i = 0; i < 9; i++) linea("203.0.113.7", "POST", "/login", i === 8 ? 403 : 401, 512);
  linea("203.0.113.7", "GET", "/admin", 403, 280);
  for (let i = 0; i < 4; i++) linea(ips[(i + 1) % 4], "GET", rutas[i], i === 2 ? 304 : 200, 900);
  return lineas.join("\n");
}

function analizar(texto) {
  const porIp = new Map();
  const porCodigo = new Map();
  const errores = [];
  const fallosAcceso = new Map();
  let validas = 0, invalidas = 0;
  for (const bruta of texto.split(/\r?\n/)) {
    const l = bruta.trim();
    if (!l) continue;
    const m = LINEA.exec(l);
    if (!m) { invalidas++; continue; }
    validas++;
    const [, ip, fecha, metodo, ruta, codigo] = m;
    porIp.set(ip, (porIp.get(ip) || 0) + 1);
    porCodigo.set(codigo, (porCodigo.get(codigo) || 0) + 1);
    if (codigo >= "400") errores.push({ ip, fecha, metodo, ruta, codigo });
    if (codigo === "401" || codigo === "403") fallosAcceso.set(ip, (fallosAcceso.get(ip) || 0) + 1);
  }
  const sospechosas = [...fallosAcceso].filter(([, n]) => n >= UMBRAL_FUERZA_BRUTA).sort((a, b) => b[1] - a[1]);
  return { validas, invalidas, porIp, porCodigo, errores, sospechosas };
}

// Pequeño ayudante para crear nodos sin innerHTML (el log lo escribe el usuario)
function el(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function barras(titulo, mapa, claseFila) {
  const caja = el("div", "informe__panel");
  caja.appendChild(el("h4", "etiqueta", titulo));
  const filas = [...mapa].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = filas.length ? filas[0][1] : 1;
  const lista = el("ul", "informe__barras");
  filas.forEach(([clave, n], i) => {
    const fila = el("li", claseFila ? claseFila(clave) : "");
    fila.style.setProperty("--ancho", `${(n / max) * 100}%`);
    fila.style.setProperty("--i", i);
    fila.append(el("span", "informe__clave", clave), el("span", "informe__valor", String(n)));
    lista.appendChild(fila);
  });
  caja.appendChild(lista);
  return caja;
}

function pintar(r) {
  informe.replaceChildren();
  if (!r.validas) {
    informe.appendChild(el("p", "informe__vacio", r.invalidas ? `Ninguna de las ${r.invalidas} líneas tiene formato de log de acceso.` : "No hay nada que analizar todavía."));
    return;
  }
  // Veredicto: maldición detectada o santuario limpio
  const veredicto = el("div", `informe__veredicto${r.sospechosas.length ? " informe__veredicto--alerta" : ""}`);
  if (r.sospechosas.length) {
    veredicto.appendChild(el("strong", "", "Maldición detectada"));
    corte({ retardo: 0.1 });
    golpe({ fuerza: 0.7, retardo: 0.1 });
    r.sospechosas.forEach(([ip, n]) => veredicto.appendChild(el("p", "", `${ip} · ${n} accesos denegados (401/403): posible ataque de fuerza bruta.`)));
  } else {
    veredicto.appendChild(el("strong", "", "Santuario limpio"));
    tajo({ fuerza: 0.4 });
    veredicto.appendChild(el("p", "", `Ninguna IP llega a ${UMBRAL_FUERZA_BRUTA} accesos denegados.`));
  }
  informe.appendChild(veredicto);

  const cifras = el("dl", "informe__cifras");
  [["Peticiones", r.validas], ["IP distintas", r.porIp.size], ["Errores", r.errores.length], ["Líneas ignoradas", r.invalidas]].forEach(([t, v]) => {
    const d = el("div");
    d.append(el("dt", "etiqueta", t), el("dd", "", String(v)));
    cifras.appendChild(d);
  });
  informe.appendChild(cifras);

  const sospechosas = new Set(r.sospechosas.map(([ip]) => ip));
  const rejilla = el("div", "informe__rejilla");
  rejilla.append(
    barras("Peticiones por IP", r.porIp, (ip) => (sospechosas.has(ip) ? "es-sospechosa" : "")),
    barras("Por código de estado", r.porCodigo, (c) => `es-${c[0]}xx`)
  );
  informe.appendChild(rejilla);

  if (r.errores.length) {
    const detalles = el("details", "informe__errores");
    detalles.appendChild(el("summary", "", `Ver los ${r.errores.length} errores`));
    const tabla = el("table");
    const cabeza = el("tr");
    ["Código", "IP", "Método", "Ruta", "Fecha"].forEach((t) => cabeza.appendChild(el("th", "", t)));
    tabla.appendChild(el("thead")).appendChild(cabeza);
    const cuerpo = tabla.appendChild(el("tbody"));
    r.errores.slice(0, 200).forEach((e) => {
      const tr = el("tr", sospechosas.has(e.ip) ? "es-sospechosa" : "");
      [e.codigo, e.ip, e.metodo, e.ruta, e.fecha].forEach((v) => tr.appendChild(el("td", "", v)));
      cuerpo.appendChild(tr);
    });
    detalles.appendChild(tabla);
    informe.appendChild(detalles);
  }
}

document.getElementById("analizar").addEventListener("click", () => pintar(analizar(campo.value)));
document.getElementById("ejemplo").addEventListener("click", () => { campo.value = crearEjemplo(); pintar(analizar(campo.value)); });
document.getElementById("archivo").addEventListener("change", async (e) => {
  const archivo = e.target.files[0];
  if (!archivo) return;
  // Se lee en local; se limita a 2 MB para no bloquear la página
  campo.value = (await archivo.slice(0, 2 * 1024 * 1024).text());
  pintar(analizar(campo.value));
  e.target.value = "";
});
