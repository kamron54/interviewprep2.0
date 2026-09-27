import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout, { AuthMessage } from '../components/AuthLayout';
import { friendlyAuthError, lastProfessionSlug } from '../lib/auth';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const slug = lastProfessionSlug();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: user.email,
        createdAt: serverTimestamp(),
        trialExpiresAt: trialExpiresAt.toISOString(),
        hasPaid: false,
        promoCodeUsed: null,
        emailVerified: false,
      });

      await sendEmailVerification(user);

      navigate(`/${slug}/dashboard`, { replace: true });
    } catch (err) {
      console.error('❌ Error:', err);
      setError(friendlyAuthError(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start with 2 free practice sessions. No credit card required."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-foreground hover:underline">Log in</Link></>}
    >
      <form onSubmit={handleSignUp} className="space-y-4">
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

        {error && <AuthMessage>{error}</AuthMessage>}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link to={`/${slug}/terms`} className="underline hover:text-foreground">Terms of Service</Link> and{' '}
          <Link to={`/${slug}/privacy`} className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </form>
    </AuthLayout>
  );
}

export default SignUp;
