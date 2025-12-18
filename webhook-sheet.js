// webhook-sheet.js - No Google API needed
const axios = require('axios');

class WebhookSheetService {
  constructor() {
    // Use Make.com (formerly Integromat) or Zapier webhook
    this.webhookUrl = process.env.WEBHOOK_URL;
    this.enableLocalLog = true;
  }

  async appendSubmission(data) {
    try {
      // Method 1: Send to webhook service
      if (this.webhookUrl) {
        await axios.post(this.webhookUrl, {
          event: 'scam_report',
          timestamp: new Date().toISOString(),
          data: data
        });
        console.log(`✅ Sent to webhook: ${data.caseId}`);
      }

      // Method 2: Always log locally
      if (this.enableLocalLog) {
        await this.logToCSV(data);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook error:', error.message);
      
      // Fallback to local log
      await this.logToCSV(data);
      return { success: true, fallback: true };
    }
  }

  async logToCSV(data) {
    const fs = require('fs');
    const path = require('path');
    const csv = require('csv-stringify');
    
    const logDir = path.join(__dirname, 'logs');
    const csvFile = path.join(logDir, 'submissions.csv');
    
    // Ensure directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Create CSV row
    const row = [
      new Date().toISOString(),
      data.caseId,
      data.scamType,
      data.amountLost,
      data.currency,
      data.dateOccurred,
      `"${data.description.replace(/"/g, '""')}"`, // Escape quotes for CSV
      data.scammerDetails,
      data.contactEmail,
      data.evidenceFileNames.join(';'),
      data.paymentMethod,
      data.calculatedFees.totalFee,
      data.agreedToTerms ? 'YES' : 'NO'
    ];
    
    // Check if file exists to write headers
    const fileExists = fs.existsSync(csvFile);
    
    const writeStream = fs.createWriteStream(csvFile, { flags: 'a' });
    
    if (!fileExists) {
      const headers = [
        'Timestamp', 'Case ID', 'Scam Type', 'Amount', 'Currency', 
        'Date', 'Description', 'Scammer Details', 'Email', 
        'Evidence Files', 'Payment Method', 'Total Fee', 'Agreed'
      ];
      writeStream.write(headers.join(',') + '\n');
    }
    
    writeStream.write(row.join(',') + '\n');
    writeStream.end();
    
    console.log(`📝 CSV logged: ${csvFile}`);
    return true;
  }
}

module.exports = WebhookSheetService;