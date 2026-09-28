import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  UploadCloud, 
  ArrowRight, 
  RefreshCw, 
  BarChart3,
  Sparkles,
  Bot
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { vendorApi } from '../api/vendors';
import type { DashboardStats, AlertOut } from '../api/types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<AlertOut[]>([]);
  const [vendors, setVendors] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, alertsData, vendorsData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getAlerts(),
        vendorApi.getVendors().catch(() => []),
      ]);

      const vMap: Record<number, string> = {};
      vendorsData.forEach((v) => {
        vMap[v.id] = v.name;
      });

      setStats(statsData);
      setAlerts(alertsData);
      setVendors(vMap);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to InvoiceGuard API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getAlerts(),
      vendorApi.getVendors().catch(() => []),
    ])
      .then(([statsData, alertsData, vendorsData]) => {
        if (!ignore) {
          const vMap: Record<number, string> = {};
          vendorsData.forEach((v) => {
            vMap[v.id] = v.name;
          });
          setStats(statsData);
          setAlerts(alertsData);
          setVendors(vMap);
          setError(null);
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setError(err.message || 'Failed to connect to InvoiceGuard API.');
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

  const firstName = user ? user.name.split(' ')[0] : 'Reviewer';

  return (
    <PageContainer>
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Good evening, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as <strong className="text-slate-200">{user?.role || 'Finance Reviewer'}</strong> &bull; Autonomous multi-agent fraud screening active.
          </p>
        </div>

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
          <Link
            to="/upload"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Process Invoice</span>
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-[#10141B] rounded-xl border border-rose-500/20 p-8 text-center max-w-lg mx-auto shadow-xl">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">Backend API Unavailable</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold rounded-lg border border-white/[0.1] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-24 bg-[#10141B] rounded-xl border border-white/[0.06] animate-shimmer"
              />
            ))}
          </div>
          <div className="h-64 bg-[#10141B] rounded-xl border border-white/[0.06] animate-shimmer" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* 6 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. Total Invoices */}
            <div className="bg-[#10141B] p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between group">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Invoices
                </p>
                <p className="text-2xl font-extrabold text-white mt-1.5 font-mono">
                  {stats.total_invoices}
                </p>
              </div>
              <div className="flex items-center text-[10px] text-slate-500 mt-2">
                <FileText className="w-3 h-3 mr-1 text-slate-600" />
                <span>All records</span>
              </div>
            </div>

            {/* 2. Pending Review */}
            <div className="bg-[#10141B] p-4 rounded-xl border border-sky-500/20 hover:border-sky-500/30 transition-all flex flex-col justify-between group">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Pending Review
                </p>
                <p className="text-2xl font-extrabold text-sky-400 mt-1.5 font-mono">
                  {stats.pending_review}
                </p>
              </div>
              <div className="flex items-center text-[10px] text-sky-400/80 mt-2 font-medium">
                <Clock className="w-3 h-3 mr-1 text-sky-400 animate-pulse" />
                <span>Human gate active</span>
              </div>
            </div>

            {/* 3. High Risk Open */}
            <div className="bg-[#10141B] p-4 rounded-xl border border-rose-500/25 bg-rose-500/[0.03] hover:border-rose-500/40 transition-all flex flex-col justify-between group">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  High Risk Open
                </p>
                <p className="text-2xl font-extrabold text-rose-400 mt-1.5 font-mono">
                  {stats.high_risk_open}
                </p>
              </div>
              <div className="flex items-center text-[10px] text-rose-400/90 mt-2 font-medium">
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span>Requires sign-off</span>
              </div>
            </div>

            {/* 4. Approved */}
            <div className="bg-[#10141B] p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between group">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Approved
                </p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1.5 font-mono">
                  {stats.approved}
                </p>
              </div>
              <div className="flex items-center text-[10px] text-emerald-500/80 mt-2">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                <span>Cleared to pay</span>
              </div>
            </div>

            {/* 5. Rejected */}
            <div className="bg-[#10141B] p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between group">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Rejected
                </p>
                <p className="text-2xl font-extrabold text-slate-300 mt-1.5 font-mono">
                  {stats.rejected}
                </p>
              </div>
              <div className="flex items-center text-[10px] text-slate-500 mt-2">
                <XCircle className="w-3 h-3 mr-1" />
                <span>Failed checks</span>
              </div>
            </div>

            {/* 6. Pending Amount */}
            <div className="bg-[#10141B] p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between group">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Pending Amount
                </p>
                <p className="text-xl font-extrabold text-white mt-1.5 font-mono truncate">
                  {formatCurrency(stats.total_amount_pending)}
                </p>
              </div>
              <div className="flex items-center text-[10px] text-slate-500 mt-2">
                <DollarSign className="w-3 h-3 mr-0.5 text-slate-600" />
                <span>Under review</span>
              </div>
            </div>
          </div>

          {/* High-Risk Invoices Requiring Review */}
          <div className="bg-[#10141B] rounded-xl border border-white/[0.08] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <h3 className="font-bold text-white text-sm">
                    High-Risk Invoices Requiring Human Review
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {alerts.length} Pending
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Critical anomalies flagged by the Assess Agent pipeline. Payment release is blocked until reviewed.
                </p>
              </div>
              <Link
                to="/invoices"
                className="text-xs font-medium text-slate-400 hover:text-white flex items-center space-x-1 transition-colors"
              >
                <span>View Full Queue</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {alerts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
                <p className="font-medium text-slate-300">All Caught Up</p>
                <p className="text-slate-500 mt-0.5">
                  Zero high-risk items currently pending human decision.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {alerts.map((alert) => {
                  const vendorName =
                    (alert.vendor_id ? vendors[alert.vendor_id] : null) || 'Unregistered Vendor';
                  return (
                    <div
                      key={alert.invoice_id}
                      onClick={() => navigate(`/invoices/${alert.invoice_id}`)}
                      className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white group-hover:text-rose-400 transition-colors">
                            {alert.invoice_number}
                          </span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-xs text-slate-300 font-medium truncate max-w-xs">
                            {vendorName}
                          </span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-xs font-mono font-bold text-white">
                            {formatCurrency(alert.amount)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatDate(alert.created_at)}
                          </span>
                        </div>

                        {/* Flags List */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {alert.flags.map((flag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded flex items-center space-x-1"
                            >
                              <span className="w-1 h-1 rounded-full bg-rose-400"></span>
                              <span>{flag}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invoices/${alert.invoice_id}`);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lower Grid: Risk Flag Distribution & Controlled Autonomy Principle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Risk Flag Breakdown */}
            <div className="bg-[#10141B] rounded-xl border border-white/[0.08] p-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-white/[0.08] mb-4">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Top Risk Flag Breakdown
                </h3>
              </div>

              {Object.keys(stats.flagged_reasons || {}).length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">
                  No risk flags registered across pending invoices.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.flagged_reasons).map(([reason, count]) => {
                    const totalFlags = Object.values(stats.flagged_reasons).reduce((a, b) => a + b, 0);
                    const pct = totalFlags > 0 ? Math.round((count / totalFlags) * 100) : 0;
                    return (
                      <div key={reason} className="text-xs">
                        <div className="flex justify-between font-medium text-slate-300 mb-1">
                          <span className="truncate pr-2">{reason}</span>
                          <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Controlled Autonomy Philosophy Card */}
            <div className="bg-[#10141B] rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 pb-3 border-b border-white/[0.08] mb-4">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                    Controlled Autonomy Architecture
                  </h3>
                </div>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <p className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Analyzes &amp; Explains</span>
                    </p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Extract Agent pulls line items, Retrieve Agent correlates POs and supplier history, and Assess Agent grades anomaly probability.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <p className="font-semibold text-white flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                      <span>Human Decides &amp; Approves</span>
                    </p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      The system strictly never auto-approves disbursements. The financial reviewer reviews the exact evidence before clicking Approve or Reject.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between">
                <Link
                  to="/upload"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 transition-colors"
                >
                  <span>Test demo invoice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/vendors"
                  className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Supplier registry &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
};
