import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScamType, ReportFormData } from '../types';
import { AlertTriangle, Lock, UploadCloud, CheckCircle, Shield, Info, FileText, Globe, Search, Banknote, CreditCard, Bitcoin, Smartphone, Landmark, Copy, Check, ChevronDown, Loader2 } from 'lucide-react';

export const ReportScam: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // File Upload Refs
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const paymentProofInputRef = useRef<HTMLInputElement>(null);

  // Payment State
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
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

  // Dynamic Fee Calculation
  const amountLostNum = parseFloat(formData.amountLost) || 0;
  const totalFee = amountLostNum * 0.05;
  
  // Fee Breakdown (approximate ratios: 48% tracking, 32% legal, 20% filing)
  const feeTracking = totalFee * 0.48;
  const feeLegal = totalFee * 0.32;
  const feeGov = totalFee * 0.20;

  const formatMoney = (val: number) => {
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const displayFee = `${formData.currency} ${formatMoney(totalFee)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Evidence File Handler
  const handleEvidenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        evidenceFiles: [...prev.evidenceFiles, ...Array.from(e.target.files || [])]
      }));
    }
  };

  // Payment Proof Handler
  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProofFile(e.target.files[0]);
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setIsLoadingDetails(true);
    setPaymentProofFile(null); // Reset proof if method changes
    // Simulate loading details
    setTimeout(() => {
      setIsLoadingDetails(false);
    }, 1500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate Final Submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  // Crypto Data
  const cryptoWallets: Record<string, string> = {
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    USDT: "TJ8vc98k3j0kfj983kfkj983kfj983kfj983 (TRC20)",
    BNB: "bnb136ns6lfw4zs5hg4n85vdthu3n0v0v35",
    SOL: "DnF6y5...9kL3 (Solana)",
    XRP: "rMNz...8s3k Tag: 102938",
    USDC: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F (ERC20)",
    ADA: "addr1...9s8d",
    AVAX: "X-avax...9s8d",
    DOGE: "D8s7...9s8d"
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200 max-w-2xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Case #8829-X Activated</h2>
          <p className="text-slate-600 text-lg mb-8">
            We have verified your payment and documentation. The forensic investigation has officially begun. You will receive the first legal draft at <strong>{formData.contactEmail}</strong> within 48 hours.
          </p>
          <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Secure Incident Report</h1>
          <p className="text-slate-600">Step {step} of 4</p>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-4">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* TRUST WARNING */}
        {step < 3 && (
          <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg mb-8 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
            <div className="text-sm text-primary-900">
              <strong>Security Warning:</strong> We will NEVER ask for your wallet private keys, seed phrases, or banking passwords. If anyone asks for these, they are a scammer.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative">
          
          {/* STEP 1: DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900">Incident Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type of Scam</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount Lost</label>
                  <input 
                    type="number" 
                    name="amountLost"
                    value={formData.amountLost}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                  <select 
                    name="currency" 
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date Occurred</label>
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
                Next Step
              </button>
            </div>
          )}

          {/* STEP 2: EVIDENCE */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-900">Description & Evidence</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What happened? (Be specific)</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Explain how the contact started, what they promised, and how payment was made..."
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-400"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Scammer Details (Emails, Phones, Websites)</label>
                <input 
                  type="text" 
                  name="scammerDetails"
                  value={formData.scammerDetails}
                  onChange={handleChange}
                  placeholder="e.g. support@fake-crypto-site.com, +1-555-0192"
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-400"
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">Upload Screenshots or Receipts (Optional)</p>
                <p className="text-xs text-slate-400 mt-1">Images or PDFs up to 5MB</p>
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={evidenceInputRef}
                  className="hidden" 
                  multiple 
                  onChange={handleEvidenceFileChange}
                />
                
                <button 
                  type="button" 
                  onClick={() => evidenceInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-primary-600 font-bold hover:bg-slate-50 shadow-sm transition-colors"
                >
                  Choose Files
                </button>

                {/* Display Selected Files */}
                {formData.evidenceFiles.length > 0 && (
                  <div className="mt-4 text-left space-y-2">
                    {formData.evidenceFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 p-2 rounded">
                        <FileText className="w-4 h-4" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep(3)}
                  className="w-2/3 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  Proceed to Case Activation
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Left Column: SIMPLE ENGLISH Explanation */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Activate Your Case</h2>
                  <p className="text-slate-600 mb-6">
                    We charge a service fee of <strong>{displayFee}</strong> (5% of loss) to start working on your case. This is NOT a recovery fee. This pays for the work we do right now.
                  </p>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary-600" />
                      What am I paying for?
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                        <div className="flex gap-3">
                          <Search className="w-5 h-5 text-slate-400 mt-1" />
                          <div>
                            <div className="font-bold text-slate-900">Tracking the Money Trail</div>
                            <div className="text-sm text-slate-500">We use software to see exactly where your money went.</div>
                          </div>
                        </div>
                        <div className="font-semibold text-slate-900">{formData.currency} {formatMoney(feeTracking)}</div>
                      </div>

                      <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                        <div className="flex gap-3">
                          <FileText className="w-5 h-5 text-slate-400 mt-1" />
                          <div>
                            <div className="font-bold text-slate-900">Writing the Legal Report</div>
                            <div className="text-sm text-slate-500">We write the official document you need to show the police.</div>
                          </div>
                        </div>
                        <div className="font-semibold text-slate-900">{formData.currency} {formatMoney(feeLegal)}</div>
                      </div>

                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <Globe className="w-5 h-5 text-slate-400 mt-1" />
                          <div>
                            <div className="font-bold text-slate-900">Government Filing Fees</div>
                            <div className="text-sm text-slate-500">We pay the fees to file your report with international regulators.</div>
                          </div>
                        </div>
                        <div className="font-semibold text-slate-900">{formData.currency} {formatMoney(feeGov)}</div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-lg">Total One-Time Fee</span>
                      <span className="font-bold text-slate-900 text-2xl">{displayFee}</span>
                    </div>
                  </div>

                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 flex gap-3">
                    <Shield className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-primary-900 text-sm mb-1">Why do I have to pay upfront?</h4>
                      <p className="text-sm text-primary-800 leading-relaxed">
                        Honest companies charge for their time. Scammers ask for a "percentage" later. We have to pay our experts for the 40 hours of work it takes to track your money and write your legal papers. This fee guarantees the work gets done, no matter what happens.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment Selector */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
                  <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                    <span className="font-bold flex items-center gap-2"><Lock className="w-4 h-4" /> Secure Payment</span>
                    <span className="text-sm opacity-70">Step 1: Choose Method</span>
                  </div>

                  <div className="p-6 flex-grow">
                    {!selectedMethod ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => handleMethodSelect('Wire')} className="p-4 border border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group">
                          <Landmark className="w-8 h-8 text-slate-600 group-hover:text-primary-600 mb-2" />
                          <div className="font-bold text-slate-900">Bank Wire</div>
                          <div className="text-xs text-slate-500">Direct Transfer</div>
                        </button>
                        <button type="button" onClick={() => handleMethodSelect('Crypto')} className="p-4 border border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group">
                          <Bitcoin className="w-8 h-8 text-slate-600 group-hover:text-primary-600 mb-2" />
                          <div className="font-bold text-slate-900">Crypto</div>
                          <div className="text-xs text-slate-500">BTC, ETH, USDT...</div>
                        </button>
                        <button type="button" onClick={() => handleMethodSelect('PayPal')} className="p-4 border border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group">
                          <CreditCard className="w-8 h-8 text-slate-600 group-hover:text-primary-600 mb-2" />
                          <div className="font-bold text-slate-900">PayPal</div>
                          <div className="text-xs text-slate-500">Credit/Debit Card</div>
                        </button>
                        <button type="button" onClick={() => handleMethodSelect('CashApp')} className="p-4 border border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group">
                          <Smartphone className="w-8 h-8 text-slate-600 group-hover:text-primary-600 mb-2" />
                          <div className="font-bold text-slate-900">CashApp / Zelle</div>
                          <div className="text-xs text-slate-500">Mobile Transfer</div>
                        </button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        <button type="button" onClick={() => setSelectedMethod(null)} className="text-sm text-slate-500 hover:text-slate-900 mb-4 flex items-center gap-1">
                          &larr; Change Method
                        </button>

                        {isLoadingDetails ? (
                          <div className="flex-grow flex flex-col items-center justify-center min-h-[300px]">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                            <p className="text-slate-600 font-medium">Fetching Secure Payment Details...</p>
                          </div>
                        ) : (
                          <div className="animate-fade-in flex-grow">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">{selectedMethod} Details</h3>
                            
                            {/* PAYMENT DETAILS CONTENT */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 space-y-3">
                              
                              {selectedMethod === 'Wire' && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Bank Name:</span>
                                    <span className="font-mono text-slate-900 font-medium select-all">Sentinel Trust Int.</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Account Number:</span>
                                    <div className="flex gap-2">
                                      <span className="font-mono text-slate-900 font-medium select-all">9823482910</span>
                                      <Copy onClick={() => handleCopy("9823482910")} className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Routing / SWIFT:</span>
                                    <span className="font-mono text-slate-900 font-medium select-all">CITIUS33</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Ref Message:</span>
                                    <span className="font-mono text-slate-900 font-medium select-all">INV-8829-X</span>
                                  </div>
                                </>
                              )}

                              {selectedMethod === 'Crypto' && (
                                <>
                                  <div className="mb-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Currency</label>
                                    <div className="relative">
                                      <select 
                                        value={selectedCrypto}
                                        onChange={(e) => setSelectedCrypto(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 appearance-none font-bold"
                                      >
                                        {Object.keys(cryptoWallets).map(c => <option key={c} value={c}>{c}</option>)}
                                      </select>
                                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                  </div>
                                  <div className="bg-white p-3 rounded border border-slate-200">
                                    <div className="text-xs text-slate-500 mb-1">Send {selectedCrypto} to:</div>
                                    <div className="font-mono text-xs break-all text-slate-900 font-bold mb-2 select-all">
                                      {cryptoWallets[selectedCrypto]}
                                    </div>
                                    <button type="button" onClick={() => handleCopy(cryptoWallets[selectedCrypto])} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded flex items-center gap-1 w-fit">
                                      <Copy className="w-3 h-3" /> Copy Address
                                    </button>
                                  </div>
                                </>
                              )}

                              {(selectedMethod === 'PayPal' || selectedMethod === 'CashApp') && (
                                <div className="text-center py-4">
                                  <p className="text-slate-600 mb-2">Send <strong>{displayFee}</strong> to:</p>
                                  <div className="text-2xl font-bold text-slate-900 font-mono select-all mb-2">
                                    {selectedMethod === 'PayPal' ? 'pay@sentinel-report.org' : '$SentinelReport'}
                                  </div>
                                  <p className="text-xs text-slate-500">Include note: "Case 8829-X"</p>
                                </div>
                              )}

                            </div>

                            {/* PROOF UPLOAD */}
                            <div className="border-t border-slate-200 pt-6">
                              <label className="block text-sm font-bold text-slate-900 mb-2">
                                Upload Proof of Payment
                                <span className="text-red-500">*</span>
                              </label>
                              <p className="text-xs text-slate-500 mb-3">We cannot start until we verify the transaction.</p>
                              
                              <input 
                                type="file" 
                                ref={paymentProofInputRef}
                                className="hidden"
                                onChange={handlePaymentProofChange}
                              />
                              
                              <div 
                                onClick={() => paymentProofInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${paymentProofFile ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-primary-500 hover:bg-slate-50'}`}
                              >
                                {paymentProofFile ? (
                                  <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                                    <Check className="w-5 h-5" />
                                    {paymentProofFile.name}
                                  </div>
                                ) : (
                                  <div className="text-slate-500">
                                    <UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                    <span className="text-sm">Click to upload screenshot/receipt</span>
                                  </div>
                                )}
                              </div>

                              <button 
                                type="button" 
                                onClick={() => setStep(4)}
                                disabled={!paymentProofFile}
                                className={`w-full mt-6 py-4 rounded-lg font-bold shadow-lg transition-all flex justify-center items-center ${paymentProofFile ? 'bg-primary-500 text-slate-900 hover:bg-primary-400 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                              >
                                Confirm Payment
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-start">
                 <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="px-6 py-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                >
                  &larr; Back to Evidence
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FINAL CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-bold text-green-800">Payment Submitted for Verification</div>
                  <div className="text-xs text-green-700">The team will check your proof immediately.</div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900">Final Confirmation</h2>
              <p className="text-slate-600">
                To finalize the case activation, please confirm your contact email where the secure files should be delivered.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Email Address</label>
                <input 
                  type="email" 
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="you@email.com"
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">We will send the forensic report and regulatory guide to this email.</p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <input 
                  type="checkbox" 
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  required
                />
                <label className="text-sm text-slate-600">
                  I authorize Sentinel to process my data. I understand the {displayFee} fee is for the work of preparing my case file and is non-refundable once work begins.
                </label>
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  type="submit" 
                  disabled={!formData.agreedToTerms || isSubmitting}
                  className={`w-full bg-slate-900 text-white py-4 rounded-lg font-bold transition-all shadow-md flex justify-center items-center text-lg ${(!formData.agreedToTerms || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:shadow-lg'}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Activating Case File...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Start Investigation Now
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};