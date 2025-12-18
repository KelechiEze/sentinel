const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const isVercel = process.env.VERCEL === '1';

// CORS Configuration
app.use(cors({
  origin: ['https://sentinelrecovery.netlify.app', 'https://sentinel-wine.vercel.app'],
  credentials: true,
}));
app.use(express.json());

// ====================
// STORAGE SETUP
// ====================
const STORAGE_DIR = isVercel ? '/tmp/sentinel-data' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(STORAGE_DIR, 'reports.json');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Initialize database
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
    return true;
  } catch (error) {
    console.error('❌ Error saving JSON:', error);
    return false;
  }
}

// This function creates CSV immediately when form is submitted
function createCSV(reportData) {
  try {
    // Get all reports from database
    const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const allReports = dbContent.reports;
    
    // Create CSV content
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
    
    // Save CSV file - this is where the magic happens
    const csvExportsDir = path.join(process.cwd(), 'csv-exports');
    
    // Ensure CSV exports directory exists
    if (!fs.existsSync(csvExportsDir)) {
      fs.mkdirSync(csvExportsDir, { recursive: true });
    }
    
    // Save individual CSV with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const individualFile = path.join(csvExportsDir, `scam-reports-${timestamp}.csv`);
    fs.writeFileSync(individualFile, csvContent, 'utf8');
    
    // Save latest.csv
    const latestFile = path.join(csvExportsDir, 'latest.csv');
    fs.writeFileSync(latestFile, csvContent, 'utf8');
    
    // Append to master CSV file
    const masterFile = path.join(csvExportsDir, 'scam-reports.csv');
    if (!fs.existsSync(masterFile)) {
      fs.writeFileSync(masterFile, headerRow, 'utf8');
    }
    
    // Append just the new row
    const newRow = CSV_HEADERS.map(header => {
      let value = reportData[header] || '';
      if (typeof value !== 'string') value = String(value);
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',') + '\n';
    
    fs.appendFileSync(masterFile, newRow, 'utf8');
    
    console.log(`✅ CSV saved to: ${csvExportsDir}/`);
    console.log(`📊 Total reports in CSV: ${allReports.length}`);
    
    return {
      success: true,
      csvDir: csvExportsDir,
      files: fs.readdirSync(csvExportsDir).filter(f => f.endsWith('.csv')),
      count: allReports.length
    };
    
  } catch (error) {
    console.error('❌ Error creating CSV:', error);
    return { success: false, error: error.message };
  }
}

// Function to trigger auto.js from Vercel
function triggerAutoJS() {
  return new Promise((resolve) => {
    // This runs on Vercel, so we can't directly run local scripts
    // Instead, we'll make an API call to a local endpoint if available
    console.log('📡 Attempting to trigger local CSV export...');
    
    // For now, just log - in production you'd want to set up a webhook
    console.log('ℹ️  CSV files are ready in csv-exports folder');
    
    resolve({ success: true, message: 'CSV export triggered' });
  });
}

// ====================
// API ROUTES
// ====================
app.post('/api/submit-report', async (req, res) => {
  console.log('📥 Submit request received');
  
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
    
    // Save to JSON database
    const jsonSaved = saveToJSON(completeReport);
    
    if (!jsonSaved) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save report data'
      });
    }
    
    // Create CSV files immediately
    const csvResult = createCSV(completeReport);
    
    // Try to trigger auto.js for Google Sheets upload
    await triggerAutoJS();
    
    res.json({
      success: true,
      caseId,
      timestamp,
      message: 'Report submitted successfully!',
      dataSaved: true,
      csvCreated: csvResult.success,
      csvCount: csvResult.count || 0
    });
    
  } catch (error) {
    console.error('❌ Error processing submit-report:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all reports
app.get('/api/reports', (req, res) => {
  try {
    const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json({
      success: true,
      reports: dbContent.reports,
      count: dbContent.reports.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  let dataCount = 0;
  let csvFiles = [];
  
  try {
    if (fs.existsSync(DB_FILE)) {
      const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      dataCount = dbContent.reports.length;
    }
    
    const csvExportsDir = path.join(process.cwd(), 'csv-exports');
    if (fs.existsSync(csvExportsDir)) {
      csvFiles = fs.readdirSync(csvExportsDir).filter(f => f.endsWith('.csv'));
    }
  } catch (error) {
    console.error('Health check error:', error.message);
  }
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    reportsCount: dataCount,
    csvFilesCount: csvFiles.length,
    platform: isVercel ? 'Vercel' : 'Local'
  });
});

// Get CSV files
app.get('/api/csv-files', (req, res) => {
  try {
    const csvExportsDir = path.join(process.cwd(), 'csv-exports');
    
    if (!fs.existsSync(csvExportsDir)) {
      return res.json({ success: true, files: [], count: 0 });
    }
    
    const files = fs.readdirSync(csvExportsDir)
      .filter(file => file.endsWith('.csv'))
      .map(file => {
        const filepath = path.join(csvExportsDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      });
    
    res.json({ success: true, files, count: files.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download CSV file
app.get('/api/download-csv/:filename', (req, res) => {
  try {
    const filepath = path.join(process.cwd(), 'csv-exports', req.params.filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
    
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger CSV export manually
app.get('/api/trigger-export', (req, res) => {
  try {
    const dbContent = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    
    if (dbContent.reports.length === 0) {
      return res.json({ success: true, message: 'No reports to export' });
    }
    
    // Create CSV from all reports
    const csvResult = createCSV(dbContent.reports[dbContent.reports.length - 1]);
    
    res.json({
      success: true,
      message: 'CSV export triggered',
      csvResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    service: 'Sentinel API',
    status: 'running',
    endpoints: [
      'POST /api/submit-report',
      'GET  /api/reports',
      'GET  /api/csv-files',
      'GET  /api/health',
      'GET  /api/trigger-export'
    ]
  });
});

module.exports = app;