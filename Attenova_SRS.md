# Software Requirements Specification (SRS)
# Attenova - QR-based Attendance Management System

**Version:** 1.0  
**Date:** October 22, 2025  
**Prepared by:** Mridankan Mandal  
**Organization:** IIIT Allahabad

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Other Requirements](#7-other-requirements)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the Attenova QR-based Attendance Management System. It details the functional and non-functional requirements, system features, and technical specifications for the development, deployment, and maintenance of the system. This document is intended for developers, system administrators, quality assurance teams, and stakeholders involved in the project.

### 1.2 Scope

Attenova is a web-based attendance management system designed to streamline the process of recording and tracking student attendance in educational institutions. The system leverages QR code technology to enable quick, contactless attendance marking while providing comprehensive management tools for administrators and professors.

**Key Capabilities:**
- QR code generation and scanning for attendance marking
- Manual attendance entry and bulk CSV upload
- Real-time attendance tracking and analytics
- Role-based access control (Administrator, Professor, Student)
- Comprehensive audit logging and reporting
- CSV export functionality with advanced filtering

**Benefits:**
- Reduces time spent on manual attendance taking
- Eliminates paper-based attendance records
- Provides real-time attendance analytics
- Ensures data accuracy and integrity
- Facilitates remote and hybrid learning scenarios

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface |
| **CSV** | Comma-Separated Values |
| **JWT** | JSON Web Token |
| **QR Code** | Quick Response Code |
| **REST** | Representational State Transfer |
| **SRS** | Software Requirements Specification |
| **UI** | User Interface |
| **UX** | User Experience |
| **CRUD** | Create, Read, Update, Delete |
| **IIIT** | Indian Institute of Information Technology |
| **ODM** | Object Document Mapper |
| **CORS** | Cross-Origin Resource Sharing |

### 1.4 References

- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- MongoDB Documentation: https://docs.mongodb.com/
- React Documentation: https://reactjs.org/docs/
- Express.js Documentation: https://expressjs.com/
- Node.js Documentation: https://nodejs.org/docs/

### 1.5 Overview

This SRS document is organized into seven main sections:
- **Section 1** provides an introduction to the document and the system
- **Section 2** describes the overall system description and context
- **Section 3** details the specific features for each user role
- **Section 4** specifies external interface requirements
- **Section 5** outlines functional requirements
- **Section 6** defines non-functional requirements
- **Section 7** covers additional requirements including database schemas and API endpoints

---

## 2. Overall Description

### 2.1 Product Perspective

Attenova is a standalone web application designed to replace traditional paper-based and manual attendance systems in educational institutions. The system operates as a client-server architecture with the following components:

**System Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Admin UI   │  │ Professor UI │  │  Student UI  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Server Layer (Node.js/Express)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │  QR Service  │  │ Data Service │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer (MongoDB)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │   Subjects   │  │  Attendance  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**System Interfaces:**
- Web browser interface for all user interactions
- RESTful API for client-server communication
- MongoDB database for persistent data storage
- QR code generation and scanning libraries

### 2.2 Product Functions

The system provides the following major functions:

**For Administrators:**
- User management (create, view, deactivate professors and students)
- Subject management (create, view, deactivate subjects)
- Bulk attendance upload via CSV
- Attendance data export with advanced filtering
- Dashboard statistics and analytics
- Audit log viewing and monitoring

**For Professors:**
- QR code generation for attendance sessions
- Manual attendance session creation
- Subject management (create, view, edit subjects)
- Student list viewing by subject
- Attendance session viewing and filtering
- CSV export with session type filters

**For Students:**
- QR code scanning for attendance marking
- Manual token entry for attendance
- Attendance record viewing
- Attendance statistics and analytics
- Subject-wise attendance tracking

### 2.3 User Classes and Characteristics

**Administrator:**
- **Technical Expertise:** High
- **Frequency of Use:** Daily
- **Primary Functions:** System management, user administration, data oversight
- **Privileges:** Full system access, user management, audit log access

**Professor:**
- **Technical Expertise:** Medium
- **Frequency of Use:** Multiple times per week
- **Primary Functions:** Attendance taking, subject management, student tracking
- **Privileges:** Subject CRUD, attendance management, student data access

**Student:**
- **Technical Expertise:** Low to Medium
- **Frequency of Use:** Daily during class sessions
- **Primary Functions:** Attendance marking, record viewing
- **Privileges:** Limited to own attendance data, QR scanning

### 2.4 Operating Environment

**Client-Side Requirements:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Camera access for QR code scanning (optional)
- Internet connection (minimum 1 Mbps)
- Screen resolution: 360x640 minimum (mobile), 1024x768 recommended (desktop)

**Server-Side Requirements:**
- Node.js 18 LTS or higher
- MongoDB 4.4 or higher
- Operating System: Windows 10/11, Linux (Ubuntu 20.04+), macOS 11+
- Minimum 2GB RAM, 10GB storage
- Network connectivity for API access

### 2.5 Design and Implementation Constraints

**Technical Constraints:**
- Must use HTTPS for production deployment
- JWT tokens expire after 1 hour
- QR codes expire between 1-60 minutes (configurable)
- Maximum file upload size: 5MB for CSV files
- Database connection limited to localhost or college network IPs

**Regulatory Constraints:**
- Must comply with data privacy regulations
- Student data must be protected and encrypted
- Audit logs must be maintained for all administrative actions

**Business Constraints:**
- System must be accessible 24/7 with 99% uptime
- Response time must be under 2 seconds for all operations
- Must support concurrent access by 500+ users

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have access to devices with cameras for QR scanning
- Institution has reliable internet connectivity
- MongoDB database is properly configured and accessible
- Users have basic computer literacy

**Dependencies:**
- React 18.x for frontend development
- Express 4.x for backend API
- MongoDB 4.4+ for data persistence
- Mongoose 8.x for ODM
- bcryptjs for password hashing
- jsonwebtoken for authentication
- qrcode library for QR generation
- react-qr-scanner for QR scanning

---

## 3. System Features

### 3.1 Administrator Features

#### 3.1.1 User Management

**Description:** Administrators can create, view, and deactivate professor and student accounts.

**Priority:** High

**Functional Requirements:**
- FR-ADMIN-001: System shall allow administrators to create new professor accounts with name, email, and password
- FR-ADMIN-002: System shall allow administrators to create new student accounts with name, email, password, year, and section
- FR-ADMIN-003: System shall display a searchable list of all professors with pagination
- FR-ADMIN-004: System shall display a searchable list of all students with pagination
- FR-ADMIN-005: System shall allow administrators to deactivate professor accounts
- FR-ADMIN-006: System shall allow administrators to deactivate student accounts
- FR-ADMIN-007: System shall validate email uniqueness before account creation
- FR-ADMIN-008: System shall hash passwords using bcrypt before storage

#### 3.1.2 Subject Management

**Description:** Administrators can create, view, and deactivate subjects across the institution.

**Priority:** High

**Functional Requirements:**
- FR-ADMIN-009: System shall allow administrators to create subjects with name, code, year, section, and professor email
- FR-ADMIN-010: System shall display a searchable list of all subjects with pagination
- FR-ADMIN-011: System shall allow administrators to deactivate subjects
- FR-ADMIN-012: System shall validate professor email exists before subject creation
- FR-ADMIN-013: System shall prevent duplicate subject codes for the same year and section

#### 3.1.3 Dashboard Statistics

**Description:** Administrators can view system-wide statistics and metrics.

**Priority:** Medium

**Functional Requirements:**
- FR-ADMIN-014: System shall display total count of active professors
- FR-ADMIN-015: System shall display total count of active subjects
- FR-ADMIN-016: System shall display total count of active students
- FR-ADMIN-017: System shall display total count of attendance sessions
- FR-ADMIN-018: System shall update statistics in real-time

#### 3.1.4 Bulk Attendance Upload

**Description:** Administrators can upload attendance data in bulk via CSV files.

**Priority:** Medium

**Functional Requirements:**
- FR-ADMIN-019: System shall accept CSV files with columns: studentEmail, subjectCode, date, status, sessionName
- FR-ADMIN-020: System shall validate CSV format and data before processing
- FR-ADMIN-021: System shall create attendance sessions for bulk uploads
- FR-ADMIN-022: System shall provide feedback on successful and failed records
- FR-ADMIN-023: System shall limit CSV file size to 5MB

#### 3.1.5 Attendance Export

**Description:** Administrators can export attendance data to CSV with advanced filtering options.

**Priority:** Medium

**Functional Requirements:**
- FR-ADMIN-024: System shall allow export of attendance data by subject
- FR-ADMIN-025: System shall allow filtering by date range (start date, end date)
- FR-ADMIN-026: System shall allow filtering by session type (QR, Manual, Bulk Upload, All)
- FR-ADMIN-027: System shall generate CSV files with student details and attendance records
- FR-ADMIN-028: System shall include headers in exported CSV files

#### 3.1.6 Audit Logs

**Description:** Administrators can view audit logs of all administrative actions.

**Priority:** High

**Functional Requirements:**
- FR-ADMIN-029: System shall log all professor creation actions
- FR-ADMIN-030: System shall log all subject creation actions
- FR-ADMIN-031: System shall log all professor deactivation actions
- FR-ADMIN-032: System shall log all subject deactivation actions
- FR-ADMIN-033: System shall display audit logs with timestamp, action, admin user, and details
- FR-ADMIN-034: System shall allow filtering audit logs by action type
- FR-ADMIN-035: System shall paginate audit logs (10 records per page)

### 3.2 Professor Features

#### 3.2.1 QR Code Generation

**Description:** Professors can generate QR codes for attendance sessions with customizable expiry times.

**Priority:** High

**Functional Requirements:**
- FR-PROF-001: System shall allow professors to select a subject for QR generation
- FR-PROF-002: System shall allow professors to set attendance points (default: 1)
- FR-PROF-003: System shall allow professors to set QR expiry time (1-60 minutes)
- FR-PROF-004: System shall generate unique QR codes for each session
- FR-PROF-005: System shall display QR code with subject, year, section, points, and expiry time
- FR-PROF-006: System shall create an attendance session record upon QR generation
- FR-PROF-007: System shall prevent QR generation for inactive subjects

#### 3.2.2 Manual Attendance Session

**Description:** Professors can create manual attendance sessions and mark students present/absent.

**Priority:** High

**Functional Requirements:**
- FR-PROF-008: System shall allow professors to select a subject for manual session
- FR-PROF-009: System shall display all students enrolled in the selected subject
- FR-PROF-010: System shall allow professors to mark each student as present or absent
- FR-PROF-011: System shall allow professors to set session name and date
- FR-PROF-012: System shall allow professors to add optional session description
- FR-PROF-013: System shall create attendance session with all marked students
- FR-PROF-014: System shall award points to present students

#### 3.2.3 Subject Management

**Description:** Professors can create and manage their own subjects.

**Priority:** High

**Functional Requirements:**
- FR-PROF-015: System shall allow professors to create subjects with name, code, year, section
- FR-PROF-016: System shall display all subjects created by the professor
- FR-PROF-017: System shall prevent duplicate subject codes for the same professor
- FR-PROF-018: System shall allow professors to view student lists for their subjects
- FR-PROF-019: System shall sort students by name in ascending order

#### 3.2.4 Attendance Session Viewing

**Description:** Professors can view all attendance sessions for their subjects with filtering options.

**Priority:** Medium

**Functional Requirements:**
- FR-PROF-020: System shall display all attendance sessions for professor's subjects
- FR-PROF-021: System shall allow filtering sessions by subject
- FR-PROF-022: System shall allow filtering sessions by date range
- FR-PROF-023: System shall allow filtering sessions by session type (QR, Manual, All)
- FR-PROF-024: System shall display session details including date, name, type, and attendance count
- FR-PROF-025: System shall paginate session list

#### 3.2.5 CSV Export

**Description:** Professors can export attendance data for their subjects to CSV.

**Priority:** Medium

**Functional Requirements:**
- FR-PROF-026: System shall allow professors to export attendance by subject
- FR-PROF-027: System shall allow filtering by date range
- FR-PROF-028: System shall allow filtering by session type
- FR-PROF-029: System shall generate CSV with student details and attendance records
- FR-PROF-030: System shall only export data for professor's own subjects

### 3.3 Student Features

#### 3.3.1 QR Code Scanning

**Description:** Students can scan QR codes to mark attendance.

**Priority:** High

**Functional Requirements:**
- FR-STUD-001: System shall access device camera for QR scanning
- FR-STUD-002: System shall decode QR code and extract token
- FR-STUD-003: System shall validate QR token against active sessions
- FR-STUD-004: System shall check QR expiry before marking attendance
- FR-STUD-005: System shall prevent duplicate attendance for same session
- FR-STUD-006: System shall award points to student upon successful scan
- FR-STUD-007: System shall display success/error messages

#### 3.3.2 Manual Token Entry

**Description:** Students can manually enter QR tokens if scanning fails.

**Priority:** High

**Functional Requirements:**
- FR-STUD-008: System shall provide text input for manual token entry
- FR-STUD-009: System shall validate token format and existence
- FR-STUD-010: System shall check token expiry before marking attendance
- FR-STUD-011: System shall prevent duplicate attendance for same session
- FR-STUD-012: System shall award points to student upon successful submission

#### 3.3.3 Attendance Records

**Description:** Students can view their attendance records with filtering and statistics.

**Priority:** High

**Functional Requirements:**
- FR-STUD-013: System shall display subject-wise attendance summary
- FR-STUD-014: System shall show attended count and total sessions per subject
- FR-STUD-015: System shall calculate and display attendance percentage
- FR-STUD-016: System shall display detailed attendance history table
- FR-STUD-017: System shall show date, subject, type, points, and status for each record
- FR-STUD-018: System shall allow filtering by subject
- FR-STUD-019: System shall allow filtering by attendance type (QR, Manual, All)
- FR-STUD-020: System shall allow searching by subject name

#### 3.3.4 Statistics

**Description:** Students can view attendance statistics and analytics.

**Priority:** Low

**Functional Requirements:**
- FR-STUD-021: System shall display overall attendance percentage
- FR-STUD-022: System shall display subject-wise attendance breakdown
- FR-STUD-023: System shall display attendance trends over time
- FR-STUD-024: System shall highlight subjects with low attendance

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 General UI Requirements

- UI-001: System shall use responsive design for mobile and desktop devices
- UI-002: System shall support screen sizes from 360x640 (mobile) to 1920x1080 (desktop)
- UI-003: System shall use Tailwind CSS for consistent styling
- UI-004: System shall provide dark mode toggle (optional)
- UI-005: System shall display loading indicators for asynchronous operations
- UI-006: System shall show error messages in red with appropriate icons
- UI-007: System shall show success messages in green with appropriate icons
- UI-008: System shall use intuitive navigation with clear labels

#### 4.1.2 Login Interface

- UI-009: System shall provide email and password input fields
- UI-010: System shall provide password visibility toggle
- UI-011: System shall disable submit button until both fields are filled
- UI-012: System shall display validation errors inline
- UI-013: System shall redirect to appropriate dashboard based on user role

#### 4.1.3 Administrator Dashboard

- UI-014: System shall display statistics cards at the top
- UI-015: System shall organize features in collapsible sections
- UI-016: System shall provide search functionality for user and subject lists
- UI-017: System shall display pagination controls for long lists
- UI-018: System shall use tables for audit logs with sortable columns

#### 4.1.4 Professor Dashboard

- UI-019: System shall use tab navigation for different features
- UI-020: System shall display QR code prominently when generated
- UI-021: System shall show subject dropdown for selection
- UI-022: System shall display student lists in scrollable containers
- UI-023: System shall use checkboxes for manual attendance marking

#### 4.1.5 Student Dashboard

- UI-024: System shall use tab navigation for Scanner, Records, and Statistics
- UI-025: System shall display camera preview for QR scanning
- UI-026: System shall show attendance summary cards with percentages
- UI-027: System shall use tables for detailed attendance history
- UI-028: System shall provide filter dropdowns for records

### 4.2 Hardware Interfaces

- HW-001: System shall access device camera for QR code scanning
- HW-002: System shall support both front and rear cameras
- HW-003: System shall handle camera permission requests gracefully
- HW-004: System shall work without camera access (manual token entry)

### 4.3 Software Interfaces

#### 4.3.1 Database Interface

- SW-001: System shall use MongoDB 4.4+ for data persistence
- SW-002: System shall use Mongoose 8.x as ODM
- SW-003: System shall connect to database at mongodb://localhost:27017/attendance
- SW-004: System shall handle database connection errors gracefully

#### 4.3.2 External Libraries

- SW-005: System shall use React 18.x for frontend
- SW-006: System shall use Express 4.x for backend API
- SW-007: System shall use bcryptjs for password hashing
- SW-008: System shall use jsonwebtoken for JWT authentication
- SW-009: System shall use qrcode library for QR generation
- SW-010: System shall use react-qr-scanner for QR scanning
- SW-011: System shall use axios for HTTP requests

### 4.4 Communications Interfaces

- COM-001: System shall use HTTPS for production deployment
- COM-002: System shall use HTTP for development (localhost)
- COM-003: System shall use RESTful API architecture
- COM-004: System shall use JSON for data exchange
- COM-005: System shall include JWT token in Authorization header
- COM-006: System shall handle CORS for cross-origin requests
- COM-007: System shall use WebSocket for real-time updates (future enhancement)

---

## 5. Functional Requirements

### 5.1 Authentication and Authorization

#### 5.1.1 User Registration

- FR-AUTH-001: System shall allow new users to register with email, password, role, and name
- FR-AUTH-002: System shall require year and section for student registration
- FR-AUTH-003: System shall validate email format before registration
- FR-AUTH-004: System shall check email uniqueness before registration
- FR-AUTH-005: System shall hash passwords using bcrypt with salt rounds of 10
- FR-AUTH-006: System shall return success message upon successful registration

#### 5.1.2 User Login

- FR-AUTH-007: System shall authenticate users with email and password
- FR-AUTH-008: System shall compare hashed passwords using bcrypt
- FR-AUTH-009: System shall generate JWT token upon successful login
- FR-AUTH-010: System shall include user ID and role in JWT payload
- FR-AUTH-011: System shall set JWT expiry to 1 hour
- FR-AUTH-012: System shall return token to client upon successful login
- FR-AUTH-013: System shall return error message for invalid credentials

#### 5.1.3 Token Verification

- FR-AUTH-014: System shall verify JWT token for protected routes
- FR-AUTH-015: System shall extract user ID and role from token
- FR-AUTH-016: System shall load user data from database
- FR-AUTH-017: System shall attach user object to request
- FR-AUTH-018: System shall return 401 error for invalid/expired tokens
- FR-AUTH-019: System shall return 403 error for insufficient permissions

#### 5.1.4 Role-Based Access Control

- FR-AUTH-020: System shall restrict administrator routes to administrator role
- FR-AUTH-021: System shall restrict professor routes to professor role
- FR-AUTH-022: System shall restrict student routes to student role
- FR-AUTH-023: System shall prevent cross-role access to resources

### 5.2 QR Code Management

#### 5.2.1 QR Code Generation

- FR-QR-001: System shall generate unique alphanumeric tokens (13 characters)
- FR-QR-002: System shall calculate expiration timestamp based on expiry minutes
- FR-QR-003: System shall clamp expiry minutes between 1 and 60
- FR-QR-004: System shall create attendance session record
- FR-QR-005: System shall create session attendance record with null student
- FR-QR-006: System shall encode token in QR code image
- FR-QR-007: System shall return QR code data URL to client

#### 5.2.2 QR Code Scanning

- FR-QR-008: System shall decode QR code from camera stream
- FR-QR-009: System shall extract token from QR code
- FR-QR-010: System shall validate token against database
- FR-QR-011: System shall check token expiration
- FR-QR-012: System shall check for duplicate attendance
- FR-QR-013: System shall create student attendance record
- FR-QR-014: System shall update attendance session with student data
- FR-QR-015: System shall return success message with points awarded

### 5.3 Attendance Management

#### 5.3.1 Manual Attendance

- FR-ATT-001: System shall allow professors to create manual attendance sessions
- FR-ATT-002: System shall validate subject ownership before session creation
- FR-ATT-003: System shall accept session name, date, and description
- FR-ATT-004: System shall accept array of student attendances with email, present status, and points
- FR-ATT-005: System shall validate student emails against database
- FR-ATT-006: System shall create attendance session record
- FR-ATT-007: System shall create individual attendance records for present students
- FR-ATT-008: System shall award specified points to present students

#### 5.3.2 Bulk Attendance Upload

- FR-ATT-009: System shall accept CSV files with attendance data
- FR-ATT-010: System shall parse CSV and validate format
- FR-ATT-011: System shall validate student emails exist in database
- FR-ATT-012: System shall validate subject codes exist in database
- FR-ATT-013: System shall validate date format (YYYY-MM-DD)
- FR-ATT-014: System shall create attendance sessions for each unique subject-date combination
- FR-ATT-015: System shall create attendance records for all valid entries
- FR-ATT-016: System shall return summary of successful and failed records

#### 5.3.3 Attendance Records

- FR-ATT-017: System shall retrieve all attendance records for a student
- FR-ATT-018: System shall group records by subject
- FR-ATT-019: System shall calculate total points per subject
- FR-ATT-020: System shall calculate attendance percentage per subject
- FR-ATT-021: System shall sort records by creation timestamp
- FR-ATT-022: System shall filter records by subject
- FR-ATT-023: System shall filter records by attendance type

### 5.4 Subject Management

#### 5.4.1 Subject Creation

- FR-SUBJ-001: System shall allow creation of subjects with name, code, year, section
- FR-SUBJ-002: System shall validate subject name is not empty
- FR-SUBJ-003: System shall validate subject code is not empty
- FR-SUBJ-004: System shall validate year and section are provided
- FR-SUBJ-005: System shall check for duplicate subject codes for same professor/year/section
- FR-SUBJ-006: System shall associate subject with professor email and ID
- FR-SUBJ-007: System shall set subject as active by default

#### 5.4.2 Subject Retrieval

- FR-SUBJ-008: System shall retrieve all active subjects for a professor
- FR-SUBJ-009: System shall sort subjects by name in ascending order
- FR-SUBJ-010: System shall retrieve all active subjects for administrators
- FR-SUBJ-011: System shall filter subjects by search query
- FR-SUBJ-012: System shall paginate subject lists

#### 5.4.3 Subject Deactivation

- FR-SUBJ-013: System shall allow administrators to deactivate subjects
- FR-SUBJ-014: System shall set isActive flag to false
- FR-SUBJ-015: System shall log deactivation action in audit logs
- FR-SUBJ-016: System shall prevent access to deactivated subjects

### 5.5 User Management

#### 5.5.1 User Creation

- FR-USER-001: System shall allow administrators to create professor accounts
- FR-USER-002: System shall allow administrators to create student accounts
- FR-USER-003: System shall validate email format and uniqueness
- FR-USER-004: System shall hash passwords before storage
- FR-USER-005: System shall set default password if not provided
- FR-USER-006: System shall log user creation in audit logs

#### 5.5.2 User Retrieval

- FR-USER-007: System shall retrieve all active professors
- FR-USER-008: System shall retrieve all active students
- FR-USER-009: System shall filter users by search query
- FR-USER-010: System shall paginate user lists
- FR-USER-011: System shall sort users by name

#### 5.5.3 User Deactivation

- FR-USER-012: System shall allow administrators to deactivate users
- FR-USER-013: System shall set isActive flag to false
- FR-USER-014: System shall log deactivation action in audit logs
- FR-USER-015: System shall prevent login for deactivated users

### 5.6 Audit Logging

- FR-AUDIT-001: System shall log all professor creation actions
- FR-AUDIT-002: System shall log all subject creation actions
- FR-AUDIT-003: System shall log all professor deactivation actions
- FR-AUDIT-004: System shall log all subject deactivation actions
- FR-AUDIT-005: System shall record timestamp for each log entry
- FR-AUDIT-006: System shall record admin user who performed action
- FR-AUDIT-007: System shall record action type and details
- FR-AUDIT-008: System shall allow filtering logs by action type
- FR-AUDIT-009: System shall paginate audit logs

### 5.7 CSV Export

- FR-EXPORT-001: System shall generate CSV files with attendance data
- FR-EXPORT-002: System shall include headers in CSV files
- FR-EXPORT-003: System shall filter data by subject
- FR-EXPORT-004: System shall filter data by date range
- FR-EXPORT-005: System shall filter data by session type
- FR-EXPORT-006: System shall include student details (name, email, year, section)
- FR-EXPORT-007: System shall include attendance details (date, subject, type, points, status)
- FR-EXPORT-008: System shall set appropriate Content-Type header
- FR-EXPORT-009: System shall set Content-Disposition header for file download

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

- NFR-PERF-001: System shall respond to user requests within 2 seconds under normal load
- NFR-PERF-002: System shall support concurrent access by 500+ users
- NFR-PERF-003: System shall handle 1000+ QR scans per hour
- NFR-PERF-004: System shall load dashboard within 3 seconds
- NFR-PERF-005: System shall generate QR codes within 1 second
- NFR-PERF-006: System shall process CSV uploads within 5 seconds for files up to 5MB
- NFR-PERF-007: System shall export CSV files within 3 seconds for datasets up to 10,000 records
- NFR-PERF-008: Database queries shall execute within 500ms
- NFR-PERF-009: System shall optimize images and assets for fast loading
- NFR-PERF-010: System shall use pagination to limit data transfer

### 6.2 Security Requirements

- NFR-SEC-001: System shall hash all passwords using bcrypt with salt rounds of 10
- NFR-SEC-002: System shall use JWT tokens for authentication
- NFR-SEC-003: System shall set JWT expiry to 1 hour
- NFR-SEC-004: System shall validate JWT tokens on all protected routes
- NFR-SEC-005: System shall implement role-based access control
- NFR-SEC-006: System shall prevent SQL injection attacks (N/A for MongoDB)
- NFR-SEC-007: System shall prevent XSS attacks by sanitizing inputs
- NFR-SEC-008: System shall prevent CSRF attacks using tokens
- NFR-SEC-009: System shall use HTTPS for production deployment
- NFR-SEC-010: System shall restrict database access to localhost or college network IPs
- NFR-SEC-011: System shall log all administrative actions for audit trail
- NFR-SEC-012: System shall validate all user inputs on both client and server
- NFR-SEC-013: System shall limit file upload size to 5MB
- NFR-SEC-014: System shall validate file types for uploads (CSV only)

### 6.3 Usability Requirements

- NFR-USE-001: System shall provide intuitive navigation with clear labels
- NFR-USE-002: System shall use consistent UI design across all pages
- NFR-USE-003: System shall provide helpful error messages
- NFR-USE-004: System shall display loading indicators for asynchronous operations
- NFR-USE-005: System shall support mobile devices with responsive design
- NFR-USE-006: System shall provide keyboard navigation support
- NFR-USE-007: System shall use appropriate color contrast for readability
- NFR-USE-008: System shall provide tooltips for complex features
- NFR-USE-009: System shall minimize number of clicks required for common tasks
- NFR-USE-010: System shall provide search and filter functionality for long lists

### 6.4 Reliability Requirements

- NFR-REL-001: System shall maintain 99% uptime
- NFR-REL-002: System shall handle database connection failures gracefully
- NFR-REL-003: System shall provide meaningful error messages for failures
- NFR-REL-004: System shall log all errors for debugging
- NFR-REL-005: System shall recover from crashes without data loss
- NFR-REL-006: System shall validate all inputs to prevent crashes
- NFR-REL-007: System shall use try-catch blocks for error handling
- NFR-REL-008: System shall implement database transactions for critical operations
- NFR-REL-009: System shall backup database regularly (manual process)
- NFR-REL-010: System shall maintain data integrity across all operations

### 6.5 Maintainability Requirements

- NFR-MAINT-001: System shall use modular architecture for easy updates
- NFR-MAINT-002: System shall follow consistent coding standards
- NFR-MAINT-003: System shall include comments for complex logic
- NFR-MAINT-004: System shall use meaningful variable and function names
- NFR-MAINT-005: System shall separate concerns (MVC pattern)
- NFR-MAINT-006: System shall use version control (Git)
- NFR-MAINT-007: System shall document all API endpoints
- NFR-MAINT-008: System shall provide setup and deployment instructions
- NFR-MAINT-009: System shall use environment variables for configuration
- NFR-MAINT-010: System shall log errors with stack traces for debugging

### 6.6 Scalability Requirements

- NFR-SCALE-001: System shall support horizontal scaling by adding more servers
- NFR-SCALE-002: System shall use stateless API design for load balancing
- NFR-SCALE-003: System shall optimize database queries with indexes
- NFR-SCALE-004: System shall use pagination to limit data transfer
- NFR-SCALE-005: System shall cache frequently accessed data (future enhancement)
- NFR-SCALE-006: System shall support database replication (future enhancement)
- NFR-SCALE-007: System shall handle increasing user base without performance degradation
- NFR-SCALE-008: System shall support multiple concurrent sessions per user

### 6.7 Portability Requirements

- NFR-PORT-001: System shall run on Windows, Linux, and macOS
- NFR-PORT-002: System shall work on all modern web browsers
- NFR-PORT-003: System shall use cross-platform technologies (Node.js, React)
- NFR-PORT-004: System shall avoid platform-specific dependencies
- NFR-PORT-005: System shall use relative paths for file access
- NFR-PORT-006: System shall document platform-specific setup steps

---

## 7. Other Requirements

### 7.1 Database Requirements

#### 7.1.1 User Schema

```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (required, enum: ['student', 'professor', 'administrator']),
  year: String (required for students, e.g., '1st', '2nd', '3rd', '4th'),
  section: String (required for students, e.g., 'A', 'B', 'C', 'D'),
  isActive: Boolean (default: true),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Indexes:**
- email (unique)
- role
- year, section (for students)

#### 7.1.2 Subject Schema

```javascript
{
  subjectName: String (required),
  subjectCode: String (required),
  year: String (required),
  section: String (required),
  professorEmail: String (required),
  professorId: ObjectId (required, ref: 'User'),
  description: String (optional),
  isActive: Boolean (default: true),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Indexes:**
- professorEmail
- subjectCode, year, section (compound)
- isActive

#### 7.1.3 Attendance Schema

```javascript
{
  token: String (required, unique),
  expiration: Date (required),
  subject: String (required),
  subjectId: ObjectId (optional, ref: 'Subject'),
  year: String (required),
  section: String (required),
  points: Number (required, default: 1),
  student: ObjectId (optional, ref: 'User'),
  sessionId: ObjectId (optional, ref: 'AttendanceSession'),
  attendanceType: String (enum: ['qr', 'manual', 'bulk'], default: 'qr'),
  professorId: ObjectId (optional, ref: 'User'),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Indexes:**
- token (unique)
- student
- subjectId
- sessionId
- createdAt

**Notes:**
- Records with student: null represent QR session records
- Records with student: ObjectId represent individual student attendance

#### 7.1.4 AttendanceSession Schema

```javascript
{
  date: Date (required),
  subjectId: ObjectId (optional, ref: 'Subject'),
  professorId: ObjectId (required, ref: 'User'),
  sessionType: String (required, enum: ['qr', 'manual', 'bulk']),
  sessionName: String (required),
  description: String (optional),
  attendances: [{
    studentId: ObjectId (required, ref: 'User'),
    studentEmail: String (required),
    present: Boolean (required, default: true),
    points: Number (required, default: 1),
    markedBy: String (required, enum: ['qr_scan', 'manual_entry', 'bulk_upload'])
  }],
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Indexes:**
- subjectId
- professorId
- date
- sessionType

#### 7.1.5 AuditLog Schema

```javascript
{
  timestamp: Date (required, default: Date.now),
  action: String (required, enum: ['Create Professor', 'Create Subject', 'Deactivate Professor', 'Deactivate Subject']),
  adminUser: String (required),
  details: String (required),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Indexes:**
- timestamp
- action
- adminUser

### 7.2 API Endpoints Documentation

#### 7.2.1 Authentication Endpoints

**POST /api/auth/signup**
- **Description:** Register a new user
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "role": "student|professor|administrator",
    "name": "string",
    "year": "string (required for students)",
    "section": "string (required for students)"
  }
  ```
- **Response:** `{ "message": "User created successfully" }`
- **Status Codes:** 201 (Created), 400 (Bad Request), 500 (Server Error)

**POST /api/auth/login**
- **Description:** Authenticate user and receive JWT token
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** `{ "token": "string" }`
- **Status Codes:** 200 (OK), 400 (Bad Request), 500 (Server Error)

**GET /api/auth/me**
- **Description:** Get current user information
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "id": "string", "email": "string", "role": "string" }`
- **Status Codes:** 200 (OK), 401 (Unauthorized), 500 (Server Error)

#### 7.2.2 Attendance Endpoints

**POST /api/attendance/generate**
- **Description:** Generate QR code for attendance
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "subject": "string",
    "subjectId": "string",
    "year": "string",
    "section": "string",
    "attendanceCount": "number",
    "sessionName": "string",
    "expiryMinutes": "number (1-60)"
  }
  ```
- **Response:**
  ```json
  {
    "token": "string",
    "expiration": "number",
    "expiryDuration": "number",
    "attendanceCount": "number",
    "sessionId": "string",
    "subject": "string",
    "year": "string",
    "section": "string"
  }
  ```
- **Status Codes:** 200 (OK), 400 (Bad Request), 403 (Forbidden), 500 (Server Error)

**POST /api/attendance/mark**
- **Description:** Mark attendance by scanning QR code
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "token": "string"
  }
  ```
- **Response:** `{ "message": "Attendance marked", "points": "number" }`
- **Status Codes:** 200 (OK), 400 (Bad Request), 403 (Forbidden), 500 (Server Error)

**GET /api/attendance/record**
- **Description:** Get student attendance records
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "records": [{
      "subject": "string",
      "totalAttendances": "number",
      "attendancesGiven": "number"
    }]
  }
  ```
- **Status Codes:** 200 (OK), 403 (Forbidden), 500 (Server Error)

**GET /api/attendance/detailed-record**
- **Description:** Get detailed attendance history for student
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "records": [{
      "date": "string",
      "subject": "string",
      "type": "string",
      "points": "number",
      "status": "string"
    }]
  }
  ```
- **Status Codes:** 200 (OK), 403 (Forbidden), 500 (Server Error)

#### 7.2.3 Subject Endpoints

**GET /api/subject**
- **Description:** Get all subjects for professor
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "subjects": [{ ... }] }`
- **Status Codes:** 200 (OK), 403 (Forbidden), 500 (Server Error)

