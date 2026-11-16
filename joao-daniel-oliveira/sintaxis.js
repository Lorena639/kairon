/* Resaltado de sintaxis mínimo para los lenguajes de la página.
   Divide cada línea en fichas (comentario, cadena, número, palabra clave, función, texto)
   con una expresión regular por lenguaje. No es un analizador completo: basta para leer. */

const CLAVES = {
  JavaScript: "import from export const let var new function return if else for of in await async class",
  Python: "def for in if else elif return import from class while print True False None and or not",
  SQL: "SELECT FROM WHERE ORDER BY AND OR AS JOIN ON GROUP LIMIT INSERT INTO VALUES",
  Bash: "cd ls open echo if then fi for do done",
  Java: "class public static void new String int return import",
  HTML: "a href",
  Luau: "local function end if then else return true false nil and or not"
};

const COMENTARIO = { JavaScript: "//", Java: "//", Python: "#", Bash: "#", SQL: "--", Luau: "--", HTML: "<!--" };

function escapar(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Devuelve las fichas de una línea: [{ tipo, texto }] */
export function fichas(linea, lenguaje) {
  const claves = new Set((CLAVES[lenguaje] || "").split(" "));
  const marca = COMENTARIO[lenguaje];
  const salida = [];
  let resto = linea;
  // El comentario ocupa el resto de la línea (si no está dentro de una cadena; para estos ejemplos basta)
  let comentario = "";
  if (marca) {
    const i = resto.indexOf(marca);
    if (i >= 0 && !/["'][^"']*$/.test(resto.slice(0, i))) { comentario = resto.slice(i); resto = resto.slice(0, i); }
  }
  const patron = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w]*)(?=\s*\()|([A-Za-z_][\w]*)|(\s+|[^\w\s"'`]+)/g;
  let m;
  while ((m = patron.exec(resto))) {
    if (m[1]) salida.push({ tipo: "cadena", texto: m[1] });
    else if (m[2]) salida.push({ tipo: "numero", texto: m[2] });
    else if (m[3]) salida.push({ tipo: claves.has(m[3]) ? "clave" : "funcion", texto: m[3] });
    else if (m[4]) salida.push({ tipo: claves.has(m[4]) ? "clave" : "", texto: m[4] });
    else salida.push({ tipo: "", texto: m[5] });
  }
  if (comentario) salida.push({ tipo: "comentario", texto: comentario });
  return salida;
}

/** HTML resaltado de las fichas, cortando en `limite` caracteres (para el efecto de tecleo). */
export function pintar(lista, limite = Infinity) {
  let html = "";
  let usados = 0;
  for (const f of lista) {
    if (usados >= limite) break;
    const trozo = f.texto.slice(0, Math.max(0, limite - usados));
    usados += trozo.length;
    html += f.tipo ? `<span class="t-${f.tipo}">${escapar(trozo)}</span>` : escapar(trozo);
  }
  return html;
}

/** Resalta un bloque entero: una línea por <span class="l">. */
export function resaltar(codigo, lenguaje) {
  return codigo.split("\n").map((l) => `<span class="l">${pintar(fichas(l, lenguaje)) || " "}</span>`).join("");
}
