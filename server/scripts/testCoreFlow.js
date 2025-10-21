(async()=>{
  const mongoose=require('mongoose');
  const AttendanceSession=require('../models/AttendanceSession');
  const base = process.env.API_BASE || 'http://localhost:5000';
  const fetchJson = async (url, opts={}) => { const r = await fetch(url, opts); const t = await r.text(); let j=null; try{ j=JSON.parse(t);}catch{} return {status:r.status, json:j, text:t}; };
  const login = async (email,password)=>{ const r=await fetchJson(`${base}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}); if(r.status!==200) throw new Error(`login failed: ${r.status} ${r.text}`); return r.json.token; };
  const profEmail='xerontitan90@gmail.com', profPass='Test123!';
  const studentEmail='iib2024001@iiita.ac.in', studentPass='Test123!';

  console.log('Login professor...');
  const profToken = await login(profEmail, profPass);
  console.log('Fetch subjects for professor...');
  const subs = await fetchJson(`${base}/api/subjects`,{headers:{Authorization:profToken}});
  if(subs.status!==200 || !Array.isArray(subs.json?.subjects||subs.json)) throw new Error('failed to fetch subjects');
  const subjects = subs.json.subjects || subs.json;
  const subj = subjects[0];
  console.log('Using subject:', subj?.subjectName, subj?._id);

  console.log('Generate QR...');
  const gen = await fetchJson(`${base}/api/attendance/generate`,{
    method:'POST', headers:{'Content-Type':'application/json', Authorization: profToken},
    body: JSON.stringify({
      subjectId: subj._id,
      subject: subj.subjectName,
      year: subj.year,
      section: subj.section,
      attendanceCount: 1,
      expiryTime: 2
    })
  });
  if(gen.status!==200) throw new Error('generate failed: '+gen.text);
  const { token, sessionId } = gen.json;
  console.log('Generated token:', token, 'sessionId:', sessionId);

  console.log('Login student...');
  const studentToken = await login(studentEmail, studentPass);
  console.log('Mark attendance via QR...');
  const mark = await fetchJson(`${base}/api/attendance/mark`,{method:'POST',headers:{'Content-Type':'application/json', Authorization: studentToken}, body: JSON.stringify({ token })});
  console.log('Mark status:', mark.status, mark.json||mark.text);

  // Verify AttendanceSession reflects the attendance
  const mongoUri=process.env.MONGO_URI||'mongodb://localhost:27017/attendance';
  await mongoose.connect(mongoUri);
  const sess = await AttendanceSession.findById(sessionId).lean();
  console.log('Session presentCount:', sess?.presentCount, 'attendances length:', sess?.attendances?.length);
  await mongoose.disconnect();

  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});

