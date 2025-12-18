// pages/ReportScam.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScamType, ReportFormData } from '../types';
import { submitFormData } from '../services/submissionService';
import { AlertTriangle, Lock, UploadCloud, CheckCircle, Shield, Info, FileText, Globe, Search, Banknote, CreditCard, Bitcoin, Smartphone, Landmark, Copy, Check, ChevronDown, Loader2, FileCheck, Mail, Building, Smartphone as PhoneIcon, Wallet, QrCode, DollarSign, PoundSterling, Euro, CreditCard as CardIcon } from 'lucide-react';

// Payment platform configuration with real-world symbols and details
const PAYMENT_PLATFORMS = {
  WIRE: {
    id: 'wire',
    name: 'Bank Wire Transfer',
    icon: Building,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    details: {
      beneficiary: 'SENTINEL FORENSIC ADVOCACY LTD',
      accountNumber: '4489 7712 3091 5560',
      routingNumber: '021000021',
      swiftCode: 'CHASUS33',
      iban: 'US03CHAS03301234567890',
      bankName: 'JPMORGAN CHASE BANK, N.A.',
      bankAddress: '383 Madison Avenue, New York, NY 10017, USA',
      reference: 'CASE 8829-X | SENTINEL RETAINER'
    }
  },
  CRYPTO: {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: Bitcoin,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    assets: {
      BTC: {
        name: 'Bitcoin',
        symbol: '₿',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        network: 'Bitcoin Mainnet',
        qrValue: 'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      },
      ETH: {
        name: 'Ethereum',
        symbol: 'Ξ',
        address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        network: 'Ethereum ERC-20',
        qrValue: 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
      },
      USDT: {
        name: 'Tether (USDT)',
        symbol: '₮',
        address: 'TJ8vc98k3j0kfj983kfkj983kfj983kfj983',
        network: 'TRON TRC-20',
        memo: '8829-X'
      },
      BNB: {
        name: 'Binance Coin',
        symbol: '⎈',
        address: 'bnb136ns6lfw4zs5hg4n85vdthu3n0v0v35',
        network: 'Binance Chain BEP-2',
        memo: '8829X'
      }
    }
  },
  PAYPAL: {
    id: 'paypal',
    name: 'PayPal',
    icon: CreditCard,
    color: 'text-blue-400',
    bgColor: 'bg-blue-50',
    symbol: '$',
    details: {
      email: 'settlements@sentinel-forensic.org',
      businessName: 'Sentinel Forensic Advocacy',
      note: 'Case 8829-X Retainer Fee',
      currency: 'USD',
      paypalMe: 'sentinelforensic'
    }
  },
  CASHAPP: {
    id: 'cashapp',
    name: 'Cash App',
    icon: DollarSign,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    symbol: '$',
    details: {
      cashtag: '$SentinelAdvocacy',
      note: 'Case 8829-X',
      recipient: 'Sentinel Forensic Services'
    }
  },
  ZELLE: {
    id: 'zelle',
    name: 'Zelle',
    icon: Banknote,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    symbol: '$',
    details: {
      email: 'legal@sentinel-advocacy.com',
      phone: '+1 (555) 123-4567',
      name: 'Sentinel Forensic Advocacy',
      note: 'Case Retainer 8829-X'
    }
  },
  VENMO: {
    id: 'venmo',
    name: 'Venmo',
    icon: Wallet,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    symbol: '$',
    details: {
      username: '@Sentinel-Forensic',
      note: 'Case 8829-X Retainer',
      businessProfile: true
    }
  }
};

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  BTC: '₿',
  ETH: 'Ξ'
};

