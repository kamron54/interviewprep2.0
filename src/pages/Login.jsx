import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout, { AuthMessage } from '../components/AuthLayout';
import { friendlyAuthError, lastProfessionSlug } from '../lib/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      const data = docSnap.exists() ? docSnap.data() : {};
      const slug = lastProfessionSlug();

      if (data.role === 'admin') {
        navigate(`/${slug}/admin`, { replace: true });
      } else if (from) {
        navigate(from, { replace: true }); // go back to /dental/... or wherever they were headed
      } else {
        navigate(`/${slug}/dashboard`, { replace: true });
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(friendlyAuthError(err));
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setNotice('');
    if (!email) {
      setError('Enter your email above, then click “Forgot password?” again.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      // Don't reveal whether an account exists; only surface input/rate-limit problems
      if (err.code === 'auth/invalid-email' || err.code === 'auth/too-many-requests') {
        setError(friendlyAuthError(err));
        return;
      }
    }
    setNotice(`If an account exists for ${email}, we’ve sent a link to reset your password.`);
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back. Pick up where you left off."
      footer={<>Don’t have an account? <Link to="/signup" className="font-medium text-foreground hover:underline">Sign up free</Link></>}
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
            <button type="button" onClick={handleForgotPassword} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <AuthMessage>{error}</AuthMessage>}
        {notice && <AuthMessage tone="success">{notice}</AuthMessage>}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;
