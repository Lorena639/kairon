#!/usr/bin/env python3
"""Pasa las páginas interiores al diseño «Una noche de guardia».

Para cada página (castellano y catalán):
  - cambia las hojas css/fuentes.css + css/styles.css por css/kairon.css + css/interior.css;
  - quita las capas decorativas del diseño anterior (aurora, grano, cursor, puntos laterales, botón «arriba»…);
  - pone la cabecera, el menú móvil y el pie de la portada (copiados de index.html o ca/index.html, con los enlaces
    ajustados), y marca con aria-current la página en la que se está;
  - cambia el globo (intro.js, escena.js, polvo.js) por el territorio de la portada (three, noche-tierra, pagina.js).
El contenido de cada página no se toca.

Uso:  python3 tools/interiores.py [página.html …]      (sin argumentos: todas)
      python3 tools/interiores.py --horas               (segundo paso: la hora de cada página)
"""
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
VERSION = "20261126d"
PAGINAS = ["servicios", "soc", "productos", "proyectos", "futuro", "sobre-mi", "contacto", "informe", "incidente",
           "metodo", "preguntas", "laboratorio", "kairos", "legal", "plan", "data-chip"]
MENU = ["servicios.html", "soc.html", "productos.html", "proyectos.html", "futuro.html", "sobre-mi.html"]


def bloque(s, inicio, fin):
    """Devuelve (a, b) para el texto que empieza en la línea con `inicio` y acaba en la primera línea `fin` después."""
    a = s.index(inicio)
    a = s.rindex("\n", 0, a) + 1
    b = s.index(fin, a) + len(fin)
    if b < len(s) and s[b] == "\n":
        b += 1
    return a, b


def plantillas(ca):
    portada = (RAIZ / ("ca/index.html" if ca else "index.html")).read_text(encoding="utf-8")
    a, b = bloque(portada, '<header class="cabecera">', "  </header>")
    cabecera = portada[a:b]
    cabecera = re.sub(r'\n\s*<img class="logo logo--dia"[^\n]*', "", cabecera)
    cabecera = cabecera.replace('href="#contacto"', 'href="contacto.html"')
    a, b = bloque(portada, '<div class="menu-movil"', "  </div>")
    menu = portada[a:b].replace('href="#contacto"', 'href="contacto.html"')
    inicio = "Inici" if ca else "Inicio"
    menu = menu.replace("    <ul>\n", '    <ul>\n      <li><a href="index.html">%s</a></li>\n' % inicio, 1)
    a = portada.rindex("\n", 0, portada.index('<div class="marco pie__base">')) + 1
    b = portada.index("\n    </div>\n", portada.index('<p class="pie__derechos"')) + len("\n    </div>\n")
    base = portada[a:b]
    if ca:
        despedida = ('    <div class="marco pie__despedida">\n'
                     '      <p class="voz voz--grande">Parlem de la teva xarxa?</p>\n'
                     '      <a class="boton boton--oro" href="contacto.html">Demana una auditoria</a>\n'
                     '    </div>\n')
    else:
        despedida = ('    <div class="marco pie__despedida">\n'
                     '      <p class="voz voz--grande">¿Hablamos de tu red?</p>\n'
                     '      <a class="boton boton--oro" href="contacto.html">Pide una auditoría</a>\n'
                     '    </div>\n')
    return cabecera, menu, base, despedida


