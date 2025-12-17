import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ClipboardList, Search, BookOpen, Send } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".step-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      icon: <ClipboardList className="w-8 h-8 text-primary-600" />,
      title: "I. Evidentiary Documentation",
      desc: "Comprehensive memorialization of the incident via our secure digital portal. We ensure all data adheres to the technical standards required by financial institutions."
    },
    {
      icon: <Search className="w-8 h-8 text-primary-600" />,
      title: "II. Forensic Case Assessment",
      desc: "Our interdisciplinary team categorizes the matter and identifies the most viable statutory recovery channels based on current global regulations."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary-600" />,
      title: "III. Case File Compilation",
      desc: "Generation of a professional evidentiary dossier, including technical fund-tracing maps and formal draft intercessions for your banking provider."
    },
    {
      icon: <Send className="w-8 h-8 text-primary-600" />,
      title: "IV. Regulatory Submission",
      desc: "Execution of the formal reporting phase, submitting the finalized dossier to the pertinent legal authorities and financial regulators."
    }
  ];

  return (
    <div ref={containerRef} className="pt-32 pb-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Procedural Framework & Standards</h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Sentinel operates within a structured framework designed to bridge the technical gap between victims of financial fraud and the governing regulatory bodies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 transform -translate-x-1/2"></div>
          {steps.map((step, index) => (
            <div key={index} className={`step-card relative flex items-center ${index % 2 === 0 ? 'md:justify-end md:pr-12' : 'md:justify-start md:pl-12 md:order-2'}`}>
              <div className="hidden md:block absolute top-1/2 left-1/2 w-4 h-4 bg-white border-4 border-primary-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"></div>
              <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 shadow-sm w-full max-w-lg hover:shadow-md transition-shadow">
                <div className="bg-white w-16 h-16 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};