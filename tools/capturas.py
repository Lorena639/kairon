"""Capturas de la web KAIRON para la memoria del TFG (Playwright + Chromium)."""
import os, sys, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "docs", "capturas")
os.makedirs(SALIDA, exist_ok=True)
PUERTO = 8790

class Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

handler = functools.partial(Silencioso, directory=RAIZ)
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(("127.0.0.1", PUERTO), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{PUERTO}/"

def capturar(ctx, ruta, nombre, full=True, espera=1500, antes=None):
    pag = ctx.new_page()
    pag.goto(URL + ruta, wait_until="networkidle")
    pag.wait_for_timeout(espera)
    if antes: antes(pag)
    pag.screenshot(path=os.path.join(SALIDA, nombre), full_page=full)
    pag.close()
    print("  ", nombre)

with sync_playwright() as p:
    nav = p.chromium.launch()

    # 1) Portada con animaciones (hero 3D) a 1440x900, esperando al preloader
    ctx = nav.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    capturar(ctx, "index.html", "01-portada-hero.png", full=False, espera=5500)
    capturar(ctx, "sobre-mi.html", "06-equipo-cabecera.png", full=False, espera=3500)
    ctx.close()

    # 2) Páginas completas sin animaciones (movimiento reducido) a 1000 px de ancho
    ctx = nav.new_context(viewport={"width": 1000, "height": 800}, reduced_motion="reduce", device_scale_factor=1)
    capturar(ctx, "index.html", "02-portada-completa.png", espera=2500)
    capturar(ctx, "sobre-mi.html", "07-equipo-completa.png", espera=2000)
    ctx.close()

    # 3) Secciones concretas a 1440 px (con scroll)
    ctx = nav.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce", device_scale_factor=1)
    def seccion(sel):
        def f(pag):
            pag.evaluate(f"document.querySelector('{sel}').scrollIntoView()")
            pag.wait_for_timeout(1200)
        return f
    capturar(ctx, "index.html", "03-soc-en-vivo.png", full=False, espera=2500, antes=seccion("#soc"))
    capturar(ctx, "index.html", "04-incidente.png", full=False, espera=2500, antes=seccion("#incidente"))
    capturar(ctx, "index.html", "05-contacto.png", full=False, espera=2500, antes=seccion("#contacto"))
    capturar(ctx, "index.html", "10-faq.png", full=False, espera=2500, antes=seccion("#faq"))
    capturar(ctx, "index.html", "11-testimonios.png", full=False, espera=2500, antes=seccion("#testimonios"))
    capturar(ctx, "informe.html", "12-informe.png", espera=2500)
    capturar(ctx, "ca/index.html", "13-portada-catalan.png", full=False, espera=2500)
    ctx.close()

    # 3b) Ataque simulado en marcha (con animaciones)
    ctx = nav.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    def ataque(pag):
        pag.evaluate("document.querySelector('#incidente').scrollIntoView()")
        pag.wait_for_timeout(1500)
        pag.click(".simular")
        pag.wait_for_timeout(2600)
    capturar(ctx, "index.html", "14-ataque-simulado.png", full=False, espera=5500, antes=ataque)
    ctx.close()

    # 4) Móvil
    ctx = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True, reduced_motion="reduce")
    capturar(ctx, "index.html", "08-movil-portada.png", espera=2500)
    capturar(ctx, "sobre-mi.html", "09-movil-equipo.png", espera=2000)
    ctx.close()

    nav.close()
srv.shutdown()
print("listo")
