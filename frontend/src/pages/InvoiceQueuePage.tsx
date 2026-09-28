import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowUpDown, 
  RefreshCw, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { invoiceApi } from '../api/invoices';
import { vendorApi } from '../api/vendors';
import type { InvoiceSummary, VendorOut } from '../api/types';
import { formatCurrency, formatDate, getRiskLevelDetails, getStatusDetails } from '../utils/formatters';
import { PageContainer } from '../components/layout/PageContainer';

export const InvoiceQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [vendors, setVendors] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'risk'>('date_desc');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invData, vendorData] = await Promise.all([
        invoiceApi.getInvoices(),
        vendorApi.getVendors().catch(() => [] as VendorOut[]),
      ]);

      const vendorMap: Record<number, string> = {};
      vendorData.forEach((v) => {
        vendorMap[v.id] = v.name;
      });
      setVendors(vendorMap);
      setInvoices(invData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      invoiceApi.getInvoices(),
      vendorApi.getVendors().catch(() => [] as VendorOut[]),
    ])
      .then(([invData, vendorData]) => {
        if (!ignore) {
          const vendorMap: Record<number, string> = {};
          vendorData.forEach((v) => {
            vendorMap[v.id] = v.name;
          });
          setVendors(vendorMap);
          setInvoices(invData);
          setError(null);
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setError(err.message || 'Failed to load invoices from backend.');
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
  }, []);

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        if (statusFilter !== 'all' && inv.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
        if (riskFilter !== 'all' && inv.risk_level.toLowerCase() !== riskFilter.toLowerCase()) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const vendorName = (inv.vendor_id ? vendors[inv.vendor_id] : '')?.toLowerCase() || '';
          const invNum = inv.invoice_number.toLowerCase();
          const invId = inv.id.toString();
          if (!invNum.includes(q) && !vendorName.includes(q) && !invId.includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'amount_desc') {
          return (b.amount || 0) - (a.amount || 0);
        }
        if (sortBy === 'amount_asc') {
          return (a.amount || 0) - (b.amount || 0);
        }
        if (sortBy === 'risk') {
          const weight: Record<string, number> = { high: 3, medium: 2, low: 1, unknown: 0 };
          return (weight[b.risk_level.toLowerCase()] || 0) - (weight[a.risk_level.toLowerCase()] || 0);
        }
        return 0;
      });
  }, [invoices, vendors, statusFilter, riskFilter, searchQuery, sortBy]);

  const pendingCount = useMemo(() => {
    return invoices.filter((i) => i.status === 'pending_review').length;
  }, [invoices]);

  const highRiskCount = useMemo(() => {
    return invoices.filter((i) => i.risk_level === 'high' && i.status === 'pending_review').length;
  }, [invoices]);

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || riskFilter !== 'all';

  return (
    <PageContainer
      title="Invoice Review Queue"
      subtitle="Financial verification console. Inspect AI extraction, risk flags, and 3-way PO match evidence."
      actions={
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs"
          >
            <span>+ Upload Invoice</span>
          </button>
        </div>
      }
    >
      {/* Quick Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-[#10141B] p-3.5 rounded-xl border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total in Queue</p>
            <p className="text-xl font-extrabold text-white font-mono mt-0.5">{invoices.length}</p>
          </div>
          <FileText className="w-6 h-6 text-slate-700" />
        </div>
        <div className="bg-[#10141B] p-3.5 rounded-xl border border-sky-500/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Pending Review</p>
            <p className="text-xl font-extrabold text-sky-400 font-mono mt-0.5">{pendingCount}</p>
          </div>
          <Clock className="w-6 h-6 text-sky-500/40" />
        </div>
        <div className="bg-[#10141B] p-3.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.02] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">High Risk Open</p>
            <p className="text-xl font-extrabold text-rose-400 font-mono mt-0.5">{highRiskCount}</p>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-500/40" />
        </div>
        <div className="bg-[#10141B] p-3.5 rounded-xl border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Approved</p>
            <p className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
              {invoices.filter((i) => i.status === 'approved').length}
            </p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500/40" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#10141B] p-3.5 rounded-xl border border-white/[0.08] mb-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by invoice # or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Filter options */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Status dropdown */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-500 text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0A0D12] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 focus:outline-hidden focus:border-emerald-500/50"
              >
                <option value="all">All Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Risk dropdown */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-500 text-[11px]">Risk:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-[#0A0D12] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 focus:outline-hidden focus:border-emerald-500/50"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">🔴 High Risk</option>
                <option value="medium">🟡 Medium Risk</option>
                <option value="low">🟢 Low Risk</option>
              </select>
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center space-x-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-[#0A0D12] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 focus:outline-hidden focus:border-emerald-500/50"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Amount: High to Low</option>
                <option value="amount_asc">Amount: Low to High</option>
                <option value="risk">Risk: Highest First</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setRiskFilter('all');
                }}
                className="inline-flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors ml-1"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#10141B] rounded-xl border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-white/[0.02] rounded-lg animate-shimmer border border-white/[0.04]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">Unable to load invoices</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-1.5 bg-white/[0.08] text-white text-xs font-semibold rounded-lg hover:bg-white/[0.12] transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No invoices found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {invoices.length === 0
                ? "No invoices processed yet. Use the upload tool or demo presets to begin."
                : "No invoices matched your filter criteria. Try resetting your search."}
            </p>
            <div className="mt-5 flex justify-center space-x-3">
              {invoices.length === 0 ? (
                <button
                  onClick={() => navigate('/upload')}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-semibold rounded-lg hover:bg-emerald-400 transition-colors shadow-xs"
                >
                  Upload First Invoice
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setRiskFilter('all');
                  }}
                  className="px-3.5 py-1.5 bg-white/[0.06] text-slate-300 text-xs font-medium rounded-lg hover:bg-white/[0.1] transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0D1117] border-b border-white/[0.08] text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4 text-right">Invoiced Amount</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Processed</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {filteredInvoices.map((inv) => {
                  const riskInfo = getRiskLevelDetails(inv.risk_level);
                  const statusInfo = getStatusDetails(inv.status);
                  const vendorName = (inv.vendor_id ? vendors[inv.vendor_id] : null) || 'Unregistered / First-time';

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="hover:bg-white/[0.025] transition-colors cursor-pointer group"
                    >
                      {/* Invoice Number */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {inv.invoice_number}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            #{inv.id}
                          </span>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium">{vendorName}</span>
                      </td>

                      {/* Amount (Right-aligned, prominent monospace) */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(inv.amount)}
                      </td>

                      {/* Risk Assessment */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${riskInfo.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${riskInfo.dotColor}`} />
                          {riskInfo.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {formatDate(inv.created_at)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center space-x-1 text-slate-400 group-hover:text-emerald-400 font-medium transition-colors">
                          <span>Review</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
