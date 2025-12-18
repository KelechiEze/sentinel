const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ====================
// CONFIGURATION
// ====================
const CONFIG = {
  csvExportPath: path.join(__dirname, '../csv-exports'),
  dataRefreshInterval: 3600000, // 1 hour in milliseconds
  uploadScript: path.join(__dirname, 'upload-to-sheets.js'),
  apiBaseUrl: 'http://localhost:5000/api' // Your backend API
};

// ====================
// FETCH DATA FROM YOUR BACKEND API
// ====================
async function fetchData() {
  console.log('📡 Fetching data from backend API...');
  
  try {
    // Fetch reports from your own API
    const response = await fetch(`${CONFIG.apiBaseUrl}/reports`);
    const data = await response.json();
    
    if (data.success && data.reports && data.reports.length > 0) {
      console.log(`✅ Fetched ${data.reports.length} scam reports from database`);
      
      // Transform to CSV format - use your actual scam report fields
      return data.reports.map(report => ({
        caseId: report.caseId || 'N/A',
        timestamp: report.timestamp || new Date().toISOString(),
        scamType: report.scamType || 'Not specified',
        amountLost: report.amountLost || '0',
        currency: report.currency || 'USD',
        dateOccurred: report.dateOccurred || 'N/A',
        contactEmail: report.contactEmail || 'No email',
        paymentMethod: report.paymentMethod || 'Not specified',
        cryptoType: report.cryptoType || 'N/A',
        status: report.status || 'submitted',
        description: report.description ? 
          report.description.substring(0, 200).replace(/\n/g, ' ') : 'No description',
        scammerDetails: report.scammerDetails || 'No details',
        evidenceFilesCount: report.evidenceFilesCount || 0,
        // Add any other fields from your form
        ...report.originalData || {}
      }));
    } else {
      console.log('📭 No reports found in database');
      
      // Sample data for testing when no real data exists
      if (process.env.USE_SAMPLE_DATA === 'true') {
        console.log('⚠️  Using sample data for testing');
        return generateSampleData();
      }
      
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching from API:', error.message);
    
    // Try to read from existing CSV as fallback
    console.log('🔄 Trying to read from existing CSV as fallback...');
    return readFromExistingCSV();
  }
}

// ====================
// HELPER FUNCTIONS
// ====================
function generateSampleData() {
  const timestamp = new Date().toISOString();
  
  return [
    {
      caseId: 'CASE-' + Date.now() + '-001',
      timestamp: timestamp,
      scamType: 'Phishing',
      amountLost: '2500.00',
      currency: 'USD',
      dateOccurred: '2025-12-15',
      contactEmail: 'user@example.com',
      paymentMethod: 'PayPal',
      cryptoType: 'N/A',
      status: 'submitted',
      description: 'Received fake email from bank asking for credentials',
      scammerDetails: 'support@fakebank.com',
      evidenceFilesCount: 2
    },
    {
      caseId: 'CASE-' + Date.now() + '-002',
      timestamp: timestamp,
      scamType: 'Crypto Investment',
      amountLost: '5000.00',
      currency: 'BTC',
      dateOccurred: '2025-12-10',
      contactEmail: 'investor@example.com',
      paymentMethod: 'Crypto',
      cryptoType: 'Bitcoin',
      status: 'investigating',
      description: 'Fake crypto investment platform promised 300% returns',
      scammerDetails: 'invest@scam-crypto.com',
      evidenceFilesCount: 3
    },
    {
      caseId: 'CASE-' + Date.now() + '-003',
      timestamp: timestamp,
      scamType: 'Online Shopping',
      amountLost: '150.00',
      currency: 'USD',
      dateOccurred: '2025-12-05',
      contactEmail: 'shopper@example.com',
      paymentMethod: 'Credit Card',
      cryptoType: 'N/A',
      status: 'resolved',
      description: 'Paid for item but never received anything',
      scammerDetails: 'fake-store.com',
      evidenceFilesCount: 1
    }
  ];
}

function readFromExistingCSV() {
  try {
    const latestPath = path.join(CONFIG.csvExportPath, 'latest.csv');
    if (fs.existsSync(latestPath)) {
      const csvContent = fs.readFileSync(latestPath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length > 1) { // Has header + data
        const headers = lines[0].split(',');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const row = {};
          
          headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
          });
          
          data.push(row);
        }
        
        console.log(`📖 Read ${data.length} records from existing CSV`);
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading from CSV:', error.message);
  }
  
  return [];
}

// ====================
// CSV GENERATION
// ====================
function generateCSV(data) {
  console.log('📊 Generating CSV...');
  
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const rowValues = headers.map(header => {
      let value = row[header];
      
      // Convert to string if needed
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value !== 'string') {
        value = String(value);
      }
      
      // Handle special characters
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    });
    
    csvContent += rowValues.join(',') + '\n';
  });
  
  console.log(`📄 Generated CSV with ${data.length} rows and ${headers.length} columns`);
  return csvContent;
}

