# API Documentation (Attenova).

Comprehensive API reference for the QR Scanner Attendance Management System. All endpoints are JSON unless noted.

## Base URL:
- Development (default): http://localhost:5000.
- Frontend dev server: http://localhost:3000 (proxies or calls the base URL).

## Authentication and JWT Usage:
- Obtain a JWT via POST /api/auth/login.
- Send the token with every protected request using the Authorization header:
  - Authorization: Bearer <jwt_token>.
- Token payload (typical): { id: <ObjectId>, role: 'student'|'professor'|'administrator' }.
- Token expiration: ~1 hour (configurable).

## Errors and Conventions:
- Content-Type: application/json.
- Error shape (typical): { "error": "<message>", "code": <optional_code> }.
- Common status codes: 200/201 success, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 429 rate limit, 500 server.

---

## Auth Endpoints:

### POST /api/auth/login:
Authenticate a user and receive a JWT.

Request:
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@iiita.ac.in",
  "password": "Test123!"
}
```

Successful Response (200):
```
{
  "token": "<JWT>",
  "user": { "id": "665f...", "email": "admin@iiita.ac.in", "role": "administrator" }
}
```

Common Errors:
- 400 Invalid credentials.
```
{ "error": "Invalid email or password" }
```
- 401 Account disabled (if applicable).
```
{ "error": "Account disabled" }
```

### GET /api/auth/me:
Get current user profile (requires JWT).

Request:
```
GET /api/auth/me
Authorization: Bearer <JWT>
```

Successful Response (200):
```
{
  "id": "665f...",
  "email": "admin@iiita.ac.in",
  "role": "administrator",
  "name": "Admin User"
}
```

Errors:
- 401 Missing/invalid token.
```
{ "error": "Unauthorized" }
```

---

## Attendance Endpoints:

### POST /api/attendance/generate:
Professor generates a QR token for a session. Optionally set expiry minutes (1–60).

Request:
```
POST /api/attendance/generate
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "subjectId": "666a...",
  "points": 1,
  "expiryMinutes": 10,
  "sessionType": "qr"
}
```

Successful Response (201):
```
{
  "token": "X7Q9-ABCD-1234",
  "expiration": "2025-10-09T10:15:00.000Z",
  "sessionId": "66aa...",
  "subjectId": "666a...",
  "sessionType": "qr"
}
```

Errors:
- 400 Missing required fields / invalid expiry.
```
{ "error": "expiryMinutes must be between 1 and 60" }
```
- 403 Not a professor.
```
{ "error": "Forbidden" }
```

### POST /api/attendance/mark:
Student marks attendance by QR token or manual token.

Request:
```
POST /api/attendance/mark
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "token": "X7Q9-ABCD-1234"
}
```

Successful Response (200):
```
{
  "status": "marked",
  "sessionId": "66aa...",
  "subjectId": "666a...",
  "attendanceId": "66ab..."
}
```

Common Errors:
- 400 Token expired or already used.
```
{ "error": "QR code expired" }
```
- 403 Not a student.
```
{ "error": "Forbidden" }
```

### GET /api/attendance/record:
Get the current student's attendance summary.

Request:
```
GET /api/attendance/record
Authorization: Bearer <JWT>
```

Successful Response (200):
```
{
  "summary": [
    { "subjectId": "666a...", "subjectCode": "SE401", "present": 12, "absent": 3, "points": 12 }
  ],
  "history": [
    { "date": "2025-09-01T08:00:00.000Z", "subjectId": "666a...", "sessionType": "qr" }
  ]
}
```

### POST /api/attendance/mark-manual:
Professor manually marks a student's attendance.

Request:
```
POST /api/attendance/mark-manual
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "studentEmail": "iib2024017@iiita.ac.in",
  "subjectId": "666a...",
  "points": 1
}
```

Successful Response (201):
```
{ "status": "marked", "attendanceId": "66ac..." }
```

### POST /api/attendance/remove-attendance-manual:
Professor removes a previously manual-marked attendance.

Request:
```
POST /api/attendance/remove-attendance-manual
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "attendanceId": "66ac..."
}
```

Successful Response (200):
```
{ "status": "removed" }
```

---

## Subjects Endpoints:

### GET /api/subjects:
List subjects relevant to the requester (professor or student) or all if admin.

Request:
```
GET /api/subjects
Authorization: Bearer <JWT>
```

Successful Response (200):
```
[
  {
    "_id": "666a...",
    "subjectName": "Software Engineering",
    "subjectCode": "SE401",
    "year": "1st",
    "section": "C",
    "professorEmail": "xerontitan90@gmail.com",
    "isActive": true
  }
]
```

Errors:
- 401 Unauthorized (missing/invalid JWT).
- 500 Server error.

---

## Admin Endpoints (administrator role required):

### GET /api/admin/stats:
Dashboard statistics.

Request:
```
GET /api/admin/stats
Authorization: Bearer <JWT>
```

Successful Response (200):
```
{
  "counts": { "professors": 3, "subjects": 6, "students": 45, "sessions": 20 },
  "recentSessions": [
    { "date": "2025-09-10T08:00:00Z", "subjectCode": "SE401", "present": 35 }
  ]
}
```

### GET /api/admin/audit-logs?limit=10&offset=0&action=create-subject:
Paginated audit log viewer with optional action filter.

Request:
```
GET /api/admin/audit-logs?limit=10&offset=0&action=create-subject
Authorization: Bearer <JWT>
```

Successful Response (200):
```
{
  "data": [
    { "action": "create-subject", "actorEmail": "admin@iiita.ac.in", "details": { "subjectCode": "SE401" }, "createdAt": "2025-09-01T10:00:00Z" }
  ],
  "page": { "limit": 10, "offset": 0, "total": 1 }
}
```

### GET /api/admin/export-csv?sessionType=qr:
Export attendance CSV. Returns text/csv.

Request:
```
GET /api/admin/export-csv?sessionType=qr
Authorization: Bearer <JWT>
Accept: text/csv
```

Successful Response (200):
```
HTTP/1.1 200 OK
Content-Type: text/csv

