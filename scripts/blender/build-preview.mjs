// Frames PNG + anclajes -> pagina HTML autocontenida con scroll-scrub y cotas
// dinamicas, para juzgar el movimiento antes de tirar el render bueno a 1600px.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [srcDir, anchorsPath, outHtml] = process.argv.slice(2)
const numberOf = (n) => (n.match(/(\d+)\.png$/i) ? Number(n.match(/(\d+)\.png$/i)[1]) : null)

const files = readdirSync(srcDir)
  .filter((n) => numberOf(n) !== null)
  .sort((a, b) => numberOf(a) - numberOf(b))

const work = mkdtempSync(join(tmpdir(), 'prev-'))
const frames = files.map((name) => {
  const out = join(work, `${name}.webp`)
  execFileSync('cwebp', ['-quiet', '-q', '70', '-alpha_q', '90', join(srcDir, name), '-o', out])
  return `data:image/webp;base64,${readFileSync(out).toString('base64')}`
})

const anchors = JSON.parse(readFileSync(anchorsPath, 'utf8'))
const bytes = frames.reduce((n, f) => n + f.length, 0)
console.log(`${frames.length} frames, ~${(bytes / 1024 / 1024).toFixed(1)} MB embebidos`)

const html = `<title>Gamma 13 — preview de movimiento y cotas</title>
<style>
  :root { color-scheme: light dark; --ink: #e8ecf5; --bg: #0f1526; --line: #7ec8ff; }
  @media (prefers-color-scheme: light) { :root { --ink: #16203a; --bg: #eef1f7; --line: #0b6bb5; } }
  :root[data-theme="light"] { --ink: #16203a; --bg: #eef1f7; --line: #0b6bb5; }
  :root[data-theme="dark"]  { --ink: #e8ecf5; --bg: #0f1526; --line: #7ec8ff; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.55 system-ui, sans-serif; }
  header, footer { max-width: 46rem; margin: 0 auto; padding: 2.5rem 1.5rem; }
  h1 { font-size: 1.35rem; margin: 0 0 .5rem; }
  p { margin: .4rem 0; opacity: .85; }
  .scroller { height: 600vh; position: relative; }
  .sticky { position: sticky; top: 0; height: 100vh; display: grid; place-items: center; }
  .stage { position: relative; width: min(80vmin, 660px); aspect-ratio: 1; }
  canvas, svg.cotas { position: absolute; inset: 0; width: 100%; height: 100%; }
  svg.cotas { pointer-events: none; overflow: visible; }
  svg.cotas line, svg.cotas path { stroke: var(--line); stroke-width: 2.5; fill: none; vector-effect: non-scaling-stroke; }
  svg.cotas text { fill: var(--ink); font: 700 26px system-ui, sans-serif; paint-order: stroke;
                   stroke: var(--bg); stroke-width: 7px; text-anchor: middle; }
  svg.cotas .cota { transition: opacity .28s ease; }
  svg.cotas .cota text { transition: font-size .28s ease; }
  @media (prefers-reduced-motion: reduce) { svg.cotas .cota, svg.cotas .cota text { transition: none; } }
  .panel { position: fixed; left: 1rem; bottom: 1rem; display: flex; gap: .75rem; align-items: center;
           font: 12px ui-monospace, monospace; background: color-mix(in srgb, currentColor 12%, transparent);
           padding: .5rem .7rem; border-radius: .5rem; }
  button { font: inherit; cursor: pointer; border: 1px solid currentColor; background: none;
           color: inherit; border-radius: .35rem; padding: .25rem .5rem; }
</style>
<header>
  <h1>Gamma 13 — preview de movimiento y cotas</h1>
  <p>Barrido de 140° centrado en el frente, zoom 85→130 mm con meseta sobre producto y pantalla.
     Render de prueba a 360 px: sirve para juzgar el movimiento, no la calidad.</p>
  <p>Las cotas <strong>no están horneadas en la imagen</strong>. Se dibujan en SVG entre puntos
     que Blender proyectó frame por frame, así que siguen a la geometría durante el giro y el zoom.
     Por eso el botón de unidades cambia el texto sin volver a renderizar nada.</p>
  <p>Scrolleá para scrubbear.</p>
</header>
<div class="scroller"><div class="sticky"><div class="stage">
  <canvas id="c" width="720" height="720"></canvas>
  <svg class="cotas" id="svg" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"></svg>
</div></div></div>
<div class="panel">
  <span id="hud">frame 1 / ${frames.length}</span>
  <button id="units">milímetros</button>
  <button id="toggle">ocultar cotas</button>
</div>
<footer><p>Fin del preview.</p></footer>
<script>
const SRC = ${JSON.stringify(frames)};
const ANCH = ${JSON.stringify(anchors)};
const imgs = SRC.map(s => { const i = new Image(); i.src = s; return i });
const canvas = document.getElementById('c'), svg = document.getElementById('svg');
const hud = document.getElementById('hud'), ctx = canvas.getContext('2d');
const scroller = document.querySelector('.scroller');
let current = -1, raf = 0, metric = false, showCotas = true;

// La flecha se UBICA con la geometria medida (ANCH.measuredMm, 1995x1820x1012),
// pero el numero que muestra es el de la ficha del fabricante. Son distintos:
// el modelo trae tolerancias de CAD y la ficha es lo que el cliente publica y
// lo que el operador va a medir contra su puerta. Mostrar el medido seria
// contradecir la tabla de specs que esta tres centimetros mas abajo.
const SPEC = { height: 1956, width: 1829, depth: 991 };  // 77" x 72" x 39"
const label = (key) => {
  const v = SPEC[key];
  return metric ? v.toLocaleString('es') + ' mm' : Math.round(v / 25.4) + '"';
};
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};

// Los nodos se crean UNA vez y despues solo se les actualizan los atributos.
// Recrearlos en cada frame mataria cualquier transicion CSS -- un nodo nuevo no
// tiene estado anterior desde el cual animar, asi que el fade nunca arrancaria.
const parts = {};
for (const key of Object.keys(ANCH.edges)) {
  const g = el('g', { class: 'cota' });
  const ext1 = el('line', { 'stroke-opacity': .4 });
  const ext2 = el('line', { 'stroke-opacity': .4 });
  const main = el('line', {});
  const heads = el('path', {});
  const text = el('text', {});
  g.append(ext1, ext2, main, heads, text);
  svg.append(g);
  parts[key] = { g, ext1, ext2, main, heads, text };
}

// Aparece recien cuando la cara mira lo suficiente a la camara, y con margen
// entre los dos umbrales para que no titile al cruzar el limite.
const fade = (v) => {
  const t = Math.min(Math.max((v - 0.28) / (0.62 - 0.28), 0), 1);
  return t * t * (3 - 2 * t);
};

// El primer frame es el poster: lo que se ve antes de que nadie toque nada. Ahi
// la maquina va limpia, sin lineas encima. Las cotas entran recien cuando el
// usuario empieza a scrollear, que es cuando pasa de mirar a leer.
const gate = (progress) => {
  const t = Math.min(Math.max((progress - 0.02) / (0.09 - 0.02), 0), 1);
  return t * t * (3 - 2 * t);
};

function drawCotas(frame, progress) {
  const { p: pts, facing } = ANCH.frames[frame];
  const entrance = gate(progress);
  for (const [key, [a, b]] of Object.entries(ANCH.edges)) {
    const n = parts[key];
    const visible = showCotas ? fade(facing[key]) * entrance : 0;
    n.g.style.opacity = visible;
    if (visible < 0.02) continue;

    const [x1, y1] = pts[a].map(v => v * 1000);
    const [x2, y2] = pts[b].map(v => v * 1000);
    // Corre la cota hacia afuera sobre la perpendicular, para no taparle la
    // silueta a la maquina.
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const off = key === 'height' ? -58 : 58;
    const nx = (-dy / len) * off, ny = (dx / len) * off;
    const ax = x1 + nx, ay = y1 + ny, bx = x2 + nx, by = y2 + ny;

    n.ext1.setAttribute('x1', x1); n.ext1.setAttribute('y1', y1);
    n.ext1.setAttribute('x2', ax); n.ext1.setAttribute('y2', ay);
    n.ext2.setAttribute('x1', x2); n.ext2.setAttribute('y1', y2);
    n.ext2.setAttribute('x2', bx); n.ext2.setAttribute('y2', by);
    n.main.setAttribute('x1', ax); n.main.setAttribute('y1', ay);
    n.main.setAttribute('x2', bx); n.main.setAttribute('y2', by);

    let d = '';
    for (const [px, py, sx, sy] of [[ax, ay, dx, dy], [bx, by, -dx, -dy]]) {
      const ux = (sx / len) * 26, uy = (sy / len) * 26;
      d += 'M' + px + ',' + py + ' L' + (px + ux - uy * .34) + ',' + (py + uy + ux * .34) +
           ' M' + px + ',' + py + ' L' + (px + ux + uy * .34) + ',' + (py + uy - ux * .34) + ' ';
    }
    n.heads.setAttribute('d', d);

    // La etiqueta entra desde la linea de cota hacia afuera: mientras la cota
    // esta apareciendo se acerca a su lugar, en vez de materializarse ahi.
    const drift = (1 - visible) * 18;
    n.text.setAttribute('x', (ax + bx) / 2 + (nx / off) * drift);
    n.text.setAttribute('y', (ay + by) / 2 - 14 + (ny / off) * drift);
    n.text.textContent = label(key);
  }
}

function draw() {
  const rect = scroller.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
  const idx = Math.min(Math.floor(p * SRC.length), SRC.length - 1);
  // El canvas se redibuja solo si cambio el frame; las cotas, siempre. La
  // entrada depende del scroll de forma continua, y un frame dura mas de un
  // pixel de scroll: atarla al cambio de frame la haria entrar a los saltos.
  if (idx !== current) {
    current = idx;
    const img = imgs[idx];
    if (img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    hud.textContent = 'frame ' + (idx + 1) + ' / ' + SRC.length;
  }
  drawCotas(idx, p);
}

const redraw = () => { current = -1; draw() };
document.getElementById('units').onclick = (e) => {
  metric = !metric; e.target.textContent = metric ? 'pulgadas' : 'milímetros'; redraw();
};
document.getElementById('toggle').onclick = (e) => {
  showCotas = !showCotas; e.target.textContent = showCotas ? 'ocultar cotas' : 'mostrar cotas'; redraw();
};
const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw) };
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
imgs[0].decode().then(redraw).catch(redraw);
</script>
`

writeFileSync(outHtml, html)
console.log(outHtml)
