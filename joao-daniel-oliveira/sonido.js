/* Sonido: tajos, cortes metálicos, golpes y fuego sintetizados con Web Audio (sin archivos).
   Todo pasa por un volumen general bajo y un compresor para que nada suene fuerte.
   El navegador solo deja sonar audio después de un clic o una tecla, así que el contexto
   se crea en la primera interacción. El botón de la cabecera lo silencia (y se recuerda). */

const VOLUMEN = 0.22; // volumen general, bajo a propósito
let ctx = null, salida = null, ruido = null;
let activo = true;
try { activo = localStorage.getItem("sonido") !== "no"; } catch { /* sin almacenamiento */ }

function preparar() {
  if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
  const Contexto = window.AudioContext || window.webkitAudioContext;
  if (!Contexto) return;
  ctx = new Contexto();
  const compresor = ctx.createDynamicsCompressor();
  compresor.threshold.value = -20;
  compresor.ratio.value = 6;
  salida = ctx.createGain();
  salida.gain.value = VOLUMEN;
  salida.connect(compresor).connect(ctx.destination);
  // Un segundo de ruido blanco que reutilizan todos los efectos
  ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const datos = ruido.getChannelData(0);
  for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
}
["pointerdown", "keydown"].forEach((t) => addEventListener(t, preparar, { capture: true }));

const listo = () => activo && ctx && ctx.state === "running";
const azar = (a, b) => a + Math.random() * (b - a);

// Envolvente: sube rápido y cae exponencialmente
function envolvente(nodo, t, pico, ataque, caida) {
  nodo.gain.setValueAtTime(0.0001, t);
  nodo.gain.exponentialRampToValueAtTime(pico, t + ataque);
  nodo.gain.exponentialRampToValueAtTime(0.0001, t + ataque + caida);
}

/* Tajo: ruido con un filtro que barre de agudo a grave, el «fiuu» de una hoja en el aire */
export function tajo({ fuerza = 1, retardo = 0 } = {}) {
  if (!listo()) return;
  const t = ctx.currentTime + retardo;
  const fuente = ctx.createBufferSource();
  fuente.buffer = ruido;
  fuente.playbackRate.value = azar(0.9, 1.2);
  const filtro = ctx.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.Q.value = 2.5;
  filtro.frequency.setValueAtTime(azar(5000, 7000), t);
  filtro.frequency.exponentialRampToValueAtTime(azar(700, 1100), t + 0.16);
  const g = ctx.createGain();
  envolvente(g, t, 0.9 * fuerza, 0.012, 0.17);
  fuente.connect(filtro).connect(g).connect(salida);
  fuente.start(t, Math.random() * 0.5, 0.25);
}

/* Corte: el tajo más un «shing» metálico (dos senos agudos que se apagan) */
export function corte({ fuerza = 1, retardo = 0, tono = 1 } = {}) {
  if (!listo()) return;
  tajo({ fuerza: fuerza * 0.8, retardo });
  const t = ctx.currentTime + retardo + 0.02;
  [1, 1.51].forEach((m, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2600 * tono * m, t);
    osc.frequency.exponentialRampToValueAtTime(2300 * tono * m, t + 0.3);
    const g = ctx.createGain();
    envolvente(g, t, (i ? 0.08 : 0.14) * fuerza, 0.004, 0.32);
    osc.connect(g).connect(salida);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

/* Golpe: grave corto, para errores, vidas perdidas y la apertura del dominio */
export function golpe({ fuerza = 1, retardo = 0, grave = 1 } = {}) {
  if (!listo()) return;
  const t = ctx.currentTime + retardo;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140 * grave, t);
  osc.frequency.exponentialRampToValueAtTime(40 * grave, t + 0.35);
  const g = ctx.createGain();
  envolvente(g, t, 0.9 * fuerza, 0.006, 0.4);
  osc.connect(g).connect(salida);
  osc.start(t);
  osc.stop(t + 0.5);
}

/* Fuego: ruido grave filtrado, un «fuum» de llama */
export function fuego({ fuerza = 1 } = {}) {
  if (!listo()) return;
  const t = ctx.currentTime;
  const fuente = ctx.createBufferSource();
  fuente.buffer = ruido;
  const filtro = ctx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.setValueAtTime(400, t);
  filtro.frequency.exponentialRampToValueAtTime(1800, t + 0.12);
  filtro.frequency.exponentialRampToValueAtTime(300, t + 0.5);
  const g = ctx.createGain();
  envolvente(g, t, 0.7 * fuerza, 0.04, 0.45);
  fuente.connect(filtro).connect(g).connect(salida);
  fuente.start(t, 0, 0.6);
}

/* Zumbido grave que crece: la invocación del dominio */
export function dron(duracion = 1.2) {
  if (!listo()) return;
  const t = ctx.currentTime;
  [55, 82.4].forEach((f) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = f;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.setValueAtTime(120, t);
    filtro.frequency.linearRampToValueAtTime(600, t + duracion);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + duracion);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duracion + 0.3);
    osc.connect(filtro).connect(g).connect(salida);
    osc.start(t);
    osc.stop(t + duracion + 0.4);
  });
}

/* Botón de la cabecera: activar o silenciar */
const boton = document.getElementById("sonido");
function pintarBoton() {
  boton.setAttribute("aria-pressed", String(activo));
  boton.textContent = activo ? "Sonido: sí" : "Sonido: no";
}
if (boton) {
  pintarBoton();
  boton.addEventListener("click", () => {
    activo = !activo;
    try { localStorage.setItem("sonido", activo ? "si" : "no"); } catch { /* sin almacenamiento */ }
    pintarBoton();
    if (activo) { preparar(); setTimeout(() => corte({ fuerza: 0.6 }), 30); }
  });
}
