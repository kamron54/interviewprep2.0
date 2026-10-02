import { useMemo, useState } from 'react';
import { BadgeCheck, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminLayout from '../components/AdminLayout';
import TestAccountsToggle, { isTestAccount, useHideTestAccounts } from '../components/TestAccountsToggle';
import { useAdminUsers } from '../lib/adminData';
import { getAccessState, toDate } from '../lib/access';
import { PLANS } from '../lib/pricing';
import { getProgram } from '../professions/index.js';

export default function AdminUsers() {
  return (
    <AdminLayout title="Users">
      <UsersTable />
    </AdminLayout>
  );
}

// The same trial / paid state the student sees on their dashboard, as a short label
function accessLabel(user) {
  const s = getAccessState(user);
  switch (s.userState) {
    case 'paid_active':
      // Accounts that paid before plans existed bought 12 months
      return { text: `${PLANS[user.plan]?.name || PLANS.year.name} · ${s.paidDaysRemaining}d left`, variant: 'default' };
    case 'paid_cancelled':
      return { text: 'Access ended', variant: 'outline' };
    case 'free_trial_active':
      return s.trialSessionsLeft > 0
        ? { text: `Trial · ${s.trialDaysRemaining}d left`, variant: 'secondary' }
        : { text: 'Trial · sessions used', variant: 'outline' };
    default:
      return { text: 'Trial ended', variant: 'outline' };
  }
}

const joinedAt = (user) => toDate(user.createdAt)?.getTime() ?? 0;

function UsersTable() {
  const { users, loading } = useAdminUsers();
  const [hideTests, setHideTests] = useHideTestAccounts();
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => !(hideTests && isTestAccount(u)))
      .filter((u) => !q || `${u.name || ''} ${u.email || ''}`.toLowerCase().includes(q))
      .sort((a, b) => joinedAt(b) - joinedAt(a)); // newest first
  }, [users, hideTests, search]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Search name or email"
            placeholder="Search name or email"
            className="h-10 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <TestAccountsToggle hide={hideTests} onChange={setHideTests} hiddenCount={users.filter(isTestAccount).length} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Program</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Sessions</th>
              <th className="px-4 py-3 text-right font-medium">Answers</th>
              <th className="px-4 py-3 text-right font-medium">Avg score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((u) => {
              const status = accessLabel(u);
              const joined = toDate(u.createdAt);
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-medium text-gray-900">
                      {u.name || '—'}
                      {u.emailVerified && <BadgeCheck className="h-4 w-4 text-teal-600" aria-label="Email verified" />}
                      {u.role === 'admin' && <Badge variant="outline">Admin</Badge>}
                      {isTestAccount(u) && <Badge variant="outline">Test</Badge>}
                    </div>
                    <div className="text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">{getProgram(u.track)?.name || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {/* Trial and paid states don't apply to admin accounts */}
                    {u.role === 'admin' ? '—' : <Badge variant={status.variant}>{status.text}</Badge>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {joined ? joined.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">{u.sessionsCompleted ?? 0}</td>
                  <td className="px-4 py-3 text-right">{u.usageCount ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    {Number.isFinite(u.rollingAverageScore) ? `${Math.round(u.rollingAverageScore)}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No accounts match.</p>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">Showing {rows.length} of {users.length} accounts</p>
    </>
  );
}
