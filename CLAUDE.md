# KAIRON - Contexto del proyecto

## Qué es este proyecto
Repositorio de Lorena y Dani (João Daniel de Paiva Oliveira, "Maru" en internet, usuario jdanioliv) para dos cosas a la vez:
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
- [Qué funcionalidad de programación aporta Dani, si la hay más allá de la web] → Propuesta (sin confirmar con Lorena): el analizador de logs de su portfolio, que detecta fuerza bruta en logs HTTP y une programación y ciberseguridad.
- [Si el proyecto técnico KAIRON Data Chip (estudio en `C:\Users\lorena\KAIRON`) forma parte del TFG o es un proyecto aparte]

## Plan general del trabajo (resumen; el detalle está en `PLAN-TFG.md`)
**Idea:** un TFG **pequeño y terminado**, no uno grande a medias. KAIRON simula un SOC de verdad: Wazuh detecta un ataque, una herramienta forense propia en Python recoge las pruebas y la web es la cara pública de la empresa.

**Qué entra en el TFG:**
1. **Web corporativa KAIRON.** Código de Dani y contenido de Lorena. Es también la práctica A1-RA1.
2. **Laboratorio SOC con Wazuh** (Lorena): red virtual con firewall, servidor Linux, 1–2 Windows y una máquina atacante, aislada.
3. **Herramienta forense en Python** (Lorena en lo forense, Dani en el código):
   - Recoge procesos, conexiones de red, usuarios e inicios de sesión, persistencia y hashes.
   - Genera un informe con cadena de custodia: hora UTC, número de caso y SHA-256 de cada prueba.
   - Si crece demasiado, se queda en 4 módulos.
4. **Un ataque de ejemplo de principio a fin, que es la demo:** fuerza bruta o malware simulado → Wazuh lo detecta → la herramienta recoge las pruebas → informe.

**Qué no entra:** KAIRON Data Chip, salvo como capítulo de "líneas futuras" (el estudio está en `C:\Users\lorena\KAIRON` y `futuro.html`), ni apps móviles, cifrado o trazabilidad.

**Calendario:**
- Presentación en febrero o marzo de 2027.
- Lo gordo, hecho antes de Navidad.
- Ensayo de la demo completa del 7 al 13 de enero.
- **Corte de alcance el 15 de enero:** lo que no funcione se quita, no se arregla a última hora.
- Código congelado (v1.0) del 14 al 20 de enero.
- Memoria al tutor la primera semana de febrero.
- Plan B de la demo: un vídeo de 3 minutos y capturas.

**Memoria:**
- 11 capítulos, listados en `PLAN-TFG.md` §5.
- Formato del centro: Calibri 11, justificado, títulos en negrita, cada captura y fragmento de código explicado, fuentes y uso de IA declarado.
- El borrador del capítulo de la web está en `docs/MEMORIA-WEB.md`.

**Presentación en clase:** `PRESENTACION.md` (15–20 min con demo en vivo y atajos: `A` lanza el ataque, `E` abre el equipo).

## Estado actual (12-11-2026)
- **Web KAIRON en este repo.** La hizo sobre todo Lorena; su dirección creativa está en `docs/DIRECCION-CREATIVA.md`.
  - Páginas: index, servicios, soc, productos, proyectos, futuro, contacto, informe, sobre-mi y 404, más la versión en catalán en `ca/`.
  - Técnica: escena 3D de radar con Three.js, GSAP, ScrollTrigger y Lenis en `js/vendor/`; PWA (`sw.js`); CSP sin scripts en línea.
  - Simulador de ataque, SOC simulado, informe con SHA-256 y modo presentación.
  - Las comprobaciones se pasan con `tools/comprobar.py`.
- **Regla de marca:** el logo se usa exactamente como en el manual de identidad. Se puede animar, iluminar o dar profundidad, pero nunca redibujar, recolorear ni deformar.
- **Portfolios personales**, enlazados desde la ficha del equipo:
  - `antonia-lorena-cracana/`: el de Lorena.
  - `joao-daniel-oliveira/`: el de Dani.
