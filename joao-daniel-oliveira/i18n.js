/* Idiomas: español (el del HTML), inglés y portugués.
   Los textos fijos de la página llevan data-i18n="clave": el español se lee del propio HTML
   al cargar y el resto sale de este diccionario. Los textos que genera el JS (informes,
   explicaciones del bug, estados del editor) están aquí en los tres idiomas. */

const PAGINA = {
  en: {
    "ui.saltar": "Skip to content", "ui.idioma": "Language", "ui.sonido": "Sound", "ui.calma": "Less motion", "ui.pag": "p.",
    "nav.sobre": "About", "nav.habilidades": "Skills", "nav.proyectos": "Projects", "nav.lab": "Lab", "nav.formacion": "Education", "nav.contacto": "Contact",
    "editor.etiqueta": "Editor: code of the current section", "editor.listo": "Ready",
    "hero.intro": "Computer systems student in Barcelona, on my way to software development. I write Python, build small web tools and want to end up working with data and AI.",
    "hero.alias": "Online I go by Maru.", "hero.cv": "Download CV", "hero.escribeme": "Get in touch",
    "sobre.titulo": "About me",
    "sobre.p1": "I'm in my second year of SMX (IT systems and networks) at Digitech FP in Barcelona: hardware, operating systems, networks and security. That gave me a solid base, and my next step is software development.",
    "sobre.p2": "I finished Harvard's CS50x and I'm working through the rest of the CS50 courses. Outside class I play a lot, make my own Roblox games in Luau and I'm into anime and manga.",
    "sobre.p3": "English and Portuguese are my native languages, and I live in Spain.",
    "sobre.r1": "Systems, networks and scripting (2025–2027). Now.", "sobre.r2": "Multiplatform apps and databases. Next.", "sobre.r3t": "Data & AI", "sobre.r3": "Python, Big Data and machine learning. Later on.",
    "hab.titulo": "What I use and where I've used it", "hab.c1": "Skill", "hab.c2": "Where I've used it", "hab.c3": "Area",
    "hab.python": "CS50 exercises and the log analyzer", "hab.js": "Mini apps, my website's terminal and this portfolio", "hab.html": "My website, KAIRON and class exercises",
    "hab.java": "Object-oriented basics, getting ready for DAM", "hab.luau": "Games in Roblox Studio", "hab.sql": "Relational databases in CS50",
    "hab.win": "Users, groups, permissions and PowerShell", "hab.linux": "Ubuntu and Debian from the terminal, Bash", "hab.redes.n": "Networking", "hab.redes": "LAN and WLAN, IPv4 addressing, DNS",
    "hab.hw": "Building, repairing and diagnosing PCs", "hab.git": "Version control for my projects", "hab.vscode": "My everyday editor", "hab.vbox": "Virtual machines for labs", "hab.office": "Excel, Sheets, Word and Docs",
    "hab.a1": "Programming", "hab.a2": "Systems & networks", "hab.a3": "Tools", "hab.filas": "14 rows in set",
    "pro.titulo": "Built while learning",
    "pro.1.n": "Log analyzer", "pro.1.d": "Reads HTTP server logs, counts requests per IP and status code, lists the errors and flags an IP with repeated 401/403s as a possible brute-force attack. It runs in the browser with PyScript, and further down there's a version you can try right here.",
    "pro.probar": "Try it on my website", "pro.2.n": "Interactive CV", "pro.2.d": "My CV as a web page, with a small terminal to type commands into and the PDF to download in English or Spanish.", "pro.abrir": "Open it",
    "pro.3.n": "My personal website", "pro.3.d": "No frameworks: responsive design, a terminal, three mini apps and seven languages, published on GitHub Pages.", "pro.repo": "See the repository",
    "pro.4.p": "Final project · with Lorena", "pro.4.d": "A fictional managed SOC company for small businesses, our final-year project. I lead the web development and user experience.", "pro.kairon": "See KAIRON",
    "lab.titulo": "Lab", "lab.nota": "Four small programs I wrote for this page. They run in your browser: nothing you type leaves it.",
    "ana.titulo": "Log analyzer", "ana.nota": "Paste lines from an HTTP access log (Apache or Nginx format). It counts requests per IP and per status code, and warns about a possible brute-force attack when one IP collects 5 or more 401/403 responses.",
    "ana.analizar": "Analyze", "ana.ejemplo": "Load a sample log", "ana.archivo": "Open a file",
    "bug.titulo": "Find the bug", "bug.nota": "This code has a mistake. Click the line you think is wrong and I'll explain what happens.", "bug.lineas": "Program lines", "bug.siguiente": "Another bug",
    "rx.titulo": "Regular expression playground", "rx.nota": "The same technique the analyzer uses. Type a regular expression and see which log lines match.", "rx.patron": "Pattern", "rx.ejemplos": "Examples",
    "rx.p1": "Denied access", "rx.p2": "IP addresses", "rx.p3": "Login attempts", "rx.p4": "Server errors",
    "lu.titulo": "From Luau to the game", "lu.nota": "In Roblox, any object can carry a script. This one collects coins: move the player with the arrow keys, WASD or by dragging, and watch which lines run at each moment.",
    "lu.script": "Luau script", "lu.lienzo": "Mini game: the player collects coins", "lu.monedas": "Coins", "lu.aviso": "Sample snippet written for this page, in the style of my Roblox scripts.",
    "for.titulo": "Finished and on the way", "for.hecho": "[done]", "for.curso": "[in progress]", "for.sig": "[next]", "for.luego": "[later]",
    "for.cs50x": "Introduction to Computer Science", "for.cs50p": "Programming with Python", "for.cs50w": "Web Programming with Python and JavaScript", "for.smx": "IT Systems and Networks (vocational)",
    "for.cs50ai": "Introduction to AI with Python", "for.cs50g": "Introduction to Game Development", "for.tinyml": "Machine learning on microcontrollers",
    "con.titulo": "Open to internships and first jobs", "con.texto": "I'm looking for paid vocational internships and junior roles in Barcelona, in IT support, systems administration or software development.",
    "con.escribir": "Email me", "con.web": "My personal website", "pie.kairon": "Back to KAIRON", "pie.reimprimir": "Print it again"
  },
  pt: {
    "ui.saltar": "Ir para o conteúdo", "ui.idioma": "Idioma", "ui.sonido": "Som", "ui.calma": "Menos movimento", "ui.pag": "pág.",
    "nav.sobre": "Sobre mim", "nav.habilidades": "Competências", "nav.proyectos": "Projetos", "nav.lab": "Laboratório", "nav.formacion": "Formação", "nav.contacto": "Contacto",
    "editor.etiqueta": "Editor: código da secção atual", "editor.listo": "Pronto",
    "hero.intro": "Estudante de sistemas informáticos em Barcelona, a caminho do desenvolvimento de software. Escrevo Python, construo pequenas ferramentas web e quero acabar a trabalhar com dados e IA.",
    "hero.alias": "Na internet conhecem-me como Maru.", "hero.cv": "Descarregar CV", "hero.escribeme": "Fala comigo",
    "sobre.titulo": "Sobre mim",
    "sobre.p1": "Estou no segundo ano de SMX (sistemas informáticos e redes) na Digitech FP, em Barcelona: hardware, sistemas operativos, redes e segurança. Isso deu-me uma base sólida, e o meu próximo passo é o desenvolvimento de software.",
    "sobre.p2": "Terminei o CS50x de Harvard e continuo com o resto dos cursos CS50. Fora das aulas jogo muito, faço os meus próprios jogos no Roblox com Luau e gosto de anime e manga.",
    "sobre.p3": "O inglês e o português são as minhas línguas nativas, e vivo em Espanha.",
    "sobre.r1": "Sistemas, redes e scripting (2025–2027). Agora.", "sobre.r2": "Aplicações multiplataforma e bases de dados. Depois.", "sobre.r3t": "Dados e IA", "sobre.r3": "Python, Big Data e aprendizagem automática. Mais à frente.",
    "hab.titulo": "O que uso e onde o usei", "hab.c1": "Competência", "hab.c2": "Onde a usei", "hab.c3": "Área",
    "hab.python": "Exercícios do CS50 e o analisador de logs", "hab.js": "Mini apps, o terminal do meu site e este portfólio", "hab.html": "O meu site, a KAIRON e os exercícios das aulas",
    "hab.java": "Bases de orientação a objetos, a preparar o DAM", "hab.luau": "Jogos no Roblox Studio", "hab.sql": "Bases de dados relacionais no CS50",
    "hab.win": "Utilizadores, grupos, permissões e PowerShell", "hab.linux": "Ubuntu e Debian pelo terminal, Bash", "hab.redes.n": "Redes", "hab.redes": "LAN e WLAN, endereçamento IPv4, DNS",
    "hab.hw": "Montar, reparar e diagnosticar PCs", "hab.git": "Controlo de versões dos meus projetos", "hab.vscode": "O meu editor de todos os dias", "hab.vbox": "Máquinas virtuais para as práticas", "hab.office": "Excel, Sheets, Word e Docs",
    "hab.a1": "Programação", "hab.a2": "Sistemas e redes", "hab.a3": "Ferramentas", "hab.filas": "14 linhas no resultado",
    "pro.titulo": "Feitos enquanto aprendo",
    "pro.1.n": "Analisador de logs", "pro.1.d": "Lê logs de um servidor HTTP, conta pedidos por IP e por código de estado, lista os erros e marca como possível ataque de força bruta um IP com 401/403 repetidos. Funciona no navegador com PyScript, e mais abaixo tens uma versão para experimentar aqui.",
    "pro.probar": "Experimentar no meu site", "pro.2.n": "CV interativo", "pro.2.d": "O meu CV como página web, com um pequeno terminal para escrever comandos e o PDF para descarregar em inglês ou espanhol.", "pro.abrir": "Abrir",
    "pro.3.n": "O meu site pessoal", "pro.3.d": "Sem frameworks: design adaptável, terminal, três mini apps e sete idiomas, publicado no GitHub Pages.", "pro.repo": "Ver o repositório",
    "pro.4.p": "Projeto final · com a Lorena", "pro.4.d": "Empresa fictícia de SOC gerido para PMEs, o nosso projeto de fim de curso. Faço o desenvolvimento web e a experiência de utilizador.", "pro.kairon": "Ver a KAIRON",
    "lab.titulo": "Laboratório", "lab.nota": "Quatro pequenos programas que escrevi para esta página. Correm no teu navegador: nada do que escreves sai daqui.",
    "ana.titulo": "Analisador de logs", "ana.nota": "Cola linhas de um log de acesso HTTP (formato Apache ou Nginx). Conta pedidos por IP e por código, e avisa de um possível ataque de força bruta quando um IP acumula 5 ou mais respostas 401/403.",
    "ana.analizar": "Analisar", "ana.ejemplo": "Carregar um log de exemplo", "ana.archivo": "Abrir um ficheiro",
    "bug.titulo": "Encontra o bug", "bug.nota": "Este código tem um erro. Carrega na linha que achas que falha e eu explico o que acontece.", "bug.lineas": "Linhas do programa", "bug.siguiente": "Outro bug",
    "rx.titulo": "Playground de expressões regulares", "rx.nota": "A mesma técnica que o analisador usa. Escreve uma expressão regular e vê que linhas do log coincidem.", "rx.patron": "Padrão", "rx.ejemplos": "Exemplos",
    "rx.p1": "Acessos negados", "rx.p2": "Endereços IP", "rx.p3": "Tentativas de login", "rx.p4": "Erros do servidor",
    "lu.titulo": "Do Luau ao jogo", "lu.nota": "No Roblox, qualquer objeto pode levar um script. Este apanha moedas: move o jogador com as setas, WASD ou arrastando, e vê que linhas se executam em cada momento.",
    "lu.script": "Script de Luau", "lu.lienzo": "Mini jogo: o jogador apanha moedas", "lu.monedas": "Moedas", "lu.aviso": "Excerto de exemplo escrito para esta página, no estilo dos meus scripts do Roblox.",
    "for.titulo": "Terminados e a caminho", "for.hecho": "[feito]", "for.curso": "[a decorrer]", "for.sig": "[a seguir]", "for.luego": "[mais à frente]",
    "for.cs50x": "Introdução às Ciências da Computação", "for.cs50p": "Programação com Python", "for.cs50w": "Programação web com Python e JavaScript", "for.smx": "Sistemas Microinformáticos e Redes",
    "for.cs50ai": "Inteligência artificial com Python", "for.cs50g": "Desenvolvimento de videojogos", "for.tinyml": "Aprendizagem automática em microcontroladores",
    "con.titulo": "Disponível para estágios e primeiros empregos", "con.texto": "Procuro estágios remunerados de formação profissional e lugares júnior em Barcelona, em suporte informático, administração de sistemas ou desenvolvimento de software.",
    "con.escribir": "Escreve-me", "con.web": "O meu site pessoal", "pie.kairon": "Voltar à KAIRON", "pie.reimprimir": "Imprimir de novo"
  }
};

