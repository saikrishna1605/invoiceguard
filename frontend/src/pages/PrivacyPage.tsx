import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, Lock, Database, EyeOff, Server } from 'lucide-react';
import { StarfieldBackground } from '../components/3d/StarfieldBackground';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#F5F7FA] font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-hidden flex flex-col justify-between">
      <StarfieldBackground />

      {/* Atmospheric lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

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
          <span className="font-bold text-xs tracking-tight text-white">InvoiceGuard Privacy Policy</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 bg-[#10141B]/90 border border-white/[0.08] rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          
          <div className="space-y-2 border-b border-white/[0.08] pb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span>PROTOTYPE TRANSPARENCY NOTICE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-400">
              Last updated: September 28, 2026 &bull; Designed for GIBC V2 Hackathon Evaluation
            </p>
          </div>

          {/* Section 1: Overview */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>1. Overview &amp; Prototype Context</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              InvoiceGuard is an autonomous invoice verification and fraud detection prototype built for demonstration and evaluation purposes. This policy describes how data submitted to the application is handled, processed, and stored during your evaluation session.
            </p>
          </section>

          {/* Section 2: Data Processed */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-sky-400" />
              <span>2. Types of Data Processed</span>
            </h2>
            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                <strong className="text-white">Invoice Information:</strong> Text and PDF documents uploaded or submitted via the interface. All pre-seeded and demo records in this platform utilize synthetic, de-identified vendor and purchase order numbers.
              </li>
              <li>
                <strong className="text-white">Local Authentication Sessions:</strong> User names and email addresses provided during registration or demo persona selection are stored solely in your browser's <code className="text-emerald-400 bg-white/[0.05] px-1 py-0.5 rounded font-mono">localStorage</code>.
              </li>
              <li>
                <strong className="text-white">Review Decisions:</strong> Reviewer signatures (<code className="text-slate-300 bg-white/[0.05] px-1 py-0.5 rounded font-mono">decided_by</code>) and optional approval/rejection notes recorded into the backend SQLite audit log table for provenance tracking.
              </li>
            </ul>
          </section>

          {/* Section 3: No Tracking or Analytics Cookies */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span>3. Zero Tracking &amp; Analytics Cookies</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              InvoiceGuard respects user privacy. This application does not use third-party analytics cookies, advertising pixels, or cross-site tracking scripts. Only local browser storage strictly necessary for authentication and session persistence is utilized.
            </p>
          </section>

          {/* Section 4: Backend Processing & Payments Disclaimer */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>4. Zero Real Payment Processing</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              InvoiceGuard never connects to real banking networks or moves corporate funds. Under our <em>Controlled Autonomy</em> philosophy, invoices remain in <code className="text-sky-400 bg-white/[0.05] px-1 py-0.5 rounded font-mono">pending_review</code> until human authorization. Approvals and rejections are recorded strictly within the local demonstration database.
            </p>
          </section>

          {/* Section 5: Contact */}
          <section className="space-y-2 border-t border-white/[0.08] pt-6 text-xs text-slate-400">
            <p>
              For technical inquiries or repository inspection, please visit our official GitHub repository at{' '}
              <a
                href="https://github.com/saikrishna1605/invoiceguard"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline"
              >
                github.com/saikrishna1605/invoiceguard
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-500 border-t border-white/[0.08] bg-[#0A0D12]">
        &copy; 2026 InvoiceGuard Inc. Built for autonomous financial operations review.
      </footer>
    </div>
  );
};
