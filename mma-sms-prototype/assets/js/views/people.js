var Views = window.Views = window.Views || {};

/* ================= Admissions ================= */
function enrolStudent(app) {
  const c = DB.CLASSES.find(x => x.name === app.cls) || DB.CLASSES[3], n = DB.STUDENTS.length + 1, parts = app.name.split(' ');
  const g = { id: 'G' + (DB.GUARDIANS.length + 1), name: app.guardian, phone: app.phone, rel: 'Guardian', email: 'guardian' + n + '@mail.example' }; DB.GUARDIANS.push(g);
  const s = { id: 'S' + String(n).padStart(3, '0'), adm: 'MMA/2026/' + String(100 + n).slice(-3), first: parts[0], sn: parts.slice(1).join(' ') || parts[0], name: app.name, female: false, classId: c.id, gid: g.id, dob: new Date(2026 - 8, 3, 12), blood: 'O+', geno: 'AA', allergy: 'None', house: 'Zumurrud (green)', stream: '', status: 'Active', att: 100 };
  DB.STUDENTS.push(s); DB.REG[c.id][s.id] = 'P';
  const total = DB.feeTotal(c.id); DB.INVOICES[s.id] = { total, discount: 0, net: total, paid: 0, note: '' };
  if (c.sec === 'Nursery') { DB.SKILLRATE[s.id] = {}; DB.SKILLS.forEach(k => DB.SKILLRATE[s.id][k] = 3); } else { DB.SCORES[s.id] = {}; DB.subjectsFor(c.id).forEach(sub => DB.SCORES[s.id][sub] = { ca1: null, ca2: null, exam: null }); }
  return s;
}

