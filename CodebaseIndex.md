# CodebaseIndex – Attenova QR Scanner Attendance System

A comprehensive developer-oriented map of the Attenova codebase. All paths are relative to the project root.

---

## Project Overview

Attenova is a role-based attendance management system built with:
- **Frontend**: React 18 with Tailwind CSS for responsive UI
- **Backend**: Node.js/Express with MongoDB and Mongoose ODM
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Roles**: Student, Professor, Administrator

---

## Directory Structure

```
.
├── client/                          # React frontend (SPA)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images, logos, SVGs
│   │   │   └── logo.svg             # Placeholder logo (replace with custom)
│   │   ├── components/              # React components
│   │   │   ├── AdminDashboard.js    # Admin dashboard (management, export, audit logs)
│   │   │   ├── ProfessorDashboard.js # Professor dashboard (QR generation, manual attendance)
│   │   │   ├── StudentDashboard.js  # Student dashboard (QR scanning, records, stats)
│   │   │   ├── Login.js             # Login page with role-based redirects
│   │   │   ├── ProtectedRoute.js    # Route guard for role-based access
│   │   │   ├── App.js               # Main app router
│   │   │   └── ui/                  # Reusable UI components
│   │   │       ├── Button.js        # Button component
│   │   │       ├── Input.js         # Input field component
│   │   │       ├── Card.js          # Card layout component
│   │   │       ├── Select.js        # Select dropdown component
│   │   │       ├── Alert.js         # Alert/notification component
│   │   │       └── FileUpload.js    # File upload component
│   │   ├── utils/
│   │   │   └── api.js               # Centralized Axios client with JWT interceptor
│   │   ├── App.js                   # App shell and routing
│   │   └── index.js                 # React entry point
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   └── postcss.config.js            # PostCSS configuration
│
├── server/                          # Node.js/Express backend
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js                  # User model (student, professor, admin)
│   │   ├── Subject.js               # Subject model
│   │   ├── Attendance.js            # Attendance record model
│   │   ├── AttendanceSession.js     # Attendance session model
│   │   └── AuditLog.js              # Audit log model
│   ├── controllers/                 # Business logic
│   │   ├── authController.js        # Authentication (login, signup, profile)
│   │   ├── attendanceController.js  # Attendance operations (QR, manual, records)
│   │   ├── subjectController.js     # Subject operations
│   │   └── adminController.js       # Admin operations (management, export, audit)
│   ├── routes/                      # API route definitions
│   │   ├── auth.js                  # /api/auth routes
│   │   ├── attendance.js            # /api/attendance routes
│   │   ├── subject.js               # /api/subjects routes
│   │   └── admin.js                 # /api/admin routes
│   ├── middleware/                  # Express middleware
│   │   ├── authMiddleware.js        # JWT verification and user attachment
│   │   ├── collegeNetworkOnly.js    # Network access control
│   │   └── errorHandler.js          # Global error handling
│   ├── utils/                       # Utility functions
│   ├── scripts/                     # Utility scripts
│   │   ├── tests/                   # Test scripts
│   │   │   └── enhancements.test.js # Smoke tests for enhancements
│   │   └── (other scripts)
│   ├── server.js                    # Express app initialization
│   ├── seedData.js                  # Database seeding script
│   ├── package.json                 # Backend dependencies
│   └── uploads/                     # Temporary file uploads
│
├── README.md                        # Project overview
├── InstallationAndSetup.md          # Installation guide
├── Usage.md                         # User guide
├── API.md                           # API documentation
├── CodebaseIndex.md                 # This file
├── architecture.puml                # Architecture diagram
└── usecase.puml                     # Use case diagram
```

---

## Key Files by Category

### Models (server/models)

| File | Purpose | Key Exports |
|------|---------|-------------|
| User.js | User schema (student, professor, admin) | User model |
| Subject.js | Subject schema with professor reference | Subject model |
| Attendance.js | Individual attendance record | Attendance model |
| AttendanceSession.js | Attendance session with records | AttendanceSession model |
| AuditLog.js | Administrative action logging | AuditLog model |

