/* Minijuego «Desmantelar»: caen bugs y se cortan arrastrando el ratón o el dedo.
   Canvas 2D, un bucle con requestAnimationFrame y detección de corte por distancia
   de un punto (el bug) a un segmento (el último tramo del trazo). */

const lienzo = document.getElementById("lienzo-juego");
const ctx = lienzo.getContext("2d");
const caja = lienzo.parentElement;
const portada = document.getElementById("portada-juego");
const aviso = document.getElementById("aviso-juego");
const botonEmpezar = document.getElementById("empezar");
const marcador = { puntos: document.getElementById("puntos"), record: document.getElementById("record"), vidas: document.getElementById("vidas") };
const calmado = () => document.documentElement.classList.contains("calma");

const BUGS = ["bug", "404", "NaN", "null", "segfault", "undefined", "SyntaxError", "NullPointer", "loop ∞", "0xDEAD", "TypeError", "500"];
const COLORES = ["#8a0014", "#d90429", "#ff4d00", "#f4f3ef"];

let ancho = 0, alto = 0;
let bugs = [], mitades = [], chispas = [], trazo = [];
let puntos = 0, vidas = 3, jugando = false, ultimo = 0, proximo = 0, ritmo = 1, recargaTeclado = 0;
let record = 0;
try { record = Number(localStorage.getItem("record-desmantelar")) || 0; } catch { /* sin almacenamiento */ }
marcador.record.textContent = record;

function ajustar() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  ancho = caja.clientWidth;
  alto = caja.clientHeight;
  lienzo.width = ancho * dpr;
  lienzo.height = alto * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!jugando) pintar();
}
new ResizeObserver(ajustar).observe(caja);

function nuevoBug() {
  const texto = BUGS[Math.floor(Math.random() * BUGS.length)];
  ctx.font = "600 14px 'IBM Plex Mono', monospace";
  const r = Math.max(26, ctx.measureText(texto).width / 2 + 14);
  bugs.push({
    x: r + Math.random() * (ancho - 2 * r), y: -r, r, texto,
    vy: (40 + Math.random() * 40) * ritmo, vx: (Math.random() - 0.5) * 30,
    giro: (Math.random() - 0.5) * 1.5, angulo: 0
  });
}

// Distancia de un punto al segmento AB: si es menor que el radio, el tajo lo corta
function distancia(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function cortar(bug, angulo) {
  puntos++;
  marcador.puntos.textContent = puntos;
  // Dos mitades que salen despedidas en perpendicular al corte
  const nx = -Math.sin(angulo), ny = Math.cos(angulo);
  [1, -1].forEach((lado) => mitades.push({ ...bug, lado, corte: angulo, vx: nx * lado * 120 + bug.vx, vy: ny * lado * 120 - 60, vida: 1 }));
  const n = calmado() ? 6 : 22;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 260;
    chispas.push({ x: bug.x, y: bug.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1, color: COLORES[i % COLORES.length] });
  }
}

function comprobarCortes(ax, ay, bx, by) {
  const angulo = Math.atan2(by - ay, bx - ax);
  bugs = bugs.filter((b) => {
    if (distancia(b.x, b.y, ax, ay, bx, by) < b.r) { cortar(b, angulo); return false; }
    return true;
  });
}

function dibujarBug(b) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angulo);
  ctx.beginPath();
  ctx.arc(0, 0, b.r, 0, Math.PI * 2);
  ctx.fillStyle = "#1a0307";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#d90429";
  ctx.stroke();
  ctx.fillStyle = "#f4f3ef";
  ctx.font = "600 14px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(b.texto, 0, 1);
  ctx.restore();
}

function pintar() {
  ctx.clearRect(0, 0, ancho, alto);
  bugs.forEach(dibujarBug);
  // Cada mitad: el mismo bug recortado por el semiplano a un lado de la línea de corte
  mitades.forEach((m) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, m.vida);
    ctx.beginPath();
    const c = Math.cos(m.corte), s = Math.sin(m.corte), R = m.r * 3;
    const ox = m.x, oy = m.y;
    ctx.moveTo(ox - c * R, oy - s * R);
    ctx.lineTo(ox + c * R, oy + s * R);
    ctx.lineTo(ox + c * R - s * R * m.lado, oy + s * R + c * R * m.lado);
    ctx.lineTo(ox - c * R - s * R * m.lado, oy - s * R + c * R * m.lado);
    ctx.clip();
    dibujarBug(m);
    ctx.restore();
  });
  chispas.forEach((p) => { ctx.globalAlpha = Math.max(0, p.vida); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 2.4, 2.4); });
  ctx.globalAlpha = 1;
  // Trazo de la hoja: más grueso y brillante en la punta
  if (trazo.length > 1) {
    ctx.lineCap = "round";
    for (let i = 1; i < trazo.length; i++) {
      const f = i / trazo.length;
      ctx.strokeStyle = `rgba(244, 243, 239, ${f})`;
      ctx.shadowColor = "#d90429";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 1 + f * 4;
      ctx.beginPath();
      ctx.moveTo(trazo[i - 1].x, trazo[i - 1].y);
      ctx.lineTo(trazo[i].x, trazo[i].y);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }
}

