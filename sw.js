/* KAIRON · Service worker
   Guarda en caché los archivos de la web la primera vez que se visitan, de modo que
   la app instalada abre al instante y funciona aunque no haya conexión.
   Estrategia: primero red (para ver cambios), y si falla, caché. */

const VERSION = "kairon-v13";
const ARCHIVOS = [
  "./", "./index.html", "./sobre-mi.html", "./informe.html",
  "./servicios.html", "./soc.html", "./contacto.html", "./proyectos.html", "./futuro.html", "./ca/index.html", "./ca/servicios.html", "./ca/soc.html", "./ca/contacto.html", "./ca/proyectos.html", "./ca/futuro.html", "./ca/sobre-mi.html", "./ca/informe.html",
  "./css/styles.css", "./js/main.js", "./js/escena.js", "./js/intro.js", "./js/polvo.js", "./js/visuales.js",
  "./js/vendor/three.min.js", "./js/vendor/gsap.min.js", "./js/vendor/ScrollTrigger.min.js", "./js/vendor/lenis.min.js",
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