**Schema Details**:
- **User**: email (unique), password (hashed), role, name, year, section, isActive, timestamps
- **Subject**: subjectName, subjectCode, year, section, professorId, description, isActive, timestamps
- **Attendance**: token, expiration, subjectId, sessionId, student, attendanceType, professorId, points, timestamps
- **AttendanceSession**: subjectId, professorId, date, sessionType, sessionName, attendances[], totalStudents, presentCount, absentCount, timestamps
- **AuditLog**: action, actorId, actorEmail, details, timestamps

### Controllers (server/controllers)

| File | Purpose | Key Functions |
|------|---------|----------------|
| authController.js | Authentication | signup, login, getProfile |
| attendanceController.js | Attendance operations | generateQR, markAttendance, getRecord, markManual, removeManual |
| subjectController.js | Subject operations | getSubjects, getSubjectsByProfessor |
| adminController.js | Admin operations | createProfessor, createSubject, deactivate*, getStats, getAuditLogs, exportAttendanceCsv, uploadAttendance |

### Routes (server/routes)

| File | Base Path | Key Endpoints |
|------|-----------|---------------|
| auth.js | /api/auth | POST /signup, POST /login, GET /me |
| attendance.js | /api/attendance | POST /generate, POST /mark, GET /record, POST /mark-manual, POST /remove-attendance-manual |
| subject.js | /api/subjects | GET / (list subjects) |
| admin.js | /api/admin | POST /create-professor, POST /create-subject, DELETE /professors/:id, DELETE /subjects/:id, GET /stats, GET /audit-logs, GET /export-csv, POST /upload-attendance |

### Client Components (client/src/components)

| File | Purpose | Key Features |
|------|---------|--------------|
| AdminDashboard.js | Admin interface | Professor/subject management, CSV export with session type filter, audit logs, statistics |
| ProfessorDashboard.js | Professor interface | QR generation (1–60 min expiry), manual attendance, subject management, import/export |
| StudentDashboard.js | Student interface | QR scanning, attendance records with filters, statistics, manual token entry |
| Login.js | Authentication UI | Email/password login, role-based redirects |
| ProtectedRoute.js | Route protection | Role-based access control |
| App.js | App shell | Router setup, route definitions |

---

## Technology Stack

### Backend
- Node.js 18 LTS, Express 4.21, MongoDB 4.4+, Mongoose 8.13
- jsonwebtoken 9.x, bcryptjs 3.x, helmet 6.x, cors 2.8.x
- express-rate-limit 6.7.x, morgan 1.10.x, multer 1.4.5-lts.1
- csv-parser 3.x, csv-writer 1.6.x, dotenv 16.x

### Frontend
- React 18, React Router DOM 6, Tailwind CSS 3.3, Axios 0.27.x
- qrcode.react 4.2.0, react-qr-scanner 1.0.0-alpha.11
- @heroicons/react 2.2.x, clsx 2.1.x

---

## Code Organization Patterns

### Authentication Flow
1. User submits credentials via Login component
2. Frontend calls POST /api/auth/login
3. Backend validates, returns JWT
4. Frontend stores JWT in localStorage
5. Axios interceptor attaches JWT to all requests
6. Backend middleware validates JWT and attaches user to req.user
7. ProtectedRoute guards control access

### Attendance Workflow
1. Professor generates QR code with expiry time (1–60 minutes)
2. Backend creates AttendanceSession and Attendance record
3. Student scans QR or enters token manually
4. Backend validates token expiration and marks attendance
5. Attendance record updated with student reference

### Admin Operations
1. Admin creates/deactivates professors and subjects
2. Each action logged to AuditLog collection
3. Admin exports attendance CSV with optional filters
4. Admin views paginated audit logs with action filtering

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| MONGO_URI | mongodb://localhost:27017/attendance | MongoDB connection |
| PORT | 5000 | Server port |
| JWT_SECRET | your_jwt_secret | JWT signing secret |
| NODE_ENV | development | Environment mode |
| REACT_APP_API_BASE_URL | http://localhost:5000 | Frontend API base URL |

---

For installation, see InstallationAndSetup.md. For API details, see API.md. For usage, see Usage.md.

