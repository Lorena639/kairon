# Skill Impeccable (instalada solo como texto)

- Origen: https://github.com/pbakaus/impeccable, versión 4.8.2 (commit b4bff16, 11-11-2026). Licencia Apache-2.0 (ver LICENSE y NOTICE.md).
- Revisada el 12-11-2026 antes de instalarla: unas 108.000 estrellas en GitHub, mantenida activamente.
- **Se ha copiado solo `SKILL.md` y `reference/`** (guías de diseño en Markdown).
- **No se ha copiado a propósito:**
  - `scripts/`: lanzador que descarga un ejecutable precompilado del motor;
  - `.claude/settings.json`: hooks que lo ejecutarían en cada edición y al terminar;
  - los subagentes.

  Así no se ejecuta código de terceros en el repo. La propia skill prevé este caso ("Launcher unavailable"): lee PRODUCT.md y DESIGN.md directamente y sigue sus guías.
- Uso: `/impeccable critique`, `/impeccable audit`, `/impeccable animate`, `/impeccable polish`, etc.
- Para actualizarla, repetir la misma revisión y copiar de nuevo solo esas dos piezas.
