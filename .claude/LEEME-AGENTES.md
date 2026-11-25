# Agentes KAIRON (escritos para el proyecto, a partir de repositorios públicos revisados)

- Revisión hecha el 25-11-2026. Los cinco archivos `kairon-*.md` son definiciones de subagente de Claude Code (Markdown con cabecera YAML: `name`, `description`, `tools`, `model: inherit`).
- **No se ha copiado ningún archivo de terceros, ni siquiera texto.** Los cinco agentes están redactados de nuevo, en castellano y para este repositorio. De los repositorios públicos solo salen ideas (rúbricas, listas de errores típicos, formatos de respuesta). Cada archivo termina con una sección «Origen» que dice de dónde.
- **No se ha copiado a propósito:** scripts, hooks, `settings.json`, `plugin.json`, binarios, fuentes ni instaladores de ninguno de los repositorios. Tampoco los agentes de Impeccable tal cual, porque llaman al lanzador `impeccable` que ya se dejó fuera al instalar la skill (ver `.claude/skills/impeccable/LEEME-KAIRON.md`).
- Los agentes no instalan nada ni ejecutan código descargado: usan Playwright, que ya viene en el entorno de la nube, y `tools/comprobar.py`, que es del proyecto.

## Los cinco agentes

| Archivo | Para qué | Edita |
|---|---|---|
| `kairon-director-arte.md` | Juzga una página renderizada contra `PRODUCT.md`, el contrato de dirección y el listón de calidad; devuelve un veredicto y hasta 8 arreglos | No |
| `kairon-motion.md` | Diseña y programa movimiento (GSAP, ScrollTrigger, Lenis) dentro de la tesis de movimiento; comprueba el camino sin movimiento | Sí |
| `kairon-webgl.md` | Escenas Three.js: presupuesto, dibujo bajo demanda, sombreadores, pérdida de contexto, móvil | Sí |
| `kairon-auditor.md` | Accesibilidad, responsive, rendimiento, HTML, CSP y paridad castellano/catalán, con pruebas; contiene la receta de captura | No |
| `kairon-capricho.md` | Respuesta al tocar, microcopy, sonido y sorpresas que encajan con una marca de seguridad | Sí |

Orden habitual: construir (motion, webgl) → `kairon-auditor` → `kairon-director-arte` → arreglos → segunda pasada del director → `kairon-capricho`.

## Repositorios revisados

Clonados con `git clone --depth 1` en una carpeta temporal fuera del repo. Las estrellas son aproximadas (búsqueda web del 25-11-2026; la API de GitHub no estaba disponible en la sesión).

| Repositorio | Commit (fecha) | Licencia | Estrellas | Qué trae |
|---|---|---|---|---|
| `pbakaus/impeccable` | `9e460a87ef338ee9d12c7beed8fedc597a5af5f7` (24-11-2026, v4.11.0) | Apache-2.0 | ≈108.000 (dato del 12-11-2026) | La skill ya instalada y cinco subagentes (revisor de acabado, revisor de movimiento, productor de recursos, documentador, aplicador de ediciones) |
| `anthropics/claude-plugins-official` | `6985b2d88dc08b4a0d202f5f0301f02e360b9cb1` (24-11-2026) | Apache-2.0 | entre 19.000 y 33.000 según la fuente | Plugin `frontend-design` 1.1.1 (una skill, sin scripts ni hooks) y agentes de revisión de código |
| `anthropics/skills` | `e4bb5d960d87126ff3b3a8af1a104b7db67560ba` (16-11-2026) | Apache-2.0 por skill (`LICENSE.txt`) | ≈150.000 (sin confirmar) | `frontend-design` (idéntica a la del plugin), `webapp-testing`, `canvas-design`, `brand-guidelines` |
| `wshobson/agents` | `c96b5f6552dba32e4492307493ee613581430715` (24-11-2026) | MIT | ≈42.000 | Mercado de 91 plugins con 199 agentes: UI, accesibilidad, rendimiento, SEO y skills de diseño |
| `VoltAgent/awesome-claude-code-subagents` | `ed74d115b7fb7026a22a4f816a8e3250f425e3b4` (02-11-2026) | MIT | ≈26.600 | 165 subagentes por categorías |
| `msitarzewski/agency-agents` | `8ae6164602c95ca78828b148b9052460ee426885` (08-11-2026) | MIT | ≈147.000 | Añadido por nuestra cuenta: trae los mismos papeles que se buscaban (whimsy injector, brand guardian, visual storyteller), con licencia y mantenimiento activo |
| `contains-studio/agents` | `a5a480c324cac64b9c569bca0b2f297d517240cb` (28-07-2025) | **Sin licencia** | sin dato fiable | 37 agentes; sin actividad desde julio de 2025 |

