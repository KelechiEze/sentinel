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
  scammerDetails: string; // Websites, emails, phone numbers used
  evidenceFiles: File[]; // Simulation
  contactEmail: string;
  agreedToTerms: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}