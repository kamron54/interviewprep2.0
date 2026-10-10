import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { AlertCircle, MailCheck } from 'lucide-react';
import { auth } from '../../firebase';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PageLoader from '../components/PageLoader';
import { useAccount } from '../lib/account';
import usePageTitle from '../lib/usePageTitle';

// Where the "Confirm my email" link lands (sent by api/send-verification.js).
// Works signed out too, since the link may open in another browser.
export default function VerifyEmail() {
  usePageTitle('Confirm your email');
  const [params] = useSearchParams();
  const { user } = useAccount();
  const [status, setStatus] = useState('working'); // working | done | failed
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // the code works once, so never apply it twice
    started.current = true;
    (async () => {
      try {
        await applyActionCode(auth, params.get('oobCode') || '');
        await auth.currentUser?.reload().catch(() => {});
        setStatus('done');
      } catch {
        // An already-used link (some email scanners open links first) can still mean the email is verified
        await auth.currentUser?.reload().catch(() => {});
        setStatus(auth.currentUser?.emailVerified ? 'done' : 'failed');
      }
    })();
  }, [params]);

  if (status === 'working') return <PageLoader label="Confirming your email…" />;

  const done = status === 'done';
  const Icon = done ? MailCheck : AlertCircle;
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card className="rounded-2xl p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          {done ? 'Your email is confirmed' : 'This link didn’t work'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {done
            ? 'You’re all set to start practicing.'
            : 'It may have expired or already been used. You can send yourself a new one from your dashboard.'}
        </p>
        <Link to={user ? '/dashboard' : '/login'} className={buttonVariants({ className: 'mt-6' })}>
          {user ? 'Go to your dashboard' : 'Log in'}
        </Link>
      </Card>
    </div>
  );
}
