import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

import Layout from './pages/Layout';
import ProgramHub from './pages/ProgramHub';
import ProgramLanding from './pages/ProgramLanding';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import SessionSummary from './pages/SessionSummary';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminQuestionManager from './pages/AdminQuestionManager';
import AdminFeedbackLab from './pages/AdminFeedbackLab';
import Pricing from './pages/Pricing';
import Resources from './pages/Resources';
import EthicsGuide from './pages/guides/EthicsGuide';
import CommunicationGuide from './pages/guides/CommunicationGuide';
import PitfallsGuide from './pages/guides/PitfallsGuide';
import About from './pages/About';
import PrivacyPolicy from './pages/privacy';
import TermsOfService from './pages/terms';
import PageLoader from './components/PageLoader';
import { AccountProvider, useAccount } from './lib/account';
import { rememberProgram } from './lib/auth';


function Protected({ children }) {
  const { user } = useAccount();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

// Before programs had their own pages, every URL started with one (/dental/pricing,
// /dental/dashboard?upgraded=1). Send those to the shared page, keeping the query string.
function LegacyProgramRedirect() {
  const { program, '*': rest = '' } = useParams();
  const { search, hash } = useLocation();
  useEffect(() => { rememberProgram(program); }, [program]);
  return <Navigate to={`/${rest}${search}${hash}`} replace />;
}

function AppRoutes() {
  const { authReady } = useAccount();
  if (!authReady) return <PageLoader />;

  return (
    <>
    <Routes>
      {/* Global auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<ProgramHub />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="resources" element={<Resources />} />
        <Route path="about" element={<About />} />
        <Route path="resources/ethics" element={<EthicsGuide />} />
        <Route path="resources/communication" element={<CommunicationGuide />} />
        <Route path="resources/pitfalls" element={<PitfallsGuide />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />
        <Route path="verify-email" element={<VerifyEmail />} />

        {/* Protected */}
        <Route path="dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="setup"     element={<Protected><InterviewSetup /></Protected>} />
        <Route path="session"   element={<Protected><InterviewSession /></Protected>} />
        <Route path="summary"   element={<Protected><SessionSummary /></Protected>} />

        {/* Admin */}
        <Route path="admin"           element={<Protected><AdminDashboard /></Protected>} />
        <Route path="admin/users"     element={<Protected><AdminUsers /></Protected>} />
        <Route path="admin/questions" element={<Protected><AdminQuestionManager /></Protected>} />
        <Route path="admin/feedback-lab" element={<Protected><AdminFeedbackLab /></Protected>} />

        {/* Program pages (/dental, /medical, …); unknown slugs go home */}
        <Route path=":program" element={<ProgramLanding />} />
        <Route path=":program/*" element={<LegacyProgramRedirect />} />
      </Route>
    </Routes>
    <Toaster position="top-right" richColors />
   </>
  );
}

function App() {
  return (
    <AccountProvider>
      <AppRoutes />
    </AccountProvider>
  );
}

export default App;
