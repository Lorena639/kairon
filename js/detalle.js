/* =========================================================
   KAIRON · Páginas de detalle (metodo, incidente, preguntas, kairos)
   Comportamiento propio de estas cuatro páginas. Se carga después de main.js.
   - Todo va dentro de una función para no chocar con las variables de main.js.
   - El contenido ya se ve sin este archivo: aquí solo se añade movimiento y dos pequeñas
     herramientas (huella SHA-256 en vivo y calculadora de precio).
   - Se respeta "reducir movimiento" (sistema y botón de la web) y el modo presentación.
   ========================================================= */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    raiz.classList.contains("presentacion") ||
    raiz.classList.contains("menos-movimiento");
  var hayST = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  // Solo con esta clase el CSS prepara los estados de partida de las animaciones
  if (!quieto) raiz.classList.add("det-mov");

  /* ---------- 1. Bloques que se dibujan al entrar en pantalla (calendario, barras a escala) ---------- */
  var observados = document.querySelectorAll(".det-observar");
  if (observados.length) {
    if (quieto || !("IntersectionObserver" in window)) {
      observados.forEach(function (el) { el.classList.add("es-visible"); });
    } else {
      var vigia = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("es-visible"); vigia.unobserve(e.target); }
        });
      }, { threshold: 0.3 });
      observados.forEach(function (el) { vigia.observe(el); });
    }
  }

  /* ---------- 2. Incidente: el trazo de la línea de tiempo avanza con el scroll ---------- */
  var linea = document.querySelector(".det-linea");
  if (linea) {
    var momentos = Array.prototype.slice.call(linea.querySelectorAll(".det-linea__momento"));
    var instante = linea.querySelector(".det-linea__momento--instante");

    // El trazo pasa de rojo a oro justo a la altura del nodo de la contención
    var medir = function () {
      if (instante) linea.style.setProperty("--det-corte", instante.offsetTop + "px");
    };
    medir();
    window.addEventListener("resize", medir);
    window.addEventListener("load", medir);

    if (!quieto && hayST) {
      linea.classList.add("det-linea--viva");
      var pintar = function (avance) {
        linea.style.setProperty("--det-avance", avance.toFixed(4));
        var alto = linea.offsetHeight * avance;
        momentos.forEach(function (m) { m.classList.toggle("es-pasado", m.offsetTop <= alto + 2); });
      };
      pintar(0);
      ScrollTrigger.create({
        trigger: linea,
        start: "top 62%",
        end: "bottom 62%",
        scrub: 0.4,
        onUpdate: function (self) { pintar(self.progress); },
        onRefresh: function (self) { medir(); pintar(self.progress); }
      });
    }
  }

  /* ---------- 3. La idea: la luz del emblema sigue a la parte que se está leyendo ---------- */
  var pieza = document.querySelector(".det-emblema__pieza");
  var partes = document.querySelectorAll(".det-emblema__parte[data-parte]");
  if (pieza && partes.length && "IntersectionObserver" in window) {
    var foco = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) pieza.dataset.parte = e.target.dataset.parte;
      });
    }, { rootMargin: "-48% 0px -48% 0px" }); // una franja en el centro de la pantalla
    partes.forEach(function (p) { foco.observe(p); });
  }

  /* ---------- 4. Incidente: huella SHA-256 calculada en el navegador ---------- */
  var huella = document.querySelector(".det-huella");
  if (huella && window.crypto && window.crypto.subtle && typeof TextEncoder !== "undefined") {
    var campo = huella.querySelector("input");
    var salida = huella.querySelector("output");
    var calcular = function () {
      window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(campo.value)).then(function (bytes) {
        salida.textContent = Array.prototype.map.call(new Uint8Array(bytes), function (b) {
          return ("0" + b.toString(16)).slice(-2);
        }).join("");
      });
    };
    campo.addEventListener("input", calcular);
    calcular();
    huella.hidden = false;
  }

  /* ---------- 5. Preguntas: calculadora de plan según el número de equipos ----------
     Planes del capítulo 2 del proyecto (tabla 6). Se recomienda el plan más pequeño en el que caben los equipos.
     Égida: 590 € con 25 equipos incluidos y 12 € por cada equipo adicional, hasta 100.
     Los textos (IVA, "por equipo"...) vienen de atributos data-* del HTML, así sirve igual en castellano y en catalán. */
  var calc = document.querySelector(".det-calc");
  if (calc) {
    var PLANES = [
      { id: "vigia", hasta: 2, precio: 9.9 },
      { id: "centinela", hasta: 5, precio: 24.9 },
      { id: "guardian", hasta: 10, precio: 64.9 },
      { id: "egida", hasta: 100, precio: 590, incluidos: 25, extra: 12 }
    ];
    var rango = calc.querySelector("input");
    var cuenta = calc.querySelector("output");
    var resNombre = calc.querySelector(".det-calc__resultado b");
    var resTexto = calc.querySelector(".det-calc__resultado span");
    var celdas = document.querySelectorAll(".det-planes [data-col]");
    var txt = calc.dataset;
    // 9.9 -> "9,90 €" · 1010 -> "1.010 €" (separadores a mano: "es-ES" no agrupa los números de cuatro cifras)
    var dinero = function (n) {
      var partes = n.toFixed(2).split(".");
      return partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (partes[1] === "00" ? "" : "," + partes[1]) + " €";
    };
    var recalcular = function () {
      var n = parseInt(rango.value, 10) || 1;
      var plan = PLANES[PLANES.length - 1];
      for (var i = 0; i < PLANES.length; i++) { if (n <= PLANES[i].hasta) { plan = PLANES[i]; break; } }
      var cabecera = document.querySelector('.det-planes thead [data-col="' + plan.id + '"] .det-planes__nombre');
      resNombre.textContent = cabecera ? cabecera.textContent : "";
      if (n > 100) {
        cuenta.textContent = txt.mas;
        resTexto.textContent = txt.hablemos;
      } else {
        var total = plan.precio + (plan.extra ? Math.max(0, n - plan.incluidos) * plan.extra : 0);
        cuenta.textContent = n;
        resTexto.textContent = dinero(total) + " " + (plan.extra ? txt.masIva : txt.ivaIncl) +
          (plan.extra && n > plan.incluidos ? " (" + dinero(total / n) + " " + txt.porEquipo + ")" : "");
      }
      // La columna del plan recomendado se marca en la tabla
      celdas.forEach(function (c) { c.classList.toggle("det-planes__sugerido", c.dataset.col === plan.id); });
    };
    rango.addEventListener("input", recalcular);
    recalcular();
    calc.hidden = false;
  }

  /* ---------- 6. Preguntas: al desplegar una respuesta cambia el alto de la página; se avisa a ScrollTrigger ---------- */
  if (hayST) {
    document.querySelectorAll(".det-grupo details").forEach(function (d) {
      d.addEventListener("toggle", function () { ScrollTrigger.refresh(); });
    });
  }
})();
