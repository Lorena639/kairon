---
name: KAIRON
description: SOC gestionado para pymes. La web es una noche de guardia y el scroll es el reloj.
colors:
  noche: "#0b0f14"
  noche-2: "#111823"
  marfil: "#f8f5ee"
  marfil-2: "#efe9dc"
  papel: "#fffdf8"
  oro: "#d4af7a"
  oro-vivo: "#f1dcb0"
  oro-oscuro: "#8c6b3f"
  oro-tinta: "#6b4f28"
  cian: "#35c6d6"
  rojo: "#ff5a4d"
  tinta: "#12161d"
typography:
  display:
    fontFamily: "Cinzel, Trajan Pro, Times New Roman, serif"
    fontSize: "clamp(3.1rem, 9.7vw, 11rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Cinzel, Trajan Pro, Times New Roman, serif"
    fontSize: "clamp(2.2rem, 5.2vw, 5.2rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.005em"
  title:
    fontFamily: "EB Garamond, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(2rem, 4.5vw, 4.9rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.012em"
  body:
    fontFamily: "EB Garamond, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(1.18rem, 1.3vw, 1.42rem)"
    fontWeight: 400
    lineHeight: 1.48
  label:
    fontFamily: "EB Garamond, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "0.98rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.09em"
    fontFeature: "'smcp' on, 'c2sc' on"
  data:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "0.8em"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  placa: "2px"
  redondo: "50%"
spacing:
  margen: "clamp(20px, 4.6vw, 80px)"
  aire: "clamp(88px, 16vh, 200px)"
  regla: "44px"
components:
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.marfil}"
    rounded: "{rounded.placa}"
    padding: "14px 26px 13px"
    height: "52px"
  button-ghost-hover:
    backgroundColor: "{colors.oro}"
    textColor: "{colors.noche}"
  button-oro:
    backgroundColor: "{colors.oro}"
    textColor: "{colors.noche}"
    rounded: "{rounded.placa}"
    padding: "14px 26px 13px"
    height: "52px"
  button-oro-hover:
    backgroundColor: "{colors.oro-vivo}"
    textColor: "{colors.noche}"
  button-tinta:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.marfil}"
    rounded: "{rounded.placa}"
    padding: "14px 26px 13px"
    height: "52px"
  button-tinta-hover:
    backgroundColor: "{colors.oro-tinta}"
    textColor: "{colors.marfil}"
  sello:
    backgroundColor: "transparent"
    textColor: "{colors.oro}"
    padding: "5px 12px 4px"
  sello-tinta:
    backgroundColor: "transparent"
    textColor: "{colors.oro-tinta}"
    padding: "5px 12px 4px"
---

# Design System: KAIRON

Documento del sistema visual de la web. Lo implementan `css/noche.css`, `js/noche.js` y `js/noche-tierra.js` (portada, en castellano y catalán). Las páginas interiores todavía usan el sistema anterior (`css/styles.css`) y hay que traerlas a este.

## Overview

**Creative North Star: "Una noche de guardia"**

La web no describe un servicio de vigilancia: lo hace pasar. La página es una noche entera, del anochecer a la mañana siguiente, y el scroll es el reloj. El visitante sobrevuela un territorio dibujado con curvas de nivel de oro, ve encenderse las luces de los equipos que KAIRON vigila, asiste a un ataque a las 03:07 que se detecta, se bloquea y se sella en un minuto, y con la luz del día lee el informe, los precios y las condiciones. La noche enseña; el día demuestra.

El tono es el de un oficio antiguo hecho con herramientas modernas: sereno, exacto, con una sola nota mitológica (Kairos, el instante oportuno). Nada de consolas de neón, globos con ataques ni lluvia de código; tampoco la página corporativa blanca de tarjetas iguales. La seriedad viene de la tipografía de inscripción, del silencio alrededor de cada frase y de que cada dato lleva su etiqueta de honestidad.

El movimiento cuenta la hora, no decora. Lo que es espacio (cámara, cielo, terreno) va cosido al scroll; lo que es lectura (titulares, párrafos) aparece una vez, cuando llega, y se queda quieto. Una sola cosa se mueve a la vez.

**Key Characteristics:**
- El color es la hora: noche, rojo solo en la amenaza, oro al amanecer, marfil de día. Ocupa la pantalla entera.
- Un único mundo gráfico: líneas de oro de grosor constante (perfiles de noche, curvas de nivel de día) y puntos de luz.
- Cinzel para lo que se inscribe, EB Garamond para lo que se dice, mono solo para lo que se mide.
- Formas rectas: placas, filetes de 1 px, sin sombras ni píldoras.
- La navegación es un reloj: regla de horas abajo, hora en curso a la derecha.
- Todo lo simulado o ficticio lleva sello.

## Colors

Paleta de la hoja de marca, repartida por horas en lugar de por secciones.

