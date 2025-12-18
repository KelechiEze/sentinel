const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config({ path: path.join(__dirname, 'env/.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ====================
// CORS CONFIGURATION - FIXED
// ====================
const corsOptions = {
  origin: function (origin, callback) {
    // Your Railway variables (check these match)
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://sentinelrecovery.netlify.app'
        ];
    
    // Remove trailing slash if present
    const cleanOrigins = allowedOrigins.map(o => o.replace(/\/$/, ''));
    
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (cleanOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 Blocked CORS from: ${origin}`);
      console.log(`✅ Allowed origins: ${cleanOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware BEFORE other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ====================
// OTHER MIDDLEWARE
// ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // Log CORS headers for debugging
  if (req.method === 'OPTIONS' || req.url.includes('/api/')) {
    console.log(`   Origin: ${req.headers.origin || 'none'}`);
    console.log(`   Host: ${req.headers.host || 'none'}`);
  }
  
  next();
});

// Serve static files
app.use('/exports', express.static(path.join(__dirname, 'exports')));
app.use('/csv-exports', express.static(path.join(__dirname, 'csv-exports')));

// ====================
// DATABASE SETUP
// ====================
const DB_FILE = path.join(__dirname, 'data', 'reports.json');

// Ensure directories exist
const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, 'data'),
    path.join(__dirname, 'exports'),
    path.join(__dirname, 'csv-exports'),
    path.join(__dirname, 'env'),
    path.join(__dirname, 'logs')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

ensureDirectories();

// Initialize database
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ reports: [] }, null, 2));
  console.log('📁 Created new database file');
}

// ====================
// CSV EXPORT SETUP
// ====================
const CSV_EXPORTS_DIR = process.env.EXPORT_DIR === './exports' 
  ? path.join(__dirname, 'exports') 
  : path.join(__dirname, 'csv-exports');

const REPORTS_CSV = path.join(CSV_EXPORTS_DIR, 'scam-reports.csv');

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
    const csvRow = CSV_HEADERS.map(header => {
      let value = reportData[header] || '';
      
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
      }
      
      return value;
    }).join(',') + '\n';
    
    fs.appendFileSync(REPORTS_CSV, csvRow, 'utf8');
    
    // Daily backup
    const today = new Date().toISOString().split('T')[0];
    const dailyCSV = path.join(CSV_EXPORTS_DIR, `reports-${today}.csv`);
    
    if (!fs.existsSync(dailyCSV)) {
      const headerRow = CSV_HEADERS.join(',') + '\n';
      fs.writeFileSync(dailyCSV, headerRow, 'utf8');
    }
    
    fs.appendFileSync(dailyCSV, csvRow, 'utf8');
    
    console.log(`✅ CSV saved: ${reportData.caseId}`);
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
    console.log(`✅ JSON saved: ${reportData.caseId}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving JSON:', error);
    return false;
  }
}

// ====================
// API ROUTES - FIXED
// ====================

// ✅ HEALTH CHECK (ALWAYS WORKS)
app.get('/api/health', (req, res) => {
  try {
    const dbExists = fs.existsSync(DB_FILE);
    let dataCount = 0;
    
    if (dbExists) {
      try {
        const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        dataCount = dbContent.reports.length;
      } catch (error) {
        console.error('Error reading DB:', error.message);
      }
    }
    
    // Set CORS headers explicitly
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      dataCount: dataCount,
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      railwayUrl: 'https://sentinel-production-3479.up.railway.app',
      corsEnabled: true,
      allowedOrigin: origin || 'none',
      memoryUsage: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message 
    });
  }
});

// ✅ SIMPLE TEST ENDPOINT
app.get('/api/test', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    requestOrigin: origin || 'none',
    yourIp: req.ip,
    path: req.path
  });
});

// ✅ SIMPLE SUBMIT ENDPOINT (MINIMAL VERSION)
app.post('/api/submit-report', (req, res) => {
  try {
    console.log('📥 SUBMIT-REPORT REQUEST RECEIVED');
    console.log('   Origin:', req.headers.origin);
    console.log('   Content-Type:', req.headers['content-type']);
    console.log('   Body keys:', Object.keys(req.body || {}));
    
    const reportData = req.body;
    
    // Validate required fields
    if (!reportData.contactEmail || !reportData.scamType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: contactEmail and scamType are required'
      });
    }
    
    // Generate simple case ID
    const caseId = generateCaseId();
    const timestamp = new Date().toISOString();
    
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
      paymentMethod: reportData.paymentMethod || 'Unknown',
      cryptoType: reportData.selectedCrypto || reportData.cryptoType || 'N/A',
      status: 'submitted',
      evidenceFilesCount: reportData.evidenceFileCount || reportData.evidenceFilesCount || 0,
      originalData: reportData
    };
    
    // Save data
    const jsonSaved = saveToJSON(completeReport);
    const csvSaved = saveToCSV(completeReport);
    
    if (jsonSaved && csvSaved) {
      console.log(`✅ Report ${caseId} saved successfully`);
      
      // Set CORS headers
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      res.json({
        success: true,
        caseId,
        timestamp,
        message: 'Report submitted successfully',
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
    console.error('❌ Error in submit-report:', error);
    
    // Set CORS headers even on error
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'production' ? 'Contact administrator' : error.message
    });
  }
});

// ✅ FALLBACK ROUTE
app.all('/api/*', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    requested: req.path,
    method: req.method,
    availableEndpoints: [
      'GET  /api/health',
      'GET  /api/test', 
      'POST /api/submit-report',
      'GET  /api/reports/:caseId'
    ]
  });
});

// ✅ CATCH-ALL FOR UNDEFINED ROUTES
app.use('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// ====================
// ERROR HANDLER
// ====================
app.use((err, req, res, next) => {
  console.error('🚨 Global error:', err.message);
  
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.status(err.status || 500).json({
    success: false,
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ====================
// START SERVER
// ====================
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log(`🚀 BACKEND SERVER STARTED`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Railway URL: https://sentinel-production-3479.up.railway.app`);
  console.log(`🌍 CORS Origins: ${process.env.ALLOWED_ORIGINS || 'default'}`);
  console.log(`📁 Export Dir: ${CSV_EXPORTS_DIR}`);
  console.log(`💾 Database: ${DB_FILE}`);
  console.log('='.repeat(70));
  console.log(`✅ Health:   https://sentinel-production-3479.up.railway.app/api/health`);
  console.log(`✅ Test:     https://sentinel-production-3479.up.railway.app/api/test`);
  console.log(`✅ Submit:   https://sentinel-production-3479.up.railway.app/api/submit-report`);
  console.log('='.repeat(70));
});