/* Pixel art del portfolio, dibujado a mano como texto: cada carácter es un píxel.
   Se convierte una vez en lienzos pequeños que luego se escalan sin suavizado. */

/* Paleta de la cueva (la misma que usa styles.css) */
export const PALETA = {
  k: "#120f1f", // contorno
  h: "#2b2236", H: "#4b3d60", // pelo oscuro
  s: "#c98b5f", S: "#a56a45", // piel
  g: "#120f1f", l: "#9fe8ff", // gafas: montura y cristal
  c: "#3fb6a8", C: "#24786f", // camiseta
  p: "#2d3150", z: "#ece8ff", // pantalón y zapatillas
  w: "#6b4429", W: "#9a6338", // madera
  y: "#ffbf5a", Y: "#c9862e", // oro / ámbar
  b: "#9fe8ff", // vidrio
  x: "#5ef2d0", X: "#1f9c8f", // cristal turquesa
  v: "#b48cff", V: "#7c5cd6", // cristal lila
  m: "#ff6fb1", // magenta
  r: "#3a3357", R: "#544a78", // roca
  f: "#ff8a3d", F: "#ffe26a", // fuego
  i: "#0b0a14", // muy oscuro
  q: "#ece8ff"  // papel
};

const CABEZA_FRENTE = [
  "................",
  ".....kkkkkk.....",
  "....khhhhhhk....",
  "...khHhhhhhhk...",
  "...khhhhhhhhk...",
  "...khsssssshk...",
  "...ksglgglgsk...",
  "...kssssssssk...",
  "....kssSSssk....",
];
const CUERPO = [
  "...kcccccccck...",
  "..ksccccccccsk..",
  "..ksCccccccCsk..",
  "...kCCCCCCCCk...",
];
const PIERNAS_A = ["....kppkkppk....", "....kppkkppk....", "....kzzkkzzk...."];
const PIERNAS_B = ["....kppk.kppk...", "...kppk..kppk...", "...kzzk...kzzk.."];

const CABEZA_ESPALDA = [
  "................",
  ".....kkkkkk.....",
  "....khhhhhhk....",
  "...khHhhhhhhk...",
  "...khhhhhhhhk...",
  "...khhhhhhhhk...",
  "...kghhhhhhgk...",
  "...khhhhhhhhk...",
  "....kssssssk....",
];
const CABEZA_LADO = [
  "................",
  ".....kkkkkk.....",
  "....khhhhhhk....",
  "...khHhhhhhhk...",
  "...khhhhhhhhk...",
  "...ksshhhhhhk...",
  "..kglgshhhhhk...",
  "...ksssshhhhk...",
  "....kssssssk....",
];

/* Fotogramas del personaje: abajo, arriba e izquierda (la derecha es el espejo) */
export const JUGADOR = {
  abajo: [[...CABEZA_FRENTE, ...CUERPO, ...PIERNAS_A], [...CABEZA_FRENTE, ...CUERPO, ...PIERNAS_B]],
  arriba: [[...CABEZA_ESPALDA, ...CUERPO, ...PIERNAS_A], [...CABEZA_ESPALDA, ...CUERPO, ...PIERNAS_B]],
  lado: [[...CABEZA_LADO, ...CUERPO, ...PIERNAS_A], [...CABEZA_LADO, ...CUERPO, ...PIERNAS_B]]
};

