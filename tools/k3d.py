"""Genera js/k3d-forma.js: el contorno del emblema de KAIRON para extruirlo en 3D con Three.js.

Lee el canal alfa de img/kairon-emblema-dorado.png, busca los contornos exteriores y sus huecos
(OpenCV, jerarquía de dos niveles), los simplifica y los guarda normalizados de 0 a 1.
La cara frontal del 3D usa el PNG original, así que el dibujo del logo no cambia (regla de marca):
este contorno solo sirve para recortar la pieza y darle grosor.

Uso (solo hace falta para regenerar el archivo; la web no necesita OpenCV):
    pip install opencv-python-headless numpy
    python tools/k3d.py
"""
import json
from pathlib import Path

import cv2
import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
PNG = RAIZ / "img" / "kairon-emblema-dorado.png"
SALIDA = RAIZ / "js" / "k3d-forma.js"
AREA_MIN = 40      # px²: se descartan motas sueltas
EPSILON = 0.7      # px: tolerancia de simplificación (más alto = menos puntos)

img = cv2.imread(str(PNG), cv2.IMREAD_UNCHANGED)
alto, ancho = img.shape[:2]
mascara = (img[:, :, 3] > 110).astype(np.uint8) * 255
contornos, jerarquia = cv2.findContours(mascara, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
jerarquia = jerarquia[0]


def puntos(c):
    c = cv2.approxPolyDP(c, EPSILON, True).reshape(-1, 2)
    # Normalizado: x de 0 a 1 y y hacia arriba, centrado después en Three.js
    return [round(v, 4) for x, y in c for v in (x / ancho, 1 - y / alto)]


formas = []
for i, c in enumerate(contornos):
    if jerarquia[i][3] != -1 or cv2.contourArea(c) < AREA_MIN:
        continue  # solo exteriores; los huecos se añaden a su exterior
    huecos = []
    h = jerarquia[i][2]
    while h != -1:
        if cv2.contourArea(contornos[h]) >= AREA_MIN:
            huecos.append(puntos(contornos[h]))
        h = jerarquia[h][0]
    formas.append({"c": puntos(c), "h": huecos})

datos = {"proporcion": round(ancho / alto, 4), "formas": formas}
SALIDA.write_text(
    "/* Contorno del emblema de KAIRON, generado por tools/k3d.py a partir de img/kairon-emblema-dorado.png.\n"
    "   No editar a mano. Coordenadas normalizadas (0 a 1): c = contorno exterior, h = huecos. */\n"
    "window.KAIRON_K = " + json.dumps(datos, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)
total = sum(len(f["c"]) // 2 + sum(len(x) // 2 for x in f["h"]) for f in formas)
print(f"{len(formas)} formas, {total} puntos, {SALIDA.stat().st_size // 1024} KB -> {SALIDA.relative_to(RAIZ)}")
