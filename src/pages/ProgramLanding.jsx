import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, MessageSquareQuote } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import SampleFeedbackCard from '../components/SampleFeedbackCard';
import ProgramIcon from '../components/ProgramIcon';
import WaitlistForm from '../components/WaitlistForm';
import {
  COMMON_FAQS, CtaSection, FaqSection, FeaturesSection, FounderSection, HowItWorksSection,
  ReviewerSection, SectionHeading, StatsRow, TipsGrid,
} from '../components/MarketingSections';
import { getProgram, livePrograms, PROGRAM_ALIASES } from '../professions/index.js';
import { useAccount } from '../lib/account';
import { rememberProgram } from '../lib/auth';
import { FREE_TRIAL_SESSIONS } from '../lib/pricing';
import usePageTitle from '../lib/usePageTitle';

// One page per program (/dental, /medical, /physical-therapy…), filled from src/professions/
export default function ProgramLanding() {
  const { program: slug = '' } = useParams();
  const program = getProgram(slug);
  usePageTitle(program ? `${program.displayName} Interview Prep` : undefined);

  // Signup and resources default to the last program page a visitor looked at
  useEffect(() => { rememberProgram(program?.slug); }, [program]);

  const alias = PROGRAM_ALIASES[slug.toLowerCase()];
  if (alias) return <Navigate to={`/${alias}`} replace />;
  if (!program) return <Navigate to="/" replace />;
  return program.status === 'live' ? <LiveProgram program={program} /> : <ComingSoonProgram program={program} />;
}

function ProgramPill({ program, suffix }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700">
      <ProgramIcon slug={program.slug} className="h-3.5 w-3.5 text-teal-600" />
      {program.displayName}{suffix}
    </span>
  );
}

function LiveProgram({ program }) {
  const { user } = useAccount();
  const { landing } = program;
  const startHref = user ? '/dashboard' : `/signup?program=${program.slug}`;
  // Founder-written tips (dental) sit under the founder story instead of in their own section
  const founderTips = landing.credibility === 'founder' && landing.tips?.length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(13,148,136,0.15),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <ProgramPill program={program} />
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                {landing.heroTitle}
              </h1>
              <p className="mt-4 text-lg text-gray-600">{landing.heroSubtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={startHref} className={buttonVariants({ size: 'lg' })}>
                  {user ? 'Start a practice session' : 'Create free account'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/pricing" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  See pricing
                </Link>
              </div>
              {!user && (
                <p className="mt-4 text-sm text-gray-500">{FREE_TRIAL_SESSIONS} free practice sessions · No credit card required</p>
              )}
            </div>
            <SampleFeedbackCard question={landing.sampleQuestion} />
          </div>
          <StatsRow />
        </div>
      </section>

      {/* What to expect */}
      {(landing.formats?.length > 0 || landing.sampleQuestions?.length > 0) && (
        <section className="border-t bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeading title={`What to expect in your ${landing.audience} interview`} />
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                {landing.formats?.map((f) => (
                  <div key={f.title} className="rounded-2xl border bg-white p-6">
                    <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{f.body}</p>
                  </div>
                ))}
              </div>
              {landing.sampleQuestions?.length > 0 && (
                <div className="rounded-2xl border bg-white p-6">
                  <h3 className="text-base font-semibold text-gray-900">Questions you might be asked</h3>
                  <ul className="mt-2 divide-y">
                    {landing.sampleQuestions.map((q) => (
                      <li key={q} className="flex gap-3 py-3 text-sm text-gray-700">
                        <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                        {q}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-gray-500">Practice these and more from the question bank.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tips: the founder's own (story + tips together), or a program's general tips */}
      {founderTips ? (
        <FounderSection>
          <h3 className="mt-16 text-center text-2xl font-semibold tracking-tight text-gray-900">{landing.tipsTitle}</h3>
          <TipsGrid tips={landing.tips} />
        </FounderSection>
      ) : landing.tips?.length > 0 && (
        <section className="border-t bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeading title={landing.tipsTitle} />
            <TipsGrid tips={landing.tips} />
          </div>
        </section>
      )}

      <FeaturesSection audience={landing.audience} />
      <HowItWorksSection />

      {!founderTips && (landing.reviewer
        ? <ReviewerSection reviewer={landing.reviewer} />
        : <FounderSection variant={landing.credibility === 'founder' ? 'full' : 'short'} />)}

      <FaqSection items={[...(landing.faqs || []), ...COMMON_FAQS]} />

      <CtaSection
        title="Ready to practice?"
        body="Build confidence with structured reps and clear guidance."
        to={startHref}
        label={user ? 'Start a session' : 'Create free account'}
      />
    </div>
  );
}

function ComingSoonProgram({ program }) {
  const live = livePrograms();

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(13,148,136,0.15),transparent)]" />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 md:py-28">
          <ProgramPill program={program} suffix=" · Coming soon" />
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            {program.landing.heroTitle}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{program.landing.heroSubtitle}</p>
          <div className="mx-auto mt-8 max-w-md text-left">
            <WaitlistForm program={program} />
          </div>
          <p className="mt-3 text-xs text-gray-500">We’ll email you once when it opens.</p>
        </div>
      </section>

      <section className="border-t bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <p className="text-gray-700">Applying to {live.map((p) => p.name.toLowerCase()).join(' or ')} school instead? Those are open now.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {live.map((p) => (
              <Link key={p.slug} to={`/${p.slug}`} className={buttonVariants({ variant: 'outline' })}>
                <ProgramIcon slug={p.slug} className="h-4 w-4 text-teal-600" />
                {p.displayName}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HowItWorksSection />
    </div>
  );
}
