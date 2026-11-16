/* La cueva: portada jugable del portfolio.
   - Mapa de 24×14 casillas de 16 px, dibujado en un lienzo a escala entera (píxel nítido).
   - El jugador se mueve con flechas/WASD o tocando/clicando un punto; choca con paredes y agua.
   - Todo está a oscuras salvo el farol del jugador, los cristales y los seis objetos que brillan.
   - Al acercarse a un objeto y pulsar E/Intro/Espacio (o tocarlo) se abre un cuadro de diálogo
     que lleva a su sección de la página. */

import { JUGADOR, OBJETOS, DECORADO, aLienzo, PALETA } from "./sprites.js";
import { t, alCambiarIdioma } from "./i18n.js";
import * as sonido from "./sonido.js";

const T = 16; // tamaño de casilla en píxeles lógicos
const MAPA = [
  "########################",
  "##....*....#####...*..##",
  "#..E......##...##...C..#",
  "#.....m...#.......m....#",
  "#*........#...~~.......#",
  "##...........~~~~....*.#",
  "#.....##.....~~~.......#",
  "#..M..##...@........L..#",
  "#.....#..........#.....#",
  "#*.........m....###....#",
  "#....*.......*...#..*..#",
  "#..A.....##..........H.#",
  "##.....m.##....*.....###",
  "########################"
];
const COLS = MAPA[0].length, FILAS = MAPA.length;
const W = COLS * T, H = FILAS * T;

// Objeto de cada letra: sprite, sección a la que lleva y color de su luz
const DESTINOS = {
  E: { sprite: "espejo", id: "ficha", luz: "#9fe8ff" },
  C: { sprite: "cofre", id: "inventario", luz: "#ffbf5a" },
  M: { sprite: "tablon", id: "misiones", luz: "#ece8ff" },
  L: { sprite: "caldero", id: "taller", luz: "#5ef2d0" },
  A: { sprite: "arbol", id: "progreso", luz: "#b48cff" },
  H: { sprite: "hoguera", id: "contacto", luz: "#ff8a3d" }
};

