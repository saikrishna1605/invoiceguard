import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileText, 
  UploadCloud, 
  Building2, 
  Receipt,
  User,
  X,
  LogOut,
  ChevronUp,
  Sparkles,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  backendOnline: boolean | null;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  backendOnline,
  pendingCount,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isDemoMode, switchUser, allDemoUsers, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const mainNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      to: '/invoices', 
      label: 'Invoice Queue', 
      icon: FileText,
      badge: pendingCount && pendingCount > 0 ? `${pendingCount}` : undefined 
    },
    { to: '/upload', label: 'Process Invoice', icon: UploadCloud },
  ];

  const supplierNav = [
    { to: '/vendors', label: 'Vendors Master', icon: Building2 },
    { to: '/purchase-orders', label: 'Purchase Orders', icon: Receipt },
  ];

  const renderNavGroup = (items: typeof mainNav) => (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.to ||
          (item.to === '/dashboard' && location.pathname === '/') ||
          (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
              isActive
                ? 'bg-white/[0.08] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0D1117] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Header & Logo */}
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm tracking-tight text-white">InvoiceGuard</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    v0.1
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">AI Financial Operations</p>
              </div>
            </Link>

            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-500 hover:text-slate-300 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                Operations
              </p>
              {renderNavGroup(mainNav)}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                Suppliers &amp; POs
              </p>
              {renderNavGroup(supplierNav)}
            </div>
          </nav>
        </div>

        {/* Footer: User profile & Live API indicator */}
        <div className="p-4 border-t border-white/[0.08] space-y-3 bg-[#0A0D12]/50 relative">
          {/* Demo Mode Badge */}
          {isDemoMode && (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300">
              <span className="flex items-center space-x-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Demo Session</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80">Local SQLite</span>
            </div>
          )}

          {/* Status badge */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px]">
            <span className="text-slate-400 font-medium">FastAPI Engine</span>
            <div className="flex items-center space-x-1.5">
              {backendOnline === true ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400 font-semibold text-[10px]">Connected</span>
                </>
              ) : backendOnline === false ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-rose-400 font-semibold text-[10px]">Offline</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  <span className="text-slate-400 text-[10px]">Syncing...</span>
                </>
              )}
            </div>
          </div>

          {/* Demo Persona Switcher Popup Menu */}
          {userDropdownOpen && (
            <div className="absolute bottom-20 left-4 right-4 bg-[#151A22] border border-white/[0.12] rounded-xl shadow-2xl p-2.5 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Switch Demo Persona</span>
                </span>
                <button
                  onClick={() => setUserDropdownOpen(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {allDemoUsers.map((persona) => {
                  const isCurrent = user?.id === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => {
                        switchUser(persona.id);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-white/[0.08] text-white'
                          : 'text-slate-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {persona.avatarInitials}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-[11px]">{persona.name}</p>
                          <p className="text-[9px] text-slate-400 truncate max-w-[120px]">{persona.role}</p>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-white/[0.06] pt-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full p-1.5 text-left text-[11px] font-medium text-rose-400 hover:bg-rose-500/10 rounded flex items-center space-x-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out of session</span>
                </button>
              </div>
            </div>
          )}

          {/* User profile button (Clickable to switch demo personas) */}
          <div
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs shrink-0 group-hover:border-emerald-500/40">
                {user ? user.avatarInitials : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user ? user.name : 'Guest Reviewer'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user ? user.role : 'Click to select persona'}
                </p>
              </div>
            </div>

            <ChevronUp
              className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform ${
                userDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </aside>
    </>
  );
};
