import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScamType, ReportFormData } from '../types';
import { AlertTriangle, Lock, UploadCloud, CheckCircle, Shield, Info, FileText, Globe, Search, Banknote, CreditCard, Bitcoin, Smartphone, Landmark, Copy, Check, ChevronDown, Loader2 } from 'lucide-react';

export const ReportScam: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const paymentProofInputRef = useRef<HTMLInputElement>(null);

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

  const amountLostNum = parseFloat(formData.amountLost) || 0;
  const totalFee = amountLostNum * 0.05;
  
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

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setIsLoadingDetails(true);
    setPaymentProofFile(null);
    setTimeout(() => {
      setIsLoadingDetails(false);
    }, 1500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  const cryptoWallets: Record<string, string> = {
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    USDT: "TJ8vc98k3j0kfj983kfkj983kfj983kfj983 (TRC20)",
    BNB: "bnb136ns6lfw4zs5hg4n85vdthu3n0v0v35"
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200 max-w-2xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Matter #8829-X Activated</h2>
          <p className="text-slate-600 text-lg mb-8">
            The submitted professional service fee and supporting documentation have been verified. The forensic investigation has officially commenced. The preliminary dossier will be delivered to <strong>{formData.contactEmail}</strong> within 48 hours.
          </p>
          <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            Return to Overview
          </button>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Valuation of Loss</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency Denomination</label>
                  <select 
                    name="currency" 
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BTC">BTC</option>
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
                        {file.name}
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
                        <div className="font-semibold text-slate-900">{formData.currency} {formatMoney(feeTracking)}</div>
                      </div>
                      <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                        <div>
                          <div className="font-bold text-slate-900">Legal Case Structuring</div>
                          <div className="text-sm text-slate-500">Memorialization of facts into a formal legal instrument.</div>
                        </div>
                        <div className="font-semibold text-slate-900">{formData.currency} {formatMoney(feeLegal)}</div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">Regulatory Filing Fees</div>
                          <div className="text-sm text-slate-500">Consolidated fees for international regulatory submissions.</div>
                        </div>
                        <div className="font-semibold text-slate-900">{formData.currency} {formatMoney(feeGov)}</div>
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
                    <span className="font-bold flex items-center gap-2"><Lock className="w-4 h-4" /> Secured Payment Portal</span>
                  </div>
                  <div className="p-6 flex-grow">
                    {!selectedMethod ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => handleMethodSelect('Wire')} className="p-4 border border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left">
                          <Landmark className="w-8 h-8 text-slate-600 mb-2" />
                          <div className="font-bold text-slate-900">Bank Wire</div>
                        </button>
                        <button type="button" onClick={() => handleMethodSelect('Crypto')} className="p-4 border border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left">
                          <Bitcoin className="w-8 h-8 text-slate-600 mb-2" />
                          <div className="font-bold text-slate-900">Cryptographic</div>
                        </button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        <button type="button" onClick={() => setSelectedMethod(null)} className="text-sm text-slate-500 mb-4">&larr; Return to Selection</button>
                        {isLoadingDetails ? (
                          <div className="flex-grow flex flex-col items-center justify-center min-h-[300px]">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                            <p className="text-slate-600 font-medium">Retrieving Secure Settlement Particulars...</p>
                          </div>
                        ) : (
                          <div className="animate-fade-in flex-grow">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{selectedMethod} Particulars</h3>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 space-y-3">
                              {selectedMethod === 'Wire' && (
                                <div className="space-y-2">
                                  <div className="flex justify-between"><span className="text-slate-500 text-sm">Beneficiary:</span> <span className="font-mono text-slate-900 font-medium">Sentinel Forensic Ltd.</span></div>
                                  <div className="flex justify-between"><span className="text-slate-500 text-sm">Account:</span> <span className="font-mono text-slate-900 font-medium">9823482910</span></div>
                                  <div className="flex justify-between"><span className="text-slate-500 text-sm">SWIFT/BIC:</span> <span className="font-mono text-slate-900 font-medium">CITIUS33</span></div>
                                </div>
                              )}
                              {selectedMethod === 'Crypto' && (
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">Transfer BTC to the following address:</div>
                                  <div className="font-mono text-xs break-all text-slate-900 font-bold mb-2">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</div>
                                  <button type="button" onClick={() => handleCopy("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")} className="text-xs bg-slate-100 p-2 rounded">Copy Address</button>
                                </div>
                              )}
                            </div>
                            <div className="border-t border-slate-200 pt-6">
                              <label className="block text-sm font-bold text-slate-900 mb-2">Upload Settlement Verification</label>
                              <input type="file" ref={paymentProofInputRef} className="hidden" onChange={handlePaymentProofChange} />
                              <div onClick={() => paymentProofInputRef.current?.click()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${paymentProofFile ? 'border-green-500 bg-green-50' : 'border-slate-300'}`}>
                                {paymentProofFile ? <span className="text-green-700 font-medium">{paymentProofFile.name}</span> : <span className="text-slate-500 text-sm">Attach Proof of Remittance</span>}
                              </div>
                              <button type="button" onClick={() => setStep(4)} disabled={!paymentProofFile} className={`w-full mt-6 py-4 rounded-lg font-bold shadow-lg transition-all ${paymentProofFile ? 'bg-primary-500 text-slate-900' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Confirm Remittance</button>
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
              <h2 className="text-xl font-bold text-slate-900">Final Affirmation</h2>
              <p className="text-slate-600">Provide a secure electronic mailing address for the delivery of the Case File Dossier.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Designated Email Address</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="counsel@entity.com" className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))} className="mt-1 w-4 h-4 text-primary-600 rounded" required />
                <label className="text-sm text-slate-600">I hereby authorize Sentinel to process the provided information. I acknowledge that the professional service fee is for the forensic preparation of my dossier and is non-refundable upon commencement of labor.</label>
              </div>
              <button type="submit" disabled={!formData.agreedToTerms || isSubmitting} className={`w-full bg-slate-900 text-white py-4 rounded-lg font-bold transition-all shadow-md ${(!formData.agreedToTerms || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'}`}>
                {isSubmitting ? "Activating Matter File..." : "Commence Forensic Analysis"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};