(async()=>{
  const mongoose=require('mongoose');
  const Subject=require('../models/Subject');
  const AttendanceSession=require('../models/AttendanceSession');
  const User=require('../models/User');
  const mongoUri=process.env.MONGO_URI||'mongodb://localhost:27017/attendance';
  await mongoose.connect(mongoUri);
  const subjects=await Subject.find({subjectCode:{$in:['SE401','CC402','ML403']}}).lean();
  for(const s of subjects){
    const c=await AttendanceSession.countDocuments({subjectId:s._id});
    const sample=await AttendanceSession.find({subjectId:s._id}).sort({date:-1}).limit(3).lean();
    console.log({subject:s.subjectCode, sessions:c, sampleTypes:sample.map(x=>x.sessionType), sampleNames:sample.map(x=>x.sessionName)});
  }
  const studentsC=await User.countDocuments({role:'student',year:'1st',section:'C',email:/^iib2024/});
  console.log({sectionCIIB:studentsC});
  await mongoose.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});

