(async () => {
  const base = process.env.API_BASE || 'http://localhost:5000';

  const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
  };
  const log = (name, ok, extra = '') => {
    console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${extra ? ' :: ' + extra : ''}`);
  };

  const fetchText = async (url, opts = {}) => {
    const r = await fetch(url, opts);
    const text = await r.text();
    return { status: r.status, text, headers: r.headers };
  };
  const fetchJson = async (url, opts = {}) => {
    const r = await fetch(url, opts);
    const t = await r.text();
    let j = null; try { j = JSON.parse(t); } catch {}
    return { status: r.status, json: j, text: t, headers: r.headers };
  };

  let failures = 0;
  const expect = async (name, fn) => {
    try { await fn(); log(name, true); }
    catch (e) { failures++; log(name, false, e.message); }
  };

  const tryLogin = async (email, pw = 'Test123!') => {
    const res = await fetchJson(`${base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pw })
    });
    return res.json?.token || null;
  };

  // Resolve tokens
  const adminToken = await tryLogin('admin@iiita.ac.in') || await tryLogin('coordinator@iiita.ac.in');
  assert(!!adminToken, 'Admin login failed');
  const profToken = await tryLogin('xerontitan90@gmail.com') || await tryLogin('xerontitan99@gmail.com');
  assert(!!profToken, 'Professor login failed');
  const studentToken = await tryLogin('iib2024017@iiita.ac.in') || await tryLogin('iib2024001@iiita.ac.in');
  assert(!!studentToken, 'Student login failed');

  // Pick a subject for professor
  const subs = await fetchJson(`${base}/api/subjects`, { headers: { Authorization: profToken } });
  assert(subs.status === 200 && Array.isArray(subs.json?.subjects) && subs.json.subjects.length, 'No subjects for professor');
  const subject = subs.json.subjects[0];

  // Helpers
  const exportCsv = (params) => fetchText(`${base}/api/admin/export-attendance?${new URLSearchParams(params).toString()}`, { headers: { Authorization: adminToken } });
  const getLogs = (q) => fetchJson(`${base}/api/admin/audit-logs?${new URLSearchParams(q).toString()}`, { headers: { Authorization: adminToken } });
  const postJson = (url, body, token) => fetchJson(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token }, body: JSON.stringify(body) });

  // Enhancement 1: CSV filtering tests
  const paramsBase = { subjectId: subject._id, start: '1970-01-01', end: new Date().toISOString().slice(0,10) };
  const parseTypes = (csv) => {
    const lines = csv.trim().split(/\r?\n/);
    const header = (lines.shift() || '').split(',');
    const idx = header.indexOf('attendanceType');
    if (idx < 0) return [];
    return lines.filter(Boolean).map(line => (line.split(',')[idx]||'').replace(/^\"|\"$/g,''));
  }

  await expect('CSV export - all', async () => {
    const r = await exportCsv(paramsBase);
    assert(r.status === 200, `status=${r.status}`);
    const u = Array.from(new Set(parseTypes(r.text)));
    assert(u.length >= 1, 'no data');
  });
  for (const st of ['qr','manual','bulk']) {
    await expect(`CSV export - ${st}`, async () => {
      const r = await exportCsv({ ...paramsBase, sessionType: st });
      assert(r.status === 200, `status=${r.status}`);
      const u = Array.from(new Set(parseTypes(r.text)));
      assert(u.length === 0 || (u.length === 1 && u[0] === st), `unexpected types: ${u.join(',')}`);
    });
  }
  await expect('CSV export - invalid sessionType falls back to all', async () => {
    const all = await exportCsv(paramsBase);
    const inv = await exportCsv({ ...paramsBase, sessionType: 'invalid' });
    assert(inv.status === 200 && all.text.length === inv.text.length, 'invalid not falling back to all');
  });
  await expect('CSV export - missing subjectId -> 400', async () => {
    const r = await exportCsv({});
    assert(r.status === 400, `status=${r.status}`);
  });
  await expect('CSV export - bad dates -> 400', async () => {
    const r = await exportCsv({ subjectId: subject._id, start: 'bad', end: 'bad' });
    assert(r.status === 400, `status=${r.status}`);
  });

  // Enhancement 2: Audit logs tests (create, filter, paginate)
  const uniq = Date.now();
  const cp = await postJson(`${base}/api/admin/professors`, { name: `T Prof ${uniq}`, email: `t.prof.${uniq}@iiita.ac.in`, password: 'Test123!' }, adminToken);
  await expect('Audit - createProfessor logs', async () => {
    assert(cp.status === 201, `status=${cp.status}`);
    const gl = await getLogs({ page: '1', limit: '5', action: 'createProfessor' });
    assert(gl.status === 200 && gl.json?.total >= 1, 'no createProfessor logs');
    assert(gl.json.logs[0]?.actorId?.email || gl.json.logs[0]?.actorEmail, 'actor not populated');
  });
  let createdSubjectId = null;
  if (cp.json?.professor?.email) {
    const cs = await postJson(`${base}/api/admin/subjects`, { subjectName: `T Subj ${uniq}`, subjectCode: `TS${uniq}`, year: subject.year, section: subject.section, professorEmail: cp.json.professor.email }, adminToken);
    createdSubjectId = cs.json?.subject?._id || null;
    await expect('Audit - createSubject logs', async () => {
      assert(cs.status === 201, `status=${cs.status}`);
      const gl = await getLogs({ page: '1', limit: '5', action: 'createSubject' });
      assert(gl.status === 200 && gl.json?.total >= 1, 'no createSubject logs');
    });
  }
  await expect('Audit - pagination', async () => {
    const p1 = await getLogs({ page: '1', limit: '2' });
    const p2 = await getLogs({ page: '2', limit: '2' });
    assert(p1.status === 200 && p2.status === 200, 'pagination failed');
  });

  // Enhancement 3: QR expiry clamping tests
  const genQR = (m) => postJson(`${base}/api/attendance/generate`, {
    subjectId: subject._id,
    subject: subject.subjectName,
    year: subject.year,
    section: subject.section,
    attendanceCount: 1,
    expiryMinutes: m
  }, profToken);

  for (const [input, expected] of [[1,1], [5,5], [60,60], [0,1], [-5,1], [100,60]]) {
    await expect(`QR expiry clamp ${input} -> ${expected}`, async () => {
      const r = await genQR(input);
      assert(r.status === 200, `status=${r.status}`);
      assert(r.json?.expiryDuration === expected, `got ${r.json?.expiryDuration}`);
    });
  }

  console.log(`\nTESTS DONE with ${failures} failure(s).`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('TEST_RUN_ERROR', e); process.exit(1); });

