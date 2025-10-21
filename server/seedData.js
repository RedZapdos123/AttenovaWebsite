//This program seeds the MongoDB database with demo users, subjects, and attendance data for local testing.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Subject = require('./models/Subject');
const AttendanceSession = require('./models/AttendanceSession');
const Attendance = require('./models/Attendance');

const SALT_ROUNDS = 10;

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance';

function randInt(min, max) { //Inclusive.
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPastDate(daysBack = 21) {
  const now = new Date();
  const deltaDays = randInt(0, daysBack);
  const d = new Date(now);
  d.setDate(now.getDate() - deltaDays);
  //Randomize hour/minute for better spread.
  d.setHours(randInt(8, 16), randInt(0, 59), randInt(0, 59), 0);
  return d;
}

async function connect() {
  await mongoose.connect(uri, { });
  console.log(`Connected to MongoDB at ${uri}`);
}

async function clearAll() {
  console.log('Clearing existing data...');
  await Attendance.deleteMany({});
  await AttendanceSession.deleteMany({});
  await Subject.deleteMany({});
  await User.deleteMany({});
}

async function createProfessors() {
  console.log('Creating professors...');
  const profs = [
    { name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@iiita.ac.in' },
    { name: 'Dr. Priya Sharma', email: 'priya.sharma@iiita.ac.in' },
    { name: 'Dr. Amit Patel', email: 'amit.patel@iiita.ac.in' },
    { name: 'Dr. Neha Gupta', email: 'neha.gupta@iiita.ac.in' },
    { name: 'Dr. Vikram Singh', email: 'vikram.singh@iiita.ac.in' },
    { name: 'Dr. Sanskriti Wakale', email: 'sanskriti.wakale@iiita.ac.in' },
    //Existing professors.
    { name: 'Prof. Xeron Titan', email: 'xerontitan90@gmail.com' },
    { name: 'Prof. Arjun Verma', email: 'xerontitan99@gmail.com' },
  ];
  const passwordHash = await bcrypt.hash('Test123!', SALT_ROUNDS);
  const docs = [];
  for (const p of profs) {
    docs.push(new User({ name: p.name, email: p.email, password: passwordHash, role: 'professor' }));
  }
  await User.insertMany(docs);
  const saved = await User.find({ role: 'professor' }).lean();
  console.log(`Professors created: ${saved.length}`);
  return saved; //Array with _id, email, name.
}

async function createAdministrators() {
  console.log('Creating administrators...');
  const admins = [
    { name: 'Mridankan Mandal', email: 'admin@iiita.ac.in' },
    { name: 'Deepak Sharma', email: 'coordinator@iiita.ac.in' },
  ];
  const passwordHash = await bcrypt.hash('Test123!', SALT_ROUNDS);
  const docs = admins.map(a => new User({ name: a.name, email: a.email, password: passwordHash, role: 'administrator' }));
  await User.insertMany(docs);
  const saved = await User.find({ role: 'administrator' }).lean();
  console.log(`Administrators created: ${saved.length}`);
  return saved;
}

function padded(num) { return String(num).padStart(3, '0'); }

async function createStudents() {
  console.log('Creating students...');
  const students = [];
  const passHash = await bcrypt.hash('Test123!', SALT_ROUNDS);

  //Realistic Indian student names.
  const indianNames = [
    'Aarav Sharma', 'Vivaan Patel', 'Aditya Kumar', 'Arjun Singh', 'Rohan Gupta',
    'Ananya Verma', 'Diya Reddy', 'Priya Nair', 'Neha Kapoor', 'Isha Malhotra',
    'Ravi Desai', 'Karan Joshi', 'Nikhil Bhat', 'Sanjay Rao', 'Vikram Iyer',
    'Pooja Saxena', 'Shreya Mishra', 'Anjali Chopra', 'Divya Sinha', 'Kavya Menon',
    'Aryan Nambiar', 'Harsh Pandey', 'Varun Tiwari', 'Akshay Kulkarni', 'Rohit Bhatt',
    'Sneha Dutta', 'Ritika Srivastava', 'Megha Bose', 'Tanvi Jain', 'Swati Yadav',
    'Siddharth Rao', 'Abhishek Singh', 'Manish Kumar', 'Rajesh Verma', 'Suresh Patel',
    'Nisha Sharma', 'Priyanka Gupta', 'Sakshi Reddy', 'Tanya Kapoor', 'Ushma Nair',
    'Yash Desai', 'Zara Khan', 'Arun Iyer', 'Bhavna Joshi', 'Chirag Bhat'
  ];

  //Create IT (Information Technology) students - 1st year, Section A.
  for (let i = 1; i <= 15; i++) {
    const num = String(i).padStart(3, '0');
    const rollNumber = `IIT2024${num}`;
    const name = indianNames[(i - 1) % indianNames.length];
    const email = `${rollNumber.toLowerCase()}@iiita.ac.in`;
    students.push({ name, email, password: passHash, role: 'student', year: '1st', section: 'A' });
  }

  //Create IT students - 2nd year, Section B.
  for (let i = 1; i <= 15; i++) {
    const num = String(i + 100).padStart(3, '0');
    const rollNumber = `IIT2024${num}`;
    const name = indianNames[(i + 14) % indianNames.length];
    const email = `${rollNumber.toLowerCase()}@iiita.ac.in`;
    students.push({ name, email, password: passHash, role: 'student', year: '2nd', section: 'B' });
  }

  //Create ECE (Electronics and Communication Engineering) students - 3rd year, Section A.
  for (let i = 1; i <= 12; i++) {
    const num = String(i).padStart(3, '0');
    const rollNumber = `IEC2024${num}`;
    const name = indianNames[(i + 29) % indianNames.length];
    const email = `${rollNumber.toLowerCase()}@iiita.ac.in`;
    students.push({ name, email, password: passHash, role: 'student', year: '3rd', section: 'A' });
  }

  //Create ECE students - 4th year, Section D.
  for (let i = 1; i <= 12; i++) {
    const num = String(i + 100).padStart(3, '0');
    const rollNumber = `IEC2024${num}`;
    const name = indianNames[(i + 41) % indianNames.length];
    const email = `${rollNumber.toLowerCase()}@iiita.ac.in`;
    students.push({ name, email, password: passHash, role: 'student', year: '4th', section: 'D' });
  }

  //Add primary test students and IIB batch (1st year, Section C).
  const existingEmails = new Set(students.map(s => s.email));
  const addIfNew = (s) => { if (!existingEmails.has(s.email)) { students.push(s); existingEmails.add(s.email); } };

  //Add Mridankan Mandal as a student (1st year, Section C).
  addIfNew({ name: 'Mridankan Mandal', email: 'iib2024017@iiita.ac.in', password: passHash, role: 'student', year: '1st', section: 'C' });

  //Add IIB batch (45 students) for 1st year, Section C.
  for (let i = 1; i <= 45; i++) {
    const num = String(i).padStart(3, '0');
    const base = `IIB2024${num}`;
    const email = `${base.toLowerCase()}@iiita.ac.in`;
    const name = indianNames[(i - 1) % indianNames.length];
    addIfNew({ name, email, password: passHash, role: 'student', year: '1st', section: 'C' });
  }

  await User.insertMany(students);
  const saved = await User.find({ role: 'student' }).lean();
  console.log(`Students created: ${saved.length}`);
  return saved;
}

async function createSubjects(profs) {
  console.log('Creating subjects...');
  const profByEmail = Object.fromEntries(profs.map(p => [p.email, p]));
  const subjects = [
    //IT (Information Technology) - 1st year, Section A.
    {
      subjectName: 'Data Structures', subjectCode: 'IT201',
      profEmail: 'rajesh.kumar@iiita.ac.in', year: '1st', section: 'A',
      description: 'Fundamental data structures including arrays, linked lists, trees, and graphs', isActive: true
    },
    {
      subjectName: 'Web Development', subjectCode: 'IT202',
      profEmail: 'priya.sharma@iiita.ac.in', year: '1st', section: 'A',
      description: 'Introduction to web technologies including HTML, CSS, JavaScript, and React', isActive: true
    },
    //IT - 2nd year, Section B.
    {
      subjectName: 'Database Management Systems', subjectCode: 'IT301',
      profEmail: 'amit.patel@iiita.ac.in', year: '2nd', section: 'B',
      description: 'Relational databases, SQL, and database design principles', isActive: true
    },
    {
      subjectName: 'Operating Systems', subjectCode: 'IT302',
      profEmail: 'neha.gupta@iiita.ac.in', year: '2nd', section: 'B',
      description: 'OS concepts including processes, memory management, and file systems', isActive: true
    },
    //ECE (Electronics and Communication Engineering) - 3rd year, Section A.
    {
      subjectName: 'Digital Signal Processing', subjectCode: 'EC301',
      profEmail: 'vikram.singh@iiita.ac.in', year: '3rd', section: 'A',
      description: 'Signal processing fundamentals, Fourier analysis, and filter design', isActive: true
    },
    {
      subjectName: 'Microprocessors and Microcontrollers', subjectCode: 'EC302',
      profEmail: 'sanskriti.wakale@iiita.ac.in', year: '3rd', section: 'D',
      description: 'Architecture and programming of microprocessors and microcontrollers', isActive: true
    },
    //ECE - 4th year, Section D.
    {
      subjectName: 'Communication Systems', subjectCode: 'EC401',
      profEmail: 'rajesh.kumar@iiita.ac.in', year: '4th', section: 'D',
      description: 'Analog and digital communication systems, modulation techniques', isActive: true
    },
    {
      subjectName: 'Embedded Systems', subjectCode: 'EC402',
      profEmail: 'priya.sharma@iiita.ac.in', year: '4th', section: 'D',
      description: 'Design and implementation of embedded systems', isActive: true
    },
    //IB (Information Technology - Business Informatics) - 1st year, Section C.
    {
      subjectName: 'Software Engineering', subjectCode: 'IB201',
      profEmail: 'xerontitan90@gmail.com', year: '1st', section: 'C',
      description: 'Principles and practices of software engineering', isActive: true
    },
    {
      subjectName: 'Cloud Computing', subjectCode: 'IB202',
      profEmail: 'xerontitan90@gmail.com', year: '1st', section: 'C',
      description: 'Cloud service models, virtualization, and distributed systems', isActive: true
    },
    {
      subjectName: 'Machine Learning', subjectCode: 'IB203',
      profEmail: 'xerontitan99@gmail.com', year: '1st', section: 'C',
      description: 'Supervised and unsupervised learning fundamentals', isActive: true
    },
    {
      subjectName: 'Business Analytics', subjectCode: 'IB204',
      profEmail: 'sanskriti.wakale@iiita.ac.in', year: '1st', section: 'C',
      description: 'Data analysis and business intelligence techniques', isActive: true
    },
    {
      subjectName: 'C Programming', subjectCode: 'IB101',
      profEmail: 'amit.patel@iiita.ac.in', year: '1st', section: 'C',
      description: 'Introduction to C programming language', isActive: true
    },
    {
      subjectName: 'Digital Logic', subjectCode: 'IB102',
      profEmail: 'neha.gupta@iiita.ac.in', year: '1st', section: 'C',
      description: 'Number systems, combinational and sequential logic', isActive: true
    }
  ];

  const docs = [];
  for (const s of subjects) {
    const prof = profByEmail[s.profEmail];
    if (!prof) throw new Error(`Professor not found for ${s.profEmail}`);
    docs.push(new Subject({
      subjectName: s.subjectName,
      subjectCode: s.subjectCode,
      year: s.year,
      section: s.section,
      professorEmail: prof.email,
      professorId: prof._id,
      description: s.description,
      isActive: s.isActive
    }));
  }
  await Subject.insertMany(docs);
  const saved = await Subject.find({}).lean();
  console.log(`Subjects created: ${saved.length}`);
  return saved;
}

function mapMarkedBy(sessionType) {
  if (sessionType === 'qr') return 'qr_scan';
  if (sessionType === 'manual') return 'manual_entry';
  return 'bulk_import';
}

async function createAttendanceForSession(sessionDoc, subject, studentsPool) {
  //Choose 60-80% present.
  const percent = randInt(60, 80);
  const count = Math.max(1, Math.floor((studentsPool.length * percent) / 100));
  const shuffled = [...studentsPool].sort(() => Math.random() - 0.5);
  const presentStudents = shuffled.slice(0, count);

  const attendances = presentStudents.map(stu => ({
    studentId: stu._id,
    studentEmail: stu.email,
    present: true,
    points: 1,
    markedAt: sessionDoc.date,
    markedBy: mapMarkedBy(sessionDoc.sessionType)
  }));

  sessionDoc.attendances = attendances;
  await sessionDoc.save();

  //Create individual Attendance records for each present student (compatibility with UI endpoints).
  const attendanceRecords = attendances.map(att => new Attendance({
    token: `seed-session-${sessionDoc._id}-${att.studentId}`,
    expiration: Date.now(),
    subject: subject.subjectName,
    subjectId: subject._id,
    year: subject.year,
    section: subject.section,
    points: att.points,
    student: att.studentId,
    sessionId: sessionDoc._id,
    attendanceType: sessionDoc.sessionType,
    professorId: sessionDoc.professorId,
  }));
  await Attendance.insertMany(attendanceRecords);
}

async function createAttendanceSessions(subjects, profs) {
  console.log('Creating attendance sessions...');
  const namePrefixes = ['Lecture', 'Lab Session', 'Tutorial'];
  for (const subject of subjects) {
    const sessionsToCreate = randInt(8, 12);
    const professor = profs.find(p => String(p._id) === String(subject.professorId));
    if (!professor) continue;

    //Eligible students.
    const students = await User.find({ role: 'student', year: subject.year, section: subject.section }).lean();

    for (let i = 1; i <= sessionsToCreate; i++) {
      const roll = Math.random();
      const sessionType = roll < 0.4 ? 'qr' : roll < 0.8 ? 'manual' : 'bulk';
      const date = randomPastDate(21);
      const prefix = namePrefixes[randInt(0, namePrefixes.length - 1)];
      const sessionName = `${prefix} ${i}`;

      const sessionDoc = new AttendanceSession({
        date,
        subjectId: subject._id,
        professorId: professor._id,
        sessionType,
        sessionName,
        description: `Seeded ${sessionType} session on ${date.toISOString().slice(0,10)}`,
        attendances: []
      });
      await sessionDoc.save();

      await createAttendanceForSession(sessionDoc, subject, students);
    }
  }
  const count = await AttendanceSession.countDocuments();
  console.log(`Attendance sessions created: ${count}`);
}

async function main() {
  const force = process.argv.includes('--force');
  try {
    await connect();

    if (force) {
      await clearAll();
    } else {
      const existingUsers = await User.countDocuments();
      if (existingUsers > 0) {
        console.log('Data already exists. Use --force to clear and re-seed.');
        await mongoose.connection.close();
        return;
      }
    }

    const professors = await createProfessors();
    await createAdministrators();
    const students = await createStudents();
    const subjects = await createSubjects(professors);
    await createAttendanceSessions(subjects, professors);

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

main();

