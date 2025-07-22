import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import Button from '../components/Button';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function Header() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

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
    navigate('/');
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b shadow-sm">
      <div className="text-2xl font-bold">InterviewPrep</div>
      <nav className="space-x-4 text-sm">
        <Link to="/">Home</Link>
        <Link to="/interview-tips">Interview Tips</Link>

        {!user ? (
          <>
            <Link to="/login" className="text-blue-600">Login</Link>
            <Link to="/signup">
              <Button type="primary">Sign Up</Button>
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {isAdmin && <Link to="/admin-dashboard" className="text-red-600 font-semibold">Admin Dashboard</Link>}
            <Button type="danger" onClick={handleLogout}>Logout</Button>
          </>
        )}
      </nav>
    </header>
  );
}