De `contains-studio/agents` no se ha tomado nada: sin licencia, todos los derechos son de sus autores, y además su contenido recomienda justo lo que aquí se evita (hero con degradado, rejillas de tarjetas, «glass morphism», diseñar para TikTok).

Las guías de Impeccable que citan los agentes (`craft-floor.md`, `animate.md`, `delight.md`) son las ya instaladas en `.claude/skills/impeccable/reference/` (v4.8.2, commit b4bff16). Comparadas con la v4.11.0: cambian marcas internas y poco más; lo único nuevo que se ha aprovechado es la regla de hover de `animate.md`.

## Revisión de seguridad (texto tratado como no fiable)

Se leyeron enteros 34 candidatos; de otros veinte, que son plantillas de listas, se leyeron la cabecera y las secciones con instrucciones. A todos (unos ochenta archivos) se les pasó un buscador de patrones: instalar paquetes, descargar y ejecutar, tocar ajustes o permisos, contactar servicios, ignorar al usuario. **No se encontró ninguna instrucción de exfiltrar datos, cambiar permisos ni desobedecer al usuario.** Sí hay motivos para no instalar varios tal cual:

- **Instalan paquetes:** VoltAgent `content-quality-editor.md` (`npm install -g unslop`) y `visual-asset-generator.md` (`npm install -g prompt-to-asset`, servidor MCP hacia más de 30 modelos de imagen); agency-agents `testing-accessibility-auditor.md` (`npx @axe-core/cli`, `npx lighthouse`).
- **Ejecutan un script que no está en el repositorio:** agency-agents `testing-evidence-collector.md` y `testing-reality-checker.md` (`./qa-playwright-capture.sh`, «NEVER SKIP»).
- **Llaman al binario de Impeccable o a una API de imágenes:** `impeccable-asset-producer.md` (`impeccable comp-spec`, `generate-image`), `impeccable-finish-reviewer.md` (`impeccable concept-seed`). El revisor de movimiento y el documentador no ejecutan nada externo.
- **Contactan servicios externos:** VoltAgent `design-bridge.md` (descarga un DESIGN.md de otro repositorio y lo usa como instrucciones), agency-agents `design-ui-finish-gate-reviewer.md` (catálogo uizze.com, opcional), wshobson `brand-landingpage` (servicio Stitch con clave de API en `.env`), varios con `WebFetch` y `WebSearch` en `tools`.
- **Se activan solos:** muchos de wshobson y el `whimsy-injector` de contains-studio dicen «Use PROACTIVELY» en la descripción. No es un riesgo de seguridad, pero dispararía agentes sin pedirlo.
- **Invitan a inventar resultados:** los de VoltAgent traen mensajes de entrega con cifras de ejemplo («mejoró del 67 al 98», «la conversión subió del 2,4 % al 3,6 %»). Choca con la regla de honestidad del proyecto.
- **Scripts de instalación** (`install-agents.sh`, `tools/subagent-catalog/`, `scripts/install.sh`, `with_server.py`): no se han ejecutado ni copiado.
- Limpios (solo texto, sin nada de lo anterior): `frontend-design/SKILL.md` de Anthropic, `ux-microcopy-reviewer.md` de VoltAgent, `ui-visual-validator.md` y `visual-edit-precision` de wshobson, `impeccable-motion-reviewer.md`.

## Qué valía la pena