function paso(t) {
  if (!jugando) return;
  // Pausa mientras la expansión de dominio cubre la pantalla
  if (document.documentElement.classList.contains("en-dominio")) { ultimo = t; requestAnimationFrame(paso); return; }
  const dt = Math.min(0.05, (t - ultimo) / 1000 || 0);
  ultimo = t;
  ritmo += dt * 0.025; // cada vez caen más rápido y más a menudo
  proximo -= dt;
  if (proximo <= 0) { nuevoBug(); proximo = Math.max(0.35, 1.3 / ritmo) * (0.6 + Math.random() * 0.8); }
  recargaTeclado = Math.max(0, recargaTeclado - dt);

  bugs.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; b.angulo += b.giro * dt; if (b.x < b.r || b.x > ancho - b.r) b.vx *= -1; });
  const escapados = bugs.filter((b) => b.y - b.r > alto).length;
  if (escapados) {
    bugs = bugs.filter((b) => b.y - b.r <= alto);
    vidas = Math.max(0, vidas - escapados);
    marcador.vidas.textContent = vidas;
    caja.classList.remove("juego--golpe");
    void caja.offsetWidth;
    caja.classList.add("juego--golpe");
    if (!vidas) return terminar();
  }
  mitades.forEach((m) => { m.x += m.vx * dt; m.y += m.vy * dt; m.vy += 500 * dt; m.angulo += m.giro * 3 * dt; m.vida -= dt * 1.4; });
  mitades = mitades.filter((m) => m.vida > 0);
  chispas.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.vida -= dt * 1.8; });
  chispas = chispas.filter((p) => p.vida > 0);
  const ahora = performance.now();
  trazo = trazo.filter((p) => ahora - p.t < 120);
  pintar();
  requestAnimationFrame(paso);
}

function empezar() {
  bugs = []; mitades = []; chispas = []; trazo = [];
  puntos = 0; vidas = 3; ritmo = 1; proximo = 0.3;
  marcador.puntos.textContent = 0;
  marcador.vidas.textContent = 3;
  portada.hidden = true;
  caja.classList.add("juego--activo");
  jugando = true;
  ultimo = performance.now();
  lienzo.focus({ preventScroll: true });
  requestAnimationFrame(paso);
}

function terminar() {
  jugando = false;
  caja.classList.remove("juego--activo");
  const nuevo = puntos > record;
  if (nuevo) {
    record = puntos;
    marcador.record.textContent = record;
    try { localStorage.setItem("record-desmantelar", String(record)); } catch { /* sin almacenamiento */ }
  }
  aviso.textContent = `${puntos} bugs desmantelados${nuevo ? " · ¡nuevo récord!" : ""}`;
  portada.hidden = false;
  pintar();
}

/* Entrada: puntero (ratón, dedo o lápiz) */
lienzo.addEventListener("pointerdown", (e) => {
  if (!jugando) return;
  lienzo.setPointerCapture(e.pointerId);
  trazo = [{ x: e.offsetX, y: e.offsetY, t: performance.now() }];
});
lienzo.addEventListener("pointermove", (e) => {
  if (!jugando || !trazo.length || !(e.buttons || e.pointerType === "touch")) return;
  const previo = trazo[trazo.length - 1];
  const actual = { x: e.offsetX, y: e.offsetY, t: performance.now() };
  trazo.push(actual);
  comprobarCortes(previo.x, previo.y, actual.x, actual.y);
});
lienzo.addEventListener("pointerup", () => { trazo = []; });

/* Entrada: teclado. Espacio corta en horizontal a la altura del bug más bajo */
addEventListener("keydown", (e) => {
  if (!jugando || e.code !== "Space") return;
  e.preventDefault();
  if (recargaTeclado > 0 || !bugs.length) return;
  recargaTeclado = 1;
  const y = Math.max(...bugs.map((b) => b.y));
  const ahora = performance.now();
  trazo = [{ x: 0, y, t: ahora }, { x: ancho / 2, y, t: ahora }, { x: ancho, y, t: ahora }];
  comprobarCortes(0, y, ancho, y);
});

// Si el juego sale de la pantalla, se acaba la partida para no perder vidas sin verlo
new IntersectionObserver(([e]) => { if (!e.isIntersecting && jugando) terminar(); }, { threshold: 0.3 }).observe(caja);
botonEmpezar.addEventListener("click", empezar);