**POST /api/subject**
- **Description:** Create a new subject
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "subjectName": "string",
    "subjectCode": "string",
    "year": "string",
    "section": "string",
    "description": "string (optional)"
  }
  ```
- **Response:** `{ "message": "Subject created successfully", "subject": { ... } }`
- **Status Codes:** 201 (Created), 400 (Bad Request), 403 (Forbidden), 500 (Server Error)

**GET /api/subject/:subjectId/students**
- **Description:** Get students for a specific subject
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "students": [{ ... }], "subject": { ... } }`
- **Status Codes:** 200 (OK), 403 (Forbidden), 404 (Not Found), 500 (Server Error)

**POST /api/subject/manual-attendance**
- **Description:** Create manual attendance session
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "subjectId": "string",
    "sessionName": "string",
    "date": "string (YYYY-MM-DD)",
    "description": "string (optional)",
    "attendances": [{
      "studentEmail": "string",
      "present": "boolean",
      "points": "number"
    }]
  }
  ```
- **Response:** `{ "message": "Manual attendance session created successfully", "session": { ... } }`
- **Status Codes:** 201 (Created), 400 (Bad Request), 403 (Forbidden), 500 (Server Error)

#### 7.2.4 Administrator Endpoints

**POST /api/admin/professor**
- **Description:** Create a new professor account
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** `{ "message": "Professor created successfully" }`
- **Status Codes:** 201 (Created), 400 (Bad Request), 403 (Forbidden), 500 (Server Error)

**GET /api/admin/professors**
- **Description:** Get all professors
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `search`, `page`, `limit`
- **Response:** `{ "professors": [{ ... }], "total": "number" }`
- **Status Codes:** 200 (OK), 403 (Forbidden), 500 (Server Error)

**POST /api/admin/subject**
- **Description:** Create a new subject
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "subjectName": "string",
    "subjectCode": "string",
    "year": "string",
    "section": "string",
    "professorEmail": "string"
  }
  ```
