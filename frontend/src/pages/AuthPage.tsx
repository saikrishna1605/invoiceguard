import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  Bot,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StarfieldBackground } from '../components/3d/StarfieldBackground';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loginAsDemo, loginWithCredentials, registerUser } = useAuth();

  // Tab: 'login' | 'register'
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration states
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect target
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSearchParams({ tab });
  };

  const handleDemoLogin = (personaId?: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setTimeout(() => {
      loginAsDemo(personaId);
      navigate(from, { replace: true });
    }, 200);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your corporate email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = loginWithCredentials(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !regEmail.trim() || !regPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage('All fields are required to register.');
      return;
    }

    if (regPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your input.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters for testing.');
      return;
    }

    setIsSubmitting(true);
    const result = registerUser(name, regEmail, regPassword);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#F5F7FA] font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-hidden flex flex-col justify-between">
      {/* Background 3D Starfield */}
      <StarfieldBackground />

      {/* Atmospheric lighting */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar with Back Link */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/[0.06] bg-[#0A0D12]/70 backdrop-blur-md">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to InvoiceGuard</span>
        </Link>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs tracking-tight text-white">InvoiceGuard Console</span>
        </div>
      </header>

      {/* Main Split Layout Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Brand / Value Proposition */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Controlled Autonomy Protocol</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered Invoice Intelligence{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                with Human Control.
              </span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Sign in to access your financial operations queue. Review AI-extracted line items, 3-way PO variances, and supplier anomaly scores before authorizing any disbursement.
            </p>

            {/* Feature List */}
            <div className="space-y-3.5 pt-2 text-xs">
              <div className="flex items-start space-x-3">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-white">3-Way PO Reconciliation</p>
                  <p className="text-slate-400 text-[11px]">Strict 2% variance checks against verified purchase orders.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-white">Dynamic Supplier Baselines</p>
                  <p className="text-slate-400 text-[11px]">Automated detection of sudden transaction spikes and duplicate collisions.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-white">Cryptographic Audit Trail</p>
                  <p className="text-slate-400 text-[11px]">Every human approval decision is logged with identity and timestamp.</p>
                </div>
              </div>
            </div>

            {/* Live Visual Card */}
            <div className="p-4 rounded-xl bg-[#10141B] border border-white/[0.08] shadow-xl text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/[0.06] pb-2">
                <span className="flex items-center space-x-1.5 font-mono text-emerald-400">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Pre-Screened Evidence</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">Live Demo Sandbox</span>
              </div>
              <p className="text-[11px] text-slate-300 italic">
                &ldquo;AI analyzes. Evidence explains. Humans decide.&rdquo;
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Auth Card (Login & Register) */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="bg-[#10141B] rounded-2xl border border-white/[0.1] shadow-2xl p-6 sm:p-8 relative backdrop-blur-xl">
              
              {/* Header Title */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {activeTab === 'login' ? 'Welcome to InvoiceGuard' : 'Create Reviewer Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTab === 'login'
                    ? 'Sign in to access your financial operations dashboard'
                    : 'Set up your credentials to participate in human-in-the-loop review'}
                </p>
              </div>

              {/* Tab Selector Buttons */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0A0D12] border border-white/[0.08] mb-6">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'login'
                      ? 'bg-[#151A22] text-white shadow-xs border border-white/[0.08]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'register'
                      ? 'bg-[#151A22] text-white shadow-xs border border-white/[0.08]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* TAB 1: LOGIN */}
              {activeTab === 'login' ? (
                <div className="space-y-5">
                  {/* 1-Click Demo Login Hero Banner */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/15 via-[#151A22] to-sky-500/10 border border-emerald-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Hackathon 1-Click Demo</span>
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Instant Access
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300">
                      Instantly enter the review console as <strong className="text-white">Demo Reviewer</strong> with pre-seeded invoices and live SQLite data.
                    </p>

                    <button
                      type="button"
                      onClick={() => handleDemoLogin('demo_reviewer')}
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Continue as Demo Reviewer (1-Click)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Additional Demo Personas Dropdown / Quick Links */}
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Or switch to:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDemoLogin('sai_krishna')}
                          className="text-[11px] text-emerald-400 hover:underline"
                        >
                          Sai Krishna
                        </button>
                        <span>&bull;</span>
                        <button
                          type="button"
                          onClick={() => handleDemoLogin('elena_vance')}
                          className="text-[11px] text-indigo-400 hover:underline"
                        >
                          Elena Vance
                        </button>
                        <span>&bull;</span>
                        <button
                          type="button"
                          onClick={() => handleDemoLogin('marcus_vance')}
                          className="text-[11px] text-amber-400 hover:underline"
                        >
                          Marcus Vance
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-white/[0.08] w-full" />
                    <span className="bg-[#10141B] px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Or sign in with corporate email
                    </span>
                  </div>

                  {/* Manual Login Form */}
                  <form onSubmit={handleManualLogin} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Corporate Email</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="reviewer@invoiceguard.internal"
                          className="w-full pl-9 pr-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-9 pr-9 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-white font-bold rounded-lg transition-colors border border-white/[0.1] shadow-xs flex items-center justify-center space-x-1.5 mt-2"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                /* TAB 2: REGISTRATION */
                <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full pl-9 pr-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Work Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="alex.m@company.com"
                        className="w-full pl-9 pr-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full pl-9 pr-9 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type your password"
                        className="w-full pl-9 pr-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors shadow-md flex items-center justify-center space-x-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Create Reviewer Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-[11px] text-slate-500">
                <span>Controlled Autonomy Protocol &bull; Human Sign-off Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Simple Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-500 border-t border-white/[0.06]">
        &copy; 2026 InvoiceGuard Inc. Built for autonomous invoice verification.
      </footer>
    </div>
  );
};
