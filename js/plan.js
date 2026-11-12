/* KAIRON · Plan de empresa (plan.html y ca/plan.html)

   Qué hace este archivo:
   1. Modelo económico: una sola función pura. Parte de los datos del capítulo 2 del proyecto
      (precios, costes por cliente y 60 €/mes de costes fijos) y añade encima supuestos propios
      (ritmo de altas, bajas, coste de captación, estructura). Todo lo que no sale del capítulo 2
      aparece en la página marcado como "estimación propia".
   2. Selector de escenario (pesimista / base / optimista): recalcula las tablas y los gráficos.
      Solo cambia el texto de las celdas; no sustituye nodos (paginas.js ya los ha animado).
   3. Índice de lectura: marca el capítulo que se está leyendo y cuánto se ha avanzado.
   4. Movimiento con GSAP: cifras que cuentan, líneas que se dibujan y barras que crecen.

   Reglas:
   - Sin JavaScript la página se lee entera: las tablas y los gráficos del HTML llevan el escenario base,
     calculado con este mismo modelo al generar la página.
   - "Reducir movimiento" (sistema o botón) y el modo presentación (tecla P): los números cambian de golpe
     y nada se dibuja ni cuenta.
   - No hay textos de idioma aquí: las etiquetas están en el HTML (data-*), así sirve para es y ca. */

