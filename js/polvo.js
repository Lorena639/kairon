/* KAIRON · Polvo de oro que sigue al cursor (JavaScript puro)
   Capa de canvas sobre toda la página: cada movimiento del ratón suelta unas partículas
   doradas que flotan y se apagan. Se desactiva en pantallas táctiles y con movimiento reducido. */

(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const c = document.createElement("canvas");
  c.className = "polvo";
  c.setAttribute("aria-hidden", "true");
  document.body.appendChild(c);
  const ctx = c.getContext("2d");
  let w = 0, h = 0, dpr = 1;
  const TONOS = ["255,243,214", "233,207,160", "212,175,122"];
  const particulas = [];
  let ultimoX = -1, ultimoY = -1, ultimoT = 0;

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    c.width = w * dpr; c.height = h * dpr;
    c.style.width = w + "px"; c.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", medir);
  medir();

  window.addEventListener("pointermove", (e) => {
    const ahora = performance.now();
    const dist = ultimoX < 0 ? 0 : Math.hypot(e.clientX - ultimoX, e.clientY - ultimoY);
    const n = Math.min(6, 1 + Math.floor(dist / 14));
    for (let i = 0; i < n; i++) {
      const t = n > 1 ? i / (n - 1) : 1;
      particulas.push({
        x: ultimoX < 0 ? e.clientX : ultimoX + (e.clientX - ultimoX) * t,
        y: ultimoY < 0 ? e.clientY : ultimoY + (e.clientY - ultimoY) * t,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.3 - Math.random() * 0.8,
        vida: 1,
        tam: 1 + Math.random() * 2.2,
        tono: TONOS[Math.floor(Math.random() * TONOS.length)],
        giro: Math.random() * Math.PI * 2,
      });
    }
    while (particulas.length > 260) particulas.shift();
    ultimoX = e.clientX; ultimoY = e.clientY; ultimoT = ahora;
  }, { passive: true });

  function cuadro() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = particulas.length - 1; i >= 0; i--) {
      const p = particulas[i];
      p.vida -= 0.018;
      if (p.vida <= 0) { particulas.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy; p.giro += 0.1;
      const s = p.tam * (0.5 + p.vida);
      ctx.globalAlpha = p.vida * 0.9;
      ctx.fillStyle = `rgb(${p.tono})`;
      ctx.beginPath();
      // Chispa de 4 puntas que gira
      for (let k = 0; k < 8; k++) {
        const r = k % 2 ? s * 0.35 : s * 1.6;
        const a = p.giro + (k * Math.PI) / 4;
        ctx[k ? "lineTo" : "moveTo"](p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
})();
