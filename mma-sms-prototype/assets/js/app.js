/* App shell: state, navigation, router, role preview, theme, search, notifications. */
var Views = window.Views = window.Views || {};
const S = window.S = {
  role: 'admin',
  child: DB.CHILDREN[0],
  names: { admin: 'Mrs. Rukayat Abdullahi', teacher: 'Mr. Ojima Adejoh', parent: 'Mrs. Hauwa Salami' },
  roleLabel: { admin: 'Principal', teacher: 'Teacher', parent: 'Parent' },
  who() { return this.names[this.role]; },
  go(id) { location.hash = '#/' + id; },
  teacherClass: 'JS2',
};
const NAV = [
  { g: 'Overview', items: [['dashboard', 'Dashboard', 'home', ['admin', 'teacher', 'parent']]] },
  { g: 'People', items: [['admissions', 'Admissions', 'userplus', ['admin']], ['students', 'Students', 'users', ['admin', 'teacher']], ['staff', 'Staff and payroll', 'briefcase', ['admin']]] },
  { g: 'Learning', items: [['academics', 'Academics', 'book', ['admin', 'teacher']], ['attendance', 'Attendance', 'check', ['admin', 'teacher', 'parent']], ['results', 'Results', 'award', ['admin', 'teacher', 'parent']]] },
  { g: 'Money', items: [['fees', 'Fees and finance', 'wallet', ['admin', 'parent']]] },
  { g: 'Community', items: [['comms', 'Messages and notices', 'message', ['admin', 'teacher', 'parent']]] },
  { g: 'Services', items: [['library', 'Library', 'library', ['admin']], ['health', 'Health and welfare', 'heart', ['admin']], ['inventory', 'Inventory and stores', 'box', ['admin']]] },
  { g: 'Administration', items: [['reports', 'Reports and settings', 'chart', ['admin']]] },
];
const PARENT_LABELS = { results: 'Report cards', fees: 'Fees', comms: 'Notices', attendance: 'Attendance' };
const currentId = () => (location.hash.replace(/^#\//, '') || 'dashboard').split('?')[0];
const allowed = id => NAV.some(g => g.items.some(i => i[0] === id && i[3].includes(S.role)));

function badge(id) {
  if (S.role !== 'admin') return 0;
  if (id === 'admissions') return DB.APPLICANTS.filter(a => a.stage === 'Applied').length;
  if (id === 'results') return Object.values(DB.RESULT_STATUS).filter(s => s === 'Submitted').length;
  return 0;
}
function drawNav() {
  const cur = currentId();
  $('#nav').innerHTML = NAV.map(g => {
    const items = g.items.filter(i => i[3].includes(S.role));
    if (!items.length) return '';
    return `<div class="nav-group">${g.g}</div>` + items.map(i => { const b = badge(i[0]); const label = S.role === 'parent' && PARENT_LABELS[i[0]] ? PARENT_LABELS[i[0]] : i[1]; return `<a href="#/${i[0]}" class="${i[0] === cur ? 'on' : ''}" ${i[0] === cur ? 'aria-current="page"' : ''}>${ico(i[2])}<span>${label}</span>${b ? `<span class="badge">${b}</span>` : ''}</a>`; }).join('');
  }).join('');
}
function drawRoles() {
  $('#roleseg').innerHTML = ['admin', 'teacher', 'parent'].map(r => `<button data-role="${r}" aria-pressed="${S.role === r}">${r === 'admin' ? 'Admin' : r === 'teacher' ? 'Teacher' : 'Parent'}</button>`).join('');
}
function drawTop() {
  $('#termpill').innerHTML = `<span>${DB.SESSION}</span><b>${DB.TERM}, week ${DB.WEEK}</b>`;
  $('#menu-btn').innerHTML = ico('menu'); $('#bell').innerHTML = ico('bell') + '<i class="dot"></i>';
  setThemeIcon();
}
function setThemeIcon() { $('#theme').innerHTML = ico(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon'); }

let routeEl = null;
function render(keepScroll) {
  let id = currentId();
  if (!Views[id]) id = 'dashboard';
  if (!allowed(id)) { id = 'dashboard'; if (location.hash !== '#/dashboard') history.replaceState(null, '', '#/dashboard'); }
  const y = window.scrollY, main = $('#view');
  routeEl = document.createElement('div'); routeEl.className = 'view';
  main.replaceChildren(routeEl);
  try { Views[id](routeEl); }
  catch (err) { console.error(err); routeEl.innerHTML = `<div class="note bad">${ico('alert')}<div><b>This screen failed to load.</b><br>${esc(err.message)}</div></div>`; }
  drawNav(); document.title = (NAV.flatMap(g => g.items).find(i => i[0] === id) || ['', 'Dashboard'])[1] + ' | Mubarak Model Academy';
  if (keepScroll) window.scrollTo(0, y); else { window.scrollTo(0, 0); }
  document.body.classList.remove('nav-open');
}
const rerender = () => render(true);

/* ---- events ---- */
window.addEventListener('hashchange', () => render(false));
$('#menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
$('#scrim-side').addEventListener('click', () => document.body.classList.remove('nav-open'));
$('#theme').addEventListener('click', () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('mma-theme', t); } catch (e) {} setThemeIcon(); });
on($('#roleseg'), 'click', '[data-role]', b => {
  S.role = b.dataset.role; drawRoles(); S.child = DB.CHILDREN[0];
  const desc = { admin: 'Principal view: everything in the school.', teacher: 'Teacher view: your classes and registers.', parent: 'Parent view: your children only.' };
  toast(desc[S.role]); if (!allowed(currentId())) S.go('dashboard'); else render(false);
});
/* notifications */
const bell = $('#bell'), bpop = $('#bellpop');
bell.addEventListener('click', e => {
  e.stopPropagation();
  const open = bpop.hidden; bpop.hidden = !open; bell.setAttribute('aria-expanded', open);
  if (open) { const a = alerts().slice(0, 5); bpop.innerHTML = `<h4>Needs your attention</h4>` + (a.length ? a.map(x => `<div class="row">${ico(x.icon)}<div>${esc(x.text)}<small>${esc(x.sub)}</small></div></div>`).join('') : `<div class="row">Nothing waiting for you.</div>`); }
});
document.addEventListener('click', e => { if (!e.target.closest('#bellpop') && !e.target.closest('#bell')) { bpop.hidden = true; bell.setAttribute('aria-expanded', 'false'); } if (!e.target.closest('.search')) $('#gres').hidden = true; });
/* global search */
const gs = $('#gsearch'), gres = $('#gres');
gs.addEventListener('input', () => {
  const q = gs.value.trim().toLowerCase(); if (q.length < 2) { gres.hidden = true; return; }
  let res = [];
  if (S.role !== 'parent') {
    DB.STUDENTS.filter(s => (S.role !== 'teacher' || s.classId === S.teacherClass) && (s.name.toLowerCase().includes(q) || s.adm.toLowerCase().includes(q))).slice(0, 6).forEach(s => res.push({ n: s.name, sub: `${DB.cls(s.classId).name} · ${s.adm}`, fn: () => openStudent(s.id) }));
    if (S.role === 'admin') DB.STAFF.filter(s => s.name.toLowerCase().includes(q)).slice(0, 3).forEach(s => res.push({ n: s.name, sub: s.role, fn: () => S.go('staff') }));
  }
  gres.hidden = false; gres.innerHTML = res.length ? res.map((r, i) => `<button data-i="${i}">${avatar(r.n)}<span><b>${esc(r.n)}</b><br><small class="dim">${esc(r.sub)}</small></span></button>`).join('') : `<div class="none">No match for "${esc(gs.value)}". Try a first name or an admission number.</div>`;
  gres._res = res;
});
on(gres, 'click', 'button[data-i]', b => { gres._res[+b.dataset.i].fn(); gres.hidden = true; gs.value = ''; });
document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); gs.focus(); } });

drawRoles(); drawTop();
if (!location.hash) history.replaceState(null, '', '#/dashboard');
render(false);
