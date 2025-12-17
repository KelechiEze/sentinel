import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Scale, Landmark, ChevronRight, CheckCircle2, Quote, TrendingUp, ShieldCheck, Lock, Check, ArrowLeft, ArrowRight, Globe2, AlertCircle, HelpCircle, FileCheck, Users, Map } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const Home: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-text", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      gsap.from(".hero-visual-card", {
        x: 40,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power3.out"
      });

      gsap.to(".hero-float-icon", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.from(".trust-item", {
        scrollTrigger: {
          trigger: ".trust-bar",
          start: "top 90%",
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.5
      });

      gsap.from(".stat-counter", {
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const testimonials = [
    {
      initials: "M.R.",
      location: "London, UK",
      recovered: "£45,200 Recovered",
      type: "Bank Transfer Fraud",
      quote: "Following the bank's initial summary denial, Sentinel structured a formal appeal citing specific CRM Code violations. This technical advocacy resulted in a full reversal within thirty business days."
    },
    {
      initials: "J.D.",
      location: "California, USA",
      recovered: "$128,000 Recovered",
      type: "Investment Misfeasance",
      quote: "Our wire transfer was intercepted by an illicit entity. Sentinel facilitated the immediate execution of a 'kill chain' protocol. The intermediary institution froze the funds prior to liquidation by the perpetrators."
    },
    {
      initials: "S.K.",
      location: "Toronto, Canada",
      recovered: "$32,000 Recovered",
      type: "Digital Impersonation",
      quote: "The provided evidentiary dossier ensured my claim was handled with appropriate priority by federal authorities. This expedited reporting led to the identification and subsequent seizure of the mule accounts."
    },
    {
      initials: "L.T.",
      location: "Berlin, Germany",
      recovered: "€21,500 Recovered",
      type: "Cryptographic Asset Fraud",
      quote: "Sentinel navigated the complex jurisdictional requirements for the European Securities and Markets Authority. This regulatory pressure compelled the exchange to restore access to my assets."
    }
  ];

  const faqs = [
    {
      q: "Does your firm guarantee asset recovery?",
      a: "No professional organization can offer an absolute guarantee of recovery. Sentinel guarantees the professional memorialization of your claim and its submission to the pertinent legal and financial authorities, thereby maximizing the probability of a favorable adjudication."
    },
    {
      q: "What is the basis for the professional service fee?",
      a: "Sentinel is a specialized documentation and forensic advisory firm. The fee covers the professional labor required for fund tracing, legal case file structuring, and jurisdictional regulatory navigation. We do not operate on a contingency basis, ensuring our advice remains objective."
    },
    {
      q: "Are cryptographic assets within your scope of expertise?",
      a: "Yes. While decentralized transactions are irreversible, the centralized exchanges facilitating the off-ramping of stolen assets are subject to regulatory oversight. We trace assets to these entities to provide the requisite evidence for law enforcement seizure orders."
    },
    {
      q: "What is the expected timeline for procedural completion?",
      a: "The Comprehensive Legal Case File is typically finalized within 48 to 72 hours of case activation. Subsequent dispute resolution timelines are subject to the specific internal protocols of the financial institutions and regulators involved."
    }
  ];

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 400;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div ref={containerRef} className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-primary-50 opacity-40 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="hero-text inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 border border-primary-200 text-slate-900 text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                Confidential Incident Documentation
              </div>
              <h1 className="hero-text text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                Victim of Financial Misfeasance?
              </h1>
              <p className="hero-text text-xl text-slate-600 mb-10 leading-relaxed">
                Sentinel provides forensic documentation and regulatory advocacy for victims of financial fraud. We facilitate formal reporting to the appropriate global jurisdictions and support legitimate avenues for asset recovery.
              </p>
              <div className="hero-text flex flex-col sm:flex-row gap-4">
                <Link to="/report" className="inline-flex justify-center items-center px-8 py-4 rounded-lg bg-primary-500 text-slate-900 font-bold hover:bg-primary-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-primary-600/10">
                  Initiate Case File
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/how-it-works" className="inline-flex justify-center items-center px-8 py-4 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                  Procedural Framework
                </Link>
              </div>
            </div>

            <div className="relative h-[400px] lg:h-[500px] w-full flex items-center justify-center mt-12 lg:mt-0">
               <div className="hero-visual-card relative w-full max-w-sm lg:max-w-md h-[400px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 flex flex-col z-10">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                        <FileText className="text-primary-600 w-5 h-5" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-slate-900">Matter #492-AC</div>
                         <div className="text-xs text-slate-500">Forensic Intake In-Progress</div>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">ACTIVE</div>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-slate-900">
                          <Check className="w-3 h-3" />
                        </div>
                        <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                      </div>
                      <div className="pb-6">
                        <div className="text-sm font-semibold text-slate-900">Incident Memorialized</div>
                        <div className="text-xs text-slate-500 mt-1">Evidentiary chain secured via AES-256</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-slate-900">
                          <Check className="w-3 h-3" />
                        </div>
                        <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                      </div>
                      <div className="pb-6">
                        <div className="text-sm font-semibold text-slate-900">Regulatory Routing</div>
                        <div className="text-xs text-slate-500 mt-1">Dispatched to FCA / FinCEN Protocols</div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                       <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-green-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Inter institution Dispute</div>
                        <div className="text-xs text-slate-500 mt-1">Recall Request Authorized</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-slate-50 rounded-lg p-3 flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-slate-400" />
                     <div className="text-xs text-slate-400">Statutory Compliance Confirmed</div>
                  </div>
               </div>
               <div className="hero-float-icon absolute top-20 right-4 lg:right-10 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center z-20">
                  <Lock className="w-8 h-8 text-green-500" />
               </div>
               <div className="hero-float-icon absolute bottom-32 left-4 lg:left-0 w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center z-20" style={{animationDelay: '1s'}}>
                  <Landmark className="w-10 h-10 text-primary-500" />
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-primary-200/30 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Case Outcomes) - MOVED TO FOLLOW HERO */}
      <section className="py-24 bg-slate-900 testimonials-section overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">Documented Case Outcomes</h2>
              <p className="text-slate-400">
                A summary of successful recoveries facilitated through professional procedural adherence.
              </p>
            </div>
            <div className="flex gap-4">
               <button onClick={() => scrollSlider('left')} className="p-3 rounded-full border border-slate-700 text-white hover:bg-primary-500 hover:text-slate-900 transition-colors">
                  <ArrowLeft className="w-6 h-6" />
               </button>
               <button onClick={() => scrollSlider('right')} className="p-3 rounded-full border border-slate-700 text-white hover:bg-primary-500 hover:text-slate-900 transition-colors">
                  <ArrowRight className="w-6 h-6" />
               </button>
            </div>
          </div>

          <div 
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 hide-scrollbar"
            style={{ scrollBehavior: 'smooth' }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex-shrink-0 w-full md:w-[400px] snap-center">
                <div className="h-full bg-slate-800 p-8 rounded-2xl border border-slate-700 relative hover:bg-slate-750 transition-colors flex flex-col">
                  <Quote className="absolute top-8 right-8 w-8 h-8 text-slate-600 opacity-20" />
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.location}</div>
                      <div className="text-xs text-slate-400">{testimonial.type}</div>
                    </div>
                  </div>
                  <div className="mb-6 flex items-center gap-2 text-primary-400 bg-primary-500/10 px-3 py-1.5 rounded-full w-fit text-sm font-medium border border-primary-500/20">
                    <TrendingUp className="w-4 h-4" />
                    {testimonial.recovered}
                  </div>
                  <p className="text-slate-300 leading-relaxed italic flex-grow">
                    "{testimonial.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-slate-200 bg-white py-12 trust-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="trust-item">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-slate-100 rounded-full">
                  <FileText className="w-6 h-6 text-slate-700" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Forensic Documentation</h3>
              <p className="text-slate-500 text-sm">We structure evidentiary chains into legal-grade dossiers for institutional review.</p>
            </div>
            <div className="trust-item">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-slate-100 rounded-full">
                  <Scale className="w-6 h-6 text-slate-700" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Jurisdictional Navigation</h3>
              <p className="text-slate-500 text-sm">Our advocacy spans specific global regulators including the SEC, FCA, and ASIC.</p>
            </div>
            <div className="trust-item">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-slate-100 rounded-full">
                  <Landmark className="w-6 h-6 text-slate-700" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Dispute Intercession</h3>
              <p className="text-slate-500 text-sm">Strategic advisory for the execution of chargebacks and SWIFT recall protocols.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-slate-900 text-white stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Consolidated Impact Analytics</h2>
            <p className="text-slate-400">An overview of our institutional reach and successful matter formalizations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
             <div className="stat-counter p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-4xl font-bold text-primary-500 mb-2">8,500+</div>
                <div className="text-sm text-slate-300 font-medium">Matters Formalized</div>
             </div>
             <div className="stat-counter p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-4xl font-bold text-primary-500 mb-2">$140M+</div>
                <div className="text-sm text-slate-300 font-medium">Assets Traced</div>
             </div>
             <div className="stat-counter p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-4xl font-bold text-primary-500 mb-2">145</div>
                <div className="text-sm text-slate-300 font-medium">Regulatory Channels</div>
             </div>
             <div className="stat-counter p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-4xl font-bold text-primary-500 mb-2">92%</div>
                <div className="text-sm text-slate-300 font-medium">Institutional Acceptance</div>
             </div>
          </div>
        </div>
      </section>

      {/* Statutory Recourse Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Statutory Recourse Channels</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our framework exclusively utilizes verified legal mechanisms for the reclamation of assets.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-200">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                 <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-slate-900">Legal Recovery Avenues</h3>
                   <p className="text-slate-500 text-sm">Actionable protocols recognized by international law.</p>
                </div>
              </div>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-slate-700">
                   <div className="mt-1 bg-green-50 p-1 rounded-full shrink-0">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                   <div>
                      <strong className="block text-slate-900 mb-1">Consumer Protection Adjudication</strong>
                      <span className="text-sm leading-relaxed text-slate-600">Leveraging Regulation E (US) and Section 75 (UK) to mandate institutional accountability for unauthorized transactions.</span>
                   </div>
                </li>
                <li className="flex items-start gap-4 text-slate-700">
                   <div className="mt-1 bg-green-50 p-1 rounded-full shrink-0">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                   <div>
                      <strong className="block text-slate-900 mb-1">Law Enforcement Asset Seizure</strong>
                      <span className="text-sm leading-relaxed text-slate-600">Direct integration with FBI IC3 and Europol protocols to facilitate the freezing of illicit cryptographic clusters.</span>
                   </div>
                </li>
                <li className="flex items-start gap-4 text-slate-700">
                   <div className="mt-1 bg-green-50 p-1 rounded-full shrink-0">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                   <div>
                      <strong className="block text-slate-900 mb-1">Civil Litigation Support</strong>
                      <span className="text-sm leading-relaxed text-slate-600">Preparation of comprehensive dossiers for civil action against non-compliant entities and custodial institutions.</span>
                   </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-20 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
                    <Globe2 className="w-4 h-4" />
                    Global Jurisdictional Support
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Adherence to Diverse Regulatory Standards.</h2>
                  <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                     Statutory reporting requirements vary significantly by jurisdiction. Sentinel ensures your documentation adheres to the specific evidentiary standards of your national financial authority.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-lg bg-slate-50">
                        <Map className="w-6 h-6 text-slate-500" />
                        <div>
                           <div className="font-bold text-slate-900">United States</div>
                           <div className="text-xs text-slate-500">IC3 / CFPB Compliance</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-lg bg-slate-50">
                        <Map className="w-6 h-6 text-slate-500" />
                        <div>
                           <div className="font-bold text-slate-900">United Kingdom</div>
                           <div className="text-xs text-slate-500">FCA / FOS Protocols</div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="flex-1 flex justify-center">
                  <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl max-w-md relative">
                     <div className="absolute -top-6 -right-6 bg-primary-500 text-slate-900 p-4 rounded-xl shadow-lg font-bold">
                        <FileCheck className="w-6 h-6 mb-1" />
                        Compliant
                     </div>
                     <h3 className="text-xl font-bold mb-4">The Necessity of Localization</h3>
                     <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                        Generic reporting is often categorized as low-priority by local law enforcement. Sentinel routes your dossier through specialized federal agencies, ensuring appropriate investigator engagement.
                     </p>
                     <Link to="/report" className="text-primary-500 font-bold hover:text-primary-400 flex items-center gap-2">
                        Commence Localized Reporting <ArrowRight className="w-4 h-4" />
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Procedural Clarifications</h2>
            <p className="text-slate-600">Frequently addressed inquiries regarding our technical advocacy.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-lg">{faq.q}</span>
                  <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-90' : ''}`} />
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-slate-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Commence Professional Fact-Finding</h2>
          <p className="text-slate-600 mb-10 text-lg">
            Ensure your matter is memorialized with professional precision. Document your case dossier to establish a definitive evidentiary foundation.
          </p>
          <Link to="/report" className="inline-block bg-primary-500 text-slate-900 font-bold px-8 py-4 rounded-lg hover:bg-primary-400 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Initiate Formal Reporting
          </Link>
        </div>
      </section>
    </div>
  );
};