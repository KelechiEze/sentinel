import React from 'react';
import { Lock, ShieldCheck, Database } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Summary Card */}
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg mb-12">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-8 h-8 text-primary-500" />
            <h1 className="text-2xl font-bold">Privacy & Data Protection</h1>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            Your privacy is our absolute priority. We deal with sensitive financial data, and we treat it with the highest level of security. We strictly adhere to GDPR and international data privacy standards.
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
          <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary-600" />
                1. Information We Collect
              </h2>
              <p>
                We only collect information necessary to generate your case file and provide guidance. This includes:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Contact details (Email address).</li>
                <li>Incident details (Dates, amounts, transaction IDs).</li>
                <li>Scammer details (Phone numbers, websites, wallet addresses).</li>
                <li>Evidence files (Screenshots, receipts).</li>
              </ul>
              <p className="mt-2 font-bold text-slate-900">
                We do NOT collect or store: Credit card numbers, bank account passwords, or private keys.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-600" />
                2. How We Use Your Data
              </h2>
              <p>
                Your data is used <strong>exclusively</strong> for the purpose of:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Generating your downloadable Case File PDF.</li>
                <li>Identifying the correct authorities for your specific case.</li>
                <li>Sending you status updates and guidance.</li>
              </ul>
              <p className="mt-4 p-4 bg-primary-50 text-primary-900 rounded-lg border border-primary-100">
                <strong>We never sell your data.</strong> We do not share your information with marketing agencies, third-party recovery services, or data brokers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Data Retention & Deletion</h2>
              <p>
                We retain your case data for a period of 12 months to allow you to retrieve your documents. After this period, data is automatically anonymized or deleted.
              </p>
              <p className="mt-2">
                You have the right to request the immediate deletion of your data at any time by contacting privacy@sentinel-report.org.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Security Measures</h2>
              <p>
                We employ industry-standard security measures, including:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>TLS 1.3 encryption for data in transit.</li>
                <li>AES-256 encryption for data at rest.</li>
                <li>Strict access controls for our support staff.</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};