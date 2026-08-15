/* ============================================================
   mol-render.js — gerador simples de fórmulas estruturais (SVG)
   Desenha cadeias em ziguezague (convenção de fórmula em bastão)
   com rótulos de heteroátomos e ramificações (grupos funcionais).
   Sem dependências externas — 100% offline.
   ============================================================ */

function molVertex(i){
  const x = 26 + i * 36;
  const y = (i % 2 === 0) ? 78 : 46;
  return [x, y];
}

function molBondLines(p1, p2, order){
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  const len = Math.sqrt(dx*dx + dy*dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const off = 3.4;
  let out = "";
  const line = (a, b) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`;
  if (order === 1){
    out += line(p1, p2);
  } else if (order === 2){
    out += line(p1, p2);
    const a = [p1[0] + nx*off, p1[1] + ny*off];
    const b = [p2[0] + nx*off, p2[1] + ny*off];
    out += line(a, b);
  } else if (order === 3){
    out += line(p1, p2);
    out += line([p1[0]+nx*off, p1[1]+ny*off], [p2[0]+nx*off, p2[1]+ny*off]);
    out += line([p1[0]-nx*off, p1[1]-ny*off], [p2[0]-nx*off, p2[1]-ny*off]);
  }
  return out;
}

function molLabel(p, text){
  const w = 12 + text.length * 8;
  const h = 20;
  return `
    <rect x="${(p[0]-w/2).toFixed(1)}" y="${(p[1]-h/2).toFixed(1)}" width="${w}" height="${h}" rx="4" fill="var(--surface-2)"/>
    <text x="${p[0].toFixed(1)}" y="${(p[1]+5).toFixed(1)}" text-anchor="middle" font-size="15" font-family="var(--font-mono)" fill="currentColor">${text}</text>`;
}

/* Gera SVG de uma cadeia principal em ziguezague.
   chain: [{ label: null|string }]  — um item por átomo da cadeia (null = carbono implícito)
   bonds: [order,...] — ordem de ligação entre átomos consecutivos (length = chain.length-1)
   branches: [{ from: idx, dir: -1|1, order: 1|2, label: string }] — ramificações (grupos funcionais)
*/
function renderChainSVG(chain, bonds, branches){
  branches = branches || [];
  const pts = chain.map((_, i) => molVertex(i));
  const W = 26 + (chain.length) * 36 + 20;
  const H = 130;

  let body = "";
  for (let i = 0; i < bonds.length; i++){
    body += molBondLines(pts[i], pts[i+1], bonds[i]);
  }
  branches.forEach(b => {
    const p0 = pts[b.from];
    const p1 = [p0[0], p0[1] + b.dir * 34];
    body += molBondLines(p0, p1, b.order || 1);
    body += molLabel(p1, b.label);
  });
  chain.forEach((atom, i) => {
    if (atom.label) body += molLabel(pts[i], atom.label);
  });

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="mol-svg">${body}</svg>`;
}

/* Gera SVG de um anel benzênico (hexágono) com substituinte opcional. */
function renderBenzeneSVG(substituentLabel){
  const cx = 90, cy = 82, r = 38;
  const angles = [-90, -30, 30, 90, 150, 210].map(a => a * Math.PI / 180);
  const pts = angles.map(a => [cx + r*Math.cos(a), cy + r*Math.sin(a)]);
  const doubleEdges = [0, 2, 4]; // alternating edges get the inner Kekulé line
  let body = "";
  const line = (a, b) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`;
  for (let i = 0; i < 6; i++){
    const p1 = pts[i], p2 = pts[(i+1) % 6];
    body += line(p1, p2);
    if (doubleEdges.includes(i)){
      // shorter inner line parallel to the edge, offset toward the ring center
      const inset = 0.72;
      const q1 = [cx + (p1[0]-cx)*inset, cy + (p1[1]-cy)*inset];
      const q2 = [cx + (p2[0]-cx)*inset, cy + (p2[1]-cy)*inset];
      const shrink = 0.18;
      const r1 = [q1[0] + (q2[0]-q1[0])*shrink, q1[1] + (q2[1]-q1[1])*shrink];
      const r2 = [q2[0] + (q1[0]-q2[0])*shrink, q2[1] + (q1[1]-q2[1])*shrink];
      body += line(r1, r2);
    }
  }
  if (substituentLabel){
    const top = pts[0];
    const tip = [top[0], top[1] - 26];
    body += line(top, tip);
    body += molLabel(tip, substituentLabel);
  }
  return `<svg viewBox="0 0 180 150" xmlns="http://www.w3.org/2000/svg" class="mol-svg">${body}</svg>`;
}
