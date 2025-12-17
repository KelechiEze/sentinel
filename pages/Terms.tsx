import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms and Conditions</h1>
          <p className="text-slate-500 mb-8 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p>
                Welcome to Sentinel. By accessing our website and using our reporting tools, you agree to be bound by these Terms and Conditions. Sentinel provides documentation, case structuring, and guidance services for victims of fraud.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Nature of Services (No Guarantees)</h2>
              <p>
                <strong>Sentinel is NOT a law enforcement agency, a bank, or a legal firm.</strong> We do not have the authority to freeze assets, arrest individuals, or force financial institutions to refund money.
              </p>
              <p className="mt-2">
                Our service is limited to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Analyzing incident details provided by you.</li>
                <li>Structuring this information into professional case files.</li>
                <li>Providing guidance on who to contact (banks, regulators, police).</li>
              </ul>
              <p className="mt-2 font-semibold text-amber-700">
                We do NOT guarantee the recovery of any lost funds. Success depends entirely on the decision-making of your financial institution and relevant authorities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. User Responsibilities</h2>
              <p>
                You agree to provide accurate, truthful, and complete information regarding your case. Submitting false information or attempting to abuse the reporting system for fraudulent purposes (e.g., "friendly fraud" or false chargebacks) is strictly prohibited and may be reported to authorities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. No Legal Advice</h2>
              <p>
                The content provided by Sentinel, including generated reports and email guidance, is for informational purposes only. It does not constitute legal advice. If you require legal representation, you should contact a qualified attorney in your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Sentinel shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of our service or the outcome of your disputes with financial institutions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};