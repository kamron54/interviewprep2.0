import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '../components/AuthLayout';
import FormMessage from '../components/FormMessage';
import GoogleSignInButton, { OrDivider } from '../components/GoogleSignInButton';
import { createProfile, friendlyAuthError, rememberedProgram, rememberProgram, sendVerificationEmail } from '../lib/auth';
import { FREE_TRIAL_SESSIONS } from '../lib/pricing';
import { getProgram, livePrograms } from '../professions/index.js';

function SignUp() {
  const [searchParams] = useSearchParams();
  // Program pages link here with ?program=dental; otherwise use the last program page viewed
  const requested = searchParams.get('program');
  const [track, setTrack] = useState(getProgram(requested)?.status === 'live' ? requested : rememberedProgram());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await createProfile(user, { name, track });
      rememberProgram(track);

      // The dashboard can resend it, so a failed email shouldn't stop sign-up
      await sendVerificationEmail(user).catch((err) => console.warn('Verification email not sent:', err));

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('❌ Error:', err);
      setError(friendlyAuthError(err));
      setSubmitting(false);
    }
  };

  // Google sign-ups land on the dashboard; someone who already had an account is just logged in
  const handleGoogleSignedIn = (profile) => {
    navigate(profile?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={`Start with ${FREE_TRIAL_SESSIONS} free practice sessions. No credit card required.`}
      footer={<>Already have an account? <Link to="/login" className="font-medium text-foreground hover:underline">Log in</Link></>}
    >
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="track" className="text-sm font-medium text-foreground">I’m applying to</label>
          <select
            id="track"
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {livePrograms().map((p) => (
              <option key={p.slug} value={p.slug}>{p.displayName}</option>
            ))}
          </select>
        </div>

        <GoogleSignInButton track={track} onSignedIn={handleGoogleSignedIn} onError={setGoogleError} disabled={submitting} />
        {googleError && <FormMessage>{googleError}</FormMessage>}
        <OrDivider>or sign up with email</OrDivider>

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            className="h-10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
          <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            aria-describedby="password-hint"
            className="h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p id="password-hint" className="text-xs text-muted-foreground">At least 6 characters.</p>
        </div>

        {error && <FormMessage>{error}</FormMessage>}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </form>
    </AuthLayout>
  );
}

export default SignUp;
