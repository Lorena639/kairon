/* Se carga en la cabecera, antes de pintar nada: si en esta visita tocan los títulos de crédito,
   baja el telón (clase «telon») para que la portada no asome un instante antes de que empiecen.
   portfolio.js lo levanta; si no llegara a cargarse, el CSS lo quita solo a los 4 segundos. */
(function () {
  try {
    var guardado = localStorage.getItem("movimiento");
    var quieto = guardado ? guardado === "reducido" : matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!quieto && !sessionStorage.getItem("titulos")) document.documentElement.classList.add("telon");
  } catch (e) { /* sin almacenamiento: no hay telón */ }
})();
