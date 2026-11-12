/* KAIRON · Service worker
   Guarda en caché los archivos de la web la primera vez que se visitan, de modo que
   la app instalada abre al instante y funciona aunque no haya conexión.
   Estrategia: primero red (para ver cambios), y si falla, caché. */

const VERSION = "kairon-v30";
const ARCHIVOS = [
  "./", "./index.html", "./sobre-mi.html", "./informe.html",
  "./servicios.html", "./soc.html", "./contacto.html", "./productos.html", "./proyectos.html", "./futuro.html", "./kairos.html", "./metodo.html", "./incidente.html", "./preguntas.html", "./laboratorio.html", "./ca/index.html", "./ca/servicios.html", "./ca/soc.html", "./ca/contacto.html", "./ca/productos.html", "./ca/proyectos.html", "./ca/futuro.html", "./ca/sobre-mi.html", "./ca/informe.html", "./ca/kairos.html", "./ca/metodo.html", "./ca/incidente.html", "./ca/preguntas.html", "./ca/laboratorio.html", "./data-chip.html", "./legal.html", "./ca/data-chip.html", "./ca/legal.html", "./plan.html", "./ca/plan.html",
  "./css/styles.css", "./css/fuentes.css", "./fonts/cinzel-latin-1.woff2", "./fonts/cinzel-latin-ext-0.woff2", "./fonts/jetbrains-mono-latin-3.woff2", "./fonts/jetbrains-mono-latin-ext-2.woff2", "./fonts/space-grotesk-latin-5.woff2", "./fonts/space-grotesk-latin-ext-4.woff2", "./js/main.js", "./js/escena.js", "./js/intro.js", "./js/polvo.js", "./js/visuales.js", "./js/detalle.js", "./js/paginas.js", "./js/datachip.js", "./css/datachip.css", "./js/plan.js", "./css/plan.css", "./js/mundo.js", "./js/v6.js", "./js/vendor/fluido.js", "./img/relieve/kairon-relieve-logo.png", "./img/relieve/kairon-relieve-emblema.png", "./img/relieve/kairon-relieve-horizontal.png", "./img/relieve/kairon-relieve-wordmark.png", "./img/relieve/kairon-relieve-mini.png",
  "./js/vendor/three.min.js", "./js/vendor/postprocessing.min.js", "./js/k3d-forma.js", "./js/vendor/gsap.min.js", "./js/vendor/ScrollTrigger.min.js", "./js/vendor/SplitText.min.js", "./js/vendor/ScrambleTextPlugin.min.js", "./js/vendor/lenis.min.js",
  "./manifest.webmanifest", "./img/favicon.ico", "./img/apple-touch-icon.png",
  "./img/app-icon-192.png", "./img/app-icon-512.png", "./img/kairon-emblema-192.png",
  "./img/kairon-emblema-dorado.png", "./img/kairon-logo-horizontal-dorado-440.png", "./img/kairon-logo-dorado.png",
  "./img/avatar-lorena.svg", "./img/avatar-dani.svg", "./img/og-image.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }) // siempre revalida con el servidor: los cambios se ven al recargar
      .then((resp) => {
        if (resp.ok && new URL(e.request.url).origin === location.origin) {
          const copia = resp.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copia));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
