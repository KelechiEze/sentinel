import React from 'react';
import { Users, MapPin, Mail } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">About Sentinel</h1>
            
            <div className="prose prose-slate max-w-none text-slate-600">
              <p className="text-lg mb-6">
                Sentinel was founded by former fraud analysts and cybersecurity professionals who were tired of seeing scam victims victimized a second time by "recovery" scammers.
              </p>
              <p className="mb-6">
                Our mission is to provide a safe harbor where victims can get the truth. We realized that while we cannot hack blockchains (no one can), we <em>can</em> help victims navigate the complex bureaucracy of banks and law enforcement.
              </p>
              <p className="mb-6">
                We believe that clear, professional documentation is the single biggest factor in whether a bank opens a dispute or ignores it.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg">
                <Users className="w-8 h-8 text-slate-700 mb-3" />
                <h3 className="font-semibold text-slate-900">Registered Entity</h3>
                <p className="text-sm text-slate-500 mt-1">Sentinel Reporting Ltd.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg">
                <MapPin className="w-8 h-8 text-slate-700 mb-3" />
                <h3 className="font-semibold text-slate-900">Location</h3>
                <p className="text-sm text-slate-500 mt-1">71-75 Shelton Street, London, UK</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg">
                <Mail className="w-8 h-8 text-slate-700 mb-3" />
                <h3 className="font-semibold text-slate-900">Contact</h3>
                <p className="text-sm text-slate-500 mt-1">help@sentinel-report.org</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 p-8 md:p-12 text-white">
            <h3 className="text-2xl font-bold mb-4">Our Commitment to Privacy</h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              We operate under strict GDPR compliance. Your data is encrypted and is solely used to generate your case file. We never sell victim data to third parties.
            </p>
            <div className="inline-block border border-slate-600 px-4 py-2 rounded text-sm text-slate-400">
              Data Protection Reg: ZA293847
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};