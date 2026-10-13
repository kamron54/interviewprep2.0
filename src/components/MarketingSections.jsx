import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Pause, Play } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProgramIcon from './ProgramIcon';
import { PLANS, FREE_TRIAL_SESSIONS, formatPrice } from '../lib/pricing';
import { comingSoonPrograms, livePrograms } from '../professions/index.js';

// Sections shared by the homepage (ProgramHub), every program page (ProgramLanding) and Pricing.
// Founder-led: Kamron's own clip and words, real student quotes, real program details.
// Nothing here is made up; his fuller story goes in FOUNDER_STORY when he's written it.

// Real usage numbers only. The row is hidden while this is empty.
// e.g. { value: '400+', label: 'students practiced' }. The admin dashboard shows the totals.
export const SITE_STATS = [];

// Product FAQs that apply to every program; a program's own `landing.faqs` are listed first
export const COMMON_FAQS = [
  { q: 'Do I need a camera?', a: 'No. You can practice in audio-only mode. Video lets you review your body language and delivery.' },
  { q: 'How long can my answers be?', a: 'Up to 3 minutes per answer, like on interview day.' },
  { q: 'What does it cost?', a: `Your first ${FREE_TRIAL_SESSIONS} practice sessions are free. After that, get 12 months of access for ${formatPrice(PLANS.year.amount)} or 1 month for ${formatPrice(PLANS.month.amount)}. Both are one-time payments with no subscription.` },
];

const linkCls = 'font-semibold text-gray-900 underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand';

// Left-aligned, like a magazine rather than a template
export function SectionHeading({ title, subtitle, className }) {
  return (
    <div className={className}>
      <h2 className="text-balance text-[32px] font-medium leading-tight tracking-tight text-gray-900 sm:text-[38px]">{title}</h2>
      {subtitle && <p className="mt-2 max-w-2xl text-lg text-gray-600">{subtitle}</p>}
    </div>
  );
}

// A short line in Kamron's handwriting
export function HandNote({ children, className }) {
  return <p className={cn('font-hand text-[26px] leading-none text-brand', className)}>{children}</p>;
}

