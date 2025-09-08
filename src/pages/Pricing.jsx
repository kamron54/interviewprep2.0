import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { useProfession } from '../professions/ProfessionContext.jsx';

export default function Pricing() {
  const [user, setUser] = useState(null);
  useEffect(() => { const unsub = onAuthStateChanged(auth, setUser); return () => unsub(); }, []);
  const ctx = useProfession?.();
  const ctaHref = user ? (ctx?.slug ? `/${ctx.slug}/setup` : '/dental/setup') : '/signup';

  const tiers = [
    {
      name: 'Free Trial',
      price: '$0',
      desc: 'Perfect for getting started',
      features: [
        '2 Practice Interviews',
        'Video Recording',
        'Advanced Feedback',
      ],
      cta: user ? 'Start free practice' : 'Create free account',
      href: ctaHref,
      highlight: false,
    },
    {
      name: 'Premium',
      price: '$29/year',
      desc: 'Full access for serious preparation',
      features: [
        'Unlimited practice interviews',
        'Advanced feedback with tips',
        'Saved sessions & progress',
        'Priority email support',
      ],
      cta: user ? 'Upgrade to Premium' : 'Create account',
      href: ctaHref,
      highlight: true,
    },
    {
      name: '1:1 Mock',
      price: '$75/hour',
      desc: 'Live mock interview with feedback.',
      features: [
        '60‑minute live session',
        'Detailed notes & action plan',
        'Follow‑up Q&A by email',
      ],
      cta: 'Request a session',
      href: '/contact',
      highlight: false,
    },
  ];

  const faqs = [
    { q: 'Can I switch programs?', a: 'Yes. Use the program switcher in the header at any time.' },
    { q: 'Do you offer refunds?', a: 'If the product is not a fit, contact us within 7 days and we\'ll make it right.' },
    { q: 'Is my data private?', a: 'We only store what\'s necessary for your account and progress. See our Privacy page for details.' },
  ];

  return (
    <main>
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Pricing</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">Simple, student‑friendly pricing for a full application cycle.</p>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {tiers.map((t) => (
            <div key={t.name} className={`rounded-2xl border bg-white p-6 ${t.highlight ? 'ring-2 ring-gray-900' : ''}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                <div className="text-xl font-semibold text-gray-900">{t.price}</div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{t.desc}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {t.features.map((f) => <li key={f} className="flex items-start gap-2"><span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />{f}</li>)}
              </ul>
              <div className="mt-6">
                <Link to={t.href} className={`block w-full rounded-xl px-4 py-2.5 text-center text-sm font-medium ${t.highlight ? 'bg-gray-900 text-white hover:bg-gray-800' : 'border border-gray-300 text-gray-800 hover:bg-gray-100'}`}>{t.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-gray-900">FAQs</h2>
          <dl className="mt-6 grid gap-6 md:grid-cols-3">
            {faqs.map(item => (
              <div key={item.q} className="rounded-2xl border p-6">
                <dt className="text-sm font-semibold text-gray-900">{item.q}</dt>
                <dd className="mt-2 text-sm text-gray-600">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}