import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, Scale, UserCheck, AlertTriangle, FileCode } from 'lucide-react';
import { StarfieldBackground } from '../components/3d/StarfieldBackground';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#F5F7FA] font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-hidden flex flex-col justify-between">
      <StarfieldBackground />

      {/* Atmospheric lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/[0.08] bg-[#0A0D12]/80 backdrop-blur-md">
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
          <span className="font-bold text-xs tracking-tight text-white">InvoiceGuard Terms of Use</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 bg-[#10141B]/90 border border-white/[0.08] rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          
          <div className="space-y-2 border-b border-white/[0.08] pb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
              <span>HACKATHON EVALUATION TERMS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
            <p className="text-xs text-slate-400">
              Last updated: September 28, 2026 &bull; GIBC V2 Hackathon Prototype Guidelines
            </p>
          </div>

          {/* Section 1: Prototype Purpose */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>1. Permitted Evaluation Use</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              InvoiceGuard is provided as an experimental, open-source technology demonstration for evaluating autonomous multi-agent systems in corporate accounts payable workflows. It is intended solely for research, testing, and educational review.
            </p>
          </section>

          {/* Section 2: Human Decision Gate */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-sky-400" />
              <span>2. Human-in-the-Loop Requirement</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              InvoiceGuard strictly adheres to the principle of <em>Controlled Autonomy</em>: AI agents analyze invoices, extract line items, calculate purchase order variances, and highlight anomalous historical trends, but human review is mandatory before any financial decision is finalized.
            </p>
          </section>

          {/* Section 3: Disclaimers & Accuracy */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>3. Disclaimers &amp; Limitation of Liability</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              While InvoiceGuard implements rigorous 3-way reconciliation (2% variance thresholds) and adaptive supplier anomaly detection, the software is provided &ldquo;as is&rdquo; without warranty of any kind. AI risk assessments should never replace professional financial audit processes.
            </p>
          </section>

          {/* Section 4: Open Source */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>4. Open Source Attribution</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Source code, agent definitions, and documentation are publicly available on GitHub under the MIT license at{' '}
              <a
                href="https://github.com/saikrishna1605/invoiceguard"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline"
              >
                https://github.com/saikrishna1605/invoiceguard
              </a>.
            </p>
          </section>

          {/* Section 5: Acceptance */}
          <section className="space-y-2 border-t border-white/[0.08] pt-6 text-xs text-slate-400">
            <p>
              By accessing the InvoiceGuard web console or API endpoints, you acknowledge the synthetic prototype nature of all underlying records.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-500 border-t border-white/[0.08] bg-[#0A0D12]">
        &copy; 2026 InvoiceGuard Inc. AI analyzes. Evidence explains. Humans decide.
      </footer>
    </div>
  );
};
