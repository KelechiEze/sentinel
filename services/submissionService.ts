import { ReportFormData, SubmissionResponse } from '../types';

// 🎯 CHANGE THIS TO LOCALHOST!
const API_BASE_URL = 'http://localhost:5000';

export const submitFormData = async (
  formData: ReportFormData,
  paymentMethod: string | null,
  selectedCrypto: string | null,
  paymentProofFile: File | null
): Promise<SubmissionResponse> => {
  
  console.log('🔄 Submitting to LOCAL backend...');
  
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
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Submission successful:', result);
    
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
      error: 'Failed to submit. Make sure local server is running on port 5000.'
    };
  }
};