import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  COMMON_FAQS, CtaSection, FaqSection, FounderLetter, HandNote, HeroClip, HowItWorksLine,
  ProgramBlocks, ProgramPills, SectionHeading, StatsRow, StudentQuotes,
} from '../components/MarketingSections';
import { livePrograms } from '../professions/index.js';
import { useAccount } from '../lib/account';
import { FREE_TRIAL_SESSIONS, PLANS, formatPrice } from '../lib/pricing';
import usePageTitle from '../lib/usePageTitle';

// The homepage: Kamron answering on camera, the programs (bootcamp.com-style blocks), real student
// quotes, and his note
export default function ProgramHub() {
  usePageTitle();
  const { user } = useAccount();
  // Each program block shows that program's first quote; the rest get their own section
  const moreQuotes = livePrograms().flatMap((p) => (p.landing.quotes || []).slice(1));
  const start = user ? { to: '/dashboard', label: 'Go to your dashboard' } : { to: '/signup', label: 'Start practicing free' };

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <HandNote>built by a UCSF dental student</HandNote>
            <h1 className="mt-4 text-balance text-[44px] font-medium leading-[1.05] tracking-tight text-gray-900 sm:text-[58px]">
              Practice the interview. Then watch yourself back.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
              Answer dental and medical school interview questions on camera. Watch your recording, read the
              feedback, and try again.{!user && ` Your first ${FREE_TRIAL_SESSIONS} sessions are free.`}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link to={start.to} className={buttonVariants({ size: 'lg' })}>
                {start.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#programs" className="font-semibold text-gray-900 underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">
                Pick your program
              </a>
            </div>
            <ProgramPills className="mt-10" />
          </div>
          <HeroClip />
        </div>
        <HowItWorksLine className="mt-16" />
        <StatsRow />
      </section>

      <section id="programs" className="scroll-mt-16 border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading title="Pick your program" subtitle="Each one has its own questions, interview formats, and tips." />
          <div className="mt-10">
            <ProgramBlocks user={user} />
          </div>
        </div>
      </section>

      <StudentQuotes quotes={moreQuotes} />
      <FounderLetter />
      <FaqSection items={COMMON_FAQS} />
      <CtaSection
        title="Try it free"
        body={`Your first ${FREE_TRIAL_SESSIONS} practice sessions are free. After that, get 12 months of access for ${formatPrice(PLANS.year.amount)}, one-time, with no subscription.`}
        to={start.to}
        label={start.label}
      />
    </div>
  );
}
