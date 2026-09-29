import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { Menu as MenuPrimitive, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { auth } from '../../firebase';
import Logo from '../components/Logo';
import ProgramIcon from '../components/ProgramIcon';
import { useAccount } from '../lib/account';
import { allPrograms } from '../professions/index.js';
import { buttonVariants } from '@/components/ui/button';
import { ChevronDown, Menu, X } from 'lucide-react';

// Screens where the header would get in the way of an interview
const FOCUS_SECTIONS = ['setup', 'session', 'summary'];

// Links to each program's page. Plain navigation, not a mode switch: a student's program lives on their account.
function ProgramsMenu() {
  return (
    <MenuPrimitive>
      <MenuButton className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 focus:outline-none data-[open]:text-gray-900 data-[focus]:underline">
        Programs <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </MenuButton>
      <MenuItems
        anchor="bottom start"
        transition
        className="z-50 w-80 rounded-xl border bg-white p-1.5 shadow-lg ring-1 ring-black/5 [--anchor-gap:10px] focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        {allPrograms().map((p) => (
          <MenuItem key={p.slug}>
            <Link to={`/${p.slug}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-800 data-[focus]:bg-gray-100">
              <ProgramIcon slug={p.slug} className={`h-4 w-4 ${p.status === 'live' ? 'text-teal-600' : 'text-gray-400'}`} />
              <span className="flex-1">{p.displayName}</span>
              {p.status === 'soon' && <span className="text-xs text-gray-500">Soon</span>}
            </Link>
          </MenuItem>
        ))}
      </MenuItems>
    </MenuPrimitive>
  );
}

export default function Header() {
  const { user } = useAccount();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close the mobile menu after navigating
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await signOut(auth); navigate('/'); };

  if (FOCUS_SECTIONS.includes(location.pathname.split('/')[1])) return null;

  const linkCls = ({ isActive }) =>
    `hover:text-gray-900 ${isActive ? 'text-gray-900 underline underline-offset-4' : 'text-gray-700'}`;
  const mobileLinkCls = 'flex items-center gap-2 rounded-md px-2 py-2 text-gray-800 hover:bg-gray-100';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="InterviewPrep home">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <ProgramsMenu />
          <NavLink to="/pricing" className={linkCls}>Pricing</NavLink>
          <NavLink to="/resources" className={linkCls}>Resources</NavLink>
          <NavLink to="/about" className={linkCls}>About</NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className={buttonVariants({ variant: 'outline' })}>Dashboard</Link>
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
        <div id="mobile-menu" className="md:hidden border-t bg-white px-4 py-3 text-sm">
          <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Programs</p>
          {allPrograms().map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className={mobileLinkCls}>
              <ProgramIcon slug={p.slug} className={`h-4 w-4 ${p.status === 'live' ? 'text-teal-600' : 'text-gray-400'}`} />
              <span className="flex-1">{p.displayName}</span>
              {p.status === 'soon' && <span className="text-xs text-gray-500">Soon</span>}
            </Link>
          ))}
          <div className="mt-2 border-t pt-2">
            <NavLink to="/pricing" className={mobileLinkCls}>Pricing</NavLink>
            <NavLink to="/resources" className={mobileLinkCls}>Resources</NavLink>
            <NavLink to="/about" className={mobileLinkCls}>About</NavLink>
          </div>
          <div className="mt-2 flex flex-col gap-2 border-t pt-3">
            {user ? (
              <>
                <Link to="/dashboard" className={buttonVariants({ variant: 'outline' })}>Dashboard</Link>
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
