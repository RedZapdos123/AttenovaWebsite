#!/usr/bin/env python3
# This program seeds the MongoDB database with demo users, subjects, and attendance data for local testing.

import sys
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
import bcrypt
from pymongo import MongoClient
from bson.objectid import ObjectId

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/attendance')
SALT_ROUNDS = 10
DB_NAME = 'attendance'

# Initialize MongoDB client
client = None
db = None


def connect():
    """Connect to MongoDB."""
    global client, db
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        # Test connection
        db.command('ping')
        print(f"Connected to MongoDB at {MONGO_URI}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        sys.exit(1)


def close_connection():
    """Close MongoDB connection."""
    if client:
        client.close()
        print("MongoDB connection closed.")


def clear_all():
    """Clear all collections."""
    print("Clearing existing data...")
    db['attendances'].delete_many({})
    db['attendancesessions'].delete_many({})
    db['subjects'].delete_many({})
    db['users'].delete_many({})


def hash_password(password):
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt(rounds=SALT_ROUNDS)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def rand_int(min_val, max_val):
    """Generate random integer between min and max (inclusive)."""
    return random.randint(min_val, max_val)


def random_past_date(days_back=21):
    """Generate random date in the past."""
    now = datetime.now()
    delta_days = rand_int(0, days_back)
    past_date = now - timedelta(days=delta_days)
    # Randomize hour/minute for better spread
    past_date = past_date.replace(
        hour=rand_int(8, 16),
        minute=rand_int(0, 59),
        second=rand_int(0, 59),
        microsecond=0
    )
    return past_date


def create_professors():
    """Create professor accounts."""
    print("Creating professors...")
    profs = [
        {'name': 'Dr. Rajesh Kumar', 'email': 'rajesh.kumar@iiita.ac.in'},
        {'name': 'Dr. Priya Sharma', 'email': 'priya.sharma@iiita.ac.in'},
        {'name': 'Dr. Amit Patel', 'email': 'amit.patel@iiita.ac.in'},
        {'name': 'Dr. Neha Gupta', 'email': 'neha.gupta@iiita.ac.in'},
        {'name': 'Dr. Vikram Singh', 'email': 'vikram.singh@iiita.ac.in'},
        {'name': 'Dr. Sanskriti Wakale', 'email': 'sanskriti.wakale@iiita.ac.in'},
        {'name': 'Prof. Xeron Titan', 'email': 'xerontitan90@gmail.com'},
        {'name': 'Prof. Arjun Verma', 'email': 'xerontitan99@gmail.com'},
    ]
    
    password_hash = hash_password('Test123!')
    docs = []
    for p in profs:
        docs.append({
            'name': p['name'],
            'email': p['email'],
            'password': password_hash,
            'role': 'professor',
            'isActive': True,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        })
    
    result = db['users'].insert_many(docs)
    saved = list(db['users'].find({'role': 'professor'}))
    print(f"Professors created: {len(saved)}")
    return saved


def create_administrators():
    """Create administrator accounts."""
    print("Creating administrators...")
    admins = [
        {'name': 'Mridankan Mandal', 'email': 'admin@iiita.ac.in'},
        {'name': 'Deepak Sharma', 'email': 'coordinator@iiita.ac.in'},
    ]
    
    password_hash = hash_password('Test123!')
    docs = []
    for a in admins:
        docs.append({
            'name': a['name'],
            'email': a['email'],
            'password': password_hash,
            'role': 'administrator',
            'isActive': True,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        })
    
    db['users'].insert_many(docs)
    saved = list(db['users'].find({'role': 'administrator'}))
    print(f"Administrators created: {len(saved)}")
    return saved


def create_students():
    """Create student accounts."""
    print("Creating students...")
    
    indian_names = [
        'Aarav Sharma', 'Vivaan Patel', 'Aditya Kumar', 'Arjun Singh', 'Rohan Gupta',
        'Ananya Verma', 'Diya Reddy', 'Priya Nair', 'Neha Kapoor', 'Isha Malhotra',
        'Ravi Desai', 'Karan Joshi', 'Nikhil Bhat', 'Sanjay Rao', 'Vikram Iyer',
        'Pooja Saxena', 'Shreya Mishra', 'Anjali Chopra', 'Divya Sinha', 'Kavya Menon',
        'Aryan Nambiar', 'Harsh Pandey', 'Varun Tiwari', 'Akshay Kulkarni', 'Rohit Bhatt',
        'Sneha Dutta', 'Ritika Srivastava', 'Megha Bose', 'Tanvi Jain', 'Swati Yadav',
        'Siddharth Rao', 'Abhishek Singh', 'Manish Kumar', 'Rajesh Verma', 'Suresh Patel',
        'Nisha Sharma', 'Priyanka Gupta', 'Sakshi Reddy', 'Tanya Kapoor', 'Ushma Nair',
        'Yash Desai', 'Zara Khan', 'Arun Iyer', 'Bhavna Joshi', 'Chirag Bhat'
    ]
    
    password_hash = hash_password('Test123!')
    students = []
    existing_emails = set()
    
    # IT students - 1st year, Section A
    for i in range(1, 16):
        num = str(i).zfill(3)
        email = f"iit2024{num}@iiita.ac.in"
        name = indian_names[(i - 1) % len(indian_names)]
        students.append({
            'name': name,
            'email': email,
            'password': password_hash,
            'role': 'student',
            'year': '1st',
            'section': 'A',
            'isActive': True,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        })
        existing_emails.add(email)
    
    # IT students - 2nd year, Section B
    for i in range(1, 16):
        num = str(i + 100).zfill(3)
        email = f"iit2024{num}@iiita.ac.in"
        name = indian_names[(i + 14) % len(indian_names)]
        students.append({
            'name': name,
            'email': email,
            'password': password_hash,
            'role': 'student',
            'year': '2nd',
            'section': 'B',
            'isActive': True,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        })
        existing_emails.add(email)
    
    # ECE students - 3rd year, Section A
    for i in range(1, 13):
        num = str(i).zfill(3)
        email = f"iec2024{num}@iiita.ac.in"
        name = indian_names[(i + 29) % len(indian_names)]
        students.append({
            'name': name,
            'email': email,
            'password': password_hash,
            'role': 'student',
            'year': '3rd',
            'section': 'A',
            'isActive': True,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        })
        existing_emails.add(email)
    
    # ECE students - 4th year, Section D
    for i in range(1, 13):
        num = str(i + 100).zfill(3)
        email = f"iec2024{num}@iiita.ac.in"
        name = indian_names[(i + 41) % len(indian_names)]
        students.append({
            'name': name,
            'email': email,
            'password': password_hash,
            'role': 'student',
            'year': '4th',
            'section': 'D',
            'isActive': True,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        })
        existing_emails.add(email)
    
    # IIB batch - 1st year, Section C
    for i in range(1, 46):
        num = str(i).zfill(3)
        email = f"iib2024{num}@iiita.ac.in"
        if email not in existing_emails:
            name = indian_names[(i - 1) % len(indian_names)]
            students.append({
                'name': name,
                'email': email,
                'password': password_hash,
                'role': 'student',
                'year': '1st',
                'section': 'C',
                'isActive': True,
                'createdAt': datetime.now(),
                'updatedAt': datetime.now()
            })
            existing_emails.add(email)
    
    db['users'].insert_many(students)
    saved = list(db['users'].find({'role': 'student'}))
    print(f"Students created: {len(saved)}")
    return saved


def create_subjects(profs):
    """Create subject records."""
    print("Creating subjects...")
    
    prof_by_email = {p['email']: p for p in profs}
    subjects = [
        {
            'subjectName': 'Data Structures', 'subjectCode': 'IT201',
            'profEmail': 'rajesh.kumar@iiita.ac.in', 'year': '1st', 'section': 'A',
            'description': 'Fundamental data structures including arrays, linked lists, trees, and graphs'
        },
        {
            'subjectName': 'Web Development', 'subjectCode': 'IT202',
            'profEmail': 'priya.sharma@iiita.ac.in', 'year': '1st', 'section': 'A',
            'description': 'Introduction to web technologies including HTML, CSS, JavaScript, and React'
        },
        {
            'subjectName': 'Database Management Systems', 'subjectCode': 'IT301',
            'profEmail': 'amit.patel@iiita.ac.in', 'year': '2nd', 'section': 'B',
            'description': 'Relational databases, SQL, and database design principles'
        },
        {
            'subjectName': 'Operating Systems', 'subjectCode': 'IT302',
            'profEmail': 'neha.gupta@iiita.ac.in', 'year': '2nd', 'section': 'B',
            'description': 'OS concepts including processes, memory management, and file systems'
        },
        {
            'subjectName': 'Digital Signal Processing', 'subjectCode': 'EC301',
            'profEmail': 'vikram.singh@iiita.ac.in', 'year': '3rd', 'section': 'A',
            'description': 'Signal processing fundamentals, Fourier analysis, and filter design'
        },
        {
            'subjectName': 'Microprocessors and Microcontrollers', 'subjectCode': 'EC302',
            'profEmail': 'sanskriti.wakale@iiita.ac.in', 'year': '3rd', 'section': 'D',
            'description': 'Architecture and programming of microprocessors and microcontrollers'
        },
        {
            'subjectName': 'Communication Systems', 'subjectCode': 'EC401',
            'profEmail': 'rajesh.kumar@iiita.ac.in', 'year': '4th', 'section': 'D',
            'description': 'Analog and digital communication systems, modulation techniques'
        },
        {
            'subjectName': 'Embedded Systems', 'subjectCode': 'EC402',
            'profEmail': 'priya.sharma@iiita.ac.in', 'year': '4th', 'section': 'D',
            'description': 'Design and implementation of embedded systems'
        },
        {
            'subjectName': 'Software Engineering', 'subjectCode': 'IB201',
            'profEmail': 'xerontitan90@gmail.com', 'year': '1st', 'section': 'C',
            'description': 'Principles and practices of software engineering'
        },
        {
            'subjectName': 'Cloud Computing', 'subjectCode': 'IB202',
            'profEmail': 'xerontitan90@gmail.com', 'year': '1st', 'section': 'C',
            'description': 'Cloud service models, virtualization, and distributed systems'
        },
        {
            'subjectName': 'Machine Learning', 'subjectCode': 'IB203',
            'profEmail': 'xerontitan99@gmail.com', 'year': '1st', 'section': 'C',
            'description': 'Supervised and unsupervised learning fundamentals'
        },
        {
            'subjectName': 'Business Analytics', 'subjectCode': 'IB204',
            'profEmail': 'sanskriti.wakale@iiita.ac.in', 'year': '1st', 'section': 'C',
            'description': 'Data analysis and business intelligence techniques'
        },
        {
            'subjectName': 'C Programming', 'subjectCode': 'IB101',
            'profEmail': 'amit.patel@iiita.ac.in', 'year': '1st', 'section': 'C',
            'description': 'Introduction to C programming language'
        },
        {
            'subjectName': 'Digital Logic', 'subjectCode': 'IB102',
            'profEmail': 'neha.gupta@iiita.ac.in', 'year': '1st', 'section': 'C',
            'description': 'Number systems, combinational and sequential logic'
        }
    ]
    
    docs = []
    for s in subjects:
        prof = prof_by_email.get(s['profEmail'])
        if not prof:
            raise Exception(f"Professor not found for {s['profEmail']}")
        
        docs.append({
            'subjectName': s['subjectName'],
            'subjectCode': s['subjectCode'],
            'year': s['year'],
            'section': s['section'],
            'professorEmail': prof['email'],
            'professorId': prof['_id'],
            'description': s['description'],
            'isActive': True,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        })
    
    db['subjects'].insert_many(docs)
    saved = list(db['subjects'].find({}))
    print(f"Subjects created: {len(saved)}")
    return saved


def map_marked_by(session_type):
    """Map session type to marked_by value."""
    if session_type == 'qr':
        return 'qr_scan'
    elif session_type == 'manual':
        return 'manual_entry'
    return 'bulk_import'


def create_attendance_for_session(session_doc, subject, students_pool):
    """Create attendance records for a session."""
    # Choose 60-80% present
    percent = rand_int(60, 80)
    count = max(1, int((len(students_pool) * percent) / 100))
    
    shuffled = students_pool.copy()
    random.shuffle(shuffled)
    present_students = shuffled[:count]
    
    attendances = []
    for stu in present_students:
        attendances.append({
            'studentId': stu['_id'],
            'studentEmail': stu['email'],
            'present': True,
            'points': 1,
            'markedAt': session_doc['date'],
            'markedBy': map_marked_by(session_doc['sessionType'])
        })
    
    # Update session with attendances
    db['attendancesessions'].update_one(
        {'_id': session_doc['_id']},
        {'$set': {'attendances': attendances}}
    )
    
    # Create individual Attendance records
    attendance_records = []
    for att in attendances:
        attendance_records.append({
            'token': f"seed-session-{session_doc['_id']}-{att['studentId']}",
            'expiration': int(datetime.now().timestamp() * 1000),
            'subject': subject['subjectName'],
            'subjectId': subject['_id'],
            'year': subject['year'],
            'section': subject['section'],
            'points': att['points'],
            'student': att['studentId'],
            'sessionId': session_doc['_id'],
            'attendanceType': session_doc['sessionType'],
            'professorId': session_doc['professorId'],
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        })
    
    if attendance_records:
        db['attendances'].insert_many(attendance_records)


def create_attendance_sessions(subjects, profs):
    """Create attendance sessions and records."""
    print("Creating attendance sessions...")
    
    name_prefixes = ['Lecture', 'Lab Session', 'Tutorial']
    
    for subject in subjects:
        sessions_to_create = rand_int(8, 12)
        professor = next((p for p in profs if str(p['_id']) == str(subject['professorId'])), None)
        if not professor:
            continue
        
        # Get eligible students
        students = list(db['users'].find({
            'role': 'student',
            'year': subject['year'],
            'section': subject['section']
        }))
        
        if not students:
            continue
        
        for i in range(1, sessions_to_create + 1):
            roll = random.random()
            if roll < 0.4:
                session_type = 'qr'
            elif roll < 0.8:
                session_type = 'manual'
            else:
                session_type = 'bulk'
            
            date = random_past_date(21)
            prefix = name_prefixes[rand_int(0, len(name_prefixes) - 1)]
            session_name = f"{prefix} {i}"
            
            session_doc = {
                'date': date,
                'subjectId': subject['_id'],
                'professorId': professor['_id'],
                'sessionType': session_type,
                'sessionName': session_name,
                'description': f"Seeded {session_type} session on {date.strftime('%Y-%m-%d')}",
                'attendances': [],
                'totalStudents': 0,
                'presentCount': 0,
                'absentCount': 0,
                'isActive': True,
                'createdAt': datetime.now(),
                'updatedAt': datetime.now()
            }
            
            result = db['attendancesessions'].insert_one(session_doc)
            session_doc['_id'] = result.inserted_id
            
            create_attendance_for_session(session_doc, subject, students)
    
    count = db['attendancesessions'].count_documents({})
    print(f"Attendance sessions created: {count}")


def main():
    """Main seeding function."""
    force = '--force' in sys.argv
    
    try:
        connect()
        
        if force:
            clear_all()
        else:
            existing_users = db['users'].count_documents({})
            if existing_users > 0:
                print("Data already exists. Use --force to clear and re-seed.")
                close_connection()
                return
        
        professors = create_professors()
        create_administrators()
        create_students()
        subjects = create_subjects(professors)
        create_attendance_sessions(subjects, professors)
        
        print("Seeding complete!")
    except Exception as e:
        print(f"Seeding failed: {e}")
        sys.exit(1)
    finally:
        close_connection()


if __name__ == '__main__':
    main()

