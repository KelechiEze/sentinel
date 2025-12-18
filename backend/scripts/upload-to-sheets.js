const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// ====================
// CONFIGURATION - UPDATED FOR SERVICE ACCOUNT
// ====================
const CONFIG = {
  // Service Account Configuration (from environment variables)
  serviceAccount: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL || ''
  },
  
  // Alternative: Use JSON file path
  credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, '../secure-keys/google-service-account.json'),
  tokenPath: path.join(__dirname, '../env/token.json'),
  
  // Google API Scopes
  SCOPES: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'],
  
  // Spreadsheet settings
  spreadsheetName: `Scam Reports - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || null,
  
  // Performance settings
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 10,
  chunkSize: 1000 // Rows per API call
};

// ====================
// AUTHENTICATION - UPDATED FOR SERVICE ACCOUNT
// ====================
async function authenticate() {
  console.log('🔐 Authenticating with Google API...');
  
  try {
    // METHOD 1: Use Service Account from environment variables
    if (process.env.USE_SERVICE_ACCOUNT === 'true' && CONFIG.serviceAccount.private_key) {
      console.log('🔑 Using Service Account authentication');
      
      const auth = new google.auth.GoogleAuth({
        credentials: CONFIG.serviceAccount,
        scopes: CONFIG.SCOPES
      });
      
      const authClient = await auth.getClient();
      console.log('✅ Service Account authenticated successfully');
      return authClient;
    }
    
    // METHOD 2: Use credentials JSON file
    if (fs.existsSync(CONFIG.credentialsPath)) {
      console.log(`📁 Using credentials file: ${CONFIG.credentialsPath}`);
      
      const auth = new google.auth.GoogleAuth({
        keyFile: CONFIG.credentialsPath,
        scopes: CONFIG.SCOPES
      });
      
      const authClient = await auth.getClient();
      console.log('✅ File-based authentication successful');
      return authClient;
    }
    
    // METHOD 3: Fallback to OAuth 2.0 (for backward compatibility)
    console.log('⚠️  Using OAuth 2.0 fallback authentication');
    
    // Check for environment variables for OAuth
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost'
      );
      
      // Check for existing token
      if (fs.existsSync(CONFIG.tokenPath)) {
        const token = JSON.parse(fs.readFileSync(CONFIG.tokenPath, 'utf8'));
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
      }
      
      // Get new token if needed
      return await getNewToken(oAuth2Client);
    }
    
    throw new Error('No authentication method available. Please set up Google credentials.');
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    throw error;
  }
}

function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: CONFIG.SCOPES,
    });
    
    console.log('📋 Authorize this app by visiting this URL:', authUrl);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          reject(new Error('Error retrieving access token: ' + err));
          return;
        }
        
        oAuth2Client.setCredentials(token);
        
        // Save the token
        if (!fs.existsSync(path.dirname(CONFIG.tokenPath))) {
          fs.mkdirSync(path.dirname(CONFIG.tokenPath), { recursive: true });
        }
        fs.writeFileSync(CONFIG.tokenPath, JSON.stringify(token));
        console.log('✅ Token stored to:', CONFIG.tokenPath);
        
        resolve(oAuth2Client);
      });
    });
  });
}

// ====================
// SPREADSHEET OPERATIONS
// ====================
async function createSpreadsheet(auth, csvFilePath) {
  console.log('📄 Creating new spreadsheet...');
  
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });
    
    // Check file size
    const stats = fs.statSync(csvFilePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    if (fileSizeMB > CONFIG.maxFileSizeMB) {
      console.warn(`⚠️  File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum (${CONFIG.maxFileSizeMB}MB)`);
    }
    
    // Read CSV content
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const rows = csvContent.split('\n').filter(row => row.trim() !== '');
    
    if (rows.length <= 1) {
      throw new Error('CSV file contains no data (only headers or empty)');
    }
    
    const data = rows.map(row => {
      // Parse CSV row considering quoted values
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        const nextChar = row[i + 1];
        
        if (char === '"' && !inQuotes) {
          inQuotes = true;
        } else if (char === '"' && inQuotes && nextChar === '"') {
          currentValue += '"';
          i++; // Skip next quote
        } else if (char === '"' && inQuotes) {
          inQuotes = false;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue);
      return values;
    });
    
    // Create spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: CONFIG.spreadsheetName,
        },
        sheets: [
          {
            properties: {
              title: 'Scam Reports',
              gridProperties: {
                rowCount: Math.min(data.length, 10000), // Limit for performance
                columnCount: data[0] ? data[0].length : 0,
              },
            },
          },
        ],
      },
    });
    
    const spreadsheetId = spreadsheet.data.spreadsheetId;
    console.log(`✅ Spreadsheet created: ${spreadsheet.data.spreadsheetUrl}`);
    
    // Move to folder if specified
    if (CONFIG.folderId) {
      try {
        await drive.files.update({
          fileId: spreadsheetId,
          addParents: CONFIG.folderId,
          fields: 'id, parents',
        });
        console.log(`📂 Moved to folder: ${CONFIG.folderId}`);
      } catch (folderError) {
        console.warn(`⚠️  Could not move to folder: ${folderError.message}`);
      }
    }
    
    // Update with CSV data in chunks for large files
    const totalRows = data.length - 1; // Exclude header
    const headerRow = data[0];
    
    console.log(`📊 Importing ${totalRows} rows in chunks...`);
    
    // Import header
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: 'Scam Reports!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [headerRow],
      },
    });
    
    // Import data in chunks
    for (let i = 1; i < data.length; i += CONFIG.chunkSize) {
      const chunk = data.slice(i, i + CONFIG.chunkSize);
      const range = `Scam Reports!A${i + 1}`;
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: chunk,
        },
      });
      
      const progress = Math.min(i + CONFIG.chunkSize, data.length - 1);
      console.log(`   ↪ Imported ${progress}/${totalRows} rows...`);
    }
    
    console.log(`📊 Data imported: ${totalRows} rows, ${headerRow.length} columns`);
    
    // Format header row
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.1, green: 0.3, blue: 0.6 },
                    textFormat: {
                      bold: true,
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                      fontSize: 11,
                    },
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,fontSize)',
              },
            },
            {
              updateSheetProperties: {
                properties: {
                  sheetId: 0,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                  title: 'Scam Reports',
                },
                fields: 'gridProperties.frozenRowCount,title',
              },
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: 0,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: headerRow.length,
                },
              },
            },
          ],
        },
      });
      
      console.log('🎨 Header formatted, frozen, and columns auto-resized');
    } catch (formatError) {
      console.warn(`⚠️  Formatting failed (non-critical): ${formatError.message}`);
    }
    
    return {
      id: spreadsheetId,
      url: spreadsheet.data.spreadsheetUrl,
      name: CONFIG.spreadsheetName,
      rows: totalRows,
      columns: headerRow.length,
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('❌ Error creating spreadsheet:', error.message);
    throw error;
  }
}

// ====================
// CSV FILE HANDLING
// ====================
function getCSVFile(filePathFromArgs) {
  // Use provided file path or find latest
  if (filePathFromArgs && fs.existsSync(filePathFromArgs)) {
    return filePathFromArgs;
  }
  
  // Fallback: look for latest.csv
  const latestPath = path.join(__dirname, '../csv-exports/latest.csv');
  if (fs.existsSync(latestPath)) {
    console.log(`📁 Using latest.csv from: ${latestPath}`);
    return latestPath;
  }
  
  // Fallback: find any CSV in csv-exports
  const csvDir = path.join(__dirname, '../csv-exports');
  if (fs.existsSync(csvDir)) {
    const files = fs.readdirSync(csvDir)
      .filter(file => file.endsWith('.csv'))
      .map(file => ({
        name: file,
        path: path.join(csvDir, file),
        mtime: fs.statSync(path.join(csvDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    if (files.length > 0) {
      console.log(`📁 Using most recent CSV: ${files[0].name}`);
      return files[0].path;
    }
  }
  
  throw new Error('No CSV file found. Please provide a file path or run auto.js first.');
}

// ====================
// MAIN PROCESS
// ====================
async function main() {
  try {
    console.log('🚀 Starting Google Sheets upload...');
    console.log('='.repeat(50));
    
    // Check if Google Sheets is enabled
    if (process.env.GOOGLE_SHEETS_ENABLED === 'false') {
      console.log('⏭️  Google Sheets upload is disabled (GOOGLE_SHEETS_ENABLED=false)');
      return { success: true, skipped: true, reason: 'Disabled in config' };
    }
    
    // 1. Get CSV file path
    const csvFilePath = getCSVFile(process.argv[2]);
    console.log(`📄 Processing CSV: ${csvFilePath}`);
    
    // 2. Authenticate
    const auth = await authenticate();
    
    // 3. Create and populate spreadsheet
    const result = await createSpreadsheet(auth, csvFilePath);
    
    console.log('='.repeat(50));
    console.log('✅ Upload completed successfully!');
    console.log(`📊 Spreadsheet: ${result.url}`);
    console.log(`📛 Name: ${result.name}`);
    console.log(`📈 Data: ${result.rows} rows, ${result.columns} columns`);
    
    // Save spreadsheet info to a file
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const infoPath = path.join(exportsDir, 'latest-upload.json');
    fs.writeFileSync(infoPath, JSON.stringify(result, null, 2), 'utf8');
    console.log(`💾 Info saved: ${infoPath}`);
    
    // Also append to upload log
    const logPath = path.join(exportsDir, 'upload-history.json');
    let logData = [];
    
    if (fs.existsSync(logPath)) {
      logData = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }
    
    logData.push({
      timestamp: new Date().toISOString(),
      ...result,
      csvSource: path.basename(csvFilePath)
    });
    
    // Keep only last 50 entries
    if (logData.length > 50) {
      logData = logData.slice(-50);
    }
    
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), 'utf8');
    
    return result;
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    
    // Log error
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      csvFile: process.argv[2] || 'unknown'
    };
    
    const errorDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(errorDir)) {
      fs.mkdirSync(errorDir, { recursive: true });
    }
    
    const errorPath = path.join(errorDir, 'upload-errors.json');
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
// EXECUTION
// ====================
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: path.join(__dirname, '../env/.env') });
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const skipUpload = args.includes('--skip') || process.env.SKIP_UPLOAD === 'true';
  
  if (skipUpload) {
    console.log('⏭️  Skipping upload (--skip flag or SKIP_UPLOAD=true)');
    process.exit(0);
  }
  
  main();
}

module.exports = { authenticate, createSpreadsheet, main };