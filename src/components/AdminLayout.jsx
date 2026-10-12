import { Navigate, NavLink } from 'react-router-dom';
import PageLoader from './PageLoader';
import { useAccount } from '../lib/account';
import usePageTitle from '../lib/usePageTitle';
import { cn } from '@/lib/utils';

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/questions', label: 'Questions' },
  { to: '/admin/feedback-lab', label: 'Feedback lab' },
  { to: '/admin/survey', label: 'Survey' },
];

// Shell for every admin page: the one admin gate, the tabs, and a consistent width.
// Children only mount for admins, so put data loading inside them, not beside this component.
// The gate only hides the UI: Firestore rules and the API routes are what protect the data.
export default function AdminLayout({ title, actions, children }) {
  usePageTitle(`${title} · Admin`);
  const { profile, profileLoaded } = useAccount();

  if (!profileLoaded) return <PageLoader />;
  if (profile?.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto border-b">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => cn(
              '-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium',
              isActive
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-muted-foreground hover:text-gray-900'
            )}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {actions}
      </div>

      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
}
