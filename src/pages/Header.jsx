import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import ProgramSwitcher from '../components/ProgramSwitcher';
import { useProfession } from '../professions/ProfessionContext.jsx';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { slug } = useProfession() || {};
  const base = slug ? `/${slug}` : '/dental';
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleLogout = async () => { await signOut(auth); navigate(base); };

  const hideHeader =
    location.pathname.endsWith('/session') ||
    location.pathname.endsWith('/summary');

  if (hideHeader) return null; 

  const linkCls = ({ isActive }) =>
    `hover:text-gray-900 ${isActive ? 'text-gray-900 underline underline-offset-4' : 'text-gray-700'}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to={base} className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-block h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600" />
            InterviewPrep
          </Link>
          <ProgramSwitcher />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to={`${base}/pricing`} className={linkCls}>Pricing</NavLink>
          <NavLink to={`${base}/resources`} className={linkCls}>Resources</NavLink>
          <NavLink to={`${base}/about`} className={linkCls}>About</NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to={`${base}/dashboard`} className="rounded-lg border px-3 py-2 text-sm">Dashboard</Link>
              <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100">Log in</Link>
              <Link to="/signup" className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">Get started</Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="md:hidden border-t bg-white px-4 py-4 space-y-2">
          <NavLink to={`${base}/pricing`} className="block">Pricing</NavLink>
          <NavLink to={`${base}/resources`} className="block">Resources</NavLink>
          <NavLink to={`${base}/about`} className="block">About</NavLink>
          {user ? (
            <>
              <Link to={`${base}/dashboard`} className="block">Dashboard</Link>
              <button onClick={handleLogout} className="block text-left w-full">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block">Log in</Link>
              <Link to="/signup" className="block">Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
