import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  RefreshCw, 
  FileCheck2, 
  ChevronRight, 
  X
} from 'lucide-react';
import { purchaseOrderApi } from '../api/purchaseOrders';
import { vendorApi } from '../api/vendors';
import type { PurchaseOrderOut, LineItem, VendorOut } from '../api/types';
import { formatCurrency } from '../utils/formatters';
import { PageContainer } from '../components/layout/PageContainer';

export const PurchaseOrdersPage: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrderOut[]>([]);
  const [vendors, setVendors] = useState<Record<number, string>>({});
  const [vendorList, setVendorList] = useState<VendorOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Line items inspection modal
  const [selectedPo, setSelectedPo] = useState<PurchaseOrderOut | null>(null);

  // Create PO Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [poNumber, setPoNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', qty: 1, unit_price: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [poData, vendorData] = await Promise.all([
        purchaseOrderApi.getPurchaseOrders(),
        vendorApi.getVendors().catch(() => [] as VendorOut[]),
      ]);

      const vMap: Record<number, string> = {};
      vendorData.forEach((v) => {
        vMap[v.id] = v.name;
      });

      setPos(poData);
      setVendors(vMap);
      setVendorList(vendorData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      purchaseOrderApi.getPurchaseOrders(),
      vendorApi.getVendors().catch(() => [] as VendorOut[]),
    ])
      .then(([poData, vendorData]) => {
        if (!ignore) {
          const vMap: Record<number, string> = {};
          vendorData.forEach((v) => {
            vMap[v.id] = v.name;
          });
          setPos(poData);
          setVendors(vMap);
          setVendorList(vendorData);
          setError(null);
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setError(err.message || 'Failed to load purchase orders');
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

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', qty: 1, unit_price: 0 }]);
  };

  const handleRemoveLineItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleLineItemChange = (idx: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    (updated[idx] as any)[field] = value;
    setLineItems(updated);

    const total = updated.reduce((sum, item) => sum + (item.qty * item.unit_price || 0), 0);
    if (total > 0) {
      setAmount(total.toFixed(2));
    }
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poNumber.trim() || !vendorName.trim() || !amount) return;

    setSubmitting(true);
    setCreateError(null);
    try {
      await purchaseOrderApi.createPurchaseOrder({
        po_number: poNumber.trim(),
        vendor_name: vendorName.trim(),
        amount: parseFloat(amount),
        line_items: lineItems.filter((li) => li.description.trim().length > 0),
      });

      setPoNumber('');
      setVendorName('');
      setAmount('');
      setLineItems([{ description: '', qty: 1, unit_price: 0 }]);
      setCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Purchase Order Registry"
      subtitle="Authorized enterprise purchase orders used for 3-way reconciliation and item variance checks."
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
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create PO</span>
          </button>
        </div>
      }
    >
      {/* 3-Way Match Explainer */}
      <div className="mb-6 bg-[#10141B] p-4 rounded-xl border border-white/[0.08] flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white">Automated 3-Way Reconciliation</p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              The Retrieve Agent matches incoming invoices against these POs by explicit citation or amount proximity, while the Validate Agent checks for quantity, item descriptions, and price variances.
            </p>
          </div>
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
          <div className="p-8 text-center text-xs text-rose-400">{error}</div>
        ) : pos.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No purchase orders in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0D1117] border-b border-white/[0.08] text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4 text-right">Authorized Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Line Items</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {pos.map((po) => {
                  const vendor = (po.vendor_id ? vendors[po.vendor_id] : null) || 'Unknown Vendor';
                  return (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedPo(po)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white group-hover:text-emerald-400">
                        {po.po_number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {vendor}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(po.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            po.status === 'open'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/25'
                              : 'bg-white/[0.04] text-slate-400 border border-white/[0.08]'
                          }`}
                        >
                          {po.status === 'open' ? '● Open' : 'Closed'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {po.line_items?.length || 0} item(s)
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPo(po);
                          }}
                          className="text-slate-400 group-hover:text-emerald-400 font-medium inline-flex items-center space-x-1 transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Line Items Modal */}
      {selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#10141B] rounded-2xl shadow-2xl max-w-lg w-full border border-white/[0.12] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="font-bold text-base text-white font-mono">{selectedPo.po_number}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supplier: <span className="text-slate-200">{vendors[selectedPo.vendor_id] || 'Unknown'}</span> &bull; Authorized: <span className="text-emerald-400 font-mono font-bold">{formatCurrency(selectedPo.amount)}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedPo(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Line Items</p>
              {selectedPo.line_items && selectedPo.line_items.length > 0 ? (
                <div className="border border-white/[0.08] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0D1117] border-b border-white/[0.08] text-slate-400 text-[10px] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {selectedPo.line_items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-medium text-slate-200">{item.description}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">{item.qty}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                            {formatCurrency(item.qty * item.unit_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">No line items specified for this PO.</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPo(null)}
                className="px-4 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#10141B] rounded-2xl shadow-2xl max-w-lg w-full border border-white/[0.12] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="font-bold text-sm text-white">Create Purchase Order</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
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

            <form onSubmit={handleCreatePo} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PO Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO-2001"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white font-mono focus:outline-hidden focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1200.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white font-mono focus:outline-hidden focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supplier Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Office Supplies"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  list="vendorOptionsDark"
                  className="w-full px-3 py-2 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500/50"
                />
                <datalist id="vendorOptionsDark">
                  {vendorList.map((v) => (
                    <option key={v.id} value={v.name} />
                  ))}
                </datalist>
              </div>

              {/* Line items section */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-300 text-[11px]">Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px]"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                        className="flex-2 px-2.5 py-1.5 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) =>
                          handleLineItemChange(idx, 'qty', parseFloat(e.target.value) || 0)
                        }
                        className="w-16 px-2 py-1.5 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs font-mono text-white"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleLineItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1.5 bg-[#0A0D12] border border-white/[0.08] rounded-lg text-xs font-mono text-white"
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-400 font-medium hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
