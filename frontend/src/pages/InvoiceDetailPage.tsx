import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Building2, 
  Receipt, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Bot, 
  Sparkles, 
  Scale, 
  Calendar,
  Check,
  RefreshCw
} from 'lucide-react';
import { invoiceApi } from '../api/invoices';
import { vendorApi } from '../api/vendors';
import type { InvoiceOut } from '../api/types';
import { formatCurrency, formatDate, getRiskLevelDetails, getStatusDetails } from '../utils/formatters';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [invoice, setInvoice] = useState<InvoiceOut | null>(null);
  const [vendorName, setVendorName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const currentUserLabel = user ? `${user.name} (${user.role})` : 'Reviewer';

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState<{
    open: boolean;
    type: 'approved' | 'rejected';
    decidedBy: string;
    note: string;
    submitting: boolean;
    error: string | null;
  }>({
    open: false,
    type: 'approved',
    decidedBy: currentUserLabel,
    note: '',
    submitting: false,
    error: null,
  });

  // Collapsible Audit Trail
  const [auditExpanded, setAuditExpanded] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const inv = await invoiceApi.getInvoice(Number(id));
      setInvoice(inv);
      setError(null);

      // Resolve vendor name
      if (inv.extracted_data?.vendor_name) {
        setVendorName(inv.extracted_data.vendor_name);
      } else if (inv.vendor_id) {
        try {
          const vendors = await vendorApi.getVendors();
          const found = vendors.find((v) => v.id === inv.vendor_id);
          if (found) setVendorName(found.name);
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    if (!id) return;

    invoiceApi.getInvoice(Number(id))
      .then(async (inv) => {
        if (!ignore) {
          setInvoice(inv);
          setError(null);

          if (inv.extracted_data?.vendor_name) {
            setVendorName(inv.extracted_data.vendor_name);
          } else if (inv.vendor_id) {
            try {
              const vendors = await vendorApi.getVendors();
              if (!ignore) {
                const found = vendors.find((v) => v.id === inv.vendor_id);
                if (found) setVendorName(found.name);
              }
            } catch {
              // ignore
            }
          }
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setError(err.message || 'Failed to load invoice details.');
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleOpenDecision = (type: 'approved' | 'rejected') => {
    setDecisionModal({
      open: true,
      type,
      decidedBy: currentUserLabel,
      note: type === 'rejected' ? 'Validation issues detected; requires vendor clarification.' : 'Verified line items and match against authorized PO.',
      submitting: false,
      error: null,
    });
  };

  const handleSubmitDecision = async () => {
    if (!invoice) return;
    setDecisionModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      let updated: InvoiceOut;
      if (decisionModal.type === 'approved') {
        updated = await invoiceApi.approveInvoice(invoice.id, {
          decided_by: decisionModal.decidedBy.trim() || 'Reviewer',
          note: decisionModal.note.trim() || undefined,
        });
      } else {
        updated = await invoiceApi.rejectInvoice(invoice.id, {
          decided_by: decisionModal.decidedBy.trim() || 'Reviewer',
          note: decisionModal.note.trim() || undefined,
        });
      }
      setInvoice(updated);
      setDecisionModal((prev) => ({ ...prev, open: false, submitting: false }));
      setSuccessToast(
        decisionModal.type === 'approved'
          ? `Invoice ${invoice.invoice_number} approved successfully.`
          : `Invoice ${invoice.invoice_number} rejected.`
      );
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      setDecisionModal((prev) => ({
        ...prev,
        submitting: false,
        error: err.message || 'Failed to apply decision.',
      }));
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading invoice inspection console...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !invoice) {
    return (
      <PageContainer>
        <div className="max-w-md mx-auto py-20 text-center">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white">Invoice not found</h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">{error || 'This invoice record could not be retrieved.'}</p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={fetchInvoice}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <Link
              to="/invoices"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-lg text-xs font-semibold border border-white/[0.1] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Queue</span>
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const riskInfo = getRiskLevelDetails(invoice.risk_level);
  const statusInfo = getStatusDetails(invoice.status);
  const isPending = invoice.status === 'pending_review';

  const extracted = invoice.extracted_data || {};
  const validation = invoice.validation_result || { passed: true, issues: [], checks: {} };
  const assessment = invoice.assessment_result || { risk_score: 0, risk_level: 'unknown', flags: [] };
  const context = invoice.retrieval_context || {};
  const supplierProfile = context.supplier_profile;
  const lineItems = extracted.line_items || [];
  const poAmount = context.matched_po_amount;
  const invAmount = invoice.amount || 0;
  const amountDiff = poAmount !== undefined && poAmount !== null ? invAmount - poAmount : null;

  return (
    <PageContainer>
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#151A22] border border-emerald-500/30 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <Link
          to="/invoices"
          className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Invoice Queue</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-500">
          Record #{invoice.id} &bull; Processed: {formatDate(invoice.created_at)}
        </span>
      </div>

      {/* Controlled Autonomy Policy Banner */}
      <div className="mb-6 bg-[#10141B] border border-white/[0.08] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white tracking-wide flex items-center space-x-2">
              <span>Controlled Autonomy Protocol</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                AI Analyzes &bull; Human Decides
              </span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              The AI pipeline extracts and correlates fraud indicators, but <strong className="text-slate-200">never moves money automatically</strong>. The reviewer makes the definitive sign-off.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center space-x-2">
          {isPending ? (
            <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Awaiting Review</span>
            </span>
          ) : invoice.status === 'approved' ? (
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved</span>
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
            </span>
          )}
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="bg-[#10141B] rounded-xl border border-white/[0.08] p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-white/[0.08] gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                {invoice.invoice_number}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${riskInfo.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${riskInfo.dotColor}`} />
                {riskInfo.label}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badgeClass}`}
              >
                {statusInfo.label}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-slate-300 text-xs font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{vendorName || extracted.vendor_name || 'Unassigned Supplier'}</span>
              {extracted.po_number && (
                <>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-slate-400 font-mono">PO: {extracted.po_number}</span>
                </>
              )}
            </div>
          </div>

          {/* Amount Display */}
          <div className="flex flex-col lg:items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Invoiced
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight mt-0.5">
              {formatCurrency(invoice.amount)}
            </span>
            {extracted.due_date && (
              <span className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Due Date: {extracted.due_date}</span>
              </span>
            )}
          </div>
        </div>

        {/* Human Action Bar (Approve / Reject) */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {isPending ? (
              <p className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Review the evidence below before executing approval or rejection.</span>
              </p>
            ) : invoice.status === 'approved' ? (
              <p className="text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Approved by <strong className="text-white">{invoice.decided_by || 'Reviewer'}</strong> on{' '}
                  {formatDate(invoice.decided_at)}
                </span>
              </p>
            ) : (
              <p className="text-rose-400 flex items-center space-x-1.5">
                <XCircle className="w-4 h-4" />
                <span>
                  Rejected by <strong className="text-white">{invoice.decided_by || 'Reviewer'}</strong> on{' '}
                  {formatDate(invoice.decided_at)}
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleOpenDecision('rejected')}
              disabled={!isPending}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isPending
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-white/[0.02] text-slate-600 border border-white/[0.04] cursor-not-allowed'
              }`}
            >
              Reject Invoice
            </button>
            <button
              onClick={() => handleOpenDecision('approved')}
              disabled={!isPending}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                isPending
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                  : 'bg-white/[0.04] text-slate-600 border border-white/[0.04] cursor-not-allowed'
              }`}
            >
              Approve Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Main Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2 Cols: Evidence-First Risk Findings, PO Comparison, Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Evidence-First Risk Findings */}
          <div className="bg-[#10141B] rounded-xl border border-white/[0.08] p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className={`w-4 h-4 ${riskInfo.textColor}`} />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Risk Assessment &amp; Flagged Evidence
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Score:</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${riskInfo.badgeClass}`}>
                  {assessment.risk_score} / 100
                </span>
              </div>
            </div>

            {/* Evidence Callouts */}
            {amountDiff !== null && Math.abs(amountDiff) > 0.01 && (
              <div className="grid grid-cols-3 gap-3 p-3.5 mb-4 rounded-lg bg-[#0A0D12] border border-white/[0.08] text-xs font-mono">
                <div>
                  <p className="text-[10px] uppercase font-sans text-slate-500">Invoice Total</p>
                  <p className="text-white font-bold text-sm mt-0.5">{formatCurrency(invAmount)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-sans text-slate-500">Matched PO Total</p>
                  <p className="text-slate-300 font-bold text-sm mt-0.5">{formatCurrency(poAmount)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-sans text-slate-500">Variance</p>
                  <p
                    className={`font-bold text-sm mt-0.5 ${
                      amountDiff > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {amountDiff > 0 ? `+${formatCurrency(amountDiff)}` : formatCurrency(amountDiff)}
                  </p>
                </div>
              </div>
            )}

            {/* Flags List */}
            {assessment.flags && assessment.flags.length > 0 ? (
              <div className="space-y-2">
                {assessment.flags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 p-3 rounded-lg bg-rose-500/[0.04] border border-rose-500/20 text-xs text-rose-300"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-200">{flag}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/20 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero risk indicators detected. All automated verification tests passed.</span>
              </div>
            )}
          </div>

          {/* Section 2: 3-Way PO Matching Comparison */}
          <div className="bg-[#10141B] rounded-xl border border-white/[0.08] p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  3-Way Purchase Order Verification
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  validation.passed
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {validation.passed ? '✓ Tolerance Passed' : '⚠ Discrepancy Found'}
              </span>
            </div>

            {/* Comparison Side-by-side Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-lg bg-[#0A0D12] border border-white/[0.06] text-xs space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Extracted Invoice
                </p>
                <p className="text-base font-bold font-mono text-white">
                  {formatCurrency(invoice.amount)}
                </p>
                <p className="text-[11px] text-slate-400">{lineItems.length} line item(s)</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0A0D12] border border-white/[0.06] text-xs space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Matched PO ({context.matched_po_number || 'None'})
                </p>
                <p className="text-base font-bold font-mono text-slate-300">
                  {context.matched_po_amount ? formatCurrency(context.matched_po_amount) : 'No PO'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Method: {context.po_match_method || 'N/A'}
                </p>
              </div>
            </div>

            {/* Validation discrepancies list */}
            {validation.issues && validation.issues.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {validation.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-amber-500/[0.04] border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Extracted Line Items */}
          <div className="bg-[#10141B] rounded-xl border border-white/[0.08] p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Extracted Line Items
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Engine: {extracted.extraction_method || 'deterministic'}
              </span>
            </div>

            {lineItems.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                No individual line items parsed from invoice text. Total amount was extracted directly.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {lineItems.map((item, idx) => {
                      const itemTotal = item.qty * item.unit_price;
                      return (
                        <tr key={idx} className="hover:bg-white/[0.015]">
                          <td className="py-2.5 px-3 font-medium text-slate-200">{item.description}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">{item.qty}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                            {formatCurrency(itemTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/[0.08] font-bold text-white">
                      <td colSpan={3} className="py-3 px-3 text-right text-slate-400">
                        Invoice Total:
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                        {formatCurrency(invoice.amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Supplier Master Profile, Extracted Attributes, Collapsible Agent Timeline */}
        <div className="space-y-6">
          {/* Supplier Knowledge Base Card */}
          <div className="bg-[#10141B] rounded-xl border border-white/[0.08] p-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/[0.08] mb-4">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                Supplier Profile Context
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Supplier Name</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="font-semibold text-white">{vendorName || extracted.vendor_name || 'Unknown'}</span>
                  {context.vendor_approved ? (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                      ⚠ Unapproved
                    </span>
                  )}
                </div>
              </div>

              {supplierProfile ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">Payment Terms</p>
                      <p className="font-mono text-slate-300 mt-0.5">{supplierProfile.payment_terms || 'Standard'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">Preferred Method</p>
                      <p className="font-mono text-slate-300 mt-0.5">{supplierProfile.preferred_payment_method || 'ACH'}</p>
                    </div>
                  </div>

                  {supplierProfile.category && (
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">Business Category</p>
                      <p className="text-slate-300 mt-0.5">{supplierProfile.category}</p>
                    </div>
                  )}

                  {supplierProfile.policy_notes && (
                    <div className="p-3 rounded-lg bg-[#0A0D12] border border-white/[0.08]">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Procurement Policy Note
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {supplierProfile.policy_notes}
                      </p>
                    </div>
                  )}

                  {supplierProfile.risk_notes && (
                    <div className="p-3 rounded-lg bg-amber-500/[0.03] border border-amber-500/20">
                      <p className="text-[10px] uppercase font-bold text-amber-400 mb-1">
                        Vendor History Note
                      </p>
                      <p className="text-[11px] text-amber-300/90 leading-relaxed">
                        {supplierProfile.risk_notes}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">
                  No pre-configured profile found in knowledge base. Treated as external first-time vendor.
                </p>
              )}
            </div>
          </div>

          {/* Extracted Attributes Card */}
          <div className="bg-[#10141B] rounded-xl border border-white/[0.08] p-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/[0.08] mb-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                Document Attributes
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <p className="text-[10px] text-slate-500">Invoice Number</p>
                <p className="font-mono text-slate-200">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Cited PO Reference</p>
                <p className="font-mono text-slate-200">{extracted.po_number || 'None cited'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Invoice Due Date</p>
                <p className="text-slate-200">{extracted.due_date || 'Not stated'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Extraction Method</p>
                <p className="font-mono text-slate-300 flex items-center space-x-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{extracted.extraction_method || 'deterministic_fallback'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Collapsible Agent Pipeline Timeline */}
          <div className="bg-[#10141B] rounded-xl border border-white/[0.08] overflow-hidden">
            <button
              onClick={() => setAuditExpanded(!auditExpanded)}
              className="w-full flex items-center justify-between p-4 bg-[#0D1117] hover:bg-[#151A22] transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Agent Execution Timeline
                </span>
                <span className="text-[10px] bg-white/[0.08] text-slate-300 px-1.5 py-0.2 rounded-full font-mono font-semibold">
                  {invoice.audit_logs?.length || 0}
                </span>
              </div>
              {auditExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {auditExpanded && (
              <div className="p-4 border-t border-white/[0.08] max-h-96 overflow-y-auto space-y-4">
                {(!invoice.audit_logs || invoice.audit_logs.length === 0) ? (
                  <p className="text-xs text-slate-500">No audit log records for this invoice.</p>
                ) : (
                  invoice.audit_logs.map((log, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-emerald-500/40 pl-3 py-0.5 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-[11px]">{log.agent_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{formatDate(log.timestamp)}</span>
                      </div>
                      <p className="text-emerald-400 font-medium text-[11px]">{log.action}</p>
                      {log.detail && Object.keys(log.detail).length > 0 && (
                        <pre className="text-[10px] bg-[#0A0D12] text-slate-300 p-2 rounded-lg mt-1 overflow-x-auto font-mono border border-white/[0.04]">
                          {JSON.stringify(log.detail, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Confirmation Modal */}
      {decisionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#10141B] rounded-2xl shadow-2xl max-w-md w-full border border-white/[0.12] overflow-hidden">
            <div
              className={`p-4 border-b ${
                decisionModal.type === 'approved'
                  ? 'border-emerald-500/30 bg-emerald-500/[0.05]'
                  : 'border-rose-500/30 bg-rose-500/[0.05]'
              }`}
            >
              <div className="flex items-center space-x-2">
                {decisionModal.type === 'approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <h3 className="font-bold text-base text-white">
                  {decisionModal.type === 'approved' ? 'Confirm Invoice Approval' : 'Confirm Invoice Rejection'}
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-[#0A0D12] p-3.5 rounded-xl border border-white/[0.08] space-y-1">
                <p className="text-slate-500 text-[10px] uppercase font-bold">Target Invoice</p>
                <p className="text-sm font-bold text-white font-mono">
                  {invoice.invoice_number} &bull; {formatCurrency(invoice.amount)}
                </p>
                <p className="text-slate-400">
                  Supplier: <strong className="text-slate-200">{vendorName || extracted.vendor_name || 'Unknown'}</strong>
                </p>
              </div>

              {decisionModal.error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
                  {decisionModal.error}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reviewer Name / Department <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={decisionModal.decidedBy}
                  onChange={(e) =>
                    setDecisionModal((prev) => ({ ...prev, decidedBy: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Audit Decision Note
                </label>
                <textarea
                  rows={3}
                  value={decisionModal.note}
                  onChange={(e) =>
                    setDecisionModal((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Record why this invoice was approved or rejected for future compliance auditing..."
                  className="w-full px-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="p-4 bg-[#0D1117] border-t border-white/[0.08] flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setDecisionModal((prev) => ({ ...prev, open: false }))}
                disabled={decisionModal.submitting}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitDecision}
                disabled={decisionModal.submitting || !decisionModal.decidedBy.trim()}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  decisionModal.type === 'approved'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                } ${decisionModal.submitting ? 'opacity-60 cursor-wait' : ''}`}
              >
                {decisionModal.submitting
                  ? 'Recording decision...'
                  : decisionModal.type === 'approved'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
