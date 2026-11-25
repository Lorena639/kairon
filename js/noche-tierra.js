/* KAIRON · «Una noche de guardia» · la tierra
   Un territorio nocturno dibujado con curvas de oro, visto en vuelo bajo. Sustituye al globo de la portada.

   Qué dibuja
   - Un terreno (una sola malla) cuyo relieve se calcula en el sombreador de vértices. El cuerpo es opaco y
     del color de la noche; encima, líneas finas: de perfil (filas de Z) por la noche y curvas de nivel
     cuando la cámara sube y la tierra se convierte en el mapa del informe (uMapa).
   - Las luces de los equipos del cliente (puntos cálidos en los valles) y la baliza de KAIRON.
   - La amenaza: un punto rojo cuyo color se extiende por las líneas del terreno, y el anillo de oro que la
     contiene. El farol del cursor ilumina y levanta el terreno donde apunta.

   Cómo se dirige
   - js/noche.js cambia los valores de `e` (estado) con GSAP según el scroll. Aquí solo se dibuja.
   - El lienzo es transparente: el cielo es CSS y queda detrás, de modo que el titular HTML asoma tras las crestas.

   Requiere js/vendor/three.min.js (Three.js r160, MIT). El ruido es «simplex 2D» de Ian McEwan (Ashima Arts, MIT). */