- **Response:** `{ "message": "Subject created successfully" }`
- **Status Codes:** 201 (Created), 400 (Bad Request), 403 (Forbidden), 500 (Server Error)

**GET /api/admin/stats**
- **Description:** Get dashboard statistics
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "professors": "number",
    "subjects": "number",
    "students": "number",
    "sessions": "number"
  }
  ```
- **Status Codes:** 200 (OK), 403 (Forbidden), 500 (Server Error)

**GET /api/admin/audit-logs**
- **Description:** Get audit logs
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `action`, `page`, `limit`
- **Response:** `{ "logs": [{ ... }], "total": "number", "pages": "number" }`
- **Status Codes:** 200 (OK), 403 (Forbidden), 500 (Server Error)

**GET /api/admin/export-csv**
- **Description:** Export attendance data to CSV
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `subjectId`, `startDate`, `endDate`, `sessionType`
- **Response:** CSV file download
- **Status Codes:** 200 (OK), 400 (Bad Request), 403 (Forbidden), 500 (Server Error)

#### 7.2.5 Import/Export Endpoints

**POST /api/import-export/upload**
- **Description:** Upload CSV file for bulk attendance
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Body:** FormData with file
- **Response:** `{ "message": "Attendance uploaded successfully", "summary": { ... } }`
- **Status Codes:** 200 (OK), 400 (Bad Request), 403 (Forbidden), 500 (Server Error)

**GET /api/import-export/export**
- **Description:** Export attendance data to CSV
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `subjectId`, `startDate`, `endDate`, `sessionType`
- **Response:** CSV file download
- **Status Codes:** 200 (OK), 400 (Bad Request), 403 (Forbidden), 500 (Server Error)

### 7.3 Technology Stack

#### 7.3.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| React Router DOM | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 3.3.x | CSS framework |
| react-qr-scanner | Latest | QR code scanning |
| qrcode.react | Latest | QR code display |

#### 7.3.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18 LTS | Runtime environment |
| Express | 4.21.x | Web framework |
| MongoDB | 4.4+ | Database |
| Mongoose | 8.13.x | ODM |
| bcryptjs | 2.x | Password hashing |
| jsonwebtoken | 9.x | JWT authentication |
| qrcode | 1.x | QR code generation |
| multer | 1.x | File upload handling |
| csv-parser | 3.x | CSV parsing |

#### 7.3.3 Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version control |
| npm | Package management |
| VS Code | Code editor |
| Postman | API testing |
| MongoDB Compass | Database management |

### 7.4 Deployment Requirements

#### 7.4.1 Production Environment

- **Web Server:** Nginx or Apache
- **Application Server:** Node.js with PM2 process manager
- **Database Server:** MongoDB with authentication enabled
- **SSL Certificate:** Let's Encrypt or commercial SSL
- **Domain:** Custom domain with HTTPS
- **Firewall:** Configure to allow only necessary ports (80, 443, 27017)

#### 7.4.2 Environment Variables

```
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/attendance

