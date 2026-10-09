/* UI kit: icons, small components, charts, modal, drawer, toast. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => DB.money(n);
const fmtDate = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const fmtDateY = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.2a3.2 3.2 0 010 5.6"/><path d="M18 14.8c2 .7 3.5 2.4 3.5 5.2"/>',
  userplus: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M19 8v6M16 11h6"/>',
  book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5"/><path d="M9 7h6"/>',
  check: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M9 15l2 2 4-4"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5"/>',
  wallet: '<path d="M3 7a2 2 0 012-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16.5" cy="13.5" r="1.2"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2"/><path d="M3 13h18"/>',
  message: '<path d="M4 5h16v11H9l-5 4z"/>',
  library: '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/>',
  heart: '<path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0112 7a4.5 4.5 0 018 2.5C20 15.4 12 20 12 20z"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5M12 16V7M16 16v-3"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  bell: '<path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 21h4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  print: '<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  send: '<path d="M21 3L3 11l7 3 3 7z"/><path d="M10 14l11-11"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  idcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.5 1.7-2.2 3-2.2s2.5.7 3 2.2M14 10h4M14 13h3"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
  database: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  wifi: '<path d="M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0"/><path d="M12 19.5v.01"/>',
};
const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

const chip = (t, tone = 'neutral') => `<span class="chip chip-${tone}">${esc(t)}</span>`;
const hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const initials = n => n.replace(/^(Mr\.|Mrs\.|Miss|Alhaji|Alhaja|Malam)\s+/, '').split(' ').map(w => w[0]).slice(0, 2).join('');
const avatar = (n, size = '') => `<span class="avatar ${size}" style="--h:${hue(n)}">${esc(initials(n))}</span>`;
const person = (n, sub) => `<div class="person">${avatar(n)}<div><div class="p-name">${esc(n)}</div>${sub ? `<div class="p-sub">${esc(sub)}</div>` : ''}</div></div>`;
const gradeTone = g => g[0] === 'A' ? 'ok' : g[0] === 'B' ? 'ok' : g[0] === 'C' ? 'info' : g[0] === 'D' || g[0] === 'E' ? 'warn' : 'bad';
const stageTone = s => ({ Draft: 'neutral', Submitted: 'warn', Approved: 'info', Published: 'ok' }[s] || 'neutral');

function on(el, type, sel, fn) { el.addEventListener(type, e => { const t = e.target.closest(sel); if (t && el.contains(t)) fn(t, e); }); }
function tabs(items, active) { return `<div class="tabs" role="tablist">${items.map(([k, l]) => `<button role="tab" class="tab ${k === active ? 'on' : ''}" aria-selected="${k === active}" data-tab="${k}">${esc(l)}</button>`).join('')}</div>`; }
function pageHead(title, sub, actions = '') { return `<div class="page-head"><div><h1>${esc(title)}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div><div class="head-actions">${actions}</div></div>`; }
function empty(title, text, action = '') { return `<div class="empty"><div class="empty-ico">${ico('box')}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`; }
function kpi(label, value, hint, tone = '', icon = '') { return `<div class="kpi ${tone}">${icon ? `<span class="kpi-ico">${ico(icon)}</span>` : ''}<div class="kpi-v">${value}</div><div class="kpi-l">${esc(label)}</div>${hint ? `<div class="kpi-h">${hint}</div>` : ''}</div>`; }
function bar(pct, tone = '') { return `<div class="bar ${tone}" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`; }

/* ---------- Charts (inline SVG, no libraries) ---------- */
function columns(items, { h = 170, unit = '' } = {}) {
  const max = Math.max(...items.map(i => i.v)) * 1.15 || 1, w = 100 / items.length;
  return `<div class="cols" style="height:${h}px">${items.map(i => `<div class="col" style="width:${w}%"><div class="col-v">${i.v}${unit}</div><div class="col-b" style="height:${(i.v / max) * (h - 44)}px;background:${i.c || 'var(--brand)'}"></div><div class="col-l">${esc(i.l)}</div></div>`).join('')}</div>`;
}
function area(vals, labels, { h = 190, fmt = v => v } = {}) {
  const W = 600, H = h, px = 30, py = 20, max = Math.max(...vals) * 1.15 || 1, n = vals.length;
  const pts = vals.map((v, i) => [px + (W - 2 * px) * (n === 1 ? .5 : i / (n - 1)), H - 26 - (v / max) * (H - 26 - py)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const fill = line + ` L${pts[n - 1][0]} ${H - 26} L${pts[0][0]} ${H - 26} Z`;
  const grid = [0, .5, 1].map(t => { const y = H - 26 - t * (H - 26 - py); return `<line x1="0" x2="${W}" y1="${y}" y2="${y}" class="gridl"/><text x="${W}" y="${y - 4}" text-anchor="end" class="axis">${fmt(Math.round(max * t))}</text>`; }).join('');
  return `<svg class="area" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend chart"><defs><linearGradient id="ag" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--brand)" stop-opacity=".28"/><stop offset="1" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${fill}" fill="url(#ag)"/><path d="${line}" fill="none" stroke="var(--brand)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === n - 1 ? 4.5 : 3}" fill="${i === n - 1 ? 'var(--gold)' : 'var(--surface)'}" stroke="var(--brand)" stroke-width="2"><title>${labels[i]}: ${fmt(vals[i])}</title></circle>`).join('')}${labels.map((l, i) => `<text x="${pts[i][0]}" y="${H - 6}" text-anchor="middle" class="axis">${l}</text>`).join('')}</svg>`;
}
function donut(segs, center = '', sub = '') {
  const tot = segs.reduce((a, s) => a + s.v, 0) || 1, r = 38, C = 2 * Math.PI * r; let off = 0;
  return `<div class="donut"><svg viewBox="0 0 100 100" role="img"><circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--line)" stroke-width="12"/>${segs.map(s => { const len = s.v / tot * C, el = `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${s.c}" stroke-width="12" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 50 50)"><title>${s.l}: ${s.v}</title></circle>`; off += len; return el; }).join('')}<text x="50" y="${sub ? 50 : 55}" text-anchor="middle" class="d-big">${center}</text>${sub ? `<text x="50" y="64" text-anchor="middle" class="d-sub">${sub}</text>` : ''}</svg><ul class="legend">${segs.map(s => `<li><i style="background:${s.c}"></i>${esc(s.l)}<b>${s.v}</b></li>`).join('')}</ul></div>`;
}
function spark(vals, w = 90, h = 28) {
  const max = Math.max(...vals), min = Math.min(...vals), pts = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - 3 - ((v - min) / ((max - min) || 1)) * (h - 6)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function qr(seed, size = 84) {
  let h = 2166136261; for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const n = 21, cells = []; let x = h >>> 0;
  const finder = (i, j) => (i < 7 && j < 7) || (i < 7 && j > 13) || (i > 13 && j < 7);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    let on_;
    if (finder(i, j)) { const a = i > 13 ? i - 14 : i, b = j > 13 ? j - 14 : j; on_ = a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4); }
    else { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; on_ = (x >>> 0) % 100 < 48; }
    if (on_) cells.push(`<rect x="${j}" y="${i}" width="1.02" height="1.02"/>`);
  }
  return `<svg class="qr" viewBox="0 0 21 21" width="${size}" height="${size}" fill="currentColor" shape-rendering="crispEdges" aria-label="Demo QR code">${cells.join('')}</svg>`;
}

