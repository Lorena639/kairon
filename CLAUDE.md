# KAIRON - Contexto del proyecto

## Qué es este proyecto
Repositorio de Lorena y Dani (Daniel Oliva, usuario jdanioliv) para dos cosas a la vez:
1. La práctica A1-RA1 de "0228 Aplicaciones Web" del ciclo CFGM Sistemes Microinformàtics i Xarxes (SMX), 2º curso, en Digitech Barcelona.
2. La parte web del Trabajo de Final de Curso (TFG), que combina ciberseguridad y programación.

La empresa ficticia se llama **KAIRON** (antes Argos; renombrada el 29-10-2026). El nombre viene de *kairos*, el instante oportuno en griego, frente a *chronos*, el tiempo que pasa. Kairos se representaba como un joven alado con un mechón en la frente: solo se le puede agarrar cuando pasa. La identidad visual y el discurso de la web reflejan esa idea: **detectar a tiempo y actuar en el momento justo**.

## Quiénes somos y qué hace cada uno
- **Lorena**: parte de ciberseguridad (análisis forense, monitorización, respuesta a incidentes). Objetivo profesional: especializarse en análisis forense y ciberseguridad.
- **Dani**: parte de programación.
- El TFG tiene que quedar listo para presentarse: código y documentación con calidad de entrega, no de borrador.

## Qué es KAIRON (empresa ficticia)
- **Sector:** ciberseguridad para pymes; SOC (centro de operaciones de seguridad) gestionado.
- **Propuesta de valor:** "Vigilancia de seguridad profesional para tu pyme, sin contratar un equipo interno." Detecta ataques a tiempo y responde en el instante preciso para minimizar el daño.
- **Público objetivo:** pymes sin equipo de seguridad propio. Buyer persona: Marta, 45 años, directora administrativa de una empresa de logística de 60 empleados en Barcelona; teme el ransomware y el RGPD; quiere claridad, precios previsibles y lenguaje sin jerga.
- **Servicios:** vigilancia y detección (Wazuh), respuesta a incidentes y análisis forense (herramienta propia en Python con cadena de custodia), auditoría y hardening, concienciación y formación, informes y cumplimiento.
- **Tono:** serio, elegante y de confianza, con trasfondo mitológico; técnico pero comprensible.
- **Paleta (hoja de marca):** dorado `#D4AF7A`, dorado oscuro `#8C6B3F`, azul oscuro `#0B0F14`, marfil `#F8F5EE`, cian de acento `#35C6D6`.
- **Tipografía:** Cinzel 500 para títulos; serif (Georgia) para texto.
- **Logo:** K con un ala a la izquierda sobre una esfera de brújula; la O de "KAIRON" repite la esfera. Versiones en `img/` (completo y emblema, dorado y blanco), favicon e icono táctil. Set completo en `C:\Users\lorena\KAIRON\identidad\`.

## Requisitos de la práctica (A1-RA1)
- Dos páginas HTML independientes: `index.html` (landing page) y `sobre-mi.html` (perfil profesional).
- Solo HTML5, CSS3 y JavaScript mínimo. Sin frameworks ni librerías de CSS.
- Landing: header con logo, menú funcional y CTA; hero; mínimo 3 tarjetas de servicios (CSS Grid o Flexbox); sección de beneficios o testimonios; footer con formulario de contacto, iconos de redes y derechos de autor.
- Página de perfil: tarjeta con foto o avatar, rol, habilidades técnicas y enlaces a GitHub y LinkedIn; sección de valores y visión.
- CSS en `css/styles.css`, responsive con media queries.
- Etiquetas semánticas (`header`, `nav`, `main`, `section`, `footer`), `alt` en imágenes y `label` en formularios.
- Código comentado, indentado y validado con el validador W3C.
- README.md con la estructura que pide el enunciado.

## Requisitos del TFG (pendiente de completar)
- [Qué parte de ciberseguridad se refleja en la web: por ejemplo, un apartado de buenas prácticas, cabeceras de seguridad, validación del formulario, etc.]
- [Qué funcionalidad de programación aporta Dani, si la hay más allá de la web]
- [Si el proyecto técnico KAIRON Data Chip (estudio en `C:\Users\lorena\KAIRON`) forma parte del TFG o es un proyecto aparte]

## Estado actual (29-10-2026)
- Versión local de Lorena: 2 páginas, rediseñada el 29-10-2026 al estilo Active Theory / Lusion (oscuro, tipografía gigante Space Grotesk, preloader, cursor propio, Lenis, GSAP y escena 3D de radar con Three.js). Sin commitear.
- Versión de Dani en GitHub (`jdanioliv/Argos-TFG`, rama main): 4 páginas (index, sobre-nosotros, sobre-dani, sobre-lorena), estética "Cyber-Terminal", todavía con el nombre Argos. No fusionada.
- Pendiente: decidir qué versión se presenta, aplicar el rename en la definitiva, validar con W3C, LinkedIn real, avatar real.
- Plan de presentación en clase: `PRESENTACION.md`. Este archivo (`CLAUDE.md`) es el contexto que leen las sesiones de Claude en esta carpeta.

## Reglas de trabajo
- No sobrescribir código de la otra persona sin preguntar.
- Trabajar en ramas separadas por persona y fusionar por fases.
- Commits pequeños con mensajes descriptivos en español.
- No añadir dependencias, claves ni datos sensibles al repositorio.
- Si algo del enunciado es ambiguo, preguntar antes de suponer.