(function () {
  "use strict";

  /* ---------- 1. Modelo económico (función pura; la misma que usa el generador de las tablas) ---------- */
  var IVA = 1.21, TARIFA = 20, INFRA_EQUIPO = 0.60, HORAS_ANALISTA_MES = 140;
  // Datos del capítulo 2 del proyecto (tablas 6 y 7): precio, equipos incluidos y horas de analista al mes
  var PLANES = [
    { id: "vigia", pvp: 9.90, conIva: true, equipos: 2, horas: 1 / 6 },
    { id: "centinela", pvp: 24.90, conIva: true, equipos: 5, horas: 0.5 },
    { id: "guardian", pvp: 64.90, conIva: true, equipos: 10, horas: 1.5 },
    { id: "egida", pvp: 590, conIva: false, equipos: 25, horas: 8, sepa: true },
  ];
  PLANES.forEach(function (p) {
    p.neto = p.conIva ? p.pvp / IVA : p.pvp;
    p.infra = INFRA_EQUIPO * p.equipos;
    p.analista = p.horas * TARIFA;
    p.pago = p.sepa ? 0.35 : 0.25 + 0.015 * p.pvp;
    p.coste = p.infra + p.analista + p.pago;
    p.margen = p.neto - p.coste;
  });
  // Supuestos propios (no salen del capítulo 2): se enseñan todos en la página
  var COMUN = {
    fondos: 10000,                   // aportación de los socios
    fijosMes: [60, 150, 300],        // año 1: los 60 €/mes del capítulo 2
    estructura: [2880, 9900, 12000], // gestoría, cuotas de autónomos, herramientas y formación
    inversion: [2500, 1500, 3000],   // constitución, equipos y servidor
    cac: [25, 45, 90, 1200],         // coste de captar un cliente de cada plan
  };
  var ESCENARIOS = {
    // En el pesimista se contiene el gasto: sin horas propias pagadas, menos estructura y menos inversión
    pesimista: { clientes: [[30, 12, 4, 1], [70, 30, 10, 3], [130, 60, 22, 6]], baja: [0.4, 0.4, 0.4, 0.15], cac: 1.3, horasPropias: [0, 0, 0], estructura: [2880, 7200, 9000], inversion: [2500, 500, 1000] },
    base: { clientes: [[60, 25, 8, 3], [150, 70, 25, 8], [300, 150, 60, 16]], baja: [0.3, 0.3, 0.3, 0.1], cac: 1, horasPropias: [0, 450, 1200] },
    optimista: { clientes: [[90, 40, 14, 5], [240, 120, 45, 14], [480, 250, 100, 28]], baja: [0.2, 0.2, 0.2, 0.05], cac: 0.8, horasPropias: [0, 700, 1900] },
  };
  var suma = function (a) { return a.reduce(function (s, x) { return s + x; }, 0); };

  function modelo(nombre) {
    var e = ESCENARIOS[nombre], caja = COMUN.fondos, previos = [0, 0, 0, 0];
    var anios = [], meses = [{ mrr: 0, caja: caja }];
    e.clientes.forEach(function (fin, y) {
      var a = { clientes: fin.slice(), ini: previos.slice() };
      a.bajas = previos.map(function (n, i) { return Math.round(n * e.baja[i]); });
      a.altas = fin.map(function (n, i) { return n - previos[i] + a.bajas[i]; });
      var medios = fin.map(function (n, i) { return (n + previos[i]) / 2; });
      a.ingresos = PLANES.map(function (p, i) { return Math.round(medios[i] * 12 * p.neto); });
      a.variables = PLANES.map(function (p, i) { return Math.round(medios[i] * 12 * p.coste); });
      a.ingresosTotal = suma(a.ingresos);
      a.variablesTotal = suma(a.variables);
      a.contribucion = a.ingresosTotal - a.variablesTotal;
      a.fijos = COMUN.fijosMes[y] * 12;
      a.marketing = Math.round(suma(a.altas.map(function (n, i) { return n * COMUN.cac[i] * e.cac; })));
      a.estructura = (e.estructura || COMUN.estructura)[y];
      a.personal = e.horasPropias[y] * TARIFA;
      a.gastos = a.fijos + a.marketing + a.estructura + a.personal;
      a.ebitda = a.contribucion - a.gastos;
      a.ebitdaPct = a.ingresosTotal ? a.ebitda / a.ingresosTotal * 100 : 0;
      a.inversion = (e.inversion || COMUN.inversion)[y];
      a.cajaIni = caja;
      a.flujo = a.ebitda - a.inversion;
      a.cajaFin = caja + a.flujo;
      a.total = suma(fin);
      a.altasTotal = suma(a.altas);
      a.bajasTotal = suma(a.bajas);
      a.mrr = suma(PLANES.map(function (p, i) { return fin[i] * p.neto; }));
      a.horas = suma(PLANES.map(function (p, i) { return fin[i] * p.horas; }));
      a.analistas = a.horas / HORAS_ANALISTA_MES;
      a.equipos = suma(PLANES.map(function (p, i) { return fin[i] * p.equipos; }));
      // Serie mensual para el gráfico: altas repartidas por igual a lo largo del año
      var c = caja - a.inversion;
      for (var k = 1; k <= 12; k++) {
        var contrib = suma(PLANES.map(function (p, i) { return (previos[i] + (fin[i] - previos[i]) * (k - 0.5) / 12) * p.margen; }));
        c += contrib - a.gastos / 12;
        meses.push({ mrr: suma(PLANES.map(function (p, i) { return (previos[i] + (fin[i] - previos[i]) * k / 12) * p.neto; })), caja: c });
      }
      meses[meses.length - 1].caja = a.cajaFin; // el cierre del año coincide con la tabla (redondeada al euro)
      caja = a.cajaFin;
      previos = fin.slice();
      anios.push(a);
    });
    return { nombre: nombre, anios: anios, meses: meses, cajaMin: Math.min.apply(null, meses.map(function (m) { return m.caja; })) };
  }

  /* ---------- 2. Del modelo a las celdas: clave -> número, y formato de cifras ---------- */
  function plano(m) {
    var v = {};
    m.anios.forEach(function (a, y) {
      var pre = "a" + (y + 1) + ".";
      Object.keys(a).forEach(function (k) {
        if (Array.isArray(a[k])) a[k].forEach(function (n, i) { v[pre + k + "." + i] = n; });
        else v[pre + k] = a[k];
      });
    });
    v.cajaMin = m.cajaMin;
    return v;
  }

  // 1684.13 -> "1.684,13 €" (como en el capítulo 2; toLocaleString no agrupa los miles de cuatro cifras)
  function cifra(n, dec) {
    var neg = n < 0, s = Math.abs(n).toFixed(dec), partes = s.split(".");
    if (Number(s) === 0) neg = false;
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (neg ? "−" : "") + partes.join(",");
  }
  function formato(n, f) {
    switch (f) {
      case "e0": return cifra(n, 0) + " €";
      case "e2": return cifra(n, 2) + " €";
      case "p1": return cifra(n, 1) + " %";
      case "d1": return cifra(n, 1);
      case "d2": return cifra(n, 2);
      default: return cifra(n, 0);
    }
  }

  /* Barras de clientes por plan: una fila por año, un tramo por plan. Escala fija (el máximo del optimista) */
  var BARRAS = { x0: 96, ancho: 640, alto: 30, paso: 58, y0: 14, max: 900 };
  function barras(m) {
    return m.anios.map(function (a, y) {
      var x = BARRAS.x0;
      var tramos = a.clientes.map(function (n) {
        var w = n / BARRAS.max * BARRAS.ancho, t = { x: x, w: w };
        x += w;
        return t;
      });
      return { y: BARRAS.y0 + y * BARRAS.paso, tramos: tramos, fin: x, total: a.total };
    });
  }

  // El generador de la página (Node) usa estas mismas funciones para escribir el escenario base en el HTML
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { PLANES: PLANES, COMUN: COMUN, ESCENARIOS: ESCENARIOS, HORAS_ANALISTA_MES: HORAS_ANALISTA_MES, TARIFA: TARIFA,
      modelo: modelo, plano: plano, formato: formato, cifra: cifra, barras: barras, BARRAS: BARRAS };
    return;
  }

  /* ---------- 3. Página ---------- */
  var html = document.documentElement;
  var raiz = document.querySelector("main.pe");
  if (!raiz) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var hayGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var reducidoSO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var quieto = function () { return reducidoSO || html.classList.contains("menos-movimiento") || html.classList.contains("presentacion"); };

  // Para comprobar los números desde fuera (tools y pruebas): el mismo modelo que pinta la página
  window.kaironPlan = { modelo: modelo, plano: plano, formato: formato };

  /* --- 3.1 Selector de escenario --- */
  var celdas = $$("[data-k]", raiz);
  var selector = $(".pe-esc", raiz), estado = $(".pe-esc__estado", raiz);
  var actual = "base", valores = plano(modelo("base"));
  celdas.forEach(function (c) { c._v = valores[c.dataset.k]; });

  function pintar(nombre) {
    var m = modelo(nombre), nuevos = plano(m), animar = hayGSAP && !quieto();
    actual = nombre;
    raiz.dataset.escenario = nombre;

    celdas.forEach(function (c) {
      var fin = nuevos[c.dataset.k], f = c.dataset.f || "n";
      if (typeof fin !== "number") return;
      c.classList.toggle("es-negativo", fin < 0);
      if (!animar || c._v === fin) { c._v = fin; c.textContent = formato(fin, f); return; }
      var o = { v: c._v };
      gsap.to(o, { v: fin, duration: 0.7, ease: "power2.out", overwrite: true,
        onUpdate: function () { c.textContent = formato(o.v, f); },
        onComplete: function () { c._v = fin; c.textContent = formato(fin, f); } });
      c._v = fin;
    });

    // Gráficos de líneas: las tres curvas están dibujadas; solo cambia cuál es la activa
    $$("[data-linea]", raiz).forEach(function (g) { g.classList.toggle("es-activa", g.dataset.linea === nombre); });

    // Barras de clientes por plan
    barras(m).forEach(function (fila, y) {
      fila.tramos.forEach(function (t, i) {
        var r = $('[data-barra="' + y + "." + i + '"]', raiz);
        if (!r) return;
        if (animar) gsap.to(r, { attr: { x: t.x, width: t.w }, duration: 0.8, ease: "power3.out", overwrite: true });
        else { r.setAttribute("x", t.x.toFixed(1)); r.setAttribute("width", t.w.toFixed(1)); }
      });
      var total = $('[data-barra-total="' + y + '"]', raiz);
      if (total) {
        if (animar) gsap.to(total, { attr: { x: fila.fin + 10 }, duration: 0.8, ease: "power3.out", overwrite: true });
        else total.setAttribute("x", (fila.fin + 10).toFixed(1));
      }
    });

    // Aviso para lectores de pantalla y resumen visible del escenario elegido
    if (estado && selector) {
      var a3 = m.anios[2], etiqueta = $('input[value="' + nombre + '"]', selector).parentNode.textContent.trim();
      estado.textContent = estado.dataset.plantilla
        .replace("{n}", etiqueta.toLowerCase())
        .replace("{c}", formato(a3.total, "n"))
        .replace("{i}", formato(a3.ingresosTotal, "e0"))
        .replace("{e}", formato(a3.ebitda, "e0"))
        .replace("{m}", formato(m.cajaMin, "e0"));
    }
  }

  if (selector) {
    selector.hidden = false;
    selector.addEventListener("change", function (e) {
      if (e.target && e.target.name === "escenario" && e.target.checked) pintar(e.target.value);
    });
    var marcado = $("input:checked", selector);
    if (marcado && marcado.value !== "base") pintar(marcado.value); // el navegador puede recordar la opción al recargar
  }

  /* --- 3.2 Índice de lectura: capítulo actual y avance --- */
  var indice = $(".pe-indice", raiz);
  if (indice) {
    var enlaces = $$("a[href^='#']", indice);
    var caps = enlaces.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var cuenta = $(".pe-indice__cuenta b", indice), cuerpo = $(".pe-texto", raiz), pendiente = false;
    var leer = function () {
      pendiente = false;
      var corte = window.innerHeight * 0.38, i = 0;
      caps.forEach(function (c, k) { if (c && c.getBoundingClientRect().top <= corte) i = k; });
      enlaces.forEach(function (a, k) {
        if (k === i) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        a.classList.toggle("es-leido", k < i);
      });
      if (cuenta) cuenta.textContent = String(i + 1).padStart(2, "0");
      if (cuerpo) {
        var r = cuerpo.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (corte - r.top) / Math.max(1, r.height - window.innerHeight * 0.4)));
        indice.style.setProperty("--pe-avance", p.toFixed(4));
      }
    };
    var pedir = function () { if (!pendiente) { pendiente = true; requestAnimationFrame(leer); } };
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    leer();
  }

  /* --- 3.3 Tablas anchas: si caben, la región no necesita foco de teclado --- */
  var regiones = $$(".pe-tabla", raiz);
  var medir = function () {
    regiones.forEach(function (r) {
      if (r.scrollWidth > r.clientWidth + 1) r.setAttribute("tabindex", "0"); else r.removeAttribute("tabindex");
    });
  };
  medir();
  window.addEventListener("resize", medir);
  window.addEventListener("load", medir);

  /* --- 3.4 Movimiento --- */
  if (!hayGSAP) return;
  var contexto = null;
  var cuentas = $$("[data-cuenta]", raiz);
  cuentas.forEach(function (el) { el._t = el.textContent; });

  function montar() {
    if (contexto || quieto()) return;
    html.classList.add("pe-mov");
    contexto = gsap.context(function () {
      // Cifras clave: cuentan desde cero al entrar
      cuentas.forEach(function (el) {
        var fin = Number(el.dataset.cuenta), f = el.dataset.f || "n", o = { v: 0 }, texto = el._t;
        gsap.to(o, { v: fin, duration: 1.6, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
          onStart: function () { el.textContent = formato(0, f); },
          onUpdate: function () { el.textContent = formato(o.v, f); },
          onComplete: function () { el.textContent = texto; } });
      });

      // Gráficos de líneas: primero las curvas de referencia, después la del escenario activo
      $$(".pe-graf", raiz).forEach(function (g) {
        var lineas = $$(".pe-graf__linea", g), fines = $$(".pe-graf__fin", g), ejes = $$(".pe-graf__eje line", g);
        var tl = gsap.timeline({ scrollTrigger: { trigger: g, start: "top 78%", once: true } });
        tl.from(ejes, { scaleX: 0, transformOrigin: "left center", duration: 0.9, ease: "expo.out", stagger: 0.05 })
          .fromTo(lineas, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", stagger: 0.18 }, 0.25)
          .from($$(".pe-graf__area", g), { opacity: 0, duration: 1.2, ease: "power1.out", clearProps: "opacity" }, 1.2)
          .from(fines, { opacity: 0, x: -10, duration: 0.6, ease: "power2.out", clearProps: "all" }, 1.9);
      });

      // Barras: crecen desde la izquierda
      $$(".pe-barras", raiz).forEach(function (g) {
        gsap.from($$("rect", g), { scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "expo.out", stagger: 0.04, clearProps: "transform",
          scrollTrigger: { trigger: g, start: "top 82%", once: true } });
      });

      // Mapa de posicionamiento: los puntos aparecen y KAIRON llega el último
      $$(".pe-mapa", raiz).forEach(function (g) {
        gsap.from($$(".pe-mapa__punto", g), { opacity: 0, scale: 0.4, transformOrigin: "center center", duration: 0.7, ease: "back.out(1.8)", stagger: 0.12,
          scrollTrigger: { trigger: g, start: "top 78%", once: true } });
      });

      // Embudo de mercado y hoja de ruta: cada escalón entra con un barrido lateral
      $$(".pe-embudo > li, .pe-hitos > li", raiz).forEach(function (li) {
        gsap.from(li, { clipPath: "inset(0% 100% 0% 0%)", duration: 1.1, ease: "expo.out", clearProps: "clipPath",
          scrollTrigger: { trigger: li, start: "top 90%", once: true } });
      });

      // La hoja de cuentas se abre como un documento sobre la mesa
      $$(".pe-hoja", raiz).forEach(function (h) {
        gsap.from(h, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.4, ease: "expo.out", clearProps: "clipPath",
          scrollTrigger: { trigger: h, start: "top 88%", once: true } });
      });
    });
  }
  function desmontar() {
    if (!contexto) return;
    contexto.revert();
    contexto = null;
    html.classList.remove("pe-mov");
    cuentas.forEach(function (el) { el.textContent = el._t; });
    pintar(actual); // deja cifras y barras en su valor final, sin animaciones a medias
  }
  var remontar = function () { setTimeout(function () { desmontar(); montar(); ScrollTrigger.refresh(); }, 0); };

  montar();
  var boton = $(".control--movimiento");
  if (boton) boton.addEventListener("click", remontar);
  window.addEventListener("keydown", function (e) {
    if (e.key.toLowerCase() !== "p" || ["INPUT", "TEXTAREA", "SELECT"].indexOf(document.activeElement.tagName) !== -1) return;
    remontar();
  });
})();
