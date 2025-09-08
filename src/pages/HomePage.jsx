import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { useProfession } from '../professions/ProfessionContext.jsx';

export default function HomePage() {
  const [user, setUser] = useState(null);
  useEffect(() => { const unsub = onAuthStateChanged(auth, setUser); return () => unsub(); }, []);

  const ctx = useProfession?.();
  const heroTitle = ctx?.config?.hero?.title || 'Ace your healthcare school interviews.';
  const defaultSetupHref = ctx?.slug ? `/${ctx.slug}/setup` : '/dental/setup';
  const defaultResourcesHref = ctx?.slug ? `/${ctx.slug}/resources` : '/dental/resources';

  return (
    <main className="">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(13,148,136,0.15),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                {heroTitle}
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Practice with mock interviews designed specifically for your profession. Get instant, actionable feedback and build confidence for your big day.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={user ? defaultSetupHref : '/signup'} className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
                  {user ? 'Start a practice session' : 'Create free account'}
                </Link>
              </div>
            </div>
            {/* Placeholder preview card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="h-2 w-24 rounded bg-gray-300" />
                  <div className="h-2 w-8 rounded bg-gray-300" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-3 w-3/4 rounded bg-gray-300" />
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-gray-100" />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features  */}
      <section id="features" className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 text-center md:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="mt-3 mx-auto text-center text-lg text-gray-600 text-balance max-w-prose sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            Comprehensive interview preparation tools modeled after real interview expectations across healthcare programs.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { title: 'Profession-Specific Questions', body: 'Curated questions for dental, medical, PA, pharmacy, and PT school interviews.' },
              { title: 'Video Practice Sessions', body: 'Record yourself answering questions and review your body language and delivery.' },
              { title: 'Instant Feedback', body: 'Get detailed analysis of your responses with personalized improvement suggestions.' },
              { title: 'Customizable Scenarios', body: 'Tailor your practice by choosing the question focus, recording style, and session length.' },
              { title: 'Progress Tracking', body: 'Monitor your improvement over time with detailed analytics and performance insights.' },
              { title: 'Secure & Private', body: 'Your practice sessions are encrypted and stored securely with full privacy protection.' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-md bg-gradient-to-br from-teal-500 to-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">{f.body}</p>
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
            {[
              { step: '1', title: 'Choose Your Format', body: 'Select between standard mock interviews or create custom sessions tailored to your needs.' },
              { step: '2', title: 'Practice Answering Questions', body: 'Record structured responses in realistic, interview-style flows.' },
              { step: '3', title: 'Review and Improve', body: 'Use our instant personalized feedback to improve your delivery immediately.' },
            ].map((s) => (
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

      {/* CTA */}
      <section className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 text-center md:text-4xl">
            Ready to practice?
          </h2>
          <p className="mt-3 mx-auto text-center text-lg text-gray-600 text-balance max-w-prose sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            Build confidence with structured reps and clear guidance.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to={user ? defaultSetupHref : '/signup'}
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              {user ? 'Start a session' : 'Create free account'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}