subjectCode,studentEmail,date,sessionType,points
SE401,iib2024017@iiita.ac.in,2025-09-01T08:00:00Z,qr,1
```

### POST /api/admin/create-professor:
Create a professor account.

Request:
```
POST /api/admin/create-professor
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "email": "new.prof@iiita.ac.in",
  "name": "New Professor",
  "password": "Test123!"
}
```

Successful Response (201):
```
{ "id": "66af...", "email": "new.prof@iiita.ac.in" }
```

### POST /api/admin/create-subject:
Create a subject.

Request:
```
POST /api/admin/create-subject
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "subjectName": "Machine Learning",
  "subjectCode": "ML403",
  "year": "1st",
  "section": "C",
  "professorEmail": "xerontitan99@gmail.com"
}
```

Successful Response (201):
```
{ "id": "66b0...", "subjectCode": "ML403" }
```

### POST /api/admin/deactivate-professor:
```
POST /api/admin/deactivate-professor
Authorization: Bearer <JWT>
Content-Type: application/json

{ "email": "xerontitan90@gmail.com", "isActive": false }
```

Successful Response (200):
```
{ "email": "xerontitan90@gmail.com", "isActive": false }
```

### POST /api/admin/deactivate-subject:
```
POST /api/admin/deactivate-subject
Authorization: Bearer <JWT>
Content-Type: application/json

