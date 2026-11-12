/* KAIRON · El mundo del radar (portada v6, Three.js r160 + postprocessing)
   Un solo lienzo WebGL fijo para toda la portada y UNA escena: el globo de nodos (los equipos
   vigilados) con el emblema en relieve en el centro. La cámara no corta nunca: recorre el mundo
   según el scroll, de pose en pose, con amortiguación.

   Qué hay en la escena:
   - Globo de nodos y red, paquetes de datos (cian), barrido de radar, pulso y polvo.
   - Núcleo de cristal oscuro en el centro del globo: tapa los nodos y las líneas de la cara de atrás
     y le da al emblema el fondo oscuro para el que está dibujado. Borde con luz rasante (fresnel).
   - Emblema en relieve de la hoja de marca DENTRO del núcleo: el PNG oficial (recortado del logo
     completo, los mismos píxeles que la intro), con grosor (capas apiladas), luz que responde al
     cursor, un barrido especular, un aura con su propia silueta, el destello de su esfera con haces
     de luz y un anillo de luz a sus pies. El dibujo no se toca: solo se ilumina, se enmascara y se
     le da profundidad.
   - Nodos y líneas con un solo sombreador: se atenúan con la distancia, se apagan detrás del núcleo,
     se aclaran delante del emblema, se encienden junto a él y responden al cursor.
   - Anillo del tiempo (manifiesto): 60 marcas de chronos y una sola de kairos, la dorada.
   - Escudo (Responder) e informe sellado (Demostrar): las facetas de los servicios.
   - Visor del SOC: anillos de alcance y avisos que laten sobre el globo con cada alerta simulada.
   - Incidente: el rojo se extiende por la red y una onda dorada lo contiene.

   Quién lo dirige: js/v6.js le pasa una lista de claves { y: scroll en px, pose: nombre } y la
   posición y velocidad del scroll. Aquí solo se interpola y se dibuja.

   Modos: sin WebGL, con ahorro de datos, poca memoria o ?ligero se dibuja el radar 2D de escena.js.
   Con "menos movimiento" la escena queda quieta (sin vuelos de cámara) y solo se repinta al cambiar. */

