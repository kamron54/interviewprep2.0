import Header from './Header';
import Footer from './Footer';
import { Outlet, useParams, useLocation } from 'react-router-dom';

// Signed-in app screens get no footer; every public page does
const APP_SECTIONS = ['dashboard', 'setup', 'session', 'summary', 'admin'];

export default function Layout() {
  const { profession } = useParams();
  const location = useLocation();

  const section = location.pathname.split('/')[2];
  const showFooter = profession && !APP_SECTIONS.includes(section);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
