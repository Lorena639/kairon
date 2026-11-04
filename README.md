# KAIRON-TFG

Web corporativa de **KAIRON**, empresa ficticia de ciberseguridad (SOC gestionado) creada para la práctica A1-RA1 de *Aplicaciones Web* (2º CFGM SMX, Digitech) y como parte web del TFG.

Autores: Lorena (ciberseguridad y análisis forense) y Daniel Oliva ([jdanioliv](https://github.com/jdanioliv), programación).

## Estructura

```
KAIRON-TFG/
├── index.html          Landing: hero 3D (fijo, ligado al scroll), marquee, manifiesto, servicios en scroll horizontal, panel SOC simulado, "El método" (sección clara con scrollytelling), incidente con simulador, cifras con odómetro, testimonios sobre marfil, FAQ, equipo y contacto
├── sobre-mi.html       Equipo (Lorena y João Daniel) con niveles de competencias, hoja de ruta del TFG, valores y visión
├── ca/                 Versión en catalán de las tres páginas (selector ES / CA en la cabecera)
├── 404.html            Página de error con el estilo de la web (GitHub Pages la usa automáticamente)
├── sw.js               Service worker: caché de la web para abrirla sin conexión como app instalada
├── informe.html        Informe de incidente de ejemplo (caso KAIRON-0428): cronología, evidencias con SHA-256, análisis y recomendaciones; imprimible a PDF
├── css/
│   └── styles.css      Estilos (variables de marca en :root, animaciones, media queries)
├── js/
│   ├── main.js         Preloader, cortina, cursor, menú móvil, botones magnéticos, scroll suave, animaciones, panel SOC simulado y formulario
│   ├── visuales.js     Visuales por sección en canvas: escudo de contención, informe que se escribe, mapa de amenazas
│   ├── polvo.js        Polvo de oro que sigue al cursor (JavaScript puro)
│   ├── intro.js        Intro del logo en JavaScript puro: partículas doradas que forman el logo, acabado metálico, destello y vuelo a la cabecera
│   ├── escena.js       Escena 3D de la portada (Three.js) con radar 2D de reserva si no hay WebGL
│   └── vendor/         Copias locales de Three.js, GSAP, ScrollTrigger y Lenis
├── manifest.webmanifest  Permite instalar la web como app (PWA) con el icono KAIRON
├── img/                Logo KAIRON (completo y emblema, dorado y blanco), favicon, icono táctil y avatar placeholder
├── docs/capturas/      Capturas de la web (escritorio, secciones y móvil) para la memoria
├── docs/MEMORIA-WEB.md Borrador de la memoria técnica de la web
├── tools/comprobar.py  Comprueba el HTML y los errores de consola de todas las páginas (python tools/comprobar.py)
├── tools/topografia.py Genera img/topografia.svg (curvas de nivel) para las secciones claras
├── tools/capturas.py   Genera las capturas de docs/capturas con Chromium (python tools/capturas.py)
├── robots.txt, sitemap.xml  Ficheros para buscadores
├── PLANIFICACION.md    Planificación previa al desarrollo
└── README.md
```

## Tecnologías

- HTML5 semántico y CSS3 (Grid, Flexbox, media queries, animaciones).
- JavaScript propio (`js/main.js`, `js/escena.js`).
- Librerías guardadas en `js/vendor/` (copias locales, no hace falta internet), cada una con una función concreta:
  - **Three.js** (0.160): escena 3D de la portada, un globo de nodos con barrido de radar.
  - **GSAP + ScrollTrigger** (3.12): animaciones de entrada y ligadas al scroll.
  - **Lenis** (1.1): scroll suave con inercia.
- Tipografía: Cinzel (la serif del logo) para todos los títulos y el nombre en la portada, Space Grotesk para texto y JetBrains Mono para datos (Google Fonts).
- Instalable como app (manifest + iconos + service worker con caché; una vez visitada, abre sin conexión). Botón "Instalar app" en el pie cuando el navegador lo permite y aviso de "sin conexión".
- Disponible en castellano y catalán (`ca/`), con los textos generados por JavaScript también traducidos.

> Nota para la práctica: el enunciado pide "sin frameworks ni librerías de CSS". No se usa ninguna librería de CSS; las tres librerías de JS se usan solo para la experiencia 3D y el scroll, y se justifican en la memoria.

## Marca

- Nombre: **KAIRON**, de *kairos*, el instante oportuno. La empresa actúa en el momento justo.
- Logo: K alada sobre una esfera de brújula. Paleta de la hoja de marca: dorado `#D4AF7A`, dorado oscuro `#8C6B3F`, azul oscuro `#0B0F14`, marfil `#F8F5EE`.
- Acabado **oro metálico** en todos los logos: la imagen se usa como máscara y el color lo pone un degradado dorado con luz en movimiento (`.oro-metal`).
- Versiones del logo en `img/`: completo (`kairon-logo-*.png`), horizontal (`kairon-logo-horizontal-*.png`), solo texto (`kairon-wordmark-*.png`), emblema (`kairon-emblema-*.png`), sello (`kairon-sello-oro.png`), iconos de app (`app-icon-*.png`) e imagen para redes (`og-image.jpg`).

## Uso

Doble clic en `index.html` debería bastar. Si el navegador no carga bien la escena abriendo el archivo directamente, arranca un servidor local en la carpeta y entra en http://localhost:8765:

```
python -m http.server 8765
```

## Publicar en GitHub Pages

1. En el repositorio, *Settings → Pages → Source: Deploy from a branch*, rama `main`, carpeta `/ (root)`.
2. La web queda en `https://<usuario>.github.io/<repositorio>/`. El archivo `.nojekyll` evita que GitHub procese la carpeta y `404.html` se usa como página de error.
3. Como todas las rutas son relativas, funciona en cualquier subcarpeta.

## Seguridad de la propia web

- **CSP** (Content Security Policy) en una etiqueta `meta`: solo se cargan scripts e imágenes de este sitio, estilos propios y fuentes de Google Fonts; nada de scripts en línea.
- **Referrer-Policy** estricta y enlaces externos con `rel="noopener"`.
- Formulario con **campo trampa** (honeypot) anti-spam.
- Sin cookies ni rastreadores.

## Atajos de teclado (para presentar)

- `A` simula un ataque, `↓` / `↑` cambian de sección, `Inicio` / `Fin` van arriba o al contacto, `E` abre la página de equipo, `P` activa el modo presentación (texto más grande, sin cursor ni efectos) y `?` muestra la ayuda.

## Pendiente

- Enlace real de LinkedIn en `sobre-mi.html`.
- Avatar real (ahora son iniciales en SVG: `img/avatar-lorena.svg` y `img/avatar-dani.svg`).
- Validación con el validador W3C.
