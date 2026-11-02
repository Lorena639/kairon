# Planificación — KAIRON (A1-RA1, Aplicaciones Web)

Autoría: Lorena y Daniel Oliva (jdanioliv). Estado: **propuesta pendiente de confirmación**.

Reparto: **Lorena** lleva la parte de ciberseguridad (detección, forense, respuesta a incidentes); **Dani** la programación. La web es parte del TFG, así que debe quedar lista para entregar.

## 1. Qué es KAIRON

Empresa **ficticia** de ciberseguridad creada para el TFG de SMX. El proyecto simula un pequeño **SOC** (centro de operaciones de seguridad): Wazuh detecta los ataques y una herramienta forense propia en Python recoge las pruebas del equipo afectado. La web corporativa es la cara pública de ese SOC.

- **Misión:** proteger a pymes vigilando sus sistemas de forma continua, detectando los ataques a tiempo y respondiendo rápido para minimizar el daño.
- **Público objetivo:** pymes que no tienen equipo de seguridad propio y necesitan a alguien que vigile sus sistemas y responda si pasa algo.
- **Tono:** serio, elegante y de confianza, con trasfondo mitológico. Idea central: *"actuar en el momento justo"*.

### Nombre e historia

- **Kairós:** en griego, el *instante oportuno*, distinto de *chronos* (el tiempo que pasa). Se representaba como un joven alado con un mechón en la frente: solo se le puede agarrar cuando pasa por delante, nunca después.
- **Por qué el nombre:** en seguridad lo que importa es detectar y actuar en el momento exacto; un minuto tarde ya es un incidente.
- **Historia de la empresa:** *[pendiente: no está definida en el contexto del proyecto]*.

## 2. Identidad visual

### Logotipo

Logo definitivo (carpeta `KAIRON-logo-limpio-transparente-versiones`):
- Letra **K** con un ala a la izquierda (las alas de Kairós) sobre una **esfera de brújula / reloj** con marcas en los ejes (el instante exacto).
- Palabra "KAIRON" en mayúsculas serif; la **O** lleva la misma esfera.
- Versiones: completo y emblema, en dorado, blanco, negro y oro oscuro; app icon de 1024 px y emblema en 16 a 512 px.

### Paleta

- **Oro del logo:** `#C4974B` (oro oscuro `#8A6A2E` para texto secundario).
- **Cian** (acento tecnológico, bordes y foco): `#35C6D6`.
- Fondo oscuro `#0E0B16`, marfil `#F5F3EF`, texto `#1C1826`.

### Tipografía

Serif clásica en mayúsculas: **Cinzel 500**, letter-spacing 0.16em.

## 3. Servicios

1. **Vigilancia y detección (SOC gestionado):** monitorización continua de equipos y red con un SIEM (Wazuh). Detectamos accesos sospechosos, malware, fuerza bruta y comportamientos anómalos, y avisamos al instante.
2. **Respuesta a incidentes y análisis forense:** al detectar un ataque, recogemos las pruebas del equipo afectado (procesos, conexiones, usuarios, inicios de sesión, persistencia, hashes) con nuestra herramienta forense y entregamos un informe con la cronología y cómo evitarlo.
3. **Auditoría de seguridad y hardening:** revisamos configuración de equipos y red, detectamos vulnerabilidades y las corregimos.
4. **Concienciación y formación:** enseñamos a reconocer phishing y a usar contraseñas seguras, porque la mayoría de ataques entran por ahí.
5. **Informes y cumplimiento:** informes claros del estado de seguridad, útiles para dirección y para auditorías.

**Propuesta de valor:** *"Vigilancia de seguridad profesional para tu pyme, sin contratar un equipo interno."*

**Cómo lo hacemos (para la sección técnica de la web):**
- **Detección:** Wazuh, con reglas propias y respuesta automática.
- **Forense:** herramienta propia en Python con cadena de custodia (hora UTC, número de caso y hash SHA-256 de cada prueba).
- **Laboratorio:** red virtual con firewall, servidor Linux, equipos Windows y una máquina atacante, aislada para hacer pruebas de forma segura.

## 4. Buyer persona

- **Nombre ficticio:** Marta, 45 años, directora administrativa de una empresa de logística de 60 empleados en Barcelona.
- **Situación:** no tiene departamento de informática propio; el servicio de IT externo lo gestiona todo.
- **Preocupaciones:** un ransomware que pare la empresa, RGPD, presupuesto limitado.
- **Qué busca:** claridad, precios previsibles, respuesta rápida y lenguaje sin jerga.
- **Cómo llega a KAIRON:** búsqueda en Google o recomendación de su gestor de IT.

## 5. Estructura

### index.html (Landing Page)

1. **Header:** logo, menú (`Inicio`, `Servicios`, `Sobre nosotros`) y CTA "Pide una auditoría gratuita".
2. **Hero:** título, subtítulo y banner con el emblema (con `alt`). Mensaje: *"KAIRON detecta a tiempo y actúa en el momento justo."*
3. **Servicios:** tarjetas con CSS Grid o Flexbox (mínimo 3 de los 5 servicios).
4. **Beneficios y testimonios:** argumentos reales del contexto (SOC gestionado, informe con cronología, lenguaje claro). Los testimonios son **ficticios** y se marcan como tales.
5. **Footer:** formulario de contacto con `<label>`, redes sociales y copyright.

### sobre-mi.html (Perfil del equipo)

1. **Dos tarjetas:** Lorena (ciberseguridad y forense) y Dani (programación y web). Avatar placeholder, rol, habilidades y enlaces a GitHub y LinkedIn.
2. **Valores y visión:** filosofía de KAIRON, basada en la idea de actuar en el instante oportuno.
3. **Navegación:** mismo header y footer que index.html.

### Reglas de trabajo

- No sobrescribir código de la otra persona sin preguntar.
- Ramas separadas por persona, fusionadas por fases.
- Commits pequeños con mensajes descriptivos en español.
- Sin dependencias, claves ni datos sensibles en el repositorio.
- Validación W3C y README.md con la estructura del enunciado.

## 6. Decisiones pendientes

- **Historia de la empresa:** ¿fundación, fundadores y fechas?
- **Testimonios y buyer persona:** ¿ficticios, como están aquí?
- **Web y TFG:** ¿la web menciona Wazuh y la herramienta forense, o eso queda para la parte técnica del TFG?
- **Requisitos del TFG:** qué parte de ciberseguridad se refleja en la web (cabeceras de seguridad, validación del formulario, etc.) y qué aporta la programación de Dani.

---

*Esperando confirmación antes de pasar a la Fase 2.*
