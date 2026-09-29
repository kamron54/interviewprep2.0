import { Link } from 'react-router-dom';
import { ListChecks, Video, Sparkles, SlidersHorizontal, TrendingUp, Lock, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { PREMIUM_PRICE, FREE_TRIAL_SESSIONS } from '../lib/pricing';

// Sections shared by the homepage (ProgramHub) and every program page (ProgramLanding)

// Real usage numbers only. The row is hidden while this is empty.
// e.g. { value: '400+', label: 'students practiced' }. The admin dashboard shows the totals.
export const SITE_STATS = [];

// Product FAQs that apply to every program; a program's own `landing.faqs` are listed first
export const COMMON_FAQS = [
  { q: 'Do I need a camera?', a: 'No. You can practice in audio-only mode. Video lets you review your body language and delivery.' },
  { q: 'How long can my answers be?', a: 'Up to 3 minutes per answer, like on interview day.' },
  { q: 'What does it cost?', a: `Your first ${FREE_TRIAL_SESSIONS} practice sessions are free. After that, Premium is a one-time ${PREMIUM_PRICE} for 12 months of access, with no subscription.` },
];

export function SectionHeading({ title, subtitle }) {
  return (
    <>
      <h2 className="text-balance text-center text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-balance text-center text-lg text-gray-600">{subtitle}</p>
      )}
    </>
  );
}

export function StatsRow() {
  if (SITE_STATS.length === 0) return null;
  return (
    <dl className="mt-16 grid grid-cols-2 gap-6 border-t pt-10 sm:grid-cols-3">
      {SITE_STATS.map((s) => (
        <div key={s.label}>
          <dt className="sr-only">{s.label}</dt>
          <dd className="text-3xl font-semibold tracking-tight text-gray-900">{s.value}</dd>
          <dd className="mt-1 text-sm text-gray-600">{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}

// audience: e.g. "dental school" → "Curated questions for dental school interviews…"
export function FeaturesSection({ audience }) {
  const features = [
    { Icon: ListChecks, title: 'Profession-Specific Questions', body: `Curated questions for ${audience} interviews, including the “Big 3” you’re almost guaranteed to be asked.` },
    { Icon: Video, title: 'Video Practice Sessions', body: 'Record yourself answering on camera and play it back to check your delivery and body language.' },
    { Icon: Sparkles, title: 'Instant Feedback', body: 'Every answer is transcribed and scored on impression, clarity, and content, with specific suggestions to improve.' },
    { Icon: SlidersHorizontal, title: 'Customizable Sessions', body: 'Choose video or audio, set the number of questions, or build your own set from the question bank.' },
    { Icon: TrendingUp, title: 'Progress Tracking', body: 'Save your sessions and watch your average score change as you practice.' },
    { Icon: Lock, title: 'Private by Default', body: 'Your recordings aren’t stored on our servers. You only keep what you choose to save.' },
  ];

  return (
    <section id="features" className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title="Everything You Need to Succeed" subtitle="Interview practice modeled on what admissions committees actually ask." />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map(({ Icon, title, body }) => (
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
  );
}

const STEPS = [
  { step: '1', title: 'Set up your interview', body: 'Choose a standard mock interview or build a custom one from the question bank.' },
  { step: '2', title: 'Answer on camera', body: 'Record each answer, up to 3 minutes, just like on interview day.' },
  { step: '3', title: 'Review your feedback', body: 'Get a score and specific suggestions for every answer, then practice again.' },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title="How it works" />
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
  );
}

// Numbered tip cards, two per row so longer tips stay readable
export function TipsGrid({ tips }) {
  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
      {tips.map((t, i) => (
        <div key={t.title} className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
              {i + 1}
            </span>
            <h3 className="text-base font-semibold text-gray-900">{t.title}</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-600">{t.body}</p>
        </div>
      ))}
    </div>
  );
}

// variant 'full': the founder story (homepage, dental). 'short': one line for other programs.
// children render below the story in the same section (dental puts Kamron's tips there).
export function FounderSection({ variant = 'full', children }) {
  if (variant === 'short') {
    return (
      <section className="border-t bg-gray-50">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-10 sm:px-6 lg:px-8">
          <img src="/images/kamron-320.jpg" alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white shadow" />
          <p className="text-gray-700">
            Built by Kamron, a UCSF dental student who’s been through health professions interviews.{' '}
            <Link to="/about" className="font-medium text-gray-900 hover:underline">More about me</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
          <img
            src="/images/kamron-320.jpg"
            alt="Kamron, founder of InterviewPrep"
            className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-white shadow"
          />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Built by a dental student who’s been through it</h2>
            <p className="mt-3 text-gray-600">
              I'm Kamron, a student at UCSF School of Dentistry. During my application cycle, I went through the interview process at multiple top dental schools. I built InterviewPrep to be the tool I wish I'd had when I was applying.
            </p>
            <Link to="/about" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline">
              More about me <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

// A real current student who reviewed a program's question bank (see `landing.reviewer` in the configs)
export function ReviewerSection({ reviewer }) {
  return (
    <section className="border-t bg-gray-50">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-10 sm:px-6 lg:px-8">
        {reviewer.photo && (
          <img src={reviewer.photo} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white shadow" />
        )}
        <p className="text-gray-700">
          Questions reviewed by <span className="font-medium text-gray-900">{reviewer.name}</span>, {reviewer.role}.
        </p>
      </div>
    </section>
  );
}

// One stacked list, so any number of questions lays out evenly
export function FaqSection({ items, title = 'Common questions' }) {
  return (
    <section className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title={title} />
        <dl className="mx-auto mt-10 max-w-3xl divide-y rounded-2xl border">
          {items.map((item) => (
            <div key={item.q} className="p-6">
              <dt className="text-sm font-semibold text-gray-900">{item.q}</dt>
              <dd className="mt-2 text-sm text-gray-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function CtaSection({ title, body, to, label }) {
  return (
    <section className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title={title} subtitle={body} />
        <div className="mt-6 flex justify-center">
          <Link to={to} className={buttonVariants({ size: 'lg' })}>{label}</Link>
        </div>
      </div>
    </section>
  );
}
