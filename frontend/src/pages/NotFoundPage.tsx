import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LayoutDashboard } from 'lucide-react';
import { StarfieldBackground } from '../components/3d/StarfieldBackground';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#F5F7FA] font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-hidden flex flex-col justify-between">
      <StarfieldBackground />

      {/* Atmospheric lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/[0.08] bg-[#0A0D12]/80 backdrop-blur-md">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-white group"
        >
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <span className="font-mono text-xs font-bold">IG</span>
          </div>
          <span>InvoiceGuard</span>
        </Link>
      </header>

      {/* Main 404 block */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#10141B] border border-white/[0.08] rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/30">
              404 &bull; Path Not Found
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
              This page doesn't exist.
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              The invoice ledger, supplier profile, or section you are looking for may have moved or been archived.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Open Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                <span>Sign In to Console</span>
              </Link>
            )}

            <Link
              to="/"
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs border border-white/[0.08] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-500 border-t border-white/[0.08] bg-[#0A0D12]">
        &copy; 2026 InvoiceGuard Inc. Error code: HTTP_404_PAGE_NOT_FOUND
      </footer>
    </div>
  );
};
