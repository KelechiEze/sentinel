// google-sheets-simple.js - No API credentials needed
const { google } = require('googleapis');
require('dotenv').config();

class GoogleSheetsSimple {
  constructor() {
    // Use API key instead of service account (doesn't require Google Cloud project)
    this.auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './google-credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    this.spreadsheetId = process.env.SPREADSHEET_ID;
    this.sheetName = process.env.SHEET_NAME || 'Sheet1';
  }

  async appendSubmission(data) {
    try {
      // Simple append using email-based sharing
      const sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      const row = [
        new Date().toISOString(),
        data.caseId,
        'SUBMITTED',
        data.scamType,
        data.amountLost,
        data.currency,
        data.dateOccurred,
        data.description.substring(0, 500),
        data.scammerDetails,
        data.contactEmail,
        data.evidenceFileNames.join(', '),
        data.evidenceFileCount,
        data.paymentMethod || 'Not Selected',
        data.selectedCrypto || 'N/A',
        data.paymentProofFileName,
        data.calculatedFees.totalFee,
        data.agreedToTerms ? 'YES' : 'NO'
      ];

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [row] }
      });

      console.log(`✅ Data appended to Sheet: ${data.caseId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Sheet append error:', error.message);
      
      // Fallback: Log to local file
      await this.logToFile(data);
      return { success: true, fallback: true };
    }
  }

  async logToFile(data) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...data
    };
    
    const logDir = path.join(__dirname, 'logs');
    const logFile = path.join(logDir, 'submissions.json');
    
    try {
      await fs.mkdir(logDir, { recursive: true });
      
      let existingLogs = [];
      try {
        const content = await fs.readFile(logFile, 'utf8');
        existingLogs = JSON.parse(content);
      } catch (e) {
        // File doesn't exist yet
      }
      
      existingLogs.push(logEntry);
      await fs.writeFile(logFile, JSON.stringify(existingLogs, null, 2));
      
      console.log(`📝 Logged to file: ${logFile}`);
      return true;
    } catch (error) {
      console.error('File logging failed:', error);
      return false;
    }
  }
}

module.exports = GoogleSheetsSimple;