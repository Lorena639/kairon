# Plan de presentación — KAIRON (A1-RA1, Aplicaciones Web)

Duración: 15-20 min con diapositivas + demo en vivo. Dos ponentes: Lorena y Dani.
Idioma de las diapositivas: el de la clase. Pocas palabras por diapositiva; lo que se explica se dice, no se lee.

## 0. Decisión previa (antes de hacer las diapositivas)

Ahora mismo hay **dos webs**: la de Lorena en local (2 páginas, ya renombrada a KAIRON) y la de Dani en GitHub (4 páginas, estética "Cyber-Terminal", todavía con el nombre Argos). El enunciado pide **2 páginas** (`index.html` + `sobre-mi.html`), logo, 3 tarjetas con Grid/Flexbox, testimonios o beneficios, footer con formulario, HTML semántico, CSS externo comentado y README.

Preguntas que tenéis que cerrar entre los dos:
1. ¿Qué web se presenta? ¿O se fusionan (diseño de una, contenido de otra)?
2. ¿Quién enseña qué? Propuesta: Lorena la fase 1 y la parte de seguridad/ciberseguridad; Dani la fase 2 (código) y la demo.
3. ¿Se menciona Wazuh y la herramienta forense o eso se guarda para el TFG?

## 1. Estructura de la presentación (tiempos)

| # | Diapositiva | Min | Quién | Contenido / qué decir |
|---|---|---|---|---|
| 1 | Portada | 0,5 | — | Logo KAIRON, título "KAIRON · SOC gestionado para pymes", nombres, grupo, módulo 0228, fecha. |
| 2 | Qué vais a ver | 0,5 | Lorena | Índice en 4 puntos: empresa, identidad, web, lo aprendido. |
| 3 | La empresa | 2 | Lorena | Sector: ciberseguridad para pymes. Problema: no tienen equipo de seguridad y un ransomware las para. Propuesta de valor: "vigilancia profesional sin contratar un equipo interno". |
| 4 | Buyer persona | 1 | Lorena | Marta, 45, directora administrativa de una logística de 60 empleados; teme el ransomware y el RGPD; quiere claridad y precios previsibles. Una sola tarjeta visual. |
| 5 | Nombre y logo | 2 | Lorena | Kairós = el instante oportuno (frente a *chronos*, el tiempo que pasa). En seguridad, un minuto tarde ya es un incidente. Logo: K alada + esfera de brújula. Enseñar las versiones (completo, emblema, blanco/dorado). |
| 6 | Paleta y tipografía | 1 | Lorena | Oro `#C4974B`, fondo `#0E0B16`, cian `#35C6D6` de acento. Cinzel para títulos, serif para texto. Por qué: serio, elegante, mitológico. |
| 7 | Wireframe / estructura | 1,5 | Dani | Esquema de index (header, hero, servicios, beneficios+testimonios, footer) y de sobre-mi (ficha, valores). Relacionarlo con los requisitos del enunciado. |
| 8 | Demo en vivo | 4 | Dani | Abrir la web (servidor local). Dejar que cargue el preloader → portada 3D (mover el ratón) → bajar al manifiesto → servicios en horizontal → panel SOC → **pulsar "Simular un ataque"** y narrar los pasos → abrir "Ver el informe del caso" (informe.html) y enseñar la tabla de evidencias con SHA-256 → cifras → página de equipo. Enseñar el responsive con F12. |
| 9 | Cómo está hecho | 2 | Dani | Captura de `styles.css` con las variables de marca en `:root` y una media query. Captura de HTML semántico (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `alt`). Explicar **cada captura**, no pegarla sin más. |
| 10 | Accesibilidad y buenas prácticas | 1,5 | Lorena | Enlace "saltar al contenido", `aria-label`, `aria-current`, contraste, `prefers-reduced-motion`, `rel="noopener"`. Como futura técnica de seguridad: por qué importa. |
| 11 | Trabajo en equipo y GitHub | 1 | Dani | Repositorio, ramas por persona, commits pequeños en español, README con la estructura del enunciado. |
| 12 | Qué hemos aprendido / conclusión | 1,5 | Ambos | Qué fue difícil (fusionar dos versiones, elegir el logo), qué cambiaríais, qué queda pendiente (validación W3C, LinkedIn real, avatar). |
| 13 | Fuentes y uso de IA | 0,5 | — | Fuentes: MDN, Google Fonts, enunciado. IA: para qué se usó (ideas de logo, revisión de código, planificación) y que todo se entiende y se puede explicar, como pide la guía del centro. |
| 14 | Preguntas | — | — | Logo + "¿Preguntas?". |

Total: 20 min. Si hay que recortar a 15: quitar la 11, acortar la 3 y la 10 a un minuto cada una.

## 2. Preparación de la demo (para que no falle)

- Atajos de teclado durante la demo: `A` lanza la simulación de ataque, `↓`/`↑` cambian de sección, `E` abre la página de equipo, `?` muestra la ayuda.
- Capturas de respaldo en `docs/capturas/` por si falla el navegador del aula.

- Tener la web abierta **antes** de empezar, en una pestaña, y en local (no depende de internet salvo la fuente Cinzel: comprobar que carga o aceptar la serif de reserva).
- Zoom del navegador al 125 % para que se lea desde el fondo.
- Ensayar el redimensionado con las herramientas de desarrollador (F12 → vista móvil) en vez de arrastrar la ventana.
- Plan B: capturas de la web en las diapositivas por si el PC del aula falla.

## 3. Reparto de tareas para preparar

| Tarea | Quién | Hecho |
|---|---|---|
| Cerrar qué web se presenta y fusionar si hace falta | Ambos | ☐ |
| Aplicar el nombre KAIRON y el logo a la versión definitiva y subir a GitHub | Dani/Lorena | ☐ |
| Diapositivas 1-6, 10, 12-13 | Lorena | ☐ |
| Diapositivas 7-9, 11 y demo | Dani | ☐ |
| Validar HTML y CSS en el validador W3C y corregir | Dani | ☐ |
| Ensayo cronometrado completo (al menos 2) | Ambos | ☐ |

## 4. Guion de apertura (30 segundos, para no quedarse en blanco)

"Somos Lorena y Dani. KAIRON es una empresa ficticia de ciberseguridad que vigila los sistemas de pymes que no tienen equipo de seguridad propio. El nombre viene de *kairós*, el instante oportuno: en seguridad, lo importante es actuar en el momento justo. Hoy os enseñamos cómo definimos la empresa, su identidad visual y la web que hemos construido con HTML y CSS."
