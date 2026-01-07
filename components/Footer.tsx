import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-500 p-1.5 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-slate-900" />
              </div>
              <span className="text-xl font-bold text-white">Sentinel</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              A documentation and guidance platform for fraud victims. We bridge the gap between victims and official authorities.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary-500 bg-primary-500/10 px-3 py-1.5 rounded-full w-fit border border-primary-500/20">
              <Lock className="w-3 h-3" />
              <span>256-bit SSL Encrypted</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Home</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary-500 transition-colors">Our Process</Link></li>
              <li><Link to="/report" className="hover:text-primary-500 transition-colors">File a Report</Link></li>
              <li><Link to="/about" className="hover:text-primary-500 transition-colors">Mission & Team</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Scam Types</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/scam-types" className="hover:text-primary-500 transition-colors">Crypto Investments</Link></li>
              <li><Link to="/scam-types" className="hover:text-primary-500 transition-colors">Forex Trading Fraud</Link></li>
              <li><Link to="/scam-types" className="hover:text-primary-500 transition-colors">Romance Scams</Link></li>
              <li><Link to="/scam-types" className="hover:text-primary-500 transition-colors">Bank Transfers</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Important Disclaimer</h3>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-primary-500 shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sentinel is <strong>not</strong> a law enforcement agency or a bank. We do not guarantee fund recovery. We provide documentation services and guidance on official reporting channels.
                </p>
              </div>
            </div>
          </div>

        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; 2023 Sentinel Reporting Ltd. Registered in US, UK & EU.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-primary-500 transition-colors cursor-pointer">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary-500 transition-colors cursor-pointer">Terms of Service</Link>
            <Link to="/cookie-policy" className="hover:text-primary-500 transition-colors cursor-pointer">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};