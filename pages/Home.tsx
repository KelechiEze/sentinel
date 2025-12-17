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
      // Hero Animation - Text
      gsap.from(".hero-text", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      // Hero Animation - Visual
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

      // Stats/Trust Bar Animation
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

      // Stats Counters
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
      name: "Marcus Richardson",
      location: "London, UK",
      recovered: "£45,200 Recovered",
      type: "Bank Transfer Fraud",
      quote: "My bank initially refused to refund me, claiming I authorized the payment. Sentinel helped me structure a formal complaint citing the CRM Code. The bank reversed their decision in 4 weeks."
    },
    {
      name: "Jennifer Davis",
      location: "California, USA",
      recovered: "$128,000 Recovered",
      type: "Investment Scam",
      quote: "I sent a wire transfer to what I thought was a brokerage. Sentinel's guide showed me how to request a 'kill chain' recall immediately. The receiving bank froze the account before the scammers could cash out."
    },
    {
      name: "Samuel Kowalski",
      location: "Toronto, Canada",
      recovered: "$32,000 Recovered",
      type: "Romance Scam",
      quote: "I felt so stupid and didn't know where to start. Sentinel's report format made the police actually listen to me. Because of the quick reporting, they identified the mule account and seized the remaining funds."
    },
    {
      name: "Lea Thiemann",
      location: "Berlin, Germany",
      recovered: "€21,500 Recovered",
      type: "Crypto Exchange Fraud",
      quote: "Sentinel directed me to the specific regulatory ombudsman for my region. The exchange finally unlocked my assets after receiving the formal case file Sentinel helped me prepare."
    },
    {
      name: "Benjamin Greene",
      location: "Sydney, Australia",
      recovered: "AUD $15,000 Recovered",
      type: "Tech Support Scam",
      quote: "I was panicked. The guidance helped me realize the transaction was still 'pending'. I contacted the bank's fraud department with the correct terminology and they stopped it just in time."
    },
    {
      name: "Amara Patel",
      location: "New York, USA",
      recovered: "$8,400 Recovered",
      type: "Phishing / Credit Card",
      quote: "Simple and effective. I didn't know I had rights under Reg Z. The template letter they provided for the dispute was exactly what the credit card company needed to see."
    }
  ];

  const faqs = [
    {
      q: "Can you guarantee I get my money back?",
      a: "No honest service can guarantee a 100% recovery. We guarantee that your case will be documented professionally and submitted to the correct legal and financial authorities, significantly increasing your chances compared to filing a vague report on your own."
    },
    {
      q: "Why do I have to pay a service fee?",
      a: "We are a professional documentation and forensic analysis firm. We charge for the labor of tracking your funds, structuring your legal case file, and guiding you through the regulatory process. We do not take a percentage of your recovered funds later (a common tactic of 'recovery scams')."
    },
    {
      q: "Do you work with Crypto scams?",
      a: "Yes. While crypto transactions are irreversible by design, the exchanges that receive the stolen funds are regulated. We trace the assets to these exchanges and provide the evidence needed for law enforcement to request a freeze."
    },
    {
      q: "How long does the process take?",
      a: "You will receive your completed Legal Case File within 48-72 hours of activation. The timeline for the bank or authority to resolve the dispute varies by jurisdiction, typically ranging from 2 weeks to 90 days."
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div ref={containerRef} className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-primary-50 opacity-40 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="hero-text inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 border border-primary-200 text-slate-900 text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                Secure & Confidential Reporting
              </div>
              <h1 className="hero-text text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                Scammed? Get Guidance, Not False Promises.
              </h1>
              <p className="hero-text text-xl text-slate-600 mb-10 leading-relaxed">
                We help victims document fraud, report to the correct authorities, and understand legitimate recovery options. No upfront recovery fees. No magic hacks. Just the truth.
              </p>
              <div className="hero-text flex flex-col sm:flex-row gap-4">
                <Link to="/report" className="inline-flex justify-center items-center px-8 py-4 rounded-lg bg-primary-500 text-slate-900 font-bold hover:bg-primary-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-primary-600/10">
                  Start Free Report
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/how-it-works" className="inline-flex justify-center items-center px-8 py-4 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                  How It Works
                </Link>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="relative h-[400px] lg:h-[500px] w-full flex items-center justify-center mt-12 lg:mt-0">
               <div className="hero-visual-card relative w-full max-w-sm lg:max-w-md h-[400px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 flex flex-col z-10">
                  {/* Fake UI: Case Header */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                        <FileText className="text-primary-600 w-5 h-5" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-slate-900">Case #492-AC</div>
                         <div className="text-xs text-slate-500">Processing Evidence</div>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">ACTIVE</div>
                  </div>

                  {/* Fake UI: Timeline */}
                  <div className="space-y-6 flex-1">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-slate-900">
                          <Check className="w-3 h-3" />
                        </div>
                        <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                      </div>
                      <div className="pb-6">
                        <div className="text-sm font-semibold text-slate-900">Incident Documented</div>
                        <div className="text-xs text-slate-500 mt-1">Evidence secured & encrypted</div>
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
                        <div className="text-sm font-semibold text-slate-900">Authority Routing</div>
                        <div className="text-xs text-slate-500 mt-1">Sent to FCA / ActionFraud</div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                       <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-green-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Bank Dispute Filed</div>
                        <div className="text-xs text-slate-500 mt-1">Chargeback initiated</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Card */}
                  <div className="mt-4 bg-slate-50 rounded-lg p-3 flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-slate-400" />
                     <div className="text-xs text-slate-400">Secure 256-bit AES Encryption</div>
                  </div>
               </div>

               {/* Background Elements */}
               <div className="hero-float-icon absolute top-20 right-4 lg:right-10 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center z-20">
                  <Lock className="w-8 h-8 text-green-500" />
               </div>
               <div className="hero-float-icon absolute bottom-32 left-4 lg:left-0 w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center z-20" style={{animationDelay: '1s'}}>
                  <Landmark className="w-10 h-10 text-primary-500" />
               </div>
               
               {/* Abstract Background Blobs */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-primary-200/30 rounded-full blur-3xl -z-10"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Slider Section */}
      <section className="py-24 bg-slate-900 testimonials-section overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">Real Results Through Proper Process</h2>
              <p className="text-slate-400">
                We provide the documentation that forces banks and regulators to take action.
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
                      {getInitials(testimonial.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-400">{testimonial.location}</div>
                      <div className="text-xs text-slate-500">{testimonial.type}</div>
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
              <h3 className="font-semibold text-slate-900 mb-2">Professional Documentation</h3>
              <p className="text-slate-500 text-sm">We organize your evidence into a legal-grade format for banks and police.</p>
            </div>
            <div className="trust-item">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-slate-100 rounded-full">
                  <Scale className="w-6 h-6 text-slate-700" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Regulatory Guidance</h3>
              <p className="text-slate-500 text-sm">We direct your case to the specific regulator (SEC, FCA, ASIC) for your region.</p>
            </div>
            <div className="trust-item">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-slate-100 rounded-full">
                  <Landmark className="w-6 h-6 text-slate-700" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Bank Dispute Support</h3>
              <p className="text-slate-500 text-sm">Actionable templates and advice for filing chargebacks and wire recalls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics / Impact Section */}
      <section className="py-20 bg-slate-900 text-white stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Impact in Numbers</h2>
            <p className="text-slate-400">Trusted by victims globally to handle their documentation with precision.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
             <div className="stat-counter p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-4xl font-bold text-primary-500 mb-2">8,500+</div>
                <div className="text-sm text-slate-300 font-medium">Cases Documented</div>
             </div>
             <div className="stat-counter p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-4xl font-bold text-primary-500 mb-2">$140M+</div>
                <div className="text-sm text-slate-300 font-medium">Funds Traced</div>
             </div>
             <div className="stat-counter p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-4xl font-bold text-primary-500 mb-2">145</div>
                <div className="text-sm text-slate-300 font-medium">Global Regulators</div>
             </div>
             <div className="stat-counter p-6 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-4xl font-bold text-primary-500 mb-2">92%</div>
                <div className="text-sm text-slate-300 font-medium">Bank Acceptance Rate</div>
             </div>
          </div>
        </div>
      </section>

      {/* Truth vs Fiction Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">The Reality of Recovery</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We focus purely on what is legally possible. These are the verified avenues for legitimate fund recovery.
            </p>
          </div>

          {/* Centered Green Container Only */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-200">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                 <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-slate-900">Legitimate Recovery Options</h3>
                   <p className="text-slate-500 text-sm">Actionable paths supported by law.</p>
                </div>
              </div>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-slate-700">
                   <div className="mt-1 bg-green-50 p-1 rounded-full shrink-0">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                   <div>
                      <strong className="block text-slate-900 mb-1">Bank Recalls & Chargebacks</strong>
                      <span className="text-sm leading-relaxed text-slate-600">Utilizing consumer protection laws (Reg E in US, Section 75 in UK) to dispute transactions made via Credit Card or unauthorized transfers.</span>
                   </div>
                </li>
                <li className="flex items-start gap-4 text-slate-700">
                   <div className="mt-1 bg-green-50 p-1 rounded-full shrink-0">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                   <div>
                      <strong className="block text-slate-900 mb-1">Law Enforcement Seizures</strong>
                      <span className="text-sm leading-relaxed text-slate-600">Reporting to FBI IC3, ActionFraud, or Europol helps authorities track and seize large wallet clusters over time.</span>
                   </div>
                </li>
                <li className="flex items-start gap-4 text-slate-700">
                   <div className="mt-1 bg-green-50 p-1 rounded-full shrink-0">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   </div>
                   <div>
                      <strong className="block text-slate-900 mb-1">Civil Litigation</strong>
                      <span className="text-sm leading-relaxed text-slate-600">In specific cases with significant losses, legal action against identified exchanges or entities handling the stolen funds is possible.</span>
                   </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Global Jurisdictions Section */}
      <section className="py-20 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
                    <Globe2 className="w-4 h-4" />
                    Global Support
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">We Speak the Language of Regulators Worldwide.</h2>
                  <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                     Every country has different fraud reporting standards. Sending a generic email to the police often gets ignored. We tailor your case file to the specific requirements of your jurisdiction's financial authorities.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-lg bg-slate-50">
                        <Map className="w-6 h-6 text-slate-500" />
                        <div>
                           <div className="font-bold text-slate-900">USA</div>
                           <div className="text-xs text-slate-500">FBI IC3 / CFPB</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-lg bg-slate-50">
                        <Map className="w-6 h-6 text-slate-500" />
                        <div>
                           <div className="font-bold text-slate-900">UK</div>
                           <div className="text-xs text-slate-500">ActionFraud / FOS</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-lg bg-slate-50">
                        <Map className="w-6 h-6 text-slate-500" />
                        <div>
                           <div className="font-bold text-slate-900">Europe</div>
                           <div className="text-xs text-slate-500">Europol / ESMA</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-lg bg-slate-50">
                        <Map className="w-6 h-6 text-slate-500" />
                        <div>
                           <div className="font-bold text-slate-900">Australia</div>
                           <div className="text-xs text-slate-500">ACCC / AFCA</div>
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
                     <h3 className="text-xl font-bold mb-4">Why Localization Matters</h3>
                     <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        "I reported to the local police but they did nothing."
                     </p>
                     <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                        Local police often lack the resources to handle international cybercrime. By routing your case to the correct federal or national agency (like the FBI in the US or ActionFraud in the UK) with the correct legal codes, you ensure it lands on the desk of a specialized investigator.
                     </p>
                     <Link to="/report" className="text-primary-500 font-bold hover:text-primary-400 flex items-center gap-2">
                        Start a Localized Report <ArrowRight className="w-4 h-4" />
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600">Common questions about the reporting and recovery process.</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Take the First Step Correctly</h2>
          <p className="text-slate-600 mb-10 text-lg">
            Don't let panic drive your decisions. Document your case securely and get a clear roadmap for what to do next.
          </p>
          <Link to="/report" className="inline-block bg-primary-500 text-slate-900 font-bold px-8 py-4 rounded-lg hover:bg-primary-400 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Start Your Case Report
          </Link>
        </div>
      </section>
    </div>
  );
};