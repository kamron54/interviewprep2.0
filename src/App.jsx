import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

import Layout from './pages/Layout';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import SessionSummary from './pages/SessionSummary';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuestionManager from './pages/AdminQuestionManager';
import Pricing from './pages/Pricing';
import Resources from './pages/Resources';
import EthicsGuide from './pages/guides/EthicsGuide';
import CommunicationGuide from './pages/guides/CommunicationGuide';
import PitfallsGuide from './pages/guides/PitfallsGuide';
import About from './pages/About';
import { ProfessionProvider } from './professions/ProfessionContext';
import PrivacyPolicy from './pages/privacy';
import TermsOfService from './pages/terms';


function Protected({ user, children }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <Routes>
      {/* Redirect / to a default profession */}
      <Route path="/" element={<Navigate to="/dental" replace />} />

      {/* Global auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Profession-scoped */}
      <Route
        path="/:profession/*"
        element={
          <ProfessionProvider>
            <Layout />
          </ProfessionProvider>
        }
      >
        {/* Public */}
        <Route index element={<HomePage />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="resources" element={<Resources />} />
        <Route path="about" element={<About />} />
        <Route path="resources/ethics" element={<EthicsGuide />} />
        <Route path="resources/communication" element={<CommunicationGuide />} />
        <Route path="resources/pitfalls" element={<PitfallsGuide />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />

        {/* Protected */}
        <Route path="dashboard" element={<Protected user={user}><Dashboard /></Protected>} />
        <Route path="setup"     element={<Protected user={user}><InterviewSetup /></Protected>} />
        <Route path="session"   element={<Protected user={user}><InterviewSession /></Protected>} />
        <Route path="summary"   element={<Protected user={user}><SessionSummary /></Protected>} />

        {/* Admin */}
        <Route path="admin"           element={<Protected user={user}><AdminDashboard /></Protected>} />
        <Route path="admin/questions" element={<Protected user={user}><AdminQuestionManager /></Protected>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dental" replace />} />
    </Routes>
  );
}

export default App;
