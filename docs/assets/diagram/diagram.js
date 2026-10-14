document$.subscribe(async () => {
  const wrapper = document.querySelector('.uml-wrapper[data-src]');
  if (!wrapper || wrapper.querySelector('svg')) return;

  const [svgText, uxfText] = await Promise.all([
    fetch(wrapper.dataset.src).then(r => r.text()),
    fetch(wrapper.dataset.uxf).then(r => r.text()),
  ]);
  wrapper.insertAdjacentHTML('afterbegin', svgText);
  const svg = wrapper.querySelector('svg');
  const NS = 'http://www.w3.org/2000/svg';

  const DX = -11, DY = -5;
  const norm = s => (s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

  // --- 1. Legge il .uxf (posizioni + testi delle relazioni) ---------------
  const num = (el, tag) => +el.querySelector(tag).textContent;
  const items = [...new DOMParser().parseFromString(uxfText, 'text/xml')
    .querySelectorAll('element')].map(el => {
      const type = el.querySelector('id').textContent;
      const x = num(el, 'x'), y = num(el, 'y'), w = num(el, 'w'), h = num(el, 'h');
      const pts = [], labels = [];
      if (type === 'Relation') {
        const a = el.querySelector('additional_attributes')?.textContent.split(';').map(Number) || [];
        for (let i = 0; i + 1 < a.length; i += 2) pts.push({ x: x + a[i], y: y + a[i + 1] });

        const attrs = el.querySelector('panel_attributes')?.textContent || '';
        attrs.split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
          const kv = line.match(/^(\w+)=(.*)$/);
          if (!kv) {
              const clean = line.replace(/^\s*[<>]\s*/, '').replace(/\s+[v^]\s*$|\s*[<>]\s*$/, '');
              labels.push({ str: norm(clean), at: 'mid' });
              return;
          }
          const at = { m1: 'start', r1: 'start', q1: 'start',
                       m2: 'end',   r2: 'end',   q2: 'end' }[kv[1]];
          if (at && kv[2].trim()) labels.push({ str: norm(kv[2]), at });
        });
      }
      return { type, x, y, w, h, pts, labels, cx: x + w / 2, cy: y + h / 2 };
    });

  const relations = items.filter(i => i.type === 'Relation');
  const classes = items.filter(i => i.type !== 'Relation' && i.type !== 'UMLNote' && i.type !== 'Text');

  // --- 2. Allinea coordinate .uxf e SVG ------------------------------------
  const ux = Math.min(...items.map(i => Math.min(i.x, ...i.pts.map(p => p.x))));
  const uy = Math.min(...items.map(i => Math.min(i.y, ...i.pts.map(p => p.y))));
  const bb = svg.getBBox();
  const OX = bb.x - ux + DX, OY = bb.y - uy + DY;

  classes.forEach(c => { c.x += OX; c.y += OY; });
  relations.forEach(r => r.pts.forEach(p => { p.x += OX; p.y += OY; }));

  // --- 3. Chi è collegato a chi ---------------------------------------------
  const TOL = 12;
  const near = (p, c) => p.x >= c.x - TOL && p.x <= c.x + c.w + TOL &&
                         p.y >= c.y - TOL && p.y <= c.y + c.h + TOL;
  relations.forEach(r => {
    const ends = [r.pts[0], r.pts[r.pts.length - 1]].filter(Boolean);
    r.linked = [...new Set(ends.flatMap(p => classes.filter(c => near(p, c))))];
  });

  // --- 4. Trova nell'SVG le etichette di ogni relazione ----------------------
  const inv = svg.getScreenCTM().inverse();
  const texts = [...svg.querySelectorAll('text')].map(el => {
    const m = inv.multiply(el.getScreenCTM());
    const b = el.getBBox();
    const p = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]
      .map(([x, y]) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; return q.matrixTransform(m); });
    const xs = p.map(q => q.x), ys = p.map(q => q.y);
    const x = Math.min(...xs), y = Math.min(...ys);
    return { str: norm(el.textContent), x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  }).filter(t => t.str)
    .filter(t => !classes.some(c => t.x + t.w / 2 > c.x && t.x + t.w / 2 < c.x + c.w &&
                                     t.y + t.h / 2 > c.y && t.y + t.h / 2 < c.y + c.h));

  const dPt = (t, p) => Math.hypot(t.x + t.w / 2 - p.x, t.y + t.h / 2 - p.y);
  const dSeg = (t, a, b) => {
    const px = t.x + t.w / 2, py = t.y + t.h / 2;
    const vx = b.x - a.x, vy = b.y - a.y, len2 = vx * vx + vy * vy || 1;
    const k = Math.max(0, Math.min(1, ((px - a.x) * vx + (py - a.y) * vy) / len2));
    return Math.hypot(px - (a.x + k * vx), py - (a.y + k * vy));
  };
  const dLine = (t, pts) => Math.min(...pts.slice(1).map((p, i) => dSeg(t, pts[i], p)));

