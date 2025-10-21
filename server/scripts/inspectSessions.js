(async()=>{
  const base='http://localhost:5000';
  const fetchJson=async(u,o={})=>{const r=await fetch(u,o);const t=await r.text();let j=null;try{j=JSON.parse(t)}catch{};return {status:r.status,json:j,text:t}};
  const login=async(e,p)=>{const r=await fetchJson(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p})});if(r.status!==200) throw new Error('login failed');return r.json.token};
  const token=await login('xerontitan90@gmail.com','Test123!');
  const subs=await fetchJson(base+'/api/subjects',{headers:{Authorization:token}});
  const subj=(subs.json.subjects||subs.json)[0];
  const sessions=await fetchJson(base+`/api/subjects/${subj._id}/sessions`,{headers:{Authorization:token}});
  const arr=sessions.json.sessions||[];
  const last=arr.find(s=>s.sessionType==='qr')||arr[0];
  console.log('subjects:',(subs.json.subjects||subs.json).length,'sessions:',arr.length,'last.presentCount',last?.presentCount,'id',last?._id);
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});

