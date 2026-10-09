var Views = window.Views = window.Views || {};

function alerts() {
  const out = [];
  if (S.role === 'admin') {
    const sub = Object.entries(DB.RESULT_STATUS).filter(([, s]) => s === 'Submitted');
    if (sub.length) out.push({ icon: 'award', text: `${sub.length} result sheets wait for approval`, sub: sub.slice(0, 3).map(([c]) => DB.cls(c).name).join(', '), to: 'results', tone: '' });
    const unsaved = DB.CLASSES.filter(c => !DB.REG_SAVED[c.id]);
    if (unsaved.length) out.push({ icon: 'check', text: `${unsaved.length} registers not submitted today`, sub: unsaved.map(c => c.name).join(', '), to: 'attendance', tone: 'bad' });
    const pend = DB.PURCHASES.filter(p => p.status === 'Pending'); if (pend.length) out.push({ icon: 'box', text: `${pend.length} purchase requests to approve`, sub: money(pend.reduce((a, p) => a + p.est, 0)) + ' in total', to: 'inventory', tone: '' });
    const lv = DB.LEAVE.filter(l => l.status === 'Pending'); if (lv.length) out.push({ icon: 'briefcase', text: `${lv.length} leave requests pending`, sub: lv.map(l => DB.teacherOf(l.who).name).join(', '), to: 'staff', tone: 'info' });
    const low = DB.STOCK.filter(s => s.qty < s.min); if (low.length) out.push({ icon: 'alert', text: `${low.length} items below reorder level`, sub: low.slice(0, 2).map(s => s.name).join(', '), to: 'inventory', tone: 'bad' });
    const od = DB.LOANS.filter(l => !l.returned && l.due < DB.TODAY); if (od.length) out.push({ icon: 'library', text: `${od.length} library books overdue`, sub: 'Fines are running at ₦50 a day', to: 'library', tone: 'info' });
    const ap = DB.APPLICANTS.filter(a => a.stage === 'Applied'); if (ap.length) out.push({ icon: 'userplus', text: `${ap.length} new applications to review`, sub: ap.map(a => a.name).slice(0, 2).join(', '), to: 'admissions', tone: 'info' });
  } else if (S.role === 'teacher') {
    if (!DB.REG_SAVED[S.teacherClass]) out.push({ icon: 'check', text: 'Today\'s JSS 2 register is not submitted', sub: 'Parents of absent pupils are alerted when you submit', to: 'attendance', tone: 'bad' });
    out.push({ icon: 'award', text: 'CA 2 scores are open for JSS 2 Mathematics', sub: 'Closes on Friday 30 October', to: 'results', tone: '' });
    out.push({ icon: 'book', text: 'Assignment 3 is due Tuesday', sub: 'Linear equations, 13 Oct', to: 'academics', tone: 'info' });
  } else {
    const s = DB.STUDENTS.find(x => x.id === S.child), bal = DB.owing(s);
    if (bal > 0) out.push({ icon: 'wallet', text: `${s.first}'s fee balance is ${money(bal)}`, sub: 'Pay part or all online', to: 'fees', tone: 'bad' });
    out.push({ icon: 'message', text: 'Parents and teachers meeting, 14 October', sub: '10:00 in the school hall', to: 'comms', tone: 'info' });
  }
  return out;
}

function todoList(a) {
  if (!a.length) return empty('All clear', 'Nothing is waiting for you right now.');
  return `<ul class="list todo">${a.map(x => `<li class="${x.tone}"><span class="ico-box">${ico(x.icon)}</span><div><div style="font-weight:600">${esc(x.text)}</div><div class="small dim">${esc(x.sub)}</div></div><a href="#/${x.to}">Open ${ico('arrow')}</a></li>`).join('')}</ul>`;
}

function termRibbon(title, sub) {
  const wk = i => i === DB.WEEK ? 'now' : i < DB.WEEK ? 'done' : i === 7 ? 'brk' : i >= 12 ? 'exam' : '';
  return `<section class="term"><div class="term-top"><div><h2>${esc(title)}</h2><p>${sub}</p></div><div class="row"><span class="chip" style="background:rgba(255,255,255,.14);color:#fff">${DB.SESSION}</span><span class="chip" style="background:var(--gold);color:#2B1D00">Week ${DB.WEEK} of 13</span></div></div>
    <div class="weeks" role="img" aria-label="Term calendar, week ${DB.WEEK} of 13">${Array.from({ length: 13 }, (_, i) => `<div class="wk ${wk(i + 1)}" title="Week ${i + 1}${i + 1 === 7 ? ', mid-term break' : i + 1 >= 12 ? ', examinations' : ''}">${i + 1}</div>`).join('')}</div>
    <div class="wk-key"><span><i></i>Taught</span><span><i class="g"></i>This week</span><span>Week 7: mid-term break</span><span>Weeks 12 and 13: examinations</span></div></section>`;
}

