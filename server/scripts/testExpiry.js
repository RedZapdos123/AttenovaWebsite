(async()=>{
  const mongoose=require('mongoose');
  const Attendance=require('../models/Attendance');
  const base='http://localhost:5000';
  const fetchJson=async(u,o={})=>{const r=await fetch(u,o);const t=await r.text();let j=null;try{j=JSON.parse(t)}catch{};return {status:r.status,json:j,text:t}};
  const login=async(e,p)=>{const r=await fetchJson(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p})});if(r.status!==200)throw new Error('login failed');return r.json.token};
  const profToken=await login('xerontitan90@gmail.com','Test123!');
  const subs=await fetchJson(base+'/api/subjects',{headers:{Authorization:profToken}});
  const subj=(subs.json.subjects||subs.json)[0];
  const gen=await fetchJson(base+'/api/attendance/generate',{method:'POST',headers:{'Content-Type':'application/json',Authorization:profToken},body:JSON.stringify({subjectId:subj._id,subject:subj.subjectName,year:subj.year,section:subj.section,attendanceCount:1,expiryTime:1})});
  const {token}=gen.json;console.log('token',token);
  await mongoose.connect('mongodb://localhost:27017/attendance');
  await Attendance.updateOne({token,student:null},{$set:{expiration:Date.now()-10000}});
  await mongoose.disconnect();
  const studentToken=await login('iib2024001@iiita.ac.in','Test123!');
  const mark=await fetchJson(base+'/api/attendance/mark',{method:'POST',headers:{'Content-Type':'application/json',Authorization:studentToken},body:JSON.stringify({token})});
  console.log('expired mark:',mark.status,mark.json||mark.text);
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});

