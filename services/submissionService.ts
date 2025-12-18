// services/submissionService.ts
import { ReportFormData, SubmissionData, SubmissionResponse } from '../types';

export const submitFormData = async (
  formData: ReportFormData,
  paymentMethod: string | null,
  selectedCrypto: string | null,
  paymentProofFile: File | null
): Promise<SubmissionResponse> => {
  try {
    // Prepare the submission payload
    const payload: SubmissionData = {
      timestamp: new Date().toISOString(),
      caseId: `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'SUBMITTED',
      
      // Copy form data
      scamType: formData.scamType,
      amountLost: formData.amountLost,
      currency: formData.currency,
      dateOccurred: formData.dateOccurred,
      description: formData.description,
      scammerDetails: formData.scammerDetails,
      contactEmail: formData.contactEmail,
      agreedToTerms: formData.agreedToTerms,
      
      // File information
      evidenceFileNames: formData.evidenceFiles.map(file => file.name),
      evidenceFileCount: formData.evidenceFiles.length,
      paymentMethod: paymentMethod,
      selectedCrypto: selectedCrypto,
      paymentProofFileName: paymentProofFile?.name || 'None',
      
      // Calculated fees
      calculatedFees: {
        totalFee: parseFloat(formData.amountLost) * 0.05 || 0,
        feeTracking: parseFloat(formData.amountLost) * 0.05 * 0.48 || 0,
        feeLegal: parseFloat(formData.amountLost) * 0.05 * 0.32 || 0,
        feeGov: parseFloat(formData.amountLost) * 0.05 * 0.20 || 0,
      }
    };

    // Use proxy URL - Vite will proxy to backend
    const response = await fetch('/api/submit-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Submission successful:', result);
    
    return { 
      success: true, 
      caseId: payload.caseId,
      message: result.message,
      timestamp: payload.timestamp,
      downloadUrl: result.downloadUrl
    };

  } catch (error) {
    console.error('Submission error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Function to check submission status
export const checkSubmissionStatus = async (caseId: string): Promise<SubmissionResponse> => {
  try {
    const response = await fetch(`/api/submissions/${caseId}`);
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Status check error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Function to get all submissions (admin view)
export const getAllSubmissions = async (): Promise<{success: boolean; data?: any[]; error?: string}> => {
  try {
    const response = await fetch('/api/submissions');
    if (!response.ok) {
      throw new Error(`Failed to fetch submissions: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get submissions error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Function to download CSV
export const downloadCSV = async (): Promise<Blob | null> => {
  try {
    const response = await fetch('/api/export/csv');
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Download error:', error);
    return null;
  }
};