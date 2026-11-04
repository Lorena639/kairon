"""Comprobación de la web KAIRON.

1. Estructura del HTML de todas las páginas (etiquetas sin cerrar, ids duplicados, img sin alt, label sin campo).
2. Si Playwright está instalado: abre cada página en Chromium y comprueba que no hay errores de JavaScript
   ni recursos que fallen (404), y que la escena 3D se crea.

Uso (desde la raíz del proyecto):
    python tools/comprobar.py
Para la parte de navegador hace falta: pip install playwright && python -m playwright install chromium
"""
import io, os, sys, threading, functools, http.server, socketserver
from html.parser import HTMLParser

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGINAS = ["index.html", "sobre-mi.html", "informe.html", "404.html", "ca/index.html", "ca/sobre-mi.html", "ca/informe.html", "servicios.html", "ca/servicios.html", "soc.html", "ca/soc.html", "contacto.html", "ca/contacto.html", "productos.html", "ca/productos.html", "proyectos.html", "ca/proyectos.html", "futuro.html", "ca/futuro.html"]
VACIAS = {"img", "br", "meta", "link", "input", "hr", "source", "path", "circle", "stop", "wbr"}


class Comprobador(HTMLParser):
    def __init__(self):
        super().__init__()
        self.pila, self.ids, self.errores, self.labels, self.campos = [], {}, [], [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.setdefault(a["id"], []).append(self.getpos()[0])
        if tag == "img" and "alt" not in a:
            self.errores.append(f"línea {self.getpos()[0]}: <img> sin alt")
        if tag == "label" and "for" in a:
            self.labels.append((a["for"], self.getpos()[0]))
        if tag in ("input", "textarea", "select") and "id" in a:
            self.campos.add(a["id"])
        if tag not in VACIAS:
            self.pila.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag in VACIAS:
            return
        if not self.pila:
            self.errores.append(f"línea {self.getpos()[0]}: </{tag}> sin apertura")
            return
        if self.pila[-1][0] != tag:
            nombres = [t for t, _ in self.pila]
            if tag in nombres:
                while self.pila and self.pila[-1][0] != tag:
                    t, l = self.pila.pop()
                    self.errores.append(f"línea {l}: <{t}> sin cerrar")
                self.pila.pop()
            else:
                self.errores.append(f"línea {self.getpos()[0]}: </{tag}> inesperado")
        else:
            self.pila.pop()


def comprobar_html():
    total = 0
    for ruta in PAGINAS:
        c = Comprobador()
        c.feed(io.open(os.path.join(RAIZ, ruta), encoding="utf-8").read())
        for t, l in c.pila:
            c.errores.append(f"línea {l}: <{t}> nunca se cierra")
        for i, ls in c.ids.items():
            if len(ls) > 1:
                c.errores.append(f"id duplicado '{i}' en líneas {ls}")
        for f, l in c.labels:
            if f not in c.campos:
                c.errores.append(f"línea {l}: label for='{f}' sin campo")
        estado = "OK" if not c.errores else f"{len(c.errores)} problemas"
        print(f"[HTML] {ruta}: {estado}")
        for e in c.errores:
            print("       ", e)
        total += len(c.errores)
    return total


def comprobar_navegador():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("[NAV] Playwright no está instalado; se omite la comprobación en navegador.")
        return 0

    class Silencioso(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Silencioso, directory=RAIZ))
    puerto = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    total = 0
    with sync_playwright() as p:
        nav = p.chromium.launch()
        ctx = nav.new_context(viewport={"width": 1280, "height": 800})
        for ruta in PAGINAS:
            pag = ctx.new_page()
            errores = []
            pag.on("pageerror", lambda e: errores.append(f"JS: {e}"))
            pag.on("response", lambda r: errores.append(f"{r.status} {r.url}") if r.status >= 400 and "fonts.g" not in r.url else None)
            pag.goto(f"http://127.0.0.1:{puerto}/{ruta}", wait_until="networkidle")
            pag.wait_for_timeout(3500)
            if "404" not in ruta and "informe" not in ruta:
                if not pag.query_selector(".hero__escena canvas"):
                    errores.append("no se ha creado la escena 3D")
            estado = "OK" if not errores else f"{len(errores)} problemas"
            print(f"[NAV]  {ruta}: {estado}")
            for e in errores:
                print("       ", e)
            total += len(errores)
            pag.close()
        nav.close()
    srv.shutdown()
    return total


if __name__ == "__main__":
    problemas = comprobar_html() + comprobar_navegador()
    print("\nResultado:", "todo correcto" if problemas == 0 else f"{problemas} problemas")
    sys.exit(1 if problemas else 0)