export function StatsRow() {
  if (SITE_STATS.length === 0) return null;
  return (
    <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-3">
      {SITE_STATS.map((s) => (
        <div key={s.label}>
          <dt className="sr-only">{s.label}</dt>
          <dd className="font-display text-3xl font-medium tracking-tight text-gray-900">{s.value}</dd>
          <dd className="mt-1 text-sm text-gray-600">{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}

// Live programs as links, then the ones on the way
export function ProgramPills({ className }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 text-sm', className)}>
      <span className="mr-1 text-gray-500">Practice for</span>
      {livePrograms().map((p) => (
        <Link key={p.slug} to={`/${p.slug}`} className="rounded-full border border-gray-300 bg-white px-3 py-1 font-medium text-gray-900 hover:border-gray-500">
          {p.name}
        </Link>
      ))}
      {comingSoonPrograms().map((p) => (
        <Link key={p.slug} to={`/${p.slug}`} className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-gray-500 hover:border-gray-500">
          {p.name} · soon
        </Link>
      ))}
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    setReduce(mq.matches);
    const onChange = (e) => setReduce(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduce;
}

// Kamron answering a practice question (recorded without sound), beside example feedback:
// practice on camera, then watch yourself back. Plays on a silent loop unless the visitor
// prefers reduced motion; the button pauses it either way.
export function HeroClip() {
  const reduceMotion = usePrefersReducedMotion();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // React doesn't reliably set the attribute, and browsers only autoplay muted video
    if (reduceMotion) v.pause();
    else v.play().catch(() => {}); // blocked autoplay just leaves the still frame
  }, [reduceMotion]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div className="relative">
      {/* Kamron's own words: the real value is in watching yourself back */}
      <div className="pointer-events-none absolute -top-12 left-2 hidden rotate-[-4deg] items-end gap-1 lg:flex" aria-hidden="true">
        <span className="font-hand text-[26px] leading-none text-brand">the real value is in watching yourself back</span>
        <svg width="44" height="46" viewBox="0 0 44 46" fill="none" className="mb-[-30px] text-brand">
          <path d="M4 3c14 3 28 14 30 34m0 0-8-7m8 7 5-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <p className="text-sm font-semibold text-gray-900">Kamron, answering a practice question</p>
        </div>
        <div className="relative aspect-video bg-gray-900">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
            src="/media/kamron-answer.mp4"
            poster="/media/kamron-answer.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label="Kamron answering a practice interview question on camera"
          />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause video' : 'Play video'}
            className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-900/60 text-white backdrop-blur hover:bg-gray-900/80"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
          </button>
        </div>
        <div className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">What worked</p>
            <p className="mt-1 text-gray-700">Opening with a specific patient moment makes your motivation feel real.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">To consider</p>
            <p className="mt-1 text-gray-700">Close with one sentence on the kind of provider you want to become.</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-right text-xs text-gray-500">Example feedback</p>
    </div>
  );
}

const STEPS = [
  'Pick your program and questions',
  'Answer on camera, up to 3 minutes each',
  'Watch yourself back and read the feedback',
];

export function HowItWorksLine({ className }) {
  return (
    <ol className={cn('grid gap-6 border-t border-line pt-8 sm:grid-cols-3', className)} aria-label="How it works">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-medium text-brand">{i + 1}</span>
          <span className="text-gray-700">{s}</span>
        </li>
      ))}
    </ol>
  );
}

// A real student's words, with their first name and school (given with their permission)
export function QuoteCard({ quote, className }) {
  return (
    <figure className={className}>
      <span className="block font-display text-6xl leading-none text-brand/40" aria-hidden="true">“</span>
      <blockquote className="-mt-4 text-pretty font-display text-xl leading-snug text-gray-900">{quote.text}</blockquote>
      <figcaption className="mt-4 text-sm">
        <span className="font-semibold text-gray-900">{quote.name}</span>
        <span className="text-gray-500"> · {quote.school}</span>
      </figcaption>
    </figure>
  );
}

function ProgramBlock({ program, user }) {
  const { block, quotes = [], sampleQuestions = [] } = program.landing;
  const quote = quotes[0];
  const sample = sampleQuestions[sampleQuestions.length > 2 ? 2 : 0];
  return (
    <div className="grid gap-10 border-t border-line py-12 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">{block.overline}</p>
        <h3 className="mt-2 font-display text-[36px] font-medium leading-tight tracking-tight text-gray-900">{program.displayName}</h3>
        <p className="mt-3 text-lg text-gray-600">{block.tagline}</p>
        <ul className="mt-6 space-y-3">
          {block.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-gray-800">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to={user ? '/dashboard' : `/signup?program=${program.slug}`} className={buttonVariants({ size: 'lg' })}>
            {user ? 'Start practicing' : 'Start practicing free'} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={`/${program.slug}`} className={linkCls}>What to expect</Link>
        </div>
      </div>
      {quote ? (
        <QuoteCard quote={quote} className="self-center" />
      ) : sample && (
        <figure className="self-center rounded-xl border border-line bg-paper p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">You might be asked</p>
          <p className="mt-2 font-display text-xl leading-snug text-gray-900">“{sample}”</p>
        </figure>
      )}
    </div>
  );
}

// bootcamp.com-style: each live program as a full-width block, then the ones on the way
export function ProgramBlocks({ user }) {
  const soon = comingSoonPrograms();
  return (
    <div>
      {livePrograms().map((p) => <ProgramBlock key={p.slug} program={p} user={user} />)}
      {soon.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-8 text-sm">
          <span className="text-gray-600">Also on the way:</span>
          {soon.map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-3 py-1 text-gray-700 hover:border-gray-500">
              <ProgramIcon slug={p.slug} className="h-3.5 w-3.5 text-gray-500" />
              {p.displayName} · get notified
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudentQuotes({ quotes, title = 'What students say' }) {
  if (!quotes?.length) return null;
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading title={title} />
        <div className={cn('mt-10 grid gap-10', quotes.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
          {quotes.map((q) => <QuoteCard key={q.name} quote={q} />)}
        </div>
      </div>
    </section>
  );
}

// More of Kamron's story, in his own words, once he's written it (one string per paragraph).
// The About page shows all of it; the homepage keeps the short version and links there.
const FOUNDER_STORY = [];

// page: the About page's version (the heading is the page's h1, and the full story is included)
export function FounderLetter({ page = false }) {
  const Heading = page ? 'h1' : 'h2';
  return (
    <section id="founder" className={cn(!page && 'border-t border-line')}>
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-24 sm:px-6 md:grid-cols-[280px_1fr]">
        <figure className="mx-auto w-56 rotate-[-2deg] bg-white p-3 pb-2 shadow-lg md:mx-0 md:w-full">
          <img src="/images/kamron.jpg" alt="Kamron in UCSF School of Dentistry scrubs" loading="lazy" className="aspect-square w-full object-cover" />
          <figcaption className="pt-2 text-center font-hand text-[22px] text-gray-700">me, at UCSF School of Dentistry</figcaption>
        </figure>
        <div className="max-w-2xl">
          <HandNote>a note from me</HandNote>
          <Heading className="mt-3 text-balance text-[34px] font-medium leading-tight tracking-tight text-gray-900 sm:text-[40px]">
            I know how nerve-racking these interviews feel. I’ve sat in that chair.
          </Heading>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-gray-700">
            <p>
              Hi, I’m Kamron. I’m a student at UCSF School of Dentistry. When I applied, I interviewed at several
              competitive programs, and I know how intimidating it can be.
            </p>
            <p>
              I built InterviewPrep to be the tool I wish I’d had: practice that feels like the real thing, and a way
              to watch yourself back. That’s where the real improvement happens.
            </p>
            {page && FOUNDER_STORY.map((p) => <p key={p}>{p}</p>)}
          </div>
          {!page && FOUNDER_STORY.length > 0 && (
            <Link to="/about" className={cn(linkCls, 'mt-6 inline-block')}>Read the rest of my story</Link>
          )}
          <p className="mt-8 font-hand text-[44px] leading-none text-gray-900">Kamron</p>
          <p className="mt-1 text-sm text-gray-500">
            UCSF School of Dentistry ·{' '}
            <a href="mailto:kam.interviewprep@gmail.com" className="underline underline-offset-2 hover:text-gray-900">kam.interviewprep@gmail.com</a>
          </p>
        </div>
      </div>
    </section>
  );
}

// One line about Kamron, for programs where the full letter would be too much
export function FounderNote() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-10 sm:px-6">
        <img src="/images/kamron-320.jpg" alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white shadow" />
        <p className="text-gray-700">
          Built by Kamron, a UCSF dental student who’s been through health professions interviews.{' '}
          <Link to="/about" className={linkCls}>More about me</Link>
        </p>
      </div>
    </section>
  );
}

// A real current student who reviewed a program's question bank (see `landing.reviewer` in the configs)
export function ReviewerSection({ reviewer }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-10 sm:px-6">
        {reviewer.photo && (
          <img src={reviewer.photo} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white shadow" />
        )}
        <p className="text-gray-700">
          Questions reviewed by <span className="font-semibold text-gray-900">{reviewer.name}</span>, {reviewer.role}.
        </p>
      </div>
    </section>
  );
}

export function WhatToExpect({ landing }) {
  const { formats = [], sampleQuestions = [] } = landing;
  if (!formats.length && !sampleQuestions.length) return null;
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading title={`What to expect in your ${landing.audience} interview`} />
        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <dl className="space-y-8">
            {formats.map((f) => (
              <div key={f.title}>
                <dt className="font-display text-xl font-medium text-gray-900">{f.title}</dt>
                <dd className="mt-2 leading-relaxed text-gray-600">{f.body}</dd>
              </div>
            ))}
          </dl>
          {sampleQuestions.length > 0 && (
            <div className="self-start rounded-xl border border-line bg-paper p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Questions you might be asked</p>
              <ul className="mt-2 divide-y divide-line">
                {sampleQuestions.map((q) => <li key={q} className="py-3 text-gray-800">“{q}”</li>)}
              </ul>
              <p className="mt-2 text-sm text-gray-500">Practice these and more from the question bank.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function TipsSection({ title, tips }) {
  if (!tips?.length) return null;
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading title={title} />
        <ol className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {tips.map((t, i) => (
            <li key={t.title} className="border-t border-line pt-5">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl font-medium text-brand">{i + 1}</span>
                <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
              </div>
              <p className="mt-2 leading-relaxed text-gray-600">{t.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FaqSection({ items, title = 'Common questions' }) {
  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_2fr]">
        <SectionHeading title={title} />
        <dl className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="font-semibold text-gray-900">{item.q}</dt>
              <dd className="mt-1.5 leading-relaxed text-gray-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function CtaSection({ title, body, to, label }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-2xl bg-gray-900 px-8 py-14 text-center sm:px-14">
          <h2 className="text-balance text-[34px] font-medium leading-tight tracking-tight text-paper sm:text-[42px]">{title}</h2>
          {body && <p className="mx-auto mt-3 max-w-xl text-lg text-paper/75">{body}</p>}
          <Link to={to} className="mt-8 inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 font-semibold text-gray-900 hover:bg-white">
            {label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
