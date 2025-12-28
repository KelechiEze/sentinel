import { ReportFormData, SubmissionResponse } from '../types';

// 🎯 Using ONLY Render backend for all devices
const API_BASE_URL = 'https://sentinel-shkp.onrender.com';

export const submitFormData = async (
  formData: ReportFormData,
  paymentMethod: string | null,
  selectedCrypto: string | null,
  paymentProofFile: File | null
): Promise<SubmissionResponse> => {
  
  console.log('🔄 Submitting to Render backend...');
  
  try {
    const payload = {
      contactEmail: formData.contactEmail,
      scamType: formData.scamType,
      amountLost: formData.amountLost || '0',
      currency: formData.currency || 'USD',
      dateOccurred: formData.dateOccurred || new Date().toISOString().split('T')[0],
      description: formData.description || '',
      scammerDetails: formData.scammerDetails || '',
      agreedToTerms: formData.agreedToTerms || false,
      paymentMethod: paymentMethod || 'Not specified',
      selectedCrypto: selectedCrypto || null,
      evidenceFileCount: formData.evidenceFiles.length,
      paymentProofFileName: paymentProofFile?.name || null
    };

    console.log(`🚀 Submitting to: ${API_BASE_URL}/api/submit-report`);
    
    const response = await fetch(`${API_BASE_URL}/api/submit-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sentinel-Client/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const result = await response.json();
    console.log('✅ Submission successful to Render backend:', result);
    
    return { 
      success: true, 
      caseId: result.caseId,
      message: result.message,
      timestamp: result.timestamp
    };

  } catch (error) {
    console.error('❌ Submission error:', error);
    return { 
      success: false, 
      error: `Failed to submit to server. Error: ${error.message}`
    };
  }
};