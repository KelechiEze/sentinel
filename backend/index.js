const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Check if running on Vercel
const isVercel = process.env.VERCEL === '1';

// CORS Configuration - Use cors package for Vercel
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://sentinelrecovery.netlify.app',
    'https://sentinel-wine.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ====================
// DATABASE SETUP (Vercel-compatible)
// ====================
// Vercel uses /tmp directory for writable storage
const DB_FILE = isVercel 
  ? '/tmp/data/reports.json'
  : path.join(__dirname, 'data', 'reports.json');

// Ensure directories exist
if (isVercel) {
  // Create /tmp directories on Vercel
  if (!fs.existsSync('/tmp/data')) {
    fs.mkdirSync('/tmp/data', { recursive: true });
  }
  if (!fs.existsSync('/tmp/csv-exports')) {
    fs.mkdirSync('/tmp/csv-exports', { recursive: true });
  }
} else {
  // Local development directories
  ['data', 'csv-exports', 'logs'].forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

// Initialize DB if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ reports: [] }, null, 2));
  console.log('📁 Created new database file');
}

// ====================
// CSV EXPORT SETUP
// ====================
const CSV_EXPORTS_DIR = isVercel 
  ? '/tmp/csv-exports'
  : path.join(__dirname, 'csv-exports');

const REPORTS_CSV = path.join(CSV_EXPORTS_DIR, 'scam-reports.csv');
const CSV_HEADERS = [
  'caseId', 'timestamp', 'scamType', 'amountLost', 'currency', 
  'dateOccurred', 'description', 'scammerDetails', 'contactEmail', 
  'paymentMethod', 'cryptoType', 'status', 'evidenceFilesCount'
];

// Initialize CSV file
if (!fs.existsSync(REPORTS_CSV)) {
  const headerRow = CSV_HEADERS.join(',') + '\n';
  fs.writeFileSync(REPORTS_CSV, headerRow, 'utf8');
}

// ====================
// HELPER FUNCTIONS
// ====================
function generateCaseId() {
  return `CASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function saveToCSV(reportData) {
  try {
    const csvRow = CSV_HEADERS.map(header => {
      let value = reportData[header] || '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',') + '\n';
    
    fs.appendFileSync(REPORTS_CSV, csvRow, 'utf8');
    return true;
  } catch (error) {
    console.error('❌ Error saving CSV:', error);
    return false;
  }
}

function saveToJSON(reportData) {
  try {
    const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    dbContent.reports.push(reportData);
    fs.writeFileSync(DB_FILE, JSON.stringify(dbContent, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('❌ Error saving JSON:', error);
    return false;
  }
}

// ====================
// API ROUTES
// ====================

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  console.log('🩺 Health check from:', req.headers.origin || 'unknown');
  
  let dataCount = 0;
  if (fs.existsSync(DB_FILE)) {
    try {
      const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      dataCount = dbContent.reports.length;
    } catch (error) {
      console.error('Error reading DB:', error.message);
    }
  }
  
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    dataCount: dataCount,
    environment: process.env.NODE_ENV || 'development',
    platform: isVercel ? 'Vercel' : 'Local',
    port: PORT,
    vercelUrl: 'https://sentinel-wine.vercel.app'
  });
});

// ✅ SUBMIT REPORT
app.post('/api/submit-report', (req, res) => {
  console.log('📥 Submit request from:', req.headers.origin || 'unknown');
  console.log('📦 Body received:', Object.keys(req.body || {}));
  
  try {
    const reportData = req.body;
    
    // Validate required fields
    if (!reportData || !reportData.contactEmail || !reportData.scamType) {
      return res.status(400).json({
        success: false,
        error: 'Email and scam type are required'
      });
    }
    
    // Generate case ID
    const caseId = generateCaseId();
    const timestamp = new Date().toISOString();
    
    // Prepare complete report
    const completeReport = {
      caseId,
      timestamp,
      scamType: reportData.scamType || 'Unknown',
      amountLost: reportData.amountLost || '0',
      currency: reportData.currency || 'USD',
      dateOccurred: reportData.dateOccurred || timestamp.split('T')[0],
      description: reportData.description || '',
      scammerDetails: reportData.scammerDetails || '',
      contactEmail: reportData.contactEmail,
      paymentMethod: reportData.paymentMethod || 'Not specified',
      cryptoType: reportData.selectedCrypto || reportData.cryptoType || 'N/A',
      status: 'submitted',
      evidenceFilesCount: reportData.evidenceFileCount || 0,
      originalData: reportData
    };
    
    // Save to both JSON and CSV
    const jsonSaved = saveToJSON(completeReport);
    const csvSaved = saveToCSV(completeReport);
    
    if (jsonSaved && csvSaved) {
      console.log(`✅ Report ${caseId} saved successfully`);
      
      res.json({
        success: true,
        caseId,
        timestamp,
        message: 'Report submitted successfully!',
        dataSaved: true,
        downloadUrl: null
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save report data'
      });
    }
    
  } catch (error) {
    console.error('❌ Error processing submit-report:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'production' ? 'Contact administrator' : error.message
    });
  }
});

// ✅ TEST ENDPOINT
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Vercel API is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'none',
    vercelUrl: 'https://sentinel-wine.vercel.app',
    endpoints: [
      'GET  /api/health',
      'POST /api/submit-report'
    ]
  });
});

// ✅ ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({
    service: 'Sentinel Backend API',
    status: 'running',
    deployedOn: 'Vercel',
    productionUrl: 'https://sentinel-wine.vercel.app',
    endpoints: [
      'GET  /api/health',
      'GET  /api/test',
      'POST /api/submit-report'
    ],
    documentation: 'Submit scam reports to /api/submit-report'
  });
});

// ✅ 404 HANDLER
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      'GET  /',
      'GET  /api/health',
      'GET  /api/test',
      'POST /api/submit-report'
    ]
  });
});

// ====================
// START SERVER
// ====================
if (isVercel) {
  // Export for Vercel serverless
  module.exports = app;
} else {
  // Local development
  app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`🚀 SERVER STARTED ON PORT ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
    console.log(`☁️  Vercel URL: https://sentinel-wine.vercel.app`);
    console.log(`🌍 CORS enabled for:`);
    console.log(`   - http://localhost:3000`);
    console.log(`   - https://sentinelrecovery.netlify.app`);
    console.log('='.repeat(60));
    console.log(`✅ Test: curl http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60));
  });
}