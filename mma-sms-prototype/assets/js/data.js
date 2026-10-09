/* Demo data. Everything here is fictional and generated with a fixed seed so the prototype looks the same every time. */
(function () {
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R = rng(20261009);
  const rnd = (a, b) => Math.floor(R() * (b - a + 1)) + a;
  const pick = a => a[Math.floor(R() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const gauss = () => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  const TODAY = new Date(2026, 9, 9);
  const TERM_START = new Date(2026, 8, 7);
  const WEEK = Math.floor((TODAY - TERM_START) / (7 * 864e5)) + 1;
  const SESSION = '2026/2027', TERM = 'First term';

  const CLASSES = [
    { id: 'CR', name: 'Creche', sec: 'Nursery', next: 'N1' }, { id: 'N1', name: 'Nursery 1', sec: 'Nursery', next: 'N2' }, { id: 'N2', name: 'Nursery 2', sec: 'Nursery', next: 'P1' },
    { id: 'P1', name: 'Primary 1', sec: 'Primary', next: 'P2' }, { id: 'P2', name: 'Primary 2', sec: 'Primary', next: 'P3' }, { id: 'P3', name: 'Primary 3', sec: 'Primary', next: 'P4' },
    { id: 'P4', name: 'Primary 4', sec: 'Primary', next: 'P5' }, { id: 'P5', name: 'Primary 5', sec: 'Primary', next: 'P6' }, { id: 'P6', name: 'Primary 6', sec: 'Primary', next: 'JS1' },
    { id: 'JS1', name: 'JSS 1', sec: 'Secondary', next: 'JS2' }, { id: 'JS2', name: 'JSS 2', sec: 'Secondary', next: 'JS3' }, { id: 'JS3', name: 'JSS 3', sec: 'Secondary', next: 'SS1' },
    { id: 'SS1', name: 'SS 1', sec: 'Secondary', next: 'SS2' }, { id: 'SS2', name: 'SS 2', sec: 'Secondary', next: 'SS3' }, { id: 'SS3', name: 'SS 3', sec: 'Secondary', next: null },
  ];
  const cls = id => CLASSES.find(c => c.id === id);
  const prevOf = id => CLASSES.find(c => c.next === id);
  const SUBJECTS = {
    Primary: ['English Language', 'Mathematics', 'Basic Science', 'Social Studies', 'Islamic Studies', 'Verbal Reasoning', 'Computer Studies', 'Creative Arts'],
    JSS: ['English Language', 'Mathematics', 'Basic Science', 'Social Studies', 'Civic Education', 'Islamic Studies', 'Computer Studies', 'Business Studies'],
    SS: ['English Language', 'Mathematics', 'Civic Education', 'Islamic Studies', 'Computer Studies', 'Economics', 'Biology', 'Chemistry'],
  };
  const subjectsFor = id => { const c = cls(id); if (!c || c.sec === 'Nursery') return []; if (c.sec === 'Primary') return SUBJECTS.Primary; return id.startsWith('JS') ? SUBJECTS.JSS : SUBJECTS.SS; };
  const SKILLS = ['Language and listening', 'Early numbers', 'Social skills', 'Fine motor skills', 'Creative play', 'Moral and Islamic values'];
  const RATINGS = ['', 'Needs support', 'Needs practice', 'Developing well', 'Mastered'];

  /* ---------- Staff ---------- */
  const F_NAMES = ['Rukayat', 'Fatima', 'Zainab', 'Hauwa', 'Maryam', 'Khadija', 'Oiza', 'Halima', 'Nafisat', 'Ramatu', 'Aisha', 'Habeeba', 'Amina', 'Sumayya'];
  const M_NAMES = ['Ibrahim', 'Musa', 'Yusuf', 'Suleiman', 'Idris', 'Abubakar', 'Umar', 'Sadiq', 'Ismail', 'Ojima', 'Ozovehe', 'Salihu', 'Jamiu', 'Hamza'];
  const SURNAMES = ['Yahaya', 'Ododo', 'Momoh', 'Salami', 'Abdullahi', 'Audu', 'Ahmed', 'Bello', 'Lawal', 'Garuba', 'Ozigi', 'Usman', 'Mohammed', 'Jimoh', 'Aliyu', 'Sani', 'Attah', 'Obaje', 'Adejoh', 'Idris'];
  const phone = () => '+234 ' + pick(['803', '806', '810', '813', '816', '703', '706', '809', '901', '903']) + ' ' + rnd(100, 999) + ' ' + rnd(1000, 9999);
  const STAFF = [];
  const addStaff = (name, role, dept, basic, extra = {}) => STAFF.push({ id: 'T' + String(STAFF.length + 1).padStart(2, '0'), name, role, dept, basic, phone: phone(), joined: 2010 + rnd(0, 15), today: R() < .93 ? 'Present' : pick(['Absent', 'On leave']), ...extra });
  addStaff('Alhaji Ibrahim Ododo', 'Proprietor', 'Management', 0, { today: 'Present' });
  addStaff('Mrs. Rukayat Abdullahi', 'Principal', 'Secondary', 320000, { today: 'Present' });
  addStaff('Mrs. Fatima Momoh', 'Head teacher', 'Primary', 280000, { today: 'Present' });
  addStaff('Mrs. Zainab Audu', 'Head of Nursery', 'Nursery', 240000, { today: 'Present' });
  addStaff('Mr. Suleiman Garuba', 'Bursar', 'Finance', 250000, { today: 'Present' });
  addStaff('Miss Oiza Lawal', 'Admissions officer', 'Administration', 150000, { today: 'Present' });
  addStaff('Mr. Ojima Adejoh', 'Class teacher', 'Secondary', 185000, { classId: 'JS2', subject: 'Mathematics', today: 'Present' });
  const used = new Set(['Ojima Adejoh']);
  CLASSES.forEach(c => {
    if (c.id === 'JS2') { c.teacher = 'T07'; return; }
    let nm; do { const f = R() < .55; nm = (f ? pick(F_NAMES) : pick(M_NAMES)) + ' ' + pick(SURNAMES); } while (used.has(nm)); used.add(nm);
    const fem = F_NAMES.includes(nm.split(' ')[0]);
    const basic = c.sec === 'Nursery' ? 110000 : c.sec === 'Primary' ? 135000 : 165000;
    addStaff((fem ? pick(['Mrs. ', 'Miss ']) : 'Mr. ') + nm, 'Class teacher', c.sec, basic + rnd(0, 4) * 5000, { classId: c.id });
    c.teacher = STAFF[STAFF.length - 1].id;
  });
  [['Mr. Anas Bello', 'English Language teacher', 'Secondary', 170000], ['Mrs. Habeeba Sani', 'Basic Science teacher', 'Secondary', 170000], ['Malam Sadiq Usman', 'Islamic Studies teacher', 'All sections', 150000], ['Mr. Bilal Attah', 'Computer Studies teacher', 'All sections', 160000]]
    .forEach(s => addStaff(s[0], s[1], s[2], s[3], { today: 'Present' }));
  addStaff('Miss Amina Obaje', 'Librarian', 'Library', 120000, { today: 'Present' });
  addStaff('Mrs. Maryam Jimoh', 'School nurse', 'Health', 140000, { today: 'Present' });
  addStaff('Mr. Idris Aliyu', 'Store keeper', 'Stores', 100000, { today: 'Present' });
  addStaff('Mr. Hamza Ahmed', 'ICT officer', 'Administration', 140000, { today: 'Present' });
  const teacherOf = id => STAFF.find(s => s.id === id);

  /* ---------- Students ---------- */
  const STUDENTS = [], GUARDIANS = [];
  const AGE = { CR: 2, N1: 3, N2: 4, P1: 5, P2: 6, P3: 7, P4: 8, P5: 9, P6: 10, JS1: 11, JS2: 12, JS3: 13, SS1: 14, SS2: 15, SS3: 16 };
  const COUNT = { CR: 9, N1: 11, N2: 12, P1: 13, P2: 12, P3: 13, P4: 13, P5: 12, P6: 12, JS1: 14, JS2: 13, JS3: 12, SS1: 11, SS2: 10, SS3: 9 };
  const BLOOD = ['O+', 'O+', 'A+', 'B+', 'AB+', 'O-'], GENO = ['AA', 'AA', 'AA', 'AS', 'AS', 'SS'];
  const ALLERGY = ['None', 'None', 'None', 'None', 'Peanuts', 'Dust', 'Penicillin'];
  function newGuardian(sn, female) { const g = { id: 'G' + (GUARDIANS.length + 1), name: (female ? pick(['Mrs. ', 'Mrs. ', 'Alhaja ']) + pick(F_NAMES) : pick(['Mr. ', 'Alhaji ', 'Malam ']) + pick(M_NAMES)) + ' ' + sn, phone: phone(), rel: female ? 'Mother' : 'Father', email: '' }; g.email = g.name.split(' ').pop().toLowerCase() + rnd(10, 99) + '@mail.example'; GUARDIANS.push(g); return g; }
  function addStudent(c, first, sn, female, g, extra = {}) {
    const n = STUDENTS.length + 1, age = AGE[c.id] + rnd(0, 1), joinYr = 2026 - clamp(rnd(0, Math.max(0, AGE[c.id] - 2)), 0, 9);
    STUDENTS.push({ id: 'S' + String(n).padStart(3, '0'), adm: 'MMA/' + joinYr + '/' + String(100 + n).slice(-3), first, sn, name: first + ' ' + sn, female, classId: c.id, gid: g.id, dob: new Date(2026 - age, rnd(0, 11), rnd(1, 28)), blood: pick(BLOOD), geno: pick(GENO), allergy: pick(ALLERGY), house: pick(['Zumurrud (green)', 'Yaqut (red)', 'Lulu (white)', 'Dhahab (gold)']), stream: c.id.startsWith('SS') ? pick(['Science', 'Science', 'Arts', 'Commercial']) : '', status: 'Active', ...extra });
  }
  const salami = { id: 'G0', name: 'Mrs. Hauwa Salami', phone: '+234 803 555 0142', rel: 'Mother', email: 'hauwa.salami@mail.example' }; GUARDIANS.push(salami);
  CLASSES.forEach(c => {
    for (let i = 0; i < COUNT[c.id]; i++) {
      if (c.id === 'P4' && i === 0) { addStudent(c, 'Aminat', 'Salami', true, salami); continue; }
      if (c.id === 'JS2' && i === 0) { addStudent(c, 'Yusuf', 'Salami', false, salami); continue; }
      const f = R() < .5, sn = pick(SURNAMES); addStudent(c, f ? pick(F_NAMES) : pick(M_NAMES), sn, f, newGuardian(sn, R() < .55));
    }
  });
  const gOf = s => GUARDIANS.find(g => g.id === s.gid);
  const studentsIn = id => STUDENTS.filter(s => s.classId === id);
  const CHILDREN = ['S' + String(STUDENTS.findIndex(s => s.first === 'Aminat' && s.sn === 'Salami') + 1).padStart(3, '0'), 'S' + String(STUDENTS.findIndex(s => s.first === 'Yusuf' && s.sn === 'Salami') + 1).padStart(3, '0')];
  STUDENTS.forEach(s => { s.att = clamp(Math.round(96 - Math.abs(gauss()) * 6), 70, 100); });

  /* ---------- Scores ---------- */
  function genScores(studentId, classId, mode) {
    const subs = subjectsFor(classId), out = {}, st0 = STUDENTS.find(x => x.id === studentId), ability = 58 + gauss() * 13 + (st0 && st0.sn === 'Salami' ? 15 : 0);
    subs.forEach(sub => {
      const total = clamp(Math.round(ability + gauss() * 8), 18, 98);
      if (mode === 'full') { const ca1 = clamp(Math.round(total * .2 + rnd(-2, 2)), 0, 20), ca2 = clamp(Math.round(total * .2 + rnd(-2, 2)), 0, 20); out[sub] = { ca1, ca2, exam: clamp(total - ca1 - ca2, 0, 60) }; }
      else out[sub] = { ca1: clamp(Math.round(total * .2 + rnd(-2, 2)), 0, 20), ca2: null, exam: null };
    });
    return out;
  }
  const SCORES = {}, PREV = {}, SKILLRATE = {};
  STUDENTS.forEach(s => {
    const c = cls(s.classId);
    if (c.sec === 'Nursery') { SKILLRATE[s.id] = {}; SKILLS.forEach(k => SKILLRATE[s.id][k] = clamp(Math.round(3 + gauss() * .8), 1, 4)); }
    else SCORES[s.id] = genScores(s.id, s.classId, 'cur');
    const p = prevOf(s.classId);
    if (p && p.sec !== 'Nursery') PREV[s.id] = { classId: p.id, scores: genScores(s.id, p.id, 'full') };
    else if (p) PREV[s.id] = { classId: p.id, skills: (() => { const o = {}; SKILLS.forEach(k => o[k] = clamp(Math.round(3 + gauss() * .8), 1, 4)); return o; })() };
  });
  const total = r => (r.ca1 || 0) + (r.ca2 || 0) + (r.exam || 0);
  const GRADES = [[75, 'A1', 'Excellent'], [70, 'B2', 'Very good'], [65, 'B3', 'Good'], [60, 'C4', 'Credit'], [55, 'C5', 'Credit'], [50, 'C6', 'Credit'], [45, 'D7', 'Pass'], [40, 'E8', 'Pass'], [0, 'F9', 'Fail']];
  const grade = t => GRADES.find(g => t >= g[0]);
  const RESULT_STATUS = { P3: 'Published', P5: 'Approved', P4: 'Submitted', JS1: 'Submitted', JS2: 'Draft', JS3: 'Draft', SS1: 'Draft', SS2: 'Submitted', SS3: 'Draft', P1: 'Published', P2: 'Approved', P6: 'Draft', CR: 'Published', N1: 'Approved', N2: 'Submitted' };

  /* ---------- Attendance (today's registers) ---------- */
  const REG = {}, REG_SAVED = {};
  CLASSES.forEach(c => { REG[c.id] = {}; studentsIn(c.id).forEach(s => REG[c.id][s.id] = R() < .93 ? 'P' : (R() < .5 ? 'A' : 'L')); REG_SAVED[c.id] = !['JS2', 'P4', 'SS1', 'N1'].includes(c.id); });

  /* ---------- Fees ---------- */
  const FEE_STRUCT = {
    Nursery: [['Tuition', 40000], ['Activity and snacks', 5000]],
    Primary: [['Tuition', 55000], ['Books and stationery', 10000], ['PTA levy', 3000]],
    JSS: [['Tuition', 70000], ['Examination fee', 7500], ['ICT fee', 5000], ['PTA levy', 3000]],
    SS: [['Tuition', 80000], ['Examination fee', 10000], ['ICT and laboratory', 12000], ['PTA levy', 3000]],
  };
  const feeKey = id => { const c = cls(id); return c.sec === 'Nursery' ? 'Nursery' : c.sec === 'Primary' ? 'Primary' : id.startsWith('JS') ? 'JSS' : 'SS'; };
  const feeTotal = id => FEE_STRUCT[feeKey(id)].reduce((a, b) => a + b[1], 0);
  const METHODS = ['Bank transfer', 'Bank transfer', 'Card (Paystack)', 'POS', 'Cash'];
  const PAYMENTS = [], INVOICES = {};
  let rcpt = 1000;
  STUDENTS.forEach((s, i) => {
    const total = feeTotal(s.classId), disc = (i % 37 === 5) ? Math.round(total * .5) : 0, net = total - disc, r = s.sn === 'Salami' ? .6 : R();
    const paid = r < .52 ? net : r < .82 ? Math.round(net * (rnd(30, 80) / 100) / 500) * 500 : 0;
    INVOICES[s.id] = { total, discount: disc, net, paid, note: disc ? 'Staff child discount' : '' };
    if (paid > 0) { const parts = paid === net || R() < .5 ? 1 : 2; let left = paid; for (let k = 0; k < parts; k++) { const amt = k === parts - 1 ? left : Math.round(left / 2 / 500) * 500; left -= amt; PAYMENTS.push({ id: 'R' + (++rcpt), sid: s.id, amt, method: pick(METHODS), week: clamp(rnd(1, WEEK), 1, WEEK), date: new Date(TERM_START.getTime() + (rnd(0, WEEK * 7 - 3)) * 864e5), by: 'Bursar' }); } }
  });
  PAYMENTS.sort((a, b) => b.date - a.date);

  /* ---------- Admissions ---------- */
  const STAGES = ['Applied', 'Exam booked', 'Offer sent', 'Admitted'];
  const APPLICANTS = [
    ['Safiyyah Ozigi', 'Nursery 1', 'Applied', 'Online'], ['Hamdan Garuba', 'Primary 1', 'Applied', 'Walk-in'], ['Oiza Attah', 'JSS 1', 'Applied', 'Online'],
    ['Zakariyya Momoh', 'Primary 5', 'Exam booked', 'Online'], ['Basirat Sani', 'JSS 1', 'Exam booked', 'Walk-in'], ['Idris Obaje', 'SS 1', 'Exam booked', 'Online'],
    ['Nafisat Bello', 'Primary 3', 'Offer sent', 'Online'], ['Musa Lawal', 'Nursery 2', 'Offer sent', 'Walk-in'], ['Ramatu Yahaya', 'JSS 2', 'Admitted', 'Online'],
  ].map((a, i) => ({ id: 'A' + (i + 1), name: a[0], cls: a[1], stage: a[2], via: a[3], date: new Date(2026, 8, 20 + i), guardian: pick(GUARDIANS).name, phone: phone(), docs: rnd(2, 4), score: a[2] === 'Applied' ? null : rnd(48, 91) }));

  /* ---------- Staff leave, comms, notices, events ---------- */
  const LEAVE = [
    { id: 'L1', who: 'T09', type: 'Sick leave', from: '12 Oct', to: '14 Oct', days: 3, status: 'Pending' },
    { id: 'L2', who: 'T14', type: 'Annual leave', from: '19 Oct', to: '23 Oct', days: 5, status: 'Pending' },
    { id: 'L3', who: 'T21', type: 'Compassionate', from: '8 Oct', to: '9 Oct', days: 2, status: 'Approved' },
  ];
  const NOTICES = [
    { id: 'N1', title: 'Parents and teachers meeting', body: 'Primary section meeting holds on Wednesday 14 October at 10:00 in the school hall. Please come with your ward\'s CA1 sheet.', who: 'Mrs. Fatima Momoh', date: '8 Oct', pin: true },
    { id: 'N2', title: 'Inter-house sports', body: 'The inter-house sports comes up on Friday 16 October. Pupils wear their house colours and PE kit.', who: 'Sports committee', date: '6 Oct' },
    { id: 'N3', title: 'Mid-term break', body: 'School closes for mid-term break on Friday 16 October and resumes on Monday 26 October.', who: 'Administration', date: '2 Oct' },
    { id: 'N4', title: 'Fee reminder', body: 'Outstanding first term fees should be cleared before the examination week. Pay online or at the bursar\'s office.', who: 'Bursar', date: '30 Sep' },
  ];
  const SENT = [
    { id: 'M1', aud: 'All parents', ch: ['SMS', 'App'], text: 'Mid-term break begins Friday 16 October. School resumes Monday 26 October.', date: '2 Oct, 09:14', n: 0, ok: 0 },
    { id: 'M2', aud: 'Primary 4 parents', ch: ['WhatsApp'], text: 'Please bring the science project on Monday.', date: '1 Oct, 14:02', n: 0, ok: 0 },
    { id: 'M3', aud: 'Parents with balances', ch: ['SMS', 'Email'], text: 'Dear parent, a balance remains on your ward\'s first term fees. Kindly clear it before 30 October.', date: '30 Sep, 11:40', n: 0, ok: 0 },
  ];
  const EVENTS = [
    { d: 1, t: 'Independence Day', k: 'holiday' }, { d: 14, t: 'Parents and teachers meeting', k: 'meeting' }, { d: 16, t: 'Inter-house sports', k: 'event' },
    { d: 19, t: 'Mid-term break', k: 'holiday', to: 23 }, { d: 26, t: 'School resumes', k: 'event' }, { d: 29, t: 'CA 2 begins', k: 'exam' },
  ];

  /* ---------- Library ---------- */
  const BOOKS = [
    ['Basic Science for JSS 2', 'Ministry approved text', 'Textbook', 6], ['Mathematics for JSS 1', 'Ministry approved text', 'Textbook', 5], ['English Grammar in Use', 'Raymond Murphy', 'Reference', 3],
    ['Oliver Twist', 'Charles Dickens', 'Fiction', 2], ['Gulliver\'s Travels', 'Jonathan Swift', 'Fiction', 2], ['Treasure Island', 'R. L. Stevenson', 'Fiction', 3],
    ['Stories of the Prophets', 'Collected', 'Islamic', 4], ['Hadith for Children', 'Collected', 'Islamic', 4], ['Atlas of Nigeria', 'Ministry approved text', 'Reference', 2],
    ['Computer Studies for Beginners', 'Ministry approved text', 'Textbook', 5], ['The Wonderful Wizard of Oz', 'L. Frank Baum', 'Fiction', 2], ['Oxford Advanced Dictionary', 'Oxford', 'Reference', 3],
  ].map((b, i) => ({ id: 'B' + String(i + 1).padStart(3, '0'), title: b[0], author: b[1], cat: b[2], copies: b[3], out: 0 }));
  const LOANS = [];
  [[2, 'S012', 3], [4, 'S044', -4], [6, 'S071', 9], [0, 'S101', -11], [7, 'S120', 6], [3, 'S133', -2], [9, 'S150', 11], [10, 'S158', -7]].forEach((l, i) => { const st = STUDENTS[parseInt(l[1].slice(1)) - 1] || STUDENTS[i]; LOANS.push({ id: 'LN' + (i + 1), bid: BOOKS[l[0]].id, sid: st.id, due: new Date(TODAY.getTime() + l[2] * 864e5), returned: false }); BOOKS[l[0]].out++; });

  /* ---------- Health ---------- */
  const SICKBAY = [
    ['Headache and fever', 'Rested 40 minutes, paracetamol per school protocol, parent called', 'Sent home'], ['Scraped knee at break', 'Wound cleaned and dressed', 'Back to class'], ['Stomach ache', 'Rested, water given, monitored', 'Back to class'],
    ['Nosebleed', 'Cold compress, rested 20 minutes', 'Back to class'], ['Dizziness in assembly', 'Rested, snack given, parent called', 'Sent home'], ['Asthma attack, mild', 'Own inhaler used under supervision', 'Back to class'], ['Eye irritation', 'Rinsed with clean water, referred to clinic', 'Referred'],
  ].map((v, i) => ({ id: 'V' + (i + 1), sid: STUDENTS[(i * 23 + 7) % STUDENTS.length].id, complaint: v[0], action: v[1], outcome: v[2], date: new Date(TODAY.getTime() - i * 864e5 * 1.3), notified: v[2] !== 'Back to class' }));
  const DISCIPLINE = [
    { sid: STUDENTS[63].id, note: 'Late to school three times this week. Spoken to with guardian.', pts: -1, date: '7 Oct' },
    { sid: STUDENTS[90].id, note: 'Helped a younger pupil find the lost bag. Commended by the principal.', pts: 3, date: '6 Oct' },
    { sid: STUDENTS[112].id, note: 'Counselling session on exam anxiety, follow-up next week.', pts: 0, date: '5 Oct', counselling: true },
  ];

  /* ---------- Inventory ---------- */
  const STOCK = [
    ['Uniform shirt, primary (age 6-8)', 'Uniforms', 42, 20, 3500], ['Uniform shirt, secondary', 'Uniforms', 18, 25, 4200], ['Pinafore, nursery', 'Uniforms', 9, 15, 4800], ['PE T-shirt', 'Uniforms', 60, 30, 2500], ['Exercise book, 40 leaves', 'Books', 340, 200, 250],
    ['Exercise book, 80 leaves', 'Books', 120, 150, 400], ['Chalk (box)', 'Stationery', 14, 10, 1200], ['Whiteboard markers (pack)', 'Stationery', 6, 8, 2800], ['A4 paper (ream)', 'Stationery', 22, 12, 6500], ['Report card folders', 'Stationery', 210, 100, 450],
  ].map((s, i) => ({ id: 'I' + (i + 1), name: s[0], cat: s[1], qty: s[2], min: s[3], price: s[4] }));
  const PURCHASES = [
    { id: 'PR1', item: 'Secondary uniform shirts, 40 pieces', by: 'Mr. Idris Aliyu', est: 168000, status: 'Pending' }, { id: 'PR2', item: 'Exercise books 80 leaves, 200 pieces', by: 'Mr. Idris Aliyu', est: 80000, status: 'Pending' },
    { id: 'PR3', item: 'Whiteboard markers, 10 packs', by: 'Miss Amina Obaje', est: 28000, status: 'Approved' }, { id: 'PR4', item: 'Nursery pinafores, 20 pieces', by: 'Mr. Idris Aliyu', est: 96000, status: 'Approved' },
  ];

  /* ---------- Lessons and assignments ---------- */
  const NOTES = [
    { id: 'LN1', cls: 'JS2', sub: 'Mathematics', title: 'Linear equations: week 5 notes', by: 'T07', date: '5 Oct', type: 'Lesson note' }, { id: 'LN2', cls: 'JS2', sub: 'Mathematics', title: 'Assignment 3: solving for x', by: 'T07', date: '6 Oct', type: 'Assignment', due: '13 Oct' },
    { id: 'LN3', cls: 'P4', sub: 'Basic Science', title: 'Parts of a plant: lesson plan', by: STAFF[10].id, date: '4 Oct', type: 'Lesson note' }, { id: 'LN4', cls: 'P4', sub: 'English Language', title: 'Reading comprehension homework', by: STAFF[10].id, date: '7 Oct', type: 'Assignment', due: '12 Oct' },
    { id: 'LN5', cls: 'JS2', sub: 'English Language', title: 'Essay: my school, due Monday', by: 'T22', date: '2 Oct', type: 'Assignment', due: '12 Oct' }, { id: 'LN6', cls: 'SS1', sub: 'Biology', title: 'Cell structure: scheme of work', by: 'T23', date: '1 Oct', type: 'Scheme of work' },
  ];

  /* ---------- Timetable ---------- */
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], PERIODS = ['8:00', '8:40', '9:20', '10:20', '11:00', '11:40', '12:20'];
  const TT = {};
  const subjTeacher = { 'English Language': 'T22', 'Basic Science': 'T23', 'Islamic Studies': 'T24', 'Computer Studies': 'T25', 'Mathematics': 'T07', 'Social Studies': 'T17', 'Civic Education': 'T18', 'Business Studies': 'T19' };
  ['JS1', 'JS2', 'JS3'].forEach((c, ci) => {
    const subs = SUBJECTS.JSS; TT[c] = [];
    DAYS.forEach((d, di) => { TT[c][di] = []; PERIODS.forEach((p, pi) => { if (pi === 3) { TT[c][di][pi] = { brk: true }; return; } const s = subs[(di * 3 + pi + ci * 2) % subs.length]; TT[c][di][pi] = { sub: s, t: subjTeacher[s] }; }); });
  });
  TT.JS1[1][2] = { sub: 'Mathematics', t: 'T07' }; TT.JS2[1][2] = { sub: 'Mathematics', t: 'T07' }; TT.JS3[1][2] = { sub: 'Basic Science', t: 'T23' }; /* planted clash for the demo */

  /* ---------- Audit ---------- */
  const AUDIT = [
    { t: '09 Oct, 08:41', who: 'Mrs. Rukayat Abdullahi', act: 'Approved results', obj: 'Primary 3, first term CA1' }, { t: '09 Oct, 08:12', who: 'Mr. Suleiman Garuba', act: 'Recorded payment', obj: '₦35,000, receipt R1102' },
    { t: '08 Oct, 15:30', who: 'Mr. Ojima Adejoh', act: 'Changed score', obj: 'JSS 2 Mathematics, CA1, 14 to 16' }, { t: '08 Oct, 11:05', who: 'Miss Oiza Lawal', act: 'Created application', obj: 'Safiyyah Ozigi, Nursery 1' },
    { t: '07 Oct, 17:00', who: 'System', act: 'Backup completed', obj: 'Daily, 48 MB, stored off-site' }, { t: '07 Oct, 09:20', who: 'Mrs. Maryam Jimoh', act: 'Opened health record', obj: 'Restricted' },
  ];
  const audit = (act, obj, who) => AUDIT.unshift({ t: '09 Oct, ' + new Date().toTimeString().slice(0, 5), who: who || (window.S ? S.who() : 'User'), act, obj });

  /* ---------- Derived helpers ---------- */
  const money = n => '₦' + Math.round(n).toLocaleString('en-NG');
  const secOf = id => cls(id).sec;
  const owing = s => INVOICES[s.id].net - INVOICES[s.id].paid;
  const classAvg = id => { const st = studentsIn(id); return st.length ? Math.round(st.reduce((a, s) => a + s.att, 0) / st.length) : 0; };
  SENT.forEach(m => { m.n = m.aud === 'All parents' ? GUARDIANS.length : m.aud === 'Primary 4 parents' ? studentsIn('P4').length : STUDENTS.filter(s => owing(s) > 0).length; m.ok = Math.round(m.n * .97); });

  window.DB = { TODAY, TERM_START, WEEK, SESSION, TERM, CLASSES, cls, prevOf, SUBJECTS, subjectsFor, SKILLS, RATINGS, STAFF, teacherOf, STUDENTS, GUARDIANS, gOf, studentsIn, CHILDREN, SCORES, PREV, SKILLRATE, total, grade, GRADES, RESULT_STATUS, REG, REG_SAVED, FEE_STRUCT, feeKey, feeTotal, PAYMENTS, INVOICES, STAGES, APPLICANTS, LEAVE, NOTICES, SENT, EVENTS, BOOKS, LOANS, SICKBAY, DISCIPLINE, STOCK, PURCHASES, NOTES, DAYS, PERIODS, TT, AUDIT, audit, money, secOf, owing, classAvg, rnd, pick, R, METHODS, phone };
})();
