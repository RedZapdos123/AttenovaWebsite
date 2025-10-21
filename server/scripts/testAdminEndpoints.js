(async()=>{
  const base = process.env.API_BASE || 'http://localhost:5000';
  const fetchJson = async (url, opts={}) => {
    const r = await fetch(url, opts);
    let bodyText = '';
    try { bodyText = await r.text(); } catch {}
    let json = null;
    try { json = JSON.parse(bodyText); } catch {}
    return { status: r.status, json, text: bodyText };
  };

  const login = async (email, password) => {
    const res = await fetchJson(`${base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.status !== 200) throw new Error(`Login failed for ${email}: ${res.status} ${res.text}`);
    return res.json.token;
  };

  const adminEmail = 'admin@iiita.ac.in';
  const adminPass = 'Test123!';
  const profEmail = 'xerontitan90@gmail.com';
  const profPass = 'Test123!';

  console.log('Logging in as admin...');
  const adminToken = await login(adminEmail, adminPass);
  console.log('Admin token length:', adminToken.length);

  // 2. GET /api/admin/professors (admin)
  let res = await fetchJson(`${base}/api/admin/professors`, { headers: { Authorization: adminToken } });
  console.log('GET /admin/professors (admin):', res.status, 'count:', res.json?.professors?.length);

  // 2b. GET /api/admin/professors (non-admin should be 403)
  console.log('Logging in as professor for negative auth test...');
  const profToken = await login(profEmail, profPass);
  res = await fetchJson(`${base}/api/admin/professors`, { headers: { Authorization: profToken } });
  console.log('GET /admin/professors (prof):', res.status);

  // 3. GET /api/admin/subjects (admin)
  res = await fetchJson(`${base}/api/admin/subjects`, { headers: { Authorization: adminToken } });
  console.log('GET /admin/subjects (admin):', res.status, 'count:', res.json?.subjects?.length);

  // 4. POST /api/admin/professors (admin)
  const uniq = Date.now();
  const newProf = { name: `Test Professor ${uniq}`, email: `test.prof.${uniq}@iiita.ac.in`, password: 'Test123!' };
  res = await fetchJson(`${base}/api/admin/professors`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: adminToken },
    body: JSON.stringify(newProf)
  });
  console.log('POST /admin/professors (admin):', res.status, 'email:', res.json?.professor?.email);
  const createdProfEmail = res.json?.professor?.email;

  // 5. POST /api/admin/subjects (admin)
  const newSubj = { subjectName: 'Admin Test Subject', subjectCode: `AT${uniq}`, year: '1st', section: 'C', professorEmail: createdProfEmail };
  res = await fetchJson(`${base}/api/admin/subjects`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: adminToken },
    body: JSON.stringify(newSubj)
  });
  console.log('POST /admin/subjects (admin):', res.status, 'code:', res.json?.subject?.subjectCode);

  console.log('All admin API tests done.');
  process.exit(0);
})().catch(e => { console.error('Test error:', e); process.exit(1); });