# JWT Configuration
JWT_SECRET=<strong-random-secret>

# File Upload Configuration
MAX_FILE_SIZE=5242880

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com
```

#### 7.4.3 Deployment Steps

1. Clone repository to production server
2. Install Node.js 18 LTS and MongoDB 4.4+
3. Configure environment variables
4. Install dependencies: `npm install` (both client and server)
5. Build React frontend: `cd client && npm run build`
6. Configure Nginx to serve React build and proxy API requests
7. Start MongoDB service
8. Seed database: `cd server && node seedData.js --force`
9. Start Node.js server with PM2: `pm2 start server.js`
10. Configure SSL certificate with Let's Encrypt
11. Test all functionality

### 7.5 Testing Requirements

#### 7.5.1 Unit Testing

- Test all controller functions
- Test all middleware functions
- Test all utility functions
- Test database models and schemas
- Achieve minimum 80% code coverage

#### 7.5.2 Integration Testing

- Test API endpoints with various inputs
- Test authentication and authorization flows
- Test database operations
- Test file upload and CSV processing
- Test QR code generation and scanning

#### 7.5.3 User Acceptance Testing

- Test all user workflows for each role
- Test on multiple browsers and devices
- Test mobile responsiveness
- Test error handling and edge cases
- Gather user feedback and iterate

#### 7.5.4 Performance Testing

- Load testing with 500+ concurrent users
- Stress testing with 1000+ QR scans per hour
- Database query performance testing
- CSV export performance testing
- Network latency testing

### 7.6 Maintenance and Support

#### 7.6.1 Regular Maintenance

- Weekly database backups
- Monthly security updates
- Quarterly dependency updates
- Annual system audit and optimization

#### 7.6.2 Monitoring

- Server uptime monitoring
- Error logging and alerting
- Database performance monitoring
- User activity tracking
- API response time monitoring

#### 7.6.3 Support

- User documentation and guides
- FAQ section for common issues
- Email support for technical issues
- Training sessions for administrators and professors

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Attendance Session** | A specific instance of attendance taking, either via QR code, manual entry, or bulk upload |
| **QR Token** | A unique alphanumeric string encoded in a QR code for attendance verification |
| **Attendance Points** | Numerical value awarded to students for attending a session |
| **Session Type** | The method used for attendance taking (QR, Manual, Bulk Upload) |
| **Audit Log** | A record of administrative actions performed in the system |
| **Active User** | A user account that is not deactivated and can access the system |
| **Subject Code** | A unique identifier for a subject (e.g., CS101, MATH201) |
| **Year and Section** | Student classification (e.g., 1st year, Section C) |

## Appendix B: Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | October 22, 2025 | Mridankan Mandal | Initial SRS document creation |

---

**End of Software Requirements Specification**