### Primary
- **Oro de Kairos** (`oro`): la voz de la marca sobre la noche. Líneas del terreno, bordes de botones, palabras señaladas en los títulos, focos de teclado. Nunca como fondo de un bloque grande de texto.
- **Oro vivo** (`oro-vivo`): el oro cuando se enciende: luces de los equipos, estado al pasar el cursor, hora en curso.
- **Oro tinta** (`oro-tinta`): el oro que sí se lee sobre marfil (texto pequeño, sellos y enlaces de día). `oro-oscuro` queda para filetes y palabras grandes sobre marfil.

### Secondary
- **Rojo de amenaza** (`rojo`): solo el intruso, sus intentos y los errores del formulario. Si no hay amenaza en pantalla, no hay rojo.

### Tertiary
- **Cian de dato** (`cian`): avisos del sistema en el libro de guardia y confirmaciones. Nunca en titulares ni en botones.

### Neutral
- **Azul noche** (`noche`, `noche-2`): fondo de la noche y cuerpo del terreno.
- **Marfil** (`marfil`, `marfil-2`, `papel`): texto de noche; fondo de día; `papel` es la hoja del informe.
- **Tinta** (`tinta`): texto de día y fila elegida en la tabla de precios.

### El cielo de la hora
`js/noche.js` interpola entre siete tonos (`TONOS`) y escribe `--cielo-alto`, `--cielo-medio`, `--cielo-bajo`, `--estrellas` y `--sol`. La misma tabla da los colores al terreno. Para añadir una hora se añade un tono ahí, no un color suelto en el CSS.

### Named Rules
**La regla de la hora.** El color de fondo lo decide la hora del relato, no la sección. No se pinta un bloque de otro color para «separar».

**La regla del rojo.** El rojo aparece cuando hay amenaza y desaparece con ella. No es color de acento ni de oferta.

**La regla del contraste.** Texto pequeño de día en `tinta` u `oro-tinta`; de noche en `marfil` con opacidad mínima del 78 %. El oro claro sobre marfil no se usa para leer.

## Typography

**Display Font:** Cinzel variable 400–900 (con Trajan Pro, Times New Roman)
**Body Font:** EB Garamond variable, redonda y cursiva, con griego (con Iowan Old Style, Palatino, Georgia)
**Label/Mono Font:** JetBrains Mono (solo datos)

**Character:** Una inscripción y una voz. Cinzel talla los títulos en capitales; Garamond narra en minúsculas grandes y hace el trabajo de lectura. El contraste entre ambas es de oficio (piedra frente a tinta), no de peso.

### Hierarchy
- **Display** (500, `clamp(3.1rem, 9.7vw, 11rem)`, 0.95): el titular de portada, a todo el ancho, con la base oculta tras la primera cresta. Uno por página.
- **Headline** (500, `clamp(2.2rem, 5.2vw, 5.2rem)`, 1.02): títulos de sección («capitular»), máximo 16 caracteres por línea, `text-wrap: balance`. La palabra señalada va en oro.
- **Title** (400, `clamp(2rem, 4.5vw, 4.9rem)`, 1.04): la «voz grande»: frases de las escenas en Garamond. Máximo 17 caracteres por línea.
- **Body** (400, `clamp(1.18rem, 1.3vw, 1.42rem)`, 1.48): texto corrido, cifras elzevirianas, medida de 34 a 62 caracteres.
- **Label** (400, 0.98–1.08rem, versalitas, `letter-spacing: 0.09em`): sellos, etiquetas de formulario, rótulos de botón (estos en Cinzel 600 a 0.82rem con `0.16em`).
- **Data** (JetBrains Mono, 0.8em del texto que la rodea): horas, IP, huellas SHA-256, líneas de registro, precios en tabla.

### Named Rules
**La regla de la mono.** La mono es para lo que sale de una máquina o de un reloj. Nunca para etiquetas, botones ni adornos «técnicos».

**La regla sin antetítulo.** Ningún título lleva encima una etiqueta pequeña en mayúsculas. Si una sección necesita contexto, lo da la hora de la regla.

**La regla del griego.** καιρός se escribe en griego, con su fuente y `lang="el"`. No se translitera en los títulos.

## Layout

Una columna de relato de hasta 1360 px (`.marco`) con margen lateral `clamp(20px, 4.6vw, 80px)`. Los textos no ocupan la columna entera: se apoyan a un lado y dejan el otro al terreno. El aire vertical entre actos es `clamp(88px, 16vh, 200px)`.

**Capas** (un solo contexto de apilamiento; `main` y los actos no crean el suyo): 0 cielo fijo · 1 titular (queda detrás de la tierra) · 2 lienzo del terreno · 3 contenido · 30 regla de horas · 40 cabecera · 60 menú móvil.

**Película.** Con JavaScript, la clase `.peli` vuelve transparentes los actos y fija tres escenas con `position: sticky` (la guardia 340vh, el instante 520vh, el amanecer 360vh). Sin JavaScript, sin WebGL o con menos movimiento, cada acto pinta su fondo y la página se lee de arriba abajo.

**Día.** A partir del informe la página es editorial sobre marfil: rejillas de dos columnas desiguales (de 0.7/1.3 a 1.25/0.75), tablas con filetes de 1 px, sin tarjetas con sombra.

