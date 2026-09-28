import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Bot, 
  X,
  Play
} from 'lucide-react';
import { invoiceApi } from '../api/invoices';
import { DEMO_PRESETS, type DemoPreset } from '../utils/demoPresets';
import { PageContainer } from '../components/layout/PageContainer';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  // Mode: 'presets' | 'file' | 'text'
  const [activeTab, setActiveTab] = useState<'presets' | 'file' | 'text'>('presets');

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Raw text state
  const [rawText, setRawText] = useState(DEMO_PRESETS[0].rawText);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEMO_PRESETS[0].id);

  // Pipeline execution state
  const [processing, setProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pipelineSteps = [
    { name: 'Extract Agent', desc: 'Parsing raw text / OCR for vendor, amount, and line items' },
    { name: 'Retrieve Agent', desc: 'Correlating PO, checking vendor history, and looking up supplier KB' },
    { name: 'Validate Agent', desc: 'Verifying 2% amount tolerance, line items, and approval status' },
    { name: 'Assess Agent', desc: 'Computing dynamic anomaly multipliers and risk scoring' },
    { name: 'Monitor Agent', desc: 'Raising high-risk queue alerts and recording agent audit trail' },
  ];

  const handlePresetSelect = (preset: DemoPreset) => {
    setSelectedPresetId(preset.id);
    setRawText(preset.rawText);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMessage(null);
    }
  };

  const runPipelineWithVisualizer = async (action: () => Promise<any>) => {
    setProcessing(true);
    setActiveStep(0);
    setErrorMessage(null);

    // Step animation interval to show reviewer the real pipeline stages
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 450);

    try {
      const result = await action();
      clearInterval(stepInterval);
      setActiveStep(5); // Complete

      setTimeout(() => {
        navigate(`/invoices/${result.id}`);
      }, 700);
    } catch (err: any) {
      clearInterval(stepInterval);
      setProcessing(false);
      setErrorMessage(err.message || 'Pipeline processing failed.');
    }
  };

  const handleSubmitText = () => {
    if (!rawText.trim()) {
      setErrorMessage('Please provide invoice text to process.');
      return;
    }
    runPipelineWithVisualizer(() => invoiceApi.submitInvoiceText(rawText));
  };

  const handleSubmitFile = () => {
    if (!selectedFile) {
      setErrorMessage('Please choose or drop an invoice file first.');
      return;
    }
    runPipelineWithVisualizer(() => invoiceApi.uploadInvoice(selectedFile));
  };

  return (
    <PageContainer
      title="Process New Invoice"
      subtitle="Feed an invoice into the autonomous multi-agent pipeline for fraud screening and 3-way PO verification."
    >
      <div className="max-w-4xl mx-auto">
        {/* Tab Selection */}
        <div className="flex border-b border-white/[0.08] mb-6 space-x-6">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'presets'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Test Scenarios (Recommended)</span>
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'file'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload File (PDF / TXT)</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'text'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Raw Text</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Execution Error</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Tab 1: Interactive Demo Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-6">
            <div className="bg-[#10141B] border border-white/[0.08] rounded-xl p-4 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Pre-Loaded Synthetic Test Scenarios</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Select any benchmark case to demonstrate specific risk paths (clean match, duplicate detection, historical anomaly, or unapproved supplier holds).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {DEMO_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500/60 bg-[#151A22] ring-1 ring-emerald-500/30 shadow-lg'
                        : 'border-white/[0.08] bg-[#10141B] hover:border-white/[0.15] hover:bg-[#151A22]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white">{preset.title}</span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            preset.expectedRisk === 'high'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          }`}
                        >
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-300 mb-1">Supplier: {preset.vendor}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{preset.description}</p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-slate-500">
                        {isSelected ? '✓ Selected' : 'Click to select'}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                          <span>Ready to execute</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Scenario Raw Preview */}
            <div className="bg-[#10141B] rounded-xl border border-white/[0.08] p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Payload Inspection (POST /invoices/submit-text)
                </span>
                <span className="text-[10px] font-mono text-slate-500">FastAPI Pipeline Target</span>
              </div>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-[#0A0D12] text-emerald-400 rounded-lg border border-white/[0.08] focus:outline-hidden focus:border-emerald-500/40"
              />
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSubmitText}
                  disabled={processing}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Execute Multi-Agent Pipeline</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: File Upload */}
        {activeTab === 'file' && (
          <div className="space-y-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-14 text-center transition-all bg-[#10141B] ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-500/[0.04] ring-2 ring-emerald-500/20'
                  : 'border-white/[0.12] hover:border-white/[0.25]'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white">
                Drop your invoice document here
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
                Supports PDF documents (with text layer or OCR fallback) and text invoices.
              </p>

              <label className="inline-flex items-center space-x-2 px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-lg text-xs font-semibold cursor-pointer border border-white/[0.1] transition-colors">
                <span>Browse Local Files</span>
                <input
                  type="file"
                  accept=".pdf,.txt,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {selectedFile && (
              <div className="bg-[#10141B] p-4 rounded-xl border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-mono">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type || 'Document'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSubmitFile}
                    disabled={processing}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Process Invoice</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Paste Raw Text */}
        {activeTab === 'text' && (
          <div className="bg-[#10141B] rounded-xl border border-white/[0.08] p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Custom Invoice Raw Text
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Paste any unstructured text containing Invoice Number, Vendor, Due Date, and line items.
              </p>
              <textarea
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Invoice Number: INV-001&#10;Vendor: Acme Corp&#10;Total Amount Due: $500.00"
                className="w-full p-3 font-mono text-xs bg-[#0A0D12] text-emerald-400 rounded-lg border border-white/[0.08] focus:outline-hidden focus:border-emerald-500/40"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmitText}
                disabled={processing}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Process Raw Text</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cinematic Agent Pipeline Execution Modal */}
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-[#10141B] rounded-2xl shadow-2xl max-w-md w-full border border-white/[0.12] p-6 space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Executing Multi-Agent Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Extracting fields &bull; Correlating PO &bull; Computing risk score
              </p>
            </div>

            {/* Step list */}
            <div className="space-y-2.5">
              {pipelineSteps.map((step, idx) => {
                const isFinished = activeStep > idx;
                const isCurrent = activeStep === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-xs transition-all duration-200 ${
                      isFinished
                        ? 'bg-emerald-500/[0.05] border-emerald-500/25 text-emerald-300'
                        : isCurrent
                        ? 'bg-sky-500/[0.08] border-sky-500/40 text-sky-200 ring-1 ring-sky-500/30'
                        : 'bg-white/[0.02] border-white/[0.05] text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="shrink-0">
                      {isFinished ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-[11px]">{step.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-[#0A0D12] rounded-xl border border-white/[0.06] text-[11px] text-slate-400 text-center">
              Mandatory outcome: Status lands at <strong className="text-sky-400 font-mono">pending_review</strong> for human sign-off.
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
