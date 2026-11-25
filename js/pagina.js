/* KAIRON · el paisaje de las páginas interiores
   La cabecera de cada página interior muestra el mismo territorio de la portada (js/noche-tierra.js), quieto, a la
   hora del anochecer. Con ratón, el farol ilumina el terreno como en la portada. Solo se dibuja mientras la cabecera
   está a la vista; con «menos movimiento» se dibuja una vez y no se mueve. Sin WebGL queda el cielo de CSS. */
(function () {
  "use strict";
  const contenedor = document.querySelector(".pagina__escena");
  if (!contenedor || !window.kaironTierra || !window.THREE) return;

  const html = document.documentElement;
  const quieto = () => html.classList.contains("menos-movimiento") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const movil = window.innerWidth < 760;
  const T = window.kaironTierra.crear(contenedor, { bucle: false, movil, dprMax: movil ? 2 : 1.5 });
  if (!T) return;
  html.classList.add("con-tierra");

  const e = T.e;
  function encuadre() {
    const estrecha = window.innerWidth / window.innerHeight < 0.85;
    e.viaje = 6; e.camZ = 0; e.camY = estrecha ? 2.6 : 2.3;
    e.camX = T.eje(10) * 0.85;
    e.cabeceo = estrecha ? 0.1 : 0.07; e.guinada = 0; e.fov = estrecha ? 56 : 40;
    e.grosor = 0.78 * Math.pow(Math.min(window.devicePixelRatio || 1, 2), 0.8);
    e.luces = 1; e.baliza = 1; e.alfa = 1; e.brilloLineas = 1;
    // Penumbra bajo el texto de la cabecera (abajo a la izquierda en escritorio; todo el ancho en móvil)
    e.velo = 0.9;
    if (estrecha || window.innerWidth < 860) { e.veloX = 0.5; e.veloY = 0.62; e.veloRX = 0.9; e.veloRY = 0.5; }
    else { e.veloX = 0.24; e.veloY = 0.66; e.veloRX = 0.5; e.veloRY = 0.42; }
  }
  encuadre();

  let visible = true, sucio = true, ultimo = 0;
  const raton = { x: 0, y: 0, f: 0, activo: false };
  if ("IntersectionObserver" in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) sucio = true; }).observe(contenedor);
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (ev) => { raton.x = (ev.clientX / window.innerWidth - 0.5) * 2; raton.y = (ev.clientY / window.innerHeight - 0.5) * 2; raton.activo = true; }, { passive: true });
    document.addEventListener("pointerleave", () => { raton.activo = false; });
  }
  window.addEventListener("resize", () => { encuadre(); T.ajustar(); sucio = true; });

  function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    if (!visible || document.hidden) return;
    const q = quieto();
    T.aquietar(q);
    const objetivo = raton.activo && !q ? 1 : 0;
    raton.f += (objetivo - raton.f) * 0.08;
    e.farolF = raton.f;
    if (raton.activo) T.apuntar(raton.x, -raton.y);
    // Las luces parpadean despacio: basta con unos 30 dibujos por segundo; quieto, solo cuando algo cambia
    if (q && !sucio && Math.abs(objetivo - raton.f) < 0.002) return;
    if (ahora - ultimo < 32 && !sucio) return;
    ultimo = ahora; sucio = false;
    T.pintar(ahora);
  }
  requestAnimationFrame(cuadro);
})();
