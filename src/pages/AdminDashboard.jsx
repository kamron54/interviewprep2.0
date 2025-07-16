import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import Button from '../components/Button';
import Card from '../components/Card';

function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (!isAdmin) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link to="/admin/questions">
            <Button type="primary">➕ Manage Questions</Button>
          </Link>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Email</th>
                <th className="border px-2 py-1">Verified</th>
                <th className="border px-2 py-1">Trial Ends</th>
                <th className="border px-2 py-1">Paid</th>
                <th className="border px-2 py-1">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border px-2 py-1">{u.email}</td>
                  <td className="border px-2 py-1 text-center">{u.emailVerified ? '✅' : '❌'}</td>
                  <td className="border px-2 py-1 text-center">
                    {u.trialExpiresAt ? new Date(u.trialExpiresAt).toLocaleString() : '—'}
                  </td>
                  <td className="border px-2 py-1 text-center">{u.hasPaid ? '✅' : '❌'}</td>
                  <td className="border px-2 py-1 text-center">{u.role || 'user'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export default AdminDashboard;
