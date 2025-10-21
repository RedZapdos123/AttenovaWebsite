# InstallationAndSetup (Attenova)

This guide explains how to install, configure, and run the QR Scanner Attendance Management System locally for development and for a simple production-like run.

## Prerequisites
- Node.js: 18.x LTS
- npm: 9.x or newer (bundled with Node 18)
- MongoDB: 4.4 or newer, running locally
- Git (optional, for cloning the repository)

## 1. Clone and Install
1) Clone repository
```bash
git clone <your-repo-url>
cd QRScannerAttendance
```
2) Install backend dependencies
```bash
cd server
npm install
```
3) Install frontend dependencies
```bash
cd ../client
npm install
```

## 2. Environment Variables
The backend supports the following environment variables (defaults are sensible for local dev):

| Variable     | Default                                   | Purpose |
|--------------|--------------------------------------------|---------|
| MONGO_URI    | mongodb://localhost:27017/attendance       | MongoDB connection string |
| PORT         | 5000                                       | Express server port |
| JWT_SECRET   | your_jwt_secret                            | JWT signing secret |
| NODE_ENV     | development                                | Enables development behaviors in middleware |

Notes:
- In development, localhost is always allowed by the network middleware.
- For production, set a strong unique JWT_SECRET.

## 3. Database Setup and Seeding
Start MongoDB locally, then seed demo data:
```bash
cd server
node seedData.js
```
This creates administrator, professor, and student accounts, subjects, and sample attendance sessions.

## 4. Run the Application
Backend API:
```bash
cd server
npm start   # http://localhost:5000
```
Frontend (development):
```bash
cd client
npm start   # http://localhost:3000
```
Open the app at http://localhost:3000.

## 5. Demo Accounts (from server/seedData.js)
- Administrator: admin@iiita.ac.in / Test123!
- Professors: xerontitan90@gmail.com / Test123!, xerontitan99@gmail.com / Test123!
- Students: iib2024017@iiita.ac.in / Test123!, iib2024001@iiita.ac.in / Test123!

## 6. Verifying Installation
- Login as each role and confirm dashboard loads
- Professor: generate a QR code (choose expiry 1–60 minutes) and mark one demo student present
- Admin: open Audit Logs and verify entries are visible; try CSV export with session type filter
- Student: scan a QR and confirm attendance appears in your history

## 7. Troubleshooting
- Cannot connect to MongoDB: Ensure mongod is running and MONGO_URI is correct
- 401 Unauthorized: Confirm JWT token is present (login again) and role permits the action
- CORS errors: Ensure React dev server (3000) is calling API at http://localhost:5000
- Ports in use: Stop conflicting processes or change PORT in env

## 8. Production-like Run (local)
- Build client:
```bash
cd client
npm run build
```
- Serve API (port 5000) and host the client build using a static server of your choice, or proxy from the API. Basic example (serve separately):
```bash
npx serve -s build -l 3000
```
Secure production deployments require a reverse proxy (Nginx), HTTPS, and hardened env settings.

## 9. Project Structure
See CodebaseIndex.md for the complete code map, models, controllers, routes, and conventions.

## 10. Next Steps
- Review README.md (architecture, API overview)
- Explore server/controllers and client/src/components to extend features
- Add environment-based API base URL using REACT_APP_API_BASE_URL if needed

- Regularly rotate secrets and passwords
- Implement proper firewall rules

### 2. Application Security
- Keep all dependencies updated
- Implement input validation and sanitization
- Use HTTPS in production
- Monitor for security vulnerabilities

### 3. Database Security
- Enable MongoDB authentication
- Use database connection encryption
- Implement proper backup encryption
- Regular security audits

## Support and Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

### Community Support
- Stack Overflow for technical questions
- GitHub Issues for bug reports
- MongoDB Community Forums
- React Community Discord

For additional support or custom configuration assistance, please contact the development team or system administrator.
