const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ====================
// CONFIGURATION
// ====================
const CONFIG = {
  csvExportPath: path.join(__dirname, '../csv-exports'),
  dataRefreshInterval: 30000, // 30 seconds for testing (change to 3600000 for production)
  uploadScript: path.join(__dirname, 'upload-to-sheets.js'),
  apiBaseUrl: 'https://sentinel-wine.vercel.app/api'
};

// ====================
// FUNCTIONS
// ====================
function ensureCSVDirectory() {
  if (!fs.existsSync(CONFIG.csvExportPath)) {
    fs.mkdirSync(CONFIG.csvExportPath, { recursive: true });
    console.log(`📁 Created CSV directory: ${CONFIG.csvExportPath}`);
  }
}

async function fetchData() {
  console.log('📡 Fetching data from Vercel API...');
  
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/reports`);
    const data = await response.json();
    
    if (data.success && data.reports && data.reports.length > 0) {
      console.log(`✅ Fetched ${data.reports.length} reports`);
      return data.reports;
    }
    
    console.log('📭 No reports found');
    return [];
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    return [];
  }
}

function saveCSV(data) {
  if (!data || data.length === 0) {
    console.log('⚠️ No data to save to CSV');
    return null;
  }
  
  try {
    // Get headers from first object
    const headers = Object.keys(data[0]);
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
      const rowValues = headers.map(header => {
        let value = row[header];
        if (value === null || value === undefined) value = '';
        if (typeof value !== 'string') value = String(value);
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += rowValues.join(',') + '\n';
    });
    
    // Create timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scam-reports-${timestamp}.csv`;
    const filepath = path.join(CONFIG.csvExportPath, filename);
    
    // Save the file
    fs.writeFileSync(filepath, csvContent, 'utf8');
    
    // Also save as latest.csv
    const latestPath = path.join(CONFIG.csvExportPath, 'latest.csv');
    fs.writeFileSync(latestPath, csvContent, 'utf8');
    
    // Append to master CSV
    const masterPath = path.join(CONFIG.csvExportPath, 'scam-reports.csv');
    if (!fs.existsSync(masterPath)) {
      fs.writeFileSync(masterPath, headers.join(',') + '\n', 'utf8');
    }
    
    // Append data rows
    const lines = csvContent.split('\n');
    if (lines.length > 1) {
      const dataRows = lines.slice(1).filter(row => row.trim());
      if (dataRows.length > 0) {
        fs.appendFileSync(masterPath, dataRows.join('\n') + '\n', 'utf8');
      }
    }
    
    console.log(`💾 CSV saved: ${filename} (${data.length} rows)`);
    
    // List all CSV files
    const csvFiles = fs.readdirSync(CONFIG.csvExportPath)
      .filter(f => f.endsWith('.csv'));
    console.log(`📁 Total CSV files: ${csvFiles.length}`);
    
    return filepath;
  } catch (error) {
    console.error('❌ Error saving CSV:', error.message);
    return null;
  }
}

function triggerUpload(filepath) {
  if (!filepath || !fs.existsSync(filepath)) {
    console.error('❌ CSV file not found for upload');
    return;
  }
  
  if (process.env.SKIP_UPLOAD === 'true') {
    console.log('⏭️ Skipping Google Sheets upload');
    return;
  }
  
  console.log('☁️ Triggering Google Sheets upload...');
  
  exec(`node "${CONFIG.uploadScript}" "${filepath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Upload error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ Upload stderr: ${stderr}`);
    }
    console.log(`✅ Upload output: ${stdout}`);
  });
}

async function main() {
  console.log('🚀 Starting auto CSV export process...');
  console.log('='.repeat(50));
  
  // Ensure directory exists
  ensureCSVDirectory();
  
  // Fetch data from API
  const data = await fetchData();
  
  if (data.length === 0) {
    console.log('ℹ️ No data to process');
    return;
  }
  
  // Save to CSV
  const savedFilePath = saveCSV(data);
  
  if (savedFilePath) {
    // Trigger Google Sheets upload
    triggerUpload(savedFilePath);
  }
  
  console.log('='.repeat(50));
  console.log('✅ Auto process completed!');
}

// ====================
// START AUTO PROCESS
// ====================
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Run immediately
  main();
  
  // Schedule automatic runs
  const interval = args.includes('--continuous') || process.env.CONTINUOUS === 'true' 
    ? CONFIG.dataRefreshInterval 
    : null;
  
  if (interval) {
    console.log(`🔄 Scheduling runs every ${interval/1000} seconds`);
    setInterval(main, interval);
  }
}

module.exports = { main };