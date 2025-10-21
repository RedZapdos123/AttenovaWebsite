(async()=>{
  const mongoose=require('mongoose');
  const Subject=require('../models/Subject');
  const AttendanceSession=require('../models/AttendanceSession');
  const mongoUri=process.env.MONGO_URI||'mongodb://localhost:27017/attendance';
  await mongoose.connect(mongoUri);
  const subj=await Subject.findOne({subjectCode:'SE401'}).lean();
  if(!subj){ console.log('SE401 subject not found'); process.exit(0); }
  const dateStr='2025-10-01';
  const sessions=await AttendanceSession.find({subjectId:subj._id, sessionName:'Test Bulk Session'}).sort({date:-1}).lean();
  console.log('Matching sessions:', sessions.length);
  if(sessions[0]){
    console.log({ id: String(sessions[0]._id), date: sessions[0].date.toISOString(), type: sessions[0].sessionType, presentCount: sessions[0].presentCount });
  }
  await mongoose.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});

