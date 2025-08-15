import { Routes, Route, Navigate } from 'react-router-dom';
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
import InterviewPrepStage from './pages/InterviewPrepStage';
import InterviewTips from './pages/InterviewTips';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuestionManager from './pages/AdminQuestionManager';

import { ProfessionProvider } from './professions/ProfessionContext';
import ProfessionSelector from './pages/ProfessionSelector';

import { useLocation } from 'react-router-dom';

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
      {/* Root selector (no layout around it) */}
      <Route path="/" element={<ProfessionSelector />} />

      {/* Non-profession site (keeps all existing routes/guards) */}
      <Route element={<Layout />}>
        {/* If you still want a generic homepage, serve it at /home */}
        <Route path="home" element={<HomePage />} />

        {/* Public */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="interview-tips" element={<InterviewTips />} />

        {/* Protected */}
        <Route path="dashboard" element={<Protected user={user}><Dashboard /></Protected>} />
        <Route path="setup"     element={<Protected user={user}><InterviewSetup /></Protected>} />
        <Route path="interview" element={<Protected user={user}><InterviewSession /></Protected>} />
        <Route path="summary"   element={<Protected user={user}><SessionSummary /></Protected>} />
        <Route path="prep"      element={<Protected user={user}><InterviewPrepStage /></Protected>} />

        {/* Admin */}
        <Route path="admin"     element={<Protected user={user}><AdminDashboard /></Protected>} />
        <Route path="admin-dashboard" element={<AdminDashboard />} />
        <Route path="admin/questions" element={<Protected user={user}><AdminQuestionManager /></Protected>} />
      </Route>

      {/* Profession-scoped site (parallel to the above) */}
      <Route
        path="/:profession/*"
        element={
          <ProfessionProvider>
            <Layout />
          </ProfessionProvider>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="tips" element={<InterviewTips />} />
        <Route path="setup"   element={<Protected user={user}><InterviewSetup /></Protected>} />
        <Route path="session" element={<Protected user={user}><InterviewSession /></Protected>} />
        <Route path="summary" element={<Protected user={user}><SessionSummary /></Protected>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