{ "subjectCode": "SE401", "isActive": false }
```

Successful Response (200):
```
{ "subjectCode": "SE401", "isActive": false }
```

Errors (Admin common):
- 403 Forbidden (not administrator).
- 400 Validation error (duplicate email/subject code).
- 404 Entity not found.

---

## Database Schemas (Field-level):

### User (server/models/User.js):
| Field | Type | Required | Validation | Default | Description |
|------|------|----------|------------|---------|-------------|
| email | String | Yes | unique | — | Login and identity |
| password | String | Yes | bcrypt hash | — | Hashed password |
| role | String | Yes | enum: student, professor, administrator | — | Access role |
| name | String | No | — | — | Display name |
| year | String | Cond. | enum: 1st,2nd,3rd,4th (students) | — | Academic year (students) |
| section | String | Cond. | enum: A,B,C,D (students) | — | Section (students) |
| isActive | Boolean | No | — | true | Soft activation flag |
| createdAt | Date | No | — | now | Timestamp |
| updatedAt | Date | No | — | now | Timestamp |

### Subject (server/models/Subject.js):
| Field | Type | Required | Validation | Default | Description |
|------|------|----------|------------|---------|-------------|
| subjectName | String | Yes | — | — | Display name |
| subjectCode | String | Yes | unique | — | Code like SE401 |
| year | String | Yes | enum: 1st,2nd,3rd,4th | — | Target year |
| section | String | Yes | enum: A,B,C,D | — | Target section |
| professorEmail | String | Yes | — | — | Owner professor |
| professorId | ObjectId(User) | No | ref | — | Professor reference |
| description | String | No | — | — | Optional details |
| isActive | Boolean | No | — | true | Soft activation flag |
| createdAt | Date | No | — | now | Timestamp |
| updatedAt | Date | No | — | now | Timestamp |

### AttendanceSession (server/models/AttendanceSession.js):
| Field | Type | Required | Validation | Default | Description |
|------|------|----------|------------|---------|-------------|
| subjectId | ObjectId(Subject) | Yes | ref | — | Session subject |
| professorId | ObjectId(User) | Yes | ref | — | Owning professor |
| date | Date | No | — | now | Session date/time |
| sessionType | String | Yes | enum: qr, manual, bulk | qr | How attendance recorded |
| attendances | [ObjectId(Attendance)] | No | ref | [] | Linked attendance docs |
| totalStudents | Number | No | — | 0 | Snapshot metric |
| presentCount | Number | No | — | 0 | Snapshot metric |
| absentCount | Number | No | — | 0 | Snapshot metric |
| createdAt | Date | No | — | now | Timestamp |
| updatedAt | Date | No | — | now | Timestamp |

### Attendance (server/models/Attendance.js):
| Field | Type | Required | Validation | Default | Description |
|------|------|----------|------------|---------|-------------|
| token | String | Cond. | — | — | QR token (or manual token) |
| expiration | Date | Cond. | — | — | Expiration of QR token |
| subjectId | ObjectId(Subject) | Yes | ref | — | Subject reference |
| sessionId | ObjectId(AttendanceSession) | Yes | ref | — | Session reference |
| student | ObjectId(User) | No | ref | null | Student (null if header row) |
| attendanceType | String | Yes | enum: qr, manual, bulk | qr | Record origin |
| professorId | ObjectId(User) | Yes | ref | — | Issuer (professor) |
| createdAt | Date | No | — | now | Timestamp |
| updatedAt | Date | No | — | now | Timestamp |

### AuditLog (server/models/AuditLog.js):
| Field | Type | Required | Validation | Default | Description |
|------|------|----------|------------|---------|-------------|
| action | String | Yes | — | — | Action verb (e.g., create-subject) |
| actorId | ObjectId(User) | No | ref | — | User performing action |
| actorEmail | String | Yes | — | — | Email of actor |
| details | Mixed/Object | No | — | {} | Context payload |
| createdAt | Date | No | — | now | Timestamp |
| updatedAt | Date | No | — | now | Timestamp |

---

## Rate Limiting:
- Global limiter: 100 requests per 15 minutes per IP (see server/server.js).
- Exceeding returns 429 Too Many Requests with a generic message.

## Network Restrictions (Development):
- collegeNetworkOnly middleware restricts to campus IPs in production configurations; always allows localhost in development.

## Notes:
- Field names and flows reflect the current codebase; see CodebaseIndex.md for file responsibilities and model locations.
- Demo credentials and seed data are defined in server/seedData.js.