export const ReportScam: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState<{
    caseId: string;
    timestamp: string;
  } | null>(null);

  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const paymentProofInputRef = useRef<HTMLInputElement>(null);

  const [selectedMethod, setSelectedMethod] = useState<keyof typeof PAYMENT_PLATFORMS | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<keyof typeof PAYMENT_PLATFORMS.CRYPTO.assets>("BTC");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<ReportFormData>({
    scamType: "",
    amountLost: "",
    currency: "USD",
    dateOccurred: "",
    description: "",
    scammerDetails: "",
    evidenceFiles: [],
    contactEmail: "",
    agreedToTerms: false
  });

  // Calculate fees using useMemo to prevent recalculations
  const amountLostNum = useMemo(() => parseFloat(formData.amountLost) || 0, [formData.amountLost]);
  const totalFee = useMemo(() => amountLostNum * 0.05, [amountLostNum]);
  const feeTracking = useMemo(() => totalFee * 0.48, [totalFee]);
  const feeLegal = useMemo(() => totalFee * 0.32, [totalFee]);
  const feeGov = useMemo(() => totalFee * 0.20, [totalFee]);

  // Generate QR code for cryptocurrency payments
  useEffect(() => {
    if (selectedMethod === 'CRYPTO' && PAYMENT_PLATFORMS.CRYPTO.assets[selectedCrypto]?.qrValue) {
      const cryptoAsset = PAYMENT_PLATFORMS.CRYPTO.assets[selectedCrypto];
      const qrData = cryptoAsset.qrValue;
      
      // Using a QR code generation service (QRServer as example)
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
    }
  }, [selectedMethod, selectedCrypto]);

  const formatMoney = (val: number) => {
    const currencySymbol = CURRENCY_SYMBOLS[formData.currency as keyof typeof CURRENCY_SYMBOLS] || formData.currency;
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const displayFee = formatMoney(totalFee);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEvidenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        evidenceFiles: [...prev.evidenceFiles, ...Array.from(e.target.files || [])]
      }));
    }
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProofFile(e.target.files[0]);
    }
  };

  const handleMethodSelect = (method: keyof typeof PAYMENT_PLATFORMS) => {
    setSelectedMethod(method);
    setIsLoadingDetails(true);
    setPaymentProofFile(null);
    setTimeout(() => {
      setIsLoadingDetails(false);
    }, 800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    // Use the submission service
    const result = await submitFormData(
      formData,
      selectedMethod,
      selectedMethod === 'CRYPTO' ? selectedCrypto : null,
      paymentProofFile
    );

    if (result.success) {
      // Store submission data
      setSubmissionData({
        caseId: result.caseId || '',
        timestamp: result.timestamp || new Date().toISOString()
      });
      
      localStorage.setItem('lastCaseId', result.caseId || '');
      localStorage.setItem('lastSubmissionTime', new Date().toISOString());
      
      setIsSuccess(true);
    } else {
      setSubmissionError(result.error || 'Failed to submit form. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setStep(1);
    setIsSuccess(false);
    setFormData({
      scamType: "",
      amountLost: "",
      currency: "USD",
      dateOccurred: "",
      description: "",
      scammerDetails: "",
      evidenceFiles: [],
      contactEmail: "",
      agreedToTerms: false
    });
    setSelectedMethod(null);
    setPaymentProofFile(null);
    setSelectedCrypto("BTC");
    setSubmissionError(null);
  };

  if (isSuccess) {
    const lastCaseId = submissionData?.caseId || localStorage.getItem('lastCaseId') || '8829-X';
    const lastTime = submissionData?.timestamp || localStorage.getItem('lastSubmissionTime') || new Date().toISOString();
    
    return (
      <div className="pt-32 pb-24 min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200 max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Case Submission Complete</h1>
            <p className="text-slate-600 text-lg">Your forensic investigation request has been successfully submitted and is now being processed.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary-600" /> Case Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Case ID:</span>
                  <span className="font-mono font-bold text-slate-900 text-lg">{lastCaseId}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Submission Time:</span>
                  <span className="font-medium">{new Date(lastTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Contact Email:</span>
                  <span className="font-medium text-primary-600">{formData.contactEmail}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Scam Type:</span>
                  <span className="font-medium">{formData.scamType || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Amount Lost:</span>
                  <span className="font-bold text-lg">{formatMoney(amountLostNum)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" /> Next Steps
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                  <div>
                    <p className="font-medium text-slate-900">Case Review & Assignment</p>
                    <p className="text-sm text-slate-600">Our forensic team will review your submission within 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                  <div>
                    <p className="font-medium text-slate-900">Preliminary Dossier</p>
                    <p className="text-sm text-slate-600">A detailed forensic report will be sent to your email within 48 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                  <div>
                    <p className="font-medium text-slate-900">Investigation Commences</p>
                    <p className="text-sm text-slate-600">Our team will begin the forensic analysis and fund tracing process.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-primary-200">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Data Saved:</strong> Your report has been securely stored in our system database.</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-8">
            <h3 className="font-semibold text-slate-900 mb-3">What happens next?</h3>
            <p className="text-slate-600 mb-4">
              You will receive an email confirmation shortly. Our forensic team will contact you at <strong>{formData.contactEmail}</strong> 
              within 24 hours to discuss your case in detail. If you have any immediate questions, please reference your Case ID: 
              <span className="font-mono font-bold ml-2">{lastCaseId}</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Info className="w-4 h-4" />
              <span>All case data is encrypted and stored securely in compliance with data protection regulations.</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')} 
              className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex-1 sm:flex-none"
            >
              Return to Dashboard
            </button>
            <button 
              onClick={handleResetForm}
              className="bg-white border-2 border-primary-500 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex-1 sm:flex-none"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Formal Incident Disclosure</h1>
          <p className="text-slate-600">Procedural Phase {step} of 4</p>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-4">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {step < 3 && (
          <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg mb-8 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
            <div className="text-sm text-primary-900">
              <strong>Statutory Notice:</strong> Sentinel will never solicit cryptographic private keys, mnemonic phrases, or administrative passwords. Such requests are characteristic of fraudulent entities.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative">
          
          {/* Display submission error if any */}
          {submissionError && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Submission Failed</p>
                  <p className="text-red-600 text-sm mt-1">{submissionError}</p>
                  <button 
                    type="button" 
                    onClick={() => setSubmissionError(null)} 
                    className="text-red-600 hover:text-red-800 text-sm mt-2 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900">Incident Class & Valuation</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Matter Classification</label>
                <select 
                  name="scamType" 
                  value={formData.scamType} 
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                >
                  <option value="">Select a category...</option>
                  {Object.values(ScamType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Valuation of Loss</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                      {CURRENCY_SYMBOLS[formData.currency as keyof typeof CURRENCY_SYMBOLS] || formData.currency}
                    </span>
                    <input 
                      type="number" 
                      name="amountLost"
                      value={formData.amountLost}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-400"
                      required
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency Denomination</label>
                  <select 
                    name="currency" 
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none"
                  >
                    <option value="USD">USD - United States Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                    <option value="BTC">BTC - Bitcoin (₿)</option>
                    <option value="ETH">ETH - Ethereum (Ξ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Effective Date of Incident</label>
                <input 
                  type="date" 
                  name="dateOccurred"
                  value={formData.dateOccurred}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                  style={{ colorScheme: 'light' }}
                />
              </div>

              <button 
                type="button" 
                onClick={() => setStep(2)}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors mt-4"
              >
                Proceed to Evidentiary Intake
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900">Narrative & Supporting Evidence</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Detailed Case Narrative</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Provide a comprehensive timeline of events, including method of initial contact and transfer protocols..."
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-400"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Counterparty Particulars (Domains, Aliases, Metadata)</label>
                <input 
                  type="text" 
                  name="scammerDetails"
                  value={formData.scammerDetails}
                  onChange={handleChange}
                  placeholder="e.g. support@illicit-domain.com, +1-555-0192"
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-400"
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">Attach Documentary Evidence</p>
                <input 
                  type="file" 
                  ref={evidenceInputRef}
                  className="hidden" 
                  multiple 
                  onChange={handleEvidenceFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx,.csv"
                />
                <button 
                  type="button" 
                  onClick={() => evidenceInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-primary-600 font-bold hover:bg-slate-50 shadow-sm transition-colors"
                >
                  Select Instruments
                </button>
                {formData.evidenceFiles.length > 0 && (
                  <div className="mt-4 text-left space-y-2">
                    {formData.evidenceFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 p-2 rounded">
                        <FileText className="w-4 h-4" />
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="text-slate-400 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">Back</button>
                <button type="button" onClick={() => setStep(3)} className="w-2/3 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors">Proceed to Matter Activation</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Matter Activation</h2>
                  <p className="text-slate-600 mb-6">
                    A professional service fee of <strong>{displayFee}</strong> (5% of the total claim value) is required to commence forensic analysis. This fee facilitates the labor of technical memorialization and jurisdictional routing.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary-600" /> Professional Service Allocation
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                        <div>
                          <div className="font-bold text-slate-900">Forensic Fund Tracing</div>
                          <div className="text-sm text-slate-500">Utilization of specialized software for transaction trail auditing.</div>
                        </div>
                        <div className="font-semibold text-slate-900">{formatMoney(feeTracking)}</div>
                      </div>
                      <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                        <div>
                          <div className="font-bold text-slate-900">Legal Case Structuring</div>
                          <div className="text-sm text-slate-500">Memorialization of facts into a formal legal instrument.</div>
                        </div>
                        <div className="font-semibold text-slate-900">{formatMoney(feeLegal)}</div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">Regulatory Filing Fees</div>
                          <div className="text-sm text-slate-500">Consolidated fees for international regulatory submissions.</div>
                        </div>
                        <div className="font-semibold text-slate-900">{formatMoney(feeGov)}</div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-lg">Total Retainer Fee</span>
                      <span className="font-bold text-slate-900 text-2xl">{displayFee}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
                  <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                    <span className="font-bold flex items-center gap-2"><Lock className="w-4 h-4" /> Secured Settlement Portal</span>
                    <span className="text-xs bg-primary-500 text-slate-900 px-2 py-1 rounded">ENCRYPTED</span>
                  </div>
                  <div className="p-6 flex-grow">
                    {!selectedMethod ? (
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(PAYMENT_PLATFORMS).map(([key, platform]) => {
                          const Icon = platform.icon;
                          return (
                            <button 
                              key={key}
                              type="button" 
                              onClick={() => handleMethodSelect(key as keyof typeof PAYMENT_PLATFORMS)}
                              className={`p-4 border border-slate-200 rounded-xl hover:border-primary-500 transition-all text-left group ${platform.bgColor}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-white ${platform.color}`}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{platform.name}</div>
                                  <div className="text-xs text-slate-500 mt-1">Secure {key === 'CRYPTO' ? 'blockchain' : 'bank-grade'} transfer</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        <button type="button" onClick={() => setSelectedMethod(null)} className="text-sm text-slate-500 mb-4 flex items-center gap-1 hover:text-slate-900 transition-colors">
                          &larr; Return to Settlement Channels
                        </button>
                        {isLoadingDetails ? (
                          <div className="flex-grow flex flex-col items-center justify-center min-h-[300px]">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                            <p className="text-slate-600 font-medium">Retrieving Secure Settlement Particulars...</p>
                          </div>
                        ) : (
                          <div className="animate-fade-in flex-grow">
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`p-2 rounded-lg ${PAYMENT_PLATFORMS[selectedMethod].bgColor} ${PAYMENT_PLATFORMS[selectedMethod].color}`}>
                                {React.createElement(PAYMENT_PLATFORMS[selectedMethod].icon, { className: "w-6 h-6" })}
                              </div>
                              <h3 className="text-xl font-bold text-slate-900">{PAYMENT_PLATFORMS[selectedMethod].name} Particulars</h3>
                            </div>
                            
                            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6 space-y-4">
                              {selectedMethod === 'WIRE' && (
                                <div className="space-y-3">
                                  <div className="bg-white p-3 rounded border border-slate-200">
                                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Beneficiary Information</div>
                                    <div className="font-mono text-sm text-slate-900 font-medium select-all">{PAYMENT_PLATFORMS.WIRE.details.beneficiary}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded border border-slate-200">
                                      <div className="text-xs text-slate-500 mb-1">Account Number</div>
                                      <div className="font-mono text-sm text-slate-900 font-medium select-all">{PAYMENT_PLATFORMS.WIRE.details.accountNumber}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-slate-200">
                                      <div className="text-xs text-slate-500 mb-1">Routing Number</div>
                                      <div className="font-mono text-sm text-slate-900 font-medium select-all">{PAYMENT_PLATFORMS.WIRE.details.routingNumber}</div>
                                    </div>
                                  </div>
                                  <div className="bg-white p-3 rounded border border-slate-200">
                                    <div className="text-xs text-slate-500 mb-1">SWIFT/BIC Code</div>
                                    <div className="font-mono text-sm text-slate-900 font-medium select-all flex items-center justify-between">
                                      {PAYMENT_PLATFORMS.WIRE.details.swiftCode}
                                      <button type="button" onClick={() => handleCopy(PAYMENT_PLATFORMS.WIRE.details.swiftCode)} className="text-xs bg-slate-100 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-200 transition-colors">
                                        <Copy className="w-3 h-3" /> Copy
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-xs text-slate-500 p-2 bg-blue-50 rounded border border-blue-100">
                                    <strong>Reference:</strong> {PAYMENT_PLATFORMS.WIRE.details.reference}
                                  </div>
                                </div>
                              )}

                              {selectedMethod === 'CRYPTO' && (
                                <div>
                                  <div className="mb-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Cryptographic Asset</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(PAYMENT_PLATFORMS.CRYPTO.assets).map(([key, asset]) => (
                                        <button
                                          key={key}
                                          type="button"
                                          onClick={() => setSelectedCrypto(key as keyof typeof PAYMENT_PLATFORMS.CRYPTO.assets)}
                                          className={`p-3 rounded-lg border ${selectedCrypto === key ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'} transition-colors`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="text-left">
                                              <div className="font-bold text-slate-900">{asset.symbol} {key}</div>
                                              <div className="text-xs text-slate-500 truncate">{asset.name}</div>
                                            </div>
                                            {selectedCrypto === key && <Check className="w-4 h-4 text-primary-600" />}
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                                    <div className="flex flex-col md:flex-row gap-6">
                                      {qrCodeUrl && (
                                        <div className="md:w-1/3">
                                          <div className="text-xs text-slate-500 mb-2 text-center">Scan QR Code</div>
                                          <img 
                                            src={qrCodeUrl} 
                                            alt="Payment QR Code" 
                                            className="w-full max-w-[160px] mx-auto border border-slate-200 rounded-lg"
                                          />
                                          <div className="text-xs text-slate-500 text-center mt-2">{PAYMENT_PLATFORMS.CRYPTO.assets[selectedCrypto].network}</div>
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="text-xs text-slate-500 mb-2">Consign {selectedCrypto} assets to:</div>
                                        <div className="font-mono text-sm break-all text-slate-900 font-bold mb-3 select-all bg-slate-100 p-3 rounded">
                                          {PAYMENT_PLATFORMS.CRYPTO.assets[selectedCrypto].address}
                                        </div>
                                        {PAYMENT_PLATFORMS.CRYPTO.assets[selectedCrypto].memo && (
                                          <div className="mb-3">
                                            <div className="text-xs text-slate-500 mb-1">Memo/Note (Required):</div>
                                            <div className="font-mono text-sm text-slate-900 font-bold select-all bg-amber-50 p-2 rounded border border-amber-200">
                                              {PAYMENT_PLATFORMS.CRYPTO.assets[selectedCrypto].memo}
                                            </div>
                                          </div>
                                        )}
                                        <div className="flex gap-2">
                                          <button type="button" onClick={() => handleCopy(PAYMENT_PLATFORMS.CRYPTO.assets[selectedCrypto].address)} className="flex-1 bg-slate-900 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                                            <Copy className="w-4 h-4" /> Copy Address
                                          </button>
                                          <button type="button" onClick={() => handleCopy(PAYMENT_PLATFORMS.CRYPTO.assets[selectedCrypto].memo || '')} className="px-4 bg-amber-500 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors">
                                            <Copy className="w-4 h-4" /> Copy Memo
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {selectedMethod === 'PAYPAL' && (
                                <div className="text-center py-4">
                                  <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                                    <p className="text-slate-600 mb-3">Transfer settlement of <strong>{displayFee}</strong> via PayPal to:</p>
                                    <div className="text-xl font-bold text-slate-900 font-mono select-all mb-2 flex items-center justify-center gap-2">
                                      <Mail className="w-5 h-5 text-blue-400" />
                                      {PAYMENT_PLATFORMS.PAYPAL.details.email}
                                    </div>
                                    <div className="text-sm text-slate-500 space-y-1">
                                      <div>Business: {PAYMENT_PLATFORMS.PAYPAL.details.businessName}</div>
                                      <div className="uppercase tracking-wider bg-slate-100 inline-block px-2 py-1 rounded text-xs font-bold">Reference: {PAYMENT_PLATFORMS.PAYPAL.details.note}</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-slate-500 p-3 bg-blue-50 rounded border border-blue-100">
                                    <strong>Alternative:</strong> Send via PayPal.Me to <strong>{PAYMENT_PLATFORMS.PAYPAL.details.paypalMe}</strong>
                                  </div>
                                </div>
                              )}

                              {selectedMethod === 'CASHAPP' && (
                                <div className="text-center py-4">
                                  <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                                    <p className="text-slate-600 mb-3">Transfer settlement of <strong>{displayFee}</strong> via Cash App to:</p>
                                    <div className="text-2xl font-bold text-slate-900 font-mono select-all mb-2">
                                      {PAYMENT_PLATFORMS.CASHAPP.details.cashtag}
                                    </div>
                                    <div className="text-sm text-slate-500 space-y-1">
                                      <div>Recipient: {PAYMENT_PLATFORMS.CASHAPP.details.recipient}</div>
                                      <div className="uppercase tracking-wider bg-slate-100 inline-block px-2 py-1 rounded text-xs font-bold">Note: {PAYMENT_PLATFORMS.CASHAPP.details.note}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {selectedMethod === 'ZELLE' && (
                                <div className="text-center py-4">
                                  <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                                    <p className="text-slate-600 mb-3">Transfer settlement of <strong>{displayFee}</strong> via Zelle to:</p>
                                    <div className="space-y-3">
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Email Address</div>
                                        <div className="text-lg font-bold text-slate-900 font-mono select-all flex items-center justify-center gap-2">
                                          <Mail className="w-5 h-5 text-purple-500" />
                                          {PAYMENT_PLATFORMS.ZELLE.details.email}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Mobile Number</div>
                                        <div className="text-lg font-bold text-slate-900 font-mono select-all flex items-center justify-center gap-2">
                                          <PhoneIcon className="w-5 h-5 text-purple-500" />
                                          {PAYMENT_PLATFORMS.ZELLE.details.phone}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-sm text-slate-500 mt-4">
                                      <div>Registered Name: {PAYMENT_PLATFORMS.ZELLE.details.name}</div>
                                      <div className="uppercase tracking-wider bg-slate-100 inline-block px-2 py-1 rounded text-xs font-bold mt-2">Memo: {PAYMENT_PLATFORMS.ZELLE.details.note}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {selectedMethod === 'VENMO' && (
                                <div className="text-center py-4">
                                  <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                                    <p className="text-slate-600 mb-3">Transfer settlement of <strong>{displayFee}</strong> via Venmo to:</p>
                                    <div className="text-2xl font-bold text-slate-900 font-mono select-all mb-2">
                                      {PAYMENT_PLATFORMS.VENMO.details.username}
                                    </div>
                                    <div className="text-sm text-slate-500 space-y-1">
                                      <div className="flex items-center justify-center gap-2">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        Verified Business Profile
                                      </div>
                                      <div className="uppercase tracking-wider bg-slate-100 inline-block px-2 py-1 rounded text-xs font-bold">Note: {PAYMENT_PLATFORMS.VENMO.details.note}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="border-t border-slate-200 pt-6">
                              <label className="block text-sm font-bold text-slate-900 mb-2">Settlement Verification Certificate</label>
                              <input type="file" ref={paymentProofInputRef} className="hidden" onChange={handlePaymentProofChange} accept=".jpg,.jpeg,.png,.pdf,.heic" />
                              <div onClick={() => paymentProofInputRef.current?.click()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${paymentProofFile ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-primary-500'}`}>
                                {paymentProofFile ? (
                                  <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                                    <CheckCircle className="w-5 h-5" />
                                    <div className="text-left">
                                      <div className="font-medium">{paymentProofFile.name}</div>
                                      <div className="text-xs text-green-600">{(paymentProofFile.size / 1024).toFixed(1)} KB • Ready for verification</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-slate-500">
                                    <UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                    <span className="text-sm">Attach Instrument of Remittance (Screenshot/Receipt)</span>
                                    <div className="text-xs text-slate-400 mt-1">JPG, PNG, PDF, or HEIC files accepted</div>
                                  </div>
                                )}
                              </div>
                              <button 
                                type="button" 
                                onClick={() => setStep(4)} 
                                disabled={!paymentProofFile}
                                className={`w-full mt-6 py-4 rounded-lg font-bold shadow-lg transition-all flex justify-center items-center ${paymentProofFile ? 'bg-primary-500 text-slate-900 hover:bg-primary-400 hover:shadow-xl' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                              >
                                {paymentProofFile ? '✓ Confirm Settlement Verification' : 'Attach Proof to Continue'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900">Final Affirmation & Service Delivery</h2>
              <p className="text-slate-600">Designate the electronic mail address for the formal delivery of the Forensic Case Dossier.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Designated Counsel/Client Email Address</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="counsel@entity.com" className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))} className="mt-1 w-4 h-4 text-primary-600 rounded" required />
                <label className="text-sm text-slate-600 leading-relaxed">I hereby provide formal authorization for Sentinel Forensic Advocacy to process the information submitted. I acknowledge that the professional service retainer is for the technical preparation of my evidentiary dossier and is non-refundable upon commencement of forensic labor.</label>
              </div>
              <button type="submit" disabled={!formData.agreedToTerms || isSubmitting} className={`w-full bg-slate-900 text-white py-4 rounded-lg font-bold transition-all shadow-md flex justify-center items-center text-lg ${(!formData.agreedToTerms || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:shadow-lg'}`}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Formalizing Case Dossier...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-6 h-6" />
                    Authorize Commencement of Analysis
                  </span>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};