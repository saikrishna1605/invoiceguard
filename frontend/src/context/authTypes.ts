export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarInitials: string;
  badgeColor: string;
  isDemoMode?: boolean;
}

export const DEMO_USERS: UserPersona[] = [
  {
    id: 'demo_reviewer',
    name: 'Demo Reviewer',
    email: 'demo@invoiceguard.local',
    role: 'Lead AP Reviewer',
    department: 'Financial Operations',
    avatarInitials: 'DR',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    isDemoMode: true,
  },
  {
    id: 'sai_krishna',
    name: 'Sai Krishna',
    email: 'sai.krishna@invoiceguard.internal',
    role: 'Senior Finance Reviewer',
    department: 'Financial Operations',
    avatarInitials: 'SK',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    isDemoMode: true,
  },
  {
    id: 'elena_vance',
    name: 'Elena Vance',
    email: 'elena.vance@invoiceguard.internal',
    role: 'Chief Compliance Officer',
    department: 'Risk & Audit',
    avatarInitials: 'EV',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    isDemoMode: true,
  },
  {
    id: 'marcus_vance',
    name: 'Marcus Vance',
    email: 'marcus.v@invoiceguard.internal',
    role: 'AP Accounting Specialist',
    department: 'Accounts Payable',
    avatarInitials: 'MV',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    isDemoMode: true,
  },
];
