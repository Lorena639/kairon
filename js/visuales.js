/* KAIRON · Visuales por sección (canvas 2D, JavaScript puro)
   Cada <canvas data-visual="..."> dibuja una pequeña animación temática:
   - "escudo": anillos que laten y nodos infectados que se aíslan (contención).
   - "informe": un informe que se escribe solo y una columna de hashes SHA-256.
   - "mapa": ataques entrantes como arcos de luz hacia el centro, que se neutralizan.
   Solo se animan mientras están en pantalla. */

(function () {
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ORO = "212,175,122", ORO_CLARO = "255,243,214", CIAN = "53,198,214", ROJO = "255,77,77";
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function preparar(c) {
    const r = c.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (c.width !== w * dpr || c.height !== h * dpr) { c.width = w * dpr; c.height = h * dpr; }
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  /* ---------- Escudo (contención) ---------- */
  function escudo(c) {
    const nodos = Array.from({ length: 18 }, (_, i) => ({ a: (i / 18) * Math.PI * 2 + Math.random() * 0.2, r: 0.62 + Math.random() * 0.3, inf: 0, aislado: 0 }));
    let t = 0, ultimoInf = 0;
    return (dt) => {
      const { ctx, w, h } = preparar(c);
      t += dt;
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
      ctx.clearRect(0, 0, w, h);
      // Anillos que laten
      for (let i = 0; i < 4; i++) {
        const f = ((t * 0.25 + i / 4) % 1);
        ctx.beginPath(); ctx.arc(cx, cy, R * (0.25 + f * 0.75), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ORO},${(1 - f) * 0.5})`; ctx.lineWidth = 1.2; ctx.stroke();
      }
      // Escudo hexagonal
      ctx.beginPath();
      for (let k = 0; k < 6; k++) { const a = t * 0.15 + (k * Math.PI) / 3; ctx[k ? "lineTo" : "moveTo"](cx + Math.cos(a) * R * 0.3, cy + Math.sin(a) * R * 0.3); }
      ctx.closePath(); ctx.strokeStyle = `rgba(${CIAN},0.9)`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = `rgba(${CIAN},0.08)`; ctx.fill();
      // Nodos: de vez en cuando uno se infecta; el escudo lo aísla cortando su línea
      if (t - ultimoInf > 2.2 && !reducido) { ultimoInf = t; const n = nodos[Math.floor(Math.random() * nodos.length)]; n.inf = 1; n.aislado = 0; }
      nodos.forEach((n) => {
        const x = cx + Math.cos(n.a + t * 0.05) * R * n.r, y = cy + Math.sin(n.a + t * 0.05) * R * n.r;
        if (n.inf > 0) { n.aislado = Math.min(1, n.aislado + dt * 0.8); if (n.aislado >= 1) n.inf = Math.max(0, n.inf - dt * 0.6); }
        // Línea al centro (se corta cuando está aislado)
        const corte = n.aislado;
        ctx.beginPath(); ctx.moveTo(cx + (x - cx) * 0.3, cy + (y - cy) * 0.3);
        ctx.lineTo(cx + (x - cx) * (0.3 + 0.7 * (1 - corte * 0.55)), cy + (y - cy) * (0.3 + 0.7 * (1 - corte * 0.55)));
        ctx.strokeStyle = n.inf > 0 ? `rgba(${ROJO},${0.8 * n.inf})` : `rgba(${ORO},0.35)`; ctx.lineWidth = 1; ctx.stroke();
        if (n.aislado > 0 && n.aislado < 1) { // chispa de corte
          const sx = cx + (x - cx) * (0.3 + 0.7 * (1 - corte * 0.55)), sy = cy + (y - cy) * (0.3 + 0.7 * (1 - corte * 0.55));
          ctx.beginPath(); ctx.arc(sx, sy, 3 + 4 * Math.sin(n.aislado * Math.PI), 0, Math.PI * 2); ctx.fillStyle = `rgba(${ORO_CLARO},0.9)`; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x, y, n.inf > 0 ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = n.inf > 0 ? `rgba(${ROJO},${0.5 + 0.5 * n.inf})` : `rgba(${ORO},0.9)`; ctx.fill();
        if (n.inf > 0) { ctx.beginPath(); ctx.arc(x, y, 10 + 6 * Math.sin(t * 6), 0, Math.PI * 2); ctx.strokeStyle = `rgba(${ROJO},${0.35 * n.inf})`; ctx.stroke(); }
      });
      // Núcleo
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.3);
      g.addColorStop(0, `rgba(${ORO_CLARO},0.55)`); g.addColorStop(1, `rgba(${ORO},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 0.3, 0, Math.PI * 2); ctx.fill();
    };
  }

  /* ---------- Informe que se escribe ---------- */
  function informe(c) {
    const HEX = "0123456789abcdef";
    const lineas = [
      ["KAIRON · INFORME DE INCIDENTE", 1], ["Caso 0428 · 29/10/2026 09:41 UTC", 0], ["", 0],
      ["RESUMEN", 1], ["Phishing con adjunto ejecutable en WS-03", 0], ["Persistencia por tarea programada", 0], ["Contenido en 11 min · sin impacto", 0], ["", 0],
      ["EVIDENCIAS", 1], ["E1 procesos      09:45:12", 0], ["E2 conexiones    09:45:31", 0], ["E3 usuarios      09:45:50", 0], ["E4 persistencia  09:46:14", 0], ["E5 ejecutable    09:46:48", 0], ["", 0],
      ["RECOMENDACIONES", 1], ["Bloquear ejecutables en correo", 0], ["Formación anti-phishing", 0], ["Usuarios sin admin local", 0],
    ];
    let t = 0;
    const hashes = Array.from({ length: 14 }, () => Array.from({ length: 16 }, () => HEX[Math.floor(Math.random() * 16)]).join(""));
    return (dt) => {
      const { ctx, w, h } = preparar(c);
      t += dt;
      ctx.clearRect(0, 0, w, h);
      // Hoja
      const px = Math.min(w * 0.08, 24), py = 18, ancho = Math.min(w * 0.68, 420);
      ctx.fillStyle = "rgba(16,21,28,0.75)"; ctx.strokeStyle = `rgba(${ORO},0.35)`;
      ctx.beginPath(); ctx.roundRect(px, py, ancho, h - py * 2, 12); ctx.fill(); ctx.stroke();
      // Texto que se escribe en bucle
      const velocidad = 28; // caracteres por segundo
      const total = lineas.reduce((n, l) => n + l[0].length + 1, 0);
      const ciclo = (t * velocidad) % (total + 60);
      let acumulado = 0;
      ctx.font = `${Math.max(10, Math.min(13, w * 0.022))}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
      lineas.forEach((l, i) => {
        const [texto, titulo] = l;
        const visibles = Math.max(0, Math.min(texto.length, Math.floor(ciclo - acumulado)));
        acumulado += texto.length + 1;
        if (visibles <= 0) return;
        ctx.fillStyle = titulo ? `rgba(${ORO_CLARO},1)` : `rgba(248,245,238,0.8)`;
        ctx.fillText(texto.slice(0, visibles), px + 18, py + 16 + i * 19);
        if (visibles < texto.length) { ctx.fillStyle = `rgba(${ORO},0.9)`; ctx.fillRect(px + 18 + ctx.measureText(texto.slice(0, visibles)).width + 2, py + 16 + i * 19, 7, 13); }
      });
      // Columna de hashes que desfila
      const hx = px + ancho + 22;
      if (hx < w - 60) {
        ctx.font = `10px "JetBrains Mono", monospace`;
        const desplaz = (t * 18) % 22;
        hashes.forEach((hsh, i) => {
          const y = py + i * 22 - desplaz;
          if (y < py - 10 || y > h - py) return;
          const alfa = 0.25 + 0.6 * (1 - Math.abs((y - h / 2) / (h / 2)));
          ctx.fillStyle = i % 5 === 0 ? `rgba(${CIAN},${alfa})` : `rgba(${ORO},${alfa})`;
          ctx.fillText("sha256:" + hsh, hx, y);
          if (Math.random() < 0.02) hashes[i] = hsh.slice(1) + HEX[Math.floor(Math.random() * 16)];
        });
        // sello
        ctx.beginPath(); ctx.arc(hx + 60, h - 46, 22 + 2 * Math.sin(t * 3), 0, Math.PI * 2); ctx.strokeStyle = `rgba(${ORO},0.7)`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = `rgba(${ORO_CLARO},0.9)`; ctx.font = `9px "JetBrains Mono", monospace`; ctx.textAlign = "center"; ctx.fillText("SELLADO", hx + 60, h - 50); ctx.textAlign = "left";
      }
    };
  }

  /* ---------- Mapa de amenazas: arcos hacia el centro ---------- */
  function mapa(c) {
    const arcos = [];
    let t = 0, ultimo = 0;
    const puntos = Array.from({ length: 70 }, () => ({ x: Math.random(), y: 0.15 + Math.random() * 0.7, b: Math.random() }));
    return (dt) => {
      const { ctx, w, h } = preparar(c);
      t += dt;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5, cy = h * 0.55;
      // Fondo: rejilla de "mapa" punteada
      puntos.forEach((p) => { const a = 0.15 + 0.25 * Math.abs(Math.sin(t * 0.8 + p.b * 6)); ctx.fillStyle = `rgba(${ORO},${a})`; ctx.fillRect(p.x * w, p.y * h, 2, 2); });
      ctx.strokeStyle = `rgba(${ORO},0.12)`; ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, (h / 6) * i); ctx.lineTo(w, (h / 6) * i); ctx.stroke(); }
      for (let i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo((w / 10) * i, 0); ctx.lineTo((w / 10) * i, h); ctx.stroke(); }
      // Nuevo ataque cada ~1.4 s
      if (t - ultimo > 1.4 && !reducido) {
        ultimo = t;
        const lado = Math.random() < 0.5 ? 0.04 : 0.96;
        arcos.push({ x0: w * (lado + (Math.random() - 0.5) * 0.08), y0: h * (0.1 + Math.random() * 0.8), p: 0, v: 0.35 + Math.random() * 0.3, fin: 0 });
      }
      for (let i = arcos.length - 1; i >= 0; i--) {
        const a = arcos[i];
        if (a.p < 1) a.p = Math.min(1, a.p + dt * a.v); else a.fin += dt;
        if (a.fin > 1.2) { arcos.splice(i, 1); continue; }
        const mx = (a.x0 + cx) / 2, my = Math.min(a.y0, cy) - h * 0.35; // control del arco
        ctx.beginPath(); ctx.moveTo(a.x0, a.y0);
        const pasos = 40;
        for (let k = 1; k <= pasos * a.p; k++) {
          const u = k / pasos, x = (1 - u) * (1 - u) * a.x0 + 2 * (1 - u) * u * mx + u * u * cx, y = (1 - u) * (1 - u) * a.y0 + 2 * (1 - u) * u * my + u * u * cy;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = a.fin > 0 ? `rgba(${CIAN},${Math.max(0, 1 - a.fin)})` : `rgba(${ROJO},0.85)`; ctx.lineWidth = 1.6; ctx.stroke();
        // Cabeza del arco
        const u = a.p, hx = (1 - u) * (1 - u) * a.x0 + 2 * (1 - u) * u * mx + u * u * cx, hy = (1 - u) * (1 - u) * a.y0 + 2 * (1 - u) * u * my + u * u * cy;
        ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fillStyle = a.fin > 0 ? `rgba(${CIAN},${Math.max(0, 1 - a.fin)})` : `rgba(${ROJO},1)`; ctx.fill();
        // Origen
        ctx.beginPath(); ctx.arc(a.x0, a.y0, 4, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${ROJO},0.6)`; ctx.stroke();
        // Neutralizado: onda cian desde el centro
        if (a.fin > 0 && a.fin < 1) { ctx.beginPath(); ctx.arc(cx, cy, 10 + a.fin * 60, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${CIAN},${1 - a.fin})`; ctx.lineWidth = 2; ctx.stroke(); }
      }
      // Centro: KAIRON SOC
      ctx.beginPath(); ctx.arc(cx, cy, 7 + 2 * Math.sin(t * 4), 0, Math.PI * 2); ctx.fillStyle = `rgba(${ORO_CLARO},1)`; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${ORO},0.8)`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = `10px "JetBrains Mono", monospace`; ctx.fillStyle = `rgba(${ORO_CLARO},0.9)`; ctx.textAlign = "center"; ctx.fillText("KAIRON SOC", cx, cy + 26); ctx.textAlign = "left";
    };
  }

  const fabricas = { escudo, informe, mapa };
  document.querySelectorAll("canvas[data-visual]").forEach((c) => {
    const fn = fabricas[c.dataset.visual];
    if (!fn) return;
    const dibujar = fn(c);
    let visible = false, ultimo = performance.now();
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.05 }).observe(c);
    dibujar(0);
    (function bucle(ahora) {
      const dt = Math.min((ahora - ultimo) / 1000, 0.05);
      ultimo = ahora;
      if (visible && !reducido) dibujar(dt);
      requestAnimationFrame(bucle);
    })(performance.now());
  });
})();
