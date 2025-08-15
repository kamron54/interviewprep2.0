import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import Button from '../components/Button';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function Header() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // 👇 NEW: read the slug if we're in a profession route (e.g., /dental)
  const { profession } = useParams();
  let remembered = null;
  try {
    remembered = localStorage.getItem('lastProfession');
  } catch {}
  const base = profession ? `/${profession}` : remembered ? `/${remembered}` : '';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const db = getFirestore();
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        setIsAdmin(userData?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    const target = base || '/home';
    navigate(target, { replace: true });
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b shadow-sm">
      <Link to="/" className="text-2xl font-bold">InterviewPrep</Link>
      <nav className="space-x-4 text-sm">
        {/* 👇 Home: /dental (when in profession mode) OR /home (generic) */}
        <Link to={base || '/home'}>Home</Link>

        {/* 👇 Tips: /dental/tips (profession) OR /interview-tips (generic) */}
        <Link to={base ? `${base}/tips` : '/interview-tips'}>Interview Tips</Link>

        {!user ? (
          <>
            <Link to="/login" className="text-blue-600">Login</Link>
            <Link to="/signup">
              <Button type="primary">Sign Up</Button>
            </Link>
          </>
        ) : (
          <>
            {/* Keep these global unless you later want profession-scoped versions */}
            <Link to="/dashboard">Dashboard</Link>
            {isAdmin && (
              <Link to="/admin-dashboard" className="text-red-600 font-semibold">
                Admin Dashboard
              </Link>
            )}
            <Button type="danger" onClick={handleLogout}>Logout</Button>
          </>
        )}
      </nav>
    </header>
  );
}
