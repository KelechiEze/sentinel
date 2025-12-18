const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const csv = require('csv-stringify');
require('dotenv').config({ path: path.join(__dirname, 'env/.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files if needed
app.use('/exports', express.static(path.join(__dirname, 'exports')));
app.use('/csv-exports', express.static(path.join(__dirname, 'csv-exports')));

// ====================
// DATABASE (Simple file-based for now)
// ====================
const DB_FILE = path.join(__dirname, 'data', 'reports.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initialize database if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ reports: [] }, null, 2));
}

// ====================
// CSV EXPORT SETUP
// ====================
const CSV_EXPORTS_DIR = process.env.EXPORT_DIR || path.join(__dirname, 'csv-exports');
if (!fs.existsSync(CSV_EXPORTS_DIR)) {
  fs.mkdirSync(CSV_EXPORTS_DIR, { recursive: true });
}

// CSV file path
const REPORTS_CSV = path.join(CSV_EXPORTS_DIR, 'scam-reports.csv');

// CSV headers
const CSV_HEADERS = [
  'caseId',
  'timestamp',
  'scamType',
  'amountLost',
  'currency',
  'dateOccurred',
  'description',
  'scammerDetails',
  'contactEmail',
  'paymentMethod',
  'cryptoType',
  'status',
  'evidenceFilesCount'
];

// Initialize CSV file with headers if it doesn't exist
function initializeCSV() {
  if (!fs.existsSync(REPORTS_CSV)) {
    const headerRow = CSV_HEADERS.join(',') + '\n';
    fs.writeFileSync(REPORTS_CSV, headerRow, 'utf8');
    console.log('📁 Created new CSV file with headers');
  }
}

initializeCSV();

// ====================
// HELPER FUNCTIONS
// ====================
function generateCaseId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `CASE-${timestamp}-${random}`;
}

function saveToCSV(reportData) {
  try {
    // Prepare CSV row
    const csvRow = CSV_HEADERS.map(header => {
      let value = reportData[header] || '';
      
      // Handle special characters in CSV
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
      }
      
      return value;
    }).join(',') + '\n';
    
    // Append to CSV file
    fs.appendFileSync(REPORTS_CSV, csvRow, 'utf8');
    console.log(`✅ Report saved to CSV: ${reportData.caseId}`);
    
    // Also save to daily backup CSV
    const today = new Date().toISOString().split('T')[0];
    const dailyCSV = path.join(CSV_EXPORTS_DIR, `reports-${today}.csv`);
    
    if (!fs.existsSync(dailyCSV)) {
      const headerRow = CSV_HEADERS.join(',') + '\n';
      fs.writeFileSync(dailyCSV, headerRow, 'utf8');
    }
    
    fs.appendFileSync(dailyCSV, csvRow, 'utf8');
    
    return true;
  } catch (error) {
    console.error('❌ Error saving to CSV:', error);
    return false;
  }
}

function saveToJSON(reportData) {
  try {
    const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    dbContent.reports.push(reportData);
    fs.writeFileSync(DB_FILE, JSON.stringify(dbContent, null, 2), 'utf8');
    console.log(`✅ Report saved to JSON database: ${reportData.caseId}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving to JSON:', error);
    return false;
  }
}

// ====================
// API ROUTES
// ====================

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  const dbExists = fs.existsSync(DB_FILE);
  let dataCount = 0;
  
  if (dbExists) {
    try {
      const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      dataCount = dbContent.reports.length;
    } catch (error) {
      console.error('Error reading DB file:', error);
    }
  }
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    dataCount: dataCount,
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    csvExportsDir: CSV_EXPORTS_DIR
  });
});

// ✅ SUBMIT NEW REPORT
app.post('/api/reports', (req, res) => {
  try {
    console.log('📥 Received new report submission');
    
    const reportData = req.body;
    
    // Generate case ID
    const caseId = generateCaseId();
    const timestamp = new Date().toISOString();
    
    // Prepare complete report object
    const completeReport = {
      caseId,
      timestamp,
      scamType: reportData.scamType || '',
      amountLost: reportData.amountLost || '0',
      currency: reportData.currency || 'USD',
      dateOccurred: reportData.dateOccurred || '',
      description: reportData.description || '',
      scammerDetails: reportData.scammerDetails || '',
      contactEmail: reportData.contactEmail || '',
      paymentMethod: reportData.paymentMethod || '',
      cryptoType: reportData.cryptoType || '',
      status: 'submitted',
      evidenceFilesCount: reportData.evidenceFiles ? reportData.evidenceFiles.length : 0,
      // Include all original data for reference
      originalData: reportData
    };
    
    // Save to both JSON and CSV
    const jsonSaved = saveToJSON(completeReport);
    const csvSaved = saveToCSV(completeReport);
    
    if (jsonSaved && csvSaved) {
      console.log(`📊 Report ${caseId} saved successfully`);
      
      // Trigger auto-export if there are enough reports (optional)
      const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (process.env.BACKUP_ENABLED === 'true' && dbContent.reports.length % 10 === 0) {
        console.log('⚡ Auto-export triggered (10 reports reached)');
      }
      
      res.json({
        success: true,
        caseId,
        timestamp,
        message: 'Report submitted successfully',
        dataSaved: true,
        csvPath: REPORTS_CSV
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save report data'
      });
    }
    
  } catch (error) {
    console.error('❌ Error processing report:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// ✅ GET ALL REPORTS
app.get('/api/reports', (req, res) => {
  try {
    const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json({
      success: true,
      count: dbContent.reports.length,
      reports: dbContent.reports
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ GET SINGLE REPORT BY CASE ID
app.get('/api/reports/:caseId', (req, res) => {
  try {
    const { caseId } = req.params;
    const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const report = dbContent.reports.find(r => r.caseId === caseId);
    
    if (report) {
      res.json({ success: true, report });
    } else {
      res.status(404).json({ success: false, error: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ EXPORT TO CSV (Download endpoint)
app.get('/api/export/csv', (req, res) => {
  try {
    if (!fs.existsSync(REPORTS_CSV)) {
      return res.status(404).json({ success: false, error: 'No CSV data available' });
    }
    
    const filename = `scam-reports-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const csvContent = fs.readFileSync(REPORTS_CSV, 'utf8');
    res.send(csvContent);
    
    console.log(`📥 CSV downloaded: ${filename}`);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ GET CSV LIST (For auto.js to find)
app.get('/api/csv-exports', (req, res) => {
  try {
    const files = fs.readdirSync(CSV_EXPORTS_DIR)
      .filter(file => file.endsWith('.csv'))
      .map(file => ({
        name: file,
        path: path.join(CSV_EXPORTS_DIR, file),
        size: fs.statSync(path.join(CSV_EXPORTS_DIR, file)).size,
        modified: fs.statSync(path.join(CSV_EXPORTS_DIR, file)).mtime
      }));
    
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ====================
// FRONTEND SERVICE INTEGRATION
// ====================

// This endpoint matches what your frontend expects
app.post('/api/submit-report', (req, res) => {
  // Alias for /api/reports to match your frontend
  req.url = '/api/reports';
  app.handle(req, res);
});

// ====================
// START SERVER
// ====================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 CSV exports directory: ${CSV_EXPORTS_DIR}`);
  console.log(`💾 Database file: ${DB_FILE}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Using service account: ${process.env.USE_SERVICE_ACCOUNT === 'true' ? 'Yes' : 'No'}`);
  console.log('='.repeat(50));
});