- **La antigua web de Dani** (`jdanioliv/Argos-TFG`, estética "Cyber-Terminal" con el nombre Argos) ya no es la que se presenta.
- **Pendiente:**
  - Validar con W3C.
  - LinkedIn y avatares reales.
  - Laboratorio Wazuh y herramienta forense (ver calendario).
  - Confirmar qué aporta Dani en programación más allá de la web.

## Parte de Lorena
- **Quién es:** Antonia Lorena Cracana. Lleva la ciberseguridad: análisis forense, monitorización y respuesta a incidentes. Quiere especializarse en análisis forense.
- **Su portfolio** (`antonia-lorena-cracana/`, en castellano y catalán), rediseñado el 12-11-2026 como una **película de expediente forense** al hacer scroll (GSAP, SplitText, ScrambleText, Lenis, View Transitions; fuentes alojadas en `fonts/`).
  - Títulos de apertura y nueve escenas con franjas de cine, claqueta y código de tiempo: portada con huella, ficha, pruebas aportadas, cadena de custodia, cómo trabajo, el sello SHA-256, casos abiertos, "Continuará…" (lo que quiere estudiar) y "¿Abrimos un caso?" con créditos finales.
  - **Lo que quiere estudiar después de SMX:** CFGS ASIR, curso de especialización de FP en Ciberseguridad en Entornos de las TI y, en paralelo, certificaciones de análisis forense y respuesta a incidentes. Meta: especializarse en análisis forense digital.
  - Extras: luz UV con pistas, glosario, tarjetas que se mueven, terminal, sonido, "Luces" (modo claro), "Menos movimiento" e impresión.
- **En el TFG:** monta el laboratorio Wazuh, diseña los ataques simulados y la cadena de custodia, y escribe los capítulos de detección y resultados.
- **Cuenta compartida:** esta cuenta de Claude es de Lorena, pero la usan los dos. Si no está claro quién escribe, hay que preguntarlo antes de atribuirle ideas a uno u otro. Este archivo (`CLAUDE.md`) es el contexto que leen las sesiones de Claude en esta carpeta.

## Parte de Dani (actualizado el 12-11-2026; solo lo de Dani, no de Lorena)
Lo que Dani ha contado y decidido en sus sesiones con Claude. Rama de trabajo: `claude/awesome-hamilton-81xuyz`.

### Quién es Dani
- Estudia 2º de SMX en Digitech FP (2025–2027). Después quiere hacer DAM y, más adelante, dedicarse a datos e IA (Python, Big Data, aprendizaje automático).
- Terminó CS50x de Harvard. Cursa CS50P y CS50W y luego quiere hacer CS50AI, CS50G y TinyML.
- Hace juegos en Roblox con Luau. Le gustan el anime y el manga, sobre todo *Jujutsu Kaisen*.
- Habla inglés y portugués como lenguas nativas. Vive en Barcelona.
- Web personal: jdanioliv.github.io (CV interactivo, terminal y analizador de logs con PyScript). Busca prácticas de FP y primer empleo.
- Escribe a Claude en español o en inglés; hay que contestarle en el idioma en que escriba.

### Su portfolio: `joao-daniel-oliveira/`
- **Estética "Santuario Malévolo" de Sukuna (JJK)**, según la especificación que dio Dani:
  - Paleta: obsidiana `#070709` y `#111115`, carmesí `#d90429` y `#8a0014`, destello `#ff002b`, fuego `#ff4d00`, hueso `#f4f3ef` y ceniza `#8e8d94`.
  - Fuentes: Zen Antique para títulos, Manrope para texto e IBM Plex Mono para detalles.
  - El pie aclara que es un homenaje de fan, sin relación oficial con la obra.
