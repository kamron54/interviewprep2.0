import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
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
import { startCheckout } from '../lib/checkout';
import { useAccount } from '../lib/account';
import { rememberProgram } from '../lib/auth';
import { FREE_TRIAL_SESSIONS } from '../lib/pricing';
import { getProgram, livePrograms } from '../professions/index.js';
import usePageTitle from '../lib/usePageTitle';
import { Trophy, BookOpen, Target, Play, Star, AlertTriangle, Crown, Gift, BarChart3, MailCheck } from "lucide-react";

// ---- helpers (no hooks) -------------------------------------------------
function toDate(val) {
  if (!val) return null;
  // Support Firestore Timestamp {seconds, nanoseconds}, ISO string, or Date
  if (typeof val === 'object' && val.seconds) return new Date(val.seconds * 1000);
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}
function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}
function computeTimeLeft(end) {
  if (!end) return null;
  const msLeft = end.getTime() - Date.now();
  if (msLeft <= 0) return '0h 0m';
  const hours = Math.floor(msLeft / (1000 * 60 * 60));
  const minutes = Math.floor((msLeft / (1000 * 60)) % 60);
  return `${hours}h ${minutes}m`;
}
function daysLeft(end) {
  if (!end) return 0;
  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

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

  const handleUpgrade = async () => {
    try {
      await startCheckout();
    } catch (err) {
      console.error('Checkout redirect failed:', err);
      toast.error("We couldn't open checkout. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
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

  // ---- derive trial + subscription windows (reads only) ------------------
  const now = new Date();
  const trialEnd = toDate(userData.trialExpiresAt);
  const isTrialActive = trialEnd ? now < trialEnd : false;

  const hasPaid = !!userData.hasPaid;
  const paidAt = toDate(userData.paidAt);
  const subscriptionEndsAt = toDate(userData.subscriptionEndsAt) || (paidAt ? addDays(paidAt, 365) : null);

  // ---- compute userState (4 states) --------------------------------------
  // free_trial_active | free_trial_expired | paid_active | paid_cancelled
  let userState = 'free_trial_expired';
  if (hasPaid && subscriptionEndsAt) {
    userState = now <= subscriptionEndsAt ? 'paid_active' : 'paid_cancelled';
  } else if (isTrialActive) {
    userState = 'free_trial_active';
  }

  const trialDaysRemaining = trialEnd ? daysLeft(trialEnd) : 0;
  const trialDaysLabel = `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'}`;
  const paidDaysRemaining = subscriptionEndsAt ? daysLeft(subscriptionEndsAt) : null;

  // ---- KPIs ---------------------------------------------------
  const sessionsCompleted  = Number.isFinite(userData?.sessionsCompleted) ? userData.sessionsCompleted : 0;
  const questionsPracticed = Number.isFinite(userData?.usageCount) ? userData.usageCount
                          : Number.isFinite(userData?.questionsPracticed) ? userData.questionsPracticed
                          : 0;
  const averageScore = Number.isFinite(userData?.rollingAverageScore) ? Math.round(userData.rollingAverageScore)
                    : Number.isFinite(userData?.lastAverageScore)    ? Math.round(userData.lastAverageScore)
                    : null;

  const kpis = [
    { label: 'Sessions Completed',  value: sessionsCompleted,  Icon: Trophy,  color: 'text-primary' },
    { label: 'Questions Practiced', value: questionsPracticed, Icon: BookOpen, color: 'text-teal-600' },
    { label: 'Average Score',       value: averageScore == null ? '—' : `${averageScore}%`, Icon: Target, color: 'text-blue-600' },
  ];

  // Free trial session limit
  const trialSessionsLeft = Math.max(0, FREE_TRIAL_SESSIONS - sessionsCompleted);
  const locked = !(userState === 'paid_active' || userState === 'free_trial_active' && trialSessionsLeft > 0);

  if (!isVerified) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card className="rounded-2xl p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-foreground">Verify your email</h1>
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

  // ---- state pill content (icon + label) ---------------------------------
  const statePill = (() => {
    switch (userState) {
      case 'free_trial_active':
        return { text: `Free Trial`, Icon: Star, color: 'text-amber-700', bg: 'bg-warning/10', border: 'border-warning/30' };
      case 'free_trial_expired':
        return { text: 'Trial Expired', Icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' };
      case 'paid_active':
        return { text: `Premium${paidDaysRemaining != null ? ` (${paidDaysRemaining} days left)` : ''}`, Icon: Crown, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
      case 'paid_cancelled':
        return { text: 'Subscription Ended', Icon: Gift, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      default:
        return { text: 'Free Trial', Icon: Star, color: 'text-amber-700', bg: 'bg-warning/10', border: 'border-warning/30' };
    }
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-0 pb-10">
      {/* Header (clean; no alerts inside) */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-0 md:px-4 py-6">
          {/* Main header row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {userData && userData.name ? ('Welcome, ' + userData.name) : 'Welcome'}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {userState === 'free_trial_expired'
                  ? 'Upgrade to continue your interview preparation journey.'
                  : userState === 'paid_cancelled'
                  ? 'Your subscription has ended. Reactivate to continue your progress.'
                  : 'Continue your interview preparation journey.'}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <ProgramIcon slug={track} className="h-4 w-4 text-teal-600" />
                Practicing for <span className="font-medium text-foreground">{program.displayName}</span>
                <span aria-hidden="true">·</span>
                <button type="button" onClick={openProgramDialog} className="font-medium text-foreground underline-offset-4 hover:underline">
                  Change
                </button>
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* State pill next to Start */}
              <span className={`hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-1 ${statePill.bg} ${statePill.border}`}>
                <statePill.Icon className={`h-4 w-4 ${statePill.color}`} />
                <span className={`text-sm font-medium ${statePill.color}`}>{statePill.text}</span>
              </span>

              {/* Start button — sends locked users to checkout instead of dead-ending */}
              <Button onClick={() => (locked ? handleUpgrade() : navigate('/setup'))}>
                {locked ? <Crown className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {locked ? 'Upgrade to Practice' : 'Start Practice'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* KPI cards */}
      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <Card
            key={k.label}
            className="rounded-2xl border bg-card hover:shadow-md transition"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground tracking-wide">
                    {k.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{k.value}</p>
                </div>
                {k.Icon && <k.Icon className={`h-8 w-8 ${k.color}`} />}
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Recent practice sessions */}
      <section className="mt-10">
        <Card className="rounded-2xl border bg-card">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Recent Practice Sessions</h2>
            </div>

            <div className="mt-4">
              {locked ? (
                <div className="flex flex-col items-center justify-center text-center border border-border rounded-xl bg-background p-10">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-base font-semibold text-foreground">{userState === 'paid_cancelled' ? 'Access Ended' : 'Session History Locked'}</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    {userState === 'paid_cancelled'
                      ? 'Your subscription has ended. Reactivate to access your complete history and analytics.'
                      : 'Upgrade to keep practicing and see your saved sessions and scores.'}
                  </p>
                </div>

                ) : recentSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center border border-border rounded-xl bg-background p-10">
                    <h3 className="text-base font-semibold text-foreground">No saved sessions yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Complete a practice and click “Save Session” on the summary screen.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-background p-4 hover:bg-muted/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-block h-2 w-2 rounded-full bg-foreground" aria-hidden />
                          <div>
                            <div className="font-medium text-foreground">{s.title || 'Untitled Session'}</div>
                            <div className="text-sm text-muted-foreground">
                              {s.counts?.totalQuestions ?? 0} questions • {new Date(s.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant={(s.overallAvg ?? 0) >= 80 ? 'default' : 'secondary'}>{Math.round(s.overallAvg ?? 0)}%</Badge>
                          <Button
                            variant="outline"
                            onClick={() => navigate('/summary', { state: { readonly: true, savedSession: s } })}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        </Card>
      </section>

      {/* State-specific alerts near the bottom (not fixed) */}
      <section className="mt-8 mb-8">
        {userState === 'free_trial_expired' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="font-medium text-destructive">Your free trial has expired</span>
              </div>
              <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleUpgrade}>
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {userState === 'paid_cancelled' && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">Subscription Ended — Reactivate your access</span>
              </div>
              <Button size="sm" className="bg-orange-600 text-white hover:bg-orange-700" onClick={handleUpgrade}>
                Reactivate
              </Button>
            </div>
          </div>
        )}

        {userState === 'free_trial_active' && (
          trialSessionsLeft === 0 ? (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-warning" />
                  <span className="font-medium text-foreground">
                    You’ve used your 2 free sessions. Upgrade to continue.
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-warning text-warning-foreground hover:bg-warning/90"
                  onClick={handleUpgrade}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-warning" />
                  <span className="font-medium text-foreground">
                    {trialSessionsLeft} free session{trialSessionsLeft === 1 ? '' : 's'} left · trial ends in {trialDaysLabel}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-warning text-warning-foreground hover:bg-warning/90"
                  onClick={handleUpgrade}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          )
        )}

        {userState === 'paid_active' && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">Premium Features Active</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1">
                <span className="text-xs text-primary">{paidDaysRemaining != null ? `${paidDaysRemaining} days remaining` : 'Active'}</span>
              </div>
            </div>
          </div>
        )}
      </section>

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