export function iniciarCueva({ calmado, irA }) {
  const lienzo = document.getElementById("cueva");
  if (!lienzo) return;
  const c = lienzo.getContext("2d");
  const caja = document.getElementById("dialogo");
  const titulo = document.getElementById("dialogo-titulo");
  const texto = document.getElementById("dialogo-texto");
  const botonIr = document.getElementById("dialogo-ir");
  const botonSeguir = document.getElementById("dialogo-seguir");
  const aviso = document.getElementById("cueva-aviso");

  // Lienzos de los sprites (una vez)
  const sprites = {
    abajo: JUGADOR.abajo.map((f) => aLienzo(f)),
    arriba: JUGADOR.arriba.map((f) => aLienzo(f)),
    izquierda: JUGADOR.lado.map((f) => aLienzo(f)),
    derecha: JUGADOR.lado.map((f) => aLienzo(f, true))
  };
  const objetos = Object.fromEntries(Object.entries(OBJETOS).map(([n, f]) => [n, aLienzo(f)]));
  const decor = Object.fromEntries(Object.entries(DECORADO).map(([n, f]) => [n, aLienzo(f)]));

  // Escena estática (suelo, paredes, agua) pintada una vez en un lienzo aparte
  const fondo = document.createElement("canvas");
  fondo.width = W; fondo.height = H;
  const f = fondo.getContext("2d");
  let semilla = 7;
  const azar = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
  const cosas = []; // objetos y decoración con su luz
  let inicio = { x: W / 2, y: H / 2 };
  MAPA.forEach((fila, y) => [...fila].forEach((ch, x) => {
    const px = x * T, py = y * T;
    if (ch === "#") {
      const abajoLibre = MAPA[y + 1]?.[x] && MAPA[y + 1][x] !== "#";
      f.fillStyle = PALETA.i; f.fillRect(px, py, T, T);
      if (abajoLibre) { // cara visible de la pared
        f.fillStyle = PALETA.r; f.fillRect(px, py + 6, T, 10);
        f.fillStyle = PALETA.R; f.fillRect(px, py + 6, T, 2);
        for (let i = 0; i < 3; i++) { f.fillStyle = PALETA.k; f.fillRect(px + Math.floor(azar() * 14), py + 9 + Math.floor(azar() * 6), 2, 1); }
      }
      return;
    }
    // Suelo de roca con motas
    f.fillStyle = "#1b1830"; f.fillRect(px, py, T, T);
    for (let i = 0; i < 4; i++) { f.fillStyle = azar() > 0.5 ? "#231f3a" : "#15122a"; f.fillRect(px + Math.floor(azar() * 15), py + Math.floor(azar() * 15), 1 + Math.floor(azar() * 2), 1); }
    if (ch === "~") {
      f.fillStyle = "#123a46"; f.fillRect(px, py, T, T);
      f.fillStyle = "#1d5a63"; f.fillRect(px + 2 + Math.floor(azar() * 8), py + 4 + Math.floor(azar() * 8), 4, 1);
      cosas.push({ x: px + 8, y: py + 8, luz: "#5ef2d0", radio: 20, fuerza: 0.35 });
    }
    if (ch === "*") cosas.push({ x: px + 8, y: py + 8, sprite: decor.cristal, luz: "#5ef2d0", radio: 30, fuerza: 0.7 });
    if (ch === "m") cosas.push({ x: px + 8, y: py + 8, sprite: decor.seta, luz: "#b48cff", radio: 24, fuerza: 0.55 });
    if (DESTINOS[ch]) {
      const d = DESTINOS[ch];
      cosas.push({ x: px + 8, y: py + 8, sprite: objetos[d.sprite], luz: d.luz, radio: 40, fuerza: 1, destino: d, letra: ch });
    }
    if (ch === "@") inicio = { x: px + 8, y: py + 10 };
  }));

  const solido = (x, y) => {
    const ch = MAPA[Math.floor(y / T)]?.[Math.floor(x / T)];
    return !ch || ch === "#" || ch === "~" || DESTINOS[ch] !== undefined;
  };
  // Caja de colisión en los pies del personaje (10×6)
  const choca = (x, y) => solido(x - 5, y - 3) || solido(x + 5, y - 3) || solido(x - 5, y + 3) || solido(x + 5, y + 3);

  /* Camino más corto por casillas (búsqueda en anchura) para ir a donde se toca rodeando paredes y agua */
  const libre = (cx, cy) => { const ch = MAPA[cy]?.[cx]; return ch !== undefined && ch !== "#" && ch !== "~" && DESTINOS[ch] === undefined; };
  function camino(desde, hasta) {
    const clave = (x, y) => y * COLS + x;
    const origen = { x: Math.floor(desde.x / T), y: Math.floor(desde.y / T) };
    // Si el destino no es pisable, se busca la casilla libre más cercana a él
    let meta = { x: Math.floor(hasta.x / T), y: Math.floor(hasta.y / T) };
    if (!libre(meta.x, meta.y)) {
      let mejor = null, dist = Infinity;
      for (let y = 0; y < FILAS; y++) for (let x = 0; x < COLS; x++) {
        if (!libre(x, y)) continue;
        const d = Math.hypot(x - meta.x, y - meta.y);
        if (d < dist) { dist = d; mejor = { x, y }; }
      }
      if (!mejor) return [];
      meta = mejor;
    }
    const previo = new Map([[clave(origen.x, origen.y), null]]);
    const cola = [origen];
    while (cola.length) {
      const n = cola.shift();
      if (n.x === meta.x && n.y === meta.y) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const v = { x: n.x + dx, y: n.y + dy };
        if (!libre(v.x, v.y) || previo.has(clave(v.x, v.y))) continue;
        previo.set(clave(v.x, v.y), n);
        cola.push(v);
      }
    }
    if (!previo.has(clave(meta.x, meta.y))) return [];
    const ruta = [];
    for (let n = meta; n; n = previo.get(clave(n.x, n.y))) ruta.unshift({ x: n.x * T + 8, y: n.y * T + 10 });
    ruta.shift(); // la casilla de salida
    return ruta;
  }

  const jugador = { x: inicio.x, y: inicio.y, dir: "abajo", paso: 0, anda: false };
  let ruta = [];
  const teclas = new Set();
  let objetivo = null; // punto al que camina tras tocar la pantalla
  let pendiente = null; // objeto que se abrirá al llegar
  let cerca = null;
  let abierto = null;
  let escala = 3;

  function ajustar() {
    const ancho = lienzo.parentElement.clientWidth;
    const alto = lienzo.parentElement.clientHeight || ancho * (H / W);
    const ideal = Math.min(ancho / W, alto / H);
    // Escala entera en pantallas grandes (píxel perfecto); en móvil se encoge lo que haga falta
    escala = ideal >= 2 ? Math.floor(ideal) : ideal >= 1 ? Math.floor(ideal * 2) / 2 : ideal;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    lienzo.width = Math.round(W * escala * dpr);
    lienzo.height = Math.round(H * escala * dpr);
    lienzo.style.width = `${W * escala}px`;
    lienzo.style.height = `${H * escala}px`;
    c.setTransform(escala * dpr, 0, 0, escala * dpr, 0, 0);
    c.imageSmoothingEnabled = false;
  }
  new ResizeObserver(ajustar).observe(lienzo.parentElement);

  // Capa de oscuridad: se pinta negra y se "recorta" con luces
  const sombra = document.createElement("canvas");
  sombra.width = W; sombra.height = H;
  const s = sombra.getContext("2d");

  function luz(ctx, x, y, radio, alfa, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radio);
    g.addColorStop(0, color ? hexA(color, alfa) : `rgba(0,0,0,${alfa})`);
    g.addColorStop(1, color ? hexA(color, 0) : "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - radio, y - radio, radio * 2, radio * 2);
  }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function dibujar(tiempo) {
    const parpadeo = calmado() ? 1 : 0.92 + Math.sin(tiempo / 260) * 0.05 + Math.sin(tiempo / 97) * 0.03;
    c.drawImage(fondo, 0, 0);
    // Objetos y decoración ordenados por altura, con el jugador entre ellos
    const capas = [...cosas.filter((o) => o.sprite), { jugador: true, y: jugador.y }].sort((a, b) => a.y - b.y);
    for (const o of capas) {
      if (o.jugador) {
        const fot = sprites[jugador.dir][jugador.anda ? Math.floor(jugador.paso) % 2 : 0];
        c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(Math.round(jugador.x) - 5, Math.round(jugador.y) + 4, 10, 2);
        c.drawImage(fot, Math.round(jugador.x) - 8, Math.round(jugador.y) - 11);
      } else {
        const flota = o.destino && !calmado() ? Math.round(Math.sin(tiempo / 420 + o.x) * 1) : 0;
        c.drawImage(o.sprite, o.x - 8, o.y - 10 + flota);
      }
    }
    // Oscuridad con huecos de luz
    s.globalCompositeOperation = "source-over";
    s.clearRect(0, 0, W, H);
    s.fillStyle = "rgba(6,5,14,0.86)";
    s.fillRect(0, 0, W, H);
    s.globalCompositeOperation = "destination-out";
    luz(s, jugador.x, jugador.y - 4, 86 * parpadeo, 1);
    for (const o of cosas) luz(s, o.x, o.y, o.radio * (o.destino ? parpadeo : 1), o.fuerza);
    c.drawImage(sombra, 0, 0);
    // Brillo de color sobre los cristales y objetos
    c.globalCompositeOperation = "lighter";
    for (const o of cosas) luz(c, o.x, o.y, o.radio * 0.6, o.destino ? 0.22 : 0.14, o.luz);
    luz(c, jugador.x, jugador.y - 4, 30, 0.1, "#ffbf5a");
    c.globalCompositeOperation = "source-over";
    // Indicador sobre el objeto cercano
    if (cerca && !abierto) {
      const yy = cerca.y - 22 + (calmado() ? 0 : Math.round(Math.sin(tiempo / 180)));
      c.fillStyle = PALETA.q; c.fillRect(cerca.x - 4, yy, 9, 9);
      c.fillStyle = PALETA.i; c.fillRect(cerca.x - 3, yy + 1, 7, 7);
      c.fillStyle = PALETA.q; c.fillRect(cerca.x - 1, yy + 2, 3, 3); c.fillRect(cerca.x, yy + 6, 1, 1);
    }
  }

  let ultimo = performance.now();
  function bucle(ahora) {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    if (!abierto) mover(dt);
    dibujar(ahora);
    if (visible) requestAnimationFrame(bucle); else enMarcha = false;
  }

  function mover(dt) {
    let dx = 0, dy = 0;
    if (teclas.has("izquierda")) dx -= 1;
    if (teclas.has("derecha")) dx += 1;
    if (teclas.has("arriba")) dy -= 1;
    if (teclas.has("abajo")) dy += 1;
    if (!dx && !dy && (ruta.length || objetivo)) {
      const punto = ruta[0] || objetivo;
      dx = punto.x - jugador.x; dy = punto.y - jugador.y;
      if (Math.hypot(dx, dy) < 2) {
        if (ruta.length) ruta.shift(); else objetivo = null;
        dx = dy = 0;
      }
    }
    const largo = Math.hypot(dx, dy);
    jugador.anda = largo > 0;
    if (largo) {
      const v = 72 * dt;
      const nx = jugador.x + (dx / largo) * v, ny = jugador.y + (dy / largo) * v;
      let movido = false;
      if (!choca(nx, jugador.y)) { jugador.x = nx; movido = true; }
      if (!choca(jugador.x, ny)) { jugador.y = ny; movido = true; }
      if (!movido) { objetivo = null; ruta = []; } // atascado contra una pared
      jugador.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "izquierda" : "derecha") : (dy < 0 ? "arriba" : "abajo");
      const antes = Math.floor(jugador.paso);
      jugador.paso += dt * 7;
      if (Math.floor(jugador.paso) !== antes) sonido.paso();
    }
    // Objeto más cercano al alcance
    cerca = null;
    let mejor = 26;
    for (const o of cosas) {
      if (!o.destino) continue;
      const d = Math.hypot(o.x - jugador.x, o.y - jugador.y);
      if (d < mejor) { mejor = d; cerca = o; }
    }
    if (pendiente && cerca === pendiente) { const o = pendiente; pendiente = null; objetivo = null; abrir(o); }
    aviso.dataset.cerca = cerca ? "si" : "no";
  }

  /* ---------- Cuadros de diálogo ---------- */
  let escritura = null;
  function escribir(frase) {
    clearInterval(escritura);
    if (calmado()) { texto.textContent = frase; return; }
    let n = 0;
    texto.textContent = "";
    escritura = setInterval(() => {
      n += 2;
      texto.textContent = frase.slice(0, n);
      if (n % 4 === 0) sonido.blip();
      if (n >= frase.length) clearInterval(escritura);
    }, 28);
  }
  function abrir(o, foco = true) {
    abierto = o;
    teclas.clear();
    jugador.anda = false;
    const id = o ? o.destino.id : "bienvenida";
    titulo.textContent = t(`cueva.${id}.titulo`);
    caja.hidden = false;
    botonIr.hidden = !o;
    botonSeguir.textContent = t(o ? "cueva.seguir" : "cueva.empezar");
    escribir(t(`cueva.${id}.texto`));
    sonido.abrir();
    if (foco) (o ? botonIr : botonSeguir).focus({ preventScroll: true });
  }
  function cerrar() {
    clearInterval(escritura);
    caja.hidden = true;
    abierto = null;
    lienzo.focus({ preventScroll: true });
  }
  botonSeguir.addEventListener("click", cerrar);
  botonIr.addEventListener("click", () => { const id = abierto?.destino.id; cerrar(); if (id) irA(id); });
  alCambiarIdioma(() => {
    if (caja.hidden) return;
    const id = abierto ? abierto.destino.id : "bienvenida";
    titulo.textContent = t(`cueva.${id}.titulo`);
    texto.textContent = t(`cueva.${id}.texto`);
    clearInterval(escritura);
    botonSeguir.textContent = t(abierto ? "cueva.seguir" : "cueva.empezar");
  });

  /* ---------- Controles ---------- */
  const MAPA_TECLAS = { ArrowLeft: "izquierda", a: "izquierda", ArrowRight: "derecha", d: "derecha", ArrowUp: "arriba", w: "arriba", ArrowDown: "abajo", s: "abajo" };
  lienzo.addEventListener("keydown", (e) => {
    if (abierto) return;
    const dir = MAPA_TECLAS[e.key] || MAPA_TECLAS[e.key.toLowerCase?.()];
    if (dir) { e.preventDefault(); teclas.add(dir); objetivo = null; ruta = []; pendiente = null; }
    if ((e.key === "e" || e.key === "E" || e.key === "Enter" || e.key === " ") && cerca) { e.preventDefault(); abrir(cerca); }
  });
  lienzo.addEventListener("keyup", (e) => { const dir = MAPA_TECLAS[e.key] || MAPA_TECLAS[e.key.toLowerCase?.()]; if (dir) teclas.delete(dir); });
  lienzo.addEventListener("blur", () => teclas.clear());
  caja.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
  lienzo.addEventListener("pointerdown", (e) => {
    if (abierto) return;
    const r = lienzo.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    lienzo.focus({ preventScroll: true });
    // ¿Ha tocado un objeto? Se camina hasta él y se abre al llegar
    const tocado = cosas.find((o) => o.destino && Math.abs(o.x - x) < 11 && Math.abs(o.y - 2 - y) < 12);
    if (tocado) {
      if (cerca === tocado) { abrir(tocado); return; }
      pendiente = tocado;
      ruta = camino(jugador, { x: tocado.x, y: tocado.y + T });
    } else {
      pendiente = null;
      ruta = camino(jugador, { x, y });
      objetivo = libre(Math.floor(x / T), Math.floor(y / T)) ? { x, y } : null; // remate fino dentro de la casilla
    }
  });

  /* ---------- Solo se anima mientras se ve ---------- */
  let visible = true, enMarcha = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !enMarcha) { enMarcha = true; ultimo = performance.now(); requestAnimationFrame(bucle); }
    if (!visible) teclas.clear();
  }).observe(lienzo);

  ajustar();
  dibujar(0);
  // Saludo al entrar
  setTimeout(() => abrir(null, false), calmado() ? 0 : 700);
}
