"""Genera img/topografia.svg: curvas de nivel sobre ruido suave (marching squares), estilo mapa topográfico."""
import math, random, os

random.seed(7)
W, H = 1600, 900
COLS, FILAS = 160, 90
NIVELES = 14

# Ruido de valores con interpolación suave, varias octavas
def rejilla(n, m):
    return [[random.random() for _ in range(m + 1)] for _ in range(n + 1)]

octavas = [(rejilla(6, 11), 1.0), (rejilla(12, 22), 0.5), (rejilla(24, 44), 0.25)]

def suave(t): return t * t * (3 - 2 * t)

def valor(g, x, y):
    n, m = len(g) - 1, len(g[0]) - 1
    gx, gy = x * m, y * n
    i, j = int(gx), int(gy)
    i2, j2 = min(i + 1, m), min(j + 1, n)
    tx, ty = suave(gx - i), suave(gy - j)
    a = g[j][i] * (1 - tx) + g[j][i2] * tx
    b = g[j2][i] * (1 - tx) + g[j2][i2] * tx
    return a * (1 - ty) + b * ty

def campo(x, y):
    s = sum(valor(g, x, y) * p for g, p in octavas) / sum(p for _, p in octavas)
    return s

Z = [[campo(c / COLS, f / FILAS) for c in range(COLS + 1)] for f in range(FILAS + 1)]
zmin = min(min(f) for f in Z); zmax = max(max(f) for f in Z)

def interp(p1, p2, v1, v2, nivel):
    t = (nivel - v1) / (v2 - v1) if v2 != v1 else 0.5
    return (p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t)

caminos = []
for k in range(1, NIVELES):
    nivel = zmin + (zmax - zmin) * k / NIVELES
    segs = []
    for f in range(FILAS):
        for c in range(COLS):
            x0, y0 = c * W / COLS, f * H / FILAS
            x1, y1 = (c + 1) * W / COLS, (f + 1) * H / FILAS
            v = [Z[f][c], Z[f][c + 1], Z[f + 1][c + 1], Z[f + 1][c]]
            p = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
            idx = sum(1 << i for i in range(4) if v[i] >= nivel)
            if idx in (0, 15): continue
            lados = []
            for i in range(4):
                j = (i + 1) % 4
                if (v[i] >= nivel) != (v[j] >= nivel):
                    lados.append(interp(p[i], p[j], v[i], v[j], nivel))
            if len(lados) == 2: segs.append((lados[0], lados[1]))
            elif len(lados) == 4:
                segs.append((lados[0], lados[1])); segs.append((lados[2], lados[3]))
    d = " ".join(f"M{a[0]:.1f} {a[1]:.1f}L{b[0]:.1f} {b[1]:.1f}" for a, b in segs)
    grosor = 1.4 if k % 4 == 0 else 0.8
    caminos.append(f'<path d="{d}" stroke-width="{grosor}"/>')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#8c6b3f" stroke-linecap="round" opacity="0.9">
{chr(10).join(caminos)}
</svg>'''
ruta = r"C:\Users\lorena\Argos-TFG\img\topografia.svg"
open(ruta, "w", encoding="utf-8").write(svg)
print("ok", os.path.getsize(ruta) // 1024, "KB")
