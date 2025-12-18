import { ReportFormData, SubmissionResponse } from '../types';

const API_BASE_URL = 'https://sentinel-wine.vercel.app';

export const submitFormData = async (
  formData: ReportFormData,
  paymentMethod: string | null,
  selectedCrypto: string | null,
  paymentProofFile: File | null
): Promise<SubmissionResponse> => {
  
  console.log('🔄 Starting form submission...');
  
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
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Submission successful:', result);
    
    // 🚨 CRITICAL: Immediately trigger CSV sync
    try {
      // Call the trigger endpoint to ensure CSV is created
      await fetch(`${API_BASE_URL}/api/trigger-export`);
      console.log('📊 CSV export triggered');
    } catch (csvError) {
      console.log('⚠️ CSV trigger failed (non-critical):', csvError);
    }
    
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
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Test function
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};