def convertir(ruta):
    ca = ruta.parent.name == "ca"
    pre = "../" if ca else ""
    s = ruta.read_text(encoding="utf-8")
    if "css/interior.css" in s:
        return "ya estaba"
    nombre = ruta.name
    cabecera, menu, base, despedida = plantillas(ca)

    # --- <head>: hojas de estilo
    s, n = re.subn(r'\n\s*<link rel="stylesheet" href="(\.\./)?css/fuentes\.css[^"]*">', "", s)
    s, n = re.subn(r'<link rel="stylesheet" href="(\.\./)?css/styles\.css[^"]*">',
                   '<link rel="stylesheet" href="%scss/kairon.css?v=%s">\n  <link rel="stylesheet" href="%scss/interior.css?v=%s">' % (pre, VERSION, pre, VERSION), s)
    assert n == 1, (ruta, "styles.css")
    if 'class="sin-js' not in s and "sin-js" not in s[:400]:
        s = s.replace("<html lang=", '<html class="sin-js noche" lang=', 1) if '<html lang=' in s else s

    # --- capas decorativas y piezas del diseño anterior
    s = re.sub(r'\n  <!-- (Capas globales|Navegación lateral|Navegació lateral|Controles de experiencia|Controls d\'experiència|Primer elemento|Primer element)[^\n]*-->', "", s)
    s = re.sub(r'\n  <div class="(aurora|foco|grano|progreso|cortina|cursor|cursor__anillo)"[^\n]*</div>', "", s)
    s = re.sub(r'\n  <a class="arriba"[^\n]*</a>', "", s)
    for inicio in ('<nav class="puntos"', '<div class="controles"'):
        if inicio in s:
            a, b = bloque(s, inicio, "  </" + ("nav>" if "nav" in inicio else "div>"))
            s = s[:a] + s[b:]

    # --- menú móvil, cabecera y pie
    a, b = bloque(s, '<div class="menu-movil"', "  </div>")
    s = s[:a] + menu + s[b:]
    a, b = bloque(s, '<header class="cabecera">', "  </header>")
    antigua = s[a:b]
    m = re.search(r'<li class="menu__idioma"><a href="([^"]+)"', antigua)
    otra = m.group(1) if m else (("../" + nombre) if ca else ("ca/" + nombre))
    nueva = re.sub(r'(<li class="menu__idioma"><a href=")[^"]+', lambda x: x.group(1) + otra, cabecera)
    s = s[:a] + nueva + s[b:]
    # el menú móvil también lleva el cambio de idioma: el enlace de la portada se cambia por el de esta página
    s = re.sub(r'(<div class="menu-movil".*?<li><a href=")(\.\./index\.html|ca/index\.html)(" lang=)', lambda x: x.group(1) + otra + x.group(3), s, count=1, flags=re.S)
    if nombre in MENU:
        s = s.replace('<li><a href="%s">' % nombre, '<li><a href="%s" aria-current="page">' % nombre)
    if '<footer class="pie' in s:
        a, b = bloque(s, '<footer class="pie', "  </footer>")
        pie = '  <footer class="pie pie--interior">\n' + ("" if nombre == "contacto.html" else despedida + "\n") + base + "  </footer>\n"
        s = s[:a] + pie + s[b:]

    # --- scripts: fuera el globo, dentro el territorio
    s = re.sub(r'\n\s*<script src="(\.\./)?js/(intro|escena|polvo)\.js[^"]*" defer></script>', "", s)
    s = re.sub(r'\n\s*<!-- Páginas interiores v6[^\n]*-->', "", s)
    i = s.index('<script src="%sjs/main.js' % pre)
    i = s.rindex("\n", 0, i) + 1
    nuevos = "".join('  <script src="%sjs/%s?v=%s" defer></script>\n' % (pre, f, VERSION)
                     for f in ("vendor/three.min.js", "noche-tierra.js", "pagina.js"))
    s = s[:i] + nuevos + s[i:]
    s = re.sub(r'\?v=20261125[a-z]', "?v=" + VERSION, s)
    ruta.write_text(s, encoding="utf-8")
    return "convertida"


def main():
    nombres = sys.argv[1:] or [p + ".html" for p in PAGINAS] + ["ca/" + p + ".html" for p in PAGINAS]
    for n in nombres:
        r = RAIZ / n
        if r.exists():
            print(f"{n:24} {convertir(r)}")
        else:
            print(f"{n:24} no existe")


if __name__ == "__main__" and "--horas" not in sys.argv:
    main()


# ---------- Segundo paso: cada página es una hora de la noche ----------
# Hora que se ve en grande tras las montañas y tono del cielo (los mismos tonos que la portada: 0 anochecer,
# 1 noche cerrada, 2 antes del alba, 2.5 alba, 3 hora dorada). «ahora»: la hora real de Barcelona.
HORAS = {
    "servicios": ("00:30", 1), "laboratorio": ("01:40", 1), "soc": ("03:07", 1), "incidente": ("03:07", 1),
    "kairos": ("03:07", 1.2), "data-chip": ("05:10", 2), "futuro": ("06:20", 2.5), "metodo": ("06:45", 2.7),
    "informe": ("09:00", 4), "preguntas": ("10:30", 4), "plan": ("12:00", 4), "productos": ("13:15", 4),
    "legal": ("16:40", 4), "proyectos": ("19:30", 0.5), "sobre-mi": ("22:59", 0), "contacto": ("ahora", None),
}


def con_hora(ruta):
    s = ruta.read_text(encoding="utf-8")
    nombre = ruta.stem
    if nombre not in HORAS or 'class="cielo-hora"' in s:
        return "sin cambios"
    hora, tono = HORAS[nombre]
    s = s.replace("<html ", '<html data-hora="%s"%s ' % (hora, "" if tono is None else ' data-tono="%s"' % tono), 1)
    # la hora en grande, detrás del territorio (va antes del lienzo en el DOM)
    texto = "--:--" if hora == "ahora" else hora
    s, n = re.subn(r'(\n(\s*)<div class="hero__escena pagina__escena")',
                   lambda m: '\n%s<p class="cielo-hora" aria-hidden="true">%s</p>%s' % (m.group(2), texto, m.group(1)), s, count=1)
    # el logo de día, para las horas de luz (lo muestra kairon.css con data-luz="dia")
    pre = "../" if ruta.parent.name == "ca" else ""
    if 'logo--dia' not in s:
        s = s.replace('width="389" height="104" alt="KAIRON">\n    </a>',
                      'width="389" height="104" alt="KAIRON">\n      <img class="logo logo--dia" src="%simg/kairon-logo-horizontal-oro_oscuro-440.png" width="440" height="131" alt="" aria-hidden="true">\n    </a>' % pre, 1)
    ruta.write_text(s, encoding="utf-8")
    return "hora %s%s" % (hora, "" if n else " (sin cabecera de paisaje)")


if __name__ == "__main__" and "--horas" in sys.argv:
    for n in [p + ".html" for p in PAGINAS] + ["ca/" + p + ".html" for p in PAGINAS]:
        print(f"{n:24} {con_hora(RAIZ / n)}")
