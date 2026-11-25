#!/usr/bin/env python3
"""Genera css/legado.css a partir de css/styles.css.

Las páginas interiores usan ya la cabecera, el pie, los botones y la tipografía del sistema nuevo
(css/kairon.css), pero su contenido sigue maquetado con las piezas de css/styles.css. Para que las dos
hojas no se pisen, este script copia styles.css quitando todas las reglas de las piezas que ahora define
kairon.css. El resultado se carga dentro de una capa (@layer antiguo), así que cualquier regla nueva gana.

Uso:  python3 tools/legado.py            (escribe css/legado.css)
      python3 tools/legado.py --comprobar (no escribe; falla si el archivo no está al día)
"""
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "css" / "styles.css"
DESTINO = RAIZ / "css" / "legado.css"

# Piezas que ahora pertenecen a kairon.css: se quita cualquier selector que las nombre
PIEZAS = [
    "cabecera", "logo", "menu", "menu-boton", "menu-movil", "controles", "control", "atajos",
    "pie", "boton", "salto", "formulario", "avisos", "aviso-red", "instalar", "enlace", "sello",
    "marco", "voz", "capitular", "acciones", "oculto",
    # Capas decorativas del diseño anterior que ya no están en el HTML
    "aurora", "foco", "grano", "cursor", "cortina", "puntos", "carga", "intro", "polvo", "arriba",
]
PATRON = re.compile(r"\.(?:" + "|".join(re.escape(p) for p in PIEZAS) + r")(?:__[\w-]+|--[\w-]+)?(?![\w-])")

# Reglas @ que se copian tal cual (no llevan selectores dentro)
LITERALES = ("@keyframes", "@-webkit-keyframes", "@font-face", "@property", "@view-transition")


def trocear(css):
    """Devuelve la lista de bloques de primer nivel: (cabecera, cuerpo) o (texto, None) si no lleva llaves."""
    bloques, i, n = [], 0, len(css)
    while i < n:
        # Espacios y comentarios sueltos
        m = re.compile(r"\s+|/\*.*?\*/", re.S).match(css, i)
        if m:
            i = m.end()
            continue
        j, prof, cadena = i, 0, None
        inicio_cuerpo = None
        while j < n:
            c = css[j]
            if cadena:
                if c == "\\":
                    j += 1
                elif c == cadena:
                    cadena = None
            elif c in "\"'":
                cadena = c
            elif css.startswith("/*", j):
                j = css.index("*/", j) + 1
            elif c == "{":
                if prof == 0:
                    inicio_cuerpo = j
                prof += 1
            elif c == "}":
                prof -= 1
                if prof == 0:
                    bloques.append((css[i:inicio_cuerpo].strip(), css[inicio_cuerpo + 1:j]))
                    j += 1
                    break
            elif c == ";" and prof == 0:
                bloques.append((css[i:j + 1].strip(), None))
                j += 1
                break
            j += 1
        else:
            resto = css[i:].strip()
            if resto:
                bloques.append((resto, None))
        i = j
    return bloques


def partir_selectores(cabecera):
    """Parte una lista de selectores por las comas de primer nivel (respeta paréntesis y corchetes)."""
    partes, prof, actual = [], 0, []
    for c in cabecera:
        if c in "([":
            prof += 1
        elif c in ")]":
            prof -= 1
        if c == "," and prof == 0:
            partes.append("".join(actual).strip())
            actual = []
        else:
            actual.append(c)
    partes.append("".join(actual).strip())
    return [p for p in partes if p]


def filtrar(css, sangria=""):
    salida, quitadas = [], 0
    for cabecera, cuerpo in trocear(css):
        if cuerpo is None:
            salida.append(sangria + cabecera)
            continue
        limpia = re.sub(r"/\*.*?\*/", "", cabecera, flags=re.S).strip()
        if limpia.startswith(LITERALES):
            salida.append(f"{sangria}{limpia} {{{cuerpo}}}")
        elif limpia.startswith("@"):
            dentro, q = filtrar(cuerpo, sangria + "  ")
            quitadas += q
            if dentro.strip():
                salida.append(f"{sangria}{limpia} {{\n{dentro}\n{sangria}}}")
        else:
            selectores = partir_selectores(limpia)
            quedan = [s for s in selectores if not PATRON.search(s)]
            quitadas += len(selectores) - len(quedan)
            if quedan:
                reglas = " ".join(cuerpo.split())
                # Formas del sistema nuevo: placas rectas. Los radios grandes y las píldoras pasan a 2 px; los círculos (50 %) se quedan
                reglas = re.sub(r"(border-radius:\s*)([^;}]+)", lambda m: m.group(1) + re.sub(r"\b(\d+(?:\.\d+)?)px", lambda n: n.group(0) if float(n.group(1)) <= 2 else "2px", m.group(2)), reglas)
                salida.append(f"{sangria}{', '.join(quedan)} {{ {reglas} }}")
    return "\n".join(salida), quitadas


def main():
    texto, quitadas = filtrar(ORIGEN.read_text(encoding="utf-8"))
    cabecera = (
        "/* KAIRON · piezas de contenido del diseño anterior.\n"
        "   ARCHIVO GENERADO por tools/legado.py a partir de css/styles.css: no se edita a mano.\n"
        "   Lo carga css/interior.css dentro de @layer antiguo, de modo que el sistema nuevo siempre gana. */\n"
    )
    nuevo = cabecera + texto + "\n"
    if "--comprobar" in sys.argv:
        if not DESTINO.exists() or DESTINO.read_text(encoding="utf-8") != nuevo:
            print("css/legado.css no está al día: ejecuta python3 tools/legado.py")
            return 1
        print("css/legado.css está al día")
        return 0
    DESTINO.write_text(nuevo, encoding="utf-8")
    print(f"css/legado.css escrito: {len(nuevo) // 1024} KB, {quitadas} selectores retirados")
    return 0


if __name__ == "__main__":
    sys.exit(main())