- **Impeccable, revisor de acabado y revisor de movimiento:** lo mejor de todo lo leído. Primero se comprueba que las pruebas valen; el veredicto sale de una regla, no de una impresión; máximo de arreglos; segunda pasada que solo puntúa. De ahí salen el veredicto y la segunda pasada del director de arte, y los tramos de duración y la comparación normal/reducido de `kairon-motion`.
- **Anthropic `frontend-design`:** la lista concreta de marcas de página generada y las reglas de texto de interfaz.
- **agency-agents:** contrato de diseño y decisión PASA/ESPERA del `ui-finish-gate-reviewer`; prueba de los cinco segundos del `persona-walkthrough`; estados PASA / FALLA / NO PROBADO y lista de teclado del `accessibility-auditor`; «una captura de un formulario relleno no prueba que se envíe» del `evidence-collector`; `hreflang` recíproco del `seo-specialist`; presupuesto y sobredibujado del `technical-artist`.
- **VoltAgent `ux-microcopy-reviewer`:** rúbrica de botones, errores y coherencia, con gravedad.
- **wshobson `ui-visual-validator`:** juzgar solo por lo que se ve; «distinto» no es «correcto».
- **Descartado por genérico:** casi todo lo demás. Son listas de palabras («Color theory», «Performance budget») sin criterio, protocolos JSON con un «context-manager» que no existe y ejemplos en React, Tailwind y Framer Motion que aquí no sirven. La skill `interaction-design` de wshobson recomienda apagar el movimiento con `0.01ms` global, justo lo que la guía de Impeccable marca como defecto. Ningún repositorio trae un agente útil de Three.js o GSAP sin framework: `kairon-webgl` y la parte de patrones de `kairon-motion` salen del propio código.

## Instalación y uso

1. Revisa los cinco archivos. Si te valen, cópialos a `.claude/agents/` del repositorio (decisión de Lorena; avisa a Dani, porque los usarán las sesiones de los dos).
2. Deja este LEEME fuera de `.claude/agents/` (por ejemplo, `.claude/LEEME-AGENTES.md`): Claude Code intenta leer cada `.md` de esa carpeta como agente.
3. Se usan pidiéndolo («que `kairon-auditor` revise `soc.html`») o los elige Claude por la descripción. Ninguno dice «úsalo siempre».
4. Los agentes citan `.claude/agents/kairon-auditor.md` para la receta de captura: si cambias el nombre o la carpeta, cambia esa ruta.

## Receta de captura (probada el 25-11-2026)

En la nube no se puede abrir un servidor HTTP local, así que la parte de navegador de `tools/comprobar.py` no sirve allí (y Playwright para Python no está instalado: se salta sola). La receta de `kairon-auditor.md` usa Playwright para Node, que sí está (`NODE_PATH=$(npm root -g)`), y sirve los archivos desde disco con `context.route` bajo el origen ficticio `http://kairon.test`, con el service worker bloqueado. Se probó con `index.html`, `ca/index.html`, `ca/servicios.html` a 320 px, `soc.html` con movimiento reducido y una página inexistente: sin errores de consola, sin desbordamiento horizontal y con WebGL pintando (por software).

## Datos con fecha, que caducan

Los agentes llevan hechos comprobados el 25-11-2026. Si cambian, hay que corregir el agente:

- Portada: ≈1,3 MB de JS y CSS sin comprimir (Three.js, 654 KB).
- Contraste: oro oscuro sobre noche, 3,9:1; oro y cian sobre marfil, 1,9:1.
- El botón «Reducir movimiento» no equivale todavía a la preferencia del sistema. Medido con la preferencia guardada: en `index.html` siguen activos Lenis y 121 ScrollTrigger (13 con la preferencia del sistema); en `servicios.html`, Lenis y 26 (0 con la del sistema). `js/main.js` decide con la constante `reducido`, que solo mira el sistema.
- El código propio no escucha `webglcontextlost` ni `webglcontextrestored`.
- La portada está cambiando («Una noche de guardia», `js/noche-tierra.js`, contrato en `.impeccable/surfaces/portada.md`). Por eso los agentes mandan leer `PRODUCT.md` y el contrato en vez de fijar tipografías o escenas.

## Para actualizarlos

Repetir la revisión (clonar, leer, pasar el buscador de patrones, anotar commit y licencia) y volver a redactar: nunca copiar un agente público tal cual. Si se añade una idea de otra fuente, se apunta en «Origen» y en la tabla de arriba.