(function () {
  const cont = document.querySelector(".mundo");
  if (!cont) return;
  const html = document.documentElement;
  const consulta = new URLSearchParams(location.search);
  const CA = html.lang === "ca";

  /* ---------- Modo ligero ---------- */
  function modoLigero() {
    html.classList.add("sin-mundo");
    if (typeof radar2D === "function") radar2D(cont);
    const nada = () => {};
    window.kaironMundo = { ligero: true, listo: true, claves: nada, scroll: nada, entrada: nada, asentar: nada, alerta: nada, quieto: nada };
    window.kaironEscena = { impacto: nada, ataque: nada };
  }
  function hayWebGL() {
    try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  }
  const ahorro = (navigator.connection && navigator.connection.saveData) || navigator.deviceMemory <= 2;
  if (consulta.has("ligero") || ahorro || typeof THREE === "undefined" || !hayWebGL()) { modoLigero(); return; }

  // El emblema se toma del PNG del logo completo (es el mismo dibujo, pero sin cortar por abajo, y son
  // exactamente los píxeles que enseña la intro: así el empalme entre la intro y la escena es exacto)
  const rutaEmblema = new URL("../img/relieve/kairon-relieve-logo.png", document.currentScript.src).href;
  const LOGO = { w: 546, h: 482, x: 45, y: 0, rw: 431, rh: 360 }; // recorte del emblema dentro del logo (px)
  const reducidoSO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const movil = window.innerWidth < 720;

  /* ---------- Poses de cámara y de escena ----------
     az / el: ángulos de la cámara alrededor del globo (radianes) · dist: distancia
     ox / oy: desplazamiento del globo en pantalla (fracción del ancho / alto)
     atenua: cuánto se apaga el lienzo (0 = pleno, 1 = invisible)
     tiempo, reloj, escudo, informe, visor, amenaza, cont: peso de cada elemento (0..1)
     emblema: opacidad del emblema · nucleo: peso del núcleo de cristal · giro: velocidad de rotación del globo */
  const BASE = { az: 0, el: 0.16, dist: 7.8, ox: 0, oy: 0, atenua: 0, tiempo: 0, reloj: 0, escudo: 0, informe: 0, visor: 0, amenaza: 0, cont: 0, emblema: 1, nucleo: 1, giro: 1 };
  const POSES = movil ? {
    hero:        { az: 0, el: 0.16, dist: 13.4, oy: -0.19 },
    manifiesto1: { az: 0.7, el: 0.05, dist: 10.5, oy: 0.22, atenua: 0.25, tiempo: 1, reloj: 0.1 },
    manifiesto2: { az: 1.5, el: 0.1, dist: 10.5, oy: 0.22, atenua: 0.25, tiempo: 1, reloj: 0.69 },
    manifiesto3: { az: 2.2, el: 0.18, dist: 11.5, oy: 0.3, atenua: 0.5, tiempo: 1, reloj: 0.72 },
    detectar:    { az: 2.7, el: 0.3, dist: 10.5, oy: 0.27, atenua: 0.35 },
    responder:   { az: 3.5, el: 0.2, dist: 11, oy: 0.27, atenua: 0.35, escudo: 1 },
    demostrar:   { az: 4.4, el: 0.1, dist: 11.5, oy: 0.27, atenua: 0.35, informe: 1, emblema: 0.3 },
    soc:         { az: 5.0, el: 1.38, dist: 11, oy: 0.24, visor: 1, emblema: 0.22, nucleo: 0, atenua: 0.2, giro: 0.3 },
    socPanel:    { az: 5.2, el: 1.38, dist: 13, oy: 0, visor: 1, emblema: 0.15, nucleo: 0, atenua: 0.86, giro: 0.3 },
    fondo:       { az: 5.6, el: 0.5, dist: 14, atenua: 0.84, giro: 0.5 },
    oculto:      { az: 5.6, el: 0.5, dist: 14, atenua: 1, giro: 0.5 },
    incidente1:  { az: 5.9, el: 0.28, dist: 10.5, oy: 0.3, atenua: 0.4, giro: 0.15 },
    incidente2:  { az: 6.3, el: 0.24, dist: 10, oy: 0.3, atenua: 0.4, amenaza: 1, giro: 0.15 },
    incidente3:  { az: 6.7, el: 0.2, dist: 10.5, oy: 0.3, atenua: 0.45, amenaza: 1, cont: 1, giro: 0.15 },
    contacto:    { az: 7.2, el: 0.3, dist: 12, oy: 0.46, atenua: 0.72, giro: 0.5, emblema: 0.4 },
  } : {
    hero:        { az: 0, el: 0.16, dist: 9.0, ox: 0.215, oy: 0.015 },
    manifiesto1: { az: 0.75, el: 0.02, dist: 9.2, ox: 0.24, atenua: 0.22, tiempo: 1, reloj: 0.1 },
    manifiesto2: { az: 1.6, el: 0.1, dist: 8.8, ox: 0.24, atenua: 0.22, tiempo: 1, reloj: 0.69 },
    manifiesto3: { az: 2.3, el: 0.2, dist: 9.2, ox: 0.24, atenua: 0.18, tiempo: 1, reloj: 0.72 },
    detectar:    { az: 2.75, el: 0.34, dist: 7.2, ox: -0.22 },
    responder:   { az: 3.6, el: 0.2, dist: 7.8, ox: -0.22, escudo: 1 },
    demostrar:   { az: 4.5, el: 0.08, dist: 8.2, ox: -0.22, informe: 1, emblema: 0.3 },
    soc:         { az: 5.1, el: 1.38, dist: 8.2, ox: 0.2, oy: 0.04, visor: 1, emblema: 0.22, nucleo: 0, giro: 0.3 },
    socPanel:    { az: 5.3, el: 1.38, dist: 10, ox: 0, visor: 1, emblema: 0.15, nucleo: 0, atenua: 0.86, giro: 0.3 },
    fondo:       { az: 5.7, el: 0.5, dist: 12, atenua: 0.82, giro: 0.5 },
    oculto:      { az: 5.7, el: 0.5, dist: 12, atenua: 1, giro: 0.5 }, // bajo las secciones claras, que lo tapan: no se dibuja
    incidente1:  { az: 6.0, el: 0.3, dist: 8.4, ox: 0.27, oy: 0.03, atenua: 0.05, giro: 0.15 },
    incidente2:  { az: 6.4, el: 0.26, dist: 8.0, ox: 0.27, oy: 0.03, atenua: 0.05, amenaza: 1, giro: 0.15 },
    incidente3:  { az: 6.8, el: 0.22, dist: 8.4, ox: 0.27, oy: 0.03, atenua: 0.1, amenaza: 1, cont: 1, giro: 0.15 },
    contacto:    { az: 7.25, el: 0.3, dist: 8.5, ox: -0.2, oy: 0.55, atenua: 0.45, giro: 0.5, emblema: 0.5 },
  };
  const CAMPOS = Object.keys(BASE);
  const pose = (nombre) => Object.assign({}, BASE, POSES[nombre] || POSES.hero);

  /* ---------- Escena, cámara y render ---------- */
  const FOV = 42;
  const escena = new THREE.Scene();
  escena.fog = new THREE.FogExp2(0x0b0f14, 0.03);
  const camara = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  let render;
  try {
    render = new THREE.WebGLRenderer({ antialias: !movil, alpha: true, powerPreference: "high-performance" });
  } catch (e) { modoLigero(); return; }
  let dprMax = movil ? 1.5 : 1.5;
  render.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprMax));
  render.setClearColor(0x000000, 0);
  cont.appendChild(render.domElement);

  // Textura circular suave para puntos
  const lienzoPunto = document.createElement("canvas");
  lienzoPunto.width = lienzoPunto.height = 64;
  const ctxPunto = lienzoPunto.getContext("2d");
  const gradPunto = ctxPunto.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradPunto.addColorStop(0, "rgba(255,255,255,1)");
  gradPunto.addColorStop(0.35, "rgba(255,255,255,0.8)");
  gradPunto.addColorStop(1, "rgba(255,255,255,0)");
  ctxPunto.fillStyle = gradPunto;
  ctxPunto.fillRect(0, 0, 64, 64);
  const texPunto = new THREE.CanvasTexture(lienzoPunto);

  const ADD = THREE.AdditiveBlending;
  // Luz aditiva para los sombreadores propios: suma el color y deja en el alfa solo lo que brilla, para que
  // el lienzo siga siendo transparente donde no hay luz (si no, cada halo dibujaba un disco opaco sobre la página)
  const LUZ = { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor };
  const GLSL_LUZ = "vec4 luz(vec3 c){ return vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0)); }";
  const grupo = new THREE.Group(); // todo lo que gira con el globo
  escena.add(grupo);

  /* --- Paleta: tonos de oro medidos en el propio PNG del emblema (percentiles 10, 50 y 90) --- */
  const ORO_SOMBRA = 0x6b4929, ORO_MEDIO = 0xdab37c, ORO_LUZ = 0xfbeed1, CIAN = 0x35c6d6;
  const R_NUCLEO = 1.74; // radio del núcleo de cristal (el emblema cabe dentro)

  /* --- Uniformes compartidos por todos los sombreadores del globo (se actualizan una vez por fotograma) --- */
  const U = {
    uRc: { value: R_NUCLEO },        // radio del núcleo en este momento
    uNucleo: { value: 1 },           // peso del núcleo (0 = no tapa nada)
    uEmblema: { value: 1 },          // opacidad del emblema: cuánto ilumina lo que tiene cerca
    uRaton: { value: new THREE.Vector2(9, 9) }, // cursor en coordenadas de pantalla (-1..1); 9 = fuera
    uAspecto: { value: 1 },
    uCerca: { value: 5 }, uLejos: { value: 11 }, // profundidad de la cara de delante y de la de atrás del globo
    uLatido: { value: 0 },           // 0..1: el destello del emblema late y enciende lo que tiene cerca
    uTiempo: { value: 0 },
    uCrece: { value: 1 },            // 0..1: el globo aparece (durante el empalme con la intro no se ve)
    uEscala: { value: 800 },         // píxeles por unidad de mundo a distancia 1
    uOro: { value: new THREE.Color(ORO_MEDIO) },
    uOroLuz: { value: new THREE.Color(ORO_LUZ) },
    uCian: { value: new THREE.Color(0x8fe4ee) },
  };
  // ¿Tapa el núcleo este punto? Rayo de la cámara al punto contra la esfera del centro.
  // x: tapado (0..1, con borde suave) · y: 1 si está delante del centro · z: distancia del rayo al centro
  const GLSL_NUCLEO = `
    uniform float uRc; uniform float uNucleo; uniform float uEmblema; uniform vec2 uRaton; uniform float uAspecto;
    uniform float uCerca; uniform float uLejos; uniform float uLatido; uniform float uTiempo; uniform float uEscala; uniform float uCrece;
    uniform vec3 uOro; uniform vec3 uOroLuz; uniform vec3 uCian;
    vec3 nucleoInfo(vec3 wp){
      vec3 v = wp - cameraPosition; float L = length(v); vec3 rd = v / L;
      float tca = dot(-cameraPosition, rd);
      float d = sqrt(max(dot(cameraPosition, cameraPosition) - tca * tca, 0.0));
      float detras = step(tca, L);
      return vec3(detras * (1.0 - smoothstep(uRc * 0.965, uRc * 1.035, d)), 1.0 - detras, d);
    }`;
  // Parte común del vértice: profundidad, ventana delante del emblema, luz del emblema y cursor
  const GLSL_VERTICE = `
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;
    vec3 info = nucleoInfo(wp.xyz);
    float prof = clamp((-mv.z - uCerca) / max(uLejos - uCerca, 0.001), 0.0, 1.0);
    float peso = uEmblema * uNucleo;
    float ventana = info.y * (1.0 - smoothstep(uRc * 0.55, uRc * 1.04, info.z)) * peso;
    float borde = (1.0 - info.y) * (1.0 - smoothstep(uRc, uRc * 1.55, info.z)) * peso;
    vec2 ndc = gl_Position.xy / gl_Position.w;
    float cursor = 1.0 - smoothstep(0.0, 0.34, length((ndc - uRaton) * vec2(uAspecto, 1.0)));
    cursor *= cursor;
    float visible = (1.0 - info.x * uNucleo) * uCrece;`;

  // Material de puntos: núcleo nítido y halo suave en un solo sprite, con tamaño según la distancia
  function matPuntos(tam, halo, opciones) {
    return new THREE.ShaderMaterial(Object.assign({
      transparent: true, depthWrite: false, depthTest: false, ...LUZ,
      uniforms: Object.assign({ uTam: { value: tam }, uHalo: { value: halo }, uFuerza: { value: 1 } }, U),
      vertexShader: `
        attribute vec3 color; attribute float semilla;
        uniform float uTam; uniform float uHalo; uniform float uFuerza;
        varying vec3 vColor; varying float vHalo;
        ${GLSL_NUCLEO}
        void main(){
          ${GLSL_VERTICE}
          float titila = 0.86 + 0.14 * sin(uTiempo * (0.7 + semilla * 1.3) + semilla * 43.0);
          float alfa = visible * mix(1.0, 0.4, prof) * (1.0 - 0.6 * ventana) * titila * uFuerza;
          vec3 c = color * mix(vec3(1.0), vec3(0.8, 0.88, 1.0), prof * 0.6);
          c += uOro * borde * (0.55 + 0.9 * uLatido) + uCian * cursor * 0.75;
          vColor = c * alfa;
          vHalo = uHalo * (1.0 - 0.95 * ventana) * (1.0 + borde * 0.8 + cursor);
          float t = uTam * mix(1.28, 0.7, prof) * (1.0 - 0.3 * ventana) * (1.0 + cursor * 0.7 + borde * 0.25);
          gl_PointSize = max(t * mix(0.2, 1.0, uCrece) * uEscala / -mv.z, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vHalo;
        ${GLSL_LUZ}
        void main(){
          float r = length(gl_PointCoord - 0.5) * 2.0;
          if (r > 1.0) discard;
          float n = 1.0 - smoothstep(0.025, 0.17, r);
          float h = pow(1.0 - r, 3.0) * 0.1 * vHalo;
          gl_FragColor = luz(vColor * (n + h));
          #include <colorspace_fragment>
        }`,
    }, opciones || {}));
  }
  // Material de líneas: mismo trato que los nodos; "trazo" > 0 las dibuja discontinuas
  function matLineas(color, opacidad, trazo) {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, ...LUZ,
      uniforms: Object.assign({ uColor: { value: new THREE.Color(color) }, uOpacidad: { value: opacidad }, uTrazo: { value: trazo || 0 } }, U),
      vertexShader: `
        attribute float lineDistance;
        uniform vec3 uColor; uniform float uOpacidad;
        varying vec3 vColor; varying float vDist;
        ${GLSL_NUCLEO}
        void main(){
          ${GLSL_VERTICE}
          float alfa = uOpacidad * visible * mix(1.0, 0.36, prof) * (1.0 - 0.86 * ventana);
          vColor = (uColor + uOro * borde * (0.7 + 1.2 * uLatido) + uCian * cursor * 0.6) * alfa * (1.0 + borde * 1.4 + cursor * 1.6);
          vDist = lineDistance;
        }`,
      fragmentShader: `
        uniform float uTrazo; varying vec3 vColor; varying float vDist;
        ${GLSL_LUZ}
        void main(){
          if (uTrazo > 0.0 && mod(vDist, uTrazo) > uTrazo * 0.58) discard;
          gl_FragColor = luz(vColor);
          #include <colorspace_fragment>
        }`,
    });
  }
  // Material plano (barrido, pulso): se apaga por píxel donde lo tapa el núcleo
  const GLSL_PLANO_V = "varying vec2 vPos; varying vec3 vW; void main(){ vPos = position.xy; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }";

  /* --- Globo de nodos (distribución de Fibonacci) --- */
  const RADIO = 2.6;
  const N = movil ? 300 : 560;
  const posNodos = new Float32Array(N * 3);
  const colNodos = new Float32Array(N * 3);
  const nodos = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const ang = i * 2.399963;
    const x = Math.cos(ang) * r, z = Math.sin(ang) * r;
    posNodos.set([x * RADIO, y * RADIO, z * RADIO], i * 3);
    nodos.push({ x, y, z, brillo: 0, amenaza: 0, d: 0 });
  }
  const semillas = new Float32Array(N);
  for (let i = 0; i < N; i++) semillas[i] = Math.random();
  const geoNodos = new THREE.BufferGeometry();
  geoNodos.setAttribute("position", new THREE.BufferAttribute(posNodos, 3));
  geoNodos.setAttribute("color", new THREE.BufferAttribute(colNodos, 3));
  geoNodos.setAttribute("semilla", new THREE.BufferAttribute(semillas, 1));
  const matNodos = matPuntos(0.3, 1);
  const puntosNodos = new THREE.Points(geoNodos, matNodos);
  puntosNodos.renderOrder = 7;
  grupo.add(puntosNodos);

  // Origen del incidente: se elige cada vez el nodo que mira a la cámara (un poco arriba a la derecha),
  // y se guarda la distancia angular de todos los demás a él: por ahí se extiende el rojo
  const vOrigen = new THREE.Vector3();
  let origenFijado = false;
  function fijarOrigen() {
    vOrigen.set(0.35, 0.3, 1).normalize().applyQuaternion(camara.quaternion);
    grupo.worldToLocal(vOrigen.multiplyScalar(RADIO)).normalize();
    nodos.forEach((n) => { n.d = Math.acos(Math.max(-1, Math.min(1, n.x * vOrigen.x + n.y * vOrigen.y + n.z * vOrigen.z))); });
    origenFijado = true;
  }

  /* --- Red: líneas entre nodos cercanos --- */
  const aristas = [];
  const segmentos = [];
  for (let i = 0; i < N; i += 2) {
    const a = nodos[i];
    let mejor = -1, mejorD = 0.4;
    for (let j = i + 1; j < N; j++) {
      const b = nodos[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      if (d < mejorD) { mejorD = d; mejor = j; }
    }
    if (mejor >= 0) {
      aristas.push([i, mejor]);
      const b = nodos[mejor];
      segmentos.push(a.x * RADIO, a.y * RADIO, a.z * RADIO, b.x * RADIO, b.y * RADIO, b.z * RADIO);
    }
  }
  const geoLineas = new THREE.BufferGeometry();
  geoLineas.setAttribute("position", new THREE.Float32BufferAttribute(segmentos, 3));
  grupo.add(new THREE.LineSegments(geoLineas, matLineas(ORO_MEDIO, 0.46)));

  /* --- Paquetes de datos que viajan por la red (cian: datos en movimiento) --- */
  const NP = movil ? 20 : 48;
  const posPaquetes = new Float32Array(NP * 3);
  const paquetes = [];
  for (let i = 0; i < NP; i++) paquetes.push({ arista: Math.floor(Math.random() * aristas.length), t: Math.random(), v: 0.4 + Math.random() * 0.8 });
  const geoPaquetes = new THREE.BufferGeometry();
  geoPaquetes.setAttribute("position", new THREE.BufferAttribute(posPaquetes, 3));
  {
    const c = new THREE.Color(0x9eeaf3), col = new Float32Array(NP * 3), sem = new Float32Array(NP);
    for (let i = 0; i < NP; i++) { col.set([c.r, c.g, c.b], i * 3); sem[i] = Math.random(); }
    geoPaquetes.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geoPaquetes.setAttribute("semilla", new THREE.BufferAttribute(sem, 1));
  }
  const puntosPaquetes = new THREE.Points(geoPaquetes, matPuntos(0.36, 1.8));
  puntosPaquetes.renderOrder = 8;
  grupo.add(puntosPaquetes);

  /* --- Anillos del globo --- */
  const circulo = (r, n) => new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0).getPoints(n));
  const ecuador = new THREE.LineLoop(circulo(RADIO * 1.02, 160), matLineas(ORO_MEDIO, 0.62));
  ecuador.rotation.x = Math.PI / 2;
  grupo.add(ecuador);
  const exterior = new THREE.LineLoop(circulo(RADIO * 1.35, 200), matLineas(ORO_MEDIO, 0.44, 0.43));
  exterior.computeLineDistances();
  exterior.rotation.x = Math.PI / 2;
  grupo.add(exterior);

  /* --- Barrido de radar --- */
  const matBarrido = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide, ...LUZ,
    uniforms: Object.assign({ color: { value: new THREE.Color(CIAN) }, fuerza: { value: 1 }, hueco: { value: 0.62 } }, U),
    vertexShader: GLSL_PLANO_V,
    fragmentShader: `
      uniform vec3 color; uniform float fuerza; uniform float hueco; varying vec2 vPos; varying vec3 vW;
      ${GLSL_NUCLEO}
      ${GLSL_LUZ}
        void main(){
        float ang = atan(vPos.y, vPos.x);
        float cola = smoothstep(0.0, 1.1, ang);
        float radio = length(vPos) / ${(RADIO * 1.02).toFixed(3)};
        float alfa = cola * cola * 0.85 * smoothstep(hueco, hueco + 0.3, radio) * fuerza;
        vec3 info = nucleoInfo(vW);
        alfa *= (1.0 - info.x * uNucleo) * (1.0 - 0.9 * info.y * (1.0 - smoothstep(uRc * 0.6, uRc * 1.08, info.z)) * uNucleo * uEmblema);
        gl_FragColor = luz(mix(color, vec3(1.0), cola * 0.45) * alfa * uCrece);
        #include <colorspace_fragment>
      }`,
  });
  const barrido = new THREE.Mesh(new THREE.CircleGeometry(RADIO * 1.02, 64, 0, 1.1), matBarrido);
  barrido.rotation.x = -Math.PI / 2;
  grupo.add(barrido);

  /* --- Pulso que se expande por el ecuador --- */
  const matPulso = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide, ...LUZ,
    uniforms: Object.assign({ color: { value: new THREE.Color(ORO_LUZ) }, opacidad: { value: 0 } }, U),
    vertexShader: GLSL_PLANO_V,
    fragmentShader: `
      uniform vec3 color; uniform float opacidad; varying vec3 vW;
      ${GLSL_NUCLEO}
      ${GLSL_LUZ}
        void main(){
        vec3 info = nucleoInfo(vW);
        float ventana = info.y * (1.0 - smoothstep(uRc * 0.55, uRc * 1.04, info.z)) * uNucleo * uEmblema;
        gl_FragColor = luz(color * opacidad * (1.0 - info.x * uNucleo) * (1.0 - 0.92 * ventana) * uCrece);
        #include <colorspace_fragment>
      }`,
  });
  const pulso = new THREE.Mesh(new THREE.RingGeometry(0.975, 1, 96), matPulso);
  pulso.rotation.x = -Math.PI / 2;
  grupo.add(pulso);
  let tPulso = 0;

  /* --- Visor del SOC: anillos de alcance y cruz en el plano del radar --- */
  const visor = new THREE.Group();
  const matVisor = new THREE.LineBasicMaterial({ color: 0x35c6d6, transparent: true, opacity: 0, blending: ADD, depthWrite: false });
  [0.25, 0.5, 0.75].forEach((f) => { const a = new THREE.LineLoop(circulo(RADIO * f, 96), matVisor); a.rotation.x = Math.PI / 2; visor.add(a); });
  const cruz = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, r0 = k % 3 === 0 ? 0.3 : RADIO * 0.94, r1 = RADIO * 1.02;
    cruz.push(Math.cos(a) * r0, 0, Math.sin(a) * r0, Math.cos(a) * r1, 0, Math.sin(a) * r1);
  }
  const geoCruz = new THREE.BufferGeometry();
  geoCruz.setAttribute("position", new THREE.Float32BufferAttribute(cruz, 3));
  visor.add(new THREE.LineSegments(geoCruz, matVisor));
  grupo.add(visor);

  /* --- Avisos: anillos que laten sobre un nodo cuando el SOC registra una alerta --- */
  const COLOR_AVISO = { alerta: 0xff4d4d, aviso: 0xd4af7a, ok: 0x35c6d6 };
  const avisos = [];
  const geoAviso = new THREE.RingGeometry(0.82, 1, 48);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(geoAviso, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: ADD, depthWrite: false }));
    m.visible = false;
    grupo.add(m);
    avisos.push({ m, t: 1 });
  }

  /* --- Escudo (Responder): una malla que se cierra alrededor del globo --- */
  const matEscudo = matLineas(CIAN, 0);
  const escudo = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(RADIO * 1.16, 1)), matEscudo);
  grupo.add(escudo);
  const matEscudo2 = matLineas(ORO_MEDIO, 0);
  const escudo2 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(RADIO * 1.3, 0)), matEscudo2);
  grupo.add(escudo2);

  /* --- Polvo: fuera del grupo, para dar profundidad al mover la cámara --- */
  const ND = movil ? 300 : 1100;
  const posPolvo = new Float32Array(ND * 3);
  for (let i = 0; i < ND; i++) {
    // Lejos del globo y de la órbita de la cámara: así ninguna mota pasa pegada al objetivo
    const r = 19 + Math.random() * 12, a = Math.random() * Math.PI * 2, y = (Math.random() - 0.5) * 30;
    posPolvo.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
  }
  const geoPolvo = new THREE.BufferGeometry();
  geoPolvo.setAttribute("position", new THREE.BufferAttribute(posPolvo, 3));
  const polvo = new THREE.Points(geoPolvo, new THREE.PointsMaterial({ size: 0.13, map: texPunto, color: 0xe9cfa0, transparent: true, opacity: 0.6, fog: false, depthWrite: false, blending: ADD }));
  escena.add(polvo);

  /* --- Núcleo de cristal: la esfera oscura en la que vive el emblema ---
     No escribe en el búfer de profundidad: lo que tapa se calcula en los sombreadores (GLSL_NUCLEO),
     así el borde es suave y el núcleo puede desvanecerse (vista cenital del SOC) sin saltos. */
  const matNucleo = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, premultipliedAlpha: true,
    uniforms: Object.assign({ uPeso: { value: 1 }, uLuz: { value: new THREE.Vector3(0.4, 0.5, 0.7) } }, U),
    vertexShader: "varying vec3 vN; varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: `
      uniform float uPeso; uniform vec3 uLuz; varying vec3 vN; varying vec3 vW;
      ${GLSL_NUCLEO}
      void main(){
        vec3 n = normalize(vN);
        float ndv = clamp(dot(n, normalize(cameraPosition - vW)), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 2.4);
        float lado = 0.5 + 0.5 * dot(n, uLuz);                       // el destello del emblema ilumina su lado del cristal
        vec3 fondo = mix(vec3(0.0016, 0.0026, 0.0048), vec3(0.0042, 0.0072, 0.0125), ndv * ndv);
        vec3 luz = uOroLuz * pow(fres, 3.2) * (0.05 + 0.5 * lado * lado) * (0.75 + 0.5 * uLatido)
                 + uCian * pow(fres, 7.0) * 0.1
                 + uOro * pow(ndv, 4.0) * 0.004 * uEmblema;          // el oro del emblema tiñe el interior
        float a = mix(0.96, 0.8, fres);
        float canto = smoothstep(0.0, 0.16, ndv);                    // el contorno se funde (sin dientes aunque no haya antialias)
        a *= canto; luz *= canto;
        gl_FragColor = vec4((fondo * a + luz) * uPeso, a * uPeso);
        #include <colorspace_fragment>
      }`,
  });
  const nucleo = new THREE.Mesh(new THREE.SphereGeometry(R_NUCLEO, movil ? 40 : 64, movil ? 24 : 40), matNucleo);
  nucleo.renderOrder = 1;
  escena.add(nucleo);

  /* --- Emblema en relieve: el PNG oficial, iluminado y con grosor, dentro del núcleo --- */
  const PX = 2.15 / 335;                       // unidades de mundo por píxel del PNG
  const ALTO_EMBLEMA = LOGO.rh * PX, ANCHO_EMBLEMA = LOGO.rw * PX;
  const DESTELLO_UV = { x: (348 - LOGO.x) / LOGO.rw, y: 1 - (100 - LOGO.y) / LOGO.rh }; // la esfera brillante de la brújula
  const emblema = new THREE.Group();
  const texEmblema = new THREE.TextureLoader().load(rutaEmblema, (t) => { try { render.initTexture(t); } catch (e) {} sucio = true; });
  texEmblema.colorSpace = THREE.SRGBColorSpace;
  texEmblema.anisotropy = render.capabilities.getMaxAnisotropy();
  const UE = {
    mapa: { value: texEmblema },
    uRecorte: { value: new THREE.Vector4(LOGO.x / LOGO.w, 1 - (LOGO.y + LOGO.rh) / LOGO.h, LOGO.rw / LOGO.w, LOGO.rh / LOGO.h) },
    uTexel: { value: new THREE.Vector2(1.4 / LOGO.w, 1.4 / LOGO.h) },
    uOp: { value: 1 },        // opacidad del emblema
    uExtras: { value: 1 },    // 0 durante el empalme con la intro (PNG tal cual), 1 después (luz, barrido, aura)
    uBarrido: { value: -1 },  // posición del barrido especular
    uGamma: { value: 1 },     // 2.2 si se mezcla en lineal (con postprocesado), 1 si se mezcla en sRGB
    uLuz2: { value: new THREE.Vector2(-0.4, 0.9) }, // de dónde viene la luz (sigue al cursor)
  };
  const GLSL_UV = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }";
  // El PNG trae un velo de alfa casi nulo por todo el rectángulo y el resplandor del destello pensado para fondo
  // oscuro: se quita el velo (suelo de alfa) y lo translúcido se suma como luz en vez de tapar (alfa premultiplicado).
  const GLSL_EMBLEMA = `
    uniform sampler2D mapa; uniform vec4 uRecorte; uniform vec2 uTexel; uniform float uOp; uniform float uExtras;
    uniform float uBarrido; uniform vec2 uLuz2; uniform float uCapa; uniform float uGamma; varying vec2 vUv;
    void main(){
      vec2 uv = uRecorte.xy + vUv * uRecorte.zw;
      vec4 c = texture2D(mapa, uv);
      float a = max(c.a - 0.045, 0.0) / 0.955;
      a *= smoothstep(0.034, 0.046, vUv.y) * smoothstep(0.0, 0.02, vUv.x) * smoothstep(1.0, 0.98, vUv.x) * smoothstep(1.0, 0.985, vUv.y);
      float solido = smoothstep(0.1, 0.62, a);
      vec3 col = c.rgb;
      float lum = dot(col, vec3(0.3, 0.59, 0.11));
      // Relieve: el propio claroscuro del PNG hace de mapa de alturas; la luz que sigue al cursor lo recorre
      vec3 gris = vec3(0.3333);
      float gx = dot(texture2D(mapa, uv + vec2(uTexel.x, 0.0)).rgb - texture2D(mapa, uv - vec2(uTexel.x, 0.0)).rgb, gris);
      float gy = dot(texture2D(mapa, uv + vec2(0.0, uTexel.y)).rgb - texture2D(mapa, uv - vec2(0.0, uTexel.y)).rgb, gris);
      float relieve = clamp(dot(vec2(gx, gy), uLuz2) * 2.6, -0.22, 0.7) * solido * uExtras;
      col *= 1.0 + relieve;
      // Barrido especular: una banda de luz que cruza los biseles (más fuerte donde el metal ya es claro)
      float banda = 1.0 - smoothstep(0.0, 0.15, abs((vUv.x + vUv.y * 0.35) - uBarrido));
      col += col * banda * banda * (0.3 + 1.2 * lum * lum) * uExtras;
      // Capas de atrás: el canto del metal, en la sombra
      float cuerpo = mix(1.0, solido, step(0.01, uCapa));
      col = mix(col, vec3(lum) * vec3(0.3, 0.2, 0.115), uCapa);
      // Con postprocesado el lienzo mezcla en espacio lineal, y el PNG está pensado para mezclarse en sRGB
      // (como el <img> de la intro): elevar la cobertura a 2,2 da sobre fondo oscuro el mismo borde y el mismo
      // resplandor. Sin postprocesado (móvil) la mezcla ya es en sRGB y uGamma vale 1.
      gl_FragColor = vec4(col * pow(a, uGamma) * cuerpo * uOp, a * solido * uOp);
      #include <colorspace_fragment>
    }`;
  const geoEmblema = new THREE.PlaneGeometry(ANCHO_EMBLEMA, ALTO_EMBLEMA);
  const matCapa = (capa) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, premultipliedAlpha: true,
    uniforms: Object.assign({ uCapa: { value: capa } }, UE), vertexShader: GLSL_UV, fragmentShader: GLSL_EMBLEMA,
  });
  // Grosor: copias en sombra apiladas hacia atrás; se ven de canto cuando el emblema se inclina con el cursor
  const NCAPAS = movil ? 2 : 4;
  for (let k = NCAPAS; k >= 1; k--) {
    const capa = new THREE.Mesh(geoEmblema, matCapa(0.55 + 0.45 * (k / NCAPAS)));
    capa.position.z = -0.034 * k * (4 / NCAPAS);
    capa.renderOrder = 3;
    emblema.add(capa);
  }
  const frente = new THREE.Mesh(geoEmblema, matCapa(0));
  frente.renderOrder = 4;
  emblema.add(frente);

  // Aura: la silueta del propio PNG muy desenfocada (niveles altos del mipmap), en oro. No es un disco
  const matAura = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, ...LUZ,
    uniforms: Object.assign({ uFuerza: { value: 1 } }, UE, { uOro: U.uOro }),
    vertexShader: GLSL_UV,
    fragmentShader: `
      uniform sampler2D mapa; uniform vec4 uRecorte; uniform float uOp; uniform float uExtras; uniform float uFuerza; uniform vec3 uOro; varying vec2 vUv;
      ${GLSL_LUZ}
        void main(){
        vec2 p = (vUv - 0.5) * 1.6 + 0.5;
        vec2 uv = uRecorte.xy + clamp(p, 0.02, 0.98) * uRecorte.zw;
        float a = texture2D(mapa, uv, 3.4).a * 0.6 + texture2D(mapa, uv, 5.0).a * 0.4;
        float m = 1.0 - smoothstep(0.25, 0.98, length(vUv - 0.5) * 2.0);
        gl_FragColor = luz(uOro * a * a * m * 0.07 * uOp * uExtras * uFuerza);
        #include <colorspace_fragment>
      }`,
  });
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO_EMBLEMA * 1.6, ALTO_EMBLEMA * 1.6), matAura);
  aura.position.z = -0.2;
  aura.renderOrder = 2;
  emblema.add(aura);

  // Destello: la luz sale del punto brillante que ya trae el emblema (su esfera de brújula): núcleo,
  // raya anamórfica y haces que giran despacio
  const matDestello = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, ...LUZ,
    uniforms: { uOp: UE.uOp, uExtras: { value: 1 }, uPulso: { value: 1 }, uTiempo: U.uTiempo, uOroLuz: U.uOroLuz, uOro: U.uOro },
    vertexShader: GLSL_UV,
    fragmentShader: `
      uniform float uOp; uniform float uExtras; uniform float uPulso; uniform float uTiempo; uniform vec3 uOroLuz; uniform vec3 uOro; varying vec2 vUv;
      ${GLSL_LUZ}
        void main(){
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p), ang = atan(p.y, p.x);
        float centro = exp(-r * r * 1500.0);
        float halo = exp(-r * 15.0) * 0.22;
        float raya = exp(-abs(p.y) * 190.0) * exp(-abs(p.x) * 3.4) * 0.8 + exp(-abs(p.x) * 240.0) * exp(-abs(p.y) * 9.0) * 0.3;
        float haces = pow(0.5 + 0.5 * sin(ang * 5.0 + uTiempo * 0.19), 6.0) * 0.55 + pow(0.5 + 0.5 * sin(ang * 9.0 - uTiempo * 0.12 + 1.7), 8.0) * 0.45;
        haces *= smoothstep(0.03, 0.3, r) * exp(-r * 3.0) * 0.13;
        float marco = 1.0 - smoothstep(0.62, 1.0, max(abs(p.x), abs(p.y)));
        vec3 col = mix(uOro, uOroLuz, 0.6) * (halo + raya + haces) * uPulso + vec3(1.0, 0.97, 0.9) * centro * uPulso;
        gl_FragColor = luz(col * marco * uOp * uExtras);
        #include <colorspace_fragment>
      }`,
  });
  const destello = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 3.3), matDestello);
  destello.position.set((DESTELLO_UV.x - 0.5) * ANCHO_EMBLEMA, (DESTELLO_UV.y - 0.5) * ALTO_EMBLEMA, 0.03);
  destello.renderOrder = 5;
  emblema.add(destello);

  // Anillo de luz a los pies: el suelo del núcleo recoge el oro del emblema (cáusticas que giran despacio)
  const matCharco = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, ...LUZ,
    uniforms: { uOp: UE.uOp, uExtras: UE.uExtras, uTiempo: U.uTiempo, uOro: U.uOro, uOroLuz: U.uOroLuz, uLatido: U.uLatido },
    vertexShader: GLSL_UV,
    fragmentShader: `
      uniform float uOp; uniform float uExtras; uniform float uTiempo; uniform vec3 uOro; uniform vec3 uOroLuz; uniform float uLatido; varying vec2 vUv;
      ${GLSL_LUZ}
        void main(){
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p), ang = atan(p.y, p.x);
        float anillo = exp(-pow((r - 0.7) * 15.0, 2.0)) + exp(-pow((r - 0.46) * 22.0, 2.0)) * 0.4;
        float caustica = 0.5 + 0.5 * sin(ang * 5.0 + uTiempo * 0.45) * sin(ang * 9.0 - uTiempo * 0.3 + 0.8);
        float charco = exp(-r * r * 3.2) * 0.3;
        float frente = 0.55 + 0.45 * smoothstep(0.4, -0.6, p.y);       // más luz en la parte que mira a la cámara
        float i = (anillo * (0.25 + 0.75 * caustica) * 0.42 * frente + charco * 0.8) * (1.0 - smoothstep(0.82, 1.0, r));
        gl_FragColor = luz(mix(uOro, uOroLuz, anillo * caustica * 0.6) * i * (0.5 + 0.25 * uLatido) * uOp * uExtras);
        #include <colorspace_fragment>
      }`,
  });
  const charco = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 0.62), matCharco);
  charco.position.set(0.05, -ALTO_EMBLEMA / 2 + 0.02, -0.05);
  charco.renderOrder = 2;
  emblema.add(charco);
  escena.add(emblema);
  // Todo lo del globo se dibuja después del núcleo y del emblema: lo de delante pasa por delante
  grupo.children.forEach((o) => { if (!o.renderOrder) o.renderOrder = 6; });

  /* --- Anillo del tiempo: 60 marcas de chronos y una de kairos --- */
  const MARCAS = 60, KAIROS = 42;
  const R_TIEMPO = RADIO * 1.2;
  // Cada marca es un rectángulo fino (dos triángulos): las líneas de WebGL solo miden 1 px y no se leían
  const posTiempo = new Float32Array(MARCAS * 18), colTiempo = new Float32Array(MARCAS * 18);
  for (let i = 0; i < MARCAS; i++) {
    const a = Math.PI / 2 - (i / MARCAS) * Math.PI * 2; // empieza arriba y avanza como un reloj
    const largo = i === KAIROS ? 0.5 : i % 5 === 0 ? 0.22 : 0.12;
    const medio = i === KAIROS ? 0.022 : i % 5 === 0 ? 0.014 : 0.009; // medio grosor
    const r0 = R_TIEMPO - (i === KAIROS ? 0.16 : 0), r1 = R_TIEMPO + largo;
    const cx = Math.cos(a), cy = Math.sin(a), nx = -cy * medio, ny = cx * medio;
    const A = [cx * r0 - nx, cy * r0 - ny, 0], B = [cx * r0 + nx, cy * r0 + ny, 0], C = [cx * r1 + nx, cy * r1 + ny, 0], D = [cx * r1 - nx, cy * r1 - ny, 0];
    posTiempo.set([...A, ...B, ...C, ...A, ...C, ...D], i * 18);
  }
  const geoTiempo = new THREE.BufferGeometry();
  geoTiempo.setAttribute("position", new THREE.BufferAttribute(posTiempo, 3));
  geoTiempo.setAttribute("color", new THREE.BufferAttribute(colTiempo, 3));
  const matTiempo = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: ADD, depthWrite: false, depthTest: false, side: THREE.DoubleSide, fog: false });
  const tiempo = new THREE.Group();
  tiempo.add(new THREE.Mesh(geoTiempo, matTiempo));
  const brilloKairos = new THREE.Sprite(new THREE.SpriteMaterial({ map: texPunto, color: 0xd4af7a, transparent: true, opacity: 0, blending: ADD, depthWrite: false, depthTest: false, fog: false }));
  {
    const a = Math.PI / 2 - (KAIROS / MARCAS) * Math.PI * 2;
    brilloKairos.position.set(Math.cos(a) * (R_TIEMPO + 0.2), Math.sin(a) * (R_TIEMPO + 0.2), 0);
  }
  tiempo.add(brilloKairos);
  escena.add(tiempo);
  let relojPintado = -1;
  function pintarReloj(p) {
    const n = Math.round(p * MARCAS);
    if (n === relojPintado) return;
    relojPintado = n;
    for (let i = 0; i < MARCAS; i++) {
      let r, g, b;
      if (i === KAIROS) { const v = n >= KAIROS ? 1 : 0.5; r = v; g = 0.86 * v; b = 0.6 * v; }
      else if (i < n) { r = 0.78; g = 0.66; b = 0.46; }     // chronos: minutos que ya han pasado
      else { r = 0.26; g = 0.24; b = 0.2; }
      if (i === n - 1 && i !== KAIROS) { r = 0.62; g = 0.93; b = 0.97; } // el minuto en curso
      for (let v = 0; v < 6; v++) colTiempo.set([r, g, b], i * 18 + v * 3);
    }
    geoTiempo.getAttribute("color").needsUpdate = true;
  }

  /* --- Informe sellado (Demostrar): hoja dibujada en un canvas, con el sello de custodia --- */
  function texturaInforme() {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 680;
    const x = c.getContext("2d");
    x.fillStyle = "rgba(13,18,25,0.94)";
    x.fillRect(0, 0, 512, 680);
    x.strokeStyle = "rgba(212,175,122,0.9)"; x.lineWidth = 3; x.strokeRect(10, 10, 492, 660);
    x.fillStyle = "#e9cfa0"; x.font = "500 25px Georgia, serif";
    x.fillText(CA ? "Informe d'incident" : "Informe de incidente", 40, 70);
    x.font = "17px Consolas, monospace"; x.fillStyle = "rgba(248,245,238,0.7)";
    x.fillText("KAIRON-0428 · " + (CA ? "SIMULACIÓ" : "SIMULACIÓN"), 40, 102);
    x.fillStyle = "rgba(212,175,122,0.5)"; x.fillRect(40, 122, 432, 1.5);
    // Mismas horas que incidente.html e informe.html (caso de ejemplo KAIRON-0428)
    const filas = [["09:40 UTC", "Entrada"], ["09:41 UTC", CA ? "Detecció" : "Detección"], ["09:43 UTC", CA ? "Contenció" : "Contención"], ["09:45 UTC", CA ? "Proves" : "Pruebas"], ["14:05 UTC", CA ? "Informe signat" : "Informe firmado"]];
    filas.forEach(([h, t], i) => {
      const y = 166 + i * 46;
      x.fillStyle = "#9eeaf3"; x.fillText(h, 40, y);
      x.fillStyle = "rgba(248,245,238,0.86)"; x.fillText(t, 170, y);
      x.fillStyle = "rgba(248,245,238,0.16)"; x.fillRect(300, y - 11, 172, 8);
    });
    x.fillStyle = "rgba(212,175,122,0.5)"; x.fillRect(40, 400, 432, 1.5);
    x.fillStyle = "rgba(248,245,238,0.6)"; x.fillText("SHA-256", 40, 438);
    x.fillStyle = "#e9cfa0"; x.font = "14px Consolas, monospace";
    ["9f2c41d07ab35e88", "c4d1e6f09b7a2235", "07be5a91d3cc4f10"].forEach((h, i) => x.fillText(h + "…", 40, 468 + i * 26));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function texturaSello() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    x.translate(128, 128);
    x.strokeStyle = "#e9cfa0"; x.lineWidth = 7; x.beginPath(); x.arc(0, 0, 108, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 2; x.beginPath(); x.arc(0, 0, 92, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 12; x.lineCap = "round"; x.lineJoin = "round";
    x.beginPath(); x.moveTo(-44, 4); x.lineTo(-12, 36); x.lineTo(48, -34); x.stroke();
    return new THREE.CanvasTexture(c);
  }
  const informe = new THREE.Group();
  const matHoja = new THREE.MeshBasicMaterial({ map: texturaInforme(), transparent: true, opacity: 0, depthWrite: false, depthTest: false, fog: false });
  const hoja = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.52), matHoja);
  hoja.renderOrder = 8;
  informe.add(hoja);
  const matSello = new THREE.MeshBasicMaterial({ map: texturaSello(), transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: ADD, fog: false });
  const sello = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.82), matSello);
  sello.position.set(0.5, -0.78, 0.02);
  sello.renderOrder = 9;
  informe.add(sello);
  informe.visible = false;
  escena.add(informe);

  /* ---------- Postprocesado ---------- */
  const PP = window.POSTPROCESSING;
  let compositor = null, bloom = null, aberracion = null;
  const ABERRACION_BASE = 0.00022; // en reposo apenas se nota; se abre con la velocidad del scroll y los impactos
  const BLOOM_BASE = 0.5;
  if (PP && !movil) {
    try {
      compositor = new PP.EffectComposer(render, { frameBufferType: THREE.HalfFloatType });
      compositor.addPass(new PP.RenderPass(escena, camara));
      // Umbral alto: solo florecen los brillos (nodos encendidos, destello, biseles), no todo el oro del emblema
      bloom = new PP.BloomEffect({ intensity: BLOOM_BASE, luminanceThreshold: 0.74, luminanceSmoothing: 0.2, mipmapBlur: true, radius: 0.62 });
      aberracion = new PP.ChromaticAberrationEffect({ offset: new THREE.Vector2(ABERRACION_BASE, ABERRACION_BASE), radialModulation: true, modulationOffset: 0.2 });
      compositor.addPass(new PP.EffectPass(camara, bloom));
      compositor.addPass(new PP.EffectPass(camara, aberracion));
    } catch (e) { compositor = null; }
  }

  let ancho = 1, alto = 1;
  function ajustar() {
    ancho = window.innerWidth; alto = window.innerHeight;
    camara.aspect = ancho / alto;
    render.setSize(ancho, alto, false);
    if (compositor) compositor.setSize(ancho, alto, false);
    sucio = true;
  }

  /* ---------- Estado ---------- */
  let claves = [{ y: 0, pose: "hero" }];
  let scrollY = 0, velocidad = 0;
  const destino = pose("hero");
  const actual = pose("hero");
  const raton = { x: 0, y: 0, sx: 0, sy: 0 };
  let sucio = true;
  let sacudida = 0;
  let anguloBarrido = 0;
  const sim = { activo: false, amenaza: 0, cont: 0, fase: 0 }; // simulador de ataque (botón o tecla A)
  const ent = { activa: false, inicio: 0, dur: 2300, espera: 0, desde: null }; // entrada tras la intro
  let aparecido = 0; // 0..1: el globo crece desde el emblema
  let extras = 1;    // 0..1: luz, barrido, aura y destello del emblema (0 mientras se empalma con la intro)
  let tAnim = 0;     // reloj de la escena (no avanza con "menos movimiento")
  const cursor = { x: 9, y: 9, activo: false };
  const vLuz = new THREE.Vector3();

  const quieto = () => reducidoSO || html.classList.contains("menos-movimiento");
  const suave = (t) => t * t * (3 - 2 * t);
  const expoOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  // Pose que corresponde a un punto del scroll: interpola entre las dos claves vecinas
  function poseEn(y, salida) {
    let a = claves[0], b = claves[claves.length - 1];
    if (y <= a.y) b = a;
    else if (y >= b.y) a = b;
    else {
      for (let i = 0; i < claves.length - 1; i++) {
        if (y >= claves[i].y && y <= claves[i + 1].y) { a = claves[i]; b = claves[i + 1]; break; }
      }
    }
    const pa = pose(a.pose), pb = pose(b.pose);
    const t = a === b || b.y === a.y ? 0 : suave((y - a.y) / (b.y - a.y));
    CAMPOS.forEach((k) => { salida[k] = pa[k] + (pb[k] - pa[k]) * t; });
  }

  const tmpColor = new THREE.Color();
  const ORO = new THREE.Color(0xd4af7a), ROJO = new THREE.Color(0xff4d4d), CLARO = new THREE.Color(0xe6fdff), ORO_VIVO = new THREE.Color(0xfff3d6);
  const colorAttr = geoNodos.getAttribute("color");
  const vCam = new THREE.Vector3();

  function actualizarNodos(dt, ahora, amenaza, cont, anima) {
    const frente = anguloBarrido + 1.1;
    if (amenaza < 0.01) origenFijado = false;
    else if (!origenFijado) fijarOrigen();
    const rAmenaza = amenaza * 1.15, rCont = cont * 1.5;
    for (let i = 0; i < N; i++) {
      const n = nodos[i];
      if (anima) {
        let dif = (frente + Math.atan2(n.z, n.x)) % (Math.PI * 2);
        if (dif < 0) dif += Math.PI * 2;
        if (dif < 0.12) { n.brillo = 1; if (n.amenaza > 0) n.amenaza = 0; }
        if (amenaza < 0.02 && Math.random() < 0.00025) n.amenaza = 1; // amenazas sueltas que el radar apaga
        n.brillo = Math.max(0, n.brillo - dt * 0.55);
      }
      const infectado = amenaza > 0.02 && n.d < rAmenaza;
      const contenido = cont > 0.02 && n.d < rCont;
      if (infectado && !contenido) {
        tmpColor.copy(ORO).lerp(ROJO, 0.8 + 0.2 * Math.sin(ahora * 0.011 + n.d * 9)).multiplyScalar(1.5);
      } else if (cont > 0.02 && Math.abs(n.d - rCont) < 0.16) {
        tmpColor.copy(ORO_VIVO).multiplyScalar(1.5); // el frente de la onda de contención
      } else if (n.amenaza > 0) {
        tmpColor.copy(ORO).lerp(ROJO, 0.6 + 0.4 * Math.sin(ahora * 0.012));
      } else {
        tmpColor.copy(ORO).lerp(CLARO, n.brillo);
      }
      colorAttr.setXYZ(i, tmpColor.r, tmpColor.g, tmpColor.b);
    }
    colorAttr.needsUpdate = true;
  }

  // Calidad adaptativa: si los primeros segundos van a menos de ~30 fps, se quita carga
  let fotogramas = 0, tMedida = performance.now(), nivel = 0;
  const medir = !consulta.has("calidad");
  function medirRendimiento(ahora) {
    fotogramas++;
    if (ahora - tMedida < 2500) return;
    const fps = (fotogramas * 1000) / (ahora - tMedida);
    if (medir && fps < 30 && fotogramas >= 8 && nivel < 2 && document.visibilityState === "visible") {
      nivel++;
      if (nivel === 1) {
        render.setPixelRatio(1);
        matNodos.uniforms.uHalo.value = 0.35;
        if (compositor) { compositor.dispose(); compositor = null; }
      } else {
        polvo.visible = false;
      }
      ajustar();
      console.info("KAIRON: modo ligero de la escena, nivel " + nivel + " (" + Math.round(fps) + " fps)");
    }
    fotogramas = 0;
    tMedida = ahora;
  }

  let ultimo = performance.now();
  let opacidadPuesta = -1;
  function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    const dtReal = Math.min((ahora - ultimo) / 1000, 0.05);
    ultimo = ahora;
    if (document.visibilityState !== "visible") return;
    // Durante la parte 2D de la intro no se dibuja: no se le roba rendimiento
    if (document.querySelector(".carga.intro-activa:not(.intro-zambullida)")) return;

    const parado = quieto();
    const dt = parado ? 0 : dtReal;

    // --- Destino según el scroll (o pose fija si no hay movimiento) ---
    poseEn(scrollY, destino);
    if (sim.activo) { destino.amenaza = Math.max(destino.amenaza, sim.amenaza); destino.cont = Math.max(destino.cont, sim.cont); }

    // --- Amortiguación: una sola etapa de suavizado para todo ---
    const k = parado ? 1 : 1 - Math.exp(-dtReal * 3.2);
    let cambio = 0;
    CAMPOS.forEach((c) => { const d = destino[c] - actual[c]; actual[c] += d * k; cambio += Math.abs(d); });
    raton.sx += (raton.x - raton.sx) * (parado ? 0 : 0.05);
    raton.sy += (raton.y - raton.sy) * (parado ? 0 : 0.05);
    velocidad *= 0.9;
    sacudida = Math.max(0, sacudida - dtReal * 1.6);

    // Con la escena quieta solo se repinta si algo ha cambiado
    if (parado && !sucio && cambio < 0.0005 && !ent.activa) return;
    // Lienzo prácticamente apagado y sin cambios: no hace falta dibujar
    if (actual.atenua > 0.97 && destino.atenua > 0.97) { ponerOpacidad(0); return; }
    sucio = false;
    medirRendimiento(ahora);

    // --- Entrada tras la intro: la cámara sale del emblema y el globo crece a su alrededor ---
    let az = actual.az + raton.sx * 0.16, el = actual.el + raton.sy * 0.09, dist = actual.dist, ox = actual.ox, oy = actual.oy;
    if (ent.activa) {
      // Primero, el empalme: durante "espera" la cámara no se mueve y el emblema 3D ocupa exactamente el sitio
      // del logo de la intro, sin luces añadidas, mientras el logo 2D se desvanece encima. Después, el vuelo.
      const t = Math.max(0, Math.min(1, (ahora - ent.inicio - ent.espera) / ent.dur));
      const e = suave(Math.min(1, t * 1.15)) * expoOut(t) ;
      aparecido = expoOut(Math.min(1, t * 1.25));
      extras = suave(Math.min(1, t * 3.2));
      if (ent.desde) {
        const hundir = Math.sin(Math.PI * Math.min(1, t * 1.5)) * suave(Math.min(1, t * 5)); // zambullida: arranca desde parado
        az = ent.desde.az + (az - ent.desde.az) * e;
        el = ent.desde.el + (el - ent.desde.el) * e;
        dist = ent.desde.dist + (dist - ent.desde.dist) * e - hundir * ent.desde.dist * 0.16;
        ox = ent.desde.ox + (ox - ent.desde.ox) * e;
        oy = ent.desde.oy + (oy - ent.desde.oy) * e;
      }
      sacudida = Math.max(sacudida, Math.sin(Math.PI * t) * 0.4);
      if (t >= 1) { ent.activa = false; aparecido = 1; extras = 1; }
    }

    el = Math.max(-1.2, Math.min(1.42, el));
    camara.position.set(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
    camara.lookAt(0, 0, 0);
    const vel = Math.min(Math.abs(velocidad), 1);
    camara.fov = FOV + vel * 7;
    tAnim += dt;
    // Latido: el destello del emblema respira despacio y da un golpe de luz cuando el barrido pasa por él
    const tBarrido = (tAnim % 6.5) / 1.3; // un barrido cada 6,5 s, de 1,3 s
    const posBarrido = !parado && tBarrido < 1 ? -0.3 + tBarrido * 1.9 : -1;
    const golpe = Math.max(0, 1 - Math.abs(posBarrido - (DESTELLO_UV.x + DESTELLO_UV.y * 0.35)) / 0.22);
    const respira = parado ? 0.4 : Math.pow(0.5 + 0.5 * Math.sin(tAnim * 0.9), 3);
    const latido = Math.min(1, respira * 0.55 + golpe);
    if (ox || oy) camara.setViewOffset(ancho, alto, -ox * ancho, -oy * alto, ancho, alto);
    else camara.clearViewOffset();
    camara.updateProjectionMatrix();

    // --- Globo ---
    const esc = (0.04 + 0.96 * aparecido) * (1 + (parado ? 0 : Math.sin(tAnim * 0.55) * 0.006)); // el globo respira
    grupo.scale.setScalar(esc);
    // Uniformes compartidos del globo
    const pesoNucleo = actual.nucleo * Math.min(1, aparecido * 1.4);
    U.uRc.value = R_NUCLEO * esc;
    U.uNucleo.value = pesoNucleo;
    U.uEmblema.value = actual.emblema;
    U.uCerca.value = dist - RADIO * esc;
    U.uLejos.value = dist + RADIO * esc;
    U.uLatido.value = latido * extras;
    U.uTiempo.value = tAnim;
    U.uCrece.value = suave(Math.min(1, aparecido * 1.6));
    polvo.material.opacity = 0.6 * U.uCrece.value; // durante el empalme con la intro no hay polvo delante del emblema
    U.uAspecto.value = ancho / alto;
    U.uEscala.value = (alto * render.getPixelRatio()) / (2 * Math.tan((camara.fov * Math.PI) / 360));
    if (cursor.activo && !parado) U.uRaton.value.set(cursor.x, cursor.y); else U.uRaton.value.set(9, 9);
    nucleo.scale.setScalar(esc);
    nucleo.visible = pesoNucleo > 0.004;
    matNucleo.uniforms.uPeso.value = pesoNucleo;
    if (!parado) {
      anguloBarrido = (anguloBarrido + dt * (0.95 + actual.visor * 0.5)) % (Math.PI * 2);
      grupo.rotation.y += dt * 0.06 * actual.giro;
      exterior.rotation.z -= dt * 0.05;
      tPulso = (tPulso + dt / 2.6) % 1;
      polvo.rotation.y += dt * 0.008;
    }
    barrido.rotation.z = anguloBarrido;
    matBarrido.uniforms.hueco.value = 0.62 - actual.visor * 0.5;
    matBarrido.uniforms.fuerza.value = 0.75 + actual.visor * 0.5;
    pulso.scale.setScalar(0.2 + tPulso * RADIO * 1.3);
    matPulso.uniforms.opacidad.value = parado ? 0 : (1 - tPulso) * 0.6;
    polvo.position.y = ((scrollY * 0.0016) % 4) - 2;
    matVisor.opacity = actual.visor * 0.5;

    actualizarNodos(dt, ahora, actual.amenaza, actual.cont, !parado);

    if (!parado && aristas.length) {
      for (let i = 0; i < NP; i++) {
        const p = paquetes[i];
        p.t += dt * p.v;
        if (p.t > 1) { p.t = 0; p.arista = Math.floor(Math.random() * aristas.length); }
        const A = nodos[aristas[p.arista][0]], B = nodos[aristas[p.arista][1]];
        posPaquetes[i * 3] = (A.x + (B.x - A.x) * p.t) * RADIO;
        posPaquetes[i * 3 + 1] = (A.y + (B.y - A.y) * p.t) * RADIO;
        posPaquetes[i * 3 + 2] = (A.z + (B.z - A.z) * p.t) * RADIO;
      }
      geoPaquetes.getAttribute("position").needsUpdate = true;
    }

    // Avisos del SOC
    avisos.forEach((a) => {
      if (a.t >= 1) { a.m.visible = false; return; }
      a.t += dtReal / 1.6;
      const e = expoOut(Math.min(1, a.t));
      a.m.scale.setScalar(0.06 + e * 0.34);
      a.m.material.opacity = (1 - a.t) * 0.95;
    });

    // Escudo
    matEscudo.uniforms.uOpacidad.value = actual.escudo * 0.6;
    matEscudo2.uniforms.uOpacidad.value = actual.escudo * 0.34;
    escudo.visible = escudo2.visible = actual.escudo > 0.01;
    escudo.scale.setScalar(1.35 - 0.35 * actual.escudo);
    escudo2.scale.setScalar(1.7 - 0.7 * actual.escudo);
    if (!parado) { escudo.rotation.y -= dt * 0.12; escudo2.rotation.x += dt * 0.07; }

    // Emblema: de cara a la cámara y un poco inclinado hacia el cursor (el grosor se ve de canto)
    emblema.quaternion.copy(camara.quaternion);
    if (!parado) {
      emblema.rotateY((raton.sx * 0.2 + Math.sin(tAnim * 0.45) * 0.04) * extras);
      emblema.rotateX((raton.sy * 0.12 + Math.sin(tAnim * 0.33 + 1) * 0.02) * extras);
    }
    emblema.position.set(0, parado ? 0 : Math.sin(tAnim * 0.9) * 0.035 * extras, 0);
    const opE = actual.emblema;
    UE.uOp.value = opE;
    UE.uExtras.value = extras;
    UE.uGamma.value = compositor ? 2.2 : 1;
    UE.uBarrido.value = posBarrido;
    UE.uLuz2.value.set(-0.35 + raton.sx * 1.1, 0.8 - raton.sy * 0.9).normalize();
    matDestello.uniforms.uPulso.value = 0.7 + 0.3 * respira + golpe * 0.9;
    matDestello.uniforms.uExtras.value = 0.7 + 0.3 * extras; // en el empalme sigue encendido: releva al destello de la intro, que está en el mismo punto
    matAura.uniforms.uFuerza.value = 0.8 + 0.4 * latido;
    // De dónde le llega la luz al cristal: desde el destello del emblema
    vLuz.set(destello.position.x, destello.position.y, 0.9).normalize().applyQuaternion(emblema.quaternion);
    matNucleo.uniforms.uLuz.value.copy(vLuz);

    // Anillo del tiempo, también de cara a la cámara
    tiempo.visible = actual.tiempo > 0.01;
    if (tiempo.visible) {
      tiempo.quaternion.copy(camara.quaternion);
      matTiempo.opacity = actual.tiempo * 0.95;
      pintarReloj(actual.reloj);
      // El brillo de kairos solo se enciende cuando el reloj llega a su marca: el instante
      const llegado = Math.max(0, Math.min(1, (actual.reloj * MARCAS - KAIROS + 1.2) / 1.2));
      brilloKairos.material.opacity = actual.tiempo * llegado * (0.55 + (parado ? 0 : 0.15 * Math.sin(ahora * 0.004)));
      brilloKairos.scale.setScalar(0.16 + llegado * 0.3);
    }

    // Informe sellado: flota entre la cámara y el globo
    informe.visible = actual.informe > 0.01;
    if (informe.visible) {
      vCam.copy(camara.position).normalize();
      informe.position.copy(vCam).multiplyScalar(RADIO * 0.9);
      informe.quaternion.copy(camara.quaternion);
      informe.rotateY(-0.22 + raton.sx * 0.12 + (1 - actual.informe) * 0.9);
      informe.rotateX(raton.sy * 0.08);
      const e = suave(Math.min(1, actual.informe * 1.3));
      informe.scale.setScalar(0.7 + 0.3 * e);
      matHoja.opacity = e;
      const s = Math.max(0, (actual.informe - 0.72) / 0.28); // el sello cae al final
      matSello.opacity = s;
      sello.scale.setScalar(1.9 - 0.9 * suave(s));
    }

    ponerOpacidad(1 - actual.atenua);

    if (compositor) {
      const desvio = ABERRACION_BASE + sacudida * 0.005 + vel * 0.0045;
      aberracion.offset.set(desvio, desvio * 0.6);
      bloom.intensity = (BLOOM_BASE + vel * 0.8 + sacudida * 0.5) * (0.15 + 0.85 * extras);
      compositor.render(dtReal);
    } else {
      render.render(escena, camara);
    }
  }

  function ponerOpacidad(v) {
    const r = Math.round(v * 100) / 100;
    if (r === opacidadPuesta) return;
    opacidadPuesta = r;
    cont.style.opacity = String(r);
  }

  window.addEventListener("resize", ajustar);
  document.addEventListener("pointerleave", () => { cursor.activo = false; });
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    raton.x = (e.clientX / window.innerWidth - 0.5) * 2;
    raton.y = (e.clientY / window.innerHeight - 0.5) * 2;
    cursor.x = raton.x; cursor.y = -raton.y; cursor.activo = true;
  }, { passive: true });
  document.addEventListener("visibilitychange", () => { ultimo = performance.now(); sucio = true; });
  ajustar();
  pintarReloj(0);
  requestAnimationFrame(cuadro);

  /* ---------- API ---------- */
  function lanzarAviso(tipo) {
    const libre = avisos.find((a) => a.t >= 1) || avisos[0];
    // Se elige un nodo de la cara que mira a la cámara
    vCam.copy(camara.position).normalize();
    grupo.worldToLocal(vCam.multiplyScalar(RADIO)).normalize();
    let mejor = 0, mejorP = -2;
    for (let k = 0; k < 14; k++) {
      const i = Math.floor(Math.random() * N), n = nodos[i];
      const p = n.x * vCam.x + n.y * vCam.y + n.z * vCam.z - Math.random() * 0.5;
      if (p > mejorP) { mejorP = p; mejor = i; }
    }
    const n = nodos[mejor];
    libre.m.position.set(n.x * RADIO * 1.01, n.y * RADIO * 1.01, n.z * RADIO * 1.01);
    libre.m.lookAt(n.x * 10, n.y * 10, n.z * 10); // dentro del grupo: mira hacia fuera del globo
    libre.m.material.color.setHex(COLOR_AVISO[tipo] || COLOR_AVISO.ok);
    libre.m.visible = true;
    libre.t = 0;
    if (tipo === "alerta") { n.amenaza = 1; sacudida = Math.max(sacudida, 0.35); }
    else n.brillo = 1;
    sucio = true;
  }

  let temporizadoresSim = [];
  function animarSim(campo, hasta, ms) {
    const desde = sim[campo], t0 = performance.now();
    const paso = () => {
      const t = Math.min(1, (performance.now() - t0) / ms);
      sim[campo] = desde + (hasta - desde) * suave(t);
      sucio = true;
      if (t < 1) temporizadoresSim.push(requestAnimationFrame(paso));
    };
    paso();
  }

  window.kaironMundo = {
    ligero: false,
    listo: true,
    poses: Object.keys(POSES),
    recorte: LOGO, // recorte del emblema dentro del PNG del logo: la intro lo usa para empalmar
    claves(lista) { if (lista && lista.length) { claves = lista.slice().sort((a, b) => a.y - b.y); sucio = true; } },
    scroll(y, v) {
      if (y !== scrollY) sucio = true; // solo se repinta si el scroll se ha movido (importa en el modo sin movimiento)
      scrollY = y;
      if (typeof v === "number") velocidad = Math.max(-1.5, Math.min(1.5, v * 0.02));
    },
    // Entrada tras la intro. rect: caja en pantalla del emblema del logo de la intro (para empalmar con ella)
    entrada(rect) {
      poseEn(scrollY, destino);
      CAMPOS.forEach((c) => { actual[c] = destino[c]; });
      if (quieto()) { aparecido = 1; extras = 1; sucio = true; return; }
      let desde = null;
      if (rect && rect.height > 20) {
        // rect es la caja en pantalla del recorte del emblema (LOGO) dentro del logo de la intro
        const d = (ALTO_EMBLEMA * alto) / (2 * Math.tan((FOV * Math.PI) / 360) * rect.height);
        desde = { az: 0, el: 0, dist: d, ox: (rect.left + rect.width / 2) / ancho - 0.5, oy: (rect.top + rect.height / 2) / alto - 0.5 };
        ent.espera = 580; // lo que tarda el logo 2D en desvanecerse (0,22 s + 0,32 s) y un margen
      } else {
        desde = { az: actual.az - 0.5, el: actual.el + 0.2, dist: actual.dist * 1.25, ox: actual.ox, oy: actual.oy };
        ent.espera = 0;
      }
      ent.desde = desde; ent.inicio = performance.now(); ent.activa = true;
      aparecido = 0; extras = 0; tPulso = 0; tAnim = 0; sacudida = 0; velocidad = 0;
      raton.sx = raton.sy = 0;
    },
    // Coloca todo en su destino sin transición (para capturas y para el modo sin movimiento)
    asentar() { poseEn(scrollY, destino); CAMPOS.forEach((c) => { actual[c] = destino[c]; }); ent.activa = false; aparecido = 1; extras = 1; velocidad = 0; sucio = true; },
    alerta: lanzarAviso,
    quieto() { sucio = true; },
    estado() { return { actual: Object.assign({}, actual), aparecido, nivel, compositor: !!compositor }; },
  };
  // Compatibilidad con main.js (simulador de ataque y clic en el globo)
  window.kaironEscena = {
    impacto() { lanzarAviso("alerta"); tPulso = 0; sacudida = 1; },
    ataque(encender) {
      temporizadoresSim.forEach(cancelAnimationFrame); temporizadoresSim = [];
      sim.activo = true;
      if (encender) { sim.cont = 0; animarSim("amenaza", 1, 2400); sacudida = 1; }
      else {
        animarSim("cont", 1, 1700); tPulso = 0;
        setTimeout(() => { sim.activo = false; sim.amenaza = 0; sim.cont = 0; sucio = true; }, 3200);
      }
    },
  };
  aparecido = 1;
  html.classList.add("con-mundo");
  window.dispatchEvent(new Event("kairon-mundo-listo"));
})();
