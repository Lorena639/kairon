/* Sonido del portfolio, sintetizado con Web Audio (sin archivos):
   - tecla: el clic del teclado mientras el editor escribe;
   - linea: el zumbido corto de la impresora térmica al imprimir cada línea;
   - ok, error y moneda: respuestas del laboratorio.
   Volumen general bajo y apagado por defecto: solo suena si se activa con el botón. */

const VOLUMEN = 0.16;
let ctx = null, salida = null, ruido = null;
let activo = false;
try { activo = localStorage.getItem("sonido-dani") === "si"; } catch { /* sin almacenamiento */ }

function preparar() {
  if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
  const Contexto = window.AudioContext || window.webkitAudioContext;
  if (!Contexto) return;
  ctx = new Contexto();
  const compresor = ctx.createDynamicsCompressor();
  compresor.threshold.value = -22;
  salida = ctx.createGain();
  salida.gain.value = VOLUMEN;
  salida.connect(compresor).connect(ctx.destination);
  ruido = ctx.createBuffer(1, ctx.sampleRate / 2, ctx.sampleRate);
  const datos = ruido.getChannelData(0);
  for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
}

const listo = () => activo && ctx && ctx.state === "running";

function envolvente(g, t, pico, caida) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(pico, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + caida);
}

function chasquido(frecuencia, pico, caida, tipo = "bandpass") {
  const t = ctx.currentTime;
  const f = ctx.createBufferSource();
  f.buffer = ruido;
  const filtro = ctx.createBiquadFilter();
  filtro.type = tipo;
  filtro.frequency.value = frecuencia;
  filtro.Q.value = 1.2;
  const g = ctx.createGain();
  envolvente(g, t, pico, caida);
  f.connect(filtro).connect(g).connect(salida);
  f.start(t, Math.random() * 0.3, caida + 0.02);
}

function tono(frecuencias, duracion, tipo = "sine", pico = 0.35) {
  frecuencias.forEach((fr, i) => {
    const t = ctx.currentTime + i * 0.07;
    const o = ctx.createOscillator();
    o.type = tipo;
    o.frequency.value = fr;
    const g = ctx.createGain();
    envolvente(g, t, pico, duracion);
    o.connect(g).connect(salida);
    o.start(t);
    o.stop(t + duracion + 0.05);
  });
}

let ultimaTecla = 0;
export function tecla() {
  if (!listo()) return;
  const ahora = performance.now();
  if (ahora - ultimaTecla < 45) return; // como mucho ~22 por segundo
  ultimaTecla = ahora;
  chasquido(2400 + Math.random() * 1600, 0.5, 0.03);
}

let ultimaLinea = 0;
export function linea() {
  if (!listo()) return;
  const ahora = performance.now();
  if (ahora - ultimaLinea < 70) return;
  ultimaLinea = ahora;
  chasquido(900 + Math.random() * 300, 0.35, 0.07, "lowpass");
}

export function ok() { if (listo()) tono([660, 990], 0.14); }
export function error() { if (listo()) tono([180], 0.22, "square", 0.12); }
export function moneda() { if (listo()) tono([988, 1319], 0.12, "triangle", 0.3); }

/* Botón de la barra: activar o silenciar. Devuelve el estado para que app.js lo anuncie. */
export function iniciarSonido(boton, alCambiar) {
  const pintar = () => {
    boton.setAttribute("aria-pressed", String(activo));
    boton.querySelector("use").setAttribute("href", activo ? "#i-sonido" : "#i-mudo");
  };
  pintar();
  ["pointerdown", "keydown"].forEach((ev) => addEventListener(ev, () => { if (activo) preparar(); }, { capture: true }));
  boton.addEventListener("click", () => {
    activo = !activo;
    try { localStorage.setItem("sonido-dani", activo ? "si" : "no"); } catch { /* sin almacenamiento */ }
    if (activo) { preparar(); setTimeout(ok, 40); }
    pintar();
    alCambiar?.(activo);
  });
}
