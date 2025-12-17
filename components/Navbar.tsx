import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Menu, X, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => location.pathname === path 
    ? "text-primary-600 font-bold" 
    : "text-slate-600 hover:text-primary-600";

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary-500 p-2 rounded-lg group-hover:bg-primary-400 transition-colors">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight block">Sentinel</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Reporting & Guidance</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${isActive('/')} transition-colors font-medium`}>Home</Link>
            <Link to="/how-it-works" className={`${isActive('/how-it-works')} transition-colors font-medium`}>How It Works</Link>
            <Link to="/about" className={`${isActive('/about')} transition-colors font-medium`}>About Us</Link>
            
            <Link to="/report" className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-slate-900 px-5 py-2.5 rounded-lg font-bold transition-all transform hover:translate-y-px shadow-md hover:shadow-lg border border-primary-600/10">
              <span>Report a Scam</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-slate-600 hover:text-primary-600 p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 animate-fade-in-down shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600">Home</Link>
            <Link to="/how-it-works" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600">How It Works</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600">About Us</Link>
            <Link to="/report" onClick={() => setIsOpen(false)} className="block px-3 py-3 mt-4 rounded-md text-base font-bold bg-primary-500 text-slate-900 text-center shadow-md">
              Report a Scam
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};