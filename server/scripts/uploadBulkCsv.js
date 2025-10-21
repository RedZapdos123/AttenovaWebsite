(async()=>{
  const fs = require('fs');
  const path = require('path');
  const { Blob } = global;
  const base = process.env.API_BASE || 'http://localhost:5000';
  const csvPath = process.env.CSV || path.join(__dirname, '..', 'test-data', 'bulk_test.csv');

  const fetchJson = async (url, opts={}) => {
    const r = await fetch(url, opts);
    const text = await r.text();
    let json = null; try { json = JSON.parse(text); } catch {}
    return { status: r.status, json, text };
  };

  const login = async (email, password) => {
    const res = await fetchJson(`${base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.status !== 200) throw new Error(`Login failed: ${res.status} ${res.text}`);
    return res.json.token;
  };

  const data = fs.readFileSync(csvPath);
  const blob = new Blob([data], { type: 'text/csv' });
  const form = new FormData();
  form.append('file', blob, 'bulk_test.csv');

  const adminToken = await login('admin@iiita.ac.in','Test123!');
  const res = await fetchJson(`${base}/api/admin/upload-attendance`, {
    method: 'POST', headers: { Authorization: adminToken }, body: form
  });
  console.log('Upload status:', res.status, res.json || res.text);
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});

