import { Link } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import usePageTitle from '../lib/usePageTitle';

const GUIDES = [
  { title: 'Ethical frameworks cheat sheet', body: 'Apply consistent, patient-centered reasoning under pressure.', to: '/resources/ethics' },
  { title: 'STAR and SPIKES for communication', body: 'Structure answers clearly and deliver difficult messages with empathy.', to: '/resources/communication' },
  { title: 'Common pitfalls and how to avoid them', body: 'Avoid traps that derail otherwise strong interviews.', to: '/resources/pitfalls' },
];

const DOWNLOADS = [
  { title: 'Interview tips', href: '/resources/interview-tips.pdf' },
  { title: 'Interview day checklist', href: '/resources/checklist.pdf' },
  { title: 'Thank-you email samples', href: '/resources/thank-you.pdf' },
];

export default function Resources() {
  usePageTitle('Resources');

  return (
    <div>
      <PageHeader title="Resources" subtitle="Free guides and checklists for interview day." />

      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-medium text-gray-900">Guides</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {GUIDES.map((g) => (
                <li key={g.to}>
                  <Link to={g.to} className="group flex items-start justify-between gap-6 py-5">
                    <span>
                      <span className="block font-display text-xl font-medium text-gray-900 decoration-brand decoration-2 underline-offset-4 group-hover:underline">
                        {g.title}
                      </span>
                      <span className="mt-1 block text-gray-600">{g.body}</span>
                    </span>
                    <ArrowRight className="mt-1.5 h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-900" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-medium text-gray-900">Downloads</h2>
            <ul className="mt-4 space-y-2">
              {DOWNLOADS.map((d) => (
                <li key={d.href}>
                  <a href={d.href} download className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-gray-800 hover:border-gray-400">
                    <Download className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                    {d.title}
                    <span className="ml-auto text-xs text-gray-500">PDF</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-line bg-white p-5">
              <p className="font-hand text-[24px] leading-none text-brand">questions?</p>
              <p className="mt-2 text-gray-700">
                Email me at{' '}
                <a className="underline underline-offset-2 hover:text-gray-900" href="mailto:kam.interviewprep@gmail.com">kam.interviewprep@gmail.com</a>.
                I’m happy to help.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
