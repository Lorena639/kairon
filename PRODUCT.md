# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Quien evalúa el TFG**: el tribunal y la clase de 2.º de SMX en Digitech Barcelona, viendo la web proyectada durante una presentación de 15–20 minutos que maneja Lorena (febrero–marzo de 2027). La ven a varios metros, en un proyector que lava los detalles finos.
- **Quien puede contratar a Lorena o a Dani**: gente del sector que abre la web por su cuenta, en un portátil o en el móvil, como pieza de portfolio. Le dedica uno o dos minutos.
- **El cliente de la empresa ficticia**: una persona sin formación técnica que dirige una pyme, un autónomo o un particular. Teme el ransomware y el RGPD y quiere claridad, precios previsibles y nada de jerga. Es el destinatario del texto, no quien decide si la web gusta.

Confirmado por Lorena el 25-11-2026: la web tiene que impresionar por igual a los dos primeros públicos.

## Product Purpose

KAIRON es una empresa ficticia de ciberseguridad: un SOC (centro de operaciones de seguridad) gestionado. La web es la cara pública de esa empresa y, a la vez, la práctica A1-RA1 de Aplicaciones Web y la parte web del TFG de Lorena y Dani.

Tiene éxito si quien la ve entiende en segundos qué hace KAIRON (detectar un ataque a tiempo, responder en el instante justo y demostrarlo con pruebas), se queda con una imagen concreta en la cabeza y piensa que quien la ha hecho sabe de seguridad y de web.

## Positioning

*Kairos* es el instante oportuno; *chronos*, el tiempo que pasa. KAIRON vigila mientras el tiempo pasa y actúa en el instante: el bloqueo automático funciona a cualquier hora, un analista confirma y llama en horario laboral, y cada prueba queda sellada con hora UTC, número de caso y SHA-256. Detrás hay un laboratorio real (Wazuh y una herramienta forense propia en Python), no solo una maqueta.

## Operating Context

- La demo en clase usa atajos de teclado: `A` lanza el ataque simulado, `E` abre el equipo, las flechas saltan entre paradas, `P` activa el modo presentación y `?` muestra la ayuda.
- Hay versión en castellano y en catalán (`ca/`) de todas las páginas.
- Se publica como sitio estático en GitHub Pages. Es instalable como PWA y funciona sin conexión.
- La web principal es de Lorena; Dani aporta programación. Cada uno tiene su portfolio enlazado.

## Capabilities and Constraints

- Solo HTML, CSS y JavaScript sin frameworks ni empaquetador. Las librerías están copiadas en `js/vendor/` (GSAP con ScrollTrigger, SplitText y ScrambleText, Lenis, Three.js r160 y postprocessing).
- Política de seguridad de contenido estricta: solo recursos del propio sitio, sin scripts en línea.
- Requisitos de la práctica A1-RA1: cabecera con logo, menú y llamada a la acción; hero; al menos tres tarjetas de servicios con Grid o Flexbox; beneficios o testimonios; pie con formulario de contacto, iconos de redes y derechos; HTML semántico, `alt` en imágenes, `label` en formularios, válido en el W3C y responsive.
- Planes y condiciones (del plan de empresa): Vigía 9,90 €, Centinela 24,90 €, Guardián 64,90 € (IVA incluido) y Égida desde 590 € + IVA (60 equipos: 1.010 € + IVA). Respuesta de un analista: 2 días laborables, 24 h, 4 h y 1 h. Analistas de lunes a viernes, de 9 a 19 h. No hay vigilancia humana 24/7 ni recuperación de datos.
- Objetivos del laboratorio: alerta de fuerza bruta en menos de 60 s, bloqueo en 30 s o menos, desbloqueo a los 10 min, 100 % de las pruebas con hora, caso y SHA-256.
- El formulario de contacto es una demostración: valida pero no envía.
- Calendario: corte de alcance el 15 de enero de 2027; código congelado del 14 al 20 de enero.

## Brand Commitments

- **Logo**: se usa exactamente como en el manual de identidad. Se puede animar, iluminar o dar profundidad; nunca redibujar, recolorear ni deformar. Solo los PNG originales de `img/`.
- **Paleta**: dorado `#D4AF7A`, dorado oscuro `#8C6B3F`, azul noche `#0B0F14`, marfil `#F8F5EE`, cian `#35C6D6`. El rojo es solo para amenazas.
- **Tipografía**: Cinzel para títulos (es la letra del logo); serif para el texto.
- **Tono**: serio, elegante y de confianza, con trasfondo mitológico; técnico pero comprensible.
- **Límites fijados por Lorena (25-11-2026)**: no puede parecer una plantilla ni resultar poco seria. Quiere que cuente una historia, que todo reaccione al tocarlo y que tenga sorpresas. El globo 3D de la portada anterior se puede sustituir.
- **Honestidad**: todo dato simulado, testimonio ficticio o precio del proyecto lleva su etiqueta visible.

## Evidence on Hand

- Identidad: `img/kairon-*.png`, `img/relieve/`, `docs/hoja-de-marca.webp`.
- Contenido real del proyecto: páginas de servicios, SOC, método, incidente, laboratorio, plan de empresa, legal y preguntas; informe de ejemplo con SHA-256 (`informe.html`).
- No existen clientes, casos ni cifras reales: los testimonios son ficticios y las métricas son objetivos de laboratorio. No se inventan otros.
- No hay fotos del equipo: avatares provisionales (`img/avatar-*.svg`). LinkedIn pendiente.

## Product Principles

1. Se cuenta lo que el servicio hace de verdad, con sus límites a la vista.
2. Una idea por pantalla, dicha en lenguaje de persona.
3. La demostración vale más que la afirmación: lo que se puede enseñar funcionando, se enseña.
4. Lo que no funcione en el proyector de clase o en un portátil modesto, no entra.

## Accessibility & Inclusion

WCAG 2.1 AA en contraste y teclado. Respeta `prefers-reduced-motion` y tiene un control propio de «menos movimiento». El sonido está apagado por defecto. Castellano y catalán.
