var Views = window.Views = window.Views || {};
window.HOLD = { on: false };

function remarkFor(avg) { return avg >= 70 ? 'An excellent result. Keep it up.' : avg >= 60 ? 'A very good performance. Aim higher next term.' : avg >= 50 ? 'A fair result. More effort will bring improvement.' : avg >= 40 ? 'Needs to work harder, especially in the weaker subjects.' : 'Serious improvement is needed. Parents are invited to see the class teacher.'; }

/* Last term's report data for one pupil (position is worked out among today's classmates). */
function reportData(sid) {
  const s = DB.STUDENTS.find(x => x.id === sid), p = DB.PREV[sid]; if (!p) return null;
  const prevClass = DB.cls(p.classId), cohort = DB.studentsIn(s.classId).filter(x => DB.PREV[x.id]);
  if (p.skills) {
    const sc = x => Object.values(DB.PREV[x.id].skills).reduce((a, b) => a + b, 0) / DB.SKILLS.length / 4 * 100;
    const ranked = cohort.map(x => ({ id: x.id, v: sc(x) })).sort((a, b) => b.v - a.v);
    return { nursery: true, prevClass, skills: p.skills, avg: Math.round(sc(s)), pos: ranked.findIndex(r => r.id === sid) + 1, size: cohort.length };
  }
  const tot = x => Object.values(DB.PREV[x.id].scores).reduce((a, r) => a + DB.total(r), 0);
  const ranked = cohort.map(x => ({ id: x.id, t: tot(x) })).sort((a, b) => b.t - a.t);
  const rows = Object.entries(p.scores).map(([sub, r]) => { const t = DB.total(r), all = cohort.map(x => DB.total(DB.PREV[x.id].scores[sub])); return { sub, ...r, total: t, g: DB.grade(t), classAvg: Math.round(all.reduce((a, b) => a + b, 0) / all.length) }; });
  const total = rows.reduce((a, r) => a + r.total, 0);
  return { rows, total, avg: Math.round(total / rows.length), pos: ranked.findIndex(r => r.id === sid) + 1, size: cohort.length, prevClass };
}

function reportCardHtml(sid) {
  const s = DB.STUDENTS.find(x => x.id === sid), rd = reportData(sid), c = DB.cls(s.classId);
  if (!rd) return empty('No earlier report', s.name + ' joined this session, so there is no last-term report. The first report appears after this term\'s examinations.');
  const head = `<div class="rc-head"><svg viewBox="0 0 48 48" width="46" height="46"><rect width="48" height="48" rx="12" fill="#D99A1E"/><g fill="none" stroke="#0A3F35" stroke-width="2.6"><rect x="13" y="13" width="22" height="22"/><rect x="13" y="13" width="22" height="22" transform="rotate(45 24 24)"/></g></svg><div><h3>Mubarak Model Academy</h3><p>Ege, Adavi LGA, Okene, Kogi State. ${rd.nursery ? 'Nursery' : DB.secOf(rd.prevClass.id)} section report</p></div></div>
  <div class="rc-meta"><div><b>Name:</b> ${esc(s.name)}</div><div><b>Admission no.:</b> ${s.adm}</div><div><b>Class then:</b> ${rd.prevClass.name}</div><div><b>Term:</b> Third term 2025/2026</div><div><b>Attendance:</b> ${s.att}%</div><div><b>Next term began:</b> 7 Sep 2026</div></div>`;
  const rem = remarkFor(rd.avg), t = DB.teacherOf(c.teacher);
  if (rd.nursery) return `<div class="rc">${head}<table><thead><tr><th>Skill</th><th class="n" style="width:200px">Rating</th></tr></thead><tbody>${DB.SKILLS.map(k => `<tr><td>${k}</td><td class="n">${DB.RATINGS[rd.skills[k]]}</td></tr>`).join('')}</tbody></table><div class="rc-sum"><div><b>${rd.avg}%</b>Overall skills score</div><div><b>${rd.pos} of ${rd.size}</b>Position in group</div></div><p style="font-size:13.5px"><b>Teacher's comment:</b> ${esc(rd.avg >= 70 ? 'A happy, curious child who joins in well with others.' : 'Is growing in confidence. More practice with counting and letters at home will help.')}</p><div class="rc-sign"><div>${esc(t.name)}, class teacher</div><div>Head of Nursery</div><div>Parent</div></div></div>`;
  return `<div class="rc">${head}<table><thead><tr><th>Subject</th><th class="n">CA 1<br>20</th><th class="n">CA 2<br>20</th><th class="n">Exam<br>60</th><th class="n">Total<br>100</th><th class="n">Grade</th><th class="n">Class avg</th><th>Remark</th></tr></thead><tbody>${rd.rows.map(r => `<tr><td>${r.sub}</td><td class="n">${r.ca1}</td><td class="n">${r.ca2}</td><td class="n">${r.exam}</td><td class="n"><b>${r.total}</b></td><td class="n"><b>${r.g[1]}</b></td><td class="n">${r.classAvg}</td><td>${r.g[2]}</td></tr>`).join('')}</tbody></table>
  <div class="rc-sum"><div><b>${rd.total}</b>Total score</div><div><b>${rd.avg}%</b>Average</div><div><b>${rd.pos} of ${rd.size}</b>Position in class</div></div><p style="font-size:13.5px"><b>Class teacher:</b> ${rem}<br><b>Principal:</b> ${rd.avg >= 50 ? 'Promoted. Well done.' : 'To repeat unless the review panel decides otherwise.'}</p><div class="rc-sign"><div>${esc(t.name)}, class teacher</div><div>Principal</div><div>Parent</div></div><p style="font-size:11.5px;color:#666;margin-top:10px">Grading: A1 75-100, B2 70-74, B3 65-69, C4 60-64, C5 55-59, C6 50-54, D7 45-49, E8 40-44, F9 below 40. Demo data.</p></div>`;
}

