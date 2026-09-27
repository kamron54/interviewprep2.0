import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ListChecks, Video, Sparkles, SlidersHorizontal, TrendingUp, Lock, ArrowRight } from 'lucide-react';
import { auth } from '../../firebase';
import { useProfession } from '../professions/ProfessionContext.jsx';
import { buttonVariants } from '@/components/ui/button';
import SampleFeedbackCard from '../components/SampleFeedbackCard';
import usePageTitle from '../lib/usePageTitle';

// Real usage numbers only. The row is hidden while this is empty.
// e.g. { value: '400+', label: 'students practiced' }
const STATS = [];

const FEATURES = [
  { Icon: ListChecks, title: 'Profession-Specific Questions', body: 'Curated questions for dental and medical school interviews, including the “Big 3” you’re almost guaranteed to be asked.' },
  { Icon: Video, title: 'Video Practice Sessions', body: 'Record yourself answering on camera and play it back to check your delivery and body language.' },
  { Icon: Sparkles, title: 'Instant Feedback', body: 'Every answer is transcribed and scored on impression, clarity, and content, with specific suggestions to improve.' },
  { Icon: SlidersHorizontal, title: 'Customizable Sessions', body: 'Choose video or audio, set the number of questions, or build your own set from the question bank.' },
  { Icon: TrendingUp, title: 'Progress Tracking', body: 'Save your sessions and watch your average score change as you practice.' },
  { Icon: Lock, title: 'Private by Default', body: 'Your recordings aren’t stored on our servers. You only keep what you choose to save.' },
];

const STEPS = [
  { step: '1', title: 'Set up your interview', body: 'Choose a standard mock interview or build a custom one from the question bank.' },
  { step: '2', title: 'Answer on camera', body: 'Record each answer, up to 3 minutes, just like on interview day.' },
  { step: '3', title: 'Review your feedback', body: 'Get a score and specific suggestions for every answer, then practice again.' },
];

export default function HomePage() {
  usePageTitle();
  const [user, setUser] = useState(null);
  useEffect(() => { const unsub = onAuthStateChanged(auth, setUser); return () => unsub(); }, []);

  const ctx = useProfession?.();
  const base = ctx?.slug ? `/${ctx.slug}` : '/dental';
  const heroTitle = ctx?.config?.hero?.title || 'Ace your healthcare school interviews.';
  const primaryHref = user ? `${base}/dashboard` : '/signup';

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(13,148,136,0.15),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                {heroTitle}
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Practice with mock interviews designed specifically for your profession. Get instant, actionable feedback and build confidence for your big day.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={primaryHref} className={buttonVariants({ size: 'lg' })}>
                  {user ? 'Start a practice session' : 'Create free account'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to={`${base}/pricing`} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  See pricing
                </Link>
              </div>
              {!user && (
                <p className="mt-4 text-sm text-gray-500">2 free practice sessions · No credit card required</p>
              )}
            </div>
            <SampleFeedbackCard question={ctx?.config?.defaultQuestion} />
          </div>

          {STATS.length > 0 && (
            <dl className="mt-16 grid grid-cols-2 gap-6 border-t pt-10 sm:grid-cols-3">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-3xl font-semibold tracking-tight text-gray-900">{s.value}</dd>
                  <dd className="mt-1 text-sm text-gray-600">{s.label}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Features  */}
      <section id="features" className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 text-center md:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="mt-3 mx-auto text-center text-lg text-gray-600 text-balance max-w-prose sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            Interview practice modeled on what admissions committees actually ask.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl border bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                    <Icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                </div>
                <p className="mt-3 text-sm text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 text-center">
            How it works
          </h2>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.step} className="rounded-2xl border p-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-xs font-medium text-white">
                    {s.step}
                  </div>
                  <div className="text-base font-semibold text-gray-900">{s.title}</div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Founder */}
      <section className="border-t bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
            <img
              src="/images/kamron-320.jpg"
              alt="Kamron, founder of InterviewPrep"
              className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-white shadow"
            />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Built by a dental student who’s been through it</h2>
              <p className="mt-3 text-gray-600">
                I’m Kamron, a student at UCSF School of Dentistry. During my application cycle I was accepted to schools
                such as UPenn, Tufts, and UCSF. I built InterviewPrep to be the tool I wish I’d had when I was applying.
              </p>
              <Link to={`${base}/about`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline">
                More about me <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 text-center md:text-4xl">
            Ready to practice?
          </h2>
          <p className="mt-3 mx-auto text-center text-lg text-gray-600 text-balance max-w-prose sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            Build confidence with structured reps and clear guidance.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to={primaryHref} className={buttonVariants({ size: 'lg' })}>
              {user ? 'Start a session' : 'Create free account'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
