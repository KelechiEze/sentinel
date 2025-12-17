import React from 'react';
import { Link } from 'react-router-dom';
import { Bitcoin, RefreshCw, Heart, Building, ChevronRight } from 'lucide-react';

export const ScamTypes: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Common Scam Types We Handle</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Fraudsters are constantly evolving, but the mechanisms of theft often fall into these specific categories. Identifying the type is the first step to recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Crypto */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <Bitcoin className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Crypto Investment Fraud</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Fake exchanges, "pig butchering" schemes, and mining pools that promise unrealistic returns. Victims are often led to believe they are making profits until they try to withdraw.
            </p>
            <Link to="/report" className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              Report Crypto Fraud <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Forex */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Forex Trading Scams</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Unregulated brokers offering "managed accounts" or automated trading bots. They often manipulate trading data to show false profits before disappearing with the capital.
            </p>
            <Link to="/report" className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              Report Forex Scam <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Romance */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-rose-50 rounded-xl flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Romance Scams</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Long-term manipulation where scammers build emotional trust before requesting money for "emergencies", "travel", or "investments". Often involves detailed storytelling.
            </p>
            <Link to="/report" className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              Report Romance Scam <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Bank */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
              <Building className="w-8 h-8 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Bank Transfer / APP Fraud</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Authorized Push Payment (APP) fraud where victims are tricked into sending money to a "safe account" or paying for non-existent goods/services.
            </p>
            <Link to="/report" className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              Report Bank Fraud <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};