/* ---------- Toast, modal, drawer ---------- */
function toast(msg, tone = 'ok') {
  const box = $('#toasts'), t = document.createElement('div');
  t.className = 'toast t-' + tone; t.setAttribute('role', 'status');
  t.innerHTML = `${ico(tone === 'bad' ? 'alert' : 'ok')}<span>${esc(msg)}</span>`;
  box.appendChild(t); setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 250); }, 3400);
}
let lastFocus = null;
function openModal({ title, html, size = '', foot = [], mount, kind = 'modal' }) {
  lastFocus = document.activeElement;
  const root = $('#overlay-root'), wrap = document.createElement('div');
  wrap.className = 'overlay ' + (kind === 'drawer' ? 'is-drawer' : '');
  wrap.innerHTML = `<div class="scrim" data-close></div><section class="${kind} ${size}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="m-head"><h2>${esc(title)}</h2><button class="icon-btn no-print" data-close aria-label="Close">${ico('x')}</button></header><div class="m-body">${html}</div>${foot.length ? `<footer class="m-foot no-print">${foot.map((f, i) => `<button class="btn ${f.cls || ''}" data-foot="${i}">${f.icon ? ico(f.icon) : ''}${esc(f.label)}</button>`).join('')}</footer>` : ''}</section>`;
  root.appendChild(wrap);
  const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); lastFocus && lastFocus.focus && lastFocus.focus(); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  wrap.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); const f = e.target.closest('[data-foot]'); if (f) { const r = foot[+f.dataset.foot].onClick?.(wrap, close); if (r !== false && foot[+f.dataset.foot].close !== false) close(); } });
  mount && mount(wrap, close);
  const first = $('input,select,textarea,button:not([data-close])', $('.m-body', wrap)) || $('[data-close]', wrap); first && first.focus();
  return { el: wrap, close };
}
const openDrawer = o => openModal({ ...o, kind: 'drawer' });
const field = (label, input, hint = '') => `<label class="field"><span>${esc(label)}</span>${input}${hint ? `<small>${hint}</small>` : ''}</label>`;
const select = (id, opts, val) => `<select id="${id}">${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${v === val ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
function confirmBox(title, text, okLabel, fn) { return openModal({ title, html: `<p class="lead">${esc(text)}</p>`, foot: [{ label: 'Cancel', cls: 'ghost' }, { label: okLabel, cls: 'primary', onClick: fn }] }); }
function download(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500); }
function csv(rows) { return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'); }