/* Textos que genera el JavaScript, en los tres idiomas */
const DINAMICOS = {
  es: {
    "editor.escribiendo": "Escribiendo…", "editor.compilando": "Compilando…", "editor.impreso": "Impreso", "editor.ver": "Ver el código de esta sección",
    "sonido.on": "Sonido activado", "sonido.off": "Sonido desactivado",
    "ana.vacio": "No hay nada que analizar todavía.", "ana.formato": (n) => `Ninguna de las ${n} líneas tiene formato de log de acceso.`,
    "ana.alerta": "Posible fuerza bruta", "ana.limpio": "Sin señales de fuerza bruta",
    "ana.alertaDet": (ip, n) => `${ip} acumula ${n} accesos denegados (401/403).`, "ana.limpioDet": (u) => `Ninguna IP llega a ${u} accesos denegados.`,
    "ana.peticiones": "peticiones", "ana.ips": "IP distintas", "ana.errores": "errores", "ana.ignoradas": "líneas ignoradas",
    "ana.porIp": "Peticiones por IP", "ana.porCodigo": "Por código de estado", "ana.verErrores": (n) => `Ver los ${n} errores`,
    "ana.cols": ["Código", "IP", "Método", "Ruta"],
    "rx.coinciden": (n, t) => `${n} de ${t} líneas coinciden`, "rx.error": (m) => `Patrón no válido: ${m}. Revisa paréntesis y corchetes.`,
    "bug.bien": "Esta línea está bien", "bug.encontrado": "¡Encontrado!", "bug.pista": "Pista: fíjate en qué valores toma cada variable.",
    "lu.ejecuta": "Se está ejecutando"
  },
  en: {
    "editor.escribiendo": "Typing…", "editor.compilando": "Compiling…", "editor.impreso": "Printed", "editor.ver": "Show the code for this section",
    "sonido.on": "Sound on", "sonido.off": "Sound off",
    "ana.vacio": "Nothing to analyze yet.", "ana.formato": (n) => `None of the ${n} lines look like an access log.`,
    "ana.alerta": "Possible brute force", "ana.limpio": "No signs of brute force",
    "ana.alertaDet": (ip, n) => `${ip} has ${n} denied requests (401/403).`, "ana.limpioDet": (u) => `No IP reaches ${u} denied requests.`,
    "ana.peticiones": "requests", "ana.ips": "unique IPs", "ana.errores": "errors", "ana.ignoradas": "ignored lines",
    "ana.porIp": "Requests per IP", "ana.porCodigo": "By status code", "ana.verErrores": (n) => `Show the ${n} errors`,
    "ana.cols": ["Code", "IP", "Method", "Path"],
    "rx.coinciden": (n, t) => `${n} of ${t} lines match`, "rx.error": (m) => `Invalid pattern: ${m}. Check your brackets and parentheses.`,
    "bug.bien": "This line is fine", "bug.encontrado": "Found it!", "bug.pista": "Hint: look at which values each variable takes.",
    "lu.ejecuta": "Running"
  },
  pt: {
    "editor.escribiendo": "A escrever…", "editor.compilando": "A compilar…", "editor.impreso": "Impresso", "editor.ver": "Ver o código desta secção",
    "sonido.on": "Som ligado", "sonido.off": "Som desligado",
    "ana.vacio": "Ainda não há nada para analisar.", "ana.formato": (n) => `Nenhuma das ${n} linhas tem formato de log de acesso.`,
    "ana.alerta": "Possível força bruta", "ana.limpio": "Sem sinais de força bruta",
    "ana.alertaDet": (ip, n) => `${ip} acumula ${n} acessos negados (401/403).`, "ana.limpioDet": (u) => `Nenhum IP chega a ${u} acessos negados.`,
    "ana.peticiones": "pedidos", "ana.ips": "IPs diferentes", "ana.errores": "erros", "ana.ignoradas": "linhas ignoradas",
    "ana.porIp": "Pedidos por IP", "ana.porCodigo": "Por código de estado", "ana.verErrores": (n) => `Ver os ${n} erros`,
    "ana.cols": ["Código", "IP", "Método", "Caminho"],
    "rx.coinciden": (n, t) => `${n} de ${t} linhas coincidem`, "rx.error": (m) => `Padrão inválido: ${m}. Revê os parênteses e os colchetes.`,
    "bug.bien": "Esta linha está bem", "bug.encontrado": "Encontraste!", "bug.pista": "Dica: repara nos valores que cada variável toma.",
    "lu.ejecuta": "A executar"
  }
};