**Fijos.** Cabecera arriba (se esconde al bajar, con 48 px de histéresis) y regla de horas de 44 px abajo; ninguna sección puede dejar contenido bajo la regla.

**Estrecho.** Cortes en 1080, 860 y 560 px. En móvil las escenas fijadas se quedan, el texto pasa al tercio superior y el terreno al inferior; las tablas se convierten en fichas; los objetivos táctiles miden 44 px o más.

## Elevation & Depth

No hay sombras. La profundidad es real (el terreno en perspectiva, la niebla que apaga las líneas lejanas) o tonal (el velo que oscurece el terreno detrás de un texto, hecho en el propio sombreador). La hoja del informe se distingue por su color de papel y un filete, no por una sombra.

### Named Rules
**La regla del velo.** Cuando un texto pisa el terreno, se atenúan las líneas detrás de él; no se le pone caja, ni fondo, ni sombra de texto.

## Shapes

Rectas y finas. Radio de 2 px en botones («placa»); los campos de formulario son una línea, sin radio; círculo solo para luces, la esfera del logo y el lacre del informe. Filetes de 1 px en oro u oro tinta. Los subrayados de enlace son de 1 px con separación de 0.24em. Ninguna píldora, ningún degradado en texto, ningún borde lateral de color.

## Components

### Buttons
Placas rectas con rótulo en Cinzel versal (0.82rem, 600, `0.16em`), alto mínimo de 52 px.
- **Fantasma:** borde oro de 1 px sobre fondo transparente, texto marfil.
- **Oro:** fondo oro, texto noche. Es la acción principal («Pide una auditoría»); una por pantalla.
- **Tinta:** fondo tinta, texto marfil; para las secciones de día.
- **Hover / Focus:** el color sube desde abajo como una luz que se enciende (0.45 s, `cubic-bezier(0.16, 1, 0.3, 1)`); al pulsar baja 1 px.

### Sello
Etiqueta de honestidad: versalitas de Garamond con filete de 1 px del color del texto. Acompaña a todo lo simulado, de ejemplo o ficticio. No es decoración y no se usa como antetítulo.

### Enlace
Garamond cursiva subrayada con flecha que avanza 0.35em al pasar el cursor.

### Cards / Containers
Los tres oficios son paneles sin caja: un número romano, un dibujo de línea, título y texto, separados por filetes. No hay tarjetas con fondo, radio grande ni sombra.

### Inputs / Fields
Línea inferior de 1 px, etiqueta en versalitas encima, sin caja. Foco: línea en oro. Error: línea en rojo y mensaje debajo del campo, enlazado con `aria-describedby`.

### Navigation
Cabecera: logo a la izquierda, enlaces en Cinzel pequeño, controles (sonido, movimiento, idioma) y la acción en oro. En móvil, panel a pantalla completa.

### Regla de horas (componente firma)
Barra fija inferior con una marca por acto (23:00, 00:30, 03:07, 06:45, 09:00…). Muestra el avance, la hora en curso en mono y, al pasar el cursor, el nombre del acto. Es navegación y es el reloj del relato.

### El terreno (componente firma)
Malla única desplazada en el sombreador; líneas de grosor constante en píxeles. De noche son perfiles; al amanecer se funden a curvas de nivel y el terreno pasa a ser el mapa del informe. Sobre él, puntos de luz (equipos), la baliza de KAIRON y, cuando toca, el punto rojo. El cursor es un farol que ilumina y levanta el relieve.

### Movimiento
Cuatro duraciones (0.2, 0.6, 1.1 y 1.6 s) y dos curvas: salida `cubic-bezier(0.16, 1, 0.3, 1)` y entrada-salida `cubic-bezier(0.76, 0, 0.24, 1)`. Los títulos salen por líneas desde detrás de una máscara, una vez. El espacio va cosido al scroll. Con `prefers-reduced-motion` o el botón «Menos movimiento» no hay película: todo queda visible y quieto.

## Do's and Don'ts

### Do:
- **Do** usar el logo tal como viene en `img/`; se puede iluminar o animar su aparición, nunca redibujar, recolorear ni deformar.
- **Do** poner sello a todo dato simulado, testimonio ficticio o precio de ejemplo.
- **Do** dar a cada pantalla un solo foco y dejar vacío el resto.
- **Do** escribir como se le habla a una directora administrativa: frases cortas, sin jerga, con la cifra exacta.
- **Do** mantener castellano y catalán a la par en cada cambio.
- **Do** comprobar cada pieza sin JavaScript, sin WebGL y con menos movimiento.

### Don't:
- **Don't** usar la mono fuera de horas, direcciones, huellas y registros.
- **Don't** poner antetítulos en mayúsculas pequeñas sobre los títulos.
- **Don't** usar degradados en el texto, píldoras, sombras, vidrio esmerilado ni tarjetas idénticas en fila.
- **Don't** usar el rojo sin amenaza ni el cian en titulares.
- **Don't** cargar nada de fuera: fuentes, librerías e imágenes se sirven desde el propio sitio (CSP `default-src 'self'`).
- **Don't** animar por animar: si un movimiento no cuenta la hora ni responde a un gesto, sobra.