Views.dashboard = function (el) {
  if (S.role === 'teacher') return teacherHome(el);
  if (S.role === 'parent') return parentHome(el);
  const st = DB.STUDENTS, bySec = s => st.filter(x => DB.secOf(x.classId) === s).length;
  const present = DB.CLASSES.reduce((a, c) => a + Object.values(DB.REG[c.id]).filter(v => v !== 'A').length, 0), pPct = Math.round(present / st.length * 100);
  const billed = st.reduce((a, s) => a + DB.INVOICES[s.id].net, 0), paid = st.reduce((a, s) => a + DB.INVOICES[s.id].paid, 0);
  const staffIn = DB.STAFF.filter(s => s.today === 'Present').length;
  const weekly = Array.from({ length: DB.WEEK }, (_, i) => DB.PAYMENTS.filter(p => p.week === i + 1).reduce((a, p) => a + p.amt, 0));
  let cum = 0; const cumul = weekly.map(v => cum += v);
  const debtors = st.filter(s => DB.owing(s) > 0).length;
  el.innerHTML = `${termRibbon('Good morning, Mrs. Abdullahi', 'Friday 9 October 2026. ' + st.length + ' pupils and ' + DB.STAFF.length + ' staff across Nursery, Primary and Secondary.')}
  <div class="kpi-strip" style="margin-top:16px">
    ${kpi('Pupils enrolled', st.length, `Nursery ${bySec('Nursery')}, Primary ${bySec('Primary')}, Secondary ${bySec('Secondary')}`)}
    ${kpi('Present today', pPct + '%', `${present} of ${st.length} pupils, ${DB.CLASSES.filter(c => !DB.REG_SAVED[c.id]).length} registers still open`)}
    ${kpi('Fees collected', money(paid), `<span class="up">${Math.round(paid / billed * 100)}%</span> of ${money(billed)} billed, ${debtors} owe a balance`)}
    ${kpi('Staff in school', staffIn + '/' + DB.STAFF.length, `${DB.STAFF.filter(s => s.today === 'On leave').length} on leave, ${DB.STAFF.filter(s => s.today === 'Absent').length} absent`)}
  </div>
  <div class="grid g-7-5" style="margin-top:16px">
    <div class="card"><div class="row wrap"><h3>Fees collected this term</h3><span class="sp muted small">Running total by week</span></div><p class="c-sub">${money(paid)} received since week 1</p>${area(cumul, cumul.map((_, i) => 'Wk ' + (i + 1)), { fmt: v => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : Math.round(v / 1e3) + 'k' })}</div>
    <div class="card"><h3>Needs your attention</h3><p class="c-sub">Tap an item to go straight to it.</p>${todoList(alerts())}</div>
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card"><h3>Pupils by section</h3><p class="c-sub">Current enrolment</p>${columns([{ l: 'Nursery', v: bySec('Nursery'), c: 'var(--gold)' }, { l: 'Primary', v: bySec('Primary') }, { l: 'JSS', v: DB.STUDENTS.filter(s => s.classId.startsWith('JS')).length, c: 'var(--sky)' }, { l: 'SS', v: DB.STUDENTS.filter(s => s.classId.startsWith('SS')).length, c: '#7C5CBF' }], { h: 190 })}</div>
    <div class="card"><h3>Attendance today by class</h3><p class="c-sub">Lowest first</p><div class="stack" style="gap:9px">${DB.CLASSES.map(c => { const v = Object.values(DB.REG[c.id]), p = Math.round(v.filter(x => x !== 'A').length / v.length * 100); return { c, p }; }).sort((a, b) => a.p - b.p).slice(0, 6).map(x => `<div><div class="row small"><span>${x.c.name}</span><b class="sp num">${x.p}%</b></div>${bar(x.p, x.p < 85 ? 'bad' : x.p < 92 ? 'warn' : '')}</div>`).join('')}</div></div>
    <div class="card"><h3>Recent activity</h3><p class="c-sub">From the audit trail</p><ul class="list">${DB.AUDIT.slice(0, 5).map(a => `<li>${avatar(a.who)}<div><div class="small"><b>${esc(a.act)}</b>, ${esc(a.obj)}</div><div class="small dim">${esc(a.who)}, ${esc(a.t)}</div></div></li>`).join('')}</ul></div>
  </div>`;
};