/* Objetos de la cueva: cada uno abre una sección */
export const OBJETOS = {
  espejo: [
    "......kkkk......",
    ".....kyyyyk.....",
    "....kybbbbyk....",
    "...kybbxbbbyk...",
    "...kybxbbbbyk...",
    "...kybbbbbbyk...",
    "...kybbbbbbyk...",
    "...kybbbbbbyk...",
    "...kybbbbbxyk...",
    "....kybbbbyk....",
    ".....kyyyyk.....",
    "......kyyk......",
    ".......kk.......",
    "......kYYk......",
    ".....kkkkkk.....",
    "................",
  ],
  cofre: [
    "................",
    "................",
    "...kkkkkkkkkk...",
    "..kWWWWWWWWWWk..",
    "..kwwwwwwwwwwk..",
    "..kwwwwwwwwwwk..",
    "..kyyyyyyyyyyk..",
    "..kkkkkyykkkkk..",
    "..kWWWWyyWWWWk..",
    "..kwwwwkkwwwwk..",
    "..kwwwwwwwwwwk..",
    "..kWWWWWWWWWWk..",
    "..kyyyyyyyyyyk..",
    "..kkkkkkkkkkkk..",
    "................",
    "................",
  ],
  tablon: [
    "................",
    "..kkkkkkkkkkkk..",
    "..kWWWWWWWWWWk..",
    "..kWqqqWWqqqWk..",
    "..kWqkqWWqqqWk..",
    "..kWqqqWWqkqWk..",
    "..kWWWWWWqqqWk..",
    "..kWWqqqWWWWWk..",
    "..kWWqkqWWWWWk..",
    "..kWWWWWWWWWWk..",
    "..kkkkkkkkkkkk..",
    "....kwk..kwk....",
    "....kwk..kwk....",
    "....kwk..kwk....",
    "...kkkk..kkkk...",
    "................",
  ],
  caldero: [
    "................",
    "......x..x......",
    ".....x.xx.x.....",
    ".......x........",
    "...kkkkkkkkkk...",
    "..kxxxXxxxXxxk..",
    "..kiiiiiiiiiik..",
    "..kirrrrrrrrik..",
    "..kirRRrrrrrik..",
    "..kirrrrrrrrik..",
    "...kirrrrrrik...",
    "....kiiiiiik....",
    "....kk....kk....",
    "................",
    "................",
    "................",
  ],
  arbol: [
    ".......kk.......",
    "......kxxk......",
    "......kxXk......",
    ".....kxxXk..kk..",
    "..kk.kxXXk.kvvk.",
    ".kvvkkxxXkkvvvk.",
    ".kvvvkxxXkkvVvk.",
    ".kvVvkxXXk.kvvk.",
    "..kvvkxXXk.kvk..",
    "..kvvkXXXkkvvk..",
    "...kvkxXXkkvk...",
    "...kkkrrrrkkk...",
    "..krrrrRrrrrrk..",
    ".krrRrrrrrRrrrk.",
    ".kkkkkkkkkkkkkk.",
    "................",
  ],
  hoguera: [
    "................",
    ".......f........",
    "......fFf.......",
    ".....fFFFf......",
    "....fFFyFFf.....",
    "....fFyyyFf.....",
    "...ffFyyyFff....",
    "...fFFyyyFFf....",
    "....fFFFFFf.....",
    "..kwwkfffkwwk...",
    "..kWWwkkkwWWk...",
    "...kkWWwWWkk....",
    "..kwwkkkkkwwk...",
    "................",
    "................",
    "................",
  ]
};

/* Decoración */
export const DECORADO = {
  cristal: [
    "................",
    "................",
    "........k.......",
    ".......kxk......",
    "......kxXk..k...",
    "......kxXk.kvk..",
    "..k...kxXk.kvk..",
    ".kxk..kxXk.kVk..",
    ".kXk..kXXk.kVk..",
    "..k..krrrrkkk...",
    "....krRrrrrk....",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  seta: [
    "................",
    "................",
    "................",
    "................",
    "................",
    ".....kkkkk......",
    "....kvvvvvk.....",
    "...kvVvqvvvk....",
    "...kkkkkkkkk....",
    "......kqk..kk...",
    "......kqk.kvvk..",
    "......kqk.kkkk..",
    ".....kkkkk.kqk..",
    "................",
    "................",
    "................",
  ]
};

/** Convierte un dibujo de texto en un lienzo (opcionalmente en espejo). */
export function aLienzo(filas, espejo = false) {
  const alto = filas.length, ancho = Math.max(...filas.map((f) => f.length));
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho; lienzo.height = alto;
  const c = lienzo.getContext("2d");
  filas.forEach((fila, y) => {
    [...fila].forEach((ch, x) => {
      const color = PALETA[ch];
      if (!color) return;
      c.fillStyle = color;
      c.fillRect(espejo ? ancho - 1 - x : x, y, 1, 1);
    });
  });
  return lienzo;
}