/* ================= Academics ================= */
Views.academics = function (el) {
  const teacher = S.role === 'teacher';
  let tab = 'classes', secF = 'All', ttClass = 'JS2';
  const CAP = { Nursery: 25, Primary: 30, Secondary: 35 };
  const clashes = () => { const out = []; DB.DAYS.forEach((d, di) => DB.PERIODS.forEach((p, pi) => { const seen = {}; ['JS1', 'JS2', 'JS3'].forEach(c => { const x = DB.TT[c][di][pi]; if (!x || x.brk) return; (seen[x.t] = seen[x.t] || []).push(c); }); Object.entries(seen).forEach(([t, cs]) => { if (cs.length > 1) out.push({ di, pi, t, cs }); }); })); return out; };
  const pages = {
    classes() {
      const list = DB.CLASSES.filter(c => secF === 'All' || c.sec === secF);
      return `<div class="pillbox" style="margin-bottom:16px" id="secf">${['All', 'Nursery', 'Primary', 'Secondary'].map(s => `<label><input type="radio" name="sf" value="${s}" ${s === secF ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div><div class="grid g3">${list.map(c => { const n = DB.studentsIn(c.id).length, t = DB.teacherOf(c.teacher); return `<div class="card"><div class="row"><h3 style="margin:0">${c.name}</h3><span class="sp">${chip(c.sec, c.sec === 'Nursery' ? 'warn' : c.sec === 'Primary' ? 'brand' : 'info')}</span></div><div class="row" style="margin:12px 0">${avatar(t.name)}<div><div class="p-name">${esc(t.name)}</div><div class="p-sub">Class teacher</div></div></div><div class="row small"><span>${n} pupils</span><span class="sp dim">Capacity ${CAP[c.sec]}</span></div>${bar(n / CAP[c.sec] * 100)}<div class="small dim" style="margin-top:10px">${DB.subjectsFor(c.id).length ? DB.subjectsFor(c.id).length + ' subjects' : 'Six skill areas, no scores'}</div></div>`; }).join('')}</div>`;
    },
    tt() {
      const cl = clashes(), T = DB.TT[ttClass];
      return `<div class="row wrap" style="margin-bottom:14px"><div class="pillbox" id="ttc">${['JS1', 'JS2', 'JS3'].map(c => `<label><input type="radio" name="tc" value="${c}" ${c === ttClass ? 'checked' : ''}><span>${DB.cls(c).name}</span></label>`).join('')}</div><span class="sp muted small">The demo builds timetables for the three JSS classes.</span></div>
      ${cl.length ? `<div class="note bad" style="margin-bottom:14px">${ico('alert')}<div><b>${cl.length} clash${cl.length > 1 ? 'es' : ''} found.</b> ${cl.map(x => `${esc(DB.teacherOf(x.t).name)} is in ${x.cs.map(c => DB.cls(c).name).join(' and ')} on ${DB.DAYS[x.di]} at ${DB.PERIODS[x.pi]}.`).join(' ')} Click the red lesson to change it.</div></div>` : `<div class="note" style="margin-bottom:14px;background:var(--ok-tint);color:var(--ok)">${ico('ok')}<div>No clashes. No teacher is booked in two places at once.</div></div>`}
      <div class="card" style="overflow-x:auto"><div class="tt"><div class="h"></div>${DB.DAYS.map(d => `<div class="h">${{ Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' }[d]}</div>`).join('')}${DB.PERIODS.map((p, pi) => `<div class="h num">${p}</div>` + DB.DAYS.map((d, di) => { const x = T[di][pi]; if (x.brk) return '<div class="brk">Break</div>'; const bad = cl.some(k => k.di === di && k.pi === pi && k.cs.includes(ttClass)); return `<button class="cellb ${bad ? 'clash' : ''}" data-di="${di}" data-pi="${pi}" ${teacher ? 'disabled' : ''}><b>${x.sub}</b><span>${esc(DB.teacherOf(x.t).name.replace(/^(Mr\.|Mrs\.|Miss|Malam)\s/, ''))}${bad ? ' (clash)' : ''}</span></button>`; }).join('')).join('')}</div></div>`;
    },
    notes() {
      const list = DB.NOTES.filter(n => !teacher || n.cls === S.teacherClass);
      return `<div class="card flat"><div class="card-head"><h3>Lesson notes and assignments</h3><button class="btn primary" id="addnote">${ico('upload')}Upload</button></div>${list.length ? `<table class="tbl"><thead><tr><th>Title</th><th>Class</th><th>Subject</th><th>Type</th><th>By</th><th>Due</th></tr></thead><tbody>${list.map(n => `<tr><td><b>${esc(n.title)}</b><div class="p-sub">Posted ${n.date}</div></td><td>${DB.cls(n.cls).name}</td><td>${n.sub}</td><td>${chip(n.type, n.type === 'Assignment' ? 'warn' : 'info')}</td><td>${esc(DB.teacherOf(n.by).name)}</td><td>${n.due || ''}</td></tr>`).join('')}</tbody></table>` : empty('Nothing uploaded yet', 'Upload a lesson note or assignment and pupils and parents will see it.')}</div>`;
    },
    promo() {
      return `<div class="note" style="margin-bottom:14px">${ico('alert')}<div>Promotion is run once, after third term examinations. This is a preview using last term's averages, so the principal can spot pupils who may need support early.</div></div><div class="row wrap" style="margin-bottom:14px"><select id="pcls" aria-label="Class">${DB.CLASSES.filter(c => c.id !== 'CR').map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select><button class="btn sp" disabled>${ico('lock')}Run promotion (opens in third term)</button></div><div id="pbody"></div>`;
    },
  };
  function promoBody(id) {
    const c = DB.cls(id), rows = DB.studentsIn(id).map(s => ({ s, rd: reportData(s.id) })), rec = r => !r.rd ? ['New pupil', 'neutral'] : r.rd.avg >= 50 ? ['Promote', 'ok'] : r.rd.avg >= 40 ? ['Review', 'warn'] : ['Repeat', 'bad'];
    const cnt = k => rows.filter(r => rec(r)[0] === k).length;
    $('#pbody', el).innerHTML = `<div class="kpi-strip" style="margin-bottom:14px;grid-template-columns:repeat(3,1fr)">${kpi('Likely to be promoted', cnt('Promote'), 'Average 50% or more')}${kpi('Need a review', cnt('Review'), 'Average 40 to 49%')}${kpi('At risk of repeating', cnt('Repeat'), 'Average below 40%')}</div><div class="card flat"><table class="tbl"><thead><tr><th>Pupil</th><th class="r">Last term average</th><th class="r">Attendance</th><th>Suggested</th><th>Goes to</th></tr></thead><tbody>${rows.map(r => `<tr><td>${person(r.s.name, r.s.adm)}</td><td class="r num">${r.rd ? r.rd.avg + '%' : 'No report'}</td><td class="r num">${r.s.att}%</td><td>${chip(...rec(r))}</td><td>${rec(r)[0] === 'Repeat' ? c.name : c.next ? DB.cls(c.next).name : 'Graduates'}</td></tr>`).join('')}</tbody></table></div>`;
  }
  const tabsList = teacher ? [['classes', 'Classes'], ['tt', 'Timetable'], ['notes', 'Notes and assignments']] : [['classes', 'Classes'], ['tt', 'Timetable'], ['notes', 'Notes and assignments'], ['promo', 'Promotion']];
  function draw() { el.innerHTML = pageHead('Academics', 'Classes, timetables, lesson material and promotion.') + tabs(tabsList, tab) + pages[tab](); if (tab === 'promo') { promoBody($('#pcls', el).value); } }
  draw();
  on(el, 'click', '.tab', b => { tab = b.dataset.tab; draw(); });
  el.addEventListener('change', e => { if (e.target.name === 'sf') { secF = e.target.value; draw(); } if (e.target.name === 'tc') { ttClass = e.target.value; draw(); } if (e.target.id === 'pcls') promoBody(e.target.value); });
  on(el, 'click', '.cellb', b => {
    const di = +b.dataset.di, pi = +b.dataset.pi, x = DB.TT[ttClass][di][pi], ts = DB.STAFF.filter(s => /teacher/i.test(s.role));
    openModal({ title: `${DB.cls(ttClass).name}, ${DB.DAYS[di]} at ${DB.PERIODS[pi]}`, html: `<div class="form-grid">${field('Subject', select('t-sub', DB.SUBJECTS.JSS, x.sub))}${field('Teacher', select('t-t', ts.map(s => [s.id, s.name]), x.t))}</div><p class="small dim" style="margin-top:12px">The timetable checks for clashes as soon as you save.</p>`, foot: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Save lesson', cls: 'primary', onClick: w => { DB.TT[ttClass][di][pi] = { sub: $('#t-sub', w).value, t: $('#t-t', w).value }; const n = clashes().length; DB.audit('Changed timetable', DB.cls(ttClass).name + ' ' + DB.DAYS[di] + ' ' + DB.PERIODS[pi]); toast(n ? 'Saved, but there is still a clash to fix.' : 'Saved. No clashes found.', n ? 'bad' : 'ok'); draw(); } }] });
  });
  on(el, 'click', '#addnote', () => openModal({ title: 'Upload lesson material', html: `<div class="form-grid">${field('Title', '<input id="n-t" placeholder="e.g. Week 6 lesson note">')}${field('Type', select('n-ty', ['Lesson note', 'Assignment', 'Scheme of work']))}${field('Class', select('n-c', DB.CLASSES.filter(c => c.sec !== 'Nursery' && (!teacher || c.id === S.teacherClass)).map(c => [c.id, c.name]), teacher ? S.teacherClass : 'JS2'))}${field('Subject', select('n-s', DB.SUBJECTS.JSS, 'Mathematics'))}${field('Due date (assignments)', '<input id="n-d" type="date" value="2026-10-20">')}${field('File', '<input type="file" id="n-f">', 'PDF, Word or photo. The demo does not store files.')}</div>`, foot: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Upload', cls: 'primary', onClick: w => { const t = $('#n-t', w).value.trim(); if (!t) { toast('Give the material a title.', 'bad'); return false; } DB.NOTES.unshift({ id: 'LN' + (DB.NOTES.length + 1), cls: $('#n-c', w).value, sub: $('#n-s', w).value, title: t, by: teacher ? 'T07' : DB.cls($('#n-c', w).value).teacher, date: '9 Oct', type: $('#n-ty', w).value, due: $('#n-ty', w).value === 'Assignment' ? new Date($('#n-d', w).value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '' }); DB.audit('Uploaded ' + $('#n-ty', w).value.toLowerCase(), t); toast('Uploaded. Pupils and parents can see it now.'); draw(); } }] }));
};

/* ================= Attendance ================= */
Views.attendance = function (el) {
  if (S.role === 'parent') return parentAttendance(el);
  const teacher = S.role === 'teacher'; let tab = 'reg', cid = teacher ? S.teacherClass : 'JS2';
  function reg() {
    const c = DB.cls(cid), pups = DB.studentsIn(cid), R = DB.REG[cid], saved = DB.REG_SAVED[cid], cnt = k => Object.values(R).filter(v => v === k).length;
    return `${teacher ? '' : `<div class="card" style="margin-bottom:16px"><div class="row wrap" style="gap:8px">${DB.CLASSES.map(x => `<button class="btn sm ${x.id === cid ? 'primary' : ''}" data-c="${x.id}">${x.name}${DB.REG_SAVED[x.id] ? '' : ' <span class="chip chip-warn" style="padding:0 6px">open</span>'}</button>`).join('')}</div></div>`}
    <div class="card flat"><div class="card-head"><div><h3>${c.name} register, Friday 9 October</h3><div class="small dim">${esc(DB.teacherOf(c.teacher).name)}, class teacher</div></div><div class="row">${saved ? chip('Submitted', 'ok') : chip('Not submitted', 'warn')}<button class="btn" id="allp" ${saved ? 'disabled' : ''}>Mark all present</button><button class="btn primary" id="submit" ${saved ? 'disabled' : ''}>Submit register</button></div></div>
    ${pups.map(s => `<div class="reg-row"><div class="person">${avatar(s.name)}<div><div class="p-name">${esc(s.name)}</div><div class="p-sub">${s.adm}</div></div></div><div class="mark" role="group" aria-label="Attendance for ${esc(s.name)}">${[['P', 'p', 'Present'], ['L', 'l', 'Late'], ['A', 'a', 'Absent']].map(([k, cl, l]) => `<button class="${cl}" data-s="${s.id}" data-v="${k}" aria-pressed="${R[s.id] === k}" ${saved ? 'disabled' : ''}>${l}</button>`).join('')}</div></div>`).join('')}
    <div class="tfoot"><span><b>${cnt('P')}</b> present, <b>${cnt('L')}</b> late, <b>${cnt('A')}</b> absent</span><span>${saved ? 'Parents of absent pupils were alerted.' : 'Parents of absent pupils get an SMS when you submit.'}</span></div></div>`;
  }
  function staffTab() {
    return `<div class="card flat"><div class="card-head"><h3>Staff attendance, today</h3><span class="muted small">${DB.STAFF.filter(s => s.today === 'Present').length} present</span></div><table class="tbl"><thead><tr><th>Staff</th><th>Role</th><th>Status</th></tr></thead><tbody>${DB.STAFF.map(s => `<tr><td>${person(s.name)}</td><td>${s.role}</td><td><div class="mark">${['Present', 'Late', 'On leave', 'Absent'].map(v => `<button class="${v === 'Present' ? 'p' : v === 'Absent' ? 'a' : 'l'}" style="min-width:68px;padding:4px 10px;font-weight:600" data-st="${s.id}" data-v="${v}" aria-pressed="${s.today === v}">${v}</button>`).join('')}</div></td></tr>`).join('')}</tbody></table></div>`;
  }
  function draw() { el.innerHTML = pageHead('Attendance', teacher ? 'Mark your class register. It works offline and syncs when the connection returns.' : 'Class registers and staff attendance for today.') + (teacher ? '' : tabs([['reg', 'Class registers'], ['staff', 'Staff']], tab)) + (tab === 'reg' ? reg() : staffTab()); }
  draw();
  on(el, 'click', '.tab', b => { tab = b.dataset.tab; draw(); });
  on(el, 'click', '[data-c]', b => { cid = b.dataset.c; draw(); });
  on(el, 'click', '.mark [data-s]', b => { DB.REG[cid][b.dataset.s] = b.dataset.v; draw(); });
  on(el, 'click', '[data-st]', b => { DB.STAFF.find(s => s.id === b.dataset.st).today = b.dataset.v; draw(); });
  on(el, 'click', '#allp', () => { DB.studentsIn(cid).forEach(s => DB.REG[cid][s.id] = 'P'); draw(); });
  on(el, 'click', '#submit', () => {
    const abs = DB.studentsIn(cid).filter(s => DB.REG[cid][s.id] === 'A');
    const go = () => { DB.REG_SAVED[cid] = true; DB.audit('Submitted register', DB.cls(cid).name + ', ' + abs.length + ' absent'); toast(abs.length ? `Register submitted. ${abs.length} parent alert${abs.length > 1 ? 's' : ''} sent.` : 'Register submitted. Everyone is present.'); draw(); };
    if (!abs.length) return go();
    openModal({ title: 'Alert parents of absent pupils?', html: `<p class="lead" style="margin-bottom:12px">${abs.length} pupil${abs.length > 1 ? 's are' : ' is'} marked absent. This is the SMS each parent will get:</p><div class="phone"><div class="bubble">Mubarak Model Academy: ${esc(abs[0].first)} was marked absent today (9 Oct). If this is a mistake, please call the school office.<small>SMS to ${esc(DB.gOf(abs[0]).phone)}</small></div></div><p class="small dim" style="margin-top:12px">Sent to ${abs.map(s => esc(DB.gOf(s).name)).join(', ')}.</p>`, foot: [{ label: 'Go back', cls: 'ghost' }, { label: 'Submit and send alerts', cls: 'primary', onClick: go }] });
  });
};

function parentAttendance(el) {
  const s = DB.STUDENTS.find(x => x.id === S.child), n = parseInt(s.id.slice(1)), days = Array.from({ length: 40 }, (_, d) => ((n * 37 + d * 53) % 100) >= s.att ? ((n + d) % 3 === 0 ? 'l' : 'a') : 'p');
  const cnt = k => days.filter(x => x === k).length;
  el.innerHTML = pageHead('Attendance', `${esc(s.name)}, ${DB.cls(s.classId).name}`, `<div class="seg" role="group" aria-label="Choose child">${DB.CHILDREN.map(id => `<button data-child="${id}" aria-pressed="${id === S.child}">${DB.STUDENTS.find(y => y.id === id).first}</button>`).join('')}</div><button class="btn primary" id="rep">${ico('plus')}Report an absence</button>`) +
    `<div class="kpi-strip" style="margin-bottom:16px;grid-template-columns:repeat(3,1fr)">${kpi('Present', cnt('p'), 'of the last 40 school days')}${kpi('Late', cnt('l'), 'Arrived after 8:00')}${kpi('Absent', cnt('a'), cnt('a') > 4 ? '<span class="down">Please speak to the class teacher</span>' : 'Within the normal range')}</div>
    <div class="card"><h3>Last 40 school days</h3><p class="c-sub">Each square is one day, oldest first.</p><div class="heat" role="img" aria-label="Attendance calendar">${days.map((d, i) => `<i class="${d === 'p' ? '' : d}" title="Day ${i + 1}: ${d === 'p' ? 'Present' : d === 'a' ? 'Absent' : 'Late'}"></i>`).join('')}</div><div class="row small dim" style="margin-top:14px;gap:16px"><span>${chip('Present', 'ok')}</span><span>${chip('Late', 'warn')}</span><span>${chip('Absent', 'bad')}</span></div></div>`;
  on(el, 'click', '[data-child]', b => { S.child = b.dataset.child; rerender(); });
  on(el, 'click', '#rep', () => openModal({ title: 'Report an absence', html: `<div class="form-grid">${field('Date', '<input type="date" value="2026-10-12">')}${field('Reason', select('r', ['Illness', 'Medical appointment', 'Family matter', 'Travel']))}${field('Note to the class teacher', '<textarea rows="3" placeholder="Optional"></textarea>')}</div>`, foot: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Send to class teacher', cls: 'primary', onClick: () => toast('Sent. The class teacher has been told.') }] }));
}

/* ================= Results ================= */
Views.results = function (el) {
  if (S.role === 'parent') return parentResults(el);
  const teacher = S.role === 'teacher';
  let tab = 'entry', cid = teacher ? S.teacherClass : 'JS2', sub = 'Mathematics', rcClass = cid, rcPupil = null;
  if (window.RC_SEL) { const p = DB.STUDENTS.find(x => x.id === window.RC_SEL); if (p) { tab = 'card'; rcClass = p.classId; rcPupil = p.id; } window.RC_SEL = null; }
  const MAX = { ca1: 20, ca2: 20, exam: 60 };
  const rank = (arr) => { const tots = arr.filter(x => x.t != null).map(x => x.t).sort((a, b) => b - a); return arr.map(x => x.t == null ? '' : tots.indexOf(x.t) + 1); };
  function entry() {
    const c = DB.cls(cid), pups = DB.studentsIn(cid), status = DB.RESULT_STATUS[cid];
    const picker = `<div class="toolbar" style="border:0;padding:0 0 14px">${teacher ? '' : `<select id="ecls" aria-label="Class">${DB.CLASSES.map(x => `<option value="${x.id}" ${x.id === cid ? 'selected' : ''}>${x.name}</option>`).join('')}</select>`}${c.sec === 'Nursery' ? '' : `<select id="esub" aria-label="Subject" ${teacher ? 'disabled' : ''}>${DB.subjectsFor(cid).map(x => `<option ${x === sub ? 'selected' : ''}>${x}</option>`).join('')}</select>`}<span class="sp row">${chip(status, stageTone(status))}</span></div>`;
    if (c.sec === 'Nursery') return picker + `<div class="note" style="margin-bottom:14px">${ico('alert')}<div>Nursery classes use skill ratings, not scores. Pick the level that fits each child.</div></div><div class="card flat"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Child</th>${DB.SKILLS.map(k => `<th>${k}</th>`).join('')}</tr></thead><tbody>${pups.map(p => `<tr><td>${person(p.name)}</td>${DB.SKILLS.map(k => `<td><select data-sk="${p.id}|${k}" aria-label="${k} for ${esc(p.name)}">${[1, 2, 3, 4].map(v => `<option value="${v}" ${DB.SKILLRATE[p.id][k] === v ? 'selected' : ''}>${DB.RATINGS[v]}</option>`).join('')}</select></td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="tfoot"><span>Changes save as you pick.</span><span></span></div></div>`;
    const lock = teacher && sub !== 'Mathematics';
    return picker + `<div class="note" style="margin-bottom:14px">${ico('clock')}<div>CA 1 is complete. CA 2 is open until Friday 30 October. Exam scores open in week 12. Type a score and everything else works itself out.</div></div>
    <div class="card flat"><div class="tbl-wrap"><table class="tbl" id="stbl"><thead><tr><th>Pupil</th><th class="c">CA 1<br><span class="dim">/20</span></th><th class="c">CA 2<br><span class="dim">/20</span></th><th class="c">Exam<br><span class="dim">/60</span></th><th class="c">Total</th><th class="c">Grade</th><th class="c">Position so far</th></tr></thead><tbody>${pups.map(p => { const r = DB.SCORES[p.id][sub]; return `<tr data-p="${p.id}"><td>${person(p.name, p.adm)}</td>${['ca1', 'ca2', 'exam'].map(k => `<td class="c"><input class="cell num" type="number" min="0" max="${MAX[k]}" data-k="${k}" value="${r[k] ?? ''}" aria-label="${k.toUpperCase()} for ${esc(p.name)}" ${status === 'Published' || status === 'Approved' ? 'disabled' : ''}></td>`).join('')}<td class="c num t"></td><td class="c g"></td><td class="c num pos"></td></tr>`; }).join('')}</tbody></table></div><div class="tfoot" id="sfoot"></div></div>
    <div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn" id="save">Save scores</button><button class="btn primary" id="submitres" ${status !== 'Draft' ? 'disabled' : ''}>${status === 'Draft' ? 'Submit to principal' : status === 'Submitted' ? 'Waiting for the principal' : 'Locked'}</button></div>`;
  }
  function recalc() {
    const rows = $$('#stbl tbody tr', el); if (!rows.length) return;
    const data = rows.map(tr => { const r = DB.SCORES[tr.dataset.p][sub], any = r.ca1 != null || r.ca2 != null || r.exam != null; return { tr, t: any ? DB.total(r) : null }; });
    const pos = rank(data);
    data.forEach((d, i) => { $('.t', d.tr).textContent = d.t ?? ''; const r = DB.SCORES[d.tr.dataset.p][sub], done = r.ca1 != null && r.ca2 != null && r.exam != null, g = done ? DB.grade(d.t) : null; $('.g', d.tr).innerHTML = g ? chip(g[1], gradeTone(g[1])) : (d.t == null ? '' : '<span class="dim small">Pending</span>'); $('.pos', d.tr).textContent = pos[i]; });
    const ts = data.filter(d => d.t != null).map(d => d.t);
    $('#sfoot', el).innerHTML = ts.length ? `<span>Class average <b>${Math.round(ts.reduce((a, b) => a + b, 0) / ts.length)}</b>, highest <b>${Math.max(...ts)}</b>, lowest <b>${Math.min(...ts)}</b></span><span>Pass rate (50 and above) <b>${Math.round(ts.filter(x => x >= 50).length / ts.length * 100)}%</b></span>` : '<span>No scores entered yet.</span>';
  }
  function card() {
    const cls_ = teacher ? S.teacherClass : rcClass, pups = DB.studentsIn(cls_); if (!rcPupil || !pups.find(p => p.id === rcPupil)) rcPupil = pups[0].id;
    return `<div class="toolbar" style="border:0;padding:0 0 14px">${teacher ? '' : `<select id="rcc" aria-label="Class">${DB.CLASSES.map(x => `<option value="${x.id}" ${x.id === cls_ ? 'selected' : ''}>${x.name}</option>`).join('')}</select>`}<select id="rcp" aria-label="Pupil">${pups.map(p => `<option value="${p.id}" ${p.id === rcPupil ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select><span class="sp row"><button class="btn" id="rcsend">${ico('send')}Send to parent</button><button class="btn primary" id="rcprint">${ico('print')}Print</button></span></div><div class="note" style="margin-bottom:14px">${ico('alert')}<div>This is last term's published report card, in the format the school will confirm. Nursery shows skill ratings instead of scores.</div></div><div id="rcbox">${reportCardHtml(rcPupil)}</div>`;
  }
  function approval() {
    const counts = k => Object.values(DB.RESULT_STATUS).filter(v => v === k).length, owing = DB.STUDENTS.filter(s => DB.owing(s) > 0).length;
    return `<div class="kpi-strip" style="margin-bottom:16px">${['Draft', 'Submitted', 'Approved', 'Published'].map(k => kpi(k === 'Submitted' ? 'Waiting for approval' : k, counts(k), k === 'Draft' ? 'Teachers still entering' : k === 'Submitted' ? 'Review and approve' : k === 'Approved' ? 'Ready to publish' : 'Visible to parents')).join('')}</div>
    <div class="card" style="margin-bottom:16px"><div class="row wrap"><div><h3 style="margin-bottom:2px">Hold results for unpaid fees</h3><p class="muted small">When on, parents with a balance see a payment prompt instead of the report card. ${owing} pupils currently owe a balance.</p></div><label class="switch sp"><input type="checkbox" id="hold" ${HOLD.on ? 'checked' : ''} aria-label="Hold results for unpaid fees"><span></span></label></div></div>
    <div class="card flat"><table class="tbl"><thead><tr><th>Class</th><th>Class teacher</th><th>Status</th><th class="r">Action</th></tr></thead><tbody>${DB.CLASSES.map(c => { const st = DB.RESULT_STATUS[c.id]; return `<tr><td><b>${c.name}</b></td><td>${esc(DB.teacherOf(c.teacher).name)}</td><td>${chip(st, stageTone(st))}</td><td class="r">${st === 'Submitted' ? `<div class="row" style="justify-content:flex-end"><button class="btn sm primary" data-a="Approved" data-c="${c.id}">Approve</button><button class="btn sm" data-a="Draft" data-c="${c.id}">Return</button></div>` : st === 'Approved' ? `<button class="btn sm gold" data-a="Published" data-c="${c.id}">Publish to parents</button>` : st === 'Draft' ? '<span class="dim small">With the teacher</span>' : '<span class="dim small">Published</span>'}</td></tr>`; }).join('')}</tbody></table></div>`;
  }
  const tl = teacher ? [['entry', 'Score entry'], ['card', 'Report cards']] : [['entry', 'Score entry'], ['card', 'Report cards'], ['appr', 'Approval and release']];
  function draw() { el.innerHTML = pageHead('Results', 'Enter scores once. Totals, grades and positions are worked out for you, and nothing reaches parents until the principal approves.') + tabs(tl, tab) + (tab === 'entry' ? entry() : tab === 'card' ? card() : approval()); if (tab === 'entry') recalc(); }
  draw();
  on(el, 'click', '.tab', b => { tab = b.dataset.tab; draw(); });
  el.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'ecls') { cid = t.value; sub = DB.subjectsFor(cid)[0] || ''; draw(); } if (t.id === 'esub') { sub = t.value; draw(); }
    if (t.id === 'rcc') { rcClass = t.value; rcPupil = null; draw(); } if (t.id === 'rcp') { rcPupil = t.value; $('#rcbox', el).innerHTML = reportCardHtml(rcPupil); }
    if (t.dataset.sk) { const [id, k] = t.dataset.sk.split('|'); DB.SKILLRATE[id][k] = +t.value; DB.audit('Changed skill rating', k); }
    if (t.id === 'hold') { HOLD.on = t.checked; DB.audit('Changed setting', 'Hold results for unpaid fees: ' + (HOLD.on ? 'on' : 'off')); toast(HOLD.on ? 'Results will be held for pupils with unpaid fees.' : 'Results are released to all parents.'); }
  });
  el.addEventListener('input', e => {
    const t = e.target; if (!t.classList.contains('cell')) return; const k = t.dataset.k, v = t.value === '' ? null : Number(t.value), pid = t.closest('tr').dataset.p;
    if (v != null && (v < 0 || v > MAX[k] || !Number.isFinite(v))) { t.classList.add('bad'); t.title = `Enter a score from 0 to ${MAX[k]}.`; return; }
    t.classList.remove('bad'); t.title = ''; DB.SCORES[pid][sub][k] = v; recalc();
  });
  on(el, 'click', '#save', () => { if ($('.cell.bad', el)) return toast('Fix the red scores first. Each must be between 0 and its maximum.', 'bad'); DB.audit('Saved scores', DB.cls(cid).name + ', ' + sub); toast('Scores saved for ' + DB.cls(cid).name + ' ' + sub); });
  on(el, 'click', '#submitres', () => confirmBox('Submit ' + DB.cls(cid).name + ' results?', 'The principal will be asked to review and approve. You will not be able to edit scores unless she returns them.', 'Submit to principal', () => { DB.RESULT_STATUS[cid] = 'Submitted'; DB.audit('Submitted results', DB.cls(cid).name); toast('Submitted. The principal has been notified.'); draw(); drawNav(); }));
  on(el, 'click', '#rcprint', () => openModal({ title: 'Report card', size: 'lg', html: reportCardHtml(rcPupil), foot: [{ label: 'Close', cls: 'ghost' }, { label: 'Print', cls: 'primary', icon: 'print', close: false, onClick: () => { window.print(); return false; } }] }));
  on(el, 'click', '#rcsend', () => { const p = DB.STUDENTS.find(x => x.id === rcPupil); toast('Report card sent to ' + DB.gOf(p).name); });
  on(el, 'click', '[data-a]', b => { const c = b.dataset.c, a = b.dataset.a; DB.RESULT_STATUS[c] = a; DB.audit(a === 'Draft' ? 'Returned results' : a + ' results', DB.cls(c).name); toast(a === 'Approved' ? DB.cls(c).name + ' results approved.' : a === 'Published' ? 'Published. Parents of ' + DB.cls(c).name + ' have been notified by SMS.' : 'Returned to the teacher with a note.'); draw(); drawNav(); });
};

function parentResults(el) {
  const s = DB.STUDENTS.find(x => x.id === S.child), o = DB.owing(s);
  el.innerHTML = pageHead('Report cards', `${esc(s.name)}, ${DB.cls(s.classId).name}`, `<div class="seg" role="group" aria-label="Choose child">${DB.CHILDREN.map(id => `<button data-child="${id}" aria-pressed="${id === S.child}">${DB.STUDENTS.find(y => y.id === id).first}</button>`).join('')}</div><button class="btn primary" id="pp">${ico('print')}Print</button>`) +
    (HOLD.on && o > 0 ? `<div class="card"><div class="locked">${ico('lock')}<h3 style="margin-top:10px">This report card is on hold</h3><p>A fee balance of ${money(o)} is outstanding. Pay it and the report card opens straight away.</p><a class="btn primary" style="margin-top:14px" href="#/fees">${ico('wallet')}Go to fees</a></div></div>` : reportCardHtml(s.id));
  on(el, 'click', '[data-child]', b => { S.child = b.dataset.child; rerender(); });
  on(el, 'click', '#pp', () => openModal({ title: 'Report card', size: 'lg', html: reportCardHtml(s.id), foot: [{ label: 'Close', cls: 'ghost' }, { label: 'Print', cls: 'primary', icon: 'print', close: false, onClick: () => { window.print(); return false; } }] }));
}
