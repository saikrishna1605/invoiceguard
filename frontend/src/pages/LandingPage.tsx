import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Bot, 
  Lock, 
  Cpu, 
  Check,
  ChevronRight
} from 'lucide-react';
import { Hero3DVisual } from '../components/3d/Hero3DVisual';
import { StarfieldBackground } from '../components/3d/StarfieldBackground';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginAsDemo } = useAuth();

  // Interactive Live Fraud Simulator state
  const [activeScenario, setActiveScenario] = useState<'clean' | 'anomaly' | 'duplicate'>('clean');

  const handleExploreDemo = () => {
    loginAsDemo('demo_reviewer');
    navigate('/dashboard');
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const scenarios = {
    clean: {
      invNum: 'INV-1041',
      vendor: 'Nova Systems Inc.',
      amount: 32400,
      poAmount: 32400,
      poNum: 'PO-1041',
      risk: 'low',
      riskLabel: '🟢 Low Risk',
      riskScore: 0,
      reason: 'Perfect 3-way line item match. Within 0% PO tolerance. Verified Net 30 vendor.',
      variance: '0.0% (Match)',
      status: 'pending_review',
    },
    anomaly: {
      invNum: 'INV-1042',
      vendor: 'Acme Supplies Ltd.',
      amount: 84500,
      poAmount: 25000,
      poNum: 'PO-1042',
      risk: 'high',
      riskLabel: '🔴 High Risk',
      riskScore: 75,
      reason: 'Invoice amount is 3.38x higher than matched purchase order ($25,000.00). Variance: +$59,500.00.',
      variance: '+238% Variance',
      status: 'pending_review',
    },
    duplicate: {
      invNum: 'INV-1040',
      vendor: 'Global Logistics Corp',
      amount: 91200,
      poAmount: 91200,
      poNum: 'PO-1040',
      risk: 'high',
      riskLabel: '🔴 High Risk',
      riskScore: 60,
      reason: 'Invoice number already recorded in previous ledger batch (collision with ID #2). Potential double payment.',
      variance: 'Duplicate Key Collision',
      status: 'pending_review',
    },
  };

  const activeData = scenarios[activeScenario];

  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#F5F7FA] font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-hidden">
      {/* 3D Ambient Dust Field */}
      <StarfieldBackground />

      {/* Atmospheric lighting glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-sky-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[800px] left-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* ─── NAVIGATION BAR ─── */}
      <header className="sticky top-0 z-40 bg-[#0A0D12]/80 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 transition-colors shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-white">InvoiceGuard</span>
              <span className="text-[9px] uppercase tracking-wider font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                AI Defense
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pipeline" className="hover:text-white transition-colors">
              Agent Pipeline
            </a>
            <a href="#human-loop" className="hover:text-white transition-colors">
              Human-in-the-Loop
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Product Preview
            </a>
            <a href="#simulator" className="hover:text-white transition-colors">
              Live Simulator
            </a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-colors"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>

                <button
                  onClick={handleExploreDemo}
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-emerald-400 border border-emerald-500/30 transition-colors"
                >
                  <Play className="w-3 h-3 fill-emerald-400" />
                  <span>Explore Demo</span>
                </button>

                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-colors"
                >
                  <span>Get Started &rarr;</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI-POWERED INVOICE INTELLIGENCE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Stop paying invoices{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                you shouldn't.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              InvoiceGuard uses AI agents to extract, validate, and assess invoices before they reach a human decision-maker.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                <span>Get Started &rarr;</span>
              </button>

              <button
                onClick={handleExploreDemo}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#10141B] hover:bg-[#151A22] border border-white/[0.12] text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all group"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Explore Demo (1-Click)</span>
              </button>
            </div>

            {/* Principle Tagline */}
            <div className="pt-2 text-xs font-mono text-emerald-400/90 font-medium">
              <span>AI analyzes. Evidence explains. Humans decide.</span>
            </div>

            {/* Floating Trust Indicators (Small elegant pills/cards) */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-mono">
              <div className="px-3 py-1 rounded-lg bg-[#10141B] border border-white/[0.08] text-slate-300 flex items-center space-x-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI-Powered Extraction</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-[#10141B] border border-white/[0.08] text-slate-300 flex items-center space-x-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>PO Validation</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-[#10141B] border border-white/[0.08] text-slate-300 flex items-center space-x-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fraud Detection</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-[#10141B] border border-white/[0.08] text-slate-300 flex items-center space-x-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Human Approval</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-[#10141B] border border-white/[0.08] text-slate-300 flex items-center space-x-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audit Trail</span>
              </div>
            </div>
          </div>

          {/* Right Hero 3D Interactive Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <Hero3DVisual />
          </div>
        </div>
      </section>

      {/* ─── 2. HOW IT WORKS SECTION ─── */}
      <section id="how-it-works" className="relative z-10 py-20 bg-[#0D1117]/60 border-y border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Workflow Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How InvoiceGuard Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              A structured 4-step pipeline that screens every inbound invoice before releasing corporate capital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-[#10141B] p-6 rounded-2xl border border-white/[0.08] space-y-4 hover:border-emerald-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-bold text-sm font-mono group-hover:scale-105 transition-transform">
                01
              </div>
              <h3 className="font-bold text-base text-white">Extract</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI reads the invoice and extracts structured financial information including line items, totals, and supplier IDs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#10141B] p-6 rounded-2xl border border-white/[0.08] space-y-4 hover:border-sky-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 flex items-center justify-center font-bold text-sm font-mono group-hover:scale-105 transition-transform">
                02
              </div>
              <h3 className="font-bold text-base text-white">Validate</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare invoice details against the purchase order and supplier record with strict 2% variance tolerances.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#10141B] p-6 rounded-2xl border border-white/[0.08] space-y-4 hover:border-indigo-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center font-bold text-sm font-mono group-hover:scale-105 transition-transform">
                03
              </div>
              <h3 className="font-bold text-base text-white">Assess</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detect duplicates, mismatches, and unusual financial patterns against historical vendor baselines.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#10141B] p-6 rounded-2xl border border-white/[0.08] space-y-4 hover:border-emerald-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm font-mono group-hover:scale-105 transition-transform">
                04
              </div>
              <h3 className="font-bold text-base text-white">Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A human reviewer sees the evidence, checks line item comparisons, and makes the final approval decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. AGENT PIPELINE VISUALIZATION (Data flow) ─── */}
      <section id="pipeline" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
            Pipeline Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Animated Agent Flow &amp; Data Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Every invoice traverses deterministic matching and LLM agents before arriving at the human gate.
          </p>
        </div>

        {/* Visual Pipeline Nodes with Flow Connectors */}
        <div className="relative">
          {/* Desktop Flow Strip */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {/* Node 1: Inbound Invoice */}
            <div className="bg-[#10141B] p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">START</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Inbound Invoice</h4>
                <p className="text-[11px] text-slate-400 mt-1">PDF or image uploaded via API or UI</p>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Raw Ingestion</span>
              </div>
            </div>

            {/* Node 2: Extract */}
            <div className="bg-[#10141B] p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400">STAGE 1</span>
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Extract Agent</h4>
                <p className="text-[11px] text-slate-400 mt-1">Regex patterns with Claude Sonnet LLM fallback</p>
              </div>
              <div className="text-[10px] font-mono text-slate-400">Structured Data</div>
            </div>

            {/* Node 3: Validate */}
            <div className="bg-[#10141B] p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-sky-400">STAGE 2</span>
                <Cpu className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Validate Agent</h4>
                <p className="text-[11px] text-slate-400 mt-1">3-way PO reconciliation &amp; variance bounds</p>
              </div>
              <div className="text-[10px] font-mono text-slate-400">Tolerance Checked</div>
            </div>

            {/* Node 4: Assess */}
            <div className="bg-[#10141B] p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-indigo-400">STAGE 3</span>
                <AlertTriangle className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Assess Agent</h4>
                <p className="text-[11px] text-slate-400 mt-1">Anomaly multipliers &amp; duplicate detection</p>
              </div>
              <div className="text-[10px] font-mono text-slate-400">Risk Scored</div>
            </div>

            {/* Node 5: Human Gate */}
            <div className="bg-[#151A22] p-5 rounded-2xl border border-emerald-500/40 flex flex-col justify-between space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 font-bold">GATE</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-400">Human Review</h4>
                <p className="text-[11px] text-slate-300 mt-1">Reviewer inspects evidence to Approve/Reject</p>
              </div>
              <div className="text-[10px] font-mono text-emerald-300 font-bold">Controlled Autonomy</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. HUMAN-IN-THE-LOOP SECTION ─── */}
      <section id="human-loop" className="relative z-10 py-20 bg-[#0D1117]/60 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Core Differentiator
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                AI finds the risk. <br />
                <span className="text-emerald-400">You make the decision.</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                InvoiceGuard never automatically moves money or approves an invoice. Every flagged invoice reaches a human reviewer with the evidence, supplier context, PO comparison, and AI reasoning needed to make the final call.
              </p>

              <div className="pt-2 space-y-3 text-xs">
                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Full Evidence Transparency</p>
                    <p className="text-slate-400 text-[11px]">
                      The UI surfaces exact variances, duplicate invoice IDs, and PO line item diffs so reviewers make informed decisions in seconds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Cryptographic Human Decision Log</p>
                    <p className="text-slate-400 text-[11px]">
                      Every approval or rejection stores the reviewer's ID, reason notes, and ISO timestamp directly in SQLite.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual: Diagram Flow */}
            <div className="lg:col-span-5 bg-[#10141B] p-6 rounded-2xl border border-white/[0.1] shadow-2xl space-y-4">
              <div className="text-center font-mono text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/[0.06] pb-2">
                Controlled Autonomy Architecture
              </div>

              {/* AI Block */}
              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/[0.08] text-center space-y-1">
                <p className="text-xs font-bold text-slate-200">AI Agents</p>
                <div className="flex justify-center space-x-3 text-[10px] text-slate-400 font-mono">
                  <span>Analyze</span> &bull; <span>Validate</span> &bull; <span>Assess</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-slate-500">
                &darr;
              </div>

              {/* Human Review Gate */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1 shadow-xs">
                <p className="text-xs font-bold text-emerald-400">HUMAN REVIEW GATE</p>
                <p className="text-[10px] text-slate-300 font-mono">Status: pending_review (Locked)</p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-slate-500">
                &darr;
              </div>

              {/* Approve / Reject Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-bold text-xs">
                  APPROVE
                </div>
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-center font-bold text-xs">
                  REJECT
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 5. PRODUCT PREVIEW SECTION (Real UI from Application) ─── */}
      <section id="preview" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Interface Console
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Real Application Preview
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A live look into the InvoiceGuard operations queue and evidence review console.
          </p>
        </div>

        {/* Mock Application Window with 3D Depth */}
        <div className="max-w-4xl mx-auto bg-[#10141B] rounded-2xl border border-white/[0.12] shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Window Chrome Header */}
          <div className="px-4 py-3 bg-[#0A0D12] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">InvoiceGuard Console &bull; /invoices</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Demo Mode Active
              </span>
            </div>
          </div>

          {/* Table Preview */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold text-white">Invoice Review Queue</h3>
                <p className="text-xs text-slate-400">3 invoices pending financial authorization</p>
              </div>
              <button
                onClick={handleExploreDemo}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <span>Open in App</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Invoices List */}
            <div className="space-y-2">
              {/* Row 1: High Risk */}
              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-xs">
                    !
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-white">INV-1042</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        🔴 High Risk (75)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Acme Supplies Ltd. &bull; Matched PO #1042</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono text-white">₹84,500.00</p>
                    <p className="text-[10px] font-mono text-rose-400">+238% PO Variance</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">pending_review</span>
                </div>
              </div>

              {/* Row 2: Low Risk */}
              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-white">INV-1041</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🟢 Low Risk (0)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Nova Systems Inc. &bull; Matched PO #1041</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono text-white">₹32,400.00</p>
                    <p className="text-[10px] font-mono text-emerald-400">0.0% Variance</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">pending_review</span>
                </div>
              </div>

              {/* Row 3: Medium Risk */}
              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                    !
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-white">INV-1040</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        🟡 Medium Risk (45)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Global Corp &bull; Matched PO #1040</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono text-white">₹91,200.00</p>
                    <p className="text-[10px] font-mono text-amber-400">Duplicate Check Flag</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">pending_review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. INTERACTIVE REVIEW CONSOLE (Scenario Simulator) ─── */}
      <section id="simulator" className="relative z-10 py-16 bg-[#0D1117]/60 border-y border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Interactive Review Console
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Test Evidence Calculation Scenarios
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Switch between invoice scenarios to see how the Assess Agent calculates variances and compiles risk evidence.
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveScenario('clean')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeScenario === 'clean'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              🟢 Clean Match (PO-1041)
            </button>
            <button
              onClick={() => setActiveScenario('anomaly')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeScenario === 'anomaly'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              🔴 ₹84,500 Spike (3.38x Variance)
            </button>
            <button
              onClick={() => setActiveScenario('duplicate')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeScenario === 'duplicate'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              🔴 Duplicate Collision
            </button>
          </div>

          {/* Live Simulator Card */}
          <div className="max-w-3xl mx-auto bg-[#10141B] rounded-2xl border border-white/[0.1] shadow-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-xl font-bold font-mono text-white">{activeData.invNum}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-white/[0.1] bg-white/[0.04] text-slate-300">
                    {activeData.riskLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{activeData.vendor}</p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[10px] uppercase font-bold text-slate-500">Invoiced Amount</p>
                <p className="text-2xl font-extrabold font-mono text-white">
                  {formatCurrency(activeData.amount)}
                </p>
              </div>
            </div>

            {/* Evidence Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#0A0D12] border border-white/[0.06]">
                <p className="text-[10px] uppercase font-sans text-slate-500">Invoice Amount</p>
                <p className="text-sm font-bold text-white mt-1">{formatCurrency(activeData.amount)}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0A0D12] border border-white/[0.06]">
                <p className="text-[10px] uppercase font-sans text-slate-500">Matched PO ({activeData.poNum})</p>
                <p className="text-sm font-bold text-slate-300 mt-1">{formatCurrency(activeData.poAmount)}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0A0D12] border border-white/[0.06]">
                <p className="text-[10px] uppercase font-sans text-slate-500">Calculated Variance</p>
                <p
                  className={`text-sm font-bold mt-1 ${
                    activeData.amount > activeData.poAmount ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {activeData.variance}
                </p>
              </div>
            </div>

            {/* Finding Box */}
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
                activeData.risk === 'high'
                  ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              }`}
            >
              {activeData.risk === 'high' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-white">Agent Assessment Finding</p>
                <p className="text-[11px] opacity-90 mt-0.5">{activeData.reason}</p>
              </div>
            </div>

            {/* Decision Gate Actions */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Rule #1: Human review mandatory.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExploreDemo}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={handleExploreDemo}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. SECURITY & AUDIT SECTION ─── */}
      <section className="relative z-10 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#10141B] rounded-2xl border border-white/[0.08] p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono">
                <Lock className="w-4 h-4" />
                <span>Enterprise Governance &amp; Controls</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Built for Financial Integrity and Audit Rigor
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                InvoiceGuard enforces segregation of duties and zero autonomous money transfers. Every review decision is permanently tied to the reviewer's corporate credentials.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/[0.06]">
                <p className="text-emerald-400 font-bold">Human Approval</p>
                <p className="text-[11px] text-slate-400 mt-1">Zero auto-disbursements</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/[0.06]">
                <p className="text-emerald-400 font-bold">Audit Trail</p>
                <p className="text-[11px] text-slate-400 mt-1">Immutable SQLite log</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/[0.06]">
                <p className="text-emerald-400 font-bold">Supplier Verification</p>
                <p className="text-[11px] text-slate-400 mt-1">Historical baseline profiles</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/[0.06]">
                <p className="text-emerald-400 font-bold">3-Way PO Matching</p>
                <p className="text-[11px] text-slate-400 mt-1">2% variance bound rule</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. FINAL CTA ─── */}
      <section className="relative z-10 py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Know what's wrong before you pay.
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Review invoices with AI-powered evidence and human control.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>Get Started &rarr;</span>
          </button>
          <button
            onClick={handleExploreDemo}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#10141B] hover:bg-[#151A22] border border-white/[0.12] text-white font-semibold text-sm flex items-center justify-center space-x-2"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>Explore Demo</span>
          </button>
        </div>
      </section>

      {/* ─── MODERN FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#0A0D12] py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-200">InvoiceGuard</span>
                <p className="text-[11px] text-slate-400">AI-powered invoice intelligence.</p>
              </div>
            </div>

            <nav className="flex items-center space-x-6 text-xs text-slate-400">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <a
                href="https://github.com/saikrishna1605/invoiceguard"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>GitHub</span>
              </a>
            </nav>
          </div>

          <div className="border-t border-white/[0.06] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600">
            <p>&copy; 2026 InvoiceGuard. All rights reserved.</p>
            <p>AI analyzes. Evidence explains. Humans decide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
