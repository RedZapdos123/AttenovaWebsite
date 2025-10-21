//This program initializes and starts the Express server, connects to MongoDB, and registers all API routes.

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const subjectRoutes = require('./routes/subject');
//const importExportRoutes = require('./routes/importExport'); //Temporarily disabled - missing dependencies.
const collegeNetworkOnly = require('./middleware/collegeNetworkOnly');
const errorHandler = require('./middleware/errorHandler');

const app = express();

//Trust proxy so that x-forwarded-for is available.
app.set('trust proxy', false);

//Apply security middlewares.
app.use(helmet());
app.use(cors());
app.use(express.json());

//Apply logging middleware.
app.use(morgan('combined'));

//Apply rate limiting middleware (15 minutes window, max 100 requests per IP).
//Use validate.trustProxy to disable the permissive proxy error.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,             //15 minutes.
  max: 100,                             //Limit each IP to 100 requests per window.
  message: 'Too many requests, please try again later.',
  validate: { trustProxy: false }       //Correct flag to disable ERR_ERL_PERMISSIVE_TRUST_PROXY.
});

app.use(limiter);

//Apply college network middleware globally.
app.use(collegeNetworkOnly);

//Connect to MongoDB.
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance';
mongoose.connect(mongoUri)
  .then(() => console.log(`MongoDB connected: ${mongoUri}`))
  .catch((err) => console.error(err));

//API routes.
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/subjects', subjectRoutes);
//Admin routes (optional deps). If missing, skip with warning.
try {
  app.use('/api/admin', require('./routes/admin'));
} catch (e) {
  console.warn('[server] Admin routes disabled (missing dependency?):', e?.message);
}
//app.use('/api/import-export', importExportRoutes); //Temporarily disabled - missing dependencies.

//Centralized error handling middleware.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