const MAXD = 45;
relations.forEach(r => { r.textBoxes = []; });

const cand = [];
relations.forEach((r, ri) => {
  if (!r.pts.length) return;
  r.labels.forEach((lab, li) => {
    const limit = lab.at === 'mid' ? 150 : MAXD;
    texts.forEach(t => {
      if (t.str !== lab.str) return;
      const d = lab.at === 'start' ? dPt(t, r.pts[0])
              : lab.at === 'end'   ? dPt(t, r.pts[r.pts.length - 1])
              : Math.min(dLine(t, r.pts), dPt(t, { x: r.cx, y: r.cy }));
      if (d < limit) cand.push({ r, key: ri + '-' + li, t, d });
    });
  });
});

cand.sort((a, b) => a.d - b.d);
const usedText = new Set(), usedLabel = new Set();
cand.forEach(({ r, key, t }) => {
  if (usedText.has(t) || usedLabel.has(key)) return;
  usedText.add(t); usedLabel.add(key);
  r.textBoxes.push(t);
});

relations.forEach((r, ri) => r.labels.forEach((lab, li) => {
  if (!usedLabel.has(ri + '-' + li)) console.warn('Etichetta non trovata:', lab.str, r);
}));

  // --- 5. Overlay -----------------------------------------------------------
  const fx  = document.createElementNS(NS, 'g'); fx.style.pointerEvents = 'none';
  const hit = document.createElementNS(NS, 'g');
  svg.append(fx, hit);

  const el = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  };
  const box = (c, attrs = {}, pad = 0) =>
    el('rect', { x: c.x - pad, y: c.y - pad, width: c.w + 2 * pad, height: c.h + 2 * pad, ...attrs });
  const reset = () => fx.replaceChildren();

  function select(cls) {
    reset();
    const links = relations.filter(r => r.linked.includes(cls));
    const keep = [cls, ...new Set(links.flatMap(r => r.linked).filter(c => c !== cls))];
    const labels = links.flatMap(r => r.textBoxes);

    const pad = 4000, area = { x: bb.x - pad, y: bb.y - pad, w: bb.width + 2 * pad, h: bb.height + 2 * pad };
    const mask = el('mask', { id: 'uml-mask', maskUnits: 'userSpaceOnUse',
                              x: area.x, y: area.y, width: area.w, height: area.h });
    mask.append(box(area, { fill: '#fff' }));
    keep.forEach(c => mask.append(box(c, { fill: '#000' })));
    labels.forEach(t => mask.append(box(t, { fill: '#000' }, 2)));

    const veil = box(area, { mask: 'url(#uml-mask)' });
    veil.style.fill = 'var(--md-default-bg-color)';
    veil.style.opacity = '.85';
    fx.append(mask, veil);

    // alone sulle etichette
    labels.forEach(t => fx.append(box(t, { fill: '#007acc', 'fill-opacity': .15, rx: 2 }, 2)));

    links.forEach(r => fx.append(el('polyline', {
      points: r.pts.map(p => `${p.x},${p.y}`).join(' '),
      fill: 'none', stroke: '#007acc', 'stroke-width': 3 })));

    keep.forEach(c => fx.append(box(c, {
      fill: 'none', 'stroke-width': 4, stroke: c === cls ? '#007acc' : '#4caf50' })));
  }

  classes.forEach(c => {
    const h = box(c, { fill: 'transparent' });
    h.style.cursor = 'pointer';
    h.addEventListener('click', e => { e.stopPropagation(); select(c); });
    hit.append(h);
  });
  svg.addEventListener('click', reset);
  wrapper.querySelector('#uml-reset')?.addEventListener('click', reset);

  wrapper.querySelector('#uml-full')?.addEventListener('click', () => {
  document.fullscreenElement ? document.exitFullscreen() : wrapper.requestFullscreen();
});

  // --- 6. Pan & zoom --------------------------------------------------------
  const pz = Panzoom(svg, { maxScale: 10, minScale: 1 });
  svg.addEventListener('pointerdown', (e) => {
    if (e.button === 0) {
      e.stopImmediatePropagation();
    }
  }, true);
  wrapper.addEventListener('wheel', pz.zoomWithWheel);
});