import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      {location.pathname === '/' && <Footer />}
    </div>
  );
}