Views.admissions = function (el) {
  function draw() {
    const A = DB.APPLICANTS;
    el.innerHTML = pageHead('Admissions', `${A.length} applications for ${DB.SESSION}. Move each one forward as the school decides.`, `<button class="btn" id="exp">${ico('download')}Export list</button><button class="btn primary" id="new">${ico('plus')}New application</button>`) +
      `<div class="kanban">${DB.STAGES.map(st => `<section class="kcol" aria-label="${st}"><h3>${st}<span class="chip chip-neutral">${A.filter(a => a.stage === st).length}</span></h3>${A.filter(a => a.stage === st).map(a => `<article class="kcard"><div class="k-top"><div class="person">${avatar(a.name)}<div><div class="p-name">${esc(a.name)}</div><div class="p-sub">${esc(a.cls)}</div></div></div>${chip(a.via, a.via === 'Online' ? 'info' : 'neutral')}</div>
        <div class="small muted">Guardian: ${esc(a.guardian)}<br>${esc(a.phone)}</div>
        <div class="row small wrap">${chip(a.docs + ' of 4 documents', a.docs === 4 ? 'ok' : 'warn')}${a.score != null ? chip('Entrance ' + a.score + '%', a.score >= 60 ? 'ok' : 'warn') : ''}</div>
        ${a.adm ? `<div class="small"><b>${a.adm}</b></div>` : ''}
        ${st === 'Applied' ? `<button class="btn sm" data-act="book" data-id="${a.id}">Book entrance exam</button>` : st === 'Exam booked' ? `<button class="btn sm" data-act="score" data-id="${a.id}">Record score</button>` : st === 'Offer sent' ? `<div class="row"><button class="btn sm primary" data-act="admit" data-id="${a.id}">Admit</button><button class="btn sm ghost" data-act="letter" data-id="${a.id}">Offer letter</button></div>` : `<button class="btn sm ghost" data-act="open" data-id="${a.adm}">Open student file</button>`}</article>`).join('') || `<p class="small dim" style="padding:8px 4px">No one here yet.</p>`}</section>`).join('')}</div>`;
  }
  draw();
  on(el, 'click', '#new', () => openModal({
    title: 'New application', size: 'lg', html: `<div class="form-grid">${field('Child\'s full name', '<input id="a-name" placeholder="e.g. Hauwa Ozigi">')}${field('Class applied for', select('a-cls', DB.CLASSES.map(c => c.name), 'Primary 1'))}${field('Guardian\'s name', '<input id="a-g" placeholder="e.g. Mr. Musa Ozigi">')}${field('Guardian\'s phone', '<input id="a-p" placeholder="+234 ...">')}${field('How did they apply?', select('a-via', ['Online', 'Walk-in']))}${field('Documents received', '<div class="pillbox">' + ['Birth certificate', 'Last result', 'Passport photo', 'Immunisation card'].map(d => `<label><input type="checkbox" class="a-doc" checked><span>${d}</span></label>`).join('') + '</div>')}</div>`,
    foot: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Save application', cls: 'primary', onClick: w => { const n = $('#a-name', w).value.trim(); if (!n) { toast('Enter the child\'s name first.', 'bad'); $('#a-name', w).focus(); return false; } DB.APPLICANTS.unshift({ id: 'A' + (DB.APPLICANTS.length + 1), name: n, cls: $('#a-cls', w).value, stage: 'Applied', via: $('#a-via', w).value, date: new Date(), guardian: $('#a-g', w).value || 'Not given', phone: $('#a-p', w).value || 'Not given', docs: $$('.a-doc:checked', w).length, score: null }); DB.audit('Created application', n + ', ' + $('#a-cls', w).value); toast('Application saved for ' + n); draw(); } }]
  }));
  on(el, 'click', '#exp', () => { download('applications.csv', csv([['Name', 'Class', 'Stage', 'Guardian', 'Phone']].concat(DB.APPLICANTS.map(a => [a.name, a.cls, a.stage, a.guardian, a.phone])))); toast('Applications list downloaded'); });
  on(el, 'click', '[data-act]', b => {
    const a = DB.APPLICANTS.find(x => x.id === b.dataset.id), act = b.dataset.act;
    if (act === 'book') openModal({ title: 'Book entrance exam', html: `<p class="lead" style="margin-bottom:14px">${esc(a.name)} sits the ${esc(a.cls)} entrance test. The guardian gets an SMS with the details.</p><div class="form-grid">${field('Date', '<input type="date" id="x-d" value="2026-10-17">')}${field('Time', select('x-t', ['9:00', '11:00', '13:00'], '9:00'))}</div>`, foot: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Book and notify', cls: 'primary', onClick: () => { a.stage = 'Exam booked'; DB.audit('Booked entrance exam', a.name); toast('Exam booked. SMS sent to ' + a.guardian); draw(); } }] });
    if (act === 'score') openModal({ title: 'Record entrance score', html: `<p class="lead" style="margin-bottom:14px">${esc(a.name)}, ${esc(a.cls)}</p>${field('Score out of 100', '<input type="number" id="x-s" min="0" max="100" value="70">', 'Pass mark is 50 (to be confirmed by the school).')}`, foot: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Save score and send offer', cls: 'primary', onClick: w => { a.score = +$('#x-s', w).value; a.stage = 'Offer sent'; DB.audit('Recorded entrance score', a.name + ', ' + a.score + '%'); toast('Offer letter queued for ' + a.guardian); draw(); } }] });
    if (act === 'letter') openModal({ title: 'Offer letter', size: 'lg', html: `<div class="rc"><div class="rc-head">${'<svg viewBox="0 0 48 48" width="44" height="44"><rect width="48" height="48" rx="12" fill="#D99A1E"/><circle cx="24" cy="24" r="6" fill="#0A3F35"/></svg>'}<div><h3>Mubarak Model Academy</h3><p>Ege, Adavi LGA, Okene, Kogi State</p></div></div><p style="margin:16px 0">9 October 2026</p><p>Dear ${esc(a.guardian)},</p><p style="margin:10px 0"><b>Offer of admission: ${esc(a.name)}, ${esc(a.cls)}</b></p><p>We are pleased to offer ${esc(a.name)} a place in ${esc(a.cls)} for the ${DB.SESSION} session, following a score of ${a.score}% in the entrance test. Please pay the acceptance fee and complete the registration form within 14 days to keep the place.</p><div class="rc-sign"><div>Admissions officer</div><div>Principal</div></div></div>`, foot: [{ label: 'Close', cls: 'ghost' }, { label: 'Print', cls: 'primary', icon: 'print', close: false, onClick: () => { window.print(); return false; } }] });
    if (act === 'admit') confirmBox('Admit ' + a.name + '?', 'This creates the student file, generates an admission number and raises the first term invoice.', 'Admit student', () => { const s = enrolStudent(a); a.stage = 'Admitted'; a.adm = s.adm; DB.audit('Admitted student', a.name + ', ' + s.adm); toast(a.name + ' admitted as ' + s.adm); draw(); });
    if (act === 'open') { const s = DB.STUDENTS.find(x => x.adm === b.dataset.id); s ? openStudent(s.id) : toast('Student file opens after admission is completed.', 'bad'); }
  });
};

/* ================= Students ================= */
Views.students = function (el) {
  const st = { q: '', sec: 'all', cls: 'all', n: 25 }, teacher = S.role === 'teacher';
  const base = () => DB.STUDENTS.filter(s => teacher ? s.classId === S.teacherClass : true);
  const rows = () => base().filter(s => (st.sec === 'all' || DB.secOf(s.classId) === st.sec) && (st.cls === 'all' || s.classId === st.cls) && (!st.q || s.name.toLowerCase().includes(st.q) || s.adm.toLowerCase().includes(st.q)));
  el.innerHTML = pageHead(teacher ? 'My class: JSS 2' : 'Students', teacher ? 'You see only the pupils in your own class.' : 'Every pupil from Creche to SS 3, with guardians, health and fees on one file.', `<button class="btn" id="exp">${ico('download')}Export CSV</button>${teacher ? '' : `<a class="btn primary" href="#/admissions">${ico('userplus')}New admission</a>`}`) +
    `<div class="card flat"><div class="toolbar"><input type="search" id="q" placeholder="Search by name or admission number" aria-label="Search students">${teacher ? '' : `<select id="sec" aria-label="Section"><option value="all">All sections</option><option>Nursery</option><option>Primary</option><option>Secondary</option></select><select id="cls" aria-label="Class"><option value="all">All classes</option>${DB.CLASSES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>`}<span class="sp muted small" id="count"></span></div><div class="tbl-wrap" id="tbl"></div><div class="tfoot" id="more"></div></div>`;
  function table() {
    const r = rows(), shown = r.slice(0, st.n); $('#count', el).textContent = r.length + ' pupils';
    $('#tbl', el).innerHTML = r.length ? `<table class="tbl"><thead><tr><th>Pupil</th><th>Class</th><th>Guardian</th><th class="c">Attendance</th>${teacher ? '' : '<th>Fees</th>'}<th>Status</th></tr></thead><tbody>${shown.map(s => { const g = DB.gOf(s), o = DB.owing(s); return `<tr data-id="${s.id}" tabindex="0"><td>${person(s.name, s.adm)}</td><td>${DB.cls(s.classId).name}${s.stream ? `<div class="p-sub">${s.stream}</div>` : ''}</td><td>${esc(g.name)}<div class="p-sub">${esc(g.phone)}</div></td><td class="c num">${s.att}%</td>${teacher ? '' : `<td>${o <= 0 ? chip('Paid', 'ok') : DB.INVOICES[s.id].paid === 0 ? chip('Owes ' + money(o), 'bad') : chip('Owes ' + money(o), 'warn')}</td>`}<td>${chip(s.status, 'ok')}</td></tr>`; }).join('')}</tbody></table>` : empty('No pupils match', 'Try a different name, or clear the section and class filters.');
    $('#more', el).innerHTML = r.length > st.n ? `<span>Showing ${shown.length} of ${r.length}</span><button class="btn sm" id="showmore">Show 25 more</button>` : `<span>Showing all ${r.length}</span>`;
  }
  table();
  el.addEventListener('input', e => { if (e.target.id === 'q') { st.q = e.target.value.trim().toLowerCase(); st.n = 25; table(); } });
  el.addEventListener('change', e => { if (e.target.id !== 'sec' && e.target.id !== 'cls') return; if (e.target.id === 'sec') { st.sec = e.target.value; st.cls = 'all'; $('#cls', el).value = 'all'; $$('#cls option', el).forEach(o => o.hidden = st.sec !== 'all' && o.value !== 'all' && DB.secOf(o.value) !== st.sec); } if (e.target.id === 'cls') st.cls = e.target.value; st.n = 25; table(); });
  on(el, 'click', '#showmore', () => { st.n += 25; table(); });
  on(el, 'click', 'tr[data-id]', r => openStudent(r.dataset.id));
  el.addEventListener('keydown', e => { if (e.key === 'Enter') { const r = e.target.closest('tr[data-id]'); r && openStudent(r.dataset.id); } });
  on(el, 'click', '#exp', () => { download('students.csv', csv([['Admission no', 'Name', 'Class', 'Guardian', 'Phone', 'Attendance %']].concat(rows().map(s => [s.adm, s.name, DB.cls(s.classId).name, DB.gOf(s).name, DB.gOf(s).phone, s.att])))); toast('Student list downloaded'); });
};

function idCard(s) {
  const c = DB.cls(s.classId);
  return `<div class="idc"><div class="idc-top"><svg viewBox="0 0 48 48" width="30" height="30"><rect width="48" height="48" rx="12" fill="#D99A1E"/><g fill="none" stroke="#0A3F35" stroke-width="2.6"><rect x="13" y="13" width="22" height="22"/><rect x="13" y="13" width="22" height="22" transform="rotate(45 24 24)"/></g></svg><span>Mubarak Model Academy<br><small style="font-weight:400;opacity:.75">Student identity card</small></span></div><div class="idc-body"><div style="flex:1"><div class="avatar lg" style="--h:${hue(s.name)};margin-bottom:10px">${esc(initials(s.name))}</div><dl><dt>Name</dt><dd>${esc(s.name)}</dd><dt>Class</dt><dd>${c.name}</dd><dt>Admission no.</dt><dd>${s.adm}</dd></dl></div><div style="text-align:center">${qr(s.adm, 92)}<div style="font-size:10.5px;color:#788A83;margin-top:4px">Scan at the gate</div></div></div><div class="idc-foot"></div></div>`;
}

function openStudent(id) {
  const s = DB.STUDENTS.find(x => x.id === id), c = DB.cls(s.classId), g = DB.gOf(s), inv = DB.INVOICES[s.id], teacher = S.role === 'teacher';
  let tab = 'profile';
  const sibs = DB.STUDENTS.filter(x => x.gid === s.gid && x.id !== s.id);
  const body = () => {
    const age = DB.TODAY.getFullYear() - s.dob.getFullYear();
    if (tab === 'profile') return `<dl class="dl"><dt>Admission no.</dt><dd>${s.adm}</dd><dt>Class</dt><dd>${c.name}${s.stream ? ', ' + s.stream : ''}</dd><dt>Section</dt><dd>${c.sec}</dd><dt>Age</dt><dd>${age} years (born ${fmtDateY(s.dob)})</dd><dt>House</dt><dd>${s.house}</dd><dt>Class teacher</dt><dd>${esc(DB.teacherOf(c.teacher).name)}</dd><dt>Attendance</dt><dd>${s.att}% this term</dd><dt>Status</dt><dd>${chip(s.status, 'ok')}</dd></dl>`;
    if (tab === 'family') return `<div class="person" style="margin-bottom:14px">${avatar(g.name, 'lg')}<div><div class="p-name" style="font-size:17px">${esc(g.name)}</div><div class="p-sub">${g.rel}</div></div></div><dl class="dl"><dt>Phone</dt><dd>${esc(g.phone)}</dd><dt>Email</dt><dd>${esc(g.email)}</dd><dt>Siblings</dt><dd>${sibs.length ? sibs.map(x => esc(x.name) + ', ' + DB.cls(x.classId).name).join('<br>') : 'None in the school'}</dd><dt>Authorised pick-up</dt><dd>${esc(g.name)}${c.sec === 'Nursery' ? '<br>Plus one other adult (photo on file)' : ''}</dd></dl><div class="row" style="margin-top:16px"><button class="btn sm" data-t="Call started to ${esc(g.name)}">${ico('phone')}Call</button><button class="btn sm" data-t="SMS sent to ${esc(g.name)}">${ico('message')}Send SMS</button></div>`;
    if (tab === 'health') return `<div class="note warn" style="margin-bottom:14px">${ico('lock')}<div>Health notes are visible to the principal, nurse and class teacher only.</div></div><dl class="dl"><dt>Blood group</dt><dd>${s.blood}</dd><dt>Genotype</dt><dd>${s.geno}</dd><dt>Allergies</dt><dd>${s.allergy}</dd><dt>Sick bay visits</dt><dd>${DB.SICKBAY.filter(v => v.sid === s.id).length || 'None this term'}</dd></dl>`;
    if (tab === 'fees') return teacher ? `<div class="locked">${ico('lock')}<p style="margin-top:8px">Fee details are for the bursar and the principal.</p></div>` : `<div class="row" style="margin-bottom:8px"><b>${money(inv.paid)}</b> paid of ${money(inv.net)}<span class="sp">${inv.net - inv.paid <= 0 ? chip('Cleared', 'ok') : chip('Balance ' + money(inv.net - inv.paid), 'warn')}</span></div>${bar(inv.paid / inv.net * 100)}<table class="tbl" style="margin-top:14px"><tbody>${DB.FEE_STRUCT[DB.feeKey(s.classId)].map(f => `<tr><td>${f[0]}</td><td class="r num">${money(f[1])}</td></tr>`).join('')}${inv.discount ? `<tr><td>${inv.note}</td><td class="r num">-${money(inv.discount)}</td></tr>` : ''}</tbody></table>`;
    const rd = reportData(s.id); if (!rd) return empty('No earlier report', 'This pupil is new in the school, so there is no last-term report yet.');
    return `<div class="row" style="margin-bottom:10px"><div><div class="kpi-v">${rd.avg}%</div><div class="muted small">Last term average, position ${rd.pos} of ${rd.size}</div></div><a class="btn sm sp" href="#/results" data-rc="${s.id}">View report card</a></div>${rd.rows ? `<table class="tbl"><tbody>${rd.rows.map(r => `<tr><td>${r.sub}</td><td class="r num">${r.total}</td><td class="r">${chip(r.g[1], gradeTone(r.g[1]))}</td></tr>`).join('')}</tbody></table>` : `<p class="muted">Nursery skills report: see the full report card.</p>`}`;
  };
  const m = openDrawer({ title: s.name, html: `<div class="row" style="margin-bottom:16px">${avatar(s.name, 'lg')}<div><div class="p-name" style="font-size:18px">${esc(s.name)}</div><div class="p-sub">${c.name}, ${s.adm}</div></div></div>${tabs([['profile', 'Profile'], ['family', 'Family'], ['health', 'Health'], ['fees', 'Fees'], ['results', 'Results']], 'profile')}<div id="sd-body">${body()}</div>`, foot: [{ label: 'Print ID card', icon: 'idcard', cls: 'primary', close: false, onClick: () => { openModal({ title: 'Student ID card', html: idCard(s) + '<p class="small dim" style="text-align:center;margin-top:12px">The QR code here is for show. Real cards will carry a code the gate scanner can read.</p>', foot: [{ label: 'Close', cls: 'ghost' }, { label: 'Print', cls: 'primary', icon: 'print', close: false, onClick: () => { window.print(); return false; } }] }); return false; } }, { label: 'Close', cls: 'ghost' }] });
  on(m.el, 'click', '.tab', b => { tab = b.dataset.tab; $$('.tab', m.el).forEach(t => { t.classList.toggle('on', t === b); t.setAttribute('aria-selected', t === b); }); $('#sd-body', m.el).innerHTML = body(); });
  on(m.el, 'click', '[data-t]', b => toast(b.dataset.t));
  on(m.el, 'click', '[data-rc]', b => { window.RC_SEL = b.dataset.rc; m.close(); });
}

/* ================= Staff and payroll ================= */
Views.staff = function (el) {
  let tab = 'dir';
  const payroll = DB.STAFF.filter(s => s.basic > 0).map(s => { const housing = Math.round(s.basic * .2), transport = Math.round(s.basic * .1), gross = s.basic + housing + transport, pension = Math.round((s.basic + housing + transport) * .08), paye = Math.max(0, Math.round((gross - pension - 150000) * .075)); return { s, housing, transport, gross, pension, paye, net: gross - pension - paye }; });
  let processed = false;
  const pages = {
    dir() {
      return `<div class="card flat"><div class="toolbar"><input type="search" id="sq" placeholder="Search staff" aria-label="Search staff"><select id="ss" aria-label="Section"><option value="">All sections</option>${[...new Set(DB.STAFF.map(s => s.dept))].map(d => `<option>${d}</option>`).join('')}</select><span class="sp muted small">${DB.STAFF.filter(s => s.today === 'Present').length} of ${DB.STAFF.length} in school today</span></div><div class="tbl-wrap" id="stbl"></div></div>`;
    },
    leave() {
      return `<div class="grid g-7-5"><div class="card flat"><div class="card-head"><h3>Leave requests</h3></div><table class="tbl"><thead><tr><th>Staff</th><th>Type</th><th>Dates</th><th></th></tr></thead><tbody>${DB.LEAVE.map(l => { const t = DB.teacherOf(l.who); return `<tr><td>${person(t.name, t.role)}</td><td>${l.type}<div class="p-sub">${l.days} days</div></td><td>${l.from} to ${l.to}</td><td class="r">${l.status === 'Pending' ? `<div class="row" style="justify-content:flex-end"><button class="btn sm primary" data-lv="${l.id}" data-v="Approved">Approve</button><button class="btn sm" data-lv="${l.id}" data-v="Declined">Decline</button></div>` : chip(l.status, l.status === 'Approved' ? 'ok' : 'bad')}</td></tr>`; }).join('')}</tbody></table></div>
      <div class="card"><h3>Duty roster, this week</h3><p class="c-sub">Break and closing duty</p><ul class="list">${DB.DAYS.map((d, i) => `<li><b style="width:44px">${d}</b><div>${esc(DB.STAFF[7 + i * 2].name)}<div class="small dim">${esc(DB.STAFF[8 + i * 2].name)}</div></div></li>`).join('')}</ul></div></div>`;
    },
    pay() {
      const tot = payroll.reduce((a, r) => ({ g: a.g + r.gross, p: a.p + r.pension, t: a.t + r.paye, n: a.n + r.net }), { g: 0, p: 0, t: 0, n: 0 });
      return `<div class="kpi-strip" style="margin-bottom:16px">${kpi('Gross pay', money(tot.g), payroll.length + ' staff')}${kpi('Pension (8%)', money(tot.p), 'Employee share')}${kpi('PAYE (estimate)', money(tot.t), 'Placeholder rule')}${kpi('Net to pay', money(tot.n), processed ? '<span class="up">Processed</span>' : 'October 2026, not yet run')}</div>
      <div class="note warn" style="margin-bottom:16px">${ico('alert')}<div>Allowances (20% housing, 10% transport), pension and PAYE use placeholder rules. We set the real ones with the school's accountant.</div></div>
      <div class="card flat"><div class="card-head"><h3>October 2026 payroll</h3><div class="row"><button class="btn" id="pexp">${ico('download')}Export</button><button class="btn primary" id="prun" ${processed ? 'disabled' : ''}>${processed ? 'Payroll processed' : 'Run payroll'}</button></div></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Staff</th><th class="r">Basic</th><th class="r">Housing</th><th class="r">Transport</th><th class="r">Gross</th><th class="r">Pension</th><th class="r">PAYE</th><th class="r">Net pay</th><th></th></tr></thead><tbody>${payroll.map((r, i) => `<tr><td>${person(r.s.name, r.s.role)}</td><td class="r num">${money(r.s.basic)}</td><td class="r num">${money(r.housing)}</td><td class="r num">${money(r.transport)}</td><td class="r num">${money(r.gross)}</td><td class="r num">${money(r.pension)}</td><td class="r num">${money(r.paye)}</td><td class="r num"><b>${money(r.net)}</b></td><td class="r"><button class="btn sm ghost" data-slip="${i}">Payslip</button></td></tr>`).join('')}</tbody></table></div></div>`;
    },
  };
  function draw() {
    el.innerHTML = pageHead('Staff and payroll', `${DB.STAFF.length} staff members across all sections.`, `<button class="btn primary" data-t="Staff form opens here in the full system">${ico('plus')}Add staff</button>`) + tabs([['dir', 'Directory'], ['leave', 'Leave and duty'], ['pay', 'Payroll']], tab) + pages[tab]();
    if (tab === 'dir') stable();
  }
  function stable() {
    const q = ($('#sq', el).value || '').toLowerCase(), d = $('#ss', el).value, r = DB.STAFF.filter(s => (!q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)) && (!d || s.dept === d));
    $('#stbl', el).innerHTML = `<table class="tbl"><thead><tr><th>Name</th><th>Role</th><th>Section</th><th>Phone</th><th>Today</th><th>Joined</th></tr></thead><tbody>${r.map(s => `<tr><td>${person(s.name, s.id)}</td><td>${s.role}${s.classId ? `<div class="p-sub">${DB.cls(s.classId).name}</div>` : ''}</td><td>${s.dept}</td><td>${s.phone}</td><td>${chip(s.today, s.today === 'Present' ? 'ok' : s.today === 'Absent' ? 'bad' : 'warn')}</td><td>${s.joined}</td></tr>`).join('')}</tbody></table>`;
  }
  draw();
  on(el, 'click', '.tab', b => { tab = b.dataset.tab; draw(); });
  el.addEventListener('input', e => { if (e.target.id === 'sq') stable(); }); el.addEventListener('change', e => { if (e.target.id === 'ss') stable(); });
  on(el, 'click', '[data-t]', b => toast(b.dataset.t));
  on(el, 'click', '[data-lv]', b => { const l = DB.LEAVE.find(x => x.id === b.dataset.lv); l.status = b.dataset.v; DB.audit(b.dataset.v + ' leave', DB.teacherOf(l.who).name); toast('Leave ' + b.dataset.v.toLowerCase() + ' for ' + DB.teacherOf(l.who).name); draw(); });
  on(el, 'click', '#prun', () => confirmBox('Run October payroll?', `This locks the figures for ${payroll.length} staff and creates payslips. Net pay in total: ${money(payroll.reduce((a, r) => a + r.net, 0))}.`, 'Run payroll', () => { processed = true; DB.audit('Ran payroll', 'October 2026'); toast('Payroll processed. Payslips are ready.'); draw(); }));
  on(el, 'click', '#pexp', () => { download('payroll-october-2026.csv', csv([['Staff', 'Basic', 'Housing', 'Transport', 'Gross', 'Pension', 'PAYE', 'Net']].concat(payroll.map(r => [r.s.name, r.s.basic, r.housing, r.transport, r.gross, r.pension, r.paye, r.net])))); toast('Payroll file downloaded'); });
  on(el, 'click', '[data-slip]', b => {
    const r = payroll[+b.dataset.slip];
    openModal({ title: 'Payslip, October 2026', html: `<div class="receipt"><div class="row"><b>Mubarak Model Academy</b><span class="sp muted">Pay date 28 Oct 2026</span></div><hr><div class="person">${avatar(r.s.name)}<div><div class="p-name">${esc(r.s.name)}</div><div class="p-sub">${r.s.role}, ${r.s.id}</div></div></div><hr><table class="tbl"><tbody><tr><td>Basic salary</td><td class="r num">${money(r.s.basic)}</td></tr><tr><td>Housing allowance</td><td class="r num">${money(r.housing)}</td></tr><tr><td>Transport allowance</td><td class="r num">${money(r.transport)}</td></tr><tr><td><b>Gross pay</b></td><td class="r num"><b>${money(r.gross)}</b></td></tr><tr><td>Pension (8%)</td><td class="r num">-${money(r.pension)}</td></tr><tr><td>PAYE (estimate)</td><td class="r num">-${money(r.paye)}</td></tr></tbody></table><hr><div class="row"><span>Net pay</span><span class="sp tot">${money(r.net)}</span></div></div>`, foot: [{ label: 'Close', cls: 'ghost' }, { label: 'Print payslip', cls: 'primary', icon: 'print', close: false, onClick: () => { window.print(); return false; } }] });
  });
};