(() => {
  "use strict";
  if (typeof THREE === "undefined") return;

  const RUIDO = `
    uniform float uRelieve;
    vec3 perm(vec3 x){ return mod(((x * 34.0) + 1.0) * x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = perm(perm(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m; m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    float cresta(vec2 p){ float n = 1.0 - abs(snoise(p)); return n * n; }
    // El valle por el que se vuela serpentea; a los lados suben las sierras
    float eje(float z){ return 2.4 * sin(z * 0.045) + 1.1 * sin(z * 0.11 + 1.7); }
    float altura(vec2 p){
      float lado = abs(p.x - eje(p.y));
      float valle = smoothstep(1.2, 10.0, lado);
      float sierras = cresta(p * 0.052) * 1.0 + cresta(p * 0.118 + 7.3) * 0.42;
      float detalle = snoise(p * 0.29) * 0.16 + snoise(p * 0.62 + 3.1) * 0.05;
      return (sierras * mix(0.14, 1.0, valle) * 4.6 + detalle * mix(0.35, 1.0, valle)) * uRelieve;
    }`;

  const ANCHO = 64, LARGO = 62, SEG_X = 256, SEG_Z = 248, PASO_Z = LARGO / SEG_Z;

  function crear(contenedor, opciones) {
    const op = opciones || {};
    let render;
    try {
      render = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance", premultipliedAlpha: true });
    } catch (err) { return null; }
    const gl = render.getContext();
    if (!gl) return null;
    render.setClearColor(0x000000, 0);
    const dprMax = op.dprMax || 1.5;
    render.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprMax));
    const lienzo = render.domElement;
    lienzo.setAttribute("aria-hidden", "true");
    contenedor.appendChild(lienzo);

    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera(52, 1, 0.1, 200);

    /* ---------- Estado: todo lo que la página puede mover ---------- */
    const e = {
      viaje: 0,            // avance por el valle (unidades de mundo)
      camY: 3.3, camX: 0, camZ: 0,
      cabeceo: -0.15,     // radianes; negativo mira hacia abajo
      guinada: 0,
      fov: 40,
      mapa: 0,             // 0 perfiles de noche · 1 curvas de nivel (mapa)
      grosor: 0.75,         // grosor de línea en píxeles (se sube en modo presentación)
      brilloLineas: 1,
      luces: 1,            // 0..1 intensidad de las luces de los equipos
      baliza: 1,           // la luz de KAIRON
      farolF: 0,           // fuerza del farol del cursor
      amenaza: 0, amenazaRadio: 0,     // tinte rojo que se extiende
      anillo: 0, anilloRadio: 3,       // anillo de contención
      cadena: 0,           // 0..1 avance de la cadena de balizas
      cadenaF: 1,          // intensidad de la cadena
      alfa: 1,             // opacidad general del terreno
      relieve: 0.62,       // altura de las sierras
      veloX: 0.2, veloY: 0.78, veloRX: 0.36, veloRY: 0.3, velo: 0, // sombra bajo el texto (fracciones de pantalla)
    };
    const col = {
      tierra: new THREE.Color("#0b0f14"), bruma: new THREE.Color("#101a2a"),
      linea: new THREE.Color("#d4af7a"), luz: new THREE.Color("#ffe2b0"),
      rojo: new THREE.Color("#ff4d4d"), oroVivo: new THREE.Color("#fff0cf"),
    };
    const farol = new THREE.Vector2(0, 8);
    const amenazaPos = new THREE.Vector2(3.2, 15);

    /* ---------- Terreno ---------- */
    const geo = new THREE.PlaneGeometry(ANCHO, LARGO, SEG_X, SEG_Z);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, LARGO / 2 - 1.5); // de z = −1,5 (bajo la cámara) hasta el horizonte
    const uniformes = {
      uViaje: { value: 0 }, uMapa: { value: 0 }, uGrosor: { value: 1 }, uBrillo: { value: 1 }, uAlfa: { value: 1 },
      uTierra: { value: col.tierra }, uBruma: { value: col.bruma }, uLinea: { value: col.linea },
      uRojo: { value: col.rojo }, uOro: { value: col.oroVivo },
      uFarol: { value: new THREE.Vector3() },
      uAmenaza: { value: new THREE.Vector4() },   // x, z, radio, fuerza
      uAnillo: { value: new THREE.Vector2() },    // radio, fuerza
      uLejos: { value: LARGO - 4 }, uTiempo: { value: 0 }, uRelieve: { value: 1 },
      uVelo: { value: new THREE.Vector4() }, uVeloF: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
    };
    const matTierra = new THREE.ShaderMaterial({
      uniforms: uniformes, transparent: true,
      vertexShader: `
        uniform float uViaje; uniform vec3 uFarol;
        varying vec3 vMundo; varying float vDist; varying float vFarol;
        ${RUIDO}
        void main(){
          vec2 m = vec2(position.x, position.z + uViaje);
          float h = altura(m);
          float df = distance(m, uFarol.xy);
          vFarol = uFarol.z * exp(-df * df * 0.16);
          h += vFarol * 0.22;
          vMundo = vec3(m.x, h, m.y);
          vec4 mv = modelViewMatrix * vec4(position.x, h, position.z, 1.0);
          vDist = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform float uMapa; uniform float uGrosor; uniform float uBrillo; uniform float uAlfa; uniform float uLejos; uniform float uTiempo;
        uniform vec3 uTierra; uniform vec3 uBruma; uniform vec3 uLinea; uniform vec3 uRojo; uniform vec3 uOro;
        uniform vec4 uAmenaza; uniform vec2 uAnillo; uniform vec4 uVelo; uniform float uVeloF; uniform vec2 uRes;
        varying vec3 vMundo; varying float vDist; varying float vFarol;
        // Línea de grosor constante en píxeles sobre una coordenada continua; se apaga antes de hacer muaré
        float trazo(float c, float grosor){
          float fw = fwidth(c);
          float d = abs(fract(c - 0.5) - 0.5) / max(fw, 1e-5);
          float l = 1.0 - smoothstep(grosor - 0.6, grosor + 0.6, d);
          float lejos = 1.0 - smoothstep(0.22, 0.5, fw);
          return l * lejos + (1.0 - lejos) * min(1.0, 2.0 * grosor * fw) * 0.3;
        }
        void main(){
          float perfil = trazo(vMundo.z * 2.15, uGrosor);
          float nivel = trazo(vMundo.y * 2.6, uGrosor);
          // De perfiles a curvas de nivel pasando por «sin líneas»: mezclarlas a la vez dibujaba una cuadrícula
          float linea = perfil * (1.0 - smoothstep(0.0, 0.55, uMapa)) + nivel * smoothstep(0.45, 1.0, uMapa);

          float bruma = smoothstep(4.0, uLejos * 0.86, vDist);
          float cima = smoothstep(0.1, 3.6, vMundo.y);
          float fuerza = (0.3 + 0.7 * cima) * mix(1.0, 0.22, bruma) * uBrillo;
          // Donde hay texto encima, la tierra se queda en penumbra
          vec2 pp = (gl_FragCoord.xy / uRes - vec2(uVelo.x, 1.0 - uVelo.y)) / uVelo.zw;
          fuerza *= 1.0 - uVeloF * (1.0 - smoothstep(0.35, 1.0, length(pp)));
          fuerza += vFarol * 0.9;

          vec3 cLinea = uLinea;
          // La amenaza tiñe las líneas de rojo desde su punto; el anillo de oro la encierra
          float da = distance(vMundo.xz, uAmenaza.xy);
          float tinte = uAmenaza.w * (1.0 - smoothstep(uAmenaza.z * 0.55, uAmenaza.z, da));
          float late = 0.85 + 0.15 * sin(uTiempo * 5.0 - da * 2.4);
          cLinea = mix(cLinea, uRojo * late, tinte);
          fuerza = mix(fuerza, max(fuerza, 0.95), tinte);
          float fa = fwidth(da);
          float aro = uAnillo.y * (1.0 - smoothstep(fa * 0.9, fa * 2.2 + 0.012, abs(da - uAnillo.x)));
          float halo = uAnillo.y * 0.3 * exp(-abs(da - uAnillo.x) * 5.5);
          float velo = uAnillo.y * 0.07 * (1.0 - smoothstep(uAnillo.x * 0.2, uAnillo.x, da));

          // Mezcla (no suma): así la línea también se ve oscura sobre el marfil del día
          vec3 cuerpo = mix(uTierra, uBruma, bruma * 0.92);
          vec3 c = mix(cuerpo, cLinea, clamp(linea * fuerza, 0.0, 1.0));
          c = mix(c, uOro, clamp(aro + halo + velo + vFarol * 0.05, 0.0, 1.0));

          float a = uAlfa * (1.0 - smoothstep(uLejos * 0.8, uLejos, vDist));
          gl_FragColor = vec4(c, a);
          #include <colorspace_fragment>
        }`,
    });
    const tierra = new THREE.Mesh(geo, matTierra);
    tierra.frustumCulled = false;
    escena.add(tierra);

    /* ---------- Luces de los equipos: caseríos en el valle ---------- */
    let semilla = 20261125;
    const azar = () => { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 4294967296; };
    const N_LUCES = op.movil ? 90 : 170;
    const pos = new Float32Array(N_LUCES * 3), dat = new Float32Array(N_LUCES * 2);
    for (let i = 0, k = 0; i < N_LUCES; k++) {
      const cz = azar() * LARGO, cx = (azar() - 0.5) * 9, n = 3 + Math.floor(azar() * 7);
      for (let j = 0; j < n && i < N_LUCES; j++, i++) {
        pos[i * 3] = cx + (azar() - 0.5) * 2.4;   // desvío respecto al eje del valle
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = cz + (azar() - 0.5) * 2.6;
        dat[i * 2] = azar();                       // fase del parpadeo
        dat[i * 2 + 1] = 0.55 + azar() * 0.45;     // tamaño
      }
    }
    const geoLuces = new THREE.BufferGeometry();
    geoLuces.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geoLuces.setAttribute("dato", new THREE.BufferAttribute(dat, 2));
    const matLuces = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uViaje: { value: 0 }, uLargo: { value: LARGO }, uTiempo: uniformes.uTiempo, uEscala: { value: 1 },
        uColor: { value: col.luz }, uFuerza: { value: 1 }, uRojo: { value: col.rojo }, uAmenaza: uniformes.uAmenaza, uRelieve: uniformes.uRelieve,
      },
      vertexShader: `
        attribute vec2 dato; uniform float uViaje; uniform float uLargo; uniform float uTiempo; uniform float uEscala; uniform vec4 uAmenaza;
        varying float vBrillo; varying float vRojo;
        ${RUIDO}
        void main(){
          float z = mod(position.z - uViaje, uLargo) - 1.5;
          float zm = z + uViaje;
          float x = position.x + eje(zm);
          float h = altura(vec2(x, zm)) + 0.07;
          vec4 mv = modelViewMatrix * vec4(x, h, z, 1.0);
          float d = -mv.z;
          float parpadeo = 0.72 + 0.28 * sin(uTiempo * (0.6 + dato.x * 1.3) + dato.x * 40.0);
          float borde = smoothstep(0.0, 4.0, z + 1.5) * (1.0 - smoothstep(uLargo * 0.62, uLargo * 0.9, z));
          vBrillo = parpadeo * borde;
          float da = distance(vec2(x, zm), uAmenaza.xy);
          vRojo = uAmenaza.w * (1.0 - smoothstep(uAmenaza.z * 0.6, uAmenaza.z, da));
          gl_PointSize = uEscala * dato.y * (9.0 + 150.0 / max(d, 7.0));
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor; uniform vec3 uRojo; uniform float uFuerza; varying float vBrillo; varying float vRojo;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float nucleo = smoothstep(0.16, 0.0, d);
          float halo = smoothstep(0.5, 0.0, d);
          vec3 c = mix(uColor, uRojo, vRojo);
          float a = (nucleo * 1.1 + halo * halo * 0.4) * vBrillo * uFuerza;
          gl_FragColor = vec4(c * a, a);
          #include <colorspace_fragment>
        }`,
    });
    const luces = new THREE.Points(geoLuces, matLuces);
    luces.frustumCulled = false;
    luces.renderOrder = 3; // después del terreno: su cuerpo opaco las taparía
    escena.add(luces);

    /* ---------- Actores sueltos: la baliza de KAIRON, el foco de la amenaza y la cadena de balizas ---------- */
    const N_ACT = 10; // 0 baliza KAIRON · 1 el intruso · 2..7 cadena de balizas · 8 intento en vuelo · 9 el servidor
    const posA = new Float32Array(N_ACT * 3), datA = new Float32Array(N_ACT * 4); // color rgb + tamaño
    const geoAct = new THREE.BufferGeometry();
    geoAct.setAttribute("position", new THREE.BufferAttribute(posA, 3));
    geoAct.setAttribute("dato", new THREE.BufferAttribute(datA, 4));
    const matAct = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      uniforms: { uEscala: { value: 1 }, uFuerza: { value: 1 } },
      vertexShader: `
        attribute vec4 dato; uniform float uEscala; varying vec4 vDato;
        void main(){
          vDato = dato;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uEscala * dato.a * (16.0 + 420.0 / max(-mv.z, 1.0));
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec4 vDato; uniform float uFuerza;
        void main(){
          vec2 p = gl_PointCoord - 0.5;
          float d = length(p);
          float nucleo = smoothstep(0.1, 0.0, d);
          float halo = smoothstep(0.5, 0.0, d);
          float rayo = smoothstep(0.5, 0.0, d) * (smoothstep(0.035, 0.0, abs(p.y)) + smoothstep(0.035, 0.0, abs(p.x))) * 0.5;
          float a = (nucleo * 1.4 + halo * halo * 0.55 + rayo) * uFuerza;
          gl_FragColor = vec4(vDato.rgb * a, a);
          #include <colorspace_fragment>
        }`,
    });
    const actores = new THREE.Points(geoAct, matAct);
    actores.frustumCulled = false;
    actores.renderOrder = 5;
    escena.add(actores);

    // Relieve en JS (misma fórmula que el sombreador) para apoyar los actores sobre el terreno
    const fract = (x) => x - Math.floor(x);
    const mod289 = (x) => x - Math.floor(x / 289) * 289;
    const permJ = (x) => mod289((x * 34 + 1) * x);
    function snoise(vx, vy) {
      const C0 = 0.211324865405187, C1 = 0.366025403784439, C2 = -0.577350269189626, C3 = 0.024390243902439;
      const s = (vx + vy) * C1;
      let ix = Math.floor(vx + s), iy = Math.floor(vy + s);
      const t = (ix + iy) * C0;
      const x0 = vx - ix + t, y0 = vy - iy + t;
      const i1x = x0 > y0 ? 1 : 0, i1y = x0 > y0 ? 0 : 1;
      const x1 = x0 + C0 - i1x, y1 = y0 + C0 - i1y, x2 = x0 + C2, y2 = y0 + C2;
      ix = mod289(ix); iy = mod289(iy);
      const p0 = permJ(permJ(iy) + ix), p1 = permJ(permJ(iy + i1y) + ix + i1x), p2 = permJ(permJ(iy + 1) + ix + 1);
      let m0 = Math.max(0.5 - (x0 * x0 + y0 * y0), 0), m1 = Math.max(0.5 - (x1 * x1 + y1 * y1), 0), m2 = Math.max(0.5 - (x2 * x2 + y2 * y2), 0);
      m0 *= m0; m0 *= m0; m1 *= m1; m1 *= m1; m2 *= m2; m2 *= m2;
      const g = (p, x, y) => {
        const gx = 2 * fract(p * C3) - 1, h = Math.abs(gx) - 0.5, ox = Math.floor(gx + 0.5), a0 = gx - ox;
        return [1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h), a0 * x + h * y];
      };
      const [n0, g0] = g(p0, x0, y0), [n1, g1] = g(p1, x1, y1), [n2, g2] = g(p2, x2, y2);
      return 130 * (m0 * n0 * g0 + m1 * n1 * g1 + m2 * n2 * g2);
    }
    const crestaJ = (x, y) => { const n = 1 - Math.abs(snoise(x, y)); return n * n; };
    const ejeJ = (z) => 2.4 * Math.sin(z * 0.045) + 1.1 * Math.sin(z * 0.11 + 1.7);
    const suaveJ = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    function alturaJ(x, z) {
      const valle = suaveJ(1.2, 10, Math.abs(x - ejeJ(z)));
      const sierras = crestaJ(x * 0.052, z * 0.052) + crestaJ(x * 0.118 + 7.3, z * 0.118 + 7.3) * 0.42;
      const detalle = snoise(x * 0.29, z * 0.29) * 0.16 + snoise(x * 0.62 + 3.1, z * 0.62 + 3.1) * 0.05;
      return (sierras * (0.14 + 0.86 * valle) * 4.6 + detalle * (0.35 + 0.65 * valle)) * e.relieve;
    }

    // Posiciones en el mundo (x, z absolutos) de los actores; la página puede cambiarlas
    const actor = [
      { x: -5.6, z: 9.5, color: col.oroVivo, tam: 1.0, f: 1 },   // baliza de KAIRON
      { x: 9, z: 40, color: col.rojo, tam: 1.15, f: 0 },          // el intruso, lejos
    ];
    for (let i = 2; i < 8; i++) actor.push({ x: 0, z: 0, color: col.oroVivo, tam: 0.7, f: 0 });
    actor.push({ x: 0, z: 0, color: col.rojo, tam: 0.42, f: 0, elev: 0.3 });      // 8 intento en vuelo
    actor.push({ x: 2, z: 13, color: col.luz, tam: 0.62, f: 0 });                  // 9 el servidor

    function colocarActores(t) {
      for (let i = 0; i < N_ACT; i++) {
        const a = actor[i];
        const z = a.z - e.viaje;
        posA[i * 3] = a.x; posA[i * 3 + 1] = (a.y !== undefined ? a.y : alturaJ(a.x, a.z)) + (a.elev || 0.12); posA[i * 3 + 2] = z;
        let f = a.f;
        if (i === 0) f = e.baliza * (0.82 + 0.18 * Math.sin(t * 1.3));
        if (i === 1) f = a.f * (0.78 + 0.22 * Math.sin(t * 6));
        if (i >= 2 && i < 8) {
          // La cadena se enciende en orden: cada baliza prende cuando el avance la alcanza y luego se asienta
          const k = (i - 2) / 5, d = e.cadena * 1.25 - k;
          f = e.cadena <= 0 ? 0 : d < 0 ? 0 : Math.min(1, d * 9) * (0.5 + 0.5 * Math.exp(-d * 4)) * e.cadenaF;
        }
        datA[i * 4] = a.color.r * f; datA[i * 4 + 1] = a.color.g * f; datA[i * 4 + 2] = a.color.b * f; datA[i * 4 + 3] = a.tam * (0.6 + 0.4 * f);
      }
      geoAct.attributes.position.needsUpdate = true;
      geoAct.attributes.dato.needsUpdate = true;
    }

    /* ---------- Tamaño y bucle ---------- */
    let ancho = 1, alto = 1;
    function ajustar() {
      ancho = contenedor.clientWidth || window.innerWidth; alto = contenedor.clientHeight || window.innerHeight;
      render.setSize(ancho, alto, false);
      camara.aspect = ancho / alto;
      const dpr = render.getPixelRatio();
      uniformes.uRes.value.set(ancho * dpr, alto * dpr);
      matLuces.uniforms.uEscala.value = dpr * Math.min(1.25, Math.max(0.7, alto / 900));
      matAct.uniforms.uEscala.value = matLuces.uniforms.uEscala.value;
      sucio = true;
    }
    let sucio = true, activo = true, ultimo = performance.now(), tiempo = 0, quieto = false;
    const v3 = new THREE.Vector3(), dir = new THREE.Vector3();

    function pintar(ahora) {
      const dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora;
      if (!quieto) tiempo += dt;
      // La malla se mueve a saltos de una fila: los vértices caen siempre en los mismos puntos del mundo
      const salto = Math.floor(e.viaje / PASO_Z) * PASO_Z;
      tierra.position.z = salto - e.viaje;
      uniformes.uViaje.value = salto;
      matLuces.uniforms.uViaje.value = e.viaje;
      uniformes.uMapa.value = e.mapa; uniformes.uGrosor.value = e.grosor; uniformes.uBrillo.value = e.brilloLineas; uniformes.uAlfa.value = e.alfa;
      uniformes.uTiempo.value = tiempo; uniformes.uRelieve.value = e.relieve;
      matAct.uniforms.uFuerza.value = e.alfa;
      uniformes.uFarol.value.set(farol.x, farol.y + e.viaje, e.farolF);
      uniformes.uAmenaza.value.set(amenazaPos.x, amenazaPos.y, Math.max(0.001, e.amenazaRadio), e.amenaza);
      uniformes.uAnillo.value.set(e.anilloRadio, e.anillo);
      uniformes.uVelo.value.set(e.veloX, e.veloY, e.veloRX, e.veloRY); uniformes.uVeloF.value = e.velo;
      matLuces.uniforms.uFuerza.value = e.luces * e.alfa;
      colocarActores(tiempo);

      camara.fov = e.fov;
      camara.position.set(e.camX, e.camY, e.camZ);
      dir.set(Math.sin(e.guinada) * Math.cos(e.cabeceo), Math.sin(e.cabeceo), Math.cos(e.guinada) * Math.cos(e.cabeceo));
      camara.lookAt(v3.copy(camara.position).add(dir));
      camara.updateProjectionMatrix();
      render.render(escena, camara);
    }
    function cuadro(ahora) {
      requestAnimationFrame(cuadro);
      if (!activo || document.visibilityState !== "visible") { ultimo = ahora; return; }
      if (quieto && !sucio) { ultimo = ahora; return; }
      sucio = false;
      pintar(ahora);
    }
    window.addEventListener("resize", ajustar);
    ajustar();
    if (op.bucle !== false) requestAnimationFrame(cuadro);

    // Dónde cae en pantalla un actor (para colgarle una etiqueta HTML)
    const vp = new THREE.Vector3();
    function proyectar(i, salida) {
      vp.set(posA[i * 3], posA[i * 3 + 1], posA[i * 3 + 2]).project(camara);
      salida.x = (vp.x * 0.5 + 0.5) * ancho; salida.y = (-vp.y * 0.5 + 0.5) * alto;
      salida.visible = vp.z > -1 && vp.z < 1 && Math.abs(vp.x) < 1.05 && Math.abs(vp.y) < 1.05;
      return salida;
    }

    // El farol: del puntero (−1..1) a un punto del suelo delante de la cámara
    const rayo = new THREE.Raycaster(), plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.9), golpe = new THREE.Vector3();
    function apuntar(nx, ny) {
      rayo.setFromCamera({ x: nx, y: ny }, camara);
      if (rayo.ray.intersectPlane(plano, golpe)) { farol.set(golpe.x, Math.min(golpe.z, 40)); sucio = true; }
    }

    return {
      e, col, actor, amenazaPos, lienzo,
      altura: alturaJ, eje: ejeJ,
      apuntar, proyectar, pintar,
      sucio() { sucio = true; },
      activar(v) { activo = !!v; if (activo) sucio = true; },
      aquietar(v) { quieto = !!v; sucio = true; },
      ajustar,
      foto() { pintar(performance.now()); },
    };
  }

  window.kaironTierra = { crear };
})();
