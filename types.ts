// types.ts
export enum ScamType {
  CRYPTO = "Crypto / Investment",
  BANK_TRANSFER = "Bank Transfer Fraud",
  ROMANCE = "Romance Scam",
  SHOPPING = "Online Shopping / E-commerce",
  PHISHING = "Phishing / Identity Theft",
  TECH_SUPPORT = "Tech Support Scam",
  OTHER = "Other"
}

export interface ReportFormData {
  scamType: ScamType | "";
  amountLost: string;
  currency: string;
  dateOccurred: string;
  description: string;
  scammerDetails: string;
  evidenceFiles: File[];
  contactEmail: string;
  agreedToTerms: boolean;
}

export interface SubmissionData {
  timestamp: string;
  caseId: string;
  status: 'PENDING' | 'SUBMITTED' | 'PROCESSING' | 'COMPLETED';
  
  // Form data
  scamType: ScamType | "";
  amountLost: string;
  currency: string;
  dateOccurred: string;
  description: string;
  scammerDetails: string;
  contactEmail: string;
  agreedToTerms: boolean;
  
  // File information
  evidenceFileNames: string[];
  evidenceFileCount: number;
  paymentMethod: string | null;
  selectedCrypto: string | null;
  paymentProofFileName: string;
  
  // Calculated fees
  calculatedFees: {
    totalFee: number;
    feeTracking: number;
    feeLegal: number;
    feeGov: number;
  };
}

export interface SubmissionResponse {
  success: boolean;
  message?: string;
  caseId?: string;
  timestamp?: string;
  downloadUrl?: string;
  error?: string;
}

export interface SubmissionStatus {
  caseId: string;
  status: 'PENDING' | 'SUBMITTED' | 'PROCESSING' | 'COMPLETED';
  timestamp: string;
  contactEmail: string;
  scamType: string;
  amountLost: number;
  lastUpdated: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

// CSV Export Types
export interface CSVRow {
  Timestamp: string;
  'Case ID': string;
  Status: string;
  'Scam Type': string;
  'Amount Lost': string;
  Currency: string;
  'Date Occurred': string;
  Description: string;
  'Scammer Details': string;
  'Contact Email': string;
  'Evidence Files': string;
  'File Count': number;
  'Payment Method': string;
  'Selected Crypto': string;
  'Payment Proof': string;
  'Total Fee': number;
  'Tracking Fee': number;
  'Legal Fee': number;
  'Gov Fee': number;
  'Agreed to Terms': string;
}

// Payment Platform Types
export interface PaymentPlatform {
  id: string;
  name: string;
  icon: React.ComponentType;
  color: string;
  bgColor: string;
}

export interface CryptoAsset {
  name: string;
  symbol: string;
  address: string;
  network: string;
  qrValue?: string;
  memo?: string;
}

export interface PaymentDetails {
  // For bank wire
  beneficiary?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  bankName?: string;
  bankAddress?: string;
  reference?: string;
  
  // For PayPal/CashApp/etc
  email?: string;
  phone?: string;
  username?: string;
  cashtag?: string;
  businessName?: string;
  note?: string;
  currency?: string;
  paypalMe?: string;
  recipient?: string;
  businessProfile?: boolean;
  
  // For crypto
  assets?: Record<string, CryptoAsset>;
}