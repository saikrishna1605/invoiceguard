import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  Sparkles, 
  UserCheck, 
  Building2 
} from 'lucide-react';
import { useAuth, DEMO_USERS, type UserPersona } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAs, loginWithCredentials } = useAuth();

  const [email, setEmail] = useState('sai.krishna@invoiceguard.internal');
  const [password, setPassword] = useState('••••••••');
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSelectPersona = (persona: UserPersona) => {
    loginAs(persona);
    navigate(from, { replace: true });
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginWithCredentials(email, password);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#F5F7FA] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">InvoiceGuard</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Autonomous invoice verification platform &bull; Controlled autonomy review gate.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#10141B] rounded-2xl border border-white/[0.08] shadow-2xl p-6 space-y-6">
          {/* Demo Login Quick Switchers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>1-Click Demo Login</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Select persona</span>
            </div>

            <div className="space-y-2">
              {DEMO_USERS.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => handleSelectPersona(persona)}
                  className="w-full text-left p-3 rounded-xl border border-white/[0.06] bg-[#0A0D12] hover:bg-[#151A22] hover:border-emerald-500/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 group-hover:border-emerald-500/30">
                      {persona.avatarInitials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {persona.name}
                      </p>
                      <p className="text-[11px] text-slate-400">{persona.role}</p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/[0.08] w-full" />
            <span className="bg-[#10141B] px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Or sign in manually
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/50"
                  placeholder="sai.krishna@invoiceguard.internal"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center space-x-1.5"
            >
              <span>Authenticate Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center space-x-4">
          <span className="flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Role-Based Governance</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Audit-Ready Logs</span>
          </span>
        </div>
      </div>
    </div>
  );
};
