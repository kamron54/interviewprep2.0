import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { auth } from '../../firebase';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import FormMessage from '../components/FormMessage';
import PageLoader from '../components/PageLoader';
import { useAccount } from '../lib/account';
import { SURVEY_DISCOUNT } from '../lib/pricing';
import { MAX_OTHER_LENGTH, PRICE_QUESTIONS, SURVEY_REASONS, cleanSurvey } from '../lib/survey';
import usePageTitle from '../lib/usePageTitle';

// Who's answering: the signed link from the survey email (?t=) and/or the logged-in student
async function whoHeaders(token) {
  const idToken = await auth.currentUser?.getIdToken();
  return {
    ...(token && { 'X-Survey-Token': token }),
    ...(idToken && { Authorization: `Bearer ${idToken}` }),
  };
}

// The survey emailed to students who didn't upgrade (api/survey-emails.js). Answering puts
// $10 off 12 months on their account; checkout applies it automatically.
export default function Survey() {
  usePageTitle('A few quick questions');
  const [params] = useSearchParams();
  const token = params.get('t');
  const { user } = useAccount();
  const [view, setView] = useState({ status: 'loading' }); // loading | form | thanks | signin | error
  const [reasons, setReasons] = useState([]);
  const [other, setOther] = useState('');
  const [prices, setPrices] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token && !user) {
      setView({ status: 'signin' });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/survey', { headers: await whoHeaders(token) });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.status === 401 && !user) setView({ status: 'signin', message: data.error });
        else if (!res.ok) setView({ status: 'error', message: data.error });
        else setView({ status: data.alreadyAnswered ? 'thanks' : 'form', firstName: data.firstName, repeat: data.alreadyAnswered });
      } catch {
        if (!cancelled) setView({ status: 'error' });
      }
    })();
    return () => { cancelled = true; };
  }, [token, user]);

  const toggleReason = (id) => setReasons((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const answers = { reasons, other, prices };
    const problem = cleanSurvey(answers).error; // same checks as the server, shown right away
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await whoHeaders(token)) },
        body: JSON.stringify(answers),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setView((v) => ({ ...v, status: 'thanks', repeat: !!data.alreadyAnswered }));
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (view.status === 'loading') return <PageLoader />;

  if (view.status !== 'form') {
    const thanks = view.status === 'thanks';
    const content = {
      thanks: {
        title: `Thank you${view.firstName ? `, ${view.firstName}` : ''}!`,
        body: `${view.repeat ? 'You’ve already answered. ' : ''}$${SURVEY_DISCOUNT} off 12 months is on your account. It’s applied automatically at checkout.`,
      },
      signin: { title: 'Log in to take the survey', body: view.message || 'It takes about a minute.' },
      error: { title: 'Something went wrong', body: view.message || 'Please try the link again in a minute.' },
    }[view.status];
    const to = user ? (thanks ? '/pricing' : '/dashboard') : '/login';
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card className="rounded-2xl p-8 text-center">
          {thanks && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
              <Gift className="h-6 w-6 text-teal-600" />
            </div>
          )}
          <h1 className="text-xl font-semibold text-foreground">{content.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{content.body}</p>
          <Link
            to={to}
            state={user ? undefined : { from: thanks ? '/pricing' : '/survey' }}
            className={buttonVariants({ className: 'mt-6' })}
          >
            {user ? (thanks ? 'See pricing' : 'Go to your dashboard') : (thanks ? 'Log in to upgrade' : 'Log in')}
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">A few quick questions</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {view.firstName ? `Thanks for trying InterviewPrep, ${view.firstName}. ` : ''}
        It takes about a minute, and you’ll get ${SURVEY_DISCOUNT} off 12 months as a thank-you.
      </p>

      <Card className="mt-6 rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <fieldset>
            <legend className="text-base font-semibold text-gray-900">What stopped you from upgrading?</legend>
            <p className="mt-1 text-sm text-muted-foreground">Pick all that apply.</p>
            <div className="mt-3 space-y-2">
              {SURVEY_REASONS.map((r) => {
                const checked = reasons.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm text-gray-800 hover:bg-gray-50', checked && 'border-gray-900 bg-gray-50')}
                  >
                    <input type="checkbox" className="mt-0.5 h-4 w-4 accent-gray-900" checked={checked} onChange={() => toggleReason(r.id)} />
                    {r.label}
                  </label>
                );
              })}
              <Input
                aria-label="Another reason"
                placeholder="Something else? (optional)"
                maxLength={MAX_OTHER_LENGTH}
                className="h-11"
                value={other}
                onChange={(e) => setOther(e.target.value)}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-base font-semibold text-gray-900">
              Think about 12 months of unlimited practice. At what price would it be…
            </legend>
            <div className="mt-3 space-y-3">
              {PRICE_QUESTIONS.map((q) => (
                <label key={q.id} className="flex items-center justify-between gap-4 text-sm text-gray-700">
                  {q.label}
                  <span className="relative w-28 shrink-0">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="1"
                      max="1000"
                      step="any"
                      className="h-10 pl-6"
                      value={prices[q.id] ?? ''}
                      onChange={(e) => setPrices((p) => ({ ...p, [q.id]: e.target.value }))}
                    />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <FormMessage>{error}</FormMessage>}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Submit'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
