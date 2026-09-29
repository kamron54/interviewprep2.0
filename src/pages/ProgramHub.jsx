import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SampleFeedbackCard from '../components/SampleFeedbackCard';
import ProgramIcon from '../components/ProgramIcon';
import { CtaSection, FeaturesSection, FounderSection, HowItWorksSection, SectionHeading, StatsRow } from '../components/MarketingSections';
import { comingSoonPrograms, livePrograms } from '../professions/index.js';
import { useAccount } from '../lib/account';
import { FREE_TRIAL_SESSIONS, PREMIUM_PRICE } from '../lib/pricing';
import usePageTitle from '../lib/usePageTitle';

// The homepage: a neutral front door that sends each student to their program's page
export default function ProgramHub() {
  usePageTitle();
  const { user } = useAccount();
  const live = livePrograms();
  const soon = comingSoonPrograms();
  const liveNames = live.map((p) => p.name.toLowerCase()).join(' and ');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(13,148,136,0.15),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                Practice the interview that gets you in.
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Mock interviews for {liveNames} school applicants, with instant feedback on every answer.
                More health professions programs are on the way.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {user ? (
                  <Link to="/dashboard" className={buttonVariants({ size: 'lg' })}>
                    Go to your dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <a href="#programs" className={buttonVariants({ size: 'lg' })}>
                    Choose your program <ArrowRight className="h-4 w-4" />
                  </a>
                )}
                <Link to="/pricing" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  See pricing
                </Link>
              </div>
              {!user && (
                <p className="mt-4 text-sm text-gray-500">{FREE_TRIAL_SESSIONS} free practice sessions · No credit card required</p>
              )}
            </div>
            <SampleFeedbackCard question="Why do you want to work in healthcare?" />
          </div>
          <StatsRow />
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="scroll-mt-16 border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            title="Choose your program"
            subtitle="Each program has its own question bank and interview prep."
          />
          <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
            {live.map((p) => (
              <Link
                key={p.slug}
                to={`/${p.slug}`}
                className="group rounded-2xl border bg-white p-6 transition hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
                    <ProgramIcon slug={p.slug} className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{p.displayName}</h3>
                </div>
                <p className="mt-3 text-sm text-gray-600">{p.cardBlurb}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-gray-900">
                  Get started <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          {soon.length > 0 && (
            <div className="mx-auto mt-6 grid max-w-5xl gap-4 sm:grid-cols-3">
              {soon.map((p) => (
                <Link
                  key={p.slug}
                  to={`/${p.slug}`}
                  className="rounded-2xl border border-dashed bg-white/60 p-5 transition hover:border-gray-400 hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-2">
                    <ProgramIcon slug={p.slug} className="h-5 w-5 text-gray-500" />
                    <Badge variant="secondary">Coming soon</Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-900">{p.displayName}</p>
                  <p className="mt-1 text-sm text-gray-600">Get notified when it opens →</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <FeaturesSection audience={`${liveNames} school`} />
      <HowItWorksSection />
      <FounderSection />
      <CtaSection
        title="Try it free"
        body={`Your first ${FREE_TRIAL_SESSIONS} practice sessions are free. After that, Premium is a one-time ${PREMIUM_PRICE} for 12 months, with no subscription.`}
        to="/pricing"
        label="See pricing"
      />
    </div>
  );
}