function teacherHome(el) {
  const c = DB.cls(S.teacherClass), pups = DB.studentsIn(c.id), reg = DB.REG[c.id], pres = Object.values(reg).filter(v => v !== 'A').length;
  const subs = DB.subjectsFor(c.id), ca2 = pups.filter(p => DB.SCORES[p.id]['Mathematics'].ca2 != null).length;
  const today = DB.TT.JS2[4];
  el.innerHTML = `${termRibbon('Good morning, Mr. Adejoh', 'You are the class teacher of ' + c.name + ' and teach Mathematics.')}
  <div class="kpi-strip" style="margin-top:16px">
    ${kpi('Pupils in JSS 2', pups.length, 'Class capacity 35')}${kpi('Present today', DB.REG_SAVED[c.id] ? Math.round(pres / pups.length * 100) + '%' : 'Open', DB.REG_SAVED[c.id] ? `${pups.length - pres} absent` : 'Register not submitted yet')}${kpi('CA 2 Mathematics', Math.round(ca2 / pups.length * 100) + '%', `${ca2} of ${pups.length} entered`)}${kpi('Subjects taught', 1, 'Mathematics, JSS 1 and JSS 2')}
  </div>
  <div class="grid g-7-5" style="margin-top:16px">
    <div class="card"><h3>Today's lessons</h3><p class="c-sub">Friday timetable for JSS 2</p><ul class="list">${DB.PERIODS.map((p, i) => { const x = today[i]; return x.brk ? `<li><b class="num" style="width:54px">${p}</b><span class="dim">Break</span></li>` : `<li><b class="num" style="width:54px">${p}</b><div><div style="font-weight:600">${x.sub}</div><div class="small dim">${DB.teacherOf(x.t).name}</div></div>${x.t === 'T07' ? chip('You', 'brand') : ''}</li>`; }).join('')}</ul></div>
    <div class="card"><h3>To do</h3><p class="c-sub">Based on your classes</p>${todoList(alerts())}</div>
  </div>`;
}

function parentHome(el) {
  const s = DB.STUDENTS.find(x => x.id === S.child), c = DB.cls(s.classId), t = DB.teacherOf(c.teacher), inv = DB.INVOICES[s.id], bal = DB.owing(s), rd = reportData(s.id);
  const hw = DB.NOTES.filter(n => n.cls === s.classId && n.type === 'Assignment');
  el.innerHTML = `${pageHead('Welcome, Mrs. Salami', 'Everything about your children in one place.', `<div class="seg" role="group" aria-label="Choose child">${DB.CHILDREN.map(id => { const x = DB.STUDENTS.find(y => y.id === id); return `<button data-child="${id}" aria-pressed="${id === S.child}">${x.first}</button>`; }).join('')}</div>`)}
  <div class="card" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">${avatar(s.name, 'lg')}<div><h2 style="font-size:22px">${esc(s.name)}</h2><div class="muted">${c.name}, ${DB.secOf(c.id)} section. Class teacher: ${esc(t.name)}</div><div class="small dim">Admission number ${s.adm}</div></div><div class="sp row wrap"><a class="btn" href="#/results">${ico('award')}Report card</a><a class="btn" href="#/attendance">${ico('check')}Attendance</a></div></div>
  <div class="kpi-strip" style="margin-top:16px">
    ${kpi('Attendance this term', s.att + '%', s.att >= 90 ? '<span class="up">On track</span>' : '<span class="down">Below 90%</span>')}
    ${kpi('Last term average', rd ? rd.avg + '%' : 'New', rd ? `Position ${rd.pos} of ${rd.size}` : 'No earlier report')}
    ${kpi('Fee balance', money(bal), bal ? `Paid ${money(inv.paid)} of ${money(inv.net)}` : '<span class="up">Fully paid</span>')}
    ${kpi('Homework due', hw.length, hw.length ? 'Next: ' + hw[0].due : 'Nothing this week')}
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h3>Fees</h3><p class="c-sub">${DB.TERM}, ${DB.SESSION}</p>${bar(inv.paid / inv.net * 100, bal ? 'warn' : '')}<div class="row small" style="margin:8px 0 14px"><span>Paid ${money(inv.paid)}</span><span class="sp">Balance ${money(bal)}</span></div>${bal ? `<a class="btn primary" href="#/fees">${ico('wallet')}Pay now</a>` : chip('Cleared', 'ok')}</div>
    <div class="card"><h3>Latest notices</h3><p class="c-sub">From the school</p>${DB.NOTICES.slice(0, 2).map(n => `<div class="notice"><h4>${esc(n.title)}</h4><p class="small">${esc(n.body)}</p></div>`).join('')}</div>
  </div>`;
  on(el, 'click', '[data-child]', b => { S.child = b.dataset.child; rerender(); });
}
