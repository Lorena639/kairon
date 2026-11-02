# KAIRON · Memoria técnica de la web (borrador)

Borrador para el capítulo de la web en la memoria del TFG y para la entrega de la práctica A1-RA1 (0228 Aplicaciones Web). Formato de entrega según la guía del centro: Calibri 11, justificado, títulos en negrita, cada captura y fragmento de código explicado, fuentes consultadas y uso de IA declarado.

Capturas disponibles en `docs/capturas/` (01 a 09).

## 1. Introducción y objetivo

KAIRON es una empresa ficticia de ciberseguridad que ofrece un SOC (centro de operaciones de seguridad) gestionado a pymes. La web es su cara pública y la parte "visible" del TFG: debe transmitir confianza, explicar el servicio en lenguaje claro y, a la vez, demostrar en la propia web las capacidades técnicas del equipo (seguridad, animación, accesibilidad). El nombre viene de *kairós*, el instante oportuno: detectar y actuar en el momento justo.

## 2. Requisitos del enunciado y cómo se cumplen

| Requisito | Dónde |
|---|---|
| Dos páginas HTML enlazadas con menú funcional | `index.html` y `sobre-mi.html` (más `informe.html` como extra) |
| Header con logo, menú y CTA | Cabecera fija con logo con brillo, menú y botón "Auditoría gratuita" |
| Hero con título, subtítulo e imagen o banner | Titular "El momento justo" sobre la escena 3D del radar |
| Mínimo 3 tarjetas de servicios con Grid o Flexbox | Tres paneles de servicio (Flexbox, scroll horizontal) y tarjetas de cifras (Grid) |
| Testimonios o beneficios | Sección "Lo que dicen de nosotros" (ficticios) y "Lo que vigilamos" |
| Footer con formulario, redes y copyright | Contacto con formulario validado, iconos SVG en línea y pie con derechos |
| Perfil con avatar, rol, habilidades y enlaces | Tarjetas de Lorena y João Daniel con niveles de competencias y GitHub |
| Valores y visión | Sección "Cómo entendemos la seguridad" |
| CSS externo organizado, responsive, semántico, `alt`, `label` | `css/styles.css` por bloques comentados; media queries 720 / 1024 px; etiquetas `header`, `nav`, `main`, `section`, `article`, `footer` |
| Código comentado y README | Todos los archivos llevan comentarios por bloque; `README.md` con la estructura pedida |

## 3. Identidad visual

- **Colores** (hoja de marca): dorado `#D4AF7A` y dorado oscuro `#8C6B3F` (confianza, lo clásico), azul oscuro `#0B0F14` y marfil `#F8F5EE`; cian `#35C6D6` como acento tecnológico y de alertas.
- **Tipografía**: Cinzel, la misma serif del logo, en todos los títulos y en el nombre KAIRON de la portada (coherencia con la marca); Space Grotesk para texto corrido y JetBrains Mono para datos y etiquetas (estética de consola de un SOC).
- **Logo**: K alada sobre una esfera de brújula. Versiones completa, horizontal, emblema, sello y app icon en `img/`.

## 4. Estructura y tecnologías

- HTML5 semántico, CSS3 (variables, Grid, Flexbox, animaciones, `@property`), JavaScript propio.
- Librerías, copiadas en `js/vendor/` para no depender de internet: **Three.js** (escena 3D), **GSAP + ScrollTrigger** (animaciones ligadas al scroll) y **Lenis** (scroll suave). Son de JavaScript, no de CSS; se justifica su uso por la experiencia inmersiva que pide el proyecto.
- Sin frameworks de CSS ni librerías de iconos: los iconos son SVG en línea.

## 5. Experiencia e interacción

- Preloader con contador e intro del logo en JavaScript puro (canvas 2D): miles de partículas doradas, cuyas posiciones salen de leer los píxeles del PNG, convergen hasta formar el logo; se funde con el logo con acabado de oro metálico, pasa un destello y el logo vuela hasta la cabecera mientras se abren las cortinas. Pasos del incidente como tarjetas apiladas con `position: sticky`; cursor personalizado; scroll suave; cabecera que se oculta al bajar.
- Portada: emblema del logo en 3D (dieciocho capas apiladas con `translateZ`, acabado de oro metálico y canto en sombra) que gira siguiendo al ratón, sobre el nombre KAIRON con degradado de oro y el lema.
- Escena 3D: globo de nodos (equipos vigilados), red, barrido de radar, paquetes de datos, polvo con parallax; nodos que se vuelven rojos al detectarse una amenaza. Modo ligero automático si el equipo baja de 30 fps; radar 2D de reserva sin WebGL.
- Servicios con scroll horizontal fijado; panel "SOC en vivo" con gráfica, contador y alertas simuladas; sección "Del ataque al informe" con botón que simula un ataque de principio a fin.
- Secciones claras color marfil (El método, testimonios) con relieve topográfico generado por código (curvas de nivel sobre ruido, `tools/topografia.py`), alternando con los bloques oscuros como en las webs de referencia; escena 3D fija cuya cámara se aleja con el scroll; palabras gigantes de fondo con parallax; cortinillas diagonales de entrada; contadores tipo odómetro; polvo de oro que sigue al cursor.
- Atajos de teclado para presentar (`A`, flechas, `E`, `P`, `?`).

## 6. Seguridad de la propia web

- Política de seguridad de contenido (CSP) en `meta`: recursos solo del propio sitio y Google Fonts, sin scripts en línea.
- `Referrer-Policy` estricta, `rel="noopener"` en enlaces externos, campo trampa anti-spam en el formulario, sin cookies ni rastreadores.
- Service worker con caché para funcionar sin conexión como app instalada (manifest + iconos).

## 7. Accesibilidad e idiomas

- Enlace "saltar al contenido", foco visible, `aria-label` y `aria-live` en las listas de alertas, `prefers-reduced-motion` respetado y botón "Reducir movimiento".
- Versión en catalán en `ca/` con selector ES / CA y textos de JavaScript traducidos.

## 8. Pruebas realizadas

- Comprobación de estructura HTML y de errores de consola en Chromium con `tools/comprobar.py` (siete páginas).
- Pruebas manuales en escritorio (1280 y 1440 px) y móvil (375 y 390 px), con y sin conexión, y con movimiento reducido.
- Pendiente: validador W3C oficial (HTML y CSS) antes de la entrega.

## 9. Conclusiones y líneas futuras

- Qué ha costado más: fusionar las dos versiones iniciales, mantener la CSP sin romper las librerías, el rendimiento del 3D en equipos modestos.
- Líneas futuras: fotos reales del equipo, LinkedIn, publicación en GitHub Pages, y KAIRON Data Chip (identidad y trazabilidad por dato) como evolución técnica del proyecto.

## 10. Fuentes consultadas y uso de IA

- MDN Web Docs (HTML, CSS, Web APIs), documentación de Three.js, GSAP y Lenis, Google Fonts.
- Referencias visuales: activetheory.net, lusion.co, landonorris.com.
- IA: se ha usado como apoyo para proponer la estructura, generar versiones del logo, escribir y revisar código y traducir al catalán. Todo el contenido se ha revisado y se puede explicar.
