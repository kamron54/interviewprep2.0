import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminLayout from '../components/AdminLayout';
import TestAccountsToggle, { isTestAccount, studentAccounts, useHideTestAccounts } from '../components/TestAccountsToggle';
import { useAdminUsers, useAdminWaitlist } from '../lib/adminData';
import { toDate } from '../lib/access';
import { PLANS } from '../lib/pricing';
import { comingSoonPrograms, getProgram, livePrograms } from '../professions/index.js';

function AdminDashboard() {
  return (
    <AdminLayout title="Overview">
      <Overview />
    </AdminLayout>
  );
}

function Breakdown({ title, rows }) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium text-gray-900">{value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function Overview() {
  const { users, loading } = useAdminUsers();
  const waitlist = useAdminWaitlist();
  const [hideTests, setHideTests] = useHideTestAccounts();

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  // Real students only: admins never count, and test accounts don't while they're hidden.
  // These totals are the source for the homepage stats row (SITE_STATS).
  const students = studentAccounts(users, hideTests);
  const testCount = users.filter((u) => u.role !== 'admin' && isTestAccount(u)).length;
  const paying = students.filter((u) => u.hasPaid);
  const sum = (key) => students.reduce((acc, u) => acc + (Number.isFinite(u[key]) ? u[key] : 0), 0);
  const joinedWithin = (days) => {
    const cutoff = Date.now() - days * 86400000;
    return students.filter((u) => (toDate(u.createdAt)?.getTime() ?? 0) >= cutoff).length;
  };

  const stats = [
    { label: 'Sign-ups', value: students.length },
    { label: 'Verified', value: students.filter((u) => u.emailVerified).length },
    { label: 'Paid', value: paying.length }, // ever bought a plan, including ones that have since ended
    {
      label: 'Conversion',
      value: students.length ? `${((paying.length / students.length) * 100).toFixed(1)}%` : '—',
      hint: 'paid ÷ sign-ups',
    },
    { label: 'Sessions completed', value: sum('sessionsCompleted') },
    { label: 'Answers transcribed', value: sum('usageCount') },
  ];

  const copyEmails = async (program) => {
    const emails = waitlist.filter((e) => e.program === program.slug).map((e) => e.email);
    try {
      await navigator.clipboard.writeText(emails.join(', '));
      toast.success(`Copied ${emails.length} ${program.name} email${emails.length === 1 ? '' : 's'}`);
    } catch {
      toast.error('Could not copy to the clipboard.');
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <TestAccountsToggle hide={hideTests} onChange={setHideTests} hiddenCount={testCount} />
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{s.value.toLocaleString()}</p>
            {s.hint && <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>}
          </Card>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Breakdown
          title="New sign-ups"
          rows={[['Last 7 days', joinedWithin(7)], ['Last 30 days', joinedWithin(30)]]}
        />
        {/* How the 1-month "decoy" is doing against the 12-month plan */}
        <Breakdown
          title="Plans bought"
          rows={[
            [PLANS.year.name, paying.filter((u) => u.plan === 'year').length],
            [PLANS.month.name, paying.filter((u) => u.plan === 'month').length],
            ['Original $29 plan', paying.filter((u) => !PLANS[u.plan]).length],
          ]}
        />
        <Breakdown
          title="Programs"
          rows={[
            ...livePrograms().map((p) => [p.name, students.filter((u) => u.track === p.slug).length]),
            ['Not chosen', students.filter((u) => getProgram(u.track)?.status !== 'live').length],
          ]}
        />
      </section>

      {/* Waitlist signups: which program students want next */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-gray-900">Waitlist</h2>
        {waitlist === null ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading waitlist…</p>
        ) : (
          <ul className="mt-2 divide-y text-sm">
            {comingSoonPrograms().map((p) => {
              const count = waitlist.filter((e) => e.program === p.slug).length;
              return (
                <li key={p.slug} className="flex items-center justify-between gap-4 py-2">
                  <span className="text-muted-foreground">{p.displayName}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{count.toLocaleString()}</span>
                    <Button variant="outline" size="sm" disabled={count === 0} onClick={() => copyEmails(p)}>Copy emails</Button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}

export default AdminDashboard;
