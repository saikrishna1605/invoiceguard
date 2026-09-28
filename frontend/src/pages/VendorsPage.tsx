import React, { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Plus, 
  RefreshCw, 
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';
import { vendorApi } from '../api/vendors';
import type { VendorOut } from '../api/types';
import { formatCurrency } from '../utils/formatters';
import { PageContainer } from '../components/layout/PageContainer';

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<VendorOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Vendor Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [approved, setApproved] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vendorApi.getVendors();
      setVendors(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    vendorApi.getVendors()
      .then((data) => {
        if (!ignore) {
          setVendors(data);
          setError(null);
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setError(err.message || 'Failed to load vendors');
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await vendorApi.createVendor({
        name: name.trim(),
        approved,
      });
      setName('');
      setApproved(true);
      setModalOpen(false);
      fetchVendors();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create vendor');
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageContainer
      title="Approved Suppliers &amp; Vendors"
      subtitle="Supplier master records, historical invoice averages, and adaptive fraud baseline thresholds."
      actions={
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setLoading(true);
              fetchVendors();
            }}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supplier</span>
          </button>
        </div>
      }
    >
      {/* Dynamic Baseline Info Card */}
      <div className="mb-6 bg-[#10141B] p-4 rounded-xl border border-white/[0.08] flex items-start space-x-3 text-xs">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-white">Dynamic Anomaly Baselines</p>
          <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
            Every time a human reviewer approves an invoice, the system adapts: the supplier's average amount and invoice count automatically recalculate. The Assess Agent uses this live baseline to detect anomalous spikes exceeding the 2.5x threshold.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#10141B] rounded-xl border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-white/[0.02] rounded-lg animate-shimmer border border-white/[0.04]" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-400">
            {error}
          </div>
        ) : vendors.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No suppliers registered in master database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0D1117] border-b border-white/[0.08] text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Supplier Company</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4">Historical Approvals</th>
                  <th className="py-3 px-4 text-right">Average Invoiced</th>
                  <th className="py-3 px-4 text-right">Vendor ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white font-bold text-xs">
                          {v.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{v.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {v.approved ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                          <XCircle className="w-3 h-3 mr-1 text-rose-400" />
                          Unapproved / Hold
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {v.invoice_count} approved
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatCurrency(v.avg_invoice_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      #{v.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#10141B] rounded-2xl shadow-2xl max-w-md w-full border border-white/[0.12] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Register New Supplier</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Industrial Supplies"
                  className="w-full px-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="approvedCheck"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
                />
                <label htmlFor="approvedCheck" className="text-slate-300 font-medium">
                  Mark as Approved Supplier in Master Registry
                </label>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 font-medium hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !name.trim()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  {creating ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