const IDIOMAS = ["es", "en", "pt"];
const originales = new Map(); // español leído del HTML
let actual = "es";
const oyentes = [];

function guardarOriginales() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    if (!originales.has(el.dataset.i18n)) originales.set(el.dataset.i18n, el.textContent);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const clave = el.dataset.i18nAria;
    if (!originales.has(clave)) originales.set(clave, el.getAttribute("aria-label"));
  });
}

/** Texto de una clave en el idioma actual (las funciones reciben los argumentos). */
export function t(clave, ...args) {
  const valor = DINAMICOS[actual][clave] ?? PAGINA[actual]?.[clave] ?? DINAMICOS.es[clave] ?? originales.get(clave) ?? clave;
  return typeof valor === "function" ? valor(...args) : valor;
}

export function idioma() { return actual; }
export function alCambiarIdioma(fn) { oyentes.push(fn); }

export function ponerIdioma(lang) {
  if (!IDIOMAS.includes(lang)) lang = "es";
  actual = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const clave = el.dataset.i18n;
    el.textContent = lang === "es" ? originales.get(clave) : (PAGINA[lang][clave] ?? originales.get(clave));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const clave = el.dataset.i18nAria;
    el.setAttribute("aria-label", lang === "es" ? originales.get(clave) : (PAGINA[lang][clave] ?? originales.get(clave)));
  });
  document.querySelectorAll(".idiomas [data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  try { localStorage.setItem("idioma-dani", lang); } catch { /* sin almacenamiento */ }
  oyentes.forEach((fn) => fn(lang));
}

export function iniciarIdioma() {
  guardarOriginales();
  let inicial = new URLSearchParams(location.search).get("lang");
  if (!inicial) { try { inicial = localStorage.getItem("idioma-dani"); } catch { /* sin almacenamiento */ } }
  if (!inicial) inicial = (navigator.language || "es").slice(0, 2);
  document.querySelectorAll(".idiomas [data-lang]").forEach((b) => b.addEventListener("click", () => ponerIdioma(b.dataset.lang)));
  ponerIdioma(IDIOMAS.includes(inicial) ? inicial : "es");
}
