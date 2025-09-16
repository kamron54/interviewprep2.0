import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Card from '../components/Card';
import { Trophy, BookOpen, Target, Play, Star, AlertTriangle, Crown, Gift, BarChart3 } from "lucide-react";

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
  const [userData, setUserData] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const { profession } = useParams();
  const base = profession ? `/${profession}` : '/dental';
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        await user.reload();
        const nowVerified = user.emailVerified === true;
        setIsVerified(nowVerified);
        if (nowVerified) {
          try {
            await updateDoc(doc(db, 'users', user.uid), { emailVerified: true });
          } catch (err) {
            console.warn('Could not update emailVerified flag:', err);
          }
        }
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
           // Fetch recent saved sessions (lightweight)
            try {
              const sessRef = collection(doc(db, 'users', user.uid), 'sessions');
              const q = query(sessRef, orderBy('createdAt', 'desc'), limit(5));
              const s = await getDocs(q);
              const items = s.docs.map(d => ({ id: d.id, ...d.data() }));
              setRecentSessions(items);
            } catch (e) {
             console.warn('Could not load sessions:', e);
            }
        } else {
          console.warn('User data not found.');
        }
      } catch (e) {
        console.error('Dashboard init error:', e);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleUpgrade = async () => {
    try {
      const uid = auth.currentUser && auth.currentUser.uid;
      if (!uid) throw new Error('User not authenticated');

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error('Server error: ' + text);
      }

      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout redirect failed:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  if (!userData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <Card className="rounded-2xl border">
          <div className="p-6"><p>Checking access…</p></div>
        </Card>
      </div>
    );
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
                    : 0;

  const kpis = [
    { label: 'Sessions Completed',  value: sessionsCompleted,  Icon: Trophy,  color: 'text-primary' },
    { label: 'Questions Practiced', value: questionsPracticed, Icon: BookOpen, color: 'text-medical-teal' },
    { label: 'Average Score',       value: `${averageScore}%`, Icon: Target,   color: 'text-medical-blue' },
  ];

  // Free Trial 2 session limit
  const FREE_TRIAL_SESSION_LIMIT = 2;
  const trialSessionsLeft = Math.max(0, FREE_TRIAL_SESSION_LIMIT - sessionsCompleted);
  const locked = !(userState === 'paid_active' || userState === 'free_trial_active' && trialSessionsLeft > 0);

  if (!isVerified) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <Card className="rounded-2xl border-2 border-yellow-400">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-yellow-800">Verify your email to unlock the app</h2>
            <p className="mt-1 text-yellow-900">We’ve sent a verification link to your inbox. Once verified, refresh this page.</p>
            <p className="mt-2 text-sm text-yellow-900">Tip: check your spam folder if you don’t see it.</p>
          </div>
        </Card>
      </div>
    );
  }

  // ---- state pill content (icon + label) ---------------------------------
  const statePill = (() => {
    switch (userState) {
      case 'free_trial_active':
        return { text: `Free Trial`, Icon: Star, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' };
      case 'free_trial_expired':
        return { text: 'Trial Expired', Icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' };
      case 'paid_active':
        return { text: `Premium${paidDaysRemaining != null ? ` (${paidDaysRemaining} days left)` : ''}`, Icon: Crown, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
      case 'paid_cancelled':
        return { text: 'Subscription Ended', Icon: Gift, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      default:
        return { text: 'Free Trial', Icon: Star, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' };
    }
  })();

  return (
    <main className="mx-auto max-w-7xl px-4 py-0 pb-10">
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
            </div>

            <div className="flex items-center space-x-4">
              {/* State pill next to Start */}
              <span className={`hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-1 ${statePill.bg} ${statePill.border}`}>
                <statePill.Icon className={`h-4 w-4 ${statePill.color}`} />
                <span className={`text-sm font-medium ${statePill.color}`}>{statePill.text}</span>
              </span>

              {/* Start button (solid primary for visibility) */}
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:pointer-events-none"
                onClick={() => {
                  if (locked) return; // guard; disabled below
                  const p = localStorage.getItem('lastProfession');
                  if (p) {
                    navigate('/' + p + '/setup');
                  } else {
                    navigate('/setup');
                  }
                }}
                disabled={locked}
              >
                <span className="inline-flex items-center">
                  <Play className="h-4 w-4 mr-2" />
                  {locked ? 'Upgrade to Practice' : 'Start Practice'}
                </span>
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
                      : 'Upgrade to access your complete practice history and detailed performance analytics.'}
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
                            onClick={() => navigate(`${base}/summary`, { state: { readonly: true, savedSession: s } })}
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
                    Your free trial ends in {trialDaysLabel}
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
    </main>
  );
}
