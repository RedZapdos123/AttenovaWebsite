const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const XLSX = require('xlsx');

//Configure multer for file uploads.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 //5MB limit.
  }
});

//Parse CSV file.
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

//Parse Excel file.
const parseExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    throw new Error('Failed to parse Excel file: ' + error.message);
  }
};

//Validate attendance data structure.
const validateAttendanceData = (data) => {
  const errors = [];
  const requiredFields = ['studentEmail', 'studentName', 'present'];
  const optionalFields = ['points', 'date', 'subject'];

  if (!Array.isArray(data) || data.length === 0) {
    errors.push('File must contain at least one record');
    return { isValid: false, errors, validRecords: [] };
  }

  const validRecords = [];

  data.forEach((record, index) => {
    const recordErrors = [];

    //Check required fields.
    requiredFields.forEach(field => {
      if (!record[field] || record[field].toString().trim() === '') {
        recordErrors.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });

    //Validate email format.
    if (record.studentEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.studentEmail.toString().trim())) {
        recordErrors.push(`Row ${index + 1}: Invalid email format`);
      }
    }
    
    //Validate present field (should be boolean or boolean-like).
    if (record.present !== undefined) {
      const presentValue = record.present.toString().toLowerCase().trim();
      if (!['true', 'false', '1', '0', 'yes', 'no', 'present', 'absent'].includes(presentValue)) {
        recordErrors.push(`Row ${index + 1}: 'present' field must be true/false, 1/0, yes/no, or present/absent`);
      }
    }

    //Validate points (if provided).
    if (record.points !== undefined && record.points !== '') {
      const points = parseFloat(record.points);
      if (isNaN(points) || points < 0 || points > 10) {
        recordErrors.push(`Row ${index + 1}: 'points' must be a number between 0 and 10`);
      }
    }

    if (recordErrors.length === 0) {
      //Normalize the record.
      const normalizedRecord = {
        studentEmail: record.studentEmail.toString().trim().toLowerCase(),
        studentName: record.studentName.toString().trim(),
        present: normalizeBooleanValue(record.present),
        points: record.points ? parseFloat(record.points) : 1,
        date: record.date ? new Date(record.date) : new Date(),
        subject: record.subject ? record.subject.toString().trim() : ''
      };
      validRecords.push(normalizedRecord);
    } else {
      errors.push(...recordErrors);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    validRecords,
    totalRecords: data.length,
    validCount: validRecords.length
  };
};

//Normalize boolean values from various formats.
const normalizeBooleanValue = (value) => {
  if (typeof value === 'boolean') return value;
  
  const stringValue = value.toString().toLowerCase().trim();
  const trueValues = ['true', '1', 'yes', 'present'];
  const falseValues = ['false', '0', 'no', 'absent'];
  
  if (trueValues.includes(stringValue)) return true;
  if (falseValues.includes(stringValue)) return false;
  
  return false; //Default to false for invalid values.
};

//Generate CSV file.
const generateCSV = (data, filePath, headers) => {
  return new Promise((resolve, reject) => {
    const csvWriter = createCsvWriter({
      path: filePath,
      header: headers
    });

    csvWriter.writeRecords(data)
      .then(() => resolve(filePath))
      .catch(reject);
  });
};

//Generate Excel file.
const generateExcel = (data, filePath, sheetName = 'Attendance') => {
  try {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    //Auto-size columns.
    const colWidths = [];
    if (data.length > 0) {
      Object.keys(data[0]).forEach((key, index) => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => (row[key] || '').toString().length)
        );
        colWidths[index] = { wch: Math.min(maxLength + 2, 50) };
      });
    }
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filePath);
    
    return filePath;
  } catch (error) {
    throw new Error('Failed to generate Excel file: ' + error.message);
  }
};

//Generate attendance template.
const generateAttendanceTemplate = (format = 'csv') => {
  const templateData = [
    {
      studentEmail: 'student1@college.edu',
      studentName: 'John Doe',
      present: 'true',
      points: '1',
      subject: 'Mathematics',
      date: '2024-01-15'
    },
    {
      studentEmail: 'student2@college.edu',
      studentName: 'Jane Smith',
      present: 'false',
      points: '0',
      subject: 'Mathematics',
      date: '2024-01-15'
    },
    {
      studentEmail: 'student3@college.edu',
      studentName: 'Bob Johnson',
      present: 'yes',
      points: '1',
      subject: 'Mathematics',
      date: '2024-01-15'
    }
  ];
  
  const timestamp = Date.now();
  const fileName = `attendance_template_${timestamp}.${format}`;
  const filePath = path.join(__dirname, '../uploads', fileName);
  
  if (format === 'csv') {
    const headers = [
      { id: 'studentEmail', title: 'Student Email' },
      { id: 'studentName', title: 'Student Name' },
      { id: 'present', title: 'Present (true/false, yes/no, 1/0)' },
      { id: 'points', title: 'Points (optional, default: 1)' },
      { id: 'subject', title: 'Subject (optional)' },
      { id: 'date', title: 'Date (optional, format: YYYY-MM-DD)' }
    ];
    return generateCSV(templateData, filePath, headers);
  } else if (format === 'xlsx') {
    return Promise.resolve(generateExcel(templateData, filePath, 'Attendance Template'));
  } else {
    return Promise.reject(new Error('Unsupported format. Use csv or xlsx.'));
  }
};

//Clean up uploaded files.
const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};

module.exports = {
  upload,
  parseCSV,
  parseExcel,
  validateAttendanceData,
  generateCSV,
  generateExcel,
  generateAttendanceTemplate,
  cleanupFile,
  normalizeBooleanValue
};
