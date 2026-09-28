import React from 'react';
import { Menu, UploadCloud, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onOpenMobile: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobile,
  onRefresh,
  refreshing,
}) => {
  const location = useLocation();
  const { isDemoMode } = useAuth();

  const getPageContext = () => {
    if (location.pathname === '/' || location.pathname === '/dashboard') return { title: 'Dashboard', badge: 'Realtime Pipeline' };
    if (location.pathname.startsWith('/invoices/')) return { title: 'Invoice Inspection', badge: 'Console' };
    if (location.pathname === '/invoices') return { title: 'Invoice Review Queue', badge: 'Human Gate' };
    if (location.pathname === '/upload') return { title: 'Process Invoice', badge: 'Multi-Agent' };
    if (location.pathname === '/vendors') return { title: 'Vendors Master', badge: 'Anomaly Baselines' };
    if (location.pathname === '/purchase-orders') return { title: 'Purchase Orders', badge: '3-Way Match' };
    return { title: 'InvoiceGuard', badge: 'Fintech AI' };
  };

  const context = getPageContext();

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#0A0D12]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobile}
          className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg md:hidden hover:bg-white/[0.05]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-100">{context.title}</span>
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.08]">
            {context.badge}
          </span>
          {isDemoMode && (
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Demo Mode</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
        )}

        {location.pathname !== '/upload' && (
          <Link
            to="/upload"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Process Invoice</span>
          </Link>
        )}
      </div>
    </header>
  );
};