// ====================
// FILE MANAGEMENT
// ====================
function saveCSVFile(csvContent) {
  // Ensure directory exists
  if (!fs.existsSync(CONFIG.csvExportPath)) {
    fs.mkdirSync(CONFIG.csvExportPath, { recursive: true });
    console.log(`📁 Created directory: ${CONFIG.csvExportPath}`);
  }
  
  // Create filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `scam-reports-${timestamp}.csv`;
  const filepath = path.join(CONFIG.csvExportPath, filename);
  
  // Save file
  fs.writeFileSync(filepath, csvContent, 'utf8');
  console.log(`💾 CSV saved: ${filename}`);
  
  // Also save as latest.csv for easy reference
  const latestPath = path.join(CONFIG.csvExportPath, 'latest.csv');
  fs.writeFileSync(latestPath, csvContent, 'utf8');
  
  // Also append to master CSV file (scam-reports.csv)
  const masterPath = path.join(CONFIG.csvExportPath, 'scam-reports.csv');
  
  if (!fs.existsSync(masterPath)) {
    // If master doesn't exist, create with headers from the content
    const lines = csvContent.split('\n');
    if (lines.length > 0) {
      fs.writeFileSync(masterPath, lines[0] + '\n', 'utf8'); // Write header
    }
  }
  
  // Append data rows (skip header)
  const lines = csvContent.split('\n');
  if (lines.length > 1) {
    const dataRows = lines.slice(1).filter(row => row.trim());
    if (dataRows.length > 0) {
      fs.appendFileSync(masterPath, dataRows.join('\n') + '\n', 'utf8');
      console.log(`📊 Appended ${dataRows.length} rows to master CSV`);
    }
  }
  
  return filepath;
}

// ====================
// UPLOAD TRIGGER
// ====================
function triggerUpload(filepath) {
  console.log('☁️  Triggering Google Sheets upload...');
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    console.error(`❌ CSV file not found: ${filepath}`);
    return;
  }
  
  // Check if we should skip upload (for testing)
  if (process.env.SKIP_UPLOAD === 'true') {
    console.log('⏭️  Skipping Google Sheets upload (SKIP_UPLOAD=true)');
    return;
  }
  
  exec(`node "${CONFIG.uploadScript}" "${filepath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Upload error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️  Upload stderr: ${stderr}`);
    }
    console.log(`✅ Upload output: ${stdout}`);
  });
}

// ====================
// MAIN PROCESS
// ====================
async function main() {
  try {
    console.log('🚀 Starting scam reports export process...');
    console.log('='.repeat(50));
    
    // 1. Fetch data from API
    const data = await fetchData();
    
    if (data.length === 0) {
      console.log('ℹ️  No data to export. Exiting.');
      return;
    }
    
    console.log(`✅ Fetched ${data.length} scam reports`);
    
    // 2. Generate CSV
    const csvContent = generateCSV(data);
    
    // 3. Save to file
    const savedFilePath = saveCSVFile(csvContent);
    
    // 4. Trigger Google Sheets upload
    triggerUpload(savedFilePath);
    
    console.log('='.repeat(50));
    console.log('✅ Export process completed successfully!');
    
    // Save export log
    const logEntry = {
      timestamp: new Date().toISOString(),
      recordsExported: data.length,
      csvFile: path.basename(savedFilePath),
      status: 'success'
    };
    
    const logPath = path.join(__dirname, '../logs/export-log.json');
    if (!fs.existsSync(path.dirname(logPath))) {
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
    }
    
    let logData = [];
    if (fs.existsSync(logPath)) {
      logData = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }
    
    logData.push(logEntry);
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), 'utf8');
    
  } catch (error) {
    console.error('❌ Process failed:', error.message);
    
    // Log error
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'failed'
    };
    
    const errorPath = path.join(__dirname, '../logs/export-errors.json');
    if (!fs.existsSync(path.dirname(errorPath))) {
      fs.mkdirSync(path.dirname(errorPath), { recursive: true });
    }
    
    let errorData = [];
    if (fs.existsSync(errorPath)) {
      errorData = JSON.parse(fs.readFileSync(errorPath, 'utf8'));
    }
    
    errorData.push(errorLog);
    fs.writeFileSync(errorPath, JSON.stringify(errorData, null, 2), 'utf8');
    
    process.exit(1);
  }
}

// ====================
// EXECUTION MODES
// ====================
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const isContinuous = args.includes('--continuous');
  const useSample = args.includes('--sample');
  
  if (useSample) {
    process.env.USE_SAMPLE_DATA = 'true';
  }
  
  if (args.includes('--skip-upload')) {
    process.env.SKIP_UPLOAD = 'true';
  }
  
  // Run immediately
  main();
  
  // Schedule periodic runs if continuous mode
  if (isContinuous || process.env.CONTINUOUS === 'true') {
    console.log(`🔄 Scheduling runs every ${CONFIG.dataRefreshInterval/60000} minutes`);
    setInterval(main, CONFIG.dataRefreshInterval);
  }
}

module.exports = { fetchData, generateCSV, main };