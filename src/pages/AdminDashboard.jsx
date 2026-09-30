import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { comingSoonPrograms, getProgram } from '../professions/index.js';

function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waitlist, setWaitlist] = useState(null); // null until loaded
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // 🔄 Refresh user data to get latest emailVerified status
        await user.reload();

        if (user.emailVerified) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { emailVerified: true });
        }

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        const data = docSnap.exists() ? docSnap.data() : {};

        if (data.role === 'admin') {
          setIsAdmin(true);
          fetchUsers();
          fetchWaitlist(user);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Access check failed:', err);
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Waitlist entries come from api/waitlist.js (admin-only GET), so no Firestore rules are needed
  const fetchWaitlist = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/waitlist', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      setWaitlist((await res.json()).entries);
    } catch (err) {
      console.error('Error fetching waitlist:', err);
      setWaitlist([]);
    }
  };

  const copyEmails = async (program) => {
    const emails = waitlist.filter(e => e.program === program.slug).map(e => e.email);
    try {
      await navigator.clipboard.writeText(emails.join(', '));
      toast.success(`Copied ${emails.length} ${program.name} email${emails.length === 1 ? '' : 's'}`);
    } catch {
      toast.error('Could not copy to the clipboard.');
    }
  };

  if (!isAdmin) return null;

  // Usage totals (admins excluded) — the source for the homepage STATS row
  const students = users.filter(u => u.role !== 'admin');
  const sum = (key) => students.reduce((acc, u) => acc + (Number.isFinite(u[key]) ? u[key] : 0), 0);
  const totals = [
    { label: 'Sign-ups', value: students.length },
    { label: 'Verified students', value: students.filter(u => u.emailVerified).length },
    { label: 'Paying students', value: students.filter(u => u.hasPaid).length },
    { label: 'Sessions completed', value: sum('sessionsCompleted') },
    { label: 'Answers transcribed', value: sum('usageCount') },
  ];

  const YesNo = ({ value }) => value
    ? <Check className="mx-auto h-4 w-4 text-teal-600" aria-label="Yes" />
    : <X className="mx-auto h-4 w-4 text-muted-foreground" aria-label="No" />;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/feedback-lab" className={buttonVariants({ variant: 'outline' })}>Feedback lab</Link>
          <Link to="/admin/questions" className={buttonVariants()}>Manage Questions</Link>
        </div>
      </div>

      {!loading && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {totals.map(t => (
            <Card key={t.label} className="p-4">
              <p className="text-xs text-muted-foreground">{t.label}</p>
              <p className="mt-1 text-2xl font-semibold">{t.value.toLocaleString()}</p>
            </Card>
          ))}
        </section>
      )}

      {/* Waitlist signups: which program students want next */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Waitlist</h2>
        {waitlist === null ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading waitlist…</p>
        ) : (
          <ul className="mt-3 divide-y text-sm">
            {comingSoonPrograms().map((p) => {
              const count = waitlist.filter(e => e.program === p.slug).length;
              return (
                <li key={p.slug} className="flex items-center justify-between gap-4 py-2">
                  <span>{p.displayName}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold">{count.toLocaleString()}</span>
                    <Button variant="outline" size="sm" disabled={count === 0} onClick={() => copyEmails(p)}>Copy emails</Button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading users…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Name</th>
                  <th className="border px-2 py-1 text-left">Email</th>
                  <th className="border px-2 py-1">Program</th>
                  <th className="border px-2 py-1">Verified</th>
                  <th className="border px-2 py-1">Trial Ends</th>
                  <th className="border px-2 py-1">Paid</th>
                  <th className="border px-2 py-1">Sessions</th>
                  <th className="border px-2 py-1">Usage</th>
                  <th className="border px-2 py-1">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="border px-2 py-1">{u.name || '—'}</td>
                    <td className="border px-2 py-1">{u.email}</td>
                    <td className="border px-2 py-1 text-center">{getProgram(u.track)?.name || '—'}</td>
                    <td className="border px-2 py-1 text-center"><YesNo value={u.emailVerified} /></td>
                    <td className="border px-2 py-1 text-center">
                      {u.trialExpiresAt ? new Date(u.trialExpiresAt).toLocaleString() : '—'}
                    </td>
                    <td className="border px-2 py-1 text-center"><YesNo value={u.hasPaid} /></td>
                    <td className="border px-2 py-1 text-center">{u.sessionsCompleted ?? 0}</td>
                    <td className="border px-2 py-1 text-center">{u.usageCount ?? 0}</td>
                    <td className="border px-2 py-1 text-center">{u.role || 'user'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminDashboard;
