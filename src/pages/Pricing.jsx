import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FaqSection } from '../components/MarketingSections';
import { startCheckout } from '../lib/checkout';
import { useAccount } from '../lib/account';
import { PREMIUM_PRICE, FREE_TRIAL_SESSIONS } from '../lib/pricing';
import { livePrograms } from '../professions/index.js';
import usePageTitle from '../lib/usePageTitle';

export default function Pricing() {
  usePageTitle('Pricing');
  const { user } = useAccount();
  const [redirecting, setRedirecting] = useState(false);
  const liveNames = livePrograms().map((p) => p.name.toLowerCase()).join(' and ');

  const handleUpgrade = async () => {
    setRedirecting(true);
    try {
      await startCheckout();
    } catch (err) {
      console.error('Checkout redirect failed:', err);
      toast.error("We couldn't open checkout. Please try again.");
      setRedirecting(false);
    }
  };

  const tiers = [
    {
      name: 'Free Trial',
      price: '$0',
      priceNote: '7 days',
      desc: 'Try the full experience before you commit.',
      features: [
        `${FREE_TRIAL_SESSIONS} full practice sessions`,
        'Video or audio recording',
        'Scoring and written feedback on every answer',
        'Custom interviews from the question bank',
      ],
      cta: user ? 'Start practicing' : 'Create free account',
      href: user ? '/dashboard' : '/signup',
    },
    {
      name: 'Premium',
      price: PREMIUM_PRICE,
      priceNote: 'one-time',
      desc: '12 months of access, enough for a full application cycle.',
      features: [
        'Everything in the free trial',
        'Unlimited practice sessions',
        'Saved session history and score tracking',
        'Priority email support',
      ],
      footnote: 'No subscription. You won’t be charged again.',
      cta: user ? (redirecting ? 'Opening checkout…' : 'Upgrade to Premium') : 'Create account',
      href: user ? null : '/signup',
      onClick: user ? handleUpgrade : null,
      highlight: true,
    },
    {
      name: '1:1 Mock Interview',
      price: '$75',
      priceNote: 'per hour',
      desc: 'A live mock interview with a current dental student.',
      features: [
        '60-minute live session',
        'Detailed notes and an action plan',
        'Follow-up Q&A by email',
      ],
      cta: 'Request a session',
      mailto: 'mailto:kam.interviewprep@gmail.com?subject=Mock%20Interview%20Request',
    },
  ];

  const faqs = [
    { q: 'Is Premium a subscription?', a: `No. It’s a one-time ${PREMIUM_PRICE} payment for 12 months of access. It doesn’t renew automatically.` },
    { q: 'Does Premium cover every program?', a: `Yes. One account covers ${liveNames} school practice, and you can switch your program from your dashboard at any time.` },
    { q: 'What happens after my free trial?', a: 'Your account stays. To keep practicing and see your saved sessions, upgrade to Premium.' },
    { q: 'Do you offer refunds?', a: 'If the product isn’t a fit, email us within 7 days of purchase and we’ll make it right.' },
    { q: 'Is my data private?', a: 'Your recordings aren’t stored. Audio is sent to our transcription provider only to create your transcript, and transcripts and feedback are saved only if you click “Save Session.” See our Privacy Policy for details.' },
  ];

  return (
    <div>
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Pricing</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">Simple, student-friendly pricing. Try it free, then pay once for the whole cycle.</p>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {tiers.map((t) => {
            const ctaClass = cn(buttonVariants({ variant: t.highlight ? 'default' : 'outline', size: 'lg' }), 'w-full');
            return (
              <div key={t.name} className={cn('flex flex-col rounded-2xl border bg-white p-6', t.highlight && 'ring-2 ring-gray-900')}>
                <h2 className="text-base font-semibold text-gray-900">{t.name}</h2>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight text-gray-900">{t.price}</span>
                  <span className="text-sm text-gray-500">{t.priceNote}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{t.desc}</p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-gray-700">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {t.onClick ? (
                    <button type="button" onClick={t.onClick} disabled={redirecting} className={ctaClass}>{t.cta}</button>
                  ) : t.mailto ? (
                    <a href={t.mailto} className={ctaClass}>{t.cta}</a>
                  ) : (
                    <Link to={t.href} className={ctaClass}>{t.cta}</Link>
                  )}
                  {t.footnote && <p className="mt-3 text-center text-xs text-gray-500">{t.footnote}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <FaqSection items={faqs} />
    </div>
  );
}
