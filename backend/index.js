const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'env/.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ====================
// CORS FIX - SIMPLIFIED AND WORKING
// ====================

// 1. CUSTOM CORS MIDDLEWARE (Always sets headers)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // 🎯 ALLOW THESE ORIGINS (your exact URLs)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://sentinelrecovery.netlify.app'
  ];
  
  // Check if origin is in allowed list
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    console.log(`⚠️  Blocked origin: ${origin}`);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 2. Standard CORS middleware as backup
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://sentinelrecovery.netlify.app'
    ];
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// 3. Explicit OPTIONS handler for all routes
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin && ['http://localhost:3000', 'https://sentinelrecovery.netlify.app'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.status(200).end();
});

// ====================
// OTHER MIDDLEWARE
// ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'none'}`);
  console.log(`   User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'none'}`);
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
    }
  });
};

ensureDirectories();

// Initialize database
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ reports: [] }, null, 2));
}

// ====================
// CSV EXPORT SETUP
// ====================
const CSV_EXPORTS_DIR = path.join(__dirname, 'csv-exports');
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
      
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
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
// API ROUTES - ULTRA SIMPLE
// ====================

// ✅ HEALTH CHECK (ALWAYS WORKS)
app.get('/api/health', (req, res) => {
  try {
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
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      railwayUrl: 'https://sentinel-production-3479.up.railway.app',
      cors: 'enabled',
      origin: req.headers.origin || 'none'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message 
    });
  }
});

// ✅ TEST ENDPOINT
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    requestOrigin: req.headers.origin || 'none',
    cors: 'enabled'
  });
});

// ✅ SUBMIT REPORT - WORKING VERSION
app.post('/api/submit-report', (req, res) => {
  console.log('📥 SUBMIT-REPORT REQUEST');
  console.log('   Origin:', req.headers.origin);
  console.log('   Body keys:', Object.keys(req.body || {}));
  
  try {
    const reportData = req.body;
    
    // Quick validation
    if (!reportData || !reportData.contactEmail || !reportData.scamType) {
      return res.json({
        success: false,
        error: 'Email and scam type are required'
      });
    }
    
    // Generate case ID
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
      paymentMethod: reportData.paymentMethod || 'Not specified',
      cryptoType: reportData.selectedCrypto || 'N/A',
      status: 'submitted',
      evidenceFilesCount: reportData.evidenceFileCount || 0
    };
    
    // Save data
    const jsonSaved = saveToJSON(completeReport);
    const csvSaved = saveToCSV(completeReport);
    
    if (jsonSaved && csvSaved) {
      console.log(`✅ Report ${caseId} saved`);
      
      res.json({
        success: true,
        caseId,
        timestamp,
        message: 'Report submitted successfully!',
        dataSaved: true,
        downloadUrl: null
      });
    } else {
      res.json({
        success: false,
        error: 'Failed to save data'
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
});

// ====================
// ROOT ENDPOINT
// ====================
app.get('/', (req, res) => {
  res.json({
    message: 'Sentinel Backend API',
    status: 'running',
    port: PORT,
    endpoints: [
      'GET  /api/health',
      'GET  /api/test',
      'POST /api/submit-report'
    ]
  });
});

// ====================
// 404 HANDLER
// ====================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// ====================
// START SERVER
// ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`🚀 BACKEND SERVER STARTED`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Railway URL: https://sentinel-production-3479.up.railway.app`);
  console.log(`🌍 CORS Enabled for:`);
  console.log(`   - http://localhost:3000`);
  console.log(`   - https://sentinelrecovery.netlify.app`);
  console.log('='.repeat(60));
  console.log(`✅ Test with:`);
  console.log(`   curl https://sentinel-production-3479.up.railway.app/api/health`);
  console.log('='.repeat(60));
});