import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import ProgramSwitcher from '../components/ProgramSwitcher';
import Logo from '../components/Logo';
import { useProfession } from '../professions/ProfessionContext.jsx';
import { buttonVariants } from '@/components/ui/button';
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

  // Close the mobile menu after navigating
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await signOut(auth); navigate(base); };

  const hideHeader =
    location.pathname.endsWith('/session') ||
    location.pathname.endsWith('/summary') ||
    location.pathname.endsWith('/setup');

  if (hideHeader) return null;

  const linkCls = ({ isActive }) =>
    `hover:text-gray-900 ${isActive ? 'text-gray-900 underline underline-offset-4' : 'text-gray-700'}`;
  const mobileLinkCls = 'block rounded-md px-2 py-2 text-gray-800 hover:bg-gray-100';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to={base} aria-label="InterviewPrep home">
            <Logo />
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
              <Link to={`${base}/dashboard`} className={buttonVariants({ variant: 'outline' })}>Dashboard</Link>
              <button onClick={handleLogout} className={buttonVariants({ variant: 'ghost' })}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonVariants({ variant: 'ghost' })}>Log in</Link>
              <Link to="/signup" className={buttonVariants()}>Get started</Link>
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
        <div id="mobile-menu" className="md:hidden border-t bg-white px-4 py-3 space-y-1 text-sm">
          <NavLink to={`${base}/pricing`} className={mobileLinkCls}>Pricing</NavLink>
          <NavLink to={`${base}/resources`} className={mobileLinkCls}>Resources</NavLink>
          <NavLink to={`${base}/about`} className={mobileLinkCls}>About</NavLink>
          <div className="mt-2 flex flex-col gap-2 border-t pt-3">
            {user ? (
              <>
                <Link to={`${base}/dashboard`} className={buttonVariants({ variant: 'outline' })}>Dashboard</Link>
                <button onClick={handleLogout} className={buttonVariants({ variant: 'ghost' })}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonVariants({ variant: 'outline' })}>Log in</Link>
                <Link to="/signup" className={buttonVariants()}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
