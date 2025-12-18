const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// ====================
// CONFIGURATION
// ====================
const CONFIG = {
  // Paths
  credentialsPath: path.join(__dirname, '../env/credentials.json'),
  tokenPath: path.join(__dirname, '../env/token.json'),
  
  // Google API Scopes
  SCOPES: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  
  // Spreadsheet settings
  spreadsheetName: `Data Export - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
  folderId: null // Optional: 'your-google-drive-folder-id'
};

// ====================
// AUTHENTICATION
// ====================
async function authenticate() {
  console.log('🔐 Authenticating with Google API...');
  
  // Load credentials
  if (!fs.existsSync(CONFIG.credentialsPath)) {
    throw new Error(`Credentials file not found at: ${CONFIG.credentialsPath}`);
  }
  
  const credentials = JSON.parse(fs.readFileSync(CONFIG.credentialsPath, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  
  // Check for existing token
  if (fs.existsSync(CONFIG.tokenPath)) {
    const token = JSON.parse(fs.readFileSync(CONFIG.tokenPath, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }
  
  // Get new token
  return await getNewToken(oAuth2Client);
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
  
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });
  
  // Read CSV content
  const csvContent = fs.readFileSync(csvFilePath, 'utf8');
  const rows = csvContent.split('\n').filter(row => row.trim() !== '');
  const data = rows.map(row => row.split(','));
  
  // Create spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    resource: {
      properties: {
        title: CONFIG.spreadsheetName,
      },
      sheets: [
        {
          properties: {
            title: 'Data',
            gridProperties: {
              rowCount: data.length,
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
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: CONFIG.folderId,
      fields: 'id, parents',
    });
    console.log(`📂 Moved to folder: ${CONFIG.folderId}`);
  }
  
  // Update with CSV data
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: 'Data!A1',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: data,
    },
  });
  
  console.log(`📊 Data imported: ${data.length - 1} rows, ${data[0] ? data[0].length : 0} columns`);
  
  // Format header row
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
                backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },
        {
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    },
  });
  
  console.log('🎨 Header formatted and frozen');
  
  return {
    id: spreadsheetId,
    url: spreadsheet.data.spreadsheetUrl,
    name: CONFIG.spreadsheetName,
  };
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
    const files = fs.readdirSync(csvDir).filter(file => file.endsWith('.csv'));
    if (files.length > 0) {
      const latestFile = files.sort().reverse()[0];
      return path.join(csvDir, latestFile);
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
    console.log(`🆔 ID: ${result.id}`);
    
    // Save spreadsheet info to a file
    const infoPath = path.join(__dirname, '../exports/latest-upload.json');
    fs.writeFileSync(infoPath, JSON.stringify(result, null, 2));
    console.log(`💾 Info saved: ${infoPath}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// ====================
// EXECUTION
// ====================
if (require.main === module) {
  main();
}

module.exports = { authenticate, createSpreadsheet, main };