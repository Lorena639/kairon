/* Portfolio: consola de órdenes, filtro de competencias y aparición al hacer scroll */
document.documentElement.classList.add("js");

const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Consola ---------- */
const salida = document.getElementById("salida");
const formulario = document.getElementById("consola");
const entrada = document.getElementById("orden");

const ORDENES = {
  help: "Órdenes: perfil · herramientas · idiomas · formacion · contacto · clear",
  perfil: "Técnica SOC en prácticas (114 días, Apolo Cybersecurity).\nEstudiante de 2.º de SMX en Digitech FP.\nMe interesan la ciberseguridad y el análisis forense.",
  herramientas: "SOC:      Wazuh · IRIS · Grafana\nSistemas: Windows Server · Linux · Bash\nOficina:  MS Office · empezando con Power BI",
  idiomas: "Rumano   nativo\nEspañol  avanzado\nCatalán  C1\nInglés   B2",
  formacion: "CFGM SMX · Digitech FP · hasta jun. 2027\nTryHackMe · en curso\nCurso de OT",
  contacto: "antoniacracana@gmail.com\ngithub.com/Lorena639",
};

function escribir(texto, clase) {
  const linea = document.createElement("div");
  if (clase) linea.className = clase;
  linea.textContent = texto;
  salida.appendChild(linea);
  salida.scrollTop = salida.scrollHeight;
}

function ejecutar(bruta) {
  const orden = bruta.trim().toLowerCase();
  if (!orden) return;
  escribir("$ " + orden, "orden");
  if (orden === "clear") { salida.textContent = ""; return; }
  if (orden === "sudo") { escribir("Buen intento. Este incidente queda registrado."); return; }
  escribir(Object.hasOwn(ORDENES, orden) ? ORDENES[orden] : `Orden no encontrada: ${orden}. Prueba con help.`);
}

formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  ejecutar(entrada.value);
  entrada.value = "";
});
document.querySelectorAll("[data-orden]").forEach((b) => b.addEventListener("click", () => ejecutar(b.dataset.orden)));

ejecutar("perfil");
escribir("\nEscribe help para ver más.");

/* ---------- Filtro de competencias ---------- */
const filtros = document.querySelectorAll(".filtros button");
const competencias = document.querySelectorAll("#lista-comp li");
filtros.forEach((b) => b.addEventListener("click", () => {
  filtros.forEach((o) => { o.classList.toggle("activo", o === b); o.setAttribute("aria-pressed", String(o === b)); });
  competencias.forEach((c) => { c.hidden = b.dataset.f !== "todas" && c.dataset.o !== b.dataset.f; });
}));

/* ---------- Aparición al entrar en pantalla ---------- */
const aparecen = document.querySelectorAll(".aparece");
if (reducido || !("IntersectionObserver" in window)) {
  aparecen.forEach((a) => a.classList.add("visto"));
} else {
  const vigia = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visto"); vigia.unobserve(e.target); } });
  }, { threshold: 0.15 });
  aparecen.forEach((a, i) => { a.style.setProperty("--i", String(i % 5)); vigia.observe(a); });
}
