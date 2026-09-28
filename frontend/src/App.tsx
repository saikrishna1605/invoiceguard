import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { InvoiceQueuePage } from './pages/InvoiceQueuePage';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage';
import { UploadPage } from './pages/UploadPage';
import { VendorsPage } from './pages/VendorsPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { invoiceApi } from './api/invoices';
import { dashboardApi } from './api/dashboard';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [pendingCount, setPendingCount] = useState<number | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      try {
        await invoiceApi.checkHealth();
        if (isMounted) setBackendOnline(true);
        const stats = await dashboardApi.getStats();
        if (isMounted) setPendingCount(stats.pending_review);
      } catch {
        if (isMounted) setBackendOnline(false);
      }
    };
    checkBackend();
    const timer = setInterval(checkBackend, 12000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [refreshTrigger]);

  const handleGlobalRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#F5F7FA] flex antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Desktop and Mobile Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        backendOnline={backendOnline}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 transition-all duration-200">
        <TopBar
          onOpenMobile={() => setMobileOpen(true)}
          onRefresh={handleGlobalRefresh}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Policy Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Authentication Page (Login / Register / 1-Click Demo) */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />

            {/* Protected Application Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedLayout>
                  <InvoiceQueuePage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedLayout>
                  <InvoiceDetailPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedLayout>
                  <UploadPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/vendors"
              element={
                <ProtectedLayout>
                  <VendorsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/purchase-orders"
              element={
                <ProtectedLayout>
                  <PurchaseOrdersPage />
                </ProtectedLayout>
              }
            />

            {/* 404 Not Found Handling */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
