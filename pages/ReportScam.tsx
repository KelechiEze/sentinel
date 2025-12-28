// pages/ReportScam.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScamType, ReportFormData } from '../types';
import { AlertTriangle, Lock, UploadCloud, CheckCircle, Shield, Info, FileText, Copy, Check, Loader2, FileCheck, Mail, X, Bitcoin, Image as ImageIcon } from 'lucide-react';

// Crypto configuration with real-world symbols and details
const CRYPTO_ASSETS = {
  BTC: {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: '₿',
    address: 'bc1qd2wec90rdvv7jgssl9uz859vrflqaprnvppetg',
    network: 'Bitcoin Mainnet',
    qrValue: 'bitcoin:bc1qd2wec90rdvv7jgssl9uz859vrflqaprnvppetg'
  },
  ETH: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    logo: 'Ξ',
    address: '0x55db224bC13918664b57aC1B4d46fDA48E03818f',
    network: 'Ethereum ERC-20',
    qrValue: 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  },
  USDT: {
    id: 'tether',
    name: 'Tether',
    symbol: 'USDT',
    logo: '₮',
    address: 'TJ8vc98k3j0kfj983kfkj983kfj983kfj983',
    network: 'TRON TRC-20',
    memo: '8829-X'
  },
  BNB: {
    id: 'binancecoin',
    name: 'Binance Coin',
    symbol: 'BNB',
    logo: '⎈',
    address: 'bnb136ns6lfw4zs5hg4n85vdthu3n0v0v35',
    network: 'Binance Chain BEP-2',
    memo: '8829X'
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

// Type for crypto logo data from API
interface CryptoLogoData {
  [key: string]: {
    id: string;
    symbol: string;
    name: string;
    image: string;
  };
}

// Type for file with preview
interface FileWithPreview extends File {
  preview?: string;
}

export const ReportScam: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [cryptoLogos, setCryptoLogos] = useState<CryptoLogoData>({});
  const [loadingLogos, setLoadingLogos] = useState(true);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  
  // Add states for custom scam type
  const [showCustomScamInput, setShowCustomScamInput] = useState(false);
  const [customScamType, setCustomScamType] = useState("");

  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const paymentProofInputRef = useRef<HTMLInputElement>(null);

  const [selectedCrypto, setSelectedCrypto] = useState<keyof typeof CRYPTO_ASSETS>("BTC");
  const [paymentProofFile, setPaymentProofFile] = useState<FileWithPreview | null>(null);

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

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup evidence file previews
      formData.evidenceFiles.forEach((file: FileWithPreview) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      
      // Cleanup payment proof preview
      if (paymentProofPreview) {
        URL.revokeObjectURL(paymentProofPreview);
      }
    };
  }, [formData.evidenceFiles, paymentProofPreview]);

  // Fetch crypto logos from CoinGecko API
  useEffect(() => {
    const fetchCryptoLogos = async () => {
      try {
        const cryptoIds = Object.values(CRYPTO_ASSETS).map(asset => asset.id).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
        );
        
        if (response.ok) {
          const data = await response.json();
          const logoData: CryptoLogoData = {};
          data.forEach((crypto: any) => {
            logoData[crypto.symbol.toUpperCase()] = {
              id: crypto.id,
              symbol: crypto.symbol,
              name: crypto.name,
              image: crypto.image
            };
          });
          setCryptoLogos(logoData);
        }
      } catch (error) {
        console.error('Error fetching crypto logos:', error);
      } finally {
        setLoadingLogos(false);
      }
    };

    fetchCryptoLogos();
  }, []);

  // Calculate fees using useMemo to prevent recalculations
  const amountLostNum = useMemo(() => parseFloat(formData.amountLost) || 0, [formData.amountLost]);
  const totalFee = useMemo(() => amountLostNum * 0.05, [amountLostNum]);
  const feeTracking = useMemo(() => totalFee * 0.48, [totalFee]);
  const feeLegal = useMemo(() => totalFee * 0.32, [totalFee]);
  const feeGov = useMemo(() => totalFee * 0.20, [totalFee]);

  // Generate QR code for cryptocurrency payments - DISABLED
  useEffect(() => {
    if (CRYPTO_ASSETS[selectedCrypto]?.qrValue) {
      const cryptoAsset = CRYPTO_ASSETS[selectedCrypto];
      const qrData = cryptoAsset.qrValue;
      // QR code generation disabled as requested
      // setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
    }
  }, [selectedCrypto]);

  const formatMoney = (val: number) => {
    const currencySymbol = CURRENCY_SYMBOLS[formData.currency as keyof typeof CURRENCY_SYMBOLS] || formData.currency;
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const displayFee = formatMoney(totalFee);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'scamType') {
      if (value === 'custom') {
        setShowCustomScamInput(true);
        // Keep the previous value if there was one
        if (customScamType) {
          setFormData(prev => ({ ...prev, scamType: customScamType }));
        } else {
          setFormData(prev => ({ ...prev, scamType: '' }));
        }
      } else {
        setShowCustomScamInput(false);
        setCustomScamType('');
        setFormData(prev => ({ ...prev, scamType: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle custom scam type input change
  const handleCustomScamTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomScamType(value);
    setFormData(prev => ({ ...prev, scamType: value }));
  };

  const handleEvidenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => {
        const fileWithPreview = file as FileWithPreview;
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        return fileWithPreview;
      });
      
      setFormData(prev => ({
        ...prev,
        evidenceFiles: [...prev.evidenceFiles, ...newFiles]
      }));
    }
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0] as FileWithPreview;
      
      // Cleanup previous preview
      if (paymentProofPreview) {
        URL.revokeObjectURL(paymentProofPreview);
      }
      
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setPaymentProofPreview(previewUrl);
        file.preview = previewUrl;
      }
      
      setPaymentProofFile(file);
      // Show processing modal and disable button
      setIsPaymentProcessing(true);
      setShowProcessingModal(true);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCloseProcessingModal = () => {
    setShowProcessingModal(false);
    // Button remains disabled until manually enabled
  };

  // Function to manually enable the button (for admin use)
  const enablePaymentButton = () => {
    setIsPaymentProcessing(false);
    console.log('Payment button enabled manually');
  };

  // Expose the enable function globally for admin use
  useEffect(() => {
    // @ts-ignore
    window.enablePaymentButton = enablePaymentButton;
    return () => {
      // @ts-ignore
      delete window.enablePaymentButton;
    };
  }, []);

  const generateEmailContent = () => {
    const subject = `Scam Report - Case ${Date.now().toString().slice(-6)}`;
    const body = `
SCAM REPORT SUBMISSION

Case Details:
----------------
Case ID: ${Date.now().toString().slice(-6)}
Submission Date: ${new Date().toLocaleString()}

Your Information:
----------------
Type of Scam: ${formData.scamType}
Amount Lost: ${formatMoney(amountLostNum)}
Currency: ${formData.currency}
Date it Happened: ${formData.dateOccurred}

What Happened:
${formData.description}

Scammer Information:
${formData.scammerDetails || 'Not provided'}

Your Contact Information:
----------------
Email: ${formData.contactEmail}

Payment Information:
----------------
Selected Cryptocurrency: ${CRYPTO_ASSETS[selectedCrypto].name} (${selectedCrypto})
Payment Address: ${CRYPTO_ASSETS[selectedCrypto].address}
${CRYPTO_ASSETS[selectedCrypto].memo ? `Memo/Note: ${CRYPTO_ASSETS[selectedCrypto].memo}` : ''}
Network: ${CRYPTO_ASSETS[selectedCrypto].network}

Service Fee: ${displayFee} (5% of reported loss)

Files Attached: ${formData.evidenceFiles.length} file(s)
Payment Proof: ${paymentProofFile ? paymentProofFile.name : 'Not attached'}

Agreed to Terms: ${formData.agreedToTerms ? 'Yes' : 'No'}

---
This report was created through Sentinel Forensic Advocacy.
All information is kept safe and private.
    `;

    return { subject, body };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Generate email content
      const { subject, body } = generateEmailContent();
      
      // Create mailto link with form data
      const mailtoLink = `mailto:sentinelhonestscamreport@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open Gmail specifically
      const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=sentinelhonestscamreport@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Try to open Gmail first, fall back to mailto
      window.open(gmailLink, '_blank') || window.open(mailtoLink, '_blank');
      
      // Set success state
      setIsSuccess(true);
      setShowEmailModal(true);
      
    } catch (error) {
      setSubmissionError('Failed to prepare email. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    // Cleanup preview URLs
    formData.evidenceFiles.forEach((file: FileWithPreview) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview);
    }
    
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
    setSelectedCrypto("BTC");
    setPaymentProofFile(null);
    setPaymentProofPreview(null);
    setSubmissionError(null);
    setShowEmailModal(false);
    setCopiedEmail(false);
    // Reset the new states
    setShowProcessingModal(false);
    setIsPaymentProcessing(false);
    setShowCustomScamInput(false);
    setCustomScamType("");
  };

  const handleCopyEmail = () => {
    const email = 'sentinelhonestscamreport@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      setCopiedEmail(true);
      setTimeout(() => {
        setCopiedEmail(false);
      }, 2000);
    });
  };

  // Helper function to check if file is an image
  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  // Helper function to check if file is a PDF
  const isPDFFile = (file: File) => {
    return file.type === 'application/pdf';
  };

  if (isSuccess) {
    const lastCaseId = Date.now().toString().slice(-6);
    const lastTime = new Date().toISOString();
    
    return (
      <div className="pt-32 pb-24 min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200 max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Report Ready to Send</h1>
            <p className="text-slate-600 text-lg">Your scam report has been prepared and is ready to send.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary-600" /> Your Report Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Case ID:</span>
                  <span className="font-mono font-bold text-slate-900 text-lg">{lastCaseId}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Time Submitted:</span>
                  <span className="font-medium">{new Date(lastTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Your Email:</span>
                  <span className="font-medium text-primary-600">{formData.contactEmail}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-600">Type of Scam:</span>
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
                <Shield className="w-5 h-5 text-primary-600" /> What Happens Next
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                  <div>
                    <p className="font-medium text-slate-900">Open Gmail</p>
                    <p className="text-sm text-slate-600">Gmail will open with your report ready to send.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                  <div>
                    <p className="font-medium text-slate-900">Send the Email</p>
                    <p className="text-sm text-slate-600">Click "Send" in Gmail to submit your report.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                  <div>
                    <p className="font-medium text-slate-900">We Review Your Case</p>
                    <p className="text-sm text-slate-600">Our team will look at your report within 24 hours.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-primary-200">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Ready to Send:</strong> All your information has been added to Gmail.</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-8">
            <h3 className="font-semibold text-slate-900 mb-3">Gmail Instructions</h3>
            <p className="text-slate-600 mb-4">
              Gmail should have opened with your report. If it didn't open, please send your report to:
            </p>
            <div className="font-mono text-lg font-bold text-primary-600 bg-white p-3 rounded border border-slate-200 text-center">
              sentinelhonestscamreport@gmail.com
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-4">
              <Info className="w-4 h-4" />
              <span>Please include your Case ID: <span className="font-mono font-bold">{lastCaseId}</span> in your email.</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')} 
              className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex-1 sm:flex-none"
            >
              Go Back Home
            </button>
            <button 
              onClick={handleResetForm}
              className="bg-white border-2 border-primary-500 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex-1 sm:flex-none"
            >
              Report Another Scam
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Report a Cryptocurrency Scam</h1>
          <p className="text-slate-600">Step {step} of 4</p>
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
              <strong>Important:</strong> We will never ask for your private keys, passwords, or secret phrases. Anyone asking for these is trying to scam you.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative">
          
          {submissionError && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Something Went Wrong</p>
                  <p className="text-red-600 text-sm mt-1">{submissionError}</p>
                  <button 
                    type="button" 
                    onClick={() => setSubmissionError(null)} 
                    className="text-red-600 hover:text-red-800 text-sm mt-2 font-medium"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900">Tell Us About the Scam</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type of Scam</label>
                <div className="space-y-3">
                  <select 
                    name="scamType" 
                    value={showCustomScamInput ? 'custom' : formData.scamType} 
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    required
                  >
                    <option value="">Choose the type of scam...</option>
                    {Object.values(ScamType).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    <option value="custom">Other (Please specify)</option>
                  </select>
                  
                  {showCustomScamInput && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Please describe the type of scam:</label>
                      <input 
                        type="text"
                        value={customScamType}
                        onChange={handleCustomScamTypeChange}
                        placeholder="e.g., Fake investment platform, Romance scam, Fake exchange, Phishing website, etc."
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-400"
                        required={showCustomScamInput}
                      />
                      <p className="text-xs text-slate-500 mt-1">Please be specific about how you were scammed</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">How Much Did You Lose?</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                  <select 
                    name="currency" 
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none"
                  >
                    <option value="USD">US Dollars ($)</option>
                    <option value="EUR">Euros (€)</option>
                    <option value="GBP">British Pounds (£)</option>
                    <option value="BTC">Bitcoin (₿)</option>
                    <option value="ETH">Ethereum (Ξ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">When Did This Happen?</label>
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
                onClick={() => {
                  // Validate custom scam type if selected
                  if (showCustomScamInput && !customScamType.trim()) {
                    setSubmissionError("Please describe the type of scam");
                    return;
                  }
                  // Validate regular scam type if not custom
                  if (!showCustomScamInput && !formData.scamType) {
                    setSubmissionError("Please select or describe the type of scam");
                    return;
                  }
                  setStep(2);
                }}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors mt-4"
              >
                Next: Tell Us More Details
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900">More Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tell Us What Happened</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Please tell us the whole story. How did they contact you? What did they say? How did you send the money?..."
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-400"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Scammer's Information (if you have it)</label>
                <input 
                  type="text" 
                  name="scammerDetails"
                  value={formData.scammerDetails}
                  onChange={handleChange}
                  placeholder="Scammer's email, phone number, website, username..."
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-400"
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">Add Photos or Documents (Optional)</p>
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
                  Choose Files
                </button>
                {formData.evidenceFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Files Added:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.evidenceFiles.map((file: FileWithPreview, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          {isImageFile(file) && file.preview ? (
                            <div>
                              <div className="relative h-40 bg-slate-100">
                                <img 
                                  src={file.preview} 
                                  alt={file.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-900 truncate">{file.name}</span>
                                  </div>
                                  <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  {isPDFFile(file) ? (
                                    <FileText className="w-5 h-5 text-blue-600" />
                                  ) : (
                                    <FileText className="w-5 h-5 text-slate-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-slate-900 truncate">{file.name}</div>
                                  <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">Go Back</button>
                <button type="button" onClick={() => setStep(3)} className="w-2/3 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors">Next: Payment Information</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Fee Required</h2>
                  <p className="text-slate-600 mb-6">
                    To start working on your case, we need a service fee of <strong>{displayFee}</strong> (5% of what you lost). This fee helps us track your money and build your case.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary-600" /> What Your Fee Covers
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                        <div>
                          <div className="font-bold text-slate-900">Tracking Your Money</div>
                          <div className="text-sm text-slate-500">Using special tools to follow where your money went.</div>
                        </div>
                        <div className="font-semibold text-slate-900">{formatMoney(feeTracking)}</div>
                      </div>
                      <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                        <div>
                          <div className="font-bold text-slate-900">Building Your Case</div>
                          <div className="text-sm text-slate-500">Putting all the information together for you.</div>
                        </div>
                        <div className="font-semibold text-slate-900">{formatMoney(feeLegal)}</div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">Government Fees</div>
                          <div className="text-sm text-slate-500">Fees for reporting to the right places.</div>
                        </div>
                        <div className="font-semibold text-slate-900">{formatMoney(feeGov)}</div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-lg">Total Fee to Pay</span>
                      <span className="font-bold text-slate-900 text-2xl">{displayFee}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
                  <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                    <span className="font-bold flex items-center gap-2"><Bitcoin className="w-4 h-4" /> Send Cryptocurrency Payment</span>
                    <span className="text-xs bg-primary-500 text-slate-900 px-2 py-1 rounded">SECURE</span>
                  </div>
                  <div className="p-6 flex-grow">
                    <div className="h-full flex flex-col">
                      <div className="animate-fade-in flex-grow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                            <Bitcoin className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">Choose Your Cryptocurrency</h3>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Available Options</label>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(CRYPTO_ASSETS).map(([key, asset]) => {
                              const logoData = cryptoLogos[key];
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setSelectedCrypto(key as keyof typeof CRYPTO_ASSETS)}
                                  className={`p-4 rounded-xl border ${selectedCrypto === key ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'} transition-colors flex items-center justify-between`}
                                >
                                  <div className="flex items-center gap-3">
                                    {loadingLogos ? (
                                      <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
                                    ) : logoData?.image ? (
                                      <img 
                                        src={logoData.image} 
                                        alt={asset.name}
                                        className="w-8 h-8 rounded-full"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 ${logoData?.image ? 'hidden' : ''}`}>
                                      <span className="text-lg font-bold">{asset.logo}</span>
                                    </div>
                                    <div className="text-left">
                                      <div className="font-bold text-slate-900">{asset.symbol}</div>
                                      <div className="text-xs text-slate-500 truncate">{asset.name}</div>
                                    </div>
                                  </div>
                                  {selectedCrypto === key && <Check className="w-5 h-5 text-primary-600" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6 space-y-4">
                          <div>
                            <div className="mb-4">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Send {CRYPTO_ASSETS[selectedCrypto].name} Here</label>
                              <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                  <div className="text-xs text-slate-500 mb-2">Send to this address:</div>
                                  <div className="font-mono text-sm break-all text-slate-900 font-bold mb-3 select-all bg-slate-100 p-3 rounded">
                                    {CRYPTO_ASSETS[selectedCrypto].address}
                                  </div>
                                  {CRYPTO_ASSETS[selectedCrypto].memo && (
                                    <div className="mb-3">
                                      <div className="text-xs text-slate-500 mb-1">Memo/Note (Important!):</div>
                                      <div className="font-mono text-sm text-slate-900 font-bold select-all bg-amber-50 p-2 rounded border border-amber-200">
                                        {CRYPTO_ASSETS[selectedCrypto].memo}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => handleCopy(CRYPTO_ASSETS[selectedCrypto].address)} className="flex-1 bg-slate-900 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                                      <Copy className="w-4 h-4" /> Copy Address
                                    </button>
                                    <button type="button" onClick={() => handleCopy(CRYPTO_ASSETS[selectedCrypto].memo || '')} className="px-4 bg-amber-500 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors">
                                      <Copy className="w-4 h-4" /> Copy Memo
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t border-slate-200 pt-6">
                              <label className="block text-sm font-bold text-slate-900 mb-2">Proof of Payment (Required)</label>
                              <input type="file" ref={paymentProofInputRef} className="hidden" onChange={handlePaymentProofChange} accept=".jpg,.jpeg,.png,.pdf,.heic" />
                              <div onClick={() => paymentProofInputRef.current?.click()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${paymentProofFile ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-primary-500'}`}>
                                {paymentProofFile ? (
                                  <div className="space-y-3">
                                    {paymentProofPreview ? (
                                      <div>
                                        <div className="text-sm text-slate-500 mb-2">Payment Screenshot:</div>
                                        <div className="relative h-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                          <img 
                                            src={paymentProofPreview} 
                                            alt="Payment proof"
                                            className="w-full h-full object-contain"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                                        <CheckCircle className="w-5 h-5" />
                                        <div className="text-left">
                                          <div className="font-medium">{paymentProofFile.name}</div>
                                          <div className="text-xs text-green-600">{(paymentProofFile.size / 1024).toFixed(1)} KB • Ready for verification</div>
                                        </div>
                                      </div>
                                    )}
                                    <button 
                                      type="button"
                                      onClick={() => paymentProofInputRef.current?.click()}
                                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                      Change File
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-slate-500">
                                    <UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                    <span className="text-sm">Add Screenshot or Receipt</span>
                                    <div className="text-xs text-slate-400 mt-1">JPG, PNG, PDF, or HEIC files accepted</div>
                                  </div>
                                )}
                              </div>
                              <button 
                                type="button" 
                                onClick={() => setStep(4)} 
                                disabled={!paymentProofFile || isPaymentProcessing}
                                className={`w-full mt-6 py-4 rounded-lg font-bold shadow-lg transition-all flex justify-center items-center ${
                                  (!paymentProofFile || isPaymentProcessing) 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                    : 'bg-primary-500 text-slate-900 hover:bg-primary-400 hover:shadow-xl'
                                }`}
                              >
                                {isPaymentProcessing ? (
                                  <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Checking Your Payment...
                                  </span>
                                ) : paymentProofFile ? (
                                  '✓ Next Step: Finish Your Report'
                                ) : (
                                  'Add Proof to Continue'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900">Finish and Send Your Report</h2>
              <p className="text-slate-600">We'll prepare everything for you to send via Gmail. Just review and click send.</p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Email Address</label>
                <input 
                  type="email" 
                  name="contactEmail" 
                  value={formData.contactEmail} 
                  onChange={handleChange} 
                  placeholder="your.email@gmail.com" 
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                  required 
                />
                <p className="text-sm text-slate-500 mt-1">This is where we'll contact you about your case</p>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <input 
                  type="checkbox" 
                  name="agreedToTerms" 
                  checked={formData.agreedToTerms} 
                  onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))} 
                  className="mt-1 w-4 h-4 text-primary-600 rounded" 
                  required 
                />
                <label className="text-sm text-slate-600 leading-relaxed">
                  I agree to let Sentinel Forensic Advocacy use my information to help with my case. I understand that clicking "Submit Report" will open Gmail with all my information, and I need to send that email to finish.
                </label>
              </div>
              
              <button 
                type="submit" 
                disabled={!formData.agreedToTerms || isSubmitting} 
                className={`w-full bg-slate-900 text-white py-4 rounded-lg font-bold transition-all shadow-md flex justify-center items-center text-lg ${(!formData.agreedToTerms || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:shadow-lg'}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Getting Gmail Ready...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="w-6 h-6" />
                    Open Gmail to Send Report
                  </span>
                )}
              </button>
              
              <div className="text-center text-sm text-slate-500 mt-4">
                <p>After clicking submit, Gmail will open with your report.</p>
                <p>Just click "Send" to finish.</p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Payment Processing Modal */}
      {showProcessingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Checking Your Payment</h3>
                    <p className="text-sm text-slate-500 mt-1">We're looking at your payment now</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseProcessingModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Checking the Transaction</p>
                    <p className="text-sm text-slate-600">Making sure your payment went through correctly.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Security Check</p>
                    <p className="text-sm text-slate-600">Following all safety rules and regulations.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Getting Ready to Help</p>
                    <p className="text-sm text-slate-600">Setting up everything to start working on your case.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">What Happens Next</p>
                      <p>Our team will check your payment in 1-2 days. We'll email you when it's approved so you can finish your report.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleCloseProcessingModal}
                className="w-full mt-6 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Got It - Close This Window
              </button>
              
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Your payment information is safe with us.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};