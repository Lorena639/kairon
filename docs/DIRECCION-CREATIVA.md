# KAIRON — Auditoría y dirección creativa (entrega 1)

## Auditoría (estado actual, rama web-kairon)
- **Arquitectura**: estática (HTML/CSS/JS), Three.js + GSAP/ScrollTrigger + Lenis locales en `js/vendor/`; PWA (`manifest.webmanifest`, `sw.js`); CSP sin scripts inline; versión catalana en `ca/`. Se mantiene: no hace falta un framework.
- **Páginas**: index, sobre-mi, informe, 404 (+ ca/). Todas pasan `tools/comprobar.py`.
- **Funcionalidades a conservar**: formulario (honeypot), simulador de ataque, SOC simulado, informe de ejemplo, menú, idioma, PWA, atajos, modo presentación.
- **Problemas detectados**
  - El hero no tenía titular de mensaje: solo el nombre. → corregido (titular del brief como `h1`).
  - Demasiadas cajas/tarjetas parecidas en servicios, cifras y testimonios.
  - El dorado se usa en casi todo; faltaba un color de "capa digital" (lavanda) y separar el rojo solo para amenazas.
  - Testimonios ficticios y cifras de ejemplo: ya llevan etiqueta ("testimonios ficticios", "datos de ejemplo", "datos simulados"); mantenerlas siempre visibles.
  - Peso: Three.js (~600 KB) se carga siempre; pendiente cargarlo diferido.

## Regla de marca (obligatoria)
El logotipo se usa **exactamente** como en el manual de identidad (carpeta `KAIRON/identidad`): la K serif, las alas, el círculo orbital con sus puntos y el relieve metálico dorado no se redibujan, recolorean ni deforman. En la web solo se usan los PNG originales (`img/kairon-*`); las animaciones pueden moverlo, iluminarlo o darle profundidad, nunca cambiar el dibujo. El nombre usa el wordmark original (O con punto orbital), no texto tipográfico.

## Dirección creativa
- **Idea**: entrar en un centro de operaciones a oscuras donde el oro marca *el instante*.
- **Color con función**: negro/grafito = espacio; blanco roto = lectura; oro = marca y momento clave (un acento por pantalla); lavanda = capa digital/metadatos; cian = datos en movimiento; rojo = solo amenazas.
- **Tipografía**: Cinzel (display, la del logo), Space Grotesk (texto), JetBrains Mono (telemetría).
- **Movimiento**: entra, se asienta y para. Nada se mueve en bucle salvo lo que significa "vigilancia activa" (radar, registro SOC).

## Entregas
1. Auditoría + dirección (este documento) y hero nuevo ✅
2. Filosofía y servicios (composición distinta por servicio)
3. SOC en vivo como herramienta (filtros, cronología, estados)
4. Método, incidente, cifras, equipo, contacto
5. Responsive, rendimiento (Three.js diferido) y accesibilidad