- **Efectos:**
  - Intro "Cleave & Dismantle": la pantalla se parte en diagonal, con temblor y aberración carmesí.
  - Tajos SVG al pasar el ratón; botones que se parten al pulsarlos; brasas en canvas en los botones rojos.
  - Aparición con tajo al hacer scroll, barra de progreso, menú que marca la sección y kanji 解 con paralaje.
  - Botón "Suprimir energía maldita", que quita el movimiento y respeta `prefers-reduced-motion`.
- **Laboratorio**, que sustituye al antiguo "cifrado de encantamientos". Dani lo quitó porque no encajaba:
  1. **Analizador de logs** (`analizador.js`): versión en JS de su analizador en Python. Avisa de posible fuerza bruta a partir de 5 respuestas 401/403 de una misma IP.
  2. **Minijuego "Desmantelar"** (`juego.js`): cortar bugs que caen; récord en localStorage; tecla Espacio para jugar con teclado.
  3. **Expansión de dominio** (`dominio.js`): toda la página se convierte en el Santuario durante unos 7 s. También se activa escribiendo `ryoiki tenkai`.
- **Sonido** (`sonido.js`): tajos, cortes, golpes y fuego sintetizados con Web Audio, sin archivos. Dani lo quiere a **volumen bajo**. Hay un botón "Sonido: sí/no" en la cabecera.
- **Ideas que Dani descartó por ahora:** terminal de comandos y visualizador de algoritmos de CS50.
- **Vista previa privada:** https://claude.ai/artifact/C5ZNjp6BP6fNEv2K5KTyHc. Se regenera desde una copia sin la CSP propia de la página y sin `?v=` en las rutas. Dani quiere poder ver los cambios ahí.
- En la página pone "SMX"; en su especificación Dani escribió "SMR" (el nombre del ciclo en castellano). Está por confirmar.

### Ideas para la web de KAIRON (en curso)
- **Repos elegidos para la web:**
  - `pmndrs/postprocessing`: bloom y aberración cromática en la escena del radar.
  - `shshaw/Splitting`: no hace falta, porque `main.js` ya divide los títulos a mano.
  - Codrops: demos para copiar técnicas sin añadir dependencias.
  - `barbajs/barba` queda como alternativa (transiciones entre páginas), pero da más trabajo.
- **Postprocesado (sin commitear):**
  - Paquete `js/vendor/postprocessing.min.js`: versión 6.34.2, compatible con Three r160, reducido a los efectos usados y adaptado al `THREE` global.
  - Conectado en `js/escena.js`. Quedan solo bloom y aberración cromática, porque la viñeta y el grano marcaban los bordes del lienzo.
  - Pendiente: no dibujar la escena mientras dure la intro (`.carga`), porque con WebGL por software la ralentizaba mucho.
- **K en 3D:** Dani quiere usar la K en 3D en la web, basada en su hoja de marca: emblema de oro metálico, versiones de fondo oscuro y claro, horizontal y monocromas.
  - Plan: extruir con Three.js el contorno del emblema (`img/kairon-emblema-dorado.png`), con el PNG original en la cara frontal y material de oro metálico.
  - Iría en el centro del globo, en lugar de las capas CSS de `.logo3d`, que quedan como respaldo sin WebGL.
- La web principal es sobre todo de Lorena: hay que avisarla antes de fusionar estos cambios.

### Otras cosas
- **"Rogue x Hunter"** es un proyecto aparte de Dani: no mezclarlo con KAIRON ni con el portfolio.
- No se puede crear desde aquí un enlace público que caduque solo. Para enseñar la vista previa se usa el menú Share del artifact y luego se quita el acceso a mano.

## Reglas de trabajo
- No sobrescribir código de la otra persona sin preguntar.
- Trabajar en ramas separadas por persona y fusionar por fases.
- Commits pequeños con mensajes descriptivos en español.
- No añadir dependencias, claves ni datos sensibles al repositorio.
- Si algo del enunciado es ambiguo, preguntar antes de suponer.
