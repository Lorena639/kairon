/* KAIRON · Escena 3D de la portada (Three.js)
   Qué dibuja:
   - Un globo de nodos (los equipos vigilados) unidos por líneas (la red).
   - Un barrido de radar que gira y enciende los nodos; algunos se vuelven
     rojos (amenaza) y se apagan cuando el radar los detecta.
   - "Paquetes" de luz que viajan por las líneas de la red.
   - Un anillo de pulso que se expande desde el centro.
   - Polvo de partículas alrededor, con parallax según el ratón.
   El conjunto gira despacio, se inclina con el ratón y se aleja/difumina al hacer scroll. */

(function () {
  const contenedor = document.querySelector(".hero__escena");
  if (!contenedor) return;

  // Comprobar si hay WebGL; si no, se dibuja un radar 2D con canvas normal
  function hayWebGL() {
    try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  }
  // Three.js se descarga solo si se va a usar, y sin frenar la carga de la página.
  // Con ahorro de datos o poca memoria se queda el radar 2D.
  const ligero = (navigator.connection && navigator.connection.saveData) || navigator.deviceMemory <= 2;
  if (!hayWebGL() || ligero) { radar2D(contenedor); return; }
  const rutaThree = document.currentScript.src.replace("escena.js", "vendor/three.min.js");
  // Postprocesado (brillo, aberración cromática, viñeta y grano): va después de Three.js.
  // Si no carga, la escena se dibuja igual, solo que sin efectos.
  const rutaEfectos = document.currentScript.src.replace("escena.js", "vendor/postprocessing.min.js");
  const rutaForma = document.currentScript.src.replace("escena.js", "k3d-forma.js");
  const rutaEmblema = new URL("../img/kairon-emblema-dorado.png", document.currentScript.src).href;
  const cargarThree = () => {
    const js = document.createElement("script");
    js.src = rutaThree;
    js.onload = () => {
      const efectos = document.createElement("script");
      efectos.src = rutaEfectos;
      efectos.onload = efectos.onerror = () => {
        // La K en 3D solo va en la portada (donde está .logo3d) y en pantallas anchas
        if (!document.querySelector(".logo3d") || window.innerWidth < 720) return iniciar();
        const forma = document.createElement("script");
        forma.src = rutaForma;
        forma.onload = forma.onerror = iniciar;
        document.head.appendChild(forma);
      };
      document.head.appendChild(efectos);
    };
    js.onerror = () => radar2D(contenedor);
    document.head.appendChild(js);
  };
  if (document.readyState === "complete") cargarThree();
  else window.addEventListener("load", cargarThree, { once: true });

  function iniciar() {

  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const movil = window.innerWidth < 720;

  // --- Escena, cámara y render ---
  const escena = new THREE.Scene();
  escena.fog = new THREE.FogExp2(0x0b0f14, 0.045);

  const camara = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camara.position.set(0, 1.1, 7.4);

  const render = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  contenedor.appendChild(render.domElement);

  const grupo = new THREE.Group();
  grupo.rotation.x = 0.35;
  const enPagina = contenedor.classList.contains("pagina__escena");
  grupo.position.x = movil ? 0 : (enPagina ? 2.6 : 1.2); // a la derecha del titular
  escena.add(grupo);

  // --- Textura circular suave para puntos ---
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = 64;
  const ctx = lienzo.getContext("2d");
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.8)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const textura = new THREE.CanvasTexture(lienzo);

  // --- Globo de nodos (distribución de Fibonacci) ---
  const RADIO = 2.6;
  const N = movil ? 260 : 460;
  const posiciones = new Float32Array(N * 3);
  const colores = new Float32Array(N * 3);
  const base = new THREE.Color(0xd4af7a);
  const nodos = [];

  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const ang = i * 2.399963;
    const x = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    posiciones.set([x * RADIO, y * RADIO, z * RADIO], i * 3);
    colores.set([base.r, base.g, base.b], i * 3);
    nodos.push({ x, y, z, brillo: 0, amenaza: 0 });
  }

  const geoNodos = new THREE.BufferGeometry();
  geoNodos.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
  geoNodos.setAttribute("color", new THREE.BufferAttribute(colores, 3));
  const puntos = new THREE.Points(geoNodos, new THREE.PointsMaterial({
    size: 0.14, map: textura, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  grupo.add(puntos);

  // Capa de "bloom" falso: los mismos puntos, más grandes y tenues
  const halo = new THREE.Points(geoNodos, new THREE.PointsMaterial({
    size: 0.42, map: textura, vertexColors: true, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  grupo.add(halo);

  // --- Red: líneas entre nodos cercanos ---
  const aristas = [];
  const segmentos = [];
  for (let i = 0; i < N; i += 2) {
    const a = nodos[i];
    let mejor = -1;
    let mejorD = 0.4;
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
  grupo.add(new THREE.LineSegments(geoLineas, new THREE.LineBasicMaterial({
    color: 0xe9cfa0, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending,
  })));

  // --- Paquetes que viajan por las aristas ---
  const NP = movil ? 18 : 40;
  const posPaquetes = new Float32Array(NP * 3);
  const paquetes = [];
  for (let i = 0; i < NP; i++) {
    paquetes.push({ arista: Math.floor(Math.random() * aristas.length), t: Math.random(), v: 0.4 + Math.random() * 0.8 });
  }
  const geoPaquetes = new THREE.BufferGeometry();
  geoPaquetes.setAttribute("position", new THREE.BufferAttribute(posPaquetes, 3));
  grupo.add(new THREE.Points(geoPaquetes, new THREE.PointsMaterial({
    size: 0.2, map: textura, color: 0xd8fbff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })));

  // --- Anillos de referencia ---
  const matAnillo = new THREE.LineBasicMaterial({ color: 0xe9cfa0, transparent: true, opacity: 0.6 });
  const geoAnillo = new THREE.BufferGeometry().setFromPoints(
    new THREE.EllipseCurve(0, 0, RADIO * 1.02, RADIO * 1.02, 0, Math.PI * 2, false, 0).getPoints(128)
  );
  const ecuador = new THREE.LineLoop(geoAnillo, matAnillo);
  ecuador.rotation.x = Math.PI / 2;
  grupo.add(ecuador);
  const meridiano = new THREE.LineLoop(geoAnillo, matAnillo.clone());
  meridiano.material.opacity = 0.3;
  grupo.add(meridiano);
  const exterior = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, RADIO * 1.35, RADIO * 1.35, 0, Math.PI * 2, false, 0).getPoints(160)),
    new THREE.LineDashedMaterial({ color: 0xd4af7a, transparent: true, opacity: 0.45, dashSize: 0.25, gapSize: 0.18 })
  );
  exterior.computeLineDistances();
  exterior.rotation.x = Math.PI / 2;
  grupo.add(exterior);

  // --- Barrido de radar (sector con shader) ---
  const geoBarrido = new THREE.CircleGeometry(RADIO * 1.02, 48, 0, 0.9);
  const matBarrido = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { color: { value: new THREE.Color(0x35c6d6) } },
    vertexShader: `varying vec2 vPos; void main(){ vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 color; varying vec2 vPos;
      void main(){
        float ang = atan(vPos.y, vPos.x);
        float cola = smoothstep(0.0, 0.9, ang);
        float radio = length(vPos) / ${(RADIO * 1.02).toFixed(3)};
        float alfa = cola * 0.9 * smoothstep(0.0, 0.25, radio);
        gl_FragColor = vec4(mix(color, vec3(1.0), cola * 0.5), alfa);
      }`,
  });
  const barrido = new THREE.Mesh(geoBarrido, matBarrido);
  barrido.rotation.x = -Math.PI / 2;
  grupo.add(barrido);

  // --- Pulso que se expande ---
  const matPulso = new THREE.MeshBasicMaterial({ color: 0xfff3d6, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
  const pulso = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 96), matPulso);
  pulso.rotation.x = -Math.PI / 2;
  grupo.add(pulso);
  let tPulso = 0;

  // --- Halo central ---
  const nucleo = new THREE.Sprite(new THREE.SpriteMaterial({ map: textura, color: 0xd4af7a, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  nucleo.scale.set(7.5, 7.5, 1);
  grupo.add(nucleo);

  // --- Polvo: partículas alrededor, fuera del grupo para que no giren con él ---
  const ND = movil ? 300 : 900;
  const posPolvo = new Float32Array(ND * 3);
  for (let i = 0; i < ND; i++) {
    posPolvo.set([(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10 - 2], i * 3);
  }
  const geoPolvo = new THREE.BufferGeometry();
  geoPolvo.setAttribute("position", new THREE.BufferAttribute(posPolvo, 3));
  const polvo = new THREE.Points(geoPolvo, new THREE.PointsMaterial({
    size: 0.06, map: textura, color: 0xe9cfa0, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  escena.add(polvo);

  // --- Cometa: punto brillante con estela que sigue al ratón ---
  const NC = 24;
  const posCometa = new Float32Array(NC * 3);
  const geoCometa = new THREE.BufferGeometry();
  geoCometa.setAttribute("position", new THREE.BufferAttribute(posCometa, 3));
  const tamCometa = new Float32Array(NC);
  for (let i = 0; i < NC; i++) tamCometa[i] = 1 - i / NC;
  const cometa = new THREE.Points(geoCometa, new THREE.PointsMaterial({
    size: 0.22, map: textura, color: 0xfff3d6, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  cometa.visible = false; // aparece con el primer movimiento del ratón
  escena.add(cometa);
  const estela = [];
  const cometaObjetivo = new THREE.Vector3(0, 0, 3);
  const cometaActual = new THREE.Vector3(0, 0, 3);

  // --- Interacción ---
  const objetivo = { x: 0, y: 0 };
  const actual = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    objetivo.x = (e.clientX / window.innerWidth - 0.5) * 2;
    objetivo.y = (e.clientY / window.innerHeight - 0.5) * 2;
    cometa.visible = !movil;
  }, { passive: true });

  // Al hacer scroll el globo se aleja y la escena se desvanece
  let scrollF = 0;
  window.addEventListener("scroll", () => {
    scrollF = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
  }, { passive: true });

  // --- K en 3D: el emblema extruido, con el PNG original en la cara frontal ---
  // El contorno sale de tools/k3d.py. El dibujo del logo no se toca (regla de marca):
  // solo se le da grosor, cantos de oro y luz.
  let k3d = null;
  const formaK = window.KAIRON_K;
  if (formaK && !movil) {
    const aVector = (lista) => { const v = []; for (let i = 0; i < lista.length; i += 2) v.push(new THREE.Vector2(lista[i], lista[i + 1])); return v; };
    const formas = formaK.formas.map((f) => {
      const forma = new THREE.Shape(aVector(f.c));
      f.h.forEach((h) => forma.holes.push(new THREE.Path(aVector(h))));
      return forma;
    });
    // Coordenadas de 0 a 1: así las UV de la cara frontal coinciden con el PNG sin calcular nada
    const GROSOR = 0.07;
    const geoK = new THREE.ExtrudeGeometry(formas, { depth: GROSOR, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.003, bevelSegments: 2, curveSegments: 4 });
    geoK.translate(-0.5, -0.5, -GROSOR / 2);

    // Entorno para los reflejos del metal: una sala oscura con tiras de luz cálidas y una fría
    const sala = new THREE.Scene();
    sala.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x0b0f14, side: THREE.BackSide })));
    [[0, 4, 0, 8, 1, 0xfff3d6, 3], [-4.5, 0, 2, 1, 6, 0xd4af7a, 2], [4.5, 1, -1, 1, 5, 0xe9cfa0, 2.2], [0, -3, 4, 6, 0.6, 0x35c6d6, 1.2]].forEach(([x, y, z, w, h, color, fuerza]) => {
      const tira = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(fuerza), side: THREE.DoubleSide }));
      tira.position.set(x, y, z);
      tira.lookAt(0, 0, 0);
      sala.add(tira);
    });
    const pmrem = new THREE.PMREMGenerator(render);
    const entorno = pmrem.fromScene(sala, 0.04).texture;
    pmrem.dispose();

    const texturaK = new THREE.TextureLoader().load(rutaEmblema);
    texturaK.colorSpace = THREE.SRGBColorSpace;
    texturaK.anisotropy = render.capabilities.getMaxAnisotropy();
    // Cara: el PNG tal cual (emisivo, para que sus colores no dependan de la luz) más un brillo metálico encima
    const matCara = new THREE.MeshStandardMaterial({ map: texturaK, emissiveMap: texturaK, emissive: 0xffffff, emissiveIntensity: 0.62, metalness: 0.75, roughness: 0.32, envMap: entorno, envMapIntensity: 0.7, alphaTest: 0.35, transparent: false });
    const matCanto = new THREE.MeshStandardMaterial({ color: 0xb58a4c, metalness: 1, roughness: 0.26, envMap: entorno, envMapIntensity: 1.25 });
    const mallaK = new THREE.Mesh(geoK, [matCara, matCanto]);
    const ALTO_K = enPagina ? 2.2 : 3.1;
    mallaK.scale.set(ALTO_K * formaK.proporcion, ALTO_K, ALTO_K);
    k3d = new THREE.Group();
    k3d.add(mallaK);
    escena.add(k3d);
    // La K de capas CSS se oculta (sigue ocupando su sitio): ya la dibuja WebGL
    document.documentElement.classList.add("k3d-activa");
    // Entrada: gira desde de canto y crece cuando termina la intro
    k3d.userData.entrada = 0;
  }

  // --- Postprocesado: el acabado "de cine" de la escena ---
  // Bloom: solo lo más brillante (barrido, paquetes, nodos encendidos) desprende luz.
  // Aberración cromática: separa un poco los colores en los bordes y se dispara con cada impacto.
  // (Sin viñeta ni grano: el lienzo no ocupa toda la pantalla y marcarían sus bordes.)
  const PP = window.POSTPROCESSING;
  let compositor = null;
  let aberracion = null;
  let sacudida = 0; // 0..1, sube con los impactos y baja sola
  const ABERRACION_BASE = movil ? 0.0004 : 0.0008;
  if (PP) {
    compositor = new PP.EffectComposer(render, { frameBufferType: THREE.HalfFloatType });
    compositor.addPass(new PP.RenderPass(escena, camara));
    const bloom = new PP.BloomEffect({ intensity: 0.9, luminanceThreshold: 0.55, luminanceSmoothing: 0.25, mipmapBlur: true, radius: 0.55 });
    compositor.addPass(new PP.EffectPass(camara, bloom));
    aberracion = new PP.ChromaticAberrationEffect({ offset: new THREE.Vector2(ABERRACION_BASE, ABERRACION_BASE), radialModulation: true, modulationOffset: 0.2 });
    compositor.addPass(new PP.EffectPass(camara, aberracion));
  }

  function ajustar() {
    const w = contenedor.clientWidth;
    const h = contenedor.clientHeight;
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
    render.setSize(w, h, false);
    if (compositor) compositor.setSize(w, h, false);
    camara.position.z = w < 720 ? 9.8 : 7.4;
  }
  window.addEventListener("resize", ajustar);
  ajustar();

  // --- Bucle ---
  const colorAttr = geoNodos.getAttribute("color");
  const tmp = new THREE.Color();
  const rojo = new THREE.Color(0xff4d4d);
  const cian = new THREE.Color(0xe6fdff);
  let anguloBarrido = 0;
  let ultimo = performance.now();
  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.02 }).observe(contenedor);

  // Calidad adaptativa: si los primeros segundos van a menos de ~30 fps, se reduce la carga
  let fotogramas = 0;
  let tInicioMedida = performance.now();
  let calidadBaja = false;
  function medirRendimiento(ahora) {
    fotogramas++;
    if (ahora - tInicioMedida > 2500 && !calidadBaja) {
      const fps = (fotogramas * 1000) / (ahora - tInicioMedida);
      // Solo cuenta si la pestaña ha estado pintando de verdad (en segundo plano casi no hay fotogramas)
      if (fps < 30 && fotogramas >= 30 && document.visibilityState === "visible") {
        calidadBaja = true;
        polvo.visible = false;
        halo.visible = false;
        render.setPixelRatio(1);
        if (compositor) { compositor.dispose(); compositor = null; } // sin efectos en equipos lentos
        ajustar();
        console.info("KAIRON: modo ligero activado (" + Math.round(fps) + " fps)");
      }
      fotogramas = 0;
      tInicioMedida = ahora;
    }
  }

  function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    // Mientras la intro tapa la pantalla no se dibuja nada: así no le roba rendimiento
    if (!visible || document.querySelector(".carga.intro-activa")) { ultimo = ahora; return; }
    const dt = Math.min((ahora - ultimo) / 1000, 0.05);
    ultimo = ahora;
    medirRendimiento(ahora);

    if (!reducido) {
      anguloBarrido = (anguloBarrido + dt * 0.95) % (Math.PI * 2);
      barrido.rotation.z = anguloBarrido;
      grupo.rotation.y += dt * 0.07;
      exterior.rotation.z -= dt * 0.05;
      polvo.rotation.y += dt * 0.01;
      tPulso = (tPulso + dt / 2.4) % 1;
      pulso.scale.setScalar(0.2 + tPulso * RADIO * 1.3);
      matPulso.opacity = (1 - tPulso) * 0.7;
    }

    actual.x += (objetivo.x - actual.x) * 0.04;
    actual.y += (objetivo.y - actual.y) * 0.04;

    // Cometa: convierte la posición del ratón a un punto delante de la cámara
    if (!movil) {
      const alto = Math.tan((camara.fov * Math.PI) / 360) * (camara.position.z - 3) * 2;
      cometaObjetivo.set(objetivo.x * alto * camara.aspect * 0.5, -objetivo.y * alto * 0.5 + camara.position.y * 0.4, 3);
      cometaActual.lerp(cometaObjetivo, 0.12);
      estela.unshift(cometaActual.clone());
      if (estela.length > NC) estela.pop();
      for (let i = 0; i < NC; i++) {
        const p = estela[Math.min(i, estela.length - 1)] || cometaActual;
        posCometa[i * 3] = p.x; posCometa[i * 3 + 1] = p.y; posCometa[i * 3 + 2] = p.z - i * 0.01;
      }
      geoCometa.getAttribute("position").needsUpdate = true;
    }
    grupo.rotation.x = 0.35 + actual.y * 0.2;
    grupo.rotation.z = -actual.x * 0.1;
    polvo.position.x = -actual.x * 0.6;
    polvo.position.y = actual.y * 0.4;

    // Scroll: la cámara se aleja, el globo gira y se inclina (si la escena es fija, sigue visible tras la portada)
    const fija = contenedor.classList.contains("fija");
    if (fija) {
      const s = Math.min(window.scrollY / Math.max(window.innerHeight * 2, 1), 1);
      camara.position.z = (movil ? 9.8 : 7.4) + s * 6;
      grupo.rotation.y += 0; // la rotación continua ya avanza; añadimos giro extra por scroll
      grupo.rotation.x = 0.35 + actual.y * 0.2 + s * 0.6;
      grupo.position.x = (movil ? 0 : 1.2) - s * 1.2;
      grupo.position.y = -s * 0.6;
    } else {
      grupo.position.y = -scrollF * 2.2;
      grupo.scale.setScalar(1 - scrollF * 0.25);
      render.domElement.style.opacity = String(1 - scrollF * 0.9);
    }

    // K en 3D: acompaña al globo, sigue al ratón y flota; entra girando tras la intro
    if (k3d) {
      if (!document.querySelector(".carga")) k3d.userData.entrada = Math.min(1, k3d.userData.entrada + dt / 1.8);
      const e = 1 - Math.pow(1 - k3d.userData.entrada, 3); // ease-out cúbico
      const t = ahora / 1000;
      k3d.position.copy(grupo.position);
      k3d.position.y += reducido ? 0 : Math.sin(t * 0.9) * 0.06;
      k3d.scale.setScalar((0.55 + 0.45 * e) * (fija ? 1 : 1 - scrollF * 0.25));
      k3d.rotation.y = (1 - e) * -Math.PI * 0.9 + actual.x * 0.45 + (reducido ? 0 : Math.sin(t * 0.45) * 0.1);
      k3d.rotation.x = actual.y * 0.25;
      k3d.visible = e > 0;
    }

    // Nodos
    const frente = anguloBarrido + 0.9;
    for (let i = 0; i < N; i++) {
      const n = nodos[i];
      const ang = Math.atan2(n.z, n.x);
      let dif = (frente + ang) % (Math.PI * 2);
      if (dif < 0) dif += Math.PI * 2;
      if (dif < 0.12) {
        n.brillo = 1;
        if (n.amenaza > 0) n.amenaza = 0;
      }
      if (!reducido && Math.random() < 0.0003) n.amenaza = 1;
      n.brillo = Math.max(0, n.brillo - dt * 0.55);
      if (n.amenaza > 0) {
        tmp.copy(base).lerp(rojo, 0.6 + 0.4 * Math.sin(ahora * 0.012));
      } else {
        tmp.copy(base).lerp(cian, n.brillo);
      }
      colorAttr.setXYZ(i, tmp.r, tmp.g, tmp.b);
    }
    colorAttr.needsUpdate = true;

    // Paquetes
    if (!reducido && aristas.length) {
      for (let i = 0; i < NP; i++) {
        const p = paquetes[i];
        p.t += dt * p.v;
        if (p.t > 1) { p.t = 0; p.arista = Math.floor(Math.random() * aristas.length); }
        const [a, b] = aristas[p.arista];
        const A = nodos[a], B = nodos[b];
        posPaquetes[i * 3] = (A.x + (B.x - A.x) * p.t) * RADIO;
        posPaquetes[i * 3 + 1] = (A.y + (B.y - A.y) * p.t) * RADIO;
        posPaquetes[i * 3 + 2] = (A.z + (B.z - A.z) * p.t) * RADIO;
      }
      geoPaquetes.getAttribute("position").needsUpdate = true;
    }

    if (compositor) {
      // La aberración se abre con los impactos y con el ratón rápido, y vuelve a su valor base
      sacudida = Math.max(0, sacudida - dt * 1.6);
      const desvio = ABERRACION_BASE + sacudida * 0.006 + Math.min(Math.abs(objetivo.x - actual.x) + Math.abs(objetivo.y - actual.y), 1) * 0.0012;
      aberracion.offset.set(desvio, desvio * 0.6);
      compositor.render(dt);
    } else {
      render.render(escena, camara);
    }
  }
  requestAnimationFrame(cuadro);

  // API pública para la demo: encender o apagar muchas amenazas a la vez
  window.kaironEscena = {
    // Clic: un grupo de nodos cercanos se vuelve amenaza y sale una onda desde el centro
    impacto() {
      const i0 = Math.floor(Math.random() * N);
      const a = nodos[i0];
      for (let i = 0; i < N; i++) {
        const b = nodos[i];
        if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.35) b.amenaza = 1;
      }
      tPulso = 0;
      sacudida = 1;
    },
    ataque(encender) {
      for (let i = 0; i < N; i++) {
        if (encender) { if (Math.random() < 0.18) nodos[i].amenaza = 1; sacudida = 1; }
        else nodos[i].amenaza = 0;
      }
    },
  };
  }
})();

