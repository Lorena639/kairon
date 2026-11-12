/* =========================================================
   KAIRON · Data Chip y Legalidad
   Comportamiento propio de data-chip.html y legal.html. Se carga después de main.js y antes de
   paginas.js, para que la escena fijada de la demo se cree antes que el resto de animaciones.

   Qué hace:
   1. Demo "El viaje de los datos de Irene": lee los seis movimientos que ya están escritos en el
      HTML, los recorre (con el scroll, con las flechas o pulsando uno) y dibuja la ruta en el mapa.
   2. Huellas encadenadas: calcula en el navegador el SHA-256 de cada movimiento incluyendo la
      huella del anterior. Si se edita un movimiento, se ve qué eslabones dejan de coincidir.
   3. Hilos que se llenan con el scroll (piezas y fases) e índice de lectura de legal.html.

   Reglas:
   - Sin este archivo todo se lee: el mapa aparece dibujado entero y los movimientos abiertos.
   - "Reducir movimiento" (sistema o botón) y el modo presentación (tecla P): nada se fija ni se
     recorta; la demo sigue funcionando con las flechas. Al cambiar de modo se vuelve a montar.
   - Todos los datos de la demo son ficticios y nada de lo que se escribe sale de la página.
   ========================================================= */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var hayGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var reducidoSO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var quieto = function () {
    return reducidoSO || raiz.classList.contains("menos-movimiento") || raiz.classList.contains("presentacion");
  };
  // La escena solo se fija en pantallas anchas y con altura suficiente para leer un movimiento entero
  var cabeFija = function () { return window.innerWidth >= 1200 && window.innerHeight >= 720; };

  /* ---------- 1. Demo: recorrido de los datos ---------- */
  var escena = $(".dc-escena");
  var movs = escena ? $$(".dc-mov", escena) : [];
  var rutas = {}, nodos = {};
  var pulso = escena ? $(".dc-pulso", escena) : null;
  var cuenta = escena ? $(".dc-cuenta b", escena) : null;
  var cajaPasos = escena ? $(".dc-pasos", escena) : null;
  var botones = cajaPasos ? $$(".dc-paso", cajaPasos) : [];
  var actual = -1;
  var fijada = null;      // ScrollTrigger de la escena fijada (solo escritorio con movimiento)
  var animPulso = null;

  if (escena) {
    $$(".dc-ruta", escena).forEach(function (r) { rutas[r.getAttribute("data-ruta")] = r; });
    $$(".dc-nodo", escena).forEach(function (n) { nodos[n.getAttribute("data-nodo")] = n; });
  }

  // El punto de luz recorre la ruta del movimiento que se acaba de activar
  function lanzarPulso(ruta, alReves) {
    if (!pulso || !ruta || !hayGSAP || quieto()) return;
    if (animPulso) animPulso.kill();
    var largo = ruta.getTotalLength(), estado = { t: 0 };
    animPulso = gsap.to(estado, {
      t: 1, duration: 1.05, ease: "power2.inOut",
      onUpdate: function () {
        var p = ruta.getPointAtLength((alReves ? 1 - estado.t : estado.t) * largo);
        pulso.setAttribute("cx", p.x.toFixed(1));
        pulso.setAttribute("cy", p.y.toFixed(1));
        pulso.style.opacity = String(Math.sin(estado.t * Math.PI));
      },
      onComplete: function () { pulso.style.opacity = "0"; }
    });
  }

  function activar(i, sinPulso) {
    if (!movs.length) return;
    i = Math.max(0, Math.min(movs.length - 1, i));
    if (i === actual) return;
    var antes = actual;
    actual = i;
    var vistos = {}, apagados = {};
    movs.forEach(function (m, k) {
      m.classList.toggle("es-activo", k === i);
      m.classList.toggle("es-pasado", k < i);
      if (k === i) m.setAttribute("aria-current", "step"); else m.removeAttribute("aria-current");
      var ruta = rutas[m.getAttribute("data-ruta")];
      if (ruta) {
        ruta.classList.toggle("es-trazada", k <= i);
        ruta.classList.toggle("es-activa", k === i);
      }
      if (k <= i) {
        vistos[m.getAttribute("data-de")] = true;
        vistos[m.getAttribute("data-a")] = true;
        if (m.hasAttribute("data-apaga")) apagados[m.getAttribute("data-apaga")] = true;
      }
    });
    var m = movs[i];
    Object.keys(nodos).forEach(function (id) {
      var n = nodos[id];
      n.classList.toggle("es-visto", !!vistos[id]);
      n.classList.toggle("es-activo", id === m.getAttribute("data-de") || id === m.getAttribute("data-a"));
      n.classList.toggle("es-apagado", !!apagados[id]);
    });
    if (cuenta) cuenta.textContent = String(i + 1).padStart(2, "0");
    if (botones.length) {
      botones[0].disabled = i === 0;
      botones[1].disabled = i === movs.length - 1;
    }
    if (!sinPulso) lanzarPulso(rutas[m.getAttribute("data-ruta")], i < antes);
  }

  // Ir a un movimiento: si la escena está fijada se desplaza la página hasta su tramo; si no, se activa y se acerca
  function ir(i, conFoco) {
    i = Math.max(0, Math.min(movs.length - 1, i));
    if (fijada) {
      var y = fijada.start + (fijada.end - fijada.start) * ((i + 0.5) / movs.length);
      if (window.kaironLenis) window.kaironLenis.scrollTo(y, { duration: 0.9 });
      else window.scrollTo(0, y);
      return;
    }
    activar(i);
    if (conFoco) movs[i].scrollIntoView({ block: "nearest", behavior: quieto() ? "auto" : "smooth" });
  }

  if (escena && movs.length) {
    escena.classList.add("dc-escena--viva");
    if (cajaPasos) cajaPasos.hidden = false;
    botones.forEach(function (b) {
      b.addEventListener("click", function () { ir(actual + Number(b.getAttribute("data-paso")), true); });
    });
    movs.forEach(function (m, k) {
      m.addEventListener("click", function () { if (k !== actual) ir(k, false); });
    });
    activar(0, true);
  }

  /* ---------- 2. Huellas SHA-256 encadenadas ---------- */
  var prueba = $(".dc-prueba");
  var puedeHash = !!(window.crypto && window.crypto.subtle && typeof TextEncoder !== "undefined");

  function sha256(texto) {
    return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto)).then(function (bytes) {
      return Array.prototype.map.call(new Uint8Array(bytes), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
  }

  // Texto de un movimiento tal como se "firma": sus campos en orden fijo
  function canonico(m, k) {
    var campo = function (nombre) {
      var el = $('[data-campo="' + nombre + '"]', m);
      if (!el) return "";
      return (nombre === "fecha" ? el.getAttribute("datetime") : el.textContent).trim().replace(/\s+/g, " ");
    };
    return [k + 1, campo("fecha"), campo("de"), campo("a"), campo("datos"), campo("finalidad"), campo("base"), campo("pais")].join("|");
  }

  // Cada huella incluye la anterior: cambiar un movimiento cambia todas las que vienen después
  function cadena() {
    var huellas = [];
    return movs.reduce(function (previa, m, k) {
      return previa.then(function (anterior) {
        return sha256(anterior + "\n" + canonico(m, k)).then(function (h) { huellas.push(h); return h; });
      });
    }, Promise.resolve("KAIRON-DATA-CHIP-DEMO")).then(function () { return huellas; });
  }

  if (prueba && movs.length && puedeHash) {
    var selector = $("#dc-cual", prueba), campoFin = $("#dc-finalidad", prueba);
    var estado = $(".dc-prueba__estado", prueba), lista = $(".dc-cadena", prueba), restaurar = $(".dc-restaurar", prueba);
    var originales = movs.map(function (m) { return $('[data-campo="finalidad"]', m).textContent; });
    var registradas = null, filas = [], turno = 0;

    movs.forEach(function (m, k) {
      var quien = $(".dc-mov__quien", m);
      var de = $('[data-campo="de"]', m).textContent, a = $('[data-campo="a"]', m).textContent;
      var op = document.createElement("option");
      op.value = String(k);
      op.textContent = (k + 1) + " · " + de + " → " + a;
      selector.appendChild(op);

      var li = document.createElement("li"), n = document.createElement("span"), e = document.createElement("span"), c = document.createElement("code");
      n.className = "dc-cadena__n";
      n.textContent = prueba.getAttribute("data-fila").replace("{n}", k + 1) + (quien ? " · " + a : "");
      e.className = "dc-cadena__estado";
      li.appendChild(n); li.appendChild(e); li.appendChild(c);
      lista.appendChild(li);
      filas.push({ li: li, estado: e, codigo: c });
    });

    var pintar = function () {
      var mio = ++turno;
      cadena().then(function (huellas) {
        if (mio !== turno) return; // ha habido otra pulsación mientras se calculaba
        if (!registradas) registradas = huellas.slice();
        var primera = -1;
        huellas.forEach(function (h, k) {
          var igual = h === registradas[k];
          if (!igual && primera < 0) primera = k;
          var marca = igual ? "ok" : "roto";
          filas[k].li.setAttribute("data-estado", marca);
          filas[k].codigo.textContent = h;
          filas[k].estado.textContent = prueba.getAttribute(igual ? "data-estado-ok" : "data-estado-roto");
          movs[k].setAttribute("data-estado", marca);
          var cod = $(".dc-mov__huella code", movs[k]);
          if (cod) cod.textContent = h;
        });
        estado.setAttribute("data-estado", primera < 0 ? "ok" : "roto");
        estado.textContent = primera < 0 ? prueba.getAttribute("data-ok") : prueba.getAttribute("data-roto").replace("{n}", primera + 1);
      });
    };

    var cargarCampo = function () {
      campoFin.value = $('[data-campo="finalidad"]', movs[Number(selector.value)]).textContent;
    };
    selector.addEventListener("change", function () {
      cargarCampo();
      if (!fijada) activar(Number(selector.value), true);
    });
    campoFin.addEventListener("input", function () {
      $('[data-campo="finalidad"]', movs[Number(selector.value)]).textContent = campoFin.value;
      pintar();
    });
    restaurar.addEventListener("click", function () {
      movs.forEach(function (m, k) { $('[data-campo="finalidad"]', m).textContent = originales[k]; });
      cargarCampo();
      pintar();
    });

    selector.value = "3"; // el movimiento que sale del EEE: el más interesante para probar
    cargarCampo();
    pintar();
    prueba.hidden = false;
  }

  /* ---------- 3. Índice de lectura (legal.html): marca el bloque que se está leyendo ---------- */
  var indice = $(".lg-indice");
  if (indice && "IntersectionObserver" in window) {
    var enlaces = $$("a[href^='#']", indice);
    var bloques = enlaces.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var visibles = {};
    var marcar = function () {
      var elegido = -1;
      bloques.forEach(function (b, k) { if (b && visibles[b.id] && elegido < 0) elegido = k; });
      if (elegido < 0) return;
      enlaces.forEach(function (a, k) {
        if (k === elegido) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    };
    var ojo = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { visibles[e.target.id] = e.isIntersecting; });
      marcar();
    }, { rootMargin: "-18% 0px -62% 0px" });
    bloques.forEach(function (b) { if (b) ojo.observe(b); });
  }

  /* ---------- 4. Movimiento: escena fijada, movimiento activo según el scroll e hilos ---------- */
  if (!hayGSAP) return;
  var contexto = null;

  function montar() {
    if (contexto || quieto()) return;
    raiz.classList.add("dc-anima");
    contexto = gsap.context(function () {
      if (escena && movs.length) {
        if (cabeFija()) {
          // Escritorio: la escena se queda fija y el scroll pasa los seis movimientos
          escena.classList.add("dc-escena--fija");
          fijada = ScrollTrigger.create({
            trigger: escena, pin: true, start: "top top",
            end: function () { return "+=" + Math.round(window.innerHeight * 0.6 * movs.length); },
            scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: function (self) { activar(Math.floor(self.progress * movs.length - 0.0001)); },
            onRefresh: function (self) { activar(Math.floor(self.progress * movs.length - 0.0001), true); }
          });
        } else {
          // Móvil: la lista baja bajo el mapa y se activa el movimiento que cruza la línea de lectura
          ScrollTrigger.create({
            trigger: $(".dc-registro", escena), start: "top 70%", end: "bottom 60%",
            onUpdate: function () {
              var linea = window.innerHeight * 0.66, k = 0;
              movs.forEach(function (m, j) { if (m.getBoundingClientRect().top <= linea) k = j; });
              activar(k);
            }
          });
        }
      }
      // Hilos de las listas con orden: se llenan a medida que se leen
      $$(".dc-hilo").forEach(function (h) {
        h.style.setProperty("--dc-avance", "0");
        ScrollTrigger.create({
          trigger: h, start: "top 78%", end: "bottom 62%", scrub: 0.5,
          onUpdate: function (self) { h.style.setProperty("--dc-avance", self.progress.toFixed(4)); }
        });
      });
      // La anotación de ejemplo se descubre de arriba abajo, como las tablas del resto de la web
      var recibo = $(".dc-recibo pre");
      if (recibo) gsap.from(recibo, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.5, ease: "expo.out", clearProps: "clipPath",
        scrollTrigger: { trigger: recibo, start: "top 88%", once: true } });
      // Los seis límites entran con un barrido lateral, uno tras otro
      var noes = $$(".dc-noes li");
      if (noes.length) {
        gsap.set(noes, { clipPath: "inset(0% 100% 0% 0%)" });
        ScrollTrigger.batch(noes, { start: "top 90%", once: true, onEnter: function (lote) {
          gsap.to(lote, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.out", stagger: 0.09,
            onComplete: function () { gsap.set(lote, { clearProps: "clipPath" }); } });
        } });
      }
      // La prueba de la cadena: cortina
      if (prueba && !prueba.hidden) gsap.from(prueba, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.4, ease: "expo.out", clearProps: "clipPath",
        scrollTrigger: { trigger: prueba, start: "top 88%", once: true } });
    });
  }

  function desmontar() {
    if (!contexto) return;
    contexto.revert();
    contexto = null;
    fijada = null;
    if (animPulso) { animPulso.kill(); animPulso = null; }
    if (pulso) pulso.style.opacity = "0";
    raiz.classList.remove("dc-anima");
    if (escena) escena.classList.remove("dc-escena--fija");
    $$(".dc-hilo").forEach(function (h) { h.style.removeProperty("--dc-avance"); });
  }

  var remontar = function () { setTimeout(function () { desmontar(); montar(); ScrollTrigger.refresh(); }, 0); };

  montar();

  var botonMovimiento = $(".control--movimiento");
  if (botonMovimiento) botonMovimiento.addEventListener("click", remontar);
  window.addEventListener("keydown", function (e) {
    if (!e.key || e.key.toLowerCase() !== "p" || ["INPUT", "TEXTAREA", "SELECT"].indexOf(document.activeElement.tagName) >= 0) return;
    remontar();
  });
  var cabia = cabeFija();
  window.addEventListener("resize", function () {
    if (cabeFija() === cabia) return;
    cabia = cabeFija();
    remontar();
  });
})();
