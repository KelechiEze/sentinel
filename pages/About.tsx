import React from 'react';
import { Users, MapPin, Mail } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Corporate Profile</h1>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
              <p className="text-lg mb-6">
                Sentinel was established by an interdisciplinary cohort of forensic analysts and cybersecurity practitioners dedicated to providing technical advocacy for victims of financial fraud.
              </p>
              <p className="mb-6">
                Our organizational mandate is to provide a secure environment where claimants can obtain objective analysis and professional guidance. We acknowledge the technical complexities inherent in decentralized financial systems and facilitate navigation through the bureaucratic structures of global financial institutions.
              </p>
              <p className="mb-6">
                Sentinel maintains that professional evidentiary memorialization is the primary determinant of a successful dispute adjudication by an ombudsman or banking institution.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg">
                <Users className="w-8 h-8 text-slate-700 mb-3" />
                <h3 className="font-semibold text-slate-900">Legal Entity</h3>
                <p className="text-sm text-slate-500 mt-1">Sentinel Forensic Advocacy Ltd.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg">
                <MapPin className="w-8 h-8 text-slate-700 mb-3" />
                <h3 className="font-semibold text-slate-900">Registered Office</h3>
                <p className="text-sm text-slate-500 mt-1">71-75 Shelton Street, London, UK</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg">
                <Mail className="w-8 h-8 text-slate-700 mb-3" />
                <h3 className="font-semibold text-slate-900">Electronic Correspondence</h3>
                <p className="text-sm text-slate-500 mt-1">compliance@sentinel-report.org</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 p-8 md:p-12 text-white">
            <h3 className="text-2xl font-bold mb-4">Statutory Commitment to Privacy</h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Sentinel operates in strict accordance with the General Data Protection Regulation (GDPR). All claimant data is subjected to AES-256 cryptographic encryption and is utilized exclusively for the generation of professional dossiers.
            </p>
            <div className="inline-block border border-slate-600 px-4 py-2 rounded text-sm text-slate-400">
              Data Controller Registration: ZA293847
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};