import React from 'react';
import { Cookie } from 'lucide-react';

export const CookiePolicy: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary-100 rounded-full">
              <Cookie className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Cookie Policy</h1>
          </div>
          
          <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. How We Use Cookies</h2>
              <p>
                Sentinel uses cookies strictly for essential operational purposes. We do not use advertising cookies or third-party tracking cookies that follow you around the web.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Essential Cookies:</strong> These are necessary for the website to function. They enable core functionality such as security, network management, and accessibility.</li>
                <li><strong>Session Cookies:</strong> These allow us to remember your progress through the multi-step reporting form so you don't lose your data if you refresh the page.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Managing Cookies</h2>
              <p>
                Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};