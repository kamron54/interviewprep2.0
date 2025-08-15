import Header from './Header';
import Footer from './Footer';
import { Outlet, useParams, useLocation } from 'react-router-dom';

export default function Layout() {
  const { profession } = useParams();
  const location = useLocation();

  // Show footer only on profession homepages (e.g., /dental)
  const showFooter = profession && location.pathname === `/${profession}`;

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
