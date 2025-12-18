// services/submissionService.ts
import { ReportFormData, SubmissionData, SubmissionResponse } from '../types';

// 🎯 USE YOUR RAILWAY URL
const API_BASE_URL = 'https://sentinel-production-3479.up.railway.app';

// 🎯 TEST FUNCTION
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log(`🔍 Testing connection to: ${API_BASE_URL}/api/health`);
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is online:', data);
      return true;
    } else {
      console.error('❌ Backend returned error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

// 🎯 ENHANCED TEST WITH DETAILS
export const testBackendDetails = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend test details:', data);
      return data;
    }
    return null;
  } catch (error) {
    console.error('❌ Backend test failed:', error);
    return null;
  }
};

export const submitFormData = async (
  formData: ReportFormData,
  paymentMethod: string | null,
  selectedCrypto: string | null,
  paymentProofFile: File | null
): Promise<SubmissionResponse> => {
  
  console.log('🔄 Starting form submission process...');
  
  // Test connection first
  const isConnected = await testBackendConnection();
  if (!isConnected) {
    return {
      success: false,
      error: 'Backend server is not responding. Please try again later.'
    };
  }
  
  try {
    // Prepare SIMPLIFIED payload (remove complex nested objects)
    const payload = {
      // Required fields
      contactEmail: formData.contactEmail,
      scamType: formData.scamType,
      amountLost: formData.amountLost || '0',
      currency: formData.currency || 'USD',
      dateOccurred: formData.dateOccurred || new Date().toISOString().split('T')[0],
      
      // Optional fields
      description: formData.description || '',
      scammerDetails: formData.scammerDetails || '',
      agreedToTerms: formData.agreedToTerms || false,
      
      // Payment info
      paymentMethod: paymentMethod || 'Not specified',
      selectedCrypto: selectedCrypto || null,
      
      // File counts (not the files themselves)
      evidenceFileCount: formData.evidenceFiles.length,
      paymentProofFileName: paymentProofFile?.name || null,
      
      // Simple fee calculation (frontend only, not saved to backend)
      totalFee: parseFloat(formData.amountLost) * 0.05 || 0
    };

    console.log(`🚀 Submitting to: ${API_BASE_URL}/api/submit-report`);
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    // Make the request with proper CORS handling
    const response = await fetch(`${API_BASE_URL}/api/submit-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      mode: 'cors'
    });

    console.log('📥 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      console.error('❌ Server error response:', errorData);
      
      throw new Error(
        errorData.error || 
        errorData.message || 
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log('✅ Submission successful:', result);
    
    return { 
      success: true, 
      caseId: result.caseId || payload.caseId,
      message: result.message || 'Report submitted successfully',
      timestamp: result.timestamp || new Date().toISOString(),
      downloadUrl: result.downloadUrl || null
    };

  } catch (error) {
    console.error('❌ Submission error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Network errors
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      // CORS errors
      if (errorMessage.includes('CORS') || errorMessage.includes('origin')) {
        errorMessage = 'Connection blocked by browser security. Please try a different browser or contact support.';
      }
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

// Function to check submission status
export const checkSubmissionStatus = async (caseId: string): Promise<SubmissionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${caseId}`, {
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
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
export const getAllSubmissions = async (adminToken?: string): Promise<{success: boolean; data?: any[]; error?: string}> => {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/json'
    };
    
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      headers,
      mode: 'cors'
    });
    
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

// Helper to run diagnostics
export const runDiagnostics = async () => {
  console.log('🔧 Running backend diagnostics...');
  
  const tests = [
    { name: 'Health Check', url: `${API_BASE_URL}/api/health` },
    { name: 'Test Endpoint', url: `${API_BASE_URL}/api/test` }
  ];
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      console.log(`${response.ok ? '✅' : '❌'} ${test.name}: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const data = await response.json();
        console.log('   Response:', data);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
};

// Call diagnostics on import (for debugging)
if (typeof window !== 'undefined') {
  console.log('🔄 Submission service loaded');
  // Uncomment to auto-run diagnostics
  // runDiagnostics().catch(console.error);
}