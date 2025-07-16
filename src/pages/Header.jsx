import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import Button from '../components/Button';

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
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
            <Button type="danger" onClick={handleLogout}>Logout</Button>
          </>
        )}
      </nav>
    </header>
  );
}
