// csv-export.js - Pure file-based solution
const fs = require('fs');
const path = require('path');

class CSVExportService {
  constructor() {
    this.exportDir = process.env.EXPORT_DIR || path.join(__dirname, 'exports');
    this.csvFile = path.join(this.exportDir, 'scam_reports.csv');
    
    // Initialize CSV file with headers
    this.initializeCSV();
  }

  initializeCSV() {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }

    if (!fs.existsSync(this.csvFile)) {
      const headers = [
        'Timestamp', 'Case ID', 'Status', 'Scam Type', 'Amount Lost',
        'Currency', 'Date Occurred', 'Description', 'Scammer Details',
        'Contact Email', 'Evidence Files', 'File Count', 'Payment Method',
        'Selected Crypto', 'Payment Proof', 'Total Fee', 'Tracking Fee',
        'Legal Fee', 'Gov Fee', 'Agreed to Terms'
      ];
      
      fs.writeFileSync(this.csvFile, this.escapeCSV(headers) + '\n');
      console.log(`📁 Created CSV file: ${this.csvFile}`);
    }
  }

  escapeCSV(field) {
    if (typeof field === 'string') {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const escaped = field.replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
        return `"${escaped}"`;
      }
      return escaped;
    }
    return field;
  }

  async appendSubmission(data) {
    return new Promise((resolve) => {
      try {
        const row = [
          new Date().toISOString(),
          data.caseId,
          'SUBMITTED',
          data.scamType,
          data.amountLost,
          data.currency,
          data.dateOccurred,
          data.description,
          data.scammerDetails,
          data.contactEmail,
          data.evidenceFileNames.join('; '),
          data.evidenceFileCount,
          data.paymentMethod || 'None',
          data.selectedCrypto || 'N/A',
          data.paymentProofFileName,
          data.calculatedFees.totalFee,
          data.calculatedFees.feeTracking,
          data.calculatedFees.feeLegal,
          data.calculatedFees.feeGov,
          data.agreedToTerms ? 'YES' : 'NO'
        ];

        const csvRow = row.map(field => this.escapeCSV(field)).join(',') + '\n';
        
        fs.appendFile(this.csvFile, csvRow, (err) => {
          if (err) {
            console.error('❌ CSV write error:', err);
            // Fallback to JSON log
            this.logToJSON(data);
            resolve({ success: true, fallback: true });
          } else {
            console.log(`✅ Saved to CSV: ${data.caseId}`);
            resolve({ success: true });
          }
        });

      } catch (error) {
        console.error('Submission error:', error);
        this.logToJSON(data);
        resolve({ success: true, fallback: true });
      }
    });
  }

  logToJSON(data) {
    const jsonFile = path.join(this.exportDir, 'scam_reports.json');
    let existingData = [];
    
    try {
      if (fs.existsSync(jsonFile)) {
        const content = fs.readFileSync(jsonFile, 'utf8');
        existingData = JSON.parse(content);
      }
    } catch (e) {
      // Start fresh
    }
    
    existingData.push({
      timestamp: new Date().toISOString(),
      ...data
    });
    
    fs.writeFileSync(jsonFile, JSON.stringify(existingData, null, 2));
    console.log(`📝 JSON backup: ${jsonFile}`);
  }

  // Admin function to get all submissions
  getAllSubmissions() {
    try {
      const content = fs.readFileSync(this.csvFile, 'utf8');
      const lines = content.trim().split('\n');
      const headers = lines[0].split(',');
      
      const submissions = lines.slice(1).map(line => {
        const values = this.parseCSVLine(line);
        const submission = {};
        headers.forEach((header, index) => {
          submission[header] = values[index] || '';
        });
        return submission;
      });
      
      return submissions;
    } catch (error) {
      console.error('Error reading CSV:', error);
      return [];
    }
  }

  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.replace(/""/g, '"'));
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.replace(/""/g, '"'));
    return values;
  }
}

module.exports = CSVExportService;