var Views = window.Views = window.Views || {};
const THREAD = [
  { me: false, t: 'Good afternoon Mrs. Salami. Yusuf did very well in the CA 1 test. He only needs a little more practice with fractions.', at: 'Tue, 14:20' },
  { me: true, t: 'Thank you, sir. We will practise with him at home this weekend.', at: 'Tue, 18:02' },
];

function calendarHtml() {
  const first = new Date(2026, 9, 1), start = (first.getDay() + 6) % 7, days = 31, cells = [];
  for (let i = 0; i < start; i++) cells.push('<div class="day out"></div>');
  for (let d = 1; d <= days; d++) {
    const dt = new Date(2026, 9, d), we = dt.getDay() === 0 || dt.getDay() === 6, evs = DB.EVENTS.filter(e => d === e.d || (e.to && d > e.d && d <= e.to));
    cells.push(`<div class="day ${we ? 'wkend' : ''} ${d === 9 ? 'today' : ''}"><b class="num">${d}</b>${evs.map(e => `<span class="ev ${e.k}">${esc(e.t)}</span>`).join('')}</div>`);
  }
  return `<div class="card"><div class="row" style="margin-bottom:12px"><h3 style="margin:0">October 2026</h3><span class="sp small dim">Today is highlighted in gold</span></div><div class="cal">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="dn">${d}</div>`).join('')}${cells.join('')}</div></div>`;
}
const noticesHtml = (canPost) => `<div class="card"><div class="row" style="margin-bottom:6px"><h3 style="margin:0">Notice board</h3>${canPost ? `<button class="btn primary sp" id="post">${ico('plus')}Post notice</button>` : ''}</div>${DB.NOTICES.map(n => `<div class="notice"><h4>${esc(n.title)}${n.pin ? chip('Pinned', 'warn') : ''}</h4><p>${esc(n.body)}</p><div class="small dim" style="margin-top:6px">${esc(n.who)}, ${n.date}</div></div>`).join('')}</div>`;

Views.comms = function (el) {
  if (S.role === 'parent') return parentComms(el);
  const teacher = S.role === 'teacher'; let tab = 'compose';
  const TPL = { blank: '', fee: 'Dear {parent}, a balance remains on {child}\'s first term fees. Kindly clear it before 30 October. Thank you.', event: 'Dear {parent}, the parents and teachers meeting holds on Wednesday 14 October at 10:00 in the school hall. Please come.', abs: 'Dear {parent}, {child} was absent today. Please let the class teacher know the reason.' };
  const AUD = teacher ? [['jss2', 'JSS 2 parents']] : [['all', 'All parents'], ['nur', 'Nursery parents'], ['pri', 'Primary parents'], ['sec', 'Secondary parents'], ['owe', 'Parents with balances'], ['staff', 'All staff']];
  const count = a => ({ jss2: DB.studentsIn('JS2').length, all: DB.GUARDIANS.length, nur: DB.STUDENTS.filter(s => DB.secOf(s.classId) === 'Nursery').length, pri: DB.STUDENTS.filter(s => DB.secOf(s.classId) === 'Primary').length, sec: DB.STUDENTS.filter(s => DB.secOf(s.classId) === 'Secondary').length, owe: DB.STUDENTS.filter(s => DB.owing(s) > 0).length, staff: DB.STAFF.length }[a]);
  const compose = () => `<div class="grid g-7-5"><div class="card"><div class="stack"><div class="form-grid">${field('Send to', select('c-a', AUD))}${field('Start from a template', select('c-t', [['blank', 'Blank message'], ['fee', 'Fee reminder'], ['event', 'Event notice'], ['abs', 'Absence follow-up']]))}</div>${field('How should it be sent?', `<div class="pillbox" id="chs">${['SMS', 'WhatsApp', 'Email', 'App'].map((c, i) => `<label><input type="checkbox" value="${c}" ${i === 0 || c === 'App' ? 'checked' : ''}><span>${c}</span></label>`).join('')}</div>`)}${field('Message', '<textarea id="c-m" rows="6" placeholder="Write your message. Use {parent} and {child} to add names."></textarea>', '<span id="cc">0 characters, 0 SMS pages</span>')}<div class="row"><button class="btn primary" id="sendm">${ico('send')}Send message</button><button class="btn ghost" id="sched">Schedule for later</button></div></div></div>
  <div class="stack"><div class="card"><h3>What parents will see</h3><p class="c-sub">Preview with sample names</p><div class="phone"><div class="bubble" id="pv">Your message appears here.<small>Mubarak Model Academy</small></div></div></div><div class="card"><div class="row"><div><div class="kpi-v" id="rcp">0</div><div class="muted small">recipients</div></div><div class="sp" style="text-align:right"><div class="kpi-v" id="cost">₦0</div><div class="muted small">estimated SMS cost</div></div></div><p class="small dim" style="margin-top:10px">Estimate uses ₦4 per SMS page. The school's real SMS rate goes here.</p></div></div></div>`;
  const sent = () => `<div class="card flat"><table class="tbl"><thead><tr><th>Message</th><th>To</th><th>Channels</th><th>Delivered</th><th>Sent</th></tr></thead><tbody>${DB.SENT.map(m => `<tr><td style="max-width:360px">${esc(m.text)}</td><td>${esc(m.aud)}</td><td>${m.ch.map(c => chip(c, 'info')).join(' ')}</td><td class="num">${m.ok} of ${m.n}<div style="width:90px;margin-top:4px">${bar(m.n ? m.ok / m.n * 100 : 100)}</div></td><td class="small">${m.date}</td></tr>`).join('')}</tbody></table></div>`;
  function draw() { el.innerHTML = pageHead('Messages and notices', 'Reach parents and staff by SMS, WhatsApp, email or the app, and keep the notice board and calendar current.') + tabs([['compose', 'Write a message'], ['sent', 'Sent'], ['board', 'Notice board'], ['cal', 'Calendar']], tab) + (tab === 'compose' ? compose() : tab === 'sent' ? sent() : tab === 'board' ? noticesHtml(!teacher) : calendarHtml()); if (tab === 'compose') upd(); }
  function upd() {
    const m = $('#c-m', el), a = $('#c-a', el).value, n = count(a), pages = Math.max(1, Math.ceil(m.value.length / 160)), chs = $$('#chs input:checked', el).map(x => x.value);
    $('#cc', el).textContent = `${m.value.length} characters, ${m.value.length ? pages : 0} SMS page${pages > 1 ? 's' : ''}`; $('#rcp', el).textContent = n; $('#cost', el).textContent = chs.includes('SMS') ? money(n * pages * 4) : '₦0';
    $('#pv', el).innerHTML = (m.value ? esc(m.value).replace(/\{parent\}/g, 'Mrs. Salami').replace(/\{child\}/g, 'Aminat') : 'Your message appears here.') + `<small>${chs.join(', ') || 'No channel chosen'}</small>`;
  }
  draw();
  on(el, 'click', '.tab', b => { tab = b.dataset.tab; draw(); });
  el.addEventListener('input', e => { if (['c-m', 'chs'].includes(e.target.id) || e.target.closest('#chs')) upd(); });
  el.addEventListener('change', e => { if (e.target.id === 'c-t') { $('#c-m', el).value = TPL[e.target.value]; upd(); } if (e.target.id === 'c-a' || e.target.closest('#chs')) upd(); });
  on(el, 'click', '#sendm', () => {
    const m = $('#c-m', el).value.trim(), chs = $$('#chs input:checked', el).map(x => x.value), a = $('#c-a', el); if (!m) return toast('Write a message first.', 'bad'); if (!chs.length) return toast('Choose at least one channel.', 'bad');
    DB.SENT.unshift({ id: 'M' + (DB.SENT.length + 1), aud: a.options[a.selectedIndex].text, ch: chs, text: m, date: '9 Oct, ' + new Date().toTimeString().slice(0, 5), n: count(a.value), ok: count(a.value) }); DB.audit('Sent message', a.options[a.selectedIndex].text + ' by ' + chs.join(', '));
    toast(`Sent to ${count(a.value)} recipients by ${chs.join(' and ')}.`); tab = 'sent'; draw();
  });
  on(el, 'click', '#sched', () => openModal({ title: 'Schedule this message', html: `<div class="form-grid">${field('Date', '<input type="date" value="2026-10-13">')}${field('Time', '<input type="time" value="08:00">')}</div>`, foot: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Schedule', cls: 'primary', onClick: () => toast('Scheduled for 13 October at 08:00.') }] }));
  on(el, 'click', '#post', () => openModal({ title: 'Post a notice', html: `<div class="stack">${field('Title', '<input id="n-t" placeholder="e.g. Uniform check on Monday">')}${field('Notice', '<textarea id="n-b" rows="4"></textarea>')}<label class="row small"><span class="switch"><input type="checkbox" id="n-p"><span></span></span>Pin to the top</label></div>`, foot: [{ label: 'Cancel', cls: 'ghost' }, { label: 'Post notice', cls: 'primary', onClick: w => { const t = $('#n-t', w).value.trim(); if (!t) { toast('Add a title.', 'bad'); return false; } DB.NOTICES.unshift({ id: 'N' + (DB.NOTICES.length + 1), title: t, body: $('#n-b', w).value, who: S.who(), date: '9 Oct', pin: $('#n-p', w).checked }); DB.audit('Posted notice', t); toast('Notice posted.'); draw(); } }] }));
};

function parentComms(el) {
  let tab = 'notices';
  function draw() {
    const s = DB.STUDENTS.find(x => x.id === S.child), t = DB.teacherOf(DB.cls(s.classId).teacher);
    el.innerHTML = pageHead('Notices', 'News from the school, messages with your child\'s teacher, and the term calendar.') + tabs([['notices', 'Notices'], ['msg', 'Message the teacher'], ['cal', 'Calendar']], tab) +
      (tab === 'notices' ? noticesHtml(false) : tab === 'cal' ? calendarHtml() : `<div class="card"><div class="row" style="margin-bottom:14px">${avatar(t.name)}<div><div class="p-name">${esc(t.name)}</div><div class="p-sub">${esc(s.first)}'s class teacher, usually replies within a day</div></div></div><div class="stack" style="gap:10px" id="thread">${THREAD.map(m => `<div style="display:flex;justify-content:${m.me ? 'flex-end' : 'flex-start'}"><div class="bubble" style="max-width:78%;${m.me ? 'background:var(--brand);color:var(--brand-ink);border-radius:14px 14px 4px 14px' : ''}">${esc(m.t)}<small style="${m.me ? 'color:inherit;opacity:.75' : ''}">${m.at}</small></div></div>`).join('')}</div><form class="row" style="margin-top:16px" id="mf"><input id="mi" style="flex:1" placeholder="Write a message to the teacher" aria-label="Message"><button class="btn primary">${ico('send')}Send</button></form></div>`);
  }
  draw();
  on(el, 'click', '.tab', b => { tab = b.dataset.tab; draw(); });
  el.addEventListener('submit', e => { e.preventDefault(); const i = $('#mi', el); if (!i.value.trim()) return; THREAD.push({ me: true, t: i.value.trim(), at: 'Fri, ' + new Date().toTimeString().slice(0, 5) }); toast('Message sent to the class teacher.'); draw(); });
}
