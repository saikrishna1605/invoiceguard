export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getRiskLevelDetails(risk: string | undefined): {
  label: string;
  badgeClass: string;
  dotColor: string;
  borderClass: string;
  bgSubtle: string;
  textColor: string;
} {
  switch ((risk || '').toLowerCase()) {
    case 'high':
      return {
        label: 'HIGH RISK',
        badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
        dotColor: 'bg-rose-500',
        borderClass: 'border-l-2 border-l-rose-500',
        bgSubtle: 'bg-rose-500/5',
        textColor: 'text-rose-400',
      };
    case 'medium':
      return {
        label: 'MEDIUM RISK',
        badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
        dotColor: 'bg-amber-400',
        borderClass: 'border-l-2 border-l-amber-500',
        bgSubtle: 'bg-amber-500/5',
        textColor: 'text-amber-400',
      };
    case 'low':
      return {
        label: 'LOW RISK',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
        dotColor: 'bg-emerald-400',
        borderClass: 'border-l-2 border-l-emerald-500',
        bgSubtle: 'bg-emerald-500/5',
        textColor: 'text-emerald-400',
      };
    default:
      return {
        label: 'UNKNOWN',
        badgeClass: 'bg-slate-800 text-slate-400 border border-slate-700',
        dotColor: 'bg-slate-500',
        borderClass: 'border-l-2 border-l-slate-600',
        bgSubtle: 'bg-slate-900',
        textColor: 'text-slate-400',
      };
  }
}

export function getStatusDetails(status: string | undefined): {
  label: string;
  badgeClass: string;
  dotColor: string;
} {
  switch ((status || '').toLowerCase()) {
    case 'pending_review':
      return {
        label: 'Pending Review',
        badgeClass: 'bg-sky-500/10 text-sky-400 border border-sky-500/25',
        dotColor: 'bg-sky-400',
      };
    case 'approved':
      return {
        label: 'Approved',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
        dotColor: 'bg-emerald-400',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
        dotColor: 'bg-rose-400',
      };
    default:
      return {
        label: status || 'Unknown',
        badgeClass: 'bg-slate-800 text-slate-300 border border-slate-700',
        dotColor: 'bg-slate-400',
      };
  }
}
