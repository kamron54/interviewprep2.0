import { CtaSection, FounderLetter, StudentQuotes } from '../components/MarketingSections';
import { livePrograms } from '../professions/index.js';
import { useAccount } from '../lib/account';
import { FREE_TRIAL_SESSIONS } from '../lib/pricing';
import usePageTitle from '../lib/usePageTitle';

// About: Kamron's letter (with his full story once he's written it) and what students say
export default function About() {
  usePageTitle('About');
  const { user } = useAccount();
  const quotes = livePrograms().flatMap((p) => p.landing.quotes || []);

  return (
    <div>
      <FounderLetter page />
      <StudentQuotes quotes={quotes} />
      <CtaSection
        title="Try it free"
        body={user ? 'Pick up where you left off.' : `Your first ${FREE_TRIAL_SESSIONS} practice sessions are free. No credit card needed.`}
        to={user ? '/dashboard' : '/signup'}
        label={user ? 'Go to your dashboard' : 'Start practicing free'}
      />
    </div>
  );
}
