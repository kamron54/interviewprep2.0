import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import ProgramIcon from '../components/ProgramIcon';
import WaitlistForm from '../components/WaitlistForm';
import {
  COMMON_FAQS, CtaSection, FaqSection, FounderLetter, FounderNote, HeroClip, HowItWorksLine,
  ReviewerSection, StatsRow, StudentQuotes, TipsSection, WhatToExpect,
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-800">
      <ProgramIcon slug={program.slug} className="h-4 w-4 text-brand" />
      {program.displayName}{suffix}
    </span>
  );
}

function LiveProgram({ program }) {
  const { user } = useAccount();
  const { landing } = program;
  const startHref = user ? '/dashboard' : `/signup?program=${program.slug}`;

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <ProgramPill program={program} />
            <h1 className="mt-5 text-balance text-[42px] font-medium leading-[1.05] tracking-tight text-gray-900 sm:text-[54px]">
              {landing.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
              {landing.heroSubtitle}{!user && ` Your first ${FREE_TRIAL_SESSIONS} sessions are free.`}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link to={startHref} className={buttonVariants({ size: 'lg' })}>
                {user ? 'Start a practice session' : 'Start practicing free'} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/pricing" className="font-semibold text-gray-900 underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">
                See pricing
              </Link>
            </div>
          </div>
          <HeroClip />
        </div>
        <HowItWorksLine className="mt-16" />
        <StatsRow />
      </section>

      <WhatToExpect landing={landing} />
      <StudentQuotes quotes={landing.quotes} />
      {landing.credibility === 'founder' ? <FounderLetter /> : landing.reviewer ? <ReviewerSection reviewer={landing.reviewer} /> : <FounderNote />}
      <TipsSection title={landing.tipsTitle} tips={landing.tips} />
      <FaqSection items={[...(landing.faqs || []), ...COMMON_FAQS]} />
      <CtaSection
        title="Ready to practice?"
        body={user ? 'Pick up where you left off.' : `Your first ${FREE_TRIAL_SESSIONS} sessions are free. No credit card needed.`}
        to={startHref}
        label={user ? 'Start a practice session' : 'Start practicing free'}
      />
    </div>
  );
}

function ComingSoonProgram({ program }) {
  const live = livePrograms();

  return (
    <div>
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 md:py-28">
        <ProgramPill program={program} suffix=" · coming soon" />
        <h1 className="mt-5 text-balance text-[40px] font-medium leading-[1.08] tracking-tight text-gray-900 sm:text-[50px]">
          {program.landing.heroTitle}
        </h1>
        <p className="mt-4 text-lg text-gray-600">{program.landing.heroSubtitle}</p>
        <div className="mx-auto mt-8 max-w-md text-left">
          <WaitlistForm program={program} />
        </div>
        <p className="mt-3 text-xs text-gray-500">We’ll email you once when it opens.</p>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
          <p className="text-gray-700">Applying to {live.map((p) => p.name.toLowerCase()).join(' or ')} school instead? Those are open now.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {live.map((p) => (
              <Link key={p.slug} to={`/${p.slug}`} className={buttonVariants({ variant: 'outline' })}>
                <ProgramIcon slug={p.slug} className="h-4 w-4 text-brand" />
                {p.displayName}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <HowItWorksLine />
        </div>
      </section>
    </div>
  );
}