/* Radar 2D de reserva: anillos, barrido y puntos que se encienden. Sin librerías. */
function radar2D(contenedor) {
  const c = document.createElement("canvas");
  c.className = "radar-2d";
  contenedor.appendChild(c);
  const ctx = c.getContext("2d");
  const puntos = Array.from({ length: 70 }, () => ({ a: Math.random() * Math.PI * 2, r: 0.15 + Math.random() * 0.8, b: 0 }));
  let ang = 0;
  function dibujar() {
    const w = contenedor.clientWidth, h = contenedor.clientHeight;
    if (c.width !== w) { c.width = w; c.height = h; }
    ctx.clearRect(0, 0, w, h);
    const cx = w * (w < 720 ? 0.5 : 0.68), cy = h * 0.45, R = Math.min(w, h) * 0.36;
    ctx.strokeStyle = "rgba(196,151,75,0.35)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) { ctx.beginPath(); ctx.arc(cx, cy, (R / 4) * i, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    if (ctx.createConicGradient) {
      const g = ctx.createConicGradient(ang, cx, cy);
      g.addColorStop(0, "rgba(53,198,214,0)"); g.addColorStop(0.08, "rgba(53,198,214,0.55)"); g.addColorStop(0.09, "rgba(53,198,214,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    }
    puntos.forEach((p) => {
      let d = (ang + 0.5 - p.a) % (Math.PI * 2); if (d < 0) d += Math.PI * 2;
      if (d < 0.08) p.b = 1;
      p.b = Math.max(0, p.b - 0.01);
      const x = cx + Math.cos(p.a) * p.r * R, y = cy + Math.sin(p.a) * p.r * R;
      ctx.fillStyle = "rgba(" + Math.round(196 + 50 * p.b) + "," + Math.round(151 + 90 * p.b) + "," + Math.round(75 + 160 * p.b) + "," + (0.5 + 0.5 * p.b) + ")";
      ctx.beginPath(); ctx.arc(x, y, 2 + 2 * p.b, 0, Math.PI * 2); ctx.fill();
    });
    ang += 0.02;
    requestAnimationFrame(dibujar);
  }
  dibujar();
}
