const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// FIX CORS - Allow all necessary origins
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://sentinelrecovery.netlify.app',
    'https://sentinel-shkp.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent']
}));

app.use(express.json());

// ====================
// LOCAL STORAGE SETUP
// ====================
const LOCAL_DATA_DIR = path.join(__dirname, 'data');
const LOCAL_CSV_DIR = path.join(__dirname, 'csv-exports');

// Create directories
[LOCAL_DATA_DIR, LOCAL_CSV_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created: ${dir}`);
  }
});

// Database file
const DB_FILE = path.join(LOCAL_DATA_DIR, 'reports.json');
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ reports: [] }, null, 2));
}

// CSV Headers
const CSV_HEADERS = [
  'caseId', 'timestamp', 'scamType', 'amountLost', 'currency', 
  'dateOccurred', 'description', 'scammerDetails', 'contactEmail', 
  'paymentMethod', 'cryptoType', 'status', 'evidenceFilesCount'
];

// ====================
// HELPER FUNCTIONS
// ====================
function generateCaseId() {
  return `CASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function saveToJSON(reportData) {
  try {
    const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    dbContent.reports.push(reportData);
    fs.writeFileSync(DB_FILE, JSON.stringify(dbContent, null, 2), 'utf8');
    console.log(`✅ JSON saved: ${dbContent.reports.length} reports total`);
    return true;
  } catch (error) {
    console.error('❌ Error saving JSON:', error);
    return false;
  }
}

function createCSV(reportData) {
  try {
    console.log('💾 Creating CSV files...');
    
    const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const allReports = dbContent.reports;
    
    const headerRow = CSV_HEADERS.join(',') + '\n';
    const dataRows = allReports.map(report => {
      return CSV_HEADERS.map(header => {
        let value = report[header] || '';
        if (typeof value !== 'string') value = String(value);
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    }).join('\n');
    
    const csvContent = headerRow + dataRows;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const timestampFile = path.join(LOCAL_CSV_DIR, `scam-reports-${timestamp}.csv`);
    fs.writeFileSync(timestampFile, csvContent, 'utf8');
    
    const latestFile = path.join(LOCAL_CSV_DIR, 'latest.csv');
    fs.writeFileSync(latestFile, csvContent, 'utf8');
    
    const masterFile = path.join(LOCAL_CSV_DIR, 'scam-reports.csv');
    fs.writeFileSync(masterFile, csvContent, 'utf8');
    
    console.log(`📄 CSV files created in: ${LOCAL_CSV_DIR}`);
    console.log(`📊 Total records: ${allReports.length}`);
    
    return {
      success: true,
      csvDir: LOCAL_CSV_DIR,
      files: fs.readdirSync(LOCAL_CSV_DIR).filter(f => f.endsWith('.csv')),
      count: allReports.length
    };
    
  } catch (error) {
    console.error('❌ Error creating CSV:', error);
    return { success: false, error: error.message };
  }
}

// ====================
// API ROUTES
// ====================
app.post('/api/submit-report', (req, res) => {
  console.log('📥 Form submitted!');
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Origin:', req.headers['origin']);
  
  try {
    const reportData = req.body;
    
    if (!reportData || !reportData.contactEmail || !reportData.scamType) {
      return res.status(400).json({
        success: false,
        error: 'Email and scam type are required'
      });
    }
    
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
      cryptoType: reportData.selectedCrypto || reportData.cryptoType || 'N/A',
      status: 'submitted',
      evidenceFilesCount: reportData.evidenceFileCount || 0,
      originalData: reportData
    };
    
    const jsonSaved = saveToJSON(completeReport);
    
    if (!jsonSaved) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save report'
      });
    }
    
    const csvResult = createCSV(completeReport);
    
    res.json({
      success: true,
      caseId,
      timestamp,
      message: 'Report submitted successfully!',
      csvCreated: csvResult.success,
      csvLocation: LOCAL_CSV_DIR,
      csvFiles: csvResult.files || [],
      csvCount: csvResult.count || 0
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/health', (req, res) => {
  let reportCount = 0;
  let csvCount = 0;
  
  try {
    const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    reportCount = dbContent.reports.length;
    
    if (fs.existsSync(LOCAL_CSV_DIR)) {
      csvCount = fs.readdirSync(LOCAL_CSV_DIR).filter(f => f.endsWith('.csv')).length;
    }
  } catch (error) {
    console.error('Health check error:', error.message);
  }
  
  res.json({
    status: 'OK',
    reportsCount: reportCount,
    csvFilesCount: csvCount,
    csvLocation: LOCAL_CSV_DIR,
    message: 'Submit a form to create CSV files in csv-exports folder'
  });
});

app.get('/api/csv-files', (req, res) => {
  try {
    if (!fs.existsSync(LOCAL_CSV_DIR)) {
      return res.json({ success: true, files: [], count: 0 });
    }
    
    const files = fs.readdirSync(LOCAL_CSV_DIR)
      .filter(f => f.endsWith('.csv'))
      .map(file => {
        const filepath = path.join(LOCAL_CSV_DIR, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime
        };
      });
    
    res.json({ success: true, files, count: files.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    service: 'Sentinel API',
    status: 'running',
    host: req.headers.host,
    csvLocation: LOCAL_CSV_DIR,
    endpoints: [
      'POST /api/submit-report - Submit form & create CSV',
      'GET  /api/health - Health check',
      'GET  /api/csv-files - List CSV files'
    ]
  });
});

// ====================
// START SERVER
// ====================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 SERVER STARTED ON PORT ${PORT}`);
  console.log(`📁 Data saved to: ${LOCAL_DATA_DIR}`);
  console.log(`📊 CSV files created in: ${LOCAL_CSV_DIR}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('✅ Ready to receive form submissions!');
  console.log('='.repeat(60));
});