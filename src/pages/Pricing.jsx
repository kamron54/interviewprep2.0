import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FaqSection } from '../components/MarketingSections';
import { startCheckout } from '../lib/checkout';
import { useAccount } from '../lib/account';
import { PLANS, FREE_TRIAL_SESSIONS, formatPrice } from '../lib/pricing';
import { livePrograms } from '../professions/index.js';
import usePageTitle from '../lib/usePageTitle';

export default function Pricing() {
  usePageTitle('Pricing');
  const { user } = useAccount();
  const [redirecting, setRedirecting] = useState(null); // plan id being sent to checkout
  const liveNames = livePrograms().map((p) => p.name.toLowerCase()).join(' and ');

  // The 1 month plan is the anchor that makes 12 months look like the obvious choice
  const { month, year } = PLANS;
  const extra = year.amount - month.amount;

  const handleBuy = async (plan) => {
    setRedirecting(plan.id);
    try {
      await startCheckout(plan.id);
    } catch (err) {
      console.error('Checkout redirect failed:', err);
      toast.error("We couldn't open checkout. Please try again.");
      setRedirecting(null);
    }
  };

  const paidFeatures = [
    'Unlimited practice sessions',
    'Saved session history and score tracking',
    'Priority email support',
  ];

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
      name: month.name,
      price: formatPrice(month.amount),
      priceNote: 'one-time',
      desc: '30 days of full access, for an interview coming up soon.',
      features: [...paidFeatures, 'Access for 30 days'],
      plan: month,
    },
    {
      name: year.name,
      price: formatPrice(year.amount),
      priceNote: 'one-time',
      desc: 'Covers your whole application cycle.',
      features: [...paidFeatures, 'Access for 12 months'],
      plan: year,
      highlight: true,
      badge: 'Best value',
    },
  ];

  const faqs = [
    { q: 'Are these subscriptions?', a: `No. Both plans are one-time payments: ${formatPrice(month.amount)} for 1 month or ${formatPrice(year.amount)} for 12 months. Nothing renews automatically.` },
    { q: 'Which plan should I choose?', a: `If your interviews are spread over more than a few weeks, 12 months is the better deal. It’s only $${extra} more and covers your whole application cycle. 1 month works if you have a single interview coming up soon.` },
    { q: 'Can I add more time later?', a: 'Yes. Buying again adds time on top of any access you have left.' },
    { q: 'Do the plans cover every program?', a: `Yes. One account covers ${liveNames} school practice, and you can switch your program from your dashboard at any time.` },
    { q: 'What happens after my free trial?', a: 'Your account stays. To keep practicing and see your saved sessions, choose a plan.' },
    { q: 'Do you offer refunds?', a: 'If the product isn’t a fit, email us within 7 days of purchase and we’ll make it right.' },
    { q: 'Is my data private?', a: 'Your recordings aren’t stored. Audio is sent to our transcription provider only to create your transcript, and transcripts and feedback are saved only if you click “Save Session.” See our Privacy Policy for details.' },
  ];

  return (
    <div>
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Pricing</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">Simple, student-friendly pricing. Try it free, then pay once. No subscriptions.</p>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {tiers.map((t) => {
              const ctaClass = cn(buttonVariants({ variant: t.highlight ? 'default' : 'outline', size: 'lg' }), 'w-full');
              return (
                <div key={t.name} className={cn('relative flex flex-col rounded-2xl border bg-white p-6', t.highlight && 'ring-2 ring-gray-900')}>
                  {t.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                      {t.badge}
                    </span>
                  )}
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
                    {t.plan && user ? (
                      <button type="button" onClick={() => handleBuy(t.plan)} disabled={redirecting !== null} className={ctaClass}>
                        {redirecting === t.plan.id ? 'Opening checkout…' : `Get ${t.plan.name.toLowerCase()}`}
                      </button>
                    ) : (
                      <Link to={t.href || '/signup'} className={ctaClass}>{t.cta || 'Create account'}</Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Both plans are one-time payments. Nothing renews, and you won’t be charged again.
          </p>

          {/* Live coaching, separate from the practice plans */}
          <div className="mt-10 flex flex-col gap-4 rounded-2xl border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                1:1 Mock Interview <span className="ml-1 font-normal text-gray-500">· $75 per hour</span>
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-600">
                A live 60-minute mock interview with a current dental student, with detailed notes, an action plan, and follow-up Q&amp;A by email.
              </p>
            </div>
            <a
              href="mailto:kam.interviewprep@gmail.com?subject=Mock%20Interview%20Request"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'shrink-0')}
            >
              Request a session
            </a>
          </div>
        </div>
      </section>

      <FaqSection items={faqs} />
    </div>
  );
}
