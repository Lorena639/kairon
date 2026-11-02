# Plan realista del TFG KAIRON — presentación en febrero/marzo de 2027

Hoy: 29 de octubre de 2026. Quedan **unas 16 semanas** hasta mediados de febrero (12 si descontamos Navidad y exámenes). Dos personas a tiempo parcial.

## 1. Primero: cerrar el alcance (esta semana)

Un TFG que se presenta bien es uno **pequeño y terminado**, no uno grande a medias. Propuesta de alcance:

| Pieza | Entra en el TFG | Responsable | Comentario |
|---|---|---|---|
| Web corporativa KAIRON (2 páginas) | **Sí** | Dani (código) + Lorena (contenido) | Ya está casi hecha. Es la "cara pública". |
| Laboratorio SOC con Wazuh | **Sí** | Lorena | Red virtual: firewall, servidor Linux, 1-2 Windows, máquina atacante. Ya lo tienes planteado en la planificación. |
| Herramienta forense en Python | **Sí** | Lorena (forense) + Dani (código) | Recoge procesos, conexiones, usuarios, persistencia, hashes; genera informe con hora UTC, número de caso y SHA-256. Es donde se ve la programación. |
| Un ataque de ejemplo de principio a fin | **Sí** | Ambos | Fuerza bruta o phishing con malware simulado → Wazuh lo detecta → la herramienta recoge pruebas → informe. **Esta es la demo.** |
| KAIRON Data Chip | **No, salvo como "trabajo futuro"** | Lorena | El estudio ya existe (`C:\Users\lorena\KAIRON`). Un capítulo de 2 páginas "Líneas futuras" con el resumen es suficiente y queda muy bien. Si en enero vais sobrados, un mini-prototipo que calcule huellas y detecte una copia a USB (1 semana), no más. |
| Apps móviles, cifrado, trazabilidad | **No** | — | Fuera. |

Regla: si el 15 de enero algo no funciona, se quita del TFG, no se arregla a última hora.

## 2. Calendario por semanas

| Semanas | Fechas | Lorena (seguridad) | Dani (programación) | Entregable de la semana |
|---|---|---|---|---|
| 1 | 2-8 nov | Decidir alcance; esquema de la memoria; montar VirtualBox con Wazuh manager | Fusionar web (decidir versión), aplicar nombre y logo KAIRON, subir a GitHub | Alcance firmado por los dos; web KAIRON en GitHub |
| 2 | 9-15 nov | Agentes Wazuh en Windows y Linux; comprobar que llegan alertas | Validar W3C, README final, presentación A1-RA1 en clase | Web entregada; Wazuh ve los equipos |
| 3 | 16-22 nov | Ataque 1: fuerza bruta SSH/RDP desde la máquina atacante; regla y alerta | Esqueleto de la herramienta forense: estructura, argparse, informe JSON/Markdown | Alerta de fuerza bruta funcionando |
| 4 | 23-29 nov | Ataque 2: ejecutable "malicioso" simulado + persistencia (tarea programada / registro) | Módulos: procesos, conexiones de red, usuarios e inicios de sesión | Wazuh detecta ataque 2 |
| 5 | 30 nov-6 dic | Definir qué pruebas recoge la herramienta y cadena de custodia (hora UTC, caso, hash) | Módulos: persistencia, hashes de archivos, informe con SHA-256 de cada prueba | Herramienta recoge pruebas en un Windows |
| 6 | 7-13 dic | Respuesta activa en Wazuh (bloquear IP) opcional; capítulo "Diseño del laboratorio" | Pruebas de la herramienta, manejo de errores, empaquetado (pyinstaller) | v0.1 de la herramienta |
| 7 | 14-20 dic | Capítulo "Detección" con capturas explicadas | Capítulo "Herramienta forense" con fragmentos de código explicados | Mitad de la memoria escrita |
| Navidad | 21 dic-6 ene | Descanso real. Como mucho: leer y corregir lo escrito. | Igual | — |
| 8 | 7-13 ene | **Ensayo de la demo completa** (ataque → alerta → recogida → informe). Anotar todo lo que falla | Corregir lo que falle en la herramienta | Demo que funciona una vez de principio a fin |
| 9 | 14-20 ene | **Corte de alcance**: lo que no funciona, fuera. Capítulo "Resultados" | Congelar código; etiquetar versión 1.0 en GitHub | Código congelado |
| 10 | 21-27 ene | Capítulos introducción, objetivos, conclusiones, líneas futuras (Data Chip, 2 páginas) | Revisar memoria: estructura, capturas, formato (Calibri 11, justificado, títulos en negrita, fuentes) | Memoria completa v1 |
| 11 | 28 ene-3 feb | Enviar la memoria al tutor; preparar diapositivas (20 min) | Preparar diapositivas y vídeo de la demo como plan B | Memoria entregada al tutor |
| 12 | 4-10 feb | Corregir según el tutor; ensayo cronometrado 1 | Ensayo cronometrado 1 | — |
| 13 | 11-17 feb | Ensayo 2 y 3; entrega definitiva | Ensayo 2 y 3 | **Presentación** (si es en febrero) |
| 14-16 | 18 feb-10 mar | Margen para imprevistos o para la fecha de marzo | Igual | Presentación (si es en marzo) |

## 3. Dedicación realista

- 4-6 horas por persona y semana durante clases. Si tenéis FCT (prácticas en empresa) en primavera, el trabajo de verdad tiene que estar hecho **antes de Navidad**.
- Una sesión fija a la semana los dos juntos (1 h) para fusionar ramas y decidir. El resto, cada uno lo suyo.

## 4. Riesgos y qué hacer

| Riesgo | Señal | Decisión |
|---|---|---|
| Wazuh da problemas de instalación | Semana 2 sin agentes conectados | Usar la máquina virtual oficial OVA de Wazuh (viene preinstalada) |
| La herramienta forense crece sin parar | Más de 6 módulos en diciembre | Quedarse con 4: procesos, red, usuarios/inicios de sesión, persistencia |
| La demo en vivo falla | Ensayo de enero con fallos | Grabar un vídeo de 3 minutos como plan B y llevar capturas |
| Tentación de meter Data Chip | "Solo una semana más" | Solo entra como capítulo de líneas futuras. El estudio ya está hecho y se cita |
| Uno de los dos se queda atrás | Dos semanas sin commits | Hablarlo en la sesión semanal y repartir de nuevo |

## 5. Estructura de la memoria (para empezar a escribir ya)

1. Portada (título, nombres, grupo, módulo, fecha)
2. Introducción y objetivos
3. KAIRON: la empresa y su web (identidad, requisitos, resultado)
4. Diseño del laboratorio (red, máquinas, Wazuh)
5. Detección: ataques simulados y alertas
6. Herramienta forense: diseño, código explicado, cadena de custodia
7. Caso práctico completo: del ataque al informe
8. Resultados y conclusiones (qué funciona, qué no, qué aprendimos)
9. Líneas futuras: KAIRON Data Chip (resumen del estudio)
10. Fuentes consultadas y uso de IA (qué herramienta y para qué)
11. Anexos: código, capturas, README

Formato según la guía del centro: Calibri 11, justificado, títulos en negrita, cada captura y fragmento de código explicado.
