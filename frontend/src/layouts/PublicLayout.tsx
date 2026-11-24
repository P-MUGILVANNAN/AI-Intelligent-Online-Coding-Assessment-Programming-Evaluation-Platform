import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Cpu, Terminal, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const getDashboardPath = () => {
    if (role === 'Administrator') return '/admin';
    if (role === 'Instructor') return '/instructor';
    return '/student';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0b24] text-slate-100">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-[#2a276b]/60 bg-[#0c0b24]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white/95 rounded-lg px-2.5 py-1 flex items-center justify-center shadow-md shadow-[#2F2D7D]/20 group-hover:scale-105 transition-transform">
              <img src="/fiit-logo.png" alt="FIIT - Create Your Value" className="h-7 sm:h-8 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-tight">
                FIIT <span className="text-[#a5a3ee] font-semibold">Coding Assessment</span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-0.5 tracking-wider uppercase font-medium hidden sm:block">
                Create Your Value
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-[#a5a3ee] transition">Home</Link>
            <Link to="/features" className="hover:text-[#a5a3ee] transition">Features</Link>
            <Link to="/about" className="hover:text-[#a5a3ee] transition">Research & Architecture</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg bg-[#2F2D7D] hover:bg-[#4844af] text-white font-medium text-xs sm:text-sm transition shadow-lg shadow-[#2F2D7D]/30 border border-[#4844af]/50"
              >
                <span>Dashboard</span> <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-[#18173d] transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-[#2F2D7D] hover:bg-[#4844af] text-white font-semibold text-sm transition shadow-lg shadow-[#2F2D7D]/40 border border-[#5c58ca]/40"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#18173d] transition"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5 text-[#a5a3ee]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileNavOpen && (
          <div className="md:hidden border-b border-[#2a276b] bg-[#111033] px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-300">
              <Link
                to="/"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#18173d] hover:text-[#a5a3ee] transition"
              >
                Home
              </Link>
              <Link
                to="/features"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#18173d] hover:text-[#a5a3ee] transition"
              >
                Features
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#18173d] hover:text-[#a5a3ee] transition"
              >
                Research & Architecture
              </Link>
            </nav>

            {!isAuthenticated && (
              <div className="pt-2 border-t border-[#2a276b]/80 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-[#2a276b] text-sm font-medium text-slate-200 hover:bg-[#18173d] transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-[#2F2D7D] hover:bg-[#4844af] text-white font-semibold text-sm transition shadow-lg shadow-[#2F2D7D]/30"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a276b]/60 bg-[#0a091c] py-8 sm:py-12 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-center md:text-left">
            <div className="bg-white/95 rounded px-2 py-0.5 flex items-center justify-center shadow-sm">
              <img src="/fiit-logo.png" alt="FIIT" className="h-5 w-auto object-contain" />
            </div>
            <span className="font-bold text-slate-200">FIIT Coding Assessment</span>
            <span className="text-xs text-slate-500">© 2026 FIIT – Create Your Value. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Isolated Sandbox</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-[#a5a3ee]" /> AST Hybrid Plagiarism</span>
            <span className="flex items-center gap-1.5"><Terminal className="w-4 h-4 text-indigo-400" /> Multi-Language</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
