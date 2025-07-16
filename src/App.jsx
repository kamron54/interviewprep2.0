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
      <Route path="/" element={<Layout />}>
        {/* Always render HomePage at “/” */}
        <Route index element={<HomePage />} />

        {/* Public routes */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="interview-tips" element={<InterviewTips />} />

        {/* Protected routes */}
        <Route
          path="dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="setup"
          element={user ? <InterviewSetup /> : <Navigate to="/" />}
        />
        <Route
          path="interview"
          element={user ? <InterviewSession /> : <Navigate to="/" />}
        />
        <Route
          path="summary"
          element={user ? <SessionSummary /> : <Navigate to="/" />}
        />
        <Route
          path="prep"
          element={user ? <InterviewPrepStage /> : <Navigate to="/" />}
        />
        <Route
          path="admin"
          element={user ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="admin/questions"
          element={user ? <AdminQuestionManager /> : <Navigate to="/" />}
        />
      </Route>
    </Routes>
  );
}

export default App;
