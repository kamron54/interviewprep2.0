import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, updateDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import PageLoader from '../components/PageLoader';
import ProgramIcon from '../components/ProgramIcon';
import { useAccount } from '../lib/account';
import { rememberProgram, sendVerificationEmail } from '../lib/auth';
import { getAccessState } from '../lib/access';
import { FREE_TRIAL_SESSIONS } from '../lib/pricing';
import { getProgram, livePrograms } from '../professions/index.js';
import usePageTitle from '../lib/usePageTitle';
import { Lock, MailCheck, Play } from "lucide-react";

export default function Dashboard() {
  usePageTitle('Dashboard');
  // profile is a live subscription (AccountProvider), so a Stripe payment shows up as soon as the webhook writes it
  const { user, profile: userData, track, program } = useAccount();
  const [recentSessions, setRecentSessions] = useState([]);
  const [isVerified, setIsVerified] = useState(() => !!auth.currentUser?.emailVerified);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [pendingTrack, setPendingTrack] = useState(track);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const markVerified = async (user) => {
    setIsVerified(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { emailVerified: true });
    } catch (err) {
      console.warn('Could not update emailVerified flag:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        // Pick up a verification that happened in another tab since the token was issued
        await user.reload();
        if (cancelled) return;
        if (user.emailVerified) await markVerified(user);

        // Fetch recent saved sessions (lightweight)
        try {
          const sessRef = collection(doc(db, 'users', user.uid), 'sessions');
          const q = query(sessRef, orderBy('createdAt', 'desc'), limit(5));
          const s = await getDocs(q);
          if (!cancelled) setRecentSessions(s.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
          console.warn('Could not load sessions:', e);
        }
      } catch (e) {
        console.error('Dashboard init error:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Returning from Stripe Checkout
  useEffect(() => {
    if (searchParams.get('upgraded') === '1') {
      toast.success('Payment received. Welcome to Premium!');
      searchParams.delete('upgraded');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openProgramDialog = () => {
    setPendingTrack(track);
    setProgramDialogOpen(true);
  };

  const handleSaveProgram = async () => {
    if (pendingTrack === track) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { track: pendingTrack });
      rememberProgram(pendingTrack);
      toast.success(`You’re now practicing for ${getProgram(pendingTrack).displayName}.`);
    } catch (err) {
      console.error('Could not change program:', err);
      toast.error("We couldn't change your program. Please try again.");
    }
  };

  // Always compare plans side by side on /pricing rather than jumping straight to checkout
  const handleUpgrade = () => navigate('/pricing');

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail(auth.currentUser);
      toast.success(`Verification email sent to ${auth.currentUser.email}`);
    } catch (err) {
      console.error('Resend verification failed:', err);
      toast.error(err.code === 'auth/too-many-requests'
        ? 'Please wait a minute before requesting another email.'
        : "We couldn't send the email. Please try again.");
    }
  };

  const handleCheckVerified = async () => {
    setCheckingVerification(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        await markVerified(auth.currentUser);
        toast.success('Email verified. You’re all set!');
      } else {
        toast.error('Not verified yet. Click the link in the email, then try again.');
      }
    } finally {
      setCheckingVerification(false);
    }
  };

  if (!userData) {
    return <PageLoader label="Loading your dashboard…" />;
  }

  // ---- trial / paid state (same rules as the admin users table) ----------
  // userState: free_trial_active | free_trial_expired | paid_active | paid_cancelled
  const {
    userState, trialDaysRemaining, paidDaysRemaining, sessionsCompleted, trialSessionsLeft, locked,
  } = getAccessState(userData);
  const trialDaysLabel = `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'}`;

  // ---- KPIs ---------------------------------------------------
  const questionsPracticed = Number.isFinite(userData?.usageCount) ? userData.usageCount
                          : Number.isFinite(userData?.questionsPracticed) ? userData.questionsPracticed
                          : 0;
  const averageScore = Number.isFinite(userData?.rollingAverageScore) ? Math.round(userData.rollingAverageScore)
                    : Number.isFinite(userData?.lastAverageScore)    ? Math.round(userData.lastAverageScore)
                    : null;

  const kpis = [
    { label: 'Sessions completed',  value: sessionsCompleted },
    { label: 'Questions practiced', value: questionsPracticed },
    { label: 'Average score',       value: averageScore == null ? '—' : `${averageScore}%` },
  ];

  if (!isVerified) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card className="rounded-2xl p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-medium tracking-tight text-foreground">Verify your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a verification link to <span className="font-medium text-foreground">{auth.currentUser?.email}</span>.
            Click it, then come back here.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={handleCheckVerified} disabled={checkingVerification}>
              {checkingVerification ? 'Checking…' : 'I’ve verified my email'}
            </Button>
            <Button variant="ghost" onClick={handleResendVerification}>
              Resend email
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Don’t see it? Check your spam or promotions folder.</p>
        </Card>
      </div>
    );
  }

  // ---- where the account stands: a pill by the Start button, and a bar under the sessions ----
  // The colored dot echoes the logo's recording light
  const STATES = {
    free_trial_active: { text: 'Free trial', dot: 'bg-amber-500' },
    free_trial_expired: { text: 'Trial ended', dot: 'bg-red-500' },
    paid_active: { text: `Premium${paidDaysRemaining != null ? ` · ${paidDaysRemaining} days left` : ''}`, dot: 'bg-brand' },
    paid_cancelled: { text: 'Access ended', dot: 'bg-gray-400' },
  };
  const statePill = STATES[userState] || STATES.free_trial_active;

  const statusBar = {
    free_trial_active: trialSessionsLeft === 0
      ? { text: `You’ve used your ${FREE_TRIAL_SESSIONS} free sessions. Upgrade to keep practicing.`, action: 'Upgrade' }
      : { text: `${trialSessionsLeft} free session${trialSessionsLeft === 1 ? '' : 's'} left · trial ends in ${trialDaysLabel}`, action: 'Upgrade' },
    free_trial_expired: { text: 'Your free trial has ended.', action: 'Upgrade' },
    paid_cancelled: { text: 'Your access has ended.', action: 'See plans' },
    paid_active: {
      text: paidDaysRemaining != null ? `Premium is active · ${paidDaysRemaining} days left` : 'Premium is active',
      action: paidDaysRemaining != null && paidDaysRemaining <= 7 ? 'Extend access' : null,
    },
  }[userState];

  const subtitle = userState === 'paid_cancelled' ? 'Your access has ended. Choose a plan to keep practicing.'
    : locked ? 'Upgrade to keep practicing.'
    : sessionsCompleted === 0 ? 'Ready for your first practice session?'
    : 'Pick up where you left off.';

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <header className="flex flex-col gap-6 border-b border-line pb-8 pt-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[34px] font-medium leading-tight tracking-tight text-gray-900 sm:text-[40px]">
            {userData.name ? `Welcome, ${userData.name}` : 'Welcome'}
          </h1>
          <p className="mt-2 text-gray-600">{subtitle}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500">
            <ProgramIcon slug={track} className="h-4 w-4 text-brand" />
            Practicing for <span className="font-medium text-gray-900">{program.displayName}</span>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={openProgramDialog} className="font-medium text-gray-900 underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">
              Change
            </button>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-sm font-medium text-gray-700 sm:inline-flex">
            <span className={cn('h-2 w-2 rounded-full', statePill.dot)} aria-hidden="true" />
            {statePill.text}
          </span>
          {/* Sends locked users to pricing instead of dead-ending */}
          <Button size="lg" className="px-6" onClick={() => (locked ? handleUpgrade() : navigate('/setup'))}>
            {!locked && <Play className="h-4 w-4" />}
            {locked ? 'Upgrade to practice' : 'Start practicing'}
          </Button>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white shadow-sm">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col justify-between px-4 py-5 sm:px-6">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="mt-2 font-display text-[28px] font-medium leading-none text-gray-900 sm:text-[36px]">{k.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-[22px] font-medium tracking-tight text-gray-900">Recent practice sessions</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {locked ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                <Lock className="h-5 w-5 text-gray-500" />
              </span>
              <h3 className="mt-3 font-semibold text-gray-900">{userState === 'paid_cancelled' ? 'Access ended' : 'Session history locked'}</h3>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                {userState === 'paid_cancelled'
                  ? 'Your access has ended. Choose a plan to see your saved sessions and keep practicing.'
                  : 'Upgrade to keep practicing and see your saved sessions and scores.'}
              </p>
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <h3 className="font-semibold text-gray-900">No saved sessions yet</h3>
              <p className="mt-1 text-sm text-gray-500">Finish a practice session, then click “Save session” on the summary.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recentSessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{s.title || 'Untitled session'}</p>
                    <p className="text-sm text-gray-500">
                      {s.counts?.totalQuestions ?? 0} questions · {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant={(s.overallAvg ?? 0) >= 80 ? 'default' : 'secondary'}>{Math.round(s.overallAvg ?? 0)}%</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/summary', { state: { readonly: true, savedSession: s } })}
                    >
                      Review
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {statusBar && (
        <section className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 shadow-sm sm:px-6">
          <p className="flex items-center gap-2.5 font-medium text-gray-900">
            <span className={cn('h-2 w-2 shrink-0 rounded-full', statePill.dot)} aria-hidden="true" />
            {statusBar.text}
          </p>
          {statusBar.action && (
            <Button size="sm" variant={userState === 'paid_active' ? 'outline' : 'default'} onClick={handleUpgrade}>
              {statusBar.action}
            </Button>
          )}
        </section>
      )}

      {/* Change program */}
      <AlertDialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Which interview are you preparing for?</AlertDialogTitle>
            <AlertDialogDescription>
              This sets the question bank for your practice sessions. Your saved sessions and scores stay the same.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2" role="radiogroup" aria-label="Program">
            {livePrograms().map((p) => (
              <label
                key={p.slug}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50',
                  pendingTrack === p.slug && 'border-foreground'
                )}
              >
                <input
                  type="radio"
                  name="track"
                  value={p.slug}
                  checked={pendingTrack === p.slug}
                  onChange={() => setPendingTrack(p.slug)}
                  className="accent-foreground"
                />
                <ProgramIcon slug={p.slug} className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium">{p.displayName}</span>
              </label>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveProgram}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
