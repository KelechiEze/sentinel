// Use CSV export instead of Google Sheets
const CSVExportService = require('./csv-export');

// Initialize CSV service
const sheetsService = new CSVExportService();

// Add new endpoint to download CSV
app.get('/api/export/csv', (req, res) => {
  try {
    const csvPath = path.join(__dirname, 'exports', 'scam_reports.csv');
    res.download(csvPath, 'scam_reports.csv');
  } catch (error) {
    res.status(500).json({ error: 'Export file not available' });
  }
});

// View submissions in browser
app.get('/api/submissions/view', (req, res) => {
  try {
    const submissions = sheetsService.getAllSubmissions();
    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
      downloadLink: '/api/export/csv'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load submissions' });
  }
});